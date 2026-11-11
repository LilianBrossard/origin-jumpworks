import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { MIN_DELAY_MS, USER_AGENT } from "./config";

const CACHE_DIR = path.resolve(".cache/http");

/** Si vrai, ignore le cache et refait toutes les requêtes. */
let refresh = false;
export function setRefresh(value: boolean) {
  refresh = value;
}

const lastCall = new Map<string, number>();

/** Attend pour respecter un délai minimal entre deux requêtes vers le même hôte. */
async function throttle(url: string) {
  const host = new URL(url).host;
  const wait = (lastCall.get(host) ?? 0) + MIN_DELAY_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCall.set(host, Date.now());
}

function cachePath(url: string, ext: string) {
  const hash = createHash("sha1").update(url).digest("hex");
  return path.join(CACHE_DIR, `${hash}${ext}`);
}

async function fetchWithRetry(url: string, attempts = 3): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    await throttle(url);
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (res.ok) return res;
      // 4xx (hors 429) : inutile de réessayer
      if (res.status !== 429 && res.status < 500) {
        throw new Error(`HTTP ${res.status} pour ${url}`);
      }
      lastError = new Error(`HTTP ${res.status} pour ${url}`);
    } catch (error) {
      lastError = error;
      if (
        error instanceof Error &&
        /HTTP 4\d\d/.test(error.message) &&
        !/429/.test(error.message)
      ) {
        throw error;
      }
    }
    await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
  }
  throw lastError;
}

/** Récupère du JSON, avec cache disque. */
export async function getJson<T = unknown>(url: string): Promise<T> {
  const file = cachePath(url, ".json");
  if (!refresh) {
    try {
      return JSON.parse(await readFile(file, "utf8")) as T;
    } catch {
      // pas en cache
    }
  }
  const res = await fetchWithRetry(url);
  const text = await res.text();
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(file, text);
  return JSON.parse(text) as T;
}

/** Récupère un fichier binaire (image), avec cache disque. Les images ne changent pas : pas de rafraîchissement. */
export async function getBuffer(url: string): Promise<Buffer> {
  const file = cachePath(url, ".bin");
  try {
    return await readFile(file);
  } catch {
    // pas en cache
  }
  const res = await fetchWithRetry(url);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(file, buf);
  return buf;
}

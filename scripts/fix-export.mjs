/**
 * Correctif post-build pour l'export statique de Next 16.4.
 *
 * Avec un segment dynamique ([locale]), Next écrit les données de préchargement
 * dans des sous-dossiers :   out/fr/design/__next.$d$locale/design/__PAGE__.txt
 * alors que le navigateur les demande « à plat » : out/fr/design/__next.$d$locale.design.__PAGE__.txt
 * Sans ce correctif, chaque préchargement de lien renvoie une 404.
 *
 * Le script copie chaque fichier imbriqué vers son nom à plat. Il est sans effet
 * si une future version de Next corrige le problème (plus rien à copier).
 */
import { copyFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("out");
let copied = 0;

/** Liste récursive des fichiers d'un dossier. */
async function files(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await files(full)));
    else out.push(full);
  }
  return out;
}

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith("__next.")) {
      for (const file of await files(full)) {
        const rel = path.relative(full, file).split(path.sep).join(".");
        const target = path.join(dir, `${entry.name}.${rel}`);
        const exists = await stat(target).catch(() => null);
        if (!exists) {
          await copyFile(file, target);
          copied++;
        }
      }
    } else if (entry.name !== "_next" && entry.name !== "ships") {
      await walk(full);
    }
  }
}

await walk(OUT);
console.log(`fix-export : ${copied} fichier(s) de préchargement copiés.`);

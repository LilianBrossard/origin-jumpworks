"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { ShipPicture } from "@/components/ui/ShipPicture";
import { cn } from "@/lib/cn";
import type { ImageAsset } from "@/lib/data/schema";

/** M6 · Lampe de showroom : un reflet doux suit le curseur sur la carrosserie. */
function lamp(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--lx", `${((e.clientX - r.left) / r.width) * 100}%`);
  el.style.setProperty("--ly", `${((e.clientY - r.top) / r.height) * 100}%`);
}

/**
 * Galerie d'un vaisseau : vignettes avec effet de lampe, et visionneuse plein écran
 * accessible (élément <dialog> natif : focus piégé, Échap pour fermer, flèches pour naviguer).
 */
export function Gallery({ images, name }: { images: ImageAsset[]; name: string }) {
  const t = useTranslations("ship");
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const total = images.length;

  const open = (i: number, button: HTMLButtonElement) => {
    opener.current = button;
    setIndex(i);
    dialog.current?.showModal();
  };
  const close = useCallback(() => dialog.current?.close(), []);
  const go = useCallback(
    (delta: number) => setIndex((i) => (i === null ? i : (i + delta + total) % total)),
    [total],
  );

  // Flèches du clavier dans la visionneuse ; le focus revient à la vignette à la fermeture.
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    const onClose = () => {
      setIndex(null);
      opener.current?.focus();
    };
    d.addEventListener("keydown", onKey);
    d.addEventListener("close", onClose);
    return () => {
      d.removeEventListener("keydown", onKey);
      d.removeEventListener("close", onClose);
    };
  }, [go]);

  const current = index === null ? null : images[index];

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {images.map((img, i) => (
          <li key={img.id} className={cn(i === 0 && "sm:col-span-2 sm:row-span-2")}>
            <button
              type="button"
              onClick={(e) => open(i, e.currentTarget)}
              onPointerMove={lamp}
              aria-label={t("galleryOpen", { n: i + 1, total })}
              className="group relative block h-full w-full overflow-hidden"
            >
              <ShipPicture
                image={img}
                alt=""
                sizes={
                  i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"
                }
                className="aspect-[16/10] h-full"
                imgClassName="transition-transform duration-(--duration-slow) ease-(--ease-out) group-hover:scale-[1.02]"
              />
              {/* Reflet de la lampe, visible au survol */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-(--duration-base) group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle 22rem at var(--lx, 50%) var(--ly, 50%), rgb(255 248 230 / 0.85), transparent 70%)",
                }}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 ring-1 ring-line ring-inset"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label={t("lightbox.label")}
        onClick={(e) => {
          // Clic sur le fond (hors image) : fermeture
          if (e.target === e.currentTarget) close();
        }}
        data-lenis-prevent=""
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-bg/95 p-0 text-ink backdrop:bg-bg/80 backdrop:backdrop-blur-sm"
      >
        {current && index !== null && (
          <div className="flex h-full flex-col">
            <div className="container-page flex h-16 shrink-0 items-center justify-between">
              <p className="font-mono text-xs tracking-[0.12em] text-ink-muted">
                {name} · {t("lightbox.counter", { n: index + 1, total })}
              </p>
              <button
                type="button"
                onClick={close}
                autoFocus
                className="min-h-11 px-2 text-xs font-medium tracking-wide-3 text-ink uppercase"
              >
                {t("lightbox.close")}
              </button>
            </div>
            <figure className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 pb-6">
              <ShipPicture
                key={current.id}
                image={current}
                sizes="100vw"
                priority
                className="max-h-full min-h-0 w-auto max-w-full bg-transparent"
                imgClassName="max-h-[calc(100dvh-10rem)] w-auto object-contain"
              />
              <figcaption className="max-w-3xl text-center text-sm text-ink-muted">
                {current.alt}
                <span className="block text-xs">
                  © {current.credit.author} · {current.credit.license}
                </span>
              </figcaption>
            </figure>
            <div className="pointer-events-none absolute inset-y-0 flex w-full items-center justify-between px-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={t("lightbox.prev")}
                className="pointer-events-auto flex h-14 w-14 items-center justify-center text-2xl font-extralight text-ink hover:text-accent"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label={t("lightbox.next")}
                className="pointer-events-auto flex h-14 w-14 items-center justify-center text-2xl font-extralight text-ink hover:text-accent"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

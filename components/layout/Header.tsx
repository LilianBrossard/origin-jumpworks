"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { IconMenu } from "@/components/ui/Icons";
import { Monogram } from "@/components/ui/Monogram";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { LanguageSwitch, MotionToggle, ThemeSwitch } from "./Preferences";

const NAV = [
  { href: "/fleet", key: "fleet" },
  { href: "/compare", key: "compare" },
  { href: "/credits", key: "credits" },
] as const;

/**
 * En-tête fixe : transparent en haut de page, voilé dès qu'on défile.
 * Il se retire en descendant et revient dès qu'on remonte (ou qu'il reçoit le focus).
 */
export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Défilement : fond voilé et retrait de l'en-tête.
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 8);
        if (Math.abs(y - last) > 6) {
          setHidden(y > last && y > 160);
          last = y;
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Échap ferme le menu mobile et rend le focus au bouton.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      onFocus={() => setHidden(false)}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[transform,background-color,border-color] duration-(--duration-base) ease-(--ease-out)",
        open
          ? "border-line bg-bg"
          : scrolled
            ? "border-line bg-bg/85 backdrop-blur-md supports-[not(backdrop-filter:blur(1px))]:bg-bg"
            : "border-transparent",
        hidden && !open && "-translate-y-full",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-current={pathname === "/" ? "page" : undefined}
          onClick={() => setOpen(false)}
        >
          <Monogram className="h-8 w-8 transition-transform duration-(--duration-slow) ease-(--ease-out) group-hover:rotate-90" />
          <span className="font-display text-sm font-light tracking-wide-2 whitespace-nowrap text-ink uppercase sm:tracking-wide-3">
            Origin Jumpworks
          </span>
        </Link>

        {/* Bureau */}
        <nav aria-label={t("label")} className="hidden lg:block">
          <ul className="flex items-center gap-10">
            {NAV.map(({ href, key }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={cn(
                    "link-line text-xs font-medium tracking-wide-3 uppercase",
                    isActive(href) ? "text-accent" : "text-ink",
                  )}
                >
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSwitch />
          <span aria-hidden className="h-4 w-px bg-line" />
          <ThemeSwitch />
          <MotionToggle />
        </div>

        {/* Mobile */}
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-11 items-center gap-3 px-1 text-xs font-medium tracking-wide-3 whitespace-nowrap text-ink uppercase lg:hidden"
        >
          <span>{open ? t("closeMenu") : t("menu")}</span>
          <IconMenu open={open} className="h-5 w-5" />
        </button>
      </div>

      <div
        id="menu-mobile"
        hidden={!open}
        data-lenis-prevent=""
        className="h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t border-line lg:hidden"
      >
        <nav aria-label={t("label")} className="container-page py-8">
          <ul className="space-y-1">
            {[{ href: "/", key: "home" } as const, ...NAV].map(({ href, key }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={
                    (href === "/" ? pathname === "/" : isActive(href)) ? "page" : undefined
                  }
                  onClick={() => setOpen(false)}
                  className="block py-3 font-display text-3xl font-extralight tracking-wide-2 text-ink uppercase aria-[current=page]:text-accent"
                >
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* Créés seulement à l'ouverture : moins de travail au chargement de la page */}
        {open && (
          <div className="container-page flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line py-6">
            <LanguageSwitch variant="full" />
            <ThemeSwitch />
            <MotionToggle variant="full" />
          </div>
        )}
      </div>
    </header>
  );
}

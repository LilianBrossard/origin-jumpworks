import { cn } from "@/lib/cn";

/**
 * Logo officiel « Made by the Community » du fan kit de CIG.
 * Règles du kit : ni recoloré, ni déformé, opacité ≥ 50 %. On affiche donc la version
 * noire sur le thème clair et la version blanche sur le thème sombre, telles quelles.
 */
export function CommunityLogo({ alt, className }: { alt: string; className?: string }) {
  const img = "h-full w-full object-contain";
  return (
    <span className={cn("block shrink-0", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- fichier statique déjà optimisé */}
      <img
        src="/brand/made-by-the-community-black.png"
        alt={alt}
        width={256}
        height={256}
        loading="lazy"
        className={cn(img, "dark:hidden")}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- fichier statique déjà optimisé */}
      <img
        src="/brand/made-by-the-community-white.png"
        alt={alt}
        width={256}
        height={256}
        loading="lazy"
        className={cn(img, "hidden dark:block")}
      />
    </span>
  );
}

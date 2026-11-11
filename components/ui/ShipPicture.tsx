import type { ImageAsset } from "@/lib/data/schema";
import { cn } from "@/lib/cn";

type ShipPictureProps = {
  image: ImageAsset;
  /** Attribut `sizes` : largeur affichée selon l'écran */
  sizes?: string;
  /** Image prioritaire (au-dessus de la ligne de flottaison) */
  priority?: boolean;
  /** Remplace le texte alternatif du wiki. Chaîne vide = image décorative. */
  alt?: string;
  className?: string;
  imgClassName?: string;
};

const srcSet = (list: ImageAsset["avif"]) => list.map((s) => `${s.src} ${s.width}w`).join(", ");

/**
 * Image de vaisseau optimisée : AVIF, puis WebP, avec un aperçu flou en fond
 * pendant le chargement. Les fichiers sont produits par `pnpm harvest`.
 */
export function ShipPicture({
  image,
  sizes = "100vw",
  priority = false,
  alt,
  className,
  imgClassName,
}: ShipPictureProps) {
  const fallback = image.webp[image.webp.length - 1] ?? image.webp[0];
  return (
    <picture
      className={cn("block overflow-hidden bg-cover bg-center", className)}
      style={{ backgroundImage: `url(${image.lqip})` }}
    >
      <source type="image/avif" srcSet={srcSet(image.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(image.webp)} sizes={sizes} />
      <img
        src={fallback?.src}
        alt={alt ?? image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={cn("h-full w-full object-cover", imgClassName)}
      />
    </picture>
  );
}

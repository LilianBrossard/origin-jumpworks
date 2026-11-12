import sharp from "sharp";

/**
 * Extrait la silhouette d'un vaisseau à partir de sa vue de profil (vaisseau clair
 * sur fond spatial sombre). Sert au comparateur d'échelle de l'accueil.
 *
 * 1. niveaux de gris + léger filtre médian : atténue le bruit (les étoiles, isolées, sont écartées à l'étape 3) ;
 * 2. seuil de luminosité : masque binaire ;
 * 3. composante connexe la plus grande : le vaisseau seul ;
 * 4. bouchage des trous (parties sombres de la coque) par remplissage depuis les bords ;
 * 5. recadrage au plus près : la largeur de l'image = la longueur du vaisseau ;
 * 6. lissage des contours.
 *
 * Renvoie un PNG blanc à transparence (opaque = vaisseau), à utiliser comme masque CSS
 * (`mask-image`) pour le teinter avec la couleur du thème.
 */
/** Étapes 1 à 4 : masque plein du vaisseau (1 = extérieur) sur l'image entière. */
async function computeMask(input: Buffer, threshold: number, medianSize: number) {
  const { data, info } = await sharp(input)
    .greyscale()
    .median(medianSize)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const n = w * h;

  // 2. Seuil
  const on = new Uint8Array(n);
  for (let i = 0; i < n; i++) on[i] = (data[i] ?? 0) > threshold ? 1 : 0;

  // 3. Plus grande composante connexe (4-voisinage)
  const label = new Int32Array(n).fill(-1);
  let best = -1;
  let bestSize = 0;
  let id = 0;
  const stack: number[] = [];
  for (let p = 0; p < n; p++) {
    if (!on[p] || label[p] !== -1) continue;
    label[p] = id;
    stack.push(p);
    let size = 0;
    const visit = (r: number) => {
      if (on[r] && label[r] === -1) {
        label[r] = id;
        stack.push(r);
      }
    };
    while (stack.length) {
      const q = stack.pop()!;
      size++;
      const x = q % w;
      const y = (q - x) / w;
      if (x > 0) visit(q - 1);
      if (x < w - 1) visit(q + 1);
      if (y > 0) visit(q - w);
      if (y < h - 1) visit(q + w);
    }
    if (size > bestSize) {
      bestSize = size;
      best = id;
    }
    id++;
  }
  if (best === -1) throw new Error("Aucune silhouette détectée");

  // 4. Remplissage des trous : tout ce qui n'est pas atteignable depuis le bord fait partie du vaisseau.
  const ship = new Uint8Array(n);
  for (let p = 0; p < n; p++) ship[p] = label[p] === best ? 1 : 0;
  const outside = new Uint8Array(n);
  const seed = (p: number) => {
    if (!ship[p] && !outside[p]) {
      outside[p] = 1;
      stack.push(p);
    }
  };
  for (let x = 0; x < w; x++) {
    seed(x);
    seed((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    seed(y * w);
    seed(y * w + w - 1);
  }
  while (stack.length) {
    const q = stack.pop()!;
    const x = q % w;
    const y = (q - x) / w;
    if (x > 0) seed(q - 1);
    if (x < w - 1) seed(q + 1);
    if (y > 0) seed(q - w);
    if (y < h - 1) seed(q + w);
  }

  return { outside, w, h, bestSize };
}

export async function extractSilhouette(input: Buffer, threshold = 40, medianSize = 3) {
  const { outside, w, h, bestSize } = await computeMask(input, threshold, medianSize);
  const n = w * h;

  // 5. Masque final et recadrage
  // Image à 2 canaux (gris + alpha) : blanc, opaque sur le vaisseau, transparent ailleurs.
  const alpha = Buffer.alloc(n * 2);
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let p = 0; p < n; p++) {
    if (outside[p]) continue;
    alpha[p * 2] = 255;
    alpha[p * 2 + 1] = 255;
    const x = p % w;
    const y = (p - x) / w;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  // 6. Lissage des contours : le halo lumineux des images crée de petites dents.
  //    Flou + seuil gomme les dents, puis un flou léger adoucit le bord (anticrénelage).
  const cropped = await sharp(alpha, { raw: { width: w, height: h, channels: 2 } })
    .extract({ left: minX, top: minY, width, height })
    .extractChannel(1)
    // Flou proportionnel à la taille de l'image source (≈ 10 px pour 3 840 px de large)
    .blur(Math.max(2, w / 380))
    .threshold(128)
    .blur(Math.max(0.6, w / 3000))
    .raw()
    .toBuffer();
  const smooth = Buffer.alloc(width * height * 2);
  for (let i = 0; i < width * height; i++) {
    smooth[i * 2] = 255;
    smooth[i * 2 + 1] = cropped[i] ?? 0;
  }
  const png = await sharp(smooth, { raw: { width, height, channels: 2 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  return { png, width, height, coverage: bestSize / n };
}

/**
 * Carte de profondeur approximative pour l'effet de relief (M4), sans modèle d'IA :
 * le vaisseau (masque adouci) est « proche », le fond spatial « loin ».
 * Renvoie un PNG en niveaux de gris à la largeur demandée (blanc = proche).
 */
export async function extractDepthMap(input: Buffer, width: number, threshold = 40) {
  const { outside, w, h } = await computeMask(input, threshold, 3);
  const n = w * h;
  const grey = Buffer.alloc(n);
  for (let p = 0; p < n; p++) grey[p] = outside[p] ? 30 : 255;
  return (
    sharp(grey, { raw: { width: w, height: h, channels: 1 } })
      .resize({ width })
      // Transition douce entre le vaisseau et le fond : pas de déchirure lors du décalage
      .blur(Math.max(4, width / 70))
      .png({ compressionLevel: 9 })
      .toBuffer()
  );
}

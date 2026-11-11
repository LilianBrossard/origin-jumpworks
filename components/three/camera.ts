/** Champ de vision vertical de la caméra (degrés) */
export const FOV = 35;

/** Distance caméra–plan z=0 pour qu'une unité 3D vaille exactement un pixel CSS. */
export const cameraDistance = (viewportHeight: number) =>
  viewportHeight / 2 / Math.tan((FOV * Math.PI) / 360);

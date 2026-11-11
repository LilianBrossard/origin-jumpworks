/** Mise en forme des valeurs affichées, selon la langue. */

export const formatNumber = (locale: string, value: number, options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat(locale, options).format(value);

export const formatAUEC = (locale: string, value: number) => `${formatNumber(locale, value)} aUEC`;

export const formatUSD = (locale: string, value: number) =>
  formatNumber(locale, value, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const formatDate = (locale: string, iso: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(iso));

/** « 8 » si l'équipage est fixe, « 1–3 » sinon. */
export const formatCrew = (crew: { min: number; max: number }) =>
  crew.min === crew.max ? String(crew.max) : `${crew.min}–${crew.max}`;

/** « 4.10.2-LIVE.12881860 » → « 4.10.2 » */
export const shortVersion = (version: string) => version.split("-")[0] ?? version;

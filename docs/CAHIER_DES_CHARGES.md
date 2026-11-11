# Origin Jumpworks — Cahier des charges

> Site vitrine non officiel, réalisé par un fan, consacré au constructeur **Origin Jumpworks** de l'univers _Star Citizen_.
> Projet de portfolio : montrer ce qu'un site moderne peut offrir en matière d'expérience, de mouvement et de finition.

- **Dépôt** : https://github.com/LilianBrossard/origin-jumpworks
- **Version du document** : 1.1 — 2026-11-11 (sources de données précisées à l'étape 2)
- **Statut** : validé, en attente du démarrage du code

---

## 1. Objectifs

| #   | Objectif                                                         | Comment on le mesure                                                          |
| --- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| O1  | Un site **très agréable** à visiter, à parcourir et à contempler | Mouvement fluide (60 fps sur une machine moyenne), aucune animation agressive |
| O2  | Marquer une **évolution** par rapport au premier site (Anvil)    | 3D liée au défilement, transitions entre pages, DA soignée                    |
| O3  | Une vitrine **portfolio** qui démontre des savoir-faire          | Code propre, typé, documenté. Accessibilité et performance mesurées           |
| O4  | Des **données fiables** sur la flotte jouable                    | Données issues du Star Citizen Wiki et d'UEX, avec date et patch affichés     |
| O5  | **Accessible et inclusif**                                       | WCAG 2.2 AA. Expérience complète sans animation et sans WebGL                 |

### Hors périmètre

- Vaisseaux à l'état de concept (non jouables)
- Comptes utilisateurs, panier, contenu dynamique côté serveur
- Prix mis à jour en temps réel
- Toute utilisation commerciale

---

## 2. Cadre légal et crédits

Le site doit afficher **clairement** qu'il est un projet de fan. Les règles viennent du [fan kit officiel](https://robertsspaceindustries.com/fankit) (accord du 19/11/2025 et guide de style).

- **Pied de page, sur toutes les pages (accueil compris)** :
  - le **logo « Made by the Community »** du fan kit : version noire sur le thème clair, blanche sur le thème sombre, jamais recoloré ni déformé, opacité ≥ 50 % ;
  - une phrase « site de fan non officiel » dans la langue de la page ;
  - la **mention légale exigée par l'accord (article 2g), en anglais et mot pour mot**, en 14 px (≥ 10 pt) : « This site is not endorsed by or affiliated with the Cloud Imperium or Roberts Space Industries group of companies. All game content and materials are copyright Cloud Imperium Rights LLC and Cloud Imperium Rights Ltd.. Star Citizen®, Squadron 42®, Roberts Space Industries®, and Cloud Imperium® are registered trademarks of Cloud Imperium Rights LLC. All rights reserved. »
- **Usage strictement non commercial** (accord, article 2i).
- **Déclarer l'URL du site à CIG** une fois en ligne (accord, article 2k) : courriel à legal_notices@cloudimperiumgames.com (étape 10).
- Une **page `/credits`**, accessible depuis le pied de page, qui liste :
  - les textes issus de [starcitizen.tools](https://starcitizen.tools), sous licence **CC BY-SA 4.0**, avec un lien vers chaque page source ;
  - les données de prix issues d'[UEX Corp](https://uexcorp.space), avec la date du relevé ;
  - les images : auteur et licence de chacune (vues studio en CC BY-SA, visuels officiels propriété de CIG) ;
  - les polices et bibliothèques open source utilisées ;
  - l'auteur du projet, avec un lien vers son [portfolio](https://lilian-brossard.vercel.app/) et le dépôt GitHub.
- Le logo officiel d'Origin n'est **pas reproduit** : on utilise un monogramme « O » réinterprété en traits fins. _(Le fan kit fournit pourtant les logos Origin officiels : option à rediscuter si besoin.)_
- Les textes repris ou adaptés du wiki restent sous **CC BY-SA 4.0**. Le code est publié sous licence MIT.

---

## 3. Données

### 3.1 Sources

| Donnée                                                                                          | Source                                                                                | Moyen d'accès                                                                                       |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Liste des vaisseaux d'Origin et statut (jouable ou concept)                                     | API du Star Citizen Wiki                                                              | `GET /api/v2/vehicles?filter[manufacturer]=ORIG`                                                    |
| Fiche technique (taille, équipage, cargo, vitesses, dimensions, masse, rôle, bouclier)          | API du Star Citizen Wiki                                                              | `GET /api/v2/vehicles/<slug>`                                                                       |
| Description officielle, prix de précommande, dates, brochure, bande-annonce                     | API du Star Citizen Wiki (champ `curated_data`, synchronisé depuis starcitizen.tools) | idem                                                                                                |
| Prix en jeu et lieux d'achat ou de location                                                     | Données **UEX Corp**, incluses dans l'API (champ `uex_prices`)                        | idem, **sans jeton**                                                                                |
| Images, auteurs et licences                                                                     | starcitizen.tools                                                                     | API MediaWiki : `action=parse&prop=images`, puis `action=query&prop=imageinfo` (avec `extmetadata`) |
| Histoire de la marque (fondation en 2747, Cologne → New Austin en 2913, PDG Jennifer Friskers…) | starcitizen.tools                                                                     | page `Origin_Jumpworks`, réécrite à la main en FR/EN dans `messages/*.json` (étape 5)               |

> L'API du Star Citizen Wiki appartient au même projet communautaire que starcitizen.tools. Elle réunit les données du jeu, les données éditoriales du wiki et les prix UEX : on n'a donc **pas besoin de jeton UEX**.

**Flotte retenue : les 17 vaisseaux jouables.** Sont exclus :

- les G12, G12a et G12r, encore en concept ;
- le 600i 2951 BIS et le 600i Executive Edition, des éditions spéciales sans données propres.

### 3.2 Script de collecte — `scripts/harvest/`

- Lancé **à la main uniquement** : `pnpm harvest`. Il ne tourne jamais pendant le build ni sur le site en ligne.
- Options :
  - `--ship=<slug>` : ne traiter qu'un vaisseau ;
  - `--skip-images` : actualiser seulement les caractéristiques et les prix, en gardant les images existantes ;
  - `--force-images` : réencoder toutes les images ;
  - `--cached` : réutiliser le cache HTTP (utile en développement) ;
  - `--dry-run` : n'écrire aucun fichier.
- Comportement :
  1. Il récupère la liste des vaisseaux d'Origin, garde les jouables et signale tout nouveau vaisseau absent de `config.ts`.
  2. Pour chacun, il lit la fiche et la normalise en JSON validé par **Zod** (`lib/data/schema.ts`). Le script s'arrête si un champ obligatoire manque.
  3. Il choisit les images :
     - la **vue isométrique** studio du wiki devient l'image principale (`hero`) ;
     - la **vue de profil bâbord** devient `side`, qui servira au comparateur d'échelle ;
     - la **galerie** reprend jusqu'à 8 images d'au moins 1280 px, dans l'ordre de la page, sans les vues WIP, les icônes ni les logos ;
     - les noms des coloris sont déduits des vues isométriques des variantes.
  4. Il convertit chaque image (avec `sharp`) en **AVIF et WebP**, à 960 et 1920 px de large, et génère un **aperçu flou** (LQIP). Il enregistre l'**auteur et la licence** de chaque image, qui alimenteront la page de crédits. Les cartes de profondeur (M4) seront ajoutées à l'étape 7.
  5. Il écrit les prix d'achat et de location en aUEC (avec le terminal, le lieu, la date et le patch), `data/locations.json` et `data/meta.json`.
- Les requêtes sont limitées (≤ 1 par seconde et par hôte), avec un _User-Agent_ générique, de nouvelles tentatives en cas d'erreur et un cache local (`.cache/`, ignoré par git).
- Une description française déjà rédigée (`description.fr`) est conservée d'une collecte à l'autre.

### 3.3 Arborescence des données

```
data/
  meta.json                # date du relevé, patch, sources
  locations.json           # lieux d'achat ou de location (système, planète, ville)
  ships/
    890-jump.json
    m50.json
    ...
public/ships/<slug>/
  hero-{960,1920}.{avif,webp}        # vue isométrique studio
  side-{960,1920}.{avif,webp}        # vue de profil
  silhouette.png                     # silhouette de profil (masque), pour le comparateur d'échelle
  gallery-NN-{960,1920}.{avif,webp}
  depth-hero.png                     # carte de profondeur (étape 7)
```

### 3.4 Modèle d'un vaisseau

Le schéma de référence est dans [`lib/data/schema.ts`](../lib/data/schema.ts). En résumé :

```ts
Ship {
  slug, name, range: 'personal'|'touring'|'racing'|'prestige'|'gravlev', order
  role, career?, size, sizeClass?
  crew: { min, max }; cargoSCU; dimensions: { length, beam, height }; massKg
  speed: { scm, max }; quantum?: { speedMs, rangeM }; shieldHp?; hullHp?
  description: { en, fr? }
  pledge: { msrpUSD?, originalUSD?, availability?, url? }
  ingame: { buy: Offer[]; rent: Offer[] }  // Offer = { terminal, locationId, priceAUEC, updatedAt, gameVersion }
  dates: { concept?, addedInVersion? }; paints: string[]
  links: { wiki, brochure?, trailer? }
  images: { hero, side?, gallery[] }       // chaque image : sources AVIF/WebP, LQIP, crédit (auteur, licence)
  source: { apiUrl, wikiPage, gameVersion, fetchedAt }
}
```

### 3.5 Traduction du contenu

- Les textes du wiki sont en anglais. La version française est **rédigée ou traduite une seule fois**, puis relue, et stockée dans `description.fr`.
- L'interface du site est entièrement traduite (fichiers `messages/fr.json` et `messages/en.json`).

---

## 4. Stack technique

| Domaine                    | Choix                                                                                                                | Pourquoi                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Framework                  | **Next.js (App Router) en export statique**                                                                          | Stack déjà maîtrisée. Pas de serveur : génération à l'avance de toutes les pages |
| Langage                    | **TypeScript strict**                                                                                                |                                                                                  |
| Gestionnaire de paquets    | **pnpm**                                                                                                             |                                                                                  |
| Styles                     | **Tailwind CSS v4** et des variables CSS (tokens)                                                                    | Tokens de DA partagés entre le CSS et la 3D                                      |
| 3D                         | **three.js + React Three Fiber + drei**                                                                              | Le fil d'or, le fond étoilé, les nuées                                           |
| Effets                     | shaders GLSL sur mesure, `@react-three/postprocessing` (léger)                                                       |                                                                                  |
| Animations liées au scroll | Lecture directe du défilement dans la boucle 3D ; **GSAP + ScrollTrigger** seulement si un besoin apparaît (étape 8) | Évite une dépendance tant qu'elle n'est pas utile                                |
| Défilement fluide          | **Lenis**                                                                                                            | Désactivé si l'utilisateur limite les animations                                 |
| Transitions de page        | **View Transitions API**, avec un repli simple                                                                       | Le saut quantique (M3)                                                           |
| Langues                    | **next-intl** (`/fr`, `/en`)                                                                                         | Langue détectée au premier accès, puis mémorisée                                 |
| Thème                      | **next-themes**                                                                                                      | Valeur par défaut = **celle du système**, sombre en repli                        |
| Validation                 | **Zod**                                                                                                              | Données et script de collecte                                                    |
| Qualité                    | ESLint, Prettier, `tsc --noEmit`                                                                                     |                                                                                  |
| Tests                      | Vitest (outils et schémas), Playwright (parcours clés), **axe-core** (accessibilité)                                 |                                                                                  |
| Performance                | Lighthouse CI                                                                                                        | Budgets définis en section 9                                                     |
| CI                         | GitHub Actions : lint, types, tests, build                                                                           |                                                                                  |
| Hébergement                | **Vercel** (ou Cloudflare Pages)                                                                                     |                                                                                  |

---

## 5. Direction artistique

### 5.1 Principe : « Le trait d'abord »

L'écriture d'Origin repose sur des **lignes très fines, sobres, élégantes**. Le site se lit comme le catalogue d'un constructeur de luxe : beaucoup de vide, peu d'éléments, chaque détail soigné. **Calme, lent, luxueux.** Pas de chiffres qui défilent, pas d'effet agressif.

### 5.2 Thèmes

| Token                        | Sombre — « Nuit sur New Austin » | Clair — « Galerie »                                        |
| ---------------------------- | -------------------------------- | ---------------------------------------------------------- |
| `--bg`                       | `#0A0D12` bleu nuit presque noir | `#F5F2EC` ivoire                                           |
| `--surface`                  | `#11161E`                        | `#FBF9F5`                                                  |
| `--ink` (texte)              | `#ECE7DD` blanc cassé            | `#14171C` encre                                            |
| `--ink-muted`                | `#9AA0A8`                        | `#5B6068`                                                  |
| `--line` (traits décoratifs) | `rgba(236,231,221,.18)`          | `rgba(20,23,28,.16)`                                       |
| `--accent` (champagne / or)  | `#C9B37E`                        | `#7A6535` (plus foncé pour garder le contraste AA : 5.0:1) |
| `--accent-glow`              | `#E6D3A3`                        | `#B49A5E`                                                  |

Valeurs de référence : [`styles/tokens.css`](../styles/tokens.css). **Tout texte doit atteindre un contraste ≥ 4.5:1** ; c'est vérifié par `tests/contrast.test.ts`. `--accent-glow` et `--line` sont réservés au décor.

- **Thème par défaut** : celui du système (`prefers-color-scheme`), sombre en repli. Le choix de l'utilisateur est mémorisé.

### 5.3 Typographie

- **Titres** : police sans empattement géométrique en très fine graisse (200 à 300), lettres espacées (`0.08em` à `0.2em`), souvent en capitales pour les sur-titres. Police retenue : **Outfit** (Jost et Inter Tight ont été comparées sur `/design`).
- **Texte courant** : la même famille ou une police humaniste, en graisse 400, 16 à 18 px, interlignage de 1.6.
- **Données techniques** : une police à chasse fixe fine (par exemple _JetBrains Mono_ 300) pour les codes de type `ORIG-890`.
- Polices hébergées sur le site (`next/font`), avec `font-display: swap` et seulement les caractères nécessaires.

### 5.4 Grammaire graphique

- Des filets de **1 px** et des traits SVG d'épaisseur constante, quel que soit le zoom.
- Des coins coupés à 45° sur les cadres et les boutons.
- Des annotations discrètes façon plan technique (code vaisseau, échelle). Elles sont **fixes**, jamais animées en chiffres.
- Un monogramme « O » réinterprété : un cercle fin et un trait horizontal.
- Une grille éditoriale de 12 colonnes, avec des marges généreuses.

### 5.5 Mouvement

- Amortis longs (`cubic-bezier(.22,1,.36,1)`), durées de 600 à 1200 ms.
- Apparitions par **fondu et léger glissement**, jamais par rebond.
- Une seule chose bouge fortement à la fois.

---

## 6. Mécaniques visuelles retenues

| #      | Mécanique                          | Description                                                                                                                                                                                                                                                                                                                             | Repli (animations réduites ou pas de WebGL)   |
| ------ | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| **M1** | **Le fil d'or**                    | Une ligne 3D unique, très fine et légèrement lumineuse, qui **descend avec le défilement** sur toute la page d'accueil. Elle se dessine progressivement, serpente entre les sections, entoure les titres et passe derrière les vaisseaux en jouant sur la profondeur. En bas de page, elle se referme en dessinant le monogramme « O ». | Un trait SVG fixe dans la marge, déjà dessiné |
| **M2** | **Les nuées de vaisseaux**         | De petites silhouettes de vaisseaux passent **rarement** au loin, en essaim, comme des oiseaux (toutes les 20 à 40 s). Parfois, un M50 seul traverse plus vite. **Bonus caché** : on peut cliquer sur un vaisseau de la nuée pour ouvrir sa fiche.                                                                                      | Désactivé                                     |
| **M3** | **Le saut quantique**              | En transition entre deux pages, les étoiles s'étirent en traînées, un léger flash champagne apparaît, puis tout se stabilise (~600 ms).                                                                                                                                                                                                 | Simple fondu enchaîné                         |
| **M4** | **Profondeur sur les photos**      | Les photos de vaisseaux (héros, vaisseau phare) prennent du relief grâce à une **carte de profondeur** et bougent très légèrement avec la souris ou le gyroscope.                                                                                                                                                                       | Image fixe                                    |
| **M5** | **Lever de soleil sur New Austin** | Le passage clair/sombre joue un **lever ou un coucher de soleil** sur une ligne d'horizon en traits fins, puis les couleurs s'enchaînent (~1 s).                                                                                                                                                                                        | Changement de thème immédiat                  |
| **M6** | **Lampe de showroom**              | Dans les galeries, le curseur projette un **reflet doux** sur la carrosserie, comme l'éclairage d'un hall d'exposition.                                                                                                                                                                                                                 | Désactivé                                     |
| —      | **Fond étoilé**                    | Un champ d'étoiles très discret, avec une parallaxe lente. Il sert de décor commun à M1 et M2.                                                                                                                                                                                                                                          | Fond dégradé fixe                             |

**Écartés** : passage du plan à la photo, cotes et compteurs animés.

### Notes de réalisation (étape 6)

- **Canvas unique** monté dans la mise en page, chargé après le contenu (`requestIdleCallback`) et dans un fichier séparé (≈ 250 Ko compressés) : il ne pèse pas sur le premier affichage.
- **Une unité 3D = un pixel CSS** : la caméra suit le défilement, ce qui permet au fil de passer exactement par les repères de la page (`data-thread` sur les filets numérotés, l'ouverture et le monogramme de fin).
- **Fil d'or** : sur grand écran, il ondule entre les filets, alternativement à gauche et à droite, et passe derrière le contenu ; **sur mobile**, il reste dans la marge gauche pour ne pas traverser les paragraphes. En bas de page, il redessine le monogramme (barre et cercle), qui est alors masqué en HTML.
- **Nuées** : formations en V de 5 à 8 silhouettes, ou un M50 seul et rapide, toutes les 20 à 40 s ; elles suivent la caméra (elles appartiennent au ciel, pas à la page). Le **bonus cliquable** est reporté à l'étape 8.
- **Défilement fluide** : Lenis, désactivé en animations réduites.

### Règles communes

- Un seul **canvas WebGL**, partagé et fixé en arrière-plan, au lieu d'un canvas par section.
- La 3D est chargée **après** le contenu, de façon différée, et **mise en pause** quand l'onglet est caché.
- La qualité s'adapte à l'appareil (densité de pixels, nombre de vaisseaux dans les nuées) selon ses performances.
- Le canvas est marqué `aria-hidden="true"`. Aucune information n'est portée **uniquement** par la 3D.

---

## 7. Structure et pages

### 7.1 Plan du site

```
/[locale]                     Accueil (longue page)
/[locale]/fleet               La flotte
/[locale]/fleet/[slug]        Fiche vaisseau
/[locale]/compare             Comparateur (2 à 3 vaisseaux)
/[locale]/credits             Crédits et mentions légales
/[locale]/404                 Page « Perdu dans le vide »
```

`locale` ∈ { `fr`, `en` }. La langue est détectée au premier accès, le choix est mémorisé, et les balises `hreflang` sont présentes. En export statique (pas de middleware), c'est la page `/` qui choisit la langue dans le navigateur : préférence mémorisée, sinon langue du navigateur, sinon français.

### 7.2 Accueil : la descente

1. **Ouverture**. La nuit. Le fil (M1) apparaît et trace le monogramme, puis un vaisseau phare se révèle avec de la profondeur (M4). Titre : _Origin Jumpworks_. Sous-titre court. Une invitation discrète à faire défiler.
2. **Manifeste**. « Ownership as a lifestyle » : 2 ou 3 phrases, beaucoup de vide.
3. **Histoire**. Une frise que le fil traverse : 2747 (fondation, moteurs à fusion), 2899 (premières gammes 200 et 300), 2913 (installation à New Austin, Terra).
4. **Les gammes**. Personnel, Touring, Course, Prestige, Glisseurs (X1). Une composition éditoriale par gamme, avec des liens vers les fiches.
5. **Vaisseau phare : 890 Jump**. Plein écran, profondeur (M4), quelques caractéristiques clés en texte **fixe**.
6. **Échelle**. Toutes les silhouettes alignées à la même échelle, du plus petit au 890 Jump. Défilement horizontal piloté par le scroll, ou glisser sur mobile.
7. **Où les acquérir**. Une carte stylisée de Stanton en traits fins, avec les concessions marquées. Au survol ou au focus, on voit les vaisseaux disponibles et leur prix en aUEC. Mention « Prix relevés le JJ/MM/AAAA, patch X.Y ».
8. **Pied de page**. Le fil se referme. Crédits bien visibles, sélecteurs de langue et de thème, lien vers le dépôt GitHub.

Les nuées (M2) peuvent apparaître sur toute la page, sauf pendant l'ouverture.

### 7.3 La flotte (`/fleet`)

- Une grille de cartes : photo, nom, rôle, taille.
- Filtres par gamme, rôle, taille et équipage, avec un tri. **L'état des filtres est conservé dans l'URL.**
- Navigation complète au clavier. Le nombre de résultats est annoncé aux lecteurs d'écran (`aria-live`).

### 7.4 Fiche vaisseau (`/fleet/[slug]`)

- Image principale avec profondeur (M4), nom et série.
- Description en FR ou EN.
- **Fiche technique** sous forme de tableau sémantique (dimensions, masse, équipage, cargo, vitesses).
- **Galerie** avec la lampe de showroom (M6) et une visionneuse plein écran accessible (focus piégé, touche Échap, flèches).
- **Acquisition** : prix de précommande (USD), lieux d'achat ou de location en jeu avec leurs prix, date et patch du relevé.
- Coloris disponibles.
- Navigation vers le vaisseau précédent ou suivant, et lien « Comparer ».
- Source wiki et crédits de la page.

### 7.5 Comparateur (`/compare?ships=a,b,c`)

- 2 ou 3 vaisseaux en colonnes. Silhouettes superposées à la même échelle. Caractéristiques alignées, avec la meilleure valeur légèrement mise en avant (sans animation de chiffres).

### 7.6 Éléments présents partout

- **En-tête** : monogramme, liens Flotte, Comparer, Crédits, sélecteurs de langue et de thème. Il se fait discret en descendant et réapparaît en remontant.
- Un lien d'évitement « Aller au contenu ».
- Une **option « Réduire les animations »** dans le site, en plus du réglage système.

---

## 8. Accessibilité (WCAG 2.2 AA)

- HTML sémantique, titres hiérarchisés, zones de page identifiées (landmarks).
- Contraste AA pour tout texte et toute icône utile. Les traits purement décoratifs en sont exemptés.
- Navigation clavier complète, focus visible (un anneau champagne de 2 px), pas de piège au clavier.
- `prefers-reduced-motion` et l'option interne désactivent Lenis, le fil animé, les nuées, la profondeur et la lampe. On garde des fondus simples.
- Aucun contenu porté uniquement par la 3D, la couleur ou le survol.
- Textes alternatifs pour toutes les images de contenu. Les images décoratives ont un `alt=""`.
- Attribut `lang` correct, y compris sur les passages dans l'autre langue.
- Zones cliquables d'au moins 24×24 px.
- Lisible jusqu'à 200 % de zoom et sur un écran de 320 px de large, sans défilement horizontal de la page.
- Tests automatisés avec axe-core sur chaque page, plus un test manuel au lecteur d'écran (NVDA) sur les parcours clés.

---

## 9. Performance et SEO

| Indicateur                                                            | Objectif                   |
| --------------------------------------------------------------------- | -------------------------- |
| LCP (affichage du contenu principal)                                  | < 2.5 s (4G, mobile moyen) |
| CLS (décalages de mise en page)                                       | < 0.05                     |
| INP (réactivité aux interactions)                                     | < 200 ms                   |
| JavaScript initial (hors 3D)                                          | < 150 Ko compressé         |
| Scores Lighthouse (Performance, Accessibilité, Bonnes pratiques, SEO) | ≥ 90 / 100 / 100 / 100     |

- 3D chargée de façon différée, images responsives en AVIF ou WebP avec aperçu flou, polices limitées aux caractères utiles.
- SEO : métadonnées par page et par langue, images Open Graph générées, `sitemap.xml`, `robots.txt`, données structurées (`Product` sans prix réel, `BreadcrumbList`).

---

## 10. Organisation du code (prévisionnelle)

```
origin-jumpworks/
  app/[locale]/...            pages
  components/
    ui/                       boutons, cadres, filets, sélecteurs
    sections/                 sections de l'accueil
    three/                    Scene, GoldenThread, Starfield, Flock, DepthImage, QuantumJump
  lib/                        data loaders, i18n, motion (préférences d'animation), utils
  data/                       JSON générés par le script (commités)
  messages/                   fr.json, en.json
  public/ships/...            images optimisées
  scripts/harvest/            collecte des données
  docs/                       cahier des charges, notes de conception
  tests/                      unit, e2e, a11y
```

---

## 11. Étapes de réalisation

Chaque étape se termine par une revue ensemble avant de passer à la suivante.

| #      | Étape                    | Livrables                                                                                           | Critère de fin                                                                    |
| ------ | ------------------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **0**  | Cadrage                  | Ce document, dépôt git initialisé                                                                   | Cahier des charges validé                                                         |
| **1**  | Socle du projet          | Next.js, TypeScript, Tailwind v4, ESLint, Prettier, pnpm, CI GitHub Actions                         | `pnpm build` passe en CI                                                          |
| **2**  | Collecte des données     | `scripts/harvest/`, schémas Zod, `data/*.json`, images optimisées, `meta.json`                      | Tous les vaisseaux jouables d'Origin collectés et validés                         |
| **3**  | Fondations de la DA      | Tokens clair et sombre, polices, grille, composants de base, thème système par défaut               | Page de démonstration des composants dans les deux thèmes, contrastes AA vérifiés |
| **4**  | Langues et navigation    | next-intl, en-tête, pied de page avec crédits, lien d'évitement, option « Réduire les animations »  | Bascule FR/EN et thème fonctionnelles, accessibles au clavier                     |
| **5**  | Accueil sans 3D          | Les 8 sections, contenu réel, apparitions simples                                                   | Page complète et lisible sans JavaScript lourd                                    |
| **6**  | Couche 3D                | Canvas partagé, fond étoilé, **M1 le fil d'or**, **M2 les nuées**                                   | 60 fps sur une machine moyenne, replis vérifiés                                   |
| **7**  | Pages flotte             | `/fleet`, `/fleet/[slug]`, `/compare`, galerie, **M4 profondeur**, **M6 lampe**                     | Toutes les fiches générées, visionneuse accessible                                |
| **8**  | Transitions et finitions | **M3 saut quantique**, **M5 lever de soleil**, page 404, bonus cachés                               | Transitions fluides, repli sans View Transitions                                  |
| **9**  | Qualité                  | Tests Vitest, Playwright et axe, audit Lighthouse, test au lecteur d'écran                          | Budgets de la section 9 atteints                                                  |
| **10** | Mise en ligne            | Déploiement, domaine éventuel, README de portfolio (captures, choix techniques), URL déclarée à CIG | Site public, lien ajouté au portfolio                                             |

### Évolutions futures (optionnelles)

À étudier **tout à la fin**, une fois l'étape 10 terminée (tests, vérifications et mise en ligne compris). Elles ne bloquent rien et peuvent être abandonnées.

| #      | Évolution                  | Idée                                                                                                                                                                                                       | Points à vérifier                                                                                                                                                                             |
| ------ | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **E1** | Modèle 3D du 600i Explorer | Exploiter la maquette officielle du fan kit (`02_HOLOVIEWERS/Origin 600i Explorer.ctm`) : vaisseau orientable en 3D sur sa fiche, ou en fil de fer dans la couche 3D (cohérent avec la DA en traits fins). | Format OpenCTM à convertir (glTF) ; poids et performances ; un seul vaisseau concerné ; règles du kit (pas de modification de l'élément fourni) ; repli sans WebGL et en animations réduites. |
| **E2** | Ambiance musicale          | Boucle officielle du fan kit (`01_AUDIO/Cuts/SC_ORIG_600iTrailer_Intro_Loop.mp3`) en fond sonore discret.                                                                                                  | **Coupée par défaut**, lancée uniquement par le visiteur ; bouton visible, accessible et mémorisé ; volume bas, fondu d'entrée ; poids du fichier ; crédit dans `/credits`.                   |

### Actualiser les données plus tard

1. `pnpm harvest` (ou `pnpm harvest --skip-images` pour les caractéristiques et les prix seulement)
2. Relire le diff des fichiers `data/`
3. Commiter, ce qui redéploie le site

---

## 12. Points ouverts (à trancher pendant les étapes concernées)

- ~~Choix final de la police de titre~~ : **Outfit** retenue à l'étape 3 (comparaison avec Jost et Inter Tight sur la page `/design`).
- ~~Vaisseau mis en avant dans l'ouverture~~ : **890 Jump**, retenu à l'étape 5.
- Génération des cartes de profondeur : automatique ou à la main pour les images clés (étape 7).
- Nom de domaine éventuel (étape 10).

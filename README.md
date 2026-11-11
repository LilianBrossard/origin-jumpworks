# Origin Jumpworks

Site vitrine **non officiel**, réalisé par un fan, consacré au constructeur Origin Jumpworks de l'univers _Star Citizen_. Projet de portfolio.

> This site is not endorsed by or affiliated with the Cloud Imperium or Roberts Space Industries group of companies. All game content and materials are copyright Cloud Imperium Rights LLC and Cloud Imperium Rights Ltd.. Star Citizen®, Squadron 42®, Roberts Space Industries®, and Cloud Imperium® are registered trademarks of Cloud Imperium Rights LLC. All rights reserved.

Le cahier des charges complet est dans [docs/CAHIER_DES_CHARGES.md](docs/CAHIER_DES_CHARGES.md).

Réalisé par [Lilian Brossard](https://lilian-brossard.vercel.app/).

## Stack

Next.js (App Router, export statique) · TypeScript strict · Tailwind CSS v4 · pnpm

## Démarrer

Prérequis : Node 22+ et pnpm 10.

```bash
pnpm install
pnpm dev          # serveur de développement sur http://localhost:3000
```

## Scripts

| Commande                       | Rôle                                        |
| ------------------------------ | ------------------------------------------- |
| `pnpm dev`                     | Serveur de développement                    |
| `pnpm build`                   | Génère le site statique dans `out/` (\*)    |
| `pnpm preview`                 | Sert le dossier `out/` en local             |
| `pnpm lint`                    | ESLint                                      |
| `pnpm typecheck`               | Vérification TypeScript                     |
| `pnpm format` / `format:check` | Prettier                                    |
| `pnpm check`                   | Lint, types et format en une seule commande |
| `pnpm harvest`                 | Collecte les données de la flotte (manuel)  |
| `pnpm test`                    | Tests (contrastes, traductions)             |

(\*) Le build est suivi de [`scripts/fix-export.mjs`](scripts/fix-export.mjs), qui corrige le nommage des fichiers de préchargement de Next 16.4 en export statique.

## Langues et préférences

- Pages sous `/fr/` et `/en/` ; la page `/` choisit la langue dans le navigateur (préférence mémorisée, sinon langue du navigateur).
- Traductions : [messages/fr.json](messages/fr.json) et [messages/en.json](messages/en.json). Un test vérifie que les deux fichiers ont les mêmes clés.
- Thème (système, clair, sombre) et « Réduire les animations » : mémorisés dans `localStorage` et appliqués avant l'affichage, sans flash.

## Données

Les données sont collectées **une fois**, à la main, puis commitées : le site en ligne ne fait aucun appel externe.

- `data/ships/*.json` : une fiche par vaisseau jouable (caractéristiques, prix, crédits des images)
- `data/locations.json` : lieux d'achat et de location en jeu
- `data/meta.json` : date du relevé, patch du jeu, sources
- `public/ships/<slug>/` : images optimisées (AVIF et WebP, 960 et 1920 px)

Sources : [API du Star Citizen Wiki](https://api.star-citizen.wiki) (caractéristiques et prix [UEX](https://uexcorp.space)), [starcitizen.tools](https://starcitizen.tools) (images et crédits). Aucun jeton n'est nécessaire.

### Actualiser

```bash
pnpm harvest                  # tout (les images déjà présentes ne sont pas réencodées)
pnpm harvest --skip-images    # caractéristiques et prix seulement
pnpm harvest --ship=890-jump  # un seul vaisseau
```

Autres options : `--force-images` (réencoder), `--cached` (réutiliser le cache HTTP de `.cache/`), `--dry-run`.

Ensuite : relire le diff de `data/`, puis commiter. Les réglages par vaisseau (gamme, ordre, exclusions d'images) sont dans [scripts/harvest/config.ts](scripts/harvest/config.ts). Un vaisseau devenu jouable est signalé par le script et doit y être ajouté.

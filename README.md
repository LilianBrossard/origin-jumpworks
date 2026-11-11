# Origin Jumpworks

Site vitrine **non officiel**, réalisé par un fan, consacré au constructeur Origin Jumpworks de l'univers _Star Citizen_. Projet de portfolio.

> Star Citizen®, Origin Jumpworks et les visuels associés sont la propriété de Cloud Imperium Rights LLC. Ce projet n'a aucun lien avec Cloud Imperium Games.

Le cahier des charges complet est dans [docs/CAHIER_DES_CHARGES.md](docs/CAHIER_DES_CHARGES.md).

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
| `pnpm build`                   | Génère le site statique dans `out/`         |
| `pnpm preview`                 | Sert le dossier `out/` en local             |
| `pnpm lint`                    | ESLint                                      |
| `pnpm typecheck`               | Vérification TypeScript                     |
| `pnpm format` / `format:check` | Prettier                                    |
| `pnpm check`                   | Lint, types et format en une seule commande |
| `pnpm harvest`                 | Collecte les données de la flotte (manuel)  |

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

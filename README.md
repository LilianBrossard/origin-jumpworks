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

## Variables d'environnement

Copier `.env.example` en `.env.local` et renseigner `UEX_API_TOKEN` (nécessaire uniquement pour le script de collecte des données).

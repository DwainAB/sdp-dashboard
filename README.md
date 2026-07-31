# SDP — Dashboard

Application de gestion interne **SDP** : dashboard desktop (Electron) avec interfaces web (React + Vite + Tailwind) et API Express + MySQL.

## Structure du projet

| Chemin | Rôle |
|---|---|
| `src/` | Frontend React (pages, composants, API clients, types) |
| `server/` | Backend Express + MySQL (routes, pool DB, emails) |
| `electron/` | Processus principal Electron + preload (bridge IPC) |
| `dist/` | Build Vite (frontend) — généré |
| `dist-electron/` | Build des scripts Electron — généré |
| `release/` | Installateurs et manifestes de mise à jour — généré |
| `.qodo/` | Répertoires stubs |

## Prérequis

- Node.js 18+
- MySQL (pour le backend)
- Compte Resend (emails) — optionnel en dev

## Démarrage

```sh
npm install
cp .env.example .env   # puis remplir les valeurs (voir section "Variables")
npm run dev            # frontend seul (port 5173)
npm run dev:electron   # frontend + Electron en parallèle
npm run server         # backend Express (port 3001, tsx watch)
```

### Variables d'environnement

Toutes les variables sont documentées dans [`.env.example`](.env.example). Points clés :

- **`VITE_*`** : exposées au frontend (mode user, API OCR)
- **`DB_*` / `PORT` / `RESEND_*`** : backend uniquement
- **`GH_TOKEN`** : réservée à la publication de releases (voir plus bas)
- `.env` est **gitignoré** — ne jamais commiter de secrets (DB creds, RESEND_API_KEY, GH_TOKEN)

## Commandes utiles

| Commande | Effet |
|---|---|
| `npm run build` | Compilation complète + installateur (tsc → vite → electron-builder) |
| `npm run bump:patch\|minor\|major` | Incrémente la version, crée un commit + tag git (`npm version`) |
| `npm run publish` | Build + upload de la release sur GitHub (`electron-builder --publish always`) |
| `npx electron-builder --win --x64` | Installateur Windows x64 uniquement |

## Mises à jour automatiques

L'application utilise **electron-updater** (via GitHub Releases) :

1. Au démarrage (puis toutes les heures), l'app interroge GitHub pour une nouvelle version
2. Si une version existe, elle télécharge en arrière-plan et affiche une bannière de progression
3. L'utilisateur clique « Redémarrer maintenant » (ou l'app s'installe à la fermeture)
4. Les manifestes `latest-mac.yml` / `latest.yml` sont générés automatiquement par electron-builder lors de la publication

### Publier une nouvelle version

```sh
export GH_TOKEN=<token>   # ou le mettre dans .env (gitignoré)
npm run bump:patch        # ex: 1.1.0 → 1.1.1 (crée le tag v1.1.1)
git push --follow-tags
npm run publish           # build + release GitHub
```

> Le token GitHub doit avoir le scope **`repo`** (releases privées incluses). Il n'est nécessaire que sur la machine qui publie, pas chez les utilisateurs.

## Backend et API

- Express sur le port `3001` (variable `PORT`), routes sous `/api` (`GET /api/projects`, etc.)
- MySQL via `mysql2/promise` (`server/db.ts`)
- L'API OCR externe est appelée via `src/api/ocrClient.ts` (`VITE_OCR_API_URL`)
- **Mode mock** : par défaut le frontend utilise `src/api/client.ts` (données de `src/data/mockData.ts`) — le backend est optionnel en dev

## Conventions

- **Langue** : tout l'UI et les messages sont en français
- **Thème** : clair par défaut (Tailwind `darkMode: 'class'` via `data-theme`)
- **Slug** : `marketplace` est mappé en interne sur `aglae`
- **Tests** : aucun framework de test configuré

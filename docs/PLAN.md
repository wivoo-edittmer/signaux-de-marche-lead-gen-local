# Plan Technique B2Bmax

## Application et Déploiement

- Construire le frontend avec Next.js 14+ (App Router), React et TypeScript.
- Déployer le frontend Next.js sur Vercel.
- Réutiliser l'API backend FastAPI existante et la déployer séparément sur Railway ou Render.
- Configurer `NEXT_PUBLIC_API_URL` dans Vercel pour relier le frontend à l'API; garder les clés secrètes dans l'environnement backend.
- Utiliser Supabase Cloud pour la base de données et les services associés.
- Exécuter les traitements longs ou planifiés dans le backend ou un worker externe, pas dans un processus persistant Vercel.

Voir [la spécification](../specs/001-b2bmax-chat-insee/spec.md), [le plan d'implémentation](../specs/001-b2bmax-chat-insee/plan.md) et [le quickstart](../specs/001-b2bmax-chat-insee/quickstart.md).

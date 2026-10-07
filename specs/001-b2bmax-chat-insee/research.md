# Recherche Technique - B2Bmax

**Feature**: B2Bmax - Agent Conversationnel de Prospection INSEE  
**Date**: 2026-10-07  
**Statut**: Recherche initiale complète

---

## Décisions Techniques

### 1. Stack Frontend: Next.js 14

**Décision**: Utiliser Next.js 14 avec React et TypeScript

**Rationale**:
- Next.js offre un excellent support pour les applications full-stack
- Le App Router permet une bonne organisation du code
- TypeScript améliore la maintenabilité et la détection d'erreurs
- Intégration native avec Vercel pour le déploiement
- Bonne communauté et écosystème de composants (shadcn/ui)
- Support du SSR pour l'SEO et le charment initial des données

**Alternatives considérées**:
- **React + Vite**: Plus léger, mais nécessite plus de configuration pour le routage et le SSR
- **SvelteKit**: Très bon, mais écosystème plus petit et moins de ressources
- **Remix**: Excellent pour le full-stack, mais courbe d'apprentissage plus raide

**Recommandation**: Next.js 14 est le choix optimal pour ce projet.

---

### 2. Stack Backend: FastAPI (Python)

**Décision**: Utiliser FastAPI pour l'API backend

**Rationale**:
- Déjà partiellement implémenté dans le projet existant (`insee-api/`)
- Excellente intégration avec Mistral AI (client Python officiel)
- Typage natif avec Pydantic (validation des données)
- Performance élevée (basé sur Starlette et Pydantic)
- Documentation Swagger/OpenAPI automatique
- Facile à déployer (Railway, Render, Fly.io)

**Alternatives considérées**:
- **Node.js + Express/NestJS**: Bonne option, mais moins intégrée avec Mistral
- **Django**: Plus lourd, mais très mature
- **Flask**: Plus simple, mais moins de features modernes

**Recommandation**: FastAPI est le choix optimal, surtout avec l'existant.

---

### 3. Base de Données: Supabase (PostgreSQL)

**Décision**: Utiliser Supabase comme solution de base de données

**Rationale**:
- Solution tout-en-un: PostgreSQL + Auth + Realtime + Storage
- Open-source avec hébergement managé gratuit
- Excellente intégration avec Next.js (via @supabase/ssr)
- API REST et GraphQL disponibles
- Websockets natifs pour les notifications en temps réel
- Support des Row-Level Security (RLS) pour la sécurité

**Alternatives considérées**:
- **Firebase**: Plus simple, mais moins flexible et coûts imprévisibles
- **PostgreSQL auto-hébergé**: Plus de contrôle, mais plus de maintenance
- **MongoDB**: Moins adapté pour les relations complexes

**Recommandation**: Supabase est la solution optimale pour ce projet.

---

### 4. IA/LLM: Mistral AI

**Décision**: Utiliser Mistral AI (mistral-small, mistral-medium) pour:
- La compréhension du langage naturel (NLP)
- La génération de synthèses
- La génération de messages de prospection

**Rationale**:
- Déjà utilisé dans le projet existant
- Excellente compréhension du français
- Modèles performants et coût raisonnable
- Client Python officiel bien documenté
- Accès à l'API via la plateforme Mistral

**Modèles recommandés**:
- **mistral-small**: Pour les tâches simples (classification, extraction)
- **mistral-medium**: Pour les tâches complexes (génération de synthèses, messages)
- **mistral-large**: Pour les tâches critiques (optionnel)

**Optimisation des coûts**:
- Utiliser `mistral-small` pour l'extraction d'entités (secteur, zone, période)
- Utiliser `mistral-medium` pour la génération de synthèses et messages
- Implémenter un cache agressif pour les requêtes similaires
- Utiliser des prompts optimisés et courts

**Fallback**: Si Mistral est indisponible, utiliser des réponses mockées (comme dans le PLAN.md existant)

---

### 5. Authentification: Supabase Auth

**Décision**: Utiliser Supabase Auth pour la gestion des utilisateurs

**Rationale**:
- Intégration native avec Supabase
- Support de plusieurs méthodes: email/mot de passe, OAuth (Google, GitHub, etc.)
- Gestion des sessions avec JWT
- Sécurité renforcée (RLS, politiques de sécurité)
- Facile à intégrer avec Next.js

**Alternatives considérées**:
- **Firebase Auth**: Bonne option, mais moins intégré avec Supabase
- **Auth0**: Solution professionnelle, mais coûts élevés
- **NextAuth.js**: Bonne option pour Next.js, mais nécessite plus de configuration

**Recommandation**: Supabase Auth est le choix optimal.

---

### 6. Notifications: Supabase Realtime + SendGrid

**Décision**: Utiliser une combinaison de:
- **Supabase Realtime** pour les notifications push dans l'application
- **SendGrid** pour les notifications email

**Rationale**:
- **Supabase Realtime**: Websockets natifs, intégration facile avec Supabase
- **SendGrid**: Service professionnel d'envoi d'emails, bonne délivrabilité

**Alternatives considérées**:
- **Mailgun**: Alternative à SendGrid
- **Postmark**: Alternative à SendGrid
- **AWS SNS**: Pour les notifications push, mais plus complexe

---

### 7. Tâches Asynchrones: Celery + Redis

**Décision**: Utiliser Celery avec Redis comme broker pour les tâches de fond

**Rationale**:
- Solution mature et largement adoptée
- Bonne intégration avec Python/FastAPI
- Support du retry et du scheduling
- Redis est léger et performant

**Tâches asynchrones nécessaires**:
1. Génération des rapports périodiques
2. Envoi des emails de prospection
3. Mise à jour des données INSEE (si polling nécessaire)
4. Notifications push

**Alternatives considérées**:
- **RQ (Redis Queue)**: Plus simple, mais moins de features
- **Dramatiq**: Alternative moderne à Celery
- **Background tasks FastAPI**: Pour des tâches simples, mais limité

---

### 8. Déploiement: Vercel + Railway

**Décision**:
- **Frontend (Next.js)**: Déployer sur Vercel
- **Backend (FastAPI)**: Déployer sur Railway ou Render
- **Base de données (Supabase)**: Utiliser Supabase Cloud

**Rationale**:
- **Vercel**: Optimisé pour Next.js, déploiement continu, très performant
- **Railway**: Excellente intégration avec Python, Postgres, Redis
- **Render**: Alternative à Railway, très simple à utiliser
- **Supabase**: Solution managée, pas besoin de déployer la base

**Alternatives considérées**:
- **Frontend**: Netlify, AWS Amplify
- **Backend**: Fly.io, AWS ECS, Google Cloud Run

---

## Intégration avec l'Existant

### Projet `insee-api/`

Le projet existant contient:
- Un PLAN.md détaillé pour une API FastAPI
- Un fichier `openapi-insee.yml` (spécification OpenAPI complète)
- Une structure de base pour les endpoints `/trends` et `/new_companies`

**Stratégie d'Intégration**:

1. **Réutiliser l'API existante** comme service backend principal
2. **Étendre l'API** avec de nouveaux endpoints pour B2Bmax:
   - `/chat` - Gestion des conversations
   - `/agents` - CRUD pour les agents de prospection
   - `/subscriptions` - CRUD pour les abonnements
   - `/notifications` - Gestion des notifications
   - `/profiles` - Gestion des profils utilisateurs

3. **Adapter l'API** pour:
   - Gérer l'authentification (JWT)
   - Isoler les données par utilisateur
   - Supporter les WebSockets pour le chat en temps réel

4. **Créer un frontend Next.js** qui consomme cette API

### Fichier `openapi-insee.yml`

Ce fichier contient déjà une spécification OpenAPI détaillée pour l'API INSEE. Il peut être utilisé comme:
- Documentation de référence pour l'API INSEE
- Base pour générer le client API (OpenAPI Generator)
- Contrat entre le backend et le frontend

**Action**: Intégrer ce fichier dans le projet B2Bmax et l'étendre avec les nouveaux endpoints.

---

## API INSEE: Recherche et Découverte

### Sources de Données

L'INSEE propose plusieurs sources pour les données de créations/radiations:

1. **API Sirius** (recommandé)
   - API REST officielle de l'INSEE
   - Accès aux données d'entreprises
   - Documentation: https://api.insee.fr/
   - Nécessite une clé API (gratuit pour usage non-commercial)

2. **Fichiers Open Data INSEE**
   - Fichiers CSV/JSON téléchargeables
   - Mise à jour mensuelle ou trimestrielle
   - Gratuit, pas besoin de clé API
   - Exemples:
     - Stock des entreprises: https://www.insee.fr/fr/statistiques/fichier/6031695/sd25-sd26-sd27-sd28_base_entreprises_2024.csv.zip
     - Créations d'entreprises: https://www.insee.fr/fr/statistiques/fichier/6031697/naissances_2024.csv.zip

3. **API Entreprises INSEE**
   - Alternative à Sirius
   - Plus orientée vers les données agrégées

### Stratégie Recommandée

**Approche Hybride**:

1. **Données historiques et agrégées**: Utiliser les fichiers Open Data
   - Télécharger périodiquement (quotidiennement ou hebdomadairement)
   - Stocker dans Supabase pour un accès rapide
   - Appliquer des transformations pour faciliter les requêtes

2. **Données en temps réel**: Utiliser l'API Sirius
   - Pour les dernières créations/radiations
   - Pour les requêtes spécifiques qui nécessitent des données fraîches
   - Avec cache pour limiter les appels API

3. **Cache**: Implémenter plusieurs niveaux de cache:
   - Cache Redis pour les requêtes fréquentes
   - Cache Supabase (matérialized views)
   - Cache local pour les données statiques

### Schéma de Données INSEE

D'après l'OpenAPI existant, les données INSEE incluent:
- **Entreprises**: SIREN, SIRET, nom, adresse, code NAF, date de création, etc.
- **Établissements**: SIRET, entreprise parente, adresse, activité, etc.
- **Secteurs**: Code NAF, libellé, description
- **Zones**: Code commune, département, région

---

## Modèle de Données Mistral

### Prompt Engineering

Pour obtenir les meilleurs résultats avec Mistral, nous devons optimiser les prompts:

**1. Extraction d'Entités (secteur, zone, période)**
```
Tu es un extracteur d'entités. Analyse la question suivante et extrais:
- secteur: le secteur ou code NAF
- zone: la zone géographique (région, département, commune)
- période: la période temporelle (ou "12 derniers mois" par défaut)

Question: "{question}"

Retourne UNIQUEMENT un JSON avec ces champs:
{
  "secteur": "...",
  "zone": "...", 
  "période": "..."
}
```

**2. Génération de Synthèse**
```
Tu es un analyste marché. Analyse ces données INSEE:
- Secteur: {secteur}
- Zone: {zone}
- Période: {période}
- Nombre total d'entreprises: {total}
- Créations: {creations}
- Radiations: {radiations}
- Variation nette: {net_change}
- Top 5 nouvelles entreprises: {top_companies}

Génère une synthèse de 3-4 phrases en français avec:
1. Une analyse de la tendance (marché en croissance/déclin/stable)
2. Un chiffre clé à retenir
3. Une opportunité ou un risque pour les acteurs locaux
4. Une recommandation actionnable
```

**3. Génération de Message de Prospection**
```
Tu es un rédacteur de messages de prospection. Crée un message court (3-4 phrases) 
pour contacter une entreprise dans le secteur {secteur}.

Contexte:
- Nom de l'entreprise: {nom}
- Secteur: {secteur}
- Zone: {zone}
- Date de création: {date_creation}
- Objectif: {objectif} (ex: prise de rendez-vous, envoi de documentation)

Ton: Professionnel mais chaleureux
Style: Direct et engageant
Longueur: 3-4 phrases maximum

Message:
```

### Optimisation des Coûts

**Stratégies**:
1. **Cache des réponses**: Stocker les synthèses générées pour les mêmes requêtes
2. **Modèles adaptés**: Utiliser `mistral-small` pour les tâches simples, `mistral-medium` pour les tâches complexes
3. **Batch processing**: Regrouper les requêtes similaires
4. **Fallbacks**: Utiliser des réponses mockées pour le développement

---

## Sécurité et Conformité

### RGPD

Les données traitées incluent:
- **Données publiques**: Données INSEE (entreprises, créations, radiations) - pas de problème RGPD
- **Données utilisateurs**: Informations des professionnels (email, nom, entreprise) - nécessite consentement
- **Données de prospection**: Contacts, messages, statuts - nécessite conformité

**Mesures RGPD**:
1. Consentement explicite des utilisateurs
2. Droit d'accès, de rectification, d'effacement
3. Minimisation des données (ne stocker que ce qui est nécessaire)
4. Chiffrement des données sensibles
5. Politique de rétention claire

### Sécurité des Données

**Mesures**:
1. **Authentification**: JWT avec expiration courte
2. **Autorisation**: RLS (Row-Level Security) dans Supabase
3. **Chiffrement**: HTTPS partout, chiffrement au repos pour les données sensibles
4. **Protection des API**: Rate limiting, CORS, validation des entrées
5. **Audit**: Logging des accès sensibles

---

## Environnement de Développement

### Prérequis

- Node.js 18+ (pour Next.js)
- Python 3.10+ (pour FastAPI)
- Docker (optionnel, pour Celery/Redis)
- Compte Supabase
- Clé API Mistral
- Clé API INSEE (optionnelle, pour les données réelles)
- Compte SendGrid (optionnel, pour les emails)

### Setup Recommandé

```bash
# Frontend
mkdir b2bmax-frontend
cd b2bmax-frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Backend
git clone <insee-api-repo> b2bmax-backend
cd b2bmax-backend
pip install -r requirements.txt

# Base de données
# Créer un projet Supabase: https://supabase.com/dashboard
# Récupérer l'URL et la clé anonyme

# Environnement
# Créer un fichier .env.local dans le frontend:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MISTRAL_API_KEY=your_mistral_key

# Créer un fichier .env dans le backend:
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key  
MISTRAL_API_KEY=your_mistral_key
INSEE_API_KEY=your_insee_key (optional)
SENDGRID_API_KEY=your_sendgrid_key (optional)
```

---

## Prochaines Étapes

1. [x] **Stack technique définie** - Décisions prises et documentées
2. [ ] **Créer le projet Supabase** - Configurer la base de données
3. [ ] **Implémenter le modèle de données** - Créer les tables et relations
4. [ ] **Configurer l'environnement** - Variables d'environnement, clés API
5. [ ] **Créer les artefacts de Phase 1** - data-model.md, contracts/, quickstart.md
6. [ ] **Démarrer l'implémentation MVP 1** - Chat basique + synthèse INSEE

---

## Ressources Utiles

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation FastAPI](https://fastapi.tiangolo.com/)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Mistral AI](https://docs.mistral.ai/)
- [API INSEE Sirius](https://api.insee.fr/)
- [Open Data INSEE](https://www.insee.fr/fr/information/2560452)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Celery Documentation](https://docs.celeryq.dev/)

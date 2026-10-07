# Plan d'Implémentation - B2Bmax

**Feature**: B2Bmax - Agent Conversationnel de Prospection INSEE  
**Spec**: [spec.md](./spec.md)  
**Date**: 2026-10-07  
**Statut**: En cours de planification

---

## Contexte Technique

### Stack Technique Proposée

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| **Frontend** | Next.js 14 + React + TypeScript | Framework moderne, SSR pour SEO, bonne intégration avec Mistral, communauté active |
| **Backend API** | FastAPI (Python) | Performance, typage avec Pydantic, intégration facile avec Mistral AI, documentation Swagger automatique |
| **Base de Données** | Supabase (PostgreSQL) | Solution open-source, intégration native avec Auth, Realtime, Storage, compatible avec Mistral |
| **IA/LLM** | Mistral AI (mistral-small, mistral-medium) | Déjà utilisé dans le projet, excellente compréhension du français, coût raisonnable |
| **Authentification** | Supabase Auth | Intégration native, support OAuth, JWT, gestion des sessions |
| **Notifications** | Supabase Realtime + Email (SendGrid) | Realtime pour notifications push, SendGrid pour emails transactionnels |
| **Tasks Async** | Celery + Redis | Gestion des tâches de fond (envoi emails, génération rapports, prospection) |
| **Stockage Fichiers** | Supabase Storage | Pour stocker les rapports PDF et autres documents |
| **Déploiement** | Vercel (Frontend) + Railway/Render (Backend) | Vercel pour Next.js, Railway pour FastAPI + Supabase |

### Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                        B2Bmax Application                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │   Frontend   │◄───►  Backend API     │◄───►  Mistral AI     │  │
│  │   (Next.js)  │    │   (FastAPI)      │    │                 │  │
│  └─────────────┘    └─────────────────┘    └─────────────────┘  │
│           ▲                  ▲                    ▲                │
│           │                  │                    │                │
│  ┌────────┴────────┐ ┌──────┴──────┐    ┌──────┴──────┐          │
│  │ Supabase Auth    │ │  Supabase DB  │    │   INSEE API  │          │
│  │ (Utilisateurs)   │ │ (Données app) │    │ (Données co) │          │
│  └─────────────────┘ └──────┬──────┘    └──────────────┘          │
│                              │                                  │
│              ┌───────────────┴───────────────┐                   │
│              │       Supabase Services        │                   │
│              │  ┌──────────┐  ┌────────────┐ │                   │
│              │  │ Storage  │  │   Realtime  │ │                   │
│              │  │ (Rapports)│  │ (Notifs)   │ │                   │
│              │  └──────────┘  └────────────┘ │                   │
│              └───────────────────────────────┘                   │
│                                                        ┌─────────────┐│
│                                                        │  Celery/    ││
│                                                        │  Redis      ││
│                                                        │ (Tasks)     ││
│                                                        └─────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Intégration avec l'Existant

Le projet `insee-api/` existant contient déjà:
- Un PLAN.md pour une API FastAPI basique
- Un fichier `openapi-insee.yml` (spécification OpenAPI)
- Une structure de base pour interroger les données INSEE

**Stratégie**: 
1. **Réutiliser** l'API existante comme service backend pour B2Bmax
2. **Étendre** l'API avec les nouvelles fonctionnalités (chat, agents de prospection)
3. **Ajouter** un frontend Next.js pour l'interface conversationnelle
4. **Intégrer** Supabase pour la persistance et l'authentification

---

## Vérification Constitution

*À compléter après lecture de la constitution du projet*

---

## Phases d'Implémentation

### ⚠️ CONTRAINTES IMPORTANTES

**Le MVP1 doit utiliser UNIQUEMENT les données locales** présentes dans :
- **Dossier**: `/Users/mathurinbody/Documents/workspaces/wivooxmistral/data/`
- **Fichiers**: 
  - `StockUniteLegale_extract_10000.csv` - Unités légales (entreprises, **10K lignes, 1.3MB**)
  - `StockEtablissement_extract_10000.csv` - Établissements (sites physiques, **10K lignes, 1.9MB**)
  - `sectors.json` - Secteurs NAF de référence
  - `zones.json` - Zones géographiques de référence
  
  > **✅ Décision MVP1**: Utilisation des fichiers **extract_10000.csv** au lieu des fichiers complets (14.3GB) pour un chargement rapide et une compatibilité avec le Free Tier Supabase.

**Pas d'appel à l'API INSEE** pour le MVP1. L'intégration avec l'API INSEE sera ajoutée dans les phases ultérieures (MVP2+).

**Approche MVP1**:
1. Utiliser le script `data_loader.py` pour charger les CSV locaux
2. Créer une API FastAPI qui interroge ces données locales
3. Utiliser Mistral uniquement pour le NLP (compréhension de la requête, génération de synthèses)
4. Les statistiques de créations/radiations sont calculées à partir des dates de création dans les CSV

---

### Phase 0: Recherche et Décisions Techniques

**Objectif**: Résoudre les incertitudes techniques et prendre des décisions éclairées.

**Livrables**:
- [x] Stack technique définie (voir ci-dessus)
- [x] Données locales créées (`sectors.json`, `zones.json`, `mock_insee.json`)
- [ ] `research.md` avec toutes les décisions
- [ ] Validation des dépendances (Mistral, Supabase)

**Tâches**:
1. **Préparation des données locales** ✅ COMPLET
   - [x] Créer `sectors.json` avec les secteurs NAF nécessaires
   - [x] Créer `zones.json` avec les zones géographiques
   - [x] Créer `mock_insee.json` avec les cas d'usage (banque, éditeur, PME Bretagne)
   - [x] Valider la structure des données

2. **Recherche Mistral AI**
   - Tester les modèles pour la compréhension du français
   - Évaluer les coûts pour un usage intensif
   - Définir les prompts pour extraction d'entités et génération de synthèses

2. **Recherche Mistral AI**
   - Tester les modèles pour la compréhension du français
   - Évaluer les coûts pour un usage intensif
   - Déterminer la meilleure stratégie de prompting
   - Proposer une approche de fallback (mock)

3. **Recherche Supabase**
   - Configurer un projet Supabase pour le développement
   - Définir le schéma de base de données
   - Configurer l'authentification
   - Tester les fonctionnalités Realtime et Storage

4. **Recherche Next.js**
   - Définir la structure du frontend
   - Choisir les composants UI (shadcn/ui, Material-UI, etc.)
   - Proposer une approche pour le chat en temps réel

5. **Recherche Celery/Redis**
   - Configurer l'environnement pour les tâches asynchrones
   - Définir les tâches nécessaires (envoi emails, génération rapports)

---

### Phase 1: Design et Contrats

**Objectif**: Définir le modèle de données, les contrats d'interface et les scénarios de validation.

**Livrables**:
- [x] `data-model.md` - Modèle de données complet (v2.0 pour MVP1)
- [x] `/contracts/` - Contrats d'interface (API, Chat)
- [x] `quickstart.md` - Guide de validation rapide
- [x] **MVP1 spécifique**: `sql/schema_mvp1.sql` - Schéma SQL adapté aux extract_10000.csv
- [x] **MVP1 spécifique**: `scripts/data_loader.py` - Script de chargement des données
- [x] **MVP1 spécifique**: `scripts/README.md` - Instructions détaillées
- [x] **MVP1 spécifique**: `sectors.json`, `zones.json` - Données de référence
- [x] **MVP1 spécifique**: `tasks.md` - Suivi des tâches MVP1

### ⚡ État Actuel du MVP1

**📊 Progression: 60% terminés**

| Composant | Statut | Fichiers |
|-----------|--------|----------|
| Modèle de données | ✅ COMPLET | `data-model.md` (v2.0) |
| Schéma SQL | ✅ COMPLET | `insee-api/sql/schema_mvp1.sql` |
| Script de chargement | ✅ COMPLET | `insee-api/scripts/data_loader.py` |
| Configuration | ⏳ EN ATTENTE | `.env`, `requirements.txt` |
| Données Supabase | ❌ À FAIRE | Exécuter le script |
| Backend FastAPI | ⏳ EN COURS | `insee-api/main.py` (existant) |
| Frontend Next.js | ❌ À FAIRE | Optionnel pour validation |

**🎯 Prochaine étape immédiate**:
1. **Configurer Supabase** (5 min)
2. **Exécuter le schéma SQL** (2 min)
3. **Charger les données** avec `python scripts/data_loader.py` (30 sec)
4. **Tester le backend existant** avec les nouvelles données

---

### Phase 2: Implémentation (MVPs Incrémentaux)

#### MVP 1: Chat Basique + Synthèse INSEE (2-3 jours) - **DONNÉES LOCALES UNIQUEMENT**

**Objectif**: Permettre à l'utilisateur de poser des questions et recevoir des synthèses **en utilisant uniquement les données locales**.

**Fonctionnalités**:
- Interface de chat basique (Next.js)
- Compréhension des requêtes en langage naturel (Mistral ou mock)
- **Intégration avec les données locales** depuis `/data/StockUniteLegale_utf8.csv` et `/data/StockEtablissement_utf8.csv`
- Génération de synthèses avec chiffres clés **calculés à partir des données locales**
- Affichage des résultats dans le chat

**Implémentation Backend**:
- **Fichier**: `insee-api/main.py` (déjà créé)
- **Module**: `insee-api/data/data_loader.py` (déjà créé)
- **Données**: Utilise `sectors.json`, `zones.json`, et les CSV INSEE locaux
- **Endpoints**: 
  - `POST /v1/chat/messages` - Chat avec extraction d'entités et génération de synthèses
  - `POST /v1/searches` - Recherche d'entreprises
  - `GET /v1/sectors` - Liste des secteurs
  - `GET /v1/zones` - Liste des zones

**Tâches**:
1. ✅ **Backend existant**: `insee-api/main.py` avec endpoints de base
2. ✅ **Data Loader**: `insee-api/data/data_loader.py` pour charger les CSV
3. ✅ **Données de référence**: `sectors.json` et `zones.json` créés
4. ⏳ Créer le frontend Next.js avec page de chat
5. ⏳ Connecter le frontend au backend
6. ⏳ Tester l'extraction d'entités et la génération de synthèses
7. ⏳ Valider avec les cas d'usage du README.md

**Critères d'Acceptation**:
- [ ] L'utilisateur peut poser une question en français (ex: "Quelles sont les PME en Bretagne dans le secteur du numérique ?")
- [ ] Le système extrait correctement secteur, zone, période depuis la requête
- [ ] Une synthèse avec chiffres clés est générée à partir des données locales
- [ ] Les chiffres affichés correspondent aux données des CSV
- [ ] L'interface est responsive (mobile/desktop)
- [ ] Le backend retourne des données en moins de 5 secondes

---

#### MVP 2: Actions Suivantes + Agents de Prospection (3-4 jours)

**Objectif**: Permettre à l'utilisateur de créer des agents de prospection et de s'abonner aux rapports.

**Fonctionnalités**:
- Proposition des 3 actions suivantes après chaque synthèse
- Interface de création d'agent de prospection
- Configuration des paramètres de l'agent (cible, message, canal, fréquence)
- Sauvegarde des agents dans la base de données
- Liste et gestion des agents créés
- Exécution basique des agents (simulation ou envoi réel)

**Tâches**:
1. Implémenter la proposition d'actions dans le chat
2. Créer les pages de configuration d'agent
3. Définir le modèle de données pour les agents
4. Implémenter la sauvegarde dans Supabase
5. Créer l'interface de liste/gestion des agents
6. Implémenter l'exécution des agents (envoi emails via SendGrid)
7. Ajouter le suivi des contacts (statut, historique)

**Critères d'Acceptation**:
- [ ] Les 3 actions sont proposées après chaque synthèse
- [ ] L'utilisateur peut créer un agent de prospection
- [ ] Les paramètres de l'agent sont sauvegardés
- [ ] L'agent peut être lancé manuellement
- [ ] Le statut des contacts est visible

---

#### MVP 3: Abonnements et Notifications (2-3 jours)

**Objectif**: Permettre aux utilisateurs de s'abonner aux rapports et recevoir des notifications.

**Fonctionnalités**:
- Création d'abonnements aux rapports périodiques
- Configuration de la fréquence, du contenu et des destinataires
- Génération automatique des rapports (quotidien/hebdomadaire)
- Système de notifications pour les nouvelles entreprises
- Configuration des filtres de notification
- Historique des notifications et rapports

**Tâches**:
1. Implémenter la création d'abonnements
2. Définir le modèle de données pour les abonnements
3. Créer l'interface de gestion des abonnements
4. Implémenter la génération automatique des rapports (tâches Celery)
5. Intégrer Supabase Realtime pour les notifications push
6. Implémenter les notifications email via SendGrid
7. Créer l'historique des notifications

**Critères d'Acceptation**:
- [ ] L'utilisateur peut créer un abonnement aux rapports
- [ ] Les rapports sont générés selon la fréquence choisie
- [ ] Les notifications push fonctionnent
- [ ] Les notifications email sont envoyées
- [ ] L'historique est accessible

---

#### MVP 4: Authentification et Multi-utilisateurs (2 jours)

**Objectif**: Ajouter l'authentification et supporter plusieurs utilisateurs.

**Fonctionnalités**:
- Inscription/connexion des utilisateurs
- Gestion des profils utilisateurs
- Isolation des données par utilisateur
- Gestion des accès (rôles basiques: utilisateur, admin)

**Tâches**:
1. Intégrer Supabase Auth avec Next.js
2. Créer les pages d'inscription/connexion
3. Implémenter la gestion des profils
4. Ajouter le middleware d'authentification
5. Adapter le backend pour gérer les utilisateurs
6. Sécuriser les accès aux données

**Critères d'Acceptation**:
- [ ] Les utilisateurs peuvent s'inscrire et se connecter
- [ ] Les données sont isolées par utilisateur
- [ ] Un utilisateur ne peut pas accéder aux données d'un autre
- [ ] L'interface de gestion du profil est disponible

---

#### MVP 5: Polish et Production Ready (2-3 jours)

**Objectif**: Préparer l'application pour la production.

**Fonctionnalités**:
- Design amélioré et accessibilité
- Tests unitaires et d'intégration
- Documentation complète
- Déploiement sur Vercel et Railway
- Monitoring et logs
- Gestion des erreurs améliorée

**Tâches**:
1. Améliorer le design UI/UX
2. Ajouter les tests unitaires (frontend et backend)
3. Écrire la documentation utilisateur
4. Configurer le déploiement CI/CD
5. Ajouter le monitoring (Sentry, logs)
6. Implémenter la gestion des erreurs
7. Optimiser les performances

**Critères d'Acceptation**:
- [ ] Le design est professionnel et accessible
- [ ] Les tests couvrent au moins 80% du code
- [ ] La documentation est complète
- [ ] L'application est déployée et fonctionnelle
- [ ] Le monitoring est en place
- [ ] Les erreurs sont gérées gracieusement

---

### Phase 3: Tests et Validation

**Objectif**: Valider que toutes les exigences sont remplies.

**Livrables**:
- [ ] Suite de tests complète (unitaires, intégration, E2E)
- [ ] Validation des scénarios utilisateurs
- [ ] Tests de performance
- [ ] Tests de sécurité
- [ ] Rapport de validation

---

## Chronologie Estimation

| Phase | Durée Estimée | Livrables |
|-------|---------------|-----------|
| Phase 0: Recherche | 1-2 jours | research.md, décisions techniques |
| Phase 1: Design | 1 jour | data-model.md, contracts/, quickstart.md |
| MVP 1: Chat Basique | 2-3 jours | Chat fonctionnel + synthèse |
| MVP 2: Agents | 3-4 jours | Création et gestion des agents |
| MVP 3: Abonnements | 2-3 jours | Rapports et notifications |
| MVP 4: Auth | 2 jours | Authentification multi-utilisateurs |
| MVP 5: Polish | 2-3 jours | Production ready |
| Phase 3: Tests | 2-3 jours | Validation complète |
| **Total** | **15-21 jours** | **Application B2Bmax complète** |

---

## Risques et Atténuation

| Risque | Probabilité | Impact | Atténuation |
|--------|-------------|--------|-------------|
| **API INSEE indisponible ou limitée** | Moyenne | Élevé | Utiliser les fichiers Open Data INSEE comme fallback, implémenter un cache agressif |
| **Coût élevé de Mistral AI** | Faible | Moyen | Optimiser les prompts, utiliser des modèles plus petits, implémenter du caching |
| **Complexité de la prospection automatisée** | Élevée | Moyen | Commencer par l'email (plus simple), ajouter LinkedIn plus tard |
| **Problèmes de livraison d'emails** | Moyenne | Moyen | Utiliser un service professionnel (SendGrid), implémenter des retries |
| **Performance des tâches asynchrones** | Moyenne | Moyen | Optimiser les tâches Celery, utiliser du batch processing |
| **Adoption utilisateur faible** | Moyenne | Élevé | Implémenter un onboarding guidé, offrir un essai gratuit |

---

## Métriques de Succès

| Métrique | Cible | Méthode de Mesure |
|----------|-------|-------------------|
| Nombre d'utilisateurs actifs | 100 | Analytics (Supabase/Next.js) |
| Temps moyen de réponse | < 3s | Logging backend |
| Taux de conversion (requête → action) | 70% | Analytics frontend |
| Taux de réussite des agents | > 80% | Statistiques backend |
| Satisfaction utilisateur | > 4.5/5 | Enquêtes post-utilisation |
| Disponibilité du service | > 99% | Monitoring (UptimeRobot) |

---

## Prochaines Étapes

1. **Valider la stack technique** avec l'équipe
2. **Créer les artefacts de Phase 0** (research.md)
3. **Lancer l'implémentation de MVP 1** (Chat Basique)
4. **Configurer l'environnement de développement**
5. **Démarrer le suivi de projet** (tasks.md)

---

## Historique des Changements

| Date | Auteur | Changement |
|------|--------|------------|
| 2026-10-07 | Mistral Vibe | Création initiale du plan |

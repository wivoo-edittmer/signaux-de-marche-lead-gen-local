# Tâches d'Implémentation - B2Bmax

**Feature**: B2Bmax - Agent Conversationnel de Prospection INSEE  
**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)  
**Date**: 2026-10-07  
**Statut**: Prêt pour l'implémentation

---

## Légende

| Symbole | Description |
|---------|-------------|
| ✅ | Tâche terminée |
| 🟡 | Tâche en cours |
| ⏳ | Tâche à faire |
| ❌ | Tâche bloquée |
| 🔄 | Tâche en revue |

| Priorité | Description |
|----------|-------------|
| 🔴 P0 | Urgent - Bloquant pour le MVP |
| 🟠 P1 | Haute - Important pour le MVP |
| 🟡 P2 | Moyenne - Amélioration |
| 🟢 P3 | Basse - Nice to have |

| Type | Description |
|------|-------------|
| 📦 Setup | Configuration environnement |
| 🏗️ Dev | Développement |
| 🧪 Test | Tests |
| 📝 Doc | Documentation |
| 🚀 Deploy | Déploiement |

---

## Roadmap

```
Phase 0: Préparation (J1-J2)
├── Setup Environnement
├── Configuration Projets
└── Validation Dépendances

Phase 1: MVP 1 - Chat Basique (J3-J5)
├── Backend: API Chat + Mistral
├── Frontend: Interface Chat
├── Intégration INSEE
└── Génération Synthèses

Phase 2: MVP 2 - Agents (J6-J9)
├── Backend: CRUD Agents
├── Frontend: Interface Agents
├── Exécution Agents
└── Suivi Contacts

Phase 3: MVP 3 - Abonnements (J10-J12)
├── Backend: CRUD Abonnements
├── Frontend: Interface Abonnements
├── Génération Rapports
└── Notifications

Phase 4: MVP 4 - Auth (J13-J14)
├── Intégration Supabase Auth
├── Middleware Auth
├── Pages Auth
└── Isolation Données

Phase 5: MVP 5 - Polish (J15-J17)
├── Design UI/UX
├── Tests
├── Documentation
└── Déploiement

Phase 6: Validation (J18-J20)
├── Tests Utilisateurs
├── Correction Bugs
└── Optimisation
```

---

## Tâches par Phase

---

## 📌 Phase 0: Préparation (2 jours)

### 📦 Setup et Configuration

| ID | Tâche | Priorité | Type | Statut | Dépendances | Durée | Assigné |
|----|-------|----------|------|-------|-------------|-------|---------|
| P0-001 | Créer projets Supabase (dev + prod) | 🔴 P0 | 📦 Setup | ⏳ | Aucune | 1h | À faire |
| P0-002 | Configurer variables d'environnement | 🔴 P0 | 📦 Setup | ⏳ | P0-001 | 1h | À faire |
| P0-003 | Installer dépendances backend (Python) | 🔴 P0 | 📦 Setup | ⏳ | Aucune | 30m | À faire |
| P0-004 | Installer dépendances frontend (Node.js) | 🔴 P0 | 📦 Setup | ⏳ | Aucune | 30m | À faire |
| P0-005 | Configurer Docker pour Celery/Redis | 🟠 P1 | 📦 Setup | ⏳ | P0-001 | 1h | À faire |
| P0-006 | Obtenir clés API (Mistral, INSEE, SendGrid) | 🔴 P0 | 📦 Setup | ⏳ | Aucune | 1h | À faire |
| P0-007 | Créer structure de dossiers projets | 🔴 P0 | 📦 Setup | ⏳ | Aucune | 30m | À faire |

### 🏗️ Configuration Base de Données

| ID | Tâche | Priorité | Type | Statut | Dépendances | Durée | Assigné |
|----|-------|----------|------|-------|-------------|-------|---------|
| P0-008 | Créer tables selon data-model.md | 🔴 P0 | 🏗️ Dev | ⏳ | P0-001 | 2h | À faire |
| P0-009 | Configurer RLS (Row-Level Security) | 🔴 P0 | 🏗️ Dev | ⏳ | P0-008 | 1h | À faire |
| P0-010 | Importer données de référence (secteurs, zones) | 🟠 P1 | 🏗️ Dev | ⏳ | P0-008 | 1h | À faire |
| P0-011 | Configurer Storage pour rapports | 🟡 P2 | 📦 Setup | ⏳ | P0-001 | 30m | À faire |
| P0-012 | Configurer Realtime pour notifications | 🟡 P2 | 📦 Setup | ⏳ | P0-001 | 30m | À faire |

### ✅ Validation Phase 0

- [ ] Tous les projets sont configurés
- [ ] Toutes les dépendances sont installées
- [ ] La base de données est prête
- [ ] Les clés API sont disponibles
- [ ] L'environnement de développement fonctionne

---

## 🎯 Phase 1: MVP 1 - Chat Basique + Synthèse INSEE (3 jours)

### 🏗️ Backend

| ID | Tâche | Priorité | Type | Statut | Dépendances | Durée | Assigné |
|----|-------|----------|------|-------|-------------|-------|---------|
| M1-001 | Créer endpoint POST /v1/chat/messages | 🔴 P0 | 🏗️ Dev | ⏳ | P0-008 | 2h | À faire |
| M1-002 | Intégrer Mistral pour extraction d'entités | 🔴 P0 | 🏗️ Dev | ⏳ | M1-001, P0-006 | 2h | À faire |
| M1-003 | Créer service INSEE (mock ou API réelle) | 🔴 P0 | 🏗️ Dev | ⏳ | P0-008 | 2h | À faire |
| M1-004 | Créer endpoint POST /v1/searches | 🔴 P0 | 🏗️ Dev | ⏳ | M1-003 | 2h | À faire |
| M1-005 | Générer synthèses avec Mistral | 🔴 P0 | 🏗️ Dev | ⏳ | M1-004, P0-006 | 2h | À faire |
| M1-006 | Créer endpoint GET /v1/searches/{id} | 🔴 P0 | 🏗️ Dev | ⏳ | M1-004 | 1h | À faire |
| M1-007 | Implémenter SSE pour chat en temps réel | 🟠 P1 | 🏗️ Dev | ⏳ | M1-001 | 2h | À faire |
| M1-008 | Ajouter cache pour requêtes fréquentes | 🟡 P2 | 🏗️ Dev | ⏳ | M1-004 | 1h | À faire |

### 🏗️ Frontend

| ID | Tâche | Priorité | Type | Statut | Dépendances | Durée | Assigné |
|----|-------|----------|------|-------|-------------|-------|---------|
| M1-010 | Créer layout principal avec sidebar | 🔴 P0 | 🏗️ Dev | ⏳ | P0-004 | 2h | À faire |
| M1-011 | Créer page de chat (app/chat/page.tsx) | 🔴 P0 | 🏗️ Dev | ⏳ | M1-010 | 2h | À faire |
| M1-012 | Créer composant MessageInput | 🔴 P0 | 🏗️ Dev | ⏳ | M1-011 | 1h | À faire |
| M1-013 | Créer composant MessageList | 🔴 P0 | 🏗️ Dev | ⏳ | M1-011 | 2h | À faire |
| M1-014 | Créer composant SummaryView | 🔴 P0 | 🏗️ Dev | ⏳ | M1-011 | 2h | À faire |
| M1-015 | Intégrer SSE pour messages en temps réel | 🔴 P0 | 🏗️ Dev | ⏳ | M1-014, M1-007 | 2h | À faire |
| M1-016 | Créer composant ActionButtons | 🔴 P0 | 🏗️ Dev | ⏳ | M1-014 | 1h | À faire |
| M1-017 | Styliser l'interface avec TailwindCSS | 🟠 P1 | 🏗️ Dev | ⏳ | M1-013 | 2h | À faire |
| M1-018 | Ajouter loading states et errors | 🟡 P2 | 🏗️ Dev | ⏳ | M1-015 | 1h | À faire |

### 🧪 Tests MVP 1

| ID | Tâche | Priorité | Type | Statut | Dépendances | Durée |
|----|-------|----------|------|-------|-------------|-------|
| M1-020 | Test backend: extraction d'entités | 🔴 P0 | 🧪 Test | ⏳ | M1-002 | 1h |
| M1-021 | Test backend: génération synthèses | 🔴 P0 | 🧪 Test | ⏳ | M1-005 | 1h |
| M1-022 | Test backend: endpoints chat/searches | 🔴 P0 | 🧪 Test | ⏳ | M1-006 | 1h |
| M1-023 | Test frontend: interface de chat | 🔴 P0 | 🧪 Test | ⏳ | M1-015 | 1h |
| M1-024 | Test E2E: scénario recherche + synthèse | 🔴 P0 | 🧪 Test | ⏳ | M1-023 | 1h |

### ✅ Critères d'Acceptation MVP 1

- [ ] L'utilisateur peut poser une question en langage naturel
- [ ] Le système extrait correctement secteur, zone, période
- [ ] Une synthèse avec chiffres clés est affichée
- [ ] L'interface est responsive
- [ ] Les messages apparaissent en temps réel
- [ ] Les erreurs sont gérées gracieusement

---

## 🤖 Phase 2: MVP 2 - Agents de Prospection (4 jours)

### 🏗️ Backend

| ID | Tâche | Priorité | Type | Statut | Dépendances | Durée | Assigné |
|----|-------|----------|------|-------|-------------|-------|---------|
| M2-001 | Créer endpoint POST /v1/agents | 🔴 P0 | 🏗️ Dev | ⏳ | P0-008 | 2h | À faire |
| M2-002 | Créer endpoint GET /v1/agents | 🔴 P0 | 🏗️ Dev | ⏳ | M2-001 | 1h | À faire |
| M2-003 | Créer endpoint GET /v1/agents/{id} | 🔴 P0 | 🏗️ Dev | ⏳ | M2-001 | 1h | À faire |
| M2-004 | Créer endpoint PUT /v1/agents/{id} | 🟠 P1 | 🏗️ Dev | ⏳ | M2-001 | 1h | À faire |
| M2-005 | Créer endpoint DELETE /v1/agents/{id} | 🟠 P1 | 🏗️ Dev | ⏳ | M2-001 | 1h | À faire |
| M2-006 | Créer endpoint POST /v1/agents/{id}/activate | 🔴 P0 | 🏗️ Dev | ⏳ | M2-001 | 1h | À faire |
| M2-007 | Créer endpoint POST /v1/agents/{id}/pause | 🟠 P1 | 🏗️ Dev | ⏳ | M2-006 | 1h | À faire |
| M2-008 | Créer endpoint GET /v1/agents/{id}/contacts | 🔴 P0 | 🏗️ Dev | ⏳ | M2-001 | 2h | À faire |
| M2-009 | Implémenter logique de prospection | 🔴 P0 | 🏗️ Dev | ⏳ | M2-008 | 4h | À faire |
| M2-010 | Intégrer SendGrid pour envoi emails | 🟠 P1 | 🏗️ Dev | ⏳ | M2-009 | 2h | À faire |
| M2-011 | Créer tâches Celery pour prospection | 🟠 P1 | 🏗️ Dev | ⏳ | M2-009, P0-005 | 2h | À faire |

### 🏗️ Frontend

| ID | Tâche | Priorité | Type | Statut | Dépendances | Durée | Assigné |
|----|-------|----------|------|-------|-------------|-------|---------|
| M2-012 | Créer page Agents (app/agents/page.tsx) | 🔴 P0 | 🏗️ Dev | ⏳ | M1-010 | 2h | À faire |
| M2-013 | Créer page Create Agent (app/agents/create/page.tsx) | 🔴 P0 | 🏗️ Dev | ⏳ | M2-012 | 2h | À faire |
| M2-014 | Créer page Agent Details (app/agents/[id]/page.tsx) | 🔴 P0 | 🏗️ Dev | ⏳ | M2-012 | 2h | À faire |
| M2-015 | Créer composant AgentForm | 🔴 P0 | 🏗️ Dev | ⏳ | M2-013 | 2h | À faire |
| M2-016 | Créer composant AgentCard | 🔴 P0 | 🏗️ Dev | ⏳ | M2-012 | 1h | À faire |
| M2-017 | Créer composant AgentList | 🔴 P0 | 🏗️ Dev | ⏳ | M2-012 | 2h | À faire |
| M2-018 | Créer composant ContactList | 🔴 P0 | 🏗️ Dev | ⏳ | M2-014 | 2h | À faire |
| M2-019 | Intégrer actions "Créer un agent" dans le chat | 🔴 P0 | 🏗️ Dev | ⏳ | M1-016, M2-013 | 1h | À faire |
| M2-020 | Styliser les interfaces agents | 🟠 P1 | 🏗️ Dev | ⏳ | M2-017 | 2h | À faire |

### 🧪 Tests MVP 2

| ID | Tâche | Priorité | Type | Statut | Dépendances | Durée |
|----|-------|----------|------|-------|-------------|-------|
| M2-021 | Test backend: CRUD agents | 🔴 P0 | 🧪 Test | ⏳ | M2-005 | 1h |
| M2-022 | Test backend: contacts generation | 🔴 P0 | 🧪 Test | ⏳ | M2-011 | 2h |
| M2-023 | Test frontend: create agent flow | 🔴 P0 | 🧪 Test | ⏳ | M2-015 | 1h |
| M2-024 | Test E2E: créer agent depuis chat | 🔴 P0 | 🧪 Test | ⏳ | M2-019, M2-023 | 1h |

### ✅ Critères d'Acceptation MVP 2

- [ ] L'utilisateur peut créer un agent de prospection
- [ ] Les agents sont listés et gérés
- [ ] Les contacts sont générés et suivis
- [ ] Les statuts des contacts sont visibles
- [ ] L'intégration avec le chat fonctionne

---

## 📊 Phase 3: MVP 3 - Abonnements et Notifications (3 jours)

### 🏗️ Backend

| ID | Tâche | Priorité | Type | Statut | Dépendances | Durée |
|----|-------|----------|------|-------|-------------|-------|
| M3-001 | Créer endpoint POST /v1/subscriptions | 🔴 P0 | 🏗️ Dev | ⏳ | P0-008 | 2h |
| M3-002 | Créer endpoint GET /v1/subscriptions | 🔴 P0 | 🏗️ Dev | ⏳ | M3-001 | 1h |
| M3-003 | Créer endpoint GET /v1/subscriptions/{id} | 🔴 P0 | 🏗️ Dev | ⏳ | M3-001 | 1h |
| M3-004 | Créer endpoint PUT /v1/subscriptions/{id} | 🟠 P1 | 🏗️ Dev | ⏳ | M3-001 | 1h |
| M3-005 | Créer endpoint DELETE /v1/subscriptions/{id} | 🟠 P1 | 🏗️ Dev | ⏳ | M3-001 | 1h |
| M3-006 | Créer tâche Celery pour génération rapports | 🔴 P0 | 🏗️ Dev | ⏳ | M3-001, P0-005 | 2h |
| M3-007 | Implémenter génération PDF (optionnel) | 🟡 P2 | 🏗️ Dev | ⏳ | M3-006 | 2h |
| M3-008 | Créer endpoint POST /v1/notifications/follow | 🔴 P0 | 🏗️ Dev | ⏳ | P0-008 | 2h |
| M3-009 | Créer endpoint GET /v1/notifications | 🔴 P0 | 🏗️ Dev | ⏳ | M3-008 | 1h |
| M3-010 | Créer endpoint PUT /v1/notifications/{id}/read | 🔴 P0 | 🏗️ Dev | ⏳ | M3-009 | 1h |
| M3-011 | Intégrer Supabase Realtime pour notifications push | 🔴 P0 | 🏗️ Dev | ⏳ | M3-009, P0-012 | 2h |

### 🏗️ Frontend

| ID | Tâche | Priorité | Type | Statut | Dépendances | Durée |
|----|-------|----------|------|-------|-------------|-------|
| M3-012 | Créer page Subscriptions (app/subscriptions/page.tsx) | 🔴 P0 | 🏗️ Dev | ⏳ | M1-010 | 2h |
| M3-013 | Créer page Create Subscription | 🔴 P0 | 🏗️ Dev | ⏳ | M3-012 | 2h |
| M3-014 | Créer composant SubscriptionForm | 🔴 P0 | 🏗️ Dev | ⏳ | M3-013 | 2h |
| M3-015 | Créer composant SubscriptionList | 🔴 P0 | 🏗️ Dev | ⏳ | M3-012 | 2h |
| M3-016 | Créer page Notifications (app/notifications/page.tsx) | 🔴 P0 | 🏗️ Dev | ⏳ | M1-010 | 2h |
| M3-017 | Créer composant NotificationList | 🔴 P0 | 🏗️ Dev | ⏳ | M3-016 | 2h |
| M3-018 | Intégrer actions "Rapport hebdo" dans le chat | 🔴 P0 | 🏗️ Dev | ⏳ | M1-016, M3-013 | 1h |
| M3-019 | Intégrer actions "Suivre" dans le chat | 🔴 P0 | 🏗️ Dev | ⏳ | M1-016 | 1h |
| M3-020 | Intégrer Realtime notifications | 🔴 P0 | 🏗️ Dev | ⏳ | M3-011 | 2h |
| M3-021 | Styliser les interfaces abonnements | 🟠 P1 | 🏗️ Dev | ⏳ | M3-015 | 2h |

### 🧪 Tests MVP 3

| ID | Tâche | Priorité | Type | Statut | Dépendances | Durée |
|----|-------|----------|------|-------|-------------|-------|
| M3-022 | Test backend: CRUD subscriptions | 🔴 P0 | 🧪 Test | ⏳ | M3-005 | 1h |
| M3-023 | Test backend: report generation | 🔴 P0 | 🧪 Test | ⏳ | M3-006 | 2h |
| M3-024 | Test backend: notifications | 🔴 P0 | 🧪 Test | ⏳ | M3-011 | 1h |
| M3-025 | Test frontend: create subscription | 🔴 P0 | 🧪 Test | ⏳ | M3-014 | 1h |
| M3-026 | Test E2E: abonnement + notification | 🔴 P0 | 🧪 Test | ⏳ | M3-025 | 1h |

### ✅ Critères d'Acceptation MVP 3

- [ ] L'utilisateur peut créer un abonnement aux rapports
- [ ] Les rapports sont générés selon la fréquence
- [ ] Les notifications push fonctionnent
- [ ] Les notifications email sont envoyées
- [ ] L'historique est accessible
- [ ] L'intégration avec le chat fonctionne

---

## 🔐 Phase 4: MVP 4 - Authentification et Multi-utilisateurs (2 jours)

### 🏗️ Backend

| ID | Tâche | Priorité | Type | Statut | Dépendances | Durée |
|----|-------|----------|------|-------|-------------|-------|
| M4-001 | Intégrer Supabase Auth dans backend | 🔴 P0 | 🏗️ Dev | ⏳ | P0-001 | 2h |
| M4-002 | Créer middleware d'authentification JWT | 🔴 P0 | 🏗️ Dev | ⏳ | M4-001 | 2h |
| M4-003 | Appliquer middleware à tous les endpoints protégés | 🔴 P0 | 🏗️ Dev | ⏳ | M4-002 | 1h |
| M4-004 | Adapter RLS pour isolation des données | 🔴 P0 | 🏗️ Dev | ⏳ | M4-001, P0-009 | 2h |
| M4-005 | Créer endpoint GET /v1/auth/me | 🔴 P0 | 🏗️ Dev | ⏳ | M4-001 | 1h |
| M4-006 | Créer endpoint PUT /v1/auth/me | 🟠 P1 | 🏗️ Dev | ⏳ | M4-001 | 1h |
| M4-007 | Valider les tokens JWT | 🔴 P0 | 🏗️ Dev | ⏳ | M4-002 | 1h |

### 🏗️ Frontend

| ID | Tâche | Priorité | Type | Statut | Dépendances | Durée |
|----|-------|----------|------|-------|-------------|-------|
| M4-008 | Intégrer @supabase/ssr pour Next.js | 🔴 P0 | 🏗️ Dev | ⏳ | P0-004 | 2h |
| M4-009 | Créer page Login (app/login/page.tsx) | 🔴 P0 | 🏗️ Dev | ⏳ | M4-008 | 2h |
| M4-010 | Créer page Register (app/register/page.tsx) | 🔴 P0 | 🏗️ Dev | ⏳ | M4-008 | 2h |
| M4-011 | Créer page Profile (app/profile/page.tsx) | 🟠 P1 | 🏗️ Dev | ⏳ | M4-008 | 2h |
| M4-012 | Créer composant AuthProvider | 🔴 P0 | 🏗️ Dev | ⏳ | M4-008 | 2h |
| M4-013 | Protéger les routes avec middleware | 🔴 P0 | 🏗️ Dev | ⏳ | M4-009 | 1h |
| M4-014 | Créer composant ProtectedRoute | 🔴 P0 | 🏗️ Dev | ⏳ | M4-012 | 1h |
| M4-015 | Ajouter boutons login/logout dans layout | 🔴 P0 | 🏗️ Dev | ⏳ | M4-009 | 1h |
| M4-016 | Styliser les pages auth | 🟠 P1 | 🏗️ Dev | ⏳ | M4-010 | 2h |

### 🧪 Tests MVP 4

| ID | Tâche | Priorité | Type | Statut | Dépendances | Durée |
|----|-------|----------|------|-------|-------------|-------|
| M4-017 | Test backend: auth endpoints | 🔴 P0 | 🧪 Test | ⏳ | M4-005 | 1h |
| M4-018 | Test backend: JWT validation | 🔴 P0 | 🧪 Test | ⏳ | M4-007 | 1h |
| M4-019 | Test backend: data isolation | 🔴 P0 | 🧪 Test | ⏳ | M4-004 | 2h |
| M4-020 | Test frontend: login flow | 🔴 P0 | 🧪 Test | ⏳ | M4-009 | 1h |
| M4-021 | Test E2E: multi-users | 🔴 P0 | 🧪 Test | ⏳ | M4-019 | 1h |

### ✅ Critères d'Acceptation MVP 4

- [ ] Les utilisateurs peuvent s'inscrire et se connecter
- [ ] Les données sont isolées par utilisateur
- [ ] Un utilisateur ne peut pas accéder aux données d'un autre
- [ ] L'interface de gestion du profil est disponible
- [ ] Les routes protégées ne sont pas accessibles sans authentification

---

## ✨ Phase 5: MVP 5 - Polish et Production Ready (3 jours)

### 🎨 Design et UX

| ID | Tâche | Priorité | Type | Statut | Durée |
|----|-------|----------|------|-------|-------|
| M5-001 | Review et amélioration du design | 🟠 P1 | 🎨 Design | ⏳ | 2h |
| M5-002 | Ajouter animations (framer-motion) | 🟡 P2 | 🎨 Design | ⏳ | 2h |
| M5-003 | Améliorer l'accessibilité (a11y) | 🟡 P2 | 🎨 Design | ⏳ | 2h |
| M5-004 | Optimiser pour mobile | 🔴 P0 | 🎨 Design | ⏳ | 2h |
| M5-005 | Créer favicon et branding | 🟡 P2 | 🎨 Design | ⏳ | 1h |

### 🧪 Tests

| ID | Tâche | Priorité | Type | Statut | Durée |
|----|-------|----------|------|-------|-------|
| M5-006 | Ajouter tests unitaires backend (80%+) | 🔴 P0 | 🧪 Test | ⏳ | 4h |
| M5-007 | Ajouter tests unitaires frontend (80%+) | 🔴 P0 | 🧪 Test | ⏳ | 4h |
| M5-008 | Ajouter tests d'intégration | 🟠 P1 | 🧪 Test | ⏳ | 2h |
| M5-009 | Ajouter tests E2E (Cypress/Playwright) | 🟡 P2 | 🧪 Test | ⏳ | 2h |
| M5-010 | Configurer coverage et rapports | 🟠 P1 | 🧪 Test | ⏳ | 1h |

### 📝 Documentation

| ID | Tâche | Priorité | Type | Statut | Durée |
|----|-------|----------|------|-------|-------|
| M5-011 | Écrire documentation utilisateur | 🟠 P1 | 📝 Doc | ⏳ | 2h |
| M5-012 | Écrire documentation technique | 🟠 P1 | 📝 Doc | ⏳ | 2h |
| M5-013 | Créer README principal | 🔴 P0 | 📝 Doc | ⏳ | 1h |
| M5-014 | Documenter l'API (Swagger/OpenAPI) | 🔴 P0 | 📝 Doc | ⏳ | 1h |
| M5-015 | Créer guide de déploiement | 🟠 P1 | 📝 Doc | ⏳ | 1h |

### 🚀 Déploiement

| ID | Tâche | Priorité | Type | Statut | Durée |
|----|-------|----------|------|-------|-------|
| M5-016 | Configurer Vercel pour frontend | 🔴 P0 | 🚀 Deploy | ⏳ | 2h |
| M5-017 | Configurer Railway/Render pour backend | 🔴 P0 | 🚀 Deploy | ⏳ | 2h |
| M5-018 | Configurer variables d'environnement prod | 🔴 P0 | 🚀 Deploy | ⏳ | 1h |
| M5-019 | Configurer CI/CD (GitHub Actions) | 🟠 P1 | 🚀 Deploy | ⏳ | 2h |
| M5-020 | Configurer monitoring (Sentry) | 🟡 P2 | 🚀 Deploy | ⏳ | 1h |
| M5-021 | Configurer logging production | 🟠 P1 | 🚀 Deploy | ⏳ | 1h |

### 🔧 Optimisations

| ID | Tâche | Priorité | Type | Statut | Durée |
|----|-------|----------|------|-------|-------|
| M5-022 | Optimiser les requêtes database (index, cache) | 🟠 P1 | 🏗️ Dev | ⏳ | 2h |
| M5-023 | Optimiser les appels Mistral (cache, batch) | 🟠 P1 | 🏗️ Dev | ⏳ | 2h |
| M5-024 | Optimiser les assets frontend | 🟡 P2 | 🏗️ Dev | ⏳ | 1h |
| M5-025 | Configurer compression (gzip) | 🟡 P2 | 🏗️ Dev | ⏳ | 1h |
| M5-026 | Implémenter rate limiting | 🔴 P0 | 🏗️ Dev | ⏳ | 1h |

### ✅ Critères d'Acceptation MVP 5

- [ ] Le design est professionnel et accessible
- [ ] Les tests couvrent au moins 80% du code
- [ ] La documentation est complète
- [ ] L'application est déployée et fonctionnelle
- [ ] Le monitoring est en place
- [ ] Les erreurs sont gérées gracieusement
- [ ] Les performances sont optimisées

---

## 🎯 Phase 6: Validation Complète (3 jours)

### 🧪 Tests Utilisateurs

| ID | Tâche | Priorité | Type | Statut | Durée |
|----|-------|----------|------|-------|-------|
| V1-001 | Organiser session de test utilisateur | 🔴 P0 | 🧪 Test | ⏳ | 2h |
| V1-002 | Recueillir feedback utilisateurs | 🔴 P0 | 🧪 Test | ⏳ | 4h |
| V1-003 | Prioriser les corrections | 🟠 P1 | 📝 Doc | ⏳ | 2h |

### 🐛 Correction de Bugs

| ID | Tâche | Priorité | Type | Statut | Durée |
|----|-------|----------|------|-------|-------|
| V2-001 | Corriger bugs critiques | 🔴 P0 | 🏗️ Dev | ⏳ | 4h |
| V2-002 | Corriger bugs majeurs | 🟠 P1 | 🏗️ Dev | ⏳ | 4h |
| V2-003 | Corriger bugs mineurs | 🟡 P2 | 🏗️ Dev | ⏳ | 2h |

### 📈 Optimisation Final

| ID | Tâche | Priorité | Type | Statut | Durée |
|----|-------|----------|------|-------|-------|
| V3-001 | Optimisation finale des performances | 🟠 P1 | 🏗️ Dev | ⏳ | 2h |
| V3-002 | Validation finale de la sécurité | 🔴 P0 | 🧪 Test | ⏳ | 2h |
| V3-003 | Test de charge | 🟠 P1 | 🧪 Test | ⏳ | 2h |
| V3-004 | Préparation pour le lancement | 🔴 P0 | 📝 Doc | ⏳ | 2h |

---

## 📊 Suivi Global

### Par Type

| Type | Total | P0 | P1 | P2 | P3 | Complété | % Complété |
|------|-------|----|----|----|----|-----------|------------|
| 📦 Setup | 7 | 5 | 1 | 1 | 0 | 0 | 0% |
| 🏗️ Dev | 75 | 30 | 25 | 15 | 5 | 0 | 0% |
| 🧪 Test | 25 | 15 | 7 | 2 | 1 | 0 | 0% |
| 📝 Doc | 5 | 2 | 2 | 1 | 0 | 0 | 0% |
| 🚀 Deploy | 6 | 4 | 2 | 0 | 0 | 0 | 0% |
| **Total** | **118** | **56** | **41** | **19** | **6** | **0** | **0%** |

### Par Phase

| Phase | Total | Complété | % Complété | Durée Estimée | Début | Fin |
|-------|-------|-----------|------------|---------------|-------|-----|
| Phase 0 | 14 | 0 | 0% | 2 jours | J1 | J2 |
| MVP 1 | 24 | 0 | 0% | 3 jours | J3 | J5 |
| MVP 2 | 32 | 0 | 0% | 4 jours | J6 | J9 |
| MVP 3 | 32 | 0 | 0% | 3 jours | J10 | J12 |
| MVP 4 | 19 | 0 | 0% | 2 jours | J13 | J14 |
| MVP 5 | 37 | 0 | 0% | 3 jours | J15 | J17 |
| Validation | 9 | 0 | 0% | 3 jours | J18 | J20 |
| **Total** | **157** | **0** | **0%** | **20 jours** | J1 | J20 |

---

## 🎯 Prochaines Étapes

### Immédiates (J1)

1. **Compléter Phase 0**
   - [ ] Créer projets Supabase
   - [ ] Configurer environnement de développement
   - [ ] Obtenir toutes les clés API nécessaires
   - [ ] Valider la configuration

### Court Terme (J2-J5)

2. **Démarrer MVP 1**
   - [ ] Implémenter le backend pour le chat
   - [ ] Intégrer Mistral pour le NLP
   - [ ] Créer l'interface de chat
   - [ ] Valider avec tests E2E

### Moyen Terme (J6-J14)

3. **Implémenter MVP 2-4**
   - [ ] Agents de prospection
   - [ ] Abonnements et notifications
   - [ ] Authentification

### Long Terme (J15-J20)

4. **Finaliser et Déployer**
   - [ ] Polish UI/UX
   - [ ] Tests complets
   - [ ] Documentation
   - [ ] Déploiement production

---

## 📌 Notes

- Les tâches sont classées par priorité et dépendances
- Les durées sont des estimations et peuvent varier
- Les dépendances doivent être respectées pour un développement fluide
- Les tests doivent être écrits en parallèle du développement
- La documentation doit être mise à jour régulièrement

---

## 🔄 Mises à Jour

| Date | Auteur | Changement | Version |
|------|--------|------------|--------|
| 2026-10-07 | Mistral Vibe | Création initiale | 1.0 |

---

## 📚 Références

- [Spécification Complète](./spec.md)
- [Plan d'Implémentation](./plan.md)
- [Modèle de Données](./data-model.md)
- [Contrats API](./contracts/)
- [Guide Quickstart](./quickstart.md)
- [Recherche Technique](./research.md)

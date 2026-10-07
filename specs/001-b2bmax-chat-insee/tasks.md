# Tasks - B2Bmax MVP1

**Feature**: B2Bmax - Agent Conversationnel de Prospection INSEE  
**MVP**: 1 - Chat Basique + Synthèse INSEE  
**Date**: 2026-10-07  
**Statut**: En cours d'implémentation

---

## 📌 Contexte MVP1

**Objectif**: Permettre aux utilisateurs de poser des questions en langage naturel et recevoir des synthèses avec chiffres clés, **en utilisant uniquement les données locales** des fichiers `extract_10000.csv`.

**Contraintes clés** :
- ✅ **Données locales uniquement** : `StockUniteLegale_extract_10000.csv` et `StockEtablissement_extract_10000.csv`
- ✅ **Pas d'appel à l'API INSEE** pour le MVP1
- ✅ **Utilisation de Mistral** uniquement pour le NLP (compréhension de la requête, génération de synthèses)
- ✅ **Temps de réponse cible** : < 5 secondes

---

## 🎯 Livrables MVP1

| Livrable | Statut | Priorité | Responsable |
|----------|--------|----------|-------------|
| [data-model.md](data-model.md) | ✅ COMPLET | High | - |
| [schema_mvp1.sql](../../../insee-api/sql/schema_mvp1.sql) | ✅ COMPLET | High | - |
| [data_loader.py](../../../insee-api/scripts/data_loader.py) | ✅ COMPLET | High | - |
| Données chargées dans Supabase | ⏳ EN ATTENTE | High | Vous |
| Backend FastAPI fonctionnel | ⏳ EN COURS | High | - |
| Frontend Next.js basique | ❌ À FAIRE | High | - |
| Tests de validation | ❌ À FAIRE | Medium | - |

---

## 📋 Liste des Tâches

### Phase 0: Préparation des Données ✅

- [x] **Créer sectors.json** avec les secteurs NAF nécessaires
- [x] **Créer zones.json** avec les zones géographiques (Bretagne, départements, communes)
- [x] **Vérifier la structure** des fichiers extract_10000.csv
- [x] **Créer schema_mvp1.sql** adapté aux données locales
- [x] **Créer data_loader.py** pour charger les CSV dans Supabase

### Phase 1: Configuration de l'Environnement ⏳

#### Tâche 1.1: Configurer Supabase
- [ ] **Créer un projet Supabase** (Free Tier suffit pour MVP1)
  - [ ] Aller sur [supabase.com](https://supabase.com/) et créer un projet
  - [ ] Noter l'URL du projet et la Service Key
- [ ] **Exécuter le schéma SQL**
  - [ ] Ouvrir SQL Editor dans Supabase
  - [ ] Copier-coller le contenu de `insee-api/sql/schema_mvp1.sql`
  - [ ] Exécuter le script
- [ ] **Vérifier la création des tables**
  - [ ] Vérifier que les tables `sector`, `zone`, `legal_unit`, `establishment` existent
  - [ ] Vérifier que les vues `company_stats`, `companies_with_geo` existent

#### Tâche 1.2: Charger les données
- [ ] **Configurer .env**
  - [ ] Copier `.env.example` en `.env` dans `insee-api/`
  - [ ] Remplir `SUPABASE_URL` et `SUPABASE_SERVICE_KEY`
- [ ] **Installer les dépendances**
  ```bash
  cd insee-api
  pip install -r requirements.txt
  ```
- [ ] **Exécuter le script de chargement**
  ```bash
  python scripts/data_loader.py
  ```
- [ ] **Vérifier le chargement**
  - [ ] Exécuter dans Supabase SQL Editor: `SELECT COUNT(*) FROM legal_unit;` (doit retourner 10000)
  - [ ] Exécuter: `SELECT COUNT(*) FROM establishment;` (doit retourner 10000)

### Phase 2: Backend FastAPI 🚀

#### Tâche 2.1: Préparer l'environnement backend
- [x] **Créer insee-api/main.py** (déjà existant)
- [x] **Créer insee-api/data/data_loader.py** (déjà existant)
- [ ] **Mettre à jour main.py** pour utiliser les données Supabase
- [ ] **Ajouter les endpoints suivants** :
  - [ ] `GET /health` - Vérification du service
  - [ ] `GET /sectors` - Liste des secteurs disponibles
  - [ ] `GET /zones` - Liste des zones disponibles
  - [ ] `POST /chat/messages` - Traitement des messages chat
  - [ ] `POST /search` - Recherche d'entreprises

#### Tâche 2.2: Implémenter le backend
- [ ] **Créer le modèle Pydantic** pour les requêtes/reponses
- [ ] **Implémenter la logique de parsing** des requêtes utilisateur
  - [ ] Extraire secteur, zone, période, type d'entreprise
  - [ ] Utiliser Mistral pour l'extraction d'entités (ou mock)
- [ ] **Implémenter la recherche** dans Supabase
  - [ ] Filtrer par secteur (code NAF)
  - [ ] Filtrer par zone (code commune/département/région)
  - [ ] Compter les entreprises et établissements
  - [ ] Calculer les statistiques (créations, radiations, variation nette)
- [ ] **Générer les synthèses** avec Mistral (ou mock)
  - [ ] Créer un prompt optimisé pour les synthèses
  - [ ] Inclure les chiffres clés dans la réponse

#### Tâche 2.3: Tester le backend
- [ ] **Démarrer le serveur** :
  ```bash
  cd insee-api
  uvicorn main:app --reload --port 8000
  ```
- [ ] **Tester avec curl** :
  ```bash
  # Santé
  curl http://localhost:8000/health
  
  # Secteurs
  curl http://localhost:8000/sectors
  
  # Recherche (exemple)
  curl -X POST http://localhost:8000/chat/messages \
    -H "Content-Type: application/json" \
    -d '{"message": "Quelles sont les PME en Bretagne dans le secteur du numérique ?"}'
  ```
- [ ] **Vérifier les réponses** :
  - [ ] Les secteurs sont retournés correctement
  - [ ] Les zones sont retournées correctement
  - [ ] Les recherches retournent des données valides
  - [ ] Les temps de réponse sont < 5 secondes

### Phase 3: Application Next.js (Requise pour le parcours utilisateur et le déploiement Vercel)

#### Tâche 3.1: Préparer le projet frontend
- [ ] **Créer le projet Next.js** :
  ```bash
  npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir
  cd frontend
  ```
- [ ] **Configurer les dépendances** :
  ```bash
  npm install @supabase/supabase-js
  npm install --save-dev @types/node
  ```

#### Tâche 3.2: Implémenter l'interface de chat
- [ ] **Créer la page de chat** (`frontend/src/app/chat/page.tsx`)
  - [ ] Zone de saisie du message
  - [ ] Affichage des messages (utilisateur + assistant)
  - [ ] Style basique avec Tailwind CSS
- [ ] **Connecter au backend** :
  - [ ] Appeler l'API `/chat/messages`
  - [ ] Afficher les réponses
  - [ ] Gérer les erreurs

#### Tâche 3.3: Ajouter les actions suivantes
- [ ] **Afficher les 3 actions** après chaque synthèse :
  - [ ] "Recevoir un rapport hebdomadaire sur ces données"
  - [ ] "Créer un agent de prospection pour contacter ces entreprises"
  - [ ] "Suivre la création de nouvelles entreprises"

### Phase 4: Tests et Validation ✅

#### Tâche 4.1: Tests backend
- [ ] **Créer tests/test_mvp1.py**
  - [ ] Test de l'endpoint `/health`
  - [ ] Test de l'endpoint `/sectors`
  - [ ] Test de l'endpoint `/zones`
  - [ ] Test de l'endpoint `/chat/messages` avec différentes requêtes
- [ ] **Exécuter les tests** :
  ```bash
  cd insee-api
  pytest tests/ -v
  ```

#### Tâche 4.2: Tests frontend Next.js
- [ ] **Tester l'interface de chat**
  - [ ] Saisie de message
  - [ ] Affichage des réponses
  - [ ] Affichage des actions suivantes

#### Tâche 4.3: Validation des scénarios utilisateurs
- [ ] **Scénario 1**: Recherche basique + synthèse
  - [ ] "Quelles sont les PME en Bretagne dans le secteur du numérique ?"
  - [ ] Vérifier que la synthèse contient :
    - Nombre total d'entreprises
    - Nombre de créations (12 derniers mois)
    - Nombre de radiations (12 derniers mois)
    - Variation nette
    - Tendance (croissance/déclin/stable)
- [ ] **Scénario 2**: Recherche par département
  - [ ] "Quelles sont les entreprises dans le Finistère ?"
- [ ] **Scénario 3**: Recherche par secteur
  - [ ] "Quelles sont les entreprises dans le secteur de la restauration ?"

---

## 📊 Critères d'Acceptation MVP1

### Backend
- [ ] ✅ Le serveur FastAPI démarre sans erreur
- [ ] ✅ Les endpoints `/health`, `/sectors`, `/zones` fonctionnent
- [ ] ✅ L'endpoint `/chat/messages` comprend les requêtes en français
- [ ] ✅ Les recherches utilisent les données locales (pas d'API INSEE)
- [ ] ✅ Les synthèses contiennent les chiffres clés demandés
- [ ] ✅ Le temps de réponse est < 5 secondes

### Données
- [ ] ✅ Les tables Supabase sont créées correctement
- [ ] ✅ Les données des fichiers extract_10000.csv sont chargées
- [ ] ✅ Les vues SQL fonctionnent correctement
- [ ] ✅ Les fonctions SQL retournent des résultats valides

### Frontend Next.js
- [ ] ✅ L'interface de chat est accessible
- [ ] ✅ Les messages sont envoyés au backend
- [ ] ✅ Les réponses sont affichées correctement
- [ ] ✅ Les actions suivantes sont proposées après chaque synthèse

---

## 🎯 Prochaines Étapes

1. **Terminer la configuration de Supabase** (Tâches 1.1 et 1.2)
2. **Finaliser le backend** (Tâche 2.2)
3. **Tester le backend** (Tâche 2.3)
4. **Optionnel: Implémenter le frontend** (Tâche 3.x)
5. **Valider avec les scénarios utilisateurs** (Tâche 4.3)

---

## 📅 Timeline Estimée

| Phase | Durée | Étape Actuelle |
|-------|-------|----------------|
| Phase 0: Préparation | ✅ Terminée | - |
| Phase 1: Configuration | 30 min | ⏳ En cours |
| Phase 2: Backend | 1-2 heures | ⏳ En attente |
| Phase 3: Frontend | 1-2 heures | ❌ À faire |
| Phase 4: Tests | 30 min | ❌ À faire |
| **Total MVP1** | **2-4 heures** | **40% terminé** |

---

## 📝 Notes

### Problèmes connus
- Aucun pour l'instant

### Décisions techniques
- Utilisation des fichiers `extract_10000.csv` au lieu des fichiers complets (14.3 GB)
- Séparation des tables `legal_unit` et `establishment` pour respect de la structure INSEE
- Chargement des données de référence (`sectors.json`, `zones.json`) dans Supabase
- Utilisation de vues SQL pour simplifier les requêtes

### Ressources utiles
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation FastAPI](https://fastapi.tiangolo.com/)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Mistral AI](https://docs.mistral.ai/)

---

## 🔄 Historique des Changements

| Date | Auteur | Changement |
|------|--------|------------|
| 2026-10-07 | Mistral Vibe | Création initiale des tasks MVP1 |
| 2026-10-07 | Mistral Vibe | Ajout des tâches de configuration Supabase |

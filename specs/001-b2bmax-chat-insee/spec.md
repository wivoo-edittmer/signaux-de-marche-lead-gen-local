# B2Bmax - Agent Conversationnel de Prospection INSEE

## Résumé
Créer une application "B2Bmax" qui permet aux professionnels de rechercher des entreprises par secteur et zone géographique via un chat avec un agent virtuel, puis de créer des agents commerciaux automatisés pour la prospection.

---

## Problème
Les professionnels (banques, éditeurs de logiciels, prestataires de services) ont besoin de:
1. **Identifier les opportunités de marché** en temps réel via les créations/radiations d'entreprises
2. **Cibler des entreprises spécifiques** par secteur et zone géographique
3. **Automatiser la prospection** des nouvelles entreprises

Actuellement, les données INSEE sont publiées sous forme d'annonces à lire une à une, ce qui rend le signal de marché difficile à percevoir.

---

## Solution
B2Bmax offre une interface conversationnelle où les utilisateurs:
1. **Posent des questions en langage naturel** (ex: "Quelles sont les PME en Bretagne dans le secteur du numérique ?")
2. **Reçoivent une synthèse des chiffres clés** extraits des données INSEE
3. **Choisissent des actions suivantes** parmi des options proposées par l'agent

---

## Acteurs

| Acteur | Description | Rôle |
|--------|-------------|------|
| Professionnel | Utilisateur final (banquier, commercial, éditeur de logiciels) | Interagit avec l'agent pour obtenir des insights marché et créer des agents de prospection |
| Agent Virtuel | Système conversationnel | Comprend les requêtes, génère des synthèses, propose des actions |
| Système INSEE | Source de données | Fournit les données de créations/radiations d'entreprises |
| Agent de Prospection | BOT automatisé | Contacte les entreprises identifiées selon des critères définis |

---

## Scénarios Utilisateurs

### Scénario Principal: Recherche et Analyse de Marché

**Acteur**: Professionnel (ex: conseiller bancaire)

**Flux**:
1. **Déclencheur**: Le professionnel veut évaluer la santé d'un secteur dans une zone
2. **Action**: Il ouvre le chat et pose sa question en langage naturel
   - Exemple: "Quelles sont les PME en Bretagne dans le secteur du numérique ?"
   - Exemple: "Combien d'entreprises ont été créées dans la restauration à Lyon ce trimestre ?"
3. **Système**: L'agent virtuel analyse la requête et extrait:
   - Secteur: "numérique" ou code NAF correspondant
   - Zone: "Bretagne" ou code géographique
   - Période: implicite (12 derniers mois) ou explicite
4. **Système**: L'agent interroge les données INSEE et génère une synthèse:
   - Nombre total d'entreprises trouvées
   - Nombre de créations sur la période
   - Nombre de radiations sur la période
   - Variation nette
   - Répartition par sous-secteurs (si pertinent)
   - Tendances (hausse, baisse, stabilité)
5. **Système**: L'agent affiche la synthèse avec des visualisations simples
6. **Système**: L'agent propose les prochaines actions:
   - "Voulez-vous que je vous envoie un rapport hebdomadaire sur ces données ?"
   - "Voulez-vous créer un agent de prospection pour contacter chacune de ces entreprises ?"
   - "Voulez-vous suivre la création de nouvelles entreprises dans ce secteur/zone ?"
7. **Action**: Le professionnel choisit une ou plusieurs actions

**Résultat**: Le professionnel obtient des insights actionnables et peut automatiser le suivi ou la prospection.

### Scénario Alternatif: Création d'Agent de Prospection

**Acteur**: Professionnel (ex: éditeur de logiciels)

**Flux**:
1. **Précondition**: Le professionnel a reçu une synthèse de recherche
2. **Action**: Il choisit "créer un agent de prospection"
3. **Système**: L'agent virtuel guide la configuration:
   - **Cible**: Quelles entreprises contacter ? (toutes, ou filtre supplémentaire)
   - **Message**: Quel message envoyer ? (modèle personnalisable)
   - **Canal**: Par quel moyen contacter ? (email, LinkedIn, téléphone)
   - **Fréquence**: Quand contacter ? (immédiatement, progressif)
   - **Objectif**: Quelle action souhaitée ? (prise de rendez-vous, envoi de documentation, démonstration)
4. **Action**: Le professionnel valide la configuration
5. **Système**: L'agent de prospection est créé et commence son travail
6. **Système**: Un rapport de progression est accessible dans le chat

**Résultat**: Un agent automatisé contacte les entreprises cibles selon les critères définis.

### Scénario Alternatif: Abonnement aux Rapports

**Acteur**: Professionnel

**Flux**:
1. **Précondition**: Le professionnel a reçu une synthèse de recherche
2. **Action**: Il choisit "envoyer un rapport hebdomadaire"
3. **Système**: L'agent virtuel propose des options:
   - **Fréquence**: Hebdomadaire, bi-hebdomadaire, mensuelle
   - **Contenu**: Quels indicateurs inclure ? (créations, radiations, net change, top entreprises)
   - **Format**: Email, PDF, notification dans l'application
   - **Destinataires**: Qui reçoit le rapport ? (lui-même, son équipe)
4. **Action**: Le professionnel configure et valide
5. **Système**: L'abonnement est créé
6. **Système**: Le premier rapport est généré et envoyé immédiatement

**Résultat**: Le professionnel reçoit régulièrement des mises à jour sur le marché ciblé.

### Scénario Alternatif: Suivi des Nouvelles Entreprises

**Acteur**: Professionnel

**Flux**:
1. **Précondition**: Le professionnel a reçu une synthèse de recherche
2. **Action**: Il choisit "suivre la création de nouvelles entreprises"
3. **Système**: L'agent virtuel propose des options:
   - **Périmètre**: Même secteur/zone que la recherche initiale ?
   - **Critères**: Filtres supplémentaires (taille, chiffre d'affaires estimé)
   - **Notifications**: Comment être alerté ? (email, notification push, webhook)
4. **Action**: Le professionnel valide
5. **Système**: Le suivi est activé
6. **Système**: Une notification est envoyée pour chaque nouvelle entreprise correspondante

**Résultat**: Le professionnel est alerté en temps réel des nouvelles opportunités.

### Scénario d'Erreur: Requête Imprécise

**Acteur**: Professionnel

**Flux**:
1. **Action**: Le professionnel pose une question trop vague
   - Exemple: "Comment va le marché ?"
2. **Système**: L'agent détecte l'ambiguïté et demande des clarifications:
   - "De quel secteur parlez-vous ?"
   - "Dans quelle zone géographique ?"
   - "Quelle période souhaitez-vous analyser ?"
3. **Action**: Le professionnel fournit les précisions nécessaires
4. **Système**: La recherche est relancée avec les nouveaux critères

**Résultat**: L'utilisateur est guidé vers une requête valide.

---

## Exigences Fonctionnelles

### Recherche et Analyse

| ID | Exigence | Critère de Validation |
|----|----------|----------------------|
| FR-001 | Le système doit comprendre les requêtes en langage naturel pour extraire secteur, zone et période | La requête "PME numérique Bretagne" est correctement interprétée comme secteur="numérique", zone="Bretagne", période="12 derniers mois" |
| FR-002 | Le système doit interroger les données INSEE pour obtenir les chiffres de créations/radiations | Les données retournées correspondent aux critères de recherche |
| FR-003 | Le système doit calculer les indicateurs clés : total entreprises, créations, radiations, variation nette | Les calculs sont mathématiquement corrects |
| FR-004 | Le système doit générer une synthèse en langage naturel des chiffres clés | La synthèse contient au moins : nombre total, créations, radiations, variation nette, tendance |
| FR-005 | Le système doit identifier les sous-secteurs pertinents et leur performance relative | La synthèse inclut une répartition si plusieurs sous-secteurs sont présents |

### Interaction Conversationnelle

| ID | Exigence | Critère de Validation |
|----|----------|----------------------|
| FR-010 | Le système doit maintenir le contexte de la conversation (secteur, zone, période) | L'utilisateur peut enchaîner les questions sans répéter les critères |
| FR-011 | Le système doit proposer au moins 3 actions suivantes après chaque synthèse | Les options "rapport", "agent de prospection", "suivi" sont toujours présentes |
| FR-012 | Le système doit permettre à l'utilisateur de poser des questions de suivi sur les données affichées | L'utilisateur peut demander "Quels sont les détails des 5 premières entreprises ?" |
| FR-013 | Le système doit gérer les ambiguïtés et demander des clarifications | Les questions trop vagues déclenchent une demande de précision |

### Création d'Agent de Prospection

| ID | Exigence | Critère de Validation |
|----|----------|----------------------|
| FR-020 | Le système doit guider l'utilisateur dans la configuration de l'agent | Un assistant guide pas à pas la création |
| FR-021 | Le système doit permettre de sélectionner un sous-ensemble d'entreprises à contacter | Filtre par taille, secteur précis, date de création |
| FR-022 | Le système doit permettre de personnaliser le message de prospection | Champ de texte libre avec variables (nom entreprise, secteur, etc.) |
| FR-023 | Le système doit supporter plusieurs canaux de contact (email, LinkedIn) | au moins 2 canaux sont disponibles |
| FR-024 | Le système doit planifier les envois (immédiat ou échelonné) | Options : maintenant, 1/semaine, 5/jour |
| FR-025 | Le système doit suivre le statut de chaque contact (à contacter, envoyé, répondu, positif, négatif) | Tableau de bord de suivi accessible |
| FR-026 | Le système doit générer un rapport de performance de l'agent | Taux de réponse, taux de conversion, nombre de contacts établis |

### Rapports Hebdomadaires

| ID | Exigence | Critère de Validation |
|----|----------|----------------------|
| FR-030 | Le système doit créer des abonnements aux rapports périodiques | L'utilisateur peut créer/supprimer/modifier un abonnement |
| FR-031 | Le système doit générer automatiquement les rapports selon la fréquence choisie | Un rapport hebdo est généré chaque semaine à la même heure |
| FR-032 | Le système doit permettre de personnaliser le contenu du rapport | Sélection des indicateurs à inclure |
| FR-033 | Le système doit supporter plusieurs formats de rapport (email, PDF) | au moins 2 formats disponibles |
| FR-034 | Le système doit permettre d'ajouter/supprimer des destinataires | Gestion des destinataires par abonnement |

### Suivi des Nouvelles Entreprises

| ID | Exigence | Critère de Validation |
|----|----------|----------------------|
| FR-040 | Le système doit surveiller en continu les nouvelles créations d'entreprises | Détection dans les 24h suivant la publication INSEE |
| FR-041 | Le système doit notifier l'utilisateur des nouvelles entreprises correspondantes | Notification reçu pour chaque nouvelle entreprise matching |
| FR-042 | Le système doit permettre de configurer des filtres de notification | Filtre par secteur, zone, taille d'entreprise |
| FR-043 | Le système doit fournir un historique des notifications | Liste des notifications passées accessible |
| FR-044 | Le système doit permettre de marquer une notification comme traitée/archivée | Statut modifiable par l'utilisateur |

---

## Exigences Non Fonctionnelles

### Performance

| ID | Exigence | Critère |
|----|----------|---------|
| NF-001 | Temps de réponse à une requête < 5 secondes | 95% des requêtes traités en < 5s |
| NF-002 | Mise à jour des données INSEE au moins quotidiennement | Données fraîches de moins de 24h |
| NF-003 | Notification des nouvelles entreprises dans les 24h | Délai max 24h après publication INSEE |

### Sécurité

| ID | Exigence | Critère |
|----|----------|---------|
| NF-010 | Authentification des utilisateurs | Accès protégé par mot de passe ou OAuth |
| NF-011 | Chiffrement des données sensibles | HTTPS pour toutes les communications |
| NF-012 | Protection des données personnelles | Conformité RGPD pour les données entreprises |

### Fiabilité

| ID | Exigence | Critère |
|----|----------|---------|
| NF-020 | Disponibilité > 99% | Temps de disponibilité mensuel > 99% |
| NF-021 | Sauvegarde des configurations utilisateurs | Aucune perte de données après incident |

### Utilisabilité

| ID | Exigence | Critère |
|----|----------|---------|
| NF-030 | Interface intuitive sur mobile et desktop | Test utilisateur avec 80% de satisfaction |
| NF-031 | Accessibilité WCAG 2.1 niveau AA | Audit d'accessibilité validé |

---

## Critères de Succès

1. **Adoption Utilisateur**: 100 professionnels actifs dans les 3 premiers mois
2. **Qualité des Insights**: 90% des utilisateurs déclarent que les synthèses sont utiles pour leur activité
3. **Automatisation**: 70% des utilisateurs créent au moins un agent de prospection ou un abonnement aux rapports
4. **Performance**: Temps moyen de réponse < 3 secondes pour 80% des requêtes
5. **Satisfaction**: Score moyen > 4.5/5 dans les enquêtes de satisfaction

---

## Entités Principales

### Entreprise
- **Attributs**: SIREN, SIRET, Nom, Adresse, Code NAF, Date de création, Date de radiation (si applicable), Taille (effectif), Chiffre d'affaires (estimé)
- **Relations**: Appartient à un Secteur, Localisée dans une Zone

### Secteur
- **Attributs**: Code NAF, Libellé, Description, Secteur parent
- **Relations**: Contient des Entreprises

### Zone Géographique
- **Attributs**: Code (commune, département, région), Libellé, Niveau (commune/département/région)
- **Relations**: Contient des Entreprises

### Recherche
- **Attributs**: ID, Utilisateur, Secteur, Zone, Période (début, fin), Date de création, Statut
- **Relations**: Génère une Synthèse, Peut créer des Agents/Abonnements

### Synthèse
- **Attributs**: ID, Recherche, Nombre total entreprises, Créations, Radiations, Variation nette, Tendances, Sous-secteurs, Date de génération
- **Relations**: Associée à une Recherche

### Agent de Prospection
- **Attributs**: ID, Utilisateur, Nom, Description, Statut (actif/inactif), Date de création
- **Relations**: Cible des Entreprises, A des Contacts, Génère des Rapports

### Contact
- **Attributs**: ID, Agent, Entreprise, Canal (email/LinkedIn/téléphone), Message, Statut (à envoyer/envoyé/lu/répondu/converti), Date d'envoi, Date de réponse
- **Relations**: Appartient à un Agent, Cible une Entreprise

### Abonnement Rapport
- **Attributs**: ID, Utilisateur, Nom, Fréquence, Contenu (indicateurs sélectionnés), Format, Destinataires, Statut (actif/inactif), Date de création
- **Relations**: Génère des Rapports

### Notification
- **Attributs**: ID, Utilisateur, Type (nouvelle entreprise/rapport/alertes), Contenu, Statut (non lu/lu/archivé), Date de création
- **Relations**: Associée à une Entreprise (pour les nouvelles créations)

---

## Hypothèses

1. **Données INSEE**: Les données sont accessibles via une API ou des fichiers téléchargeables
2. **Authentification**: Les utilisateurs s'authentifient via un système existant (Firebase Auth, Auth0, ou implémentation propre)
3. **Génération de Contenu**: L'application utilise Mistral AI pour générer les synthèses en langage naturel et les messages de prospection
4. **Canaux de Communication**: Les canaux email et LinkedIn sont prioritaires pour la prospection automatisée
5. **Stockage**: Les données utilisateurs et configurations sont stockées dans une base de données (Supabase, PostgreSQL, ou autre)
6. **Notifications**: Les notifications sont envoyées par email et via l'application web

---

## Dépendances

1. **API INSEE**: Accès aux données de créations/radiations d'entreprises
2. **Mistral AI**: Pour la compréhension du langage naturel et la génération de synthèses
3. **Service d'Email**: Pour l'envoi des rapports et notifications (SendGrid, Mailgun, etc.)
4. **API LinkedIn**: Pour la prospection via LinkedIn (optionnel)
5. **Base de Données**: Pour stocker les configurations utilisateurs et l'historique

---

## Hors Scope

1. **Intégration avec d'autres sources de données** (ex: BPI France, Infogreffe) - futur
2. **Paiement en ligne** pour les abonnements premium - futur
3. **Application mobile native** (iOS/Android) - futur
4. **Traduction en plusieurs langues** - futur
5. **Intégration avec des CRM externes** (Salesforce, HubSpot) - futur

---

## Glossaire

| Terme | Définition |
|-------|------------|
| INSEE | Institut National de la Statistique et des Études Économiques |
| NAF | Nomenclature d'Activités Française - classification des activités économiques |
| SIREN | Système d'Identification du Répertoire des Entreprises |
| SIRET | Système d'Identification du Répertoire des Établissements |
| PME | Petite et Moyenne Entreprise (généralement < 250 salariés) |
| Prospection | Action de rechercher et contacter des clients potentiels |
| Agent de Prospection | Programme automatisé qui contacte des entreprises selon des critères prédéfinis |

---

## Notes Techniques (Optionnel - pour contexte)

Cette section peut contenir des notes pour l'équipe technique, mais ne doit pas influencer la spécification elle-même.

- Architecture envisagée: Frontend (React/Next.js) + Backend (FastAPI/Node.js) + Base de données (PostgreSQL/Supabase)
- L'application utilisera l'API Mistral pour le NLP (Natural Language Processing)
- Les données INSEE peuvent être accédées via l'API Sirius ou des fichiers Open Data
- Un système de cache sera nécessaire pour les requêtes fréquentes

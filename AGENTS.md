# AGENTS.md - Configuration Vibe pour b2bmax

---
**Priorité** : Ce fichier est **lu en premier** par Vibe avant toute exécution dans ce projet.
**Portée** : S'applique à **tous les fichiers et dossiers** du projet `b2bmax`.
**Rôle** : Définit les **skills locaux**, leurs **priorités**, et les **règles spécifiques** à ce projet.

---

## **Architecture des Skills dans b2bmax**

### **Skills locaux (priorité maximale)**
Stockés dans `.vibe/skills/` **→ Chargés en premier**.

| Skill | Source | Rôle | Priorité | Chemin |
|-------|--------|------|----------|--------|
| `speckit-analyze` | Local | Analyse des spécifications et du code existant | ⭐⭐⭐⭐⭐ | `.vibe/skills/speckit-analyze/SKILL.md` |
| `speckit-checklist` | Local | Génération de checklists pour les tâches | ⭐⭐⭐⭐⭐ | `.vibe/skills/speckit-checklist/SKILL.md` |
| `speckit-clarify` | Local | Clarification des besoins et ambiguïtés | ⭐⭐⭐⭐⭐ | `.vibe/skills/speckit-clarify/SKILL.md` |
| `speckit-constitution` | Local | Définition des règles et contraintes projet | ⭐⭐⭐⭐⭐ | `.vibe/skills/speckit-constitution/SKILL.md` |
| `speckit-converge` | Local | Convergence des idées et solutions | ⭐⭐⭐⭐⭐ | `.vibe/skills/speckit-converge/SKILL.md` |
| `speckit-implement` | Local | Aide à l'implémentation (code, tests, etc.) | ⭐⭐⭐⭐⭐ | `.vibe/skills/speckit-implement/SKILL.md` |
| `speckit-plan` | Local | Planification des tâches et roadmaps | ⭐⭐⭐⭐⭐ | `.vibe/skills/speckit-plan/SKILL.md` |
| `speckit-specify` | Local | Rédaction de spécifications techniques | ⭐⭐⭐⭐⭐ | `.vibe/skills/speckit-specify/SKILL.md` |
| `speckit-tasks` | Local | Gestion et suivi des tâches | ⭐⭐⭐⭐⭐ | `.vibe/skills/speckit-tasks/SKILL.md` |
| `speckit-taskstoissues` | Local | Conversion des tâches en issues (GitHub/GitLab) | ⭐⭐⭐⭐⭐ | `.vibe/skills/speckit-taskstoissues/SKILL.md` |
| `supabase` | Local (lien symbolique) | Interaction avec Supabase (DB, Auth, Storage) | ⭐⭐⭐⭐⭐ | `.vibe/skills/supabase/` |

> ⚠️ **Note sur `supabase`** : Actuellement un **lien symbolique** vers `../../.agents/skills/supabase`. 
> **Recommandation** : Remplacer par une copie locale pour éviter les dépendances de chemin absolu.

---

### **Skills globaux (priorité secondaire)**
Définis dans `skills-lock.json` **→ Chargés si aucun skill local ne correspond**.

| Skill | Source | Rôle | Priorité |
|-------|--------|------|----------|
| `academy-guide` | `anthropics/skills` | Guide pour l'apprentissage | ⭐⭐ |
| `supabase` | `supabase/agent-skills` | ⚠️ **Doublon** avec le skill local | ⭐⭐ |
| `supabase-postgres-best-practices` | `supabase/agent-skills` | Bonnes pratiques PostgreSQL | ⭐⭐ |
| `pdf` | `anthropics/skills` | Génération/manipulation de PDF | ⭐⭐ |
| `xlsx` | `anthropics/skills` | Génération/manipulation de fichiers Excel | ⭐⭐ |
| `docx` | `anthropics/skills` | Génération/manipulation de Word | ⭐⭐ |
| `pptx` | `anthropics/skills` | Génération de présentations PowerPoint | ⭐⭐ |
| `mcp-builder` | `anthropics/skills` | Création d'outils MCP personnalisés | ⭐⭐ |
| `webapp-testing` | `anthropics/skills` | Tests d'applications web | ⭐⭐ |

---

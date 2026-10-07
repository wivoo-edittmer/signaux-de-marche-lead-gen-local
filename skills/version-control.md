# Version Control Mastery (Git)

## Core Concepts
- **Commit**: Atomic change with message
- **Branch**: Parallel line of development
- **Merge**: Combine branches
- **Rebase**: Rewrite commit history
- **Remote**: Repository on server

## Essential Workflows

### Basic
```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes, stage, commit
git add .
git commit -m "Add my feature"

# Push to remote
git push origin feature/my-feature
```

### Rebasing
```bash
# Rebase feature onto main
git checkout feature/my-feature
git rebase main

# Resolve conflicts, then:
git add .
git rebase --continue

# Force push (only if branch is yours)
git push origin feature/my-feature --force-with-lease
```

### Conflict Resolution
1. Identify conflict markers: `<<<<<<<`, `=======`, `>>>>>>>`
2. Edit files to resolve
3. `git add` resolved files
4. `git rebase --continue` or `git merge --continue`

## Vibe-Specific Tips
- **Before major AI changes**: `git stash` or create a branch
- **After AI changes**: Review with `git diff` before committing
- **If AI breaks something**: `git checkout .` to revert all uncommitted changes
- **For experimental changes**: Use `git stash` to save and restore

## Advanced Patterns

### Interactive Rebase
```bash
# Rewrite last 5 commits
git rebase -i HEAD~5
```

### Cherry Pick
```bash
# Apply specific commit from another branch
git cherry-pick abc123
```

### Bisect
```bash
# Find which commit introduced bug
git bisect start
git bisect bad HEAD
git bisect good v1.0.0
```

## Best Practices
- Commit messages: Use imperative mood ("Add feature", not "Added feature")
- Atomic commits: One logical change per commit
- Branch naming: `feature/`, `bugfix/`, `chore/` prefixes
- Never commit broken code
- Pull before pushing
- Use `--force-with-lease` instead of `--force`
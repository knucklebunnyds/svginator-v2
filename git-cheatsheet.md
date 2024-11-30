# Git Command Cheat Sheet

## Quick Start - Common Workflow
```bash
# 1. Check what files have changed
git status

# 2. Stage all changed files
git add .
# OR stage specific files
git add [filename]

# 3. Commit changes with a message
git commit -m "Your descriptive commit message"

# 4. Push changes to remote repository
git push origin main

# If you get errors pushing, you may need to pull first:
git pull origin main
# Then push again
git push origin main
```

## Basic Commands

### Getting Started
```bash
git init                    # Initialize a new Git repository
git clone [url]            # Clone a repository
git config --global user.name "[name]"    # Set your Git username
git config --global user.email "[email]"  # Set your Git email
```

### Basic Workflow
```bash
git status                 # Check status of working directory
git add [file]            # Add a file to staging area
git add .                 # Add all changes to staging area
git commit -m "[message]" # Commit changes with a message
git push origin [branch]  # Push changes to remote repository
git pull origin [branch]  # Pull changes from remote repository
```

### Branching
```bash
git branch                # List all local branches
git branch -a            # List all branches (local and remote)
git branch [name]        # Create a new branch
git checkout [branch]    # Switch to a branch
git checkout -b [branch] # Create and switch to a new branch
git merge [branch]       # Merge a branch into current branch
git branch -d [branch]   # Delete a branch
```

### Viewing Changes
```bash
git log                  # View commit history
git log --oneline       # View commit history (compact)
git diff                # View changes in working directory
git diff --staged       # View changes in staging area
git show [commit]       # View specific commit
```

## Advanced Commands

### Stashing
```bash
git stash               # Stash changes
git stash list         # List stashes
git stash pop          # Apply and remove latest stash
git stash apply        # Apply latest stash (keep it in stash list)
git stash drop         # Remove latest stash
```

### Remote Repositories
```bash
git remote -v                    # List remote repositories
git remote add [name] [url]     # Add remote repository
git remote remove [name]        # Remove remote repository
git fetch [remote]              # Download objects from remote
git push [remote] --tags        # Push tags to remote
```

### Undoing Changes
```bash
git reset [file]               # Unstage file
git reset --hard HEAD          # Discard all local changes
git reset --hard [commit]      # Reset to specific commit
git revert [commit]            # Create new commit that undoes changes
git checkout -- [file]         # Discard changes to file
```

### Tags
```bash
git tag                        # List all tags
git tag [name]                # Create a tag
git tag -a [name] -m "[msg]"  # Create annotated tag
git push origin [tag]         # Push specific tag
```

## Tips and Tricks

### Aliases
```bash
# Add these to your .gitconfig
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD --
    last = log -1 HEAD
```

### Useful Commands
```bash
git commit --amend            # Modify the last commit
git rebase -i HEAD~[n]        # Interactive rebase of last n commits
git cherry-pick [commit]      # Apply specific commit to current branch
git reflog                    # View history of HEAD changes
```

### Cleaning
```bash
git clean -n                  # Show what will be deleted
git clean -f                  # Delete untracked files
git clean -fd                 # Delete untracked files and directories
```

### Troubleshooting
```bash
git fsck                      # Check repository integrity
git gc                        # Clean up unnecessary files
git prune                     # Remove unreachable objects
```

## Best Practices

1. **Commit Messages**
   - Use present tense ("Add feature" not "Added feature")
   - Be descriptive but concise
   - Start with a capital letter

2. **Branching**
   - Keep `main/master` branch stable
   - Create feature branches for new work
   - Delete branches after merging

3. **Before Pushing**
   - Pull latest changes
   - Run tests
   - Review your changes

4. **Regular Maintenance**
   - Regularly fetch from remote
   - Clean up old branches
   - Keep commits atomic and focused 
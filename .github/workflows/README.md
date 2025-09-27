# 🎨 GitHub Actions Workflows for Design Tokens

This directory contains pre-configured GitHub Actions workflows for automating design token synchronization and analytics in your CI/CD pipeline.

## 📋 Available Workflows

### 1. 🎨 Design Tokens Sync (`design-tokens-sync.yml`)

**Primary workflow for automated token synchronization**

**Triggers:**
- Push to main/develop branches when tokens change
- Pull requests affecting token files
- Manual workflow dispatch

**Features:**
- ✅ Validates token structure and syntax
- 🎨 Generates CSS, TypeScript, and Tailwind files
- 📊 Creates usage analytics reports
- 💾 Auto-commits generated files
- 💬 Comments on pull requests with results
- 📖 Deploys documentation to GitHub Pages
- 📢 Sends team notifications (Slack)

### 2. 🔍 Pre-commit Validation (`pre-commit-validation.yml`)

**Fast validation for development workflows**

**Triggers:**
- All pull requests
- Push to feature branches

**Features:**
- ⚡ Quick token validation
- 🧪 Test token synchronization
- 📦 Upload artifacts for preview
- 💬 PR comments with validation results

### 3. 📊 Weekly Analytics (`weekly-analytics.yml`)

**Comprehensive weekly reporting**

**Triggers:**
- Scheduled every Monday at 9 AM UTC
- Manual workflow dispatch

**Features:**
- 📈 Historical trend analysis
- 📋 Automated GitHub issues with insights
- 📤 Artifact uploads for detailed reports
- 📧 Optional email notifications

## 🚀 Setup Instructions

### 1. Copy Workflows to Your Repository

```bash
# Copy all workflows
cp templates/github-actions/*.yml .github/workflows/

# Or copy individual workflows
cp templates/github-actions/design-tokens-sync.yml .github/workflows/
```

### 2. Configure Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "tokens:validate": "design-tokens-sync validate",
    "tokens:sync": "design-tokens-sync sync",
    "tokens:analytics": "design-tokens-sync analytics",
    "tokens:watch": "design-tokens-sync watch"
  }
}
```

### 3. Required Repository Secrets

Configure these secrets in your GitHub repository settings:

#### Optional Secrets:
- `SLACK_WEBHOOK_URL` - For team notifications
- `SENDGRID_API_KEY` - For email reports  
- `TEAM_EMAIL` - Team email for notifications

#### Required Permissions:
- Actions: Read/Write
- Contents: Write
- Pull Requests: Write
- Issues: Write
- Pages: Write (for documentation deployment)

### 4. Repository Settings

#### Enable GitHub Pages:
1. Go to Repository Settings → Pages
2. Set Source to "GitHub Actions"
3. This enables automatic documentation deployment

#### Workflow Permissions:
1. Go to Repository Settings → Actions → General
2. Set "Workflow permissions" to "Read and write permissions"
3. Check "Allow GitHub Actions to create and approve pull requests"

## 🔧 Customization Options

### Modify Trigger Conditions

```yaml
# Example: Only run on specific branches
on:
  push:
    branches: [main, staging]
    paths: ['tokens.json']
```

### Add Custom Validation Steps

```yaml
- name: 🧪 Custom Validation
  run: |
    # Add your custom validation logic
    npm run custom:validate-tokens
```

### Configure Notification Channels

```yaml
# Add Teams/Discord notifications
- name: 📢 Notify Teams
  if: success()
  run: |
    curl -X POST ${{ secrets.TEAMS_WEBHOOK_URL }} \
      -H "Content-Type: application/json" \
      -d '{"text": "✅ Design tokens synced successfully!"}'
```

## 📊 Understanding Workflow Outputs

### Artifacts Generated:
- **design-tokens-analytics-{sha}** - Analytics reports and data
- **token-validation-{sha}** - Validation results and generated files
- **weekly-analytics-{run}** - Weekly reports (90-day retention)

### GitHub Pages Deployment:
- Accessible at: `https://{username}.github.io/{repository}`
- Contains analytics reports and token documentation

### Issue Creation:
- Weekly analytics creates tracking issues
- Auto-labeled for easy filtering
- Contains actionable insights

## 🎯 Best Practices

### 1. Branch Protection Rules
```yaml
# Suggested branch protection for main
required_status_checks:
  - "Validate Design Tokens"
enforce_admins: true
required_pull_request_reviews:
  required_approving_review_count: 1
```

### 2. Workflow Dependencies
- `pre-commit-validation.yml` - Runs on all PRs (fast feedback)
- `design-tokens-sync.yml` - Runs on main branch (comprehensive)
- `weekly-analytics.yml` - Scheduled insights

### 3. File Structure
```
.github/
├── workflows/
│   ├── design-tokens-sync.yml
│   ├── pre-commit-validation.yml
│   └── weekly-analytics.yml
├── ISSUE_TEMPLATE/
│   └── token-issue.md
└── pull_request_template.md
```

## 🔍 Troubleshooting

### Common Issues:

#### ❌ "npm run tokens:validate command not found"
**Solution:** Add the script to your `package.json` and install `design-tokens-sync`

#### ❌ "Permission denied" errors
**Solution:** Check workflow permissions in repository settings

#### ❌ GitHub Pages not deploying
**Solution:** Enable GitHub Pages in repository settings and set source to "GitHub Actions"

#### ❌ No analytics data generated
**Solution:** Ensure your project has token usage in component files

### Debug Mode:
Add this to any workflow step for debugging:

```yaml
- name: 🐛 Debug Information
  run: |
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "Working directory: $(pwd)"
    echo "Files in directory:"
    ls -la
```

## 📚 Advanced Configuration

### Multi-Environment Setup:
```yaml
strategy:
  matrix:
    environment: [development, staging, production]
    include:
      - environment: development
        config_file: design-tokens.dev.config.js
      - environment: staging  
        config_file: design-tokens.staging.config.js
      - environment: production
        config_file: design-tokens.config.js
```

### Custom Output Formats:
```yaml
- name: 🎨 Generate Custom Formats
  run: |
    design-tokens-sync sync --format css,typescript,scss,swift
    design-tokens-sync sync --format android-xml --output android/
```

### Integration with Design Tools:
```yaml
- name: 🎨 Sync from Figma
  env:
    FIGMA_TOKEN: ${{ secrets.FIGMA_TOKEN }}
  run: |
    design-tokens-sync figma-sync --file-id ${{ secrets.FIGMA_FILE_ID }}
    design-tokens-sync sync
```

## 📞 Support

For issues specific to these workflows:
1. Check the [troubleshooting section](#-troubleshooting)
2. Review workflow run logs in GitHub Actions
3. Open an issue in the design-tokens-sync repository

For general GitHub Actions help:
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions) 
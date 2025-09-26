---
created: 2024-09-23
last_updated: 2024-09-23
version: 1.0.0
type: project-structure
---

# Project Structure - The Profit Platform

## Root Directory Overview

```
/mnt/c/Users/abhis/projects/tpp/
├── website/              # Current production site (legacy)
├── astro-site/          # New Astro framework migration
├── src/                 # Supplementary tools and features
├── scripts/             # Build and automation scripts
├── tests/               # Test suites (Playwright, Jest)
├── docs/                # Project documentation
├── .claude/             # Claude AI context
├── logs/                # Application logs
├── dist/                # Build output
└── [config files]       # Package.json, vite.config, etc.
```

## Detailed Structure

### `/website/` - Production Legacy Site
```
website/
├── components/          # Extracted modular components
│   ├── common/         # Shared UI elements
│   │   ├── header.html
│   │   ├── footer.html
│   │   └── navigation.html
│   ├── layout/         # Page layouts
│   │   ├── hero-section.html
│   │   └── cta-section.html
│   └── sections/       # Page sections
│       ├── services.html
│       ├── testimonials.html
│       └── pricing.html
├── css/                # Consolidated CSS system
│   ├── consolidated/   # Main CSS files
│   │   ├── critical.css     # Above-fold styles
│   │   ├── components.css   # Component styles
│   │   ├── pages.css        # Page-specific styles
│   │   └── responsive.css   # Media queries
│   └── legacy/         # Original CSS (deprecated)
├── js/                 # JavaScript modules
│   ├── modules/        # Feature modules
│   │   ├── exit-intent.js
│   │   ├── pricing-calculator.js
│   │   ├── component-loader.js
│   │   └── tracking.js
│   ├── utils/          # Utility functions
│   └── vendor/         # Third-party scripts
├── images/             # Image assets
├── power/              # SEO power pages
│   ├── locations/      # Location-based pages
│   └── services/       # Service-specific pages
├── lead-magnets/       # Conversion tools
└── [HTML pages]        # Main site pages
```

### `/astro-site/` - New Migration
```
astro-site/
├── src/
│   ├── components/     # Astro components
│   │   ├── extracted/  # Migrated from legacy
│   │   ├── layout/     # Layout components
│   │   └── ui/         # UI components
│   ├── layouts/        # Page layouts
│   │   ├── BaseLayout.astro
│   │   └── PageLayout.astro
│   ├── pages/          # Route pages
│   │   ├── index.astro
│   │   ├── services/
│   │   ├── locations/
│   │   └── tools/
│   └── styles/         # Global styles
├── public/             # Static assets
├── scripts/            # Build scripts
└── astro.config.mjs    # Astro configuration
```

### `/src/` - Additional Features
```
src/
├── calculators/        # Interactive tools
│   ├── roi-calculator/
│   ├── budget-optimizer/
│   └── conversion-calculator/
├── chatbot/           # Chat integration
│   ├── config/
│   └── scripts/
├── seo/               # SEO tools
│   ├── audit-tool/
│   ├── keyword-checker/
│   └── speed-tester/
├── tools/             # Various utilities
└── enhanced-meta/     # Meta optimizations
```

### `/scripts/` - Automation
```
scripts/
├── build-components.js      # Component builder
├── optimize-images.js       # Image optimization
├── extract-inline-styles.js # Style extraction
├── migration/              # Migration utilities
└── deployment/             # Deploy scripts
```

### `/tests/` - Testing
```
tests/
├── playwright/         # E2E tests
│   ├── specs/
│   └── fixtures/
├── jest/              # Unit tests
│   ├── components/
│   └── utils/
└── visual/            # Visual regression
```

## Important Files

### Configuration Files
- `package.json` - Dependencies and scripts
- `vite.config.js` - Build configuration
- `astro.config.mjs` - Astro settings
- `playwright.config.js` - E2E test config
- `jest.config.js` - Unit test config
- `.gitignore` - Git exclusions
- `robots.txt` - SEO crawler rules
- `sitemap.xml` - Site structure

### Documentation Files
- `CLAUDE.md` - AI assistant instructions
- `ASTRO_MIGRATION_STRATEGY.md` - Migration plan
- `COMPONENT_ARCHITECTURE.md` - Component design
- `FINAL_GO_LIVE_CHECKLIST.md` - Launch checklist
- Various report files (`*.md`)

### Monitoring & Analytics
- `monitoring-dashboard.html` - Real-time metrics
- `24hour-dashboard.sh` - Daily monitoring
- `revenue-alerts.log` - Revenue tracking
- `performance.log` - Performance metrics

## File Naming Conventions

### HTML Files
- Pages: `kebab-case.html` (e.g., `google-ads.html`)
- Components: `component-name.html`
- Power pages: `location-service.html`

### CSS Files
- Global: `name.css`
- Components: `component-name.css`
- Pages: `page-name.css`

### JavaScript Files
- Modules: `module-name.js`
- Utils: `util-name.js`
- Components: `component-name.js`

### Documentation
- Markdown: `UPPER_SNAKE_CASE.md` for important docs
- Regular: `kebab-case.md` for general docs

## Build Artifacts

### Generated Directories
- `/dist/` - Production build output
- `/node_modules/` - NPM dependencies
- `/.vite/` - Vite cache
- `/coverage/` - Test coverage reports
- `/playwright-report/` - E2E test results

### Temporary Files
- `*.log` - Various log files
- `*.cache` - Cache files
- `.env` - Environment variables (not committed)

## Access Patterns

### Development Flow
1. Source files in `/website/` or `/astro-site/src/`
2. Build process via Vite
3. Output to `/dist/`
4. Testing via `/tests/`
5. Deployment via `/scripts/`

### Component Flow
1. Define in `/website/components/` or `/astro-site/src/components/`
2. Style in corresponding CSS
3. Load via JavaScript modules
4. Test in isolation
5. Deploy as part of build

## Security Considerations
- `.env` files excluded from git
- API keys in environment variables
- Sensitive data in `.gitignore`
- Build artifacts not committed
- Logs sanitized of PII
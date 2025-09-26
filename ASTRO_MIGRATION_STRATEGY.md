# Astro Migration Strategy - The Profit Platform

## ✅ Phase 0: Setup Complete

### What We've Accomplished
- ✅ Created `astro-migration` branch
- ✅ Set up Astro with TypeScript and optimal configuration
- ✅ Configured Tailwind CSS with custom design system
- ✅ Created base layout components (BaseLayout, MainLayout, Header, Footer)
- ✅ Set up path aliases for clean imports
- ✅ Configured essential integrations (sitemap, prefetch, compression, MDX, Partytown)
- ✅ Created comprehensive CSS architecture with utilities and components

## 🚀 How to Run the Astro Development Server

```bash
# Navigate to the Astro project
cd astro-site

# Run development server
npm run dev

# The site will be available at http://localhost:3000
```

## 📁 Current Project Structure

```
astro-site/
├── src/
│   ├── components/
│   │   ├── layout/       # Header, Footer, Navigation
│   │   ├── sections/     # Hero, Services, Features, CTA
│   │   ├── ui/          # Buttons, Cards, Forms, Modals
│   │   ├── forms/       # Contact, Newsletter, etc.
│   │   └── common/      # Shared components
│   ├── layouts/
│   │   ├── BaseLayout.astro    # HTML structure, meta tags
│   │   └── MainLayout.astro    # With Header/Footer
│   ├── pages/
│   │   ├── index.astro         # Homepage (migrated)
│   │   ├── services/           # Service pages
│   │   ├── local/             # Location pages
│   │   └── power/             # Keyword pages
│   ├── content/          # Markdown/MDX content
│   ├── styles/
│   │   └── global.css    # Tailwind + custom styles
│   └── utils/           # Helper functions
├── public/              # Static assets
├── astro.config.mjs     # Astro configuration
├── tailwind.config.js   # Tailwind configuration
└── tsconfig.json        # TypeScript configuration
```

## 🔄 Next Steps: Migration Pipeline

### 1. CSS Consolidation Script (Priority: HIGH)
Create an automated script to analyze and consolidate the 32 CSS files:

```javascript
// scripts/consolidate-css.js
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const cssnano = require('cssnano');

async function consolidateCSS() {
  // 1. Read all CSS files from website/css/
  // 2. Extract unique rules, removing duplicates
  // 3. Categorize into: base, components, utilities, themes
  // 4. Generate consolidated files in astro-site/src/styles/
  // 5. Create mapping file for migration reference
}
```

### 2. Component Extraction Utilities (Priority: HIGH)
Build tools to extract reusable components from HTML:

```javascript
// scripts/extract-components.js
const cheerio = require('cheerio');

function extractComponent(htmlFile, selector) {
  // 1. Parse HTML file
  // 2. Find repeated patterns
  // 3. Extract as Astro components
  // 4. Replace with component imports
  // 5. Generate props interfaces
}
```

### 3. Content Migration Script (Priority: HIGH)
Automate migration of 130+ HTML pages:

```javascript
// scripts/migrate-pages.js
async function migratePage(htmlPath) {
  // 1. Read HTML file
  // 2. Extract frontmatter (title, description, etc.)
  // 3. Identify layout template
  // 4. Convert to Astro page
  // 5. Update internal links
  // 6. Preserve URL structure
}
```

## 📊 Migration Tracking

### Pages to Migrate (130+ total)
- [ ] Homepage (✅ Complete - example created)
- [ ] Service Pages (5 main)
  - [ ] SEO Sydney
  - [ ] Google Ads Sydney
  - [ ] Web Design Sydney
  - [ ] Social Media Marketing
  - [ ] Content Marketing
- [ ] Local Pages (48 locations)
- [ ] Power Pages (50 keywords)
- [ ] Static Pages
  - [ ] About
  - [ ] Portfolio
  - [ ] Pricing
  - [ ] Contact
  - [ ] Blog
  - [ ] Legal pages

### Components to Extract
- [ ] Navigation (desktop/mobile)
- [ ] Hero sections (multiple variants)
- [ ] Service cards
- [ ] Testimonial carousel
- [ ] Contact forms
- [ ] Pricing tables
- [ ] FAQ accordions
- [ ] CTA sections
- [ ] Footer links

## 🧪 Testing Strategy

### 1. Visual Regression Testing
```bash
# Install Percy for visual testing
npm install --save-dev @percy/cli @percy/playwright

# Run visual tests
npx percy exec -- playwright test
```

### 2. Performance Testing
```bash
# Lighthouse CI for performance monitoring
npm install --save-dev @lhci/cli

# Run performance tests
npx lhci autorun
```

### 3. SEO Validation
- Maintain exact URL structure
- Validate all meta tags
- Check sitemap generation
- Verify schema markup

## 🚢 Deployment Strategy

### Staged Rollout Plan
1. **Week 1-2**: Development & Testing
   - Complete component migration
   - Test all critical paths
   - Performance optimization

2. **Week 3**: Staging Deployment
   - Deploy to staging.theprofitplatform.com.au
   - Internal team testing
   - Client review

3. **Week 4**: Canary Deployment
   - 10% traffic to new site
   - Monitor metrics
   - Gather feedback

4. **Week 5**: Full Migration
   - 100% traffic migration
   - Monitor for 48 hours
   - Rollback plan ready

## 🎯 Success Metrics

### Performance Targets
- **LCP**: < 2.5s (currently ~4s)
- **FID**: < 100ms (currently ~200ms)
- **CLS**: < 0.1 (currently ~0.2)
- **Lighthouse Score**: 95+ all categories

### Business Metrics
- **Bounce Rate**: -20%
- **Page Load Time**: -50%
- **Conversion Rate**: +15%
- **Development Time**: -80% for new features

## 🔧 Useful Commands

```bash
# Development
cd astro-site && npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run astro check

# Generate sitemap
npm run build # Sitemap auto-generated

# Analyze bundle size
npm run build -- --analyze
```

## 📝 Migration Checklist

- [x] Setup Astro project structure
- [x] Configure build tools and integrations
- [x] Create base layouts and components
- [ ] Build CSS consolidation script
- [ ] Create component extraction utilities
- [ ] Migrate homepage
- [ ] Migrate service pages
- [ ] Migrate local SEO pages
- [ ] Migrate power pages
- [ ] Setup analytics and tracking
- [ ] Configure forms and email
- [ ] Implement performance optimizations
- [ ] Set up testing suite
- [ ] Deploy to staging
- [ ] Run performance audits
- [ ] Execute staged rollout
- [ ] Monitor and optimize

## 🆘 Troubleshooting

### Common Issues and Solutions

1. **Import Errors**
   - Check tsconfig.json path aliases
   - Ensure components are exported correctly

2. **Styling Issues**
   - Verify Tailwind classes are being purged correctly
   - Check for CSS specificity conflicts

3. **Build Errors**
   - Clear cache: `rm -rf dist .astro node_modules/.vite`
   - Reinstall dependencies: `npm ci`

4. **Performance Issues**
   - Enable compression in astro.config.mjs
   - Optimize images with @astrojs/image
   - Implement lazy loading

## 📞 Next Actions

1. **Immediate**: Test the development server
   ```bash
   cd astro-site && npm run dev
   ```

2. **Today**: Start CSS consolidation script

3. **This Week**:
   - Complete component extraction
   - Migrate 5 key pages
   - Set up testing infrastructure

4. **Next Week**:
   - Complete service page migration
   - Begin local/power page automation
   - Deploy to staging

---

**Remember**: The goal is incremental migration. Each page migrated is progress. Focus on high-traffic pages first for maximum impact.
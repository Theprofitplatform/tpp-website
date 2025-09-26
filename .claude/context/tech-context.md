---
created: 2024-09-23
last_updated: 2024-09-23
version: 1.0.0
type: technical-context
---

# Technical Context

## Technology Stack

### Frontend
- **HTML5**: Semantic markup, SEO-optimized structure
- **CSS3**: Consolidated system with critical/component/page separation
- **JavaScript**: ES6+ modules, lazy loading, performance optimized
- **Astro**: 4.x (migration target) with SSG
- **Tailwind CSS**: Utility-first CSS (Astro site)

### Build & Development
- **Vite**: 5.0.0 - Primary build tool
- **PostCSS**: CSS processing pipeline
- **Node.js**: >=18.0.0 requirement
- **NPM**: >=9.0.0 requirement
- **Python**: Migration scripts and automation

### Testing
- **Playwright**: ^1.55.0 - E2E testing
- **Jest**: ^30.1.3 - Unit testing
- **Coverage**: Jest coverage reports

### Code Quality
- **ESLint**: 8.55.0 - JavaScript linting
- **Prettier**: 3.1.0 - Code formatting
- **Autoprefixer**: 10.4.21 - CSS compatibility

### Optimization
- **Terser**: 5.44.0 - JavaScript minification
- **CSSNano**: 7.1.1 - CSS minification
- **PWA Plugin**: 0.17.0 - Progressive web app
- **Compression Plugin**: 0.5.1 - Gzip/Brotli

## Project Structure

```
/website/                    # Production legacy site
  ├── components/           # Extracted UI components
  │   ├── common/          # Shared components
  │   ├── layout/          # Layout components
  │   └── sections/        # Page sections
  ├── css/                 # Consolidated CSS
  │   ├── consolidated/    # Main CSS files
  │   ├── critical/        # Above-fold styles
  │   └── legacy/          # Original styles
  ├── js/                  # JavaScript modules
  │   ├── modules/         # Feature modules
  │   ├── utils/           # Utility functions
  │   └── vendor/          # Third-party
  └── power/              # SEO power pages

/astro-site/               # New Astro migration
  ├── src/
  │   ├── components/     # Astro components
  │   ├── layouts/        # Page layouts
  │   ├── pages/          # Route pages
  │   └── styles/         # Global styles
  └── public/             # Static assets

/src/                      # Additional features
  ├── calculators/        # Interactive tools
  ├── chatbot/           # Chat integration
  ├── seo/               # SEO utilities
  └── tools/             # Various tools

/scripts/                  # Automation scripts
/tests/                    # Test suites
/docs/                     # Documentation
```

## Dependencies

### Production
- **playwright**: 1.55.0 - Browser automation

### Development
- **@playwright/test**: 1.55.0
- **@vitejs/plugin-legacy**: 5.0.0
- **autoprefixer**: 10.4.21
- **cssnano**: 7.1.1
- **eslint**: 8.55.0
- **eslint-config-prettier**: 9.1.0
- **jest**: 30.1.3
- **jest-environment-jsdom**: 30.1.2
- **jsdom**: 27.0.0
- **postcss**: 8.5.6
- **postcss-import**: 15.1.0
- **postcss-preset-env**: 9.3.0
- **prettier**: 3.1.0
- **rollup-plugin-visualizer**: 5.10.0
- **sass**: 1.69.5
- **terser**: 5.44.0
- **vite**: 5.0.0
- **vite-plugin-compression**: 0.5.1
- **vite-plugin-html**: 3.2.0
- **vite-plugin-pwa**: 0.17.0

## Build Configuration

### Vite Config
- Development server with HMR
- Production optimization
- Legacy browser support
- Bundle analysis mode
- PWA manifest generation

### Scripts
```bash
npm run dev              # Start dev server
npm run build           # Production build
npm run preview         # Preview production
npm run test            # Run all tests
npm run lint            # Lint code
npm run format          # Format code
npm run deploy:emergency # Emergency fixes
```

## Environment Requirements
- **Node.js**: >=18.0.0
- **NPM**: >=9.0.0
- **Python**: 3.x (for migration scripts)
- **Git**: Version control
- **Modern browser**: Development

## Browser Support
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile browsers: iOS Safari, Chrome Android
- No IE11 support

## Performance Targets
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Time to Interactive**: <3.5s
- **Cumulative Layout Shift**: <0.1
- **First Input Delay**: <100ms

## Security Considerations
- CSP headers configured
- XSS protection enabled
- HTTPS enforced
- Secure cookie handling
- Input sanitization
- API rate limiting
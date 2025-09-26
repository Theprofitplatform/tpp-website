# The Profit Platform - Full Website

A high-performance, conversion-optimized business consulting website built with modern web technologies.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build assets
npm run build

# Start development server
npm run dev

# Build everything (CSS, JS, Images)
npm run build:all
```

## 📦 Available Scripts

| Command | Description |
|---------|------------|
| `npm run build` | Build CSS and JavaScript files |
| `npm run build:all` | Build everything including images |
| `npm run build:css` | Minify main CSS file |
| `npm run build:critical` | Minify critical CSS |
| `npm run build:js` | Bundle and minify JavaScript |
| `npm run build:images` | Optimize images |
| `npm run build:webp` | Convert images to WebP format |
| `npm run dev` | Build and start local server |
| `npm run test:live` | Run Playwright tests |
| `npm run clean` | Clean build directories |

## 🏗️ Project Structure

```
tpp-full-website/
├── 📄 HTML Pages
│   ├── index.html          # Main homepage
│   ├── about.html          # About/credentials page
│   ├── contact.html        # Contact form page
│   ├── landingpage.html    # High-conversion landing
│   └── landing page 2.html # Alternative landing
│
├── 🎨 css/
│   ├── style.css           # Main styles
│   ├── critical.css        # Above-the-fold CSS
│   └── *.min.css          # Minified versions
│
├── 📜 js/
│   ├── main.js            # Core functionality
│   ├── homepage.js        # Homepage features
│   └── exit-intent.js     # Conversion optimization
│
├── 🖼️ images/
│   └── optimized/         # WebP and optimized images
│
├── ⚙️ config/
│   └── nginx-ssl.conf     # HTTPS server configuration
│
├── 📚 docs/
│   └── PROJECT_OVERVIEW.md # Detailed documentation
│
└── 🧪 tests/
    └── test-live-site.js  # Automated testing
```

## 🌟 Features

### Performance
- ⚡ Critical CSS for fast first paint
- 🖼️ WebP image optimization
- 📦 Minified CSS/JS assets
- 🚀 Resource preloading
- 💨 Gzip compression
- 🔒 30-day cache headers

### SEO & Marketing
- 📊 Structured data markup
- 🏷️ OpenGraph tags
- 🎯 Meta descriptions
- 🔍 Local business schema
- 📱 Mobile-responsive
- ♿ Accessibility features

### Conversion Optimization
- 🎯 Exit intent popups
- ⏰ Countdown timers
- 💬 Floating CTAs
- 📈 Scroll progress tracking
- 🎨 Glassmorphism effects
- ✨ Smooth animations

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Custom Properties), Vanilla JavaScript
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Google Fonts (Inter)
- **Build Tools**: PostCSS, Terser, Sharp, ImageMin
- **Testing**: Playwright
- **Server**: Nginx with HTTP/2 and SSL

## 📋 Development Workflow

### 1. Local Development
```bash
# Start development server
npm run dev
# Opens at http://localhost:8000
```

### 2. Building for Production
```bash
# Build all assets
npm run build:all

# Test the build
npm run test:live
```

### 3. Deployment
```bash
# Copy files to server
scp -r * user@server:/var/www/theprofitplatform/

# Update Nginx configuration
sudo cp config/nginx-ssl.conf /etc/nginx/sites-available/theprofitplatform
sudo nginx -t
sudo systemctl reload nginx
```

## 🔧 Configuration

### SSL/HTTPS Setup
1. Obtain SSL certificate via Let's Encrypt:
```bash
sudo certbot --nginx -d theprofitplatform.com.au -d www.theprofitplatform.com.au
```

2. Use the provided `config/nginx-ssl.conf` for optimal security and performance

### Environment Variables
Create a `.env` file for sensitive data:
```env
GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX
FACEBOOK_PIXEL_ID=XXXXXXXXXXXXXXX
```

## 📈 Performance Metrics

- **Lighthouse Score**: 95+ Performance
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **Total Bundle Size**: < 200KB (minified + gzipped)

## 🚀 Upcoming Improvements

- [ ] Component extraction for reusability
- [ ] CSS consolidation and modularization
- [ ] JavaScript module system
- [ ] Service Worker for offline support
- [ ] Progressive Web App features
- [ ] CMS integration
- [ ] A/B testing framework
- [ ] Advanced analytics tracking

## 📝 License

Proprietary - The Profit Platform © 2025

## 🤝 Support

For issues or questions, contact the development team or check the documentation in `/docs`.

---

**Version**: 1.0.0
**Last Updated**: September 14, 2025
**Status**: Production Ready
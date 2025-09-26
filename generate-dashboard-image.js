#!/usr/bin/env node

// Generate Dashboard Screenshot to replace placeholder
const fs = require('fs');
const path = require('path');

function generateSVGDashboard() {
    return `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4F46E5"/>
            <stop offset="100%" style="stop-color:#6366F1"/>
        </linearGradient>
        <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:rgba(255,255,255,0.2)"/>
            <stop offset="100%" style="stop-color:rgba(255,255,255,0.1)"/>
        </linearGradient>
        <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5"/>
        </filter>
    </defs>

    <!-- Background -->
    <rect width="600" height="400" fill="url(#bg)" rx="12"/>

    <!-- Shadow -->
    <rect x="2" y="2" width="596" height="396" fill="rgba(0,0,0,0.1)" rx="12" filter="url(#blur)"/>

    <!-- Header -->
    <rect x="20" y="20" width="560" height="70" fill="url(#cardBg)" rx="8" opacity="0.9"/>
    <text x="40" y="45" fill="white" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="bold">The Profit Platform Dashboard</text>
    <text x="40" y="65" fill="rgba(255,255,255,0.9)" font-family="Inter, Arial, sans-serif" font-size="14">Real-time campaign performance</text>
    <text x="40" y="80" fill="rgba(255,255,255,0.7)" font-family="Inter, Arial, sans-serif" font-size="12">Last updated: 2 minutes ago</text>

    <!-- Live Status -->
    <circle cx="550" cy="40" r="8" fill="#10B981"/>
    <text x="550" y="45" fill="white" font-family="Inter, Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">LIVE</text>

    <!-- Key Metrics Row -->
    <!-- Weekly Leads -->
    <rect x="20" y="110" width="135" height="85" fill="url(#cardBg)" rx="8"/>
    <text x="35" y="135" fill="white" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="bold">127</text>
    <text x="35" y="155" fill="rgba(255,255,255,0.8)" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600">WEEKLY LEADS</text>
    <text x="35" y="175" fill="#10B981" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600">↗ +310%</text>
    <text x="35" y="188" fill="rgba(255,255,255,0.7)" font-family="Inter, Arial, sans-serif" font-size="10">vs last month</text>

    <!-- Cost Per Lead -->
    <rect x="165" y="110" width="135" height="85" fill="url(#cardBg)" rx="8"/>
    <text x="180" y="135" fill="white" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="bold">$18.90</text>
    <text x="180" y="155" fill="rgba(255,255,255,0.8)" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600">COST PER LEAD</text>
    <text x="180" y="175" fill="#10B981" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600">↘ -67%</text>
    <text x="180" y="188" fill="rgba(255,255,255,0.7)" font-family="Inter, Arial, sans-serif" font-size="10">optimized</text>

    <!-- ROAS -->
    <rect x="310" y="110" width="135" height="85" fill="url(#cardBg)" rx="8"/>
    <text x="325" y="135" fill="white" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="bold">4.2x</text>
    <text x="325" y="155" fill="rgba(255,255,255,0.8)" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600">RETURN ON AD SPEND</text>
    <text x="325" y="175" fill="#10B981" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600">↗ +180%</text>
    <text x="325" y="188" fill="rgba(255,255,255,0.7)" font-family="Inter, Arial, sans-serif" font-size="10">improved</text>

    <!-- Quality Score -->
    <rect x="455" y="110" width="125" height="85" fill="url(#cardBg)" rx="8"/>
    <text x="470" y="135" fill="white" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="bold">89%</text>
    <text x="470" y="155" fill="rgba(255,255,255,0.8)" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600">QUALITY SCORE</text>
    <text x="470" y="175" fill="#10B981" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600">★ Excellent</text>

    <!-- Chart Section -->
    <rect x="20" y="215" width="560" height="150" fill="url(#cardBg)" rx="8"/>
    <text x="40" y="240" fill="white" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="600">Lead Growth Trend (Last 7 Days)</text>

    <!-- Chart Grid -->
    <g stroke="rgba(255,255,255,0.1)" stroke-width="1">
        <line x1="40" y1="260" x2="560" y2="260"/>
        <line x1="40" y1="285" x2="560" y2="285"/>
        <line x1="40" y1="310" x2="560" y2="310"/>
        <line x1="40" y1="335" x2="560" y2="335"/>
    </g>

    <!-- Chart Line -->
    <polyline points="40,335 120,320 200,295 280,275 360,260 440,250 520,245"
              stroke="#10B981" stroke-width="4" fill="none" stroke-linecap="round"/>

    <!-- Chart Fill -->
    <polygon points="40,335 120,320 200,295 280,275 360,260 440,250 520,245 520,335 40,335"
             fill="url(#gradientFill)" opacity="0.3"/>

    <defs>
        <linearGradient id="gradientFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#10B981;stop-opacity:0.4"/>
            <stop offset="100%" style="stop-color:#10B981;stop-opacity:0"/>
        </linearGradient>
    </defs>

    <!-- Chart Data Points -->
    <circle cx="40" cy="335" r="4" fill="#10B981"/>
    <circle cx="120" cy="320" r="4" fill="#10B981"/>
    <circle cx="200" cy="295" r="4" fill="#10B981"/>
    <circle cx="280" cy="275" r="4" fill="#10B981"/>
    <circle cx="360" cy="260" r="4" fill="#10B981"/>
    <circle cx="440" cy="250" r="4" fill="#10B981"/>
    <circle cx="520" cy="245" r="4" fill="#10B981"/>

    <!-- Chart Labels -->
    <text x="40" y="355" fill="rgba(255,255,255,0.7)" font-family="Inter, Arial, sans-serif" font-size="10" text-anchor="middle">Mon</text>
    <text x="120" y="355" fill="rgba(255,255,255,0.7)" font-family="Inter, Arial, sans-serif" font-size="10" text-anchor="middle">Tue</text>
    <text x="200" y="355" fill="rgba(255,255,255,0.7)" font-family="Inter, Arial, sans-serif" font-size="10" text-anchor="middle">Wed</text>
    <text x="280" y="355" fill="rgba(255,255,255,0.7)" font-family="Inter, Arial, sans-serif" font-size="10" text-anchor="middle">Thu</text>
    <text x="360" y="355" fill="rgba(255,255,255,0.7)" font-family="Inter, Arial, sans-serif" font-size="10" text-anchor="middle">Fri</text>
    <text x="440" y="355" fill="rgba(255,255,255,0.7)" font-family="Inter, Arial, sans-serif" font-size="10" text-anchor="middle">Sat</text>
    <text x="520" y="355" fill="rgba(255,255,255,0.7)" font-family="Inter, Arial, sans-serif" font-size="10" text-anchor="middle">Sun</text>

    <!-- Optimization Badge -->
    <rect x="30" y="375" width="120" height="20" fill="rgba(16,185,129,0.2)" rx="10" stroke="#10B981" stroke-width="1"/>
    <text x="90" y="387" fill="#10B981" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600" text-anchor="middle">Auto-Optimizing</text>

    <!-- Performance Badge -->
    <rect x="450" y="375" width="100" height="20" fill="rgba(245,158,11,0.2)" rx="10" stroke="#F59E0B" stroke-width="1"/>
    <text x="500" y="387" fill="#F59E0B" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600" text-anchor="middle">High Performance</text>
</svg>`;
}

function generateDashboardImage() {
    console.log('🎨 Generating professional dashboard image...');

    const svgContent = generateSVGDashboard();
    const outputPath = 'website/images/dashboard-screenshot.svg';

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Write SVG file
    fs.writeFileSync(outputPath, svgContent);

    console.log('✅ Dashboard image generated successfully!');
    console.log(`📁 Saved to: ${outputPath}`);

    return outputPath;
}

// CLI interface
if (require.main === module) {
    try {
        const imagePath = generateDashboardImage();

        console.log('\n🚀 Dashboard Image Generation Complete!');
        console.log('=====================================');
        console.log(`✅ File: ${imagePath}`);
        console.log('📊 Dimensions: 600x400px');
        console.log('🎨 Format: SVG (scalable)');
        console.log('💡 Features: Live metrics, growth chart, professional design');
        console.log('\n🔧 Next step: Replace placeholder in landingpage.html');

    } catch (error) {
        console.error('❌ Error generating dashboard image:', error);
        process.exit(1);
    }
}

module.exports = { generateDashboardImage };
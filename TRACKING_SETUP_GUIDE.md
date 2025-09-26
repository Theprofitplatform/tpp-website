# 📊 TRACKING SETUP GUIDE

## 🎯 Quick Setup

### Option 1: Use the Update Script (Recommended)
```bash
# 1. Edit the script with your IDs
nano update-tracking-ids.sh

# 2. Update these lines with your actual IDs:
GA4_ID="G-YOUR-ACTUAL-ID"
FB_PIXEL_ID="YOUR-ACTUAL-PIXEL"
HOTJAR_ID="YOUR-HOTJAR-ID"
GOOGLE_ADS_ID="AW-YOUR-ADS-ID"

# 3. Run the script
./update-tracking-ids.sh
```

### Option 2: Manual Update with sed
```bash
# Update each ID individually
sed -i "s/id: 'G-XXXXXXXXXX'/id: 'G-YOUR-ACTUAL-ID'/" website/js/tracking-implementation.js
sed -i "s/pixelId: 'XXXXXXXXXX'/pixelId: 'YOUR-FB-PIXEL'/" website/js/tracking-implementation.js
sed -i "s/hjid: 'XXXXXXX'/hjid: 'YOUR-HOTJAR-ID'/" website/js/tracking-implementation.js
sed -i "s/conversionId: 'AW-XXXXXXXXX'/conversionId: 'AW-YOUR-ADS-ID'/" website/js/tracking-implementation.js
```

### Option 3: Direct Edit
```bash
# Open in your preferred editor
vim website/js/tracking-implementation.js
# or
nano website/js/tracking-implementation.js
```

Update these sections:
- **Line 11**: GA4 ID
- **Line 15**: Facebook Pixel ID
- **Line 19**: Hotjar Site ID
- **Line 28**: Google Ads Conversion ID
- **Line 24**: Microsoft Clarity (optional)

---

## 🔍 Where to Find Your IDs

### GA4 (Google Analytics 4)
1. Go to [Google Analytics](https://analytics.google.com)
2. Admin → Data Streams → Your Website
3. Measurement ID starts with `G-`
4. Example: `G-ABCD123456`

### Facebook Pixel
1. Go to [Facebook Business Manager](https://business.facebook.com)
2. Events Manager → Data Sources → Your Pixel
3. Pixel ID is a long number
4. Example: `1234567890123456`

### Hotjar
1. Go to [Hotjar](https://www.hotjar.com)
2. Sites & Organizations → Your Site
3. Site ID is in the tracking code
4. Example: `2741893`

### Google Ads Conversion
1. Go to [Google Ads](https://ads.google.com)
2. Tools → Conversions → Your Conversion
3. Tag setup → Use Google Tag Manager
4. Conversion ID starts with `AW-`
5. Example: `AW-123456789`

### Microsoft Clarity (Optional)
1. Go to [Microsoft Clarity](https://clarity.microsoft.com)
2. Settings → Setup → How to Install
3. Project ID is in the script
4. Example: `abc123def456`

---

## ✅ Verification Steps

### 1. Test in Browser Console
```javascript
// After updating and loading the page, check:
console.log(window.dataLayer);  // Should show GA4 events
console.log(typeof fbq);        // Should be 'function'
console.log(typeof hj);         // Should be 'function'
```

### 2. Use Browser Extensions
- **GA4**: [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger)
- **Facebook**: [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper)
- **General**: [Tag Assistant Legacy](https://chrome.google.com/webstore/detail/tag-assistant-legacy)

### 3. Check Platform Dashboards

#### GA4 Real-Time
1. Open GA4 → Reports → Real-time
2. Visit your website in another tab
3. You should see yourself as active user

#### Facebook Events Manager
1. Open Events Manager → Your Pixel
2. Test Events tab
3. Trigger events on your site
4. Events should appear within seconds

#### Hotjar
1. Open Hotjar dashboard
2. Check "Incoming Data" status
3. Should show "Tracking Active"

#### Google Ads
1. Open Google Ads → Conversions
2. Check conversion tag status
3. Should show "Recording conversions"

---

## 🚨 Troubleshooting

### Events Not Tracking?

1. **Check Console Errors**
```javascript
// Look for errors in browser console
// F12 → Console tab
```

2. **Verify IDs Format**
- GA4: Must start with `G-`
- Facebook: 15-16 digit number
- Hotjar: 7 digit number
- Google Ads: Must start with `AW-`

3. **Clear Cache**
```bash
# Hard refresh in browser
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

4. **Check Ad Blockers**
- Disable ad blockers temporarily
- Use incognito/private mode

5. **Validate Implementation**
```javascript
// Run this in console to test tracking
TPPTracking.trackEvent('test', 'manual_test', 'debug');
```

---

## 📝 Testing Checklist

- [ ] GA4 ID updated and verified in Real-time report
- [ ] Facebook Pixel firing on page view
- [ ] Hotjar recording sessions
- [ ] Form submissions tracking as conversions
- [ ] Phone/email clicks tracking
- [ ] Scroll depth events firing
- [ ] Time on page milestones working
- [ ] External link tracking active

---

## 🚀 Deployment

Once verified locally:

```bash
# 1. Build production
npm run build

# 2. Deploy to staging
rsync -avz dist/ user@staging:/var/www/html/

# 3. Test on staging
# Visit staging site and verify all tracking

# 4. Deploy to production
rsync -avz dist/ user@production:/var/www/html/

# 5. Monitor for 24 hours
# Check all platform dashboards for data flow
```

---

## 📊 Expected Results

Within 24 hours of deployment, you should see:

- **GA4**: User sessions, events, conversions
- **Facebook**: Page views, custom events, audiences building
- **Hotjar**: Session recordings, heatmaps starting
- **Google Ads**: Conversion tracking active
- **Clarity**: User behavior insights (if enabled)

---

## Need Help?

If tracking isn't working after following this guide:

1. Check the browser console for errors
2. Verify IDs are in correct format
3. Ensure scripts aren't blocked by ad blockers
4. Test in incognito mode
5. Review the tracking code in website/js/tracking-implementation.js

The tracking system is comprehensive and will capture:
- All form interactions
- Scroll depth
- Time on page
- Phone/email clicks
- External links
- Custom events
- E-commerce actions

Once properly configured, you'll have complete visibility into user behavior and conversion paths!
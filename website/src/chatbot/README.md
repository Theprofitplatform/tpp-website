# The Profit Platform AI Chatbot System

## Overview

A professional, AI-powered chatbot system designed specifically for The Profit Platform website. This chatbot provides intelligent lead qualification, appointment booking, service recommendations, and comprehensive analytics tracking.

## Features

### ✨ Core Features
- **AI-Powered Conversations** - Smart responses based on user intent
- **Lead Qualification System** - Automated scoring and qualification
- **Appointment Booking** - Integrated consultation scheduling
- **Service Recommendations** - Personalized service suggestions
- **FAQ Automation** - Intelligent answers to common questions
- **File Upload Support** - Accept documents and images
- **Mobile-Responsive Design** - Optimized for all devices
- **Analytics Integration** - Comprehensive interaction tracking

### 🎨 Design Features
- **Professional Branding** - Matches The Profit Platform style
- **Floating Widget** - Unobtrusive but accessible
- **Modern UI/UX** - Clean, professional interface
- **Dark/Light Mode** - Automatic theme detection
- **Accessibility** - WCAG 2.1 compliant
- **Smooth Animations** - Professional interactions

### 🚀 Advanced Features
- **Context Awareness** - Remembers conversation history
- **Lead Scoring** - Automatic qualification scoring
- **Progressive Profiling** - Builds user profiles over time
- **Offline Support** - Works without internet connection
- **Multi-language Ready** - Easy localization support

## Installation

### Option 1: Direct Integration (Recommended)

Add this single line to your HTML pages before the closing `</body>` tag:

```html
<script src="/src/chatbot/integration.js"></script>
```

### Option 2: Custom Integration

```html
<!-- Load Font Awesome for icons -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- Load chatbot styles -->
<link rel="stylesheet" href="/src/chatbot/chatbot.css">

<!-- Load chatbot HTML structure -->
<!-- Include chatbot.html content or create container -->

<!-- Load chatbot functionality -->
<script src="/src/chatbot/chatbot.js"></script>
```

### Option 3: Configuration with Options

```javascript
<script>
// Configure before loading
window.TPPChatbot = {
    config: {
        position: 'bottom-right',
        primaryColor: '#4F46E5',
        autoOpen: false,
        enableAnalytics: true,
        appointmentEndpoint: '/api/appointments'
    }
};
</script>
<script src="/src/chatbot/integration.js"></script>
```

## Configuration Options

```javascript
const config = {
    // Behavior
    autoOpen: false,                    // Auto-open on page load
    autoOpenDelay: 0,                   // Delay before auto-open (ms)
    showNotificationAfter: 10000,       // Notification badge delay (ms)
    proactiveMessageDelay: 30000,       // Proactive message delay (ms)

    // Appearance
    position: 'bottom-right',           // Widget position
    theme: 'default',                   // Theme: default, dark, custom
    primaryColor: '#4F46E5',           // Brand color

    // Features
    enableFileUpload: true,             // File attachment support
    enableQuickActions: true,           // Quick action buttons
    enableTypingIndicator: true,        // Typing animation
    enableSounds: false,                // Sound notifications

    // API Integration
    enableAnalytics: true,              // Analytics tracking
    analyticsEndpoint: '/api/analytics', // Analytics API
    appointmentEndpoint: '/api/appointments', // Booking API
    chatEndpoint: '/api/chat',          // Chat API (future)
};
```

## API Integration

### Appointment Booking Endpoint

The chatbot sends appointment data to your specified endpoint:

```javascript
// POST /api/appointments
{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+61 400 000 000",
    "company": "Example Corp",
    "service": "seo",
    "date": "2024-12-01",
    "time": "10:00",
    "message": "Looking to improve our SEO rankings",
    "source": "chatbot",
    "session_id": "session_12345",
    "lead_score": 15,
    "page_url": "https://theprofitplatform.com.au/seo",
    "user_agent": "Mozilla/5.0...",
    "timestamp": "2024-11-20T10:30:00Z"
}
```

### Analytics Endpoint

Track all chatbot interactions:

```javascript
// POST /api/chatbot-analytics
{
    "event": "message_sent",
    "timestamp": "2024-11-20T10:30:00Z",
    "session_id": "session_12345",
    "user_id": "user_67890",
    "properties": {
        "message_type": "user",
        "content_length": 25,
        "conversation_length": 5,
        "user_stage": "qualified",
        "lead_score": 15
    },
    "page_url": "https://theprofitplatform.com.au/services",
    "page_title": "Our Services - The Profit Platform"
}
```

## Customization

### Custom Branding

```css
:root {
    --chatbot-primary-color: #your-color;
    --chatbot-secondary-color: #your-secondary;
    --chatbot-font-family: 'Your Font', sans-serif;
}
```

### Custom Messages

Modify the knowledge base in `chatbot.js`:

```javascript
this.knowledgeBase = {
    services: {
        yourService: {
            name: 'Your Service Name',
            description: 'Service description',
            benefits: ['Benefit 1', 'Benefit 2'],
            pricing: 'Starting from $999',
            timeline: '2-4 weeks'
        }
    },
    responses: {
        greetings: [
            'Your custom greeting message'
        ]
    }
};
```

## Lead Qualification System

The chatbot automatically scores leads based on:

- **Business Size** (1-5 points)
- **Budget Range** (1-5 points)
- **Urgency Level** (1-5 points)
- **Current Marketing** (2-4 points)

### Scoring Rules:
- **15+ points**: High-value lead (Premium package recommendation)
- **10-14 points**: Medium-value lead (Standard package)
- **5-9 points**: Entry-level lead (Starter package)

## Analytics Events

The system tracks these events:

- `chatbot_initialized` - Chatbot loaded
- `chat_opened` - User opens chat
- `chat_closed` - User closes chat
- `message_sent` - User sends message
- `bot_response` - Bot responds
- `quick_action_clicked` - Quick button clicked
- `qualification_answer` - Lead qualification response
- `recommendation_provided` - Service recommendation given
- `appointment_modal_opened` - Booking modal opened
- `appointment_booked` - Consultation booked
- `file_uploaded` - File attachment uploaded

## Mobile Optimization

- **Touch-Friendly** - Large tap targets (44px minimum)
- **Responsive Design** - Adapts to screen sizes
- **Gesture Support** - Swipe to close on mobile
- **Keyboard Handling** - Virtual keyboard aware
- **Performance Optimized** - Lazy loading assets

## Accessibility Features

- **WCAG 2.1 AA Compliant** - Full accessibility support
- **Keyboard Navigation** - Tab and arrow key support
- **Screen Reader Support** - ARIA labels and descriptions
- **High Contrast Mode** - Automatic contrast adjustment
- **Reduced Motion** - Respects user preferences
- **Focus Management** - Proper focus handling

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement**: Graceful degradation for older browsers

## Performance

- **Lazy Loading** - Assets loaded on demand
- **Code Splitting** - Modular architecture
- **Caching** - Efficient asset caching
- **Compression** - Minified production builds
- **CDN Ready** - Optimized for CDN delivery

## Security Features

- **Input Sanitization** - XSS protection
- **File Upload Validation** - Safe file handling
- **Rate Limiting** - Abuse prevention
- **HTTPS Only** - Secure communication
- **Data Privacy** - GDPR compliant

## Testing

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Performance testing
npm run test:performance
```

## Deployment

### Production Build

```bash
npm run build
```

### Files to Deploy:
- `/src/chatbot/integration.js` (main script)
- `/src/chatbot/chatbot.css` (styles)
- `/src/chatbot/chatbot.js` (functionality)

## Troubleshooting

### Common Issues:

1. **Chatbot not appearing**
   - Check console for errors
   - Verify Font Awesome is loaded
   - Ensure integration.js is loaded

2. **Styling issues**
   - Check CSS conflicts
   - Verify custom colors are valid
   - Check z-index conflicts

3. **API integration failing**
   - Verify endpoint URLs
   - Check CORS settings
   - Validate request format

### Debug Mode:

```javascript
window.TPPChatbot.config.debug = true;
```

## Support

For technical support or customization requests:
- Email: support@theprofitplatform.com.au
- Documentation: [Link to full docs]
- GitHub Issues: [Repository link]

## Changelog

### v1.0.0 (Current)
- Initial release
- Full chatbot functionality
- Lead qualification system
- Appointment booking
- Analytics integration
- Mobile optimization
- Accessibility compliance

## License

Copyright © 2024 The Profit Platform. All rights reserved.

---

**Built with ❤️ for The Profit Platform**
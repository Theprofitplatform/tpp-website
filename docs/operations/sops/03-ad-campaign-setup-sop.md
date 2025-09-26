# Standard Operating Procedure: Ad Campaign Setup
**The Profit Platform - Google Ads & PPC Campaign Management**

## Document Control
- **Version:** 2.0
- **Last Updated:** [Date]
- **Owner:** PPC Team Lead
- **Review Cycle:** Quarterly
- **Approval:** Director

---

## 1. Purpose & Scope

### Purpose
Establish standardized procedures for setting up, managing, and optimizing paid advertising campaigns that deliver maximum ROI for clients.

### Scope
This SOP covers:
- Google Ads (Search, Display, Shopping, YouTube)
- Microsoft Advertising (Bing Ads)
- Facebook/Instagram Ads
- LinkedIn Ads
- Remarketing campaigns
- Local Service Ads

### Key Performance Indicators
- Return on Ad Spend (ROAS)
- Cost Per Acquisition (CPA)
- Click-Through Rate (CTR)
- Quality Score
- Conversion Rate
- Impression Share

---

## 2. Pre-Campaign Setup

### 2.1 Client Discovery
**Timeline: Day 1-2**

#### Business Intelligence Gathering
- [ ] Business goals and objectives
- [ ] Target audience demographics
- [ ] Customer journey mapping
- [ ] Unique selling propositions
- [ ] Competitor landscape
- [ ] Budget expectations
- [ ] Conversion goals
- [ ] Seasonal considerations

#### Access Requirements
- [ ] Google Ads account access
- [ ] Google Analytics access
- [ ] Google Tag Manager access
- [ ] Website CMS access
- [ ] Google Business Profile
- [ ] Facebook Business Manager
- [ ] Previous campaign data

#### Account Audit (If Existing)
- [ ] Account structure review
- [ ] Historical performance analysis
- [ ] Wasted spend identification
- [ ] Quality Score assessment
- [ ] Conversion tracking audit
- [ ] Negative keyword lists
- [ ] Ad scheduling analysis
- [ ] Geographic performance

### 2.2 Market Research
**Timeline: Day 3-4**

#### Competitive Analysis
```
Competitor Research Checklist:
□ Top 5 competitors identified
□ Ad copy analysis
□ Landing page review
□ Offer comparison
□ Ad extensions used
□ Estimated budgets
□ Keyword strategies
□ Seasonal patterns
```

#### Keyword Research
1. **Research Sources**
   - Google Keyword Planner
   - Search term reports
   - Google Trends
   - Answer the Public
   - Competitor keywords
   - Google Autocomplete
   - Related searches

2. **Keyword Categorization**
   ```
   High Intent: "buy", "price", "quote", "near me"
   Research: "best", "review", "compare", "vs"
   Informational: "how to", "what is", "guide"
   Brand: Company names, product names
   Competitor: Competitor brand terms
   ```

3. **Keyword Metrics**
   - Search volume
   - Competition level
   - Cost per click (CPC)
   - Commercial intent
   - Seasonality
   - Local volume

### 2.3 Budget Planning
**Timeline: Day 5**

#### Budget Allocation Framework
```
Budget Distribution:
- Search Campaigns: 60-70%
- Display/Remarketing: 15-20%
- Shopping (if applicable): 10-15%
- Testing/Experimentation: 5-10%
```

#### Budget Calculation
| Metric | Formula | Example |
|--------|---------|---------|
| Daily Budget | Monthly Budget / 30.4 | $3,000 / 30.4 = $98/day |
| Target CPA | Revenue per Sale × Margin % | $500 × 30% = $150 |
| Required Clicks | Monthly Goal / Conversion Rate | 50 sales / 2% = 2,500 clicks |
| Required Budget | Required Clicks × Avg CPC | 2,500 × $2 = $5,000 |

---

## 3. Google Ads Campaign Setup

### 3.1 Account Structure
**Timeline: Day 6-7**

#### Naming Convention
```
Campaign: [Type] - [Product/Service] - [Location] - [Match]
Example: Search - Plumbing - Sydney - Exact

Ad Group: [Theme] - [Match Type]
Example: Emergency Plumber - Exact

Ads: [Test Variable] - [Version]
Example: CTA Test - A
```

#### Campaign Structure Template
```
Account
├── Search Campaigns
│   ├── Brand Campaign
│   │   └── Brand Terms (Exact)
│   ├── Generic Campaign
│   │   ├── Service 1 (Exact)
│   │   ├── Service 1 (Phrase)
│   │   └── Service 1 (Broad)
│   └── Competitor Campaign
│       └── Competitor Names
├── Display Campaigns
│   ├── Remarketing
│   └── Similar Audiences
└── Shopping Campaigns (if applicable)
    ├── All Products
    └── Top Sellers
```

### 3.2 Search Campaign Setup
**Timeline: Day 8-10**

#### Campaign Settings
- [ ] Campaign name
- [ ] Campaign type: Search
- [ ] Networks: Google Search (exclude partners initially)
- [ ] Locations: Specific targeting
- [ ] Languages: Target languages
- [ ] Budget: Daily budget
- [ ] Bidding: Start with Manual CPC
- [ ] Ad rotation: Rotate evenly
- [ ] Ad schedule: Business hours initially
- [ ] Start/end dates

#### Ad Group Creation
- [ ] 15-20 keywords per ad group
- [ ] Tightly themed keywords
- [ ] Single match type per ad group
- [ ] Starting bid: 20% above suggested
- [ ] Ad group level URLs

#### Keyword Implementation
```
Match Type Strategy:
- Exact Match [keyword]: High bids, best converting
- Phrase Match "keyword": Medium bids, broader reach
- Broad Match Modified +keyword: Lower bids, discovery
- Negative Keywords: -keyword
```

#### Ad Copy Creation
**Responsive Search Ads (RSAs)**
```
Headlines (15 unique):
- Include keywords (3-4)
- Benefits/features (3-4)
- Call to action (2-3)
- Unique selling points (2-3)
- Local/trust signals (2-3)

Descriptions (4 unique):
- Value proposition
- Social proof
- Urgency/scarcity
- Clear CTA
```

**Ad Copy Formula**
```
Headline 1: {Keyword} | Primary Benefit
Headline 2: Location/Trust Signal
Headline 3: Call to Action

Description 1: Expand on benefit + social proof
Description 2: Unique offer + urgency + CTA
```

#### Ad Extensions Setup
- [ ] Sitelink extensions (min 4)
- [ ] Callout extensions (min 4)
- [ ] Call extension
- [ ] Location extension
- [ ] Structured snippets
- [ ] Price extensions
- [ ] Promotion extensions
- [ ] Lead form extensions

### 3.3 Display Campaign Setup
**Timeline: Day 11-12**

#### Remarketing Setup
1. **Audience Creation**
   - All website visitors (30 days)
   - Product viewers (14 days)
   - Cart abandoners (7 days)
   - Past converters (540 days)
   - Engaged users (time on site > 60s)

2. **Campaign Settings**
   - Conservative targeting
   - Frequency capping: 5/day
   - Responsive display ads
   - Dynamic remarketing (if applicable)

#### Display Targeting Options
- [ ] Managed placements
- [ ] Topics targeting
- [ ] Interest targeting
- [ ] Demographic targeting
- [ ] Similar audiences
- [ ] Custom intent audiences

### 3.4 Shopping Campaign Setup
**Timeline: Day 13-14**

#### Merchant Center Setup
- [ ] Account creation
- [ ] Website verification
- [ ] Product feed creation
- [ ] Feed optimization
- [ ] Shipping settings
- [ ] Tax settings
- [ ] Product approval

#### Shopping Campaign Structure
```
Priority Structure:
High Priority - Brand queries (low bids)
Medium Priority - Generic queries (medium bids)
Low Priority - All products (high bids)
```

### 3.5 Video Campaign Setup
**Timeline: Day 15**

#### YouTube Campaign Types
- [ ] TrueView In-Stream
- [ ] TrueView Discovery
- [ ] Bumper ads
- [ ] Non-skippable in-stream

#### Video Ad Requirements
- Aspect ratios: 16:9, 9:16, 1:1
- Length: 6s (bumper), 15-30s (optimal)
- CTA overlay
- Companion banner
- End screens

---

## 4. Conversion Tracking Setup

### 4.1 Google Tag Manager Implementation
**Timeline: Day 16-17**

#### Container Setup
- [ ] GTM container creation
- [ ] Container installation
- [ ] Debug mode testing
- [ ] Version control

#### Essential Tags
- [ ] Google Ads conversion tag
- [ ] Google Analytics 4
- [ ] Remarketing tag
- [ ] Phone call tracking
- [ ] Form submission tracking
- [ ] Enhanced conversions

#### Trigger Configuration
```javascript
// Form Submit Trigger
Trigger Type: Form Submission
Wait for Tags: Yes
Max wait time: 2000ms
Check Validation: Yes

// Phone Click Trigger
Trigger Type: Click - All Elements
Click Text: matches RegEx: (call|phone|tel:)

// Scroll Depth Trigger
Trigger Type: Scroll Depth
Percentages: 25, 50, 75, 100
```

### 4.2 Conversion Actions
**Timeline: Day 18**

#### Primary Conversions
- [ ] Purchase/Lead form
- [ ] Phone calls (from ads)
- [ ] Phone calls (from website)
- [ ] App downloads
- [ ] Store visits

#### Micro-Conversions
- [ ] Newsletter signup
- [ ] PDF downloads
- [ ] Video views (50%+)
- [ ] Key page visits
- [ ] Chat initiations

#### Conversion Settings
- Count: One vs Every
- Conversion window: 30-90 days
- View-through window: 1 day
- Attribution model: Data-driven
- Value: Dynamic or static

---

## 5. Landing Page Optimization

### 5.1 Landing Page Requirements
**Timeline: Day 19-20**

#### Essential Elements
- [ ] Headline matches ad copy
- [ ] Clear value proposition
- [ ] Trust signals/testimonials
- [ ] Strong CTA above fold
- [ ] Mobile responsive
- [ ] Fast load time (<3s)
- [ ] Conversion form
- [ ] Privacy policy link

#### Landing Page Template
```html
<header>
  - Logo
  - Phone number
  - Trust badges
</header>

<hero>
  - Headline (match ad)
  - Subheadline (benefit)
  - Hero image/video
  - Primary CTA
</hero>

<benefits>
  - 3-5 key benefits
  - Icons/visuals
  - Supporting data
</benefits>

<social-proof>
  - Testimonials
  - Reviews
  - Case studies
  - Logos
</social-proof>

<offer>
  - Special offer
  - Urgency/scarcity
  - Form or CTA
</offer>

<footer>
  - Contact info
  - Privacy/Terms
  - Trust signals
</footer>
```

### 5.2 A/B Testing Framework
**Timeline: Ongoing**

#### Testing Elements Priority
1. Headlines (highest impact)
2. CTA buttons (color, text, position)
3. Form fields (number, type)
4. Images/videos
5. Social proof placement
6. Offer presentation
7. Page layout

#### Testing Protocol
- Test one element at a time
- Run for statistical significance
- Minimum 2 weeks
- Document results
- Implement winners
- Continue testing

---

## 6. Campaign Launch

### 6.1 Pre-Launch Checklist
**Timeline: Day 21**

#### Technical Verification
- [ ] Conversion tracking tested
- [ ] Landing pages tested
- [ ] Forms working
- [ ] Phone tracking active
- [ ] Billing verified
- [ ] Budget caps set
- [ ] Negative keywords added
- [ ] Ad schedules configured

#### Content Review
- [ ] Ad copy approved
- [ ] Landing pages approved
- [ ] Extensions approved
- [ ] Compliance checked
- [ ] Trademark verification
- [ ] Disclaimers added

### 6.2 Launch Protocol
**Timeline: Day 22**

#### Soft Launch Strategy
1. Start with 50% budget
2. Limited geography
3. Conservative bids
4. Manual monitoring
5. 48-hour review
6. Scale gradually

#### Launch Day Monitoring
- Every hour for first 4 hours
- Check impressions/clicks
- Monitor spend rate
- Review search terms
- Check conversion tracking
- Adjust bids if needed

---

## 7. Campaign Optimization

### 7.1 Daily Optimizations
**Time: 15-30 minutes**

#### Daily Checklist
- [ ] Budget pacing
- [ ] Anomaly detection
- [ ] Search term review
- [ ] Negative keyword additions
- [ ] Bid adjustments
- [ ] Paused poor performers

### 7.2 Weekly Optimizations
**Time: 2-3 hours**

#### Weekly Tasks
- [ ] Performance analysis
- [ ] Ad testing review
- [ ] Bid strategy evaluation
- [ ] Audience performance
- [ ] Device performance
- [ ] Geographic analysis
- [ ] Ad schedule optimization
- [ ] Competition monitoring

### 7.3 Monthly Optimizations
**Time: 4-5 hours**

#### Monthly Deep Dive
- [ ] Full account audit
- [ ] Conversion path analysis
- [ ] Landing page testing
- [ ] Budget reallocation
- [ ] New campaign opportunities
- [ ] Seasonal adjustments
- [ ] Competitive analysis
- [ ] Client reporting

### 7.4 Optimization Strategies

#### Quality Score Improvement
```
Factors & Optimization:
1. Expected CTR (35%)
   - Test ad copy
   - Add extensions
   - Improve relevance

2. Ad Relevance (35%)
   - Tighter ad groups
   - Include keywords in ads
   - Match user intent

3. Landing Page Experience (30%)
   - Improve load speed
   - Mobile optimization
   - Relevant content
```

#### Bid Management Strategy
| Scenario | Action |
|----------|--------|
| High converting, low impression share | Increase bids 15-20% |
| Low converting, high cost | Decrease bids 10-15% |
| Good conversion, good cost | Maintain, test +5% |
| No conversions after 50 clicks | Pause and review |

---

## 8. Facebook/Instagram Ads Setup

### 8.1 Business Manager Setup
**Timeline: Day 1**

#### Account Structure
- [ ] Business Manager creation
- [ ] Ad account setup
- [ ] Pixel installation
- [ ] Custom audiences
- [ ] Page connections
- [ ] Instagram connection
- [ ] Payment method

### 8.2 Campaign Structure
```
Campaign Level: Objective
├── Awareness
├── Consideration
└── Conversion

Ad Set Level: Targeting
├── Interests
├── Behaviors
├── Demographics
└── Custom Audiences

Ad Level: Creative
├── Images
├── Videos
├── Carousels
└── Collections
```

### 8.3 Audience Creation

#### Custom Audiences
- Website visitors
- Customer lists
- App activity
- Offline activity
- Engagement audiences

#### Lookalike Audiences
- 1% similarity (highest quality)
- 2-5% (balanced)
- 6-10% (broad reach)
- Value-based lookalikes
- Multi-country lookalikes

### 8.4 Ad Creative Best Practices

#### Image Specifications
- Size: 1200 x 628px (feed)
- Size: 1080 x 1080px (square)
- Size: 1080 x 1920px (stories)
- Text: <20% of image
- Format: JPG or PNG

#### Video Specifications
- Length: 15 seconds optimal
- Aspect: 1:1, 4:5, 16:9
- Captions: Always include
- Thumbnail: Custom
- File size: <4GB

---

## 9. Reporting & Analysis

### 9.1 Reporting Framework

#### KPI Dashboard
```
Primary Metrics:
- Conversions
- Cost per conversion
- Conversion rate
- ROAS
- Click-through rate
- Quality Score

Secondary Metrics:
- Impressions
- Clicks
- Cost per click
- Impression share
- Average position
- Bounce rate
```

### 9.2 Client Reporting Template

#### Monthly Report Structure
1. **Executive Summary**
   - Key achievements
   - Total conversions
   - Total spend
   - ROAS
   - Month-over-month change

2. **Campaign Performance**
   - By campaign type
   - By product/service
   - By geography
   - By device

3. **Optimization Actions**
   - Tests conducted
   - Changes implemented
   - Results achieved

4. **Recommendations**
   - Budget adjustments
   - New opportunities
   - Testing roadmap

5. **Next Month Focus**
   - Planned optimizations
   - Testing schedule
   - Expected outcomes

### 9.3 Performance Analysis

#### Conversion Path Analysis
- First touch attribution
- Last touch attribution
- Data-driven attribution
- Time lag analysis
- Path length analysis

#### Cohort Analysis
- New vs returning
- Device paths
- Geographic patterns
- Seasonal trends
- Day/time patterns

---

## 10. Compliance & Best Practices

### 10.1 Advertising Policies

#### Google Ads Policies
- [ ] Prohibited content
- [ ] Prohibited practices
- [ ] Restricted content
- [ ] Editorial requirements
- [ ] Trademark usage
- [ ] Healthcare regulations
- [ ] Financial services
- [ ] Political content

#### Facebook Policies
- [ ] Community standards
- [ ] Advertising policies
- [ ] Restricted categories
- [ ] Special ad categories
- [ ] Data use policies

### 10.2 Industry Compliance

#### Healthcare/Medical
- No misleading claims
- Disclaimer requirements
- Certification verification
- HIPAA compliance

#### Financial Services
- APR disclosure
- Terms and conditions
- Regulatory compliance
- Risk disclaimers

#### Legal Services
- Bar association rules
- Disclaimer requirements
- Geographic restrictions
- Solicitation rules

---

## 11. Troubleshooting Guide

### 11.1 Common Issues & Solutions

#### Low Impressions
1. Increase bids
2. Broaden targeting
3. Add keywords
4. Check ad approval
5. Review budget
6. Expand locations

#### Low CTR
1. Test new ad copy
2. Add extensions
3. Improve ad relevance
4. Refine targeting
5. Test different CTAs
6. Review search terms

#### High CPC
1. Improve Quality Score
2. Add negative keywords
3. Refine match types
4. Test landing pages
5. Adjust bid strategy
6. Review competition

#### Low Conversion Rate
1. Landing page optimization
2. Offer improvement
3. Form simplification
4. Trust signals
5. Page speed
6. Mobile experience

### 11.2 Account Suspensions

#### Immediate Actions
1. Don't create new accounts
2. Review violation notice
3. Identify issue
4. Fix violations
5. Submit appeal
6. Document everything

#### Prevention
- Regular policy reviews
- Compliance checks
- Clean landing pages
- Accurate business info
- Proper disclaimers

---

## 12. Advanced Strategies

### 12.1 Automation & Scripts

#### Google Ads Scripts
```javascript
// Pause low performing keywords
function pauseLowPerformers() {
  var keywordIterator = AdWordsApp.keywords()
    .withCondition('Clicks > 50')
    .withCondition('Conversions = 0')
    .get();

  while (keywordIterator.hasNext()) {
    var keyword = keywordIterator.next();
    keyword.pause();
  }
}
```

### 12.2 Machine Learning Integration

#### Smart Bidding Strategies
- Target CPA (when >30 conversions/month)
- Target ROAS (for e-commerce)
- Maximize conversions
- Maximize conversion value
- Enhanced CPC (transitional)

#### Automated Rules
- Pause ads with low CTR
- Increase bids for top performers
- Adjust budgets based on performance
- Schedule based on patterns
- Alert for anomalies

---

## 13. Team Collaboration

### 13.1 Roles & Responsibilities

| Role | Responsibilities |
|------|-----------------|
| PPC Manager | Strategy, optimization, reporting |
| Account Manager | Client communication, strategy |
| PPC Specialist | Daily management, optimization |
| Designer | Ad creative, landing pages |
| Developer | Tracking, technical implementation |
| Copywriter | Ad copy, landing page content |

### 13.2 Communication Protocols

#### Internal Communication
- Daily huddles
- Weekly optimization meetings
- Monthly strategy reviews
- Slack for quick updates
- Documentation in shared drives

#### Client Communication
- Weekly email updates
- Monthly calls
- Quarterly business reviews
- 24-hour response time
- Escalation procedures

---

## 14. Tools & Resources

### 14.1 Essential Tools

| Tool | Purpose | Cost |
|------|---------|------|
| Google Ads Editor | Bulk editing | Free |
| Google Analytics | Analytics | Free |
| Optmyzr | Automation | $249+/mo |
| SpyFu | Competitor research | $39+/mo |
| Unbounce | Landing pages | $90+/mo |
| CallRail | Call tracking | $45+/mo |

### 14.2 Learning Resources
- Google Skillshop
- Facebook Blueprint
- PPC Hero blog
- Search Engine Land
- Google Ads Community
- PPCChat on Twitter

---

## Appendices

### A. Templates
- Campaign build checklist
- Ad copy templates
- Landing page templates
- Report templates
- Script library

### B. Quick Reference
- Bid adjustment limits
- Character limits
- Image specifications
- Policy quick guide
- Keyboard shortcuts

### C. Emergency Contacts
- Google Ads Support: 1-866-246-6453
- Facebook Support: Via Business Manager
- Team escalation chart
- Client emergency contacts

---

**Document Sign-off**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Director | | | |
| PPC Lead | | | |
| QA Manager | | | |

---

*The Profit Platform - PPC Excellence*
*This SOP is proprietary and confidential*
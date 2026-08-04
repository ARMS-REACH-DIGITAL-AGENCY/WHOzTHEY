# WHOzTHEY? Sponsorship Monetization Strategy

**Executive Summary and Planning Source Document**  
Prepared for: Pete DeLuca / ARMS REACH Digital Agency  
Purpose: Source document for strategy review, NotebookLM analysis, RedTeam critique, visual explainers, debate prompts, and future implementation planning.

---

## 1. Executive Snapshot

WHOzTHEY? is more than a curiosity website. It is the first visible consumer-facing expression of a broader ARMS REACH Digital Agency strategy: create interactive content platforms that generate attention, capture behavioral intent, and turn that attention into managed HighLevel/ARMS campaigns for sponsors, local businesses, national advertisers, affiliate offers, and future owned brands such as YATSTATS and H2YO!.

The core insight is simple:

> People naturally repeat and react to claims that begin with “They say...”

Examples:

- “They say an apple a day keeps the doctor away.”
- “They say this is the best pizza in town.”
- “They say Hamilton High School produces next-level baseball players.”
- “They say golfers can travel without worrying about their clubs.”

WHOzTHEY? turns that universal phrase into an interactive experience. Visitors ask, “Who’s they?” and the site traces the origin, source, debate, cultural spread, and credibility behind the claim.

The sponsor opportunity comes from the same psychology. Sponsors can create curiosity-driven claims that make visitors want to click. Once a visitor asks “WHOzTHEY?”, the sponsor’s approved story, offer, coupon, lead form, checkout, booking page, or website becomes the answer.

This strategy positions WHOzTHEY? as both:

1. A consumer curiosity platform.
2. A business development engine for ARMS REACH Digital Agency and its managed campaign services.

---

## 2. Why the Earlier Sponsor Builder Missed the Mark

The first sponsor-builder prototype was useful as a shell, but not as a real product. It made several incorrect assumptions:

1. It assumed sponsors already understood WHOzTHEY?.
2. It assumed sponsors would answer a full form before seeing value.
3. It used overly cute language such as “YerTHEY,” “YerHook,” and “They Hooks.”
4. It did not mirror the actual WHOzTHEY? interface.
5. It did not properly deliver a website-first experience.
6. It did not sufficiently show the sponsor how the visitor would experience the hook.
7. It did not properly distinguish between an organic AI claim result and a paid sponsor-controlled result.

The corrected product direction is to teach the premise first, let sponsors experience WHOzTHEY? as consumers, then help them imagine their business as the answer to a WHOzTHEY? question.

---

## 3. Correct Sponsor Education Sequence

Potential sponsors will usually not know what WHOzTHEY? means. The sponsor funnel must not begin by asking them whether they want to sponsor a platform they do not understand.

The correct education sequence is:

1. Explain the “They say...” phenomenon.
2. Explain what WHOzTHEY? does for visitors.
3. Explain the psychology of curiosity.
4. Let the sponsor test-drive WHOzTHEY? as a consumer.
5. Encourage the sponsor to type a claim about their own business.
6. Explain the difference between an organic AI result and a sponsor-controlled campaign.
7. Invite them to enter their website and generate a sponsor campaign.
8. Capture their lead information.
9. Generate the sponsor campaign.
10. Recommend a package, checkout, or human follow-up.

The earlier thinking skipped too quickly to step 7 or 8. The new funnel must start at step 1.

---

## 4. The Sponsor Test-Drive Moment

The sponsor should be encouraged to experience WHOzTHEY? before being sold.

Suggested flow:

1. “Try WHOzTHEY? as a visitor.”
2. The user types a familiar claim.
3. The user sees how the platform analyzes it.
4. Then the page says: “Now try one about your business.”

Example for a restaurant:

> They say Barro’s Pizza in Chandler has the best pizza in town.

Example for Travel Protection Club:

> They say Travel Protection Club helps golfers travel with less stress.

Example for Sina’s Creations:

> They say Sina’s Creations makes one-of-a-kind glass gifts people remember.

This creates the same impulse as Googling yourself or checking Yelp reviews. The sponsor starts wondering:

- What would WHOzTHEY? say about my business?
- What claims could I create?
- What would people click?
- Can I control the answer?

That is the bridge to sponsorship.

---

## 5. Organic Result vs. Sponsor-Controlled Result

This distinction must be clear.

### Free WHOzTHEY? Result

The free result is AI-generated, neutral, exploratory, and based on the claim. It helps visitors understand where a claim came from and who might be behind it.

### Sponsor Campaign Result

The sponsor campaign is controlled by the advertiser. The sponsor chooses or approves the hook, story, offer, CTA, coupon, form, landing page, booking link, checkout path, or website destination.

Plain-language distinction:

> The free result shows what WHOzTHEY? says about a claim. A sponsor campaign lets you control what visitors see after they click.

This is the sponsor value proposition.

---

## 6. Simplified Sponsor Language

The naming should become more traditional and less cute.

### Use

- Sponsor Hook
- Sponsor Story
- Sponsor Offer
- Sponsor Campaign
- Campaign Builder
- Website Scan
- Campaign Preview
- Sponsored Claim
- Sponsored Answer

### Avoid

- YerTHEY
- YerHook
- YerStory
- YerOffer
- They Hooks

The concept remains: the sponsor becomes the answer to a WHOzTHEY? question. The language should be clear enough for business owners who are not already insiders.

---

## 7. Website-First Sponsor Builder

Most potential sponsors will not complete a long intake form. They will enter a website and expect the system to do the work.

The first sponsor-builder step should be:

> Enter your website.

The AI should then attempt to:

1. Read the sponsor website.
2. Identify what the business sells.
3. Infer the likely audience.
4. Infer the likely customer pain, desire, or opportunity.
5. Infer likely campaign goals.
6. Generate sponsor hook options.
7. Generate story angles.
8. Generate offer ideas.
9. Recommend a page structure.
10. Recommend the best package.
11. Ask verification questions.

The sponsor should then see:

> We looked at your website. It looks like you sell X to Y. Is that right?

That creates confidence and lowers friction.

---

## 8. Voice Prompt Feature

Voice input should be added as an optional accelerator during the refinement step.

A sponsor may explain the business better out loud than through typed fields.

Suggested UI:

> Tell us anything we got wrong or anything else we should know.  
> Type or tap the mic to speak.

The system should transcribe the voice response, append it to the sponsor context, and regenerate better hooks, story angles, offers, and campaign recommendations.

MVP version:

- Browser speech recognition if available.
- Text fallback if voice is not supported.

More robust future version:

- Record audio.
- Send audio to a server transcription endpoint.
- Feed transcript into the sponsor campaign AI.

---

## 9. Sponsor Funnel and ARMS/GHL Follow-Up

The sponsor builder should not be a standalone tool with no follow-up. It must connect to ARMS/GHL so ARMS REACH Digital Agency can build relationships and recover abandoned sponsor leads.

Minimum sponsor lead capture:

- Name
- Email
- Phone optional
- Website
- Business summary
- Generated hooks
- Selected campaign direction
- Recommended package
- Funnel stage reached
- Abandon point
- Last activity date

Suggested sponsor pipeline stages:

1. New sponsor lead
2. Website analyzed
3. Campaign generated
4. Refinement started
5. Package viewed
6. Checkout started
7. Payment completed
8. Needs human follow-up
9. Lost / nurture

Suggested automation:

- If website entered but no package selected: send the generated preview.
- If hooks generated but no purchase: send the top three hooks.
- If package viewed but no checkout: create a follow-up task.
- If AI confidence is low: ask one clarifying question.
- If sponsor asks for help: route to human call.

This is the ARMS REACH advantage: automation relationship management, not just a clever website.

---

## 10. WHOzTHEY? Interface Alignment

The sponsor builder should visually resemble WHOzTHEY?. It should not look like a disconnected SaaS page.

Suggested layout:

- WHOzTHEY-style header.
- Central search/prompt box.
- Input changes from claim search to website input.
- Result area uses familiar tabs.
- Footer shows the sponsor-hook preview exactly where sponsor hooks would appear in the consumer app.

Suggested sponsor tabs:

- Website
- Hooks
- Story
- Offer
- Page
- Package

This helps the sponsor understand the placement experience:

> This is where my message appears. This is what the visitor clicks. This is what the visitor sees next.

---

## 11. Local vs. National Sponsorships

WHOzTHEY? is broad and potentially international. YATSTATS is hyper-local by design.

This matters because a local HVAC company, realtor, dentist, restaurant, or gym should not pay for exposure to people outside its service area unless the campaign is designed for brand awareness rather than direct response.

Sponsor placement types:

### National / Online Sponsor

Best for:

- Travel Protection Club
- ShipSticks-style offers
- Online products
- Ecommerce
- Courses
- Affiliate offers
- Memberships

Targeting:

- Broad WHOzTHEY? audience
- Contextual categories
- Search intent

### Local / Geo Sponsor

Best for:

- Realtors
- HVAC
- Restaurants
- Dentists
- Gyms
- Estate planners
- Local services

Targeting:

- City
- Metro area
- ZIP code
- Radius
- Approximate IP location
- User-declared location
- Claim context

### YATSTATS School/Community Sponsor

Best for:

- Businesses serving a high-school community
- Booster-style advertisers
- Local sponsors near a school
- Player/family/alumni networks

Targeting:

- School microsite
- High school audience
- Local sports community

WHOzTHEY? and YATSTATS can share the same sponsor campaign engine but use different placement logic.

---

## 12. Contextual Sponsor Matching

The long-term ad engine should serve sponsor messages based on what people are curious about.

When a user searches a claim, the system should classify it by:

- Topic
- Location signal
- Commercial intent
- Sensitivity level
- Possible sponsor category
- Platform crossover potential

Example:

A query about high school baseball could be tagged:

- sports
- baseball
- high school
- Hamilton
- Arizona
- YATSTATS

Then WHOzTHEY? could show a YATSTATS sponsor hook or route the visitor to a YATSTATS microsite.

Example:

A query about food could trigger restaurant, recipe, grocery, nutrition, or local dining sponsors.

Example:

A query about home ownership could trigger realtor, lender, HVAC, insurance, or home-service sponsors.

This turns WHOzTHEY? searches into intent signals.

---

## 13. Logged-In Users, Circles, Games, and Data

The B2C side of WHOzTHEY? can grow beyond simple searches into logged-in engagement.

Possible features:

- Voting on whether a claim sounds right.
- Commenting on claims.
- Joining circles.
- Family WHOzTHEY? night.
- Ladies’ group debates.
- Group chat or debate rooms.
- Saved claims.
- Personalized history.
- Topic-based badges.
- Group games and scoring.

Why users would log in:

- To vote.
- To comment.
- To debate.
- To join a group circle.
- To play games.
- To save searches.
- To compare opinions.

This creates first-party data.

That data can help target sponsor messages by interest, topic, circle, geography, and behavior — with privacy controls and appropriate disclosures.

---

## 14. Current WHOzTHEY? Data Capture Already Present in Code

A review of the current repository shows that WHOzTHEY? is already capturing more than just anonymous searches.

Current search logging appears to capture:

- Claim text
- Normalized claim
- Search count
- First searched timestamp
- Last searched timestamp
- Session ID
- Firebase UID if available
- Verdict
- Who-is-they response
- Origin response
- Source
- User agent
- An IP-derived placeholder/fingerprint style value

Visitor tracking appears to capture:

- Session ID
- Firebase UID
- Email
- Display name
- Persona
- Source

Voting appears to capture:

- Claim ID
- Vote layer
- Vote value
- Session ID
- Firebase UID

Comments appear to capture:

- Claim ID
- Parent comment ID
- Session ID
- Firebase UID
- Display name
- Comment body

Sponsor tracking appears to capture:

- Sponsor card ID
- Session ID
- Firebase UID
- Placement
- Destination URL
- Impressions
- Clicks

This means the foundation for intent-based sponsor targeting already exists, but the system still needs a formal classification layer, sponsor matching logic, privacy rules, and reporting.

---

## 15. Privacy and Trust Guardrails

WHOzTHEY? should use first-party behavioral data carefully.

Avoid promising sponsors:

> We will give you the names of everyone who searched your topic.

Safer promise:

> We can place your sponsor message near relevant searches, topics, locations, and audience segments while protecting individual user privacy.

Sponsor reporting should begin with aggregate metrics:

- Impressions
- Clicks
- Claim categories
- General geography
- Conversion events
- Campaign stage
- Package viewed
- Lead captured

Sensitive topics should not be targeted aggressively.

Examples of sensitive areas:

- Medical conditions
- Legal issues
- Financial hardship
- Domestic violence
- Addiction
- Children/teens
- Religion
- Politics
- Precise location

For those, the platform should use broad, generic, public-service, or no sponsor messaging unless clear consent and policy rules are in place.

---

## 16. ARMS REACH Digital Agency Positioning

ARMS REACH Digital Agency is not just building websites. It is building interconnected attention-and-automation platforms.

WHOzTHEY? exists to demonstrate a new kind of AI-powered advertising product:

- Curiosity-driven hooks
- AI-assisted story generation
- Sponsor-controlled landing experiences
- Automated follow-up
- HighLevel/ARMS-managed CRM campaigns
- Retargeting and nurture
- Cross-platform audience activation

WHOzTHEY? should help ARMS REACH sell managed HighLevel/ARMS solutions to businesses looking for better ROI than traditional ads, boosted posts, or generic landing pages.

The agency promise:

> We do not just run ads. We build curiosity engines, capture intent, and automate the follow-up until interest becomes action.

---

## 17. Platform Ecosystem Strategy

Every ARMS REACH / PCD platform should be interwoven.

### WHOzTHEY?

Broad curiosity engine. Captures claims, opinions, debates, search topics, and sponsor intent.

### YATSTATS

Hyper-local school sports hub. Captures local sports audiences, alumni, families, boosters, players, and local businesses.

### H2YO!

Potential water/health/wellness or lifestyle platform. Could use the same sponsor engine for topic-driven and behavior-driven campaigns.

### Travel Protection Club / Benefit Buddies

Offer-specific funnel engine. Uses sponsor hooks, story, offer, checkout, and follow-up automation.

### Two Bloops and a Blast

Podcast/content layer for YATSTATS, baseball stories, player features, sponsor placements, and local/national crossover content.

The shared engine:

1. Website scan
2. Hook generation
3. Story generation
4. Offer generation
5. Landing page builder
6. Lead capture
7. CRM automation
8. Stripe checkout
9. Sponsor placement
10. Reporting
11. Retargeting

The placement logic changes by platform, but the campaign engine can be shared.

---

## 18. Sponsor Product Ladder

### 1. Click-Through Sponsor Hook

For sponsors who already have a website, video, product page, or booking link.

Includes:

- Sponsor hook
- Placement
- Click tracking
- Destination URL

### 2. Story + Lead Capture Campaign

For sponsors who need names, emails, phone numbers, coupons, or booking leads.

Includes:

- Hook
- Sponsor story page
- Lead form
- Basic reporting

### 3. Follow-Up Automation Campaign

For sponsors who need nurture after the lead.

Includes:

- Hook
- Story page
- Lead form
- Email/SMS follow-up
- ARMS/GHL pipeline

### 4. Online Checkout Campaign

For sponsors who sell memberships, products, tickets, donations, or digital offers.

Includes:

- Hook
- Story page
- Offer page
- Stripe checkout
- Confirmation flow

### 5. Full Funnel Campaign

For sponsors who want ARMS REACH to handle strategy, landing page, CRM, follow-up, checkout, and reporting.

### 6. Website / Funnel Build

For sponsors who do not have a usable web presence or need a better campaign destination.

---

## 19. Immediate Implementation Priorities

### Priority 1: Rebuild Sponsor UX

- Drop “YerTHEY” language.
- Rename route to `/sponsors` or `/sponsor-builder`.
- Make the page look like WHOzTHEY?.
- Start with “They say...” education.
- Add consumer test-drive.
- Add business self-claim test.
- Then transition to sponsor-controlled campaign.

### Priority 2: Website-First AI

- Website URL must be enough to produce a first impression.
- AI should infer business, audience, story, offer, and campaign angle.
- AI should ask verification questions after making assumptions.

### Priority 3: Lead Capture / ARMS Integration

- Capture contact info before or immediately after the website scan.
- Send abandoned sponsor leads to ARMS/GHL.
- Track stage reached and last activity.

### Priority 4: Contextual Sponsor Matching

- Classify each search by topic, intent, and location signals.
- Match sponsor hooks to query categories.
- Add fallback sponsor rules.

### Priority 5: Cross-Platform Sponsor Engine

- Reuse the sponsor engine for WHOzTHEY?, YATSTATS, H2YO!, Travel Protection Club, and future ARMS REACH platforms.

---

## 20. RedTeam Questions for NotebookLM

Use these to pressure-test the idea:

1. Is WHOzTHEY? understandable quickly enough for a cold sponsor?
2. Does the sponsor funnel create value before asking for money?
3. Is the consumer test-drive compelling or distracting?
4. Is the sponsor hook model too close to clickbait, or does the story/offer payoff make it legitimate?
5. Can local advertisers get enough value from a broad platform like WHOzTHEY?, or should they be routed to YATSTATS-style local placements?
6. What privacy risks emerge from query-based sponsor targeting?
7. What should users consent to before personalized sponsor targeting begins?
8. Are circles and group debate features core to monetization or a later distraction?
9. Does the campaign builder need voice input at MVP or later?
10. What is the simplest package a sponsor would buy after one website scan?
11. What proof does ARMS REACH need to convince sponsors this works?
12. Should the first paying sponsors be national, local, or owned brands?
13. What is the minimum viable analytics report sponsors will trust?
14. Is ARMS/GHL integration a must-have before selling, or can it follow the first pilot?
15. What legal/disclosure language is required for sponsor-controlled answers?

---

## 21. Visual Diagram: Funnel

```text
Cold traffic / outreach / social ad
        ↓
Sponsor landing page explains “They say...”
        ↓
Visitor test-drives WHOzTHEY? as a consumer
        ↓
Sponsor tests a claim about their own business
        ↓
Page explains organic result vs sponsor-controlled result
        ↓
Sponsor enters website and contact info
        ↓
AI scans website and infers business/audience/offer
        ↓
Sponsor verifies/refines by typing or voice
        ↓
AI generates hook/story/offer/page/package
        ↓
Sponsor buys, books call, or enters ARMS/GHL nurture
```

---

## 22. Visual Diagram: Shared ARMS REACH Engine

```text
WHOzTHEY?      YATSTATS      H2YO!      TPC / Benefit Buddies
    \             |            |              /
     \            |            |             /
      └──── Shared Campaign Engine ────┘
                    ↓
        Website scan / AI strategy
                    ↓
        Hook / Story / Offer / Page
                    ↓
        Lead capture / CRM / Checkout
                    ↓
        ARMS/GHL follow-up automation
                    ↓
        Reporting / retargeting / upsells
```

---

## 23. Visual Diagram: Sponsor Matching Engine

```text
User claim/search
      ↓
AI classifies topic, location, intent, sensitivity
      ↓
Match against active sponsor campaigns
      ↓
Filter by geography, platform, category, circle, fallback rules
      ↓
Show best sponsor hook
      ↓
Track impression, click, lead, conversion
      ↓
Report aggregate performance to sponsor
```

---

## 24. Core Strategic Thesis

WHOzTHEY? is not simply a content site or a novelty AI search tool.

It is a prototype for a larger ARMS REACH Digital Agency operating system:

> Use curiosity to capture attention.  
> Use AI to turn attention into a campaign.  
> Use CRM automation to turn campaigns into relationships.  
> Use interconnected platforms to place the right sponsor message in front of the right audience at the right moment.

That is the monetization strategy.

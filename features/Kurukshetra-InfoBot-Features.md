# Kurukshetra InfoBot — Feature Documentation


---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture Summary](#2-architecture-summary)
3. [Entry Points (Webhooks)](#3-entry-points-webhooks)
4. [Dual-Mode Intelligent Cache System](#4-dual-mode-intelligent-cache-system)
5. [Query Classification Engine](#5-query-classification-engine)
6. [Tourism Query Pipeline](#6-tourism-query-pipeline)
7. [General Query Pipeline](#7-general-query-pipeline)
8. [AI Response Generation](#8-ai-response-generation)
9. [Web Scraping Engine](#9-web-scraping-engine)
10. [SerpAPI Load Balancing](#10-serpapi-load-balancing)
11. [AskGita Mode (IGM Gita Channel)](#11-askgita-mode-igm-gita-channel)
12. [Feedback & Response ID System](#12-feedback--response-id-system)
13. [Analytics & Logging](#13-analytics--logging)
14. [Google Sheets Integration](#14-google-sheets-integration)
15. [Device & Location Tracking](#15-device--location-tracking)
16. [Node Inventory](#16-node-inventory)

---

## 1. Overview

Kurukshetra InfoBot is a production-grade n8n automation workflow that powers an AI chatbot for Kurukshetra district. It serves two distinct use cases through two separate channels:

- **InfoBot Channel** (`/chat` webhook) — Answers general district queries: tourism, heritage sites, demographics, government officials, emergency contacts, and local information. Uses a web search + scrape + AI pipeline to fetch fresh, authoritative data from official government websites.

- **AskGita Channel** (`/InfoBot_AskGita` webhook) — A dedicated spiritual assistant focused on Bhagavad Gita (all 18 chapters), IGM 2025 programme, and Kurukshetra's 48 Kos sacred sites. Answers in the user's chosen language.

Both channels share a common intelligent caching system backed by Google Sheets to avoid redundant AI calls and serve repeated questions instantly.

---

## 2. Architecture Summary

The workflow follows a layered intelligence approach:

```
User Query
    │
    ▼
[Cache Check] ──► Cache Hit ──► Instant Reply (no AI cost)
    │
    ▼ Cache Miss
[Query Classifier]
    │
    ├──► Tourism Query ──► [3-Source SerpAPI Search] ──► [Smart Scraper] ──► [Groq AI]
    │
    └──► General Query ──► [SerpAPI Search] ──► [Smart Scraper / AI Fallback] ──► [Groq AI]
                                                                                       │
                                                                                       ▼
                                                                            [Feedback Link Added]
                                                                                       │
                                                                                       ▼
                                                                            [Analytics Logged]
                                                                                       │
                                                                                       ▼
                                                                            [Response to User]
```

---

## 3. Entry Points (Webhooks)

The bot exposes three webhook endpoints, each serving a different purpose:

### 3.1 Main InfoBot Webhook — `/chat` (POST)
- Primary entry point for all general Kurukshetra queries
- Accepts: `question`, `language`, `deviceType`, `browser`, `latitude`, `longitude`
- Triggers the full search + scrape + AI pipeline

### 3.2 AskGita Webhook — `/InfoBot_AskGita` (POST)
- Dedicated channel for Bhagavad Gita and IGM 2025 queries
- Accepts: `question`, `language`
- Connects directly to the Gita-specific Groq AI prompt (bypasses web search)

### 3.3 Feedback Webhook — `/InfoBot_Feed` (POST)
- Receives user feedback ratings for individual responses
- Logs feedback against `response_id` to Google Sheets
- Enables quality tracking per response

---

## 4. Dual-Mode Intelligent Cache System

One of the bot's most important performance features. Both channels maintain their own cache in Google Sheets. Before any AI or search call is made, the cache is checked.

### How it works

1. The bot reads all previous Q&A logs from Google Sheets
2. The `Search Cache for Similar Questions` code node performs **fuzzy/semantic matching** — not just exact matching — against previously answered questions
3. If a sufficiently similar question is found, the cached answer is returned immediately
4. If no match is found, the full AI + search pipeline is triggered

### Benefits
- Eliminates redundant Groq API calls for frequently asked questions
- Dramatically reduces response time for repeated queries
- Reduces SerpAPI quota consumption
- Two independent caches: one for InfoBot (`/chat`), one for AskGita (`/InfoBot_AskGita`)

### Cache Miss Handling
- If Google Sheets returns an empty response (first-time use or empty sheet), the system gracefully falls through to the full pipeline — no errors thrown

---

## 5. Query Classification Engine

After a cache miss, every incoming query passes through a multi-stage classification system before search or AI is invoked.

### 5.1 Tourism Detection — `Check_Tourism_Query`

Detects whether the query is about Kurukshetra's tourism, heritage, or pilgrimage sites using an extensive keyword list:

**English keywords detected:** tourist, tourism, temple, mandir, tirath, tirtha, pilgrimage, museum, archaeological, heritage, sacred, holy, site, visit, sightseeing, brahma, sarovar, jyotisar, sthaneshwar, ban ganga, sannihit, karna, bhishma, kund, sheikh chilli, kalpana chawla, planetarium, panorama, university, and many more specific site names

**Hindi keywords detected:** Transliterated forms of the above, plus native Hindi terms for temples, ponds, and pilgrimages

**Additional classification flags set:**
- `isBroadTourism` — true if asking for a general list of tourist places (not one specific site)
- `perspective` — visitor, pilgrim, student, or general
- `isPrivateBusiness` — true if asking about private shops, gyms, salons, restaurants (routed differently)

### 5.2 Smart Query Enhancer — `Smart_Query_Enhancer`

For non-tourism queries, this node enriches the search query with context-aware keywords:

**Query categories detected and enhanced:**
- `person` — "who is DC / SDM / SP / MLA / MP / Minister / Tehsildar / SHO / Mayor" — adds "Kurukshetra Haryana 2024" context
- `demographic` — population, census, sex ratio, literacy rate — adds census data keywords
- `emergency` — helpline, ambulance, police, fire — hardcodes to emergency contact database
- `general` — everything else — adds "Kurukshetra Haryana official" suffix

This ensures SerpAPI returns highly relevant results for the specific query type, rather than generic results.

---

## 6. Tourism Query Pipeline

When a query is classified as tourism-related, a dedicated 3-source parallel search is triggered.

### 6.1 SerpAPI Key Selection — `Select_SerpAPI_Key`

Before any search, a round-robin key selector picks from a pool of SerpAPI keys using timestamp-based rotation. This distributes API quota across multiple accounts to avoid rate limit exhaustion.

### 6.2 Three-Source Tourism Search

Three simultaneous SerpAPI searches are fired, each targeting a specific authoritative source:

| Node | Target | Purpose |
|---|---|---|
| `Search_KKRTour` | kkrtour.com | Primary tourism portal for Kurukshetra |
| `Search_Govt_Tourism` | kurukshetra.gov.in | Official district government website |
| `Search_Haryana_Tourism` | haryanatourism.gov.in | State tourism board |

### 6.3 Smart Link Merging — `Merge_Tourism_Links`

Results from all three sources are merged with a strict priority order:

**Priority:** kkrtour.com > kurukshetra.gov.in > haryanatourism.gov.in

Special handling:
- **48 Kos sites** — if the query matches a site from the 48 Kos yatra circuit, a tertiary link to `48koskurukshetra.com` is selected as the scraping target (this site has richer content for these specific sites)
- **Broad tourism queries** (e.g., "list all tourist places") — returns an aggregate summary link rather than a single site
- `primaryLink`, `secondaryLink`, and `tertiaryLink` are passed forward for the scraper to use

---

## 7. General Query Pipeline

For non-tourism queries, a separate but similarly structured pipeline handles search and scraping.

### 7.1 SerpAPI Key Selection — `Select_SerpAPI_Key1`

Same round-robin key rotation as the tourism pipeline, with its own separate node to allow independent configuration.

### 7.2 General Web Search — `Search_Regular`

Single SerpAPI call, but with the enhanced query from `Smart_Query_Enhancer`. The search is targeted to official Kurukshetra/Haryana government sources.

**Demographic query special routing:** If `queryCategory === 'demographic'`, the search result is overridden with a hardcoded link to the Kurukshetra "know-about" census page, ensuring accurate population data is retrieved instead of random web results.

### 7.3 Result Formatting — `Format_Regular`

Cleans and normalises the SerpAPI `organic_results` array into a standardised format (`link`, `noResults`, `queryCategory`) for downstream processing.

### 7.4 Private Business Query Routing — `Code in JavaScript2`

If `isPrivateBusiness` is true (e.g., "best restaurant in Kurukshetra", "gym near me"), the system skips the official website scraping entirely and routes directly to the Groq AI fallback. The AI is prompted to respond with Google Maps and JustDial links rather than attempting to answer from scraped government content.

---

## 8. AI Response Generation

The bot uses **Groq API with Llama 3.3 70B Versatile** as its AI backbone. Three distinct AI configurations are used depending on the situation.

### 8.1 InfoBot AI — `AI_Statistics_Generator1` & `AI_Statistics_Generator2`

**Primary AI (`AI_Statistics_Generator1`)** — Used when the scraper successfully extracts content from a website. The scraped text is sent as context to Groq, which synthesises a natural-language answer.

**Fallback AI (`AI_Statistics_Generator2`)** — Used when scraping fails or no results are found. The system prompt is more elaborate:
- Detects query type from keywords (private business, emergency, tourism, demographic, person)
- Provides response templates for each category
- For private businesses: directs users to Google Maps and JustDial
- For emergencies: provides hardcoded emergency numbers
- For persons (DC, SP, MLA etc.): provides formatted official directory responses
- Responds in the user's requested language

### 8.2 Response Cleaning — `Code in JavaScript1`

After the AI generates a response, this node strips any malformed HTML tags that may appear inside URLs in the AI output — a common issue when AI includes hyperlinks in formatted text.

### 8.3 AskGita AI — `Groq (Llama 3)`

Dedicated Groq call with a focused system prompt:
- Identity: "AskGita — AI scholar for International Gita Mahotsav 2025"
- Scope: Bhagavad Gita (chapters 1–18), Kurukshetra 48 Kos sites, IGM 2025 programme
- Constraint: Never provides legal or medical advice
- Language: Responds in the language specified by the user
- Model: `llama-3.3-70b-versatile`

---

## 9. Web Scraping Engine

The scraping subsystem retrieves actual content from official websites to give the AI real, up-to-date information rather than relying on training data alone.

### 9.1 URL Validation — `Filter Valid URLs`

Before scraping, this node validates the incoming URL:
- Handles two cases: a direct `link` field, or an `organic_results` array from SerpAPI
- If already marked `noResults: true` with no link, passes through without scraping
- Extracts the best available URL for scraping

### 9.2 Smart Scraper with Retry — `Smart Scraper with Retry`

The core scraping node with several intelligent features:

- **48 Kos special handling** — if `is48Kos` flag is set, scrapes the `tertiaryLink` (48koskurukshetra.com) instead of the primary link, as it has richer content
- **SSL tolerance** — uses relaxed SSL settings to handle government websites with certificate issues
- **Timeout** — 15 second timeout per scrape attempt
- **User-Agent spoofing** — sends a browser-like User-Agent header to avoid bot blocks
- Returns `success: true/false` flag for downstream branching

### 9.3 Scrape Success Check — `Check Scrape Success`

Routes based on scrape outcome:
- **Success** → `HTML Extract` → `Extract_Demographic_Data` → AI with context
- **Failure** → Directly to `AI_Statistics_Generator2` (fallback AI without web context)

### 9.4 HTML Text Extraction — `HTML Extract`

Strips HTML tags from the scraped page and extracts plain text content for feeding to the AI.

### 9.5 Smart Content Extraction — `Code in JavaScript`

A sophisticated extraction layer on top of the raw HTML text:

- Searches for specific content markers within the scraped text (e.g., "One of the seven forests", "This tirtha is located", "Kamyak Tirtha Kamoda")
- If a content marker is found, extracts a targeted window of text around it (up to 3,000 characters of the most relevant section) while also including the first 1,500 characters for context
- This "smart extraction" ensures the AI receives the most relevant part of a webpage rather than the entire scraped content, improving response quality and reducing token usage

### 9.6 Demographic Data Extractor — `Extract_Demographic_Data`

Specialised extractor that runs only on demographic queries:
- Parses scraped census text for specific data fields: population, sex ratio, literacy rate, population density, growth rate
- Uses pattern matching to extract numeric values from unstructured text
- Passes structured demographic data to the AI prompt for accurate, citation-ready responses

---

## 10. SerpAPI Load Balancing

Both the tourism and general pipelines use an API key rotation system to maximise uptime and distribute quota usage.

### `Select_SerpAPI_Key` / `Select_SerpAPI_Key1`

- Maintains a pool of SerpAPI API keys from multiple accounts
- Uses `Date.now() % keys.length` timestamp-based round-robin selection
- Throws a clear error if the key pool is empty (safety check)
- Accounts in the pool include keys from different registered users
- Easy to add or remove keys without changing workflow logic

---

## 11. AskGita Mode (IGM Gita Channel)

A fully separate sub-workflow within the same n8n workflow, dedicated to the International Gita Mahotsav context.

### Flow

```
/InfoBot_AskGita (POST)
    │
    ▼
Read IGM Saathi Logs (Google Sheets cache)
    │
    ▼
Search Cache for Similar Questions (fuzzy match)
    │
    ├──► Cache Hit ──► Edit Fields ──► Append Log ──► Add Feedback Link ──► Respond
    │
    └──► Cache Miss ──► Wait (brief) ──► Extract Question & Device Info
                                               │
                                               ▼
                                        Groq (Llama 3) — AskGita Prompt
                                               │
                                               ▼
                                        Edit Fields (extract answer)
                                               │
                                               ▼
                                        Generate Response ID
                                               │
                                               ▼
                                        Append Log to Sheet
                                               │
                                               ▼
                                        Add Feedback Link
                                               │
                                               ▼
                                        Respond to Webhook
```

### Wait Node
A brief wait is introduced before calling Groq in the AskGita path. This prevents thundering herd issues if multiple users ask at the same time and the cache misses simultaneously.

### Device & Browser Metadata
The `Code in JavaScript3` node extracts and forwards: `question`, `language`, `deviceType`, `browser`, `latitude`, `longitude` — enabling device-aware analytics for the AskGita channel.

---

## 12. Feedback & Response ID System

Every AI-generated response (not cache hits) receives a unique ID and a feedback link before being sent to the user.

### Response ID Generation — `Generate_Response_ID` / `Generate_Response_ID3`

- Generates a unique ID: `{Date.now()}_{random7chars}` (e.g., `1776327351_k3x9mzp`)
- Appended to the response payload as `response_id`
- Used as the key for feedback tracking

### Feedback Link Injection — `Add_Feedback_Text` / `Add_Feedback_Text1`

After the response is prepared, a feedback section is appended to the bottom of every reply:

```
───────────────
📊 Help us improve!
Share your feedback: https://script.google.com/macros/s/.../exec?id={response_id}
```

- The feedback URL points to a Google Apps Script web app
- The `response_id` is URL-encoded to prevent link breakage
- Both `reply`, `response`, and `answer` fields are updated simultaneously (for compatibility with different response field names used across the two channels)
- The original response text is preserved in `original_reply` for reference

### Feedback Data Flow
When a user clicks the feedback link, the Google Apps Script records their rating and maps it back to the `response_id`, allowing per-response quality analysis in Google Sheets.

---

## 13. Analytics & Logging

Every query and response — whether served from cache or freshly generated — is logged to Google Sheets for analytics.

### Data Logged Per Interaction

| Field | Description |
|---|---|
| `timestamp` | ISO timestamp of the query |
| `question` / `message` | The user's original query |
| `language` | Language of the query (en/hi/etc.) |
| `response_id` | Unique ID for this response |
| `deviceType` | Mobile, Desktop, Tablet |
| `browser` | Browser name from User-Agent |
| `sourceLink` | URL of the website scraped for the answer |
| `queryCategory` | Classified type: tourism, demographic, person, general, emergency |
| `aiResponse` | The full text of the AI-generated answer |
| `cached` | Whether this was served from cache (true/false) |

### Analytics Nodes — `Prepare Analytics Data` / `Prepare Analytics Data1`

Two parallel analytics preparation nodes serve the two channels. They collect data from multiple upstream nodes (`Smart_Query_Enhancer`, `Code in JavaScript2`, the AI response nodes) and normalise it into a single flat object for Google Sheets appending.

### Google Sheets Log Destinations

| Sheet | Contents |
|---|---|
| `Append row in sheet` | InfoBot general query logs |
| `Append row in sheet1` | AskGita cache-miss logs |
| `Append row in sheet2` | InfoBot secondary logs |
| `Append row in sheet3` | AskGita cache-hit logs |

---

## 14. Google Sheets Integration

Google Sheets serves as the primary database and logging backend for the entire workflow. No separate database server is needed.

### Sheets Used

| Sheet Role | Node | Description |
|---|---|---|
| InfoBot Cache / Log | `Read IGM Saathi Logs` | Reads all past Q&A for cache matching |
| AskGita Cache / Log | `Read IGM Saathi Logs1` | Reads AskGita-specific past Q&A |
| Feedback Collection | `Google Sheets` (via Webhook1) | Receives and stores user feedback ratings |
| Analytics Log (InfoBot) | Multiple `Append row` nodes | Writes complete interaction records |
| Analytics Log (AskGita) | Multiple `Append row` nodes | Writes AskGita interaction records |

### Why Google Sheets as DB

- No additional infrastructure required
- Easy to view, filter, and export data
- Supports the feedback Google Apps Script integration
- Compatible with the government environment where external databases may not be available
- Data can be directly used for reports and presentations

---

## 15. Device & Location Tracking

The bot captures device metadata passed by the frontend widget for analytics and potential personalisation.

### Fields Captured

| Field | Example Values | Purpose |
|---|---|---|
| `deviceType` | Mobile, Desktop, Tablet | Usage pattern analysis |
| `browser` | Chrome, Firefox, Safari | Compatibility monitoring |
| `latitude` | 29.9695 | User location (optional) |
| `longitude` | 76.8783 | User location (optional) |
| `language` | en, hi, pa | Response language selection |

These fields are extracted in `Code in JavaScript3` (AskGita) and passed directly through the webhook body in the InfoBot channel.

Language is passed to the Groq AI system prompt, ensuring the AI responds in the user's preferred language — a key feature for multilingual usability in a district with Hindi, Punjabi, and English speakers.

---

## 16. Node Inventory

Complete list of all 52 nodes in the workflow:

| # | Node Name | Type | Purpose |
|---|---|---|---|
| 1 | Webhook | Webhook | InfoBot entry point (/chat) |
| 2 | 1. Set Mock Input | Webhook | AskGita entry point (/InfoBot_AskGita) |
| 3 | Webhook1 | Webhook | Feedback receiver (/InfoBot_Feed) |
| 4 | Read IGM Saathi Logs | Google Sheets | Read InfoBot cache |
| 5 | Read IGM Saathi Logs1 | Google Sheets | Read AskGita cache |
| 6 | Search Cache for Similar Questions | Code | InfoBot fuzzy cache search |
| 7 | Search Cache for Similar Questions1 | Code | AskGita fuzzy cache search |
| 8 | Is Answer Cached? | IF | InfoBot cache branch |
| 9 | Is Answer Cached?1 | IF | AskGita cache branch |
| 10 | Check_Tourism_Query | Code | Detect tourism vs general query |
| 11 | Is_Tourism_Query | IF | Route to tourism or general pipeline |
| 12 | Smart_Query_Enhancer | Code | Enrich query with context keywords |
| 13 | Select_SerpAPI_Key | Code | Tourism pipeline key rotation |
| 14 | Select_SerpAPI_Key1 | Code | General pipeline key rotation |
| 15 | Search_KKRTour | HTTP Request | Search kkrtour.com |
| 16 | Search_Govt_Tourism | HTTP Request | Search kurukshetra.gov.in |
| 17 | Search_Haryana_Tourism | HTTP Request | Search haryanatourism.gov.in |
| 18 | Merge_Tourism_Links | Code | Merge 3-source results with priority |
| 19 | Search_Regular | HTTP Request | General SerpAPI search |
| 20 | Format_Regular | Code | Format general search results |
| 21 | Merge_All_Paths | Merge | Combine tourism and general paths |
| 22 | Code in JavaScript2 | Code | Private business routing + person queries |
| 23 | Filter Valid URLs | Code | Validate URL before scraping |
| 24 | If | IF | Route: scrape vs AI fallback |
| 25 | Smart Scraper with Retry | Code | Fetch and scrape website content |
| 26 | Check Scrape Success | IF | Route: success vs failure |
| 27 | HTML Extract | HTML | Extract plain text from HTML |
| 28 | Extract_Demographic_Data | Code | Parse census data from scraped text |
| 29 | Code in JavaScript | Code | Smart content extraction from scraped text |
| 30 | AI_Statistics_Generator1 | HTTP Request | Groq AI — with scraped context |
| 31 | AI_Statistics_Generator2 | HTTP Request | Groq AI — fallback (no web context) |
| 32 | Code in JavaScript1 | Code | Clean HTML artifacts from AI response |
| 33 | Generate_Response_ID | Code | Generate unique response ID |
| 34 | Prepare Analytics Data | Code | Compile analytics record (InfoBot) |
| 35 | Add_Feedback_Text | Code | Append feedback link to response |
| 36 | Respond_To_Webhook1 | Respond to Webhook | Send InfoBot response |
| 37 | Wait1 | Wait | Brief delay before AskGita AI call |
| 38 | Code in JavaScript3 | Code | Extract question + device info (AskGita) |
| 39 | Groq (Llama 3) | HTTP Request | AskGita dedicated AI call |
| 40 | Edit_Fieldsanswer | Set | Extract answer from Groq response |
| 41 | Edit Fields2 | Set | Set timestamp and question fields |
| 42 | Generate_Response_ID3 | Code | Generate response ID (AskGita) |
| 43 | Append row in sheet1 | Google Sheets | Log AskGita cache-miss interaction |
| 44 | Add_Feedback_Text1 | Code | Append feedback link (AskGita path) |
| 45 | Respond_To_Webhook | Respond to Webhook | Send AskGita response |
| 46 | Edit Fields | Set | Set fields for cache-hit path (AskGita) |
| 47 | Append row in sheet3 | Google Sheets | Log AskGita cache-hit interaction |
| 48 | Prepare Analytics Data1 | Code | Compile analytics record (cache-hit) |
| 49 | Append row in sheet | Google Sheets | Log InfoBot interaction |
| 50 | Append row in sheet2 | Google Sheets | Log secondary InfoBot interaction |
| 51 | Google Sheets | Google Sheets | Receive and store feedback |
| 52 | Respond to Webhook2 | Respond to Webhook | Acknowledge feedback receipt |

---

## Key Design Decisions

**Google Sheets as primary database** — Chosen for zero-infrastructure overhead, easy visibility, and compatibility with the Google Apps Script feedback system.

**Groq + Llama 3.3 70B** — Selected for high speed (low latency critical for chat UX) and strong multilingual capability for Hindi/English responses.

**SerpAPI over direct Google Search** — SerpAPI provides structured JSON output, making it easy to extract `organic_results` and select authoritative links programmatically.

**Multi-key rotation** — Prevents single-account quota exhaustion during peak usage (e.g., during IGM festival when thousands of visitors may query simultaneously).

**Cache-first architecture** — Dramatically reduces API costs and response time for the most common questions, which tend to repeat frequently (emergency numbers, tourist site info, etc.).

**Two-AI fallback design** — Ensures the bot always gives a useful answer even when the web scraping pipeline fails, rather than returning an error to the user.

**Smart content windowing** — Rather than feeding entire scraped pages to the AI (which would exceed token limits and increase cost), the extractor identifies the most relevant section of the page and sends only that portion.

---

*Document generated from workflow JSON: Kurukshetra-InfoBot.json*  
*Workflow version: Active Production Build*

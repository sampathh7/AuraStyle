# Live Retailer Visual Matching, Book Search & Universal Product Omni-Search

A unified multi-store shopping and discovery engine adding live authentic retailer product imagery, visual & text book search with lowest-price highlights, and a universal cross-store search bar for finding any product across the internet at one place.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during Phase 1 clarification and will govern the implementation:

- **Confirmed: Navigation Architecture**: Dedicated primary tabs for **Fashion & Outfits**, **Books Finder**, and **Universal Search**, giving each search mode its specialized discovery UI and dedicated controls.
- **Confirmed: Authentic Product Imagery**: Live multi-store search fetching real e-commerce retailer product imagery, official brand assets, and authentic direct product links (replacing stock photoshoot placeholders).
- **Confirmed: Book Finder Prioritization**: Direct store purchase links with lowest price badges, edition selections (Hardcover, Paperback, Kindle, Audiobook), and retailer price comparisons across Amazon, Barnes & Noble, Bookshop.org, and Google Books.
- **Confirmed: Universal Cross-Store Search**: Omni-search supporting both natural language queries and image uploads to search across major retail platforms (Amazon, Walmart, Target, eBay, Best Buy, ASOS, Zara, Myntra) simultaneously with best-deal tagging.

---

## 1. Overview & Core Concept

- **What It Does**: Upgrades the AuraStyle platform into a comprehensive visual and text shopping engine. Users can:
  1. Find outfits and see genuine retailer garment images and product shots from stores like Myntra, Ajio, Zara, ASOS, and Amazon.
  2. Upload a book photo or type a title/author to visually recognize the book, extract author and synopsis, and view real cover art with a real-time price comparison grid across top book retailers with lowest-price callouts.
  3. Search any item across the internet via an omni-search bar (or image upload) comparing live offers, authentic product photos, pricing, and direct checkout routes.
- **Target Audience / Persona**: Smart shoppers, fashion enthusiasts, and avid readers who want instant visual matching from camera photos or screenshots, accurate product visuals, and cross-retailer price transparency without opening dozens of browser tabs.
- **Key Value**: Replaces generic stock images with authentic merchant product imagery and direct buy links, while consolidating fashion, books, and general retail shopping into one cohesive application.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Fashion & Outfits Tab**:
   - Users browse trending outfits or upload their own look/garment photo.
   - Analysis breaks down items (e.g., shirts, jackets, trousers) and renders authentic retailer product cards with real merchant images, fabric details, current price, and direct store links.
   - Clicking a product opens the enhanced Retailer Product Modal with multiple catalog angles, size availability, and direct merchant link.

2. **Books Finder Tab**:
   - Visual book upload zone (drag & drop, camera snap, or sample book covers) + instant search input (title, author, ISBN).
   - Gemini vision model identifies the exact book edition, author, publication year, genres, and synopsis.
   - Renders the book showcase card featuring the authentic high-resolution cover art, key metadata (unboxed text with subtle dividers), and the Multi-Retailer Price Comparison Matrix (Amazon, Barnes & Noble, Bookshop.org, AbeBooks, Google Books) highlighting the verified lowest price.

3. **Universal Omni-Search Tab**:
   - Prominent cross-retailer search bar with instantaneous filtering (All, Tech & Gadgets, Home & Living, Beauty & Grooming, Fashion, Books).
   - Supports camera image drop to identify any mystery product.
   - Displays a clean 3-column responsive product card grid with store tags, price comparison badges, discount percentages, and direct store jump buttons.

### Visual Identity & Theme

- **Aesthetic Direction**: High-end editorial commerce inspired by clean Scandinavian direct-to-consumer design, strictly adhering to the Anti-AI Slop guidelines (no static pill capsules, no code-comment titles, no decorative pulsing dots).
- **Color Palette & Tokens**:
  - Dominant Neutral Canvas (60%): `--background: #0B0F17` (Dark Slate / Obsidian) or `#FAF9F6` (Light Ivory Paper).
  - Structural Surfaces (30%): `--card: #131B2A` with hairline borders (`border-slate-800/80` or `border-stone-200`).
  - High-Intent Accent (10%): `--accent: #D4AF37` (Muted Warm Gold) and `--primary: #38BDF8` (Precision Sky Blue) reserved exclusively for active states, lowest-price highlights, and primary search CTAs.
- **Typography & Hierarchy**:
  - Display Font: `Playfair Display` for luxury editorial titles and hero headlines.
  - Body & UI Font: `Plus Jakarta Sans` for clean, high-legibility interface copy.
  - Numerals & Currency: `tabular-nums` throughout all price tables and comparison metrics.
- **Zero-Pill Metadata Discipline**: All tags (author, format, release year, retailer name) use quiet unboxed typography separated by `·` or `/`.
- **Top Bar Contract**: Single row adhering to the 3-zone standard: Brand wordmark (`AuraStyle Omni`) — Clean navigation tabs (`Fashion`, `Books`, `Universal Search`, `Wardrobe`) — Single primary action (`Upload Image`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Live Retailer Asset Service vs. Stock Images**:
  - *Chosen Approach*: Replace Unsplash stock placeholders with a dedicated multi-retailer image resolver (`retailerProductResolver.ts`) that serves verified high-resolution e-commerce product photos, brand logos, and multi-angle catalog images for fashion, books, and tech items.
  - *Why*: Directly solves the user's explicit feedback that "images are not original". Provides the exact website product images with authentic framing, white/neutral studio backdrops, and true retailer fidelity.
  - *Alternatives Considered*: Retrying generic Unsplash IDs was rejected because they do not reflect commercial store listings.

- **Decision 2: Multimodal Book Identification via Gemini**:
  - *Chosen Approach*: Use Gemini multimodal vision (`gemini-3.8-flash`) to parse uploaded book covers/spines, extract metadata (title, author, publisher, ISBN, summary), and automatically map to real e-commerce store listings with live direct URLs.
  - *Why*: Ensures rapid identification (< 1.5s) from camera photos even if angled or partially occluded, delivering immediate lowest-price deal recommendations.

- **Decision 3: Dedicated Tab Navigation**:
  - *Chosen Approach*: Implement clear segmented tabs in the top navigation and mobile bottom bar for Fashion, Books, and Universal Search, while keeping quick-switch buttons within the hero area.
  - *Why*: Conforms directly to the user's preferred option from Turn 1, providing a focused, clutter-free experience for each domain without overwhelming a single view.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          AuraStyle Omni UI                             │
│                                                                        │
│  ┌─────────────────────── Top Navigation Bar ───────────────────────┐  │
│  │ [Brand: AuraStyle]   [Fashion | Books | Universal]    [Upload]   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                  │                                     │
│         ┌────────────────────────┼────────────────────────┐            │
│         ▼                        ▼                        ▼            │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐    │
│  │ Fashion View │         │  Books View  │         │Universal View│    │
│  │ (Outfits &   │         │ (Cover Vision│         │ (Omni-Search │    │
│  │ Live Clothes)│         │ & Store Comp)│         │ All Stores)  │    │
│  └──────┬───────┘         └──────┬───────┘         └──────┬───────┘    │
│         │                        │                        │            │
│         └────────────────────────┼────────────────────────┘            │
│                                  ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                 Core Services & Image Resolvers                  │  │
│  │  • retailerProductResolver (Authentic store imagery & URLs)      │  │
│  │  • bookService (Visual cover recognition & store deals)          │  │
│  │  • universalSearchService (Multi-store aggregate query engine)   │  │
│  │  • stylistService (Fashion decomposition & wardrobe matching)    │  │
│  │  • geminiService (@google/genai multimodal vision integration)   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

- **BookProduct Entity**:
  - `id`: Unique identifier
  - `title`: Book title
  - `author`: Author name(s)
  - `coverImage`: Authentic high-resolution book cover image
  - `isbn`: ISBN-10 / ISBN-13
  - `genre`: Primary categories
  - `publishedYear`: Release year
  - `synopsis`: Editorial summary
  - `rating`: Star rating (1-5) and review count
  - `deals`: Array of `BookStoreDeal` (storeName, price, originalPrice, currency, isLowestPrice, storeUrl, format, delivery)

- **UniversalProduct Entity**:
  - `id`: Unique identifier
  - `name`: Product title
  - `category`: Category classification (Fashion, Tech, Home, Beauty, Books, Sports)
  - `mainImage`: Authentic retailer product photo
  - `brand`: Brand name
  - `rating`: Customer rating
  - `reviewCount`: Number of reviews
  - `deals`: Array of `StoreDeal` with store logo, price, storeUrl, bestDeal flag, and shipping note

- **State Management**:
  - `activeTab`: `'fashion' | 'books' | 'universal'` in `AppContext`
  - `bookSearchQuery` & `bookAnalysisState` (file upload, scanning, results)
  - `universalSearchQuery`, `selectedCategory`, and `priceSortOrder`
  - Safe local persistence for recently searched books and saved universal deals

### Interactive Component & State Mapping

- **Navbar & MobileBottomNav**:
  - Provides instant switching between `'fashion'`, `'books'`, and `'universal'` with active tab indicators.
- **BookSearchView**:
  - `BookUploadZone`: Handles drag-and-drop, camera uploads, or quick sample books. Triggers Gemini visual recognition.
  - `BookResultCard`: Displays high-resolution cover, unboxed metadata, and the interactive Retailer Comparison Table.
  - `FormatSelector`: Allows filtering prices by Hardcover, Paperback, or Kindle.
- **UniversalSearchView**:
  - `OmniSearchBar`: Debounced multi-store query bar with category pills and voice/camera trigger.
  - `ProductGrid`: 3-column card layout displaying genuine merchant product images, store badges, and one-click direct store redirect links (`target="_blank" rel="noopener noreferrer"`).
- **OutfitCard & WebsiteProductModal**:
  - Replaces all legacy stock photos with authentic e-commerce product imagery and real retailer store listings.

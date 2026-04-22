# ExpaHome SEO Guide
**ЕкспаХоум ДТ ЕООД — Разгъваеми и Контейнерни Къщи**

---

## Table of Contents

1. [Current SEO Audit](#1-current-seo-audit)
2. [Keyword Strategy](#2-keyword-strategy)
3. [On-Page SEO Fixes](#3-on-page-seo-fixes)
4. [Technical SEO](#4-technical-seo)
5. [Structured Data (Schema Markup)](#5-structured-data-schema-markup)
6. [Image SEO](#6-image-seo)
7. [Content Strategy](#7-content-strategy)
8. [Local SEO](#8-local-seo)
9. [Link Building](#9-link-building)
10. [Tracking & Measurement](#10-tracking--measurement)
11. [Priority Action Checklist](#11-priority-action-checklist)

---

## 1. Current SEO Audit

### What You Have (Good)
- `lang="bg"` on `<html>` — correct language declaration for Bulgarian
- Responsive design with mobile viewport meta tag
- Fast-loading structure (no heavy framework)
- Videos with `preload="none"` — good for page speed
- Images use `loading="lazy"` — correct

### What's Missing (Critical Gaps)
| Issue | Impact | Pages Affected |
|-------|--------|----------------|
| No `<meta name="description">` on any page | High | All 4 pages |
| No Open Graph tags | Medium | All 4 pages |
| No canonical URLs | Medium | All 4 pages |
| No structured data (JSON-LD) | High | index, about, contact |
| No sitemap.xml | High | Whole site |
| No robots.txt | Medium | Whole site |
| Generic `<title>` tags | High | All 4 pages |
| Images missing descriptive alt text | High | gallery.html |
| No hreflang for international targeting | Medium | All pages |

---

## 2. Keyword Strategy

ExpaHome targets two audiences: **Bulgarian buyers** and **international buyers (30+ countries)**. You need separate keyword tracks.

### Primary Bulgarian Keywords (High Priority)
```
контейнерни къщи              — container houses
разгъваеми къщи               — expandable houses
модулни къщи България          — modular houses Bulgaria
контейнерна къща цена          — container house price
сглобяеми къщи                — prefab houses
евтини модулни къщи            — cheap modular houses
```

### Secondary Bulgarian Keywords
```
контейнерна къща с баня        — container house with bathroom
разгъваема контейнерна 20ft   — expandable container 20ft
CASA BOX България              — CASA BOX Bulgaria
ЕкспаХоум                     — brand name
модулно строителство           — modular construction
```

### International English Keywords (for future English page)
```
expandable container homes
foldable container house
modular container home manufacturer Bulgaria
CGCH CASA BOX representative Europe
container house 20ft 30ft 40ft
```

### Keyword → Page Mapping
| Keyword | Target Page |
|---------|-------------|
| контейнерни/разгъваеми къщи | index.html |
| За нас, история, производител | about.html |
| галерия, снимки, проекти | gallery.html |
| цена, запитване, контакт | contact.html |

---

## 3. On-Page SEO Fixes

### 3.1 Title Tags — Fix for All Pages

Current titles are weak. Replace them:

**index.html**
```html
<!-- BEFORE -->
<title>ExpaHome — Разгъваеми и Контейнерни Къщи</title>

<!-- AFTER (60 chars max) -->
<title>Контейнерни и Разгъваеми Къщи | ExpaHome България</title>
```

**about.html**
```html
<title>За Нас — ЕкспаХоум | Официален Представител CASA BOX</title>
```

**gallery.html**
```html
<title>Галерия — Контейнерни Къщи | ExpaHome Проекти</title>
```

**contact.html**
```html
<title>Контакти и Запитване | ExpaHome Контейнерни Къщи</title>
```

---

### 3.2 Meta Descriptions — Add to All Pages

Add inside `<head>` on every page:

**index.html**
```html
<meta name="description" content="ExpaHome — официален представител на CASA BOX. Разгъваеми и контейнерни къщи 20ft, 30ft, 40ft. Доставка и монтаж за дни. 150+ реализирани проекта в 30+ страни.">
```

**about.html**
```html
<meta name="description" content="ЕкспаХоум ДТ ЕООД — официален представител на CGCH CASA BOX с 15+ години опит в модулното строителство. Производство до 300 000 тона лека стомана месечно.">
```

**gallery.html**
```html
<meta name="description" content="Разгледайте реализираните ни проекти — разгъваеми и контейнерни къщи от ExpaHome. Интериор, екстериор и монтаж на живо.">
```

**contact.html**
```html
<meta name="description" content="Свържете се с ExpaHome за запитване за контейнерна или разгъваема къща. Отговаряме до 24 часа. Безплатна консултация.">
```

---

### 3.3 Open Graph Tags — Add to All Pages

Open Graph controls how your pages appear when shared on Facebook, Viber, Telegram, etc.

Add in `<head>` on each page (update per page):

```html
<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://expahome.bg/">
<meta property="og:title" content="Контейнерни и Разгъваеми Къщи | ExpaHome България">
<meta property="og:description" content="Официален представител на CASA BOX. Разгъваеми и контейнерни къщи 20ft, 30ft, 40ft. Монтаж за дни.">
<meta property="og:image" content="https://expahome.bg/images/og-cover.jpg">
<meta property="og:locale" content="bg_BG">
<meta property="og:site_name" content="ExpaHome">
```

> **Action:** Create an `og-cover.jpg` image (1200×630px) showing your best container home — this is what appears in every social media share preview.

---

### 3.4 Canonical URLs — Add to All Pages

Prevents duplicate content penalties:

```html
<!-- index.html -->
<link rel="canonical" href="https://expahome.bg/">

<!-- about.html -->
<link rel="canonical" href="https://expahome.bg/about.html">

<!-- gallery.html -->
<link rel="canonical" href="https://expahome.bg/gallery.html">

<!-- contact.html -->
<link rel="canonical" href="https://expahome.bg/contact.html">
```

---

### 3.5 Heading Structure — Fix H1/H2 Hierarchy

Every page must have **exactly one H1** that contains your main keyword.

**index.html** — current H1:
```html
<h1 class="hero-title">Вашият дом. Разгънат до съвършенство.</h1>
```
This is branded but weak for SEO. Consider updating to:
```html
<h1 class="hero-title">Контейнерни и Разгъваеми Къщи — <em>ExpaHome</em></h1>
```
Or keep the poetic headline and add a visually hidden SEO H1:
```html
<h1 class="sr-only">Контейнерни и Разгъваеми Къщи България | ExpaHome</h1>
```
Add to CSS:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
```

---

## 4. Technical SEO

### 4.1 Create robots.txt

Create file `robots.txt` in the root:

```
User-agent: *
Allow: /

Sitemap: https://expahome.bg/sitemap.xml
```

---

### 4.2 Create sitemap.xml

Create file `sitemap.xml` in the root:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://expahome.bg/</loc>
    <lastmod>2026-04-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://expahome.bg/about.html</loc>
    <lastmod>2026-04-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://expahome.bg/gallery.html</loc>
    <lastmod>2026-04-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://expahome.bg/contact.html</loc>
    <lastmod>2026-04-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

> **After creating:** Submit to [Google Search Console](https://search.google.com/search-console) and [Bing Webmaster Tools](https://www.bing.com/webmasters).

---

### 4.3 Page Speed Improvements

Run your site through [Google PageSpeed Insights](https://pagespeed.web.dev/). Key fixes:

**Compress images:** All PNG/JPG images in `/images/` should be converted to WebP format and compressed. Target: under 200KB per image.

```html
<!-- Use WebP with fallback -->
<picture>
  <source srcset="images/LandingPage/hero.webp" type="image/webp">
  <img src="images/LandingPage/hero.jpg" alt="Разгъваема контейнерна къща ExpaHome" loading="lazy">
</picture>
```

**Preload hero image** (add to `<head>` of index.html):
```html
<link rel="preload" as="image" href="images/LandingPage/1000024214.webp">
```

**Font optimization** — replace current Google Fonts link with:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

---

### 4.4 HTTPS & Domain

Ensure:
- Site loads on `https://` (Netlify handles this automatically — verify it's enabled)
- `http://` redirects to `https://`
- `www.expahome.bg` redirects to `expahome.bg` (or vice versa — pick one and stick to it)

Add to `netlify.toml`:
```toml
[[redirects]]
  from = "http://expahome.bg/*"
  to = "https://expahome.bg/:splat"
  status = 301
  force = true

[[redirects]]
  from = "https://www.expahome.bg/*"
  to = "https://expahome.bg/:splat"
  status = 301
  force = true
```

---

## 5. Structured Data (Schema Markup)

Schema markup helps Google show rich results (star ratings, address, products) in search.

### 5.1 LocalBusiness Schema — Add to index.html

Add before `</body>`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "ЕкспаХоум ДТ ЕООД",
  "alternateName": "ExpaHome",
  "description": "Официален представител на CASA BOX (CGCH). Производство и доставка на разгъваеми и контейнерни къщи.",
  "url": "https://expahome.bg",
  "logo": "https://expahome.bg/images/logo.jpg",
  "image": "https://expahome.bg/images/og-cover.jpg",
  "telephone": "+359-YOUR-PHONE",
  "email": "YOUR-EMAIL@expahome.bg",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "BG",
    "addressLocality": "YOUR-CITY"
  },
  "sameAs": [
    "https://www.facebook.com/expahome",
    "https://www.instagram.com/expahome"
  ],
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    "opens": "09:00",
    "closes": "18:00"
  }
}
</script>
```

### 5.2 Product Schema — Add to index.html for Each House Model

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Разгъваема контейнерна къща EC-20ft",
  "description": "Разгъваема контейнерна къща с размери 20 фута. Пълна инсталация, доставена и монтирана за дни.",
  "brand": {
    "@type": "Brand",
    "name": "CASA BOX"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "ЕкспаХоум ДТ ЕООД"
    }
  }
}
</script>
```

### 5.3 FAQ Schema — Add a FAQ section to index.html

FAQ schema can get your site Google's "People Also Ask" boxes — high visibility.

Add a visible FAQ section to index.html, then mark it up:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Колко струва контейнерна къща?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Цените на разгъваемите контейнерни къщи от ExpaHome варират според размера и конфигурацията. Свържете се с нас за персонализирана оферта."
      }
    },
    {
      "@type": "Question",
      "name": "Колко бързо се монтира разгъваема къща?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Средното производство е около 25 дни. Монтажът на място отнема само часове — конструкцията се разгъва механично."
      }
    },
    {
      "@type": "Question",
      "name": "Доставяте ли в цяла България?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Да, ExpaHome доставя в цяла България и в 30+ страни по света."
      }
    },
    {
      "@type": "Question",
      "name": "Каква е разликата между разгъваема и контейнерна къща?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Разгъваемите къщи се транспортират сгъната и се разпъват на място, удвоявайки площта. Контейнерните са стандартен ISO контейнер, преустроен в жилище."
      }
    }
  ]
}
</script>
```

---

## 6. Image SEO

### 6.1 Alt Text Rules

Every `<img>` must have a descriptive `alt` attribute containing keywords naturally.

**Bad:**
```html
<img src="images/1000024214.png" alt="image">
<img src="images/logo.jpg" alt="ExpaHome">
```

**Good:**
```html
<img src="images/LandingPage/1000024214.webp" alt="Разгъваема контейнерна къща ExpaHome 20ft екстериор">
<img src="images/logo.jpg" alt="ExpaHome — Контейнерни и Разгъваеми Къщи">
```

### 6.2 Image Naming Convention

Rename files from `1000024214.png` to descriptive names:
```
razgavaema-konteinerna-kashta-20ft.webp
expahome-interior-spalnya.webp
konteinerna-kashta-eksterior-verandа.webp
```

This alone can drive traffic from Google Images.

### 6.3 Gallery Page — Critical

gallery.html likely has the most images. Every single one needs:
- Descriptive `alt` text
- WebP format
- `loading="lazy"` (you already have this — keep it)

---

## 7. Content Strategy

### 7.1 Add a Blog / News Section

A blog is the #1 way to rank for long-tail keywords. Target articles:

| Article Title | Target Keyword | Search Intent |
|---|---|---|
| "Разгъваема vs Контейнерна Къща — Коя да Избера?" | разгъваема vs контейнерна | Informational |
| "Цени на Контейнерни Къщи в България 2026" | контейнерна къща цена | Informational |
| "Колко Трае Контейнерна Къща?" | трайност контейнерна | Informational |
| "Разрешително за Контейнерна Къща в България" | разрешително контейнерна | Informational |
| "20ft, 30ft или 40ft — Кой Размер е Правилен?" | размери контейнерна | Informational |
| "ExpaHome vs Конкуренти — Защо CASA BOX?" | casa box отзиви | Commercial |

### 7.2 Add Customer Reviews / Testimonials

Reviews on your website + Google Maps = trust signals for both users and Google.

Add a visible testimonials section to index.html with real customer quotes, names, and locations. Mark up with `Review` schema.

### 7.3 Expand Product Pages

Currently all products are on one page. Consider dedicated pages:
- `/konteinerna-kashta-20ft.html`
- `/konteinerna-kashta-30ft.html`
- `/konteinerna-kashta-40ft.html`

Each page targets a specific model keyword and can rank independently.

---

## 8. Local SEO

### 8.1 Google Business Profile (Free — Do This First)

1. Go to [Google Business Profile](https://business.google.com)
2. Create/claim your business: **ЕкспаХоум ДТ ЕООД**
3. Fill in completely:
   - Business category: "Modular Home Manufacturer" / "Construction Company"
   - Address, phone, website
   - Hours
   - Photos (upload 10+ high-quality images)
   - Description using keywords: *"Разгъваеми и контейнерни къщи. Официален представител на CASA BOX (CGCH)..."*
4. Get customers to leave Google reviews

### 8.2 Bulgarian Business Directories

Submit to these free directories for local citations:

| Directory | URL |
|---|---|
| Firmite.bg | firmite.bg |
| YellowPages Bulgaria | yellowpages.bg |
| Pomaga.bg | pomaga.bg |
| Bazar.bg | bazar.bg |
| Imot.bg | imot.bg |

**Consistency is critical:** Use the exact same business name, address, and phone (NAP) on every directory.

### 8.3 Embed Google Maps on Contact Page

Add an embedded Google Maps iframe with your location to contact.html — this strengthens local SEO signals.

---

## 9. Link Building

### 9.1 Quick Wins (Free)

- **Facebook page** linking to expahome.bg — creates a backlink
- **Instagram bio** link
- **YouTube channel** description (if you upload the assembly videos)
- **Supplier/partner page** — ask CASA BOX / CGCH to link to you as their Bulgarian representative
- **Press release** on a Bulgarian news site about your 150+ projects milestone

### 9.2 Medium-Term (1-3 months)

- **Construction forums** (stroitelstvo.bg, buldozer.bg) — participate, link naturally in your profile/signature
- **Real estate portals** — imot.bg, homes.bg — list your homes as a seller
- **Guest posts** on Bulgarian home improvement / real estate blogs

### 9.3 Link-Worthy Content to Create

- **Free downloadable comparison PDF:** "Разгъваема vs Традиционна Строителна — Пълно Сравнение" — people link to useful resources
- **Before/after project case studies** — shareable content

---

## 10. Tracking & Measurement

### 10.1 Google Search Console (Free — Set Up Immediately)

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property: `expahome.bg`
3. Verify via HTML meta tag — add to `<head>` of index.html:
   ```html
   <meta name="google-site-verification" content="YOUR-VERIFICATION-CODE">
   ```
4. Submit your sitemap: `https://expahome.bg/sitemap.xml`
5. Monitor weekly: clicks, impressions, average position, crawl errors

### 10.2 Google Analytics 4 (Free)

1. Create account at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID (`G-XXXXXXXXXX`)
3. Add to `<head>` of every page:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```
4. Set up conversions: track form submissions on contact.html as a conversion event

### 10.3 Key Metrics to Track Monthly

| Metric | Tool | Target |
|---|---|---|
| Organic clicks | Search Console | +20% MoM |
| Keyword rankings | Search Console | Top 10 for 3 main keywords |
| Contact form submissions | GA4 | Track as conversion |
| Page speed score | PageSpeed Insights | 80+ mobile |
| Backlinks | Google Search Console | Growing month over month |

---

## 11. Priority Action Checklist

Do these in order — highest impact first:

### Week 1 (Technical Foundation)
- [ ] Add `<meta name="description">` to all 4 pages
- [ ] Fix `<title>` tags on all 4 pages
- [ ] Create `robots.txt`
- [ ] Create `sitemap.xml`
- [ ] Set up Google Search Console and submit sitemap
- [ ] Set up Google Analytics 4

### Week 2 (On-Page Optimization)
- [ ] Add Open Graph tags to all pages
- [ ] Add canonical URLs to all pages
- [ ] Add LocalBusiness JSON-LD schema to index.html
- [ ] Fix alt text on all images
- [ ] Add FAQ section + FAQ schema to index.html

### Week 3 (Local SEO)
- [ ] Create/claim Google Business Profile
- [ ] Upload 10+ photos to Google Business Profile
- [ ] Submit to 5 Bulgarian business directories
- [ ] Ask satisfied customers for Google reviews

### Month 2 (Content & Links)
- [ ] Compress all images to WebP
- [ ] Write first blog article: "Цени на Контейнерни Къщи 2026"
- [ ] Create product-specific pages for each model
- [ ] Build Facebook and Instagram pages with website link
- [ ] Contact CASA BOX for backlink as official representative

### Month 3+
- [ ] Write 2 blog articles per month
- [ ] Add customer testimonials with Review schema
- [ ] Start link building outreach to construction forums
- [ ] Create downloadable PDF resource for links

---

## Quick Reference: Meta Tag Template

Copy-paste this block into every page `<head>`, updating values per page:

```html
<!-- SEO Essentials -->
<meta name="description" content="PAGE-SPECIFIC DESCRIPTION HERE">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://expahome.bg/PAGE.html">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://expahome.bg/PAGE.html">
<meta property="og:title" content="PAGE TITLE HERE">
<meta property="og:description" content="PAGE-SPECIFIC DESCRIPTION HERE">
<meta property="og:image" content="https://expahome.bg/images/og-cover.jpg">
<meta property="og:locale" content="bg_BG">
<meta property="og:site_name" content="ExpaHome">

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

*Guide created for ExpaHome (ЕкспаХоум ДТ ЕООД) — April 2026*

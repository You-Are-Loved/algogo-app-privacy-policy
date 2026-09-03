import { Category } from '../types';

export const webCategories: Category[] = [
  // 1. HTML & Semantics
  {
    id: 'html-semantics',
    name: 'HTML & Semantics',
    slug: 'html-semantics',
    description: 'Master semantic HTML for accessible, SEO-friendly web pages',
    icon: 'code-slash-outline',
    color: '#E34F26',
    colorDark: '#C13818',
    premium: false,
    learnContent: [
      {
        id: 'html-sem-1',
        title: 'What is Semantic HTML?',
        content: `Semantic HTML uses elements that clearly describe their meaning to both browsers and developers.

• Semantic elements: <header>, <nav>, <main>, <article>, <section>, <aside>, <footer>
• Non-semantic elements: <div>, <span> (no inherent meaning)
• Benefits: Better accessibility, SEO, and maintainability

Screen readers and search engines understand semantic markup, making your content more accessible and discoverable.`,
        codeExample: `<!-- Non-semantic -->
<div class="header">
  <div class="nav">...</div>
</div>

<!-- Semantic -->
<header>
  <nav>...</nav>
</header>`
      },
      {
        id: 'html-sem-2',
        title: 'Document Structure',
        content: `A well-structured HTML document follows a logical hierarchy.

• <html>: Root element with lang attribute
• <head>: Metadata, title, links, scripts
• <body>: Visible content
• <main>: Primary content (only one per page)
• <article>: Self-contained, distributable content
• <section>: Thematic grouping with heading`,
        codeExample: `<!DOCTYPE html>
<html lang="en"> <!-- lang helps screen readers + SEO -->
<head>
  <!-- metadata: encoding, mobile scaling, tab title -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title</title>
</head>
<body>
  <header><nav>...</nav></header>
  <main> <!-- only ONE main per page -->
    <article> <!-- self-contained content -->
      <h1>Title</h1>
      <section>...</section>
    </article>
  </main>
  <footer>...</footer>
</body>
</html>`
      },
      {
        id: 'html-sem-3',
        title: 'Forms & Accessibility',
        content: `Accessible forms are crucial for usability.

• Always use <label> with for attribute matching input id
• Use <fieldset> and <legend> to group related inputs
• Add aria-describedby for additional help text
• Use appropriate input types: email, tel, number, date
• Include required and aria-required for mandatory fields`,
        codeExample: `<form>
  <fieldset> <!-- groups related inputs -->
    <legend>Contact Info</legend>
    <!-- for/id link: clicking label focuses input -->
    <label for="email">Email</label>
    <input type="email" id="email" required
      aria-describedby="email-help">
    <!-- help text announced by screen readers -->
    <span id="email-help">We won't share</span>
  </fieldset>
  <button type="submit">Submit</button>
</form>`
      },
      {
        id: 'html-sem-4',
        title: 'Meta Tags & SEO',
        content: `Meta tags provide metadata about your HTML document.

• <meta charset>: Character encoding (UTF-8)
• <meta viewport>: Mobile responsiveness
• <meta description>: Page description for search engines
• <meta robots>: Search engine indexing instructions
• Open Graph tags: Social media previews
• Canonical URL: Prevent duplicate content issues`,
        codeExample: `<head>
  <meta charset="UTF-8">
  <!-- required for mobile-friendly scaling -->
  <meta name="viewport"
    content="width=device-width, initial-scale=1.0">
  <!-- shown as the snippet in search results -->
  <meta name="description"
    content="Learn web development">
  <!-- Open Graph: social share previews -->
  <meta property="og:title" content="My Site">
  <meta property="og:image" content="/preview.jpg">
  <!-- canonical: avoids duplicate-content penalty -->
  <link rel="canonical" href="https://example.com/page">
</head>`
      },
      {
        id: 'html-sem-5',
        title: 'ARIA & Accessibility',
        content: `ARIA (Accessible Rich Internet Applications) enhances accessibility.

• aria-label: Provides accessible name
• aria-hidden: Hides from screen readers
• aria-live: Announces dynamic content
• role: Defines element purpose
• aria-expanded: Toggle state for accordions
• Use semantic HTML first, ARIA as supplement`,
        codeExample: `<!-- Button with icon only -->
<button aria-label="Close menu">
  <span aria-hidden="true">×</span>
</button>

<!-- Live region for updates -->
<div aria-live="polite" aria-atomic="true">
  Cart updated: 3 items
</div>

<!-- Custom accordion -->
<button aria-expanded="false"
  aria-controls="panel1">
  Section 1
</button>
<div id="panel1" hidden>Content</div>`
      },
      {
        id: 'html-sem-6',
        title: 'Responsive & Accessible Images',
        content: `Modern image markup gives you art direction, format negotiation, lazy loading, and accessibility — all in HTML.

• alt: every meaningful image needs descriptive alt text. Decorative images use alt="" (NOT missing alt — that screen-reads the filename)
• width/height: always set both — prevents layout shift (CLS) as images load
• loading="lazy": defer offscreen images/iframes until near viewport
• decoding="async": don't block render on decode
• <picture> + <source>: art direction (different crops per breakpoint) and format negotiation (AVIF → WebP → JPG fallback)
• srcset + sizes on <img>: density / resolution switching for the same image

Browsers pick the smallest image they need given device pixel density and the layout width hinted by sizes.`,
        codeExample: `<!-- Format negotiation + responsive -->
<picture>
  <source type="image/avif" srcset="hero.avif" />
  <source type="image/webp" srcset="hero.webp" />
  <img
    src="hero.jpg"
    srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1600.jpg 1600w"
    sizes="(min-width: 800px) 50vw, 100vw"
    width="1600" height="900"
    loading="lazy"
    decoding="async"
    alt="Sunset over Mt. Rainier" />
</picture>

<!-- Decorative — read by screen readers as "image", which is correct here -->
<img src="divider.svg" alt="" role="presentation" />`
      },
      {
        id: 'html-sem-7',
        title: 'Heading Hierarchy & Document Outline',
        content: `Headings (h1–h6) form the document's outline — the structure screen reader users navigate by.

Rules:
• One h1 per page (the page title). Frameworks like Next/Remix sometimes default to multiple — fix that.
• Don't skip levels: h1 → h2 → h3, not h1 → h3.
• Use heading levels for SEMANTICS, not size — style with CSS.
• Each <section> / <article> can have its own heading hierarchy starting at h2 (under the h1).

Why it matters:
• Screen readers announce a list of headings to navigate the page (NVDA: H key)
• Search engines weight headings to understand topic structure
• Visual hierarchy alone doesn't help blind or low-vision users

Section sectioning content (<article>, <section>, <aside>, <nav>) used to imply a new outline (the now-defunct HTML5 outline algorithm). Modern advice: do NOT rely on it. Use explicit heading levels.`,
      },
      {
        id: 'html-sem-8',
        title: 'Data Tables Done Right',
        content: `<table> is for tabular DATA — never for layout. When used correctly, screen readers announce rows and columns, headers, and totals contextually.

Required parts:
• <caption>: programmatic title for the table
• <thead> / <tbody> / <tfoot>: sectioning
• <th scope="col"> for column headers, <th scope="row"> for row headers
• Complex tables: use headers="id1 id2" on cells to point at multiple <th id> values

Avoid:
• Tables for layout (use Grid/Flex)
• Skipping <th> — every column/row needs a header for accessibility
• Empty header cells without aria-label

Responsive tables: either let the user scroll horizontally (best for data integrity), or use CSS to stack rows on mobile while keeping the semantic table structure intact.`,
        codeExample: `<table>
  <!-- caption = accessible title for the table -->
  <caption>Q1 2026 sales by region</caption>
  <thead>
    <tr>
      <!-- scope="col" ties data cells to headers -->
      <th scope="col">Region</th>
      <th scope="col">Revenue</th>
      <th scope="col">Growth</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <!-- row header: announced with each cell -->
      <th scope="row">North</th>
      <td>$1.2M</td>
      <td>+12%</td>
    </tr>
  </tbody>
</table>`
      },
      {
        id: 'html-sem-9',
        title: 'Multimedia: <video>, <audio>, <track>',
        content: `Native media elements with built-in controls and accessibility hooks.

<video> / <audio>:
• src or multiple <source> for format negotiation (browsers pick the first compatible)
• controls attribute exposes the native UI
• preload="none" | "metadata" | "auto" — most pages should use "metadata"
• poster on <video> for the placeholder image
• Always include a transcript or captions for spoken content

<track> for time-based text:
• kind="subtitles" — translation of dialog
• kind="captions" — dialog + sound effects (deaf/HoH users)
• kind="descriptions" — audio descriptions of visual content (blind users)
• kind="chapters" — table of contents
• Format: WebVTT (.vtt) — time ranges with text

Accessibility minimum: captions for any video with speech. Descriptions when crucial info is visual-only.`,
        codeExample: `<!-- preload="metadata": only fetch duration/size -->
<video controls preload="metadata"
       poster="cover.jpg"
       width="1280" height="720">
  <!-- browser picks first format it can play -->
  <source src="lecture.av1.mp4" type="video/mp4; codecs=av01.0.05M.08" />
  <source src="lecture.h264.mp4" type="video/mp4; codecs=avc1.42E01E" />
  <source src="lecture.webm" type="video/webm" />
  <!-- captions: dialog + sounds, for deaf/HoH users -->
  <track kind="captions" src="lecture.en.vtt" srclang="en" label="English" default />
  <track kind="captions" src="lecture.es.vtt" srclang="es" label="Español" />
  <track kind="descriptions" src="lecture.descriptions.vtt" srclang="en" />
  <!-- fallback for very old browsers -->
  <p>Your browser doesn't support video. <a href="lecture.mp4">Download</a>.</p>
</video>`
      },
      {
        id: 'html-sem-10',
        title: 'Structured Data: JSON-LD & Schema.org',
        content: `Search engines use structured data to enable rich results — recipe cards, product pricing, FAQ accordions, event dates, breadcrumbs.

Three formats:
• JSON-LD (recommended by Google) — script tag in <head>, easy to add/maintain
• Microdata — inline attributes on existing HTML
• RDFa — similar to Microdata, semantic web roots

Schema.org provides the vocabulary: Article, Product, Recipe, Event, BreadcrumbList, FAQPage, Person, Organization, etc.

Practical wins:
• Article markup → may appear in Google's Top Stories carousel
• Product + Offer → price, availability, ratings show in search
• FAQPage → expandable Q&A directly in search results
• BreadcrumbList → cleaner breadcrumb display
• Recipe → image, time, calories, ratings card

Validate with Google's Rich Results Test before deploying.`,
        codeExample: `<!-- JSON-LD in <head> -->
<!-- type tells crawlers this is structured data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Modern HTML in 2026",
  "author": { "@type": "Person", "name": "Jane Smith" },
  "datePublished": "2026-04-12",
  "image": "https://example.com/cover.jpg",
  "publisher": {
    "@type": "Organization",
    "name": "Algogo",
    "logo": { "@type": "ImageObject", "url": "https://example.com/logo.png" }
  }
}
</script>`
      },
      {
        id: 'html-sem-11',
        title: 'Forms Deep Dive: Validation, Autofill, datalist',
        content: `Modern HTML forms reduce JS for validation and dramatically improve mobile UX through smart attributes.

Built-in validation:
• required, minlength, maxlength, min, max, step, pattern (regex)
• type="email", type="url", type="number", type="tel", type="date"
• :invalid CSS pseudoclass styles errors without JS
• :user-invalid (newer) only matches after the user has interacted — better UX

Autofill (huge mobile UX win):
• autocomplete="given-name", "family-name", "email", "tel", "street-address", "postal-code"
• autocomplete="cc-number", "cc-exp", "cc-csc" for payment
• autocomplete="one-time-code" + inputmode="numeric" for SMS OTP fields — iOS/Android offer the code from SMS

Mobile keyboard hints:
• inputmode="numeric" | "decimal" | "tel" | "email" | "url" | "search"
• enterkeyhint="search" | "send" | "next" | "go" — labels the Enter/return key

<datalist>: native autocomplete suggestions without a custom dropdown.`,
        codeExample: `<form>
  <label>
    Email
    <!-- autocomplete enables one-tap autofill -->
    <input
      type="email"
      autocomplete="email"
      inputmode="email"
      enterkeyhint="next"
      required />
  </label>

  <label>
    Verification code
    <!-- one-time-code: OS offers SMS code inline -->
    <input
      type="text"
      autocomplete="one-time-code"
      inputmode="numeric"
      pattern="[0-9]{6}"
      maxlength="6"
      required />
  </label>

  <label>
    Country
    <!-- list links input to datalist suggestions -->
    <input list="countries" name="country" />
  </label>
  <datalist id="countries">
    <option value="United States" />
    <option value="Canada" />
    <option value="United Kingdom" />
  </datalist>
</form>`
      }
    ],
    flashcards: [
      { id: 'html-fc-1', front: 'What is the purpose of the <main> element?', back: 'Contains the primary content of the document. There should be only one <main> per page, and it should not include repeated content like navigation or footers.' },
      { id: 'html-fc-2', front: 'What\'s the difference between <article> and <section>?', back: '<article> is self-contained content that could be distributed independently (blog post, news article). <section> is a thematic grouping of content, typically with a heading.' },
      { id: 'html-fc-3', front: 'Why is the lang attribute important on <html>?', back: 'It helps screen readers pronounce content correctly and assists search engines in serving content to the right audience. Example: <html lang="en">' },
      { id: 'html-fc-4', front: 'What does the <figure> element represent?', back: 'Self-contained content like images, diagrams, or code snippets, typically with an optional <figcaption>. The content can be moved without affecting the document flow.' },
      { id: 'html-fc-5', front: 'How do you associate a label with an input?', back: 'Use the for attribute on <label> matching the id of the <input>: <label for="name">Name</label><input id="name">. Or nest the input inside the label.' },
      { id: 'html-fc-6', front: 'What is the purpose of the viewport meta tag?', back: 'Controls how the page is displayed on mobile devices. width=device-width sets viewport to device width, initial-scale=1.0 sets initial zoom level.' },
      { id: 'html-fc-7', front: 'What does aria-live="polite" do?', back: 'Announces dynamic content changes to screen readers when the user is idle. Use "assertive" for urgent updates that interrupt the user.' },
      { id: 'html-fc-8', front: 'What is the <aside> element used for?', back: 'Content tangentially related to the main content, like sidebars, pull quotes, or advertising. It should make sense when separated from the main content.' },
      { id: 'html-fc-9', front: 'What is a canonical URL?', back: 'The preferred URL for a page when multiple URLs show the same content. Helps prevent duplicate content issues in SEO. Set with <link rel="canonical">.' },
      { id: 'html-fc-10', front: 'When should you use aria-hidden="true"?', back: 'To hide decorative content from screen readers, like icons that have accompanying text labels, or purely visual elements that add no meaning.' },
      { id: 'html-fc-11', front: 'alt="" vs missing alt attribute', back: 'alt="" explicitly tells assistive tech the image is decorative — they SKIP it.\n\nMissing alt entirely makes screen readers fall back to announcing the image filename ("hero-final-final-2.jpg"). Always include alt — empty for decorative, descriptive for meaningful.' },
      { id: 'html-fc-12', front: '<picture> vs srcset on <img>', back: 'srcset on <img>: same image at different resolutions/densities. Browser picks based on device pixel ratio + sizes.\n\n<picture> with multiple <source>: ART DIRECTION — different crops or formats per breakpoint, or format negotiation (AVIF → WebP → JPG fallback). The browser picks the first <source> whose media query matches and whose type it supports.' },
      { id: 'html-fc-13', front: 'What does loading="lazy" do?', back: 'On <img> and <iframe>: defer load until the element is near the viewport. Native browser implementation, no IntersectionObserver code needed.\n\nDon\'t use on above-the-fold images (it can delay LCP). Always set width/height to avoid CLS.' },
      { id: 'html-fc-14', front: 'AVIF vs WebP vs JPG/PNG', back: 'AVIF: best compression, supported in all modern browsers (≈97% global). 30–50% smaller than JPG at equal quality.\n\nWebP: widely supported (~96%), 25–35% smaller than JPG. Faster to decode than AVIF.\n\nJPG/PNG: universal fallback. Pattern: <picture> with AVIF source, WebP source, JPG fallback in <img>.' },
      { id: 'html-fc-15', front: 'WebVTT track kinds', back: '<track> kinds for media:\n• subtitles — translation of dialogue (e.g., English audio → Spanish text)\n• captions — dialogue + sound effects + speaker IDs (deaf / hard-of-hearing)\n• descriptions — audio descriptions of visual content (blind users)\n• chapters — navigable table of contents\n• metadata — non-displayed cues for scripts\n\nAdd default attribute to enable one by default.' },
      { id: 'html-fc-16', front: 'Heading hierarchy rules', back: '• One <h1> per page (page title)\n• Don\'t skip levels (h1 → h2, never h1 → h3)\n• Use levels for SEMANTICS, style with CSS\n• Each <article> can restart its hierarchy at h2 under the page h1\n\nScreen reader users navigate by headings — broken hierarchy makes the page unusable.' },
      { id: 'html-fc-17', front: 'What does scope on <th> do?', back: 'Tells assistive tech whether a header applies to its column or row.\n\n• scope="col" — column header\n• scope="row" — row header\n• scope="colgroup" / "rowgroup" — for grouped headers\n\nWithout scope, screen readers guess from position, which is unreliable for complex tables.' },
      { id: 'html-fc-18', front: 'tabindex="0" vs tabindex="-1"', back: 'tabindex="0": adds the element to the natural tab order at its source-order position. Use to make a <div> with role="button" focusable.\n\ntabindex="-1": focusable programmatically (.focus()) but NOT in the tab order. Use for offscreen modals, error summaries, or skip targets.\n\nAvoid tabindex > 0 — disrupts natural order, almost always wrong.' },
      { id: 'html-fc-19', front: 'autocomplete attribute values', back: 'Standardized tokens that tell browsers/password managers what to fill:\n• Personal: name, given-name, family-name, email, tel, bday\n• Address: street-address, address-line1, postal-code, country\n• Payment: cc-number, cc-exp, cc-csc, cc-name\n• Authentication: username, current-password, new-password, one-time-code\n\nGetting these right massively improves checkout / sign-up conversion.' },
      { id: 'html-fc-20', front: 'autocomplete="one-time-code"', back: 'Special token that lets iOS and Android offer the SMS verification code as autofill from the messages app — user taps to fill, no manual typing.\n\nPair with inputmode="numeric" and pattern="[0-9]{6}" for the right keyboard and validation. Massive UX win on 2FA flows.' },
      { id: 'html-fc-21', front: 'inputmode attribute', back: 'Hints which on-screen keyboard to show, independent of the input type:\n• inputmode="numeric" — number pad (no decimal)\n• inputmode="decimal" — number pad with decimal\n• inputmode="tel" — phone keypad\n• inputmode="email" — keyboard with @\n• inputmode="url" — keyboard with /\n• inputmode="search" — keyboard with search button\n\nUse with type="text" when type="number" has unwanted behavior (spinners, locale issues).' },
      { id: 'html-fc-22', front: 'enterkeyhint attribute', back: 'Labels the Enter/Return key on virtual keyboards: "go", "next", "search", "send", "done", "previous".\n\nEnter on a search field becomes a magnifying glass; on the last field of a form, "Done"; in a chat, "Send". Tiny attribute, big affordance improvement.' },
      { id: 'html-fc-23', front: 'Open Graph required tags', back: 'For correct social previews on Facebook, LinkedIn, Discord, Slack:\n• og:title\n• og:type (website, article, video.movie, etc.)\n• og:image (recommended 1200×630, max 5MB)\n• og:url (canonical URL)\n\nRecommended additions: og:description, og:site_name, og:image:alt, og:image:width/height.' },
      { id: 'html-fc-24', front: 'Twitter Card meta tags', back: 'For X (Twitter) link previews. Different namespace than Open Graph:\n• twitter:card — "summary", "summary_large_image", "player", "app"\n• twitter:title, twitter:description, twitter:image\n• twitter:site (@username) for site attribution\n\nIf Twitter tags are missing, X falls back to Open Graph — but explicit twitter:card tags give you control over the layout.' },
      { id: 'html-fc-25', front: 'JSON-LD vs Microdata', back: 'JSON-LD: structured data in a <script type="application/ld+json"> tag. Decoupled from visible HTML — easy to maintain. Recommended by Google.\n\nMicrodata: inline attributes (itemscope, itemtype, itemprop) on existing HTML. Couples markup to display.\n\nBoth work; JSON-LD is now the dominant choice for SEO. RDFa is the third option (similar to Microdata, semantic-web heritage).' },
      { id: 'html-fc-26', front: 'Schema.org Article markup', back: 'Tells search engines this is an article. Required fields: @type=Article, headline, author, datePublished, image, publisher (with logo).\n\nCan unlock the Top Stories carousel and rich result snippets. NewsArticle and BlogPosting are subtypes with stricter requirements.\n\nValidate at Google\'s Rich Results Test before deploying.' },
      { id: 'html-fc-27', front: 'What is the <dialog> element?', back: 'Native modal/dialog with built-in focus management and Escape-to-close.\n\nshow() — non-modal (page interactive behind it).\nshowModal() — modal, traps focus, blocks page interaction, supports ::backdrop pseudo-element.\n\nReplaces years of janky div-based modals. Great browser support since 2022. Pair with the popover attribute for non-modal popovers.' },
      { id: 'html-fc-28', front: 'What does <details>/<summary> do?', back: 'Native disclosure widget — accordion without JS.\n\n<details>\n  <summary>Click to expand</summary>\n  <p>Hidden content</p>\n</details>\n\nopen attribute makes it open by default. Has built-in keyboard accessibility, animation hooks, and screen-reader semantics. Use this before reaching for a custom accordion.' },
      { id: 'html-fc-29', front: 'What is the inert attribute?', back: 'Marks an element and all descendants as non-interactive: removed from tab order, click events ignored, screen readers skip it.\n\nUse on background content when a modal is open, or on a panel that\'s sliding out. Cleaner than juggling tabindex="-1" and aria-hidden manually.' },
      { id: 'html-fc-30', front: 'Skip-to-main-content link', back: 'A link as the first focusable element on the page that jumps to <main>. Visually hidden until focused.\n\nWhy: keyboard users (and screen-reader users) shouldn\'t have to tab through the same nav on every page. With a skip link, one Tab + Enter and they\'re in the content.\n\nLegal accessibility audits look for this; trivial to add.' }
    ],
    quizQuestions: [
      {
        id: 'html-q-1',
        question: 'Which element should contain the main content of a webpage?',
        options: ['<div id="main">', '<main>', '<content>', '<body>'],
        correctAnswer: 1,
        explanation: 'The <main> element represents the dominant content of the <body>. It should be unique to the document and not include repeated content like sidebars or navigation.'
      },
      {
        id: 'html-q-2',
        question: 'What is the correct way to group related form fields?',
        options: ['<div> with class', '<group>', '<fieldset> with <legend>', '<section>'],
        correctAnswer: 2,
        explanation: '<fieldset> groups related form controls, and <legend> provides a caption for the group. This improves accessibility and form organization.'
      },
      {
        id: 'html-q-3',
        question: 'Which attribute helps screen readers understand input requirements?',
        options: ['data-required', 'aria-describedby', 'title', 'placeholder'],
        correctAnswer: 1,
        explanation: 'aria-describedby references an element that provides additional description. Screen readers announce this content when the input is focused.'
      },
      {
        id: 'html-q-4',
        question: 'What does the viewport meta tag control?',
        options: ['Page title', 'Mobile display and scaling', 'SEO ranking', 'Character encoding'],
        correctAnswer: 1,
        explanation: 'The viewport meta tag controls how the page is displayed on mobile devices, including width and initial zoom level.'
      },
      {
        id: 'html-q-5',
        question: 'Which is NOT a semantic HTML element?',
        options: ['<article>', '<nav>', '<div>', '<header>'],
        correctAnswer: 2,
        explanation: '<div> is a generic container with no semantic meaning. It\'s used for styling purposes only, unlike semantic elements that describe their content.'
      },
      {
        id: 'html-q-6',
        question: 'What is the purpose of Open Graph meta tags?',
        options: ['SEO optimization', 'Social media previews', 'Browser caching', 'Security headers'],
        correctAnswer: 1,
        explanation: 'Open Graph tags (og:title, og:image, etc.) control how your page appears when shared on social media platforms like Facebook and LinkedIn.'
      },
      {
        id: 'html-q-7',
        question: 'You need different image crops at mobile vs desktop AND format negotiation between AVIF, WebP, and JPG. What\'s the right markup?',
        options: ['One <img> with srcset', 'background-image in CSS', '<picture> with multiple <source> elements + <img> fallback', 'JavaScript that swaps src on resize'],
        correctAnswer: 2,
        explanation: '<picture> handles BOTH art direction (different crops per breakpoint) and format negotiation (multiple types). srcset alone handles only resolution switching.'
      },
      {
        id: 'html-q-8',
        question: 'A page has 50 product images below the fold. What attribute lets the browser defer their loads until needed, with no JavaScript?',
        options: ['defer', 'async', 'loading="lazy"', 'preload="none"'],
        correctAnswer: 2,
        explanation: 'loading="lazy" on <img> and <iframe> defers loading until they\'re near the viewport. Don\'t use it on above-the-fold images — it can delay LCP.'
      },
      {
        id: 'html-q-9',
        question: 'How many <h1> elements should appear on a typical page?',
        options: ['As many as needed for visual hierarchy', 'Exactly one — the page title', 'One per <section>', 'None — h1 is deprecated'],
        correctAnswer: 1,
        explanation: 'One h1 per page (the title). Skipping levels and multiple h1s break screen-reader navigation and confuse search engines about topic hierarchy.'
      },
      {
        id: 'html-q-10',
        question: 'A video has spoken dialogue. What track kind ensures deaf and hard-of-hearing users can understand it?',
        options: ['kind="subtitles"', 'kind="captions"', 'kind="descriptions"', 'kind="metadata"'],
        correctAnswer: 1,
        explanation: 'Captions include dialogue PLUS sound effects and speaker IDs — built for deaf/HoH users. Subtitles only translate dialogue. Descriptions are audio descriptions of visuals for blind users.'
      },
      {
        id: 'html-q-11',
        question: 'In an accessible data table, what does <th scope="row"> indicate?',
        options: ['The cell is in the first row', 'The cell is a header for its row', 'The cell spans all rows', 'The cell is required'],
        correctAnswer: 1,
        explanation: 'scope="row" tells assistive tech the <th> is a header for its row. scope="col" is column headers. Without scope, screen readers guess from position, which fails on complex tables.'
      },
      {
        id: 'html-q-12',
        question: 'Which autocomplete value lets iOS/Android offer the SMS verification code as autofill?',
        options: ['autocomplete="off"', 'autocomplete="otp"', 'autocomplete="one-time-code"', 'autocomplete="sms"'],
        correctAnswer: 2,
        explanation: 'autocomplete="one-time-code" is the standardized token. Pair with inputmode="numeric" and pattern="[0-9]{6}" for the right keyboard and validation. Massive UX win on 2FA flows.'
      },
      {
        id: 'html-q-13',
        question: 'You want a native modal with built-in focus trap and Escape-to-close, no library. Which element?',
        options: ['<modal>', '<dialog> with showModal()', '<aside>', '<details>'],
        correctAnswer: 1,
        explanation: '<dialog> with .showModal() opens a true modal: traps focus, supports ::backdrop, closes on Escape. <details> is for disclosure widgets, not modals.'
      },
      {
        id: 'html-q-14',
        question: 'Where does Google recommend placing structured data (Article, Product, etc.) for SEO?',
        options: ['In <meta> tags only', 'As JSON-LD in a <script type="application/ld+json"> tag', 'As Microdata attributes inline on every element', 'In a separate sitemap.xml'],
        correctAnswer: 1,
        explanation: 'JSON-LD decouples structured data from your visible HTML, making it easier to add and maintain. Google explicitly recommends JSON-LD over Microdata or RDFa.'
      },
      {
        id: 'html-q-15',
        question: 'A modal is open. What\'s the cleanest way to make the page behind it non-interactive (no tab, no clicks, screen-reader-skipped)?',
        options: ['Apply tabindex="-1" to every focusable element', 'Set inert on the background container', 'Display: none', 'Add CSS pointer-events: none'],
        correctAnswer: 1,
        explanation: 'inert removes the element and all descendants from interaction and screen-reader announcement in one attribute. pointer-events:none doesn\'t handle keyboard or screen readers; display:none hides visually, defeating the modal stacking.'
      },
      {
        id: 'html-q-16',
        question: 'You see <div role="button" onClick={open}>Open</div>. What is still missing for keyboard and screen-reader users?',
        options: ['Nothing — role="button" makes it fully accessible', 'tabindex="0" so it is focusable, plus Enter/Space key handling', 'An aria-label attribute', 'aria-pressed="false"'],
        correctAnswer: 1,
        explanation: 'role only changes what assistive tech announces. A <div> is not focusable and does not fire click on Enter/Space, so you must add tabindex="0" and a keydown handler — or just use a native <button>, which gives all of this for free.'
      },
      {
        id: 'html-q-17',
        question: 'A page has two <nav> elements: the site menu and article pagination. How do screen-reader users tell the landmarks apart?',
        options: ['Give each a unique id', 'Use <menu> for one of them', 'Wrap the second one in <section>', 'Add a distinct aria-label to each <nav>'],
        correctAnswer: 3,
        explanation: 'Landmark navigation lists every <nav> as "navigation". aria-label="Main" and aria-label="Pagination" make the list meaningful. ids are not announced, <menu> is a list element, and <section> without a heading is not even a landmark.'
      },
      {
        id: 'html-q-18',
        question: 'Inside a search form: <button>Search</button><button onclick="reset()">Clear</button>. Clicking Clear submits the form. Why?',
        options: ['onclick handlers always bubble to the form', 'The two buttons share the same name', 'A <button> inside a form defaults to type="submit"', 'The Clear button is missing a value attribute'],
        correctAnswer: 2,
        explanation: 'The default type of <button> is "submit", so any button in a form submits it unless you set type="button". Always be explicit: type="submit" for the real action, type="button" for everything else.'
      },
      {
        id: 'html-q-19',
        question: 'A control opens a dropdown menu and never navigates. Which markup is correct?',
        options: ['<button type="button">', '<a href="#" onclick="...">', '<a> with no href', '<span tabindex="0">'],
        correctAnswer: 0,
        explanation: 'Links are for navigation; buttons are for actions. <a href="#"> announces as a link, scrolls to the top when the handler fails, and confuses "open in new tab". An <a> without href is not even focusable.'
      },
      {
        id: 'html-q-20',
        question: 'Which element semantically conveys that a phrase is important (e.g. "Do not unplug the device"), rather than just looking bold?',
        options: ['<b>', '<strong>', '<span style="font-weight: bold">', '<mark>'],
        correctAnswer: 1,
        explanation: '<strong> means importance, seriousness, or urgency. <b> is "stylistically offset" text with no extra importance (keywords, product names). <em> is stress emphasis and <i> is an alternate voice or technical term; <mark> is highlighting for relevance.'
      }
    ],
    visualizations: [
      {
        id: 'html-viz-1',
        title: 'Semantic Document Structure',
        type: 'diagram',
        description: 'Hierarchical structure of a semantic HTML document',
        nodes: [
          { id: 'html', label: '<html>\nroot', x: 100, y: 50, type: 'primary' },
          { id: 'head', label: '<head>\nmeta', x: 250, y: 50, type: 'secondary' },
          { id: 'body', label: '<body>\ncontent', x: 100, y: 150, type: 'info' },
          { id: 'main', label: '<main>\narticle', x: 250, y: 150, type: 'secondary' }
        ],
        edges: [
          { from: 'html', to: 'head' },
          { from: 'html', to: 'body' },
          { from: 'body', to: 'main' }
        ]
      },
      {
        id: 'html-viz-2',
        title: 'Form Accessibility',
        type: 'diagram',
        description: 'How form elements connect for accessibility',
        nodes: [
          { id: 'label', label: '<label>\nfor attr', x: 100, y: 50, type: 'primary' },
          { id: 'input', label: '<input>\nid attr', x: 250, y: 50, type: 'secondary' },
          { id: 'aria', label: 'aria-*\nattributes', x: 100, y: 150, type: 'info' },
          { id: 'help', label: 'Help\nText', x: 250, y: 150, type: 'secondary' }
        ],
        edges: [
          { from: 'label', to: 'input' },
          { from: 'aria', to: 'help' }
        ]
      }
    ]
  },

  // 2. CSS & Layouts
  {
    id: 'css-layouts',
    name: 'CSS & Layouts',
    slug: 'css-layouts',
    description: 'Master Flexbox, Grid, and modern CSS layout techniques',
    icon: 'color-wand-outline',
    color: '#264DE4',
    colorDark: '#1A3BC2',
    premium: false,
    learnContent: [
      {
        id: 'css-lay-1',
        title: 'Flexbox Fundamentals',
        content: `Flexbox is a one-dimensional layout method for arranging items in rows or columns.

• display: flex creates a flex container
• flex-direction: row (default) or column
• justify-content: alignment along main axis
• align-items: alignment along cross axis
• flex-wrap: wrap items to new lines
• gap: spacing between flex items`,
        codeExample: `.container {
  display: flex;
  flex-direction: row; /* main axis = horizontal */
  justify-content: space-between; /* main-axis spacing */
  align-items: center; /* cross-axis alignment */
  gap: 1rem; /* space between items, no margin hacks */
}

.item {
  flex: 1; /* grow equally */
}`
      },
      {
        id: 'css-lay-2',
        title: 'CSS Grid Layout',
        content: `Grid is a two-dimensional layout system for complex layouts.

• display: grid creates a grid container
• grid-template-columns/rows: define track sizes
• grid-gap or gap: spacing between cells
• grid-column/row: place items in specific cells
• fr unit: fractional unit for flexible sizing
• repeat(): shorthand for repeated patterns`,
        codeExample: `.grid {
  display: grid;
  /* 3 equal-width flexible columns */
  grid-template-columns: repeat(3, 1fr);
  /* middle row stretches to fill space */
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
}

/* 1 / -1 = span from first to last line */
.header { grid-column: 1 / -1; }
.sidebar { grid-row: 2 / 3; }`
      },
      {
        id: 'css-lay-3',
        title: 'Responsive Design',
        content: `Create layouts that adapt to different screen sizes.

• Mobile-first: start with mobile styles, add complexity
• Media queries: @media (min-width: 768px) { }
• Relative units: rem, em, %, vw, vh
• clamp(): responsive values with min/max
• Container queries: style based on parent size`,
        codeExample: `/* Mobile first */
.container {
  padding: 1rem;
  /* clamp(min, preferred, max) scales with viewport */
  font-size: clamp(1rem, 2.5vw, 1.5rem);
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    /* switch to sidebar + content layout */
    display: grid;
    grid-template-columns: 250px 1fr;
  }
}`
      },
      {
        id: 'css-lay-4',
        title: 'CSS Box Model',
        content: `Every element is a box with content, padding, border, and margin.

• content-box (default): width/height = content only
• border-box: width/height includes padding + border
• margin collapse: vertical margins combine
• padding: space inside the border
• Use box-sizing: border-box for predictable sizing`,
        codeExample: `/* Apply border-box globally */
*, *::before, *::after {
  box-sizing: border-box;
}

.card {
  width: 300px; /* includes padding + border */
  padding: 20px;
  border: 2px solid #ccc;
  margin: 10px;
}`
      },
      {
        id: 'css-lay-5',
        title: 'Positioning & Stacking',
        content: `Control element positioning and layering.

• static: default flow
• relative: offset from normal position
• absolute: relative to positioned ancestor
• fixed: relative to viewport
• sticky: hybrid of relative and fixed
• z-index: stacking order (only on positioned elements)`,
        codeExample: `.parent {
  position: relative; /* anchor for absolute child */
}

.tooltip {
  position: absolute; /* positioned vs .parent */
  top: 100%; /* just below the parent */
  left: 50%;
  transform: translateX(-50%); /* center horizontally */
  z-index: 100; /* stack above siblings */
}

.sticky-header {
  position: sticky; /* scrolls, then pins at top: 0 */
  top: 0;
}`
      },
      {
        id: 'css-lay-6',
        title: 'CSS Custom Properties & Theming',
        content: `CSS variables (custom properties) are runtime values that cascade through the DOM — fundamentally different from Sass variables, which are compile-time.

Key facts:
• Defined with --name, read with var(--name, fallback)
• Inherit through the DOM tree like other CSS properties
• Can be UPDATED at runtime via JS or :hover/:focus — Sass cannot
• Scoped: a child can override a parent's variable for itself and its descendants
• Naming convention: --color-primary, --space-md, --font-size-lg

Theming pattern:
• Define semantic tokens (--surface, --text, --border) at :root
• Override the same names under [data-theme="dark"] or @media (prefers-color-scheme: dark)
• Switch theme = toggle the data attribute. No JS reflows components.

Combine with color-mix() and oklch() for token math (e.g., generate hover/active variants from a base color at runtime).`,
        codeExample: `/* Design tokens defined once at the root */
:root {
  --color-bg: oklch(98% 0.01 240);
  --color-text: oklch(20% 0.02 240);
  --color-accent: oklch(65% 0.18 250);
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --radius: 8px;
}

/* Dark mode: override the SAME token names */
[data-theme="dark"] {
  --color-bg: oklch(15% 0.01 240);
  --color-text: oklch(95% 0.01 240);
}

/* Components read tokens — theme-agnostic */
.card {
  background: var(--color-bg);
  color: var(--color-text);
  padding: var(--space-md);
  border-radius: var(--radius);
}

.button:hover {
  /* derive hover tint from base at runtime */
  background: color-mix(in oklch, var(--color-accent), white 10%);
}`
      },
      {
        id: 'css-lay-7',
        title: 'Container Queries',
        content: `Container queries let a component respond to its CONTAINER's size, not the viewport. This is a fundamentally different (and better) primitive than media queries for component-driven design.

Why it matters:
• A card in a sidebar (300px wide) and a card in a main column (800px wide) can now style themselves correctly with the same CSS
• Reusable components stop coupling to global breakpoints
• Layout shifts that would require JS resize listeners are now declarative

Setup:
1. Mark an element as a query container with container-type: inline-size (most common)
2. Optionally name it with container-name
3. Children use @container queries to respond to its size

Container query units (cqw, cqh, cqi, cqb) — like vw/vh but relative to the container, not the viewport.`,
        codeExample: `/* 1. Mark the parent as a query container */
.card-grid {
  container-type: inline-size;
  container-name: cards;
  display: grid;
  gap: 1rem;
}

/* Default (narrow) layout: stacked */
.card {
  display: flex;
  flex-direction: column;
}

/* 2. Respond to the CONTAINER's width, not viewport */
@container cards (min-width: 500px) {
  .card {
    flex-direction: row; /* go horizontal when roomy */
    align-items: center;
  }
  .card__title {
    font-size: 1.5rem;
  }
}

/* Container query units */
.card__title {
  font-size: clamp(1rem, 4cqi, 2rem);
}`
      },
      {
        id: 'css-lay-8',
        title: 'Modern Selectors: :has, :is, :where',
        content: `Three selectors that change how you write CSS.

:has(...) — the long-awaited PARENT selector. Match an element based on what's inside it.
• article:has(img) — articles with images
• form:has(input:invalid) — forms with at least one invalid field
• body:has(dialog[open]) — body when a modal is open (great for locking scroll)

:is(...) — match if any selector in the list matches. Specificity = HIGHEST in the list.
• :is(h1, h2, h3) { margin-block: 1em } — applies to all three
• Useful for shortening lists; specificity comes from the most specific arg

:where(...) — same as :is but specificity is ZERO. Perfect for resets and base styles you want to be easy to override.
• :where(button, [role="button"]) { font: inherit }

:focus-visible: only applies focus styles when keyboard navigation is detected (not mouse clicks). Massive UX win — keyboard users see clear focus rings, mouse users don't see them on every click.

:focus-within: matches an element when ANY descendant is focused. Great for highlighting whole form sections or revealing details when a child input is active.`,
        codeExample: `/* Style a card if it contains a video */
.card:has(video) { padding: 0; }

/* Reset that's easy to override (zero specificity) */
:where(h1, h2, h3, h4, h5, h6) {
  text-wrap: balance;
}

/* Focus only when keyboard-navigated */
button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Highlight a form group when any child is focused */
.field-group:focus-within {
  background: var(--color-bg-active);
}

/* Lock body scroll when a dialog is open */
body:has(dialog[open]) {
  overflow: hidden;
}`
      },
      {
        id: 'css-lay-9',
        title: 'Cascade Layers (@layer)',
        content: `@layer lets you assign explicit ordering to groups of CSS rules — the cascade respects layer order BEFORE specificity. Tames specificity wars without resorting to !important.

Layers later in the document beat earlier layers, regardless of selector specificity. Unlayered styles beat all layered styles.

Common architecture:
1. reset
2. base (typography, defaults)
3. components
4. utilities (overrides)

Now a single-class utility class beats a high-specificity component selector — without !important — because utilities is a later layer.

Imports can be assigned to layers:
@import url("vendor.css") layer(vendor);

Vendor styles can\'t accidentally override your component styles, regardless of how aggressive their selectors are.`,
        codeExample: `/* Declare order once */
@layer reset, base, components, utilities;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; margin: 0; }
}

@layer base {
  body { font: 16px/1.5 system-ui; }
  a { color: inherit; }
}

@layer components {
  .card { padding: 1rem; border: 1px solid var(--border); }
}

@layer utilities {
  .p-0 { padding: 0; } /* beats .card.padding even though specificity is lower */
}

/* Vendor CSS isolated from your styles */
@import url("vendor.css") layer(vendor);`
      },
      {
        id: 'css-lay-10',
        title: 'Logical Properties & RTL Support',
        content: `Logical properties replace physical (left/right/top/bottom) with directions relative to writing mode (start/end/inline/block). One stylesheet works in LTR, RTL, and vertical writing modes.

Mapping:
• left/right → inline-start / inline-end
• top/bottom → block-start / block-end
• width → inline-size
• height → block-size
• margin-left → margin-inline-start
• padding-right → padding-inline-end
• border-top-left-radius → border-start-start-radius

In Arabic/Hebrew (RTL), inline-start automatically becomes the right side. In vertical Japanese writing, inline-start becomes the top. Same CSS, correct everywhere.

Practical tips:
• Default to logical properties in new code
• padding-inline shorthand for left+right; padding-block for top+bottom
• The inset shorthand replaces top/right/bottom/left
• When you genuinely need physical (e.g., a left-side decorative shadow regardless of language), use left/right intentionally`,
        codeExample: `.card {
  /* Logical — works in LTR, RTL, vertical writing */
  padding-inline: var(--space-md);
  padding-block: var(--space-sm);
  margin-inline-end: auto;
  border-start-start-radius: 8px;
}

/* Switch document direction */
[dir="rtl"] .card {
  /* No CSS changes needed — logical props flip automatically */
}

/* inset replaces top/right/bottom/left */
.modal {
  position: fixed;
  inset: 0; /* shorthand for all 4 */
  inset-inline: 1rem; /* just left+right */
}`
      },
      {
        id: 'css-lay-11',
        title: 'Animations, Transitions, View Transitions',
        content: `Three layers of motion in modern CSS.

CSS Transitions — interpolate between two states.
• transition: <prop> <duration> <timing> <delay>
• Animate from an old value to a new value when the value changes
• Cheap, declarative

CSS Animations — keyframed sequences.
• @keyframes name { 0% {} 50% {} 100% {} }
• animation: name duration timing iteration-count direction fill-mode
• More control than transitions; can pause, reverse, run forever

Performance:
• Animate transform and opacity — both run on the compositor (GPU), don't trigger layout/paint
• Don't animate width, top, left — they trigger layout on every frame, jankiness guaranteed
• will-change: transform tells the browser "I'm about to animate this" — adds GPU layer eagerly. Use sparingly; it costs memory.

prefers-reduced-motion: user OS setting. Respect it.
• @media (prefers-reduced-motion: reduce) { * { animation: none; transition: none; } }

View Transitions API (cross-document or in-app):
• document.startViewTransition(() => updateDOM())
• Browser snapshots before/after, animates between them
• Use ::view-transition-* pseudos to customize per-element transitions
• Killer feature for SPA route changes and PWA navigation`,
        codeExample: `/* Transition */
.button {
  transition: transform 0.2s ease, background 0.2s ease;
}
.button:hover { transform: translateY(-2px); }

/* Animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}
.skeleton { animation: pulse 1.5s ease-in-out infinite; }

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* View Transitions */
function navigate(url) {
  if (!document.startViewTransition) {
    return doNavigate(url);
  }
  document.startViewTransition(() => doNavigate(url));
}`
      }
    ],
    flashcards: [
      { id: 'css-fc-1', front: 'What\'s the difference between justify-content and align-items?', back: 'justify-content aligns items along the main axis (horizontal in row, vertical in column). align-items aligns along the cross axis (perpendicular to main).' },
      { id: 'css-fc-2', front: 'What does flex: 1 mean?', back: 'Shorthand for flex-grow: 1, flex-shrink: 1, flex-basis: 0%. The item will grow to fill available space equally with other flex: 1 items.' },
      { id: 'css-fc-3', front: 'What is the fr unit in CSS Grid?', back: 'Fractional unit representing a fraction of available space. 1fr 2fr means the second column gets twice the space of the first.' },
      { id: 'css-fc-4', front: 'How do you span a grid item across all columns?', back: 'Use grid-column: 1 / -1. The -1 refers to the last grid line, making it span from start to end.' },
      { id: 'css-fc-5', front: 'What is the mobile-first approach?', back: 'Writing base styles for mobile, then using min-width media queries to add complexity for larger screens. More performant and easier to maintain.' },
      { id: 'css-fc-6', front: 'What is box-sizing: border-box?', back: 'Makes width and height include padding and border, not just content. Makes sizing more predictable. Usually applied globally with * selector.' },
      { id: 'css-fc-7', front: 'What is margin collapse?', back: 'When vertical margins of adjacent elements combine into a single margin (the larger of the two). Doesn\'t happen with flexbox, grid, or horizontal margins.' },
      { id: 'css-fc-8', front: 'What does position: sticky do?', back: 'Element is relative until it reaches a threshold (top: 0), then becomes fixed. Useful for sticky headers that stay visible while scrolling.' },
      { id: 'css-fc-9', front: 'What is the clamp() function?', back: 'Sets a value with a minimum, preferred, and maximum: clamp(min, preferred, max). Great for responsive typography: clamp(1rem, 2.5vw, 2rem).' },
      { id: 'css-fc-10', front: 'When does z-index work?', back: 'Only on positioned elements (relative, absolute, fixed, sticky). Static elements ignore z-index. Creates stacking contexts.' },
      { id: 'css-fc-11', front: 'CSS variables vs Sass variables', back: 'Sass variables: compile-time only. Resolved when CSS is generated; cannot change at runtime; do not cascade.\n\nCSS custom properties (--name): runtime values that cascade through the DOM. Can be updated by JS or selectors at runtime. Inherit like other properties.\n\nUse CSS variables for theming, dark mode, dynamic spacing. Use Sass for build-time math you don\'t need at runtime.' },
      { id: 'css-fc-12', front: 'Container queries vs media queries', back: 'Media queries respond to the VIEWPORT — global, useful for page-level breakpoints.\n\nContainer queries respond to a CONTAINER\'s size — useful for component-level responsiveness. The same Card stays correctly styled in a 300px sidebar and a 1000px main column.\n\nSetup: container-type: inline-size on the parent, then @container (min-width: 500px) on children.' },
      { id: 'css-fc-13', front: 'What does :has() do?', back: 'The PARENT selector. Matches an element based on what\'s inside it.\n\n• article:has(img) — articles containing an img\n• form:has(:invalid) — forms with an invalid field\n• body:has(dialog[open]) — body when a modal is open\n\nFinally lets CSS express "style the parent if a child is X" without JS. Supported in all modern browsers since 2023.' },
      { id: 'css-fc-14', front: ':is() vs :where() — what\'s the difference?', back: 'Both group selectors: :is(h1, h2, h3) is shorthand for h1, h2, h3.\n\nKey difference: SPECIFICITY.\n• :is() takes the specificity of the MOST specific selector inside it\n• :where() always has zero specificity\n\nUse :where() in resets and base styles you want to be trivially overridable. Use :is() when grouping but specificity matters.' },
      { id: 'css-fc-15', front: ':focus-visible vs :focus', back: ':focus matches whenever an element has focus — including after mouse clicks, which usually shouldn\'t show a focus ring.\n\n:focus-visible only matches when the browser\'s heuristic decides keyboard navigation is in use. Mouse clicks don\'t trigger it.\n\nResult: clear focus outlines for keyboard users (essential), no ugly focus rings on mouse-clicked buttons (nicer UX). Modern default for focus styles.' },
      { id: 'css-fc-16', front: 'What does @layer do?', back: 'Cascade layers — explicit ordering of CSS rule groups, beating specificity for resolution.\n\nLater layers win over earlier layers, regardless of selector specificity. Unlayered styles beat all layered styles.\n\nUsed for: keeping vendor CSS isolated, enabling utility classes to override component styles without !important, structuring large CSS architecture.' },
      { id: 'css-fc-17', front: 'Logical vs physical properties', back: 'Physical: left, right, top, bottom, width, height, margin-left, padding-top, etc.\n\nLogical: inline-start, inline-end, block-start, block-end, inline-size, block-size, margin-inline-start, padding-block-start.\n\nLogical properties adapt to writing mode: in RTL languages, inline-start = right; in vertical writing, inline-start = top. One stylesheet, all layouts.' },
      { id: 'css-fc-18', front: 'aspect-ratio property', back: 'Sets a preferred aspect ratio for an element. Replaces the legacy padding-bottom hack.\n\n.video { aspect-ratio: 16 / 9; }\n\nNo more wrapper divs and absolute positioning. Works on images, videos, divs — anything that can be sized. Browser computes height from width (or vice versa) automatically.' },
      { id: 'css-fc-19', front: 'CSS Native Nesting', back: 'Native CSS now supports nesting (no Sass/PostCSS needed):\n\n.card {\n  padding: 1rem;\n  & h2 { color: blue; }\n  &:hover { background: #eee; }\n  @media (min-width: 600px) { padding: 2rem; }\n}\n\nThe & is required when nesting; bare element selectors won\'t work without it. Supported in all modern browsers since late 2023.' },
      { id: 'css-fc-20', front: 'scroll-snap', back: 'Native CSS for snap-to-element scrolling, no JS.\n\n.scroller {\n  scroll-snap-type: x mandatory;\n  overflow-x: auto;\n}\n.scroller > * {\n  scroll-snap-align: start;\n}\n\nGreat for image carousels, paginated views, mobile bottom sheets. mandatory forces snap; proximity is gentler. scroll-padding leaves room around snap points.' },
      { id: 'css-fc-21', front: 'color-mix() function', back: 'Mix two colors at a percentage in a chosen color space:\n\ncolor-mix(in oklch, var(--brand), white 20%)\n\nLets you derive hover/active variants, alpha blends, and tint scales without preprocessors. Specify the color space (oklch, hsl, srgb) — perceptually uniform spaces like oklch produce smoother gradients than hsl.' },
      { id: 'css-fc-22', front: 'oklch() color', back: 'Modern color function in OKLCH color space (Oklab in cylindrical form).\n\noklch(L C H / alpha)\n• L (lightness): 0–100%\n• C (chroma): 0–~0.4\n• H (hue): 0–360\n\nWhy: perceptually uniform — equal numeric distance = equal visual distance. HSL feels nice but is hue-biased (yellow looks brighter than blue at same L). OKLCH gives you predictable, beautiful color scales.' },
      { id: 'css-fc-23', front: 'View Transitions API', back: 'Native browser API for animating DOM changes — same-document or cross-document.\n\ndocument.startViewTransition(() => updateDOM())\n\nBrowser snapshots the old state, runs your DOM update, snapshots the new state, and animates between them. Customize per-element with view-transition-name and ::view-transition-* pseudos.\n\nKiller feature for SPA route changes and PWA navigation.' },
      { id: 'css-fc-24', front: 'prefers-reduced-motion', back: 'Media query that detects when the user has requested reduced motion (OS-level setting on macOS, iOS, Windows, Android).\n\n@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after {\n    animation-duration: 0.01ms !important;\n    transition-duration: 0.01ms !important;\n  }\n}\n\nVestibular disorders make spinning/zooming animations literally nauseating. Respecting this is an accessibility minimum.' },
      { id: 'css-fc-25', front: 'content-visibility & containment', back: 'content-visibility: auto skips rendering work for off-screen elements until they\'re near the viewport.\n\n.section { content-visibility: auto; contain-intrinsic-size: 0 500px; }\n\nThe contain property is the underlying primitive: contain: layout|paint|style|size|content. Tells the browser "rendering inside this element doesn\'t affect outside" — enables aggressive optimizations. Huge perf win on long pages.' },
      { id: 'css-fc-26', front: 'Why animate transform/opacity instead of top/left?', back: 'transform and opacity run on the compositor (GPU). The browser can animate them WITHOUT recomputing layout or repaint — 60fps even with many elements.\n\ntop/left/width/height trigger layout recalculation on every frame. Layout cascades to siblings and descendants — janky and slow.\n\nRule: position with transform: translate() for animations, not top/left.' },
      { id: 'css-fc-27', front: 'CSS subgrid', back: 'Lets a child grid inherit its parent grid\'s tracks. Without subgrid, nested grids are independent — alignment across cards, for example, is impossible.\n\n.parent { display: grid; grid-template-columns: 1fr 2fr 1fr; }\n.child { display: grid; grid-template-columns: subgrid; }\n\nNow .child uses the parent\'s columns. Critical for card-grid layouts where titles, descriptions, and prices need to line up across cards.' },
      { id: 'css-fc-28', front: 'backdrop-filter', back: 'Applies a filter to the area BEHIND an element (frosted-glass effect).\n\n.modal {\n  background: rgba(255,255,255,0.6);\n  backdrop-filter: blur(20px) saturate(180%);\n}\n\nMacOS Big Sur / iOS modal aesthetic. Combine multiple filters. Performance varies — heavy on low-end devices, so apply selectively.' },
      { id: 'css-fc-29', front: 'accent-color property', back: 'One-liner to color form controls (checkbox, radio, range, progress) on supporting browsers — no manual restyling needed.\n\n:root { accent-color: var(--color-brand); }\n\nLazy but powerful: brand-colored checkboxes and radios in a single declaration, with sensible default contrast. For full custom controls you still need manual styling, but for the 80% case this is enough.' },
      { id: 'css-fc-30', front: 'text-wrap: balance vs pretty', back: 'text-wrap: balance — distributes words across lines so each line is roughly equal length. Best for headlines (avoids "orphan" last lines).\n\ntext-wrap: pretty — for body text. Avoids the last line being a single short word; smarter line-break decisions. Cheaper than balance.\n\nUse balance on h1–h3, pretty on paragraphs. Massive typographic polish for one declaration.' }
    ],
    quizQuestions: [
      {
        id: 'css-q-1',
        question: 'Which property creates a flex container?',
        options: ['flex: 1', 'display: flex', 'flex-direction: row', 'justify-content: center'],
        correctAnswer: 1,
        explanation: 'display: flex on a parent element creates a flex container, enabling flexbox layout for its direct children.'
      },
      {
        id: 'css-q-2',
        question: 'In CSS Grid, what does repeat(3, 1fr) create?',
        options: ['3 rows of equal height', '3 columns of equal width', '3 gaps of 1rem', 'A 3x3 grid'],
        correctAnswer: 1,
        explanation: 'repeat(3, 1fr) creates 3 columns, each taking 1 fraction of available space, making them equal width.'
      },
      {
        id: 'css-q-3',
        question: 'Which is the correct mobile-first media query?',
        options: ['@media (max-width: 768px)', '@media (min-width: 768px)', '@media screen', '@media mobile'],
        correctAnswer: 1,
        explanation: 'min-width queries add styles as the viewport grows. Base styles are for mobile, and larger breakpoints add desktop styles.'
      },
      {
        id: 'css-q-4',
        question: 'What does flex-wrap: wrap do?',
        options: ['Wraps text in items', 'Allows items to wrap to new lines', 'Creates circular layout', 'Adds border around container'],
        correctAnswer: 1,
        explanation: 'flex-wrap: wrap allows flex items to wrap onto multiple lines when they don\'t fit in one row, creating a responsive layout.'
      },
      {
        id: 'css-q-5',
        question: 'Which position value removes an element from normal flow?',
        options: ['relative', 'static', 'absolute', 'sticky'],
        correctAnswer: 2,
        explanation: 'position: absolute removes the element from normal document flow and positions it relative to its nearest positioned ancestor.'
      },
      {
        id: 'css-q-6',
        question: 'What is the default value of flex-direction?',
        options: ['column', 'row', 'row-reverse', 'inherit'],
        correctAnswer: 1,
        explanation: 'flex-direction defaults to row, arranging flex items horizontally from left to right (in LTR languages).'
      },
      {
        id: 'css-q-7',
        question: 'A reusable Card component must look correct in a 300px sidebar AND a 1000px main column. Which feature solves this without coupling to viewport breakpoints?',
        options: ['Media queries', 'Container queries with container-type: inline-size', 'JavaScript resize listeners', 'CSS Grid only'],
        correctAnswer: 1,
        explanation: 'Container queries respond to the container\'s size, not the viewport. The same component now styles itself correctly wherever it\'s placed.'
      },
      {
        id: 'css-q-8',
        question: 'You want to style a form ONLY when one of its inputs is invalid, with no JavaScript. Which selector works?',
        options: ['form.invalid', 'form > input:invalid', 'form:has(:invalid)', 'form[invalid]'],
        correctAnswer: 2,
        explanation: ':has() is the parent selector — match the form based on what\'s inside it. Supported in all modern browsers since 2023.'
      },
      {
        id: 'css-q-9',
        question: 'What\'s the specificity difference between :is() and :where()?',
        options: ['No difference', ':is() takes specificity of the most specific arg; :where() always has zero specificity', ':is() is more specific than :where() by 1', 'Both have zero specificity'],
        correctAnswer: 1,
        explanation: ':where() always has zero specificity — perfect for resets you want to be easily overridable. :is() takes the highest specificity inside it.'
      },
      {
        id: 'css-q-10',
        question: 'Why is animating transform: translate() smoother than animating top/left?',
        options: ['It\'s shorter to type', 'transform runs on the GPU compositor and skips layout/paint per frame', 'transform is newer CSS', 'top/left only work on positioned elements'],
        correctAnswer: 1,
        explanation: 'transform and opacity are composited on the GPU without recomputing layout. top/left/width/height trigger layout per frame — janky on anything but the simplest pages.'
      },
      {
        id: 'css-q-11',
        question: 'Your CSS architecture uses utility classes that should beat component-class styles without !important. Which feature lets you do this declaratively?',
        options: ['Higher specificity selectors', '@layer (cascade layers) ordered as: components, utilities', 'ID selectors', 'Inline styles'],
        correctAnswer: 1,
        explanation: 'Cascade layers respect declared order BEFORE specificity. With @layer components, utilities, a single utility class beats any component selector — no !important needed.'
      },
      {
        id: 'css-q-12',
        question: 'A card has padding-left: 1rem. The site needs to support Arabic (RTL). What\'s the right fix?',
        options: ['Add padding-right: 1rem for RTL via [dir="rtl"]', 'Replace with padding-inline-start: 1rem (logical property)', 'Use JavaScript to flip', 'Force LTR'],
        correctAnswer: 1,
        explanation: 'padding-inline-start automatically becomes the right side in RTL. One stylesheet works everywhere. This is the entire point of logical properties.'
      },
      {
        id: 'css-q-13',
        question: 'How do you give a video a 16:9 aspect ratio without using the padding-bottom hack?',
        options: ['Set both width and height in pixels', 'aspect-ratio: 16 / 9', 'Use a fixed-height parent', 'Use object-fit: cover'],
        correctAnswer: 1,
        explanation: 'The aspect-ratio property — set width OR height, the other dimension is computed from the ratio. Cleanly replaces years of padding-bottom hackery.'
      },
      {
        id: 'css-q-14',
        question: 'A user has prefers-reduced-motion: reduce set in their OS. What should your CSS do?',
        options: ['Ignore it — animations are fine', 'Reduce or eliminate motion via @media (prefers-reduced-motion: reduce)', 'Show a popup asking to confirm', 'Keep animations but slow them down 10x'],
        correctAnswer: 1,
        explanation: 'Vestibular disorders make motion literally nauseating for some users. Respecting the OS preference is an accessibility minimum. Most teams set animation-duration to ~0ms inside that media query.'
      },
      {
        id: 'css-q-15',
        question: 'A button shows a focus ring after every mouse click, which looks bad. What\'s the modern fix?',
        options: ['Remove :focus styles entirely', 'Use :focus-visible instead — only matches keyboard navigation', 'Use outline: none', 'Add JavaScript to clear focus on click'],
        correctAnswer: 1,
        explanation: ':focus-visible only matches when keyboard nav is detected. Keyboard users still get clear focus rings (essential); mouse users don\'t see them on every click. Best of both worlds.'
      },
      {
        id: 'css-q-16',
        question: 'Three rules target the same link: #nav a {}, .nav .link.active {}, and a.link:hover {} (listed last). Which wins?',
        options: ['a.link:hover — it appears last in the stylesheet', '.nav .link.active — three selectors beat two', '#nav a — one ID outranks any number of classes', 'They tie, so the browser uses the default color'],
        correctAnswer: 2,
        explanation: 'Specificity compares (ids, classes/attributes/pseudo-classes, elements) column by column. #nav a is (1,0,1); the other two are (0,3,0) and (0,2,1). A higher id count wins outright — source order only breaks exact ties.'
      },
      {
        id: 'css-q-17',
        question: 'A modal has position: fixed; z-index: 9999, but renders beneath a sibling with z-index: 1. The modal\'s parent has transform: translateZ(0). Why?',
        options: ['z-index has no effect on position: fixed elements', 'transform creates a stacking context, so the modal\'s z-index only competes inside its parent', 'Fixed elements need z-index above 10000', 'The sibling is painted later in DOM order'],
        correctAnswer: 1,
        explanation: 'transform, opacity < 1, filter, will-change, and isolation: isolate all create stacking contexts. Inside one, z-index is local; the whole subtree is layered by the parent\'s own z-index. Fix: remove the transform or render the modal in a portal at the body level.'
      },
      {
        id: 'css-q-18',
        question: 'A badge inside a .card uses position: absolute; top: 0; right: 0, but appears at the top-right of the entire page. Why?',
        options: ['Absolute elements always position against the viewport', 'The card has overflow: visible', 'The badge needs position: relative instead', 'The card is not positioned, so the containing block is the initial containing block'],
        correctAnswer: 3,
        explanation: 'An absolutely positioned element is placed relative to its nearest positioned ancestor (position other than static). With none, it falls back to the initial containing block at the document top. Adding position: relative to .card fixes it.'
      },
      {
        id: 'css-q-19',
        question: 'A flex item with flex: 1 contains a long unbreakable URL and overflows its container instead of shrinking. Why?',
        options: ['Flex items default to min-width: auto, so they cannot shrink below their content size', 'flex-shrink defaults to 0', 'flex: 1 sets flex-basis to 100%', 'Text is never allowed to shrink inside flex'],
        correctAnswer: 0,
        explanation: 'The implied min-width: auto on flex (and grid) items is a classic gotcha. Set min-width: 0 (or overflow: hidden) on the item so it can shrink; in grid, use minmax(0, 1fr) instead of 1fr for the same reason.'
      },
      {
        id: 'css-q-20',
        question: 'A settings form needs labels and inputs to line up in columns across every row, and one row must span two lines. Which layout tool?',
        options: ['Flexbox with flex-wrap', 'CSS Grid', 'display: inline-block with fixed widths', 'CSS multi-column (column-count)'],
        correctAnswer: 1,
        explanation: 'Flexbox is one-dimensional: each wrapped line lays out independently, so columns never align across rows. Grid is two-dimensional — items snap to shared tracks and can span rows/columns. Use flex for one-axis distribution (nav bars, button groups).'
      }
    ],
    visualizations: [
      {
        id: 'css-viz-1',
        title: 'Flexbox Axes',
        type: 'diagram',
        description: 'Main axis and cross axis in Flexbox',
        nodes: [
          { id: 'container', label: 'Flex Container', x: 200, y: 30 },
          { id: 'main', label: 'Main Axis →', x: 120, y: 110 },
          { id: 'cross', label: 'Cross Axis ↓', x: 280, y: 110 },
          { id: 'justify', label: 'justify-content', x: 120, y: 180 },
          { id: 'align', label: 'align-items', x: 280, y: 180 }
        ],
        edges: [
          { from: 'container', to: 'main' },
          { from: 'container', to: 'cross' },
          { from: 'main', to: 'justify', label: 'controls' },
          { from: 'cross', to: 'align', label: 'controls' }
        ]
      },
      {
        id: 'css-viz-2',
        title: 'CSS Box Model',
        type: 'diagram',
        description: 'Layers of the CSS box model',
        nodes: [
          { id: 'margin', label: 'Margin\nouter', x: 100, y: 50, type: 'info' },
          { id: 'border', label: 'Border\nvisible', x: 250, y: 50, type: 'secondary' },
          { id: 'padding', label: 'Padding\ninner', x: 100, y: 150, type: 'secondary' },
          { id: 'content', label: 'Content\nbox', x: 250, y: 150, type: 'primary' }
        ],
        edges: [
          { from: 'margin', to: 'border' },
          { from: 'border', to: 'content' },
          { from: 'padding', to: 'content' }
        ]
      }
    ]
  },

  // 3. JavaScript Fundamentals
  {
    id: 'js-fundamentals',
    name: 'JavaScript Fundamentals',
    slug: 'js-fundamentals',
    description: 'Core JavaScript concepts: closures, async, prototypes',
    icon: 'code-outline',
    color: '#F7DF1E',
    colorDark: '#C9B617',
    premium: true,
    learnContent: [
      {
        id: 'js-fund-1',
        title: 'Closures',
        content: `A closure is a function that retains access to its outer scope even after the outer function has returned.

• Inner functions "close over" variables from outer scope
• Enables data privacy and encapsulation
• Powers patterns like module pattern and currying
• Each closure maintains its own scope chain`,
        codeExample: `function createCounter() {
  let count = 0; // private variable

  return {
    increment() { return ++count; },
    getCount() { return count; }
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
// count is not accessible directly`
      },
      {
        id: 'js-fund-2',
        title: 'Promises & Async/Await',
        content: `Promises represent eventual completion or failure of async operations.

• Pending: initial state
• Fulfilled: operation completed successfully
• Rejected: operation failed
• async/await: syntactic sugar over promises
• Promise.all(): wait for multiple promises
• Promise.race(): first promise to settle wins`,
        codeExample: `// Async/await
async function fetchUser(id) {
  try {
    // await pauses here until the promise settles
    const res = await fetch(\`/api/users/\${id}\`);
    return await res.json();
  } catch (err) {
    // catches network errors AND rejected awaits
    console.error(err);
  }
}

// Parallel requests
// both start immediately; await waits for both
const [user, posts] = await Promise.all([
  fetchUser(1),
  fetchPosts(1)
]);`
      },
      {
        id: 'js-fund-3',
        title: 'Event Loop',
        content: `JavaScript is single-threaded but handles async operations via the event loop.

• Call Stack: synchronous code execution
• Web APIs: handle async operations (setTimeout, fetch)
• Callback Queue: holds callbacks ready to execute
• Microtask Queue: promises, higher priority
• Event Loop: moves tasks to call stack when empty`,
        codeExample: `console.log('1'); // sync - first

setTimeout(() => {
  console.log('2'); // macro - last
}, 0);

Promise.resolve().then(() => {
  console.log('3'); // micro - second
});

console.log('4'); // sync - after 1

// Output: 1, 4, 3, 2`
      },
      {
        id: 'js-fund-4',
        title: 'this Keyword',
        content: `The value of 'this' depends on how a function is called.

• Global context: window (browser) or global (Node)
• Object method: the object calling the method
• Constructor: the new instance
• Arrow functions: inherit from enclosing scope
• call/apply/bind: explicitly set this`,
        codeExample: `const obj = {
  name: 'Alice',
  greet() {
    console.log(this.name); // 'Alice'
  },
  greetArrow: () => {
    console.log(this.name); // undefined
  }
};

// Explicit binding
function sayHi() { console.log(this.name); }
sayHi.call({ name: 'Bob' }); // 'Bob'

// Bind creates new function
const boundFn = sayHi.bind({ name: 'Carol' });`
      },
      {
        id: 'js-fund-5',
        title: 'Destructuring & Spread',
        content: `Modern syntax for extracting values and spreading iterables.

• Array destructuring: [a, b] = [1, 2]
• Object destructuring: {name} = obj
• Default values: {name = 'default'} = obj
• Rest operator: collect remaining items
• Spread operator: expand iterables`,
        codeExample: `// Destructuring
const { name, age = 18 } = user;
const [first, ...rest] = [1, 2, 3, 4];

// Spread
const newArr = [...arr1, ...arr2];
const newObj = { ...obj1, ...obj2 };

// Function parameters
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}

// Swap variables
[a, b] = [b, a];`
      },
      {
        id: 'js-fund-6',
        title: 'Prototypal Inheritance & Classes',
        content: `JavaScript inheritance is prototypal — every object has a hidden link ([[Prototype]]) to another object, forming a chain. Looking up a property walks the chain until found or the chain ends at null.

class is syntactic sugar over this. When you write class Foo extends Bar, JS sets Foo.prototype.[[Prototype]] = Bar.prototype, so instances inherit Bar's methods.

Key facts:
• obj.__proto__ (or Object.getPrototypeOf(obj)) returns the prototype
• Constructor.prototype is the object instances inherit from
• Methods on the class go on Class.prototype (shared); fields go on each instance
• Static methods are on the constructor itself, not on instances
• Object.create(proto) — make a new object with the given prototype

Modern class features:
• Private fields with # (truly private, enforced by engine)
• Static blocks for class-level setup
• Static private members
• Public class fields (no constructor needed for simple init)`,
        codeExample: `class Animal {
  #species; // private field
  static count = 0; // lives on the class, not instances

  constructor(name, species) {
    this.name = name; // per-instance data
    this.#species = species;
    Animal.count++;
  }

  // methods are shared via Animal.prototype
  describe() {
    return \`\${this.name} (\${this.#species})\`;
  }
}

class Dog extends Animal {
  constructor(name) {
    super(name, 'Canis familiaris'); // run parent constructor
  }

  bark() { return 'Woof!'; }
}

const d = new Dog('Rex');
d.describe();         // "Rex (Canis familiaris)"
d.bark();             // "Woof!"
Object.getPrototypeOf(d) === Dog.prototype;        // true
Object.getPrototypeOf(Dog.prototype) === Animal.prototype; // true`
      },
      {
        id: 'js-fund-7',
        title: 'Modules: ESM, CommonJS, Dynamic Imports',
        content: `Two module systems coexist in the JS world:

CommonJS (Node legacy):
• require('./mod') / module.exports = ...
• Synchronous, dynamic — module.exports can change at runtime
• Cannot be tree-shaken (dynamic by nature)

ESM (modern, standard):
• import / export, with static analysis
• Asynchronous, statically analyzable
• Tree-shakable (bundlers eliminate unused exports)
• Top-level await is allowed
• Live bindings — imported variables track their source

Dynamic import():
• Runtime, returns a Promise resolving to the module namespace
• Enables code-splitting and on-demand loading
• const { heavyFn } = await import('./heavy.js')

import maps (browser):
• Map bare specifiers (import x from 'lodash') to URLs in the browser without a bundler
• Useful for unbundled dev or import-map-based deployment

Side effects: ESM tree shakers preserve modules with side effects unless you mark "sideEffects": false in package.json. Pure functional modules tree-shake best.`,
        codeExample: `// ESM
export function add(a, b) { return a + b; }
export const PI = 3.14159;
export default class Calculator { /* ... */ }

import Calc, { add, PI } from './math.js';

// Dynamic import for code splitting
button.addEventListener('click', async () => {
  const { renderChart } = await import('./chart-lib.js');
  renderChart(data);
});

// Top-level await (ESM only)
const config = await fetch('/api/config').then(r => r.json());
export { config };`
      },
      {
        id: 'js-fund-8',
        title: 'Iterators & Generators',
        content: `The iterator protocol is what for...of, spread, and destructuring use under the hood.

Iterator protocol:
• An object is iterable if it has a [Symbol.iterator]() method
• That method returns an iterator: an object with next() returning { value, done }
• Strings, Arrays, Maps, Sets, NodeLists, generators are all iterable

Generators (function*) — easy way to write iterators:
• yield pauses and returns a value
• Resumes on next call to .next()
• Each call advances one yield at a time
• yield* delegates to another iterable

Async iterators (Symbol.asyncIterator):
• .next() returns Promise<{ value, done }>
• Iterate with for await...of
• Used for streaming APIs: fetch streams, Node streams, paginated APIs

Generators are also useful for:
• Coroutine-like code with explicit pause points
• Lazy infinite sequences (only what's consumed is computed)
• State machines`,
        codeExample: `// Sync generator: lazy infinite sequence
function* naturals() {
  let n = 0;
  while (true) yield n++;
}

const it = naturals();
[...take(5, it)]; // [0, 1, 2, 3, 4]

// Async generator: paginated API as a stream
async function* fetchPages(url) {
  let next = url;
  while (next) {
    const page = await fetch(next).then(r => r.json());
    yield* page.items;
    next = page.next;
  }
}

for await (const item of fetchPages('/api/items')) {
  console.log(item);
  if (someCondition) break; // generator naturally stops
}

// Custom iterable
class Range {
  constructor(start, end) { this.start = start; this.end = end; }
  *[Symbol.iterator]() {
    for (let i = this.start; i < this.end; i++) yield i;
  }
}
[...new Range(1, 5)]; // [1, 2, 3, 4]`
      },
      {
        id: 'js-fund-9',
        title: 'Memory Management & Leaks',
        content: `JavaScript GC is generational mark-and-sweep — the engine periodically traces references from roots (globals, the call stack) and frees anything unreachable.

You don't free memory manually, but you absolutely can leak it.

Common leak patterns:
• Forgetting to clear setInterval / event listeners / observers when a component unmounts → references to old DOM/objects persist
• Detached DOM nodes referenced by JS — element removed from DOM but kept alive by a closure variable
• Closures over large objects: retaining a callback that closes over a large data structure means the data structure stays in memory
• Global registries (caches keyed by string) that never shrink
• Maps/Sets used as caches with strong references

Tools to debug:
• Chrome DevTools → Memory tab → Heap snapshot, then "Comparison" between two snapshots
• "Detached DOM" filter shows nodes leaked from the DOM tree

Weak references:
• WeakMap / WeakSet: keys are held weakly. If nothing else references the key, GC reclaims it. Use as a cache or metadata store keyed by objects you don't own the lifetime of.
• WeakRef + FinalizationRegistry: low-level primitives for weak references and cleanup callbacks. Rarely needed; usually WeakMap/WeakSet is the right tool.

Rule: if you add a listener, store an interval, or stash an object in a global, write the cleanup at the same time.`,
        codeExample: `// Leak: setInterval references the closure forever
function startTracker(user) {
  const huge = loadProfileData(user); // megabytes
  setInterval(() => report(user.id), 1000);
  // huge stays alive because the interval's closure holds 'user'
  // and 'huge' is in the same scope
}

// Fix: scope huge tightly
function startTracker(user) {
  setInterval(() => report(user.id), 1000);
}

// WeakMap as object metadata
const meta = new WeakMap();
function tagElement(el, info) {
  meta.set(el, info);
}
// When el is removed from DOM and no JS references it,
// GC frees both el AND its metadata automatically.`
      },
      {
        id: 'js-fund-10',
        title: 'Proxies, Reflect & Symbols',
        content: `Three pieces that work together to enable runtime metaprogramming.

Symbol:
• Symbol() creates a unique, immutable primitive
• Used as object keys that won't collide with string keys
• Well-known symbols hook into language behavior: Symbol.iterator, Symbol.asyncIterator, Symbol.toPrimitive, Symbol.hasInstance

Proxy:
• Wrap an object with a "trap" handler that intercepts operations (get, set, has, deleteProperty, etc.)
• Power: validation, logging, virtualized objects, observable state, devtools
• Cost: every operation pays a small overhead

Reflect:
• Function-style alternatives to operators (Reflect.get, Reflect.set, Reflect.deleteProperty, Reflect.has, Reflect.construct)
• Inside a Proxy trap, call Reflect.* to forward to the default behavior cleanly
• Reflect.ownKeys returns string AND symbol keys (Object.keys returns only string keys)

Real-world examples:
• Vue 3 reactivity: Proxy traps every property access to track reads (for re-rendering)
• MobX, Immer, valtio: same idea
• Schema validators: Proxy throws on writes that fail a schema check`,
        codeExample: `// Reactive object: track all reads, log all writes
const data = new Proxy({ count: 0 }, {
  get(target, key) {
    console.log('read', key);
    return Reflect.get(target, key);
  },
  set(target, key, value) {
    console.log('write', key, value);
    return Reflect.set(target, key, value);
  }
});

data.count;        // logs "read count" → 0
data.count = 5;    // logs "write count 5"

// Symbol as private-ish key
const PRIVATE = Symbol('private');
class Box {
  constructor(v) { this[PRIVATE] = v; }
  get() { return this[PRIVATE]; }
}
// Object.keys(new Box(1)) returns [] — symbol keys aren't enumerated`
      },
      {
        id: 'js-fund-11',
        title: 'Modern Error Handling',
        content: `Beyond try/catch — JavaScript has grown several patterns for handling errors well in async code.

Error types:
• Error, TypeError, RangeError, SyntaxError, ReferenceError, URIError
• Custom: extend Error, set name, attach context

Error cause (ES2022):
• throw new Error('outer', { cause: originalError })
• Preserves the chain — inspect with err.cause
• Replaces brittle string-mangling of inner messages

AggregateError:
• Holds multiple errors as a single thrown value
• Promise.any() throws AggregateError when all promises reject
• Custom code can use it for batch failures

Async error patterns:
• try/catch around await — handles thrown promises
• .catch() on the promise chain — same outcome, different style
• Top-level handlers: window.addEventListener('error') and 'unhandledrejection'
• Don't swallow errors silently — at minimum log + monitor

AbortController:
• Cancel ongoing async work (fetch, streams, custom code)
• const ctrl = new AbortController(); fetch(url, { signal: ctrl.signal })
• ctrl.abort() throws an AbortError where the signal was being awaited
• Compose with AbortSignal.timeout(ms) for time limits

Pattern: every async operation that could outlive its caller (component unmount, request abandoned) should accept an AbortSignal.`,
        codeExample: `// Custom error: carries status + preserves cause chain
class ApiError extends Error {
  constructor(message, { status, cause } = {}) {
    super(message, { cause }); // cause links original error
    this.name = 'ApiError';
    this.status = status;
  }
}

async function getUser(id, { signal } = {}) {
  try {
    const res = await fetch(\`/users/\${id}\`, { signal });
    // fetch doesn't throw on 4xx/5xx — check manually
    if (!res.ok) throw new ApiError(\`HTTP \${res.status}\`, { status: res.status });
    return await res.json();
  } catch (e) {
    // let cancellation bubble up unchanged
    if (e.name === 'AbortError') throw e;
    throw new ApiError('Failed to load user', { cause: e });
  }
}

// Cancellable usage
const ctrl = new AbortController();
const userPromise = getUser(42, { signal: ctrl.signal });
setTimeout(() => ctrl.abort(), 5000); // 5-second timeout`
      }
    ],
    flashcards: [
      { id: 'js-fc-1', front: 'What is a closure?', back: 'A function that has access to variables from its outer (enclosing) scope, even after the outer function has returned. It "closes over" the variables.' },
      { id: 'js-fc-2', front: 'What are the three states of a Promise?', back: 'Pending (initial), Fulfilled (resolved successfully), and Rejected (failed). Once settled (fulfilled or rejected), the state cannot change.' },
      { id: 'js-fc-3', front: 'What\'s the difference between microtasks and macrotasks?', back: 'Microtasks (promises) have higher priority and run before macrotasks (setTimeout, setInterval). All microtasks complete before any macrotask.' },
      { id: 'js-fc-4', front: 'What does async/await do?', back: 'Syntactic sugar over promises. async functions return promises, await pauses execution until promise resolves, making async code look synchronous.' },
      { id: 'js-fc-5', front: 'What is hoisting?', back: 'JavaScript moves declarations to the top of their scope. var is hoisted and initialized to undefined. let/const are hoisted but not initialized (temporal dead zone).' },
      { id: 'js-fc-6', front: 'How does "this" work in arrow functions?', back: 'Arrow functions don\'t have their own "this". They inherit "this" from the enclosing lexical scope at the time of definition.' },
      { id: 'js-fc-7', front: 'What does the spread operator do?', back: 'Expands an iterable (array, string) into individual elements. [...arr] copies array, {...obj} copies object. Also used for function arguments.' },
      { id: 'js-fc-8', front: 'What is the temporal dead zone?', back: 'The period between entering a scope and the let/const declaration being executed. Accessing the variable during this time throws a ReferenceError.' },
      { id: 'js-fc-9', front: 'What does Promise.all() return if one promise rejects?', back: 'It rejects immediately with the first rejection reason. Use Promise.allSettled() if you need all results regardless of individual failures.' },
      { id: 'js-fc-10', front: 'What is the difference between == and ===?', back: '== performs type coercion before comparison. === (strict equality) compares without coercion - both value and type must match. Always prefer ===.' },
      { id: 'js-fc-11', front: 'What is the prototype chain?', back: 'Every object has a hidden link ([[Prototype]]) to another object. Property lookup walks this chain until found or null.\n\nClasses use it: Dog.prototype.[[Prototype]] = Animal.prototype, so Dog instances inherit Animal\'s methods.\n\nAccess: Object.getPrototypeOf(obj) (or the legacy obj.__proto__).' },
      { id: 'js-fc-12', front: 'Is class real inheritance or syntactic sugar?', back: 'Sugar over prototypal inheritance. class Foo extends Bar sets Foo.prototype.[[Prototype]] = Bar.prototype.\n\nUnder the hood it\'s the same prototype chain you could build manually with Object.create. The class syntax adds: cleaner syntax, super, private fields (#), static blocks, enforced constructor invariants (must use new).' },
      { id: 'js-fc-13', front: 'ESM vs CommonJS', back: 'CommonJS (Node legacy): require()/module.exports. Synchronous, dynamic — exports can change at runtime. Cannot be tree-shaken.\n\nESM (modern standard): import/export. Asynchronous, statically analyzable, tree-shakable, supports top-level await, live bindings.\n\nNew code should be ESM. Some packages dual-publish via "exports" field in package.json.' },
      { id: 'js-fc-14', front: 'Why does ESM enable tree shaking?', back: 'ESM imports/exports are STATIC — bundlers can analyze them at build time and know exactly what\'s used.\n\nCommonJS require() is dynamic JavaScript: require(condition ? "a" : "b") could resolve anywhere. Bundlers must conservatively keep everything.\n\nMark your package "sideEffects": false in package.json so bundlers can drop unused exports without worrying about hidden top-level effects.' },
      { id: 'js-fc-15', front: 'Dynamic import()', back: 'Runtime import that returns a Promise resolving to the module namespace.\n\nconst { renderChart } = await import(\'./chart-lib.js\');\n\nUses:\n• Code splitting — load the heavy chart library only when the user opens the analytics page\n• Conditional loading — feature flags, dev-only modules\n• Loading from a URL computed at runtime\n\nWorks in both ESM and CJS contexts.' },
      { id: 'js-fc-16', front: 'Top-level await', back: 'Inside an ESM module, you can await without wrapping in an async function.\n\n// module.js\nconst config = await loadConfig();\nexport { config };\n\nThe importing module waits for this module\'s top-level awaits to settle before it gets the exports. Useful for config, dynamic dependencies, lazy initialization. Only works in ESM, never in CommonJS.' },
      { id: 'js-fc-17', front: 'Iterator protocol', back: 'An object is iterable if it has a [Symbol.iterator]() method that returns an iterator (an object with a next() method that returns { value, done }).\n\nfor...of, spread (...arr), and array destructuring all consume iterators.\n\nString, Array, Map, Set, NodeList, generators are iterable. Plain objects are NOT — Object.keys/values/entries return iterables you can iterate.' },
      { id: 'js-fc-18', front: 'Generators (function*)', back: 'Functions that can pause and resume:\n\nfunction* fib() {\n  let [a, b] = [0, 1];\n  while (true) { yield a; [a, b] = [b, a+b]; }\n}\n\nyield pauses; .next() resumes. Each call advances one yield. Powerful for: lazy infinite sequences, custom iterables, state machines, coroutine-style code.' },
      { id: 'js-fc-19', front: 'Async generators', back: 'Generators that yield Promises. Iterate with for await...of.\n\nasync function* paginate(url) {\n  let next = url;\n  while (next) {\n    const page = await fetch(next).then(r => r.json());\n    yield* page.items;\n    next = page.next;\n  }\n}\n\nfor await (const item of paginate(\'/api\')) { ... }\n\nPerfect for streaming APIs, paginated endpoints, and Node streams.' },
      { id: 'js-fc-20', front: 'WeakMap vs Map', back: 'Map: keys held strongly. As long as the Map exists, its keys (and their entries) are kept alive — even if nothing else references them.\n\nWeakMap: keys held weakly. If nothing else references a key, GC reclaims the key AND its entry automatically.\n\nUse WeakMap when associating metadata to objects you don\'t own the lifetime of (DOM elements, third-party objects). Keys must be objects, not primitives.' },
      { id: 'js-fc-21', front: 'Common JS memory leak: detached DOM', back: 'You remove an element from the DOM but JS still holds a reference to it (in an array, closure, or global). The element and its subtree can\'t be GC\'d.\n\nDevTools heap snapshot → "Detached" filter shows them.\n\nFix: clear references when removing nodes (set arr.length=0, null out captured vars, remove event listeners). Or store references in a WeakMap so they don\'t pin the elements.' },
      { id: 'js-fc-22', front: 'structuredClone()', back: 'Built-in deep clone. Handles cyclic references, Maps, Sets, Dates, ArrayBuffers, typed arrays.\n\nconst copy = structuredClone(original);\n\nUnlike JSON.parse(JSON.stringify(x)):\n• Handles non-JSON values (Date stays Date, not string)\n• Handles cycles (would infinite-loop with JSON)\n• Doesn\'t silently lose Map/Set\n\nDoes NOT clone functions, DOM nodes, or class prototypes (returns plain objects for class instances).' },
      { id: 'js-fc-23', front: 'What does Proxy do?', back: 'Wraps an object with a handler that intercepts operations: get, set, has, deleteProperty, ownKeys, etc.\n\nUsed for: reactivity (Vue 3, MobX), schema validation, logging, virtualized objects, immutable wrappers (Immer).\n\nEvery operation through the proxy pays a small overhead — fine for app code, avoid in extreme hot paths.' },
      { id: 'js-fc-24', front: 'Reflect API', back: 'Function-style alternatives to operators: Reflect.get, Reflect.set, Reflect.has, Reflect.deleteProperty, Reflect.construct.\n\nMain use: inside a Proxy trap, call the matching Reflect method to forward to the default behavior — cleaner than reimplementing it.\n\nReflect.ownKeys(obj) returns string AND symbol keys (Object.keys returns only enumerable string keys).' },
      { id: 'js-fc-25', front: 'Symbol — what is it for?', back: 'Symbol() creates a unique, immutable primitive. Two symbols are never equal, even with the same description.\n\nUses:\n• Object keys that won\'t collide with string keys (private-ish data)\n• Well-known symbols hook into language behavior: Symbol.iterator, Symbol.asyncIterator, Symbol.toPrimitive, Symbol.hasInstance\n\nSymbol-keyed properties are skipped by JSON.stringify and Object.keys.' },
      { id: 'js-fc-26', front: 'Optional chaining (?.)', back: 'Short-circuits property access if the left side is null or undefined.\n\nuser?.profile?.name\n\nReturns undefined if any link is nullish, instead of throwing TypeError. Also works with method calls (obj?.method()) and bracket access (arr?.[0]).\n\nGotcha: doesn\'t check for empty string, 0, false — only null and undefined.' },
      { id: 'js-fc-27', front: 'Nullish coalescing (??) vs ||', back: '|| treats ALL falsy values as missing: 0, "", false, null, undefined.\n\nport || 8080 returns 8080 even if port=0 (a valid port).\n\n?? only treats null and undefined as missing. port ?? 8080 returns 0 when port=0, 8080 when port=null. Use ?? for "actual missing values," || for "any falsy."' },
      { id: 'js-fc-28', front: 'Logical assignment operators', back: '||=, &&=, ??= — assign only if the LHS passes the test.\n\nx ||= y → x = x || y (assign if x is falsy)\nx &&= y → x = x && y (assign if x is truthy)\nx ??= y → x = x ?? y (assign if x is null/undefined)\n\nGreat for "default if missing": config.timeout ??= 5000.' },
      { id: 'js-fc-29', front: 'AbortController', back: 'Cancel ongoing async work via a signal.\n\nconst ctrl = new AbortController();\nfetch(url, { signal: ctrl.signal });\nctrl.abort(); // fetch rejects with AbortError\n\nWorks with: fetch, addEventListener, ReadableStream, MutationObserver, custom code that checks signal.aborted or listens for "abort" event.\n\nAbortSignal.timeout(ms) is a built-in for time limits.' },
      { id: 'js-fc-30', front: 'Error cause (ES2022)', back: 'throw new Error(\'outer\', { cause: originalError });\n\nPreserves the chain — inspect with err.cause. Replaces fragile string-concat of inner messages.\n\nWorks with custom Error subclasses too — pass { cause } to super(). Logging and observability tools usually walk the cause chain to show full context.' }
    ],
    quizQuestions: [
      {
        id: 'js-q-1',
        question: 'What will console.log output: let a = 1; function f() { console.log(a); let a = 2; } f();',
        options: ['1', '2', 'undefined', 'ReferenceError'],
        correctAnswer: 3,
        explanation: 'let is hoisted but not initialized, creating a "temporal dead zone". Accessing it before declaration throws a ReferenceError.'
      },
      {
        id: 'js-q-2',
        question: 'Which runs first: setTimeout(() => {}, 0) or Promise.resolve().then(() => {})?',
        options: ['setTimeout', 'Promise.then', 'They run simultaneously', 'It\'s random'],
        correctAnswer: 1,
        explanation: 'Promise callbacks are microtasks, setTimeout is a macrotask. Microtasks always run before macrotasks in the event loop.'
      },
      {
        id: 'js-q-3',
        question: 'What does Promise.all() return if one promise rejects?',
        options: ['Array with null for failed', 'First rejection reason', 'Array of all results', 'undefined'],
        correctAnswer: 1,
        explanation: 'Promise.all() fails fast - it rejects immediately when any promise rejects, with the reason of the first rejection.'
      },
      {
        id: 'js-q-4',
        question: 'What is the value of "this" in an arrow function?',
        options: ['The global object', 'undefined', 'Inherited from enclosing scope', 'The function itself'],
        correctAnswer: 2,
        explanation: 'Arrow functions don\'t have their own "this" binding. They inherit "this" from the enclosing lexical scope where they were defined.'
      },
      {
        id: 'js-q-5',
        question: 'What does [...arr] create?',
        options: ['A reference to arr', 'A shallow copy of arr', 'A deep copy of arr', 'An object from arr'],
        correctAnswer: 1,
        explanation: 'The spread operator creates a shallow copy. Nested objects/arrays are still references to the originals.'
      },
      {
        id: 'js-q-6',
        question: 'What is a closure used for?',
        options: ['Closing browser tabs', 'Data privacy and encapsulation', 'Ending loops', 'Error handling'],
        correctAnswer: 1,
        explanation: 'Closures enable data privacy by keeping variables in an outer scope accessible only through returned functions, creating private state.'
      },
      {
        id: 'js-q-7',
        question: 'Object.getPrototypeOf(new Dog()) === ?',
        options: ['Animal', 'Animal.prototype', 'Dog.prototype', 'Object.prototype'],
        correctAnswer: 2,
        explanation: 'An instance\'s prototype is its class\'s .prototype property. Walking one more step (Object.getPrototypeOf(Dog.prototype)) gets you Animal.prototype if Dog extends Animal.'
      },
      {
        id: 'js-q-8',
        question: 'Why does ESM enable tree shaking but CommonJS doesn\'t?',
        options: ['ESM is faster', 'ESM imports are statically analyzable; CommonJS require() is dynamic JS', 'ESM is newer', 'CommonJS forbids tree shaking explicitly'],
        correctAnswer: 1,
        explanation: 'Bundlers can determine ESM imports/exports at build time. CommonJS require() can be any JavaScript expression, so bundlers must keep everything to be safe.'
      },
      {
        id: 'js-q-9',
        question: 'You want a heavy charting library to load only when the user opens the analytics page. Best approach?',
        options: ['import at the top of every file', 'await import(\'./chart-lib.js\') when the page opens', 'Inline the library in HTML', 'Eager-load with a script tag'],
        correctAnswer: 1,
        explanation: 'Dynamic import() lets the bundler split the library into a separate chunk loaded on demand. Massive savings on initial bundle size.'
      },
      {
        id: 'js-q-10',
        question: 'When should you use WeakMap instead of Map?',
        options: ['Always — it\'s faster', 'When keys are objects whose lifetime you don\'t own — entries should disappear when the keys do', 'For primitive keys', 'For very large maps'],
        correctAnswer: 1,
        explanation: 'WeakMap keys are held weakly. Use it for metadata associated with objects (DOM nodes, third-party objects) so the metadata is freed automatically when the keys become unreachable.'
      },
      {
        id: 'js-q-11',
        question: 'config.timeout is 0. What does config.timeout || 5000 evaluate to vs config.timeout ?? 5000?',
        options: ['Both 0', 'Both 5000', '|| returns 5000 (treats 0 as missing); ?? returns 0', '|| returns 0; ?? returns 5000'],
        correctAnswer: 2,
        explanation: '|| treats ALL falsy values as missing — 0, "", false, null, undefined. ?? only treats null/undefined as missing. Use ?? for "actual missing" defaults; reach for || only when you mean "any falsy."'
      },
      {
        id: 'js-q-12',
        question: 'Vue 3 makes a plain object reactive — accessing a property re-renders dependent components. Which JS feature powers this?',
        options: ['Object.defineProperty', 'Proxy', 'class getters', 'WeakMap'],
        correctAnswer: 1,
        explanation: 'Proxy traps every property read (get) and write (set), letting Vue track reads as dependencies and trigger re-renders on writes. Vue 2 used Object.defineProperty per-property; Proxy is far cleaner.'
      },
      {
        id: 'js-q-13',
        question: 'You want a deep clone of an object that contains a Map and a Date. JSON.parse(JSON.stringify(x)) doesn\'t work. What\'s the modern built-in?',
        options: ['Object.assign({}, x)', 'structuredClone(x)', '[...x]', 'lodash.cloneDeep'],
        correctAnswer: 1,
        explanation: 'structuredClone handles Maps, Sets, Dates, ArrayBuffers, typed arrays, and cycles. JSON round-trip silently loses Map/Set, turns Date into string, and infinite-loops on cycles.'
      },
      {
        id: 'js-q-14',
        question: 'You start a fetch when a component mounts. The user navigates away while it\'s in flight. What\'s the right cancel mechanism?',
        options: ['fetch.cancel()', 'A flag the component checks after fetch resolves', 'AbortController + signal passed into fetch', 'setTimeout to ignore the response'],
        correctAnswer: 2,
        explanation: 'AbortController is the standard. fetch(url, { signal }) rejects with AbortError when ctrl.abort() is called — also cleans up server-side work in-flight.'
      },
      {
        id: 'js-q-15',
        question: 'A function streams items from a paginated API. Which language feature makes this naturally readable as a stream?',
        options: ['for loop with manual pagination', 'Async generator yielding items, consumed with for await...of', 'Promise.all on all pages', 'Recursion'],
        correctAnswer: 1,
        explanation: 'Async generators let you yield items as you fetch each page; the consumer uses for await...of without knowing about pagination. Stops cleanly when the consumer breaks.'
      },
      {
        id: 'js-q-16',
        question: 'What does this print? for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i)); }',
        options: ['0 1 2', '3 3 3', '0 0 0', 'undefined undefined undefined'],
        correctAnswer: 1,
        explanation: 'var is function-scoped, so all three callbacks close over the same i, which is 3 by the time the timers run. let creates a fresh binding per iteration, printing 0 1 2 — or capture the value with an IIFE / extra parameter.'
      },
      {
        id: 'js-q-17',
        question: 'In an ES module: const user = { name: "Ada", greet() { return this.name; } }; const g = user.greet; g(); What happens?',
        options: ['Returns "Ada"', 'Returns the global object\'s name', 'this is undefined, so this.name throws a TypeError', 'Returns undefined silently'],
        correctAnswer: 2,
        explanation: 'this is set by the call site, not where the function was defined. Calling g() with no receiver gives undefined in strict mode (modules are always strict), so this.name throws. Fix with user.greet.bind(user) or call it as user.greet().'
      },
      {
        id: 'js-q-18',
        question: 'Which loose-equality comparison evaluates to false?',
        options: ['[] == false', 'null == undefined', '"0" == false', 'null == 0'],
        correctAnswer: 3,
        explanation: 'null is loosely equal only to null and undefined — it is never coerced to a number, so null == 0 is false. [] becomes "" then 0, and "0" becomes 0; false also becomes 0, so those two are true. This is why === is the default.'
      },
      {
        id: 'js-q-19',
        question: 'You fire three independent requests and need every result — including which ones failed — without short-circuiting on the first rejection. Which combinator?',
        options: ['Promise.all', 'Promise.race', 'Promise.allSettled', 'Promise.any'],
        correctAnswer: 2,
        explanation: 'allSettled waits for all and returns { status, value | reason } per promise. all rejects on the first failure, race settles with the first to settle, and any resolves with the first fulfillment (rejecting with AggregateError only if all fail).'
      },
      {
        id: 'js-q-20',
        question: 'What is logged, in order? console.log(1); setTimeout(() => console.log(2)); (async () => { console.log(3); await null; console.log(4); })(); Promise.resolve().then(() => console.log(5)); console.log(6);',
        options: ['1 3 6 4 5 2', '1 6 3 4 5 2', '1 3 6 5 4 2', '1 3 4 6 5 2'],
        correctAnswer: 0,
        explanation: 'An async function runs synchronously until its first await (logs 3), then queues its continuation as a microtask. The .then callback is queued next, then 6 logs. Microtasks drain in FIFO order (4, 5) before the setTimeout macrotask (2).'
      }
    ],
    visualizations: [
      {
        id: 'js-viz-1',
        title: 'Event Loop',
        type: 'diagram',
        description: 'How JavaScript handles async operations',
        nodes: [
          { id: 'stack', label: 'Call Stack', x: 100, y: 80 },
          { id: 'webapi', label: 'Web APIs', x: 280, y: 80 },
          { id: 'micro', label: 'Microtask Queue', x: 100, y: 180 },
          { id: 'macro', label: 'Callback Queue', x: 280, y: 180 },
          { id: 'loop', label: 'Event Loop', x: 190, y: 130 }
        ],
        edges: [
          { from: 'stack', to: 'webapi', label: 'async' },
          { from: 'webapi', to: 'macro', label: 'callback' },
          { from: 'micro', to: 'stack', label: 'first' },
          { from: 'macro', to: 'stack', label: 'then' }
        ]
      },
      {
        id: 'js-viz-2',
        title: 'Promise States',
        type: 'diagram',
        description: 'Promise lifecycle',
        nodes: [
          { id: 'pending', label: 'Pending', x: 200, y: 40 },
          { id: 'fulfilled', label: 'Fulfilled', x: 100, y: 140 },
          { id: 'rejected', label: 'Rejected', x: 300, y: 140 }
        ],
        edges: [
          { from: 'pending', to: 'fulfilled', label: 'resolve()' },
          { from: 'pending', to: 'rejected', label: 'reject()' }
        ]
      }
    ]
  },

  // 4. React Patterns
  {
    id: 'react-patterns',
    name: 'React Patterns',
    slug: 'react-patterns',
    description: 'Component patterns, hooks, and React best practices',
    icon: 'infinite-outline',
    color: '#61DAFB',
    colorDark: '#21A4C9',
    premium: true,
    learnContent: [
      {
        id: 'react-pat-1',
        title: 'Component Composition',
        content: `Composition is React's primary pattern for code reuse.

• Prefer composition over inheritance
• Use children prop for flexible content
• Compound components share implicit state
• Render props for shared behavior
• Higher-order components (HOCs) for cross-cutting concerns`,
        codeExample: `// Composition with children
function Card({ children }) {
  return <div className="card">{children}</div>;
}

// Compound components
function Tabs({ children, defaultTab }) {
  const [active, setActive] = useState(defaultTab);
  return (
    // context shares state implicitly with Tab children
    <TabContext.Provider value={{ active, setActive }}>
      {children}
    </TabContext.Provider>
  );
}

// sub-component attached to parent: <Tabs.Tab id="a">
Tabs.Tab = function Tab({ id, children }) {
  const { active, setActive } = useContext(TabContext);
  return <button onClick={() => setActive(id)}>{children}</button>;
};`
      },
      {
        id: 'react-pat-2',
        title: 'Custom Hooks',
        content: `Custom hooks extract and share stateful logic between components.

• Start with "use" prefix
• Can use other hooks inside
• Return values or objects
• Keep hooks pure and focused
• Common patterns: useLocalStorage, useFetch, useDebounce`,
        codeExample: `function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // re-runs whenever the url changes
  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
    // cleanup: cancel stale request on unmount/url change
    return () => controller.abort();
  }, [url]);

  return { data, loading };
}

// Usage
const { data, loading } = useFetch('/api/users');`
      },
      {
        id: 'react-pat-3',
        title: 'State Management Patterns',
        content: `Choose the right state management based on scope and complexity.

• Local state: useState for component-specific
• Lifted state: share between siblings via parent
• Context: avoid prop drilling for global state
• useReducer: complex state logic with actions
• External stores: Redux, Zustand for large apps`,
        codeExample: `// useReducer for complex state
// pure function: (state, action) -> new state
const reducer = (state, action) => {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 }; // never mutate
    case 'setStep':
      return { ...state, step: action.payload };
    default:
      return state;
  }
};

function Counter() {
  // dispatch sends actions; reducer computes next state
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });
  return (
    <button onClick={() => dispatch({ type: 'increment' })}>
      {state.count}
    </button>
  );
}`
      },
      {
        id: 'react-pat-4',
        title: 'useEffect Best Practices',
        content: `useEffect handles side effects in functional components.

• Runs after render by default
• Dependency array controls when it runs
• Empty array [] = run once on mount
• Cleanup function for subscriptions
• Multiple effects for separate concerns`,
        codeExample: `useEffect(() => {
  // Effect runs when 'id' changes
  const subscription = api.subscribe(id);

  // Cleanup runs before next effect or unmount
  return () => subscription.unsubscribe();
}, [id]); // Dependencies

// Separate concerns into multiple effects
useEffect(() => { /* analytics */ }, [page]);
useEffect(() => { /* data fetching */ }, [userId]);

// Run once on mount
useEffect(() => {
  initializeApp();
}, []); // Empty deps`
      },
      {
        id: 'react-pat-5',
        title: 'Performance Optimization',
        content: `Optimize React apps for better performance.

• React.memo: prevent unnecessary re-renders
• useMemo: memoize expensive calculations
• useCallback: memoize functions for stable references
• Virtualization: render only visible items
• Code splitting: lazy load components`,
        codeExample: `// Memoize component
const ExpensiveList = React.memo(({ items }) => {
  return items.map(item => <Item key={item.id} {...item} />);
});

// Memoize calculation
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// Memoize callback
const handleClick = useCallback((id) => {
  setSelected(id);
}, []); // Stable reference

// Lazy loading
const Dashboard = lazy(() => import('./Dashboard'));`
      },
      {
        id: 'react-pat-6',
        title: 'React Server Components & Server Actions',
        content: `React Server Components (RSC, default in Next.js App Router) move the heavy lifting to the server.

Server Components:
• Run on the server, render to a serialized payload, never ship to the browser
• Can call databases, file systems, secrets directly — no API layer needed
• Cannot use state, effects, browser APIs, or event handlers
• Default in the App Router; opt out with "use client"

Client Components:
• Interactive: hooks, event handlers, browser APIs
• Marked with "use client" at top of file
• Imported into Server Components, rendered as islands of interactivity
• Can receive serializable props (objects, primitives, arrays — NOT functions)

Server Actions:
• Functions marked with "use server" that run on the server but can be called from client code
• Used as form actions, button handlers, mutations
• Replace REST/GraphQL endpoints for many internal mutations
• Built-in CSRF protection in Next.js

Mental model: Server Components are the new default; Client Components are explicit boundaries where interactivity is needed. Server Actions are how clients trigger server-side work without an API surface.`,
        codeExample: `// app/posts/page.tsx — Server Component (default)
import { db } from '@/lib/db';

export default async function PostsPage() {
  // direct DB access — this never ships to the browser
  const posts = await db.post.findMany();
  return (
    <ul>
      {posts.map(p => <PostItem key={p.id} post={p} />)}
    </ul>
  );
}

// app/post-item.tsx — Client Component for the like button
'use client'; // marks the interactivity boundary
import { likePost } from './actions';

export function PostItem({ post }) {
  return (
    <li>
      {post.title}
      {/* form action calls the server function directly */}
      <form action={likePost.bind(null, post.id)}>
        <button>Like ({post.likes})</button>
      </form>
    </li>
  );
}

// app/actions.ts — Server Action
'use server'; // runs on the server, callable from client
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function likePost(postId: string) {
  await db.post.update({ where: { id: postId }, data: { likes: { increment: 1 } } });
  revalidatePath('/posts'); // refresh cached page data
}`
      },
      {
        id: 'react-pat-7',
        title: 'Suspense & Error Boundaries',
        content: `Suspense lets components "wait" for something — declarative async without manual loading state.

Suspense:
• Wrap a subtree with <Suspense fallback={<Spinner />}>
• Children that throw a Promise (suspend) trigger the fallback
• Once the Promise resolves, React tries again
• Used by: lazy(), use() hook, RSC, data libraries (Relay, React Query with suspense)

Streaming SSR:
• Server starts streaming HTML before all data is ready
• Suspense boundaries flush as their data resolves
• Above-the-fold content arrives first; slower sections fill in

Error Boundaries:
• Catch errors during rendering, in lifecycle methods, and in constructors of child components
• MUST be class components — no hook equivalent yet (libraries like react-error-boundary wrap this)
• componentDidCatch logs; getDerivedStateFromError returns fallback UI
• Don't catch: event handlers, async code, errors in the boundary itself

Combine: Suspense for "loading", Error Boundary for "errors". Wrap routes with both for resilient UIs.`,
        codeExample: `// Class-based error boundary (only way today)
class ErrorBoundary extends React.Component {
  state = { error: null };
  // update state so next render shows fallback UI
  static getDerivedStateFromError(error) { return { error }; }
  // side effects: log/report the error
  componentDidCatch(error, info) { reportToSentry(error, info); }
  render() {
    if (this.state.error) {
      return <Fallback onRetry={() => this.setState({ error: null })} />;
    }
    return this.props.children; // normal case: render children
  }
}

// Combine with Suspense
<ErrorBoundary>
  <Suspense fallback={<Spinner />}>
    <UserProfile id={42} />
  </Suspense>
</ErrorBoundary>

// Streaming SSR pattern (Next.js)
export default function Page() {
  return (
    <>
      <FastSection />
      <Suspense fallback={<Skeleton />}>
        <SlowSection />  {/* awaits data, streamed when ready */}
      </Suspense>
    </>
  );
}`
      },
      {
        id: 'react-pat-8',
        title: 'Concurrent Features: useTransition & useDeferredValue',
        content: `React's concurrent renderer can pause, resume, and abandon renders. Concurrent features let you mark some updates as "less urgent" so the UI stays responsive.

useTransition:
• Wraps a state update; React schedules it as a transition
• Returns [isPending, startTransition]
• Urgent updates (typing in an input) interrupt the transition
• UI shows isPending while the transition is in flight

useDeferredValue:
• Like useTransition but for derived values you don't control
• const deferred = useDeferredValue(query) — deferred lags behind query during heavy renders
• Pass deferred to expensive children; latest query stays responsive in the input

When to use:
• Filtering a long list as the user types
• Tab switches that mount expensive subtrees
• Any update that triggers heavy rendering

Mental model: "this update can be slow, please don't block the user."

startTransition (no hook):
• Standalone function for triggering transitions outside components (e.g., in event handlers, after data fetches)`,
        codeExample: `function SearchableList({ items }) {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;
    // Urgent: input value updates immediately
    setQuery(value);
    // Non-urgent: filtering can be deferred
    startTransition(() => {
      setFilteredItems(items.filter(i => i.name.includes(value)));
    });
  };

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <FilteredList items={filteredItems} />
    </>
  );
}

// useDeferredValue alternative (no startTransition needed)
function SearchableList({ items }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const filtered = useMemo(
    () => items.filter(i => i.name.includes(deferredQuery)),
    [items, deferredQuery]
  );
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}`
      },
      {
        id: 'react-pat-9',
        title: 'Refs: useRef, forwardRef, useImperativeHandle',
        content: `Refs hold mutable values that persist across renders without triggering re-renders. They\'re also how you reference DOM nodes.

useRef:
• const ref = useRef(initialValue)
• ref.current is the mutable value
• Doesn\'t trigger re-render on change
• Use for: DOM nodes, instance variables (timers, latest props in async handlers, previous values)

forwardRef (React ≤18; superseded in React 19):
• Lets a component receive a ref and forward it to a child DOM node
• In React 19+, ref is a regular prop on function components — forwardRef no longer needed for new code

useImperativeHandle:
• Customize what gets exposed when a parent attaches a ref to your component
• Lets a parent call methods like myRef.current.focus(), but you control the surface
• Pair with forwardRef (or ref-as-prop in React 19)

Callback refs:
• Pass a function instead of a ref object: <div ref={node => /* node is the DOM */}>
• Cleanup pattern (React 19): return a cleanup function from the callback
• Useful when you need to react to a ref attaching/detaching

Common anti-patterns:
• Reading state via ref to "get latest" — usually a sign of stale-closure smell, fix with proper deps
• Using ref instead of state because re-render seems wasteful — usually wrong; React is fast`,
        codeExample: `// Storing a timer
function Timer() {
  const intervalRef = useRef();
  useEffect(() => {
    intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);
}

// Imperative API exposed by a custom Input
const FancyInput = forwardRef((props, ref) => {
  const inputRef = useRef();
  // expose ONLY these methods to the parent
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = ''; },
  }), []);
  return <input ref={inputRef} {...props} />;
});

// Parent
const myRef = useRef();
<FancyInput ref={myRef} />;
myRef.current.focus(); // calls the exposed method

// React 19: ref as prop, no forwardRef
function FancyInput({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}`
      },
      {
        id: 'react-pat-10',
        title: 'Effect Anti-Patterns & Derived State',
        content: `Most useEffect bugs come from using it where you shouldn\'t. Effects should be ESCAPE HATCHES for synchronizing with external systems — not the default place to compute things.

Anti-pattern 1: Derived state in an effect.
Wrong: useEffect(() => setFullName(first + ' ' + last), [first, last]);
Right: const fullName = first + ' ' + last; (just compute it)

Anti-pattern 2: Resetting state on prop change.
Wrong: useEffect(() => setSelected(null), [userId]);
Right: pass key={userId} to the component — React will remount, resetting state.

Anti-pattern 3: Race conditions in fetches.
Wrong: useEffect(() => { fetch(url).then(setData); }, [url]);
  — old fetch can land after a new one
Right: track an AbortController OR check an ignore flag in the cleanup.

Anti-pattern 4: Stale closures.
Wrong: setInterval(() => setCount(count + 1), 1000) with empty deps — count is captured from initial render.
Right: use functional update setCount(c => c + 1), or include count in deps and clear on each tick.

Anti-pattern 5: Effects that "should run on every render."
That\'s just the body of the component. Don\'t put it in useEffect.

Mental model from the React docs: "If your effect doesn\'t synchronize with an external system, you probably don\'t need it."`,
        codeExample: `// Avoiding race conditions
useEffect(() => {
  let ignore = false;
  fetch(url).then(r => r.json()).then(data => {
    if (!ignore) setData(data);
  });
  return () => { ignore = true; };
}, [url]);

// Functional update fixes stale closure
useEffect(() => {
  const id = setInterval(() => {
    setCount(c => c + 1); // always sees latest
  }, 1000);
  return () => clearInterval(id);
}, []); // [] is fine because of functional update

// Reset state with key prop, not effect
function Profile({ userId }) {
  return <ProfileInner key={userId} userId={userId} />;
  // ProfileInner remounts when userId changes
}`
      },
      {
        id: 'react-pat-11',
        title: 'React 19 Forms: useActionState, useFormStatus, use()',
        content: `React 19 introduced first-class form handling that combines with Server Actions for full-stack mutations with minimal client code.

useActionState (formerly useFormState):
• [state, formAction, isPending] = useActionState(action, initialState)
• action is a server action or any (prevState, formData) => newState function
• React threads previous state into the next call
• Pass formAction as the form\'s action prop

useFormStatus:
• Inside a child component of a <form>, returns { pending, data, method, action }
• Lets a SubmitButton show a spinner without prop drilling state
• Works with any <form>, not just Server Actions

use() hook (React 19):
• Read a Promise during render — React suspends until it resolves
• Read a Context the same way
• Can be called conditionally (unlike most hooks)
• Replaces useEffect-then-setState patterns for simple data loading

Mental model: forms are now natively async, server actions are just functions, and use() makes async data feel like sync data inside Suspense boundaries.`,
        codeExample: `// Server Action
'use server';
// (prevState, formData) shape required by useActionState
async function createPost(prevState, formData) {
  const title = formData.get('title');
  if (!title) return { error: 'Title required' }; // validation result
  await db.post.create({ data: { title } });
  return { success: true };
}

// Client form
'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

// reads parent form's pending state — no prop drilling
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving...' : 'Save'}</button>;
}

export function NewPost() {
  // state = last return value from the action
  const [state, formAction] = useActionState(createPost, { error: null });
  return (
    <form action={formAction}>
      <input name="title" />
      {state.error && <p>{state.error}</p>}
      <SubmitButton />
    </form>
  );
}

// use() reads a promise during render
function UserName({ userPromise }) {
  const user = use(userPromise); // suspends until resolved
  return <span>{user.name}</span>;
}`
      }
    ],
    flashcards: [
      { id: 'react-fc-1', front: 'What is the children prop in React?', back: 'A special prop that contains the content between a component\'s opening and closing tags. Enables composition: <Card><p>Content</p></Card>' },
      { id: 'react-fc-2', front: 'What are the rules of hooks?', back: '1) Only call hooks at the top level (not in loops/conditions). 2) Only call hooks from React functions (components or custom hooks). 3) Custom hooks must start with "use".' },
      { id: 'react-fc-3', front: 'When should you use useReducer over useState?', back: 'When state logic is complex, involves multiple sub-values, or when next state depends on previous. Also useful when multiple actions update the same state.' },
      { id: 'react-fc-4', front: 'What is a compound component?', back: 'A pattern where components share implicit state through context. Parent manages state, children access it. Example: <Tabs><Tabs.Tab>...</Tabs.Tab></Tabs>' },
      { id: 'react-fc-5', front: 'What does React.memo do?', back: 'Memoizes a component, preventing re-renders if props haven\'t changed (shallow comparison). Use for expensive components that receive the same props frequently.' },
      { id: 'react-fc-6', front: 'What is the difference between useMemo and useCallback?', back: 'useMemo memoizes a computed value, useCallback memoizes a function. useCallback(fn, deps) is equivalent to useMemo(() => fn, deps).' },
      { id: 'react-fc-7', front: 'What does the cleanup function in useEffect do?', back: 'Runs before the next effect execution and when the component unmounts. Used for canceling subscriptions, clearing timers, or aborting fetch requests.' },
      { id: 'react-fc-8', front: 'Why use an empty dependency array in useEffect?', back: 'Makes the effect run only once on mount (like componentDidMount). The cleanup runs only on unmount. Useful for one-time initialization.' },
      { id: 'react-fc-9', front: 'What is prop drilling?', back: 'Passing props through multiple component layers to reach a deeply nested component. Solved with Context API or state management libraries.' },
      { id: 'react-fc-10', front: 'What is React.lazy used for?', back: 'Code splitting - dynamically imports a component so its code is only loaded when rendered. Must be used with Suspense for loading fallback.' },
      { id: 'react-fc-11', front: 'Server Component vs Client Component', back: 'Server Component: runs on the server, never ships JS to browser. Can call DB/file system directly. Cannot use hooks, state, effects, event handlers. Default in Next.js App Router.\n\nClient Component: marked "use client". Interactive — hooks, events, browser APIs. Imports can include other Client Components or Server Components passed as children/props.\n\nMental model: Server is the default; Client is the explicit interactive island.' },
      { id: 'react-fc-12', front: 'What does "use server" do?', back: 'Marks a function (or all exports of a module) as a Server Action — a function that runs on the server but can be invoked from client code, including form actions and event handlers.\n\nUsed for mutations (DB writes, sending emails) without building a REST/GraphQL endpoint. Next.js handles serialization, CSRF, and revalidation.' },
      { id: 'react-fc-13', front: 'What does "use client" do?', back: 'Marks the file (and everything it imports) as a Client Component module. Adds the JS to the bundle that ships to the browser.\n\nProps passed from Server → Client must be serializable (no functions, no class instances). Children/props from Server can be Server-rendered content interleaved into the client tree.' },
      { id: 'react-fc-14', front: 'How does Suspense work?', back: 'A boundary that catches "thrown promises" from descendants. While a child is suspended, React shows the fallback. When the promise resolves, React retries the render.\n\nDriven by: lazy(), use() (React 19), data libraries with suspense support (Relay, React Query). Combine with streaming SSR for content that arrives progressively.' },
      { id: 'react-fc-15', front: 'Why must Error Boundaries be class components?', back: 'Error boundary lifecycles (getDerivedStateFromError, componentDidCatch) don\'t have hook equivalents (yet). React intentionally hasn\'t exposed them as hooks because the semantics are tricky.\n\nWorkaround: react-error-boundary library wraps the class component pattern with a hook-friendly API.' },
      { id: 'react-fc-16', front: 'useTransition', back: 'Marks state updates as non-urgent transitions. React keeps the UI responsive by interrupting them when more urgent updates (like input typing) come in.\n\nReturns [isPending, startTransition]. Use for filter/search-as-you-type, tab switches that mount expensive subtrees.\n\nThe input value updates eagerly; the heavy filtering happens in the transition without blocking the input.' },
      { id: 'react-fc-17', front: 'useDeferredValue', back: 'const deferred = useDeferredValue(value) — returns a value that lags behind during heavy renders.\n\nUse when you can\'t wrap state updates in startTransition (e.g., the value comes from props). Pass deferred to expensive children; the parent stays responsive.\n\nDifferent from debounce: deferred reflects the latest value as soon as React has time, not after a fixed delay.' },
      { id: 'react-fc-18', front: 'useRef vs useState', back: 'useState: triggers re-render on change; the value is the source of truth for what\'s displayed.\n\nuseRef: mutable container that does NOT trigger re-render. Use for: DOM nodes, timers, latest values needed in async code, anything that\'s "instance variable, not view state."\n\nIf you find yourself reaching for useRef "to avoid re-renders," you usually want state — React is fast.' },
      { id: 'react-fc-19', front: 'forwardRef and ref-as-prop in React 19', back: 'Pre-React 19: ref was a special prop, only handled if you wrapped with forwardRef.\n\nReact 19: function components receive ref as a regular prop. forwardRef is no longer required for new code.\n\nfunction Button({ ref, children }) { return <button ref={ref}>{children}</button>; }' },
      { id: 'react-fc-20', front: 'useImperativeHandle', back: 'Customize what a parent sees when it attaches a ref to your component.\n\nuseImperativeHandle(ref, () => ({ focus, clear }), deps);\n\nLets the parent call myRef.current.focus() and .clear() but NOT touch the underlying DOM directly. Encapsulates the imperative surface.' },
      { id: 'react-fc-21', front: 'useSyncExternalStore', back: 'Subscribes to an external store (Redux, Zustand, browser APIs) in a way that\'s safe under concurrent rendering — avoids tearing where different components render different store snapshots.\n\nLibrary authors use it; app code rarely calls it directly. Replaces useEffect+useState patterns that didn\'t handle concurrent rendering correctly.' },
      { id: 'react-fc-22', front: 'useId', back: 'Generates a unique, stable ID per component instance — safe for SSR (ids match between server and client).\n\nconst id = useId();\n<label htmlFor={id}>Name</label>\n<input id={id} />\n\nReplaces homemade counters and Math.random() that would mismatch hydration. Use for label/input pairs, aria-controls, etc.' },
      { id: 'react-fc-23', front: 'Why does StrictMode double-invoke effects in development?', back: 'StrictMode mounts → unmounts → remounts every component during development. This catches bugs where:\n• Effects don\'t clean up properly (timers, listeners)\n• Components assume "mount happens exactly once"\n\nProduction is unaffected. The fix is always "make your effect resilient to running twice" — the same shape that handles real-world remounts (dev-tooling Fast Refresh, future Offscreen API).' },
      { id: 'react-fc-24', front: 'Stale closure in useEffect', back: 'Effects capture variables from the render they ran in. Without proper deps or functional updates, they see OLD values.\n\nsetInterval(() => setCount(count + 1), 1000) with [] deps — count stays at 0 forever.\n\nFix: setCount(c => c + 1) (functional update — always latest), or include count in deps and clear on each tick.' },
      { id: 'react-fc-25', front: 'useEffect race condition pattern', back: 'A new effect run can resolve before an old one. Naive code applies the OLD result on top of the new state.\n\nFix:\nuseEffect(() => {\n  let ignore = false;\n  fetch(url).then(d => { if (!ignore) setData(d); });\n  return () => { ignore = true; };\n}, [url]);\n\nOr use AbortController to cancel the in-flight fetch.' },
      { id: 'react-fc-26', front: 'When should you NOT use useState?', back: 'When the value is derivable from existing state or props.\n\nWrong: const [fullName, setFullName] = useState(\'\'); useEffect(() => setFullName(first + \' \' + last), [first, last]);\n\nRight: const fullName = first + \' \' + last; (compute on render, no state, no effect)\n\nIf the user can\'t change it independently, it\'s not state.' },
      { id: 'react-fc-27', front: 'useLayoutEffect vs useEffect', back: 'useEffect: fires AFTER the browser paints. Async, doesn\'t block visuals.\n\nuseLayoutEffect: fires AFTER DOM mutations but BEFORE paint. Synchronous, blocking — but lets you measure and adjust before the user sees a flash.\n\nUse useLayoutEffect for: measuring DOM and applying derived layout (tooltips positioning, syncing scroll). Otherwise prefer useEffect.' },
      { id: 'react-fc-28', front: 'React Portal', back: 'Renders a child into a different DOM node, outside the parent\'s tree, while still being part of the React tree.\n\ncreatePortal(<Modal />, document.body)\n\nUseful for modals, tooltips, toasts that need to escape parent overflow:hidden or z-index stacking issues. Events still bubble through the React tree, not the DOM tree — feels natural to write.' },
      { id: 'react-fc-29', front: 'use() hook (React 19)', back: 'Reads a Promise OR Context during render. With a promise, suspends until it resolves.\n\nfunction Comment({ commentPromise }) {\n  const comment = use(commentPromise); // suspends if not ready\n  return <p>{comment.body}</p>;\n}\n\nCan be called CONDITIONALLY, unlike other hooks. Pair with Suspense and Error Boundaries.' },
      { id: 'react-fc-30', front: 'useFormStatus', back: 'Hook that reads the status of the parent <form> from inside a child component.\n\nfunction SubmitButton() {\n  const { pending } = useFormStatus();\n  return <button disabled={pending}>...</button>;\n}\n\nLets a generic submit button show a spinner during submission without prop drilling state. Works with any form, not just Server Actions.' }
    ],
    quizQuestions: [
      {
        id: 'react-q-1',
        question: 'What happens if you call useState inside a condition?',
        options: ['Works fine', 'React throws an error', 'State becomes undefined', 'Component won\'t render'],
        correctAnswer: 1,
        explanation: 'Hooks must be called in the same order every render. Conditional hooks break this rule and React will throw an error.'
      },
      {
        id: 'react-q-2',
        question: 'Which hook is best for fetching data?',
        options: ['useState only', 'useEffect with useState', 'useReducer', 'useMemo'],
        correctAnswer: 1,
        explanation: 'useEffect handles side effects like data fetching, useState stores the fetched data. Together they manage async data loading.'
      },
      {
        id: 'react-q-3',
        question: 'What does the cleanup function in useEffect do?',
        options: ['Clears the component', 'Runs before next effect and on unmount', 'Deletes state', 'Refreshes the page'],
        correctAnswer: 1,
        explanation: 'The cleanup function runs before the next effect execution and when the component unmounts. Used for canceling subscriptions, timers, etc.'
      },
      {
        id: 'react-q-4',
        question: 'When does useMemo recalculate its value?',
        options: ['Every render', 'Never', 'When dependencies change', 'On component mount only'],
        correctAnswer: 2,
        explanation: 'useMemo recalculates only when one of its dependencies changes. Otherwise, it returns the cached value from the previous render.'
      },
      {
        id: 'react-q-5',
        question: 'What is the purpose of React.memo?',
        options: ['Store values in memory', 'Prevent unnecessary re-renders', 'Create memos/notes', 'Debug components'],
        correctAnswer: 1,
        explanation: 'React.memo is a higher-order component that memoizes the result, skipping re-renders if props haven\'t changed.'
      },
      {
        id: 'react-q-6',
        question: 'What must custom hooks start with?',
        options: ['hook', 'custom', 'use', 'my'],
        correctAnswer: 2,
        explanation: 'Custom hooks must start with "use" (e.g., useAuth, useFetch). This convention allows React to enforce the rules of hooks.'
      },
      {
        id: 'react-q-7',
        question: 'Which can a Server Component do that a Client Component cannot?',
        options: ['Use useState', 'Call a database directly', 'Handle onClick events', 'Subscribe to browser events'],
        correctAnswer: 1,
        explanation: 'Server Components run on the server, so they can call DB / file system / secrets directly. They cannot use hooks, state, effects, or event handlers — those require "use client".'
      },
      {
        id: 'react-q-8',
        question: 'A user types in a search input that filters a 10,000-item list. The input lags. Which hook helps without debouncing?',
        options: ['useEffect', 'useTransition (mark filtering as a transition)', 'useMemo alone', 'useCallback'],
        correctAnswer: 1,
        explanation: 'useTransition lets React keep the input update urgent while treating the heavy list re-render as interruptible. The input stays responsive even when the filter is slow.'
      },
      {
        id: 'react-q-9',
        question: 'You want to expose a .focus() method on your custom Input but hide the underlying DOM node. Which hook?',
        options: ['useRef alone', 'forwardRef + useImperativeHandle', 'useState', 'useEffect'],
        correctAnswer: 1,
        explanation: 'useImperativeHandle (paired with forwardRef in React ≤18, or ref-as-prop in React 19) lets you expose a custom imperative API instead of the raw DOM node.'
      },
      {
        id: 'react-q-10',
        question: 'You have <label htmlFor="name"> and <input id="name"> in a server-rendered list of forms — IDs collide. What\'s the fix?',
        options: ['Math.random() ids', 'Hardcoded ids per form', 'useId() — returns a stable, unique, hydration-safe id', 'No ids at all'],
        correctAnswer: 2,
        explanation: 'useId generates IDs that match between server and client, avoiding hydration mismatches. Math.random() would mismatch between renders.'
      },
      {
        id: 'react-q-11',
        question: 'Why does StrictMode mount → unmount → remount components in development?',
        options: ['It\'s a bug', 'To catch effects without proper cleanup and components that assume single mount', 'For performance testing', 'To slow down dev mode'],
        correctAnswer: 1,
        explanation: 'Double invocation surfaces effects that leak (timers without clearTimeout, listeners without removeEventListener). The fix is always "handle remounts cleanly," which also makes your code resilient to Fast Refresh and future features.'
      },
      {
        id: 'react-q-12',
        question: 'You see code: useEffect(() => { setFullName(first + " " + last); }, [first, last]). What\'s the better approach?',
        options: ['Add more deps', 'Move it to useLayoutEffect', 'Just compute it: const fullName = first + " " + last (no state, no effect)', 'Wrap in useMemo'],
        correctAnswer: 2,
        explanation: 'Derived values shouldn\'t be state. Computing in render is cheaper, simpler, and avoids the extra render the effect would cause. Reach for state only when the user can change it independently.'
      },
      {
        id: 'react-q-13',
        question: 'You measure a tooltip\'s width to position it correctly. The tooltip flashes in the wrong place before snapping. Which hook fixes the flash?',
        options: ['useEffect', 'useLayoutEffect — runs synchronously before paint', 'useMemo', 'useCallback'],
        correctAnswer: 1,
        explanation: 'useLayoutEffect runs after DOM mutations but BEFORE paint, so the user never sees the wrong-position frame. Use sparingly — it blocks visual updates — but it\'s right for measure-and-adjust patterns.'
      },
      {
        id: 'react-q-14',
        question: 'You want a button to submit a form via a Server Action and show a spinner during submission. Inside the button component, how do you read the form\'s pending state?',
        options: ['useState', 'useFormStatus()', 'A prop drilled from the form', 'Context'],
        correctAnswer: 1,
        explanation: 'useFormStatus reads the pending status of the parent <form> from inside a child component — no prop drilling, generic submit buttons that work in any form.'
      },
      {
        id: 'react-q-15',
        question: 'A useEffect fetches data based on userId. Old fetches sometimes resolve after new ones, applying stale data. What\'s the simplest fix?',
        options: ['Bigger setState', 'Track an ignore flag in cleanup, or AbortController', 'Sleep before setState', 'Use useLayoutEffect'],
        correctAnswer: 1,
        explanation: 'Either flip an ignore flag in the cleanup (and check before setState) or pass an AbortController.signal into fetch. Either way, the old request stops mattering when the deps change.'
      },
      {
        id: 'react-q-16',
        question: 'A list of rows with uncontrolled <input>s uses key={index}. Deleting the first row makes every remaining input show the wrong value. Why?',
        options: ['Uncontrolled inputs cannot be used in lists', 'React re-renders the list twice', 'Index keys make React reuse each row\'s component instance for a different item, so DOM state stays with the position', 'The delete handler mutated state'],
        correctAnswer: 2,
        explanation: 'Keys tell reconciliation which element is which across renders. With index keys, row 1 becomes "the row that used to be row 0" and keeps its input value and local state. Use a stable unique id per item as the key.'
      },
      {
        id: 'react-q-17',
        question: 'You wrap every handler in useCallback, but the child receiving them is a plain function component. What do you gain?',
        options: ['The child skips re-rendering when the handler is unchanged', 'Nothing — the child re-renders whenever the parent does; useCallback only pays off when something compares the reference', 'Handlers run faster', 'The parent re-renders less often'],
        correctAnswer: 1,
        explanation: 'A stable reference matters only to a consumer that compares props — React.memo, a useEffect dependency array, or another memo hook. Without those, useCallback adds allocation and a dependency array with no rendering benefit.'
      },
      {
        id: 'react-q-18',
        question: 'A single <Suspense> wraps a dashboard of six widgets. One widget\'s data is slow. What does the user see?',
        options: ['The whole dashboard shows the fallback until the slow widget resolves', 'Five widgets render and the sixth shows the fallback', 'An error boundary is triggered', 'The slow widget renders with undefined data'],
        correctAnswer: 0,
        explanation: 'A suspending component bubbles up to the nearest Suspense boundary, which replaces all of its children with the fallback. Boundary placement defines loading granularity — wrap each widget in its own Suspense to let the fast ones show.'
      },
      {
        id: 'react-q-19',
        question: 'A provider renders <ThemeContext.Provider value={{ theme, setTheme }}>. Consumers re-render on every provider render even when theme is unchanged. Why?',
        options: ['Context always re-renders all consumers', 'setTheme changes identity every render', 'Consumers are missing React.memo', 'The inline object literal is a new reference each render, so Object.is says the value changed'],
        correctAnswer: 3,
        explanation: 'Context compares value with Object.is. An inline object is new every render, so every consumer updates. Wrap the value in useMemo(() => ({ theme, setTheme }), [theme]) — or split into separate state and dispatch contexts.'
      },
      {
        id: 'react-q-20',
        question: 'const options = { page }; useEffect(() => { fetchList(options); }, [options]); This refetches on every render. Why?',
        options: ['useEffect ignores object dependencies', 'options is a new object each render, so the dependency never matches', 'fetchList mutates options', 'page is not in the dependency array'],
        correctAnswer: 1,
        explanation: 'Dependencies are compared with Object.is, and a fresh object literal never equals the previous one. Depend on primitives ({ page } → [page]), build the object inside the effect, or memoize it with useMemo.'
      }
    ],
    visualizations: [
      {
        id: 'react-viz-1',
        title: 'React Component Lifecycle',
        type: 'diagram',
        description: 'Hooks in the component lifecycle',
        nodes: [
          { id: 'mount', label: 'Mount\nstart', x: 100, y: 50, type: 'primary' },
          { id: 'render', label: 'Render\nJSX', x: 250, y: 50, type: 'secondary' },
          { id: 'effect', label: 'useEffect\nside effect', x: 100, y: 150, type: 'info' },
          { id: 'cleanup', label: 'Cleanup\nunmount', x: 250, y: 150, type: 'warning' }
        ],
        edges: [
          { from: 'mount', to: 'render' },
          { from: 'render', to: 'effect' },
          { from: 'effect', to: 'cleanup' }
        ]
      },
      {
        id: 'react-viz-2',
        title: 'State Management Decision',
        type: 'diagram',
        description: 'Choosing the right state solution',
        nodes: [
          { id: 'local', label: 'useState\nsimple', x: 100, y: 50, type: 'primary' },
          { id: 'complex', label: 'useReducer\ncomplex', x: 250, y: 50, type: 'secondary' },
          { id: 'context', label: 'Context\nshared', x: 100, y: 150, type: 'info' },
          { id: 'global', label: 'Redux\nglobal', x: 250, y: 150, type: 'secondary' }
        ],
        edges: [
          { from: 'local', to: 'complex' },
          { from: 'context', to: 'global' }
        ]
      }
    ]
  },

  // 5. State Management
  {
    id: 'state-management',
    name: 'State Management',
    slug: 'state-management',
    description: 'Redux, Context, Zustand, and state management strategies',
    icon: 'git-network-outline',
    color: '#764ABC',
    colorDark: '#5C3A91',
    premium: true,
    learnContent: [
      {
        id: 'state-mgmt-1',
        title: 'When to Use What',
        content: `Choosing the right state management depends on your needs.

• Local State (useState): UI state, form inputs, toggles
• Context + useReducer: Theme, auth, medium complexity
• Redux: Large apps, complex state, time-travel debugging
• Zustand: Simple API, less boilerplate than Redux
• React Query/SWR: Server state, caching, sync`,
        codeExample: `// Decision framework
const stateDecision = {
  'Single component': 'useState',
  'Few components, same tree': 'Lift state up',
  'Many components': 'Context',
  'Complex updates': 'useReducer + Context',
  'Large app, devtools': 'Redux/Zustand',
  'Server data, caching': 'React Query/SWR'
};`
      },
      {
        id: 'state-mgmt-2',
        title: 'Redux Toolkit',
        content: `Redux Toolkit simplifies Redux with less boilerplate.

• createSlice: reducers + actions in one
• configureStore: automatic setup
• createAsyncThunk: async actions
• Immer built-in: "mutate" state safely
• RTK Query: data fetching and caching`,
        codeExample: `import { createSlice, configureStore } from '@reduxjs/toolkit';

// slice = reducers + auto-generated actions in one
const userSlice = createSlice({
  name: 'user',
  initialState: { data: null, loading: false },
  reducers: {
    setUser: (state, action) => {
      state.data = action.payload; // Immer handles immutability
    },
    logout: (state) => { state.data = null; }
  }
});

// action creators are generated from reducer names
export const { setUser, logout } = userSlice.actions;
const store = configureStore({ reducer: { user: userSlice.reducer } });`
      },
      {
        id: 'state-mgmt-3',
        title: 'Zustand',
        content: `Zustand is a minimal state management solution.

• No providers or context needed
• Simple hook-based API
• Supports middleware (persist, devtools)
• Works outside React components
• Automatic render optimization`,
        codeExample: `import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  // persist middleware saves state to localStorage
  persist(
    (set, get) => ({
      bears: 0, // state lives next to its actions
      addBear: () => set(state => ({ bears: state.bears + 1 })),
      removeAllBears: () => set({ bears: 0 }),
      fetchBears: async () => { // async actions just work
        const res = await fetch('/api/bears');
        set({ bears: await res.json() });
      }
    }),
    { name: 'bear-storage' } // localStorage key
  )
);

// Usage - no Provider needed!
// selector: re-render only when 'bears' changes
const bears = useStore(state => state.bears);`
      },
      {
        id: 'state-mgmt-4',
        title: 'React Query',
        content: `React Query manages server state with caching and synchronization.

• Automatic caching and refetching
• Background updates
• Pagination and infinite scroll
• Optimistic updates
• Offline support`,
        codeExample: `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function Posts() {
  // queryKey identifies this data in the cache
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: () => fetch('/api/posts').then(r => r.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (newPost) => fetch('/api/posts', {
      method: 'POST', body: JSON.stringify(newPost)
    }),
    // after a write, mark cached posts stale -> refetch
    onSuccess: () => queryClient.invalidateQueries(['posts'])
  });
}`
      },
      {
        id: 'state-mgmt-5',
        title: 'Context Performance',
        content: `Context can cause performance issues if not used carefully.

• All consumers re-render on any value change
• Split contexts by update frequency
• Memoize context values
• Use selectors with Zustand/Redux
• Consider React Query for server state`,
        codeExample: `// Split contexts
const ThemeContext = createContext(); // Rarely changes
const UserContext = createContext();  // Auth state

// Memoize provider value
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const value = useMemo(() => ({
    user,
    login: (data) => setUser(data),
    logout: () => setUser(null)
  }), [user]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}`
      },
      {
        id: 'state-mgmt-6',
        title: 'Atoms-Based State: Jotai & Recoil',
        content: `Atoms-based state libraries flip the traditional "one big store" model: state is a graph of small atoms, components subscribe to the specific atoms they need.

Jotai (recommended; lighter, simpler API):
• const countAtom = atom(0)
• const [count, setCount] = useAtom(countAtom)
• Each atom is its own subscription — no selectors needed for fine-grained re-renders
• Derived atoms: atom(get => get(a) + get(b)) — automatic dependency tracking
• Async atoms suspend during fetches

Recoil (Facebook, less actively maintained now):
• Same conceptual model: atoms + selectors
• Heavier bundle, more APIs, more boilerplate

When atoms shine vs Zustand / Redux:
• Many small independent pieces of state → atoms keep re-renders surgical
• Cross-component derived data — derived atoms recompute only when their inputs change
• Suspense-friendly async out of the box

When stores still win:
• You want devtools time-travel — Redux still leads
• Most state is server data — TanStack Query is more fit-for-purpose
• Few global stores with rich actions — Zustand is simpler to grok

Mental model: in Redux, your component asks "give me this slice from the big tree". In atoms, your component subscribes directly to the atoms it cares about.`,
        codeExample: `import { atom, useAtom } from 'jotai';

const countAtom = atom(0);
const doubledAtom = atom(get => get(countAtom) * 2);

// Async atom — suspends during fetch
const userAtom = atom(async (get) => {
  const id = get(userIdAtom);
  return await fetch(\`/api/users/\${id}\`).then(r => r.json());
});

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const [doubled] = useAtom(doubledAtom); // recomputes when count changes
  return <button onClick={() => setCount(c => c + 1)}>{count} ({doubled})</button>;
}`
      },
      {
        id: 'state-mgmt-7',
        title: 'TanStack Query Advanced',
        content: `Beyond useQuery — the patterns that make production apps work.

Mutations with optimistic updates:
• useMutation has onMutate (optimistic), onError (rollback), onSettled (cleanup)
• Snapshot the cache, write the optimistic value, return a context for rollback

Infinite queries (pagination, infinite scroll):
• useInfiniteQuery with getNextPageParam
• fetchNextPage triggers loading next page
• Pages cached together; UI flattens them

Prefetch (instant navigation):
• queryClient.prefetchQuery on hover or route enter
• Data is already cached when the page mounts → no spinner

SSR hydration:
• Server: prefetch into queryClient → dehydrate(queryClient) → serialize as HTML
• Client: <HydrationBoundary state={dehydratedState}> wraps the app → cache pre-warmed
• First render is instant, then queries can refetch on focus/stale

Cache invalidation patterns:
• queryClient.invalidateQueries({ queryKey: ['posts'] }) — refetch active, mark inactive stale
• queryClient.setQueryData(['post', id], updater) — direct cache write after a mutation, no refetch needed
• refetchOnWindowFocus, refetchOnMount, refetchInterval for freshness control

The mental shift: don't think "fetch in useEffect, store in useState." Think "declare what data this component needs; the library handles caching, dedup, retries, and refresh."`,
        codeExample: `// Optimistic mutation
const mutation = useMutation({
  mutationFn: (newPost) => api.createPost(newPost),
  onMutate: async (newPost) => {
    // stop in-flight refetches from clobbering our write
    await queryClient.cancelQueries({ queryKey: ['posts'] });
    const previous = queryClient.getQueryData(['posts']);
    // show the new post immediately, before server confirms
    queryClient.setQueryData(['posts'], (old) => [...old, newPost]);
    return { previous }; // context for rollback
  },
  onError: (err, newPost, context) => {
    // server rejected: restore the snapshot
    queryClient.setQueryData(['posts'], context.previous);
  },
  onSettled: () => {
    // success or error: sync with the server's truth
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  },
});

// Infinite query
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 0 }) => fetchPage(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});`
      },
      {
        id: 'state-mgmt-8',
        title: 'State Machines & XState',
        content: `When state has well-defined modes (idle, loading, success, error) and transitions, modeling it as a state machine prevents impossible states and makes flow explicit.

The hand-rolled trap:
• const [isLoading, setLoading] = useState(false);
• const [error, setError] = useState(null);
• const [data, setData] = useState(null);
• Now what if isLoading=true AND error=non-null? Or data AND error?
• Boolean explosion → impossible states leak into UI bugs

State machine alternative:
• type State = { status: 'idle' } | { status: 'loading' } | { status: 'success', data } | { status: 'error', error }
• You can\'t represent impossible combinations
• Transitions are explicit: only certain events move you between states

useReducer + tagged union: 80% of the value with no library.

XState (full library):
• Statecharts: hierarchical, parallel states, history
• Visualizer: see your state machine as a diagram in real time
• Actor model for concurrent state machines that send messages
• Heavy but powerful for complex flows: checkout, multi-step forms, video players, OAuth flows

When to reach for a state machine:
• Boolean flags multiplying past 3
• Bugs where the UI shows two contradictory things at once
• Complex flows you have to mentally simulate to understand`,
        codeExample: `// useReducer state machine — no library
// tagged union: impossible combos can't be represented
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: Error };

type Event =
  | { type: 'FETCH' }
  | { type: 'RESOLVE'; data: User }
  | { type: 'REJECT'; error: Error };

// switch on CURRENT state: only legal transitions allowed
function reducer(state: State, event: Event): State {
  switch (state.status) {
    case 'idle':
      return event.type === 'FETCH' ? { status: 'loading' } : state;
    case 'loading':
      if (event.type === 'RESOLVE') return { status: 'success', data: event.data };
      if (event.type === 'REJECT') return { status: 'error', error: event.error };
      return state; // ignore irrelevant events
    case 'success':
    case 'error':
      return event.type === 'FETCH' ? { status: 'loading' } : state;
  }
}`
      },
      {
        id: 'state-mgmt-9',
        title: 'URL as State',
        content: `Query params, path segments, and hash fragments are state too — and they\'re the only state that survives reload, share, and back/forward.

What belongs in the URL:
• Filters and search — ?q=react&type=video
• Selected tab / step — /checkout/payment\n• Pagination cursor — ?page=3 or ?after=cursor123\n• Modal open state — ?modal=settings\n• Map viewport — #lat=37.7&lng=-122.4&zoom=12

What does NOT:
• Sensitive data (URLs are logged, browsed, shared)
• High-frequency updates (slider drags) — use local state, only commit to URL on release
• Anything you\'d need to reset on refresh

Implementation:
• Browser-native: URLSearchParams, history.pushState/replaceState
• React Router 6+: useSearchParams returns [params, setParams] — feels like useState
• Next.js: useSearchParams (read), router.push (write)
• Specialized: nuqs (typed URL state hooks for Next.js), tanstack-router (typed)

Patterns:
• replaceState during typing (don\'t spam history); pushState on commit
• Type-safe schema validation (zod) on URL params — never trust raw strings
• Default values: missing param means default; explicit values shown in URL`,
        codeExample: `// React Router pattern
import { useSearchParams } from 'react-router-dom';

function ProductList() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const sort = (params.get('sort') ?? 'recent') as 'recent' | 'popular';

  const updateQuery = (next: string) => {
    const newParams = new URLSearchParams(params);
    if (next) newParams.set('q', next); else newParams.delete('q');
    setParams(newParams, { replace: true }); // don't pollute history
  };

  return (
    <input value={q} onChange={e => updateQuery(e.target.value)} />
  );
}

// Result: refresh / share / back-forward all just work`
      },
      {
        id: 'state-mgmt-10',
        title: 'Form State: React Hook Form, TanStack Form',
        content: `Forms break naive state management — every keystroke can re-render the entire form, validation gets tangled with state, and you end up reinventing the wheel.

Two dominant libraries:

React Hook Form (RHF) — uncontrolled by default, performance-first:
• const { register, handleSubmit, formState } = useForm()
• <input {...register('email')} /> — uses native uncontrolled inputs, no re-render per keystroke
• Validation via zod, yup, or built-in rules
• Per-field subscriptions: only fields actually used re-render

TanStack Form (newer, framework-agnostic):
• Headless, fully typed, framework-agnostic
• Schema-first validation
• Composable field-level subscriptions
• Better TypeScript inference for nested forms

Formik (older, declining):
• Controlled-by-default — re-render per keystroke unless you opt into FastField
• Solid but slower than RHF for big forms
• New code probably shouldn\'t pick this

Native form approach (React 19 + Server Actions):
• Server Action handles submission
• useActionState for return values
• useFormStatus for pending state
• Often enough for simple forms — no library needed

Pick by complexity:
• Simple form, server-rendered → native React 19
• Complex client-side form with cross-field validation, dynamic fields → React Hook Form or TanStack Form`,
        codeExample: `import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// schema defines the shape AND the validation rules
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function LoginForm() {
  // resolver wires zod validation into the form
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    // handleSubmit validates first, then calls login
    <form onSubmit={handleSubmit(login)}>
      {/* register: uncontrolled input, no re-renders */}
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <input type="password" {...register('password')} />
      <button disabled={isSubmitting}>Sign in</button>
    </form>
  );
}`
      },
      {
        id: 'state-mgmt-11',
        title: 'Local-First & Sync Engines',
        content: `Local-first architecture: the local app is the source of truth, with an eventually-consistent sync engine pushing changes to and from the server. Reads are instant; writes feel synchronous; the app works offline.

Frameworks:
• Replicache — sync engine with mutations defined client-side, transparently pushed
• Yjs — CRDT library powering Figma\'s multiplayer cursors, Google Docs-like collab editing
• Automerge — JSON-like CRDTs with rich-text and history
• Liveblocks — hosted CRDT-based multiplayer
• PouchDB — offline-first DB synced with CouchDB
• ElectricSQL — Postgres synced to local SQLite

Why it matters:
• No spinners — every interaction is local, async sync happens out of band
• Offline works because local IS the source of truth
• Multiplayer "for free" once you\'re using CRDTs (no manual conflict resolution)

Trade-offs:
• Complex storage (IndexedDB or SQLite in the browser)
• Auth + permissions need careful design (server still authoritative on access)
• Schema migrations are harder when many clients have stale local copies
• Storage quotas per-origin (~10% of disk on most browsers)

Design principle: any change a user makes appears instantly in the local store, then propagates. The UI never says "saving..." for routine edits.`,
        codeExample: `// Yjs collaborative editing
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const ydoc = new Y.Doc();
const provider = new WebsocketProvider('wss://my-sync', 'room-1', ydoc);
const ytext = ydoc.getText('content');

// Local write — appears instantly
ytext.insert(0, 'Hello, ');

// Remote changes from peers arrive automatically
ytext.observe(event => render(ytext.toString()));

// CRDT semantics: any concurrent writes from any peer
// merge automatically without conflicts.`
      }
    ],
    flashcards: [
      { id: 'state-fc-1', front: 'What is the difference between Redux and Context?', back: 'Redux has middleware, devtools, and optimized re-renders. Context re-renders all consumers on any change. Redux is better for complex state, Context for simple global values.' },
      { id: 'state-fc-2', front: 'What does Immer do in Redux Toolkit?', back: 'Allows you to write "mutating" logic that actually produces immutable updates. state.value = newValue becomes a new state object behind the scenes.' },
      { id: 'state-fc-3', front: 'What is server state vs client state?', back: 'Server state: data from APIs (users, posts). Client state: UI state (modals, forms). Tools like React Query handle server state with caching and sync.' },
      { id: 'state-fc-4', front: 'Why doesn\'t Zustand need a Provider?', back: 'Zustand stores state in a module-level closure, not React context. Components subscribe directly to the store via hooks, making it simpler to use.' },
      { id: 'state-fc-5', front: 'What is a Redux selector?', back: 'A function that extracts specific data from the store state. Using selectors with useSelector optimizes re-renders by only updating when selected data changes.' },
      { id: 'state-fc-6', front: 'What is staleTime in React Query?', back: 'How long data is considered fresh. During this time, React Query won\'t refetch. After staleTime, data is refetched in background on component mount.' },
      { id: 'state-fc-7', front: 'What is an optimistic update?', back: 'Updating UI immediately before the server responds, assuming success. If the request fails, roll back to previous state. Provides instant feedback.' },
      { id: 'state-fc-8', front: 'What is createAsyncThunk?', back: 'Redux Toolkit function for async actions. Automatically dispatches pending/fulfilled/rejected actions based on promise state.' },
      { id: 'state-fc-9', front: 'Why split Context by update frequency?', back: 'All consumers of a context re-render when it changes. Separating rarely-changing data (theme) from frequent data (user input) reduces unnecessary re-renders.' },
      { id: 'state-fc-10', front: 'What is queryClient.invalidateQueries?', back: 'Marks queries as stale and triggers refetch. Used after mutations to ensure UI shows latest server data. Can target specific query keys.' },
      { id: 'state-fc-11', front: 'Jotai atoms vs Zustand store', back: 'Jotai: state is a graph of small atoms; components subscribe to specific atoms; re-renders are surgical without selectors.\n\nZustand: one (or few) larger stores; components use selectors to subscribe to slices and avoid unnecessary renders.\n\nAtoms: many small pieces of independent state; derived values everywhere. Stores: a coherent global model with rich actions. Different mental models, both modern.' },
      { id: 'state-fc-12', front: 'Valtio (proxy-based state)', back: 'State you can MUTATE. Wrap an object in proxy(); writes trigger re-renders of components reading those keys.\n\nconst state = proxy({ count: 0 });\nconst snap = useSnapshot(state); // immutable read\nstate.count++; // direct mutation, components re-render\n\nFamiliar imperative ergonomics; sister library to Jotai. Trade-off: less explicit data flow than reducer-based stores.' },
      { id: 'state-fc-13', front: 'MobX observables', back: 'A class- or object-based reactivity system: mark data as observable, mark functions as autorun/computed, MobX tracks reads and re-runs them when dependencies change.\n\nclass Store { @observable count = 0; @action inc() { this.count++; } }\n\nVery powerful, dynamic, but pairs less naturally with React than Jotai/Zustand. Steeper concept overhead; bigger bundle.' },
      { id: 'state-fc-14', front: 'RTK createSlice', back: 'Redux Toolkit shorthand for reducer + actions in one place.\n\ncreateSlice({\n  name: \'counter\',\n  initialState: { count: 0 },\n  reducers: {\n    inc(state) { state.count++ } // Immer makes mutation safe\n  }\n});\n\nReturns the reducer and action creators auto-derived from the reducer keys. Eliminates the boilerplate that gave Redux a bad reputation.' },
      { id: 'state-fc-15', front: 'RTK Query', back: 'Redux Toolkit\'s data-fetching layer. Define endpoints once, get auto-generated React hooks for queries and mutations, with caching, dedup, polling, and invalidation.\n\nRationale: gives you TanStack Query-like ergonomics if you\'re already in the Redux ecosystem. If you\'re not, TanStack Query is usually a lighter fit.' },
      { id: 'state-fc-16', front: 'redux-saga vs redux-thunk', back: 'redux-thunk: actions can be functions that get dispatch/getState. Simple. The default with RTK.\n\nredux-saga: side effects modeled as generator functions; takes events, runs effects, dispatches actions. Powerful for complex orchestration (cancellation, racing requests, debouncing) but adds significant cognitive overhead.\n\nMost teams should start with thunks; reach for saga only when async flows get genuinely complex.' },
      { id: 'state-fc-17', front: 'TanStack Query optimistic updates', back: 'Use onMutate to update the cache before the server responds; return a context with the previous value; rollback in onError; refetch in onSettled.\n\nResult: UI feels instant; if the server rejects, the change is rolled back automatically. The pattern works because the cache is the single source of truth — flipping it back atomically restores correctness.' },
      { id: 'state-fc-18', front: 'useInfiniteQuery (TanStack)', back: 'Manages paginated data as a chain of pages.\n\nuseInfiniteQuery({ queryKey, queryFn: ({pageParam}) => ..., getNextPageParam: lastPage => lastPage.nextCursor })\n\nfetchNextPage() loads the next page; data.pages contains all loaded pages; UI flattens them. Built-in support for both cursor-based and offset-based pagination.' },
      { id: 'state-fc-19', front: 'queryClient.prefetchQuery', back: 'Loads data into the cache BEFORE a component renders.\n\nqueryClient.prefetchQuery({ queryKey: [\'post\', id], queryFn: fetchPost });\n\nCommon trigger: hover on a link, route enter event. By the time the user clicks and the destination page mounts, the data is already in cache — no spinner. Massive perceived-speed win.' },
      { id: 'state-fc-20', front: 'TanStack Query SSR hydration', back: 'Server: prefetch into a queryClient → serialize via dehydrate(queryClient).\n\nClient: wrap the app in <HydrationBoundary state={dehydratedState}>. The cache is pre-warmed before any component runs. Initial render uses the prefetched data; queries remain alive for normal refetch behavior.\n\nMakes RSC + Query the de facto modern data pattern in Next.js.' },
      { id: 'state-fc-21', front: 'SWR vs TanStack Query', back: 'Both are stale-while-revalidate React data libraries.\n\nSWR (Vercel): smaller, simpler, fewer features. Good defaults out of the box. Optimistic updates feel a bit more manual.\n\nTanStack Query: bigger, more features (mutations, infinite, devtools, cancelation, retries). Steeper learning curve but ceiling is much higher.\n\nNew projects mostly pick TanStack Query unless bundle size is critical.' },
      { id: 'state-fc-22', front: 'When to use a state machine', back: 'When state has well-defined modes (idle/loading/success/error) and transitions, and you find boolean flags multiplying.\n\nSigns: bugs where the UI shows two contradictory things at once; flow you have to mentally simulate to understand; spaghetti useEffects coordinating booleans.\n\nLight version: useReducer + tagged union. Heavy version: XState with statecharts and visualizer.' },
      { id: 'state-fc-23', front: 'XState statecharts', back: 'Hierarchical state machines: states can have nested substates, parallel regions, and history nodes. Goes beyond flat finite state machines.\n\nKilling features: visualizer that shows your machine as a live diagram; actor model for concurrent machines; built-in interpreter that handles invocation of services and timers.\n\nGreat for complex flows: checkout, multi-step forms, video players, OAuth flows, traffic-light-style coordination.' },
      { id: 'state-fc-24', front: 'Why put state in the URL?', back: 'It\'s the only state that survives reload, share, and back/forward. Filters, search queries, selected tabs, modals, paginated cursors all belong here.\n\nUsers benefit: bookmarkable, shareable, back/forward works as expected. Devs benefit: less local state, automatic SSR, no separate "deeplink" code.\n\nDon\'t put: secrets, high-frequency updates (slider drags), data you want to reset on refresh.' },
      { id: 'state-fc-25', front: 'replaceState vs pushState', back: 'pushState: adds a new entry to browser history. Back button steps through.\n\nreplaceState: updates the current entry without adding to history.\n\nUse pushState when the new URL is a meaningful navigation (search submit, tab change). Use replaceState for incremental updates (typing in a search field, changing filter without "navigating") so the back button works as users expect.' },
      { id: 'state-fc-26', front: 'React Hook Form vs Formik', back: 'React Hook Form: uncontrolled by default. Inputs use native form state; per-field subscriptions; minimal re-renders. Fast even on huge forms.\n\nFormik: controlled by default. Re-renders the whole form on every keystroke unless you opt into FastField. Slower at scale.\n\nNew code → React Hook Form. Or skip both for simple forms with React 19 native form support.' },
      { id: 'state-fc-27', front: 'TanStack Form', back: 'Newer headless form library, framework-agnostic, fully typed.\n\nKey wins: better TypeScript inference for nested forms; composable field subscriptions (each field can have its own subscriber); schema-first validation; works with React, Vue, Solid, Angular.\n\nPicking between RHF and TanStack Form: RHF is more battle-tested; TanStack Form has better TS ergonomics. Either is fine.' },
      { id: 'state-fc-28', front: 'Replicache / sync engines', back: 'Local-first sync engines: writes go to local storage instantly, sync to server in the background, pull other clients\' changes.\n\nReplicache, ElectricSQL, RxDB, PouchDB. App reads from local always; the network is an implementation detail.\n\nResult: no spinners on routine actions, full offline support, multiplayer for free. Trade-off: complex storage layer, harder schema migrations across many devices.' },
      { id: 'state-fc-29', front: 'Yjs and CRDTs', back: 'Yjs: a CRDT library for collaborative editing. Concurrent edits from any peer merge deterministically without conflicts.\n\nPowers Figma cursors, real-time docs, multiplayer canvases. CRDT (Conflict-free Replicated Data Type) is the math that makes "two users edit offline, merge later, no conflicts" possible.\n\nUse case: any feature where multiple users collaborate on the same document at the same time without a central locking server.' },
      { id: 'state-fc-30', front: 'Zustand persist middleware', back: 'Wraps a Zustand store to automatically persist state to localStorage / sessionStorage / IndexedDB.\n\ncreate(persist((set) => ({ count: 0 }), { name: \'app-store\' }));\n\nFirst load: hydrate from storage. Updates: write through to storage. Versioning + migrations supported. Same pattern exists for redux (redux-persist), Jotai (atomWithStorage).' }
    ],
    quizQuestions: [
      {
        id: 'state-q-1',
        question: 'When should you use React Query over Redux?',
        options: ['Never', 'For all state', 'For server/async data', 'For form state'],
        correctAnswer: 2,
        explanation: 'React Query excels at server state: fetching, caching, synchronizing. Redux is better for client state. Many apps use both together.'
      },
      {
        id: 'state-q-2',
        question: 'What does createAsyncThunk handle?',
        options: ['Sync actions only', 'Async actions with pending/fulfilled/rejected', 'Component lifecycle', 'Routing'],
        correctAnswer: 1,
        explanation: 'createAsyncThunk creates an async action that automatically dispatches pending, fulfilled, and rejected action types based on the promise state.'
      },
      {
        id: 'state-q-3',
        question: 'Why might Context cause performance issues?',
        options: ['It\'s slow by design', 'All consumers re-render on any change', 'It doesn\'t support objects', 'It can\'t handle async'],
        correctAnswer: 1,
        explanation: 'When Context value changes, all consuming components re-render, even if they only use a portion of the value. Redux and Zustand optimize this with selectors.'
      },
      {
        id: 'state-q-4',
        question: 'What is the main benefit of Zustand over Redux?',
        options: ['More features', 'Better performance', 'Simpler API, less boilerplate', 'Official React support'],
        correctAnswer: 2,
        explanation: 'Zustand has a minimal API with no providers, reducers, or action creators required. It\'s much simpler to set up while still being powerful.'
      },
      {
        id: 'state-q-5',
        question: 'What does useQuery return besides data?',
        options: ['Nothing else', 'isLoading, error, refetch', 'Only error', 'Component reference'],
        correctAnswer: 1,
        explanation: 'useQuery returns { data, isLoading, error, refetch, isFetching, ... } providing full control over the query state and manual refetch capability.'
      },
      {
        id: 'state-q-6',
        question: 'How does Immer enable "mutating" syntax in Redux?',
        options: ['It doesn\'t', 'Uses Proxy to track changes and produce new state', 'Disables immutability', 'Clones everything'],
        correctAnswer: 1,
        explanation: 'Immer uses JavaScript Proxy to track changes to a draft state, then produces a new immutable state based on those changes.'
      },
      {
        id: 'state-q-7',
        question: 'A page has 50 mostly-independent pieces of state with derived values cross-referencing each other. Which model fits best?',
        options: ['One big Redux store', 'Atoms (Jotai) — fine-grained subscriptions and auto-tracked derived atoms', 'Many useState hooks at top level', 'Multiple Contexts'],
        correctAnswer: 1,
        explanation: 'Atoms shine when state is many small independent pieces. Components subscribe surgically; derived atoms automatically track dependencies and recompute when needed.'
      },
      {
        id: 'state-q-8',
        question: 'You add an item to a list. To make the UI feel instant via TanStack Query, what does the optimistic mutation pattern do FIRST?',
        options: ['Send the request', 'Show a loading spinner', 'Snapshot current cache + write the optimistic value (so UI updates immediately)', 'Clear the cache'],
        correctAnswer: 2,
        explanation: 'onMutate snapshots the cache and writes the optimistic new value. If the server fails, onError uses the snapshot to roll back. The UI feels instant; correctness is preserved.'
      },
      {
        id: 'state-q-9',
        question: 'What\'s the cleanest way to load infinite-scroll posts using TanStack Query?',
        options: ['useQuery in a loop', 'useInfiniteQuery with getNextPageParam', 'useState + manual page tracking', 'useEffect that re-runs on scroll'],
        correctAnswer: 1,
        explanation: 'useInfiniteQuery is purpose-built: it manages page chains, knows how to fetch the next page from your getNextPageParam function, and exposes hasNextPage / fetchNextPage to the UI.'
      },
      {
        id: 'state-q-10',
        question: 'Your component has isLoading, error, and data booleans as separate useState — and bugs where it sometimes shows two states at once. What\'s the structural fix?',
        options: ['Add another boolean', 'Refactor to a tagged union state machine (one of: idle | loading | success | error)', 'Wrap in useMemo', 'Use useReducer with the same booleans'],
        correctAnswer: 1,
        explanation: 'A tagged union (state machine) makes impossible states unrepresentable. The compiler enforces that you handle each mode explicitly, eliminating the contradiction-state class of bugs.'
      },
      {
        id: 'state-q-11',
        question: 'A search input filter should survive page reload and be shareable via URL. Where do you store the query?',
        options: ['useState only', 'localStorage', 'URL search params', 'A global Context'],
        correctAnswer: 2,
        explanation: 'URL state survives reload, share, and back/forward. localStorage survives reload but isn\'t shareable. Context is lost on reload. URL is the only option that satisfies all three.'
      },
      {
        id: 'state-q-12',
        question: 'You have a 100-field form. Why does React Hook Form scale better than Formik?',
        options: ['It\'s newer', 'Uncontrolled inputs by default + per-field subscriptions = no whole-form re-render per keystroke', 'Smaller bundle', 'Better validation'],
        correctAnswer: 1,
        explanation: 'RHF uses uncontrolled inputs (read-from-DOM) and lets fields subscribe individually. Formik\'s default mode re-renders the whole form on every keystroke unless you opt into FastField — slower on big forms.'
      },
      {
        id: 'state-q-13',
        question: 'A Next.js app server-renders with TanStack Query. What does the client need to do to avoid an immediate refetch on hydration?',
        options: ['Nothing — it\'s automatic', 'Wrap the app in <HydrationBoundary state={dehydratedState}> and prefetch on the server', 'Disable TanStack Query', 'Manually call useQuery again'],
        correctAnswer: 1,
        explanation: 'Server prefetches into a queryClient → dehydrate to JSON → client hydrates the cache via HydrationBoundary. The pre-warmed cache means components render with data immediately, no refetch.'
      },
      {
        id: 'state-q-14',
        question: 'Your app needs to feel instant offline AND merge concurrent edits from multiple users without conflicts. Which architecture fits?',
        options: ['Redux + REST', 'Local-first with a CRDT-based sync engine (Yjs, Replicache, Automerge)', 'Server-side rendering only', 'Polling'],
        correctAnswer: 1,
        explanation: 'CRDTs guarantee deterministic merge of concurrent edits. Combined with local-first storage (writes apply to local store first, sync in background), you get offline + multiplayer with no manual conflict resolution.'
      },
      {
        id: 'state-q-15',
        question: 'A user types "react query" in a search field. Each keystroke updates the URL. What\'s the right history method?',
        options: ['pushState — every keystroke is a new history entry', 'replaceState — typing updates the current entry; only meaningful submits push history', 'No history change', 'Clear history'],
        correctAnswer: 1,
        explanation: 'replaceState avoids polluting history with every keystroke. pushState would mean the back button steps through every character the user typed — terrible UX.'
      },
      {
        id: 'state-q-16',
        question: 'useSelector(state => state.todos.filter(t => t.done)) makes the component re-render on every store update, even unrelated ones. Why?',
        options: ['useSelector always re-renders on every dispatch', 'filter returns a new array each call, so the reference-equality check always sees a change', 'Arrays cannot be selected from Redux', 'The selector is missing a dependency array'],
        correctAnswer: 1,
        explanation: 'useSelector re-renders when the selected value fails a strict-equality check. A selector that derives a new array/object each run always fails it. Memoize with createSelector (Reselect), or select primitives / the raw todos and derive in useMemo.'
      },
      {
        id: 'state-q-17',
        question: 'The same user object is duplicated inside posts, comments, and likes in your store. Renaming a user means patching three places. What is the structural fix?',
        options: ['Store everything in Context instead', 'Refetch the entire store after each update', 'Normalize: keep entities in { byId, allIds } and store references by id elsewhere', 'Use deep-clone on every update'],
        correctAnswer: 2,
        explanation: 'Normalization keeps a single source of truth per entity (like a database table). Redux Toolkit\'s createEntityAdapter does this for you; TanStack Query users get similar benefits by keying queries per entity.'
      },
      {
        id: 'state-q-18',
        question: 'A custom store hook subscribes in useEffect and copies the value into useState. Under concurrent rendering, sibling components briefly show different values of the same store. What is this and what fixes it?',
        options: ['Tearing — subscribe with useSyncExternalStore instead', 'A race condition — add an AbortController', 'Prop drilling — lift state up', 'Stale closure — add the store to the dependency array'],
        correctAnswer: 0,
        explanation: 'Tearing happens when a render is interrupted and the external store changes mid-tree. useSyncExternalStore lets React read a consistent snapshot and re-render synchronously on change; Zustand, Redux, and Jotai all use it internally.'
      },
      {
        id: 'state-q-19',
        question: 'A Redux reducer (no Immer) does state.items.push(action.payload); return state;. What breaks?',
        options: ['Nothing — Redux deep-compares state', 'The reducer throws because state is frozen', 'The action is silently dropped', 'Subscribers see the same reference, so components don\'t re-render, and DevTools time-travel is corrupted'],
        correctAnswer: 3,
        explanation: 'React-Redux and selectors rely on reference equality to detect change. Mutating in place returns the old reference, so nothing updates, and previous states in DevTools are mutated too. Reducers must be pure and return new objects (or use Immer via createSlice).'
      },
      {
        id: 'state-q-20',
        question: 'A dropdown\'s open/closed flag lives in the global store and is read by exactly one component. What is the guideline?',
        options: ['Keep it global so it can be debugged in DevTools', 'Colocate it as local state in the component; promote to shared/global state only when multiple distant components need it', 'Move it to the URL', 'Store it in a TanStack Query cache'],
        correctAnswer: 1,
        explanation: 'Colocation keeps state next to the code that uses it: fewer re-renders across the app, less boilerplate, and easier deletion. Lift state only as far as the nearest common ancestor that needs it.'
      }
    ],
    visualizations: [
      {
        id: 'state-viz-1',
        title: 'State Management Options',
        type: 'diagram',
        description: 'Choosing the right state solution',
        nodes: [
          { id: 'local', label: 'useState', x: 80, y: 60 },
          { id: 'context', label: 'Context', x: 200, y: 60 },
          { id: 'redux', label: 'Redux', x: 320, y: 60 },
          { id: 'simple', label: 'Simple', x: 80, y: 140 },
          { id: 'medium', label: 'Medium', x: 200, y: 140 },
          { id: 'complex', label: 'Complex', x: 320, y: 140 }
        ],
        edges: [
          { from: 'simple', to: 'local', label: 'use' },
          { from: 'medium', to: 'context', label: 'use' },
          { from: 'complex', to: 'redux', label: 'use' }
        ]
      },
      {
        id: 'state-viz-2',
        title: 'React Query Flow',
        type: 'diagram',
        description: 'Data fetching with caching',
        nodes: [
          { id: 'component', label: 'Component', x: 80, y: 100 },
          { id: 'cache', label: 'Cache', x: 200, y: 100 },
          { id: 'server', label: 'Server', x: 320, y: 100 }
        ],
        edges: [
          { from: 'component', to: 'cache', label: 'useQuery' },
          { from: 'cache', to: 'server', label: 'fetch' },
          { from: 'server', to: 'cache', label: 'response' },
          { from: 'cache', to: 'component', label: 'data' }
        ]
      }
    ]
  },

  // 6. Web Performance
  {
    id: 'web-performance',
    name: 'Web Performance',
    slug: 'web-performance',
    description: 'Core Web Vitals, lazy loading, caching strategies',
    icon: 'speedometer-outline',
    color: '#00C853',
    colorDark: '#009624',
    premium: true,
    learnContent: [
      {
        id: 'perf-1',
        title: 'Core Web Vitals',
        content: `Google's Core Web Vitals measure real-world user experience.

• LCP (Largest Contentful Paint): < 2.5s - loading performance
• FID (First Input Delay): < 100ms - interactivity
• CLS (Cumulative Layout Shift): < 0.1 - visual stability
• INP (Interaction to Next Paint): replacing FID
• TTFB (Time to First Byte): server response time`,
        codeExample: `// Measure Core Web Vitals
import { getCLS, getFID, getLCP } from 'web-vitals';

getCLS(console.log);  // Layout shift score
getFID(console.log);  // Input delay in ms
getLCP(console.log);  // LCP time in ms

// Report to analytics
function sendToAnalytics(metric) {
  const body = JSON.stringify(metric);
  navigator.sendBeacon('/analytics', body);
}`
      },
      {
        id: 'perf-2',
        title: 'Lazy Loading & Code Splitting',
        content: `Load only what's needed to improve initial page load.

• React.lazy(): dynamic component imports
• Suspense: loading fallback while loading
• Route-based splitting: load per route
• Image lazy loading: loading="lazy"
• Intersection Observer: load on visibility`,
        codeExample: `// Component lazy loading
const Dashboard = React.lazy(() => import('./Dashboard'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Dashboard />
    </Suspense>
  );
}

// Image lazy loading
<img src="photo.jpg" loading="lazy" alt="..." />

// Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) loadContent(entry.target);
  });
});`
      },
      {
        id: 'perf-3',
        title: 'Caching Strategies',
        content: `Strategic caching dramatically improves performance.

• Browser cache: Cache-Control, ETag headers
• Service Worker: offline-first, background sync
• Stale-while-revalidate: serve cached, update in background
• CDN caching: edge locations for static assets
• API caching: React Query, SWR for data`,
        codeExample: `// Cache-Control headers
Cache-Control: public, max-age=31536000, immutable

// Service Worker caching
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetched = fetch(event.request).then(res => {
        const clone = res.clone();
        caches.open('v1').then(c => c.put(event.request, clone));
        return res;
      });
      return cached || fetched; // stale-while-revalidate
    })
  );
});`
      },
      {
        id: 'perf-4',
        title: 'Image Optimization',
        content: `Images are often the largest assets on a page.

• Modern formats: WebP, AVIF (smaller files)
• Responsive images: srcset for different sizes
• Lazy loading: defer offscreen images
• Compression: optimize quality vs size
• CDN delivery: serve from edge locations`,
        codeExample: `<!-- Responsive images -->
<!-- srcset lists candidates with their real widths;
     sizes says how wide the img renders per breakpoint -->
<img
  src="image-800.jpg"
  srcset="
    image-400.jpg 400w,
    image-800.jpg 800w,
    image-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px, 800px"
  loading="lazy"
  alt="Description"
/>

<!-- Picture element for format fallback -->
<!-- browser uses first source it supports -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>`
      },
      {
        id: 'perf-5',
        title: 'JavaScript Performance',
        content: `Optimize JavaScript for faster execution.

• Bundle splitting: separate vendor code
• Tree shaking: remove unused code
• Minification: reduce file size
• Defer/async scripts: non-blocking loading
• Web Workers: offload heavy computation`,
        codeExample: `<!-- Async vs Defer -->
<script async src="analytics.js"></script> <!-- ASAP, any order -->
<script defer src="app.js"></script> <!-- After DOM, in order -->

// Web Worker for heavy tasks
const worker = new Worker('heavy-task.js');
worker.postMessage(data);
worker.onmessage = (e) => console.log(e.data);

// Dynamic import for code splitting
const module = await import('./heavyModule.js');

// Debounce expensive operations
const debouncedSearch = debounce(search, 300);`
      },
      {
        id: 'perf-6',
        title: 'Critical Rendering Path & Resource Hints',
        content: `The browser must build the DOM, CSSOM, render tree, layout, then paint — every render-blocking resource on the way pushes back FCP and LCP. Resource hints let you steer the browser.

Render-blocking by default:
• Synchronous <script> in <head>
• <link rel="stylesheet"> in <head>

Resource hints (in priority order):
• preconnect: open the TCP+TLS handshake to an origin EARLY (good for fonts, analytics origins). Cheap to overuse.
• dns-prefetch: cheaper than preconnect — only resolves DNS. Useful for many origins where preconnect would be overkill.
• preload: tell the browser "this resource is needed for the current page; fetch it with high priority." Use for hero images, late-discovered fonts, critical CSS injected later.
• prefetch: "you might need this on the NEXT navigation." Low priority. Used by frameworks for route prefetching.
• modulepreload: like preload but for ES modules — preloads the module AND its declared dependencies.

Misuse: preloading too much hurts more than helps; the network is contested and you push out genuinely critical bytes. Audit with the Network panel + lighthouse.

Early Hints (HTTP 103):
• Server sends 103 with Link headers BEFORE the final response
• Browser starts preloading critical assets while the server is still computing the page
• Big LCP wins on dynamic, slow-to-compute pages`,
        codeExample: `<head>
  <!-- Open TCP+TLS to font origin asap -->
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- Late-discovered critical font -->
  <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>

  <!-- Hero image preload -->
  <link rel="preload" as="image"
    href="/hero.avif"
    imagesrcset="/hero-800.avif 800w, /hero-1600.avif 1600w"
    imagesizes="100vw">

  <!-- Module + its imports -->
  <link rel="modulepreload" href="/main.js">
</head>

<!-- Server side: emit 103 Early Hints
HTTP/1.1 103 Early Hints
Link: </main.js>; rel=preload; as=script
Link: </main.css>; rel=preload; as=style
-->`
      },
      {
        id: 'perf-7',
        title: 'INP & Long Tasks',
        content: `Interaction to Next Paint (INP) replaced First Input Delay (FID) as a Core Web Vital in March 2024. INP measures the latency of EVERY interaction (clicks, taps, key presses), reporting the worst — not just the first.

Targets:
• Good: < 200ms
• Needs improvement: 200–500ms
• Poor: > 500ms

Long tasks: any main-thread task >50ms blocks input handling. Common offenders:
• Heavy synchronous JS (parsing, hydration, big array work)
• Layout thrashing in event handlers
• Large React re-renders
• Synchronous third-party scripts

Tools to find them:
• Chrome DevTools Performance panel — yellow blocks marked "Long Task"
• PerformanceObserver({ type: \'long-animation-frame\', buffered: true }) — programmatic capture
• Web Vitals JS library reports field INP

Mitigations:
• Break long work into chunks; yield with scheduler.yield() or requestIdleCallback / setTimeout(fn, 0)
• Move heavy work to a Web Worker
• Use useTransition / startTransition in React to mark non-urgent updates
• Hydrate progressively; avoid blocking hydration on huge components
• Defer third-party scripts until after first interaction

INP is hard to optimize because it surfaces real user behavior — synthetic tests miss it. Field data (Web Vitals reports, RUM) is the source of truth.`,
        codeExample: `// scheduler.yield() for cooperative scheduling (Chrome 129+)
async function processLargeArray(items) {
  for (let i = 0; i < items.length; i++) {
    processItem(items[i]);
    if (i % 100 === 0 && 'scheduler' in window) {
      await scheduler.yield(); // give the main thread back
    }
  }
}

// PerformanceObserver: log long tasks
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) console.warn('Long task:', entry);
  }
}).observe({ type: 'longtask', buffered: true });`
      },
      {
        id: 'perf-8',
        title: 'Font Loading: font-display, Preload, Subsetting',
        content: `Web fonts are a top cause of CLS, FOIT, and slow LCP. Three levers to fix it.

font-display:
• block (default): hide text up to 3s, then swap. Causes FOIT (Flash of Invisible Text).
• swap: show fallback immediately, swap when font loads. Causes FOUT (Flash of Unstyled Text) but text is always readable.
• fallback: short block period (~100ms), then swap if font ready, otherwise stick with fallback. Compromise.
• optional: short block, then either uses the font (cached) or never swaps to it this load. Fastest.

Preload critical fonts:
• <link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/inter.woff2">
• Triggers fetch in parallel with HTML parsing — eliminates the late-discovery delay
• Only preload truly critical fonts (1–2 max); over-preloading slows other resources

Subsetting:
• Strip unused characters from a font file
• Latin subset of a multi-script font drops 80–90% of bytes
• Use unicode-range in @font-face to declare which characters a file covers — browser only downloads the file if a glyph from that range is actually rendered
• Tools: fontkit, glyphhanger

Variable fonts:
• One file with multiple weights/styles via axes (wght, wdth, ital)
• Often smaller than 4 separate fixed files
• Modern alternative to shipping inter-100, inter-300, inter-500, inter-700

Reduce CLS:
• Use font-size-adjust to match fallback x-height to web font
• Use size-adjust descriptor to scale fallback line-height
• Result: text reflow on font swap is barely visible`,
        codeExample: `@font-face {
  font-family: 'Inter';
  font-display: swap;
  src: url('/fonts/inter.woff2') format('woff2');
  unicode-range: U+0000-00FF; /* Latin only */
  size-adjust: 100%;
}

@font-face {
  font-family: 'Inter';
  font-display: swap;
  src: url('/fonts/inter-cyrillic.woff2') format('woff2');
  unicode-range: U+0400-04FF; /* Cyrillic */
}

/* Body uses Inter; browser downloads only the subsets actually rendered */`
      },
      {
        id: 'perf-9',
        title: 'Web Workers & OffscreenCanvas',
        content: `JavaScript on the main thread blocks paint, scrolling, and input. Workers move work to a separate thread.

Web Worker:
• new Worker(\'./worker.js\', { type: \'module\' })
• postMessage / onmessage to communicate (structured clone — no functions)
• Has its own scope: no DOM, no window, but full JS, fetch, IndexedDB
• Use for: heavy computation, parsing big JSON, image processing, ML inference

Performance handoff cost:
• postMessage clones data; for big payloads use Transferable objects (ArrayBuffer, MessagePort, ImageBitmap, OffscreenCanvas)
• Transferring is O(1) and zero-copy; cloning is O(n)

SharedArrayBuffer + Atomics:
• Truly shared memory between threads
• Requires cross-origin isolation (COOP/COEP headers)
• Power: lock-free data structures, multi-threaded WASM
• Used by Figma, Photoshop Web

OffscreenCanvas:
• A canvas detached from the DOM that can be transferred to a worker
• The worker draws to it; main thread doesn\'t block
• Killer for: animations, dataviz, games — anything that draws every frame

Service Worker (different thing!):
• Runs in the background of an origin, intercepts network requests
• Powers offline, custom caching, push notifications
• Not a Web Worker per se but a related primitive`,
        codeExample: `// Main thread
const worker = new Worker('./csv-parser.js', { type: 'module' });
worker.postMessage({ csv: hugeBlob });
worker.onmessage = (e) => render(e.data);

// OffscreenCanvas — draw in worker
const canvas = document.querySelector('canvas');
const offscreen = canvas.transferControlToOffscreen();
worker.postMessage({ canvas: offscreen }, [offscreen]); // transfer

// worker.js
self.onmessage = (e) => {
  const ctx = e.data.canvas.getContext('2d');
  // 60fps animation here, doesn't touch main thread
  function draw(t) { /* ... */ requestAnimationFrame(draw); }
  draw();
};`
      },
      {
        id: 'perf-10',
        title: 'HTTP/2, HTTP/3, Early Hints',
        content: `Network layer matters more than most app code thinks. Modern protocols cut latency dramatically.

HTTP/1.1:
• One request per connection at a time (head-of-line blocking)
• Browsers open 6 parallel connections per origin
• "Domain sharding" trick to get more — counterproductive on modern protocols

HTTP/2:
• Multiplexes many requests over one connection
• Binary framing, header compression (HPACK)
• Server Push (mostly deprecated — replaced by 103 Early Hints)
• Still has TCP-level head-of-line blocking: lost packet stalls the whole connection

HTTP/3 / QUIC:
• Built on UDP (not TCP) — bypasses TCP\'s head-of-line blocking
• 0-RTT connection resumption — repeat visits handshake-free
• Per-stream loss recovery — one lost packet only affects its own stream
• Cloudflare, Google, AWS, Fastly all support HTTP/3 today; opt-in with Alt-Svc header

When it matters:
• Mobile networks with packet loss — HTTP/3 is dramatically faster
• High-latency connections — 0-RTT eliminates one round trip
• Many small assets — multiplexing wins big

Early Hints (HTTP 103):
• Server sends 103 with Link headers BEFORE computing the final response
• Browser preloads critical assets in parallel with server work
• Wins biggest on slow-to-render dynamic pages
• Supported by Chrome, Edge, Cloudflare, Fastly

Compression:
• Brotli (br) at quality 4–6 for HTML/CSS/JS — smaller than gzip, similar CPU
• Brotli at quality 11 for static assets at build time (slower compress, same decompress)
• zstd is gaining server support; even better at compression speed`,
        codeExample: `# Nginx: enable Brotli + HTTP/3
http {
  brotli on;
  brotli_types text/css application/javascript application/json text/html;
  brotli_comp_level 6;
}

server {
  listen 443 ssl http2;
  listen 443 quic reuseport;     # HTTP/3
  add_header Alt-Svc 'h3=":443"; ma=86400';
}

# Send Early Hints from your app:
HTTP/1.1 103 Early Hints
Link: </main.css>; rel=preload; as=style
Link: </main.js>; rel=preload; as=script

HTTP/1.1 200 OK
... actual response ...`
      },
      {
        id: 'perf-11',
        title: 'Bundle Analysis & Code-Split Strategies',
        content: `Most web apps ship 30–60% more JS than they need. Bundle analysis is the difference between random optimizations and targeted wins.

Tools:
• webpack-bundle-analyzer / rollup-plugin-visualizer — interactive treemap of every module
• source-map-explorer — analyzes built bundles
• Lighthouse "Avoid enormous network payloads" + "Reduce unused JavaScript"

Common findings:
• Massive lib imports (lodash, moment) when you used 2 functions — switch to per-import (lodash/get) or lighter alts (date-fns, dayjs)
• Polyfills for browsers your users don\'t have — target modern with browserslist
• Both ESM and CJS versions of a lib included accidentally
• Source maps shipped to production (set sourceMap: \'hidden-source-map\' or upload-only)

Code-split strategies:
• Route-based: each route a chunk. Default in Next, React Router with lazy routes.
• Component-based: heavy components (charts, editors, code blocks) loaded on demand
• Vendor split: framework + lib chunks separate from app code (better cache hit rate across deploys)
• Common chunks: shared code between routes loaded once

Critical: always pair code splits with prefetching on hover/route enter — otherwise your "fast initial load" pays back as a click-spinner later.

Server Components (RSC) shrink client bundles dramatically: code that renders on the server NEVER ships to the browser. Often the biggest single win for app-shell size.`,
        codeExample: `// Analyze locally
npx webpack --profile --json > stats.json
npx webpack-bundle-analyzer stats.json

# Vite
npm run build -- --report
# or
npx vite-bundle-visualizer

// React route-based split
const Dashboard = lazy(() => import('./Dashboard'));

// Prefetch on hover for instant navigation
<Link to="/dashboard"
  onMouseEnter={() => import('./Dashboard')}>
  Open Dashboard
</Link>`
      }
    ],
    flashcards: [
      { id: 'perf-fc-1', front: 'What is LCP and what\'s a good score?', back: 'Largest Contentful Paint measures when the main content is visible. Good: < 2.5s, Needs improvement: 2.5-4s, Poor: > 4s.' },
      { id: 'perf-fc-2', front: 'What causes Cumulative Layout Shift (CLS)?', back: 'Elements that move after initial render: images without dimensions, ads/embeds, dynamically injected content, web fonts causing FOIT/FOUT.' },
      { id: 'perf-fc-3', front: 'What is code splitting?', back: 'Breaking your bundle into smaller chunks loaded on demand. Reduces initial load time by only loading code needed for the current view.' },
      { id: 'perf-fc-4', front: 'What is stale-while-revalidate?', back: 'A caching strategy that serves cached content immediately while fetching fresh content in the background for next time.' },
      { id: 'perf-fc-5', front: 'How does loading="lazy" work?', back: 'Browser-native lazy loading for images and iframes. Defers loading until element is near the viewport, saving bandwidth on initial load.' },
      { id: 'perf-fc-6', front: 'What\'s the difference between async and defer scripts?', back: 'async: loads in parallel, executes immediately when ready (any order). defer: loads in parallel, executes after DOM ready (in order).' },
      { id: 'perf-fc-7', front: 'What is tree shaking?', back: 'Dead code elimination that removes unused exports from bundles. Requires ES modules (import/export) and a bundler like webpack or Rollup.' },
      { id: 'perf-fc-8', front: 'What is TTFB?', back: 'Time to First Byte - how long until the browser receives the first byte of response from the server. Affected by server performance and network latency.' },
      { id: 'perf-fc-9', front: 'Why use WebP or AVIF image formats?', back: 'They provide better compression than JPEG/PNG, resulting in smaller file sizes with similar or better quality. AVIF is newest with best compression.' },
      { id: 'perf-fc-10', front: 'What is a Service Worker?', back: 'A script that runs in the background, separate from the web page. Enables offline functionality, push notifications, and advanced caching strategies.' },
      { id: 'perf-fc-11', front: 'INP (Interaction to Next Paint)', back: 'Core Web Vital that replaced FID in 2024. Measures latency of every interaction (click, tap, key) and reports the worst, not just the first.\n\nGood: <200ms; Poor: >500ms. Hard to optimize because it surfaces real user behavior — synthetic tests miss it.' },
      { id: 'perf-fc-12', front: 'What counts as a long task?', back: 'A main-thread task that takes >50ms. Blocks input handling and animations during that window.\n\nFind them with Chrome DevTools Performance panel or PerformanceObserver({ type: "longtask" }). Mitigations: yield with scheduler.yield() / setTimeout, move to Web Worker, use React useTransition.' },
      { id: 'perf-fc-13', front: 'preload vs prefetch', back: 'preload: "this resource is needed for the CURRENT page; high priority." Use for late-discovered fonts, hero images, critical CSS. Browser fetches in parallel with HTML parsing.\n\nprefetch: "you might need this on the NEXT navigation; low priority." Used for route prefetching. Doesn\'t block the current page.' },
      { id: 'perf-fc-14', front: 'preconnect vs dns-prefetch', back: 'dns-prefetch: just resolves DNS for an origin. Cheapest hint.\n\npreconnect: opens TCP + TLS handshake. More expensive but saves more time when the origin is actually used.\n\nUse preconnect for origins you\'ll use within a few hundred ms (fonts, hero images CDN, analytics). Use dns-prefetch as a budget option for many possible origins.' },
      { id: 'perf-fc-15', front: 'modulepreload', back: 'Preload an ES module AND its declared imports — saves the round-trip discovery delay.\n\n<link rel="modulepreload" href="/main.js">\n\nRegular preload only fetches the one file; the browser still has to parse to find imports. modulepreload also pre-fetches the module graph.' },
      { id: 'perf-fc-16', front: 'Early Hints (HTTP 103)', back: 'Server sends a 103 status with Link: rel=preload headers BEFORE computing the final response.\n\nBrowser preloads critical assets in parallel with server work. Big LCP wins on dynamic, slow-to-compute pages.\n\nSupported by Chrome, Edge, Cloudflare, Fastly. Opt-in feature on most servers.' },
      { id: 'perf-fc-17', front: 'font-display values', back: 'Controls fallback behavior while a web font loads:\n\n• block: hide text up to 3s, then swap (FOIT)\n• swap: show fallback immediately, swap when font loads (FOUT)\n• fallback: ~100ms block, then swap or stick with fallback\n• optional: ~100ms block; uses the font only if it\'s already cached\n\nMost teams default to swap; performance-critical sites pick optional.' },
      { id: 'perf-fc-18', front: 'Font preload pattern', back: '<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>\n\ncrossorigin is REQUIRED — fonts are CORS-credentialed by default and the preload must match the actual fetch attributes or it\'s wasted.\n\nOnly preload 1–2 truly critical fonts; preloading too many starves other resources.' },
      { id: 'perf-fc-19', front: 'Font subsetting via unicode-range', back: 'Each @font-face declares which Unicode ranges its file covers. Browser only downloads files for which a glyph from that range is actually rendered.\n\nA Latin-only English page never downloads the Cyrillic or CJK files even though @font-face declares them. Massive byte savings on multilingual fonts.' },
      { id: 'perf-fc-20', front: 'Critical CSS', back: 'The CSS needed to render above-the-fold content, inlined in <head>. Rest of CSS loads asynchronously.\n\nTechniques: extract via Critical, Penthouse, or Critters at build time. The first paint doesn\'t wait on a CSS file download.\n\nGotcha: too much critical CSS bloats HTML; aim for <14KB so it fits in one TCP roundtrip.' },
      { id: 'perf-fc-21', front: 'Brotli vs gzip', back: 'Brotli (br): better compression ratio than gzip (~20% smaller for HTML/CSS/JS), similar decompression speed.\n\nServers: enable Brotli at quality 4–6 dynamically; quality 11 at build time for static assets.\n\nGzip is universal; Brotli is supported by all modern browsers. Send Brotli when Accept-Encoding includes "br", gzip otherwise.' },
      { id: 'perf-fc-22', front: 'HTTP/3 / QUIC', back: 'HTTP/3 runs over QUIC, which runs over UDP — bypasses TCP\'s head-of-line blocking.\n\nWhen one packet is lost in HTTP/2, the whole connection stalls. In HTTP/3, only that stream stalls; others keep going.\n\n0-RTT connection resumption: repeat visits skip handshake. Big wins on mobile / lossy networks. Cloudflare, Google, AWS, Fastly all support it.' },
      { id: 'perf-fc-23', front: 'Service Worker cache strategies', back: 'Patterns for what to do on fetch:\n• cache-first — try cache, fall back to network (offline-friendly, can be stale)\n• network-first — try network, fall back to cache (always-fresh-when-online)\n• stale-while-revalidate — return cached now, update in background for next time\n• network-only / cache-only — explicit\n\nWorkbox, Vite PWA, Next-PWA standardize these patterns.' },
      { id: 'perf-fc-24', front: 'requestIdleCallback / scheduler.yield', back: 'Schedule work for when the main thread is idle.\n\nrequestIdleCallback(fn): older API, deadline-based. Browser tells you how much idle time you have.\n\nscheduler.yield(): newer (Chrome 129+). Returns a Promise; awaits then continues with same priority.\n\nUse for non-urgent work that should run between renders without blocking input.' },
      { id: 'perf-fc-25', front: 'Web Worker — when to use', back: 'When you have heavy synchronous work that blocks the main thread: parsing big JSON/CSV, image processing, ML inference, complex calculations.\n\nCommunicate via postMessage. For big payloads use Transferable objects (ArrayBuffer, ImageBitmap, OffscreenCanvas) — zero-copy transfer instead of clone.\n\nNot useful for I/O-bound work — that\'s already async.' },
      { id: 'perf-fc-26', front: 'OffscreenCanvas', back: 'A canvas detached from the DOM that can be transferred to a Web Worker.\n\nThe worker draws to it; main thread doesn\'t block on rendering. Killer for animations, dataviz, games — anything redrawn every frame.\n\nconst offscreen = canvas.transferControlToOffscreen();\nworker.postMessage({ canvas: offscreen }, [offscreen]);' },
      { id: 'perf-fc-27', front: 'PerformanceObserver', back: 'API for observing performance entries: marks, measures, navigation, resources, long tasks, paint timings, layout-shifts, INP.\n\nnew PerformanceObserver(list => { ... }).observe({ type: "longtask", buffered: true });\n\nThe buffered: true flag returns entries that happened BEFORE the observer was set up — vital for catching paint metrics from the very start.' },
      { id: 'perf-fc-28', front: 'content-visibility: auto', back: 'Tells the browser an off-screen element doesn\'t need to be rendered until near the viewport.\n\n.section { content-visibility: auto; contain-intrinsic-size: 0 800px; }\n\ncontain-intrinsic-size reserves a "fake size" so scrollbar and layout don\'t jump. Massive perf win on long pages — first paint and scroll perf both improve.' },
      { id: 'perf-fc-29', front: 'Speculation Rules / prerender', back: 'Newer API to declaratively prefetch or PRERENDER pages the user is likely to navigate to.\n\n<script type="speculationrules">\n{"prerender": [{"urls": ["/dashboard"]}]}\n</script>\n\nThe browser may render the page in a hidden tab. When the user clicks, the navigation is instant. Use carefully — prerender is expensive (full render in the background).' },
      { id: 'perf-fc-30', front: 'TBT vs INP', back: 'TBT (Total Blocking Time): lab metric — sum of long-task time between FCP and TTI. Synthetic, in Lighthouse.\n\nINP: field metric — actual interaction latency in real user sessions. Measured by RUM.\n\nTBT is a proxy for INP under controlled conditions; INP is the real thing. Optimize TBT in lab; verify with field INP.' }
    ],
    quizQuestions: [
      {
        id: 'perf-q-1',
        question: 'Which Core Web Vital measures visual stability?',
        options: ['LCP', 'FID', 'CLS', 'TTFB'],
        correctAnswer: 2,
        explanation: 'CLS (Cumulative Layout Shift) measures how much the page layout shifts unexpectedly during loading. A good score is less than 0.1.'
      },
      {
        id: 'perf-q-2',
        question: 'What is the purpose of React.lazy()?',
        options: ['Make components slower', 'Enable code splitting', 'Add animations', 'Handle errors'],
        correctAnswer: 1,
        explanation: 'React.lazy() enables code splitting by dynamically importing components. The component\'s code is only loaded when it\'s first rendered.'
      },
      {
        id: 'perf-q-3',
        question: 'What prevents CLS for images?',
        options: ['loading="lazy"', 'Setting width and height', 'Using WebP format', 'CDN hosting'],
        correctAnswer: 1,
        explanation: 'Setting explicit width and height (or aspect-ratio) reserves space for images before they load, preventing layout shift.'
      },
      {
        id: 'perf-q-4',
        question: 'Which script attribute maintains execution order?',
        options: ['async', 'defer', 'type="module"', 'crossorigin'],
        correctAnswer: 1,
        explanation: 'defer scripts execute in order after DOM is ready. async scripts execute as soon as they load, regardless of order.'
      },
      {
        id: 'perf-q-5',
        question: 'What does a Service Worker enable?',
        options: ['Faster JavaScript', 'Offline functionality', 'Better SEO', 'Smaller images'],
        correctAnswer: 1,
        explanation: 'Service Workers run in the background and can intercept network requests, enabling offline functionality, caching, and push notifications.'
      },
      {
        id: 'perf-q-6',
        question: 'What is a good LCP score?',
        options: ['< 100ms', '< 1s', '< 2.5s', '< 5s'],
        correctAnswer: 2,
        explanation: 'A good LCP (Largest Contentful Paint) is under 2.5 seconds. Between 2.5-4s needs improvement, over 4s is poor.'
      },
      {
        id: 'perf-q-7',
        question: 'Which Core Web Vital replaced FID in March 2024?',
        options: ['LCP', 'CLS', 'INP (Interaction to Next Paint)', 'TTFB'],
        correctAnswer: 2,
        explanation: 'INP measures the latency of every interaction (clicks, taps, keys), reporting the worst — not just the first input like FID did. Better representation of real interactivity.'
      },
      {
        id: 'perf-q-8',
        question: 'You need to load a hero image as soon as possible. The image isn\'t inlined in HTML; you reference it via CSS background-image. What hint helps?',
        options: ['rel="prefetch"', 'rel="preload" as="image"', 'rel="dns-prefetch"', 'No hint needed'],
        correctAnswer: 1,
        explanation: 'preload with as="image" tells the browser to fetch in parallel with HTML parsing, before the CSS is even processed. Critical for LCP-determining images that aren\'t in the HTML.'
      },
      {
        id: 'perf-q-9',
        question: 'Why include crossorigin on a font preload?',
        options: ['Decorative', 'Fonts are CORS-credentialed by default — without crossorigin the preload fetch attributes won\'t match the actual fetch and the preload is wasted', 'It\'s required by HTTP/3', 'For caching'],
        correctAnswer: 1,
        explanation: 'Browser preload works by matching attributes. If the preload\'s crossorigin doesn\'t match the actual font fetch, the preload doesn\'t satisfy it — the font is fetched twice and the hint is wasted.'
      },
      {
        id: 'perf-q-10',
        question: 'A 200ms task on the main thread is processing CSV data. What\'s the structurally correct fix?',
        options: ['Optimize the parser slightly', 'Move the work to a Web Worker so the main thread stays responsive', 'Show a loading spinner', 'Increase debounce delay'],
        correctAnswer: 1,
        explanation: 'A 200ms main-thread task blocks input. Web Workers have their own thread; main thread stays at 60fps. Communicate via postMessage; transfer big buffers as Transferables for zero-copy.'
      },
      {
        id: 'perf-q-11',
        question: 'Why is HTTP/3 over QUIC faster than HTTP/2 over TCP on lossy networks?',
        options: ['Stronger encryption', 'QUIC bypasses TCP\'s head-of-line blocking — a lost packet only stalls its own stream, not all of them', 'It uses HTTP/1.1 internally', 'It\'s newer'],
        correctAnswer: 1,
        explanation: 'TCP delivers packets in order; one loss stalls all multiplexed streams. QUIC handles loss recovery per-stream, so other streams keep flowing. Big wins on mobile networks.'
      },
      {
        id: 'perf-q-12',
        question: 'You have 5,000 list items in a long page. First paint is fast but scrolling is slow. Which CSS property gives the biggest win?',
        options: ['will-change: transform', 'content-visibility: auto on each item', 'backface-visibility: hidden', 'overflow: hidden'],
        correctAnswer: 1,
        explanation: 'content-visibility: auto skips layout/paint for off-screen elements until near the viewport. Pair with contain-intrinsic-size to keep scrollbar accurate. Massive scroll-perf win on long pages.'
      },
      {
        id: 'perf-q-13',
        question: 'Your bundle is 1.2MB. Lighthouse says "reduce unused JavaScript." What\'s the first investigation step?',
        options: ['Minify more', 'Use webpack-bundle-analyzer / source-map-explorer to see what\'s actually in the bundle', 'Disable source maps', 'Switch to a different framework'],
        correctAnswer: 1,
        explanation: 'You can\'t target what you can\'t see. Bundle analyzers show a treemap of every module; common findings are "lodash imported entirely for one function" or "polyfills targeting browsers nobody has."'
      },
      {
        id: 'perf-q-14',
        question: 'For a multilingual site, you want browsers to download only the font subset for the script actually rendered. Which CSS feature?',
        options: ['font-display: swap', 'unicode-range in @font-face declarations per script', 'font-stretch', 'A larger preload'],
        correctAnswer: 1,
        explanation: 'unicode-range tells the browser which characters each font file covers. The browser only downloads files whose range overlaps with rendered glyphs. A Latin-only page never downloads Cyrillic or CJK files.'
      },
      {
        id: 'perf-q-15',
        question: 'A dynamic page takes 600ms to compute server-side. The browser sits idle. What protocol feature reclaims that wait?',
        options: ['HTTP/3', 'Server Push', 'Early Hints (HTTP 103) — server sends preload Link headers before the final response', 'Larger TCP windows'],
        correctAnswer: 2,
        explanation: '103 Early Hints sends Link: rel=preload headers ahead of the final 200, letting the browser fetch critical CSS/JS in parallel with the server\'s computation. Big LCP wins on slow-to-render pages.'
      },
      {
        id: 'perf-q-16',
        question: 'Your build emits app.3f9a2c.js (content-hashed) and index.html. Which Cache-Control strategy is right?',
        options: ['Both: max-age=31536000', 'Both: no-store', 'JS: max-age=31536000, immutable; HTML: no-cache (revalidate with ETag)', 'JS: no-cache; HTML: max-age=31536000'],
        correctAnswer: 2,
        explanation: 'A hashed filename changes whenever the content does, so it can be cached forever and immutable skips revalidation. HTML keeps a stable URL, so it must be revalidated on each load (no-cache still allows a 304). Caching HTML for a year strands users on old bundles.'
      },
      {
        id: 'perf-q-17',
        question: 'When a user hovers the Pricing link, you want that route\'s JS chunk downloaded at low priority so navigation feels instant. Which hint?',
        options: ['<link rel="prefetch">', '<link rel="preload">', '<link rel="preconnect">', '<script async>'],
        correctAnswer: 0,
        explanation: 'prefetch fetches a resource for a likely future navigation at idle priority and stores it in the HTTP cache. preload is high priority for the current page and the browser warns if it goes unused; preconnect only opens a connection.'
      },
      {
        id: 'perf-q-18',
        question: 'A button click runs a 300ms synchronous computation and then updates the UI. INP is poor. What gives the best INP without changing the computation?',
        options: ['Move the computation into a Promise.then', 'Wrap it in requestAnimationFrame', 'Use a click listener with { passive: true }', 'Update the UI first (e.g. show a pressed/loading state), yield to the browser, then run the heavy work'],
        correctAnswer: 3,
        explanation: 'INP measures from input to the next paint. Paint cheap feedback first, then yield (setTimeout 0 or scheduler.yield()) so the frame renders before the heavy work. Promise.then is a microtask and still blocks the paint; passive only affects scroll/touch preventDefault.'
      },
      {
        id: 'perf-q-19',
        question: 'The hero <img> is in the initial HTML but downloads at the same priority as 20 below-the-fold thumbnails, delaying LCP. Which attribute fixes it?',
        options: ['loading="eager"', 'fetchpriority="high"', 'decoding="sync"', 'importance="critical"'],
        correctAnswer: 1,
        explanation: 'fetchpriority="high" raises the request priority so the LCP image is fetched ahead of other images. loading="eager" is already the default and changes nothing; decoding affects only decode scheduling; importance is not a real attribute.'
      },
      {
        id: 'perf-q-20',
        question: 'Users press Back and your page fully reloads instead of restoring instantly. What commonly makes a page ineligible for the back/forward cache?',
        options: ['Using <script defer>', 'A large DOM', 'An unload event listener or Cache-Control: no-store on the document', 'Having a service worker'],
        correctAnswer: 2,
        explanation: 'bfcache snapshots the whole page in memory. unload handlers and no-store on the main document disqualify it in most browsers, as do open IndexedDB transactions or WebSockets. Use pagehide instead of unload and check the Lighthouse bfcache audit.'
      }
    ],
    visualizations: [
      {
        id: 'perf-viz-1',
        title: 'Core Web Vitals Timeline',
        type: 'diagram',
        description: 'When each metric is measured',
        nodes: [
          { id: 'start', label: 'Page Load', x: 50, y: 100 },
          { id: 'ttfb', label: 'TTFB', x: 130, y: 100 },
          { id: 'fcp', label: 'FCP', x: 210, y: 100 },
          { id: 'lcp', label: 'LCP', x: 290, y: 100 },
          { id: 'fid', label: 'FID/INP', x: 280, y: 100 }
        ],
        edges: [
          { from: 'start', to: 'ttfb' },
          { from: 'ttfb', to: 'fcp' },
          { from: 'fcp', to: 'lcp' },
          { from: 'lcp', to: 'fid' }
        ]
      },
      {
        id: 'perf-viz-2',
        title: 'Caching Layers',
        type: 'diagram',
        description: 'Multiple levels of caching',
        nodes: [
          { id: 'browser', label: 'Browser\nCache', x: 100, y: 50, type: 'primary' },
          { id: 'sw', label: 'Service\nWorker', x: 250, y: 50, type: 'secondary' },
          { id: 'cdn', label: 'CDN\nEdge', x: 100, y: 150, type: 'info' },
          { id: 'origin', label: 'Origin\nServer', x: 250, y: 150, type: 'secondary' }
        ],
        edges: [
          { from: 'browser', to: 'sw' },
          { from: 'sw', to: 'cdn' },
          { from: 'cdn', to: 'origin' }
        ]
      }
    ]
  },

  // 7. Web Security
  {
    id: 'web-security',
    name: 'Web Security',
    slug: 'web-security',
    description: 'XSS, CSRF, authentication, and security best practices',
    icon: 'shield-checkmark-outline',
    color: '#FF5252',
    colorDark: '#D32F2F',
    premium: true,
    learnContent: [
      {
        id: 'sec-1',
        title: 'Cross-Site Scripting (XSS)',
        content: `XSS allows attackers to inject malicious scripts into web pages.

• Stored XSS: malicious script saved in database
• Reflected XSS: script in URL parameters
• DOM-based XSS: client-side JavaScript vulnerabilities
• Prevention: sanitize input, encode output, use CSP
• React auto-escapes but dangerouslySetInnerHTML is risky`,
        codeExample: `// VULNERABLE - Never do this!
element.innerHTML = userInput;
<div dangerouslySetInnerHTML={{__html: userInput}} />

// SAFE - React auto-escapes
<div>{userInput}</div>

// SAFE - Sanitize if HTML is needed
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);

// CSP header
Content-Security-Policy: default-src 'self'; script-src 'self'`
      },
      {
        id: 'sec-2',
        title: 'CSRF & Authentication',
        content: `CSRF tricks users into making unwanted requests.

• Attack: malicious site submits form to your API
• Same-origin cookies are sent automatically
• Prevention: CSRF tokens, SameSite cookies
• Use httpOnly cookies for session tokens
• Implement proper CORS headers`,
        codeExample: `// CSRF token in forms
<form action="/transfer" method="POST">
  <input type="hidden" name="csrf" value={csrfToken} />
  ...
</form>

// Secure cookie settings
Set-Cookie: session=abc123;
  HttpOnly;
  Secure;
  SameSite=Strict;

// CORS headers
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Credentials: true`
      },
      {
        id: 'sec-3',
        title: 'Security Headers',
        content: `HTTP security headers protect against various attacks.

• Content-Security-Policy: control resource loading
• X-Frame-Options: prevent clickjacking
• X-Content-Type-Options: prevent MIME sniffing
• Strict-Transport-Security: force HTTPS
• Referrer-Policy: control referrer information`,
        codeExample: `// Essential security headers
// CSP: only load resources from allowed sources
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';

X-Frame-Options: DENY // block iframe embedding (clickjacking)
X-Content-Type-Options: nosniff // no MIME-type guessing
Strict-Transport-Security: max-age=31536000 // force HTTPS
Referrer-Policy: strict-origin-when-cross-origin

// Express.js - use helmet
const helmet = require('helmet');
app.use(helmet());`
      },
      {
        id: 'sec-4',
        title: 'Input Validation',
        content: `Validate and sanitize all user input.

• Never trust client-side validation alone
• Validate on both client and server
• Use allowlists over blocklists
• Parameterized queries prevent SQL injection
• Escape output based on context (HTML, JS, URL)`,
        codeExample: `// Server-side validation
const { body, validationResult } = require('express-validator');

// validation chain runs before the handler
app.post('/user', [
  body('email').isEmail().normalizeEmail(),
  body('age').isInt({ min: 0, max: 120 }),
  body('name').trim().escape() // escape HTML chars
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // reject bad input before touching the DB
    return res.status(400).json({ errors: errors.array() });
  }
});

// Parameterized query (prevents SQL injection)
db.query('SELECT * FROM users WHERE id = $1', [userId]);`
      },
      {
        id: 'sec-5',
        title: 'Secure Authentication',
        content: `Implement authentication securely.

• Hash passwords with bcrypt or Argon2
• Use secure session management
• Implement rate limiting
• Require strong passwords
• Consider multi-factor authentication (MFA)`,
        codeExample: `// Password hashing with bcrypt
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(password, hash);

// Rate limiting
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts'
});
app.post('/login', loginLimiter, loginHandler);

// Password requirements
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/;`
      },
      {
        id: 'sec-6',
        title: 'OAuth 2.0, OIDC & PKCE',
        content: `OAuth 2.0 is an authorization framework — third-party apps get scoped access to a user's resources. OIDC adds authentication on top.

OAuth 2.0 — gives a third-party access (e.g., your app reads my Google Calendar). Returns access tokens.

OpenID Connect (OIDC) — adds identity. Returns an ID token (JWT) that proves who the user is. "Sign in with Google" uses OIDC.

The Authorization Code Flow (the only correct flow for new apps):
1. App redirects user to authorization server with response_type=code, client_id, redirect_uri, scope, code_challenge, state
2. User authenticates and consents
3. Auth server redirects back to redirect_uri with ?code=xyz&state=...
4. App exchanges code for tokens at the token endpoint, sending code_verifier
5. Auth server returns access_token (+ id_token + refresh_token if requested)

PKCE (Proof Key for Code Exchange):
• code_verifier — a 43–128 char random string
• code_challenge = base64url(sha256(verifier))
• Sent on the redirect request; verifier sent at token exchange
• Prevents interception of the code on public clients (mobile apps, SPAs)
• Required by spec for public clients; recommended for ALL clients

State parameter:
• Random per-request value the client sends and verifies on callback
• Prevents CSRF on the redirect

Deprecated flows you should NOT use:
• Implicit flow (response_type=token) — tokens in URL fragments, vulnerable
• Resource Owner Password Credentials — your app handling user passwords directly
• Client Credentials with public clients

Refresh tokens:
• Long-lived; exchange for new access tokens without user interaction
• Rotate refresh tokens on each exchange
• Revoke server-side on logout`,
        codeExample: `// PKCE generation (browser)
// random secret; only its hash leaves the app in step 1
const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
const challenge = base64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));

// Step 1: redirect to authorize
const url = new URL('https://auth.example/authorize');
url.searchParams.set('response_type', 'code');
url.searchParams.set('client_id', CLIENT_ID);
url.searchParams.set('redirect_uri', REDIRECT_URI);
url.searchParams.set('scope', 'openid profile email');
url.searchParams.set('state', randomState); // CSRF guard
url.searchParams.set('code_challenge', challenge);
url.searchParams.set('code_challenge_method', 'S256');
sessionStorage.setItem('verifier', verifier); // keep for step 2
location.href = url.toString();

// Step 2 (after redirect back): exchange code
const res = await fetch('https://auth.example/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    // proves WE started the flow — thwarts code theft
    code_verifier: sessionStorage.getItem('verifier'),
  }),
});
const { access_token, id_token, refresh_token } = await res.json();`
      },
      {
        id: 'sec-7',
        title: 'JWT Deep Dive: Pitfalls & Rotation',
        content: `JWTs are convenient but easy to misuse. Most JWT exploits are configuration bugs, not crypto breaks.

Structure: header.payload.signature, all base64url-encoded. Header declares algorithm; payload contains claims; signature is HMAC or RSA/ECDSA over header.payload.

Common vulnerabilities:

1. alg=none attack
   • Some libraries accept tokens with "alg": "none" and skip signature verification
   • Always specify allowed algorithms in your verifier; reject "none"

2. Algorithm confusion (RS256 → HS256)
   • You sign with RSA private key, verify with RSA public key
   • Attacker submits a token signed with HS256 using your PUBLIC key as the secret
   • Naive verifier picks alg from the token, treats public key as HMAC secret, signature verifies
   • Defense: hard-code the algorithm; never trust alg from header

3. Trusting unverified tokens
   • jwt.decode() (no verify) returns claims without checking signature
   • Always use jwt.verify() with the right algorithm and key

4. Long lifetimes + no revocation
   • JWTs are stateless — once issued you can't revoke until expiry
   • Mitigations: short access-token TTL (5–15 min), refresh tokens with revocation, "denylist" recently-revoked jti claims (becomes stateful — pick a path)

5. Where to store
   • localStorage — accessible to XSS, all bets off if XSS is exploited
   • Cookies with HttpOnly + Secure + SameSite=Strict — protected from XSS, vulnerable to CSRF without anti-CSRF tokens
   • Most apps: short-lived access token in memory, refresh token in HttpOnly cookie

Key rotation:
• Publish keys at /.well-known/jwks.json (JSON Web Key Set)
• Each key has a kid (key ID); tokens reference kid in their header
• Rotate by publishing new key + keeping old key valid for grace period
• Verifier fetches JWKS, picks the key with matching kid

Claims to validate: exp (expiry), nbf (not-before), iss (issuer), aud (audience), sub (subject). Reject tokens missing or with mismatched values.`,
        codeExample: `import jwt from 'jsonwebtoken';
import { createRemoteJWKSet, jwtVerify } from 'jose';

// CORRECT: hard-code algorithm, fetch keys dynamically
const JWKS = createRemoteJWKSet(new URL('https://issuer.example/.well-known/jwks.json'));

async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: 'https://issuer.example',
    audience: 'my-api',
    algorithms: ['RS256'], // explicit allow-list
  });
  return payload;
}

// WRONG (don't do this):
// jwt.decode(token) // no verification
// jwt.verify(token, secret) // accepts whatever alg is in the header`
      },
      {
        id: 'sec-8',
        title: 'CORS: Preflight, Credentials, Pitfalls',
        content: `Browsers enforce the Same-Origin Policy: cross-origin reads are blocked unless the server explicitly opts in via CORS headers.

Simple requests (no preflight):
• GET, HEAD, or POST with simple headers and certain content-types (text/plain, application/x-www-form-urlencoded, multipart/form-data)
• Browser sends Origin header; server must respond with Access-Control-Allow-Origin matching that origin (or *)

Preflighted requests:
• Triggered by methods other than the simple set, custom headers, or non-simple content-types (application/json triggers preflight!)
• Browser sends OPTIONS request first with Access-Control-Request-Method, Request-Headers
• Server responds with Allow-Methods, Allow-Headers, Max-Age (cache duration)
• Real request only goes if preflight passes

Credentials (cookies, Authorization header):
• Client must set credentials: 'include' on fetch
• Server MUST respond with Access-Control-Allow-Credentials: true AND a SPECIFIC Allow-Origin (cannot be *)
• Common bug: Allow-Origin: * with credentials → browser blocks
• Cookies still respect SameSite — cross-site cookies need SameSite=None; Secure

Common pitfalls:
• "I added Access-Control-Allow-Origin: *" — works for simple requests, fails the moment you need cookies, custom headers, or PUT/DELETE
• Forgetting the OPTIONS handler — preflight returns 404, real request never happens
• Allow-Origin reflecting the Origin header without validation — opens you to malicious origins; allowlist explicit origins
• Allow-Headers must list every custom header the request sends, exactly

Debug: open DevTools → Network → click the failing request → look at the response headers AND the OPTIONS preflight if there is one. The error message in console tells you which header is missing.`,
        codeExample: `// Express CORS middleware (manual, to see what's happening)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = ['https://app.example.com', 'https://app2.example.com'];

  // only reflect origins from an explicit allowlist
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin'); // critical with reflected origin
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // cache preflight 24h

  // answer the preflight and stop here
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Client side
fetch('https://api.example.com/me', {
  credentials: 'include', // send cookies
  headers: { 'Authorization': \`Bearer \${token}\` },
});`
      },
      {
        id: 'sec-9',
        title: 'Advanced CSP: Nonces, Strict-Dynamic, Trusted Types',
        content: `Modern Content Security Policy goes far beyond "block inline scripts."

Three lines of XSS defense:
1. Output encoding — your framework (React, Vue, Angular) handles this for the common case
2. CSP — defense in depth: even if injection succeeds, browser refuses to execute it
3. Trusted Types — eliminate DOM XSS sinks at the source

Nonce-based CSP:
• Server generates a random nonce per response (e.g., aBcDeFg123)
• <script nonce="aBcDeFg123">...</script> is allowed
• CSP: script-src 'nonce-aBcDeFg123' — no other inline scripts execute
• Per-response nonce means an attacker can't predict it
• Better than 'unsafe-inline'; works with framework-injected inline scripts (Next.js, Remix)

strict-dynamic:
• script-src 'nonce-xyz' 'strict-dynamic'
• Scripts loaded by trusted scripts (those with the nonce) inherit trust automatically
• Eliminates the need to allowlist every analytics/third-party CDN
• Recommended pattern by Google's CSP team

Trusted Types (Chromium-only as of 2026):
• Forces all DOM sinks (.innerHTML, document.write, etc.) to receive a TrustedType, not a string
• You define a sanitizer policy; only that policy can produce TrustedHTML
• Eliminates entire categories of DOM XSS — the bug isn't possible to write
• require-trusted-types-for 'script' in CSP enables enforcement

CSP report-only:
• Content-Security-Policy-Report-Only header
• Browser reports violations but doesn't block — safe rollout path
• Pair with report-uri / report-to to collect violations
• Tighten over weeks until ready to enforce

Don't use:
• unsafe-inline — defeats CSP entirely (use nonces instead)
• unsafe-eval — most apps don't need eval; if you do, audit ruthlessly`,
        codeExample: `// Server: per-response nonce
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      \`script-src 'nonce-\${nonce}' 'strict-dynamic' https:\`,
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "require-trusted-types-for 'script'",
    ].join('; ')
  );
  next();
});

// In template:
// <script nonce="<%= nonce %>" src="/main.js"></script>

// Trusted Types policy
const sanitizer = trustedTypes.createPolicy('default', {
  createHTML: (s) => DOMPurify.sanitize(s),
});
el.innerHTML = sanitizer.createHTML(userInput); // OK
el.innerHTML = userInput; // throws TypeError`
      },
      {
        id: 'sec-10',
        title: 'WebAuthn & Passkeys',
        content: `WebAuthn lets browsers authenticate users with public-key cryptography backed by hardware: Touch ID, Face ID, Windows Hello, security keys (YubiKey).

Passkeys are WebAuthn credentials that sync via the platform's password manager (iCloud Keychain, Google Password Manager, 1Password) — usable across the user's devices without manual setup.

How it works:
1. Registration: server sends a challenge; the device generates a key pair, stores private key in secure hardware, sends public key + signed challenge to server
2. Authentication: server sends a challenge; user confirms with biometric/PIN; device signs challenge with private key; server verifies with stored public key

Why it matters:
• No passwords means no phishing — the device only signs for the legit origin
• No passwords to leak in breaches
• User experience: tap fingerprint, done
• Protected against credential stuffing (each site gets a unique key pair)

Implementation:
• Browser API: navigator.credentials.create() / .get()
• Server library: @simplewebauthn/server, passport-webauthn, etc.
• Store credential ID + public key per user (one user can have many credentials)
• "Resident keys" / "discoverable credentials" let users sign in without typing a username first

Migration path:
• Phase 1: passkeys as a 2FA option
• Phase 2: passkeys as primary login, password as backup
• Phase 3: passwordless (passkeys only)

Apple, Google, Microsoft all support passkeys; cross-device sync via QR/Bluetooth handles the device-mismatch case.`,
        codeExample: `// Registration (client)
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: serverChallenge, // ArrayBuffer
    rp: { name: 'Algogo', id: 'algogo.app' },
    user: { id: userId, name: 'sahen@example.com', displayName: 'Sahen' },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }], // ES256
    authenticatorSelection: {
      userVerification: 'required',
      residentKey: 'required',
    },
    timeout: 60000,
  },
});
// POST credential to server, server stores credential.id + public key

// Authentication
const assertion = await navigator.credentials.get({
  publicKey: {
    challenge: serverChallenge,
    rpId: 'algogo.app',
    userVerification: 'required',
  },
});
// POST assertion to server, server verifies signature with stored public key`
      },
      {
        id: 'sec-11',
        title: 'OWASP Top 10 + SSRF + Supply Chain',
        content: `The OWASP Top 10 is the canonical list of web vulnerabilities. 2021 ranking (next refresh expected late 2025/2026):

1. Broken Access Control — IDOR, missing authorization checks. The #1 finding in real audits.
2. Cryptographic Failures — weak hashing, exposed PII, missing encryption in transit.
3. Injection — SQL, command, LDAP, NoSQL, ORM. Defended by parameterized queries / prepared statements / strict input validation.
4. Insecure Design — security by afterthought. Threat-model new features.
5. Security Misconfiguration — defaults, verbose errors, missing patches, exposed admin panels.
6. Vulnerable & Outdated Components — npm packages with known CVEs, unpatched OS/runtime.
7. Identification & Authentication Failures — weak passwords, missing MFA, session management bugs.
8. Software & Data Integrity Failures — unsigned auto-updates, deserialization of untrusted data.
9. Security Logging & Monitoring Failures — you can't respond to what you don't log.
10. SSRF (Server-Side Request Forgery) — promoted to top 10 in 2021.

SSRF in detail:
• App fetches a URL based on user input — user supplies http://169.254.169.254/latest/meta-data/iam/security-credentials/ (AWS metadata) and steals IAM creds
• Or http://localhost:6379 to talk to internal Redis, internal admin endpoints, etc.
• Defense: allowlist destinations; block private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, ::1, fe80::/10, fc00::/7); resolve DNS once, validate, then connect to the validated IP — not by hostname (TOCTOU)

Supply chain attacks:
• Malicious npm packages (typosquatting, dependency confusion, post-install scripts)
• Compromised legit packages (event-stream, ua-parser-js, ESLint scope incidents)
• Defenses: lockfiles + integrity hashes, npm audit / Snyk / Dependabot in CI, --ignore-scripts unless you trust the package, prefer well-maintained deps over abandoned ones, pin major versions, review package diffs on upgrade
• Sigstore / Sigsum / npm provenance: supply-chain integrity emerging

For a web app, the realistic top concerns:
1. Broken access control in your APIs (write tests for "can user A read user B's data?")
2. SSRF in any feature that fetches URLs
3. Supply chain — pin and audit deps; hardware-store secrets, not in code
4. CSRF on state-changing endpoints
5. XSS — keep React/Vue auto-escaping intact; CSP as defense in depth`,
        codeExample: `// SSRF defense — validate URL and target IP
import dns from 'dns/promises';
import { isPrivate } from 'ipaddr.js';

async function safeFetch(rawUrl: string) {
  const url = new URL(rawUrl);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('bad protocol');

  const addresses = await dns.resolve(url.hostname);
  for (const addr of addresses) {
    if (isPrivate(addr)) throw new Error('refused: private IP');
  }
  // connect by IP to prevent TOCTOU DNS rebinding
  return fetch(\`\${url.protocol}//\${addresses[0]}\${url.pathname}\${url.search}\`, {
    headers: { Host: url.hostname },
    redirect: 'manual', // re-validate redirects yourself
  });
}`
      }
    ],
    flashcards: [
      { id: 'sec-fc-1', front: 'What is XSS?', back: 'Cross-Site Scripting: injecting malicious scripts into web pages viewed by other users. Can steal cookies, modify content, or perform actions as the user.' },
      { id: 'sec-fc-2', front: 'What does the HttpOnly cookie flag do?', back: 'Prevents JavaScript from accessing the cookie via document.cookie. Protects session tokens from XSS attacks.' },
      { id: 'sec-fc-3', front: 'What is CSRF?', back: 'Cross-Site Request Forgery: tricking a user\'s browser into making unwanted requests to a site where they\'re authenticated.' },
      { id: 'sec-fc-4', front: 'What does SameSite=Strict mean?', back: 'Cookie is only sent with requests originating from the same site. Prevents CSRF by blocking cross-site cookie transmission.' },
      { id: 'sec-fc-5', front: 'What is Content Security Policy (CSP)?', back: 'HTTP header that controls which resources can be loaded. Prevents XSS by blocking inline scripts and restricting script sources.' },
      { id: 'sec-fc-6', front: 'Why use parameterized queries?', back: 'Prevents SQL injection by separating SQL code from data. The database treats parameters as data, not executable code.' },
      { id: 'sec-fc-7', front: 'What is clickjacking?', back: 'Tricking users into clicking hidden elements by overlaying them with legitimate-looking content. Prevented with X-Frame-Options header.' },
      { id: 'sec-fc-8', front: 'Why hash passwords with bcrypt?', back: 'bcrypt is slow by design, making brute force attacks impractical. Also includes salt automatically to prevent rainbow table attacks.' },
      { id: 'sec-fc-9', front: 'What is HSTS?', back: 'HTTP Strict Transport Security forces browsers to only connect via HTTPS. Prevents downgrade attacks and cookie hijacking over HTTP.' },
      { id: 'sec-fc-10', front: 'Why validate on both client and server?', back: 'Client validation improves UX with immediate feedback. Server validation is required for security because client validation can be bypassed.' },
      { id: 'sec-fc-11', front: 'OAuth 2.0 vs OIDC', back: 'OAuth 2.0: an AUTHORIZATION framework. Returns access tokens that grant scoped access to APIs.\n\nOIDC (OpenID Connect): adds AUTHENTICATION on top of OAuth 2.0. Returns an ID token (JWT) proving who the user is.\n\n"Sign in with Google" uses OIDC. "Connect your Calendar" uses plain OAuth.' },
      { id: 'sec-fc-12', front: 'PKCE — what does it prevent?', back: 'Proof Key for Code Exchange. Client generates a random code_verifier, sends sha256(verifier) as code_challenge with the auth redirect, then sends the verifier when exchanging the code for tokens.\n\nPrevents: an attacker who intercepts the auth code (e.g., via a malicious app handler on mobile) from exchanging it for tokens — they don\'t have the verifier.\n\nRequired for public clients (mobile, SPA); recommended for ALL OAuth clients.' },
      { id: 'sec-fc-13', front: 'JWT structure', back: 'Three base64url-encoded parts joined by dots: header.payload.signature.\n\n• header: { alg, typ, kid? }\n• payload: claims (sub, iss, aud, exp, iat, custom)\n• signature: HMAC or RSA/ECDSA over header.payload\n\nNot encrypted by default — base64 is reversible. Don\'t put secrets in JWTs unless you also encrypt (JWE).' },
      { id: 'sec-fc-14', front: 'JWT alg=none attack', back: 'Some libraries accept tokens with "alg": "none" and skip signature verification, treating any payload as authentic.\n\nDefense: explicit algorithm allowlist in the verifier — never trust the alg field from the token.\n\njwtVerify(token, key, { algorithms: [\'RS256\'] }) // hard-coded' },
      { id: 'sec-fc-15', front: 'JWT algorithm confusion (RS256 → HS256)', back: 'You sign with RS256 (RSA private key) and verify with the public key. An attacker submits a token forged with HS256 using your PUBLIC key as the HMAC secret.\n\nA naive verifier picks the alg from the header, treats the public key as a symmetric secret, and accepts the forgery.\n\nDefense: hard-code the expected algorithm; reject tokens whose alg doesn\'t match.' },
      { id: 'sec-fc-16', front: 'CORS preflight — what triggers it?', back: 'Browser sends an OPTIONS request before the real request when:\n• Method is not GET/HEAD/POST\n• Custom headers (anything beyond a simple set)\n• Content-Type is not text/plain, application/x-www-form-urlencoded, or multipart/form-data\n\napplication/json triggers preflight! Server must respond with appropriate Allow-* headers within the OPTIONS handler.' },
      { id: 'sec-fc-17', front: 'CORS with credentials gotcha', back: 'When credentials: \'include\' is set:\n• Browser sends cookies / Authorization\n• Server MUST respond with Access-Control-Allow-Credentials: true AND a SPECIFIC Access-Control-Allow-Origin (cannot be *)\n\nAccess-Control-Allow-Origin: * + credentials = browser blocks. Use a per-origin allowlist and reflect the matching origin (with Vary: Origin to keep caches sane).' },
      { id: 'sec-fc-18', front: 'CSP nonce', back: 'Server generates a random per-response value. Inline scripts that include matching nonce attribute are allowed; others are blocked.\n\nContent-Security-Policy: script-src \'nonce-aBcDeFg123\'\n<script nonce="aBcDeFg123">...</script>\n\nMuch safer than \'unsafe-inline\'. Works with framework-injected scripts (Next.js, Remix). Combine with \'strict-dynamic\' for cleaner allowlists.' },
      { id: 'sec-fc-19', front: 'CSP strict-dynamic', back: 'When in script-src, scripts loaded by trusted scripts (those with the nonce) inherit trust automatically.\n\nscript-src \'nonce-xyz\' \'strict-dynamic\'\n\nLets you skip allowlisting every analytics CDN — they get loaded by your nonce\'d main script and are trusted by inheritance. Recommended pattern by Google\'s CSP team.' },
      { id: 'sec-fc-20', front: 'Trusted Types', back: 'CSP feature that forces dangerous DOM sinks (.innerHTML, document.write, etc.) to receive a TrustedType, not a plain string.\n\nrequire-trusted-types-for \'script\' enables enforcement. You define a sanitizer policy; only that policy can produce TrustedHTML.\n\nResult: entire categories of DOM XSS become impossible to write — the bug class is eliminated, not just defended against.' },
      { id: 'sec-fc-21', front: 'Subresource Integrity (SRI)', back: '<script src="https://cdn/lib.js" integrity="sha384-..." crossorigin>\n\nBrowser computes the hash of the fetched resource and compares to the integrity value. Mismatch → script is rejected.\n\nProtects against compromised CDNs serving altered scripts. Generate hashes at build time. Combines naturally with CSP.' },
      { id: 'sec-fc-22', front: 'CORP / COOP / COEP', back: 'Three response headers that enable cross-origin isolation, required for SharedArrayBuffer, high-resolution timers, and OffscreenCanvas to a worker.\n\n• CORP (Cross-Origin-Resource-Policy): per-resource opt-in to cross-origin loading\n• COOP (Cross-Origin-Opener-Policy: same-origin): isolates browsing-context group from cross-origin opens\n• COEP (Cross-Origin-Embedder-Policy: require-corp): all subresources must opt in via CORP\n\nTogether they create a safe context for shared memory.' },
      { id: 'sec-fc-23', front: '__Host- cookie prefix', back: 'A cookie name starting with __Host- enforces:\n• Secure flag\n• Path=/\n• No Domain attribute (host-only cookie, not sent to subdomains)\n\nBrowsers refuse to set __Host-prefixed cookies that don\'t meet these requirements. Use for session cookies — eliminates entire classes of subdomain-confusion attacks.' },
      { id: 'sec-fc-24', front: 'Same-origin vs same-site', back: 'Same-origin: scheme + host + port all match (https://app.example.com:443 ≠ https://app.example.com:8443).\n\nSame-site: just the registrable domain matches (https://app.example.com and https://api.example.com are same-site even though different origins).\n\nSameSite cookies, fetch metadata headers, and CORP all use same-site. The browser security model uses both at different layers.' },
      { id: 'sec-fc-25', front: 'WebAuthn vs Passkey', back: 'WebAuthn: the W3C standard for public-key crypto authentication backed by hardware. Each credential is a key pair stored on a device.\n\nPasskey: a WebAuthn credential that syncs across the user\'s devices via the platform password manager (iCloud Keychain, Google Password Manager, 1Password). The same credential works on iPhone, iPad, Mac.\n\nAll passkeys are WebAuthn credentials; not all WebAuthn credentials are passkeys (a YubiKey-bound credential is device-only).' },
      { id: 'sec-fc-26', front: 'SSRF (Server-Side Request Forgery)', back: 'App fetches a URL based on user input. Attacker supplies internal URLs (cloud metadata services, internal Redis, admin panels) → app fetches and returns the response.\n\nClassic exploit: AWS EC2 instance metadata at 169.254.169.254 to steal IAM creds.\n\nDefense: allowlist hostnames; block private IP ranges; resolve DNS once and connect by IP to avoid TOCTOU rebinding.' },
      { id: 'sec-fc-27', front: 'Open redirect', back: 'A redirect endpoint that takes a URL parameter without validation: /login?redirect=//evil.com\n\nUsed in phishing — the link looks like your trusted domain but bounces to attacker. Compounds with OAuth flows: stealing tokens by redirecting after auth.\n\nDefense: allowlist redirect targets to known internal paths; validate against a strict pattern; reject anything starting with // or http(s).' },
      { id: 'sec-fc-28', front: 'iframe sandbox', back: '<iframe sandbox="allow-scripts allow-forms"> applies a strict default-deny policy and lets you re-enable specific capabilities.\n\nWithout sandbox: scripts, forms, popups, top-level nav, same-origin all allowed by default.\n\nWith sandbox: all blocked. Add only what\'s needed. Useful for embedding untrusted content (rich-text previews, third-party widgets).' },
      { id: 'sec-fc-29', front: 'Argon2 vs bcrypt vs scrypt', back: 'All three are deliberately slow password hashes — slowness is a feature, raising attacker cost.\n\nArgon2 (winner of PHC 2015): memory-hard, time-hard, parallelism configurable. Argon2id (hybrid) is the modern recommendation.\n\nbcrypt: oldest of the three, still widely used. CPU-bound only — vulnerable to GPU/ASIC attacks. Cost factor 12 minimum.\n\nscrypt: memory-hard predecessor to Argon2. Still solid; less popular than Argon2 today.\n\nNew systems: Argon2id. Existing systems: bcrypt is fine; rotate to Argon2 if practical.' },
      { id: 'sec-fc-30', front: 'TOTP vs WebAuthn', back: 'TOTP: time-based one-time password (Google Authenticator, Authy). User enters a 6-digit code; server verifies. Phishable — user can be tricked into typing the code into a fake site.\n\nWebAuthn: public-key crypto bound to the origin. Browser only signs for the legit origin — phish-resistant by design.\n\nFor 2FA, WebAuthn / passkeys > TOTP > SMS. SMS is the weakest (SIM swapping, SS7 attacks); TOTP is OK; WebAuthn is the gold standard.' }
    ],
    quizQuestions: [
      {
        id: 'sec-q-1',
        question: 'Which React pattern is vulnerable to XSS?',
        options: ['{userInput}', 'dangerouslySetInnerHTML', 'useState(userInput)', 'props.children'],
        correctAnswer: 1,
        explanation: 'dangerouslySetInnerHTML renders raw HTML without escaping. Always sanitize content with DOMPurify before using it.'
      },
      {
        id: 'sec-q-2',
        question: 'How do CSRF tokens prevent attacks?',
        options: ['Encrypt all data', 'Verify request origin with unique token', 'Block all POST requests', 'Require HTTPS'],
        correctAnswer: 1,
        explanation: 'CSRF tokens are unique per session/request. Attackers can\'t include the token in forged requests because they don\'t have access to it.'
      },
      {
        id: 'sec-q-3',
        question: 'What does Strict-Transport-Security do?',
        options: ['Blocks XSS', 'Forces HTTPS connections', 'Prevents clickjacking', 'Validates passwords'],
        correctAnswer: 1,
        explanation: 'HSTS tells browsers to only connect via HTTPS, preventing downgrade attacks and cookie hijacking over HTTP.'
      },
      {
        id: 'sec-q-4',
        question: 'What prevents SQL injection?',
        options: ['Client validation', 'HTTPS', 'Parameterized queries', 'Strong passwords'],
        correctAnswer: 2,
        explanation: 'Parameterized queries separate SQL code from user data. The database treats parameters as literal values, not executable SQL.'
      },
      {
        id: 'sec-q-5',
        question: 'What is the purpose of rate limiting?',
        options: ['Speed up requests', 'Prevent brute force attacks', 'Compress data', 'Cache responses'],
        correctAnswer: 1,
        explanation: 'Rate limiting restricts how many requests a user can make in a time period, preventing brute force attacks and DoS.'
      },
      {
        id: 'sec-q-6',
        question: 'Where should passwords be hashed?',
        options: ['Client only', 'Server only', 'Both client and server', 'Neither'],
        correctAnswer: 1,
        explanation: 'Passwords should be hashed on the server. Client-side hashing can be bypassed and doesn\'t add security since the hash becomes the password.'
      },
      {
        id: 'sec-q-7',
        question: 'In an OAuth 2.0 flow on a mobile app, what does PKCE prevent?',
        options: ['CSRF on the token endpoint', 'An attacker who intercepts the auth code from exchanging it for tokens (without the verifier)', 'Token expiration', 'Refresh token leakage'],
        correctAnswer: 1,
        explanation: 'PKCE binds the auth code to a code_verifier only the legitimate client knows. Even if an attacker intercepts the code (custom URL scheme hijack on mobile), they can\'t exchange it without the verifier.'
      },
      {
        id: 'sec-q-8',
        question: 'A library accepts JWTs with "alg": "none". What\'s the structural fix?',
        options: ['Set algorithm to RS512', 'Always specify an explicit algorithm allowlist in the verifier; never trust alg from the token', 'Use longer secrets', 'Use HTTPS'],
        correctAnswer: 1,
        explanation: 'The vulnerability is trusting the alg field. Configure the verifier with the exact allowed algorithms (e.g., [\'RS256\']) and reject anything else, including "none".'
      },
      {
        id: 'sec-q-9',
        question: 'A fetch from https://app.com to https://api.com sends Content-Type: application/json. Which CORS request type is this?',
        options: ['Simple request — no preflight', 'Preflighted (application/json triggers OPTIONS)', 'Forbidden — same-origin only', 'Browser bypasses CORS'],
        correctAnswer: 1,
        explanation: 'application/json is NOT in the simple-request allowlist (text/plain, application/x-www-form-urlencoded, multipart/form-data), so the browser sends an OPTIONS preflight first.'
      },
      {
        id: 'sec-q-10',
        question: 'A server responds with Access-Control-Allow-Origin: * AND Access-Control-Allow-Credentials: true. The browser blocks. Why?',
        options: ['Credentials cannot be combined with wildcard origin — must specify the exact origin', 'CORS isn\'t supported', 'The protocol is wrong', 'The server is unreachable'],
        correctAnswer: 0,
        explanation: 'Wildcard origin + credentials is explicitly disallowed by spec. Use a per-origin allowlist and reflect the matching origin (with Vary: Origin to prevent cache poisoning).'
      },
      {
        id: 'sec-q-11',
        question: 'What\'s the difference between CSP \'unsafe-inline\' and a per-response nonce?',
        options: ['No difference', '\'unsafe-inline\' allows ANY inline script — defeating CSP. Nonces only allow scripts with the matching attribute, which an attacker can\'t forge.', 'Nonces are slower', 'unsafe-inline is more secure'],
        correctAnswer: 1,
        explanation: 'unsafe-inline is the kill switch for CSP\'s XSS protection. Nonces preserve protection while still allowing your own inline scripts. Pair with strict-dynamic to clean up third-party allowlists.'
      },
      {
        id: 'sec-q-12',
        question: 'You include a third-party library via <script src="https://cdn.example/lib.js">. The CDN gets compromised and serves malicious JS. What feature would have prevented execution?',
        options: ['HTTPS alone', 'Subresource Integrity (integrity="sha384-..." attribute)', 'Larger script', 'Async loading'],
        correctAnswer: 1,
        explanation: 'SRI hashes the fetched resource and rejects it if the hash doesn\'t match. CDN compromise → modified content → hash mismatch → script never runs.'
      },
      {
        id: 'sec-q-13',
        question: 'A feature lets users supply a URL the server fetches and returns. An attacker submits http://169.254.169.254/. What attack is this?',
        options: ['CSRF', 'XSS', 'SSRF — Server-Side Request Forgery against the AWS metadata service', 'Open redirect'],
        correctAnswer: 2,
        explanation: 'SSRF. The metadata endpoint returns IAM credentials when fetched from inside the EC2 instance. Defense: allowlist hostnames; block private IP ranges; resolve DNS once and connect by IP.'
      },
      {
        id: 'sec-q-14',
        question: 'What does prefixing a cookie with __Host- enforce?',
        options: ['Nothing — it\'s decorative', 'Secure flag, Path=/, no Domain attribute (host-only) — refused if any are missing', 'Sets HttpOnly automatically', 'Sets SameSite=Strict'],
        correctAnswer: 1,
        explanation: '__Host- makes the cookie host-only and HTTPS-only at the browser level. Eliminates classes of subdomain confusion attacks where a sibling subdomain can read or write the cookie.'
      },
      {
        id: 'sec-q-15',
        question: 'For new password storage in 2026, which algorithm is recommended?',
        options: ['MD5 with salt', 'SHA-256', 'Argon2id', 'Plain bcrypt cost 4'],
        correctAnswer: 2,
        explanation: 'Argon2id (winner of the 2015 Password Hashing Competition) is memory-hard and time-hard, resisting GPU/ASIC attacks better than bcrypt. bcrypt at cost 12+ is still acceptable; SHA-256 alone and MD5 are unsafe for passwords.'
      },
      {
        id: 'sec-q-16',
        question: 'Users click a login-required link in an email. With SameSite=Strict they land logged out; with SameSite=Lax they are logged in. Why?',
        options: ['Strict blocks cookies over HTTP links', 'Lax cookies are stored in a different jar', 'Lax sends the cookie on cross-site top-level GET navigations; Strict never sends it on any cross-site request', 'Email clients strip Strict cookies'],
        correctAnswer: 2,
        explanation: 'Lax is the modern default: cookies ride along with safe top-level navigations (links) but not with cross-site POSTs, fetches, iframes, or images — which blocks most CSRF while keeping links working. Strict is best for a separate high-security session cookie.'
      },
      {
        id: 'sec-q-17',
        question: 'Your session cookie is HttpOnly, Secure, and Path=/. Which attack does this NOT mitigate?',
        options: ['Cookie theft via document.cookie in an XSS payload', 'CSRF — the browser attaches the cookie automatically regardless of JavaScript access', 'Sniffing the cookie on plain HTTP', 'Reading the cookie from a browser extension'],
        correctAnswer: 1,
        explanation: 'HttpOnly hides the cookie from scripts and Secure keeps it off HTTP. Neither stops a forged cross-site request, because the browser adds cookies itself. CSRF needs SameSite, a synchronizer token, or an Origin/Sec-Fetch-Site check.'
      },
      {
        id: 'sec-q-18',
        question: 'Which header stops other origins from embedding your page in an <iframe> (clickjacking)?',
        options: ['X-Content-Type-Options: nosniff', 'Referrer-Policy: no-referrer', 'Content-Security-Policy: frame-src \'none\'', 'Content-Security-Policy: frame-ancestors \'none\''],
        correctAnswer: 3,
        explanation: 'frame-ancestors controls who may frame you and supersedes X-Frame-Options. frame-src is the opposite direction — what your page may embed. nosniff and Referrer-Policy are unrelated to framing.'
      },
      {
        id: 'sec-q-19',
        question: 'Client-side code reads location.hash and writes it into innerHTML. The value never reaches the server. Which XSS class is this, and why does server-side encoding not help?',
        options: ['DOM-based XSS — the injection happens entirely in the browser at a DOM sink', 'Stored XSS — the hash is persisted by the browser', 'Reflected XSS — the URL reflects the payload', 'It is not XSS because the server is not involved'],
        correctAnswer: 0,
        explanation: 'DOM XSS is source-to-sink inside JavaScript (location, postMessage, storage → innerHTML, eval, href). Server templates never see it. Fix at the sink: textContent, a sanitizer, or Trusted Types enforced by CSP.'
      },
      {
        id: 'sec-q-20',
        question: 'An SPA stores its JWT in localStorage. An XSS bug is exploited. Compared with an HttpOnly cookie, what is the difference in impact?',
        options: ['No difference — XSS is fatal either way', 'localStorage is safer because it is origin-scoped', 'Cookies are worse because they are sent to every site', 'With localStorage the token itself is exfiltrated and reused offline; with an HttpOnly cookie the attacker can only ride the session while the script runs'],
        correctAnswer: 3,
        explanation: 'Any storage JavaScript can read is readable by injected JavaScript. HttpOnly cookies limit the blast radius to the live session and are revocable with logout; pairing them with SameSite and short lifetimes is the usual recommendation for browser clients.'
      }
    ],
    visualizations: [
      {
        id: 'sec-viz-1',
        title: 'XSS Attack Flow',
        type: 'diagram',
        description: 'How stored XSS attacks work',
        nodes: [
          { id: 'attacker', label: 'Attacker', x: 80, y: 50 },
          { id: 'server', label: 'Server/DB', x: 200, y: 50 },
          { id: 'victim', label: 'Victim', x: 320, y: 50 },
          { id: 'script', label: 'Malicious Script', x: 200, y: 140 }
        ],
        edges: [
          { from: 'attacker', to: 'server', label: 'inject' },
          { from: 'server', to: 'victim', label: 'serve page' },
          { from: 'victim', to: 'script', label: 'executes' }
        ]
      },
      {
        id: 'sec-viz-2',
        title: 'CSRF Prevention',
        type: 'diagram',
        description: 'How CSRF tokens protect requests',
        nodes: [
          { id: 'user', label: 'User', x: 80, y: 100 },
          { id: 'form', label: 'Form + Token', x: 200, y: 100 },
          { id: 'server', label: 'Server', x: 320, y: 100 },
          { id: 'validate', label: 'Validate Token', x: 320, y: 180 }
        ],
        edges: [
          { from: 'user', to: 'form' },
          { from: 'form', to: 'server', label: 'submit' },
          { from: 'server', to: 'validate' }
        ]
      }
    ]
  }
];

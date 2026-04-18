---
name: techzen-html-slides
description: Create professional, bilingual (Vietnamese/Japanese) presentation slides matching the Techzen Security branding using a fixed-dimension HTML template with base64 images.
risk: safe
date_added: "2026-04-07"
---

# Techzen HTML Slides

Create zero-dependency, animation-rich HTML presentations structured specifically for the **Techzen Security** brand.
The final result will be a **single `.html` file** containing inline CSS, standalone JavaScript, and Base64-encoded images. It works entirely offline and flawlessly switches between Vietnamese and Japanese text logic.

## When to Use This Skill
- Use when the user asks to create a presentation, proposal, or slide deck formatted identically to `proposal_hts_02042026.html`.
- Use when the user wants a professional, enterprise-grade slide deck targeted at Japanese partners/clients using the VI/JA bilingual toggle.
- Use when a standalone, self-hosted, easily shareable 1-file HTML presentation is required.

---

## Core Principles

1. **Fixed Perspective (NON-NEGOTIABLE)**
    - Every slide MUST be exactly `1050px` wide and `590px` high.
    - We use a responsive outer layout via browser scaling, but the `.techzen-slide` itself is a rigid canvas.
    - Do NOT use `100vh` on the slides. The template enforces this via `.techzen-slide` fixed dimensions.
    
2. **Bilingual Tags Are Mandatory (NON-NEGOTIABLE)**
    - Every single string of text placed in the DOM MUST be wrapped inside a `<span class="lang-vi">` and `<span class="lang-ja">` pair.
    - NEVER write bare text like `<p>Welcome</p>`. It MUST be `<p><span class="lang-vi">Chào mừng</span><span class="lang-ja">ようこそ</span></p>`.
    
3. **No External Assets**
    - The HTML file must be fully offline-capable.
    - All images should be embedded as inline Data URIs (Base64). If the user provides images, fetch them, convert them to Base64, and embed them.

---

## Phase 1: Content Collection & Outline

1. **Ask for Content (if missing):**
    - What is the primary message of this presentation?
    - Do you have a draft outline, or should I generate an agenda?
    - Do you have any specific images to include? Use the `Upload` or provide file paths.
2. **Draft Outline:**
    - Propose a slide-by-slide outline (Title Slide, Problem, Architecture, Specs/BOM, etc.).
    - Keep content per slide minimal. If it gets heavy, overflow the content into a second slide.
    
---

## Phase 2: Bilingual Translation (VI/JA)

Once the outline and content are agreed upon:
1. Translate all Vietnamese text to professional, enterprise-grade Japanese (Keigo/Katana terms for IT).
2. Ensure you have the 1:1 mapped strings ready for Phase 3.

---

## Phase 3: Slide Generation & Layout Implementation

**Read the Reference Materials first:**
- [example_master_proposal.html](example_master_proposal.html) — **(VÔ CÙNG QUAN TRỌNG)** Bản nháp gốc mẫu mượt mà 100%. Hãy nghiên cứu tệp này để hiểu cách các thẻ HTML và Grid Layout phối hợp với nhau tạo ra mạch thuyết trình logic trước khi bắt đầu tạo slide mới.
- [techzen-base.css](techzen-base.css) — The master CSS styles for the deck.
- [techzen-template.html](techzen-template.html) — The HTML boilerplate shell (Language Switcher, Progress Bar, Scripts).
- [techzen-layouts.md](techzen-layouts.md) — HTML structural snippets for creating Covers, Grids, and Cards.

**Generation Rules:**
1. Use `techzen-template.html` as your foundational shell.
2. Inject the FULL plain text of `techzen-base.css` into the `<style>` tag inside the `<head>` of the template.
3. Build slides inside the template using the `.techzen-slide` containers.
4. Replace the header Slogan/Titles with the exact ones for this deck. Ensure they are translated.
5. Use `.anim-slide-right` and `.card-layer` classes paired with `.anim-delay-1`, `.card-delay-2` for entry animations.

---

## Phase 4: Image Preparation (Base64)

1. For any logo or placeholder images requested in Phase 1:
   - Either generate an SVG inline (if simple), OR
   - Download/read the actual binary image file using specific python scripts or bash commands, convert it to Base64, and inject it into `<img src="data:image/png;base64,...">`.
2. This guarantees the final `.html` is a truly single-file deliverable.

---

## Phase 5: Delivery

1. Write the final complete HTML string to the target file.
2. Open the file in the browser or instruct the user to do so.
3. Remind the user that they can toggle translation via the VI/JA Floating Widget, and navigate using the Spacebar / Arrow Keys.

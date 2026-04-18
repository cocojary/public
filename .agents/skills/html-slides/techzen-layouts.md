# Techzen Web Slide HTML Layouts

These are the core HTML building blocks used in the Techzen HTML Slides format.
All `.techzen-slide` containers have a fixed width of 1050px and a fixed height of 590px for consistency.

## 1. The Base Slide Shell

Every slide MUST conform strictly to this precise structure. Do not invent your own structure!

```html
<div class="techzen-slide" id="slide1">
    <!-- Header -->
    <div class="tz-header">
        <div class="tz-header-blue">
            <div class="tz-logo-area">
                <!-- SVG Icon or Base64 Logo Image -->
                <span style="color:white; font-size: 18px; font-weight: bold; letter-spacing: 1px;">TECHZEN SECURITY</span>
            </div>
        </div>
        <div class="tz-slogan">
            <span class="lang-vi">BẢO MẬT & AI<br>HỆ THỐNG</span>
            <span class="lang-ja">セキュリティとAI<br>システム</span>
        </div>
    </div>

    <!-- Main Content Area (this is where grids and text go) -->
    <div class="tz-content">
        <!-- Add Grid or Content Snippets Here -->
    </div>

    <!-- Footer -->
    <div class="tz-footer">
        <div class="tz-footer-line"></div>
        <div class="tz-page">1</div>
    </div>
</div>
```

---

## 2. Bilingual Tags System (CRITICAL)

Every piece of visible text in the presentation **MUST** be wrapped in language toggles.
If you write `<h1>Title</h1>`, you are doing it WRONG. It MUST be:

```html
<h1>
    <span class="lang-vi">Tiêu đề</span>
    <span class="lang-ja">タイトル</span>
</h1>
```
Never leave plain text outside these tags, otherwise when switching languages, the text will break.

---

## 3. The Cover / Title Slide

Use this for the first slide or major chapter breaks. Utilizes `.grid-2-image` for a 55% / 45% split.

```html
<div class="grid-2-image" style="height: 100%; margin-top: 20px;">
    <!-- Text Column -->
    <div class="title-content">
        <div class="tag" style="margin-bottom: 15px; display: inline-block;">
            <span class="lang-vi">ĐỀ XUẤT</span>
            <span class="lang-ja">提案書</span>
        </div>
        
        <h1>System Title Here</h1>
        
        <h2 style="color: var(--secondary); font-size: 22px; margin-bottom: 20px;">
            <span class="lang-vi">Phụ đề tiếng Việt</span>
            <span class="lang-ja">日本語の字幕</span>
        </h2>
        
        <div class="highlight-box" style="margin-top: 30px; font-size: 16px; border-radius: 8px; line-height: 1.6;">
            <span class="lang-vi">Giải pháp thông minh sử dụng trí tuệ nhân tạo...</span>
            <span class="lang-ja">人工知能を利用したスマートなソリューション...</span>
        </div>
    </div>

    <!-- Image Column -->
    <div class="img-box" style="padding: 0 40px 0 0;">
        <!-- Base64 string for image -->
        <img src="data:image/png;base64,..." alt="Cover Image">
    </div>
</div>
```

---

## 4. Glowing Animation Cards (3 Columns)

Perfect for explaining 3 core features or architectural pillars.
Features `.card-layer` and `.layer-N` for the glowing edge laser animation.

```html
<div class="tz-title">
    <span class="lang-vi">Tính năng cốt lõi</span>
    <span class="lang-ja">コア機能</span>
</div>

<div class="grid-3" style="margin-top: 30px;">
    
    <!-- CARD 1 -->
    <div class="card-layer layer-1 card-delay-1" style="background:#fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; display: flex; flex-direction: column;">
        <h3 style="color: var(--primary); font-size: 18px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
            <!-- Icon optional -->
            <span class="lang-vi">1. Nhanh chóng</span>
            <span class="lang-ja">1. 迅速設定</span>
        </h3>
        <p class="tz-desc" style="font-size: 14px;">
            <span class="lang-vi">Mô tả chi tiết nội dung của thẻ 1...</span>
            <span class="lang-ja">カード1の詳細な説明...</span>
        </p>
    </div>

    <!-- CARD 2 -->
    <div class="card-layer layer-2 card-delay-2" style="background:#fff; ...">
         <!-- Card 2 content -->
    </div>

    <!-- CARD 3 -->
    <div class="card-layer layer-3 card-delay-3" style="background:#fff; ...">
         <!-- Card 3 content -->
    </div>
</div>
```
*(Notice how the delay classes `.card-delay-1`, `.card-delay-2` sequence the stagger animation).*

---

## 5. Architecture Horizontal Flowchart

Used for technical diagrams and data flow. Uses `.h-flow-grid` laying out nodes horizontally, connected by glowing laser tracking lines (`.h-track-x`, `.h-track-y1`).

```html
<div class="tz-title">
    <span class="lang-vi">Luồng dữ liệu</span>
    <span class="lang-ja">データフロー</span>
</div>

<div class="h-flow-grid" style="margin-top: 30px; padding: 0 40px;">
    <!-- Flow Track X (The continuous trackline in the background) -->
    <div class="h-track-x"></div>
    
    <!-- Vertical Track Y1 (Branching downwards) -->
    <div class="h-track-y1"></div>
    
    <!-- Horizontal Flow Nodes -->
    <div class="h-node node-tel anim-slide-right anim-delay-1" style="grid-column: 1;">
        <div class="h-node-title">Router</div>
        <span class="lang-vi">Gateway</span>
        <span class="lang-ja">ゲートウェイ</span>
    </div>
    
    <div style="grid-column: 2; font-size: 24px; color: var(--primary); z-index: 2;">➔</div>
    
    <div class="h-node node-split anim-slide-right anim-delay-2" style="grid-column: 3;">
        <div class="h-node-title">Edge Device</div>
        <span class="lang-vi">Raspberry Pi</span>
        <span class="lang-ja">ラズベリーパイ</span>
    </div>
    
    <div style="grid-column: 4; font-size: 24px; color: var(--primary); z-index: 2;">➔</div>
    
    <div class="h-node node-iso anim-slide-right anim-delay-3 danger" style="grid-column: 5;">
        <div class="h-node-title">AI Model</div>
        <span class="lang-vi">Cảnh báo lừa đảo</span>
        <span class="lang-ja">詐欺警告</span>
    </div>
    
    <!-- Vertical Node Flowing Downwards -->
    <div class="h-node node-usb anim-slide-right anim-delay-2" style="grid-column: 3; grid-row: 3;">
        <div class="h-node-title">Cloud Server</div>
        <span class="lang-vi">Dashboard</span>
        <span class="lang-ja">ダッシュボード</span>
    </div>
</div>
```

---

## 6. Table Layouts

```html
<table class="tz-table anim-slide-right anim-delay-1">
    <thead>
        <tr>
            <th><span class="lang-vi">STT</span><span class="lang-ja">No.</span></th>
            <th><span class="lang-vi">Tên thiết bị</span><span class="lang-ja">機器名</span></th>
            <th><span class="lang-vi">Số lượng</span><span class="lang-ja">数量</span></th>
            <th style="text-align:right;"><span class="lang-vi">Đơn giá</span><span class="lang-ja">単価</span></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="text-align: center;">1</td>
            <td><strong>Edge Processing Unit</strong><br>
                <div style="font-size: 12px; color: #666;">Model X</div>
            </td>
            <td style="text-align: center;">1</td>
            <td style="text-align: right; color: var(--secondary); font-weight: bold;">$1,000</td>
        </tr>
    </tbody>
</table>
```

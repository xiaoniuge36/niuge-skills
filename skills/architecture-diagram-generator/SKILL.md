---
name: architecture-diagram
description: Use when the user asks for system architecture diagrams, infrastructure diagrams, cloud architecture visualizations, security diagrams, network topology diagrams, or any technical diagram showing system components and their relationships.
license: MIT
metadata:
  version: "1.1"
  author: Cocoon AI (hello@cocoon-ai.com)
---

# Architecture Diagram Skill

Create professional dark-themed architecture diagrams as self-contained HTML files with inline SVG graphics and CSS styling.

Default the rendered diagram language to Simplified Chinese. Unless the user explicitly requests another language, all visible labels, legends, summary cards, subtitles, and footer metadata should be written in Chinese.

## Design System

### Color Palette

Use these semantic colors for component types:

| Component Type | Fill (rgba) | Stroke |
|---------------|-------------|--------|
| Frontend | `rgba(8, 51, 68, 0.4)` | `#22d3ee` (cyan-400) |
| Backend | `rgba(6, 78, 59, 0.4)` | `#34d399` (emerald-400) |
| Database | `rgba(76, 29, 149, 0.4)` | `#a78bfa` (violet-400) |
| AWS/Cloud | `rgba(120, 53, 15, 0.3)` | `#fbbf24` (amber-400) |
| Security | `rgba(136, 19, 55, 0.4)` | `#fb7185` (rose-400) |
| Message Bus | `rgba(251, 146, 60, 0.3)` | `#fb923c` (orange-400) |
| External/Generic | `rgba(30, 41, 59, 0.5)` | `#94a3b8` (slate-400) |

### Language and Labeling

Use Simplified Chinese (`zh-CN`) for all visible diagram copy by default.

- Make the main label Chinese-first, and keep English only for technical terms or standard acronyms when they improve clarity.
- Good examples: `认证服务`, `对象存储 (S3)`, `消息总线 (Kafka)`, `AWS 区域：us-west-2`
- Do not default to bilingual or English-only labels unless the user explicitly asks for that.
- Keep these areas in Chinese by default: HTML `<title>`, header title, subtitle, component labels, legend, summary cards, and footer metadata.

### Typography

Use a Chinese-capable font stack so labels render correctly in browsers. Prefer `Noto Sans SC` for visible Chinese text, and keep `JetBrains Mono` only as a fallback or for pure ASCII technical annotations:

```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Font sizes: 12px for component names, 9px for sublabels, 8px for annotations, 7px for tiny labels.

### Visual Elements

**Background:** `#020617` (slate-950) with subtle grid pattern:

```svg
<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.5"/>
</pattern>
```

**Component boxes:** Rounded rectangles (`rx="6"`) with 1.5px stroke, semi-transparent fills.

**Security groups:** Dashed stroke (`stroke-dasharray="4,4"`), transparent fill, rose color.

**Region boundaries:** Larger dashed stroke (`stroke-dasharray="8,4"`), amber color, `rx="12"`.

**Arrows:** Use SVG marker for arrowheads:

```svg
<marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
  <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
</marker>
```

**Arrow z-order:** Draw connection arrows early in the SVG (after the background grid) so they render behind component boxes. SVG elements are painted in document order, so arrows drawn first will appear behind shapes drawn later.

**Masking arrows behind transparent fills:** Since component boxes use semi-transparent fills (`rgba(..., 0.4)`), arrows behind them will show through. To fully mask arrows, draw an opaque background rect (for example `fill="#0f172a"`) at the same position before drawing the semi-transparent styled rect on top:

```svg
<!-- Opaque background to mask arrows -->
<rect x="X" y="Y" width="W" height="H" rx="6" fill="#0f172a"/>
<!-- Styled component on top -->
<rect x="X" y="Y" width="W" height="H" rx="6" fill="rgba(76, 29, 149, 0.4)" stroke="#a78bfa" stroke-width="1.5"/>
```

**Auth/security flows:** Dashed lines in rose color (`#fb7185`).

**Message buses / Event buses:** Small connector elements between services. Use orange color (`#fb923c` stroke, `rgba(251, 146, 60, 0.3)` fill):

```svg
<rect x="X" y="Y" width="120" height="20" rx="4" fill="rgba(251, 146, 60, 0.3)" stroke="#fb923c" stroke-width="1"/>
<text x="CENTER_X" y="Y+14" fill="#fb923c" font-size="7" text-anchor="middle">消息总线 (Kafka)</text>
```

### Spacing Rules

**CRITICAL:** When stacking components vertically, ensure proper spacing to avoid overlaps:

- **Standard component height:** 60px for services, 80-120px for larger components
- **Minimum vertical gap between components:** 40px
- **Inline connectors (message buses):** Place in the gap between components, not overlapping

**Example vertical layout:**

```text
Component A: y=70, height=60 -> ends at y=130
Gap: y=130 to y=170 -> 40px gap, place bus at y=140 (20px tall)
Component B: y=170, height=60 -> ends at y=230
```

**Wrong:** Placing a message bus at y=160 when Component B starts at y=170 causes overlap.

**Right:** Placing a message bus at y=140 keeps it centered in the 40px gap (`y=130` to `y=170`).

### Legend Placement

**CRITICAL:** Place legends outside all boundary boxes (region boundaries, cluster boundaries, security groups).

- Calculate where all boundaries end (y position + height)
- Place legend at least 20px below the lowest boundary
- Expand SVG viewBox height if needed to accommodate

**Example:**

```text
Kubernetes Cluster: y=30, height=460 -> ends at y=490
Legend should start at: y=510 or below
SVG viewBox height: at least 560 to fit legend
```

**Wrong:** Legend at y=470 inside a cluster boundary that ends at y=490.

**Right:** Legend at y=510 below the cluster boundary, with viewBox height extended.

### Layout Structure

1. **Header** - Chinese title with pulsing dot indicator and a Chinese subtitle
2. **Main SVG diagram** - Contained in a rounded border card
3. **Summary cards** - Grid of 3 cards below the diagram with Chinese key details
4. **Footer** - Minimal metadata line in Chinese

### Component Box Pattern

```svg
<rect x="X" y="Y" width="W" height="H" rx="6" fill="FILL_COLOR" stroke="STROKE_COLOR" stroke-width="1.5"/>
<text x="CENTER_X" y="Y+20" fill="white" font-size="11" font-weight="600" text-anchor="middle">认证服务</text>
<text x="CENTER_X" y="Y+36" fill="#94a3b8" font-size="9" text-anchor="middle">OAuth 2.0 / OIDC</text>
```

### Info Card Pattern

```html
<div class="card">
  <div class="card-header">
    <div class="card-dot COLOR"></div>
    <h3>核心链路</h3>
  </div>
  <ul>
    <li>- 用户请求经过 CDN 与负载均衡</li>
    <li>- API 服务访问数据库与缓存</li>
  </ul>
</div>
```

## Template

Copy and customize the template at `assets/template.html`. Key customization points:

1. Keep `<html lang="zh-CN">`, and update the `<title>` and header text in Chinese
2. Modify SVG viewBox dimensions if needed (default: `1000 x 680`)
3. Add, remove, or reposition component boxes
4. Draw connection arrows between components
5. Update the three summary cards in Chinese
6. Update footer metadata in Chinese

## Output

Always produce a single self-contained `.html` file with:

- Embedded CSS (no external stylesheets except Google Fonts)
- Inline SVG (no external images)
- No JavaScript required (pure CSS animations)
- Simplified Chinese visible copy by default, unless the user explicitly asks for another language

The file should render correctly when opened directly in any modern browser.

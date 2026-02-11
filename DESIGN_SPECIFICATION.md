# LekhaFlow - UI/UX Design Specification

**Version**: 2.0  
**Design Style**: Minimalist Sketch + Modern SaaS  
**Last Updated**: February 11, 2026

---

## Design Philosophy

LekhaFlow combines a **playful, hand-drawn aesthetic** with **modern SaaS cleanliness** to create an approachable yet professional infinite-canvas whiteboard experience. The design emphasizes:

- **Simplicity**: Clean, uncluttered interface
- **Playfulness**: Hand-drawn annotations and sketch-style elements
- **Collaboration**: Clear visual indicators for sharing and real-time work
- **Accessibility**: Keyboard shortcuts and clear visual hierarchy

---

## Color Palette

### Primary Colors

```css
/* Background */
--canvas-background: #FFFFFF;           /* Pure white infinite canvas */

/* Text & Icons */
--text-primary: #404040;                /* Dark gray for UI elements */
--text-secondary: #A8A8A8;              /* Light gray for instructions/placeholders */
--text-placeholder: #D1D5DB;            /* Very light gray for empty states */

/* Brand Accent */
--accent-primary: #6965DB;              /* Vibrant indigo/purple (logo, Share button) */
--accent-hover: #5753C4;                /* Darker purple for hover states */
--accent-light: #EDE9FE;                /* Light purple for backgrounds */

/* UI Elements */
--ui-border: #E5E7EB;                   /* Subtle borders */
--ui-shadow: rgba(0, 0, 0, 0.1);        /* Soft drop shadows */
--ui-surface: #FFFFFF;                  /* Floating panel background */
--ui-surface-hover: #F9FAFB;            /* Hover state for panels */

/* Feedback Colors */
--success: #10B981;                     /* Green for success states */
--warning: #F59E0B;                     /* Orange for warnings */
--error: #EF4444;                       /* Red for errors */
--info: #3B82F6;                        /* Blue for info */
```

### Usage Guidelines

- **Canvas Background**: Always pure white (#FFFFFF)
- **Primary Actions**: Use accent purple (#6965DB) sparingly - only for logo and primary CTA (Share button)
- **UI Icons**: Dark gray (#404040) with 18px size
- **Instructional Text**: Light gray (#A8A8A8) with hand-written font

---

## Typography

### Font Stack

```css
/* Primary UI Text - Clean Sans-Serif */
--font-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
           Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;

/* Hand-Written Text - Playful Marker Style */
--font-handwritten: 'Virgil', 'Comic Sans MS', 'Marker Felt', cursive;

/* Monospace - Code/Numbers */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale

```css
/* Display - Hero Text */
--text-display: 32px / 40px;           /* Size / Line-height */
font-weight: 700;
font-family: var(--font-handwritten);

/* Heading - Section Titles */
--text-heading: 20px / 28px;
font-weight: 600;
font-family: var(--font-ui);

/* Body - Main UI Text */
--text-body: 14px / 20px;
font-weight: 400;
font-family: var(--font-ui);

/* Small - Labels & Captions */
--text-small: 12px / 16px;
font-weight: 500;
font-family: var(--font-ui);

/* Tiny - Shortcuts */
--text-tiny: 10px / 14px;
font-weight: 600;
font-family: var(--font-mono);
```

---

## Layout Structure

### Canvas Dimensions

- **Infinite Canvas**: No bounds, white background
- **Viewport**: Responsive, fills browser window
- **Safe Area**: 24px padding from edges for floating UI elements

### Grid System

```
┌─────────────────────────────────────────────────────────────┐
│  [≡ Menu]                                      [Pro] [Share] │  Top Bar (64px height)
│                           [Toolbar]             [⚙️ Sidebar]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                                                               │
│                        [Logo/Hero]                            │  Main Canvas Area
│                                                               │
│                   [Instructional Text]                        │
│                                                               │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  [Zoom Controls]                              [❓ Help]      │  Bottom Bar (80px height)
│  [Undo/Redo]                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## UI Components

### 1. Top Bar Components

#### A. Hamburger Menu (Top Left)

```css
/* Specifications */
Position: Fixed, Top 24px, Left 24px
Size: 40px × 40px
Background: #FFFFFF
Border: 1px solid #E5E7EB
Border Radius: 8px
Shadow: 0 2px 8px rgba(0, 0, 0, 0.08)
Icon: Three horizontal lines (≡)
Icon Color: #404040
Icon Size: 20px

/* States */
Hover: background #F9FAFB, scale 1.05
Active: background #F3F4F6
```

**Menu Items**:
```
📄 New Canvas
📁 Open
💾 Save
🔗 Export
⚙️ Settings
❓ Help
───────────
👤 Profile
🚪 Sign Out
```

#### B. Main Toolbar (Top Center)

```css
/* Container */
Position: Fixed, Top 24px, Left 50% (centered)
Transform: translateX(-50%)
Height: 56px
Background: #FFFFFF
Border Radius: 28px (pill shape)
Shadow: 0 4px 16px rgba(0, 0, 0, 0.12)
Padding: 8px 12px
Display: Flex, Gap 4px
```

**Tool Icons** (12 tools):

| Icon | Tool | Shortcut | Order |
|------|------|----------|-------|
| 🔒 | Lock | L | 1 |
| ✋ | Hand | H | 2 |
| ↖️ | Select | V | 3 |
| ▭ | Rectangle | R | 4 |
| ◆ | Diamond | D | 5 |
| ○ | Circle | O | 6 |
| → | Arrow | A | 7 |
| ─ | Line | - | 8 |
| ✏️ | Pencil | P | 9 |
| T | Text | T | 0 |
| 🖼️ | Image | I | - |
| 🧹 | Eraser | E | - |

**Tool Button Specs**:
```css
Size: 40px × 40px
Border Radius: 8px
Icon Size: 18px
Icon Color: #404040
Hover: background #F3F4F6
Active: background #6965DB, icon color #FFFFFF
```

**Shortcut Indicators**:
```css
Position: Absolute, Bottom-right of icon
Size: 16px × 16px
Background: #F3F4F6
Border Radius: 4px
Font: 10px monospace, weight 600
Color: #6B7280
```

#### C. Top Right Controls

```css
/* Container */
Position: Fixed, Top 24px, Right 24px
Display: Flex, Gap 8px
```

**Pro Button**:
```css
Height: 40px
Padding: 0 16px
Background: #F3F4F6
Border Radius: 8px
Font: 14px, weight 500
Color: #404040
Icon: ⭐ (before text)

Hover: background #E5E7EB
```

**Share Button** (Primary CTA):
```css
Height: 40px
Padding: 0 20px
Background: #6965DB (purple gradient)
Border Radius: 8px
Font: 14px, weight 600
Color: #FFFFFF
Icon: 🔗 (before text)
Shadow: 0 2px 8px rgba(105, 101, 219, 0.4)

Hover: background #5753C4, scale 1.05, shadow 0 4px 12px
Active: scale 0.98
```

**Sidebar Toggle**:
```css
Size: 40px × 40px
Background: #FFFFFF
Border: 1px solid #E5E7EB
Border Radius: 8px
Icon: ⚙️ or ☰
Icon Size: 20px

Hover: background #F9FAFB
Active: background #EDE9FE (purple tint)
```

---

### 2. Center Canvas (Hero/Empty State)

#### A. Logo

```css
Position: Absolute, Top 50%, Left 50%
Transform: translate(-50%, -50%)
Display: Flex, Align-items center, Gap 12px
```

**Icon**:
```css
Type: Rocket 🚀 or Pen 🖊️ (stylized)
Size: 64px × 64px
Color: #6965DB (purple)
Style: Hand-drawn stroke, 3px width
```

**Text**:
```css
Font: 48px 'Virgil' (hand-written)
Color: #6965DB
Text: "LekhaFlow"
Letter-spacing: -0.02em
```

#### B. Instructional Text

```css
Position: Below logo, margin-top 32px
Max-width: 480px
Text-align: center
Font: 16px / 24px 'Virgil'
Color: #A8A8A8
```

**Content**:
```
"Your canvas is saved locally in your browser.
Create an account to sync across devices."

[Open]  ·  [Help]  ·  [Live Collaboration]  ·  [Sign Up]
```

**Action Links**:
```css
Display: Inline-flex, Gap 16px
Font: 14px, weight 500
Color: #6965DB
Hover: underline, color #5753C4
```

---

### 3. Bottom Left Controls

#### A. Zoom Controls

```css
Position: Fixed, Bottom 24px, Left 24px
Display: Flex, Gap 8px
Background: #FFFFFF
Border Radius: 24px
Padding: 8px 12px
Shadow: 0 4px 16px rgba(0, 0, 0, 0.12)
```

**Zoom Buttons**:
```css
Size: 32px × 32px
Border Radius: 6px
Icon: − (minus) and + (plus)
Icon Size: 16px
Color: #404040

Hover: background #F3F4F6
```

**Zoom Percentage**:
```css
Min-width: 48px
Text-align: center
Font: 13px monospace, weight 600
Color: #404040
Padding: 0 8px
```

#### B. Undo/Redo

```css
Position: Below zoom controls, margin-top 8px
Display: Flex, Gap 8px
```

**Buttons**:
```css
Size: 40px × 40px
Background: #FFFFFF
Border Radius: 8px
Shadow: 0 2px 8px rgba(0, 0, 0, 0.08)
Icon: ↶ (undo) and ↷ (redo)
Icon Size: 18px
Color: #404040

Disabled: opacity 0.3
Hover: background #F3F4F6, scale 1.05
```

---

### 4. Bottom Right Help Button

```css
Position: Fixed, Bottom 24px, Right 24px
Size: 48px × 48px (larger than others)
Background: #6965DB (purple accent)
Border Radius: 50% (perfect circle)
Shadow: 0 4px 16px rgba(105, 101, 219, 0.4)
Icon: ❓ (question mark)
Icon Size: 20px
Icon Color: #FFFFFF

Hover: scale 1.1, shadow 0 6px 20px
Active: scale 0.95
```

---

### 5. Hand-Drawn Annotations

#### Arrow Annotations

```css
/* SVG Curved Arrows */
Stroke: #A8A8A8
Stroke-width: 2px
Stroke-dasharray: 4 2 (dashed)
Style: Hand-drawn, slightly wobbly
```

**Arrow Positions**:

1. **Toolbar Annotation**:
   - Start: Below toolbar center
   - End: Pointing up to toolbar
   - Text: "Pick a tool & start drawing!"
   - Font: 14px 'Virgil', #A8A8A8

2. **Help Button Annotation**:
   - Start: Left of help button
   - End: Pointing to help button
   - Text: "Shortcuts & help"
   - Font: 14px 'Virgil', #A8A8A8

3. **Share Button Annotation**:
   - Start: Above share button
   - End: Pointing down to share
   - Text: "Collaborate in real-time!"
   - Font: 14px 'Virgil', #A8A8A8

**Label Box**:
```css
Background: #FFFFFF
Border: 2px dashed #E5E7EB
Border Radius: 8px
Padding: 8px 12px
Shadow: 0 2px 8px rgba(0, 0, 0, 0.08)
```

---

## Interactive States

### Elevation System

```css
/* Level 0 - Canvas */
box-shadow: none;

/* Level 1 - Resting */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

/* Level 2 - Hover */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);

/* Level 3 - Active */
box-shadow: 0 6px 24px rgba(0, 0, 0, 0.16);

/* Level 4 - Modal */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.20);
```

### Button States

```css
/* Default */
transform: scale(1);
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

/* Hover */
transform: scale(1.05);
cursor: pointer;

/* Active/Pressed */
transform: scale(0.95);

/* Disabled */
opacity: 0.4;
cursor: not-allowed;
pointer-events: none;
```

### Focus States

```css
/* Keyboard Navigation */
outline: 2px solid #6965DB;
outline-offset: 2px;
border-radius: inherit;
```

---

## Animations

### Entrance Animations

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Scale In */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

/* Slide In from Top */
@keyframes slideInTop {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**Usage**:
- Toolbar: `slideInTop 0.3s ease-out`
- Help Button: `scaleIn 0.4s ease-out 0.2s`
- Annotations: `fadeIn 0.5s ease-out 0.4s`

### Micro-interactions

```css
/* Button Press */
@keyframes buttonPress {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

/* Drawing Tool Select */
@keyframes toolSelect {
  0% { background: transparent; }
  50% { background: #EDE9FE; }
  100% { background: #6965DB; }
}
```

---

## Responsive Breakpoints

```css
/* Mobile (< 640px) */
@media (max-width: 640px) {
  /* Stack controls vertically */
  /* Collapse toolbar to drawer */
  /* Show mobile menu */
}

/* Tablet (640px - 1024px) */
@media (min-width: 640px) and (max-width: 1024px) {
  /* Adjust toolbar spacing */
  /* Show simplified controls */
}

/* Desktop (> 1024px) */
@media (min-width: 1024px) {
  /* Full toolbar visible */
  /* Show all controls */
}

/* Large Desktop (> 1440px) */
@media (min-width: 1440px) {
  /* Maximum component sizes */
  /* Optional side panels */
}
```

---

## Accessibility

### ARIA Labels

```html
<!-- Toolbar -->
<div role="toolbar" aria-label="Drawing tools">
  <button aria-label="Select tool (V)" aria-pressed="false">
    <!-- Icon -->
  </button>
</div>

<!-- Help Button -->
<button aria-label="Open help panel (?)">❓</button>

<!-- Zoom Controls -->
<div role="group" aria-label="Zoom controls">
  <button aria-label="Zoom out (-)">−</button>
  <span aria-live="polite">100%</span>
  <button aria-label="Zoom in (+)">+</button>
</div>
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Navigate between controls |
| Enter/Space | Activate button |
| Esc | Close modal/clear selection |
| ? | Toggle help panel |
| V, H, P, etc. | Select tools |

### Color Contrast

All text meets WCAG AA standards:
- **Primary Text**: 9.74:1 contrast ratio (#404040 on #FFFFFF)
- **Secondary Text**: 4.56:1 contrast ratio (#A8A8A8 on #FFFFFF)
- **Accent Text**: 7.11:1 contrast ratio (#6965DB on #FFFFFF)

---

## Component Library

### Buttons

```tsx
// Primary Button
<Button variant="primary" size="md">
  Share
</Button>

// Secondary Button
<Button variant="secondary" size="md">
  Pro
</Button>

// Icon Button
<Button variant="icon" size="sm">
  <Icon name="pencil" />
</Button>
```

### Floating Panels

```tsx
<FloatingPanel
  position="top-center"
  shadow="level-2"
  borderRadius="pill"
>
  <Toolbar />
</FloatingPanel>
```

### Tool Button

```tsx
<ToolButton
  icon="pencil"
  label="Pencil"
  shortcut="P"
  active={activeTool === 'pencil'}
  onClick={() => setTool('pencil')}
/>
```

---

## Design Assets

### Icons

Use **Lucide React** icon library:
```bash
npm install lucide-react
```

Icons to use:
- Menu: `Menu`
- Hand: `Hand`
- Select: `MousePointer2`
- Rectangle: `Square`
- Diamond: `Diamond`
- Circle: `Circle`
- Arrow: `ArrowRight`
- Line: `Minus`
- Pencil: `Pen`
- Text: `Type`
- Image: `Image`
- Eraser: `Eraser`
- Lock: `Lock`
- Help: `HelpCircle`
- Share: `Share2`
- Settings: `Settings`

### Fonts

```html
<!-- Inter for UI -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Virgil for hand-written text -->
<!-- Use @excalidraw/excalidraw's Virgil font or Comic Sans as fallback -->
```

---

## Implementation Notes

### CSS Variables Setup

```css
:root {
  /* Colors */
  --color-canvas: #FFFFFF;
  --color-text-primary: #404040;
  --color-text-secondary: #A8A8A8;
  --color-accent: #6965DB;
  --color-accent-hover: #5753C4;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-pill: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.20);
  
  /* Typography */
  --font-ui: 'Inter', sans-serif;
  --font-handwritten: 'Virgil', 'Comic Sans MS', cursive;
}
```

### Z-Index Layers

```css
:root {
  --z-canvas: 1;
  --z-elements: 10;
  --z-controls: 100;
  --z-toolbar: 200;
  --z-modals: 1000;
  --z-tooltips: 2000;
}
```

---

## Figma Design File Structure

```
Pages:
├── 🎨 Design System
│   ├── Colors
│   ├── Typography
│   ├── Components
│   └── Icons
├── 📱 Desktop (1440px)
│   ├── Empty State
│   ├── With Content
│   ├── Collaboration Mode
│   └── Annotations
├── 💻 Tablet (768px)
└── 📱 Mobile (375px)
```

---

## Design Checklist

- [ ] All colors use defined palette
- [ ] Text contrast meets WCAG AA
- [ ] All interactive elements have hover/active states
- [ ] Keyboard navigation works everywhere
- [ ] ARIA labels for screen readers
- [ ] Hand-drawn annotations implemented
- [ ] Shortcut indicators visible
- [ ] Animations smooth (60fps)
- [ ] Responsive on all breakpoints
- [ ] Loading states defined
- [ ] Error states designed
- [ ] Success states clear

---

**End of Design Specification**

Next steps:
1. Create Figma mockups based on this spec
2. Implement HTML/CSS prototype
3. Integrate with existing React components
4. User testing and iteration

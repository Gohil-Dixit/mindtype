# Design Guidelines: Monkeytype-Inspired Typing Test

## Design Approach
**Reference-Based**: Drawing directly from Monkeytype's ultra-minimal, distraction-free aesthetic combined with modern data visualization principles for leaderboards and results.

## Core Design Principles
1. **Extreme Minimalism**: Remove all non-essential UI elements. Every pixel serves a purpose.
2. **Focus-Driven**: The typing interface dominates. Everything else fades into the background.
3. **Data Clarity**: Performance metrics are precise, scannable, and instantly understandable.

## Color System
- **Background**: Pure black (#000000)
- **Primary Text**: Pure white (#FFFFFF)
- **Secondary Text**: #6B7280 (mid-grey for metadata, labels)
- **Disabled/Subtle**: #374151 (dark grey for inactive states)
- **Accent (correct)**: #10B981 (green for correct characters)
- **Accent (error)**: #EF4444 (red for errors)
- **Borders/Dividers**: #1F2937 (subtle grey, barely visible)

## Typography
**Primary Font**: Monospace family - 'JetBrains Mono' or 'Fira Code' via Google Fonts
- Typing text: 24px-32px (responsive), medium weight
- Stats/metrics: 16px-20px, regular weight
- Labels: 12px-14px, uppercase, letter-spacing: 0.05em

**Secondary Font**: 'Inter' for UI elements (buttons, labels, leaderboard)
- Clean, modern sans-serif for non-typing content

## Layout System
**Spacing Scale**: Use Tailwind units of 1, 2, 4, 6, 8, 12, 16, 20 (focusing on 4, 8, 16 for consistency)
- Micro spacing: gap-2, p-2
- Component spacing: gap-4, p-4, m-4
- Section spacing: py-8, py-12, gap-8
- Large spacing: py-16, py-20

**Container Strategy**:
- Typing area: max-w-4xl, centered
- Forms/Upload: max-w-2xl, centered
- Leaderboard: max-w-6xl, centered
- Full-width content stays within max-w-7xl

## Screen-Specific Layouts

### 1. Home Screen
**Layout**: Single-screen centered composition, no scrolling required
- Centered card (max-w-md) with subtle border (#1F2937)
- App title: large monospace text (32px), white
- Username input: Full-width text field with placeholder "Enter username..."
- Two action buttons stacked vertically (gap-4):
  - "Start Typing Test" (primary, white text on dark bg with border)
  - "View Leaderboard" (secondary, grey text)
- Footer links (tiny, grey): "Upload Custom Text" positioned bottom-center

**Spacing**: py-24 container, p-8 card interior

### 2. Typing Test Screen
**Layout**: 100vh fixed layout, no scrolling
- **Top Bar** (absolute, top-0): Timer, WPM (live), Accuracy (live) - horizontally spaced, small text
- **Center Stage**: 
  - Typing prompt text (max-w-4xl): Large monospace, line-height relaxed
  - Character highlighting: Correct (green), Error (red), Current (underline)
  - User input invisible (text appears via highlighting only)
- **Bottom Bar** (absolute, bottom-0): Progress indicator (thin bar showing completion %)
- **Floating Controls** (top-right): Restart icon, Settings icon (minimal)

**Character Display**:
- Each character in span with transition-colors duration-75
- Generous letter-spacing (0.02em) for clarity
- Words separated by natural spacing

### 3. Content Upload Screen
**Layout**: Centered form interface (max-w-2xl)
- Header: "Upload Custom Text" (24px, white)
- Three upload methods as tabs or sections (gap-8):
  
  **Section 1 - Paste Text**:
  - Large textarea (min-h-64, monospace font)
  - Character count display (grey, bottom-right)
  
  **Section 2 - Upload File**:
  - Drag-and-drop zone (border-dashed, h-40)
  - "Drop .txt file or click to browse" centered text
  
  **Section 3 - Google Drive Import**:
  - "Connect Google Drive" button
  - File selector interface (if connected)

- Bottom action bar: "Save & Use This Text" button (primary)

### 4. Results Screen
**Layout**: Centered card with data visualization (max-w-4xl)
- **Header Section**: 
  - Large WPM number (64px, white, center)
  - Accuracy percentage below (24px, grey)
  - Username and timestamp (small, grey)

- **Performance Graph**:
  - Line chart: WPM over time (x-axis: time, y-axis: WPM)
  - Grid lines: #1F2937 (subtle)
  - Line color: white with 60% opacity
  - Chart height: h-64
  - Padding: p-8

- **Character Accuracy Breakdown**:
  - Grid of error characters with context
  - Each error: Character + "You typed: X" (red highlight)
  - Max 10 errors shown

- **Action Bar** (gap-4):
  - "Try Again" button
  - "View Leaderboard" button (secondary)

### 5. Leaderboard Screen
**Layout**: Full-width table interface (max-w-6xl)
- **Header**: "Leaderboard" with filter options (All-time, Today, This Week)
- **Table Structure**:
  - Columns: Rank | Username | WPM | Accuracy | Date/Time
  - Header row: grey background (#1F2937), uppercase labels
  - Rows: Alternating subtle background (#0A0A0A vs pure black)
  - Top 3 ranks: subtle gold/silver/bronze tint using opacity overlays
  - Hover state: border-l-2 accent color
  - Mobile: Stack as cards (username + WPM prominent, other data smaller)

## Component Library

### Buttons
- **Primary**: px-6 py-3, border-2 border-white, white text, hover:bg-white hover:text-black transition-all
- **Secondary**: px-6 py-3, border border-grey, grey text, hover:border-white transition
- Rounded: rounded-lg
- Font: Inter, 14px, medium weight

### Input Fields
- Background: #0A0A0A (very dark grey, not pure black)
- Border: 1px solid #1F2937, focus:border-white
- Text: white, placeholder: #6B7280
- Padding: px-4 py-3
- Rounded: rounded-lg
- Font: Inter for UI inputs, monospace for text content

### Cards/Containers
- Background: pure black with border: 1px solid #1F2937
- Padding: p-6 to p-8
- Rounded: rounded-xl
- Subtle shadow for depth (shadow-2xl with custom black color)

## Animations
**Use Sparingly - Only for:**
1. Character color transitions (duration-75)
2. Button hover states (duration-200)
3. Page transitions (fade-in, duration-300)
4. Graph drawing animation on results screen (duration-500, ease-out)

**Do NOT animate**: Stats counters, text appearance, leaderboard updates

## Images
**No hero images required.** This is a tool-focused application where functionality and minimalism take precedence over visual imagery. The aesthetic comes from typography, spacing, and data visualization.

## Accessibility
- High contrast maintained (black/white base)
- Focus states: 2px white outline on all interactive elements
- Keyboard navigation: full support for typing interface
- Screen readers: Proper labels for stats, buttons, form fields

## Mobile Responsive Strategy
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Mobile: Single column, increased touch targets (min-h-12), simplified stats display
- Tablet: Maintain desktop layout with adjusted spacing
- Typography scales: Base 16px mobile → 18px desktop
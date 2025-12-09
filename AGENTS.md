# Web Checklist - AI Agent Context

This project generates interactive web-based checklists from JSON data, primarily designed for aviation/flight simulation checklists but suitable for any sequential procedures.

## Project Overview

**Purpose:** Create printable and interactive checklists with rich styling, multi-column layouts, and gamepad/hardware button support.

**Tech Stack:**
- Pure HTML/CSS/JavaScript (ES6 modules)
- No build process required
- Requires web server (uses ES6 imports)
- Modern browsers only (2025+)

**License:** MIT License - Copyright (c) 2025 Petr Medek

## Architecture

### Two-Mode Design

The application has two distinct modes:

1. **Interactive Mode**
   - Click-to-complete items
   - Navigation buttons (Next, Previous, Reset)
   - Gamepad/hardware button support
   - Current item highlighting with auto-scroll
   - Opacity-based completion tracking

2. **Print Mode**
   - Clean layout optimized for printing
   - No interactive elements
   - Full-width utilization for landscape printing

### Page Structure

**Edit Section** (collapsible):
- JSON textarea with syntax highlighting
- Example links (minimal, styled, rich, 737)
- Mode selector (Interactive/Print) - segmented control
- Render buttons (Render, Render and Hide)
- Game Device Helper for gamepad configuration

**Checklist Section**:
- Generated checklist content
- Multi-column layout support
- Page break support for multi-page checklists
- Footer attribution on each page

**Toggle Button**: Cog wheel icon to show/hide edit section when collapsed

## Code Structure

```
src/
├── index.html          # Main HTML structure
├── css/
│   └── main.css       # All styling (no dynamic CSS generation)
├── js/
│   ├── main.js        # Application initialization, event handlers
│   ├── render.js      # Checklist rendering logic, interactive mode
│   └── gamepad.js     # Gamepad API integration, device helper
└── examples/
    ├── minimal.json   # Basic example
    ├── styled.json    # Styling features
    ├── rich.json      # Complex multi-section
    └── 737.json       # Boeing 737 flight checklist
```

## Key Features

### JSON Format (see REFERENCE.md for full spec)

**Top-level fields:**
- `title` - String or array (one per page)
- `titleStyle` - CSS styles for title
- `columns` - Number of columns (1-3 typical)
- `controls` - Gamepad button mappings
- `defaultStyle` - Default styles by element type
- `namedStyles` - Reusable style definitions
- `elements` - Array of checklist elements

**Element types:**
- `sequence` - Checklist section with title and steps
- `text` - Custom text/notes
- `page-break` - Force new page (print) or section (screen)

**Sequence steps:**
- Item/state steps: `{item: "...", state: "..."}`
- Text steps: `{text: "..."}`

### Styling System

**Priority (lowest to highest):**
1. Document-level defaults (`defaultStyle`)
2. Sequence-level defaults
3. Element-specific styles

**Style fields accept:**
- Object: Direct CSS properties (camelCase or kebab-case)
- String: Reference to named style

**Common style targets:**
- `style` - Element container
- `titleStyle` - Sequence/checklist title
- `itemStyle` - Step item (left side)
- `stateStyle` - Step state (right side)
- `textStyle` - Text content

### Interactive Mode Features

**Navigation:**
- Click any item to mark it (and all previous) as complete
- Click completed item to revert
- Next/Previous buttons skip text-only elements
- Reset returns to initial state (no highlight)
- Auto-scroll keeps current item visible

**Gamepad Support:**
- Maps hardware buttons to Next/Previous/Reset
- Device identification via Game Device Helper
- Real-time button state display
- Copy button for easy config copying
- Supports multiple devices

**Visual Feedback:**
- Current item: 3D raised effect with subtle pulse animation
- Completed items: 25% opacity
- Hover effects on all interactive elements

### Layout Features

**Multi-column:**
- CSS column layout (1-3 columns typical)
- Automatic content balancing
- Column gap and divider line
- Break-inside: avoid for elements

**Page Breaks:**
- Visual separator in web view (dashed line)
- Force page break when printing
- Each page can have its own title
- Footer on every page

**Responsive:**
- No max-width constraint (removed for full-width usage)
- Flexbox wrapping for long item/state text
- State text right-aligns when wrapped
- Mobile-friendly (single column on small screens)

### Print Optimization

**Print media query hides:**
- Edit toggle button
- Interactive navigation controls
- Box shadows and decorative elements

**Print enhancements:**
- Zero padding on container
- Page breaks honored
- Footer attribution on each page
- Full page width utilization

## Important Implementation Details

### Mode Switching
When switching between Interactive/Print modes, the checklist automatically re-renders to ensure:
- Interactive features are properly initialized
- Click handlers are attached/removed
- Navigation buttons work immediately

### Gamepad Helper
- Updates button states without full DOM replacement (prevents text selection issues)
- Only rebuilds HTML when devices connect/disconnect
- Copy button uses Clipboard API with visual feedback
- Device name must match exactly (case-sensitive)

### Styling Considerations
- All CSS in main.css (no dynamic generation)
- Modern design with smooth transitions
- Segmented control for mode selection (iOS/macOS style)
- Info boxes with icons for important notices
- Compact footer to maximize content space

### Text Overflow Handling
- Sequence steps use `flex-wrap: wrap`
- Long item text wraps, state moves to next line
- State text uses `margin-left: auto` for right alignment
- Maintains visual consistency

## Common Patterns

### Loading External Checklists
URL parameters:
- `?example=minimal` - Load local example
- `?url=https://...` - Load from external URL

### Creating New Checklists
1. Start with minimal example
2. Add sequences with steps
3. Define named styles for reusability
4. Set default styles to avoid repetition
5. Use page breaks for multi-page layouts
6. Test in both Interactive and Print modes

### Gamepad Configuration
1. Open Game Device Helper
2. Press button on device
3. Click copy button to get JSON config
4. Add to `controls` field in JSON
5. Map to `next`, `previous`, or `reset`

## Design Philosophy

**Simplicity:** No build process, no dependencies, pure web technologies

**Flexibility:** Extensive styling options, multiple layout modes

**Usability:** Interactive mode for real-time use, print mode for paper checklists

**Aviation Focus:** Designed for flight simulation but applicable to any sequential procedures

**Accessibility:** Keyboard navigation, semantic HTML, clear visual feedback

## Future Considerations

- The project is feature-complete for its primary use case
- Additional element types could be added (e.g., tables, images)
- Theming system could be implemented
- Export to PDF functionality
- Checklist templates/presets

## Development Notes

- No TypeScript (pure JavaScript)
- No bundler (ES6 modules)
- No CSS preprocessor (vanilla CSS)
- No framework (vanilla JS)
- Modern browser features assumed (2025+)
- Gamepad API support required for hardware controls
- Clipboard API for copy functionality

## Testing Checklist

When making changes, verify:
- [ ] Both Interactive and Print modes work
- [ ] Mode switching re-renders correctly
- [ ] Navigation buttons work in Interactive mode
- [ ] Gamepad helper displays and copies correctly
- [ ] Multi-column layout balances properly
- [ ] Page breaks work in print preview
- [ ] Long text wraps correctly in sequences
- [ ] Styles apply in correct priority order
- [ ] Examples load via URL parameters
- [ ] Footer appears on all pages

## Key Files to Understand

1. **REFERENCE.md** - Complete JSON format specification
2. **README.md** - User-facing documentation
3. **src/js/render.js** - Core rendering logic, interactive features
4. **src/js/gamepad.js** - Hardware button integration
5. **src/css/main.css** - All styling rules
6. **src/examples/737.json** - Real-world complex example
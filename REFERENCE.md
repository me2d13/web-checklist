# Web Checklist - JSON Format Reference

This document describes the complete JSON structure for defining checklists.

## Top Level Structure

```json
{
    "title": "string|array (optional)",
    "titleStyle": "object|string (optional)",
    "columns": "number (optional, default: 1)",
    "controls": "object (optional)",
    "defaultStyle": "object (optional)",
    "namedStyles": "object (optional)",
    "elements": "array (required)"
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string\|array | No | Main title(s) for the checklist. Can be a single string (displayed on first page only) or an array of strings (one per page, with pages separated by `page-break` elements) |
| `titleStyle` | object\|string | No | CSS styles or named style reference for the checklist title(s) |
| `columns` | number | No | Number of columns for multi-column layout (default: 1) |
| `controls` | object | No | Gamepad/game device button mappings for interactive mode navigation |
| `defaultStyle` | object | No | Default styles applied to all elements by type |
| `namedStyles` | object | No | Dictionary of reusable named styles |
| `elements` | array | Yes | Array of element objects (sequences, text, page-break, etc.) |

#### Title Behavior

**Single Title (string):**
```json
{
    "title": "My Checklist"
}
```
The title appears only on the first page.

**Multiple Titles (array):**
```json
{
    "title": [
        "Part 1: Pre-Flight",
        "Part 2: In-Flight",
        "Part 3: Post-Flight"
    ]
}
```
- First element applies to the first page (before first page break)
- Second element applies to the second page (after first page break)
- And so on...
- If fewer titles than pages, remaining pages have no title

#### Controls

The `controls` field allows you to map gamepad or game device buttons to checklist navigation actions in interactive mode. This is particularly useful for flight simulation checklists where you want to control the checklist using hardware buttons.

**Structure:**
```json
{
    "controls": {
        "next": {
            "name": "Device Name (Vendor: xxxx Product: yyyy)",
            "button": 0
        },
        "previous": {
            "name": "Device Name (Vendor: xxxx Product: yyyy)",
            "button": 1
        },
        "reset": {
            "name": "Device Name (Vendor: xxxx Product: yyyy)",
            "button": 2
        }
    }
}
```

**Fields:**
- `next` - Button mapping to advance to the next checklist item
- `previous` - Button mapping to go back to the previous item
- `reset` - Button mapping to reset the checklist to the initial state

Each control action requires:
- `name` - The exact device name as reported by the browser (including vendor/product IDs)
- `button` - The button index (0-based) to trigger the action

**Finding Device Information:**

1. Open the checklist editor
2. Click the "🎮 Game device helper" button
3. Press any button on your device
4. The helper will display the device name and button indices
5. Copy the exact device name and button number to your JSON

**Example:**
```json
{
    "title": "Flight Checklist",
    "controls": {
        "next": {
            "name": "Logitech Extreme 3D (Vendor: 046d Product: c215)",
            "button": 0
        }
    },
    "elements": [...]
}
```

**Notes:**
- Controls only work in Interactive mode
- Device name must match exactly (case-sensitive)
- Button indices start at 0
- You can map different devices to different actions
- If a device is not connected, the controls are simply ignored

---

## Elements

Elements are objects in the `elements` array. Each element must have a `type` field.

### Common Fields for All Elements

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Element type: `"sequence"`, `"text"`, or `"page-break"` |
| `style` | object | No | CSS styles applied to the element container |

---

## Element Type: Sequence

A sequence represents a checklist section with optional title and a list of steps.

### Structure

```json
{
    "type": "sequence",
    "title": "string (optional)",
    "style": "object|string (optional)",
    "titleStyle": "object|string (optional)",
    "itemStyle": "object|string (optional)",
    "stateStyle": "object|string (optional)",
    "textStyle": "object|string (optional)",
    "steps": "array (required)"
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Must be `"sequence"` |
| `title` | string | No | Sequence title. If omitted, steps appear without a heading |
| `style` | object\|string | No | CSS styles or named style reference for the sequence container |
| `titleStyle` | object\|string | No | CSS styles or named style reference for the sequence title |
| `itemStyle` | object\|string | No | Default CSS styles or named style reference for all step items in this sequence |
| `stateStyle` | object\|string | No | Default CSS styles or named style reference for all step states in this sequence |
| `textStyle` | object\|string | No | Default CSS styles or named style reference for all text steps in this sequence |
| `steps` | array | Yes | Array of step objects |

**Note:** `itemStyle` and `stateStyle` at the sequence level apply to all steps in that sequence. Individual step styles override these defaults.

### Steps

### Steps

Each step in a sequence can be either an item/state step or a text step.

#### Item/State Step

```json
{
    "item": "string (optional)",
    "state": "string (optional)",
    "itemStyle": "object|string (optional)",
    "stateStyle": "object|string (optional)"
}
```

#### Text Step

```json
{
    "text": "string (required)",
    "textStyle": "object|string (optional)"
}
```

#### Step Fields (Item/State)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `item` | string | No | Step item description (left side) |
| `state` | string | No | Step state/value (right side) |
| `itemStyle` | object\|string | No | CSS styles or named style reference for the step item |
| `stateStyle` | object\|string | No | CSS styles or named style reference for the step state |

#### Step Fields (Text)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | Text content to display |
| `textStyle` | object\|string | No | CSS styles or named style reference for the text content |

#### Step Rendering

**Item/State Steps** are rendered as a line with:
- Item on the left
- Dotted line filling the space between
- State on the right

Example: `Item ................... STATE`

**Text Steps** are rendered as a single line of text.

---

## Element Type: Text

A text element displays custom text content, typically used as notes or instructions between sequences.

### Structure

```json
{
    "type": "text",
    "text": "string (required)",
    "style": "object (optional)",
    "textStyle": "object (optional)"
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Must be `"text"` |
| `text` | string | Yes | Text content to display |
| `style` | object | No | CSS styles applied to the text element container |
| `textStyle` | object | No | CSS styles applied to the text content itself |

---

## Element Type: Page Break

A page break element creates a visual separation in web view and forces a new page when printing. This is useful for organizing long checklists into logical sections.

### Structure

```json
{
    "type": "page-break"
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Must be `"page-break"` |

### Behavior

**In Web View:**
- Creates a new column layout container
- Elements before the page break appear in one multi-column layout
- Elements after the page break start a new multi-column layout
- Displays a dashed horizontal line as a visual separator

**When Printing:**
- Forces a page break (starts a new printed page)
- The dashed line separator is hidden in print

### Example

```json
{
    "columns": 2,
    "elements": [
        {
            "type": "sequence",
            "title": "Section 1",
            "steps": [...]
        },
        {
            "type": "sequence",
            "title": "Section 2",
            "steps": [...]
        },
        {
            "type": "page-break"
        },
        {
            "type": "sequence",
            "title": "Section 3",
            "steps": [...]
        }
    ]
}
```

In this example:
- Sections 1 and 2 will appear in a 2-column layout on the first page
- Section 3 will start on a new page with its own 2-column layout

---

## Default Styles

Default styles allow you to define styling that applies to all elements of a specific type throughout the checklist.

### Structure

```json
{
    "defaultStyle": {
        "sequence": {
            "style": "object|string (optional)",
            "titleStyle": "object|string (optional)",
            "itemStyle": "object|string (optional)",
            "stateStyle": "object|string (optional)",
            "textStyle": "object|string (optional)"
        },
        "text": {
            "style": "object|string (optional)",
            "textStyle": "object|string (optional)"
        }
    }
}
```

### Fields by Element Type

#### For `sequence` elements:
- `style` - Default container style for all sequences
- `titleStyle` - Default title style for all sequence titles
- `itemStyle` - Default item style for all steps in all sequences
- `stateStyle` - Default state style for all steps in all sequences
- `textStyle` - Default text style for all text steps in all sequences

#### For `text` elements:
- `style` - Default container style for all text elements
- `textStyle` - Default text content style for all text elements

### Priority Order (lowest to highest)

1. **Document-level defaults** (`defaultStyle`)
2. **Sequence-level defaults** (`itemStyle`/`stateStyle` on sequence)
3. **Element-specific styles** (styles defined on individual elements/steps)

### Example

```json
{
    "defaultStyle": {
        "sequence": {
            "titleStyle": {
                "letterSpacing": "0.15em",
                "textTransform": "uppercase"
            },
            "itemStyle": {
                "color": "#666"
            }
        },
        "text": {
            "textStyle": {
                "fontStyle": "italic"
            }
        }
    }
}
```

---

## Named Styles

Named styles allow you to define reusable styles once and reference them throughout the checklist.

### Structure

```json
{
    "namedStyles": {
        "styleName1": {
            "color": "#ff0000",
            "fontWeight": "bold"
        },
        "styleName2": {
            "backgroundColor": "#e8f5e9"
        }
    }
}
```

### Usage

Any style field can use either:
- **Inline styles** (object) - Define styles directly
- **Named style reference** (string) - Reference a predefined named style

```json
{
    "titleStyle": "styleName1"
}
```

or

```json
{
    "titleStyle": {
        "color": "#ff0000",
        "fontWeight": "bold"
    }
}
```

---

## Styling

Style fields can contain either:
- **Object**: CSS property-value pairs applied directly
- **String**: Reference to a named style defined in `namedStyles`

Property names can use either camelCase or kebab-case.

### Supported Style Fields

| Field | Applied To | Description |
|-------|-----------|-------------|
| `style` (element level) | Element container | Styles for the entire element (sequence or text) |
| `titleStyle` (sequence level) | Sequence title | Styles for the sequence title |
| `itemStyle` (step level) | Step item | Styles for individual step item |
| `stateStyle` (step level) | Step state | Styles for individual step state |
| `textStyle` (step level) | Step text | Styles for individual step text |
| `textStyle` (text element) | Text content | Styles for the text content in text elements |

### Style Object Format

```json
{
    "backgroundColor": "#e8f5e9",
    "color": "#2e7d32",
    "fontWeight": "bold",
    "textAlign": "center",
    "padding": "0.5rem"
}
```

Any valid CSS property can be used. Property names are automatically converted from camelCase to kebab-case.

### Common Style Properties

- `backgroundColor` - Background color
- `color` - Text color
- `fontSize` - Font size
- `fontWeight` - Font weight (e.g., "bold", "600")
- `fontStyle` - Font style (e.g., "italic")
- `textAlign` - Text alignment (e.g., "center", "left", "right")
- `padding` - Padding
- `margin` - Margin
- `border` - Border
- `borderRadius` - Border radius

---

## Complete Example

```json
{
    "title": "Pre-Flight Checklist",
    "titleStyle": {
        "color": "#1565c0",
        "textTransform": "uppercase"
    },
    "columns": 2,
    "defaultStyle": {
        "sequence": {
            "titleStyle": {
                "letterSpacing": "0.1em"
            }
        }
    },
    "namedStyles": {
        "engineControl": {
            "color": "#9c27b0",
            "fontWeight": "bold"
        },
        "warningBg": {
            "backgroundColor": "#fff3e0",
            "borderLeft": "4px solid #ff9800"
        }
    },
    "elements": [
        {
            "type": "sequence",
            "title": "Exterior Inspection",
            "style": {
                "backgroundColor": "#e8f5e9"
            },
            "titleStyle": {
                "color": "#2e7d32",
                "textAlign": "center"
            },
            "itemStyle": {
                "fontStyle": "italic"
            },
            "stateStyle": "engineControl",
            "steps": [
                {
                    "item": "Flight Controls",
                    "state": "CHECK"
                },
                {
                    "item": "Fuel Level",
                    "state": "VERIFY",
                    "itemStyle": {
                        "color": "#d32f2f",
                        "fontWeight": "bold"
                    }
                },
                {
                    "item": "Throttle",
                    "state": "CHECK"
                }
            ]
        },
        {
            "type": "text",
            "text": "Ensure all pre-flight checks are complete",
            "style": "warningBg",
            "textStyle": {
                "fontStyle": "italic",
                "color": "#666",
                "textAlign": "center"
            }
        },
        {
            "type": "sequence",
            "steps": [
                {
                    "item": "Parking Brake",
                    "state": "SET"
                }
            ]
        }
    ]
}
```

---

## Notes

- Elements without a title (sequences or text) flow naturally with previous elements
- Text elements are commonly used between sequences to add notes or instructions
- Multi-column layout automatically balances content across columns
- Sequences without titles are useful for continuing steps after a text element
- Style inheritance: Element styles don't cascade; each style field is independent
- Page breaks create separate column layout containers, useful for organizing long checklists and controlling print pagination


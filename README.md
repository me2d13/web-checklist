# Web Checklist

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A web-based checklist generator that creates interactive and printable checklists from JSON data. Originally designed for flight simulation checklists, but suitable for any sequential procedures.

## Live Demo

Try these example checklists:

- [Minimal Example](https://me2d13.github.io/web-checklist/?example=minimal) - Basic checklist structure
- [Styled Example - Interactive Mode](https://me2d13.github.io/web-checklist/?url=https://raw.githubusercontent.com/me2d13/web-checklist/master/src/examples/styled.json) - Demonstrates styling features with interactive navigation
- [Rich Example](https://me2d13.github.io/web-checklist/?example=rich) - Complex multi-section checklist
- [Boeing 737 Checklist - Interactive Mode](https://me2d13.github.io/web-checklist/?url=https://raw.githubusercontent.com/me2d13/web-checklist/master/src/examples/737.json) - Real-world flight checklist with interactive navigation

## Features

✨ **Interactive Mode**
- Click-to-complete items with visual feedback
- Navigation controls (Next, Previous, Reset)
- Gamepad/hardware button support
- Auto-scroll to current item
- Real-time progress tracking

📄 **Print Mode**
- Clean, optimized layout for printing
- Multi-column support (1-3 columns)
- Page break control
- Full-width utilization for landscape printing

🎨 **Rich Styling**
- Customizable colors, fonts, and layouts
- Named styles for reusability
- Default styles by element type
- Priority-based style inheritance

🎮 **Hardware Integration**
- Map gamepad buttons to navigation
- Real-time device detection
- Easy configuration with visual helper

## Quick Start

Visit [https://me2d13.github.io/web-checklist/](https://me2d13.github.io/web-checklist/)

1. Paste your JSON data into the editor
2. Choose Interactive or Print mode
3. Click "Render" to generate your checklist
4. Click "Render and Hide" for a clean view ready to print

## Documentation

- **[Tutorial](TUTORIAL.md)** - Step-by-step guide with examples
- **[JSON Format Reference](REFERENCE.md)** - Complete JSON format specification

## Creating Your First Checklist

Here's a minimal example:

```json
{
    "title": "My First Checklist",
    "elements": [
        {
            "type": "sequence",
            "title": "Pre-Flight",
            "steps": [
                {
                    "item": "Battery",
                    "state": "ON"
                },
                {
                    "item": "Fuel",
                    "state": "CHECK"
                }
            ]
        }
    ]
}
```

See the [Tutorial](TUTORIAL.md) for more examples and the [JSON Format Reference](REFERENCE.md) for all available options.

## Loading External Checklists

You can load checklists from external URLs:

```
https://me2d13.github.io/web-checklist/?url=https://example.com/checklist.json
```

### CORS Requirements

**Important:** The server hosting your JSON file must allow cross-origin requests by setting appropriate CORS headers. The server needs to include:

```
Access-Control-Allow-Origin: *
```

Or specifically allow the web-checklist domain:

```
Access-Control-Allow-Origin: https://me2d13.github.io
```

### Using GitHub (Recommended)

A simple solution is to store your JSON files in a GitHub repository and use the raw file URL:

**Example with the 737 checklist:**
```
https://me2d13.github.io/web-checklist/?url=https://raw.githubusercontent.com/me2d13/web-checklist/master/src/examples/737.json
```

[Try it live!](https://me2d13.github.io/web-checklist/?url=https://raw.githubusercontent.com/me2d13/web-checklist/master/src/examples/737.json)

**Benefits of using GitHub:**
- ✅ Automatic CORS headers (raw.githubusercontent.com allows cross-origin access)
- ✅ Version control for your checklists
- ✅ Free hosting
- ✅ Easy sharing with direct links
- ✅ Collaborative editing via pull requests

## Self-Hosting

The entire application is in the `src/` folder. Simply:

1. Copy the `src/` folder to your web server
2. Access `index.html` through your web server

**Note:** Requires a web server (cannot be opened directly from filesystem due to ES6 module imports).

### Local Development Server Options

```bash
# Python
cd src && python3 -m http.server 8000

# Node.js
npx http-server src -p 8000

# PHP
cd src && php -S localhost:8000

# Docker
docker run -p 8000:80 -v $(pwd)/src:/usr/share/nginx/html:ro nginx:alpine
```

Then open http://localhost:8000/

## Technology

- Pure HTML/CSS/JavaScript (ES6)
- No build process or dependencies
- Modern browsers only (2025+)
- Gamepad API for hardware support
- Responsive design

## Browser Support

Requires a modern browser with support for:
- ES6 modules
- Flexbox and CSS Grid
- Gamepad API (for hardware controls)
- Clipboard API (for copy functionality)

Tested on: Chrome, Firefox, Safari, Edge (latest versions)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Petr Medek

You are free to use, modify, and distribute this software, provided that the original copyright notice and license are included in all copies or substantial portions of the software.

## Contributing

This is a personal project, but suggestions and feedback are welcome! Please open an issue on GitHub.

## Acknowledgments

Designed for flight simulation enthusiasts who need reliable, customizable checklists for their virtual cockpits.
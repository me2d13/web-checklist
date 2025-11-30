# Development Guide

## Running the Application

Since this application uses ES6 module imports, it requires a web server to run properly (cannot be opened directly from the filesystem).

### Using Docker (Recommended)

Run a simple nginx container that serves the `src/` directory:

```bash
docker run -p 8000:80 -v $(pwd)/src:/usr/share/nginx/html:ro nginx:alpine
```

Then open your browser to: http://localhost:8000/

Changes to files in `src/` are immediately available - just refresh your browser.

Press `Ctrl+C` to stop the server.

### Alternative: Without Docker

If you prefer not to use Docker, you can use any static web server:

```bash
# Python
cd src && python3 -m http.server 8000

# Node.js
npx http-server src -p 8000

# PHP
cd src && php -S localhost:8000
```

## Project Structure

```
web-checklist/
├── src/
│   ├── index.html          # Main HTML page
│   ├── css/
│   │   └── main.css        # Main stylesheet
│   └── js/
│       └── main.js         # Main application logic
├── README.md               # User documentation
├── AGENTS.md              # Agent/AI documentation
└── DEV.md                 # This file - development guide
```

## Current Implementation Status

### ✅ Completed
- Basic HTML5 page structure
- CSS styling with responsive design
- Edit section with JSON textarea
- Two buttons: "Render" and "Render and Hide"
- Toggle button (cog wheel) to show/hide edit section
- Basic JavaScript event handling
- Sample JSON data loading

### 🚧 To Be Implemented
- Checklist rendering logic
- Support for different element types (sequence, text, etc.)
- Styling system (predefined styles, default styles)
- Column layout support
- Advanced formatting options
- Print optimization

## URL Parameters

The application supports loading examples directly via URL parameters:

```
index.html?example=minimal
index.html?example=styled
index.html?example=rich
```

When an example parameter is provided:
- The example JSON is automatically loaded
- The checklist is rendered immediately
- The edit section is hidden (collapsed)
- Users can click the pencil icon to show the editor

This is useful for:
- Direct links from documentation
- Sharing specific examples
- Testing and demonstration

## Testing

1. Start the development server
2. Open the page in a modern browser (Chrome, Firefox, Safari, Edge)
3. Load an example using the example links or URL parameters
4. Click "Render" to see the rendering
5. Click "Render and Hide" to hide the editor
6. Click the pencil icon button to show the editor again

## Browser Support

This application targets modern browsers (2025) and uses:
- ES6 modules
- Modern CSS features
- No build/transpilation step required


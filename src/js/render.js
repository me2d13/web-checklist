/**
 * Web Checklist - Rendering Logic
 */

/**
 * Render the checklist from JSON data
 * @param {Object} data - The checklist data
 * @param {HTMLElement} container - The container element to render into
 */
export function renderChecklist(data, container) {
    // Clear previous content
    container.innerHTML = '';

    // Prepare titles array (convert single title to array for uniform handling)
    let titles = [];
    if (data.title) {
        if (Array.isArray(data.title)) {
            titles = data.title;
        } else {
            // Single title: apply to first page only
            titles = [data.title];
        }
    }

    // Render elements with page break support
    if (data.elements && data.elements.length > 0) {
        renderElementsWithPageBreaks(data.elements, container, data.namedStyles || {}, data.defaultStyle || {}, data.columns, titles, data.titleStyle);
    }

    console.log('Checklist data:', data);
}

/**
 * Render elements with support for page breaks
 * @param {Array} elements - Array of element objects
 * @param {HTMLElement} container - The container element to render into
 * @param {Object} namedStyles - Named styles dictionary
 * @param {Object} defaultStyle - Default styles by element type
 * @param {number} columns - Number of columns for layout
 * @param {Array} titles - Array of titles for each page
 * @param {Object|string} titleStyle - Title style to apply
 */
function renderElementsWithPageBreaks(elements, container, namedStyles, defaultStyle, columns, titles, titleStyle) {
    // Split elements by page breaks
    const pages = [];
    let currentPage = [];
    
    elements.forEach(element => {
        if (element.type === 'page-break') {
            // Save current page and start a new one
            if (currentPage.length > 0) {
                pages.push(currentPage);
                currentPage = [];
            }
        } else {
            currentPage.push(element);
        }
    });
    
    // Add the last page
    if (currentPage.length > 0) {
        pages.push(currentPage);
    }
    
    // Render each page in its own wrapper
    pages.forEach((pageElements, index) => {
        // Create page wrapper div
        const pageWrapper = document.createElement('div');
        pageWrapper.className = 'checklist-page';
        
        // Add page break class to all wrappers except the first
        if (index > 0) {
            pageWrapper.classList.add('page-break-before');
        }
        
        // Add title for this page if available
        if (titles && titles[index]) {
            const title = document.createElement('h2');
            title.className = 'checklist-title';
            title.textContent = titles[index];
            
            // Apply custom title style if present
            if (titleStyle) {
                applyStylesWithNamed(title, titleStyle, namedStyles);
            }
            
            pageWrapper.appendChild(title);
        }
        
        // Create elements wrapper for column layout
        const elementsWrapper = document.createElement('div');
        elementsWrapper.className = 'checklist-elements';
        
        // Apply column count if specified
        if (columns && columns > 1) {
            elementsWrapper.style.columnCount = columns;
        }
        
        // Render elements in this page
        renderElements(pageElements, elementsWrapper, namedStyles, defaultStyle);
        
        pageWrapper.appendChild(elementsWrapper);
        container.appendChild(pageWrapper);
    });
}

/**
 * Render all elements from the checklist
 * @param {Array} elements - Array of element objects
 * @param {HTMLElement} container - The container element to render into
 * @param {Object} namedStyles - Named styles dictionary
 * @param {Object} defaultStyle - Default styles by element type
 */
function renderElements(elements, container, namedStyles, defaultStyle) {
    elements.forEach(element => {
        const elementDiv = document.createElement('div');
        elementDiv.className = `checklist-element checklist-element-${element.type || 'unknown'}`;

        // Apply default style for this element type first (if present)
        const typeDefaults = defaultStyle[element.type] || {};
        if (typeDefaults.style) {
            applyStylesWithNamed(elementDiv, typeDefaults.style, namedStyles);
        }

        // Apply element-specific styles (overrides defaults)
        if (element.style) {
            applyStylesWithNamed(elementDiv, element.style, namedStyles);
        }

        // Call the appropriate render function based on type
        switch (element.type) {
            case 'sequence':
                renderSequence(element, elementDiv, namedStyles, typeDefaults);
                break;
            case 'text':
                renderText(element, elementDiv, namedStyles, typeDefaults);
                break;
            default:
                renderUnknown(element, elementDiv);
        }

        container.appendChild(elementDiv);
    });
}

/**
 * Apply custom styles to an element
 * @param {HTMLElement} element - The element to style
 * @param {Object} styles - Object containing CSS property-value pairs
 */
function applyStyles(element, styles) {
    if (typeof styles === 'object' && styles !== null) {
        Object.keys(styles).forEach(property => {
            // Convert camelCase to kebab-case for CSS properties
            const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
            element.style.setProperty(cssProperty, styles[property]);
        });
    }
}

/**
 * Apply styles that can be either a named style reference or inline styles
 * @param {HTMLElement} element - The element to style
 * @param {Object|string} styleValue - Either a style object or a named style reference
 * @param {Object} namedStyles - Named styles dictionary
 */
function applyStylesWithNamed(element, styleValue, namedStyles) {
    if (typeof styleValue === 'string') {
        // It's a named style reference
        if (namedStyles && namedStyles[styleValue]) {
            applyStyles(element, namedStyles[styleValue]);
        } else {
            console.warn(`Named style "${styleValue}" not found`);
        }
    } else if (typeof styleValue === 'object' && styleValue !== null) {
        // It's an inline style object
        applyStyles(element, styleValue);
    }
}

/**
 * Render a sequence element
 * @param {Object} element - The sequence element data
 * @param {HTMLElement} container - The container to render into
 * @param {Object} namedStyles - Named styles dictionary
 * @param {Object} typeDefaults - Default styles for this element type
 */
function renderSequence(element, container, namedStyles, typeDefaults) {
    // Render sequence title if present
    if (element.title) {
        const titleDiv = document.createElement('div');
        titleDiv.className = 'sequence-title';
        titleDiv.textContent = element.title;

        // Apply default title style (if present)
        if (typeDefaults.titleStyle) {
            applyStylesWithNamed(titleDiv, typeDefaults.titleStyle, namedStyles);
        }

        // Apply element-specific title styles (overrides defaults)
        if (element.titleStyle) {
            applyStylesWithNamed(titleDiv, element.titleStyle, namedStyles);
        }

        container.appendChild(titleDiv);
    }

    // Render steps
    if (element.steps && element.steps.length > 0) {
        element.steps.forEach(step => {
            // Check if it's a text step
            if (step.text) {
                const stepDiv = document.createElement('div');
                stepDiv.className = 'sequence-step-text';
                stepDiv.textContent = step.text;

                // Apply default text style (if present)
                if (typeDefaults.textStyle) {
                    applyStylesWithNamed(stepDiv, typeDefaults.textStyle, namedStyles);
                }

                // Apply sequence-level default text style (if present)
                if (element.textStyle) {
                    applyStylesWithNamed(stepDiv, element.textStyle, namedStyles);
                }

                // Apply step-level text styles (overrides defaults)
                if (step.textStyle) {
                    applyStylesWithNamed(stepDiv, step.textStyle, namedStyles);
                }

                container.appendChild(stepDiv);
            } else {
                // It's a regular item/state step
                const stepDiv = document.createElement('div');
                stepDiv.className = 'sequence-step';

                const stepItem = document.createElement('span');
                stepItem.className = 'step-item';
                stepItem.textContent = step.item || '';

                // Apply default item style (if present)
                if (typeDefaults.itemStyle) {
                    applyStylesWithNamed(stepItem, typeDefaults.itemStyle, namedStyles);
                }

                // Apply sequence-level default item style (if present)
                if (element.itemStyle) {
                    applyStylesWithNamed(stepItem, element.itemStyle, namedStyles);
                }

                // Apply step-level item styles (overrides all defaults)
                if (step.itemStyle) {
                    applyStylesWithNamed(stepItem, step.itemStyle, namedStyles);
                }

                const stepDots = document.createElement('span');
                stepDots.className = 'step-dots';

                const stepState = document.createElement('span');
                stepState.className = 'step-state';
                stepState.textContent = step.state || '';

                // Apply default state style (if present)
                if (typeDefaults.stateStyle) {
                    applyStylesWithNamed(stepState, typeDefaults.stateStyle, namedStyles);
                }

                // Apply sequence-level default state style (if present)
                if (element.stateStyle) {
                    applyStylesWithNamed(stepState, element.stateStyle, namedStyles);
                }

                // Apply step-level state styles (overrides all defaults)
                if (step.stateStyle) {
                    applyStylesWithNamed(stepState, step.stateStyle, namedStyles);
                }

                stepDiv.appendChild(stepItem);
                stepDiv.appendChild(stepDots);
                stepDiv.appendChild(stepState);

                container.appendChild(stepDiv);
            }
        });
    }
}

/**
 * Render a text element
 * @param {Object} element - The text element data
 * @param {HTMLElement} container - The container to render into
 * @param {Object} namedStyles - Named styles dictionary
 * @param {Object} typeDefaults - Default styles for this element type
 */
function renderText(element, container, namedStyles, typeDefaults) {
    const textDiv = document.createElement('div');
    textDiv.className = 'text-content';
    textDiv.textContent = element.text || '';

    // Apply default text style (if present)
    if (typeDefaults.textStyle) {
        applyStylesWithNamed(textDiv, typeDefaults.textStyle, namedStyles);
    }

    // Apply element-specific text styles (overrides defaults)
    if (element.textStyle) {
        applyStylesWithNamed(textDiv, element.textStyle, namedStyles);
    }

    container.appendChild(textDiv);
}

/**
 * Render an unknown element type
 * @param {Object} element - The element data
 * @param {HTMLElement} container - The container to render into
 */
function renderUnknown(element, container) {
    container.textContent = `[Unknown element type: ${element.type || 'undefined'}]`;
    container.style.color = '#999';
}


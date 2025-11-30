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
    
    // Create checklist title if present
    if (data.title) {
        const title = document.createElement('h2');
        title.className = 'checklist-title';
        title.textContent = data.title;
        
        // Apply custom title style if present
        if (data.titleStyle) {
            applyStylesWithNamed(title, data.titleStyle, data.namedStyles || {});
        }
        
        container.appendChild(title);
    }
    
    // Create elements wrapper for column layout
    const elementsWrapper = document.createElement('div');
    elementsWrapper.className = 'checklist-elements';
    
    // Apply column count if specified
    if (data.columns && data.columns > 1) {
        elementsWrapper.style.columnCount = data.columns;
    }
    
    // Render elements (pass namedStyles and defaultStyle for reference)
    if (data.elements && data.elements.length > 0) {
        renderElements(data.elements, elementsWrapper, data.namedStyles || {}, data.defaultStyle || {});
    }
    
    container.appendChild(elementsWrapper);
        
    console.log('Checklist data:', data);
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


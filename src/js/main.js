/**
 * Web Checklist - Main Application
 */

import { renderChecklist, nextItem, previousItem, resetCompletion } from './render.js';
import { initGamepad } from './gamepad.js';

// DOM Elements
const editSection = document.getElementById('edit-section');
const toggleEditBtn = document.getElementById('toggle-edit-btn');
const renderBtn = document.getElementById('render-btn');
const renderHideBtn = document.getElementById('render-hide-btn');
const jsonInput = document.getElementById('json-input');
const checklistContainer = document.getElementById('checklist-container');
const errorBox = document.getElementById('error-box');
const errorMessage = document.getElementById('error-message');
const closeErrorBtn = document.getElementById('close-error');
const interactiveModeCheckbox = document.getElementById('interactive-mode-checkbox');
const interactiveNav = document.getElementById('interactive-nav');
const navPrevBtn = document.getElementById('nav-prev');
const navNextBtn = document.getElementById('nav-next');
const navResetBtn = document.getElementById('nav-reset');

/**
 * Initialize the application
 */
function init() {
    // Set up event listeners
    renderBtn.addEventListener('click', handleRender);
    renderHideBtn.addEventListener('click', handleRenderAndHide);
    toggleEditBtn.addEventListener('click', handleToggleEdit);
    closeErrorBtn.addEventListener('click', hideError);

    // Hide error when user starts typing
    jsonInput.addEventListener('input', hideError);

    // Set up example links
    const exampleLinks = document.querySelectorAll('.example-link');
    exampleLinks.forEach(link => {
        link.addEventListener('click', handleExampleClick);
    });

    // Set up navigation button listeners
    navPrevBtn.addEventListener('click', previousItem);
    navNextBtn.addEventListener('click', nextItem);
    navResetBtn.addEventListener('click', resetCompletion);

    // Show/hide navigation controls based on interactive mode
    interactiveModeCheckbox.addEventListener('change', updateNavigationVisibility);

    // Initialize gamepad detection
    initGamepad();
    // Check for URL parameter to load example
    checkUrlParameters();
}

/**
 * Check URL parameters and load example if specified
 */
async function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const exampleName = urlParams.get('example');

    if (exampleName) {
        try {
            const response = await fetch(`examples/${exampleName}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load example: ${response.statusText}`);
            }

            const jsonText = await response.text();
            const jsonData = JSON.parse(jsonText);

            // Load into textarea
            jsonInput.value = JSON.stringify(jsonData, null, 2);

            // Render and hide edit section
            hideError();
            renderChecklist(jsonData, checklistContainer);
            hideEditSection();

        } catch (error) {
            showError(`Failed to load example "${exampleName}": ${error.message}`);
            console.error('URL parameter example load error:', error);
        }
    }
}

/**
 * Handle example link click
 * @param {Event} event - Click event
 */
async function handleExampleClick(event) {
    event.preventDefault();

    const exampleName = event.target.dataset.example;
    if (!exampleName) return;

    try {
        const response = await fetch(`examples/${exampleName}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load example: ${response.statusText}`);
        }

        const jsonText = await response.text();

        // Parse to validate and re-format
        const jsonData = JSON.parse(jsonText);
        jsonInput.value = JSON.stringify(jsonData, null, 2);

        hideError();

        // Optional: auto-render after loading
        // renderChecklist(jsonData, checklistContainer);

    } catch (error) {
        showError(`Failed to load example "${exampleName}": ${error.message}`);
        console.error('Example load error:', error);
    }
}

/**
 * Handle render button click
 * @returns {boolean} True if successful, false if error
 */
function handleRender() {
    try {
        const jsonData = JSON.parse(jsonInput.value);
        hideError();
        renderChecklist(jsonData, checklistContainer);
        updateNavigationVisibility();
        return true;
    } catch (error) {
        showError('Invalid JSON: ' + error.message);
        console.error('JSON Parse Error:', error);
        return false;
    }
}

/**
 * Handle render and hide button click
 */
function handleRenderAndHide() {
    const success = handleRender();
    // Only hide the edit section if rendering was successful
    if (success) {
        hideEditSection();
    }
}

/**
 * Handle toggle edit button click
 */
function handleToggleEdit() {
    showEditSection();
}

/**
 * Hide the edit section and show toggle button
 */
function hideEditSection() {
    editSection.classList.add('hidden');
    toggleEditBtn.classList.remove('hidden');
}

/**
 * Show the edit section and hide toggle button
 */
function showEditSection() {
    editSection.classList.remove('hidden');
    toggleEditBtn.classList.add('hidden');
}

/**
 * Show error message
 * @param {string} message - The error message to display
 */
function showError(message) {
    errorMessage.textContent = message;
    errorBox.classList.remove('hidden');
}

/**
 * Hide error message
 */
function hideError() {
    errorBox.classList.add('hidden');
    errorMessage.textContent = '';
}

/**
 * Update navigation controls visibility based on interactive mode
 */
function updateNavigationVisibility() {
    const isInteractive = interactiveModeCheckbox.checked;
    const hasChecklist = checklistContainer.children.length > 0;

    if (isInteractive && hasChecklist) {
        interactiveNav.classList.remove('hidden');
    } else {
        interactiveNav.classList.add('hidden');
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


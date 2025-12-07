/**
 * Web Checklist - Main Application
 */

import { renderChecklist, nextItem, previousItem, resetCompletion } from './render.js';
import { initGamepad, startControlMonitoring, stopControlMonitoring } from './gamepad.js';

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
const modeInteractiveRadio = document.getElementById('mode-interactive');
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
    // Listen to both radio buttons for mode changes and re-render when mode changes
    document.querySelectorAll('input[name="layout-mode"]').forEach(radio => {
        radio.addEventListener('change', handleModeChange);
    });

    // Initialize gamepad support (for helper button to work)
    initGamepad();

    // Check for URL parameter to load example
    checkUrlParameters();
}

/**
 * Check URL parameters and load example or external JSON if specified
 */
async function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const exampleName = urlParams.get('example');
    const externalUrl = urlParams.get('url');

    // Load from external URL if provided
    if (externalUrl) {
        try {
            const response = await fetch(externalUrl);
            if (!response.ok) {
                throw new Error(`Failed to load from URL: ${response.statusText}`);
            }

            const jsonText = await response.text();
            const jsonData = JSON.parse(jsonText);

            // Load into textarea
            jsonInput.value = JSON.stringify(jsonData, null, 2);

            // Render and hide edit section
            hideError();
            renderChecklist(jsonData, checklistContainer);
            updateNavigationVisibility();

            // Initialize gamepad controls if present
            const isInteractive = modeInteractiveRadio ? modeInteractiveRadio.checked : false;
            const hasControls = jsonData.controls && (jsonData.controls.next || jsonData.controls.previous || jsonData.controls.reset);

            if (isInteractive && hasControls) {
                initGamepad();
                startControlMonitoring(jsonData.controls, {
                    next: nextItem,
                    previous: previousItem,
                    reset: resetCompletion
                });
            }

            hideEditSection();

        } catch (error) {
            showError(`Failed to load from URL: ${error.message}`);
            console.error('URL parameter load error:', error);
        }
        return; // Don't check for example parameter if URL was provided
    }

    // Load local example if provided
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

        // Stop any existing control monitoring
        stopControlMonitoring();

        // Check if we should initialize gamepad controls
        const isInteractive = modeInteractiveRadio ? modeInteractiveRadio.checked : false;
        const hasControls = jsonData.controls && (jsonData.controls.next || jsonData.controls.previous || jsonData.controls.reset);

        if (isInteractive && hasControls) {
            // Initialize gamepad API
            initGamepad();

            // Start monitoring with action callbacks
            startControlMonitoring(jsonData.controls, {
                next: nextItem,
                previous: previousItem,
                reset: resetCompletion
            });
        }

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
    // Scroll to top to make edit section visible
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
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
 * Handle mode change - re-render checklist if one exists
 * This ensures interactive features are properly initialized when switching modes
 */
function handleModeChange() {
    const hasChecklist = checklistContainer.children.length > 0;

    // If a checklist is already rendered, re-render it in the new mode
    if (hasChecklist && jsonInput.value.trim()) {
        try {
            const jsonData = JSON.parse(jsonInput.value);

            // Stop any existing control monitoring
            stopControlMonitoring();

            // Re-render the checklist
            renderChecklist(jsonData, checklistContainer);
            updateNavigationVisibility();

            // Check if we should initialize gamepad controls
            const isInteractive = modeInteractiveRadio ? modeInteractiveRadio.checked : false;
            const hasControls = jsonData.controls && (jsonData.controls.next || jsonData.controls.previous || jsonData.controls.reset);

            if (isInteractive && hasControls) {
                // Initialize gamepad API
                initGamepad();

                // Start monitoring with action callbacks
                startControlMonitoring(jsonData.controls, {
                    next: nextItem,
                    previous: previousItem,
                    reset: resetCompletion
                });
            }
        } catch (error) {
            // If there's an error, just update visibility without re-rendering
            console.warn('Could not re-render on mode change:', error);
            updateNavigationVisibility();
        }
    } else {
        // No checklist to re-render, just update visibility
        updateNavigationVisibility();
    }
}

/**
 * Update navigation controls visibility based on interactive mode
 */
function updateNavigationVisibility() {
    const isInteractive = modeInteractiveRadio ? modeInteractiveRadio.checked : false;
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


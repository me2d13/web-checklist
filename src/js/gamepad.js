/**
 * Web Checklist - Gamepad Support
 */

let connectedGamepads = {};
let helperOpen = false;
let helperUpdateInterval = null;
let lastTouchedButton = {}; // Track last touched button per device
let previousButtonStates = {}; // Track previous button states to detect press/release

// Control mapping and monitoring
let controlsConfig = null; // Stores the controls configuration from JSON
let controlMonitoringInterval = null; // Interval for monitoring control buttons
let controlButtonStates = {}; // Track button states for control monitoring

/**
 * Initialize gamepad detection
 */
export function initGamepad() {
    // Check if Gamepad API is supported
    if (!('getGamepads' in navigator)) {
        console.warn('Gamepad API not supported in this browser');
        return;
    }

    // Set up event listeners for gamepad connection
    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    // Set up helper button click
    const helperBtn = document.getElementById('gamepad-helper-btn');
    const closeBtn = document.getElementById('close-gamepad-helper');

    if (helperBtn) {
        helperBtn.addEventListener('click', toggleGamepadHelper);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeGamepadHelper);
    }

    // Start polling for gamepads (some browsers need this)
    pollGamepads();
}

/**
 * Start monitoring gamepad controls for checklist navigation
 * @param {Object} controls - Controls configuration from JSON {next: {name, button}, previous: {name, button}, reset: {name, button}}
 * @param {Object} actions - Action callbacks {next: function, previous: function, reset: function}
 */
export function startControlMonitoring(controls, actions) {
    if (!controls || !('getGamepads' in navigator)) {
        return;
    }

    controlsConfig = controls;

    // Stop any existing monitoring
    stopControlMonitoring();

    // Start monitoring interval (check every 50ms for responsive controls)
    controlMonitoringInterval = setInterval(() => {
        monitorControlButtons(actions);
    }, 50);

    console.log('Gamepad control monitoring started', controls);
}

/**
 * Stop monitoring gamepad controls
 */
export function stopControlMonitoring() {
    if (controlMonitoringInterval) {
        clearInterval(controlMonitoringInterval);
        controlMonitoringInterval = null;
        controlButtonStates = {};
    }
}

/**
 * Monitor control buttons and trigger actions on press
 */
function monitorControlButtons(actions) {
    const gamepads = navigator.getGamepads();

    for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (!gamepad) continue;

        // Check each control mapping
        ['next', 'previous', 'reset'].forEach(action => {
            const control = controlsConfig[action];
            if (!control) return;

            // Check if this gamepad matches the control's device name
            if (gamepad.id === control.name && control.button !== undefined) {
                const button = gamepad.buttons[control.button];
                if (!button) return;

                // Create state key
                const stateKey = `${gamepad.id}_${control.button}_${action}`;
                const wasPressed = controlButtonStates[stateKey] || false;
                const isPressed = button.pressed && button.value > 0.5;

                // Detect press transition (not pressed -> pressed)
                if (!wasPressed && isPressed) {
                    // Trigger the action
                    if (actions[action]) {
                        actions[action]();
                        console.log(`Gamepad action triggered: ${action}`);
                    }
                }

                // Update state
                controlButtonStates[stateKey] = isPressed;
            }
        });
    }
}

/**
 * Handle gamepad connected event
 */
function handleGamepadConnected(event) {
    console.log('Gamepad connected:', event.gamepad);
    connectedGamepads[event.gamepad.index] = event.gamepad;
    previousButtonStates[event.gamepad.index] = [];
    if (helperOpen) {
        updateGamepadHelper();
    }
}

/**
 * Handle gamepad disconnected event
 */
function handleGamepadDisconnected(event) {
    console.log('Gamepad disconnected:', event.gamepad);
    delete connectedGamepads[event.gamepad.index];
    delete lastTouchedButton[event.gamepad.index];
    delete previousButtonStates[event.gamepad.index];
    if (helperOpen) {
        updateGamepadHelper();
    }
}

/**
 * Poll for gamepads (needed for some browsers)
 */
function pollGamepads() {
    const gamepads = navigator.getGamepads();

    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            connectedGamepads[gamepads[i].index] = gamepads[i];
            // Initialize button states if not present
            if (!previousButtonStates[gamepads[i].index]) {
                previousButtonStates[gamepads[i].index] = [];
            }
        }
    }

    // Continue polling
    requestAnimationFrame(pollGamepads);
}

/**
 * Toggle the gamepad helper section open/closed
 */
function toggleGamepadHelper() {
    const helperSection = document.getElementById('gamepad-helper');
    if (helperSection) {
        if (helperOpen) {
            // Close it
            closeGamepadHelper();
        } else {
            // Open it
            helperSection.classList.remove('hidden');
            helperOpen = true;

            // Start updating the helper display
            updateGamepadHelper();
            helperUpdateInterval = setInterval(updateGamepadHelper, 100); // Update 10 times per second
        }
    }
}

/**
 * Close the gamepad helper section
 */
function closeGamepadHelper() {
    const helperSection = document.getElementById('gamepad-helper');
    if (helperSection) {
        helperSection.classList.add('hidden');
        helperOpen = false;

        // Stop updating
        if (helperUpdateInterval) {
            clearInterval(helperUpdateInterval);
            helperUpdateInterval = null;
        }
    }
}

/**
 * Update the gamepad helper display with real-time button states
 */
function updateGamepadHelper() {
    const detailsElement = document.getElementById('gamepad-details');
    if (!detailsElement) return;

    // Get fresh gamepad state
    const gamepads = navigator.getGamepads();
    const gamepadArray = [];

    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            gamepadArray.push(gamepads[i]);
        }
    }

    if (gamepadArray.length === 0) {
        detailsElement.innerHTML = '<p style="color: #999; padding: 1rem;">No game devices detected. Connect a gamepad and press any button.</p>';
        return;
    }

    // Check if we need to rebuild the entire structure
    const existingDevices = detailsElement.querySelectorAll('.gamepad-device');
    const needsRebuild = existingDevices.length !== gamepadArray.length;

    if (needsRebuild) {
        // Full rebuild
        buildGamepadHelperHTML(gamepadArray, detailsElement);
    } else {
        // Just update button states and last touched
        updateGamepadButtonStates(gamepadArray);
    }
}

/**
 * Build the complete gamepad helper HTML structure
 */
function buildGamepadHelperHTML(gamepadArray, detailsElement) {
    let html = '';

    gamepadArray.forEach((gamepad) => {
        // Initialize previous state if needed
        if (!previousButtonStates[gamepad.index]) {
            previousButtonStates[gamepad.index] = [];
        }

        html += `<div class="gamepad-device" data-gamepad-index="${gamepad.index}">
            <h4>Device ${gamepad.index}: ${gamepad.id} <span style="color: #999; font-size: 0.85rem; font-weight: normal;">(${gamepad.buttons.length} buttons, ${gamepad.axes.length} axes)</span></h4>
            
            <div class="gamepad-buttons-compact" data-buttons-container="${gamepad.index}">`;

        // Compact button display - just numbers in small boxes
        gamepad.buttons.forEach((button, index) => {
            const pressed = button.pressed ? 'pressed' : '';
            html += `<div class="button-compact ${pressed}" data-button-index="${index}">${index}</div>`;
        });

        html += `</div>`;

        // Placeholder for JSON config
        html += `<div class="gamepad-config-container" data-config-container="${gamepad.index}"></div>`;

        html += `</div>`;
    });

    detailsElement.innerHTML = html;
}

/**
 * Update only the button states and last touched config
 */
function updateGamepadButtonStates(gamepadArray) {
    gamepadArray.forEach((gamepad) => {
        // Initialize previous state if needed
        if (!previousButtonStates[gamepad.index]) {
            previousButtonStates[gamepad.index] = [];
        }

        // Find the buttons container for this gamepad
        const buttonsContainer = document.querySelector(`[data-buttons-container="${gamepad.index}"]`);
        if (!buttonsContainer) return;

        // Detect button press transitions and update button states
        gamepad.buttons.forEach((button, index) => {
            const wasPressed = previousButtonStates[gamepad.index][index] || false;
            const isPressed = button.pressed && button.value > 0.5;

            // Only update on press transition (not pressed -> pressed)
            if (!wasPressed && isPressed) {
                lastTouchedButton[gamepad.index] = index;
                updateConfigDisplay(gamepad);
            }

            // Update button visual state
            const buttonElement = buttonsContainer.querySelector(`[data-button-index="${index}"]`);
            if (buttonElement) {
                if (isPressed) {
                    buttonElement.classList.add('pressed');
                } else {
                    buttonElement.classList.remove('pressed');
                }
            }

            // Update previous state
            previousButtonStates[gamepad.index][index] = isPressed;
        });
    });
}

/**
 * Update the config display for a gamepad
 */
function updateConfigDisplay(gamepad) {
    const configContainer = document.querySelector(`[data-config-container="${gamepad.index}"]`);
    if (!configContainer) return;

    if (lastTouchedButton[gamepad.index] !== undefined) {
        const jsonText = `"name": "${gamepad.id}", "button": ${lastTouchedButton[gamepad.index]}`;

        configContainer.innerHTML = `<div class="gamepad-config">
            <strong>Last touched button config:</strong>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <code id="config-json-${gamepad.index}">${jsonText}</code>
                <button class="copy-config-btn" data-copy-text='${jsonText}' title="Copy to clipboard">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
            </div>
        </div>`;

        // Add click handler to copy button
        const copyBtn = configContainer.querySelector('.copy-config-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', function () {
                const textToCopy = this.getAttribute('data-copy-text');
                copyToClipboard(textToCopy, this);
            });
        }
    }
}

/**
 * Copy text to clipboard and show feedback
 */
function copyToClipboard(text, buttonElement) {
    navigator.clipboard.writeText(text).then(() => {
        // Show success feedback
        const originalHTML = buttonElement.innerHTML;
        buttonElement.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        buttonElement.style.backgroundColor = '#28a745';

        setTimeout(() => {
            buttonElement.innerHTML = originalHTML;
            buttonElement.style.backgroundColor = '';
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}


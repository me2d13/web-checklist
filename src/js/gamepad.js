/**
 * Web Checklist - Gamepad Support
 */

let connectedGamepads = {};
let helperOpen = false;
let helperUpdateInterval = null;
let lastTouchedButton = {}; // Track last touched button per device
let previousButtonStates = {}; // Track previous button states to detect press/release

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

    let html = '';

    gamepadArray.forEach((gamepad) => {
        // Initialize previous state if needed
        if (!previousButtonStates[gamepad.index]) {
            previousButtonStates[gamepad.index] = [];
        }

        // Detect button press transitions (not pressed -> pressed)
        gamepad.buttons.forEach((button, index) => {
            const wasPressed = previousButtonStates[gamepad.index][index] || false;
            const isPressed = button.pressed && button.value > 0.5;

            // Only update on press transition (not pressed -> pressed)
            if (!wasPressed && isPressed) {
                lastTouchedButton[gamepad.index] = index;
            }

            // Update previous state
            previousButtonStates[gamepad.index][index] = isPressed;
        });

        html += `<div class="gamepad-device">
            <h4>Device ${gamepad.index}: ${gamepad.id} <span style="color: #999; font-size: 0.85rem; font-weight: normal;">(${gamepad.buttons.length} buttons, ${gamepad.axes.length} axes)</span></h4>
            
            <div class="gamepad-buttons-compact">`;

        // Compact button display - just numbers in small boxes
        gamepad.buttons.forEach((button, index) => {
            const pressed = button.pressed ? 'pressed' : '';
            html += `<div class="button-compact ${pressed}">${index}</div>`;
        });

        html += `</div>`;

        // Show JSON config for last touched button
        if (lastTouchedButton[gamepad.index] !== undefined) {
            html += `<div class="gamepad-config">
                <strong>Last touched button config:</strong>
                <code>"name": "${gamepad.id}", "button": ${lastTouchedButton[gamepad.index]}</code>
            </div>`;
        }

        html += `</div>`;
    });

    detailsElement.innerHTML = html;
}

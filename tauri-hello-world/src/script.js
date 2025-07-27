// Import Tauri API
const { invoke } = window.__TAURI__.tauri;

// DOM elements
const nameInput = document.getElementById('name-input');
const greetBtn = document.getElementById('greet-btn');
const greetingResult = document.getElementById('greeting-result');

const systemInfoBtn = document.getElementById('system-info-btn');
const systemInfoResult = document.getElementById('system-info-result');

const incrementBtn = document.getElementById('increment-btn');
const getCounterBtn = document.getElementById('get-counter-btn');
const resetCounterBtn = document.getElementById('reset-counter-btn');
const counterResult = document.getElementById('counter-result');
const counterValue = document.getElementById('counter-value');

const timestampBtn = document.getElementById('timestamp-btn');
const timestampResult = document.getElementById('timestamp-result');

const usbDevicesBtn = document.getElementById('usb-devices-btn');
const usbDevicesResult = document.getElementById('usb-devices-result');

// Utility functions
function showResult(element, content, type = 'default') {
    element.innerHTML = content;
    element.className = `result show ${type}`;
}

function showLoading(element) {
    element.innerHTML = 'Loading...';
    element.className = 'result show loading';
}

function showError(element, error) {
    showResult(element, `❌ Error: ${error}`, 'error');
}

// Greeting functionality
async function handleGreet() {
    const name = nameInput.value.trim() || 'World';
    showLoading(greetingResult);
    
    try {
        const response = await invoke('greet', { name });
        showResult(greetingResult, `✨ ${response}`, 'success');
    } catch (error) {
        showError(greetingResult, error);
    }
}

// System information functionality
async function handleSystemInfo() {
    showLoading(systemInfoResult);
    
    try {
        const systemInfo = await invoke('get_system_info');
        const infoHtml = `
            <div class="system-info">
                <div><strong>OS:</strong> ${systemInfo.os}</div>
                <div><strong>Architecture:</strong> ${systemInfo.arch}</div>
                <div><strong>Version:</strong> ${systemInfo.version}</div>
                <div><strong>Hostname:</strong> ${systemInfo.hostname}</div>
            </div>
        `;
        showResult(systemInfoResult, infoHtml, 'success');
    } catch (error) {
        showError(systemInfoResult, error);
    }
}

// Counter functionality
async function handleIncrement() {
    try {
        const newCount = await invoke('increment_counter');
        counterValue.textContent = newCount;
        showResult(counterResult, `<span class="counter-display">Count: <span id="counter-value">${newCount}</span></span>`, 'success');
        // Update the counter value element reference
        document.getElementById('counter-value').textContent = newCount;
    } catch (error) {
        showError(counterResult, error);
    }
}

async function handleGetCounter() {
    try {
        const count = await invoke('get_counter');
        counterValue.textContent = count;
        showResult(counterResult, `<span class="counter-display">Count: <span id="counter-value">${count}</span></span>`, 'success');
        // Update the counter value element reference
        document.getElementById('counter-value').textContent = count;
    } catch (error) {
        showError(counterResult, error);
    }
}

async function handleResetCounter() {
    try {
        const count = await invoke('reset_counter');
        counterValue.textContent = count;
        showResult(counterResult, `<span class="counter-display">Count: <span id="counter-value">${count}</span></span>`, 'success');
        // Update the counter value element reference
        document.getElementById('counter-value').textContent = count;
    } catch (error) {
        showError(counterResult, error);
    }
}

// Timestamp functionality
async function handleTimestamp() {
    showLoading(timestampResult);
    
    try {
        const timestamp = await invoke('get_timestamp');
        showResult(timestampResult, `🕒 ${timestamp}`, 'success');
    } catch (error) {
        showError(timestampResult, error);
    }
}

// USB devices functionality
async function handleUsbDevices() {
    showLoading(usbDevicesResult);
    
    try {
        const devices = await invoke('get_mock_usb_devices');
        
        if (devices.length === 0) {
            showResult(usbDevicesResult, '📱 No USB devices found', 'default');
            return;
        }
        
        const devicesHtml = devices.map(device => `
            <div class="usb-device">
                <div class="device-name">🔌 ${device.name}</div>
                <div class="device-details">
                    <div>Port: ${device.port}</div>
                    <div>Vendor ID: ${device.vendor_id} | Product ID: ${device.product_id}</div>
                </div>
            </div>
        `).join('');
        
        showResult(usbDevicesResult, `
            <div style="margin-bottom: 10px;"><strong>Found ${devices.length} USB device(s):</strong></div>
            ${devicesHtml}
        `, 'success');
    } catch (error) {
        showError(usbDevicesResult, error);
    }
}

// Event listeners
greetBtn.addEventListener('click', handleGreet);
systemInfoBtn.addEventListener('click', handleSystemInfo);
incrementBtn.addEventListener('click', handleIncrement);
getCounterBtn.addEventListener('click', handleGetCounter);
resetCounterBtn.addEventListener('click', handleResetCounter);
timestampBtn.addEventListener('click', handleTimestamp);
usbDevicesBtn.addEventListener('click', handleUsbDevices);

// Allow Enter key to trigger greeting
nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleGreet();
    }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎛 AcreetionOS Hello World - Tauri app initialized');
    
    // Load initial counter value
    handleGetCounter();
    
    // Show welcome message
    setTimeout(() => {
        handleGreet();
    }, 500);
});

// Add some interactive features
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + R to refresh timestamp
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        handleTimestamp();
    }
    
    // Ctrl/Cmd + D to scan devices
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleUsbDevices();
    }
    
    // Ctrl/Cmd + I to get system info
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        handleSystemInfo();
    }
});

// Add visual feedback for button interactions
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousedown', () => {
        btn.style.transform = 'translateY(1px)';
    });
    
    btn.addEventListener('mouseup', () => {
        btn.style.transform = 'translateY(-1px)';
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
    });
});
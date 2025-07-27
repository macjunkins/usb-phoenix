const { ipcRenderer } = require('electron');

let isFlashing = false;
let consoleVisible = false; // Track console visibility

// Get console output element
const flashConsoleOutput = document.getElementById('flash-console-output');
const toggleConsoleBtn = document.getElementById('toggle-console-btn');

// Update status message
function updateStatus(message, type = 'default') {
    const statusEl = document.getElementById('status-message');
    const progressBar = document.getElementById('progress-bar'); // Get the progress bar element
    const progressFill = document.getElementById('progress-fill');

    let icon = '';

    if (type === 'loading') {
        icon = '⬇️'; // Download
        if (message.includes('Flashing')) {
            icon = '🔥'; // Flashing
        }
    } else if (type === 'success') {
        icon = '✅';
    } else if (type === 'error') {
        icon = '❌';
    }

    statusEl.innerHTML = `<span class="status-icon">${icon}</span>${message.replace(/[⬇️🔥✅❌]/g, '').trim()}`;
    
    // Manage progress bar visibility and spinner based on status type
    if (type === 'loading') {
        statusEl.innerHTML += '<div class="loading-spinner"></div>';
        progressBar.style.display = 'block'; // Show progress bar
    } else {
        progressBar.style.display = 'none'; // Hide progress bar for success/error/default
        progressFill.style.width = '0%'; // Reset progress bar fill
    }
}

// Update progress bar fill
function updateProgress(percent) {
    const progressFill = document.getElementById('progress-fill');
    progressFill.style.width = percent + '%';
}

// Function to append text to the in-app console and scroll
function appendToConsole(text) {
    flashConsoleOutput.textContent += text;
    flashConsoleOutput.scrollTop = flashConsoleOutput.scrollHeight; // Auto-scroll to bottom
}

// Function to clear the in-app console
function clearConsole() {
    flashConsoleOutput.textContent = '';
}


// Load ISO files from the website
function loadISOs() {
  const select = document.getElementById('iso-select');
  const refreshBtn = document.getElementById('refresh-iso-btn');
  
  // Show loading state
  select.innerHTML = '<option value="">Loading available ISOs...</option>';
  refreshBtn.disabled = true;
  updateStatus('Loading ISO list...', 'loading');
  appendToConsole('Loading ISO list...'); // Send to in-app console
  
  ipcRenderer.invoke('get-iso-links').then((links) => {
    select.innerHTML = '';
    
    if (links.length === 0 || (links.length === 1 && links[0].url === '')) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = links[0]?.label || 'No ISOs found';
      select.appendChild(option);
      updateStatus('Failed to load ISO list', 'error');
    } else {
      // Add default option
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Choose an ISO image...';
      select.appendChild(defaultOption);
      
      // Add ISO options
      links.forEach(({ label, url }) => {
        if (url) { // Only add valid URLs
          const option = document.createElement('option');
          option.value = url;
          option.textContent = label;
          select.appendChild(option);
        }
      });
      
      updateStatus(`Found ${links.filter(l => l.url).length} ISO images`, 'success');
    }
    refreshBtn.disabled = false;
    updateFlashButtonState();
  }).catch(error => {
    console.error('Error loading ISOs:', error);
    updateStatus(`Error loading ISOs: ${error.message}`, 'error');
    refreshBtn.disabled = false;
    updateFlashButtonState();
  });
}

// Load USB devices
function loadUSBDevices() {
  const select = document.getElementById('usb-select');
  const refreshBtn = document.getElementById('refresh-usb-btn');

  select.innerHTML = '<option value="">Searching for USB devices...</option>';
  refreshBtn.disabled = true;
  updateStatus('Searching for USB devices...', 'loading');
  appendToConsole('Searching for USB devices...'); // Send to in-app console

  ipcRenderer.invoke('get-usb-devices').then((devices) => {
    select.innerHTML = ''; // Clear existing options
    if (devices.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No USB devices found';
      select.appendChild(option);
      updateStatus('No USB devices found', 'error');
    } else {
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Choose a USB drive...';
      select.appendChild(defaultOption);

      devices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.path;
        option.textContent = `${device.label} (${device.size})`;
        select.appendChild(option);
      });
      updateStatus(`Found ${devices.length} USB devices`, 'success');
    }
    refreshBtn.disabled = false;
    updateFlashButtonState();
  }).catch(error => {
    console.error('Error loading USB devices:', error);
    updateStatus(`Error loading USB devices: ${error.message}`, 'error');
    refreshBtn.disabled = false;
    updateFlashButtonState();
  });
}


// Update flash button state based on selections
function updateFlashButtonState() {
  const isoSelected = document.getElementById('iso-select').value !== '';
  const usbSelected = document.getElementById('usb-select').value !== '';
  const flashBtn = document.getElementById('flash-btn');
  
  flashBtn.disabled = !(isoSelected && usbSelected) || isFlashing;
}

// Handle flash process
function flashISO() {
  const isoUrl = document.getElementById('iso-select').value;
  const usbPath = document.getElementById('usb-select').value;
  
  if (!isoUrl || !usbPath) {
    updateStatus('Please select both an ISO image and a USB drive.', 'error');
    appendToConsole('ERROR: Please select both an ISO image and a USB drive.');
    return;
  }

  const userConfirmed = confirm(`WARNING: All data on ${usbPath} will be erased. Are you sure you want to proceed?`);
  if (!userConfirmed) {
    updateStatus('Flash cancelled by user.', 'error');
    appendToConsole('Flash cancelled by user.');
    return;
  }

  isFlashing = true;
  document.getElementById('iso-select').disabled = true;
  document.getElementById('usb-select').disabled = true;
  document.getElementById('refresh-iso-btn').disabled = true;
  document.getElementById('refresh-usb-btn').disabled = true;
  updateFlashButtonState(); // Disable flash button

  clearConsole(); // Clear console on new flash attempt
  if (!consoleVisible) {
      toggleConsoleBtn.click(); // Automatically show console if not visible
  }
  appendToConsole(`Starting flash process for ISO: ${isoUrl} to USB: ${usbPath}\n`);
  updateStatus('Starting flash process...', 'loading');
  updateProgress(0); // Reset progress bar fill

  ipcRenderer.invoke('flash-iso', { isoUrl, usbPath }).then((result) => {
    if (result.success) {
      updateStatus('✅ Flash completed successfully!', 'success');
      updateProgress(100); // Set to 100% on success before hiding
      appendToConsole('\n--- Flash completed successfully! ---');
      appendToConsole('\nThank you for using the AcreetionOS USB Flasher tool!');
      appendToConsole('You can now safely remove your USB drive.');
      appendToConsole('To install AcreetionOS, please reboot your computer and go to your BIOS/UEFI boot menu (often F2, F10, F12, or Del during startup) to select the USB drive.');
      appendToConsole('Happy installing!\n');
    } else {
      updateStatus(`❌ Flash failed: ${result.message}`, 'error');
      updateProgress(0);
      appendToConsole(`\n--- ERROR: Flash failed: ${result.message} ---`);
    }
  }).catch((error) => {
    console.error('Flash error:', error);
    updateStatus(`❌ Flash error: ${error.message}`, 'error');
    updateProgress(0);
    appendToConsole(`\n--- CRITICAL ERROR during flash: ${error.message} ---`);
  }).finally(() => {
    // Re-enable controls
    isFlashing = false;
    document.getElementById('iso-select').disabled = false;
    document.getElementById('usb-select').disabled = false;
    document.getElementById('refresh-iso-btn').disabled = false;
    document.getElementById('refresh-usb-btn').disabled = false;
    updateFlashButtonState();
    
    // Clear status and reset progress bar after a short delay
    setTimeout(() => {
        updateStatus('Ready to flash.');
        updateProgress(0); // Ensure bar is fully reset/hidden after delay
    }, 5000); 
  });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Refresh buttons
  document.getElementById('refresh-iso-btn').addEventListener('click', loadISOs);
  document.getElementById('refresh-usb-btn').addEventListener('click', loadUSBDevices);
  
  // Flash button
  document.getElementById('flash-btn').addEventListener('click', flashISO);
  
  // Selection change handlers
  document.getElementById('iso-select').addEventListener('change', updateFlashButtonState);
  document.getElementById('usb-select').addEventListener('change', updateFlashButtonState);

  // Toggle Console button
  toggleConsoleBtn.addEventListener('click', () => {
      consoleVisible = !consoleVisible;
      flashConsoleOutput.style.display = consoleVisible ? 'block' : 'none';
      if (consoleVisible) {
          flashConsoleOutput.scrollTop = flashConsoleOutput.scrollHeight; // Scroll to bottom when shown
      }
      toggleConsoleBtn.textContent = consoleVisible ? 'Hide Console Output' : 'Show Console Output';
  });

  // Initial loads
  loadISOs();
  loadUSBDevices();
});

// IPC event listeners for status and progress
ipcRenderer.on('flash-status', (event, message, type) => {
  updateStatus(message, type);
});

ipcRenderer.on('flash-progress', (event, progress) => {
  updateProgress(progress);
});

// IPC listener for raw console output from main process
ipcRenderer.on('flash-console-output', (event, data) => {
    appendToConsole(data);
});

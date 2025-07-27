const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const https = require('https');
const http = require('http');
const cheerio = require('cheerio');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const os = require('os');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 650,
    height: 700,
    title: "AcreetionOS USB Flashing Utility",
    icon: path.join(__dirname, 'assets/icon.png'), // Add an icon if you have one
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false
    },
    show: false // Don't show until ready
  });

  mainWindow.loadFile('index.html');
  
  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Helper function to make HTTP/HTTPS requests with better error handling
function makeRequest(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      
      // Handle redirects (up to 5 redirects)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        req.destroy();
        return makeRequest(res.headers.location, timeout).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        req.destroy();
        return reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
      }
      
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
    
    req.on('error', reject);
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error(`Request timeout (${timeout}ms)`));
    });
  });
}

// Helper function to download a file with progress
function downloadFile(url, savePath, onProgress) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const writer = fs.createWriteStream(savePath);
    
    const req = protocol.get(url, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        writer.destroy();
        fs.unlink(savePath, () => {}); // Clean up partial file
        return downloadFile(res.headers.location, savePath, onProgress).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        writer.destroy();
        fs.unlink(savePath, () => {});
        return reject(new Error(`Download failed: HTTP ${res.statusCode}`));
      }
      
      const totalSize = parseInt(res.headers['content-length'], 10);
      let downloadedSize = 0;
      
      res.on('data', (chunk) => {
        downloadedSize += chunk.length;
        writer.write(chunk);
        
        if (totalSize > 0 && onProgress) {
          const progress = Math.round((downloadedSize / totalSize) * 100);
          onProgress(progress);
        }
      });
      
      res.on('end', () => {
        writer.end();
        resolve(savePath);
      });
      
      res.on('error', (err) => {
        writer.destroy();
        fs.unlink(savePath, () => {});
        reject(err);
      });
    });
    
    req.on('error', (err) => {
      writer.destroy();
      fs.unlink(savePath, () => {});
      reject(err);
    });
    
    writer.on('error', (err) => {
      req.destroy();
      fs.unlink(savePath, () => {});
      reject(err);
    });
  });
}

// Get ISO download links from AcreetionOS website
async function getISOLinks() {
  try {
    // Also send this to the in-app console
    mainWindow.webContents.send('flash-console-output', 'Fetching ISO links from acreetionos.org...');
    console.log('Fetching ISO links from acreetionos.org...');
    
    const downloadPageUrl = 'https://acreetionos.org/'; 
    
    // Send initial loading status for ISOs
    mainWindow.webContents.send('flash-status', 'Loading ISO list...', 'loading');

    const html = await makeRequest(downloadPageUrl);
    const $ = cheerio.load(html);
    const links = [];
    
    $('a[href$=".iso"]').each((i, elem) => {
      const $elem = $(elem);
      const href = $elem.attr('href');
      let text = $elem.text().trim();
      
      if (href) {
        const fullUrl = new URL(href, downloadPageUrl).href;

        if (!text || text.includes('.iso')) {
          const parentText = $elem.parent().text().trim();
          if (parentText && parentText.length > text.length) {
            text = parentText.split('\n')[0].trim();
          } else {
            text = fullUrl.substring(fullUrl.lastIndexOf('/') + 1);
          }
        }
        
        links.push({
          label: text,
          url: fullUrl
        });
      }
    });

    if (links.length === 0) {
      mainWindow.webContents.send('flash-status', 'Failed to load ISO list (No ISOs found)', 'error');
      mainWindow.webContents.send('flash-console-output', 'ERROR: No ISOs found on acreetionos.org.');
      return [{
        label: 'No ISOs found on acreetionos.org',
        url: ''
      }];
    }
    
    mainWindow.webContents.send('flash-status', `Found ${links.filter(l => l.url).length} ISO images`, 'success');
    mainWindow.webContents.send('flash-console-output', `SUCCESS: Found ${links.filter(l => l.url).length} ISO images.`);
    return links;
    
  } catch (error) {
    console.error('Error fetching ISO links:', error);
    mainWindow.webContents.send('flash-status', `Error loading ISOs: ${error.message}`, 'error');
    mainWindow.webContents.send('flash-console-output', `ERROR: Error loading ISOs: ${error.message}`);
    return [{
      label: 'Error loading ISOs - Check your internet connection or URL',
      url: ''
    }];
  }
}

// Get USB devices based on the operating system
async function getUSBDevices() {
  return new Promise((resolve) => {
    const platform = os.platform();
    let command;
    
    if (platform === 'linux') {
      command = 'lsblk -d -o NAME,SIZE,MODEL,TYPE | grep disk | grep -v "loop"';
    } else if (platform === 'darwin') { // macOS
      command = 'diskutil list external physical | grep -E "(disk[0-9]+)"';
    } else if (platform === 'win32') { // Windows
      // For Windows, we need to list physical drives, not just logical disks.
      // 'wmic diskdrive get Caption,DeviceID,Size' lists physical drives.
      // We need DeviceID like '\\.\PHYSICALDRIVE1' for Rufus.
      command = 'wmic diskdrive get Caption,DeviceID,Size /format:list';
    } else {
      mainWindow.webContents.send('flash-console-output', `ERROR: Unsupported operating system: ${platform}`);
      resolve([]);
      return;
    }
    
    mainWindow.webContents.send('flash-console-output', `Executing command to list USB devices: ${command}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error getting USB devices:', error);
        mainWindow.webContents.send('flash-console-output', `ERROR listing USB devices: ${error.message}`);
        resolve([]);
        return;
      }
      
      const devices = [];
      const lines = stdout.split('\n').filter(line => line.trim());
      
      if (platform === 'linux') {
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 2) { 
            const name = parts[0];
            const size = parts[1];
            const model = parts.slice(2, parts.length -1).join(' ') || 'Unknown Device';
            
            devices.push({
              path: `/dev/${name}`,
              label: `${model.replace('disk', '').trim()} (${name})`,
              size: size
            });
          }
        });
      } else if (platform === 'darwin') {
        lines.forEach(line => {
          const diskMatch = line.match(/\/dev\/(disk\d+)/);
          const sizeMatch = line.match(/(\d+\.?\d*\s[BKMGTPEZY]i?B)/);
          
          if (diskMatch) {
            const diskPath = `/dev/${diskMatch[1]}`;
            const size = sizeMatch ? sizeMatch[1] : 'Unknown Size';
            
            let label = `External Disk (${diskMatch[1]})`;
            const descriptionMatch = line.match(/(.*) \(external, physical\)/);
            if (descriptionMatch && descriptionMatch[1]) {
              label = descriptionMatch[1].trim();
              label = label.replace(new RegExp(`\\s*${diskMatch[1]}$`), '').trim();
            }

            devices.push({
              path: diskPath,
              label: `${label} - ${size}`,
              size: size
            });
          }
        });
      } else if (platform === 'win32') {
        let currentDevice = {};
        lines.forEach(line => {
          if (line.startsWith('Caption=')) {
            currentDevice.Caption = line.substring('Caption='.length).trim();
          } else if (line.startsWith('DeviceID=')) {
            currentDevice.DeviceID = line.substring('DeviceID='.length).trim();
          } else if (line.startsWith('Size=')) {
            const sizeInBytes = parseInt(line.substring('Size='.length).trim());
            let displaySize = 'Unknown Size';
            if (!isNaN(sizeInBytes)) {
              const gb = sizeInBytes / (1024 * 1024 * 1024);
              if (gb < 1) {
                displaySize = `${Math.round(sizeInBytes / (1024 * 1024))}MB`;
              } else {
                displaySize = `${gb.toFixed(1)}GB`;
              }
            }
            currentDevice.Size = displaySize;

            // Once we have all three, add to devices and reset
            if (currentDevice.DeviceID && currentDevice.Caption && currentDevice.Size) {
              // Filter out non-removable drives if possible, though WMIC doesn't make it easy
              // For simplicity, we'll include all diskdrives and let the user choose carefully.
              // Rufus typically uses DeviceID like \\.\PHYSICALDRIVE1
              devices.push({
                path: currentDevice.DeviceID, // e.g., \\.\PHYSICALDRIVE1
                label: `${currentDevice.Caption} (${currentDevice.DeviceID})`,
                size: currentDevice.Size
              });
              currentDevice = {}; // Reset for next device
            }
          }
        });
      }
      mainWindow.webContents.send('flash-console-output', `Found ${devices.length} USB devices.`);
      resolve(devices);
    });
  });
}

// Flash ISO to USB device
async function flashISO(isoUrl, usbPath) {
  try {
    const tempDir = path.join(os.tmpdir(), 'acreetionos-flasher');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      mainWindow.webContents.send('flash-console-output', `Created temporary directory: ${tempDir}`);
    } else {
      mainWindow.webContents.send('flash-console-output', `Using temporary directory: ${tempDir}`);
    }
    
    const urlParts = isoUrl.split('/');
    const filename = urlParts[urlParts.length - 1] || 'download.iso';
    const isoPath = path.join(tempDir, filename);
    
    mainWindow.webContents.send('flash-status', 'Downloading ISO...', 'loading');
    mainWindow.webContents.send('flash-console-output', `Downloading ISO from ${isoUrl} to ${isoPath}...`);
    
    await downloadFile(isoUrl, isoPath, (progress) => {
      mainWindow.webContents.send('flash-progress', progress);
      mainWindow.webContents.send('flash-status', `Downloading ISO... ${progress}%`, 'loading');
      // No need to send console output for every percent, as it would be too verbose
    });
    
    mainWindow.webContents.send('flash-status', 'Starting flash process...', 'loading');
    mainWindow.webContents.send('flash-console-output', `ISO download complete. Starting flash process to ${usbPath}.`);
    mainWindow.webContents.send('flash-progress', 0); // Initialize flash progress at 0%
    
    const platform = os.platform();
    let flashCommand;
    
    if (platform === 'linux' || platform === 'darwin') {
      flashCommand = `pkexec dd if="${isoPath}" of="${usbPath}" bs=4M status=progress oflag=sync`;
      
      mainWindow.webContents.send('flash-console-output', `Executing flash command: \n${flashCommand}`);
      console.log(`Executing flash command: ${flashCommand}`);
      
      return new Promise((resolve, reject) => {
        mainWindow.webContents.send('flash-status', 'Flashing to USB drive...', 'loading');

        const flashProcess = exec(flashCommand, { shell: '/bin/bash' }, (error, stdout, stderr) => {
              if (error) {
                  console.error('Flash error (dd exec):', error);
                  mainWindow.webContents.send('flash-console-output', `ERROR: Flash failed: ${error.message}`);
                  reject(new Error(`Flash failed: ${error.message}`));
              } else {
                  console.log('dd stdout:', stdout);
                  mainWindow.webContents.send('flash-console-output', `DD STDOUT:\n${stdout}`);
                  console.log('dd stderr (final):', stderr);
                  mainWindow.webContents.send('flash-console-output', `DD STDERR (final):\n${stderr}`);
                  resolve({ success: true, message: 'Flash completed successfully!' });
              }
              fs.unlink(isoPath, (err) => {
                  if (err) {
                    console.error(`Failed to delete temporary ISO file at ${isoPath}:`, err);
                    mainWindow.webContents.send('flash-console-output', `WARNING: Failed to delete temporary ISO file at ${isoPath}: ${err.message}`);
                  }
                  else {
                    console.log(`Temporary ISO file deleted: ${isoPath}`);
                    mainWindow.webContents.send('flash-console-output', `Temporary ISO file deleted: ${isoPath}`);
                  }
              });
          });

          flashProcess.stderr.on('data', (data) => {
              const output = data.toString();
              mainWindow.webContents.send('flash-console-output', output);
              console.log('dd stderr (raw):', output.trim());

              const progressMatch = output.match(/(\d+(?:\.\d+)?)\s(B|K|M|G|T)B\/s.*?(\d+)\%|\d+\sbytes\stransferred.*?(\d+)\%/);
              if (progressMatch) {
                  let progress = 0;
                  if (progressMatch[3]) {
                      progress = parseInt(progressMatch[3]);
                  } else if (progressMatch[4]) {
                      progress = parseInt(progressMatch[4]);
                  }
                  
                  mainWindow.webContents.send('flash-progress', progress);
                  mainWindow.webContents.send('flash-status', `Flashing... ${progress}%`, 'loading');
              } else {
                  if (output.includes('bytes transferred')) {
                      mainWindow.webContents.send('flash-status', 'Flashing... (transferring data)', 'loading');
                  }
              }
          });
          
          flashProcess.stdout.on('data', (data) => {
              const output = data.toString();
              mainWindow.webContents.send('flash-console-output', `DD STDOUT:\n${output}`);
              console.log('dd stdout (raw):', output.trim());
          });


        flashProcess.on('error', (error) => {
          console.error('Flash process spawn error:', error);
          mainWindow.webContents.send('flash-console-output', `ERROR: Flash process spawn error: ${error.message}`);
          fs.unlink(isoPath, (err) => { if (err) console.error(`Failed to delete ISO after spawn error:`, err); });
          reject(error);
        });
        
        flashProcess.on('close', (code) => {
            if (code !== 0 && code !== null) {
                console.error(`Flash process exited with code ${code}`);
                mainWindow.webContents.send('flash-console-output', `ERROR: Flash process exited with code ${code}`);
                fs.unlink(isoPath, (err) => { if (err) console.error(`Failed to delete ISO after close error:`, err); });
                reject(new Error(`Flash process failed with exit code ${code}`));
            } else {
                mainWindow.webContents.send('flash-console-output', `Flash process completed with exit code ${code}.`);
            }
        });
      });
    } else if (platform === 'win32') {
      // --- Windows Flashing via Rufus ---
      const rufusDownloadUrl = 'https://github.com/pbatard/rufus/releases/download/v4.5/rufus-4.5p.exe'; // Specific portable version
      const rufusExeName = 'rufus-4.5p.exe';
      const rufusPath = path.join(tempDir, rufusExeName); // Store Rufus in the same temp directory as ISO

      mainWindow.webContents.send('flash-console-output', 'On Windows, direct low-level disk flashing requires specialized tools and administrative privileges.');
      mainWindow.webContents.send('flash-console-output', 'To ensure reliability and safety, this utility will use Rufus, a trusted third-party tool, to perform the actual flashing.');
      mainWindow.webContents.send('flash-console-output', `Attempting to use or download Rufus from: ${rufusDownloadUrl}`);

      if (!fs.existsSync(rufusPath)) {
        mainWindow.webContents.send('flash-status', 'Downloading Rufus...', 'loading');
        mainWindow.webContents.send('flash-console-output', `Rufus not found locally. Downloading Rufus to ${rufusPath}...`);
        try {
          await downloadFile(rufusDownloadUrl, rufusPath, (progress) => {
            mainWindow.webContents.send('flash-progress', progress);
            mainWindow.webContents.send('flash-status', `Downloading Rufus... ${progress}%`, 'loading');
          });
          mainWindow.webContents.send('flash-console-output', 'Rufus download complete.');
        } catch (downloadError) {
          const errorMessage = `Failed to download Rufus: ${downloadError.message}. Please ensure you have an internet connection.`;
          mainWindow.webContents.send('flash-console-output', `ERROR: ${errorMessage}`);
          // Provide a way to open the download link
          shell.openExternal(rufusDownloadUrl);
          throw new Error(errorMessage);
        }
      } else {
        mainWindow.webContents.send('flash-console-output', `Rufus already found at ${rufusPath}. Skipping download.`);
      }

      // Rufus CLI arguments:
      // --iso <path_to_iso>
      // --target <disk_device_id> (e.g., \\.\PHYSICALDRIVE1)
      // --force (force write, bypass warnings)
      // --wait (wait for completion)
      // --log (output log to console)
      // Note: Rufus 4.x command line interface for progress is not as robust as dd's.
      // We'll capture its stdout/stderr and look for keywords.
      flashCommand = `"${rufusPath}" --iso "${isoPath}" --target "${usbPath}" --force --wait --log`;
      
      mainWindow.webContents.send('flash-console-output', 'IMPORTANT: Rufus will likely prompt for Administrator privileges. Please grant them for the flashing to proceed.');
      mainWindow.webContents.send('flash-console-output', `Executing Rufus command: \n${flashCommand}`);
      console.log(`Executing Rufus command: ${flashCommand}`);
      
      return new Promise((resolve, reject) => {
        mainWindow.webContents.send('flash-status', 'Flashing to USB drive (via Rufus)...', 'loading');

        const flashProcess = exec(flashCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Flash error (Rufus exec):', error);
                mainWindow.webContents.send('flash-console-output', `ERROR: Rufus failed: ${error.message}`);
                reject(new Error(`Rufus failed: ${error.message}`));
            } else {
                console.log('Rufus stdout:', stdout);
                mainWindow.webContents.send('flash-console-output', `RUFUS STDOUT:\n${stdout}`);
                console.log('Rufus stderr:', stderr); // Rufus often logs progress/errors to stderr
                mainWindow.webContents.send('flash-console-output', `RUFUS STDERR:\n${stderr}`);
                resolve({ success: true, message: 'Flash completed successfully (via Rufus)!' });
            }
            fs.unlink(isoPath, (err) => {
                if (err) {
                  console.error(`Failed to delete temporary ISO file at ${isoPath}:`, err);
                  mainWindow.webContents.send('flash-console-output', `WARNING: Failed to delete temporary ISO file at ${isoPath}: ${err.message}`);
                }
                else {
                  console.log(`Temporary ISO file deleted: ${isoPath}`);
                  mainWindow.webContents.send('flash-console-output', `Temporary ISO file deleted: ${isoPath}`);
                }
            });
            // Also attempt to delete Rufus executable after use
            fs.unlink(rufusPath, (err) => {
                if (err) {
                    console.error(`Failed to delete Rufus executable at ${rufusPath}:`, err);
                    mainWindow.webContents.send('flash-console-output', `WARNING: Failed to delete Rufus executable at ${rufusPath}: ${err.message}`);
                } else {
                    console.log(`Rufus executable deleted: ${rufusPath}`);
                    mainWindow.webContents.send('flash-console-output', `Rufus executable deleted: ${rufusPath}`);
                }
            });
        });

        // Rufus typically outputs progress to stdout or stderr. We'll capture both.
        // Parsing Rufus progress from CLI can be tricky and may not provide a smooth 0-100%.
        // We'll look for key phrases or percentages.
        flashProcess.stdout.on('data', (data) => {
            const output = data.toString();
            mainWindow.webContents.send('flash-console-output', output);
            console.log('Rufus stdout (raw):', output.trim());
            // Basic attempt to parse percentage from Rufus stdout
            const progressMatch = output.match(/(\d+)\%/);
            if (progressMatch) {
                const progress = parseInt(progressMatch[1]);
                mainWindow.webContents.send('flash-progress', progress);
                mainWindow.webContents.send('flash-status', `Flashing... ${progress}%`, 'loading');
            } else if (output.includes('bytes written')) {
                mainWindow.webContents.send('flash-status', 'Flashing... (writing data)', 'loading');
            } else if (output.includes('Creating file system')) {
                mainWindow.webContents.send('flash-status', 'Flashing... (creating file system)', 'loading');
            } else if (output.includes('Done')) {
                // Rufus might output "Done" before 100% progress, so ensure 100% is sent
                mainWindow.webContents.send('flash-progress', 100);
                mainWindow.webContents.send('flash-status', 'Flashing... (finalizing)', 'loading');
            }
        });

        flashProcess.stderr.on('data', (data) => {
            const output = data.toString();
            mainWindow.webContents.send('flash-console-output', output);
            console.log('Rufus stderr (raw):', output.trim());
            // Also check stderr for progress/status messages
            const progressMatch = output.match(/(\d+)\%/);
            if (progressMatch) {
                const progress = parseInt(progressMatch[1]);
                mainWindow.webContents.send('flash-progress', progress);
                mainWindow.webContents.send('flash-status', `Flashing... ${progress}%`, 'loading');
            }
        });

        flashProcess.on('error', (error) => {
          console.error('Rufus process spawn error:', error);
          mainWindow.webContents.send('flash-console-output', `ERROR: Rufus process spawn error: ${error.message}`);
          fs.unlink(isoPath, (err) => { if (err) console.error(`Failed to delete ISO after spawn error:`, err); });
          fs.unlink(rufusPath, (err) => { if (err) console.error(`Failed to delete Rufus after spawn error:`, err); });
          reject(error);
        });
        
        flashProcess.on('close', (code) => {
            if (code !== 0 && code !== null) {
                console.error(`Rufus process exited with code ${code}`);
                mainWindow.webContents.send('flash-console-output', `ERROR: Rufus process exited with code ${code}. Check Rufus output above for details.`);
                fs.unlink(isoPath, (err) => { if (err) console.error(`Failed to delete ISO after close error:`, err); });
                fs.unlink(rufusPath, (err) => { if (err) console.error(`Failed to delete Rufus after close error:`, err); });
                reject(new Error(`Rufus process failed with exit code ${code}`));
            } else {
                mainWindow.webContents.send('flash-console-output', `Rufus process completed successfully with exit code ${code}.`);
            }
        });
      });
      // --- End Windows Flashing via Rufus ---
    } else {
      const errorMessage = 'Unsupported operating system for direct flashing.';
      mainWindow.webContents.send('flash-console-output', `ERROR: ${errorMessage}`);
      throw new Error(errorMessage);
    }
    
  } catch (error) {
    console.error('Flash process error:', error);
    mainWindow.webContents.send('flash-console-output', `CRITICAL ERROR: ${error.message}`);
    throw error;
  }
}

// IPC handlers
ipcMain.handle('get-iso-links', async () => {
  return await getISOLinks();
});

ipcMain.handle('get-usb-devices', async () => {
  return await getUSBDevices();
});

ipcMain.handle('flash-iso', async (event, { isoUrl, usbPath }) => {
  try {
    return await flashISO(isoUrl, usbPath);
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// App event handlers
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app startup
app.on('ready', () => {
  console.log('AcreetionOS USB Flasher started');
  // Send initial message to the in-app console
  if (mainWindow) {
    mainWindow.webContents.send('flash-console-output', 'AcreetionOS USB Flasher started.');
    mainWindow.webContents.send('flash-console-output', `Running on ${os.platform()} ${os.arch()} (Node ${process.versions.node}, Electron ${process.versions.electron})`);
  }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

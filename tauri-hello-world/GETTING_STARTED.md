# 🚀 Quick Start Guide

## Running the Application

### Option 1: Using the Setup Script
```bash
cd tauri-hello-world
chmod +x setup.sh
./setup.sh
cargo tauri dev
```

### Option 2: Manual Setup
```bash
cd tauri-hello-world

# Install Tauri CLI if not already installed
cargo install tauri-cli

# Build dependencies
cd src-tauri
cargo build
cd ..

# Run the application
cargo tauri dev
```

## What You'll See

The application demonstrates:

1. **Personal Greeting** - Enter your name and get a personalized welcome message
2. **System Information** - View OS, architecture, version, and hostname
3. **Counter Demo** - Interactive counter with increment, get, and reset functions
4. **Current Time** - Get real-time timestamp from the Rust backend
5. **Mock USB Devices** - Preview of USB device enumeration for flasher context

## Keyboard Shortcuts

- `Ctrl/Cmd + R` - Refresh timestamp
- `Ctrl/Cmd + D` - Scan USB devices  
- `Ctrl/Cmd + I` - Get system info
- `Enter` in name field - Trigger greeting

## Building for Production

```bash
cargo tauri build
```

The built application will be in:
- `src-tauri/target/release/bundle/macos/AcreetionOS Hello World.app`
- `src-tauri/target/release/bundle/dmg/AcreetionOS Hello World_0.1.0_x64.dmg`

## Next Steps

This proof-of-concept demonstrates the foundation for migrating your USB Flasher to Tauri. The next phase would involve:

1. Replacing mock USB devices with real `serialport` crate integration
2. Adding file picker for firmware selection
3. Implementing actual flashing logic with progress tracking
4. Adding checksum verification and error handling

---

**Ready to explore the future of AcreetionOS tooling with Rust + Tauri!** 🎛️
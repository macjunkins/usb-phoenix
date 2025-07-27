# 🎛 AcreetionOS Hello World - Tauri Proof-of-Concept

A simple Tauri application demonstrating Rust backend + HTML/CSS/JS frontend integration as a proof-of-concept for the future AcreetionOS USB Flasher rewrite.

## 🎯 Purpose

This application serves as a proof-of-concept for migrating the AcreetionOS USB Flasher from Electron to Tauri + Rust, demonstrating:

- **Rust backend** with Tauri commands
- **Clean HTML/CSS/JS frontend** with professional styling
- **Frontend-backend communication** patterns
- **System information access** capabilities
- **Mock USB device detection** (preview of flasher functionality)
- **State management** between frontend and backend
- **macOS-optimized** configuration and build process

## 🚀 Features

### Core Demonstrations
- **Personal Greeting**: Basic string processing and response
- **System Information**: OS, architecture, version, and hostname detection
- **Counter Demo**: Stateful operations with increment/get/reset functionality
- **Timestamp**: Real-time data retrieval from backend
- **Mock USB Devices**: Preview of USB device enumeration for flasher context

### Technical Features
- **Native Performance**: Rust backend for system operations
- **Modern UI**: Clean, responsive design with gradient styling
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + R`: Refresh timestamp
  - `Ctrl/Cmd + D`: Scan USB devices
  - `Ctrl/Cmd + I`: Get system info
- **Error Handling**: Comprehensive error display and user feedback
- **Loading States**: Visual feedback during async operations

## 📋 Prerequisites

Before running this application, ensure you have:

### Required Tools
- **Rust** (latest stable version)
  ```bash
  curl https://sh.rustup.rs -sSf | sh
  source $HOME/.cargo/env
  ```

- **Node.js** (for Tauri frontend tooling)
  ```bash
  brew install node  # macOS
  ```

- **Tauri CLI**
  ```bash
  cargo install tauri-cli
  ```

### System Requirements
- **macOS**: 10.15+ (Catalina or later)
- **Architecture**: Intel or Apple Silicon (M1/M2)
- **Memory**: 4GB RAM minimum
- **Storage**: 500MB free space for development

## 🛠 Development Setup

### 1. Clone and Navigate
```bash
cd tauri-hello-world
```

### 2. Install Dependencies
```bash
# Install Rust dependencies (from src-tauri directory)
cd src-tauri
cargo build
cd ..
```

### 3. Run Development Server
```bash
# From the project root
cargo tauri dev
```

This will:
- Compile the Rust backend
- Launch the Tauri window with hot-reload
- Open the application with developer tools available

### 4. Development Workflow
- **Backend changes**: Edit files in `src-tauri/src/` - requires restart
- **Frontend changes**: Edit files in `src/` - hot-reloads automatically
- **Configuration**: Modify `src-tauri/tauri.conf.json` - requires restart

## 📦 Building for Production

### Create Release Build
```bash
cargo tauri build
```

This generates:
- **macOS App Bundle**: `src-tauri/target/release/bundle/macos/AcreetionOS Hello World.app`
- **DMG Installer**: `src-tauri/target/release/bundle/dmg/AcreetionOS Hello World_0.1.0_x64.dmg`

### Build Outputs
```
src-tauri/target/release/bundle/
├── macos/
│   └── AcreetionOS Hello World.app    # Native macOS application
└── dmg/
    └── AcreetionOS Hello World_0.1.0_x64.dmg    # Installer package
```

## 🏗 Project Structure

```
tauri-hello-world/
├── src/                           # Frontend files
│   ├── index.html                 # Main HTML interface
│   ├── style.css                  # Professional styling
│   └── script.js                  # Frontend logic & Tauri API calls
├── src-tauri/                     # Rust backend
│   ├── src/
│   │   └── main.rs                # Tauri commands and app logic
│   ├── Cargo.toml                 # Rust dependencies
│   ├── tauri.conf.json            # Tauri configuration
│   └── build.rs                   # Build script
└── README.md                      # This documentation
```

## 🔧 Configuration

### Key Configuration Files

#### `src-tauri/tauri.conf.json`
- **Window settings**: Size, title, decorations
- **Security settings**: CSP, allowlist permissions
- **Bundle configuration**: App identifier, icons
- **Build settings**: Development and production paths

#### `src-tauri/Cargo.toml`
- **Dependencies**: Tauri, serde, chrono, whoami
- **Features**: API permissions and custom protocol
- **Metadata**: App name, version, description

## 🧪 Testing the Application

### Manual Testing Checklist
- [ ] Application launches without errors
- [ ] All buttons respond and show results
- [ ] System information displays correctly
- [ ] Counter maintains state across operations
- [ ] USB device mock data displays properly
- [ ] Keyboard shortcuts work as expected
- [ ] Window resizing works smoothly
- [ ] Error states display appropriately

### Performance Testing
- [ ] Application starts quickly (< 3 seconds)
- [ ] UI interactions are responsive
- [ ] Memory usage remains stable
- [ ] CPU usage is minimal when idle

## 🔍 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear build cache
cargo clean
cd src-tauri && cargo clean && cd ..

# Rebuild
cargo tauri build
```

#### Permission Issues
```bash
# Ensure Tauri CLI is up to date
cargo install tauri-cli --force
```

#### macOS Gatekeeper Warnings
- The built app may show security warnings on first run
- Right-click the app and select "Open" to bypass
- For distribution, code signing would be required

### Debug Mode
```bash
# Run with debug output
RUST_LOG=debug cargo tauri dev
```

## 🚀 Next Steps for USB Flasher Integration

This proof-of-concept demonstrates the foundation for migrating the USB Flasher to Tauri. Future development would include:

### Phase 1: Core USB Functionality
- Replace mock USB devices with real `serialport` crate integration
- Add file picker for firmware selection
- Implement actual flashing logic with progress tracking

### Phase 2: Advanced Features
- Checksum verification for firmware files
- Device-specific flashing protocols
- Error recovery and retry mechanisms

### Phase 3: Production Polish
- Code signing for macOS distribution
- Automated testing and CI/CD integration
- User documentation and help system

## 📜 License

This proof-of-concept is part of the AcreetionOS USB Flasher project and is licensed under the MIT License.

## 🤝 Contributing

This is a proof-of-concept for the larger AcreetionOS project. For contributions to the main USB Flasher project, see the main repository.

---

**Built with ❤️ for AcreetionOS • Tauri + Rust**
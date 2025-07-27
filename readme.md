# 🎛 AcreetionOS USB Flasher - Project "Phoenix"

## 🧭 What This Is

A production-ready USB flasher specifically for AcreetionOS, built to provide a trustworthy and polished installation experience. This project represents my commitment to making Linux installation accessible and reliable in support of the AcreetionOS Team.

**Current Status:** I'm hardening and polishing an existing Electron-based flasher to create a solid MVP that can be confidently recommended to users.

## 🎯 Why I'm Building This

AcreetionOS deserves a USB flasher that:

* **Protects users** from common flashing mistakes
* **Looks and feels trustworthy** to new Linux users
* **Can evolve** into a broader tool for the Linux community
* **Supports the team's growth** as they attract contributors, donors, and sponsors

This isn't just about flashing ISOs — it's about creating a professional first impression for the AcreetionOS operating system.

## 🏗 Current Focus: MVP Development

### What I'm Building Now

A production-ready version of the Acreetion Media Creator that focuses on **AcreetionOS only**, with:

* **Security**: Safe disk selection, proper permission handling, checksum verification
* **Polish**: Clean, professional UI that's beginner-friendly
* **Focus**: Single-purpose tool for AcreetionOS ISOs

### Key Features

| Area | What I'm Delivering |
|------|----------------------|
| **Image Handling** | Auto-detect latest AcreetionOS ISO; manual selection as fallback |
| **Drive Detection** | Show drive labels/capacity; exclude internal/system disks by default |
| **Checksum Verification** | Auto-verify SHA256 and display results before flashing |
| **Flash Process** | Simple progress bar with logs and clear error messages |
| **Final Screen** | Success state with reboot instructions and support links |
| **Packaging** | Native installers for Windows/macOS/Linux with proper signing |

## 🛠 Getting Started

### Prerequisites

* Node.js 16+ and npm
* Git
* Basic familiarity with command line

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone [repository URL]
   cd usb-phoenix
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development version:**
   ```bash
   npm start
   ```

### Building for Distribution

```bash
npm run build
```

This creates platform-specific installers in the `release/` directory.

## 📈 Development Status

### ✅ Completed
* Basic Electron app structure
* Initial UI framework
* Core flashing functionality

### 🔄 In Progress
* Security hardening and IPC improvements
* UI polish and user experience enhancements
* Build system and packaging setup

### 📋 Known Issues
* Security audit in progress — expect some temporary instability
* UI needs polish for production use
* Build system requires final configuration

## 🗺 Roadmap

### Phase 1: MVP Polish (Current)
**Goal:** Ship a production-ready AcreetionOS flasher

* Security hardening and IPC best practices
* UI polish and user experience improvements
* Build system and distribution setup
* Community beta testing

### Phase 2: Enhanced Features
**Goal:** Add advanced features and broader testing

* Multi-ISO support for different AcreetionOS variants
* Advanced drive detection and safety features
* Comprehensive error handling and recovery
* Open beta program

### Phase 3: General Purpose Foundation
**Goal:** Evolve into a broader Linux flasher

* Support for other Linux distributions
* Plugin architecture for custom distros
* White-label licensing opportunities
* Community-driven feature development

### Phase 4: Future Vision
**Goal:** Rust/Tauri rewrite for performance and security

* Evaluate Rust backend for flashing logic
* Tauri frontend for native performance
* Modular architecture for extensibility
* Cross-platform optimization

## 🤝 Contributing

We welcome contributions! This project is designed to be approachable for developers of all skill levels.

### How to Help

1. **Start Small:** Pick up a "good first issue" or documentation improvement
2. **Focus on Quality:** We prioritize clean, maintainable code over quick fixes
3. **Ask Questions:** Open issues for discussion before major changes
4. **Test Thoroughly:** Help ensure reliability across different systems

### Development Guidelines

* Follow existing code style and patterns
* Add tests for new functionality
* Update documentation for user-facing changes
* Consider security implications of any changes

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 📞 Contact & Community

* **Issues:** Use GitHub issues for bugs, feature requests, and questions
* **Discussions:** Join the community forum for broader discussions
* **Security:** Report security issues privately to [security@acreetionos.org]

---

## 🧠 For Maintainers

### Quick Reference

* **Development:** `npm start`
* **Build:** `npm run build`
* **Test:** `npm test` (when implemented)
* **Package:** `npm run package`

### Release Checklist

- [ ] Update version in `package.json`
- [ ] Test builds on all target platforms
- [ ] Update changelog and release notes
- [ ] Tag release and create GitHub release
- [ ] Update documentation for new features

---

**Note:** This is a work in progress. We're building this incrementally, focusing on quality and user experience. Your feedback and contributions help shape the direction of this project.

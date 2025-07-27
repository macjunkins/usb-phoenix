#!/bin/bash

# AcreetionOS Hello World - Tauri Setup Script
# This script helps set up and run the Tauri Hello World proof-of-concept

set -e

echo "🎛 AcreetionOS Hello World - Tauri Setup"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "src-tauri/Cargo.toml" ]; then
    echo "❌ Error: Please run this script from the tauri-hello-world directory"
    exit 1
fi

# Check for Rust installation
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust is not installed. Please install Rust first:"
    echo "   curl https://sh.rustup.rs -sSf | sh"
    echo "   source \$HOME/.cargo/env"
    exit 1
fi

# Check for Tauri CLI
if ! command -v cargo-tauri &> /dev/null; then
    echo "📦 Installing Tauri CLI..."
    cargo install tauri-cli
else
    echo "✅ Tauri CLI is already installed"
fi

# Build the project
echo "🔨 Building the project..."
cd src-tauri
cargo build
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To run the application:"
echo "   cargo tauri dev"
echo ""
echo "📦 To build for production:"
echo "   cargo tauri build"
echo ""
echo "📖 For more information, see README.md"
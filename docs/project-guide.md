# SetUp Kilo Code Project
---

## 🔧 PART 1: Install Prerequisites

### ✅ 1. **Install VS Code**

* Download from [https://code.visualstudio.com](https://code.visualstudio.com)
* Ensure it’s in `/Applications` and available via terminal (`code` command)

### ✅ 2. **Install Kilo Code Extension**

* Open VS Code ➝ Go to Extensions (`⇧⌘X`)
* Search **“Kilo Code”**
* Install `kilocode.kilo-code`

Or via terminal:

```sh
code --install-extension kilocode.kilo-code
```

---

## 🤖 PART 2: Set Up Local Model in LM Studio

### ✅ 1. **Download LM Studio**

* Get the Mac version from [https://lmstudio.ai](https://lmstudio.ai)

### ✅ 2. **Download a Suitable Model**

Look for a **code-focused model** that works locally:

* Recommended: `codellama:13b-instruct.Q4_K_M.gguf` or `deepseek-coder:6b`
* In LM Studio:

  * Go to **Models**
  * Search & download one
  * Click **“Run”** to launch the model (confirm it starts on `localhost:1234`)

> Tip: Enable **“OpenAI-compatible server”** in LM Studio settings and leave the port as `1234`.

---

## ✅ ⚙️ PART 3: Configure Kilo Code to Use LM Studio

### 1. **Open Kilo in VS Code**

* Click the Kilo icon in the sidebar

### 2. **Go to Settings → API Configuration Profiles**

* Create a new profile (e.g., "Local-LMStudio")

### 3. **Set the Model & API**

* **Provider:** Custom
* **API URL:** `http://localhost:1234/v1`
* **Model Name:** Use the same name shown in LM Studio (e.g., `codellama:13b`)
* **API Key:** Leave empty
* Save the profile and **set it as active**

---

## 🧪 PART 4: Validate Local Model with Kilo

### 1. Use the “Ask” tab in Kilo

Try a prompt like:

> “Write a hello world program in Rust using Tauri.”

If you get a full code block response, your setup works. If not:

* Check LM Studio logs for requests
* Restart LM Studio and re-select the model

---

## 🛠️ PART 5: Prepare Rust + Tauri Dev Environment (macOS ARM)

### 1. **Install Rust**

```sh
curl https://sh.rustup.rs -sSf | sh
source $HOME/.cargo/env
```

### 2. **Install Node.js (for Tauri frontend)**

```sh
brew install node
```

### 3. **Install Tauri CLI**

```sh
cargo install tauri-cli
```

---

## 🚀 PART 6: Start Your USB Flasher Project (Rust + Tauri)

### 1. **Create New Project**

```sh
cargo new usb_flasher --bin
cd usb_flasher
```

### 2. **Initialize Tauri**

```sh
cargo tauri init
```

> It’ll set up a Tauri window with basic frontend (HTML/JS or a React/Vue app if you choose later).

---

## 💡 PART 7: Use Kilo to Drive Project Development

In Kilo:

### Use **Architect Mode**:

Prompt:

> “Plan a Rust + Tauri app that can flash firmware to a USB-connected microcontroller on macOS. The app should have a simple GUI and use serial communication (e.g., via the `serialport` crate).”

### Use **Code Mode**:

Prompt:

> “Create the Rust backend module that lists USB serial devices and allows selecting one to send a binary file.”

### Use **Debug Mode**:

Run your Rust backend tests and ask Kilo to fix any bugs or build errors.

---

## 🧭 Guidance for Learning Rust and Tauri Along the Way

* 🦀 **Rust**:
  Visit [https://rust-lang.org/learn](https://rust-lang.org/learn) or install `rustlings`:

  ```sh
  cargo install rustlings
  rustlings watch
  ```

* 💻 **Tauri**:
  Official guide at [https://tauri.app/v1/guides](https://tauri.app/v1/guides)
  Good YouTube starter: “Build Your First App with Tauri”

---

## 📦 Summary Checklist

| Task                                 | Status |
| ------------------------------------ | ------ |
| Install VS Code + Kilo               | ✅      |
| Install LM Studio + model            | ✅      |
| Configure Kilo for local model       | ✅      |
| Setup Rust + Tauri Dev tools         | ✅      |
| Start project & generate code w/Kilo | ⏳      |

---


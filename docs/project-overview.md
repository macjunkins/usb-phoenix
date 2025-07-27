# 🎯 Project Overview

**Goal:** Build a cross-platform desktop app (macOS-first) with a **GUI** for selecting a USB device, loading a firmware file (e.g. `.bin` or `.hex`), and flashing it over **serial (USB)**.

You’ll need:

* Tauri for GUI & system shell access
* Rust crates like `serialport` for USB comm
* Optional: File picker and progress display in frontend

---

## 🧠 Step-by-Step Kilo Prompt Pack

### 🔹 1. Architect Mode – Project Plan

**Prompt:**

> I'm building a USB firmware flasher in Rust using Tauri. The app should:
>
> * Run on macOS (Apple Silicon)
> * Detect connected USB serial devices
> * Let the user pick a `.hex` or `.bin` file
> * Flash that file to the selected device using serial communication
> * Show status messages (success/failure)
>   Plan the folder structure, backend modules, and frontend UI features.

Expected response: A directory plan like:

```
/src-tauri
  └─ /backend
      ├─ usb.rs
      ├─ flasher.rs
  └─ main.rs
/src
  └─ App.vue or index.html
```

---

### 🔹 2. Code Mode – List USB Serial Devices

**Prompt:**

> Write a Rust function using the `serialport` crate to list all available USB serial ports on macOS. Return the port names as a vector of strings.

Then modify:

> Integrate this function into a Tauri command so it can be called from the frontend.

---

### 🔹 3. Code Mode – Flash File to Device

**Prompt:**

> Write a Rust function that opens a serial port by name and sends the contents of a binary file to it. Use 115200 baud. Include basic error handling for port or file failures.

Optional:

> Add support for progress updates via Tauri events.

---

### 🔹 4. Code Mode – Tauri Frontend

**Prompt (if using vanilla HTML/CSS):**

> Create a simple HTML+JavaScript frontend for Tauri with:
>
> * A file picker to select the firmware
> * A dropdown to choose from available serial ports
> * A button to start flashing
> * A status area to show success/failure

**Or** (if using Vue or React):

> Use Vue to create the same interface and bind the Tauri commands.

---

### 🔹 5. Debug Mode – Error Handling

After attempting a flash:

**Prompt:**

> I got an error when trying to open the serial port. Here’s the Rust error: \[paste it]. Please fix the function to handle this case safely.

---

### 🧱 Skeleton File Outline

Here’s how your files will likely look as you generate them with Kilo:

```
usb_flasher/
├── src-tauri/
│   ├── src/
│   │   ├── backend/
│   │   │   ├── usb.rs       # List & open serial ports
│   │   │   ├── flasher.rs   # Flash logic
│   │   └── main.rs          # Tauri command registration
│   └── tauri.conf.json
├── src/
│   ├── index.html           # or App.vue / main.tsx
│   └── style.css
```

---

## 🚨 Tips While Using Local Models

Since you're using LM Studio with a local model, it may:

* Occasionally "hallucinate" APIs — always double-check function signatures
* Miss details about crates — cross-verify on [docs.rs](https://docs.rs)
* Work better with **smaller, isolated tasks** rather than giant prompts

Use [https://lib.rs](https://lib.rs/crates/serialport) for crate browsing and examples.

---

## 🧰 Suggested Rust Crates

| Purpose         | Crate                             |
| --------------- | --------------------------------- |
| Serial I/O      | `serialport`                      |
| File handling   | Built-in `fs`                     |
| Tauri bridge    | `tauri`                           |
| Progress (opt.) | `indicatif` or `tauri-plugin-log` |

---

Would you like me to:

* Generate starter code templates for `main.rs`, `usb.rs`, and `flasher.rs`?
* Help scaffold your Tauri project so you're ready to run it locally?

Let me know how much you'd like auto-generated now vs what you want to try through Kilo.

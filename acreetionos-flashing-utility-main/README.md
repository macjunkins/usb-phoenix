# AcreetionOS USB Flashing Utility

This is a desktop application built with Electron, designed to simplify the process of downloading AcreetionOS ISO images and flashing them directly to a USB drive. It provides a user-friendly interface and a transparent console output to monitor the flashing process.

---

## Features

- **ISO Discovery**: Scrapes [acreetionos.org](https://acreetionos.org) to find available ISO download links.
- **USB Device Detection**: Automatically lists connected USB drives.
- **Cross-Platform Flashing**:
  - **Linux/macOS**: Utilizes system-level `dd` command for secure and direct flashing.
  - **Windows**: Automatically downloads the portable version of **Rufus** (a trusted third-party tool) and uses it to perform the flashing, handling Windows-specific disk access complexities.
- **Progress Tracking**: Displays a clear progress bar for both download and flashing operations.
- **In-App Console**: A dedicated console window within the application shows real-time output from the flashing process.
- **User Guidance**: Provides a clear message upon successful flashing, guiding the user on how to boot from the USB drive.

---

## Why Rufus for Windows?

On Windows, performing low-level disk write operations directly from an application is significantly more complex and carries higher risks due to the operating system's security model and how it manages disk access. Unlike Linux or macOS, there isn't a straightforward, built-in command-line tool like `dd` that can be reliably executed by an application without extensive administrative setup or specialized drivers.

To ensure the AcreetionOS USB Flashing Utility is both reliable and safe for Windows users, it integrates with **Rufus**.

Rufus is a widely recognized, open-source, and highly trusted utility specifically designed for creating bootable USB drives on Windows. By leveraging Rufus, this utility can:

- **Handle Administrative Privileges**: Rufus will prompt the user for necessary administrator permissions, ensuring the flashing operation has the required access.
- **Manage Disk Access Safely**: Rufus is expertly designed to interact with Windows' disk management APIs correctly, minimizing the risk of data corruption or system instability.
- **Provide Robustness**: It accounts for various Windows-specific scenarios and potential issues during the flashing process.

This approach allows the AcreetionOS USB Flasher to provide a consistent and effective user experience across different operating systems, making it easier for users to switch to Linux.

---

## Installation

To get started with the AcreetionOS USB Flashing Utility, follow these steps:

### Clone the repository:

```bash
git clone https://darrengames.ddns.net:2500/natalie/acreetionos-flashing-utility.git
cd AcreetionOS-Flashing-Utility
```

### Install dependencies:

Navigate to the project directory and install the required Node.js packages:

```bash
npm install
```

This will also ensure that native modules are correctly built for Electron.

---

## Usage

### Start the application:

To run the application in development mode:

```bash
npm start
```

Or for verbose logging:

```bash
npm run dev
```

---

### Select an ISO Image:

- The application will automatically attempt to fetch available ISO images from [acreetionos.org](https://acreetionos.org).
- Choose your desired AcreetionOS ISO from the **"Select ISO Image"** dropdown.
- If the list doesn't appear or seems outdated, click the **"Refresh"** button.

---

### Select a USB Drive:

- The application will list detected USB drives.

⚠️ **WARNING**: Carefully select the correct USB drive from the **"Select USB Drive"** dropdown. **All data on the selected drive will be erased.**

- If your drive isn't listed, click the **"Refresh"** button.

---

### Flash the ISO:

- Once both an ISO and a USB drive are selected, the **"Flash ISO to USB"** button will become active.
- Click the button. You will be prompted with a confirmation dialog.
- Confirm to start the flashing process.

#### On Windows:

- Be prepared for a User Account Control (UAC) prompt from **Rufus**, which you must accept for the flashing to proceed.

---

### Monitor Progress:

- A progress bar and status message will indicate the current stage (downloading, flashing) and percentage.
- For detailed output, click the **"Toggle Console Output"** button to reveal a console-like interface that streams the raw output from the underlying flashing command (either `dd` or **Rufus**).

---

### Post-Flashing Instructions:

Upon successful completion, a message will guide you on how to boot from the newly flashed USB drive to install AcreetionOS.

---

## Building for Distribution

To create distributable packages:

```bash
npm run build
```

### OS-Specific Notes:

- **Windows (.exe)**: Must be built on Windows.
- **macOS (.dmg)**: Must be built on macOS.
- **Linux (.AppImage)**: Must be built on Linux.

Distributable files will be located in the `dist/` directory.

---

## Credits

Made with ❤️ by **Natalie** from the **AcreetionOS Team**.

Special thanks to **Darren Clift** for being a truly great partner on this project – your contributions are deeply appreciated!

---

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

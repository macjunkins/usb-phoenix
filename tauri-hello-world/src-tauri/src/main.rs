// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::State;

// Define a struct for system information
#[derive(Debug, Serialize, Deserialize)]
struct SystemInfo {
    os: String,
    arch: String,
    version: String,
    hostname: String,
}

// Define a struct for application state
#[derive(Debug, Default)]
struct AppState {
    counter: std::sync::Mutex<i32>,
}

// Simple greeting command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to AcreetionOS Tauri proof-of-concept.", name)
}

// Get system information
#[tauri::command]
fn get_system_info() -> SystemInfo {
    SystemInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        version: "0.1.0".to_string(),
        hostname: whoami::fallible::hostname().unwrap_or_else(|_| "Unknown".to_string()),
    }
}

// Counter demonstration with state management
#[tauri::command]
fn increment_counter(state: State<AppState>) -> i32 {
    let mut counter = state.counter.lock().unwrap();
    *counter += 1;
    *counter
}

#[tauri::command]
fn get_counter(state: State<AppState>) -> i32 {
    let counter = state.counter.lock().unwrap();
    *counter
}

#[tauri::command]
fn reset_counter(state: State<AppState>) -> i32 {
    let mut counter = state.counter.lock().unwrap();
    *counter = 0;
    *counter
}

// Get current timestamp
#[tauri::command]
fn get_timestamp() -> String {
    chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC").to_string()
}

// Simulate a USB device list (for future USB flasher context)
#[tauri::command]
fn get_mock_usb_devices() -> Vec<HashMap<String, String>> {
    vec![
        {
            let mut device = HashMap::new();
            device.insert("name".to_string(), "Arduino Uno".to_string());
            device.insert("port".to_string(), "/dev/tty.usbmodem14101".to_string());
            device.insert("vendor_id".to_string(), "2341".to_string());
            device.insert("product_id".to_string(), "0043".to_string());
            device
        },
        {
            let mut device = HashMap::new();
            device.insert("name".to_string(), "ESP32 DevKit".to_string());
            device.insert("port".to_string(), "/dev/tty.usbserial-0001".to_string());
            device.insert("vendor_id".to_string(), "10C4".to_string());
            device.insert("product_id".to_string(), "EA60".to_string());
            device
        },
        {
            let mut device = HashMap::new();
            device.insert("name".to_string(), "Raspberry Pi Pico".to_string());
            device.insert("port".to_string(), "/dev/tty.usbmodem14201".to_string());
            device.insert("vendor_id".to_string(), "2E8A".to_string());
            device.insert("product_id".to_string(), "0005".to_string());
            device
        }
    ]
}

fn main() {
    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_system_info,
            increment_counter,
            get_counter,
            reset_counter,
            get_timestamp,
            get_mock_usb_devices
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
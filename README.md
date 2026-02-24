# LTX Studio — Retry All

A Chrome extension that adds a **Retry All** button to the [LTX Studio](https://app.ltx.studio) Gen Workspace. One click retries all failed generations instead of clicking each one manually.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)

## What it does

When you're in the Gen Workspace, a floating purple button appears in the bottom-right corner. Clicking it finds every visible **Retry** button on the page and clicks them all at once.

## Install

1. Clone this repo (or download as ZIP)
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select this folder
5. Navigate to your Gen Workspace in LTX Studio — the button should appear

## Files

| File | Description |
|------|-------------|
| `manifest.json` | Extension manifest (Manifest V3) |
| `ltx-retry-ext-content.js` | Content script that injects the button and handles click logic |
| `ltx-retry-ext-styles.css` | Styling for the floating button |
| `ltx-retry-icon.png` | Extension icon |

## Usage

1. Open a project's **Gen Workspace** in LTX Studio
2. Click the 🔄 **Retry All** button in the bottom-right corner
3. All visible Retry buttons will be clicked automatically
4. The button shows how many items were retried, then resets after 3 seconds

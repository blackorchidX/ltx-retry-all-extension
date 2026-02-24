# 🍌 LTX Studio — Retry All (Nano Banana Pro)

A Chrome extension that adds a **Retry All** button to the [LTX Studio](https://app.ltx.studio) Gen Workspace. One click retries all failed **Nano Banana Pro** image generations instead of clicking each one manually.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)

## What it does

When generating images with Nano Banana Pro in the Gen Workspace, some generations may fail. Instead of clicking Retry on each one individually, this extension adds a floating purple button in the bottom-right corner that retries all failed generations at once.

## Install

1. Clone this repo (or download as ZIP)
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select this folder
5. Navigate to your Gen Workspace in LTX Studio — the button should appear

## Usage

1. Open a project's **Gen Workspace** in LTX Studio
2. Run your Nano Banana Pro image generations
3. When some fail, click the 🔄 **Retry All** button in the bottom-right corner
4. All failed generations will be retried automatically
5. The button shows how many items were retried, then resets after 3 seconds

## Files

| File | Description |
|------|-------------|
| `manifest.json` | Extension manifest (Manifest V3) |
| `ltx-retry-ext-content.js` | Content script that injects the button and handles click logic |
| `ltx-retry-ext-styles.css` | Styling for the floating button |
| `ltx-retry-icon.png` | Extension icon |

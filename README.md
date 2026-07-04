# T1DDiabetesCard v1.81

A custom Home Assistant card for T1D management. Featuring a sleek, custom-styled dark interface with high-visibility data monitoring and integrated voice command support.

## Features
- **Real-time Monitoring:** Blue-accented glucose readout with directional trend indicator.
- **Data-Rich Display:** Dedicated, color-coded blocks for IOB (Blue), COB (Green), and REQ (Orange).
- **Health Insights:** Automated A1c estimation and sensor longevity tracking.
- **Alexa Integration:** Fully customizable buttons to trigger your own Alexa voice readout scripts.
- **Custom Aesthetic:** Designed with a "shady green" border and theme-matching dark mode.

## Screenshot

<img width="279" height="440" alt="2026-07-03_20-21-14" src="https://github.com/user-attachments/assets/42729739-c015-4cac-83be-13faf87f3b67" />


## Prerequisites

> ⚠️ **Important System Requirement:** To populate the advanced tracking blocks (**IOB**, **COB**, and **REQ**), this setup requires an active **AAPS (Android Artificial Pancreas System)** or a similar looping data stream integrated into your Home Assistant instance. For detailed setup guides, refer to the official [AndroidAPS Documentation](https://androidaps.readthedocs.io/en/latest/).

---

## Installation

This card is fully integrated with **HACS** (Home Assistant Community Store). The installation is entirely hands-off—HACS automatically registers the dashboard script for you behind the scenes.

1. Open **HACS** from your Home Assistant sidebar.
2. Type **`t1d`** into the top search bar.
3. Click on the **T1D Diabetes Card** repository from the results.
4. Click the three dots in the top right corner and select **Redownload** (or **Download** if installing for the first time).
5. Click the green **Download** button on the pop-up window.
6. **Refresh your browser** to clear your dashboard cache.

### 🔍 Verifying the Installation
You do **not** need to manually add resources. If you ever want to verify that HACS registered the card correctly, you can navigate to **Settings > Dashboards > Three Dots (top right) > Resources**. 

There you will find the entry HACS automatically generated, pointing directly to your frontend path:
`/hacsfiles/lovelace-t1d-diabetes-card/t1d-diabetes-card.js`


### 🎥 Video Walkthrough: HACS Installation & Resource Verification

<details>
<summary>🔍 Click here to expand the Full Video Setup Walkthrough</summary>

### 🎥 Detailed Walkthrough
https://github.com/user-attachments/assets/c69f8ba3-1758-447d-bea4-d7a1c3aa6d02

</details>

---

## Configuration & Features

This card is 100% manageable via the native Home Assistant visual UI editor:

* **Card Title:** Customize the header label to personalize your tracking station.
* **True Unit Toggling:** Seamlessly switch between `mg/dL` and `mmol/L` metrics with automated mathematical safety bounds.
* **Dexcom Trend Translation:** Native code parsing that replaces ugly raw database text strings with beautiful, clean, user-friendly movement text (e.g., "Rapid Down", "Steady").
* **Advanced AAPS Matrix:** High-visibility, color-coded tracking cells explicitly dedicated to monitoring your **Insulin on Board (IOB)**, **Carbs on Board (COB)**, and **Required Basal Adjustments (REQ)**.
* **Device Lifecycle Tracking:** Integrated tracking for active hardware Pod/Transmitter lifespan countdown days.
* **Dual Alexa Voice Announcements:** Two dedicated, fully customizable interactive action buttons designed to instantly trigger your existing Home Assistant Alexa room announcement scripts for quick audio readouts.

---
*Maintained with 💙 for the T1D community. Version 1.81.*

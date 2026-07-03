# T1DDiabetesCard v1.65

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

This card is fully integrated with **HACS**, meaning the installation is entirely hands-off. You do **not** need to create manual folders or add resources yourself.

1. Open **HACS** from your Home Assistant sidebar.
2. Click on the **Frontend** section.
3. Type **`t1d`** into the top search bar.
4. Select **T1D Diabetes Card** from the results.
5. Click the green **Download** button in the bottom right corner.
6. **Refresh your browser** to reload the dashboard cache.

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
*Maintained with 💙 for the T1D community. Version 1.63.*

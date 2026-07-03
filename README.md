# T1DDiabetesCard v1.5.1

A custom Home Assistant card for T1D management. Featuring a sleek, custom-styled dark interface with high-visibility data monitoring and integrated voice command support.

## Features
- **Real-time Monitoring:** Blue-accented glucose readout with directional trend indicator.
- **Data-Rich Display:** Dedicated, color-coded blocks for IOB (Blue), COB (Green), and REQ (Orange).
- **Health Insights:** Automated A1c estimation and sensor longevity tracking.
- **Alexa Integration:** Fully customizable buttons to trigger your own Alexa voice readout scripts.
- **Custom Aesthetic:** Designed with a "shady green" border and theme-matching dark mode.

## Screenshot
![T1DDiabetesCard](images/my-card-screenshot.png)
*(Replace the path above with the actual link to your uploaded screenshot)*

## Installation
1. Download `t1d-diabetes-card.js` from the latest release.
2. Move the file into your Home Assistant `/config/www/` folder.
3. In Home Assistant, go to **Settings > Dashboards > Resources**.
4. Add a new resource:
   - **URL:** `/local/t1d-diabetes-card.js`
   - **Resource type:** JavaScript Module

## Configuration
This card is fully configurable via the Home Assistant UI editor:
- **Card Title:** Custom label for your card.
- **Units:** Toggle between `mg/dL` and `mmol/L`.
- **Entities:** Map your sensors for Glucose, IOB, COB, REQ, and Sensor Days.
- **Alexa Buttons:** Easily label and assign your existing Alexa scripts to either of the two buttons.

---
*Maintained with ❤️ for the T1D community. Version 1.3.2.*

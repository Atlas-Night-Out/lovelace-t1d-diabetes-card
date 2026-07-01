# lovelace-t1d-diabetes-card

A sleek, configurable dashboard card for Home Assistant designed for T1D management.

## Setup Instructions
- **Prerequisites**: Ensure you have [HACS](https://hacs.xyz/) installed.

### Installation
1. Add this repository to HACS as a custom repository.
2. Install the **T1D Diabetes Card**.
3. Restart Home Assistant.

### Configuration
- Add the card to your dashboard via the UI.
- **Entity**: Select your glucose sensor.
- **Units**: Toggle between `mmol/L` or `mg/dL` to ensure accurate GMI/A1C calculations.
- **IOB/Dexcom Buttons**: Configure the paths to your specific Alexa service calls.

## Features
* **Real-time GMI/A1C**: Automatically calculates your estimated A1C based on your chosen units.
* **Sensor Lifecycle**: Automatically tracks the 10-day Dexcom sensor lifespan.
* **Visual Editor**: No manual YAML required; configure thresholds, titles, and display options directly from the card settings.

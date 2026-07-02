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
- **Visual Editor**: The card features a built-in configuration menu. Simply open the card editor, and use the dropdown menus to select your Blood Glucose, IOB, COB, and Expiry sensors.
- **Alexa Integration**: Select your `media_player` or specific `script` entity in the Alexa Target dropdown to enable voice readouts.

## Features
* **Real-time GMI/A1C**: Automatically calculates your estimated A1C based on your sensor data.
* **Sensor Lifecycle**: Automatically tracks the 10-day Dexcom sensor lifespan.
* **Visual Editor**: No manual YAML required; configure all entities, titles, and display options directly via the card's native configuration settings.

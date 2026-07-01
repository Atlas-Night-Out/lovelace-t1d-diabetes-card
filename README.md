# lovelace-t1d-diabetes-card
lovelace-t1d-diabetes-card is a sleek Home Assistant dashboard card built for comprehensive T1D tracking. Keep tabs on your real-time blood glucose, trend vectors, and hourly deltas at a glance, with a lightweight architecture built to seamlessly scale with your dashboard setup.


T1D Diabetes Card
A sleek, configurable dashboard card for Home Assistant designed for T1D management.

Setup Instructions
Prerequisites: Ensure you have HACS installed.

Installation:

Add this repository to HACS as a custom repository.

Install the T1D Diabetes Card.

Restart Home Assistant.

Configuration:

Add the card to your dashboard via the UI.

Entity: Select your glucose sensor.

Units: Toggle between mmol/L or mg/dL to ensure accurate GMI/A1C calculations.

IOB/Dexcom Buttons: Configure the paths to your specific Alexa service calls to trigger your voice readouts.

Features
Real-time GMI/A1C: Automatically calculates your estimated A1C based on your chosen units.

Sensor Lifecycle: Automatically tracks the 10-day Dexcom sensor lifespan.

Visual Editor: No manual YAML required; configure thresholds, titles, and display options directly from the card settings.

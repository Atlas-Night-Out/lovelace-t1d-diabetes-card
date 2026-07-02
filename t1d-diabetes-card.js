/**
 * T1D Diabetes Tracker Card
 * Corrected version with persistent configuration editor
 */

class T1DDiabetesCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static getConfigElement() {
    return document.createElement("t1d-diabetes-card-editor");
  }

  static getStubConfig() {
    return {
      title: "Dexcom G6",
      entity: "",
      days_left_entity: "",
      iob_entity: "",
      cob_entity: "",
      req_entity: "",
      a1c_entity: "",
      alexa_entity: "",
      show_title: true,
    };
  }

  setConfig(config) {
    this._config = config;
    if (this._hass) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config) this._render();
  }

  _render() {
    // Basic rendering logic for the main card
    this.shadowRoot.innerHTML = `<div>T1D Tracker Card Loaded. Configure entities in the editor.</div>`;
    // Add your existing display logic here...
  }
}

// ── Configuration Editor Class ──────────────────────────────────
class T1DDiabetesCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._hass || !this._config || this.shadowRoot.querySelector('ha-form')) return;

    const schema = [
      { name: "title", label: "Card Title", selector: { text: {} } },
      { name: "entity", label: "Blood Glucose Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "days_left_entity", label: "Sensor Expiry/Countdown Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "iob_entity", label: "Insulin On Board (IOB) Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "cob_entity", label: "Carbs On Board (COB) Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "req_entity", label: "Carbs Required (REQ) Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "a1c_entity", label: "Estimated A1c Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "alexa_entity", label: "Alexa Target", selector: { entity: { domain: "media_player" } } },
    ];

    const form = document.createElement("ha-form");
    form.hass = this._hass;
    form.schema = schema;
    form.data = this._config;
    form.computeLabel = (schema) => schema.label;
    
    form.addEventListener("value-changed", (ev) => {
      this._config = ev.detail.value;
      this.dispatchEvent(new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      }));
    });

    this.shadowRoot.appendChild(form);
  }
}

// ── Registration ──────────────────────────────────────────────────
if (!customElements.get('t1d-diabetes-card')) {
  customElements.define('t1d-diabetes-card', T1DDiabetesCard);
}
if (!customElements.get('t1d-diabetes-card-editor')) {
  customElements.define('t1d-diabetes-card-editor', T1DDiabetesCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === 't1d-diabetes-card')) {
  window.customCards.push({
    type: 't1d-diabetes-card',
    name: 'T1D Diabetes Tracker Card',
    preview: true,
    description: 'Advanced dashboard with persistent editor.'
  });
}

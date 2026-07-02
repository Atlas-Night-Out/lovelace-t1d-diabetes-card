/**
 * T1D Diabetes Tracker Card
 */

class T1DDiabetesCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static getConfigElement() {
    return document.createElement("t1d-diabetes-card-editor");
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
    if (!this._config || !this._hass) return;

    const getState = (entity) => {
      const stateObj = entity ? this._hass.states[entity] : null;
      return stateObj ? stateObj.state : "N/A";
    };

    this.shadowRoot.innerHTML = `
      <style>
        ha-card { padding: 16px; border-radius: 12px; }
        .title { font-size: 1.2rem; margin-bottom: 12px; font-weight: 500; }
        .row { display: flex; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px; }
        .label { opacity: 0.7; }
        .value { font-weight: bold; }
      </style>
      <ha-card>
        <div class="title">${this._config.title || "T1D Tracker"}</div>
        <div class="row"><span class="label">Glucose:</span><span class="value">${getState(this._config.entity)}</span></div>
        <div class="row"><span class="label">IOB:</span><span class="value">${getState(this._config.iob_entity)}</span></div>
        <div class="row"><span class="label">COB:</span><span class="value">${getState(this._config.cob_entity)}</span></div>
        <div class="row"><span class="label">REQ:</span><span class="value">${getState(this._config.req_entity)}</span></div>
        <div class="row"><span class="label">A1c:</span><span class="value">${getState(this._config.a1c_entity)}</span></div>
        <div class="row"><span class="label">Sensor Days:</span><span class="value">${getState(this._config.days_entity)}</span></div>
        <div class="row"><span class="label">Units:</span><span class="value">${this._config.unit_type || "mg/dL"}</span></div>
      </ha-card>
    `;
  }
}

// ── Editor ──────────────────────────────────
class T1DDiabetesCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) { this._config = config; }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._hass || !this._config || this.shadowRoot.querySelector('ha-form')) return;

    const schema = [
      { name: "title", label: "Card Title", selector: { text: {} } },
      { name: "unit_type", label: "Units (e.g., mg/dL or mmol/L)", selector: { select: { options: ["mg/dL", "mmol/L"] } } },
      { name: "entity", label: "Blood Glucose Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "iob_entity", label: "IOB Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "cob_entity", label: "COB Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "req_entity", label: "REQ Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "a1c_entity", label: "A1c Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "days_entity", label: "Sensor Days Remaining", selector: { entity: { domain: "sensor" } } }
    ];

    const form = document.createElement("ha-form");
    form.hass = this._hass;
    form.schema = schema;
    form.data = this._config;
    form.computeLabel = (s) => s.label;
    
    form.addEventListener("value-changed", (ev) => {
      this._config = ev.detail.value;
      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
    });
    this.shadowRoot.appendChild(form);
  }
}

// ── Registration ──────────────────────────────────
customElements.define('t1d-diabetes-card', T1DDiabetesCard);
customElements.define('t1d-diabetes-card-editor', T1DDiabetesCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 't1d-diabetes-card',
  name: 'T1D Diabetes Tracker Card',
  preview: true,
  description: 'Full T1D management card.'
});

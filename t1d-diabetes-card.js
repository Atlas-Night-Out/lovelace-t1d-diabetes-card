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

    const glucoseVal = parseFloat(getState(this._config.entity));
    // A1c calculation
    const a1cEstimate = !isNaN(glucoseVal) ? ((glucoseVal + 46.7) / 28.7).toFixed(1) : "N/A";
    const unit = this._config.unit_type || "mmol/L";

    this.shadowRoot.innerHTML = `
      <style>
        ha-card { padding: 16px; border-radius: 12px; background: #1c1c1e; color: white; }
        .title { font-size: 1.2rem; font-weight: bold; margin-bottom: 16px; color: #a0a0a0; }
        .main-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .glucose-val { font-size: 2.5rem; font-weight: bold; color: #00ff00; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .box { background: #2c2c2e; padding: 10px; border-radius: 8px; text-align: center; }
        .box-label { font-size: 0.7rem; color: #a0a0a0; text-transform: uppercase; }
        .box-val { font-size: 1rem; font-weight: bold; margin-top: 4px; }
      </style>
      <ha-card>
        <div class="title">${this._config.title || "TDAVE GLUCOSE"}</div>
        <div class="main-row">
          <div class="glucose-val">${getState(this._config.entity)} <span style="font-size: 1rem;">${unit}</span></div>
          <div style="font-size: 1.5rem;">→ Steady</div>
        </div>
        <div class="grid">
          <div class="box"><div class="box-label">Days Left</div><div class="box-val">${getState(this._config.days_entity)}</div></div>
          <div class="box"><div class="box-label">Est. A1c</div><div class="box-val">${a1cEstimate}%</div></div>
        </div>
      </ha-card>
    `;
  }
}

// ── Configuration Editor ──────────────────────────────────
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
      { name: "unit_type", label: "Units", selector: { select: { options: ["mg/dL", "mmol/L"] } } },
      { name: "entity", label: "Blood Glucose Sensor", selector: { entity: { domain: "sensor" } } },
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

customElements.define('t1d-diabetes-card', T1DDiabetesCard);
customElements.define('t1d-diabetes-card-editor', T1DDiabetesCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({ 
  type: 't1d-diabetes-card', 
  name: 'T1D Diabetes Tracker Card', 
  preview: true, 
  description: 'Sleek T1D tracking.' 
});

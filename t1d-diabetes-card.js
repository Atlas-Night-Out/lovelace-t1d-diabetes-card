/**
 * T1D Diabetes Tracker Card - V1.2.9
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

  _callService(entity) {
    if (!entity) return;
    const [domain, service] = entity.split('.');
    this._hass.callService(domain, service, {});
  }

  _render() {
    if (!this._config || !this._hass) return;

    const getState = (entity) => {
      const stateObj = entity ? this._hass.states[entity] : null;
      return stateObj ? stateObj.state : "N/A";
    };

    const glucoseVal = parseFloat(getState(this._config.entity));
    const a1cEstimate = !isNaN(glucoseVal) ? ((glucoseVal + 46.7) / 28.7).toFixed(1) : "N/A";
    const unit = this._config.unit_type || "mmol/L";

    this.shadowRoot.innerHTML = `
      <style>
        ha-card { 
          padding: 16px; 
          border-radius: 12px; 
          background: #0d120f; /* Dark forest background */
          color: white; 
          border: 1px solid #2d4536; /* Specific border green from image_970245.png */
        }
        .title { font-size: 1.2rem; font-weight: bold; margin-bottom: 16px; color: #a0a0a0; }
        .main-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .glucose-val { font-size: 2.5rem; font-weight: bold; color: #00ff00; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
        .box { background: #0e1410; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #2d4536; }
        .box-label { font-size: 0.6rem; color: #888; text-transform: uppercase; margin-bottom: 4px; }
        .box-val { font-size: 0.9rem; font-weight: bold; }
        .alexa-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .btn { background: #0d120f; padding: 8px; border-radius: 6px; text-align: center; font-size: 0.8rem; cursor: pointer; border: 1px solid #2d4536; color: #00ff00; }
        .btn:hover { background: #1a241c; }
      </style>
      <ha-card>
        <div class="title">${this._config.title || "T1D Tracker"}</div>
        <div class="main-row">
          <div class="glucose-val">${getState(this._config.entity)} <span style="font-size: 1rem; color: #fff;">${unit}</span></div>
          <div style="font-size: 1.2rem; opacity: 0.8;">→ Steady</div>
        </div>
        <div class="grid">
          <div class="box"><div class="box-label">IOB</div><div class="box-val">${getState(this._config.iob_entity)}</div></div>
          <div class="box"><div class="box-label">COB</div><div class="box-val">${getState(this._config.cob_entity)}</div></div>
          <div class="box"><div class="box-label">REQ</div><div class="box-val">${getState(this._config.req_entity)}</div></div>
          <div class="box"><div class="box-label">A1c</div><div class="box-val">${a1cEstimate}%</div></div>
          <div class="box" style="grid-column: span 2;"><div class="box-label">Days Remaining</div><div class="box-val">${getState(this._config.days_entity)}</div></div>
        </div>
        <div class="alexa-row">
          <div class="btn" id="alexa1">Alexa Readout 1</div>
          <div class="btn" id="alexa2">Alexa Readout 2</div>
        </div>
      </ha-card>
    `;

    this.shadowRoot.querySelector('#alexa1').addEventListener('click', () => this._callService(this._config.alexa_1));
    this.shadowRoot.querySelector('#alexa2').addEventListener('click', () => this._callService(this._config.alexa_2));
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
      { name: "iob_entity", label: "IOB Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "cob_entity", label: "COB Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "req_entity", label: "REQ Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "days_entity", label: "Sensor Days Remaining", selector: { entity: { domain: "sensor" } } },
      { name: "alexa_1", label: "Alexa Script 1", selector: { entity: { domain: "script" } } },
      { name: "alexa_2", label: "Alexa Script 2", selector: { entity: { domain: "script" } } }
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
  name: 'T1DDiabetesCard v1.2.9', 
  preview: true, 
  description: 'Full T1D management card V1.2.9' 
});

/**
 * T1D Diabetes Tracker Card - V1.4.1
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
    const unit = this._config.unit_type || "mmol/L";
    
    // Correct A1c Calculation Logic
    let a1cEstimate = "N/A";
    if (!isNaN(glucoseVal)) {
        if (unit === "mmol/L") {
            a1cEstimate = (((glucoseVal * 18.018) + 46.7) / 28.7).toFixed(1);
        } else {
            a1cEstimate = ((glucoseVal + 46.7) / 28.7).toFixed(1);
        }
    }

    this.shadowRoot.innerHTML = `
      <style>
        ha-card { 
          background: rgba(0, 187, 0, 0.06) !important; 
          border: 1.5px solid rgba(0, 187, 0, 0.3) !important; 
          border-radius: 12px !important; 
          padding: 16px; 
          color: white; 
        }
        .title { font-size: 1.4rem; font-weight: bold; margin-bottom: 12px; }
        .glucose-box { border: 1.5px solid #3498db; border-radius: 12px; padding: 12px; display: inline-block; margin-bottom: 12px; }
        .glucose-val { font-size: 2.5rem; font-weight: bold; color: #3498db; }
        .grid-triple { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px; }
        .grid-double { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
        .box { border: 1px solid #66ff66; padding: 12px; border-radius: 8px; text-align: center; }
        .btn { border: 1.5px solid #66ff66; padding: 10px; border-radius: 8px; text-align: center; color: #66ff66; font-weight: bold; cursor: pointer; }
      </style>
      <ha-card>
        <div class="title">${this._config.title || "TDave Glucose"}</div>
        <div class="glucose-box"><span class="glucose-val">${getState(this._config.entity)}</span> ${unit}</div>
        <div style="margin-bottom: 12px;">● Steady →</div>
        <div class="grid-triple">
           <div class="box">IOB<br><b>${getState(this._config.iob_entity)} U</b></div>
           <div class="box">COB<br><b>${getState(this._config.cob_entity)} g</b></div>
           <div class="box">REQ<br><b>${getState(this._config.req_entity)}</b></div>
        </div>
        <div class="grid-double">
           <div class="box">A1C<br><b style="font-size:1.5rem">${a1cEstimate}%</b></div>
           <div class="box">SENSOR DAYS<br><b>${getState(this._config.days_entity)}</b></div>
        </div>
        <div class="grid-double">
           <div class="btn" id="alexa1">${this._config.alexa_name_1 || "Alexa 1"}</div>
           <div class="btn" id="alexa2">${this._config.alexa_name_2 || "Alexa 2"}</div>
        </div>
      </ha-card>
    `;

    this.shadowRoot.querySelector('#alexa1').addEventListener('click', () => this._callService(this._config.alexa_1));
    this.shadowRoot.querySelector('#alexa2').addEventListener('click', () => this._callService(this._config.alexa_2));
  }
}

// ── Configuration Editor ──────────────────────────────────
class T1DDiabetesCardEditor extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  setConfig(config) { this._config = config; }
  set hass(hass) { this._hass = hass; this._render(); }
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
      { name: "alexa_name_1", label: "Name for Alexa Button 1", selector: { text: {} } },
      { name: "alexa_1", label: "Alexa Script 1", selector: { entity: { domain: "script" } } },
      { name: "alexa_name_2", label: "Name for Alexa Button 2", selector: { text: {} } },
      { name: "alexa_2", label: "Alexa Script 2", selector: { entity: { domain: "script" } } }
    ];
    const form = document.createElement("ha-form");
    form.hass = this._hass; form.schema = schema; form.data = this._config; form.computeLabel = (s) => s.label;
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
window.customCards.push({ type: 't1d-diabetes-card', name: 'T1DDiabetesCard v1.4.0', preview: true, description: 'Full T1D management card V1.4.0' });

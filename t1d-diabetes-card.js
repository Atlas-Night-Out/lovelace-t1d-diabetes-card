/** * T1D Diabetes Card - Full Professional Version
 * This card displays glucose levels, trend arrows, IOB/COB/REQ data,
 * and allows for Alexa script execution.
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

  /* Logic to map trend text to visual rotation */
  _getTrendInfo(trend) {
    if (!trend) return { deg: 90, label: "→" };
    const t = trend.toString().toLowerCase();
    if (t.includes('double') && t.includes('up')) return { deg: 0, label: '↑↑' };
    if (t.includes('single') && t.includes('up')) return { deg: 45, label: '↑' };
    if (t.includes('flat') || t.includes('steady')) return { deg: 90, label: '→' };
    if (t.includes('single') && t.includes('down')) return { deg: 135, label: '↓' };
    if (t.includes('double') && t.includes('down')) return { deg: 180, label: '↓↓' };
    return { deg: 90, label: '→' };
  }

  _render() {
    if (!this._config || !this._hass) return;

    const getState = (e) => (e && this._hass.states[e]) ? this._hass.states[e].state : "N/A";
    const val = parseFloat(getState(this._config.entity));
    const trend = getState(this._config.trend_entity);
    const trendInfo = this._getTrendInfo(trend);
    const unit = this._config.unit_type || "mmol/L";
    
    let a1c = !isNaN(val) ? (unit === "mmol/L" ? (((val * 18.018) + 46.7) / 28.7).toFixed(1) : ((val + 46.7) / 28.7).toFixed(1)) : "N/A";

    this.shadowRoot.innerHTML = `
      <style>
        ha-card { background: rgba(0, 0, 0, 0.2); border: 1.5px solid rgba(0, 187, 0, 0.3); border-radius: 12px; padding: 12px; color: white; font-family: sans-serif; }
        .title { font-size: 1.1rem; margin-bottom: 12px; font-weight: bold; }
        .header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; }
        .glucose-num { font-size: 2.2rem; font-weight: bold; }
        .trend-area { text-align: center; font-size: 1rem; margin-right: 10px; }
        .arrow-icon { display: inline-block; font-size: 2.5rem; transform: rotate(${trendInfo.deg}deg); margin-top: 5px; }
        .grid-triple { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px; }
        .grid-double { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
        .box { border: 1px solid rgba(255, 255, 255, 0.1); padding: 8px; border-radius: 6px; text-align: center; }
        .box-header { font-weight: bold; font-size: 0.75rem; margin-bottom: 4px; }
        .box-value { font-weight: bold; font-size: 1rem; }
        .btn { border: 1px solid rgba(0, 187, 0, 0.5); padding: 10px; border-radius: 6px; text-align: center; cursor: pointer; font-weight: bold; color: #00bb00; margin-top: 5px; }
      </style>
      <ha-card>
        <div class="title">${this._config.title || "T1Dave Glucose"}</div>
        <div class="header-row">
            <div><div class="glucose-num">${getState(this._config.entity)}</div><div>${unit}</div></div>
            <div class="trend-area"><div>${trend}</div><div class="arrow-icon">${trendInfo.label}</div></div>
        </div>
        <div class="grid-triple">
           <div class="box"><div class="box-header" style="color: #3498db;">IOB</div><div class="box-value">${getState(this._config.iob_entity)} U</div></div>
           <div class="box"><div class="box-header" style="color: #2ecc71;">COB</div><div class="box-value">${getState(this._config.cob_entity)} g</div></div>
           <div class="box"><div class="box-header" style="color: #e67e22;">REQ</div><div class="box-value">${getState(this._config.req_entity)}</div></div>
        </div>
        <div class="grid-double">
           <div class="box"><div class="box-header">EST. A1C</div><div class="box-value">${a1c}%</div></div>
           <div class="box"><div class="box-header">SENSOR DAYS</div><div class="box-value">${getState(this._config.days_entity)}</div></div>
        </div>
        <div class="btn" id="alexa1">${this._config.alexa_name_1 || "Alexa 1"}</div>
        <div class="btn" id="alexa2">${this._config.alexa_name_2 || "Alexa 2"}</div>
      </ha-card>
    `;

    this.shadowRoot.querySelector('#alexa1').addEventListener('click', () => this._callService(this._config.alexa_1));
    this.shadowRoot.querySelector('#alexa2').addEventListener('click', () => this._callService(this._config.alexa_2));
  }
}

class T1DDiabetesCardEditor extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  setConfig(c) { this._config = c; }
  set hass(h) { this._hass = h; this._render(); }
  _render() {
    if (!this._hass || !this._config || this.shadowRoot.querySelector('ha-form')) return;
    const schema = [
      { name: "title", label: "Title", selector: { text: {} } },
      { name: "unit_type", label: "Units", selector: { select: { options: ["mg/dL", "mmol/L"] } } },
      { name: "entity", label: "Glucose Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "trend_entity", label: "Trend Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "iob_entity", label: "IOB Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "cob_entity", label: "COB Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "req_entity", label: "REQ Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "days_entity", label: "Days Sensor", selector: { entity: { domain: "sensor" } } },
      { name: "alexa_name_1", label: "Alexa 1 Name", selector: { text: {} } },
      { name: "alexa_1", label: "Alexa 1 Script", selector: { entity: { domain: "script" } } },
      { name: "alexa_name_2", label: "Alexa 2 Name", selector: { text: {} } },
      { name: "alexa_2", label: "Alexa 2 Script", selector: { entity: { domain: "script" } } }
    ];
    const form = document.createElement("ha-form");
    form.hass = this._hass; form.schema = schema; form.data = this._config;
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
  name: 'T1DDiabetesCard', 
  preview: true, 
  description: 'T1D card with Trend Arrows and Colors' 
});

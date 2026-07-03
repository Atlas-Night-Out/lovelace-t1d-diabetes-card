/** T1D Diabetes Card - V1.51 - Full Structure **/

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

    const getState = (e) => this._hass.states[e]?.state || "N/A";
    const val = parseFloat(getState(this._config.entity));
    const unit = this._config.unit_type || "mmol/L";
    const perc = Math.min(val / 15, 1);
    const offset = 220 - (220 * perc);

    let color = "#2ecc71";
    if (!isNaN(val)) {
      if (val < 3.9) color = "#ff4d4d";
      else if (val > 8.9) color = "#e67e22";
    }

    let a1c = !isNaN(val) ? (unit === "mmol/L" ? (((val * 18.018) + 46.7) / 28.7).toFixed(1) : ((val + 46.7) / 28.7).toFixed(1)) : "N/A";

    this.shadowRoot.innerHTML = `
      <style>
        ha-card { background: rgba(0, 187, 0, 0.06) !important; border: 1px solid rgba(0, 187, 0, 0.2) !important; border-radius: 12px !important; padding: 12px !important; color: white; }
        .title { font-size: 1rem; font-weight: 500; margin-bottom: 10px; opacity: 0.9; }
        .header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .circle-container { position: relative; width: 90px; height: 90px; }
        .circle-svg { transform: rotate(-90deg); }
        .circle-bg { fill: none; stroke: #333; stroke-width: 8; }
        .circle-val { fill: none; stroke: ${color}; stroke-width: 8; stroke-linecap: round; stroke-dasharray: 220; stroke-dashoffset: ${offset}; transition: stroke-dashoffset 1s ease; }
        .glucose-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; width: 100%; }
        .glucose-num { font-size: 1.8rem; font-weight: bold; line-height: 1; }
        .arrow-area { text-align: center; padding-right: 15px; }
        .arrow { font-size: 3rem; line-height: 1; display: block; margin-top: 5px; }
        .grid-triple { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 6px; }
        .grid-double { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px; }
        .box { border: 1px solid rgba(0, 187, 0, 0.15); padding: 8px; border-radius: 6px; text-align: center; }
        .box-val { font-size: 1.15rem; font-weight: bold; }
        .box-label { font-size: 0.7rem; opacity: 0.8; text-transform: uppercase; }
        .btn { border: 1px solid rgba(0, 187, 0, 0.2); padding: 6px; border-radius: 6px; text-align: center; color: #66ff66; font-weight: 500; cursor: pointer; font-size: 0.85rem; }
        .graph-box { margin-top: 10px; height: 100px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; }
      </style>
      <ha-card>
        <div class="title">${this._config.title || "TDave Glucose"}</div>
        <div class="header-row">
            <div class="circle-container">
                <svg class="circle-svg" viewBox="0 0 80 80"><circle class="circle-bg" cx="40" cy="40" r="35"/><circle class="circle-val" cx="40" cy="40" r="35"/></svg>
                <div class="glucose-text"><div class="glucose-num">${getState(this._config.entity)}</div><div style="font-size:0.7rem">${unit}</div></div>
            </div>
            <div class="arrow-area">● Steady<br><span class="arrow">→</span></div>
        </div>
        <div class="grid-triple">
           <div class="box"><div class="box-label">IOB</div><div class="box-val">${getState(this._config.iob_entity)} U</div></div>
           <div class="box"><div class="box-label">COB</div><div class="box-val">${getState(this._config.cob_entity)} g</div></div>
           <div class="box"><div class="box-label">REQ</div><div class="box-val">${getState(this._config.req_entity)}</div></div>
        </div>
        <div class="grid-double">
           <div class="box"><div class="box-label">EST. A1C</div><div class="box-val">${a1c}%</div></div>
           <div class="box"><div class="box-label">SENSOR DAYS</div><div class="box-val">${getState(this._config.days_entity)}</div></div>
        </div>
        <div class="grid-double">
           <div class="btn" id="alexa1">${this._config.alexa_name_1 || "Alexa 1"}</div>
           <div class="btn" id="alexa2">${this._config.alexa_name_2 || "Alexa 2"}</div>
        </div>
        <div class="graph-box" style="display: none;"></div>
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
window.customCards.push({ type: 't1d-diabetes-card', name: 'T1DDiabetesCard', preview: true, description: 'Stable T1D management card' });

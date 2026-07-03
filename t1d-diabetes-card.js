/**
 * T1D Diabetes Card
 * This version uses explicit, verbose logic to ensure stability.
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
    if (this._hass) {
      this._render();
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config) {
      this._render();
    }
  }

  _callService(entity) {
    if (!entity || !this._hass) {
      return;
    }
    const [domain, service] = entity.split('.');
    this._hass.callService(domain, service, {});
  }

  /**
   * Verbose mapping to prevent "steady" showing as "down"
   */
  _getTrendInfo(trend) {
    if (!trend) {
      return { label: "→" };
    }
    
    const t = trend.toString().toLowerCase();

    if (t.includes('doubleup')) {
      return { label: '↑↑' };
    } else if (t.includes('singleup')) {
      return { label: '↑' };
    } else if (t.includes('flat') || t.includes('steady')) {
      return { label: '→' };
    } else if (t.includes('singledown')) {
      return { label: '↓' };
    } else if (t.includes('doubledown')) {
      return { label: '↓↓' };
    } else {
      return { label: '→' };
    }
  }

  _calculateA1c(glucose, unit) {
    if (isNaN(glucose)) {
      return "N/A";
    }
    const val = unit === "mmol/L" ? (glucose * 18.018) : glucose;
    return ((val + 46.7) / 28.7).toFixed(1);
  }

  _render() {
    if (!this._config || !this._hass) {
      return;
    }

    const getState = (e) => (e && this._hass.states[e]) ? this._hass.states[e].state : "N/A";
    
    const glucoseVal = parseFloat(getState(this._config.entity));
    const trend = getState(this._config.trend_entity);
    const trendInfo = this._getTrendInfo(trend);
    const unit = this._config.unit_type || "mmol/L";
    const a1c = this._calculateA1c(glucoseVal, unit);

    this.shadowRoot.innerHTML = `
      <style>
        ha-card { background: rgba(0, 0, 0, 0.2); border: 1.5px solid #00bb00; border-radius: 12px; padding: 16px; color: white; }
        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .val { font-size: 2.8rem; font-weight: bold; }
        .grid-triple { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
        .grid-double { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
        .box { border: 1px solid #333; padding: 10px; border-radius: 8px; text-align: center; background: rgba(255,255,255,0.05); }
        .box-h { font-weight: bold; font-size: 0.8rem; margin-bottom: 5px; }
        .btn { border: 1px solid #00bb00; padding: 12px; border-radius: 6px; text-align: center; cursor: pointer; font-weight: bold; color: #00bb00; margin-top: 8px; }
      </style>
      <ha-card>
        <div class="header">
            <div><div class="val">${getState(this._config.entity)}</div><div>${unit}</div></div>
            <div style="text-align:center"><div>${trend}</div><div style="font-size:3rem; line-height:1;">${trendInfo.label}</div></div>
        </div>
        <div class="grid-triple">
           <div class="box"><div class="box-h" style="color: #3498db;">IOB</div><div>${getState(this._config.iob_entity)} U</div></div>
           <div class="box"><div class="box-h" style="color: #2ecc71;">COB</div><div>${getState(this._config.cob_entity)} g</div></div>
           <div class="box"><div class="box-h" style="color: #e67e22;">REQ</div><div>${getState(this._config.req_entity)}</div></div>
        </div>
        <div class="grid-double">
           <div class="box"><div class="box-h">EST. A1C</div><div>${a1c}%</div></div>
           <div class="box"><div class="box-h">SENSOR DAYS</div><div>${getState(this._config.days_entity)}</div></div>
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
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(c) {
    this._config = c;
  }

  set hass(h) {
    this._hass = h;
    this._render();
  }

  _render() {
    if (!this._hass || !this._config || this.shadowRoot.querySelector('ha-form')) {
      return;
    }
    
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
    form.hass = this._hass;
    form.schema = schema;
    form.data = this._config;
    
    form.addEventListener("value-changed", (ev) => {
      this._config = ev.detail.value;
      this.dispatchEvent(new CustomEvent("config-changed", { 
        detail: { config: this._config }, 
        bubbles: true, 
        composed: true 
      }));
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
  description: 'Robust T1D Management Card' 
});

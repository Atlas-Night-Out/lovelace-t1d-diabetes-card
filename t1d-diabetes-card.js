/**
 * T1D Diabetes Card v1.59 - Full Professional Version
 * This code is structured to ensure stability, consistent formatting,
 * and includes all requested features: Trend arrows, IOB/COB/REQ 
 * coloring, A1C calculation with dynamic borders, and expanded
 * Alexa button areas.
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

    // Dynamic A1C color threshold logic
    let a1cColor = "#00bb00";
    const a1cNum = parseFloat(a1c);
    if (!isNaN(a1cNum)) {
      if (a1cNum >= 6.5) {
        a1cColor = "#e74c3c"; 
      } else if (a1cNum >= 5.7) {
        a1cColor = "#e67e22"; 
      }
    }

    this.shadowRoot.innerHTML = `
      <style>
        ha-card { 
          background: rgba(0, 25, 10, 0.4); 
          border: 1.5px solid #00bb00; 
          border-radius: 16px; 
          padding: 18px; 
          color: white; 
          font-family: sans-serif;
        }
        .header { 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          margin-bottom: 22px; 
        }
        .glucose-circle {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          border: 5px solid #00bb00;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
        }
        .val { 
          font-size: 2.4rem; 
          font-weight: bold; 
          line-height: 1.1;
        }
        .unit-label {
          font-size: 0.9rem;
          color: #ccc;
          margin-top: 2px;
        }
        .trend-container {
          text-align: center;
          margin-right: 10px;
        }
        .trend-text {
          font-size: 1.1rem;
          color: white;
          margin-bottom: 4px;
        }
        .grid-triple { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 12px; 
          margin-bottom: 14px; 
        }
        .grid-double { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 12px; 
          margin-bottom: 14px; 
        }
        .box { 
          border: 1px solid #333; 
          padding: 12px; 
          border-radius: 10px; 
          text-align: center; 
          background: rgba(0, 0, 0, 0.2);
        }
        .a1c-box { 
          border: 2px solid ${a1cColor}; 
        }
        .box-h { 
          font-weight: bold; 
          font-size: 0.95rem; 
          margin-bottom: 6px; 
          text-transform: uppercase;
        }
        .box-v {
          font-size: 1.4rem;
          font-weight: bold;
        }
        .btn { 
          border: 1px solid #00bb00; 
          padding: 16px; 
          border-radius: 8px; 
          text-align: center; 
          cursor: pointer; 
          font-weight: bold; 
          font-size: 1.2rem;
          color: #00bb00; 
          margin-top: 12px; 
          background: rgba(0, 0, 0, 0.2);
        }
        .btn:hover {
          background: rgba(0, 187, 0, 0.1);
        }
      </style>
      <ha-card>
        <div class="header">
            <div class="glucose-circle">
                <div class="val">${getState(this._config.entity)}</div>
                <div class="unit-label">${unit}</div>
            </div>
            <div class="trend-container">
                <div class="trend-text">${trend}</div>
                <div style="font-size: 3.5rem; line-height: 1;">${trendInfo.label}</div>
            </div>
        </div>
        <div class="grid-triple">
           <div class="box"><div class="box-h" style="color: #3498db;">IOB</div><div class="box-v">${getState(this._config.iob_entity)} U</div></div>
           <div class="box"><div class="box-h" style="color: #2ecc71;">COB</div><div class="box-v">${getState(this._config.cob_entity)} g</div></div>
           <div class="box"><div class="box-h" style="color: #e67e22;">REQ</div><div class="box-v">${getState(this._config.req_entity)}</div></div>
        </div>
        <div class="grid-double">
           <div class="box a1c-box"><div class="box-h" style="color: ${a1cColor}">EST. A1C</div><div class="box-v" style="color: ${a1cColor}">${a1c}%</div></div>
           <div class="box"><div class="box-h">SENSOR DAYS</div><div class="box-v" style="font-size: 1.1rem; line-height: 1.3;">${getState(this._config.days_entity)}</div></div>
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
  description: 'Stable T1D Card with Large Text, Circle Gauge, and Shady Background' 
});

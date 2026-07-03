/**
 * T1D Diabetes Card v1.60 - Full Professional Version
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

  /**
   * Safe service call execution wrapper
   */
  _callService(entity) {
    if (!entity || !this._hass) {
      return;
    }
    const parts = entity.split('.');
    if (parts.length !== 2) {
      return;
    }
    const domain = parts[0];
    const service = parts[1];
    this._hass.callService(domain, service, {});
  }

  /**
   * Processes Dexcom API trend strings to arrow symbols
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

  /**
   * Computes an estimated A1C percentage from glucose values
   */
  _calculateA1c(glucose, unit) {
    if (isNaN(glucose)) {
      return "N/A";
    }
    const val = unit === "mmol/L" ? (glucose * 18.018) : glucose;
    return ((val + 46.7) / 28.7).toFixed(1);
  }

  /**
   * Determines dynamic border colors based on glucose readings
   */
  _getGlucoseColor(glucoseVal, unit) {
    if (isNaN(glucoseVal)) {
      return "#00bb00";
    }
    if (unit === "mmol/L") {
      if (glucoseVal < 4.0 || glucoseVal > 10.0) {
        return "#e74c3c";
      } else if (glucoseVal > 7.8) {
        return "#e67e22";
      }
      return "#00bb00";
    } else {
      if (glucoseVal < 70 || glucoseVal > 180) {
        return "#e74c3c";
      } else if (glucoseVal > 140) {
        return "#e67e22";
      }
      return "#00bb00";
    }
  }

  /**
   * Determines dynamic colors for the A1C display block
   */
  _getA1cColor(a1c) {
    const a1cNum = parseFloat(a1c);
    if (isNaN(a1cNum)) {
      return "#00bb00";
    }
    if (a1cNum >= 6.5) {
      return "#e74c3c";
    } else if (a1cNum >= 5.7) {
      return "#e67e22";
    }
    return "#00bb00";
  }

  _render() {
    if (!this._config || !this._hass) {
      return;
    }

    const getState = (entityId) => {
      if (entityId && this._hass.states[entityId]) {
        return this._hass.states[entityId].state;
      }
      return "N/A";
    };
    
    const glucoseVal = parseFloat(getState(this._config.entity));
    const trend = getState(this._config.trend_entity);
    const trendInfo = this._getTrendInfo(trend);
    const unit = this._config.unit_type || "mmol/L";
    const a1c = this._calculateA1c(glucoseVal, unit);
    
    const glucoseColor = this._getGlucoseColor(glucoseVal, unit);
    const a1cColor = this._getA1cColor(a1c);

    this.shadowRoot.innerHTML = `
      <style>
        ha-card { 
          background: rgba(0, 25, 10, 0.4); 
          border: 1.5px solid #00bb00; 
          border-radius: 16px; 
          padding: 20px; 
          color: white; 
          font-family: sans-serif;
        }
        .card-title {
          font-size: 1.4rem;
          font-weight: bold;
          margin-bottom: 16px;
          color: white;
        }
        .header { 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          margin-bottom: 24px; 
        }
        .glucose-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 5px solid ${glucoseColor};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
        }
        .val { 
          font-size: 2.6rem; 
          font-weight: bold; 
          line-height: 1.1;
        }
        .unit-label {
          font-size: 0.95rem;
          color: #ccc;
          margin-top: 2px;
        }
        .trend-container {
          text-align: center;
          margin-right: 14px;
        }
        .trend-text {
          font-size: 1.2rem;
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
          padding: 14px; 
          border-radius: 10px; 
          text-align: center; 
          background: rgba(0, 0, 0, 0.2);
        }
        .a1c-box { 
          border: 2px solid ${a1cColor}; 
        }
        .box-h { 
          font-weight: bold; 
          font-size: 1rem; 
          margin-bottom: 8px; 
          text-transform: uppercase;
        }
        .box-v {
          font-size: 1.5rem;
          font-weight: bold;
        }
        .btn { 
          border: 1px solid #00bb00; 
          padding: 18px; 
          border-radius: 8px; 
          text-align: center; 
          cursor: pointer; 
          font-weight: bold; 
          font-size: 1.3rem;
          color: #00bb00; 
          margin-top: 14px; 
          background: rgba(0, 0, 0, 0.2);
        }
        .btn:hover {
          background: rgba(0, 187, 0, 0.1);
        }
      </style>
      <ha-card>
        ${this._config.title ? `<div class="card-title">${this._config.title}</div>` : ''}
        <div class="header">
            <div class="glucose-circle">
                <div class="val">${getState(this._config.entity)}</div>
                <div class="unit-label">${unit}</div>
            </div>
            <div class="trend-container">
                <div class="trend-text">${trend}</div>
                <div style="font-size: 3.8rem; line-height: 1;">${trendInfo.label}</div>
            </div>
        </div>
        <div class="grid-triple">
           <div class="box"><div class="box-h" style="color: #3498db;">IOB</div><div class="box-v">${getState(this._config.iob_entity)} U</div></div>
           <div class="box"><div class="box-h" style="color: #2ecc71;">COB</div><div class="box-v">${getState(this._config.cob_entity)} g</div></div>
           <div class="box"><div class="box-h" style="color: #e67e22;">REQ</div><div class="box-v">${getState(this._config.req_entity)}</div></div>
        </div>
        <div class="grid-double">
           <div class="box a1c-box"><div class="box-h" style="color: ${a1cColor}">EST. A1C</div><div class="box-v" style="color: ${a1cColor}">${a1c}%</div></div>
           <div class="box"><div class="box-h">SENSOR DAYS</div><div class="box-v" style="font-size: 1.15rem; line-height: 1.3;">${getState(this._config.days_entity)}</div></div>
        </div>
        <div class="btn" id="alexa1">${this._config.alexa_name_1 || "Alexa 1"}</div>
        <div class="btn" id="alexa2">${this._config.alexa_name_2 || "Alexa 2"}</div>
      </ha-card>
    `;

    this.shadowRoot.querySelector('#alexa1').addEventListener('click', () => {
      this._callService(this._config.alexa_1);
    });
    
    this.shadowRoot.querySelector('#alexa2').addEventListener('click', () => {
      this._callService(this._config.alexa_2);
    });
  }
}

/**
 * Visual Form Editor Component
 */
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
      {
        name: "title",
        label: "Card Title",
        selector: { text: {} }
      },
      {
        name: "unit_type",
        label: "Glucose Units",
        selector: { select: { options: ["mg/dL", "mmol/L"] } }
      },
      {
        name: "entity",
        label: "Glucose Sensor (Main)",
        selector: { entity: { domain: "sensor" } }
      },
      {
        name: "trend_entity",
        label: "Trend Direction Sensor",
        selector: { entity: { domain: "sensor" } }
      },
      {
        name: "iob_entity",
        label: "Insulin On Board (IOB) Sensor",
        selector: { entity: { domain: "sensor" } }
      },
      {
        name: "cob_entity",
        label: "Carbs On Board (COB) Sensor",
        selector: { entity: { domain: "sensor" } }
      },
      {
        name: "req_entity",
        label: "Required Change (REQ) Sensor",
        selector: { entity: { domain: "sensor" } }
      },
      {
        name: "days_entity",
        label: "Sensor Lifetime / Countdown Sensor",
        selector: { entity: { domain: "sensor" } }
      },
      {
        name: "alexa_name_1",
        label: "First Button Label",
        selector: { text: {} }
      },
      {
        name: "alexa_1",
        label: "First Button Script Target",
        selector: { entity: { domain: "script" } }
      },
      {
        name: "alexa_name_2",
        label: "Second Button Label",
        selector: { text: {} }
      },
      {
        name: "alexa_2",
        label: "Second Button Script Target",
        selector: { entity: { domain: "script" } }
      }
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

// Global Registration Sequence
customElements.define('t1d-diabetes-card', T1DDiabetesCard);
customElements.define('t1d-diabetes-card-editor', T1DDiabetesCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({ 
  type: 't1d-diabetes-card', 
  name: 'T1DDiabetesCard', 
  preview: true, 
  description: 'Production T1D UI Component featuring Adaptive Color Gauges and Script Triggers.' 
});

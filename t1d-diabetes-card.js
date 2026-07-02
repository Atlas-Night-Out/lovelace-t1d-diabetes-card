// ==========================================
// PART 1: THE DISPLAY CARD
// ==========================================
class T1DDiabetesCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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

  static getConfigElement() {
    return document.createElement("t1d-diabetes-card-editor");
  }

  setConfig(config) {
    if (!config.entity) throw new Error("Please define a blood glucose entity");
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;

    const bgEntity = hass.states[this._config.entity];
    const daysEntity = hass.states[this._config.days_left_entity];
    const iobEntity = hass.states[this._config.iob_entity];
    const cobEntity = hass.states[this._config.cob_entity];
    const reqEntity = hass.states[this._config.req_entity];
    const a1cEntity = hass.states[this._config.a1c_entity];

    if (!bgEntity) return;

    // Extracting Trend Arrows natively from attributes
    const direction = bgEntity.attributes.direction || bgEntity.attributes.trend || '';
    const arrowMap = {
      'Flat': '→', 'Stable': '→', '→': '→',
      'FortyFiveUp': '↗', '↗': '↗',
      'SingleUp': '↑', '↑': '↑',
      'DoubleUp': '⇈', '⇈': '⇈',
      'FortyFiveDown': '↘', '↘': '↘',
      'SingleDown': '↓', '↓': '↓',
      'DoubleDown': '⇊', '⇊': '⇊'
    };
    const trendArrow = arrowMap[direction] || '';

    // Safeguard values against undefined selections
    const countdownText = daysEntity ? daysEntity.state : 'N/A';
    const iobValue = iobEntity ? `${iobEntity.state} ${iobEntity.attributes.unit_of_measurement || 'U'}` : '0.0 U';
    const cobValue = cobEntity ? `${cobEntity.state} ${cobEntity.attributes.unit_of_measurement || 'g'}` : '0 g';
    const reqValue = reqEntity ? `${reqEntity.state} ${reqEntity.attributes.unit_of_measurement || 'g'}` : '0 g';
    const a1cValue = a1cEntity ? `${a1cEntity.state}%` : null;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --card-bg: rgba(28, 28, 30, 0.95);
          --text-color: #ffffff;
        }
        .card {
          background: var(--card-bg);
          color: var(--text-color);
          padding: 16px;
          border-radius: 12px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .main-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .bg-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bg-value {
          font-size: 2.6rem;
          font-weight: bold;
          letter-spacing: -1px;
        }
        .trend-arrow {
          font-size: 2rem;
          color: #a0a0a5;
        }
        .right-panel {
          text-align: right;
          font-size: 0.85rem;
          color: #a0a0a5;
          line-height: 1.3;
        }
        .countdown-text {
          font-weight: bold;
          color: #ffffff;
        }
        .meta-line {
          font-size: 0.85rem;
          color: #a0a0a5;
          margin-top: -6px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .stat-box {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 10px 6px;
          border-radius: 8px;
          text-align: center;
        }
        .stat-label {
          font-size: 0.65rem;
          color: #a0a0a5;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 4px;
          letter-spacing: 0.5px;
        }
        .stat-val {
          font-size: 0.95rem;
          font-weight: bold;
          color: #4cd964;
        }
        .alexa-btn {
          background: #00a0e0;
          color: white;
          border: none;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.1s;
        }
        .alexa-btn:hover { background: #0082b3; }
        .alexa-btn:active { transform: scale(0.98); }
      </style>

      <div class="card">
        ${this._config.show_title ? `<h3 style="margin: 0; font-size: 1.1rem; color: #a0a0a5;">${this._config.title || 'Diabetes Tracker'}</h3>` : ''}
        
        <div class="main-row">
          <div class="bg-container">
            <div class="bg-value">${bgEntity.state}</div>
            ${trendArrow ? `<div class="trend-arrow">${trendArrow}</div>` : ''}
          </div>
          <div class="right-panel">
            <div>Sensor Expires in:</div>
            <div class="countdown-text">${countdownText}</div>
          </div>
        </div>

        ${a1cValue ? `<div class="meta-line">Estimated A1c: <span style="color:#fff; font-weight:bold;">${a1cValue}</span></div>` : ''}

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-label">IOB</div>
            <div class="stat-val">${iobValue}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">COB</div>
            <div class="stat-val" style="color: #00a0e0;">${cobValue}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Carbs Req</div>
            <div class="stat-val" style="color: #ffcc00;">${reqValue}</div>
          </div>
        </div>

        ${this._config.alexa_entity ? `
          <button class="alexa-btn" id="alexa-trigger">
            <span>🔊</span> Ask Alexa to Read Aloud
          </button>
        ` : ''}
      </div>
    `;

    const btn = this.shadowRoot.getElementById('alexa-trigger');
    if (btn) {
      btn.onclick = () => this._triggerAlexaReadout();
    }
  }

  _triggerAlexaReadout() {
    const target = this._config.alexa_entity;
    if (!target) return;

    if (target.startsWith('script.')) {
      // Safely calls your native custom script sequence
      const scriptName = target.split('.')[1];
      this._hass.callService('script', scriptName);
    } else {
      const bg = this._hass.states[this._config.entity]?.state || 'unknown';
      this._hass.callService('tts', 'google_translate_say', {
        entity_id: target,
        message: `Your current blood glucose reading is ${bg}.`
      });
    }
  }
}

customElements.define('t1d-diabetes-card', T1DDiabetesCard);


// ==========================================
// PART 2: THE VISUAL CODE EDITOR (SEARCHABLE!)
// ==========================================
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
    if (!this._hass || !this._config) return;

    const allEntities = Object.keys(this._hass.states);
    const sensors = allEntities.filter(e => e.startsWith('sensor.'));
    const listenables = allEntities.filter(e => e.startsWith('media_player.') || e.startsWith('script.'));

    this.shadowRoot.innerHTML = `
      <style>
        .form { font-family: sans-serif; display: flex; flex-direction: column; gap: 12px; }
        .form-row { display: flex; flex-direction: column; gap: 4px; }
        label { font-weight: bold; font-size: 0.85rem; color: var(--secondary-text-color, #e0e0e0); }
        input {
          padding: 10px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.2);
          background: var(--card-background-color, #2c2c2e);
          color: var(--primary-text-color, #fff);
          font-size: 0.9rem;
        }
        input:focus { border-color: #00a0e0; outline: none; }
      </style>

      <div class="form">
        <div class="form-row">
          <label>Card Title</label>
          <input type="text" id="title" value="${this._config.title || ''}">
        </div>

        <!-- HTML5 Datalists inject immediate fuzzy-search capabilities into input bars -->
        <datalist id="sensor-options">
          ${sensors.map(e => `<option value="${e}"></option>`).join('')}
        </datalist>

        <datalist id="alexa-options">
          ${listenables.map(e => `<option value="${e}"></option>`).join('')}
        </datalist>

        <div class="form-row">
          <label>Blood Glucose Sensor (Required)</label>
          <input type="text" id="entity" list="sensor-options" value="${this._config.entity || ''}">
        </div>

        <div class="form-row">
          <label>Sensor Expiry/Countdown Sensor</label>
          <input type="text" id="days_left_entity" list="sensor-options" value="${this._config.days_left_entity || ''}">
        </div>

        <div class="form-row">
          <label>Insulin On Board (IOB) Sensor</label>
          <input type="text" id="iob_entity" list="sensor-options" value="${this._config.iob_entity || ''}">
        </div>

        <div class="form-row">
          <label>Carbs On Board (COB) Sensor</label>
          <input type="text" id="cob_entity" list="sensor-options" value="${this._config.cob_entity || ''}">
        </div>

        <div class="form-row">
          <label>Carbs Required (REQ) Sensor</label>
          <input type="text" id="req_entity" list="sensor-options" value="${this._config.req_entity || ''}">
        </div>

        <div class="form-row">
          <label>Estimated A1c Sensor (Optional)</label>
          <input type="text" id="a1c_entity" list="sensor-options" value="${this._config.a1c_entity || ''}">
        </div>

        <div class="form-row">
          <label>Alexa Target (Supports media_player or script.alexa_type_one_dave)</label>
          <input type="text" id="alexa_entity" list="alexa-options" value="${this._config.alexa_entity || ''}">
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll('input').forEach(el => {
      el.addEventListener('input', (ev) => this._valueChanged(ev));
    });
  }

  _valueChanged(ev) {
    if (!this._config || !this._hass) return;
    const target = ev.target;
    
    const newConfig = {
      ...this._config,
      [target.id]: target.value
    };

    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    }));
  }
}

customElements.define('t1d-diabetes-card-editor', T1DDiabetesCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "t1d-diabetes-card",
  name: "T1D Diabetes Tracker Card",
  preview: true,
  description: "An advanced, unified card tracking blood glucose metrics alongside localized IOB, COB, and REQ telemetry modules.",
});

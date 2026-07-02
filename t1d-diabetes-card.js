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
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;

    const bgEntity = this._config.entity ? hass.states[this._config.entity] : null;
    
    // Safety Net: Render a helpful layout if the main entity isn't fully set up yet
    if (!bgEntity) {
      this.shadowRoot.innerHTML = `
        <div style="padding: 16px; background: #1c1c1e; color: #ff3b30; border-radius: 12px; border: 1px solid #ff3b30; font-family: sans-serif;">
          <strong style="color: #ff453a;">T1D Diabetes Tracker Card</strong><br>
          <span style="font-size: 0.85rem; color: #e0e0e0;">Please select a valid Blood Glucose Sensor in the card configuration. Current: "${this._config.entity || 'None Selected'}"</span>
        </div>
      `;
      return;
    }

    const daysEntity = this._config.days_left_entity ? hass.states[this._config.days_left_entity] : null;
    const iobEntity = this._config.iob_entity ? hass.states[this._config.iob_entity] : null;
    const cobEntity = this._config.cob_entity ? hass.states[this._config.cob_entity] : null;
    const reqEntity = this._config.req_entity ? hass.states[this._config.req_entity] : null;
    const a1cEntity = this._config.a1c_entity ? hass.states[this._config.a1c_entity] : null;

    // Fallback Parsing for Trend Arrows
    const direction = (bgEntity.attributes.direction || bgEntity.attributes.trend || bgEntity.attributes.trend_arrow || '').toLowerCase();
    let trendArrow = '→';
    if (direction.includes('up')) {
      trendArrow = direction.includes('double') ? '⇈' : (direction.includes('fortyfive') || direction.includes('45') ? '↗' : '↑');
    } else if (direction.includes('down')) {
      trendArrow = direction.includes('double') ? '⇊' : (direction.includes('fortyfive') || direction.includes('45') ? '↘' : '↓');
    } else if (direction.includes('flat') || direction.includes('stable')) {
      trendArrow = '→';
    } else if (bgEntity.attributes.direction || bgEntity.attributes.trend) {
      trendArrow = bgEntity.attributes.direction || bgEntity.attributes.trend;
    }

    // Dynamic Circular Indicator Logic
    const bgVal = parseFloat(bgEntity.state);
    let circleColor = '#4cd964'; // Green
    if (!isNaN(bgVal)) {
      if (bgVal < 4.0) circleColor = '#ff3b30'; // Low Red
      else if (bgVal > 10.0) circleColor = '#ff9500'; // High Orange
    }

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
        .bg-circle-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 76px;
          height: 76px;
          border-radius: 50%;
          border: 4px solid ${circleColor};
          position: relative;
          background: rgba(255, 255, 255, 0.02);
        }
        .bg-value {
          font-size: 1.9rem;
          font-weight: bold;
          letter-spacing: -0.5px;
        }
        .trend-arrow-overlay {
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: #1c1c1e;
          border-radius: 50%;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          border: 2px solid ${circleColor};
          color: #ffffff;
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
          margin-top: -4px;
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
        }
      </style>

      <div class="card">
        ${this._config.show_title ? `<h3 style="margin: 0; font-size: 1.1rem; color: #a0a0a5;">${this._config.title || 'Diabetes Tracker'}</h3>` : ''}
        
        <div class="main-row">
          <div class="bg-circle-badge">
            <div class="bg-value">${bgEntity.state}</div>
            <div class="trend-arrow-overlay">${trendArrow}</div>
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
      this._hass.callService('script', target.split('.')[1]);
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
// PART 2: THE NATIVE UI CONFIGURATION EDITOR
// ==========================================
class T1DDiabetesCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._hass || !this._config) return;

    this.shadowRoot.innerHTML = `
      <style>
        .form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 10px 0;
        }
        ha-entity-picker, ha-textfield {
          display: block;
          width: 100%;
        }
      </style>

      <div class="form">
        <ha-textfield 
          id="title" 
          label="Card Title" 
          .value="${this._config.title || ''}">
        </ha-textfield>

        <ha-entity-picker 
          id="entity" 
          label="Blood Glucose Sensor (Required)" 
          .hass=${this._hass} 
          .value=${this._config.entity || ''} 
          include-domains='["sensor"]'
          allow-custom-entity>
        </ha-entity-picker>

        <ha-entity-picker 
          id="days_left_entity" 
          label="Sensor Expiry / Countdown Sensor" 
          .hass=${this._hass} 
          .value=${this._config.days_left_entity || ''} 
          include-domains='["sensor"]'
          allow-custom-entity>
        </ha-entity-picker>

        <ha-entity-picker 
          id="iob_entity" 
          label="Insulin On Board (IOB) Sensor" 
          .hass=${this._hass} 
          .value=${this._config.iob_entity || ''} 
          include-domains='["sensor"]'
          allow-custom-entity>
        </ha-entity-picker>

        <ha-entity-picker 
          id="cob_entity" 
          label="Carbs On Board (COB) Sensor" 
          .hass=${this._hass} 
          .value=${this._config.cob_entity || ''} 
          include-domains='["sensor"]'
          allow-custom-entity>
        </ha-entity-picker>

        <ha-entity-picker 
          id="req_entity" 
          label="Carbs Required (REQ) Sensor" 
          .hass=${this._hass} 
          .value=${this._config.req_entity || ''} 
          include-domains='["sensor"]'
          allow-custom-entity>
        </ha-entity-picker>

        <ha-entity-picker 
          id="a1c_entity" 
          label="Estimated A1c Sensor (Optional)" 
          .hass=${this._hass} 
          .value=${this._config.a1c_entity || ''} 
          include-domains='["sensor"]'
          allow-custom-entity>
        </ha-entity-picker>

        <ha-entity-picker 
          id="alexa_entity" 
          label="Alexa Target (media_player or script string)" 
          .hass=${this._hass} 
          .value=${this._config.alexa_entity || ''} 
          include-domains='["media_player", "script"]'
          allow-custom-entity>
        </ha-entity-picker>
      </div>
    `;

    // Attach native event bindings to capture entries smoothly without layout loss
    this.shadowRoot.querySelectorAll('ha-entity-picker, ha-textfield').forEach(el => {
      el.addEventListener('value-changed', (ev) => this._valueChanged(ev));
      el.addEventListener('change', (ev) => this._valueChanged(ev));
    });
  }

  _valueChanged(ev) {
    if (!this._config || !this._hass) return;
    const target = ev.target;
    const newValue = ev.detail && ev.detail.value !== undefined ? ev.detail.value : target.value;
    
    if (this._config[target.id] === newValue) return;

    this._config = {
      ...this._config,
      [target.id]: newValue
    };

    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
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
  description: "An advanced unified dashboard monitoring continuous blood telemetry modules alongside typeahead search configurations.",
});

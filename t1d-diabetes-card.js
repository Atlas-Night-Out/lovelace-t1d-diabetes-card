// ==========================================
// PART 1: THE MAIN DISPLAY CARD
// ==========================================
class T1DDiabetesCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static getStubConfig() {
    return {
      title: "Blood Glucose",
      entity: "",
      days_left_entity: "",
      iob_entity: "",
      cob_entity: "",
      req_entity: "",
      alexa_entity: "",
      high_threshold: 10.0,
      low_threshold: 3.9,
      show_title: true,
      show_days_left: true
    };
  }

  // Tells Home Assistant where to find the Visual Editor code block
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

    if (!bgEntity) return;

    // Preserves your full sensor countdown string verbatim (e.g. "3 days, 7 hours...")
    const countdownText = daysEntity ? daysEntity.state : 'N/A';
    const iobValue = iobEntity ? `${iobEntity.state} ${iobEntity.attributes.unit_of_measurement || 'U'}` : '0.0 U';
    const cobValue = cobEntity ? `${cobEntity.state} ${cobEntity.attributes.unit_of_measurement || 'g'}` : '0 g';
    const reqValue = reqEntity ? `${reqEntity.state} ${reqEntity.attributes.unit_of_measurement || 'g'}` : '0 g';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --card-bg: rgba(28, 28, 30, 0.9);
          --text-color: #ffffff;
        }
        .card {
          background: var(--card-bg);
          color: var(--text-color);
          padding: 16px;
          border-radius: 12px;
          font-family: sans-serif;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .main-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .left-panel {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .right-panel {
          text-align: right;
          font-size: 0.9rem;
          color: #a0a0a5;
        }
        .countdown-text {
          font-weight: bold;
          color: #ffffff;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 4px;
        }
        .stat-box {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px;
          border-radius: 6px;
          text-align: center;
          font-size: 0.85rem;
        }
        .stat-label {
          font-size: 0.65rem;
          color: #a0a0a5;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .stat-val {
          font-weight: bold;
          color: #4cd964;
        }
        .alexa-btn {
          background: #00a0e0;
          color: white;
          border: none;
          padding: 10px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 4px;
          transition: background 0.2s;
        }
        .alexa-btn:hover {
          background: #0082b3;
        }
      </style>

      <div class="card">
        ${this._config.show_title ? `<h3>${this._config.title || 'Diabetes Tracker'}</h3>` : ''}
        <div class="main-row">
          <div class="left-panel">
            <div class="bg-value" style="font-size: 2.2rem; font-weight: bold;">${bgEntity.state}</div>
          </div>
          <div class="right-panel">
            ${this._config.show_days_left ? `<div>Sensor Expires in:<br><span class="countdown-text">${countdownText}</span></div>` : ''}
          </div>
        </div>

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
      btn.addEventListener('click', () => this._triggerAlexaReadout());
    }
  }

  _triggerAlexaReadout() {
    const bg = this._hass.states[this._config.entity]?.state || 'unknown';
    const iob = this._hass.states[this._config.iob_entity]?.state || '0';
    
    this._hass.callService('tts', 'google_translate_say', {
      entity_id: this._config.alexa_entity,
      message: `Attention. Current blood glucose is ${bg}. Insulin on board is ${iob} units.`
    });
  }
}

customElements.define('t1d-diabetes-card', T1DDiabetesCard);


// ==========================================
// PART 2: THE VISUAL CODE EDITOR LAYOUT 
// (This creates the dropdown menu fields in the UI)
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

    // Filter down Home Assistant entities to populate our selection dropdowns
    const allEntities = Object.keys(this._hass.states);
    const sensors = allEntities.filter(e => e.startsWith('sensor.'));
    const mediaPlayers = allEntities.filter(e => e.startsWith('media_player.'));

    this.shadowRoot.innerHTML = `
      <style>
        .form-row {
          margin-bottom: 14px;
          display: flex;
          flex-direction: column;
          font-family: sans-serif;
        }
        label {
          font-weight: bold;
          margin-bottom: 4px;
          font-size: 0.9rem;
        }
        select, input {
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #ccc;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color, #000);
        }
      </style>

      <div class="form">
        <div class="form-row">
          <label>Card Title</label>
          <input type="text" id="title" value="${this._config.title || ''}">
        </div>

        <div class="form-row">
          <label>Blood Glucose Sensor (Required)</label>
          <select id="entity">
            <option value="">Select an entity</option>
            ${sensors.map(e => `<option value="${e}" ${this._config.entity === e ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
        </div>

        <div class="form-row">
          <label>Sensor Expiry/Countdown Sensor</label>
          <select id="days_left_entity">
            <option value="">None</option>
            ${sensors.map(e => `<option value="${e}" ${this._config.days_left_entity === e ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
        </div>

        <div class="form-row">
          <label>Insulin On Board (IOB) Sensor</label>
          <select id="iob_entity">
            <option value="">None</option>
            ${sensors.map(e => `<option value="${e}" ${this._config.iob_entity === e ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
        </div>

        <div class="form-row">
          <label>Carbs On Board (COB) Sensor</label>
          <select id="cob_entity">
            <option value="">None</option>
            ${sensors.map(e => `<option value="${e}" ${this._config.cob_entity === e ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
        </div>

        <div class="form-row">
          <label>Carbs Required (REQ) Sensor</label>
          <select id="req_entity">
            <option value="">None</option>
            ${sensors.map(e => `<option value="${e}" ${this._config.req_entity === e ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
        </div>

        <div class="form-row">
          <label>Alexa Media Player Target</label>
          <select id="alexa_entity">
            <option value="">None</option>
            ${mediaPlayers.map(e => `<option value="${e}" ${this._config.alexa_entity === e ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
        </div>
      </div>
    `;

    // Add UI change listeners to automatically update config settings when dropdowns change
    this.shadowRoot.querySelectorAll('select, input').forEach(element => {
      element.addEventListener('change', (ev) => this._valueChanged(ev));
    });
  }

  _valueChanged(ev) {
    if (!this._config || !this._hass) return;
    const target = ev.target;
    
    const newConfig = {
      ...this._config,
      [target.id]: target.value
    };

    // Dispatches configuration changes back up to the Home Assistant dashboard engine
    const event = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define('t1d-diabetes-card-editor', T1DDiabetesCardEditor);

// Connects our custom card to Home Assistant's card list registration database
window.customCards = window.customCards || [];
window.customCards.push({
  type: "t1d-diabetes-card",
  name: "T1D Diabetes Tracker Card",
  preview: true,
  description: "An advanced, unified card tracking blood glucose metrics alongside localized IOB, COB, and REQ telemetry modules.",
});

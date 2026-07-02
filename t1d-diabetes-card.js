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
      show_days_left: true,
      show_a1c: true
    };
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

    // Pull full countdown string without truncating hours and minutes
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
        /* Sleek mini grid for IOB, COB, REQ boxes */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 4px;
        }
        .stat-box {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 6px;
          border-radius: 6px;
          text-align: center;
          font-size: 0.8rem;
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
        /* Custom Alexa Readout Button */
        .alexa-btn {
          background: #00a0e0;
          color: white;
          border: none;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.2s;
        }
        .alexa-btn:hover {
          background: #0082b3;
        }
      </style>

      <div class="card">
        ${this._config.show_title ? `<h3>${this._config.title}</h3>` : ''}
        <div class="main-row">
          <div class="left-panel">
            <div class="bg-value" style="font-size: 2rem; font-weight: bold;">${bgEntity.state}</div>
          </div>
          <div class="right-panel">
            ${this._config.show_days_left ? `<div>Sensor Expires in: <span class="countdown-text">${countdownText}</span></div>` : ''}
          </div>
        </div>

        <!-- Integrated Info Grid -->
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-label">IOB</div>
            <div class="stat-val">${iobValue}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">COB</div>
            <div class="stat-val">${cobValue}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Carbs Req</div>
            <div class="stat-val" style="color: #ffcc00;">${reqValue}</div>
          </div>
        </div>

        <!-- Alexa Readout Trigger Button -->
        ${this._config.alexa_entity ? `
          <button class="alexa-btn" id="alexa-trigger">
            <span>🔊</span> Read to Alexa
          </button>
        ` : ''}
      </div>
    `;

    // Hook up click event listener for the button
    const btn = this.shadowRoot.getElementById('alexa-trigger');
    if (btn) {
      btn.addEventListener('click', () => this._triggerAlexaReadout());
    }
  }

  _triggerAlexaReadout() {
    // Dispatches service call to read stats through the configured Alexa entity
    this._hass.callService('media_player', 'alexa_tts', {
      entity_id: this._config.alexa_entity,
      message: `Your current blood glucose is ${this._hass.states[this._config.entity].state}. Insulin on Board is ${this._hass.states[this._config.iob_entity]?.state || 0} units.`
    });
  }
}

customElements.define('t1d-diabetes-card', T1DDiabetesCard);

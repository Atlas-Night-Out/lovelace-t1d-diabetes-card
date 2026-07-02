// ==========================================
// T1D DIABETES TRACKER CARD (FULL CODE)
// ==========================================

// PART 1: THE DISPLAY CARD
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

    const bgEntity = this._config.entity ? hass.states[this._config.entity] : null;

    if (!bgEntity) {
      this.shadowRoot.innerHTML = `
        <div style="padding: 16px; background: #1c1c1e; color: #ff3b30; border-radius: 12px; border: 1px solid #ff3b30; font-family: sans-serif;">
          <strong style="color: #ff453a;">T1D Diabetes Tracker Card</strong><br>
          <span style="font-size: 0.85rem; color: #e0e0e0;">Please select a valid Blood Glucose Sensor.</span>
        </div>
      `;
      return;
    }

    const daysEntity = this._config.days_left_entity ? hass.states[this._config.days_left_entity] : null;
    const iobEntity = this._config.iob_entity ? hass.states[this._config.iob_entity] : null;
    const cobEntity = this._config.cob_entity ? hass.states[this._config.cob_entity] : null;
    const reqEntity = this._config.req_entity ? hass.states[this._config.req_entity] : null;
    const a1cEntity = this._config.a1c_entity ? hass.states[this._config.a1c_entity] : null;

    const direction = (bgEntity.attributes.direction || bgEntity.attributes.trend || bgEntity.attributes.trend_arrow || '').toLowerCase();
    let trendArrow = '→';
    if (direction.includes('up')) {
      trendArrow = direction.includes('double') ? '⇈' : (direction.includes('fortyfive') || direction.includes('45') ? '↗' : '↑');
    } else if (direction.includes('down')) {
      trendArrow = direction.includes('double') ? '⇊' : (direction.includes('fortyfive') || direction.includes('45') ? '↘' : '↓');
    }

    const bgVal = parseFloat(bgEntity.state);
    let circleColor = '#4cd964';
    if (!isNaN(bgVal)) {
      if (bgVal < 4.0) circleColor = '#ff3b30';
      else if (bgVal > 10.0) circleColor = '#ff9500';
    }

    const countdownText = daysEntity ? daysEntity.state : 'N/A';
    const iobValue = iobEntity ? `${iobEntity.state} ${iobEntity.attributes.unit_of_measurement || 'U'}` : '0.0 U';
    const cobValue = cobEntity ? `${cobEntity.state} ${cobEntity.attributes.unit_of_measurement || 'g'}` : '0 g';
    const reqValue = reqEntity ? `${reqEntity.state} ${reqEntity.attributes.unit_of_measurement || 'g'}` : '0 g';
    const a1cValue = a1cEntity ? `${a1cEntity.state}%` : null;

    this.shadowRoot.innerHTML = `
      <style>
        :host { --card-bg: rgba(28, 28, 30, 0.95); --text-color: #ffffff; }
        .card { background: var(--card-bg); color: var(--text-color); padding: 16px; border-radius: 12px; font-family: sans-serif; display: flex; flex-direction: column; gap: 14px; }
        .main-row { display: flex; justify-content: space-between; align-items: center; }
        .bg-circle-badge { display: flex; align-items: center; justify-content: center; width: 76px; height: 76px; border-radius: 50%; border: 4px solid ${circleColor}; position: relative; }
        .bg-value { font-size: 1.9rem; font-weight: bold; }
        .trend-arrow-overlay { position: absolute; bottom: -4px; right: -4px; background: #1c1c1e; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; border: 2px solid ${circleColor}; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .stat-box { background: rgba(255, 255, 255, 0.06); padding: 10px 6px; border-radius: 8px; text-align: center; }
        .stat-label { font-size: 0.65rem; color: #a0a0a5; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
        .stat-val { font-size: 0.95rem; font-weight: bold; color: #4cd964; }
        .alexa-btn { background: #00a0e0; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold; }
      </style>
      <div class="card">
        ${this._config.show_title ? `<h3 style="margin: 0; font-size: 1.1rem; color: #a0a0a5;">${this._config.title || 'Diabetes Tracker'}</h3>` : ''}
        <div class="main-row">
          <div class="bg-circle-badge">
            <div class="bg-value">${bgEntity.state}</div>
            <div class="trend-arrow-overlay">${trendArrow}</div>
          </div>
          <div style="text-align: right; font-size: 0.85rem; color: #a0a0a5;">
            <div>Sensor Expires in:</div><div style="font-weight:bold; color: #fff;">${countdownText}</div>
          </div>
        </div>
        ${a1cValue ? `<div style="font-size: 0.85rem; color: #a0a0a5;">Estimated A1c: <span style="color:#fff; font-weight:bold;">${a1cValue}</span></div>` : ''}
        <div class="stats-grid">
          <div class="stat-box"><div class="stat-label">IOB</div><div class="stat-val">${iobValue}</div></div>
          <div class="stat-box"><div class="stat-label">COB</div><div class="stat-val" style="color: #00a0e0;">${cobValue}</div></div>
          <div class="stat-box"><div class="stat-label">Carbs Req</div><div class="stat-val" style="color: #ffcc00;">${reqValue}</div></div>
        </div>
        ${this._config.alexa_entity ? `<button class="alexa-btn" id="alexa-trigger">Ask Alexa to Read Aloud</button>` : ''}
      </div>
    `;
    const btn = this.shadowRoot.getElementById('alexa-trigger');
    if (btn) btn.onclick = () => this._triggerAlexaReadout();
  }

  _triggerAlexaReadout() {
    const target = this._config.alexa_entity;
    if (!target) return;
    if (target.startsWith('script.')) this._hass.callService('script', target.split('.')[1]);
    else this._hass.callService('tts', 'google_translate_say', { entity_id: target, message: `Your current blood glucose reading is ${this._hass.states[this._config.entity]?.state}.` });
  }
}
customElements.define('t1d-diabetes-card', T1DDiabetesCard);

// PART 2: THE CONFIGURATION EDITOR (With Native Search)
class T1DDiabetesCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  setConfig(config) { this._config = config; }
  set hass(hass) {
    this._hass = hass;
    this._render();
  }
  _render() {
    if (!this._hass || !this._config) return;
    this.shadowRoot.innerHTML = `
      <style>
        .form { display: flex; flex-direction: column; gap: 16px; padding: 10px 0; }
        .form-row { display: flex; flex-direction: column; gap: 8px; }
        label { font-weight: bold; font-size: 0.9rem; color: var(--secondary-text-color); }
      </style>
      <div class="form">
        <div class="form-row"><label>Card Title</label><input type="text" id="title" value="${this._config.title || ''}" style="padding:8px; border:1px solid var(--divider-color); border-radius:4px;"></div>
        ${this._createPicker("Blood Glucose Sensor", "entity", "sensor")}
        ${this._createPicker("Sensor Expiry/Countdown Sensor", "days_left_entity", "sensor")}
        ${this._createPicker("Insulin On Board (IOB) Sensor", "iob_entity", "sensor")}
        ${this._createPicker("Carbs On Board (COB) Sensor", "cob_entity", "sensor")}
        ${this._createPicker("Carbs Required (REQ) Sensor", "req_entity", "sensor")}
        ${this._createPicker("Estimated A1c Sensor (Optional)", "a1c_entity", "sensor")}
        ${this._createPicker("Alexa Target", "alexa_entity", "media_player")}
      </div>
    `;
    this.shadowRoot.querySelectorAll('ha-entity-picker, input').forEach(el => {
      el.addEventListener('value-changed', (ev) => this._valueChanged(ev));
      el.addEventListener('input', (ev) => this._valueChanged(ev));
    });
  }
  _createPicker(label, id, domain) {
    return `<div class="form-row"><label>${label}</label><ha-entity-picker .hass="${this._hass}" .value="${this._config[id] || ''}" .configValue="${id}" .includeDomains='["${domain}"]' allow-custom-entity></ha-entity-picker></div>`;
  }
  _valueChanged(ev) {
    const id = ev.target.configValue || ev.target.id;
    const value = ev.detail?.value !== undefined ? ev.detail.value : ev.target.value;
    if (this._config[id] === value) return;
    this._config = { ...this._config, [id]: value };
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
  }
}
customElements.define('t1d-diabetes-card-editor', T1DDiabetesCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({ type: "t1d-diabetes-card", name: "T1D Diabetes Tracker Card", preview: true, description: "Advanced dashboard with native searchable entity pickers." });

/**
 * T1D Diabetes Card & Configuration Suite
 * Corrected Production Code
 */

class T1DDiabetesCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement('t1d-diabetes-card-editor');
  }

  setConfig(config) {
    if (!config || !config.entity) {
      this.config = config || {};
      return;
    }
    this.config = config;
  }

  set hass(hass) {
    if (!this.config || !this.config.entity) {
      this.innerHTML = `<ha-card style="padding:16px;">Please configure a Blood Glucose entity in the card visual settings menu.</ha-card>`;
      return;
    }

    const entityId = this.config.entity;
    const stateObj = hass.states[entityId];

    if (!stateObj) {
      this.innerHTML = `<ha-card style="padding:16px; color:red;">Entity not found: ${entityId}</ha-card>`;
      return;
    }

    const bgValue = parseFloat(stateObj.state);
    const trend = stateObj.attributes.trend_arrow || stateObj.attributes.trend || '';
    const delta = stateObj.attributes.delta || stateObj.attributes.change || '';

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="card-header">--</div>
          <div class="card-grid">
            <div class="panel-left">
              <div class="glucose-ring">
                <span class="bg-value">--</span>
                <span class="unit-label">mmol/L</span>
              </div>
              <div class="status-pill">--</div>
            </div>
            <div class="panel-center">
              <span class="trend-arrow">→</span>
              <span class="trend-text">Steady</span>
            </div>
            <div class="panel-right">
              <div class="metric-badge">
                <div class="badge-title">Delta</div>
                <div class="delta-value">--</div>
              </div>
              <div class="metric-badge a1c-badge">
                <div class="badge-title">Est. A1C</div>
                <div class="sensor-status">--</div>
              </div>
            </div>
          </div>
        </ha-card>
        <style>
          ha-card { padding: 16px; background: #1c1c1e; border-radius: 16px; border: 1px solid #2c2c2e; color: #ffffff; }
          .card-header { font-size: 11px; font-weight: 600; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; margin-bottom: 12px; }
          .card-grid { display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 12px; }
          .panel-left, .panel-center { display: flex; flex-direction: column; align-items: center; flex: 1; }
          .glucose-ring { width: 85px; height: 85px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 4px solid #34c759; }
          .bg-value { font-size: 26px; font-weight: 700; }
          .unit-label { font-size: 10px; color: rgba(255, 255, 255, 0.5); }
          .status-pill { font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 12px; background: rgba(52, 199, 89, 0.15); color: #34c759; }
          .trend-arrow { font-size: 42px; line-height: 1; font-weight: bold; }
          .trend-text { font-size: 12px; color: rgba(255, 255, 255, 0.6); }
          .panel-right { display: flex; flex-direction: column; gap: 6px; flex: 1; }
          .metric-badge { background: #2c2c2e; padding: 6px 10px; border-radius: 8px; text-align: center; }
          .badge-title { font-size: 9px; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); }
          .delta-value, .sensor-status { font-size: 13px; font-weight: 600; }
        </style>
      `;
    }

    this.shadowRoot.querySelector('.card-header').textContent = this.config.title || 'Blood Glucose';
    this.shadowRoot.querySelector('.bg-value').textContent = stateObj.state;
    this.shadowRoot.querySelector('.delta-value').textContent = delta || '--';
    
    // A1C Calculation
    const a1c = ((bgValue + 46.7) / 28.7).toFixed(1);
    this.shadowRoot.querySelector('.sensor-status').textContent = a1c + '%';
  }
}
customElements.define('t1d-diabetes-card', T1DDiabetesCard);

class T1DDiabetesCardEditor extends HTMLElement {
  setConfig(config) { this._config = config || {}; }
  set hass(hass) {
    this._hass = hass;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this._render();
    }
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <div class="editor">
        <ha-entity-picker .hass="${this._hass}" .value="${this._config.entity || ''}" label="Blood Glucose Sensor" @value-changed="${(ev) => this._update('entity', ev.detail.value)}"></ha-entity-picker>
        <input type="text" id="title" placeholder="Card Title" .value="${this._config.title || ''}" @input="${(ev) => this._update('title', ev.target.value)}">
      </div>
      <style>
        .editor { display: flex; flex-direction: column; gap: 10px; padding: 10px; }
        input { padding: 8px; border-radius: 4px; border: 1px solid #444; background: #222; color: white; }
      </style>
    `;
  }
  _update(field, value) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { ...this._config, [field]: value } },
      bubbles: true, composed: true
    }));
  }
}
customElements.define('t1d-diabetes-card-editor', T1DDiabetesCardEditor);

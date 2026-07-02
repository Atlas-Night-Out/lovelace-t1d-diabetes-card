/**
 * T1D Diabetes Card & Configuration Suite
 * Fully Vanilla JS Compatible
 */

class T1DDiabetesCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement('t1d-diabetes-card-editor');
  }

  setConfig(config) {
    if (!config) return;
    this.config = config;
    this.render(); 
  }

  set hass(hass) {
    this._hass = hass;
    this.render(); 
  }

  render() {
    if (!this.config || !this._hass) return;

    const entityId = this.config.entity;
    const stateObj = entityId ? this._hass.states[entityId] : null;

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    if (!stateObj) {
      this.shadowRoot.innerHTML = `
        <ha-card style="padding: 16px; background: #1c1c1e; color: white; border-radius: 16px; border: 1px solid #2c2c2e;">
          Please configure a valid Blood Glucose Entity in the card visual editor.
        </ha-card>
      `;
      return;
    }

    const bgValue = parseFloat(stateObj.state);
    const trend = stateObj.attributes.trend_arrow || stateObj.attributes.trend || '→';
    const delta = stateObj.attributes.delta || stateObj.attributes.change || '--';
    const a1c = ((bgValue + 46.7) / 28.7).toFixed(1);

    this.shadowRoot.innerHTML = `
      <ha-card>
        <div class="card-header">${this.config.title || 'Blood Glucose'}</div>
        <div class="card-grid">
          <div class="panel-left">
            <div class="glucose-ring">
              <span class="bg-value">${stateObj.state}</span>
              <span class="unit-label">mmol/L</span>
            </div>
            <div class="status-pill">In Range</div>
          </div>
          <div class="panel-center">
            <span class="trend-arrow">${trend}</span>
            <span class="trend-text">Steady</span>
          </div>
          <div class="panel-right">
            <div class="metric-badge">
              <div class="badge-title">Delta</div>
              <div class="delta-value">${delta}</div>
            </div>
            <div class="metric-badge a1c-badge">
              <div class="badge-title">Est. A1C</div>
              <div class="sensor-status">${a1c}%</div>
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
        .status-pill { font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 12px; background: rgba(52, 199, 89, 0.15); color: #34c759; margin-top: 8px; }
        .trend-arrow { font-size: 42px; line-height: 1; font-weight: bold; }
        .trend-text { font-size: 12px; color: rgba(255, 255, 255, 0.6); }
        .panel-right { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .metric-badge { background: #2c2c2e; padding: 6px 10px; border-radius: 8px; text-align: center; }
        .badge-title { font-size: 9px; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); }
        .delta-value, .sensor-status { font-size: 13px; font-weight: 600; }
      </style>
    `;
  }
}
customElements.define('t1d-diabetes-card', T1DDiabetesCard);

class T1DDiabetesCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = config || {};
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._picker) {
      this._picker.hass = hass;
    }
    this.render();
  }

  render() {
    // Wait until both objects are loaded to prevent undefined crashes
    if (!this._hass || !this._config) return;

    if (!this._rendered) {
      this.shadowRoot.innerHTML = `
        <div class="editor">
          <div class="header">Card Configuration</div>
          <div id="picker-container"></div>
          <div class="input-group">
            <label>Card Title</label>
            <input type="text" id="title" placeholder="e.g. Blood Glucose">
          </div>
        </div>
        <style>
          .editor { display: flex; flex-direction: column; gap: 16px; padding: 8px; }
          .header { font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 8px; }
          .input-group { display: flex; flex-direction: column; gap: 4px; }
          label { font-size: 12px; color: var(--secondary-text-color); }
          input { padding: 10px; border-radius: 4px; border: 1px solid var(--divider-color, #444); background: var(--card-background-color, #222); color: var(--primary-text-color, white); }
        </style>
      `;

      // Construct ha-entity-picker programmatically so 'hass' isn't cast to a string
      this._picker = document.createElement('ha-entity-picker');
      this._picker.hass = this._hass;
      this._picker.value = this._config.entity || '';
      this._picker.label = 'Blood Glucose Sensor';
      this._picker.addEventListener('value-changed', (ev) => this._update('entity', ev.detail.value));
      
      this.shadowRoot.querySelector('#picker-container').appendChild(this._picker);

      const titleInput = this.shadowRoot.querySelector('#title');
      titleInput.value = this._config.title || '';
      titleInput.addEventListener('input', (ev) => this._update('title', ev.target.value));

      this._rendered = true;
    } else {
      if (this._picker) this._picker.value = this._config.entity || '';
      const titleInput = this.shadowRoot.querySelector('#title');
      if (titleInput) titleInput.value = this._config.title || '';
    }
  }

  _update(field, value) {
    if (!this._config) return;
    const newConfig = { ...this._config, [field]: value };
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true, composed: true
    }));
  }
}
customElements.define('t1d-diabetes-card-editor', T1DDiabetesCardEditor);

// Registration for Home Assistant Custom Card UI
window.customCards = window.customCards || [];
window.customCards.push({
  type: "t1d-diabetes-card",
  name: "T1D Diabetes Card",
  preview: true,
  description: "A customized dashboard card for monitoring blood glucose levels."
});

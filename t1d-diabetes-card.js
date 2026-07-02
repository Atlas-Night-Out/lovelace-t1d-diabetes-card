/**
 * T1D Diabetes Card - UI-Driven Configuration Suite
 */

class T1DDiabetesCard extends HTMLElement {
  static getConfigElement() { return document.createElement('t1d-diabetes-card-editor'); }

  setConfig(config) {
    if (!config || !config.entity) throw new Error("Entity is required");
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    const stateObj = hass.states[this.config.entity];
    if (!stateObj) return;

    // Use values from config, or fallback to '--'
    const getVal = (key) => this.config[key] ? hass.states[this.config[key]]?.state : '--';

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="header">${this.config.title || 'Diabetes Card'}</div>
          <div class="layout">
            <div class="ring">
              <span class="value">${stateObj.state}</span>
              <span class="unit">${this.config.units || 'mmol/L'}</span>
            </div>
            <div class="details">
              <div>IOB: ${getVal('iob_entity')}</div>
              <div>COB: ${getVal('cob_entity')}</div>
              <div>REQ: ${getVal('req_entity')}</div>
              <div>Ketones: ${getVal('ketones_entity')}</div>
            </div>
          </div>
        </ha-card>
        <style>
          ha-card { padding: 16px; background: #1c1c1e; color: white; border-radius: 16px; }
          .layout { display: flex; align-items: center; gap: 20px; }
          .ring { width: 80px; height: 80px; border: 4px solid #34c759; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
          .value { font-size: 20px; font-weight: bold; }
          .unit { font-size: 10px; }
          .details { font-size: 12px; }
        </style>
      `;
    }
  }
}
customElements.define('t1d-diabetes-card', T1DDiabetesCard);

class T1DDiabetesCardEditor extends HTMLElement {
  setConfig(config) { this._config = config || {}; }
  set hass(hass) { this._hass = hass; if (!this.shadowRoot) { this.attachShadow({ mode: 'open' }); this._render(); } }

  _render() {
    this.shadowRoot.innerHTML = `
      <div class="editor">
        <h3>Sensor Entities</h3>
        <ha-entity-picker .hass="${this._hass}" .value="${this._config.entity || ''}" label="Blood Glucose Sensor" @value-changed="${(ev) => this._update('entity', ev.detail.value)}"></ha-entity-picker>
        <ha-entity-picker .hass="${this._hass}" .value="${this._config.trend_entity || ''}" label="Trend Sensor" @value-changed="${(ev) => this._update('trend_entity', ev.detail.value)}"></ha-entity-picker>
        
        <h3>Additional Metrics</h3>
        <ha-entity-picker .hass="${this._hass}" .value="${this._config.iob_entity || ''}" label="IOB Sensor" @value-changed="${(ev) => this._update('iob_entity', ev.detail.value)}"></ha-entity-picker>
        <ha-entity-picker .hass="${this._hass}" .value="${this._config.cob_entity || ''}" label="COB Sensor" @value-changed="${(ev) => this._update('cob_entity', ev.detail.value)}"></ha-entity-picker>
        
        <h3>Settings</h3>
        <select @change="${(ev) => this._update('units', ev.target.value)}">
          <option value="mmol/L" ${this._config.units === 'mmol/L' ? 'selected' : ''}>mmol/L</option>
          <option value="mg/dL" ${this._config.units === 'mg/dL' ? 'selected' : ''}>mg/dL</option>
        </select>
      </div>
      <style>
        .editor { display: flex; flex-direction: column; gap: 10px; padding: 10px; }
        h3 { margin: 10px 0 5px 0; color: var(--secondary-text-color); font-size: 14px; }
      </style>
    `;
  }
  _update(field, value) {
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: { ...this._config, [field]: value } }, bubbles: true, composed: true }));
  }
}
customElements.define('t1d-diabetes-card-editor', T1DDiabetesCardEditor);

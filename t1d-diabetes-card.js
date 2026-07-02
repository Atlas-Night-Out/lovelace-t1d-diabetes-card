/**
 * T1D Diabetes Card - Full Production Suite
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

    const bg = parseFloat(stateObj.state);
    const getVal = (key) => this.config[key] ? hass.states[this.config[key]]?.state : '--';

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="card-header">${this.config.title || 'Blood Glucose'}</div>
          <div class="card-grid">
            <div class="glucose-ring"><span class="bg-value">--</span></div>
            <div class="metrics">
              <div class="row"><div>IOB:</div><span class="iob">--</span></div>
              <div class="row"><div>COB:</div><span class="cob">--</span></div>
              <div class="row"><div>REQ:</div><span class="req">--</span></div>
              <div class="row"><div>Ketones:</div><span class="ketones">--</span></div>
            </div>
          </div>
        </ha-card>
        <style>
          ha-card { padding: 16px; background: #1c1c1e; color: white; border-radius: 16px; }
          .card-grid { display: flex; align-items: center; gap: 20px; }
          .glucose-ring { width: 80px; height: 80px; border: 4px solid #34c759; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; }
          .metrics { display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
          .row { display: flex; justify-content: space-between; gap: 10px; }
        </style>
      `;
    }

    this.shadowRoot.querySelector('.bg-value').textContent = bg;
    this.shadowRoot.querySelector('.iob').textContent = getVal('iob_entity');
    this.shadowRoot.querySelector('.cob').textContent = getVal('cob_entity');
    this.shadowRoot.querySelector('.req').textContent = getVal('req_entity');
    this.shadowRoot.querySelector('.ketones').textContent = getVal('ketones_entity');
  }
}
customElements.define('t1d-diabetes-card', T1DDiabetesCard);

class T1DDiabetesCardEditor extends HTMLElement {
  setConfig(config) { this._config = config || {}; }
  set hass(hass) { 
    this._hass = hass; 
    if (!this.shadowRoot) { this.attachShadow({ mode: 'open' }); this._render(); } 
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <div class="editor">
        <ha-entity-picker .hass="${this._hass}" .value="${this._config.entity || ''}" label="Blood Glucose Sensor" @value-changed="${(ev) => this._fieldChanged(ev, 'entity')}"></ha-entity-picker>
        <ha-entity-picker .hass="${this._hass}" .value="${this._config.iob_entity || ''}" label="IOB Sensor" @value-changed="${(ev) => this._fieldChanged(ev, 'iob_entity')}"></ha-entity-picker>
        <ha-entity-picker .hass="${this._hass}" .value="${this._config.cob_entity || ''}" label="COB Sensor" @value-changed="${(ev) => this._fieldChanged(ev, 'cob_entity')}"></ha-entity-picker>
        <ha-entity-picker .hass="${this._hass}" .value="${this._config.req_entity || ''}" label="REQ Sensor" @value-changed="${(ev) => this._fieldChanged(ev, 'req_entity')}"></ha-entity-picker>
        <ha-entity-picker .hass="${this._hass}" .value="${this._config.ketones_entity || ''}" label="Ketones Sensor" @value-changed="${(ev) => this._fieldChanged(ev, 'ketones_entity')}"></ha-entity-picker>
        <input type="text" id="title" placeholder="Card Title" .value="${this._config.title || ''}" @input="${(ev) => this._fieldChanged(ev, 'title')}">
      </div>
      <style>
        .editor { display: flex; flex-direction: column; gap: 10px; }
        input { padding: 8px; border-radius: 4px; border: 1px solid #444; background: #222; color: white; }
      </style>
    `;
  }
  _fieldChanged(ev, field) {
    const value = ev.detail?.value || ev.target.value;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: { ...this._config, [field]: value } }, bubbles: true, composed: true }));
  }
}
customElements.define('t1d-diabetes-card-editor', T1DDiabetesCardEditor);

/**
 * T1D Diabetes Card - Full Production Version
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
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `<ha-card style="padding:16px;">Please configure entity in editor.</ha-card>`;
      return;
    }

    const stateObj = hass.states[this.config.entity];
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="card-header">${this.config.title || 'Glucose'}</div>
          <div class="bg-value">${stateObj ? stateObj.state : '--'}</div>
        </ha-card>
        <style>
          ha-card { padding: 16px; text-align: center; }
          .bg-value { font-size: 24px; font-weight: bold; }
        </style>
      `;
    }
    this.shadowRoot.querySelector('.bg-value').textContent = stateObj ? stateObj.state : '--';
  }
}
customElements.define('t1d-diabetes-card', T1DDiabetesCard);

// --- EDITOR COMPONENT ---
class T1DDiabetesCardEditor extends HTMLElement {
  setConfig(config) { this._config = config; }
  set hass(hass) {
    this._hass = hass;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <ha-entity-picker .hass="${this._hass}" .value="${this._config.entity || ''}" label="Entity" @value-changed="${this._entityChanged}"></ha-entity-picker>
      `;
    }
  }
  _entityChanged(ev) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { ...this._config, entity: ev.detail.value } },
      bubbles: true, composed: true
    }));
  }
}
customElements.define('t1d-diabetes-card-editor', T1DDiabetesCardEditor);

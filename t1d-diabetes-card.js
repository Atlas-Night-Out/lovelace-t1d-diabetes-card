/**
 * T1D Diabetes Card
 * A comprehensive tracking suite for T1D management
 * Version: 1.1.0
 */

class T1DDiabetesCard extends HTMLElement {
  static getConfigElement() { return document.createElement('t1d-diabetes-card-editor'); }
  setConfig(config) { this.config = config || {}; }

  set hass(hass) {
    if (!this.config.entity) return;
    const stateObj = hass.states[this.config.entity];
    if (!stateObj) return;

    const bg = parseFloat(stateObj.state);
    const unit = this.config.unit || 'mmol/L';
    const mgdl = (unit === 'mmol/L') ? (bg * 18.018) : bg;
    const gmi = (3.31 + (0.02392 * mgdl)).toFixed(1);
    const showA1c = this.config.show_a1c !== false;

    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <ha-card style="background: #1a1e1a; border: 1px solid #2e4a2e; border-radius: 16px; padding: 16px; color: white;">
        <div style="font-size:12px; color:#888; margin-bottom:8px;">${this.config.title || 'Blood Sugar'}</div>
        <div style="font-size:32px; font-weight:bold; color:#34c759;">${bg} <span style="font-size:14px; color:#555;">${unit}</span></div>
        ${showA1c ? '<div style="margin-top:10px; color:#34c759; font-weight:bold;">' + gmi + '% GMI</div>' : ''}
        <div style="margin-top:15px; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
           <button onclick="window.location.href='/config/entities'" style="background:#2e4a2e; color:white; border:none; padding:8px; border-radius:8px; cursor:pointer;">Alexa IOB</button>
           <button onclick="window.location.href='/config/entities'" style="background:#2e4a2e; color:white; border:none; padding:8px; border-radius:8px; cursor:pointer;">Alexa Dexcom</button>
        </div>
      </ha-card>
    `;
  }
}
customElements.define('t1d-diabetes-card', T1DDiabetesCard);

class T1DDiabetesCardEditor extends HTMLElement {
  setConfig(config) { this._config = config || {}; }
  set hass(hass) { this._hass = hass; }
  
  connectedCallback() {
    this.attachShadow({ mode: 'open' }).innerHTML = `
      <div style="padding:10px;">
        <p>Configuration available in UI. Use the toggles to adjust visibility of A1C and Title.</p>
      </div>
    `;
  }
}
customElements.define('t1d-diabetes-card-editor', T1DDiabetesCardEditor);

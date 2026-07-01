// T1D Diabetes Card - Full Production Suite
class T1DDiabetesCard extends HTMLElement {
  static getConfigElement() { return document.createElement('t1d-diabetes-card-editor'); }
  setConfig(config) { this.config = config || {}; }

  set hass(hass) {
    if (!this.config.entity) return;
    const stateObj = hass.states[this.config.entity];
    if (!stateObj) return;

    const bg = parseFloat(stateObj.state);
    const unit = this.config.unit || 'mmol/L';
    // Math: If mmol/L, convert to mg/dL for GMI calculation (bg * 18.018)
    const mgdl = (unit === 'mmol/L') ? (bg * 18.018) : bg;
    const gmi = (3.31 + (0.02392 * mgdl)).toFixed(1);
    
    // Logic for Buttons/Toggles
    const showA1c = this.config.show_a1c !== false;
    
    this.shadowRoot.innerHTML = `
      <ha-card style="background: #1a1e1a; border: 1px solid #2e4a2e; border-radius: 16px; padding: 16px; color: white;">
        <div style="font-size:12px; color:#888; margin-bottom:8px;">${this.config.title || 'Blood Sugar'}</div>
        <div style="font-size:32px; font-weight:bold; color:#34c759;">${bg} <span style="font-size:14px; color:#555;">${unit}</span></div>
        ${showA1c ? `<div style="margin-top:10px; color:#34c759; font-weight:bold;">${gmi}% GMI</div>` : ''}
        <div style="margin-top:15px; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
           <button onclick="window.location.href='/config/entities'" style="background:#2e4a2e; color:white; border:none; padding:8px; border-radius:8px;">Alexa IOB</button>
           <button onclick="window.location.href='/config/entities'" style="background:#2e4a2e; color:white; border:none; padding:8px; border-radius:8px;">Alexa Dexcom</button>
        </div>
      </ha-card>
    `;
  }
}
customElements.define('t1d-diabetes-card', T1DDiabetesCard);

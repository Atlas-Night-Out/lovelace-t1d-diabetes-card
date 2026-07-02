/**
 * T1D Diabetes Card & Configuration Suite
 * Production Edition - Ambient Green Slim Shady Theme
 */

class T1DDiabetesCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement('t1d-diabetes-card-editor');
  }

  static getStubConfig() {
    return {
      entity: '',
      days_left_entity: '',
      a1c_entity: '',
      title: 'Dave Glucose',
      low_threshold: 3.9,
      high_threshold: 10.0,
      show_title: true,
      show_a1c: true,
      show_days_left: true
    };
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

    // Calculate or fetch GMI / A1C value
    let a1cValue = '--';
    if (this.config.a1c_entity && hass.states[this.config.a1c_entity]) {
      const customA1cState = hass.states[this.config.a1c_entity].state;
      if (!isNaN(parseFloat(customA1cState))) {
        a1cValue = parseFloat(customA1cState).toFixed(1) + '%';
      } else {
        a1cValue = customA1cState;
      }
    } else if (!isNaN(bgValue)) {
      // Automatic fallback using official Dexcom/CGM GMI Formula
      const isMmol = bgValue < 30;
      if (isMmol) {
        a1cValue = (3.31 + 0.43056 * bgValue).toFixed(1) + '%';
      } else {
        a1cValue = (3.31 + 0.02392 * bgValue).toFixed(1) + '%';
      }
    }

    // Fetch Days Left value
    let daysLeftValue = '--';
    if (this.config.days_left_entity && hass.states[this.config.days_left_entity]) {
      const daysLeftState = hass.states[this.config.days_left_entity].state;
      if (!isNaN(parseFloat(daysLeftState))) {
        daysLeftValue = parseFloat(daysLeftState).toFixed(0) + 'd';
      } else {
        daysLeftValue = daysLeftState;
      }
    }

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    // Define target range coloring thresholds
    const low = this.config.low_threshold || 3.9;
    const high = this.config.high_threshold || 10.0;
    
    let statusClass = 'status-target';
    let pillClass = 'pill-target';
    let statusText = 'In Range';

    if (bgValue < low) {
      statusClass = 'status-hypo';
      pillClass = 'pill-hypo';
      statusText = 'Low';
    } else if (bgValue > high) {
      statusClass = 'status-hyper';
      pillClass = 'pill-hyper';
      statusText = 'High';
    }

    // Map trends cleanly to structural arrow glyphs
    let trendArrow = '→';
    let trendText = 'Steady';
    const normalizedTrend = trend.toLowerCase();
    if (normalizedTrend.includes('up') || normalizedTrend.includes('rising')) {
      trendArrow = '↑';
      trendText = 'Rising';
    } else if (normalizedTrend.includes('down') || normalizedTrend.includes('falling')) {
      trendArrow = '↓';
      trendText = 'Falling';
    } else if (normalizedTrend.includes('flat') || normalizedTrend.includes('steady')) {
      trendArrow = '→';
      trendText = 'Steady';
    }

    const titleText = this.config.title || 'Blood Glucose';
    const isMmol = bgValue < 30;
    const unitText = isMmol ? 'mmol/L' : 'mg/dL';

    this.shadowRoot.innerHTML = `
      <ha-card>
        ${this.config.show_title !== false ? `<div class="card-header">${titleText}</div>` : ''}
        <div class="card-grid">
          <div class="panel-left">
            <div class="glucose-ring ${statusClass}">
              <span class="bg-value">${bgValue}</span>
              <span class="unit-label">${unitText}</span>
            </div>
            <div class="status-pill ${pillClass}">${statusText}</div>
          </div>
          
          <div class="panel-center">
            <span class="trend-arrow">${trendArrow}</span>
            <span class="trend-text">${trendText}</span>
          </div>
          
          <div class="panel-right">
            ${this.config.show_days_left !== false && this.config.days_left_entity ? `
            <div class="metric-badge">
              <div class="badge-title">Days Left</div>
              <div class="days-value">${daysLeftValue}</div>
            </div>
            ` : ''}
            
            ${this.config.show_a1c !== false ? `
            <div class="metric-badge a1c-badge">
              <div class="badge-title">Est. A1C</div>
              <div class="sensor-status">${a1cValue}</div>
            </div>
            ` : ''}
          </div>
        </div>
      </ha-card>
      <style>
        ha-card { 
          padding: 16px; 
          background: radial-gradient(circle at top right, rgba(52, 199, 89, 0.14), #1c1c1e 75%);
          border-radius: var(--ha-card-border-radius, 16px); 
          border: 1px solid rgba(52, 199, 89, 0.25); 
          box-shadow: 0 0 15px rgba(52, 199, 89, 0.08);
          color: #ffffff; 
          font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
        }
        .card-header { font-size: 11px; font-weight: 600; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
        .card-grid { display: flex; flex-direction: row; align-items: center; justify-content: space-between; width: 100%; gap: 12px; }
        .panel-left, .panel-center { display: flex; flex-direction: column; align-items: center; flex: 1; }
        .panel-left { gap: 8px; }
        .glucose-ring { width: 85px; height: 85px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 4px solid #34c759; background: rgba(255, 255, 255, 0.02); box-sizing: border-box; }
        .bg-value { font-size: 26px; font-weight: 700; line-height: 1; }
        .unit-label { font-size: 10px; color: rgba(255, 255, 255, 0.5); margin-top: 2px; }
        .status-pill { font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 12px; background: rgba(52, 199, 89, 0.15); color: #34c759; text-transform: capitalize; }
        .trend-arrow { font-size: 42px; line-height: 1; font-weight: bold; }
        .trend-text { font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-top: 4px; font-weight: 500; }
        .panel-right { display: flex; flex-direction: column; gap: 6px; flex: 1; justify-content: center; }
        .metric-badge { background: #2c2c2e; padding: 6px 10px; border-radius: 8px; text-align: center; min-width: 70px; border: 1px solid rgba(255, 255, 255, 0.05); }
        .badge-title { font-size: 9px; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.5px; }
        .days-value, .sensor-status { font-size: 13px; font-weight: 600; margin-top: 2px; color: #ffffff; }
        
        .status-hypo { border-color: #ff3b30 !important; }
        .pill-hypo { background: rgba(255, 59, 48, 0.15) !important; color: #ff3b30 !important; }
        .status-target { border-color: #34c759 !important; }
        .pill-target { background: rgba(52, 199, 89, 0.15) !important; color: #34c759 !important; }
        .status-hyper { border-color: #ff9500 !important; }
        .pill-hyper { background: rgba(255, 149, 0, 0.15) !important; color: #ff9500 !important; }
      </style>
    `;
  }
}

class T1DDiabetesCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this.shadowRoot) {
      ['#picker-entity', '#picker-days-left', '#picker-a1c'].forEach(id => {
        const picker = this.shadowRoot.querySelector(id);
        if (picker) picker.hass = hass;
      });
    }
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  render() {
    if (!this._config) return;

    this.shadowRoot.innerHTML = `
      <div class="card-config">
        <div class="section-title">Sensor Entities</div>
        <div class="config-group">
          <label>Blood Glucose Sensor</label>
          <ha-entity-picker id="picker-entity" .includeDomains='["sensor"]' allow-custom-entity></ha-entity-picker>
        </div>

        <div class="config-group">
          <label>Days Left Sensor (Optional)</label>
          <ha-entity-picker id="picker-days-left" .includeDomains='["sensor"]' allow-custom-entity></ha-entity-picker>
        </div>

        <div class="config-group">
          <label>Dedicated A1C / Average Sensor (Optional)</label>
          <ha-entity-picker id="picker-a1c" .includeDomains='["sensor"]' allow-custom-entity></ha-entity-picker>
        </div>

        <div class="section-title">Display & Settings</div>
        <div class="config-group">
          <label>Card Title Text</label>
          <input type="text" name="title" id="input-title" />
        </div>

        <div class="config-row">
          <div class="config-group half">
            <label>Low Threshold</label>
            <input type="number" step="0.1" name="low_threshold" id="input-low" />
          </div>
          <div class="config-group half">
            <label>High Threshold</label>
            <input type="number" step="0.1" name="high_threshold" id="input-high" />
          </div>
        </div>

        <div class="section-title">Display Options</div>
        <div class="toggle-group">
          <span>Show Title</span>
          <input type="checkbox" name="show_title" id="check-title" />
        </div>
        <div class="toggle-group">
          <span>Show Estimated A1C</span>
          <input type="checkbox" name="show_a1c" id="check-a1c" />
        </div>
        <div class="toggle-group">
          <span>Show Days Left</span>
          <input type="checkbox" name="show_days_left" id="check-days-left" />
        </div>
      </div>

      <style>
        .card-config { display: flex; flex-direction: column; gap: 14px; padding: 4px; color: var(--primary-text-color, #fff); font-family: sans-serif; }
        .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: var(--secondary-text-color, #aaa); border-bottom: 1px solid var(--divider-color, #444); padding-bottom: 4px; margin-top: 8px; letter-spacing: 0.5px; }
        .config-group { display: flex; flex-direction: column; gap: 4px; }
        .config-row { display: flex; flex-direction: row; gap: 12px; width: 100%; }
        .half { flex: 1; }
        label { font-size: 12px; font-weight: 500; color: var(--primary-text-color, #fff); }
        input[type="text"], input[type="number"] { padding: 10px; border-radius: 6px; border: 1px solid var(--divider-color, #444); background: var(--card-background-color, #222); color: var(--primary-text-color, #fff); font-size: 14px; width: 100%; box-sizing: border-box; }
        .toggle-group { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 13px; }
        input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
        ha-entity-picker { display: block; width: 100%; }
      </style>
    `;

    // Connect and map entity drop pickers
    const pEntity = this.shadowRoot.querySelector('#picker-entity');
    if (pEntity) {
      pEntity.hass = this._hass;
      pEntity.value = this._config.entity || '';
      pEntity.addEventListener('value-changed', (ev) => this._entityChanged(ev, 'entity'));
    }

    const pDays = this.shadowRoot.querySelector('#picker-days-left');
    if (pDays) {
      pDays.hass = this._hass;
      pDays.value = this._config.days_left_entity || '';
      pDays.addEventListener('value-changed', (ev) => this._entityChanged(ev, 'days_left_entity'));
    }

    const pA1c = this.shadowRoot.querySelector('#picker-a1c');
    if (pA1c) {
      pA1c.hass = this._hass;
      pA1c.value = this._config.a1c_entity || '';
      pA1c.addEventListener('value-changed', (ev) => this._entityChanged(ev, 'a1c_entity'));
    }

    // Bind configuration setting values
    const iTitle = this.shadowRoot.querySelector('#input-title');
    if (iTitle) {
      iTitle.value = this._config.title || '';
      iTitle.addEventListener('input', (ev) => this._valueChanged(ev));
    }

    const iLow = this.shadowRoot.querySelector('#input-low');
    if (iLow) {
      iLow.value = this._config.low_threshold ?? 3.9;
      iLow.addEventListener('input', (ev) => this._valueChanged(ev));
    }

    const iHigh = this.shadowRoot.querySelector('#input-high');
    if (iHigh) {
      iHigh.value = this._config.high_threshold ?? 10.0;
      iHigh.addEventListener('input', (ev) => this._valueChanged(ev));
    }

    // Bind checkboxes switches
    const cTitle = this.shadowRoot.querySelector('#check-title');
    if (cTitle) {
      cTitle.checked = this._config.show_title !== false;
      cTitle.addEventListener('change', (ev) => this._toggleField(ev));
    }

    const cA1c = this.shadowRoot.querySelector('#check-a1c');
    if (cA1c) {
      cA1c.checked = this._config.show_a1c !== false;
      cA1c.addEventListener('change', (ev) => this._toggleField(ev));
    }

    const cDays = this.shadowRoot.querySelector('#check-days-left');
    if (cDays) {
      cDays.checked = this._config.show_days_left !== false;
      cDays.addEventListener('change', (ev) => this._toggleField(ev));
    }
  }

  _entityChanged(ev, field) {
    if (!this._config) return;
    this._fireConfigUpdate({ ...this._config, [field]: ev.detail.value });
  }

  _toggleField(ev) {
    if (!this._config) return;
    const name = ev.target.name;
    this._fireConfigUpdate({ ...this._config, [name]: ev.target.checked });
  }

  _valueChanged(ev) {
    if (!this._config) return;
    const target = ev.target;
    const name = target.name;
    let value = target.value;
    if (target.type === 'number') value = value === '' ? '' : parseFloat(value);
    this._fireConfigUpdate({ ...this._config, [name]: value });
  }

  _fireConfigUpdate(config) {
    const event = new CustomEvent('config-changed', {
      detail: { config: config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define('t1d-diabetes-card-editor', T1DDiabetesCardEditor);
customElements.define('t1d-diabetes-card', T1DDiabetesCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 't1d-diabetes-card',
  name: 'T1D Diabetes Card',
  description: 'A custom diabetes card with a glowing green backdrop aura, GMI metrics, and days left indicators.',
  preview: true
});

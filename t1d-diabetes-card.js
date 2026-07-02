/**
 * T1D Diabetes Card & Configuration Suite
 * Combined Production Code File - Vanilla JS Compliant Edition
 */

class T1DDiabetesCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement('t1d-diabetes-card-editor');
  }

  static getStubConfig() {
    return {
      entity: '',
      title: 'Blood Glucose',
      low_threshold: 3.9,
      high_threshold: 10.0,
      show_title: true,
      show_a1c: true
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
      this.innerHTML = `<ha-card style="padding:16px; background:#1c1c1e; color:white; border-radius:16px;">Please configure a Blood Glucose entity in the card visual settings menu.</ha-card>`;
      return;
    }

    const entityId = this.config.entity;
    const stateObj = hass.states[entityId];

    if (!stateObj) {
      this.innerHTML = `<ha-card style="padding:16px; color:red; background:#1c1c1e; border-radius:16px;">Entity not found: ${entityId}</ha-card>`;
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
          ha-card { padding: 16px; background: #1c1c1e; border-radius: var(--ha-card-border-radius, 16px); border: 1px solid #2c2c2e; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
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
          .panel-right { display: flex; flex-direction: column; gap: 6px; flex: 1; }
          .metric-badge { background: #2c2c2e; padding: 6px 10px; border-radius: 8px; text-align: center; min-width: 70px; }
          .badge-title { font-size: 9px; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.5px; }
          .delta-value, .sensor-status { font-size: 13px; font-weight: 600; margin-top: 2px; }
          .status-hypo { border-color: #ff3b30 !important; color: #ff3b30 !important; }
          .pill-hypo { background: rgba(255, 59, 48, 0.15) !important; color: #ff3b30 !important; }
          .status-target { border-color: #34c759 !important; color: #34c759 !important; }
          .pill-target { background: rgba(52, 199, 89, 0.15) !important; color: #34c759 !important; }
          .status-hyper { border-color: #ff9500 !important; color: #ff9500 !important; }
          .pill-hyper { background: rgba(255, 149, 0, 0.15) !important; color: #ff9500 !important; }
        </style>
      `;
    }

    const headerElement = this.shadowRoot.querySelector('.card-header');
    const bgElement = this.shadowRoot.querySelector('.bg-value');
    const ringElement = this.shadowRoot.querySelector('.glucose-ring');
    const pillElement = this.shadowRoot.querySelector('.status-pill');
    const arrowElement = this.shadowRoot.querySelector('.trend-arrow');
    const trendTextElement = this.shadowRoot.querySelector('.trend-text');
    const a1cBadge = this.shadowRoot.querySelector('.a1c-badge');

    headerElement.textContent = this.config.title || 'Blood Glucose';
    headerElement.style.display = this.config.show_title !== false ? 'block' : 'none';
    a1cBadge.style.display = this.config.show_a1c !== false ? 'block' : 'none';

    bgElement.textContent = stateObj.state;
    const isMmol = bgValue < 30;
    this.shadowRoot.querySelector('.unit-label').textContent = isMmol ? 'mmol/L' : 'mg/dL';

    ringElement.classList.remove('status-hypo', 'status-target', 'status-hyper');
    pillElement.classList.remove('pill-hypo', 'pill-target', 'pill-hyper');
    arrowElement.classList.remove('status-hypo', 'status-target', 'status-hyper');

    const lowLimit = parseFloat(this.config.low_threshold) || (isMmol ? 3.9 : 70);
    const highLimit = parseFloat(this.config.high_threshold) || (isMmol ? 10.0 : 180);

    let rangeClass = 'target';
    let statusLabel = 'In Range';

    if (bgValue < lowLimit) {
      rangeClass = 'hypo';
      statusLabel = 'Low';
    } else if (bgValue > highLimit) {
      rangeClass = 'hyper';
      statusLabel = 'High';
    }

    ringElement.classList.add(`status-${rangeClass}`);
    pillElement.classList.add(`pill-${rangeClass}`);
    arrowElement.classList.add(`status-${rangeClass}`);
    pillElement.textContent = statusLabel;

    arrowElement.textContent = this._getTrendArrow(trend);
    trendTextElement.textContent = this._getTrendText(trend);
    
    const formattedDelta = delta ? (parseFloat(delta) > 0 ? `+${delta}` : delta) : '--';
    this.shadowRoot.querySelector('.delta-value').textContent = formattedDelta;

    if (isMmol) {
      this.shadowRoot.querySelector('.sensor-status').textContent = ((bgValue * 18.018 + 46.7) / 28.7).toFixed(1) + '%';
    } else {
      this.shadowRoot.querySelector('.sensor-status').textContent = ((bgValue + 46.7) / 28.7).toFixed(1) + '%';
    }
  }

  _getTrendArrow(trend) {
    const arrows = { 'DoubleUp': '⇈', 'SingleUp': '↑', 'FortyFiveUp': '↗', 'Flat': '→', 'FortyFiveDown': '↘', 'SingleDown': '↓', 'DoubleDown': '⇊' };
    return arrows[trend] || trend || '→';
  }

  _getTrendText(trend) {
    const texts = { 'DoubleUp': 'Rising Fast', 'SingleUp': 'Rising', 'FortyFiveUp': 'Slow Rise', 'Flat': 'Steady', 'FortyFiveDown': 'Slow Drop', 'SingleDown': 'Falling', 'DoubleDown': 'Falling Fast' };
    return texts[trend] || 'Steady';
  }

  getGridOptions() {
    return { columns: 4, rows: 2, min_columns: 3, min_rows: 2 };
  }
}
customElements.define('t1d-diabetes-card', T1DDiabetesCard);


/**
 * VISUAL SETTINGS PANEL ENGINE (STABLE DOM LIFE-CYCLE MANIPULATION)
 */
class T1DDiabetesCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    this._updateEditor();
  }

  set hass(hass) {
    this._hass = hass;
    this._updateEditor();
  }

  _updateEditor() {
    if (!this._hass || !this._config) return;

    // Render baseline structure exactly ONCE to maintain cursor position/focus while typing
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <div class="editor-container">
          <div class="section-title">Sensor Entities</div>
          <div class="form-group" id="picker-container">
            <label>Blood Glucose Sensor</label>
          </div>

          <div class="section-title">Display & Settings</div>
          <div class="form-group">
            <label>Card Title Text</label>
            <input type="text" id="title" placeholder="e.g., Blood Sugar">
          </div>

          <div class="threshold-row">
            <div class="form-group">
              <label>Low — below</label>
              <input type="number" id="low_threshold" step="0.1">
            </div>
            <div class="form-group">
              <label>High — above</label>
              <input type="number" id="high_threshold" step="0.1">
            </div>
          </div>

          <div class="section-title">Display Options</div>
          <div class="toggle-group" id="title-toggle-container">
            <span>Show Title</span>
          </div>
          <div class="toggle-group" id="a1c-toggle-container">
            <span>Show Estimated A1C</span>
          </div>
        </div>

        <style>
          .editor-container { display: flex; flex-direction: column; gap: 16px; padding: 8px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
          .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--secondary-text-color, #999); letter-spacing: 0.5px; margin-top: 8px; border-bottom: 1px solid var(--divider-color, #333); padding-bottom: 4px; }
          .form-group { display: flex; flex-direction: column; gap: 6px; }
          .threshold-row { display: flex; gap: 12px; }
          .threshold-row .form-group { flex: 1; }
          label { font-size: 12px; font-weight: 500; color: var(--primary-text-color, #fff); }
          input[type="text"], input[type="number"] { padding: 10px; border-radius: 6px; border: 1px solid var(--divider-color, #444); background: var(--card-background-color, #222); color: var(--primary-text-color, #fff); font-size: 14px; }
          .toggle-group { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 13px; color: var(--primary-text-color, #fff); }
          ha-entity-picker { display: block; width: 100%; }
        </style>
      `;

      // Programmatically mount the Home Assistant Entity Picker
      this._picker = document.createElement('ha-entity-picker');
      this._picker.includeDomains = ['sensor'];
      this._picker.allowCustomEntity = true;
      this._picker.label = "Select Glucose Sensor";
      this._picker.addEventListener('value-changed', (ev) => this._entityChanged(ev));
      this.shadowRoot.querySelector('#picker-container').appendChild(this._picker);

      // Programmatically mount Title Switch
      this._titleSwitch = document.createElement('ha-switch');
      this._titleSwitch.addEventListener('change', (ev) => this._toggleField(ev, 'show_title'));
      this.shadowRoot.querySelector('#title-toggle-container').appendChild(this._titleSwitch);

      // Programmatically mount A1C Switch
      this._a1cSwitch = document.createElement('ha-switch');
      this._a1cSwitch.addEventListener('change', (ev) => this._toggleField(ev, 'show_a1c'));
      this.shadowRoot.querySelector('#a1c-toggle-container').appendChild(this._a1cSwitch);

      // Attach global value trackers for text and number inputs
      this.shadowRoot.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (ev) => this._valueChanged(ev));
      });
    }

    // Dynamic Safe Property Pipeline (Updates child variables directly without re-rendering DOM nodes)
    if (this._picker) {
      this._picker.hass = this._hass;
      if (this._picker.value !== (this._config.entity || '')) {
        this._picker.value = this._config.entity || '';
      }
    }

    const titleInput = this.shadowRoot.querySelector('#title');
    if (titleInput && document.activeElement !== titleInput) {
      titleInput.value = this._config.title || '';
    }

    const lowInput = this.shadowRoot.querySelector('#low_threshold');
    if (lowInput && document.activeElement !== lowInput) {
      lowInput.value = this._config.low_threshold !== undefined ? this._config.low_threshold : 3.9;
    }

    const highInput = this.shadowRoot.querySelector('#high_threshold');
    if (highInput && document.activeElement !== highInput) {
      highInput.value = this._config.high_threshold !== undefined ? this._config.high_threshold : 10.0;
    }

    if (this._titleSwitch) {
      this._titleSwitch.checked = this._config.show_title !== false;
    }
    if (this._a1cSwitch) {
      this._a1cSwitch.checked = this._config.show_a1c !== false;
    }
  }

  _entityChanged(ev) {
    if (!this._config) return;
    if (this._config.entity === ev.detail.value) return;
    this._fireConfigUpdate({ ...this._config, entity: ev.detail.value });
  }

  _toggleField(ev, field) {
    if (!this._config) return;
    this._fireConfigUpdate({ ...this._config, [field]: ev.target.checked });
  }

  _valueChanged(ev) {
    if (!this._config) return;
    const target = ev.target;
    let value = target.value;
    if (target.type === 'number') value = value === '' ? undefined : parseFloat(value);
    if (this._config[target.id] === value) return;
    this._fireConfigUpdate({ ...this._config, [target.id]: value });
  }

  _fireConfigUpdate(newConfig) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    }));
  }
}
customElements.define('t1d-diabetes-card-editor', T1DDiabetesCardEditor);

// Global Home Assistant Custom Card Registry Registry Push Block
window.customCards = window.customCards || [];
window.customCards.push({
  type: "t1d-diabetes-card",
  name: "T1D Diabetes Card",
  preview: true,
  description: "A functional visual dashboard card for monitoring blood glucose levels."
});

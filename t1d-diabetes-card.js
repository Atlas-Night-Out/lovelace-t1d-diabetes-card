/**
 * T1D Diabetes Card & Configuration Suite
 * Combined Production Code File
 */

class T1DDiabetesCard extends HTMLElement {
  // Links the main card to its custom visual editor menu
  static getConfigElement() {
    return document.createElement('t1d-diabetes-card-editor');
  }

  // Generates completely safe, anonymized blank defaults for public code safety
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
    if (!config.entity) {
      throw new Error('You must define a CGM entity!');
    }
    this.config = config;
  }

  set hass(hass) {
    const entityId = this.config.entity;
    const stateObj = hass.states[entityId];

    if (!stateObj) {
      this.innerHTML = `<ha-card style="padding:16px; color:red;">Entity not found: ${entityId}</ha-card>`;
      return;
    }

    const bgValue = parseFloat(stateObj.state);
    const trend = stateObj.attributes.trend_arrow || stateObj.attributes.trend || '';
    const delta = stateObj.attributes.delta || stateObj.attributes.change || '';

    // Initialize layout frameworks on the first cycle
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
          ha-card {
            padding: 16px;
            background: #1c1c1e;
            border-radius: var(--ha-card-border-radius, 16px);
            border: 1px solid #2c2c2e;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .card-header {
            font-size: 11px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.4);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
            text-align: left;
          }
          .card-grid {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            gap: 12px;
          }
          .panel-left {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            flex: 1;
          }
          .glucose-ring {
            width: 85px;
            height: 85px;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 4px solid #34c759;
            background: rgba(255, 255, 255, 0.02);
            box-sizing: border-box;
          }
          .bg-value {
            font-size: 26px;
            font-weight: 700;
            line-height: 1;
          }
          .unit-label {
            font-size: 10px;
            color: rgba(255, 255, 255, 0.5);
            margin-top: 2px;
          }
          .status-pill {
            font-size: 11px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 12px;
            background: rgba(52, 199, 89, 0.15);
            color: #34c759;
            text-transform: capitalize;
          }
          .panel-center {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
          }
          .trend-arrow {
            font-size: 42px;
            line-height: 1;
            font-weight: bold;
          }
          .trend-text {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            margin-top: 4px;
            font-weight: 500;
          }
          .panel-right {
            display: flex;
            flex-direction: column;
            gap: 6px;
            flex: 1;
          }
          .metric-badge {
            background: #2c2c2e;
            padding: 6px 10px;
            border-radius: 8px;
            text-align: center;
            min-width: 70px;
          }
          .badge-title {
            font-size: 9px;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.4);
            letter-spacing: 0.5px;
          }
          .delta-value, .sensor-status {
            font-size: 13px;
            font-weight: 600;
            margin-top: 2px;
          }
          .status-hypo { border-color: #ff3b30 !important; color: #ff3b30 !important; }
          .pill-hypo { background: rgba(255, 59, 48, 0.15) !important; color: #ff3b30 !important; }
          .status-target { border-color: #34c759 !important; color: #34c759 !important; }
          .pill-target { background: rgba(52, 199, 89, 0.15) !important; color: #34c759 !important; }
          .status-hyper { border-color: #ff9500 !important; color: #ff9500 !important; }
          .pill-hyper { background: rgba(255, 149, 0, 0.15) !important; color: #ff9500 !important; }
        </style>
      `;
    }

    // Capture Core DOM Elements
    const headerElement = this.shadowRoot.querySelector('.card-header');
    const bgElement = this.shadowRoot.querySelector('.bg-value');
    const ringElement = this.shadowRoot.querySelector('.glucose-ring');
    const pillElement = this.shadowRoot.querySelector('.status-pill');
    const arrowElement = this.shadowRoot.querySelector('.trend-arrow');
    const trendTextElement = this.shadowRoot.querySelector('.trend-text');
    const a1cBadge = this.shadowRoot.querySelector('.a1c-badge');

    // Apply configuration visibility options
    headerElement.textContent = this.config.title || 'Blood Glucose';
    headerElement.style.display = this.config.show_title !== false ? 'block' : 'none';
    a1cBadge.style.display = this.config.show_a1c !== false ? 'block' : 'none';

    // Parse Values
    bgElement.textContent = stateObj.state;
    const isMmol = bgValue < 30;
    this.shadowRoot.querySelector('.unit-label').textContent = isMmol ? 'mmol/L' : 'mg/dL';

    // Wipe layout classes
    ringElement.classList.remove('status-hypo', 'status-target', 'status-hyper');
    pillElement.classList.remove('pill-hypo', 'pill-target', 'pill-hyper');
    arrowElement.classList.remove('status-hypo', 'status-target', 'status-hyper');

    // Track thresholds dynamically from the UI entries
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

    // Apply contextual coloring matching rules
    ringElement.classList.add(`status-${rangeClass}`);
    pillElement.classList.add(`pill-${rangeClass}`);
    arrowElement.classList.add(`status-${rangeClass}`);
    pillElement.textContent = statusLabel;

    // Display Arrow Translations
    arrowElement.textContent = this._getTrendArrow(trend);
    trendTextElement.textContent = this._getTrendText(trend);
    
    // Calculate Delta text alignments
    const formattedDelta = delta ? (parseFloat(delta) > 0 ? `+${delta}` : delta) : '--';
    this.shadowRoot.querySelector('.delta-value').textContent = formattedDelta;

    // Standard eA1C Calculation Formula placeholder
    if (isMmol) {
      this.shadowRoot.querySelector('.sensor-status').textContent = ((bgValue * 18.018 + 46.7) / 28.7).toFixed(1) + '%';
    } else {
      this.shadowRoot.querySelector('.sensor-status').textContent = ((bgValue + 46.7) / 28.7).toFixed(1) + '%';
    }
  }

  _getTrendArrow(trend) {
    const arrows = {
      'DoubleUp': '⇈', 'SingleUp': '↑', 'FortyFiveUp': '↗',
      'Flat': '→', 'FortyFiveDown': '↘', 'SingleDown': '↓', 'DoubleDown': '⇊'
    };
    return arrows[trend] || trend || '→';
  }

  _getTrendText(trend) {
    const texts = {
      'DoubleUp': 'Rising Fast', 'SingleUp': 'Rising', 'FortyFiveUp': 'Slow Rise',
      'Flat': 'Steady', 'FortyFiveDown': 'Slow Drop', 'SingleDown': 'Falling', 'DoubleDown': 'Falling Fast'
    };
    return texts[trend] || 'Steady';
  }

  getGridOptions() {
    return { columns: 4, rows: 2, min_columns: 3, min_rows: 2 };
  }
}

customElements.define('t1d-diabetes-card', T1DDiabetesCard);


/**
 * GRAPHICAL USER INTERFACE CONFIGURATION PANEL
 */
class T1DDiabetesCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this._render();
    }
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <div class="editor-container">
        <div class="section-title">Sensor Entities</div>
        
        <div class="form-group">
          <label>Blood Glucose Sensor</label>
          <ha-entity-picker
            .hass="${this._hass}"
            .value="${this._config.entity || ''}"
            .includeDomains="${['sensor']}"
            @value-changed="${this._entityChanged}"
            allow-custom-entity
          ></ha-entity-picker>
        </div>

        <div class="section-title">Display & Settings</div>

        <div class="form-group">
          <label>Card Title Text</label>
          <input type="text" id="title" value="${this._config.title || ''}" placeholder="e.g., Blood Sugar">
        </div>

        <div class="threshold-row">
          <div class="form-group">
            <label>Low — below</label>
            <input type="number" id="low_threshold" step="0.1" value="${this._config.low_threshold ?? 3.9}">
          </div>
          <div class="form-group">
            <label>High — above</label>
            <input type="number" id="high_threshold" step="0.1" value="${this._config.high_threshold ?? 10.0}">
          </div>
        </div>

        <div class="section-title">Display Options</div>

        <div class="toggle-group">
          <span>Show Title</span>
          <ha-switch 
            .checked="${this._config.show_title !== false}" 
            @change="${(ev) => this._toggleField(ev, 'show_title')}"
          ></ha-switch>
        </div>

        <div class="toggle-group">
          <span>Show Estimated A1C</span>
          <ha-switch 
            .checked="${this._config.show_a1c !== false}" 
            @change="${(ev) => this._toggleField(ev, 'show_a1c')}"
          ></ha-switch>
        </div>

        <p class="helper-note">Settings update instantly in the dashboard visualizer frame.</p>
      </div>

      <style>
        .editor-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 8px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .section-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--secondary-text-color, #999);
          letter-spacing: 0.5px;
          margin-top: 8px;
          border-bottom: 1px solid var(--divider-color, #333);
          padding-bottom: 4px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .threshold-row {
          display: flex;
          gap: 12px;
        }
        .threshold-row .form-group {
          flex: 1;
        }
        label {
          font-size: 12px;
          font-weight: 500;
          color: var(--primary-text-color, #fff);
        }
        input[type="text"], input[type="number"] {
          padding: 10px;
          border-radius: 6px;
          border: 1px solid var(--divider-color, #444);
          background: var(--card-background-color, #222);
          color: var(--primary-text-color, #fff);
          font-size: 14px;
        }
        input:focus {
          outline: none;
          border-color: var(--primary-color, #03a9f4);
        }
        .toggle-group {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          font-size: 13px;
        }
        ha-entity-picker {
          display: block;
          width: 100%;
        }
        .helper-note {
          font-size: 11px;
          color: var(--secondary-text-color, #777);
          margin: 12px 0 0 0;
          text-align: center;
        }
      </style>
    `;

    this.shadowRoot.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
      input.addEventListener('input', (ev) => this._valueChanged(ev));
    });
  }

  _entityChanged(ev) {
    if (!this._config) return;
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
    if (target.type === 'number') value = parseFloat(value);
    
    this._fireConfigUpdate({ ...this._config, [target.id]: value });
  }

  _fireConfigUpdate(newConfig) {
    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
}

customElements.define('t1d-diabetes-card-editor', T1DDiabetesCardEditor);

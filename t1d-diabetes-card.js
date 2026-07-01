class T1DDiabetesCard extends HTMLElement {
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

    // Initialize HTML layout and CSS rules on first run
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="card-header">${this.config.title || 'Blood Glucose'}</div>
          <div class="card-grid">
            
            <!-- Left Side: Custom Value Ring and Status Pill -->
            <div class="panel-left">
              <div class="glucose-ring">
                <span class="bg-value">--</span>
                <span class="unit-label">mmol/L</span>
              </div>
              <div class="status-pill">--</div>
            </div>

            <!-- Center: Heavy Arrow & Trend Translation -->
            <div class="panel-center">
              <span class="trend-arrow">→</span>
              <span class="trend-text">Steady</span>
            </div>

            <!-- Right Side: Metric Badge Boxes -->
            <div class="panel-right">
              <div class="metric-badge">
                <div class="badge-title">Delta</div>
                <div class="delta-value">--</div>
              </div>
              <div class="metric-badge">
                <div class="badge-title">Status</div>
                <div class="sensor-status">Active</div>
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
          
          /* Left UI Panel Styling */
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

          /* Center UI Panel Styling */
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

          /* Right UI Panel Styling */
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

          /* Contextual Color Schemes */
          .status-hypo { 
            border-color: #ff3b30 !important; 
            color: #ff3b30 !important;
          }
          .pill-hypo {
            background: rgba(255, 59, 48, 0.15) !important;
            color: #ff3b30 !important;
          }
          
          .status-target { 
            border-color: #34c759 !important; 
            color: #34c759 !important;
          }
          .pill-target {
            background: rgba(52, 199, 89, 0.15) !important;
            color: #34c759 !important;
          }

          .status-hyper { 
            border-color: #ff9500 !important; 
            color: #ff9500 !important;
          }
          .pill-hyper {
            background: rgba(255, 149, 0, 0.15) !important;
            color: #ff9500 !important;
          }
        </style>
      `;
    }

    // Capture DOM targets
    const bgElement = this.shadowRoot.querySelector('.bg-value');
    const ringElement = this.shadowRoot.querySelector('.glucose-ring');
    const pillElement = this.shadowRoot.querySelector('.status-pill');
    const arrowElement = this.shadowRoot.querySelector('.trend-arrow');
    const trendTextElement = this.shadowRoot.querySelector('.trend-text');

    // Update Glucose value and unit labels
    bgElement.textContent = stateObj.state;
    this.shadowRoot.querySelector('.unit-label').textContent = bgValue < 30 ? 'mmol/L' : 'mg/dL';

    // Clear old visual range tracking rules
    ringElement.classList.remove('status-hypo', 'status-target', 'status-hyper');
    pillElement.classList.remove('pill-hypo', 'pill-target', 'pill-hyper');
    arrowElement.classList.remove('status-hypo', 'status-target', 'status-hyper');

    // Run custom rule parsing parameters
    const isMmol = bgValue < 30;
    let rangeClass = 'target';
    let statusLabel = 'In Range';

    if (isMmol) {
      if (bgValue < 3.9) { rangeClass = 'hypo'; statusLabel = 'Low'; }
      else if (bgValue > 10.0) { rangeClass = 'hyper'; statusLabel = 'High'; }
    } else {
      if (bgValue < 70) { rangeClass = 'hypo'; statusLabel = 'Low'; }
      else if (bgValue > 180) { rangeClass = 'hyper'; statusLabel = 'High'; }
    }

    // Write range configuration to card UI
    ringElement.classList.add(`status-${rangeClass}`);
    pillElement.classList.add(`pill-${rangeClass}`);
    arrowElement.classList.add(`status-${rangeClass}`);
    pillElement.textContent = statusLabel;

    // Render metrics tracking
    arrowElement.textContent = this._getTrendArrow(trend);
    trendTextElement.textContent = this._getTrendText(trend);
    
    const formattedDelta = delta ? (parseFloat(delta) > 0 ? `+${delta}` : delta) : '--';
    this.shadowRoot.querySelector('.delta-value').textContent = formattedDelta;
  }

  _getTrendArrow(trend) {
    const arrows = {
      'DoubleUp': '⇈',
      'SingleUp': '↑',
      'FortyFiveUp': '↗',
      'Flat': '→',
      'FortyFiveDown': '↘',
      'SingleDown': '↓',
      'DoubleDown': '⇊'
    };
    return arrows[trend] || trend || '→';
  }

  _getTrendText(trend) {
    const texts = {
      'DoubleUp': 'Rising Fast',
      'SingleUp': 'Rising',
      'FortyFiveUp': 'Slow Rise',
      'Flat': 'Steady',
      'FortyFiveDown': 'Slow Drop',
      'SingleDown': 'Falling',
      'DoubleDown': 'Falling Fast'
    };
    return texts[trend] || 'Steady';
  }

  getGridOptions() {
    return { columns: 4, rows: 2, min_columns: 3, min_rows: 2 };
  }
}

customElements.define('t1d-diabetes-card', T1DDiabetesCard);

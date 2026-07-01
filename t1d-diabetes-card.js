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

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="card-container">
            <div class="card-title">${this.config.title || 'Blood Glucose'}</div>
            <div class="bg-row">
              <span class="bg-value">--</span>
              <span class="trend-arrow"></span>
            </div>
            <div class="delta-value">--</div>
          </div>
        </ha-card>
        <style>
          ha-card {
            padding: 16px;
            text-align: center;
            background: var(--ha-card-background, var(--card-background-color, white));
            border-radius: var(--ha-card-border-radius, 12px);
            border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
          }
          .card-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .card-title {
            font-size: 14px;
            font-weight: 500;
            color: var(--secondary-text-color);
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .bg-row {
            display: flex;
            align-items: center;
            margin: 8px 0;
          }
          .bg-value {
            font-size: 52px;
            font-weight: 700;
            line-height: 1;
          }
          .trend-arrow {
            font-size: 36px;
            margin-left: 8px;
            line-height: 1;
          }
          .delta-value {
            font-size: 14px;
            color: var(--secondary-text-color);
            font-weight: 500;
          }
          .range-hypo { color: #ef5350 !important; }       
          .range-target { color: #4caf50 !important; }     
          .range-hyper { color: #ff9800 !important; }      
        </style>
      `;
    }

    const bgElement = this.shadowRoot.querySelector('.bg-value');
    bgElement.textContent = stateObj.state;

    bgElement.className = 'bg-value';
    
    // Smart Unit Detection: mmol/L readings are practically always under 30.
    const isMmol = bgValue < 30;

    if (isMmol) {
      // mmol/L Logic
      if (bgValue < 3.9) {
        bgElement.classList.add('range-hypo');
      } else if (bgValue > 10.0) {
        bgElement.classList.add('range-hyper');
      } else {
        bgElement.classList.add('range-target');
      }
    } else {
      // mg/dL Logic
      if (bgValue < 70) {
        bgElement.classList.add('range-hypo');
      } else if (bgValue > 180) {
        bgElement.classList.add('range-hyper');
      } else {
        bgElement.classList.add('range-target');
      }
    }

    this.shadowRoot.querySelector('.trend-arrow').textContent = this._getTrendArrow(trend);
    this.shadowRoot.querySelector('.delta-value').textContent = delta ? `Delta: ${delta}` : '';
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
    return arrows[trend] || trend;
  }

  getGridOptions() {
    return { columns: 3, rows: 2, min_columns: 2, min_rows: 2 };
  }
}

customElements.define('t1d-diabetes-card', T1DDiabetesCard);

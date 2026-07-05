/**
 * ====================================================================
 * TYPE 1 DIABETES (T1D) ADVANCED MONITORING & MANAGEMENT UI CARD
 * ====================================================================
 * @version      v1.86 - Full Enterprise Production Build
 * @release      Definitive Edition (Universal Entity Fallback Unified)
 * @description  Custom Home Assistant Dashboard card tailored for real-time 
 * Continuous Glucose Monitor (CGM) analytics. Featuring 
 * Personal-Sanitized trend translations, modularized 
 * CSS sub-rendering, adaptive unit map safety grids, and REST history.
 * Big thank you to ResinChem for his help and support!
 * ====================================================================
 */

/**
 * Main T1D Dashboard UI Card Component Architectural Core
 */
class T1DDiabetesCard extends HTMLElement {
  
  /**
   * Initializes the component lifecycle instance, instantiates state structures,
   * and attaches an isolated secure Shadow DOM container.
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = null;
    this._hass = null;
    this._history = [];
    this._lastFetch = 0;
    console.log("%c [T1D Card] Core System Engine Initialized successfully.", "color: #00bb00; font-weight: bold;");
  }

  /**
   * Registers the accompanying visual configuration form editor component.
   * @returns {HTMLElement} Custom HTML Element identifier for card configurations.
   */
  static getConfigElement() {
    return document.createElement("t1d-diabetes-card-editor");
  }

  /**
   * Generates a structural default template setup if user card configuration is empty.
   * Completely genericized for open-source community distribution.
   * @returns {Object} Static fallback configuration nodes.
   */
  static getStubConfig() {
    return {
      title: "CGM Monitor",
      unit_type: "mmol/L",
      alexa_name_1: "Broadcast Area 1",
      alexa_name_2: "Broadcast Area 2"
    };
  }

  /**
   * Sets up the baseline internal JSON configuration defined by Lovelace.
   * Runs syntax validation checks and updates internal tracking handles.
   * @param {Object} config The direct configuration schema from the yaml/visual editor.
   */
  setConfig(config) {
    if (!config) {
      throw new Error("Critical Error: Invalid T1D Card Configuration Schema Detected.");
    }
    
    // Core Single Sensor Fallback Architecture Logic Validation Loop
    // Ensure that if a user sets 'entity' but omits others, the system retains structural integrity.
    this._config = {
      ...config,
      // Fallback hierarchy mappings
      glucose_entity: config.glucose_entity || config.entity,
      trend_entity: config.trend_entity || config.entity
    };

    if (!this._config.entity && !this._config.glucose_entity) {
      throw new Error("Critical Error: You must define at least one valid core glucose sensor entity!");
    }

    this._lastFetch = 0; // Reset timer on config load
    if (this._hass) {
      this._render();
    }
  }

  /**
   * Home Assistant State Machine connection bridge hook.
   * Listens directly to real-time state engine stream events over live WebSockets.
   * @param {Object} hass Direct state dictionary repository pointer.
   */
  set hass(hass) {
    this._hass = hass;
    if (this._config) {
      this._render();
    }
  }

  /**
   * Background asynchronous data fetcher for plotting the 6-hour SVG trend graph.
   * Interfaces with the native Home Assistant REST API. Throttled to 5 minutes.
   * @private
   */
  async _fetchHistory() {
    const entity = this._config.glucose_entity;
    
    // 1. Graceful Exit: If no entity is selected, don't try to fetch
    if (!this._hass || !entity) {
      console.log("[T1D Card] Waiting for user to configure a valid glucose_entity.");
      return;
    }

    const now = new Date();
    const startTime = new Date(now.getTime() - (6 * 60 * 60 * 1000));

    try {
      const response = await this._hass.callApi(
        'GET',
        `history/period/${startTime.toISOString()}?filter_entity_id=${entity}&minimal_response`
      );

      // 2. Data Validation: Only render if we actually get a response with data
      if (response && response.length > 0 && response[0].length > 0) {
        this._history = response[0]
          .map(state => ({
            state: parseFloat(state.state),
            last_changed: new Date(state.last_changed).getTime()
          }))
          .filter(item => !isNaN(item.state));

        this._renderDOM();
      } else {
        // 3. If the entity is valid but has no history yet, just clear the graph
        console.warn(`[T1D Card] No history data found for ${entity}.`);
        this._history = []; 
        this._renderDOM(); 
      }
    } catch (error) {
      console.error("[T1D Card] Error fetching history:", error);
    }
  }

  /**
   * Safe execution handler for triggering backend automation routines and scripts.
   * Evaluates targets to safely handle execution calls without crashing the UI thread.
   * @param {String} entity Direct script or automation reference ID string.
   * @private
   */
  _callService(entity) {
    if (!entity || !this._hass) {
      console.warn("[T1D Card] Service execution blocked: Target entity or HASS instance is missing.");
      return;
    }
    
    const tokenParts = entity.split('.');
    if (tokenParts.length !== 2) {
      console.error(`[T1D Card] Execution Aborted: Target '${entity}' format is malformed.`);
      return;
    }
    
    const domain = tokenParts[0];
    const service = tokenParts[1];
    
    console.log(`[T1D Card] Firing remote script service call: ${domain}.${service}`);
    this._hass.callService(domain, service, {});
  }

  /**
   * Sanitizes raw system trend strings into clean xDrip-styled text labels and precise arrows.
   * Strips out database characters like underscores to ensure robust parsing.
   * Supports standard Dexcom phrases, custom template trackers, and Nightscout raw symbols.
   * @param {String} trend Raw state string from the configured tracking sensor.
   * @returns {Object} Map container holding parsed target label and arrow string details.
   * @private
   */
  _getTrendInfo(trend, entityId) {
    if (!trend || trend === "N/A") {
      // If we fell back to the main glucose entity, check if it stores trend indicators in attributes
      if (entityId && this._hass.states[entityId]) {
        const stateObj = this._hass.states[entityId];
        trend = stateObj.attributes.direction || stateObj.attributes.trend || stateObj.attributes.delta || trend;
      }
    }

    if (!trend || trend === "N/A") {
      return { label: "→", text: "Steady" };
    }
    
    // Clean string by removing underscores and whitespace for cross-integration compatibility
    const t = trend.toString().toLowerCase().replace(/_/g, '').replace(/\s/g, '').trim();

    // Robust matching for all variants of trends, including words and explicit Unicode symbols
    if (t.includes('doubleup') || t === '↓↓' || t === '⇈') {
      return { label: '↑↑', text: 'Rapid Up' };
    } else if (t.includes('singleup') || t.includes('rapidup') || t === 'up' || t === '↑') {
      return { label: '↑', text: 'Going Up' };
    } else if (t.includes('fortyfiveup') || t.includes('slightup') || t.includes('climbing') || t.includes('risingslightly') || t === '↗') {
      return { label: '↗', text: 'Slow Up' };
    } else if (t.includes('flat') || t.includes('steady') || t === 'none' || t === '→' || t === '↔') {
      return { label: '→', text: 'Steady' };
    } else if (t.includes('fortyfivedown') || t.includes('slightdown') || t.includes('falling') || t.includes('fallingslightly') || t === '↘') {
      return { label: '↘', text: 'Slow Down' };
    } else if (t.includes('doubledown') || t.includes('rapiddown') || t === '↓↓' || t === '⇊') {
      return { label: '↓↓', text: 'Rapid Down' };
    } else if (t.includes('singledown') || t.includes('down') || t === '↓') {
      return { label: '↓', text: 'Going Down' };
    } else {
      // Fallback pass-through for unmapped custom native values
      return { label: '→', text: trend };
    }
  }

  /**
   * Formulates an estimated clinical HbA1c representation from the current interstitial reading.
   * Formula handles conditional scaling across both imperial and metric target bounds.
   * @param {Number} glucose Current active numeric glucose reading value.
   * @param {String} unit Active structural calibration mode string ('mmol/L' or 'mg/dL').
   * @returns {String} Localized parsed numeric string percentage output.
   * @private
   */
  _calculateA1c(glucose, unit) {
    if (isNaN(glucose) || glucose <= 0) {
      return "N/A";
    }
    
    // Convert metric readings to standard mg/dL scale to align with math constants
    const mgDlValue = unit === "mmol/L" ? (glucose * 18.018) : glucose;
    
    // Mathematical DCCT Alignment Formula Equation
    const calculatedPercentage = (mgDlValue + 46.7) / 28.7;
    return calculatedPercentage.toFixed(1);
  }

  /**
   * Applies precise clinical coloring thresholds depending on the active configuration unit.
   * Prevents false alerts by instantly shifting boundary math scales on user updates.
   * @param {Number} glucoseVal Current computed real number sensor level metrics.
   * @param {String} unit Target operational unit string selector.
   * @returns {String} Standard Hex Color designation string code.
   * @private
   */
  _getGlucoseColor(glucoseVal, unit) {
    if (isNaN(glucoseVal) || glucoseVal <= 0) {
      return "#00bb00"; 
    }
    
    if (unit === "mmol/L") {
      if (glucoseVal < 4.0 || glucoseVal > 10.0) {
        return "#e74c3c"; // Crimson Red: Out of Bounds Alert Window
      } else if (glucoseVal > 7.8) {
        return "#e67e22"; // Pumpkin Orange: Postprandial Elevation Warning
      }
      return "#00bb00"; // Jade Green: Core Target Range
    } else {
      if (glucoseVal < 70 || glucoseVal > 180) {
        return "#e74c3c"; // Crimson Red Alert
      } else if (glucoseVal > 140) {
        return "#e67e22"; // Pumpkin Orange Warning
      }
      return "#00bb00"; // Jade Green Core
    }
  }

  /**
   * Identifies color coding classifications for long-term average diagnostic windows.
   * @param {String} a1c Raw calculated string representation of the HbA1c value.
   * @returns {String} Hex code mapping based on clinical targets.
   * @private
   */
  _getA1cColor(a1c) {
    const numericValue = parseFloat(a1c);
    if (isNaN(numericValue)) {
      return "#00bb00";
    }
    if (numericValue >= 6.5) {
      return "#e74c3c"; // Diagnostic Diabetes Boundary
    } else if (numericValue >= 5.7) {
      return "#e67e22"; // Pre-Diabetes Warning Span
    }
    return "#00bb00"; // Optimal Glycemic Span
  }

  /**
   * Generates isolated Encapsulated Component CSS Styling Definitions.
   * Locks layout metrics and structural box boundaries securely.
   * @private
   */
  _getStyles(glucoseColor, a1cColor) {
    const isAlert = glucoseColor === '#e74c3c';

    return `
      <style>
        ha-card { 
          background: rgba(0, 25, 10, 0.4); 
          border: 1.5px solid #00bb00; 
          border-radius: 16px; 
          padding: 20px; 
          color: #ffffff; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          box-sizing: border-box;
        }
        .card-title {
          font-size: 1.4rem;
          font-weight: bold;
          margin-bottom: 16px;
          color: #ffffff;
          letter-spacing: -0.02em;
        }
        .header { 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          margin-bottom: 24px; 
        }
        .glucose-container {
          position: relative;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .progress-ring__circle {
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
          transition: stroke 0.4s ease-in-out, stroke-dashoffset 0.4s ease-in-out;
          ${isAlert ? 'animation: pulse 1.5s infinite;' : ''}
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
        .circle-text {
          position: absolute;
          text-align: center;
        }
        .val { 
          font-size: 2.6rem; 
          font-weight: bold; 
          line-height: 1.1;
          letter-spacing: -0.03em;
        }
        .unit-label {
          font-size: 0.95rem;
          color: #cccccc;
          margin-top: 2px;
        }
        .trend-container {
          text-align: center;
          margin-right: 14px;
        }
        .trend-text {
          font-size: 1.2rem;
          color: #ffffff;
          margin-bottom: 4px;
        }
        .grid-triple { 
          display: grid; 
          grid-template-columns: repeat(3, minmax(0, 1fr)); 
          gap: 6px; 
          margin-bottom: 14px; 
        }
        .grid-double { 
          display: grid; 
          grid-template-columns: repeat(2, minmax(0, 1fr)); 
          gap: 12px; 
          margin-bottom: 14px; 
        }
        .box { 
          border: 1px solid #333333; 
          padding: 14px 4px; 
          border-radius: 10px; 
          text-align: center; 
          background: rgba(0, 0, 0, 0.25);
          min-width: 0;
          overflow: hidden;
          box-sizing: border-box;
          transition: background 0.4s ease, border 0.4s ease;
        }
        .a1c-box { 
          border: 2px solid ${a1cColor}; 
        }
        .box-h { 
          font-weight: bold; 
          font-size: 0.88rem; 
          margin-bottom: 8px; 
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .box-v {
          font-size: 1.2rem;
          font-weight: bold;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .graph-container {
          margin-top: 15px;
          margin-bottom: 15px;
          padding: 12px 15px 15px 15px;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid #333333;
          border-radius: 10px;
        }
        .history-graph {
          width: 100%;
          height: auto;
          max-height: 80px;
          display: block;
          filter: drop-shadow(0px 4px 6px rgba(0, 187, 0, 0.2));
          margin-top: 8px;
        }
        .btn { 
          border: 1px solid #00bb00; 
          padding: 18px; 
          border-radius: 8px; 
          text-align: center; 
          cursor: pointer; 
          font-weight: bold; 
          font-size: 1.3rem;
          color: #00bb00; 
          margin-top: 14px; 
          background: rgba(0, 0, 0, 0.2);
          user-select: none;
          transition: background 0.2s ease, transform 0.1s ease;
        }
        .btn:hover {
          background: rgba(0, 187, 0, 0.12);
        }
        .btn:active {
          transform: scale(0.98);
        }
      </style>
    `;
  }

  /**
   * Generates the upper dashboard section template strings.
   * @private
   */
  _renderHeader(value, unit, trendText, trendArrow, color, offset, circumference) {
    const isAlert = color === '#e74c3c';
    const activeOffset = isAlert ? 0 : offset;
    
    return `
      <div class="header">
          <div class="glucose-container">
              <svg width="120" height="120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#333" stroke-width="4" />
                <circle class="progress-ring__circle" cx="60" cy="60" r="54" fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="${circumference}" stroke-dashoffset="${activeOffset}" />
              </svg>
              <div class="circle-text">
                  <div class="val">${value}</div>
                  <div class="unit-label">${unit}</div>
              </div>
          </div>
          <div class="trend-container">
              <div class="trend-text">${trendText}</div>
              <div style="font-size: 3.8rem; line-height: 1;">${trendArrow}</div>
          </div>
      </div>
    `;
  }

  /**
   * Generates the triple item matrix metrics view block (IOB, COB, REQ).
   * @private
   */
  _renderMatrixGrid(iob, cob, req) {
    return `
      <div class="grid-triple">
         <div class="box">
           <div class="box-h" style="color: #3498db;">IOB</div>
           <div class="box-v">${iob} U</div>
         </div>
         <div class="box">
           <div class="box-h" style="color: #2ecc71;">COB</div>
           <div class="box-v">${cob} g</div>
         </div>
         <div class="box">
           <div class="box-h" style="color: #e67e22;">REQ</div>
           <div class="box-v">${req}</div>
         </div>
      </div>
    `;
  }

  /**
   * Generates the lower dual-column monitoring analytics layout blocks.
   * @private
   */
  _renderAnalyticsGrid(a1cValue, a1cColor, lifespan) {
    let isUrgent = false;
    const cleanLife = lifespan.toString().toLowerCase().trim();

    if (cleanLife.includes('day')) {
      const dayMatch = cleanLife.match(/(\d+)\s*day/);
      if (dayMatch) {
        const parsedDays = parseInt(dayMatch[1], 10);
        if (parsedDays < 1) {
          isUrgent = true;
        } else if (parsedDays === 1) {
          if (!cleanLife.includes('hour') && !cleanLife.includes('minute')) {
            isUrgent = true;
          }
        }
      }
    } else if (cleanLife.includes('hour') || cleanLife.includes('minute')) {
      isUrgent = true;
    } else {
      const numericDays = parseFloat(cleanLife);
      if (!isNaN(numericDays) && numericDays <= 1 && numericDays > 0) {
        isUrgent = true;
      }
    }

    const alertBg = isUrgent ? "rgba(255, 152, 0, 0.06)" : "rgba(0, 0, 0, 0.25)";
    const alertBorder = isUrgent ? "2px solid rgba(255, 152, 0, 0.6)" : "2px solid #333333";

    return `
      <div class="grid-double">
         <div class="box a1c-box">
           <div class="box-h" style="color: ${a1cColor}">EST. A1C</div>
           <div class="box-v" style="color: ${a1cColor}">${a1cValue}%</div>
         </div>
         <div class="box" style="background: ${alertBg}; border: ${alertBorder};">
           <div class="box-h" style="color: #ffffff; opacity: 0.9;">SENSOR DAYS</div>
           <div class="box-v" style="font-size: 1.1rem; line-height: 1.3; white-space: normal;">${lifespan}</div>
         </div>
      </div>
    `;
  }

  /**
   * Maps out dynamic SVG plot points natively for historical arrays without external libraries.
   * @private
   */
  _renderGraph() {
    if (!this._range) this._range = 6;
    if (!this._history || this._history.length < 2) return `<div class="graph-container">Loading Graph History...</div>`;

    const width = 300, height = 80;
    const now = Date.now();
    const startTime = now - (this._range * 60 * 60 * 1000);
    
    const high = this._config.high_marker || 10.0;
    const low = this._config.low_marker || 4.0;

    const getY = (val) => height - (((val - (low - 3)) / ((high + 3) - (low - 3))) * height);

    let segments = [];
    for (let i = 0; i < this._history.length - 1; i++) {
      const p1 = this._history[i];
      const p2 = this._history[i + 1];
      const x1 = ((p1.last_changed - startTime) / (now - startTime)) * width;
      const x2 = ((p2.last_changed - startTime) / (now - startTime)) * width;
      const y1 = getY(p1.state);
      const y2 = getY(p2.state);
      
      const color = (p1.state < low || p1.state > high) ? "#e74c3c" : "#00bb00";
      segments.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" />`);
    }

    return `
      <div class="graph-container">
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="overflow:visible;">
          <line x1="0" y1="${getY(high)}" x2="${width}" y2="${getY(high)}" stroke="#555" stroke-width="1" stroke-dasharray="3" />
          <line x1="0" y1="${getY(low)}" x2="${width}" y2="${getY(low)}" stroke="#555" stroke-width="1" stroke-dasharray="3" />
          ${segments.join('')}
        </svg>
      </div>
    `;
  }

  /**
   * Component Execution Lifecycle Master Controller.
   * @private
   */
  _render() {
    if (!this._config || !this._hass) {
      return;
    }

    const now = Date.now();
    if (now - this._lastFetch > 300000) {
      this._lastFetch = now;
      this._fetchHistory(); 
    } else {
      this._renderDOM();
    }
  }

  /**
   * Final Component Execution Payload builder.
   * @private
   */
  _renderDOM() {
    const fetchStateString = (entityId) => {
      if (entityId && this._hass.states[entityId]) {
        const stateObj = this._hass.states[entityId].state;
        if (stateObj === "unknown" || stateObj === "unavailable") {
          return "N/A";
        }
        return stateObj;
      }
      return "N/A";
    };
    
    // Resolve primary states with robust fallback check updates
    const primaryTargetSensor = this._config.entity || this._config.glucose_entity;
    const activeRawReading = fetchStateString(primaryTargetSensor);
    const parsedGlucoseFloat = parseFloat(activeRawReading);
    
    // Trend Entity parsing fallback check
    const rawTrendString = fetchStateString(this._config.trend_entity);
    const trendMetaData = this._getTrendInfo(rawTrendString, primaryTargetSensor);
    
    const selectedUnitLabel = this._config.unit_type || "mmol/L";
    const computedA1cValue = this._calculateA1c(parsedGlucoseFloat, selectedUnitLabel);
    
    const analyticalGlucoseColor = this._getGlucoseColor(parsedGlucoseFloat, selectedUnitLabel);
    const analyticalA1cColor = this._getA1cColor(computedA1cValue);

    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const minVal = selectedUnitLabel === "mmol/L" ? 2 : 40;
    const maxVal = selectedUnitLabel === "mmol/L" ? 22 : 400;
    const percentage = Math.min(100, Math.max(0, ((parsedGlucoseFloat - minVal) / (maxVal - minVal)) * 100));
    const offset = circumference - (percentage / 100) * circumference;

    let templateStyles = this._getStyles(analyticalGlucoseColor, analyticalA1cColor);
    let templateHeader = this._renderHeader(activeRawReading, selectedUnitLabel, trendMetaData.text, trendMetaData.label, analyticalGlucoseColor, offset, circumference);
    
    let templateMatrix = this._renderMatrixGrid(
      fetchStateString(this._config.iob_entity),
      fetchStateString(this._config.cob_entity),
      fetchStateString(this._config.req_entity)
    );
    
    let templateAnalytics = this._renderAnalyticsGrid(
      computedA1cValue,
      analyticalA1cColor,
      fetchStateString(this._config.days_entity)
    );

    let templateGraph = this._renderGraph();

    this.shadowRoot.innerHTML = `
      ${templateStyles}
      <ha-card>
        ${this._config.title ? `<div class="card-title">${this._config.title}</div>` : ''}
        ${templateHeader}
        ${templateMatrix}
        ${templateAnalytics}
        ${templateGraph}
        <div class="btn" id="triggerActionOne">${this._config.alexa_name_1 || "Broadcast Area 1"}</div>
        <div class="btn" id="triggerActionTwo">${this._config.alexa_name_2 || "Broadcast Area 2"}</div>
      </ha-card>
    `;

    this.shadowRoot.querySelector('#triggerActionOne')?.addEventListener('click', () => {
      this._callService(this._config.alexa_1);
    });
    
    this.shadowRoot.querySelector('#triggerActionTwo')?.addEventListener('click', () => {
      this._callService(this._config.alexa_2);
    });
  }
}

/**
 * Visual Form Editor Architectural Component
 */
class T1DDiabetesCardEditor extends HTMLElement {
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = null;
    this._hass = null;
  }

  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._hass || !this._config || this.shadowRoot.querySelector('ha-form')) {
      return;
    }
    
    const structuralSchema = [
      {
        name: "title",
        label: "Custom Card Header Title Display String",
        selector: { text: {} }
      },
      {
        name: "unit_type",
        label: "Glucose Target Mathematical Unit Alignment Style",
        selector: { select: { options: ["mg/dL", "mmol/L"] } }
      },
      {
        name: "entity",
        label: "Core CGM Blood Glucose Concentration Sensor Value ID",
        selector: { entity: { domain: "sensor" } }
      },
      {
        name: "sensor_type",
        label: "CGM Source Type",
        selector: { select: { options: ["Dexcom", "Nightscout", "Libre"] } }
      },
      {
        name: "glucose_entity",
        label: "Primary Glucose Sensor (Optional Fallback)",
        selector: { entity: { domain: "sensor" } }
      },
      {
        name: "trend_entity",
        label: "Interstitial Fluid Trend Path Direction Pointer Sensor (Optional Fallback)",
        selector: { entity: { domain: "sensor" } }
      },
      {
        name: "iob_entity",
        label: "Active System Insulin On Board (IOB) Fluid Sensor",
        selector: { entity: { domain: "sensor" } }
      },
      {
        name: "cob_entity",
        label: "Active System Carbs On Board (COB) Nutrition Sensor",
        selector: { entity: { domain: "sensor" } }
      },
      {
        name: "req_entity",
        label: "Required Basal Adjustment Delivery Metric Sensor",
        selector: { entity: { domain: "sensor" } }
      },
      {
        name: "days_entity",
        label: "Hardware Pod / Transmitter Lifetime Lifecycle Countdown Sensor",
        selector: { entity: { domain: "sensor" } }
      },
      {
        name: "alexa_name_1",
        label: "First Interactive Card Action Button Display Label Text",
        selector: { text: {} }
      },
      {
        name: "alexa_1",
        label: "First Interactive Button Target Automated Service Script Hook",
        selector: { entity: { domain: "script" } }
      },
      {
        name: "alexa_name_2",
        label: "Second Interactive Card Action Button Display Label Text",
        selector: { text: {} }
      },
      {
        name: "alexa_2",
        label: "Second Interactive Button Target Automated Service Script Hook",
        selector: { entity: { domain: "script" } }
      },
      {
        name: "high_marker",
        label: "High Glucose Threshold Marker",
        selector: { number: { mode: "box", step: 0.1 } }
      },
      {
        name: "low_marker",
        label: "Low Glucose Threshold Marker",
        selector: { number: { mode: "box", step: 0.1 } }
      },
    ];

    const formElement = document.createElement("ha-form");
    formElement.hass = this._hass;
    formElement.schema = structuralSchema;
    formElement.data = this._config;
    
    formElement.addEventListener("value-changed", (eventHook) => {
      this._config = eventHook.detail.value;
      
      const configChangeEvent = new CustomEvent("config-changed", { 
        detail: { config: this._config }, 
        bubbles: true, 
        composed: true 
      });
      
      this.dispatchEvent(configChangeEvent);
    });
    
    this.shadowRoot.appendChild(formElement);
  }
}

// Register components globally into standard Lovelace execution routines
customElements.define('t1d-diabetes-card', T1DDiabetesCard);
customElements.define('t1d-diabetes-card-editor', T1DDiabetesCardEditor);

// Mount schema metadata to custom configuration registry tables
window.customCards = window.customCards || [];
window.customCards.push({ 
  type: 't1d-diabetes-card', 
  name: 'T1DDiabetesCard', 
  preview: true, 
  description: 'Production T1D UI Component featuring Adaptive Color Gauges, Script Triggers, and Native Graphs.' 
});

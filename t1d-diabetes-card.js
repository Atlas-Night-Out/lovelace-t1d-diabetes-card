/**
 * ====================================================================
 * TYPE 1 DIABETES (T1D) MONITORING & MANAGEMENT UI CARD
 * ====================================================================
 * @version      1.61 Release Build
 * @description  Custom Home Assistant Dashboard card tailored for real-time 
 * Continuous Glucose Monitor (CGM) analytics. Featuring 
 * adaptive unit threshold color maps, automated A1C tracking,
 * isolated layouts, and dedicated hardware/script controls.
 * @compatibility Home Assistant Lovelace Frontend core architecture.
 * Big thank you to ResinChem for is help and support to make this ever possible! 
 * ====================================================================
 */

/**
 * Main Card UI Component
 * Renders the primary user interface containing the glucose status circle,
 * directional trend vectors, metabolic metric matrix, and automation triggers.
 */
class T1DDiabetesCard extends HTMLElement {
  
  /**
   * Initializes internal component state and attaches the component shadow DOM.
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = null;
    this._hass = null;
  }

  /**
   * Registers the accompanying visual configuration form editor to Lovelace.
   * @returns {HTMLElement} Custom HTML Element identifier for card configurations.
   */
  static getConfigElement() {
    return document.createElement("t1d-diabetes-card-editor");
  }

  /**
   * Generates a structural default state setup if user card configuration is empty.
   * @returns {Object} Static fallback configuration nodes.
   */
  static getStubConfig() {
    return {
      title: "T1Dave Glucose",
      unit_type: "mmol/L",
      alexa_name_1: "LivingRoom Readout",
      alexa_name_2: "BedRoom Readout"
    };
  }

  /**
   * Sets up the baseline internal JSON configuration defined by Lovelace.
   * Runs syntax checking and updates internal tracking handles.
   * @param {Object} config The direct configuration schema from the yaml/visual editor.
   */
  setConfig(config) {
    if (!config) {
      throw new Error("Invalid T1D Card Configuration Schema Detected.");
    }
    this._config = config;
    if (this._hass) {
      this._render();
    }
  }

  /**
   * Home Assistant State Machine connection bridge hook.
   * Listens directly to real-time state engine stream events over WebSocket.
   * @param {Object} hass Direct state dictionary repository pointer.
   */
  set hass(hass) {
    this._hass = hass;
    if (this._config) {
      this._render();
    }
  }

  /**
   * Safe execution handler for triggering backend automation routines.
   * Evaluates targets to safely handle execution calls without crashing the UI thread.
   * @param {String} entity Direct script or automation reference ID string.
   * @private
   */
  _callService(entity) {
    if (!entity || !this._hass) {
      return;
    }
    
    const tokenParts = entity.split('.');
    if (tokenParts.length !== 2) {
      console.error(`T1D Card Error: Target entity '${entity}' is format malformed.`);
      return;
    }
    
    const domain = tokenParts[0];
    const service = tokenParts[1];
    
    this._hass.callService(domain, service, {});
  }

  /**
   * Normalizes structural string-based trend outputs from API systems (Dexcom, Nightscout, etc.)
   * and maps them to clear, prominent visual directional arrow symbols.
   * @param {String} trend Raw state string from the configured tracking sensor.
   * @returns {Object} Map container holding parsed target label details.
   * @private
   */
  _getTrendInfo(trend) {
    if (!trend) {
      return { label: "→" };
    }
    
    const lookupKey = trend.toString().toLowerCase().trim();

    if (lookupKey.includes('doubleup')) {
      return { label: '↑↑' };
    } else if (lookupKey.includes('singleup') || lookupKey.includes('up')) {
      return { label: '↑' };
    } else if (lookupKey.includes('fortyfiveup')) {
      return { label: '↗' };
    } else if (lookupKey.includes('flat') || lookupKey.includes('steady')) {
      return { label: '→' };
    } else if (lookupKey.includes('fortyfivedown')) {
      return { label: '↘' };
    } else if (lookupKey.includes('singledown') || lookupKey.includes('down')) {
      return { label: '↓' };
    } else if (lookupKey.includes('doubledown')) {
      return { label: '↓↓' };
    } else {
      return { label: '→' };
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
    
    // Convert base numbers to absolute mg/dL baseline scale to properly match formula coefficients.
    const mgDlValue = unit === "mmol/L" ? (glucose * 18.018) : glucose;
    
    // Apply standard DCCT alignment translation equation
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
      return "#00bb00"; // Safe green initialization fallback
    }
    
    if (unit === "mmol/L") {
      if (glucoseVal < 4.0 || glucoseVal > 10.0) {
        return "#e74c3c"; // Crimson Red: Hypo / Hyper Alert Window
      } else if (glucoseVal > 7.8) {
        return "#e67e22"; // Pumpkin Orange: High Postprandial Warning Bounds
      }
      return "#00bb00"; // Jade Green: Optimal Target Glycemia
    } else {
      if (glucoseVal < 70 || glucoseVal > 180) {
        return "#e74c3c"; // Crimson Red Alert
      } else if (glucoseVal > 140) {
        return "#e67e22"; // Pumpkin Orange Warning Bounds
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
      return "#e74c3c"; // Elevated Risk Spectrum Border
    } else if (numericValue >= 5.7) {
      return "#e67e22"; // Elevated Pre-Diabetes Window Border
    }
    return "#00bb00"; // Normal Glycemic Span Green
  }

  /**
   * Component DOM Rendering Lifecycle Implementation Core.
   * Re-evaluates CSS grids, parses incoming data buffers, and rewrites the Shadow Root markup.
   * @private
   */
  _render() {
    if (!this._config || !this._hass) {
      return;
    }

    /**
     * Resolves Home Assistant states safely by validating tracking instances.
     * Handles disconnected or non-initialized nodes seamlessly.
     */
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
    
    const activeRawReading = fetchStateString(this._config.entity);
    const parsedGlucoseFloat = parseFloat(activeRawReading);
    const rawTrendString = fetchStateString(this._config.trend_entity);
    
    const trendMetaData = this._getTrendInfo(rawTrendString);
    const selectedUnitLabel = this._config.unit_type || "mmol/L";
    const computedA1cValue = this._calculateA1c(parsedGlucoseFloat, selectedUnitLabel);
    
    const analyticalGlucoseColor = this._getGlucoseColor(parsedGlucoseFloat, selectedUnitLabel);
    const analyticalA1cColor = this._getA1cColor(computedA1cValue);

    // Write UI View Structure with isolated strict styling definitions
    this.shadowRoot.innerHTML = `
      <style>
        ha-card { 
          background: rgba(0, 25, 10, 0.4); 
          border: 1.5px solid #00bb00; 
          border-radius: 16px; 
          padding: 20px; 
          color: #ffffff; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
        .glucose-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 5px solid ${analyticalGlucoseColor};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.35);
          transition: border-color 0.4s ease-in-out;
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
          text-transform: capitalize;
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
        }
        .a1c-box { 
          border: 2px solid ${analyticalA1cColor}; 
          transition: border-color 0.4s ease-in-out;
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
      
      <ha-card>
        ${this._config.title ? `<div class="card-title">${this._config.title}</div>` : ''}
        
        <div class="header">
            <div class="glucose-circle">
                <div class="val">${activeRawReading}</div>
                <div class="unit-label">${selectedUnitLabel}</div>
            </div>
            <div class="trend-container">
                <div class="trend-text">${rawTrendString}</div>
                <div style="font-size: 3.8rem; line-height: 1; transition: transform 0.3s ease;">${trendMetaData.label}</div>
            </div>
        </div>
        
        <div class="grid-triple">
           <div class="box">
             <div class="box-h" style="color: #3498db;">IOB</div>
             <div class="box-v">${fetchStateString(this._config.iob_entity)} U</div>
           </div>
           <div class="box">
             <div class="box-h" style="color: #2ecc71;">COB</div>
             <div class="box-v">${fetchStateString(this._config.cob_entity)} g</div>
           </div>
           <div class="box">
             <div class="box-h" style="color: #e67e22;">REQ</div>
             <div class="box-v">${fetchStateString(this._config.req_entity)}</div>
           </div>
        </div>
        
        <div class="grid-double">
           <div class="box a1c-box">
             <div class="box-h" style="color: ${analyticalA1cColor}">EST. A1C</div>
             <div class="box-v" style="color: ${analyticalA1cColor}">${computedA1cValue}%</div>
           </div>
           <div class="box">
             <div class="box-h" style="color: #ffffff; opacity: 0.9;">SENSOR DAYS</div>
             <div class="box-v" style="font-size: 1.1rem; line-height: 1.3; white-space: normal;">${fetchStateString(this._config.days_entity)}</div>
           </div>
        </div>
        
        <div class="btn" id="triggerActionOne">${this._config.alexa_name_1 || "LivingRoom Readout"}</div>
        <div class="btn" id="triggerActionTwo">${this._config.alexa_name_2 || "BedRoom Readout"}</div>
      </ha-card>
    `;

    // Connect standard click event listeners to execute integration scripts
    this.shadowRoot.querySelector('#triggerActionOne').addEventListener('click', () => {
      this._callService(this._config.alexa_1);
    });
    
    this.shadowRoot.querySelector('#triggerActionTwo').addEventListener('click', () => {
      this._callService(this._config.alexa_2);
    });
  }
}

/**
 * Visual Form Editor Component
 * Generates automated configuration forms within the UI, eliminating 
 * manual YAML configuration overhead.
 */
class T1DDiabetesCardEditor extends HTMLElement {
  
  /**
   * Instantiates the editor module workspace.
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = null;
    this._hass = null;
  }

  /**
   * Inherits configuration states directly from parent context boundaries.
   * @param {Object} config UI target reference block.
   */
  setConfig(config) {
    this._config = config;
  }

  /**
   * Tracks entity structural data changes on Home Assistant environments.
   * @param {Object} hass State machine pointer mapping.
   */
  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  /**
   * Form Generator Engine Lifecycle. Builds the standard interactive Lovelace schema map.
   * @private
   */
  _render() {
    if (!this._hass || !this._config || this.shadowRoot.querySelector('ha-form')) {
      return;
    }
    
    // Explicit Form Field Generation Schema Map
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
        name: "trend_entity",
        label: "Interstitial Fluid Trend Path Direction Pointer Sensor",
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
      }
    ];

    const formElement = document.createElement("ha-form");
    formElement.hass = this._hass;
    formElement.schema = structuralSchema;
    formElement.data = this._config;
    
    // Wire change listeners to dynamically update the view on changes
    formElement.addEventListener("value-changed", (eventHook) => {
      this._config = eventHook.detail.value;
      
      const configChangeEvent = new CustomEvent("config-changed", { 
        detail: { config: this._config }, 
        bubbles: true, 
        composed: true 
      });
      
      this.dispatchEvent(configChangeEvent);
    });
    
    // Append structured layout nodes directly to the editor workspace
    this.shadowRoot.appendChild(formElement);
  }
}

// Global Core Custom Element Registration Engine Sequences
customElements.define('t1d-diabetes-card', T1DDiabetesCard);
customElements.define('t1d-diabetes-card-editor', T1DDiabetesCardEditor);

// Register configuration descriptor metrics to the custom cards list instance array
window.customCards = window.customCards || [];
window.customCards.push({ 
  type: 't1d-diabetes-card', 
  name: 'T1DDiabetesCard', 
  preview: true, 
  description: 'Production T1D UI Component featuring Adaptive Color Gauges and Script Triggers.' 
});

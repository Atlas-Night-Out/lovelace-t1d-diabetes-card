class T1DDiabetesCard extends HTMLElement {
    set hass(hass) { this._hass = hass; }
    setConfig(config) { this._config = config; }
    
    static getConfigElement() {
        return document.createElement("t1d-diabetes-card-editor");
    }

    connectedCallback() {
        if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <ha-card style="background: #1a1e1a; border: 1px solid #2e4a2e; border-radius: 16px; padding: 16px; color: white;">
                <div style="font-size:12px; color:#888; margin-bottom:8px;">${this._config.title || 'Blood Sugar'}</div>
                <div style="font-size:32px; font-weight:bold; color:#34c759;">${this._config.entity}</div>
            </ha-card>
        `;
    }
}

class T1DDiabetesCardEditor extends HTMLElement {
    setConfig(config) { this._config = config; }
    set hass(hass) { this._hass = hass; }

    connectedCallback() {
        if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <div style="padding:10px;">
                <p>Configuration available in UI. Use the toggles to adjust visibility of A1C and Title.</p>
            </div>
        `;
    }
}

// Registration must happen at the very end
customElements.define('t1d-diabetes-card-editor', T1DDiabetesCardEditor);
customElements.define('t1d-diabetes-card', T1DDiabetesCard);

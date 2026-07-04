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

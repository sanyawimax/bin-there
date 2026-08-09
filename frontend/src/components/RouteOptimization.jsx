function RouteOptimization() {
  return (
    <section className="route-section">

      <div className="route-header">
        <div>
          <p className="eyebrow">SMART COLLECTION</p>
          <h2>Route Optimization</h2>
          <p>
            Find an efficient collection route for municipal teams.
          </p>
        </div>

        <div className="route-icon">
          🚛
        </div>
      </div>

      <div className="route-map">

        <div className="route-road road-one"></div>
        <div className="route-road road-two"></div>
        <div className="route-road road-three"></div>

        <div className="route-stop stop-one">1</div>
        <div className="route-stop stop-two">2</div>
        <div className="route-stop stop-three">3</div>
        <div className="route-stop stop-four">4</div>

        <div className="route-bin bin-one">🗑️</div>
        <div className="route-bin bin-two">🗑️</div>
        <div className="route-bin bin-three">🗑️</div>

        <div className="collection-truck">
          🚛
        </div>

      </div>

      <div className="route-stats">

        <div>
          <strong>8</strong>
          <span>Collection points</span>
        </div>

        <div>
          <strong>4.2 km</strong>
          <span>Estimated distance</span>
        </div>

        <div>
          <strong>27 min</strong>
          <span>Estimated time</span>
        </div>

      </div>

      <button className="route-button">
        Optimize Route →
      </button>

    </section>
  );
}

export default RouteOptimization;
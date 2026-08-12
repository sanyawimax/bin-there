import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/PageFooter";
const API_URL = import.meta.env.VITE_API_URL;
const API = `${API_URL}`;

function MunicipalDashboard() {

  const [stats, setStats] = useState(null);
  const [pickups, setPickups] = useState([]);
  const [route, setRoute] = useState([]);

  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------
  // LOAD DASHBOARD DATA
  // --------------------------------

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        const [
          statsResponse,
          pickupsResponse
        ] = await Promise.all([

          fetch(`${API}/municipal/stats`),

          fetch(`${API}/municipal/pickups`)

        ]);

        const statsData =
          await statsResponse.json();

        const pickupsData =
          await pickupsResponse.json();

        if (!statsResponse.ok) {
          throw new Error(
            statsData.error ||
            "Failed to load statistics"
          );
        }

        if (!pickupsResponse.ok) {
          throw new Error(
            pickupsData.error ||
            "Failed to load pickup information"
          );
        }

        setStats(statsData);
        setPickups(pickupsData);

      } catch (error) {

        console.error(error);

        setError(
          "Could not load municipal dashboard."
        );

      } finally {

        setLoading(false);

      }

    };

    loadDashboard();

  }, []);


  // --------------------------------
  // OPTIMIZE COLLECTION ROUTE
  // --------------------------------

  const optimizeRoute = async () => {

    setOptimizing(true);
    setError("");

    try {

      const response =
        await fetch(`${API}/municipal/route`);

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.error ||
          "Could not optimize route"
        );

      }

      setRoute(data);

    } catch (error) {

      console.error(error);

      setError(
        "Could not generate the collection route."
      );

    } finally {

      setOptimizing(false);

    }

  };


  // --------------------------------
  // LOADING
  // --------------------------------

  if (loading) {

    return (
      <div className="municipal-page">

        <div className="municipal-loading">
          <div className="municipal-spinner"></div>

          <p>
            Loading municipal dashboard...
          </p>
        </div>

        <Footer />

      </div>
    );

  }


  // --------------------------------
  // ERROR
  // --------------------------------

  if (error && !stats) {

    return (
      <div className="municipal-page">

        <div className="municipal-error">
          ⚠️ {error}
        </div>

        <Footer />

      </div>
    );

  }


  return (

    <div className="municipal-page">

      {/* --------------------------------
          HEADER
      -------------------------------- */}

      <header className="municipal-header">

        <Link
          to="/"
          className="municipal-back"
        >
          ←
        </Link>

        <div>
          <p className="municipal-eyebrow">
            BINTHERE
          </p>

          <h1>
            Municipal Dashboard
          </h1>
        </div>

        <div className="municipal-header-icon">
          🏙️
        </div>

      </header>


      {/* --------------------------------
          MAIN CONTENT
      -------------------------------- */}

      <main className="municipal-content">


        {/* --------------------------------
            INTRO
        -------------------------------- */}

        <section className="municipal-intro">

          <div>

            <p className="municipal-label">
              CITY OPERATIONS
            </p>

            <h2>
              Waste management
              <span> at a glance.</span>
            </h2>

            <p>
              Monitor participation, recycling
              and collection priorities across
              the community.
            </p>

          </div>

        </section>


        {/* --------------------------------
            STATS
        -------------------------------- */}

        <section className="municipal-stats">

          <div className="municipal-stat-card">

            <div className="municipal-stat-icon">
              👥
            </div>

            <strong>
              {stats?.total_users ?? 0}
            </strong>

            <p>
              Citizens
            </p>

          </div>


          <div className="municipal-stat-card">

            <div className="municipal-stat-icon">
              ♻️
            </div>

            <strong>
              {stats?.total_recycled_kg ?? 0} kg
            </strong>

            <p>
              Waste diverted
            </p>

          </div>


          <div className="municipal-stat-card">

            <div className="municipal-stat-icon">
              🏢
            </div>

            <strong>
              {stats?.participating_buildings ?? 0}
            </strong>

            <p>
              Buildings
            </p>

          </div>


          <div className="municipal-stat-card">

            <div className="municipal-stat-icon">
              🌱
            </div>

            <strong>
              {stats?.estimated_co2_saved_kg ?? 0} kg
            </strong>

            <p>
              Estimated CO₂ saved
            </p>

          </div>

        </section>


        {/* --------------------------------
            COLLECTION STATUS
        -------------------------------- */}

        <section className="municipal-section">

          <div className="municipal-section-heading">

            <div>

              <p className="municipal-label">
                COLLECTION
              </p>

              <h3>
                Collection status
              </h3>

            </div>

            <span className="municipal-count">
              {pickups.length} locations
            </span>

          </div>


          <div className="pickup-list">

            {pickups.length === 0 ? (

              <div className="municipal-empty">
                No pickup locations available.
              </div>

            ) : (

              pickups.map((pickup) => (

                <div
                  className="pickup-card"
                  key={pickup.id}
                >

                  <div className="pickup-icon">
                    🗑️
                  </div>

                  <div className="pickup-info">

                    <strong>
                      {pickup.building}
                    </strong>

                    <p>
                      {pickup.area}
                    </p>

                    <small>
                      {pickup.status || "Status unavailable"}
                    </small>

                  </div>

                  <div className="pickup-level">

                    <strong>
                      {pickup.fill_level}%
                    </strong>

                    <div className="fill-bar">

                      <div
                        className="fill-progress"
                        style={{
                          width: `${Math.min(
                            pickup.fill_level || 0,
                            100
                          )}%`
                        }}
                      />

                    </div>

                  </div>

                </div>

              ))

            )}

          </div>

        </section>


        {/* --------------------------------
            ROUTE OPTIMIZATION
        -------------------------------- */}

        <section className="municipal-section route-section">

          <div className="municipal-section-heading">

            <div>

              <p className="municipal-label">
                SMART COLLECTION
              </p>

              <h3>
                Collection route
              </h3>

            </div>

            <button
              className="optimize-button"
              onClick={optimizeRoute}
              disabled={optimizing}
            >

              {optimizing
                ? "Optimizing..."
                : "Optimize Route"
              }

            </button>

          </div>


          <p className="route-description">
            Stops are prioritized according to
            current bin fill levels.
          </p>


          {/* --------------------------------
              ROUTE MAP / GRAPHIC
          -------------------------------- */}

          {route.length > 0 ? (

            <div className="route-map">

              <div className="route-line"></div>

              <div className="route-stops">

                {route.map((stop, index) => (

                  <div
                    className="route-stop"
                    key={`${stop.stop}-${index}`}
                  >

                    <div className="route-node">
                      {stop.stop}
                    </div>

                    <div className="route-stop-card">

                      <div>

                        <strong>
                          {stop.building}
                        </strong>

                        <p>
                          {stop.area}
                        </p>

                      </div>

                      <span>
                        {stop.fill_level}%
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          ) : (

            <div className="route-empty">

              <div className="route-empty-icon">
                🗺️
              </div>

              <h4>
                No route generated yet
              </h4>

              <p>
                Click <strong>Optimize Route</strong>
                to generate the recommended
                collection sequence.
              </p>

            </div>

          )}


          {error && (

            <div className="route-error">
              ⚠️ {error}
            </div>

          )}

        </section>


      </main>


      {/* --------------------------------
          PAGE FOOTER
      -------------------------------- */}

      <Footer />

    </div>

  );
}

export default MunicipalDashboard;
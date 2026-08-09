import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MunicipalDashboard() {

  const [stats, setStats] = useState(null);
  const [pickups, setPickups] = useState([]);
  const [route, setRoute] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        const [
          statsResponse,
          pickupsResponse,
          routeResponse
        ] = await Promise.all([

          fetch(
            "http://127.0.0.1:5000/municipal/stats"
          ),

          fetch(
            "http://127.0.0.1:5000/municipal/pickups"
          ),

          fetch(
            "http://127.0.0.1:5000/municipal/route"
          )

        ]);

        const statsData =
          await statsResponse.json();

        const pickupsData =
          await pickupsResponse.json();

        const routeData =
          await routeResponse.json();

        if (!statsResponse.ok) {
          throw new Error(
            statsData.error ||
            "Failed to load statistics"
          );
        }

        setStats(statsData);
        setPickups(pickupsData);
        setRoute(routeData);

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

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return (
      <div className="scan-error">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div>

      <header className="top-bar">

        <Link to="/" className="back-button">
          ←
        </Link>

        <h1>Municipal Dashboard</h1>

        <div></div>

      </header>

      <main className="home-content">

        <section className="welcome">

          <p className="eyebrow">
            BINTHERE MUNICIPAL PORTAL
          </p>

          <h2>
            Waste management <span>at a glance.</span>
          </h2>

          <p>
            Monitor participation, recycling and
            collection priorities.
          </p>

        </section>


        <section className="stats">

          <div className="stat-card">
            <span>👥</span>

            <strong>
              {stats.total_users}
            </strong>

            <p>Citizens</p>
          </div>


          <div className="stat-card">
            <span>♻️</span>

            <strong>
              {stats.total_recycled_kg} kg
            </strong>

            <p>Waste diverted</p>
          </div>


          <div className="stat-card">
            <span>🏢</span>

            <strong>
              {stats.participating_buildings}
            </strong>

            <p>Buildings</p>
          </div>


          <div className="stat-card">
            <span>🌱</span>

            <strong>
              {stats.estimated_co2_saved_kg} kg
            </strong>

            <p>Estimated CO₂ saved</p>
          </div>

        </section>


        <section className="recent">

          <div className="section-heading">
            <h3>
              Collection status
            </h3>
          </div>

          {pickups.map((pickup) => (

            <div
              className="activity-item"
              key={pickup.id}
            >

              <span>
                🗑️
              </span>

              <div>

                <strong>
                  {pickup.building}
                </strong>

                <p>
                  {pickup.area}
                </p>

                <small>
                  Status: {pickup.status}
                </small>

              </div>

              <b>
                {pickup.fill_level}%
              </b>

            </div>

          ))}

        </section>


        <section className="recent">

          <div className="section-heading">
            <h3>
              Suggested collection priority
            </h3>
          </div>

          {route.map((stop) => (

            <div
              className="activity-item"
              key={stop.stop}
            >

              <span>
                {stop.stop}
              </span>

              <div>

                <strong>
                  {stop.building}
                </strong>

                <p>
                  {stop.area}
                </p>

              </div>

              <b>
                {stop.fill_level}%
              </b>

            </div>

          ))}

        </section>

      </main>

    </div>
  );
}

export default MunicipalDashboard;
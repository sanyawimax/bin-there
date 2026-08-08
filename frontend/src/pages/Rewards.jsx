import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/rewards"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch rewards");
        }

        const data = await response.json();

        console.log("REWARDS:", data);

        setRewards(data);
      } catch (error) {
        console.error("Rewards error:", error);
        setError("Could not load rewards.");
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, []);

  return (
    <div className="rewards-page">

      {/* Header */}

      <header className="top-bar">

        <Link to="/" className="back-button">
          ←
        </Link>

        <h1>Rewards</h1>

        <div></div>

      </header>


      {/* Main content */}

      <main className="rewards-content">

        <section className="rewards-heading">

          <p className="eyebrow">
            BINTHERE REWARDS
          </p>

          <h2>
            Turn your recycling
            <br />
            <span>into rewards.</span>
          </h2>

          <p>
            Use your points to redeem rewards
            while making a positive impact.
          </p>

        </section>


        {/* Error */}

        {error && (
          <div className="scan-error">
            ⚠️ {error}
          </div>
        )}


        {/* Rewards */}

        {loading ? (
          <p>Loading rewards...</p>
        ) : (
          <section className="rewards-grid">

            {rewards.map((reward) => (

              <div
                className="reward-card"
                key={reward.id}
              >

                <div className="reward-icon">
                  🎁
                </div>


                <div className="reward-info">

                  <p className="card-label">
                    {reward.partner}
                  </p>

                  <h3>
                    {reward.name}
                  </h3>

                  <p>
                    {reward.description}
                  </p>

                  <strong>
                    ⭐ {reward.points_required} points
                  </strong>

                </div>


                <button className="reward-button">
                  Redeem
                </button>

              </div>

            ))}

          </section>
        )}

      </main>


      {/* Bottom navigation */}

      <nav className="bottom-nav">

        <Link to="/">
          ⌂
          <span>Home</span>
        </Link>

        <Link to="/scan">
          📷
          <span>Scan</span>
        </Link>

        <Link to="/rewards">
          🏆
          <span>Rewards</span>
        </Link>

        <a href="#market">
          🛍
          <span>Market</span>
        </a>

      </nav>

    </div>
  );
}

export default Rewards;
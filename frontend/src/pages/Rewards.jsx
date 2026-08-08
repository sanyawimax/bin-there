import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [points, setPoints] = useState(0);
  const [redeeming, setRedeeming] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("user")
    );

    if (storedUser) {
      setPoints(storedUser.points || 0);
    }

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

  const handleRedeem = async (reward) => {
    setError("");
    setMessage("");

    const storedUser = JSON.parse(
      localStorage.getItem("user")
    );

    if (!storedUser || !storedUser.user_id) {
      setError("Please log in before redeeming a reward.");
      return;
    }

    if (points < reward.points_required) {
      setError(
        `You need ${reward.points_required} points to redeem this reward.`
      );
      return;
    }

    setRedeeming(reward.id);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/redeem",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: storedUser.user_id,
            reward_id: reward.id,
          }),
        }
      );

      const data = await response.json();

      console.log("REDEEM RESPONSE:", data);

      if (!response.ok) {
        setError(data.error || "Could not redeem reward.");
        return;
      }

      // Update points on the page
      setPoints(data.remaining_points);

      // Update localStorage
      const updatedUser = {
        ...storedUser,
        points: data.remaining_points,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setMessage(
        `🎉 ${data.reward} redeemed successfully!`
      );

    } catch (error) {
      console.error("Redeem error:", error);
      setError("Could not connect to the server.");
    } finally {
      setRedeeming(null);
    }
  };

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


        {/* Current points */}

        <div className="rewards-points">

          <p>Your current points</p>

          <strong>
            ⭐ {points} Points
          </strong>

        </div>


        {/* Success message */}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}


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


                <button
                  className="reward-button"
                  onClick={() => handleRedeem(reward)}
                  disabled={redeeming === reward.id}
                >
                  {redeeming === reward.id
                    ? "Redeeming..."
                    : "Redeem"}
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
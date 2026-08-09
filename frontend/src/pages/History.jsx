import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import PageFooter from "../components/PageFooter";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user?.user_id) {
      setError("Please log in to view your history.");
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/history/${user.user_id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load history");
        }

        setHistory(data);
      } catch (error) {
        console.error(error);
        setError("Could not load your history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getWasteIcon = (category) => {
    switch (category) {
      case "Plastic":
        return "🧴";
      case "Paper":
        return "📄";
      case "Glass":
        return "🍾";
      case "Metal":
        return "🥫";
      case "E-waste":
        return "🔌";
      case "Wet/Organic":
        return "🍎";
      case "Textile":
        return "👕";
      case "Hazardous":
        return "⚠️";
      default:
        return "♻️";
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown time";

    return new Date(timestamp).toLocaleString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div>

      <header className="top-bar">
        <Link to="/" className="back-button">
          ←
        </Link>

        <h1>History</h1>

        <div></div>
      </header>

      <main className="home-content">

        <section className="welcome">
          <p className="eyebrow">
            YOUR ACTIVITY
          </p>

          <h2>
            Waste <span>history.</span>
          </h2>

          <p>
            Every item you've identified through BinThere.
          </p>
        </section>

        {loading && (
          <p>Loading your history...</p>
        )}

        {error && (
          <div className="scan-error">
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="activity-item">
            <span>♻️</span>

            <div>
              <strong>No scans yet</strong>
              <p>Scan your first piece of waste.</p>
            </div>
          </div>
        )}

        {!loading && !error && history.map((item, index) => (
          <div
            className="activity-item"
            key={index}
          >

            <span>
              {getWasteIcon(item.category)}
            </span>

            <div>
              <strong>
                {item.object || item.category || "Waste item"}
              </strong>

              <p>
                {item.category} •{" "}
                {formatTimestamp(item.timestamp)}
              </p>

              <small>
                Estimated weight: {item.estimated_weight_kg ?? 0} kg
              </small>
            </div>

            <b>
              +{item.points ?? 0}
            </b>

          </div>
        ))}

      </main>
        
     <BottomNav />
    <PageFooter />
    </div>
  );
}

export default History;
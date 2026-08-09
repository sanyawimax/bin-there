import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import PageFooter from "../components/PageFooter";

function Home() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [rank, setRank] = useState(null);
  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("user")
    );

    if (!storedUser) {
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/user/${storedUser.user_id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();

        console.log("UPDATED USER:", data);

        // Keep user_id because /user endpoint doesn't return it
        const updatedUser = {
          ...data,
          user_id: storedUser.user_id
        };

        setUser(updatedUser);

        // Update localStorage with latest values
        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

      } catch (error) {
        console.error(
          "Could not fetch user data:",
          error
        );

        // Fall back to stored data
        setUser(storedUser);
      }
    };

    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/leaderboard"
        );

        const data = await response.json();

        const myRank = data.find(
          (person) =>
            person.name === storedUser.name
        );

        if (myRank) {
          setRank(myRank.rank);
        }

      } catch (error) {
        console.error("Could not fetch rank:", error);
      }
    };
    const fetchHistory = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/history/${storedUser.user_id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch history");
        }

        const data = await response.json();

        console.log("USER HISTORY:", data);

        setHistory(data);

      } catch (error) {
        console.error(
          "Could not fetch history:",
          error
        );

        setHistory([]);
      }
    };


    fetchUser();
    fetchHistory();
    fetchLeaderboard();
  }, []);


  const formatTimestamp = (timestamp) => {
    if (!timestamp) {
      return "Unknown time";
    }

    const date = new Date(timestamp);
    const now = new Date();

    const isToday =
      date.toDateString() === now.toDateString();

    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
      })}`;
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
      })}`;
    }

    return date.toLocaleDateString([], {
      day: "numeric",
      month: "short"
    });
  };


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


  return (
    <div>

      <header className="top-bar">
        <h1>BinThere</h1>

        <Link to="/login" className="profile-button">
          👤
        </Link>
      </header>


      <main className="home-content">

        <section className="welcome">

          <p className="eyebrow">
            SMART WASTE MANAGEMENT
          </p>

          <h2>
            Welcome back,
            <br />

            <span>
              {user?.name || "User"}.
            </span>
          </h2>

          <p>
            Identify your waste, dispose of it correctly,
            and earn rewards while helping your community.
          </p>

        </section>


        <Link
          to="/scan"
          className="scan-card"
        >

          <div className="scan-icon">
            📷
          </div>

          <div>

            <h3>
              Scan Your Waste
            </h3>

            <p>
              Identify and segregate your waste
            </p>

          </div>

          <span className="arrow">
            →
          </span>

        </Link>


        <section className="stats">

          <div className="stat-card">

            <span>
              ⭐
            </span>

            <strong>
              {user?.points ?? 0}
            </strong>

            <p>
              Points
            </p>

          </div>


          <div className="stat-card">

            <span>
              ♻️
            </span>

            <strong>
              {user?.total_recycled_kg ?? 0} kg
            </strong>

            <p>
              Waste diverted
            </p>

          </div>


          <div className="stat-card">

            <span>
              🏆
            </span>

            <strong>
              {rank ? `#${rank}` : "—"}
            </strong>

            <p>
              Your rank
            </p>

          </div>

        </section>


        <section className="recent">

          <div className="section-heading">

            <h3>
              Recent activity
            </h3>

            <Link to="/history">
              View all
            </Link>

          </div>


          {history.length === 0 ? (

            <div className="activity-item">

              <span>
                ♻️
              </span>

              <div>

                <strong>
                  No recent activity
                </strong>

                <p>
                  Start by scanning your waste
                </p>

              </div>

              <b>
                —
              </b>

            </div>

          ) : (

            history
              .slice(0, 2)
              .map((item, index) => (

                <div
                  className="activity-item"
                  key={index}
                >

                  <span>
                    {getWasteIcon(item.category)}
                  </span>

                  <div>

                    <strong>
                      {item.object ||
                        item.category ||
                        "Waste item"}
                    </strong>

                    <p>
                      {formatTimestamp(
                        item.timestamp
                      )}
                    </p>

                  </div>

                  <b>
                    +{item.points ?? 0}
                  </b>

                </div>

              ))

          )}
        
        <section className="municipal-section">

          <p className="eyebrow">
            MUNICIPAL PORTAL
          </p>

          <Link
            to="/municipal"
            className="municipal-card"
          >
            <div className="municipal-icon">
              🏛️
            </div>

            <div className="municipal-info">
              <strong>
                Municipal Dashboard
              </strong>

              <p>
                Collection & recycling overview
              </p>
            </div>

            <div className="municipal-arrow">
              →
            </div>
          </Link>

        </section>

        </section>

      </main>


      <BottomNav />
      <PageFooter />
    </div>
  );
}

export default Home;

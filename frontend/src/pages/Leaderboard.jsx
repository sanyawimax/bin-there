import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Leaderboard() {

  const [tab, setTab] = useState("people");

  const [people, setPeople] = useState([]);
  const [buildings, setBuildings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const fetchLeaderboards = async () => {

      try {

        const [peopleResponse, buildingResponse] =
          await Promise.all([
            fetch("http://127.0.0.1:5000/leaderboard"),
            fetch("http://127.0.0.1:5000/building-leaderboard")
          ]);

        const peopleData = await peopleResponse.json();
        const buildingData = await buildingResponse.json();

        if (!peopleResponse.ok) {
          throw new Error(
            peopleData.error || "Failed to load leaderboard"
          );
        }

        if (!buildingResponse.ok) {
          throw new Error(
            buildingData.error ||
            "Failed to load building leaderboard"
          );
        }

        setPeople(peopleData);
        setBuildings(buildingData);

      } catch (error) {

        console.error(error);

        setError(
          "Could not load the leaderboard."
        );

      } finally {

        setLoading(false);

      }
    };

    fetchLeaderboards();

  }, []);

  return (
    <div>

      <header className="top-bar">

        <Link to="/" className="back-button">
          ←
        </Link>

        <h1>Leaderboard</h1>

        <div></div>

      </header>

      <main className="home-content">

        <section className="welcome">

          <p className="eyebrow">
            BINTHERE COMMUNITY
          </p>

          <h2>
            Make waste <span>count.</span>
          </h2>

          <p>
            See how you and your community are doing.
          </p>

        </section>

        <div className="leaderboard-tabs">

          <button
            onClick={() => setTab("people")}
            className={
              tab === "people"
                ? "active-tab"
                : ""
            }
          >
            Individuals
          </button>

          <button
            onClick={() => setTab("buildings")}
            className={
              tab === "buildings"
                ? "active-tab"
                : ""
            }
          >
            Buildings
          </button>

        </div>

        {loading && (
          <p>Loading leaderboard...</p>
        )}

        {error && (
          <div className="scan-error">
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && tab === "people" && (

          <section>

            {people.map((person) => (

              <div
                className="activity-item"
                key={person.rank}
              >

                <span>
                  {person.rank === 1
                    ? "🥇"
                    : person.rank === 2
                    ? "🥈"
                    : person.rank === 3
                    ? "🥉"
                    : `#${person.rank}`}
                </span>

                <div>

                  <strong>
                    {person.name}
                  </strong>

                  <p>
                    {person.building || "No building"}
                  </p>

                </div>

                <b>
                  {person.points} pts
                </b>

              </div>

            ))}

          </section>

        )}

        {!loading && !error && tab === "buildings" && (

          <section>

            {buildings.map((building, index) => (

              <div
                className="activity-item"
                key={index}
              >

                <span>
                  🏢
                </span>

                <div>

                  <strong>
                    {building.building}
                  </strong>

                  <p>
                    {building.members} members
                  </p>

                </div>

                <b>
                  {building.total_points} pts
                </b>

              </div>

            ))}

          </section>

        )}

      </main>

    </div>
  );
}

export default Leaderboard;
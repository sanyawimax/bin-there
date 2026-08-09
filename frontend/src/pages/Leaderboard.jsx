import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import PageFooter from "../components/PageFooter";
const API_URL = import.meta.env.VITE_API_URL;
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
            fetch(`${API_URL}/leaderboard`),
            fetch(`${API_URL}/building-leaderboard`)
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

                        {/* TOP THREE */}

                        {people.length >= 3 && (

                        <div className="leaderboard-podium">

                            {/* SECOND */}

                            <div className="podium-card second">

                            <div className="podium-medal">
                                🥈
                            </div>

                            <div className="podium-avatar">
                                {people[1].name?.charAt(0).toUpperCase()}
                            </div>

                            <strong>
                                {people[1].name}
                            </strong>

                            <span>
                                {people[1].points} pts
                            </span>

                            <small>
                                {people[1].building || "Community"}
                            </small>

                            <div className="podium-base">
                                2
                            </div>

                            </div>


                            {/* FIRST */}

                            <div className="podium-card first">

                            <div className="podium-medal">
                                🥇
                            </div>

                            <div className="podium-avatar">
                                {people[0].name?.charAt(0).toUpperCase()}
                            </div>

                            <strong>
                                {people[0].name}
                            </strong>

                            <span>
                                {people[0].points} pts
                            </span>

                            <small>
                                {people[0].building || "Community"}
                            </small>

                            <div className="podium-base">
                                1
                            </div>

                            </div>


                            {/* THIRD */}

                            <div className="podium-card third">

                            <div className="podium-medal">
                                🥉
                            </div>

                            <div className="podium-avatar">
                                {people[2].name?.charAt(0).toUpperCase()}
                            </div>

                            <strong>
                                {people[2].name}
                            </strong>

                            <span>
                                {people[2].points} pts
                            </span>

                            <small>
                                {people[2].building || "Community"}
                            </small>

                            <div className="podium-base">
                                3
                            </div>

                            </div>

                        </div>

                        )}


                        {/* EVERYONE ELSE */}

                        <div className="leaderboard-list">

                        {people.slice(3).map((person) => (

                            <div
                            className="leaderboard-row"
                            key={person.rank}
                            >

                            <span className="leaderboard-rank">
                                #{person.rank}
                            </span>

                            <div className="leaderboard-avatar">
                                {person.name?.charAt(0).toUpperCase()}
                            </div>

                            <div className="leaderboard-person">

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

                        </div>

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
    <BottomNav />
    <PageFooter />
    </div>
  );
}

export default Leaderboard;
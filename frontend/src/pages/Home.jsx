import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="app">
    <div className="home-page">
    <header className="top-bar">
        <h1>BinThere</h1>

        <button className="profile-button">
          👤
        </button>
      </header>

      <main className="home-content">
        <section className="welcome">
          <p className="eyebrow">SMART WASTE MANAGEMENT</p>

          <h2>
            Make your waste
            <br />
            <span>count.</span>
          </h2>

          <p>
            Identify your waste, dispose of it correctly,
            and earn rewards while helping your community.
          </p>
        </section>

        <Link to="/scan" className="scan-card">
          <div className="scan-icon">📷</div>

          <div>
            <h3>Scan Your Waste</h3>
            <p>Identify and segregate your waste</p>
          </div>

          <span className="arrow">→</span>
        </Link>

        <section className="stats">
          <div className="stat-card">
            <span>⭐</span>
            <strong>1,240</strong>
            <p>Points</p>
          </div>

          <div className="stat-card">
            <span>♻️</span>
            <strong>12.4 kg</strong>
            <p>Waste diverted</p>
          </div>

          <div className="stat-card">
            <span>🏆</span>
            <strong>#18</strong>
            <p>Your rank</p>
          </div>
        </section>

        <section className="recent">
          <div className="section-heading">
            <h3>Recent activity</h3>
            <button>View all</button>
          </div>

          <div className="activity-item">
            <span>🧴</span>
            <div>
              <strong>Plastic bottle</strong>
              <p>Today, 2:34 PM</p>
            </div>
            <b>+20</b>
          </div>

          <div className="activity-item">
            <span>📦</span>
            <div>
              <strong>Cardboard</strong>
              <p>Yesterday, 6:12 PM</p>
            </div>
            <b>+15</b>
          </div>
        </section>
      </main>

      <nav className="bottom-nav">
        <Link to="/">⌂<span>Home</span></Link>
        <Link to="/scan">📷<span>Scan</span></Link>
        <a href="#rewards">🏆<span>Rewards</span></a>
        <a href="#market">🛍<span>Market</span></a>
      </nav>
    </div>
    </div>
  );
}

export default Home;
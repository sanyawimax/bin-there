import { NavLink } from "react-router-dom";

function BottomNav() {
  return (
    <nav className="bottom-nav">

      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        <span className="nav-icon">⌂</span>
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/scan"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        <span className="nav-icon">📷</span>
        <span>Scan</span>
      </NavLink>

      <NavLink
        to="/rewards"
        className={({ isActive }) =>
          isActive ? "nav-item reward-nav active" : "nav-item reward-nav"
        }
      >
        <span className="nav-icon">🎁</span>
        <span>Rewards</span>
      </NavLink>

      <NavLink
        to="/leaderboard"
        className={({ isActive }) =>
          isActive ? "nav-item leaderboard-nav active" : "nav-item leaderboard-nav"
        }
      >
        <span className="nav-icon">🏆</span>
        <span>Leaderboard</span>
      </NavLink>

    </nav>
  );
}

export default BottomNav;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;
function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data));

      navigate("/");
    } catch (error) {
      console.error(error);
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>Welcome back</h1>

        <p>
          Log in to your BinThere account.
        </p>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>

        </form>

        <p>
          Don't have an account?{" "}
          <Link to="/signup">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
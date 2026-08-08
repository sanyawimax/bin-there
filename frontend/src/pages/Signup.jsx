import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [building, setBuilding] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          building,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed.");
        return;
      }

      // Signup successful
      alert("Account created successfully!");

      // Go to login
      navigate("/login");

    } catch (error) {
      console.error(error);
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <h1>Create your account</h1>

      <p>
        Join BinThere and start making your waste count.
      </p>

      <form onSubmit={handleSignup}>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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

        <input
          type="text"
          placeholder="Building (optional)"
          value={building}
          onChange={(e) => setBuilding(e.target.value)}
        />

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>

      </form>

      <p>
        Already have an account?{" "}
        <Link to="/login">
          Log in
        </Link>
      </p>

    </div>
  );
}

export default Signup;
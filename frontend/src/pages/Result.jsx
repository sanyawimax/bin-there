import { Link, useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import PageFooter from "../components/PageFooter";

function Result() {
  const location = useLocation();

  // Data sent from Scan.jsx
  const image = location.state?.image;
  const aiResult = location.state?.aiResult || {};

  const confidenceLabels = {
    high: "High confidence",
    medium: "Medium confidence",
    low: "Low confidence",
  };

  return (
    <div>

      {/* Header */}

      <header className="top-bar">

        <Link
          to="/scan"
          className="back-button"
        >
          ←
        </Link>

        <h1>Result</h1>

        <div></div>

      </header>


      <main className="result-content">

        {/* Heading */}

        <div className="result-heading">

          <div className="success-icon">
            ✓
          </div>

          <p className="eyebrow">
            AI IDENTIFICATION
          </p>

          <h2>
            Waste identified!
          </h2>

          <p>
            BinThere has analyzed your image and identified
            the following waste.
          </p>

        </div>


        {/* Uploaded image */}

        <div className="result-image">

          {image ? (
            <img
              src={image}
              alt="Uploaded waste"
              className="result-preview"
            />
          ) : (
            <div className="image-placeholder">
              🧴
            </div>
          )}

        </div>


        {/* Waste classification */}

        <div className="classification-card">

          <div>

            <p className="card-label">
              WASTE TYPE
            </p>

            <h3>
              {aiResult.object || "Unknown item"}
            </h3>

          </div>


          <div className="confidence">

            <span>
              {confidenceLabels[aiResult.confidence] ||
                "Unknown confidence"}
            </span>

            <small>
              AI confidence
            </small>

          </div>

        </div>


        {/* Category and disposal */}

        <div className="disposal-card">

          <div className="bin-icon">
            ♻️
          </div>

          <div>

            <p className="card-label">
              CATEGORY
            </p>

            <h3>
              {aiResult.category || "Unknown"}
            </h3>

            <p>
              {aiResult.disposal ||
                "No disposal instructions available."}
            </p>

          </div>

        </div>


        {/* Explanation */}

        <div className="explanation-card">

          <p className="card-label">
            ABOUT THIS IDENTIFICATION
          </p>

          <p>
            {aiResult.explanation ||
              "No explanation was provided by the AI."}
          </p>

        </div>


        {/* Low confidence warning */}

        {aiResult.confidence === "low" && (

          <div className="confidence-warning">

            <span>
              ⚠️
            </span>

            <div>

              <strong>
                Low confidence
              </strong>

              <p>
                We're not fully sure about this item.
                Please verify the category before disposal.
              </p>

            </div>

          </div>

        )}


        {/* Points */}

        <div className="points-earned">

          <span>
            ⭐
          </span>

          <div>

            <strong>
              +{aiResult.points ?? 0} Points
            </strong>

            <p>
              Added to your BinThere account
            </p>

          </div>

        </div>


        {/* Estimated weight */}

        <div className="points-earned">

          <span>
            ♻️
          </span>

          <div>

            <strong>
              {aiResult.estimated_weight_kg ?? 0} kg
            </strong>

            <p>
              Estimated waste diverted
            </p>

          </div>

        </div>


        {/* Actions */}

        <Link
          to="/scan"
          className="demo-button"
        >
          Scan Another Waste →
        </Link>

        <Link
          to="/"
          className="home-link"
        >
          Back to Home
        </Link>

      </main>

      <BottomNav />
      <PageFooter />
    </div>
  );
}

export default Result;

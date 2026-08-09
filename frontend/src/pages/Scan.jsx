import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import PageFooter from "../components/PageFooter";
const API_URL = import.meta.env.VITE_API_URL;
function Scan() {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleImageChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      setImage(URL.createObjectURL(selectedFile));
      setError("");
    }
  };

  const handleIdentify = async () => {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("image", file);
      formData.append("user_id", user.user_id);

      const response = await fetch(
        `${API_URL}/classify`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Classification failed");
      }

      const result = await response.json();

      console.log("AI result:", result);

      navigate("/result", {
        state: {
          image,
          aiResult: result,
        },
      });

    } catch (err) {
      console.error(err);

      setError(
        "Unable to identify the image. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scan-page">

      <header className="top-bar">
        <Link to="/" className="back-button">
          ←
        </Link>

        <h1>Scan Waste</h1>

        <div></div>
      </header>

      <main className="scan-content">

        <div className="scan-heading">

          <p className="eyebrow">
            WASTE IDENTIFICATION
          </p>

          <h2>
            What are you throwing away?
          </h2>

          <p>
            Upload an image and BinThere will identify
            the waste and tell you how to dispose of it.
          </p>

        </div>


        <div className="upload-box">

          {image ? (
            <>
              <div className="scan-preview">

                <img
                  src={image}
                  alt="Selected waste"
                  className="preview-image"
                />

                {loading && (
                  <>
                    <div className="scan-overlay"></div>
                    <div className="scan-line"></div>

                    <div className="scan-status">
                      <span>✦</span>
                      Analyzing your waste...
                    </div>
                  </>
                )}

    </div>

    {!loading && (
      <p className="image-selected">
        Image ready for identification ✓
      </p>
    )}

              <label className="upload-button">
                Change Image

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </label>
            </>
          ) : (
            <>
              <div className="upload-icon">
                📷
              </div>

              <h3>
                Upload a waste image
              </h3>

              <p>
                JPG, PNG or JPEG
              </p>

              <label className="upload-button">
                Choose Image

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </label>

              <span>
                or drag and drop an image here
              </span>
            </>
          )}

        </div>


        
        {error && (
          <div className="scan-error">
            ⚠️ {error}
          </div>
        )}


        <button
          className="demo-button"
          onClick={handleIdentify}
          disabled={loading}
        >
          {loading
            ? "Analyzing..."
            : "Identify Waste →"}
        </button>

      </main>

      <BottomNav />
      <PageFooter />

    </div>
  );
}

export default Scan;
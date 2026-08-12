import { useEffect } from "react";

function GoogleTranslate() {
  useEffect(() => {
    // Prevent loading the script multiple times
    if (document.getElementById("google-translate-script")) {
      return;
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,bn,hi",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");

    script.id = "google-translate-script";
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      // Don't remove the script when changing routes.
      // The translator should remain available throughout the app.
    };
  }, []);

  return (
    <div className="google-translate-wrapper">
      <div id="google_translate_element"></div>
    </div>
  );
}

export default GoogleTranslate;
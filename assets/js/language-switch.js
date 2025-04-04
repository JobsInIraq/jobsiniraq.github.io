document.addEventListener("DOMContentLoaded", function () {
    // List of supported languages
    const supportedLanguages = ["en", "ar"]; // Add more if needed

    // Function to get the language from browser settings or fallback
    function getPreferredLanguage() {
        let lang = localStorage.getItem("preferredLanguage") || navigator.language || "en";
        lang = lang.split("-")[0]; // Use only the first part (e.g., "en-US" → "en")

        // Default to "en" if the detected language is not supported
        return supportedLanguages.includes(lang) ? lang : "en";
    }

    // Function to apply language settings
    function setLanguage(lang) {
        document.documentElement.lang = lang;
        document.body.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

        // Save preference
        localStorage.setItem("preferredLanguage", lang);
    }

    // Initialize language settings
    const userLang = getPreferredLanguage();
    setLanguage(userLang);

    // Event Listener for language switch (Example: Button click)
    document.querySelectorAll(".lang-switch").forEach(button => {
        button.addEventListener("click", function () {
            const newLang = this.dataset.lang;
            setLanguage(newLang);
            location.reload(); // Reload to apply changes
        });
    });
});

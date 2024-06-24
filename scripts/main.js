document.addEventListener("DOMContentLoaded", function () {
  const switchLanguage = (lang) => {
    document.querySelectorAll("[data-language]").forEach((el) => {
      if (el.getAttribute("data-language") === lang) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    });
  };

  // Example of how to switch language based on a button click
  document.getElementById("switch-to-en").addEventListener("click", () => {
    switchLanguage("en");
  });

  document.getElementById("switch-to-nl").addEventListener("click", () => {
    switchLanguage("nl");
  });

  // Initialize with default language (Dutch in this case)
  switchLanguage("nl");
});

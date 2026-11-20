
/* =========================================
   GCS — GRAND CITY STORIES
   STUDIO: PK GAMES
   MAIN CONTROLLER
   Version 1.0.0
========================================= */

"use strict";

/* GAME CONFIGURATION */

const GCS = {
  name: "GRAND CITY STORIES",
  studio: "PK GAMES",
  city: "ANGEL VALLEY",
  creator: "PINTU KUMAR",
  version: "1.0.0",
  currentScreen: "loading",
  isReady: false
};

/* HTML ELEMENTS */

const elements = {
  intro: document.getElementById("studio-intro"),
  loading: document.getElementById("loading-screen"),
  mainMenu: document.getElementById("main-menu"),
  modeSelect: document.getElementById("mode-select"),
  message: document.getElementById("game-message"),
  errorScreen: document.getElementById("error-screen"),
  errorMessage: document.getElementById("error-message"),
  progress: document.querySelector(".loading-progress"),
  loadingText: document.querySelector("#loading-screen p")
};

/* MESSAGE SYSTEM */

let messageTimeout = null;

function showMessage(message) {
  if (!elements.message) {
    console.warn("GCS: Message element not found.");
    return;
  }

  elements.message.textContent = message;
  elements.message.hidden = false;

  if (messageTimeout) {
    clearTimeout(messageTimeout);
  }

  messageTimeout = setTimeout(() => {
    elements.message.hidden = true;
  }, 3000);
}

/* SCREEN MANAGEMENT */

function showScreen(screenName) {
  const screens = {
    main: elements.mainMenu,
    modes: elements.modeSelect
  };

  const selectedScreen = screens[screenName];

  if (!selectedScreen) {
    console.error("GCS: Screen not found:", screenName);
    return;
  }

  Object.values(screens).forEach(screen => {
    if (screen) screen.hidden = true;
  });

  selectedScreen.hidden = false;
  GCS.currentScreen = screenName;

  if (elements.message) {
    elements.message.hidden = true;
  }
}

/* MAIN MENU */

function startMenu() {
  if (elements.intro) {
    elements.intro.hidden = true;
  }

  if (elements.loading) {
    elements.loading.hidden = true;
  }

  showScreen("main");

  GCS.isReady = true;

  console.log("GCS Main Menu Ready.");
}

/* LOADING SYSTEM */

function runLoadingSequence() {
  if (!elements.progress) {
    console.warn("GCS: Loading progress element not found.");
    startMenu();
    return;
  }

  let progress = 0;

  elements.progress.style.width = "0%";

  const loadingInterval = setInterval(() => {
    progress = Math.min(progress + 10, 100);

    elements.progress.style.width = progress + "%";

    if (elements.loadingText) {
      elements.loadingText.textContent =
        progress < 100
          ? "LOADING " + progress + "%"
          : "WELCOME TO ANGEL VALLEY";
    }

    if (progress >= 100) {
      clearInterval(loadingInterval);
      setTimeout(startMenu, 600);
    }
  }, 180);
}

/* MAIN MENU BUTTONS */

function setupMainMenu() {

  document
    .getElementById("continue-button")
    ?.addEventListener("click", () => {
      showMessage("No saved game found. Start a New Game!");
    });

  document
    .getElementById("new-game-button")
    ?.addEventListener("click", () => {
      showMessage("NEW GAME: City world is being prepared...");
    });

  document
    .getElementById("game-modes-button")
    ?.addEventListener("click", () => {
      showScreen("modes");
    });

  document
    .getElementById("settings-button")
    ?.addEventListener("click", () => {
      showMessage("Settings system is coming soon!");
    });

  document
    .getElementById("social-button")
    ?.addEventListener("click", () => {
      showMessage("PK GAMES Social Club is coming soon!");
    });

  document
    .getElementById("quit-button")
    ?.addEventListener("click", () => {
      showMessage("Thanks for visiting GCS!");
    });

}

/* GAME MODES */

function setupGameModes() {

  const modes = {
    "free-world": "FREE WORLD",
    "chor-police": "CHOR POLICE",
    "adventure": "ADVENTURE",
    "multiplayer": "MULTIPLAYER"
  };

  Object.entries(modes).forEach(([buttonId, modeName]) => {

    const button = document.getElementById(buttonId);

    button?.addEventListener("click", () => {
      showMessage(
        modeName + " mode is planned for a future development stage."
      );
    });

  });

  document
    .getElementById("back-to-menu")
    ?.addEventListener("click", () => {
      showScreen("main");
    });

}

/* ERROR SYSTEM */

function showError(message) {

  if (!elements.errorScreen) {
    console.error("GCS ERROR:", message);
    return;
  }

  if (elements.errorMessage) {
    elements.errorMessage.textContent = message;
  }

  elements.errorScreen.hidden = false;

  GCS.currentScreen = "error";
}

/* INITIALIZE GAME */

function initializeGCS() {

  console.log("--------------------------------");
  console.log("GCS — GRAND CITY STORIES");
  console.log("STUDIO:", GCS.studio);
  console.log("CITY:", GCS.city);
  console.log("CREATOR:", GCS.creator);
  console.log("VERSION:", GCS.version);
  console.log("--------------------------------");

  if (!elements.mainMenu || !elements.modeSelect) {
    showError("Required game menu elements are missing.");
    return;
  }

  elements.mainMenu.hidden = true;
  elements.modeSelect.hidden = true;

  if (elements.errorScreen) {
    elements.errorScreen.hidden = true;
  }

  if (elements.message) {
    elements.message.hidden = true;
  }

  setupMainMenu();
  setupGameModes();

  if (elements.loading) {
    elements.loading.hidden = false;
  }

  if (elements.intro) {
    elements.intro.hidden = false;
  }

  // Let the studio intro finish before loading.
  setTimeout(() => {
    if (elements.intro) {
      elements.intro.hidden = true;
    }

    runLoadingSequence();
  }, 3900);

}

/* ERROR SCREEN BACK BUTTON */

document
  .getElementById("error-back-button")
  ?.addEventListener("click", () => {

    if (elements.errorScreen) {
      elements.errorScreen.hidden = true;
    }

    showScreen("main");

  });

/* START GCS */

if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    initializeGCS,
    { once: true }
  );

} else {

  initializeGCS();

}

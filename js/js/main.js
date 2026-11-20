
"use strict";

import {
  startGameWorld,
  stopGameWorld
} from "./game.js";

const GCS = {
  name: "GRAND CITY STORIES",
  studio: "PK GAMES",
  city: "ANGEL VALLEY",
  creator: "PINTU KUMAR",
  version: "1.2.0",
  currentScreen: "loading",
  isReady: false
};

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

let messageTimeout = null;
let exitButton = null;

function showMessage(message) {
  if (!elements.message) return;

  elements.message.textContent = message;
  elements.message.hidden = false;

  if (messageTimeout) clearTimeout(messageTimeout);

  messageTimeout = setTimeout(() => {
    elements.message.hidden = true;
  }, 3000);
}

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

  if (elements.message) elements.message.hidden = true;
}

function createExitButton() {
  if (exitButton) return;

  exitButton = document.createElement("button");
  exitButton.textContent = "EXIT WORLD";

  Object.assign(exitButton.style, {
    position: "fixed",
    top: "18px",
    left: "18px",
    zIndex: "1100",
    padding: "12px 20px",
    background: "#171b25",
    color: "#ffffff",
    border: "1px solid #d8a45c",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "bold",
    letterSpacing: "1px",
    cursor: "pointer"
  });

  exitButton.addEventListener("click", exitGameWorld);
  document.body.appendChild(exitButton);
}

function removeExitButton() {
  if (exitButton) {
    exitButton.remove();
    exitButton = null;
  }
}

function launchGameWorld() {
  try {
    if (elements.mainMenu) elements.mainMenu.hidden = true;
    if (elements.modeSelect) elements.modeSelect.hidden = true;
    if (elements.message) elements.message.hidden = true;

    startGameWorld();
    createExitButton();

    GCS.currentScreen = "game";
    console.log("GCS WORLD STARTED");

  } catch (error) {
    console.error("GCS WORLD START ERROR:", error);
    removeExitButton();
    showError("The 3D world could not start. Please check browser support.");
  }
}

function exitGameWorld() {
  stopGameWorld();
  removeExitButton();
  showScreen("main");

  console.log("GCS WORLD CLOSED");
}

function runLoadingSequence() {
  if (!elements.progress) {
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

function startMenu() {
  if (elements.intro) elements.intro.hidden = true;
  if (elements.loading) elements.loading.hidden = true;

  showScreen("main");
  GCS.isReady = true;

  console.log("GCS MAIN MENU READY");
}

function setupMainMenu() {
  document.getElementById("continue-button")
    ?.addEventListener("click", () => {
      showMessage("No saved game found. Start a New Game!");
    });

  document.getElementById("new-game-button")
    ?.addEventListener("click", launchGameWorld);

  document.getElementById("game-modes-button")
    ?.addEventListener("click", () => {
      showScreen("modes");
    });

  document.getElementById("settings-button")
    ?.addEventListener("click", () => {
      showMessage("Settings system is coming soon!");
    });

  document.getElementById("social-button")
    ?.addEventListener("click", () => {
      showMessage("PK GAMES Social Club is coming soon!");
    });

  document.getElementById("quit-button")
    ?.addEventListener("click", () => {
      showMessage("Thanks for visiting GCS!");
    });
}

function setupGameModes() {
  const modes = {
    "free-world": "FREE WORLD",
    "chor-police": "CHOR POLICE",
    "adventure": "ADVENTURE",
    "multiplayer": "MULTIPLAYER"
  };

  Object.entries(modes).forEach(([buttonId, modeName]) => {
    document.getElementById(buttonId)
      ?.addEventListener("click", () => {
        if (modeName === "FREE WORLD") {
          launchGameWorld();
          return;
        }

        showMessage(
          modeName + " mode is planned for a future development stage."
        );
      });
  });

  document.getElementById("back-to-menu")
    ?.addEventListener("click", () => {
      showScreen("main");
    });
}

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

function initializeGCS() {
  console.log("--------------------------------");
  console.log(GCS.name);
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

  if (elements.errorScreen) elements.errorScreen.hidden = true;
  if (elements.message) elements.message.hidden = true;

  setupMainMenu();
  setupGameModes();

  if (elements.loading) elements.loading.hidden = false;
  if (elements.intro) elements.intro.hidden = false;

  setTimeout(() => {
    if (elements.intro) elements.intro.hidden = true;
    runLoadingSequence();
  }, 3900);
}

document.getElementById("error-back-button")
  ?.addEventListener("click", () => {
    if (elements.errorScreen) elements.errorScreen.hidden = true;
    showScreen("main");
  });

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeGCS, {
    once: true
  });
} else {
  initializeGCS();
      }

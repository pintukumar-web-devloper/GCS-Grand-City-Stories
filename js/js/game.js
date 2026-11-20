
/* =========================================
   GCS — GRAND CITY STORIES
   STUDIO: PK GAMES
   3D CITY + AUTOMATIC DAY NIGHT SYSTEM
   Version 1.2.0
========================================= */

"use strict";

import * as THREE from "three";

const CONFIG = {
  dayDuration: 240, // 4 minutes for one full game day
  citySize: 500
};

let scene;
let camera;
let renderer;
let gameContainer;
let animationId;
let resizeHandler;
let previousTime = 0;

let sun;
let moon;
let sunLight;
let ambientLight;
let stars;
let clouds = [];
let buildingLights = [];

let gameTime = 8 / 24; // Start at 8 AM

const sky = {
  night: new THREE.Color(0x071020),
  dawn: new THREE.Color(0xe89a82),
  day: new THREE.Color(0x83b8e8),
  sunset: new THREE.Color(0xe58b55)
};

function createMaterial(color, roughness = 0.8) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.1
  });
}

/* BUILDINGS */

function createBuilding(x, z, width, height, depth, color) {
  const building = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    createMaterial(color)
  );

  building.position.set(x, height / 2, z);
  scene.add(building);

  // Simple glowing windows
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd58a,
    emissive: 0xffa52b,
    emissiveIntensity: 0
  });

  for (let y = 3; y < height - 2; y += 5) {
    for (let wx = -width / 2 + 3; wx < width / 2 - 1; wx += 5) {
      const windowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 2),
        windowMaterial
      );

      windowMesh.position.set(
        x + wx,
        y,
        z + depth / 2 + 0.02
      );

      scene.add(windowMesh);
      buildingLights.push(windowMesh);
    }
  }

  return building;
}

/* ROADS */

function createRoad(width, depth, x, z) {
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    createMaterial(0x252832, 0.95)
  );

  road.rotation.x = -Math.PI / 2;
  road.position.set(x, 0.025, z);
  scene.add(road);
}

function createCity() {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(
      CONFIG.citySize,
      CONFIG.citySize
    ),
    createMaterial(0x354239, 1)
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  scene.add(ground);

  createRoad(18, 400, 0, 0);
  createRoad(400, 18, 0, 0);

  const lineMaterial = new THREE.MeshBasicMaterial({
    color: 0xe6d8a2
  });

  for (let i = -180; i <= 180; i += 20) {
    const line = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 0.35),
      lineMaterial
    );

    line.rotation.x = -Math.PI / 2;
    line.position.set(i, 0.06, 0);
    scene.add(line);
  }

  const colors = [
    0x59616c,
    0x777b82,
    0x444d5c,
    0x8a8175,
    0x38495b,
    0x6b6a70
  ];

  for (let x = -140; x <= 140; x += 35) {
    for (let z = -140; z <= 140; z += 35) {
      if (Math.abs(x) < 22 || Math.abs(z) < 22) {
        continue;
      }

      const height = 12 + Math.random() * 45;
      const width = 14 + Math.random() * 7;
      const depth = 14 + Math.random() * 7;

      const color =
        colors[Math.floor(Math.random() * colors.length)];

      createBuilding(
        x,
        z,
        width,
        height,
        depth,
        color
      );
    }
  }
}

/* SKY OBJECTS */

function createSkyObjects() {
  sun = new THREE.Mesh(
    new THREE.SphereGeometry(7, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xffd28a
    })
  );

  scene.add(sun);

  moon = new THREE.Mesh(
    new THREE.SphereGeometry(5, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xdce5ff
    })
  );

  scene.add(moon);

  const positions = [];

  for (let i = 0; i < 700; i++) {
    const angle = Math.random() * Math.PI * 2;
    const height = 40 + Math.random() * 180;
    const radius = 230;

    positions.push(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    );
  }

  const starGeometry = new THREE.BufferGeometry();

  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      transparent: true,
      opacity: 0
    })
  );

  scene.add(stars);
}

/* SIMPLE CLOUDS */

function createCloud(x, y, z, scale) {
  const cloud = new THREE.Group();

  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1
  });

  const parts = [
    [0, 0, 0, 5],
    [5, 1, 0, 4],
    [-5, 1, 0, 4],
    [2, 3, 0, 3]
  ];

  parts.forEach(([px, py, pz, radius]) => {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 12, 10),
      cloudMaterial
    );

    puff.position.set(px, py, pz);
    cloud.add(puff);
  });

  cloud.position.set(x, y, z);
  cloud.scale.setScalar(scale);

  scene.add(cloud);
  clouds.push(cloud);
}

function createClouds() {
  createCloud(-100, 100, -120, 2);
  createCloud(80, 120, -150, 1.7);
  createCloud(150, 90, 80, 1.5);
  createCloud(-180, 130, 100, 1.8);
}

/* LIGHTING */

function createLighting() {
  ambientLight = new THREE.HemisphereLight(
    0xc4d8ff,
    0x40352b,
    1
  );

  scene.add(ambientLight);

  sunLight = new THREE.DirectionalLight(
    0xffc58a,
    2
  );

  sunLight.position.set(-80, 120, 60);
  sunLight.target.position.set(0, 0, 0);

  scene.add(sunLight);
  scene.add(sunLight.target);
}

/* AUTOMATIC DAY AND NIGHT */

function updateDayNight(deltaTime) {
  // Time runs automatically. No cheat code controls it.
  gameTime = (gameTime + deltaTime / CONFIG.dayDuration) % 1;

  const hour = gameTime * 24;
  const angle = gameTime * Math.PI * 2 - Math.PI / 2;

  const sunHeight = Math.sin(angle);
  const sunX = Math.cos(angle);

  sun.position.set(
    sunX * 180,
    sunHeight * 150,
    -60
  );

  moon.position.set(
    -sunX * 180,
    -sunHeight * 150,
    60
  );

  sun.visible = sunHeight > -0.05;
  moon.visible = sunHeight < 0.1;

  const daylight = THREE.MathUtils.clamp(
    (sunHeight + 0.12) / 0.65,
    0,
    1
  );

  const sunrise = Math.max(
    0,
    1 - Math.abs(hour - 6) / 2
  );

  const sunset = Math.max(
    0,
    1 - Math.abs(hour - 18) / 2
  );

  const twilight = Math.max(sunrise, sunset);

  const skyColor = new THREE.Color();

  skyColor.copy(sky.night).lerp(sky.day, daylight);
  skyColor.lerp(sky.dawn, twilight * 0.65);
  skyColor.lerp(sky.sunset, sunset * 0.45);

  scene.background.copy(skyColor);
  scene.fog.color.copy(skyColor);

  sunLight.position.copy(sun.position);

  sunLight.intensity = 0.15 + daylight * 2.4;
  ambientLight.intensity = 0.25 + daylight * 1.1;

  stars.material.opacity = 1 - daylight;

  buildingLights.forEach(windowMesh => {
    windowMesh.material.emissiveIntensity =
      (1 - daylight) * 1.8;
  });

  clouds.forEach((cloud, index) => {
    cloud.position.x += deltaTime * (1 + index * 0.15);

    if (cloud.position.x > 250) {
      cloud.position.x = -250;
    }
  });
}

/* GAME SCREEN */

function createGameContainer() {
  gameContainer = document.createElement("div");

  gameContainer.id = "gcs-game-container";

  Object.assign(gameContainer.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    background: "#101722",
    zIndex: "1000",
    display: "none"
  });

  document.body.appendChild(gameContainer);
}

/* START WORLD */

export function startGameWorld() {
  if (renderer) {
    gameContainer.style.display = "block";
    return;
  }

  createGameContainer();

  try {
    scene = new THREE.Scene();

    scene.background = sky.night.clone();

    fog = new THREE.Fog(
      0x071020,
      100,
      380
    );

    scene.fog = fog;

    camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      600
    );

    camera.position.set(0, 35, 85);
    camera.lookAt(0, 10, 0);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.5)
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    gameContainer.appendChild(renderer.domElement);

    createLighting();
    createSkyObjects();
    createClouds();
    createCity();

    resizeHandler = () => {
      if (!camera || !renderer) return;

      camera.aspect =
        window.innerWidth / window.innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        window.innerWidth,
        window.innerHeight
      );
    };

    window.addEventListener("resize", resizeHandler);

    gameContainer.style.display = "block";

    previousTime = 0;
    animate();

    console.log("GCS 3D CITY ENGINE STARTED");

  } catch (error) {
    console.error("GCS 3D ENGINE ERROR:", error);
    stopGameWorld();
    throw error;
  }
}

/* GAME LOOP */

function animate(timestamp = 0) {
  animationId = requestAnimationFrame(animate);

  const deltaTime = previousTime
    ? Math.min((timestamp - previousTime) / 1000, 0.05)
    : 0;

  previousTime = timestamp;

  if (renderer && scene && camera) {
    updateDayNight(deltaTime);
    renderer.render(scene, camera);
  }
}

/* STOP WORLD */

export function stopGameWorld() {
  if (animationId !== undefined) {
    cancelAnimationFrame(animationId);
    animationId = undefined;
  }

  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
    resizeHandler = null;
  }

  if (scene) {
    scene.traverse(object => {
      if (object.geometry) {
        object.geometry.dispose();
      }

      if (object.material) {
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        materials.forEach(material => material.dispose());
      }
    });
  }

  if (renderer) {
    renderer.dispose();
    renderer = null;
  }

  if (gameContainer) {
    gameContainer.remove();
    gameContainer = null;
  }

  scene = null;
  camera = null;
  sun = null;
  moon = null;
  stars = null;
  sunLight = null;
  ambientLight = null;
  clouds = [];
  buildingLights = [];
}

// UI interactions
let userSelect = document.getElementById('user-selection');
let machineSelect = document.getElementById('machine-selection');
let generateBtn = document.getElementById('generate-btn');
let prompt = document.getElementById('prompt-content');
let inputGet = false;

// Three.js setup
let params = { color: "#FFF" };
let spheres = [];
let dataLabel = [];

// Umap-js setup
let rawEmbeddings = [];
let umap, umapResults;
let iterations = 0;
let nEpochs = 100;
let jsonData;
let sphereData = [];
let minX, maxX, minY, maxY, minZ, maxZ;

// CLICK SELECT SPHERE
let currentlySelectedSphere = null;
let distantData, furthestData;
let isHovered = false;
let curSelectData, prevSelectData;

function preload() {
  // Load JSON data from a URL
  jsonData = loadJSON(
    'home-page/assets/default-data-embeddings.json'
  );
  // dataTest = loadJSON("https://gist.githubusercontent.com/clarayao/ee9231e8aeb52603acd0b9e57ac2cb2c/raw/2a19dcde57a46b443e5519ac7e275db09be3ae0c/artCap-embeddings-500.json")
}

function setupThree() {
  umapSetup();
  umapResults = umap.getEmbedding();

  for (let i = 0; i < umapResults.length; i++) {
    //setup shperes
    let dataBall = new Sphere(i);
    spheres.push(dataBall);

    //mangae data for each sphere
    if (i < jsonData.concepts.length) {
      sphereData.push({
        summary: jsonData.concepts[i].summary,
        description: jsonData.concepts[i].description,
        embedding: umapResults[i],
      });
    } else {
      sphereData.push({
        summary: jsonData.visuals[i - jsonData.concepts.length].summary,
        description: jsonData.visuals[i - jsonData.concepts.length].description,
        embedding: umapResults[i],
      });
    }
    

    //setup text label for each sphere
    let dataDiv = document.createElement("div");
    dataDiv.className = "dataLabel";
    dataDiv.textContent = sphereData[i].summary;
    dataDiv.style.backgroundColor = "#0C021995";
    dataDiv.style.visibility = "hidden";
    dataDiv.style.color = "#be889f";
    dataDiv.style.width = "30vw";
    dataDiv.style.wordWrap = 'break-word';
    dataDiv.style.padding = "1vh 0.5vw"
    dataDiv.style.borderRadius = "0.5em";
    dataLabel.push(new CSS2DObject(dataDiv));
  }
}

function updateThree() {
  // ================== UMAP UPDATE ==================
  umapUpdate();

  // ================== INTERACTION SETUP ==================
  raycaster.setFromCamera(mouse, camera);
  const intersections = raycaster.intersectObjects(scene.children);

  // ================== SPHERES ATTRIBUTE UPDATE ==================
  // isHovered = false;
  for (let i = 0; i < sphereData.length; i++) {
    let dataPoint = sphereData[i].embedding;
    // ----------------- SPHERES POSITION UPDATE -----------------
    let x = map(dataPoint[0], minX, maxX, -WORLD_SIZE / 2, WORLD_SIZE / 2);
    let y = map(dataPoint[1], minY, maxY, -WORLD_SIZE / 2, WORLD_SIZE / 2);
    let z = map(dataPoint[2], minZ, maxZ, -WORLD_SIZE / 2, WORLD_SIZE / 2);
    spheres[i].setPosition(x, y, z).setScale(5, 5, 5).update();

    // ----------------- SPHERES HOVERING UPDATE -----------------
    let intersectionInfo = spheres[i].intersect(intersections);
    // text label position update
    dataLabel[i].position.set(0, 1, 0);
    dataLabel[i].center.set(0, 1);
    spheres[i].mesh.add(dataLabel[i]);

    // get the hovered sphereData & update label visibility
    if (intersectionInfo.intersection == true && !popWindowOn) {
      isHovered = true;
      dataLabel[i].element.style.visibility = "visible";
    } else {
      dataLabel[i].element.style.visibility = "hidden";
    }
  }

  // ----------------- ACTIONS WHEN SELECT SPHERE -----------------
  if (currentlySelectedSphere) {
    //update color & transparency & scale
    currentlySelectedSphere.mesh.material.color.set(0xb77eff);
    currentlySelectedSphere.mesh.material.transparent = false;
    currentlySelectedSphere.mesh.scale.set(10, 10, 10);
    spheres[furthestData.index].mesh.material.color.set(0xb77eff);
    spheres[furthestData.index].mesh.material.transparent = false;
    spheres[furthestData.index].mesh.scale.set(10, 10, 10);

    //update text label color & visibility
    if (popWindowOn) {
      dataLabel[furthestData.index].element.style.visibility = "hidden";
      dataLabel[currentlySelectedSphere.index].element.style.visibility =
      "hidden";
    } else {
      dataLabel[furthestData.index].element.style.visibility = "visible";
      dataLabel[furthestData.index].element.style.color = "#b77eff";
      dataLabel[currentlySelectedSphere.index].element.style.visibility = "visible";
      dataLabel[currentlySelectedSphere.index].element.style.color = "#b77eff";
    }
    // console.log(sphereData[currentlySelectedSphere.index].summary);
    userSelect.innerHTML = sphereData[currentlySelectedSphere.index].summary;
    machineSelect.innerHTML = sphereData[furthestData.index].summary;
    inputGet = true;
  }
}

function umapSetup() {
  // Extract embeddings from JSON data and add to the rawEmbeddings array
  for (let i = 0; i < jsonData.concepts.length; i++) {
    rawEmbeddings.push(jsonData.concepts[i].embedding);
  }
  for (let i = 0; i < jsonData.visuals.length; i++) {
    rawEmbeddings.push(jsonData.visuals[i].embedding);
  }

  // UMAP configuration options
  const options = {
    nNeighbors: 15,
    minDist: 0.1,
    nComponents: 3,
    nEpochs,
  };
  // Initialize UMAP with options and data
  umap = new UMAP(options);
  umap.initializeFit(rawEmbeddings);
}

function umapUpdate() {
  // Run UMAP iterations
  if (iterations < nEpochs) {
    iterations = umap.step();
  }
  // Variables to store the min and max values for mapping
  minX = Infinity;
  maxX = -Infinity;
  minY = Infinity;
  maxY = -Infinity;
  minZ = Infinity;
  maxZ = -Infinity;
  // Calculate the min and max values for x and y
  for (let i = 0; i < sphereData.length; i++) {
    let dataPoint = sphereData[i].embedding;
    minX = min(dataPoint[0], minX);
    minY = min(dataPoint[1], minY);
    minZ = min(dataPoint[2], minZ);
    maxX = max(dataPoint[0], maxX);
    maxY = max(dataPoint[1], maxY);
    maxZ = max(dataPoint[2], maxZ);
  }
}

function getSphere() {
  let geometry = new THREE.SphereGeometry(1, 16, 16);
  let material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.5,
    color: 0xffffff,
  });
  let mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return mesh;
}

// setup browser window for interaction
window.addEventListener("mousemove", onMouseMove, false);
window.addEventListener("click", onClick);

function onMouseMove(event) {
  // calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onClick(event) {
  if (!popWindowOn) {
    // set up raycaster
    raycaster.setFromCamera(mouse, camera);
    // calculate objects intersecting the picking ray
    const intersections = raycaster.intersectObjects(scene.children);
    if (intersections.length > 0) {

    }
  
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // get the selected sphere (after click)
    if (intersections.length > 0) {
      let curSelectData = intersections[0].object.uuid;
      if (curSelectData !== prevSelectData) {
        let distantDataViz = document.getElementById("data-distance-container");
        distantDataViz.innerHTML = "";
      }
      for (let i = 0; i < spheres.length; i++) {
        if (spheres[i].mesh.uuid === intersections[0].object.uuid) {
          currentlySelectedSphere = spheres[i];
          distantData = selectDistantPoints(i, 5);
          furthestData = distantData[0];
          
          //add distant data to data panel
          for (let i = 0; i < distantData.length; i++) {
            let distantDataViz = document.getElementById("data-distance-container");
            let addItem = document.createElement("div");
            addItem.className = "distant-data-item";
            const mappedPercentage = mapRange(distantData[i].distance, distantData[4].distance, distantData[0].distance, 50, 100);
            const mappedColorPercentage = mapRange(distantData[i].distance, distantData[4].distance, distantData[0].distance, 0.4, 1);
            const html = `
                <p class="distant-data" style="
                  color: rgba(183, 126, 255, ${mappedColorPercentage});
                  overflow-y: auto;
                  max-height: 5vh;
                ">
                  ${sphereData[distantData[i].index].summary}
                </p>
                <div class="distant-data-bar-wrapper">
                  <p style="color: rgba(183, 126, 255, ${mappedColorPercentage});">${distantData[i].distance.toFixed(2)}</p>
                  <div class="distant-data-bar" style="
                    background-color: rgba(183, 126, 255, ${mappedColorPercentage});
                    border-radius: 0.2rem;
                    width: ${mappedPercentage}%;
                    height: 2px;
                  "></div>
                </div>
            `;
            addItem.innerHTML = html;
            distantDataViz.appendChild(addItem);
          }
          
          break;
        }
      }
      prevSelectData = intersections[0].object.uuid;
    }
  }
}

function calculateWidth(distance) {
  // If your distances are between 0.94 and 1.00
  return mapRange(distance, 0.9, 1.00, 50, 100);
}
function mapRange(value, oldMin, oldMax, newMin, newMax) {
  return ((value - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
}

// select the distant point
function selectDistantPoint(index) {
  let dataDistArr = [];
  for (let i = 0; i < sphereData.length; i++) {
    dataDistArr.push(
      euclideanDist(
        sphereData[i].embedding[0],
        sphereData[i].embedding[1],
        sphereData[i].embedding[2],
        sphereData[index].embedding[0],
        sphereData[index].embedding[1],
        sphereData[index].embedding[2]
      )
    );
  }
  return dataDistArr.indexOf(Math.max(...dataDistArr));
}

function selectDistantPoints(index, numPoints = 5) {
  let dataDistArr = sphereData.map((point, i) => ({
    distance: euclideanDist(
      point.embedding[0],
      point.embedding[1],
      point.embedding[2],
      sphereData[index].embedding[0],
      sphereData[index].embedding[1],
      sphereData[index].embedding[2]
    ),
    index: i
  }));
  
  // Sort by distance in descending order and take top numPoints
  return dataDistArr
    .sort((a, b) => b.distance - a.distance)
    .slice(0, numPoints);
}

// calculate euclidean distance
function euclideanDist(x0, y0, z0, x1, y1, z1) {
  const calDist = ([x0, y0, z0], [x1, y1, z1]) =>
    Math.hypot(x1 - x0, y1 - y0, z1 - z0);
  let distance = calDist([x0, y0, z0], [x1, y1, z1]);
  return distance;
}

class Sphere {
  constructor(index) {
    this.pos = createVector();
    this.vel = createVector();
    this.acc = createVector();
    this.scl = createVector(1, 1, 1);
    this.mass = this.scl.x * this.scl.y * this.scl.z;
    this.rot = createVector();
    this.rotVel = createVector();
    this.rotAcc = createVector();
    this.mesh = getSphere();
    this.index = index;
  }
  setPosition(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }
  setScale(w, h = w, d = w) {
    const minScale = 0.01;
    if (w < minScale) w = minScale;
    if (h < minScale) h = minScale;
    if (d < minScale) d = minScale;
    this.scl = createVector(w, h, d);
    this.mass = this.scl.x * this.scl.y * this.scl.z;
    return this;
  }
  update() {
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.mesh.rotation.set(this.rot.x, this.rot.y, this.rot.z);
    this.mesh.scale.set(this.scl.x, this.scl.y, this.scl.z);
  }
  intersect(intersections) {
    let isIntersected = false;
    if (intersections.length > 0) {
      if (this.mesh.uuid === intersections[0].object.uuid) {
        isIntersected = true;
      }
    }
    if (isIntersected) {
      this.mesh.material.transparent = false;
      this.mesh.material.color.set(0xbe889f);
    } else {
      this.mesh.material.transparent = true;
      this.mesh.material.color.set(0xffffff);
      this.mesh.material.opacity = 0.5;
    }
    return { sphere: this, index: this.index, intersection: isIntersected };
  }
}
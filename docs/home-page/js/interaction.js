let leftPanelContainer = document.getElementById('left-panel-container');
let navBar = document.getElementById('nav-bar');
let fullscreenBtn = document.getElementById('fullscreen-btn');
let exitFullscreenBtn = document.getElementById('exit-fullscreen');
let aboutWindow = document.getElementById('about-container');
let historyWindow = document.getElementById('history-container');
let manualWindow = document.getElementById('manual-container');
let closeWindow = document.getElementsByClassName('bx-x');
let loadingWindow = document.getElementById('loading-container');

// ============= HISTORY WINDOW =============
// expand generate details
function toggleGeneration(button) {
    const fullItem = button.closest('.full-item');
    const fullGeneration = fullItem.querySelector('.full-generation');
    const icon = button.querySelector('i');
    
    if (fullGeneration.style.display === 'none' || fullGeneration.style.display === '') {
        fullGeneration.style.display = 'block';
        icon.classList.replace('bx-chevron-down', 'bx-chevron-up');
    } else {
        fullGeneration.style.display = 'none';
        icon.classList.replace('bx-chevron-up', 'bx-chevron-down');
    }
}
// bookmark entries
function bookmarkEntry(button) {
    const parentDiv = button.parentElement;
    
    if (button.classList.contains('bx-bookmark')) {
        button.classList.replace('bx-bookmark', 'bxs-bookmark');
        parentDiv.style.color = '#B77EFF';
    } else {
        button.classList.replace('bxs-bookmark', 'bx-bookmark');
        parentDiv.style.color = '#EAE7EF';
    }
}
function toggleBookmark(dataId, button) {
    const sessionId = generateSessionId();
    const dataRef = dbRef.child(sessionId).child(dataId);
    const parentDiv = button.parentElement;
    
    // First get the current bookmark status
    dataRef.child('bookmarkStatus').once('value')
        .then((snapshot) => {
            const currentStatus = snapshot.val();
            if (!currentStatus) { // if it's going to be bookmarked

                button.classList.replace('bx-bookmark', 'bxs-bookmark');
                parentDiv.style.color = '#B77EFF';
            } else { // if it's going to be unbookmarked
                button.classList.replace('bxs-bookmark', 'bx-bookmark');
                parentDiv.style.color = '#EAE7EF';
            }
            // Toggle the status
            return dataRef.update({
                bookmarkStatus: !currentStatus
            });
        })
        .then(() => {
            console.log("Bookmark status updated successfully");
        })
        .catch((error) => {
            console.error("Error updating bookmark status:", error);
        });
    // console.log(historyData);
}
// ------------- DISPLAY DATA FROM FIREBASE -------------
async function displayHistoryData() {
    if (historyData) {
        // toggleBookmark(dataId);
        let curDate;
        let prevDate = 'N/A';
        for (let i = historyData.length - 1; i >= 0; i--) {
            const dataId = historyData[i].id; 
            const userData = historyData[i].userSelection.summary;
            const machineData = historyData[i].machineSelection.summary;
            const generateData = historyData[i].generateOutcome;
            const timestamp = new Date(historyData[i].timestamp);
            curDate = timestamp.toLocaleString('en-US', { month: 'short' }) + '.' + timestamp.getDate();
            const time = timestamp.getHours() + ':' + timestamp.getMinutes();

            // toggleBookmark(dataId);
            // console.log(dataId);
            if (prevDate !== curDate) {
                let fullItem = document.createElement('div');
                fullItem.className = 'full-item';
                let dateHtml = `
                    <div class="history-item">
                        <p class="new-date-item">${curDate}</p>
                    </div>
                `;
                fullItem.innerHTML = dateHtml;
                document.getElementById('output-history').appendChild(fullItem);
            }

            // Create the main container
            let fullItem = document.createElement('div');
            fullItem.className = 'full-item';

            // Create the history item content
            const html = `
                <div class="history-item" style="color: ${historyData[i].bookmarkStatus ? '#B77EFF' : '#EAE7EF'}">
                    <p class="time-item">${time}</p>
                    <p class="user-selection-item">${userData}</p>
                    <p class="machine-selection-item">${machineData}</p>
                    <i class='bx ${historyData[i].bookmarkStatus ? 'bxs-bookmark' : 'bx-bookmark'} bookmark-item' 
                    onclick="toggleBookmark('${dataId}', this)"></i>
                    <div class="generation-wrapper">
                        <p class="generation-text clamped">${generateData}</p>
                        <button class="expand-button" onclick="toggleGeneration(this)">
                            <i class='bx bx-chevron-down'></i>
                        </button>
                    </div>
                </div>
                <div class="full-generation">
                    <p class="generation-text">${generateData}</p>
                </div>
            `;

            fullItem.innerHTML = html;

            // Add to container (assuming you have a container with id 'history-container')
            document.getElementById('output-history').appendChild(fullItem);
            prevDate = curDate;
        }
    }
}

// ============= FULLSCREEN BUTTON =============
fullscreenBtn.addEventListener('click', function(event) {
    leftPanelContainer.style.visibility = "hidden";
    navBar.style.visibility = "hidden";
    fullscreenBtn.style.display = "none";
    exitFullscreenBtn.style.display = "block";
});
exitFullscreenBtn.addEventListener('click', function(event) {
    leftPanelContainer.style.visibility = "visible";
    navBar.style.visibility = "visible";
    fullscreenBtn.style.display = "block";
    exitFullscreenBtn.style.display = "none";
});

// ============= NAVBAR BUTTONS =============
function zoomHome() {
    camera.position.z = 1500;
}
// ------------- ABOUT BUTTON -------------
function clickAbout() {
    aboutWindow.style.display = "flex";
    popWindowOn = true;
}
// ------------- HISTORY BUTTON -------------
function clickHistory() {
    historyWindow.style.display = "flex";
    popWindowOn = true;
    displayHistoryData();
}
// ------------- MANUAL BUTTON -------------
function clickManual() {
    manualWindow.style.display = "flex";
    popWindowOn = true;
    console.log('manual');
}
// ------------- CLOSE BUTTON -------------
function clickeClose() {
    console.log('close');
    aboutWindow.style.display = "none";
    historyWindow.style.display = "none";
    manualWindow.style.display = "none";
    loadingWindow.style.display = "none";
    popWindowOn = false;
}


// ============= GENERATE BUTTON =============
function setLoading(isLoading) {
    if (isLoading) {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        loader();
    } else {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate';
        clickeClose();
    }
}
// ------------- LOADING EFFECT -------------
function loader() {
    loadingWindow.style.display = "flex";
}

// Add this to your generate button click handler
generateBtn.addEventListener('click', async function(event) {
    setLoading(true);
    try {
        await generate();
        // console.log('generate!')
    } finally {
        setLoading(false);
    }
});

async function generate() {
    if (!inputGet) {
        alert("Please select a datapoint first!");
        return;
    }

    let userData = sphereData[currentlySelectedSphere.index];
    let machineData = sphereData[furthestData.index];

    let promptContent = prompt.value
        .replace("[my selection]", userData.summary)
        .replace("[machine's selection]", machineData.summary)
        + "Please also start with the description directly, don't add anything else in the response or use json format. And if possible, please use descriptive language, instead of instructive ones like talking to me. Thanks!";

    try {
        let results = await sendMessage(promptContent);
        if (results) {
            let newData = {
                userSelection:  {
                    summary: userData.summary,
                    description: userData.description,
                },
                machineSelection: {
                    summary: machineData.summary,
                    description: machineData.description,
                },
                generateOutcome: results.choices[0].message.content,
                timestamp: Date.now(),
                bookmarkStatus: false,
            }
            addDataToDatabase(newData);
            console.log("new data: ", newData);
            window.location.href = "output-page/output.html";
        }
    } catch(error) {
        console.error("Error generating response:", error);
        alert('There was an error generating your content. Please try again.');
    }
}



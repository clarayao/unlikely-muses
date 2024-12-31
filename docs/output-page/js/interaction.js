let navBar = document.getElementById('nav-bar');
let fullscreenBtn = document.getElementById('fullscreen-btn');
let exitFullscreenBtn = document.getElementById('exit-fullscreen');
let aboutWindow = document.getElementById('about-container');
let historyWindow = document.getElementById('history-container');
let closeWindow = document.getElementsByClassName('bx-x');
let backBtn = document.getElementById('back-btn');

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
    navBar.style.visibility = "hidden";
    backBtn.style.visibility = "hidden";
    fullscreenBtn.style.display = "none";
    exitFullscreenBtn.style.display = "block";
});
exitFullscreenBtn.addEventListener('click', function(event) {
    navBar.style.visibility = "visible";
    backBtn.style.visibility = "visible";
    fullscreenBtn.style.display = "block";
    exitFullscreenBtn.style.display = "none";
});

// ============= NAVBAR BUTTONS =============
// ------------- ABOUT BUTTON -------------
function clickAbout() {
    aboutWindow.style.display = "flex";
    popWindowOn = true;
    console.log("about")
}
// ------------- HISTORY BUTTON -------------
function clickHistory() {
    historyWindow.style.display = "flex";
    popWindowOn = true;
    displayHistoryData();
}
// ------------- CLOSE BUTTON -------------
function clickeClose() {
    console.log('close');
    aboutWindow.style.display = "none";
    historyWindow.style.display = "none";
    popWindowOn = false;
}

// ============= BACK BUTTON =============
backBtn.addEventListener('click', function(event) {
    window.location.href = "../index.html";
});
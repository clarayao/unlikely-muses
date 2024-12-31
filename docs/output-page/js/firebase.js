let database, dbRef, myId, historyData;
let userData = [{
    userSelection: {
        summary: "",
        description: "",
    },
    machineSelection: {
        summary: "",
        description: "",
    },
    generateOutcome: "",
    timestamp: Date.now(),
    sessionId: generateSessionId()
}];

// Generate a consistent session ID
function generateSessionId() {
    let sessionId = localStorage.getItem('userSessionId');
  
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('userSessionId', sessionId);
    }
    
    return sessionId;
}

// Setup Firebase Database
function setupDatabase() {
    const firebaseConfig = {
        apiKey: "AIzaSyDiNOdhWePax4aEWdU1421F6fnFlWuYP8w",
        authDomain: "unlikely-muses.firebaseapp.com",
        databaseURL: "https://unlikely-muses-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "unlikely-muses",
        storageBucket: "unlikely-muses.firebasestorage.app",
        messagingSenderId: "1069409530374",
        appId: "1:1069409530374:web:bcaa7478e4782f839b4987"
    };

    // Only initialize if not already initialized
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
  }
    // firebase.initializeApp(firebaseConfig);

    database = firebase.database();
    
    return database;
}

// Get Database Reference with more robust event listeners
function getDBReference(refName) {
    // Create a reference to a specific path in the database
    let ref = database.ref(refName);
    return ref;
}

function retrieveSessionData() {
  const sessionId = generateSessionId();
  
  // Reference to the specific session
  const sessionRef = dbRef.child(sessionId);
  
  // Retrieve the data
  sessionRef.once('value')
      .then((snapshot) => {
          // Get all data for this session
          const sessionData = snapshot.val();
          
          if (sessionData) {
              console.log("Retrieved Session Data:", sessionData);
              
              // If data was pushed, you might need to convert it
              if (sessionData) {
                  // Convert to array if needed
                  historyData = Object.entries(sessionData).map(([key, value]) => ({
                      id: key,
                      ...value
                  }));
                  getData = true;
                  console.log(historyData);
                  // Update UI or process data
                  // displayRetrievedData(dataArray);
              }
          }
      })
      .catch((error) => {
          console.error("Error retrieving session data:", error);
      });
}

// Real-time listener for updates
function listenToSessionUpdates() {
  const sessionId = generateSessionId();
  const sessionRef = dbRef.child(sessionId);
  
  // Listen for any changes to this session's data
  sessionRef.on('value', (snapshot) => {
      const latestData = snapshot.val();
      console.log("Real-time update:", latestData);
      
      // Optional: Update UI automatically when data changes
      if (latestData) {
          historyData = Object.entries(latestData).map(([key, value]) => ({
              id: key,
              ...value
          }));
          // displayRetrievedData(dataArray);
          console.log(historyData);
      }
  });
}

// Add data to the database
function addDataToDatabase(data) {
    // Use a consistent session ID as the key
    const sessionId = generateSessionId();
    
    // Push data to a specific path in the database
    dbRef.child(sessionId).push(data)
        .then(() => {
            console.log("! DB Added succeeded.");
            myId = sessionId;
            console.log("Added with ID:", myId);
        })
        .catch((error) => {
            console.error("! DB Added failed:", error.message);
        });
    
    listenToSessionUpdates()
    console.log(dbRef.child(sessionId))
}

// Initialize database
setupDatabase();

// Get reference to a specific path in the database
dbRef = getDBReference("realtimeData");
retrieveSessionData();


let flowfield;

let outWidth, outHeight, outXL, outYL, outXR, outYR;
let inWidth, inHeight, inX, inY;
let r = 20;
let cols, rows;

// PRINT TEXT ANIMATION
let genTxt = 'In the year 2150, Earth stood at the precipice of change...';
let words = [];
let paragraphs;
let paragraphIndex = 0;
let print = '';
let txtOnScreen = [];
let printWidth;
let rowCount = 1;
let wordCount = 0;
let wordCountMax;
let txtMaxWidth, txtMaxHeight;
let switchLine = false;
let textGraphics;

let InputtxtRow = 5;
let adjustAngle = 0.01 * InputtxtRow;

let flowPoints = [];
let pointNum = 100 + 5 * InputtxtRow;

// texts
let txtOutL = { txt: 'some texT', s: 20, lead: 35 };
let txtOutR = { txt: 'some texT', s: 20, lead: 35 };
let txtIn = {
  txt: [print],
  s: 15,
  lead: 23,
};
let font, getPointsL, getPointsR;
let pointsPos = [];
let particlePosL = [];
let particlePosR = [];
let particlePos = [];
let bbox;

let getData = false;
let runOnce = false;

function preload() {
  font = loadFont('assets/Exo2.otf');
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('p5-canvas');
  checkFirebaseAndStart();
}

function draw() {
  if (getData && historyData) {
    if (!runOnce) {
      manageData();
      setData();
      setTXTPrint();
      textSetup();
      flowfieldSetup();
      runOnce = true;
    }
    
    background(0, 50);
    
    applyFlowfield();
    manageParticles();
    printText();
    drawText();
  }
}

function manageData() {
  let displayData = historyData[historyData.length - 1];
  txtOutL.txt = displayData.userSelection.summary;
  txtOutR.txt = displayData.machineSelection.summary;
  genTxt = displayData.generateOutcome;
  console.log(historyData[historyData.length - 1]);
}

function setData() {
  cols = floor(width / r);
  rows = floor(height / r);

  // Add maximum width constraints
  const maxTextWidth = width / 6;

  // Wrap both texts
  txtOutL.txt = wrapText(txtOutL.txt, maxTextWidth, font, txtOutL.s);
  txtOutR.txt = wrapText(txtOutR.txt, maxTextWidth, font, txtOutR.s);

  // Calculate text points for wrapped text
  getPointsL = font.textToPoints(
    txtOutL.txt,
    (cols / 10) * r,
    height / 2,
    txtOutL.s,
    {
      sampleFactor: 0.1,
    }
  );

  // Calculate position for right text based on first line
  let firstLineR = txtOutR.txt.split('\n')[0];
  getPointsR = font.textToPoints(
    txtOutR.txt,
    ((cols * 9) / 10) * r - textWidth(firstLineR),
    height / 2,
    txtOutR.s,
    {
      sampleFactor: 0.1,
    }
  );

  getPoints = getPointsL.concat(getPointsR);

  // Calculate bounds for both texts
  bboxL = font.textBounds(txtOutL.txt, (cols / 10) * r, height / 2, txtOutL.s);
  txtOutL.x = bboxL.x;
  txtOutL.y = bboxL.y;
  txtOutL.w = bboxL.w;
  txtOutL.h = bboxL.h;

  bboxR = font.textBounds(
    txtOutR.txt,
    ((cols * 9) / 10) * r - textWidth(firstLineR),
    height / 2,
    txtOutR.s
  );
  txtOutR.x = bboxR.x;
  txtOutR.y = bboxR.y;
  txtOutR.w = bboxR.w;
  txtOutR.h = bboxR.h;

  txtIn.x = width / 2 - width / 6;
  txtIn.y = height / 2 - txtIn.lead;
  txtIn.w = width / 3 - 20;
  txtIn.h = txtIn.lead * InputtxtRow;

  // Create graphics buffer sized to the text area
  textGraphics = createGraphics(txtIn.w + 150, height);
  textGraphics.textFont(font);
  textGraphics.textAlign(LEFT, CENTER);
}

function setTXTPrint() {
  // Reset everything
  txtIn.txt = [''];
  words = [];
  rowCount = 1;
  wordCount = 0;
  paragraphIndex = 0;
  print = '';
  
  // Split text into paragraphs
  paragraphs = split(genTxt, '\n \n');
  
  // Process each paragraph
  for (let i = 0; i < paragraphs.length; i++) {
    words.push(split(paragraphs[i], ' '));
    if (i == 0) {
      words[i].push(true);
    } else {
      words[i].push(false);
    }
  }
  
  txtMaxWidth = txtIn.w;
  txtMaxHeight = txtIn.h;
}

function drawText() {
  textGraphics.background(0);
  
  if (rowCount > 5) {
    txtIn.h = txtIn.lead * rowCount;
  }

  // Set text properties on graphics buffer
  textGraphics.fill(255);
  textGraphics.stroke(255);

  // Calculate the center text position within the graphics buffer
  let centerY = textGraphics.height/2 - (txtIn.lead * rowCount)/2;

  // Draw input text on graphics buffer
  textGraphics.textSize(txtIn.s);
  textGraphics.textLeading(txtIn.lead);
  for (let i = 0; i < txtIn.txt.length; i++) {
    textGraphics.text(txtIn.txt[i], 0, centerY + txtIn.lead * i);
  }

  // Draw the graphics buffer at the correct position
  push();
  imageMode(CORNER);
  image(textGraphics, txtIn.x - 40, 0);
  pop();
  
  // Draw the outer texts directly on the canvas
  push();
  fill(255);
  stroke(255);
  
  // Draw left text
  textSize(txtOutL.s);
  textLeading(txtOutL.lead);
  let linesL = txtOutL.txt.split('\n');
  for (let i = 0; i < linesL.length; i++) {
    text(linesL[i], txtOutL.x, txtOutL.y + (i * txtOutL.lead));
  }

  // Draw right text
  textSize(txtOutR.s);
  textLeading(txtOutR.lead);
  let linesR = txtOutR.txt.split('\n');
  for (let i = 0; i < linesR.length; i++) {
    text(linesR[i], txtOutR.x, txtOutR.y + (i * txtOutR.lead));
  }
  pop();
}

function printText() {
  if (frameCount % 5 === 0) {
    if (words[paragraphIndex][words[paragraphIndex].length - 1] == true) {
      wordCountMax = words[paragraphIndex].length - 1;
      
      // Still have words in current paragraph
      if (wordCount < wordCountMax) {
        let nextWord = words[paragraphIndex][wordCount];
        
        // Check for paragraph break in word
        if (nextWord.includes('\n\n')) {
          // Split on paragraph break
          let parts = nextWord.split('\n\n');
          
          // Handle first part (end of current paragraph)
          if (parts[0] !== '') {
            print += parts[0].trim() + ' ';
            txtIn.txt[rowCount - 1] = print;
          }
          
          // Add paragraph breaks
          rowCount += 1;
          txtIn.txt[rowCount - 1] = '';
          rowCount += 1;
          txtIn.txt[rowCount - 1] = '';
          
          // Set up next paragraph's first word if it exists
          if (parts[1] !== '') {
            print = parts[1].trim() + ' ';
            txtIn.txt[rowCount - 1] = print;
          }
        }
        // Normal word processing
        else {
          print += nextWord + ' ';
          txtIn.txt[rowCount - 1] = print;
        }
        
        wordCount += 1;
      } 
      // End of paragraph reached
      else if (paragraphIndex < paragraphs.length - 1) {
        // Complete current line if needed
        if (print != ' ' && print != '') {
          txtIn.txt[rowCount - 1] = print;
        }
        
        // Add paragraph break
        rowCount += 1;
        txtIn.txt[rowCount - 1] = '';
        rowCount += 1;
        txtIn.txt[rowCount - 1] = '';
        
        // Setup for next paragraph
        paragraphIndex += 1;
        wordCount = 0;
        print = '';
        
        // Activate next paragraph
        words[paragraphIndex][words[paragraphIndex].length - 1] = true;
      }

      // Check if current line needs to break
      if (textWidth(print) > txtMaxWidth - 15) {
        if (print != ' ' && print != '') {
          txtIn.txt[rowCount - 1] = print;
          rowCount += 1;
          print = '';
          txtIn.txt[rowCount - 1] = '';
        }
      }
    }
  }
}

function textSetup() {
  for (let p of getPoints) {
    let relX, relY;
    
    if (p.x < width/2) {
      relX = (p.x - bboxL.x) / bboxL.w;
      relY = (p.y - bboxL.y) / bboxL.h;
    } else {
      relX = (p.x - bboxR.x) / bboxR.w;
      relY = (p.y - bboxR.y) / bboxR.h;
    }
    
    if (relX >= 0.85 || relY >= 0.8 || relY <= 0.2) {
      particlePos.push(new p5.Vector(p.x, p.y));
    }
  }

  textFont(font);
  textAlign(LEFT, CENTER);
  textGraphics.textFont(font);
  textGraphics.textAlign(LEFT, CENTER);
}

// Helper function to wrap text
function wrapText(text, maxWidth, fontStyle, fontSize) {
  let words = text.split(' ');
  let lines = [];
  let currentLine = words[0];

  push();
  textFont(fontStyle);
  textSize(fontSize);

  for (let i = 1; i < words.length; i++) {
    let word = words[i];
    let width = textWidth(currentLine + ' ' + word);
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);

  pop();
  return lines.join('\n');
}

function checkFirebaseAndStart() {
  if (typeof firebase !== 'undefined' && firebase.apps.length) {
    console.log("Firebase is ready!");
    getData = true;
  } else {
    console.log("Waiting for Firebase...");
    setTimeout(checkFirebaseAndStart, 100);
  }
}

function flowfieldSetup() {
  outWidthL = txtOutL.w / r;
  outHeightL = txtOutL.h / r;
  outWidthR = txtOutR.w / r;
  outHeightR = txtOutR.h / r;
  inWidth = txtIn.w / r;
  inHeight = txtIn.h / r;
  outXL = txtOutL.x / r;
  outYL = txtOutL.y / r;
  outXR = txtOutR.x / r;
  outYR = txtOutR.y / r;
  inX = txtIn.x / r;
  inY = txtIn.y / r;

  flowfield = new FlowField(r);

  for (let i = 0; i < particlePos.length; i++) {
    let flowPoint = Flowpoint.getFromPool();
    flowPoint.initFromPosition(particlePos[i].x, particlePos[i].y);
    let randomAngle = random(-PI / adjustAngle, PI / adjustAngle);
    flowPoint.velocity = p5.Vector.fromAngle(randomAngle).mult(random(1, 3));
    flowPoint.initRandomSpeedAndForce();
    flowPoints.push(flowPoint);
  }
}

function applyFlowfield() {
  flowfield.init();
  for (let i = 0; i < flowPoints.length; i++) {
    flowPoints[i].follow(flowfield);
    flowPoints[i].run(i);
  }
}

function manageParticles() {
  if (flowPoints.length < pointNum) {
    let newPointsToAdd = pointNum - flowPoints.length;
    for (let j = 0; j < newPointsToAdd; j++) {
      let newPoint = Flowpoint.getFromPool();
      newPoint.initFromPosition(
        particlePos[floor(random(particlePos.length))].x,
        particlePos[floor(random(particlePos.length))].y
      );
      let randomAngle = random(-PI / adjustAngle, PI / adjustAngle);
      newPoint.velocity = p5.Vector.fromAngle(randomAngle).mult(random(1, 3));
      newPoint.initRandomSpeedAndForce();
      flowPoints.push(newPoint);
    }
  }

  for (let i = flowPoints.length - 1; i >= 0; i--) {
    if (flowPoints[i].isDone) {
      flowPoints[i].release();
      flowPoints.splice(i, 1);
    }
  }
}

let flowPointsPool = [];
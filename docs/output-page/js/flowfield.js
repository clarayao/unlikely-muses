class FlowField {
  constructor(r) {
    this.resolution = r;
    this.cols = floor(width / this.resolution);
    this.rows = floor(height / this.resolution);
    this.field = new Array(this.cols);
    this.r = new Array(this.cols);
    for (let i = 0; i < this.cols; i++) {
      this.field[i] = new Array(this.rows);
      this.r[i] = new Array(this.rows);
    }
  }

  init() {
    let intervalL = abs(inHeight - outHeightL) / (inX - outXL) / 2;
    let intervalR = abs(inHeight - outHeightR) / (outXR - (inX + inWidth)) / 2;
    noiseSeed(500);
    for (let i = 0; i < this.cols; i++) {
      let colsMinL = outXL;
      let colsMaxL = inX - 1;
      let colsMinR = inX + inWidth;
      let colsMaxR = outXR + outWidthR;
      let rowsMinL =
        ceil(outYL + 1 - i * intervalL) + map(noise(i * 0.05), 0, 1, -2, 2);
      let rowsMaxL =
        floor(outYL - 1 + outHeightL + i * intervalL) +
        map(noise(i * 0.05), 0, 1, -2, 2);
      let rowsMinR =
        ceil(outYR - 1 - abs(colsMaxR - i) * intervalR) +
        map(noise(i * 0.05), 0, 1, -2, 2);
      let rowsMaxR =
        floor(outYR + outHeightR + abs(colsMaxR - i) * intervalR) +
        map(noise(i * 0.05), 0, 1, -2, 2);
      for (let j = 0; j < this.rows; j++) {
        let angle = 0;
        if (i >= colsMinL && i <= colsMaxL) {
          // flow area
          if (j >= rowsMinL && j <= rowsMaxL) {
            this.r[i][j] = 0;
            let noiseVal = noise(
              i * 0.1 + frameCount * 0.005,
              j * 0.1 + frameCount * 0.005
            );
            let factor = 1;
            if (j < floor(rows / 2)) {
              angle =
                map(noiseVal, 0, 1, -1.8, 0.8) +
                map(i, colsMinL, colsMaxL, 0, (PI / 2) * adjustAngle);
            } else {
              angle =
                map(noiseVal, 0, 1, -0.8, 1.8) +
                map(i, colsMinL, colsMaxL, 0, -(PI / 2) * adjustAngle);
            }
          }
          // out area
          else if (j < rowsMinL) {
            this.r[i][j] = 255;
            let test = sin(map(i, colsMinL, colsMaxL, 0, PI));
            angle = map(test, -1, 1, 0, -PI / 2) + PI / 4;
          } else {
            this.r[i][j] = 255;
            let test = sin(map(i, colsMinL, colsMaxL, 0, PI));
            angle = -(map(test, -1, 1, 0, -PI / 2) + PI / 4);
            // angle = map(i, colsMin, colsMax, 0, HALF_PI / 2);
          }
        } else if (i > colsMaxL && i < colsMaxL + inWidth / 2) {
          if (j < ceil(rows / 2)) {
            angle = map(i, colsMaxL, colsMaxL + inWidth / 2, 0, PI / 4);
          } else {
            angle = map(i, colsMaxL, colsMaxL + inWidth / 2, 0, -PI / 4);
          }
        } else if (i > colsMaxL + inWidth / 2 && i < colsMaxL + inWidth) {
          if (j < ceil(rows / 2)) {
            angle = map(
              i,
              colsMaxL + inWidth / 2,
              colsMaxL + inWidth,
              (PI * 3) / 4,
              PI
            );
          } else {
            angle = map(
              i,
              colsMaxL + inWidth / 2,
              colsMaxL + inWidth,
              (-PI * 3) / 4,
              -PI
            );
          }
        } else if (i > colsMaxL + inWidth && i < colsMaxR) {
          // flow area
          if (j >= rowsMinR && j <= rowsMaxR) {
            this.r[i][j] = 0;
            // noiseSeed(100);
            let noiseVal = noise(
              i * 0.1 + frameCount * 0.005,
              j * 0.1 + frameCount * 0.005
            );
            if (j < floor(rows / 2)) {
              angle =
                map(noiseVal, 0, 1, -1.2, 0.8) +
                map(i, colsMinR, colsMaxR, PI, PI + (PI / 2) * adjustAngle);
            } else {
              angle =
                map(noiseVal, 0, 1, -0.8, 0.8) +
                map(i, colsMinR, colsMaxR, PI - (PI / 2) * adjustAngle, PI);
            }
          }
          // out area
          else if (j < rowsMinR) {
            this.r[i][j] = 255;
            let test = sin(map(i, colsMinR, colsMaxR, 0, PI));
            angle = map(test, -1, 1, PI / 2, PI) + PI / 4;
          } else {
            this.r[i][j] = 255;
            let test = sin(map(i, colsMinR, colsMaxR, 0, PI));
            angle = -(map(test, -1, 1, PI / 2, PI) + PI / 4);
            // angle = map(i, colsMin, colsMax, 0, HALF_PI / 2);
          }
        } else {
          angle = 0;
        }
        this.field[i][j] = p5.Vector.fromAngle(angle);
      }
    }
  }

  show() {
    this.init();
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        let w = width / this.cols;
        let h = height / this.rows;
        let v = this.field[i][j].copy();
        v.setMag(w * 0.5);
        let x = i * w + w / 2;
        let y = j * h + h / 2;
        stroke(this.r[i][j], 255, 255);
        strokeWeight(1);
        line(x, y, x + v.x, y + v.y);
      }
    }
  }

  lookup(position) {
    let column = constrain(
      floor(position.x / this.resolution),
      0,
      this.cols - 1
    );
    let row = constrain(floor(position.y / this.resolution), 0, this.rows - 1);
    return this.field[column][row].copy();
  }
}

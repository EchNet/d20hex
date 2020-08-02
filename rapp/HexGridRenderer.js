// Geometry for a grid of regular hexagons.
// Hexagons are upright, that is, their tops and bottoms are flat.

const DEG30 = Math.PI/6;
const DEG60 = Math.PI/3;
const DEG120 = 2*Math.PI/3;
const SINDEG30 = Math.sin(DEG30);
const COSDEG30 = Math.cos(DEG30);
const SQRT3 = Math.sqrt(3);

function sq(x) { return x*x; }

function dist(x0, y0, x1, y1) {
  return Math.sqrt(sq(y0 - y1) + sq(x1 - x0));
}

function hexToString(hex) {
  return `${hex.row}:${hex.col}`;
}

function stringToHex(str) {
  const parts = str.split(":")
  return { row: parseInt(parts[0]), col: parseInt(parts[1]) }
}

function areAdjacentHexes(hex1, hex2) {
  const dRow = hex2.row - hex1.row;
  const dCol = hex2.col - hex1.col;
  return dRow >= -1 && dRow <= 1 && dCol >= -1 && dCol <= 1 &&
      ((dRow == 0 && dCol != 0) ||
          (dRow != 0 && (((dRow == 1) == (hex1.col % 2 == 0)) || (dCol == 0))))
}

export class HexGridPath {
  constructor(startHex) {
    this.array = [ hexToString(startHex) ]
  }
  get length() {
    return this.array.length;
  }
  get startHex() {
    return stringToHex(this.startHexString)
  }
  get startHexString() {
    return this.array[0]
  }
  get endHex() {
    return stringToHex(this.endHexString)
  }
  get endHexString() {
    return this.array[this.array.length - 1]
  }
  add(hex) {
    // Make sure that the path remains contiguous.
    const path = HexGridPath.between(stringToHex(this.array[this.array.length - 1]), hex)
    // Handle backing up.
    for (let i = path.array.length; --i >= 0; ) {
      const str = path.array[i]
      const index = this.array.findIndex((ele) => ele == str);
      if (index >= 0) {
        this.array = this.array.slice(0, index).concat(path.array.slice(i))
        return;
      }
    }
    // Should never be reached.  The first element of the added path is guaranteed to
    // be equal to the last element of this path.
  }
  static between(hex1, hex2) {
    let path = new HexGridPath(hex1)
    let row = hex1.row;
    let col = hex1.col;
    while (row != hex2.row || col != hex2.col) {
      let dRow = row < hex2.row ? 1 : (row > hex2.row ? -1 : 0)
      let dCol = col < hex2.col ? 1 : (col > hex2.col ? -1 : 0)
      if (!areAdjacentHexes({ row, col }, { row: row + dRow, col: col + dCol })) {
        dCol = 0;
      }
      row += dRow;
      col += dCol;
      path.array.push(hexToString({ row, col }))
    }
    return path;
  }
}

export class HexGridGeometry {
  constructor(options = null) {
    this.options = Object.assign({}, this.defaultOptions(), options)
  }
  defaultOptions() {
    return {
      // The size of the regular hexagon, also the radius of a circumscribed circle.
      radius: 28
    }
  }
  get radius() {
    return this.options.radius;
  }
  get unitDistance() {
    // Unit distance is the distance between corresponding points of any two adjacent hexes.
    // It is also the diameter of an inscribed circle.
    return this.options.radius * SQRT3;
  }
  traverseGrid(width, height, callback) {
    const radius = this.options.radius;

    const unitDistance = this.unitDistance;
    // Vector looking down and to the right:
    const unitDistanceX = unitDistance * COSDEG30;
    const unitDistanceY = unitDistance * SINDEG30;

    // Start at the lower left corner and work up toward the upper left corner, then the
    // upper right.  Draw stripes that originate at the edge and proceed 30 degrees downward
    // and to the right.
    let closest = null;
    let row0 = Math.floor(height / unitDistance) + 1;
    let col0 = 0;
    let cx0 = 0;
    let cy0 = row0 * unitDistance;
    for (let stripeCount = 0; cx0 < width + radius; ++stripeCount) {
      let cx = cx0;
      let cy = cy0;
      let row = row0;
      let col = col0;
      for (let cellCount = 0; cx < width + radius && cy < height + unitDistance / 2; ++cellCount) {
        callback({ cx, cy, stripeCount, cellCount, row, col })
        cx += unitDistanceX;
        cy += unitDistanceY;
        if (col % 2 == 0) { row += 1 }
        col += 1;
      }
      if (cy0 > 0.0001 /* != 0 */) {
        // Follow the left edge bottom to top.
        cy0 -= unitDistance;
        row0 -= 1;
      }
      else {
        // Follow the top edge left to right.
        cx0 += radius * 3;
        col0 += 2;
      }
    }
  }
  // Visit the vertices of the hexagon with center at (cx,cy).
  describeHexagon(cx, cy, callback) {
    var x = cx, y = cy;  // Start at the center.
    var angle = 0;       // Pointing at the vertex to the right.
    for (var i = 0; i <= 6; ++i) {
      x += Math.cos(angle) * this.radius;
      y += Math.sin(angle) * this.radius;
      callback(x, y, i);
      // The first iteration is special because we started at the center point.
      // The remaining iterations move from one vertex to another.
      angle += i == 0 ? DEG120 : DEG60; 
    }
  }
  // Map (row,col) to (cx,cy).
  locateHex(hex) {
    let cx = hex.col * (this.radius * 3 / 2)
    let cy = hex.row * this.unitDistance;
    if (hex.col % 2) {
      cy -= this.unitDistance * SINDEG30;
    }
    hex.cx = cx;
    hex.cy = cy;
    return hex;
  }
}

export class HexGridRenderer extends HexGridGeometry {
  constructor(canvas, options = null) {
    super(options)
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
  }
  defaultOptions() {
    return Object.assign({}, super.defaultOptions(), {
      strokeStyle: "rgb(200,200,200)",
      lineWidth: 1
    })
  }
  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return this;
  }
  drawGrid() {
    // Draw the entire grid in a single stroke.
    const context = this.context;
    context.lineWidth = this.options.lineWidth;
    context.strokeStyle = this.options.strokeStyle;
    if (this.options.bgMap) {
      this.traverseCanvas((hex) => {
        let bgValue = this.options.bgMap.getBgValue(hex.row, hex.col)
        if (bgValue) {
          context.beginPath();
          this.describeHexagon(hex.cx, hex.cy, (x, y, index) => {
            context[index == 0 ? "moveTo" : "lineTo"](x, y);
          })
          context.fillStyle = bgValue;
          context.fill();
        }
      })
    }
    context.beginPath();
    this.traverseCanvas((hex) => {
      this.describeHexagon(hex.cx, hex.cy, (x, y, index) => {
        // Don't retrace lines.
        let noLine = (index == 0) || (hex.stripeCount && (index == 2 || index == 3)) || (hex.cellCount && index == 4);
        context[noLine ? "moveTo" : "lineTo"](x, y);
      })
    })
    context.stroke();
  }
  drawHex(hex, drawSegment = null) {
    if (hex) {
      const context = this.context;
      const savedGlobalCompositeOperation = context.globalCompositeOperation;
      context.strokeStyle = this.options.strokeStyle;
      context.lineWidth = this.options.lineWidth;
      context.beginPath();
      hex = this.locateHex(hex)
      this.describeHexagon(hex.cx, hex.cy, (x, y, index) => {
        context[index == 0 || (drawSegment && !drawSegment[index - 1]) ? "moveTo" : "lineTo"](x, y);
      })
      let fillStyle = (this.options.bgMap && this.options.bgMap.getBgValue(hex.row, hex.col))
          || this.options.fillStyle;
      if (fillStyle) {
        context.fillStyle = fillStyle;
      }
      else {
        // Clear the hex.
        context.globalCompositeOperation = "destination-out";
      }
      context.fill();
      context.globalCompositeOperation = savedGlobalCompositeOperation;
      context.stroke();
    }
  }
  drawPath(path) {
    for (let i = 0; i < path.array.length; ++i) {
      this.drawHex(stringToHex(path.array[i]));
    }
  }
  getBoundingHex(point) {
    // TODO: optimize.
    var closest = null;
    this.traverseCanvas((hex) => {
      const distance = dist(hex.cx, hex.cy, point.x, point.y)
      if (!closest || distance < closest.distance) {
        closest = Object.assign(hex, { distance })
      }
    })
    return closest;
  }
  traverseCanvas(callback) {
    // Cover the whole canvas.
    this.traverseGrid(this.canvas.width, this.canvas.height, callback)
  }
}

export default HexGridRenderer

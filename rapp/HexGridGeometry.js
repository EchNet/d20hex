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

export class HexGridGeometry {
  constructor(options = null) {
    Object.assign(this, {
      // The length of each side of the regular hexagon, also the radius of a circumscribed circle.
      hexSize: 28,
      // The center point, relative to a center hex.
      center: [0, 0, 0, 0],
      width: 100,
      height: 100
    }, options)
  }
  get unitDistance() {
    // Unit distance is the distance between corresponding points of any two adjacent hexes.
    // It is also the diameter of an inscribed circle.  It is also half of the height.
    return this.hexSize * SQRT3;
  }
  getBoundingHex(point) {
    // Translate (x, y) point to (row, col) hex.
    return this._reducePoint(
        this.center[0], this.center[1],
        this.center[2] - this.width/2 + point.x,
        this.center[3] - this.height/2 + point.y)
  }
  traceGrid(callback) {
    // Vector looking down and to the right:
    const unitDistanceX = this.unitDistance * COSDEG30;
    const unitDistanceY = this.unitDistance * SINDEG30;

    // Start at the lower left corner and work up toward the upper left corner, then the
    // upper right.  Draw stripes that originate at the edge and proceed 30 degrees downward
    // and to the right.
    const lowerLeft = this._reducePoint(this.center[0], this.center[1], this.width * -0.5, this.height * 0.5)
    let startingHex = this.locateHex(lowerLeft)
    let row0 = lowerLeft.row;
    let col0 = lowerLeft.col;
    let cx0 = startingHex.cx;
    let cy0 = startingHex.cy;

    for (let stripeCount = 0; cx0 < this.width + this.hexSize; ++stripeCount) {
      let cx = cx0;
      let cy = cy0;
      let row = row0;
      let col = col0;
      for (let cellCount = 0; cx < this.width + this.hexSize && cy < this.height + this.unitDistance / 2; ++cellCount) {
        callback(new Hex(row, col, cx, cy, this), stripeCount, cellCount)
        cx += unitDistanceX;
        cy += unitDistanceY;
        if (col % 2 == 0) { row += 1 }
        col += 1;
      }
      if (cy0 > 0.0001 /* != 0 */) {
        // Follow the left edge bottom to top.
        cy0 -= this.unitDistance;
        row0 -= 1;
      }
      else {
        // Follow the top edge left to right.
        cx0 += this.hexSize * 3;
        col0 += 2;
      }
    }
  }
  // Map (row,col) to (cx,cy).
  locateHex(hexPosition) {
    // Find the (x,y) coordinates of the center of the center hex.
    const cx = (this.width / 2) - this.center[2];
    const cy = (this.height / 2) - this.center[3];

    // Find the distance from the center hex to the desired hex.
    const distance = this.distanceFromHexToHex(this.center[0], this.center[1], hexPosition.row, hexPosition.col)

    // Add distance offsets to center point.
    return new Hex(hexPosition.row, hexPosition.col, cx + distance.xoffset, cy + distance.yoffset, this)
  }
  // Find the (xoffset,yoffset) difference between the centers of two hexes.
  distanceFromHexToHex(row0, col0, row1, col1) {
    let xoffset = (col1 - col0) * (this.hexSize * 1.5)
    let yoffset = this.unitDistance * ((row1 - row0) - ((Math.abs(col1 % 2) - Math.abs(col0 % 2)) * SINDEG30));
    return { xoffset, yoffset }
  }
  _reducePoint(row, col, x, y) {
    // Given: (row, col) identifies a reference hex.
    //        (x, y) is an offset from the center of that hex.
    // Find the equivalent (row, col, x, y) that minimizes (x, y).

    // Strategy:
    // Imagine the hex grid sectioned into rectangular cells that are bounded on top, bottom,
    // left and right by parallel horizontal lines that pass through the centers of hexes.
    // Each cell of this grid contains sections of two hexes.  "Left-handed" cells are 
    // those that have top/left and bottom/right corners at centers of hexes, while
    // "right-handed" are those that have bottom/left and top/right corners at centers of
    // hexes.  Cell (0,0) is the left-handed one whose top/left corner coincides with the
    // center of the reference hex.  Adding (x, y) to the center of the reference hex takes
    // us to a cell and its two corner hexes.  The closer of the two is the target cell.

    // The size of the rectangular cells.
    const xUnitSize = this.hexSize * 1.5;       // width
    const yUnitSize = this.unitDistance / 2;    // height

    // Calculate the cell coordinates of the two closest hex centers. 
    const xUnits = Math.floor(x / xUnitSize)
    const yUnits = Math.floor(y / yUnitSize)
    const leftHanded = ((xUnits + yUnits) % 2) === 0;
    const xLeft = xUnits;
    const yLeft = yUnits + (leftHanded ? 0 : 1)
    const xRight = xLeft + 1;
    const yRight = yLeft + (leftHanded ? 1 : -1)

    // Determine which of the two centers is closer.
    const leftIsCloser =
      dist(x, y, xLeft * xUnitSize, yLeft * yUnitSize) <
        dist(x, y, xRight * xUnitSize, yRight * yUnitSize)
    const xOff = leftIsCloser ? xLeft : xRight;
    const yOff = leftIsCloser ? yLeft : yRight;

    // Find the (row,col) coordinates of the closer hex.
    const oddRow = row % 2 !== 0;
    row += Math.floor((yOff + (oddRow ? 0 : 1)) / 2)
    col += xOff;

    // Translate the x and y offsets relative to the center of the target hex.
    x -= xOff * xUnitSize;
    y -= yOff * yUnitSize;
    return { row, col, x, y }
  }
}

class Hex {
  constructor(row, col, cx, cy, geometry) {
    this.row = row;
    this.col = col;
    this.cx = cx;
    this.cy = cy;
    this.geometry = geometry;
  }
  // Visit the vertices of the hexagon with center at (cx,cy).
  describe(callback) {
    var x = this.cx, y = this.cy;  // Start at the center.
    var angle = 0;       // Pointing at the vertex to the right.
    for (var i = 0; i <= 6; ++i) {
      x += Math.cos(angle) * this.geometry.hexSize;
      y += Math.sin(angle) * this.geometry.hexSize;
      callback(x, y, i);
      // The first iteration is special because we started at the center point.
      // The remaining iterations move from one vertex to another.
      angle += i == 0 ? DEG120 : DEG60; 
    }
  }
}

export default HexGridGeometry;

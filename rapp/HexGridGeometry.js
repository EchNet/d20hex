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
    //let row0 = Math.floor(this.height / this.unitDistance) + 1;
    //let col0 = 0;
    //let cx0 = 0;
    //let cy0 = row0 * this.unitDistance;
    const lowerLeft = this._reducePoint(this.center[0], this.center[1], this.width * -0.5, this.height * 0.5)
    let row0 = lowerLeft.row;
    let col0 = lowerLeft.col;
    let cx0 = 0 - lowerLeft.xoffset;
    let cy0 = this.height - lowerLeft.yoffset;

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
    const cRow = this.center[0];
    const cCol = this.center[1];
    const cx = (this.width / 2) - this.center[2];
    const cy = (this.height / 2) - this.center[3];
    const distance = this.distanceFromHexToHex(this.center[0], this.center[1], hexPosition.row, hexPosition.col)
    return new Hex(hexPosition.row, hexPosition.col, cx + distance.xoffset, cy + distance.yoffset, this)
  }
  // Find the (xoffset,yoffset) difference between the centers of two hexes.
  distanceFromHexToHex(row0, col0, row1, col1) {
    let xoffset = (col1 - col0) * (this.hexSize * 3 / 2)
    let yoffset = ((row1 - row0) * this.unitDistance) - (((col1 % 2) - (col0 % 2)) * (this.unitDistance * SINDEG30));
    return { xoffset, yoffset }
  }
  _reducePoint(row, col, xoffset, yoffset) {
    // Given: (row, col) identifies a reference hex.
    //        (xoffset, yoffset) is an offset from the center of that hex.
    // Find the equivalent (row, col, xoffset, yoffset) that minimizes (xoffset, yoffset).
    //
    // Strategy:
    // Imagine the hex grid sectioned into cells that are bounded on top, bottom, left
    // and right by parallel horizontal lines that pass through the centers of hexes.
    // Each cell of this grid contains sections of two hexes.  Adding (xoffset, yoffset)
    // to the center of the reference hex takes us to a cell.  The residue offsets
    // relative to the edge of the cell determine which of the two hexes we ended in
    // and the offset relative to that hex's center.
    //
    var xCellSize = this.hexSize * 1.5;
    var xCellOffset = Math.floor(xoffset / xCellSize)
    var xResidue = xoffset - (xCellOffset * xCellSize)

    var yCellSize = this.unitDistance / 2;
    var yCellOffset = Math.floor(yoffset / yCellSize)
    var yResidue = yoffset - (yCellOffset * yCellSize)

    // TODO: illustrate
    var cellRow = (row * 2) - (col % 2) + yCellOffset;
    var cellCol = col + xCellOffset;

    var slopeOfDividerIsPositive = ((cellRow + cellCol) % 2) != 0;
    var distanceToDivider = (0.5 + ((slopeOfDividerIsPositive ? yResidue : (yCellSize - yResidue)) / yCellSize)) * this.hexSize;
    var leftOfDivider = xResidue < distanceToDivider;

    var destCol = cellCol + (leftOfDivider ? 0 : 1);
    var destRow = cellRow % 2 == 0 ? (cellRow / 2) + (destCol % 2) : Math.floor((cellRow + 1) / 2)
    var destXOffset = xResidue - ((leftOfDivider ? 0 : 1) * xCellSize);
    var destYOffset = yResidue - (((cellRow + destCol) % 2) * yCellSize);

    return {
      row: destRow, col: destCol, xoffset: destXOffset, yoffset: destYOffset
    }
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

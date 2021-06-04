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

// Type HexCoords is a { row, col } hash that uniquely identifies the position of a grid
// hex. Hex "rows" zig-zag horizontally, such that a position with an odd col value is higher
// (has lower y value) than its neighbor to the left in the same row.  Columns, on the other
// hand, stack linearly.

// Type HexRelativePoint is an array of elements: [ hexRow, hexCol, xoffset, yoffset ]
// that expresses a point on the map relative to the center of the hex at (hexRow, hexCol).

/**
 * HexGridGeometry defines the size and position of a grid of hexes and provides methods
 * for mapping between (x,y) coordinates and hex-relative coordinates.
 */
export class HexGridGeometry {
  constructor(options = null) {
    Object.assign(this, {
      // Defaults:
      hexSize: 28, // The length of each side of the regular hexagon.
      center: [0, 0, 0, 0], // The center point, a HexRelativePoint.
      width: 100,
      height: 100
    }, options)
  }
  get unitDistance() {
    // Unit distance is the distance between corresponding points of any two adjacent hexes.
    // It is also the diameter of an inscribed circle.
    return this.hexSize * SQRT3;
  }
  traceGrid(callback) {
    // Visit all of the hexes in view, reporting each to the callback function.
    // Start at the lower left corner and work up toward the upper left corner, then the
    // upper right.  Trace stripes that originate at the edge and proceed 30 degrees downward
    // and to the right. 
    // Callback parameters:
    // callback(Hex, numberOfPreviousStripes, numberOfPreviousHexesInTheCurrentStripe)

    // From one hex to the next in stripe:
    const unitDistanceX = this.unitDistance * COSDEG30;
    const unitDistanceY = this.unitDistance * SINDEG30;

    // Find the hex at the lower left corner.
    let { row: row0, col: col0, cx: cx0, cy: cy0 } = this.getBoundingHex({ x: 0, y: this.height})

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
      if (cy0 > 0) {
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
  getBoundingHex(point) {
    // Map (x, y) point to Hex.
    const { x, y } = point;
    const [ row, col, xoffset, yoffset ] = this._reduceHexRelativePoint([
        this.center[0], this.center[1],
        this.center[2] - this.width/2 + x,
        this.center[3] - this.height/2 + y ])
    const hex = this.locateHex({ row, col })
    // Also decorate with xoffset, yoffset.
    hex.xoffset = xoffset;
    hex.yoffset = yoffset;
    return hex;
  }
  // Construct a Hex for the hex given its (row,col) coordinates.
  locateHex(hexCoords) {
    const { row, col } = hexCoords;

    // Find the (x,y) coordinates of the center of the center hex.
    const cx = (this.width / 2) - this.center[2];
    const cy = (this.height / 2) - this.center[3];

    // Find the distance from the center hex to the desired hex.
    const distance = this.distanceFromHexToHex(this.center[0], this.center[1], row, col)

    // Add distance offsets to center point.
    return new Hex(row, col, cx + distance.xoffset, cy + distance.yoffset, this)
  }
  // Find the (xoffset,yoffset) difference between the centers of two hexes.
  distanceFromHexToHex(row0, col0, row1, col1) {
    let xoffset = (col1 - col0) * this.hexSize * 1.5;
    let yoffset = (row1 - row0) * this.unitDistance;
    // Adjust for the offset between adjacent columns.
    yoffset += (Math.abs(col0 % 2) - Math.abs(col1 % 2)) * this.unitDistance * 0.5;
    return { xoffset, yoffset }
  }
  _reduceHexRelativePoint(hexRelativePoint) {
    // Find the equivalent HexRelativePoint that minimizes abs(xoffset, yoffset).
    let [ row, col, xoffset, yoffset ] = hexRelativePoint;

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
    const xCellSize = this.hexSize * 1.5;       // width
    const yCellSize = this.unitDistance / 2;    // height

    // Find the cell that encloses the target point, relative to the center.
    const xCellOffset = Math.floor(xoffset / xCellSize)
    const yCellOffset = Math.floor(yoffset / yCellSize)
    // Find whether that cell is left- or right- handed.
    const leftHanded = ((xCellOffset + yCellOffset) % 2) === 0;

    // Find the offsets and coordinates of the two corners of the cell that represent the
    // centers of the left and right hexes.
    const findCenter = (origRow, origCol, xCellOff, yCellOff) => {
      const row = origRow + Math.floor((yCellOff + ((origCol % 2) == 0 ? 1 : 0)) / 2);
      const col = origCol + xCellOff;
      const xoffset = xCellOff * xCellSize;
      const yoffset = yCellOff * yCellSize
      return { row, col, xoffset, yoffset }
    }
    const left = findCenter(row, col, xCellOffset, yCellOffset + (leftHanded ? 0 : 1));
    const right = findCenter(row, col, xCellOffset + 1, yCellOffset + (leftHanded ? 1 : 0));

    // Select the closer of the two centers.
    const leftIsCloser =
      dist(xoffset, yoffset, left.xoffset, left.yoffset) <
        dist(xoffset, yoffset, right.xoffset, right.yoffset)
    const closer = leftIsCloser ? left : right;

    // Recompute offsets relative to the selected center.
    row = closer.row;
    col = closer.col;
    xoffset -= closer.xoffset;
    yoffset -= closer.yoffset;
    return [ row, col, xoffset, yoffset ]
  }
}

/**
 * Hex is a subtype of HexCoords having in addition to row, col properties, 
 * cx and cy  properties giving the coordinates of the center point of the hex within
 * the grid canvas.  There is also a describe method that visits the 6 vertexes.
 */
class Hex {
  constructor(row, col, cx, cy, geometry) {
    this.row = row;
    this.col = col;
    this.cx = cx;
    this.cy = cy;
    this.geometry = geometry;
  }
  // Visit the vertices of the hexagon.
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

// Geometry for a grid of regular hexagons.
// Hexagons are upright, that is, their tops and bottoms are flat.

const DEG30 = Math.PI/6;
const DEG60 = Math.PI/3;
const DEG120 = 2*Math.PI/3;
const SINDEG30 = Math.sin(DEG30);
const COSDEG30 = Math.cos(DEG30);
const SQRT3 = Math.sqrt(3);

// Math...

function sq(x) { return x*x; }

function dist(x0, y0, x1, y1) {
  return Math.sqrt(sq(y0 - y1) + sq(x1 - x0));
}

export class HexGridRenderer {
  constructor(canvas, options = null) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.options = Object.assign({}, {
      radius: 28,
      strokeStyle: "rgb(200,200,200)"
    }, options);
  }
  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return this;
  }
  drawGrid() {
    // Draw the entire grid in a single stroke.
    const context = this.context;
    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = this.options.strokeStyle;
    if (this.options.bgMap) {
      this.traverseGrid((hex) => {
        let bgValue = this.options.bgMap.getBgValue(hex.row, hex.col)
        if (bgValue) {
          this.describeHexagon(hex.cx, hex.cy, (x, y, index) => {
            context.lineWidth = 1;
            context.beginPath();
            this.describeHexagon(hex.cx, hex.cy, (x, y, index) => {
              context[index == 0 ? "moveTo" : "lineTo"](x, y);
            })
            context.fillStyle = bgValue;
            context.fill();
          })
        }
      })
    }
    this.traverseGrid((hex) => {
      this.describeHexagon(hex.cx, hex.cy, (x, y, index) => {
        // Don't retrace lines.
        let noLine = (index == 0) || (hex.stripeCount && (index == 2 || index == 3)) || (hex.cellCount && index == 4);
        context[noLine ? "moveTo" : "lineTo"](x, y);
      })
    })
    context.stroke();
  }
  getBoundingHex(point) {
    // TODO: optimize.
    var closest = null;
    this.traverseGrid((hex) => {
      const distance = dist(hex.cx, hex.cy, point.x, point.y)
      if (!closest || distance < closest.distance) {
        closest = Object.assign(hex, { distance })
      }
    })
    return closest;
  }
  drawHex(hex) {
    if (hex) {
      const context = this.context;
      context.strokeStyle = this.options.strokeStyle;
      context.lineWidth = 1;
      context.beginPath();
      this.describeHexagon(hex.cx, hex.cy, (x, y, index) => {
        context[index == 0 ? "moveTo" : "lineTo"](x, y);
      })
      if (this.options.fillStyle) {
        context.fillStyle = this.options.fillStyle;
        context.fill();
      }
      context.stroke();
    }
  }
  traverseGrid(callback) {
    // Radius is the distance between adjacent vertices or between the center and a vertex.
    const radius = this.options.radius;

    // Unit distance is the distance between corresponding points of any two adjacent hexes.
    const unitDistance = radius * SQRT3;
    const unitDistanceX = unitDistance * COSDEG30;
    const unitDistanceY = unitDistance * SINDEG30;

    // Fill the whole canvas.
    const width = this.canvas.width;
    const height = this.canvas.height;

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
      x += Math.cos(angle) * this.options.radius;
      y += Math.sin(angle) * this.options.radius;
      callback(x, y, i);
      // The first iteration is special because we started at the center point.
      // The remaining iterations move from one vertex to another.
      angle += i == 0 ? DEG120 : DEG60; 
    }
  }
}

export default HexGridRenderer

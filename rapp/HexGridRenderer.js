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

// Visit the vertices of the hexagon with center at (cx,cy).
function describeHexagon(cx, cy, radius, callback) {
  var x = cx, y = cy;  // Start at the center.
  var angle = 0;       // Pointing at the vertex to the right.
  for (var i = 0; i <= 6; ++i) {
    x += Math.cos(angle) * radius;
    y += Math.sin(angle) * radius;
    callback(x, y, i);
    // The first iteration is special because we started at the center point.
    // The remaining iterations move from one vertex to another.
    angle += i == 0 ? DEG120 : DEG60; 
  }
}

export class HexGridRenderer {
  constructor(canvas, options) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.options = Object.assign({}, {
      radius: 36,
      strokeStyle: "rgba(0,0,0,0.25)"
    }, options);
  }
  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return this;
  }
  drawGrid() {
    // Radius is the distance between adjacent vertices or between the center and a vertex.
    const radius = this.options.radius;

    // Unit distance is the distance between corresponding points of any two adjacent hexes.
    const unitDistance = radius * SQRT3;

    // Fill the whole canvas.
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Draw the entire grid in a single stroke.
    const context = this.context;
    context.beginPath();
    context.strokeStyle = this.options.strokeStyle;
    context.lineWidth = 1;

    // Start at the lower left corner and work up toward the upper left corner, then the
    // upper right.  Draw stripes that originate at the edge and proceed 30 degrees downward
    // and to the right.
    var cx0 = 0;
    var cy0 = (Math.floor(height / unitDistance) + 1) * unitDistance;
    for (let stripeCount = 0; cx0 < width + radius; ++stripeCount) {
      let cx = cx0;
      let cy = cy0;
      for (let cellCount = 0; cx < width + radius && cy < height + unitDistance / 2; ++cellCount) {
        describeHexagon(cx, cy, radius, (x, y, index) => {
          // Don't retrace lines.
          let noLine = (index == 0) || (stripeCount && (index == 2 || index == 3)) || (cellCount && index == 4);
          context[noLine ? "moveTo" : "lineTo"](x, y);
        })
        cx += unitDistance * COSDEG30;
        cy += unitDistance * SINDEG30;
      }
      if (cy0 < 0.0001 /* == 0 */) {
        cx0 += radius * 3;
      }
      else {
        cy0 -= unitDistance;
      }
    }

    context.stroke();
  }
}

export default HexGridRenderer

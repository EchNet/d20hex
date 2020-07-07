// Geometry for a grid of regular hexagons.
// Hexagons are upright.

const DEG30 = Math.PI/6;
const DEG60 = Math.PI/3;
const DEG120 = 2*Math.PI/3;
const SINDEG30 = Math.sin(DEG30);
const COSDEG30 = Math.cos(DEG30);
const TANDEG30 = Math.tan(DEG30);

// Math...

function sq(x) { return x*x; }

function signity(x) {
  return x < 0 ? -1 : (x == 0 ? 0 : 1);
}

function dist(x0, y0, x1, y1) {
  return Math.sqrt(sq(y0 - y1) + sq(x1 - x0));
}

function round(x) {
  return Math.floor(x + 0.5);
}

const ADJACENCY = [
  [0, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1]
]

// Visit the vertices of the hexagon with center at (cx,cy).
function describeHexagon(cx, cy, radius, callback) {
  var x = cx, y = cy;
  var angle = 0;
  for (var i = 0; i < 6; ++i) {
    x += Math.cos(angle) * radius;
    y += Math.sin(angle) * radius;
    callback(x, y, i);
    angle += i == 0 ? DEG120 : DEG60;
  }
}

export class HexGridRenderer {
  constructor(canvas, options) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.options = Object.assign({}, {
      radius: 40,
      strokeStyle: "rgba(0,0,0,0.5)"
    }, options);
  }
  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return this;
  }
  drawGrid() {
    const context = this.context;
    context.beginPath();
    context.strokeStyle = this.options.strokeStyle;
    context.lineWidth = 1;

    // Radius is the distance between adjacent vertices or between the center and a vertex.
    const radius = this.options.radius;

    // Unit distance is the distance between corresponding points of any two adjacent hexes.
    const unitDistance = radius * Math.sqrt(3);

    const centerXAt = (row, column) =>
      (0 + unitDistance * (/* row*Math.sin(0) + */ column*COSDEG30))
    const centerYAt = (row, column) => 
      (0 + unitDistance * (row /* *Math.cos(0) */ + column*SINDEG30))

    let self = this;
    let width = this.canvas.width;
    let height = this.canvas.height;
    for (var column = 0; ; column += 1) {
      let cx = centerXAt(0/* don't care */, column)
      if (cx > width + radius) break;
      for (var row = -20; ; row += 1) {
        let cy = centerYAt(row, column)
        if (cy > height + radius) break;
        let x0;
        let y0;

        function advance(x, y, index) {
          let drawLine = false;
          if (index > 0) {
            var side = ADJACENCY[index - 1];
            drawLine = true; // side[0] > 0 || (side[0] == 0 && side[1] > 0)
          }
          else {
            x0 = x;
            y0 = y;
          }
          context[drawLine ? "lineTo" : "moveTo"](x, y);
        }
        describeHexagon(cx, cy, radius, advance);
        advance(x0, y0, 6);
      }
    }

    context.stroke();
  }
}

export default HexGridRenderer

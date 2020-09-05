// Geometry for a grid of regular hexagons.
// Hexagons are upright, that is, their tops and bottoms are flat.

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
  draw(canvas, geometry, options) {
    options = Object.assign({
      strokeStyle: "rgba(192,90,0,0.5)",
      fillStyle: "rgba(192,90,0,0.3)",
      lineWidth: 1,
    }, options)

    const context = canvas.getContext("2d");
    context.strokeStyle = options.strokeStyle;
    context.lineWidth = options.lineWidth;
    context.fillStyle = options.fillStyle;

    for (let i in this.array) {
      const hex = stringToHex(this.array[i])
      context.beginPath();
      geometry.locateHex(hex).describe((x, y, index) => {
        context[index == 0 ? "moveTo" : "lineTo"](x, y);
      })
      context.fill();
      context.stroke();
    }
  }
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

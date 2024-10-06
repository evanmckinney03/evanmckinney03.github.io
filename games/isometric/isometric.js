const GRID_SIZE = 10;
const STROKE_OFFSET = 2;

window.onload = init;

//these variables are set in init because it is determined by svg size
let SIDE_X;
let SIDE_Y;
const floorCoords = [];

function init() {
  const svg = document.getElementById('svg');
  const svgWidth = svg.getAttribute('width');
  const svgHeight = svg.getAttribute('height');

  //use svg width and height to determine the coords of the floor
  const floorHeight = Math.min(svgHeight / 2, svgWidth / (2 * Math.sqrt(3))) - STROKE_OFFSET;
  const floorWidth = floorHeight * Math.sqrt(3);
  floorCoords.push([svgWidth / 2 - floorWidth, svgHeight - floorHeight - STROKE_OFFSET]);
  floorCoords.push([svgWidth / 2, svgHeight - STROKE_OFFSET]);
  floorCoords.push([svgWidth / 2 + floorWidth, svgHeight - floorHeight - STROKE_OFFSET]);
  floorCoords.push([svgWidth / 2, svgHeight - floorHeight * 2 - STROKE_OFFSET]);
  drawFloor(floorCoords, svg);

  //use floorCoords and GRID_SIZE to determine the length of the sides
  const SIDE_LENGTH = distance(floorCoords[0], floorCoords[1]) / GRID_SIZE;
  //convert to components for ease later
  SIDE_X = SIDE_LENGTH * Math.sqrt(3) / 2;
  SIDE_Y = SIDE_LENGTH / 2;

  drawGridLines(svg);
}

//draws the floor based on the given floorCoords
function drawFloor(floorCoords, svg) {
  const floor = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  floor.setAttribute('id', 'floor');
  floor.setAttribute('points', floorCoords[0] + ' ' + floorCoords[1] + ' ' + floorCoords[2] + ' ' + floorCoords[3]);
  floor.setAttribute('class', 'top');
  floor.addEventListener('mousedown', floorClicked);
  svg.appendChild(floor);
}

//draw the grid lines of the floor using the side lengths given
function drawGridLines(svg) {
  //must draw GRID_SIZE - 1 lines
  //start at left and go up
  for(let i = 1; i < GRID_SIZE; i++) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const x1 = floorCoords[0][0] + SIDE_X * i;
    const y1 = floorCoords[0][1] - SIDE_Y * i;
    const x2 = x1 + SIDE_X * GRID_SIZE;
    const y2 = y1 + SIDE_Y * GRID_SIZE;
    line.setAttribute('class', 'grid_line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    svg.appendChild(line);
  }
  //start at left and go down
  for(let i = 1; i < GRID_SIZE; i++) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const x1 = floorCoords[0][0] + SIDE_X * i;
    const y1 = floorCoords[0][1] + SIDE_Y * i;
    const x2 = x1 + SIDE_X * GRID_SIZE;
    const y2 = y1 - SIDE_Y * GRID_SIZE;
    line.setAttribute('class', 'grid_line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    svg.appendChild(line);
  }
}

//
function floorClicked(event) {
  const x = Math.floor((event.clientX - floorCoords[0][0]) / SIDE_X);
  const y = Math.floor((event.clientY - floorCoords[3][1]) / SIDE_Y);
  const adjX = floorCoords[0][0] + x * SIDE_X;
  const adjY = floorCoords[3][1] + (y + 1) * SIDE_Y;
  const normX = event.clientX - adjX;
  const normY = adjY - event.clientY;
  if((x + y) % 2 == 0) {
    const xVal = (x + y - GRID_SIZE) / 2;
    if(normX * (SIDE_Y / SIDE_X * -1) + SIDE_Y > normY) {
      const yVal = x - xVal - 1;
      console.log([xVal, yVal]);
    } else {
      const yVal = x - xVal;
      console.log([xVal, yVal]);
    }
  } else {
    const yVal = Math.floor((x - (y - GRID_SIZE)) / 2);
    if(normX * (SIDE_Y / SIDE_X) > normY) {
      const xVal = x - yVal;
      console.log([xVal, yVal]);
    } else {
      const xVal = x - yVal - 1;
      console.log([xVal, yVal]);
    }
  }
}

//returns the distance between two coordinate points
function distance(a, b) {
  return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]));
}

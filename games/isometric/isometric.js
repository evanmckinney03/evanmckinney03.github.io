const GRID_SIZE = 11;
const STROKE_OFFSET = 2;

window.onload = init;

//these variables are set in init because it is determined by svg size
let SIDE_LENGTH;
let SIDE_X;
let SIDE_Y;
const floorCoords = [];

//used to highlight a certain tile

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
  SIDE_LENGTH = distance(floorCoords[0], floorCoords[1]) / GRID_SIZE;
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
  floor.addEventListener('mouseenter', floorMouseenter, {once: true});
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

//draws a highlighted square at the given coords
function drawHighlight(coords) {
  const svg = document.getElementById('svg');
  //first check if a highlight square has been drawn
  let highlight = document.getElementById('highlight');
  if(highlight == null) {
    //create the highlight and add it to the svg
    highlight = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    highlight.setAttribute('id', 'highlight');
    highlight.addEventListener('mouseout', leaveHighlight);
    highlight.addEventListener('click', highlightClicked);
    svg.appendChild(highlight);
  }
  let points = coords + ' ' + [coords[0] + SIDE_X, coords[1] + SIDE_Y];
  points += ' ' + [coords[0] + SIDE_X * 2, coords[1]] + ' ' + [coords[0] + SIDE_X, coords[1] - SIDE_Y];
  highlight.setAttribute('points', points);
}

//draws a cube starting at the bottom left
function drawCube(coords) {
  const svg = document.getElementById('svg');
  const left = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  let leftPoints = coords + ' ' + [coords[0] + SIDE_X, coords[1] + SIDE_Y] + ' ' + 
		[coords[0] + SIDE_X, coords[1] + SIDE_Y - SIDE_LENGTH] + ' ' + [coords[0], coords[1] - SIDE_LENGTH];
  left.setAttribute('id', 'left');
  left.setAttribute('class', 'left');
  left.setAttribute('points', leftPoints);
  svg.appendChild(left);
  const right = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  let rightPoints = [coords[0] + SIDE_X * 2, coords[1]] + ' ' + [coords[0] + SIDE_X, coords[1] + SIDE_Y] + ' ' 
		+ [coords[0] + SIDE_X, coords[1] + SIDE_Y - SIDE_LENGTH] + ' ' 
                + [coords[0] + SIDE_X * 2, coords[1] - SIDE_LENGTH];
  right.setAttribute('id', 'right');
  right.setAttribute('class', 'right');
  right.setAttribute('points', rightPoints);
  svg.appendChild(right);
  const top = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  let topPoints = [coords[0], coords[1] - SIDE_LENGTH] + ' ' + [coords[0] + SIDE_X, coords[1] - SIDE_LENGTH - SIDE_Y]
	+ ' ' + [coords[0] + SIDE_X * 2, coords[1] - SIDE_LENGTH] + ' ' 
	+ [coords[0] + SIDE_X, coords[1] - SIDE_LENGTH + SIDE_Y];
  top.setAttribute('id', 'top');
  top.setAttribute('class', 'top');
  top.setAttribute('points', topPoints);
  svg.appendChild(top);
}

function floorMouseenter(event) {
  const mouseLocation = convertToGrid(event.clientX, event.clientY);
  const highlightCoords = floorGridToSVGCoords(mouseLocation);
  drawHighlight(highlightCoords);
}

//when leaving a highlight, if it is in the floor still, redraw highlight
function leaveHighlight(event) {
  const floor = document.getElementById('floor');
  if(floor.matches(':hover')) {
    //cursor is still in floor, so move the highlight to mouse location
    const mouseLocation = convertToGrid(event.clientX, event.clientY);
    const highlightCoords = floorGridToSVGCoords(mouseLocation);
    drawHighlight(highlightCoords);
  } else {
    //delete highlight and readd the event listener for when floor is entered again
    deleteHighlight();
    floor.addEventListener('mouseenter', floorMouseenter, {once: true});
  }
}

//what to do when the highlight is clicked
function highlightClicked(event) {
  const coords = this.getAttribute('points').split(' ')[0].split(',');
  drawCube([parseFloat(coords[0]), parseFloat(coords[1])]);
}

//delete the highlight
function deleteHighlight() {
  const highlight = document.getElementById('highlight');
  //it should always exist, but just in case
  if(highlight) highlight.remove();
}

//converts mouse coords to floor grid coords where left is the origin
function convertToGrid(clientX, clientY) {
  const x = Math.floor((clientX - floorCoords[0][0]) / SIDE_X);
  const y = Math.floor((clientY - floorCoords[3][1]) / SIDE_Y);
  const adjX = floorCoords[0][0] + x * SIDE_X;
  const adjY = floorCoords[3][1] + (y + 1) * SIDE_Y;
  const normX = clientX - adjX;
  const normY = adjY - clientY;
  if((x + y) % 2 == (GRID_SIZE % 2)) {
    //down
    const xVal = Math.floor((x + y - GRID_SIZE) / 2);
    if(normX * (SIDE_Y / SIDE_X * -1) + SIDE_Y > normY) {
      const yVal = x - xVal - 1;
      //sometimes clicking the border results in out of bounds so just ensure
      //values are within 0 to GRID_SIZE - 1
      return [Math.min(Math.max(xVal, 0), GRID_SIZE - 1), Math.min(Math.max(yVal, 0), GRID_SIZE - 1)];
    } else {
      const yVal = x - xVal;
      return [Math.min(Math.max(xVal, 0), GRID_SIZE - 1), Math.min(Math.max(yVal, 0), GRID_SIZE - 1)];
    }
  } else {
    //up
    const yVal = Math.floor((x - (y - GRID_SIZE)) / 2);
    if(normX * (SIDE_Y / SIDE_X) > normY) {
      const xVal = x - yVal;
      return [Math.min(Math.max(xVal, 0), GRID_SIZE - 1), Math.min(Math.max(yVal, 0), GRID_SIZE - 1)];
    } else {
      const xVal = x - yVal - 1;
      return [Math.min(Math.max(xVal, 0), GRID_SIZE - 1), Math.min(Math.max(yVal, 0), GRID_SIZE - 1)];
    }
  }
}

//converts a floor grid coordinate to the location of the left most point of the rhombus
function floorGridToSVGCoords(gridCoords) {
  const x = floorCoords[0][0] + SIDE_X * (gridCoords[0] + gridCoords[1]);
  const y = floorCoords[1][1] - SIDE_Y * (GRID_SIZE - gridCoords[0] + gridCoords[1]);
  return [x ,y];
}

//returns the distance between two coordinate points
function distance(a, b) {
  return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]));
}

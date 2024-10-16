const GRID_SIZE = 11;
const STROKE_OFFSET = 2;

window.onload = init;

//these variables are set in init because it is determined by svg size
let SIDE_LENGTH;
let SIDE_X;
let SIDE_Y;
const floorCoords = [];
const grid = [];

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
  floor.addEventListener('mousemove', floorMousemove);
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

//draws a highlighted square at the given coords and height
function drawHighlight(position, orientation) {
  const svg = document.getElementById('svg');
  const coords = positionToSVGCoords(position);
  //first check if a highlight square has been drawn
  let highlight = document.getElementById('highlight');
  if(highlight == null) {
    //create the highlight and add it to the svg
    highlight = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    highlight.setAttribute('id', 'highlight');
    highlight.addEventListener('mouseout', leaveHighlight);
    highlight.addEventListener('click', highlightClicked);
    highlight.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      highlightRightClicked(this.getAttribute('data-zxy'));
      return false;
    });
  } else {
    svg.removeChild(highlight);
  }
  highlight.setAttribute('data-zxy', position);
  highlight.setAttribute('data-orientation', orientation);
  //draw shape based on orientation
  let points;
  if(orientation == 'top') {
    points = coords + ' ' + [coords[0] + SIDE_X, coords[1] + SIDE_Y]
	        + ' ' + [coords[0] + SIDE_X * 2, coords[1]] + ' ' + [coords[0] + SIDE_X, coords[1] - SIDE_Y];
  } else if(orientation == 'left') {
    points = coords + ' ' + [coords[0] + SIDE_X, coords[1] + SIDE_Y] + ' ' + 
		[coords[0] + SIDE_X, coords[1] + SIDE_Y + SIDE_LENGTH] + ' ' + [coords[0], coords[1] + SIDE_LENGTH];
  } else {
    points = [coords[0] + SIDE_X * 2, coords[1]] + ' ' + [coords[0] + SIDE_X, coords[1] + SIDE_Y] + ' ' 
		+ [coords[0] + SIDE_X, coords[1] + SIDE_Y + SIDE_LENGTH] + ' ' 
                + [coords[0] + SIDE_X * 2, coords[1] + SIDE_LENGTH];
  }
  highlight.setAttribute('points', points);
  //must insert the highlight in the correct place in the svg
  /*
  const cubes = Array.from(document.getElementsByClassName('left'));
  //find the first element that has a z greater than highlight's z and insert it before
  //binary search would be more efficient but too lazy to code
  let polygon = null;
  for(let i = 0; i < cubes.length; i++) {
    if(parseInt(cubes[i].getAttribute('id').split(',')[0]) > parseInt(position[0])) {
      polygon = cubes[i];
      break;
    }
  }
  */
  const polygon = document.getElementById(position + ',' + orientation);
  if(polygon == null) {
    //hovering over floor
    const lines = svg.getElementsByClassName('grid_line');
    svg.insertBefore(highlight, lines[lines.length - 1].nextSibling);
  } else {
    svg.insertBefore(highlight, polygon.nextSibling);
  }
}

//draws a cube starting at the top left
//coords: where the cube is drawn in SVG
//position: position in the grid
function drawCube(position) {
  const coords = positionToSVGCoords(position);
  const svg = document.getElementById('svg');
  const left = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  let leftPoints = coords + ' ' + [coords[0] + SIDE_X, coords[1] + SIDE_Y] + ' ' + 
		[coords[0] + SIDE_X, coords[1] + SIDE_Y + SIDE_LENGTH] + ' ' + [coords[0], coords[1] + SIDE_LENGTH];
  left.setAttribute('id', position + ',left');
  left.setAttribute('class', 'left');
  left.setAttribute('points', leftPoints);
  const right = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  let rightPoints = [coords[0] + SIDE_X * 2, coords[1]] + ' ' + [coords[0] + SIDE_X, coords[1] + SIDE_Y] + ' ' 
		+ [coords[0] + SIDE_X, coords[1] + SIDE_Y + SIDE_LENGTH] + ' ' 
                + [coords[0] + SIDE_X * 2, coords[1] + SIDE_LENGTH];
  right.setAttribute('id', position + ',right');
  right.setAttribute('class', 'right');
  right.setAttribute('points', rightPoints);
  const top = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  let topPoints = coords + ' ' + [coords[0] + SIDE_X, coords[1] - SIDE_Y]
	+ ' ' + [coords[0] + SIDE_X * 2, coords[1]] + ' ' 
	+ [coords[0] + SIDE_X, coords[1] + SIDE_Y];
  top.setAttribute('id', position + ',top');
  top.setAttribute('class', 'top');
  top.setAttribute('points', topPoints);

  //add event listener to draw the highlight
  left.addEventListener('mouseenter', function() {
    const position = this.getAttribute('id').split(',');
    position.pop();
    drawHighlight(position, 'left'); 
  });
  right.addEventListener('mouseenter', function() {
    const position = this.getAttribute('id').split(',');
    position.pop();
    drawHighlight(position, 'right'); 
  });
  top.addEventListener('mouseenter', function() {
    const position = this.getAttribute('id').split(',');
    position.pop();
    drawHighlight(position, 'top'); 
  });


  //need to place in correct spot in svg
  //each z layer should be drawn in order highest to lowest
  //higher x and lower y means closer to viewer
  //which means x-y gives an ordering for cubes per z level
  //basically find the first cube on same z level with x-y greater or equal than new cube and insert it before
  //doing linear search for simplicity, binary would be faster
  const cubes = Array.from(document.getElementsByClassName('left'));
  let polygon = null;
  const pos = [parseInt(position[0]), parseInt(position[1]), parseInt(position[2])];
  for(let i = 0; i < cubes.length; i++) {
    const curCubePos = cubes[i].getAttribute('id').split(',');
    const cur = [parseInt(curCubePos[0]), parseInt(curCubePos[1]), parseInt(curCubePos[2])];
    if(cur[0] > pos[0] || (cur[0] == pos[0] && cur[1] - cur[2] >= pos[1] - pos[2])) {
      polygon = cubes[i];
      break;
    }
  }
  svg.insertBefore(left, polygon);
  svg.insertBefore(right, polygon);
  svg.insertBefore(top, polygon);
  
  //add to grid representation
  while(grid.length - 1 < pos[0]) {
    addGridLayer(grid);
  }
  console.log(grid);
}

function floorMousemove(event) {
  const mouseLocation = convertToGrid(event.pageX, event.pageY);
  //z-level -1 because it is on the floor
  drawHighlight([-1, mouseLocation[0], mouseLocation[1]], 'top');
}

//when leaving a highlight, if it is in the floor still, redraw highlight
function leaveHighlight(event) {
  const floor = document.getElementById('floor');
  if(floor.matches(':hover')) {
    //cursor is still in floor, so move the highlight to mouse location
  } else {
    //delete highlight and readd the event listener for when floor is entered again
    deleteHighlight();
  }
}

//when highlight is clicked, must draw a cube, update the grid
function highlightClicked(event) {
  const position = this.getAttribute('data-zxy').split(',');
  //use highlight orientation to determine where to draw the cube
  const orientation = this.getAttribute('data-orientation');
  if(orientation == 'top') {
    position[0]++;
  } else if(orientation == 'left') {
    position[2]--;
  } else {
    position[1]++;
  }
  drawCube(position);
  //drawing the cube will obscure the highlight, so delete it
  deleteHighlight();
}

//delete the cube when the highlight is clicked
function highlightRightClicked(position){
  //if highlight is clicked when it is on the floor, do nothing
  if(parseInt(position.split(',')[0]) != -1) {
    deleteCube(position);
    deleteHighlight();
  }
}

//delete the highlight
function deleteHighlight() {
  const highlight = document.getElementById('highlight');
  //it should always exist, but just in case
  if(highlight) highlight.remove();
}

//delete a cube at the given position
function deleteCube(position) {
  const svg = document.getElementById('svg');
  svg.removeChild(document.getElementById(position + ',left'));
  svg.removeChild(document.getElementById(position + ',right'));
  svg.removeChild(document.getElementById(position + ',top'));
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

//converts a position on the grid to SVG coords
//assumes that a z level of -1 is the floor, 0 is the top of the first cube layer
function positionToSVGCoords(position) {
  const pos = [parseInt(position[0]), parseInt(position[1]), parseInt(position[2])];
  const x = floorCoords[0][0] + SIDE_X * (pos[1] + pos[2]);
  const y = floorCoords[1][1] - SIDE_Y * (GRID_SIZE - pos[1] + pos[2]) - (SIDE_LENGTH * (pos[0] + 1));
  return [x, y];
}

//returns the distance between two coordinate points
function distance(a, b) {
  return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]));
}

//adds a layer to the 
function addGridLayer(grid) {
  const layer = [];
  for(let i = 0; i < GRID_SIZE; i++) {
    const row = [];
    for(let j = 0; j < GRID_SIZE; j++) {
      row.push(false);
    }
    layer.push(row);
  }
  grid.push(layer);
}

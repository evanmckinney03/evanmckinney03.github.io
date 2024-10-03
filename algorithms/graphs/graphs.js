
const NODE_R = 16;
const WEIGHT_CIRC_R = 12;
const TEXT_BOX_SIZE = 16;
const MAX_WEIGHT = '99';
let selectedNode = -1;
const adjList = [];

window.onload = init;

function init() {
  const svg = document.getElementById('svg');
  //create a rectangle to fill the SVG background
  const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  background.setAttribute('width', svg.getAttribute('width'));
  background.setAttribute('height', svg.getAttribute('height'));
  background.setAttribute('id', 'background');
  svg.append(background);
  let nodeID = 0;
  background.addEventListener('dblclick', function(e) {
    createNode(e.clientX, e.clientY, nodeID++);
  });
  background.addEventListener('click', function(e) {
    deselectNode();
  });

  //check if delete key is pressed
  document.addEventListener('keydown', function(e) {
    if(e.key == 'Delete') {
      const element = document.getElementById('node' + selectedNode);
      if(element) {
	deleteNode(element);
      }
    }
  });
}

function createNode(x, y, nodeID) {  
  //add it to the adjacency list
  adjList.push([]);
  const svg = document.getElementById('svg');
  const circleSVG = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circleSVG.setAttribute('r', NODE_R);
  circleSVG.setAttribute('cx', x);
  circleSVG.setAttribute('cy', y);
  circleSVG.classList.add('node');
  circleSVG.classList.add('nodeUnselected');
  circleSVG.setAttribute('id', 'node' + nodeID);
  circleSVG.addEventListener('mousedown', function(event) {
    const nodeNum = parseInt(this.getAttribute('id').substring('node'.length));
    const line = document.getElementById(
	    'line' + Math.min(selectedNode, nodeNum) + ',' + Math.max(selectedNode, nodeNum));
    if(selectedNode > -1 && selectedNode != nodeNum && !line) {
      createLine(selectedNode, nodeNum);
    } else {
      const deselectUp = function() {
        deselectNode();
        this.removeEventListener('mouseup', deselectUp);
      }
      if(selectedNode != nodeNum) {
	//select this node
        this.classList.add('nodeSelected');
        this.classList.remove('nodeUnselected');
        deselectNode();
        selectedNode = nodeNum;
	//move selected node to the front of SVG
	this.remove();
	svg.appendChild(this);
      } else {
        //the node clicked is selected
        this.addEventListener('mouseup', deselectUp);
      }
      //want to be able to move a node when mouse is down and moving and node is selected 
      //determine offset between mouse and node center
      const xOffset = event.clientX - this.getAttribute('cx');
      const yOffset = event.clientY - this.getAttribute('cy');
      const move = function(e) {
        //stuff to do when mouse down and moving
	updateNodePosition(this, e.clientX - xOffset, e.clientY - yOffset, nodeNum);
	this.removeEventListener('mouseup', deselectUp);
      }
      const up = function(e) {
        this.removeEventListener('mousemove', move);
        this.removeEventListener('mouseup', up);
      }
      this.addEventListener('mousemove', move);
      this.addEventListener('mouseup', up);
    }
  });
  circleSVG.addEventListener('dblclick', function() {
    deleteNode(this);
  });
  svg.append(circleSVG);
}

//update the passed in node to the passed in position
function updateNodePosition(node, x, y, nodeNum) {
  node.setAttribute('cx', x);
  node.setAttribute('cy', y);
  //also need to update line positions
  for(let i = 0; i < adjList[nodeNum].length; i++) {
    updateLine(nodeNum, adjList[nodeNum][i]);
  }
}


function createLine(nodeA, nodeB) { 
  const svg = document.getElementById('svg');
  const nodeASVG = document.getElementById('node' + nodeA);
  const nodeBSVG = document.getElementById('node' + nodeB);
  const lineSVG = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  lineSVG.setAttribute('x1', nodeASVG.getAttribute('cx'));
  lineSVG.setAttribute('y1', nodeASVG.getAttribute('cy'));
  lineSVG.setAttribute('x2', nodeBSVG.getAttribute('cx'));
  lineSVG.setAttribute('y2', nodeBSVG.getAttribute('cy'));
  lineSVG.setAttribute('id', 'line' + Math.min(nodeA, nodeB) + ',' + Math.max(nodeA, nodeB));
  lineSVG.setAttribute('class', 'line');
  //want to insert after the background rectangle so nodes are infront of the line
  const background = document.getElementById('background');
  svg.insertBefore(lineSVG, background.nextSibling);
  //update the adjacency list
  adjList[nodeA].push(nodeB);
  adjList[nodeB].push(nodeA);
  //create a circle in the middle of the line
  const circleSVG = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circleSVG.setAttribute('r', WEIGHT_CIRC_R);
  circleSVG.setAttribute('cx', (parseInt(lineSVG.getAttribute('x1')) + parseInt(lineSVG.getAttribute('x2'))) / 2);
  circleSVG.setAttribute('cy', (parseInt(lineSVG.getAttribute('y1')) + parseInt(lineSVG.getAttribute('y2'))) / 2);
  circleSVG.classList.add('weight');
  circleSVG.setAttribute('id', 'weight' + Math.min(nodeA, nodeB) + ',' + Math.max(nodeA, nodeB));
  circleSVG.addEventListener('dblclick', function() {
    const weightPair = this.getAttribute('id').substring('weight'.length).split(',');
    deleteLine(parseInt(weightPair[0]), parseInt(weightPair[1]));
  });
  //want to insert after the lineSVG so weight is on top of it
  svg.insertBefore(circleSVG, lineSVG.nextSibling);
  //create a textbox in the middle of the circle
  const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
  foreignObject.setAttribute('x', circleSVG.getAttribute('cx') - TEXT_BOX_SIZE / 2);
  foreignObject.setAttribute('y', circleSVG.getAttribute('cy') - TEXT_BOX_SIZE / 2);
  foreignObject.setAttribute('width', TEXT_BOX_SIZE);
  foreignObject.setAttribute('height', TEXT_BOX_SIZE);
  foreignObject.setAttribute('id', 'fo' + Math.min(nodeA, nodeB) + ',' + Math.max(nodeA, nodeB));
  const textBox = document.createElement('input');
  textBox.setAttribute('type', 'number');
  textBox.classList.add('text');
  textBox.setAttribute('value', '0');
  textBox.setAttribute('max', MAX_WEIGHT);
  textBox.setAttribute('min', 0);
  textBox.setAttribute('id', 'text' + Math.min(nodeA, nodeB) + ',' + Math.max(nodeA, nodeB));
  textBox.addEventListener('input', function() {
    if(this.value.length > 2) {
      this.value = this.value.slice(0, 2);
    }
  });
  textBox.addEventListener('dblclick', function() {
    const pair = this.getAttribute('id').substring('text'.length).split(',');
    deleteLine(pair[0], pair[1]);
  });
  foreignObject.appendChild(textBox);
  svg.insertBefore(foreignObject, circleSVG.nextSibling);
}

//update the line given by the parameters
function updateLine(nodeA, nodeB) {
  const line = document.getElementById('line' + Math.min(nodeA, nodeB) + ',' + Math.max(nodeA, nodeB));
  const nodeASVG = document.getElementById('node' + nodeA);
  const nodeBSVG = document.getElementById('node' + nodeB);
  const x1 = nodeASVG.getAttribute('cx');
  const y1 = nodeASVG.getAttribute('cy');
  const x2 = nodeBSVG.getAttribute('cx');
  const y2 = nodeBSVG.getAttribute('cy');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  //also need to update weight
  const weight = document.getElementById('weight' + Math.min(nodeA, nodeB) + ',' + Math.max(nodeA, nodeB));
  weight.setAttribute('cx', (parseInt(x1) + parseInt(x2)) / 2);
  weight.setAttribute('cy', (parseInt(y1) + parseInt(y2)) / 2);
  //also need to update the textbox
  const foreignObject = document.getElementById('fo' + Math.min(nodeA, nodeB) + ',' + Math.max(nodeA, nodeB));
  foreignObject.setAttribute('x', (parseInt(x1) + parseInt(x2)) / 2 - TEXT_BOX_SIZE / 2);
  foreignObject.setAttribute('y', (parseInt(y1) + parseInt(y2)) / 2 - TEXT_BOX_SIZE / 2);
}

//deselects the node in the selected global var
function deselectNode() {
  if(selectedNode > -1) {
    const node = document.getElementById('node' + selectedNode);
    node.classList.add('nodeUnselected');
    node.classList.remove('nodeSelected');
    selectedNode = -1;
  }
}

//deletes the given node element
function deleteNode(node) {
  //update adjacency list
  const nodeNum = parseInt(node.getAttribute('id').substring('node'.length));
  //need to remove everything in the adjList[nodeNum]
  while(adjList[nodeNum].length > 0) {
    deleteLine(nodeNum, adjList[nodeNum][0]);
  }
  node.remove();
  selectedNode = -1;
}

//deletes the given line determined by the two nodes it connects
//updates adjList
function deleteLine(nodeA, nodeB) {
  const line = document.getElementById('line' + Math.min(nodeA, nodeB) + ',' + Math.max(nodeA, nodeB));
  line.remove();
  const weight = document.getElementById('weight' + Math.min(nodeA, nodeB) + ',' + Math.max(nodeA, nodeB));
  weight.remove();
  const foreignObject = document.getElementById('fo' + Math.min(nodeA, nodeB) + ',' + Math.max(nodeA, nodeB));
  foreignObject.remove();
  //update adjList
  adjList[nodeA].splice(adjList[nodeA].indexOf(nodeB), 1);
  adjList[nodeB].splice(adjList[nodeB].indexOf(nodeA), 1);
}

const SQ_WIDTH = 35;
const BORDER_WIDTH = 2;
const START_OFFSET_X = 10;
//height of the top bar
const TOP_HEIGHT = 40;
const START_OFFSET_Y = START_OFFSET_X * 2 + TOP_HEIGHT;
//amount the top text is inset/border size
const TEXT_IN = 2;
//used for positioning the mouth of the smiley
const MOUTH_X_DISTANCE = TOP_HEIGHT / 4 + 1;
const MOUTH_Y_DISTANCE = TOP_HEIGHT / 2 + 6;

//used for mousedown event to calculate if clicking within the grid
const MARGIN = 8;

let timer;

window.onload = init;

function init() {
  let easyButton = document.getElementById('easy');
  let intermediateButton = document.getElementById('intermediate');
  let expertButton = document.getElementById('expert');
  let board_size = [9, 9];
  let num_mines = 10;

  gameInit(board_size, num_mines);

  easyButton.addEventListener('click', () => {
    board_size = [9, 9];
    num_mines = 10;
    gameInit(board_size, num_mines);
  });
  intermediateButton.addEventListener('click', () => {
    board_size = [16, 16];
    num_mines = 40;
    gameInit(board_size, num_mines);
  });
  expertButton.addEventListener('click', () => {
    board_size = [30, 16];
    num_mines = 99;
    gameInit(board_size, num_mines);
  });

  onmousedown = (event) => {
    let grid_border = [[START_OFFSET_X, START_OFFSET_Y], 
	    [START_OFFSET_X + board_size[0] * SQ_WIDTH, START_OFFSET_Y + board_size[1] * SQ_WIDTH]];
    let click = [event.pageX - MARGIN, event.pageY - MARGIN];
    //checks to see if click was within grid
    if(click[0] >= grid_border[0][0] && click[0] < grid_border[1][0] 
	    && click[1] >= grid_border[0][1] && click[1] < grid_border[1][1]) {
      smileyMouthOpen();
    }
  }
  onmouseup = (event) => {
    smileyNeutral();
  }
}

//does everything needed to start a game based on board_size and num_mines
function gameInit(board_size, num_mines) {
  let gameBoard = createArray(board_size, num_mines);
  let numCleared = 0;
  if(timer != null) stopTimer();
  svg = document.getElementById('svg');
  //remove everything from the svg, including the smiley face because it has to move
  svg.replaceChildren();
  populateSVG(gameBoard, numCleared, num_mines);
  addSmileyFace(svg, board_size, num_mines);
}
//does the exact same as gameInit, but does not draw the smiley face
//used when the smiley is clicked because otherwise creates loop where smiley
//must add itself to the board
function smileyGameInit(board_size, num_mines) {
  let gameBoard = createArray(board_size, num_mines);
  let numCleared = 0;
  if(timer != null) stopTimer();
  //remove everything but the smiley face because it does not have to move
  let svg = document.getElementById('svg');
  let children = svg.children;
  //all parts of the smiley have 'smiley' in the id
  let smileyParts = []
  for(let i = 0; i < children.length; i++) {
    if(children[i].getAttribute('id').includes('smiley')) {
      smileyParts.push(children[i]);
    }
  }
  svg.replaceChildren();
  for(let i = 0; i < smileyParts.length; i++) {
    svg.appendChild(smileyParts[i]);
  }
  populateSVG(gameBoard, numCleared, num_mines);
}

//initializes gameBoard based on board_size and num_mines
function createArray(board_size, num_mines) {
  let gameBoard = [];
  for(let i = 0; i < board_size[0]; i++) {
    gameBoard.push([]);
  }

  //fill up first num_mines spots with an X
  for(let i = 0; i < num_mines; i++) {
    gameBoard[Math.floor(i / board_size[1])].push('X');
  }
  //fill the rest with 0s for now
  for(let i = num_mines; i < board_size[0] * board_size[1]; i++) {
    gameBoard[Math.floor(i / board_size[1])].push('0');
  }
  shuffleGameBoard(gameBoard);
  calculateAdjacencies(gameBoard);
  return gameBoard;
}

//shuffles the gameBoard so that mines are in a random spot, fisher yates
function shuffleGameBoard(gameBoard) {
  for(let i = gameBoard.length * gameBoard[0].length - 1; i >= 0; i--) {
    let randNum = Math.floor(Math.random() * i);
    //swap i with the random number
    let temp = gameBoard[Math.floor(i / gameBoard[0].length)][i % gameBoard[0].length];
    gameBoard[Math.floor(i / gameBoard[0].length)][i % gameBoard[0].length] 
		  = gameBoard[Math.floor(randNum / gameBoard[0].length)][randNum % gameBoard[0].length];
    gameBoard[Math.floor(randNum / gameBoard[0].length)][randNum % gameBoard[0].length] = temp;
  }
}

//calculates how many mines are around each square
function calculateAdjacencies(gameBoard) {
  for(let i = 0; i < gameBoard.length; i++) {
    for(let j = 0; j < gameBoard[0].length; j++) {
      //if it is a mine, continue
      if(gameBoard[i][j] == 'X') continue;
      //check the 8 adjacent squares
      let num = 0;
      if(i - 1 >= 0 && gameBoard[i - 1][j - 1] == 'X') num++;
      if(i - 1 >= 0 && gameBoard[i - 1][j] == 'X') num++;
      if(i - 1 >= 0 && gameBoard[i - 1][j + 1] == 'X') num++;
      if(gameBoard[i][j - 1] == 'X') num++;
      if(gameBoard[i][j + 1] == 'X') num++;
      if(i + 1 < gameBoard.length && gameBoard[i + 1][j - 1] == 'X') num++;
      if(i + 1 < gameBoard.length && gameBoard[i + 1][j] == 'X') num++;
      if(i + 1 < gameBoard.length && gameBoard[i + 1][j + 1] == 'X') num++;
      gameBoard[i][j] = num;
    }
  }
}

//creates grid of squares based on board_size, adds the text and the stuff at the top
//except for the smiley face
function populateSVG(gameBoard, numCleared, num_mines) {
  for(let i = 0; i < gameBoard.length; i++) {
    for(let j = 0; j < gameBoard[0].length; j++) {
      let square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      square.setAttribute('width', SQ_WIDTH);
      square.setAttribute('height', SQ_WIDTH);
      square.setAttribute('x', i * SQ_WIDTH + START_OFFSET_X);
      square.setAttribute('y', j * SQ_WIDTH + START_OFFSET_Y);
      square.setAttribute('id', i + ',' + j + ',square');
      square.setAttribute('class', 'newSquare');
      square.addEventListener('click', function () {
	if(numCleared == 0) {
          rerollUntilGoodStart(this.id, gameBoard, num_mines);
	  startTimer();
	}
        numCleared += reveal(this.id, gameBoard);
	if(numCleared == gameBoard.length * gameBoard[0].length - num_mines) {
	  win(gameBoard);
	}
      });
      square.addEventListener('contextmenu', function(event) {
        event.preventDefault();
	let isWon = numCleared == gameBoard.length * gameBoard[0].length - num_mines;
	mark(this.id, isWon);
      })
      svg.appendChild(square);
      let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('class', 'text');
      text.setAttribute('x', i * SQ_WIDTH + Math.floor(SQ_WIDTH / 2) + START_OFFSET_X);
      text.setAttribute('y', j * SQ_WIDTH + Math.floor(SQ_WIDTH / 2) + START_OFFSET_Y);
      text.setAttribute('id', i + ',' + j + ',text');
      svg.appendChild(text);
    }
  }
  drawBorders(gameBoard, svg);
  //adjust svg size
  svg.setAttribute('width', START_OFFSET_X * 2 + SQ_WIDTH * gameBoard.length);
  svg.setAttribute('height', START_OFFSET_Y + START_OFFSET_X + SQ_WIDTH * gameBoard[0].length);
  addTimer(svg, gameBoard.length);
  addMineCounter(svg, num_mines);
}
//draw borders based on the size of the gameBoard
function drawBorders(gameBoard, svg) {
  let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  let path_d = '';
  //vertical lines
  for(let i = 0; i < gameBoard.length + 1; i++) {
    path_d += ' M ' + (START_OFFSET_X + SQ_WIDTH * i) + ' ' + START_OFFSET_Y;
    path_d += ' v ' + (gameBoard[0].length * SQ_WIDTH);
  }
  //horizontal lines
  for(let i = 0; i < gameBoard[0].length + 1; i++) {
    path_d += ' M ' + START_OFFSET_X + ' ' + (START_OFFSET_Y + SQ_WIDTH * i);
    path_d += ' h ' + (gameBoard.length * SQ_WIDTH);
  }

  path.setAttribute('class', 'border');
  path.setAttribute('id', 'border');
  path.setAttribute('d', path_d); 
  svg.appendChild(path);
}

//adds the timer in the top left
function addTimer(svg, width) {
  //amount text is inside the box
  let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('width', SQ_WIDTH * 2);
  rect.setAttribute('height', TOP_HEIGHT);
  rect.setAttribute('x', START_OFFSET_X + width * SQ_WIDTH - parseInt(rect.getAttribute('width')));
  rect.setAttribute('y', START_OFFSET_X);
  rect.setAttribute('id', 'timerRect');
  rect.setAttribute('class', 'topRect');
  let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', parseInt(rect.getAttribute('x')) + TEXT_IN);
  text.setAttribute('y', parseInt(rect.getAttribute('y')) + TOP_HEIGHT - TEXT_IN * 4);
  text.setAttribute('class', 'topText');
  text.setAttribute('id', 'timerText');
  text.setAttribute('textLength', rect.getAttribute('width') - TEXT_IN * 2);
  text.setAttribute('font-size', TOP_HEIGHT);
  text.innerHTML = '000';
  svg.appendChild(rect);
  svg.appendChild(text);
}

//starts the timer in the top left
function startTimer() {
  timer = setInterval(incrementTimer, 1000);
}

//stops the timer in the top left
function stopTimer() {
  clearInterval(timer);
}

//increases the timer by 1, max of 999
function incrementTimer() {
  let text = document.getElementById('timerText');
  let time = parseInt(text.innerHTML);
  time = Math.min(time + 1, 999);
  time = '00' + time;
  time = time.substring(time.length - 3);
  text.innerHTML = time;
}

function addMineCounter(svg, num_mines) {
  let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('width', SQ_WIDTH * 2);
  rect.setAttribute('height', TOP_HEIGHT);
  rect.setAttribute('x', START_OFFSET_X);
  rect.setAttribute('y', START_OFFSET_X);
  rect.setAttribute('id', 'mineRect');
  rect.setAttribute('class', 'topRect');
  let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', parseInt(rect.getAttribute('x')) + TEXT_IN);
  text.setAttribute('y', parseInt(rect.getAttribute('y')) + TOP_HEIGHT - TEXT_IN * 4);
  text.setAttribute('class', 'topText');
  text.setAttribute('id', 'mineText');
  text.setAttribute('textLength', rect.getAttribute('width') - TEXT_IN * 2);
  text.setAttribute('font-size', TOP_HEIGHT);
  let mineText = '00' + num_mines;
  mineText = mineText.substring(mineText.length - 3);
  text.innerHTML = mineText;
  svg.appendChild(rect);
  svg.appendChild(text);
}

//adds the passed in value to the mine counter
function editMineCounter(value) {
  let mineCounter = document.getElementById('mineText');
  let text = mineCounter.innerHTML;
  text = parseInt(text) + value;
  if(text >= 0) {
    text = '00' + text;
    text = text.substring(text.length - 3);
  } 
  mineCounter.innerHTML = text;
}

//adds the smiley face into the middle of the top part
function addSmileyFace(svg, board_size, num_mines) {
  //put it into the middle, assumes svg is the right size
  let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('height', TOP_HEIGHT);
  rect.setAttribute('width', TOP_HEIGHT);
  rect.setAttribute('x', svg.getAttribute('width') / 2 - TOP_HEIGHT / 2);
  rect.setAttribute('y', START_OFFSET_X);
  rect.setAttribute('id', 'smileySquare');
  rect.setAttribute('class', 'topRect');
  svg.appendChild(rect);
  //create circle
  let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', parseInt(rect.getAttribute('x')) + parseInt(rect.getAttribute('width')) / 2);  
  circle.setAttribute('cy', parseInt(rect.getAttribute('y')) + parseInt(rect.getAttribute('height')) / 2);  
  circle.setAttribute('r', (parseInt(rect.getAttribute('width')) - TEXT_IN * 4) / 2);
  circle.setAttribute('class', 'smileyCircle');
  circle.setAttribute('id', 'smileyCircle');
  circle.addEventListener('click', () => smileyGameInit(board_size, num_mines));
  svg.append(circle);
  //use text as the eyes
  let eye1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  let eye2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  let eyeDistance = TOP_HEIGHT / 2 - 5;
  eye1.setAttribute('x', parseInt(rect.getAttribute('x')) + eyeDistance);
  eye1.setAttribute('y', parseInt(rect.getAttribute('y')) + eyeDistance + 1);
  eye1.setAttribute('id', 'smileyEye1');
  eye1.setAttribute('class', 'eye');
  eye1.innerHTML = '\u2022';
  eye2.setAttribute('x', parseInt(rect.getAttribute('x')) - eyeDistance + TOP_HEIGHT);
  eye2.setAttribute('y', parseInt(rect.getAttribute('y')) + eyeDistance + 1);
  eye2.setAttribute('id', 'smileyEye2');
  eye2.setAttribute('class', 'eye');
  eye2.innerHTML = '\u2022';
  svg.appendChild(eye1);
  svg.appendChild(eye2);
  smileyNeutral();
}

function smileyNeutral() {
  let eye1 = document.getElementById('smileyEye1');
  let eye2 = document.getElementById('smileyEye2');
  eye1.innerHTML = '\u2022';
  eye2.innerHTML = '\u2022';
  eye1.setAttribute('font-size', 16);
  eye2.setAttribute('font-size', 16);
  let rect = document.getElementById('smileySquare');
  let svg = document.getElementById('svg');
  let mouth = document.getElementById('smileyMouth');
  if(mouth != null) mouth.parentNode.removeChild(mouth);
  mouth = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  mouth.setAttribute('id', 'smileyMouth');
  mouth.setAttribute('x1', parseInt(rect.getAttribute('x')) + MOUTH_X_DISTANCE);
  mouth.setAttribute('y1', parseInt(rect.getAttribute('y')) + MOUTH_Y_DISTANCE);
  mouth.setAttribute('x2', parseInt(rect.getAttribute('x')) + TOP_HEIGHT - MOUTH_X_DISTANCE);
  mouth.setAttribute('y2', parseInt(mouth.getAttribute('y1')));
  mouth.setAttribute('class', 'mouth');
  svg.appendChild(mouth);
}

function smileyMouthOpen() {
  let rect = document.getElementById('smileySquare');
  let svg = document.getElementById('svg');
  let mouth = document.getElementById('smileyMouth');
  if(mouth != null) mouth.parentNode.removeChild(mouth);
  mouth = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
  mouth.setAttribute('id', 'smileyMouth');
  mouth.setAttribute('cx', parseInt(rect.getAttribute('x')) + TOP_HEIGHT / 2);
  mouth.setAttribute('cy', parseInt(rect.getAttribute('y')) + MOUTH_Y_DISTANCE);
  mouth.setAttribute('rx', 6);
  mouth.setAttribute('ry', 3);
  mouth.setAttribute('class', 'mouth');
  svg.appendChild(mouth);
}

function smileyHappy() { 
  let rect = document.getElementById('smileySquare');
  let svg = document.getElementById('svg');
  let mouth = document.getElementById('smileyMouth');
  if(mouth != null) mouth.parentNode.removeChild(mouth);
  mouth = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  mouth.setAttribute('id', 'smileyMouth');
  let path_d = 'M ' + (parseInt(rect.getAttribute('x')) + MOUTH_X_DISTANCE) + ' ' 
		+ (parseInt(rect.getAttribute('y')) + MOUTH_Y_DISTANCE);

  path_d += ' Q ' + (parseInt(rect.getAttribute('x')) + TOP_HEIGHT / 2) + ' ' 
		+ (parseInt(rect.getAttribute('y')) + MOUTH_Y_DISTANCE + 7);
  path_d += ' ' + (parseInt(rect.getAttribute('x')) + TOP_HEIGHT - MOUTH_X_DISTANCE) + ' ' 
		+ (parseInt(rect.getAttribute('y')) + MOUTH_Y_DISTANCE);
  mouth.setAttribute('d', path_d);
  mouth.setAttribute('class', 'mouth');
  svg.appendChild(mouth);
}

function smileyDie() {
  let eye1 = document.getElementById('smileyEye1');
  let eye2 = document.getElementById('smileyEye2');
  eye1.setAttribute('font-size', 12);
  eye2.setAttribute('font-size', 12);
  eye1.innerHTML = 'x';
  eye2.innerHTML = 'x';
  smileyMouthOpen();
}

//recreates the arrays until the square at id has a 0
function rerollUntilGoodStart(id, gameBoard, num_mines) {
  let id_split = id.split(',');
  let newGameBoard = gameBoard;
  while(newGameBoard[id_split[0]][id_split[1]] != '0') {
    newGameBoard = createArray([gameBoard.length, gameBoard[0].length], num_mines);
  }
  //copy newGameBoard into gameBoard if newGameBoard was made
  for(let i = 0; i < gameBoard.length; i++) {
    gameBoard[i] = newGameBoard[i];
  } 
}

//reveals the square and returns the number of squares revealed
//if force is true, then anything will be revealed
function reveal(id, gameBoard) {
  let id_split = id.split(',');
  let id_x = parseInt(id_split[0]);
  let id_y = parseInt(id_split[1]);
  if(id_x < 0 || id_x >= gameBoard.length || id_y < 0 || id_y >= gameBoard[0].length) return 0;
  let numCleared = 0;
  let square = document.getElementById(id_split[0] + ',' + id_split[1] + ',square');
  let text = document.getElementById(id_split[0] + ',' + id_split[1] + ',text');
  //only reveal blank squares or question marks
  if(text.innerHTML.length == 0 || text.innerHTML == '?') {
    reveal_edit(square, text, gameBoard[id_split[0]][id_split[1]]);
    numCleared++;
    if(gameBoard[id_split[0]][id_split[1]] == 'X') {
      loss(gameBoard);
    }
    if(gameBoard[id_split[0]][id_split[1]] == '0') {
      //recursively reveal other squares
      for(let i = -1; i <= 1; i++) {
        for(let j = -1; j <= 1; j++) {
          numCleared += reveal((id_x + i) + ',' + (id_y + j), gameBoard);
	}
      }
    }
  }
  return numCleared;
}

//changes the square color and the text to the newText string
function reveal_edit(square, text, newText){
  square.setAttribute('class', 'blankSquare');
  text_edit(text, newText);
}
//changes the text color
function text_edit(text, newText) {
  if(newText == '0') {
    text.innerHTML = ' ';
  } else {
    text.innerHTML = newText;
    if(newText == '!' || newText == '?' || newText.length == 0) {
      text.setAttribute('class', 'text textexclam');
    } else {
      text.setAttribute('class', 'text text' + newText);
    }
  }
}


//marks the square as either a mine, question mark, or back to empty
function mark(id, disable) {
  if(disable) return;
  let square = document.getElementById(id);
  let id_split = id.split(',');
  let text = document.getElementById(id_split[0] + ',' + id_split[1] + ',text');
  if(text.innerHTML.length == 0) {
    text_edit(text, '!');
    editMineCounter(-1);
  } else if(text.innerHTML == '!') {
    text_edit(text, '?');
    editMineCounter(1);
  } else if(text.innerHTML == '?') {
    text_edit(text, '');
  }
}

//clears the field
function loss(gameBoard) {
  smileyDie();
  stopTimer();
  for(let i = 0; i < gameBoard.length; i++) {
    for(let j = 0; j < gameBoard[0].length; j++) {
      let square = document.getElementById(i + ',' + j + ',square');
      let text = document.getElementById(i + ',' + j + ',text');
      reveal_edit(square, text, gameBoard[i][j]);
    }
  }
}

//marks all the mines with exclamation points
function win(gameBoard) { 
  stopTimer();
  smileyHappy();
  document.getElementById('mineText').innerHTML = '000';
  for(let i = 0; i < gameBoard.length; i++) {
    for(let j = 0; j < gameBoard[0].length; j++) {
      let square = document.getElementById(i + ',' + j + ',square');
      let text = document.getElementById(i + ',' + j + ',text');
      if(text.innerHTML.length == 0 || text.innerHTML == '!' || text.innerHTML == '?') {
        text_edit(text, '!');
      }
    }
  }
}


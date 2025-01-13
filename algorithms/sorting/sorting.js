let size = 0;
const schedule = [];
let position = 0;

window.onload = init;

function init() {
  const addButton = document.getElementById('add');
  const removeButton = document.getElementById('remove');
  const nextButton = document.getElementById('next');
  const previousButton = document.getElementById('previous');
  const resetButton = document.getElementById('reset');
  const startButton = document.getElementById('start');

  addButton.addEventListener('click', addElement);
  removeButton.addEventListener('click', removeElement);
  nextButton.addEventListener('click', nextClicked);
  previousButton.addEventListener('click', previousClicked);
  resetButton.addEventListener('click', resetClicked);
  startButton.addEventListener('click', startClicked);
  addElement();

  //previous and reset button starts disabled
  previousButton.disabled = true;
  resetButton.disabled = true;
}

//an object that represents a step in the algorithm sequence
function Step(func, arg1, arg2){
  this.func = func;
  this.arg1 = arg1;
  this.arg2 = arg2;
  this.setFunction = function(func) {
    this.func = func;
  }
  this.run = async function(speed) {
    await func(arg1, arg2, speed);
  }
}

const algs = [bubbleSchedule, insertionSchedule];
//populates the schedule with steps of animation
function makeSchedule() {
  //get values from the array
  const arrayContainer = document.getElementById('array-container').children;
  const array = [];
  for(let i = 0; i < arrayContainer.length; i++) {
    array.push(parseInt(arrayContainer[i].firstElementChild.value));
  }
  //use drop down to select algo, for now just bubble
  const menu = document.getElementById('algs');
  algs[menu.value](array);
}

//adds to schedule the steps for a bubble sort
//modifies the array variable, but not what is shown on screen
function bubbleSchedule(array) {
  //bubble sort
  for(let i = 0; i < array.length; i++) {
    for(let j = 0; j < array.length - i - 1; j++) {
      //comparison
      schedule.push(new Step(compareAnimation, j, j + 1));
      if(array[j] > array[j + 1]) {
        schedule.push(new Step(swapAnimation, j, j + 1));
	//swap
        const temp = array[j];
	array[j] = array[j + 1];
	array[j + 1] = temp;
      }
    }
  }
}

//adds to schedule the steps for a bubble sort
function insertionSchedule(array) {
  
}

//what to run when the next button is clicked
//disable the buttons while running, then play the next animation
async function nextClicked() {
  const previousButton = document.getElementById('previous');
  this.disabled = true;
  previousButton.disabled = true;
  if(schedule.length == 0) arrayInit();
  await playStep(position++, 1500);
  if(position != schedule.length) {
    this.disabled = false;
  }
  previousButton.disabled = false;
}

//what to run when the previous button is clicked
//disable buttons while running, then play previous animation
async function previousClicked() {
  const nextButton = document.getElementById('next');
  this.disabled = true;
  nextButton.disabled = true;
  await playStep(--position, 1500);
  if(position != 0) {
    this.disabled = false;
  }
  nextButton.disabled = false;
}

//what to run when the reset button is clicked
//clear the schedule, disable previous and reset button, and enable add/remove and next buttons
function resetClicked() {
  this.disabled = true;
  document.getElementById('previous').disabled = true;
  document.getElementById('add').disabled = false;
  document.getElementById('remove').disabled = false;
  document.getElementById('next').disabled = false;
  schedule.length = 0;
  position = 0;
  unlock();
}

let intervalId;
//what to run when the start button is clicked
//make it say start/stop, and add/remove interval
async function startClicked() {
  const nextButton = document.getElementById('next');
  const previousButton = document.getElementById('previous');
  if(this.value == 'Start') {
    this.value = 'Stop';
    if(schedule.length == 0) arrayInit();
    nextButton.disabled = true;
    previousButton.disabled = true;
    playStep(position++, 1500);
    if(!intervalId) {
      intervalId = setInterval(() => {
        if(position >= schedule.length) {
          stopPlaying();
          resetClicked();
        } else {
          playStep(position++, 1500);
        }
      }, 2000);
    }
  } else {
    stopPlaying();
  }
}

//stop the automatic playing of the sorting
function stopPlaying() {
  document.getElementById('start').value = 'Start';
  clearInterval(intervalId);
  intervalId = null;
  if(position != 0) document.getElementById('previous').disabled = false;
  if(position != schedule.length) document.getElementById('next').disabled = false;
}

async function playStep(stepNum, speed) {
  await schedule[stepNum].run(speed);
}

//will disable the add/remove buttons, enable the reset button
//also generates the schedule and locks the array
function arrayInit() {
  makeSchedule();
  lock();
  document.getElementById('add').disabled = true;
  document.getElementById('remove').disabled = true;
  document.getElementById('reset').disabled = false;
}

//adds an element to the array
function addElement() {
  const arrayContainer = document.getElementById('array-container');
  const newElement = document.createElement('div');
  newElement.setAttribute('id', 'div' + size);
  const input = document.createElement('input');
  input.setAttribute('class', 'text');
  //using input type=number adds arrows to the input box
  input.setAttribute('type', 'text');
  input.setAttribute('inputmode', 'numeric');
  input.setAttribute('value', size);
  input.setAttribute('id', 'array' + size);
  input.addEventListener('input', function() {
    //max value should be 999 and make sure values are only numeric
    if(this.value.length > 3) {
      this.value = this.value.slice(0, 3);
    } else {
      //check if a number was added
      for(let i = 0; i < this.value.length; i++) {
        if(!'1234567890'.includes(this.value[i])) {
          this.value = this.value.slice(0, i) + this.value.slice(i + 1);
	}
      }
    }
  });
  newElement.appendChild(input);
  //arrayContainer.insertBefore(newElement, arrayContainer.firstElementChild);
  arrayContainer.appendChild(newElement);
  size++;
}

//removes an element from the array
function removeElement() {
  //ensure there is at least one element in the array
  if(size > 1) {
    const arrayContainer = document.getElementById('array-container');
    arrayContainer.removeChild(arrayContainer.lastElementChild);
    size--;
  }
}

//swaps two elements, arguments should just be numbers of elements to swap
async function swapAnimation(e1, e2, speed) {
  //speed of each animation step
  const elem1 = document.getElementById('div' + Math.min(e1, e2));
  const elem2 = document.getElementById('div' + Math.max(e1, e2));
  const elemHeight = elem1.getBoundingClientRect().height;
  const elemWidth = elem1.getBoundingClientRect().width;
  //every transition takes a total of speed ms
  elem1.style.transition = `transform ${speed/3}ms`;
  elem2.style.transition = `transform ${speed/3}ms`;
  const distance = Math.abs(e1 - e2);
  //move elem1 and elem 2 up, then wait for animation to finish
  let elem1Style = `translateY(-${elemHeight * 2}px)`;
  let elem2Style = `translateY(-${elemHeight}px)`;
  elem1.style.transform = elem1Style;
  elem2.style.transform = elem2Style;
  await sleep(speed / 3);
  //move elem1 and elem2 left/right and wait for animation
  elem1Style += ` translateX(${distance * elemWidth}px)`;
  elem2Style += ` translateX(-${distance * elemWidth}px)`;
  elem1.style.transform = elem1Style;
  elem2.style.transform = elem2Style;
  await sleep(speed / 3);
  //move elem1 and elem2 down and wait
  elem1.style.transform = elem1Style.split(' ')[1];
  elem2.style.transform = elem2Style.split(' ')[1];
  await sleep(speed / 3);
  //remove the styles and swap the values
  elem1.removeAttribute('style');
  elem2.removeAttribute('style');
  //swap
  const temp = elem1.firstElementChild.value;
  elem1.firstElementChild.value = elem2.firstElementChild.value;
  elem2.firstElementChild.value = temp;
}

//compares two elements in an animation
//paramters should be integers
async function compareAnimation(e1, e2, speed) {
  const elem1 = document.getElementById('div' + e1);
  const elem2 = document.getElementById('div' + e2);
  const larger = parseInt(elem1.firstElementChild.value) > parseInt(elem2.firstElementChild.value) ? elem1 : elem2;
  //highlight the elements
  highlight(e1);
  highlight(e2);
  //wait 2 * speed / 5 ms so that total animation time is speed length
  await sleep(2 * speed / 5);
  //make the larger one bigger for a moment
  larger.style.transition = `transform ${speed / 5}ms`;
  larger.style.transform = 'scale(1.1, 1.1)';
  await sleep(speed / 5);
  larger.style.transform = 'scale(1, 1)';
  await sleep(2 * speed / 5);
  unhighlight(e1);
  unhighlight(e2);
  larger.removeAttribute('style');
}


//highlights an element
//e should be an integer
function highlight(e) {
  document.getElementById('div' + e).classList.add('highlight');
}

//unhighlights an element
//e should be an integer
function unhighlight(e) {
  document.getElementById('div' + e).classList.remove('highlight');
}

//lock array
function lock() {
  const array = document.getElementById('array-container').children;
  for(let i = 0; i < array.length; i++) {
    array[i].firstElementChild.readOnly = true;
  }
}

//unlock array
function unlock() {
  const array = document.getElementById('array-container').children;
  for(let i = 0; i < array.length; i++) {
    array[i].firstElementChild.readOnly = false;
  }
}

//sleeps for given amount of milliseconds, used in animations
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


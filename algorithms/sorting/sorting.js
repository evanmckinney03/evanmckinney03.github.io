let size = 0;

window.onload = init;

function init() {
  const addButton = document.getElementById('add');
  const removeButton = document.getElementById('remove');
  addButton.addEventListener('click', addElement);
  removeButton.addEventListener('click', removeElement);
  addElement();
}

//an object that represents a step in the algorithm sequence
function Step(func, arg1, arg2){
  this.func = func;
  this.arg1 = arg1;
  this.arg2 = arg2;
  this.setFunction = function(func) {
    this.func = func;
  }
  this.run = function() {
    func(arg1, arg2);
  }
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
  arrayContainer.appendChild(newElement);
  size++;
}

//removes an element from the array
function removeElement() {
  //ensure there is at least one element in the array
  if(size > 1) {
    const arrayContainer = document.getElementById('array-container');
    arrayContainer.removeChild(arrayContainer.lastChild);
    size--;
  }
}

//swaps two elements, arguments should just be numbers of elements to swap
async function swapAnimation(e1, e2) {
  //speed of each animation step
  const speed = 1000;
  const elem1 = document.getElementById('div' + Math.min(e1, e2));
  const elem2 = document.getElementById('div' + Math.max(e1, e2));
  const elemHeight = elem1.getBoundingClientRect().height;
  const elemWidth = elem1.getBoundingClientRect().width;
  //every transition takes 1 second
  elem1.style.transition = `transform ${speed}ms`;
  elem2.style.transition = `transform ${speed}ms`;
  const distance = Math.abs(e1 - e2);
  //move elem1 and elem 2 up, then wait for animation to finish
  let elem1Style = `translateY(-${elemHeight * 2}px)`;
  let elem2Style = `translateY(-${elemHeight}px)`;
  elem1.style.transform = elem1Style;
  elem2.style.transform = elem2Style;
  await sleep(speed);
  //move elem1 and elem2 left/right and wait for animation
  elem1Style += ` translateX(${distance * elemWidth}px)`;
  elem2Style += ` translateX(-${distance * elemWidth}px)`;
  elem1.style.transform = elem1Style;
  elem2.style.transform = elem2Style;
  await sleep(speed);
  //move elem1 and elem2 down and wait
  elem1.style.transform = elem1Style.split(' ')[1];
  elem2.style.transform = elem2Style.split(' ')[1];
  await sleep(speed);
  //remove the styles and swap the values
  elem1.removeAttribute('style');
  elem2.removeAttribute('style');
  //swap
  const temp = elem1.firstElementChild.value;
  elem1.firstElementChild.value = elem2.firstElementChild.value;
  elem2.firstElementChild.value = temp;
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


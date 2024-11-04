
window.onload = init;

function init() {
  document.addEventListener('keydown', function(e) {
    if(e.key == 'ArrowUp') {
      addElement();
    }
  });
  addElement();
}

function addElement() {
  const arrayContainer = document.getElementById('array-container');
  const newElement = document.createElement('div');
  const input = document.createElement('input');
  input.setAttribute('class', 'text');
  //using input type=number adds arrows to the input box
  input.setAttribute('type', 'text');
  input.setAttribute('inputmode', 'numeric');
  input.setAttribute('value', '0');
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
}

function removeElement() {

}

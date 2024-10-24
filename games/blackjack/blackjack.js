const SUITS = ['c', 'd', 'h', 's'];
const VALUES = ['a', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'j', 'q', 'k'];
const EXT = '.svg';
const BACK_SRC = 'cards/back' + EXT;
const DECK = [];
for(let i = 0; i < VALUES.length; i++) {
  for(let j = 0; j < SUITS.length; j++) {
    DECK.push(new Card(VALUES[i], SUITS[j]));
  }
}

const shuffledDeck = [];
deepCopy(shuffledDeck, DECK);
shuffle(shuffledDeck);

window.onload = init;

function init() {
  console.log(shuffledDeck);
  
}

function Card(value, suit) {
  this.value = value;
  this.suit = suit;
  this.revealed = false;
  this.src = value + suit + EXT;
}

//shuffles the deck using fisher yates
function shuffle(deck) {
  for(let i = deck.length; i > 0; i--) {
    //random number 0 to i
    const rand = Math.floor(Math.random() * i);
    //swap i-1 and random number
    const temp = deck[rand];
    deck[rand] = deck[i - 1];
    deck[i - 1] = temp;
  }
}

//creates a deep copy of oldArray into newArray
function deepCopy(newArray, oldArray) {
  for(let i = 0; i < oldArray.length; i++) {
    newArray.push(oldArray[i]);
  }
}

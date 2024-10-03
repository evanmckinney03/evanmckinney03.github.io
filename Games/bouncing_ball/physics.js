const TIME_INTERVAL = 5;
const G = 90;
const MARGIN = 8;
//value 0-1 that controls the velocity that the ball bounces back with
const BOUNCE = 0.6;
//value that determines how fast the ball moves when dragged
const MOUSE_MULT = 20;

let isMouseDown = false;
let mouse_x = 0;
let mouse_y = 0;
let prev_mouse_x = 0;
let prev_mouse_y = 0;

window.onload = init;
onmouseup = () => {isMouseDown = false;};
onmousemove = function(e){
  prev_mouse_x = mouse_x;
  prev_mouse_y = mouse_y;
  mouse_x = e.clientX - MARGIN; 
  mouse_y = e.clientY - MARGIN;
}

function init() {
  //velocities are in pixels per second
  const circle = {svg:null, x:16, y:16, r:16, v_x:0, v_y: 0, a_x:0, a_y:G};
  createCircle(circle);
  let svg = document.getElementById('svg');
  svg.addEventListener('mousedown', () => {
    isMouseDown = true;
  });
  let bounds = [[0, svg.getAttribute('width')],[0, svg.getAttribute('height')]];
  let s = setInterval(simulate, TIME_INTERVAL, circle, bounds);
}

function simulate(circle, bounds) {
  if(!isMouseDown){
    //update velocity based on acceleration
    circle.v_x += (circle.a_x * (TIME_INTERVAL / 1000));
    circle.v_y += (circle.a_y * (TIME_INTERVAL / 1000));
    //update position based on velocity
    circle.x += (circle.v_x * (TIME_INTERVAL / 1000));
    circle.y += (circle.v_y * (TIME_INTERVAL / 1000));
    //check if it hits the floor
    //make it bounce
    if(circle.y > bounds[1][1] - circle.r) {
      circle.y = bounds[1][1] - circle.r;
      circle.v_y *= -1 * BOUNCE;
      //if the velocity is slow enough, just completely stop it
      if(Math.abs(circle.v_y) <= 0.1) {
	circle.v_y = 0;
	circle.a_y = 0;
      }
    } else if(circle.y < bounds[1][0] + circle.r) {
      circle.y = bounds[1][0] + circle.r;
      circle.v_y *= -1 * BOUNCE;
      //should still fall if it hits the top
      if(Math.abs(circle.v_y) <= 0.1) {
	circle.v_y = 0;
      }
    }
    //also check if it hit the left/right edge
    if(circle.x > bounds[0][1] - circle.r) {
      circle.x = bounds[0][1] - circle.r;
      circle.v_x *= -1 * BOUNCE;
      //if the velocity is slow enough, just completely stop it
      if(Math.abs(circle.x_y) <= 0.1) {
	circle.v_x = 0;
	circle.a_x = 0;
      }
    } else if(circle.x < bounds[0][0] + circle.r) {
      circle.x = bounds[0][0] + circle.r;
      circle.v_x *= -1 * BOUNCE;
      if(Math.abs(circle.v_x) <= 0.1) {
	circle.v_x = 0;
	circle.a_x = 0;
      }
    }
    
  } else {
    circle.x = Math.min(Math.max(bounds[0][0] + circle.r, mouse_x), bounds[0][1] - circle.r);
    circle.y = Math.min(Math.max(bounds[1][0] + circle.r, mouse_y), bounds[1][1] - circle.r);
    circle.a_y = G;
    circle.v_y = (mouse_y - prev_mouse_y) * MOUSE_MULT;
    circle.v_x = (mouse_x - prev_mouse_x) * MOUSE_MULT;
    circle.a_x = 0;
  }
  circle.svg.setAttribute('cx', circle.x);
  circle.svg.setAttribute('cy', circle.y);
}

function createCircle(circle) {
  let svg = document.getElementById('svg');
  let circleSVG = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circleSVG.setAttribute('id', 'circle');
  circleSVG.setAttribute('class', 'circle');
  circleSVG.setAttribute('r', circle.r);
  circleSVG.setAttribute('cx', circle.x);
  circleSVG.setAttribute('cy', circle.y);
  svg.appendChild(circleSVG);
  circle.svg = circleSVG;
}

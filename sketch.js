/* Pixdenzas 

 Code adapted from 
 Daniel Shiffman
 http://codingtra.in
 https://youtu.be/BjoM9oKOAKY
 
 and 

 Tyler Hobbs
 https://tylerxhobbs.com/fidenza
*/

//canvas setup
var pix = 24;
var canv = 336;
var pix_size = canv/pix;
var cols, rows;
var fr;
let traits = {};

//flowfield vars
var turbulence_arr = [.001, .075, .1, .125, .25];
var turbulence = p5.prototype.random(turbulence_arr);
if (turbulence == .001) traits['turbulence'] = 'very low';
if (turbulence == .075) traits['turbulence'] = 'low';
if (turbulence == .100) traits['turbulence'] = 'med';
if (turbulence == .125) traits['turbulence'] = 'high';
if (turbulence == .25) traits['turbulence'] = 'very high';

var flowfield;

//drawing vars
var palette;
var shapes = [];
var density = p5.prototype.floor(p5.prototype.random(100,250));
var margin = p5.prototype.random() < 0.5;
border_arr = new Array();
for (var i = 0; i < pix*pix ; i++) {
  if (i < 24) border_arr.push(i);
  if (i%24 == 0 || i%24 == 23) border_arr.push(i);
  if (i > 551) border_arr.push(i);
}
var outlined = p5.prototype.random() < 0.75;

traits['density'] = density;
traits['margin'] = margin;
traits['outlined'] = outlined;
console.log("turbulence: " + turbulence);
console.log("have margin: " + margin);
console.log("outlined: " + outlined);
console.log('density: ' + density);

//color palettes
let luxe = {
  name: "luxe",
  bg: ['#EBE4D8'],
  colors: ['#DB4F54', '#FCD265', '#E67D32', '#FCBC19', '#FCD265', '#29A691', '#B8D9CE', '#315F8C', '#543E2E', '#3B2B20']
}
let rad = {
  name: "rad",
  bg: ['#EBE4D8'], 
  colors: ['#DB4F54', '#DB4F54', '#FCD265', '#FCD265', '#7CA9BF', '#315F8C', '#543E2E', '#FAF8F5']
}
let golf_socks = {
  name: "golf_socks",
  bg: ['#66806A'], 
  colors: ['#F09191', '#EA908E', '#274E2E', '#18344E', '#1A364F', '#E7C1BB', '#2A5030', '#E9E2D6']
}
let baked = {
  name: "baked",
  bg: ['#EBE4D8'], 
  colors: ['#F7B1A1', '#F6D4CA', '#418D48', '#CAE5CC', '#634D3A', '#F9F7F3']
}
let politique = {
  name: "politique",
  bg: ['#EBE4D8'], 
  colors: ['#DB4F54', '#F7B1A1', '#FCD265', '#315F8C', '#EAE9E6', '#FAF8F5']
}
let white_mono = {
  name: "white_mono",
  bg: ['#DB4F54', '#F7B1A1', '#29A691', '#1A1A1A', '#1F3359', '#211812', '#FCD265', '#E67D32', '#34628E'],
  colors: ['#FAF8F5']
}
let cool = {
  name: "cool",
  bg: ['#F7B1A1'],
  colors: ['#FCD265', '#29A691', '#1F3359', '#315F8C', '#7CA9BF', '#E0D7C5', '#CFE6DE']
}
let am = {
  name: "am",
  bg: ['#3D364D'],
  colors: ['#E6918A', '#E6D2AC', '#CCB9B8', '#3D4D4D', '#8FB395', '#2C2933', '#3E3E59']
}
let white_on_cream = {
  name: "white_on_cream",
  bg: ['#EBE4D8'],
  colors: ['#FAF8F5']
}
let party_time = {
  name: "party_time",
  bg: ['#0F1833'],
  colors: ['#C1495D', '#DF455F', '#DF4E66', '#D75C71']
}
let black = {
  name: "black_forest",
  bg: ['#EBE4D8'],
  colors: ['#1D1D1D', '#2E2D2C']
}
let rose = {
  name: "rose",
  bg: ['#464D49'],
  colors: ['#B3243C', '#E65C73', '#CC7080', '#5E6662', '#38403D', '#F7C7B7', '#FFDAD6']
}
let dark_lifestyle = {
  name: "dark_lifestyle",
  bg: ['#1A1A1A'],
  colors: ['#212121', '#292929', '#303030', '#383838']
}
let palettes = [luxe, rad, golf_socks, baked, politique, white_mono, cool, am, white_on_cream, party_time, black, rose, dark_lifestyle];

//setup
function setup() {
  createCanvas(canv, canv);
  //colorMode(HSB, 255);
  cols = pix;
  rows = pix;
  fr = createP('');

  flowfield = new Array(cols * rows);

  //pick palette
  palette = random(palettes);
  traits['palette'] = palette['name'];
  console.log('palette: ' + palette['name']);
  background(random(palette['bg']));
  
  //draw a grid
  // for (var i = 0; i < rows; i++) {
  //     for (var j = 0; j < cols; j++) {
  //       rect(i*pix_size, j*pix_size, pix_size, pix_size);
  //     }
  // }

}

function nextPixel(angle) {
  //console.log("angle: " + angle);
  //console.log("deg: " + angle*180/PI);
  if (((0 < angle) && (angle <= PI/8)) || ((15*PI/8 < angle) && (angle < TWO_PI))) {return [1,0];}
  if (PI/8 < angle && angle <= 3*PI/8) {return [1,1];}
  if (3*PI/8 < angle && angle <= 5*PI/8) {return [0,1];}
  if (5*PI/8 < angle && angle <= 7*PI/8) {return [-1,1];}
  if (7*PI/8 < angle && angle <= 9*PI/8) {return [-1,0];}
  if (9*PI/8 < angle && angle <= 11*PI/8) {return [-1,-1];}
  if (11*PI/8 < angle && angle <= 13*PI/8) {return [0,-1];}
  if (13*PI/8 < angle && angle <= 15*PI/8) {return [1,-1];}
}

function draw() {
  var yoff = 0;
  for (var y = 0; y < rows; y++) {
    var xoff = 0;
    for (var x = 0; x < cols; x++) {
      var index = x + y * cols;
      var angle = noise(xoff, yoff) * TWO_PI;
      var v = p5.Vector.fromAngle(angle);
      v.setMag(1);
      // flowfield[index] = v;
      flowfield[index] = angle;
      xoff += turbulence;
      // stroke(0, 50);
      // push();
      // translate(x * pix_size, y * pix_size);
      // rotate(v.heading());
      // strokeWeight(1);
      // line(0, 0, pix_size, 0);
      // pop();
    }
    yoff += turbulence;
  }

  for (var i = 0; i < density; i++) {
      var length = random(5,15);
      let c = random(palette['colors']);
      fill(c);
      if (outlined) {
        stroke('black');
      } else {
        noStroke();
      }

      for (var j = 0; j < length; j++){
        var pixel_x, pixel_y, p_index, next_pixel;
        if (j == 0) {
          if (margin) {
            pixel_x = floor(random(1,pix-1));
            pixel_y = floor(random(1,pix-1));
            p_index = pixel_x + pixel_y * pix;
          } else {
            pixel_x = floor(random(0,pix));
            pixel_y = floor(random(0,pix));
            p_index = pixel_x + (pixel_y * pix);
          }
          rect(pixel_x * pix_size, pixel_y * pix_size , pix_size, pix_size);
          //console.log("start (x,y): " + pixel_x + ", " + pixel_y + " pix_index=" + p_index)
          next_pixel = nextPixel(flowfield[p_index]);
        } else {
          _px = pixel_x+next_pixel[0];
          _py = pixel_y+next_pixel[1];
          if (margin) {
            if (border_arr.includes(_px) || border_arr.includes(_py)) {

            } else {
              rect( _px * pix_size, _py * pix_size, pix_size, pix_size);
            }
          } else {
            rect( _px * pix_size, _py * pix_size, pix_size, pix_size);
          }
        }
      }
      
  }
  noLoop();

  document.getElementById('traits').innerHTML = JSON.stringify(traits);
}

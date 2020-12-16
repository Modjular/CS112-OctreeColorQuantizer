/**
 * This is an example algorithm implemented
 * in javascript.
 * Simply put, it will take an array representing the image in ABGR
 * And return a dictionary mapping each unique color to a new one
 * 
 * NOTE: It will need to be included BEFORE sketch.js in the HTML
 */


const uniform = (img) => {
    /**
     * NOTE
     * The img array is a flattened image
     * Its length == width * height 
     * 
     * Example:
     * A 360x480 image will come in as a 172800-long Uint32Array
     * 
     * Each color is represented as a 32-bit unsigned int in ABGR form
     * Why not RGBA? idk haha
     * Example:
     * 11111111 00100101 00000000 10001000
     * A        B        G        R
     * 
     * However, I've provided helper functions that do the bit-shifting
     * you need to properly access the colors you'll need
     */


   // Double check its of the right form
   if(!img instanceof Uint32Array){
       console.error(img, "is not a Uint32Array");
       return null;
   }

   const alpha = (c) => (c >> 24) & 0xFF;
   const blue  = (c) => (c >> 16) & 0xFF;
   const green = (c) => (c >> 8)  & 0xFF;
   const red   = (c) => c & 0xFF;
   const unsign = (c) => (c >>> 0);

   const a = 255 << 24;
   const color_regions = [[0,31], [32,63], [64,95], [96,127], [128,159], [160,191], [192,223], [224,255]];

   let color_map = new Map();
   let unique_colors = new Set();
   
   // Grab the unique colors for later use
   for(let i = 0; i < img.length; i++) {
       unique_colors.add(img[i]);
   }

   /**
    * Here's where you'll implement the algorithm
    * 
    * For example, lets say we just map each unique color to 
    * a random color.
    */


  //This particular uniform algorithm will divide each RGB color space into 8 equal regions to reduce the palette into a 512 color palette


  //helper for calculating the average of an array
  let average = (array) => array.reduce((a, b) => a + b) / array.length;

  //function to get the index of the color region that a color falls into
  function get_color_region(color_value){
    for(let i = 0; i < color_regions.length; i++){
      if (color_value >= color_regions[i][0] && color_value <= color_regions[i][1]){
        return i;
      }
    }
  }

  //function to get a reduced color given a list of average colors for each color region
  function reduced_color(color_value, average){
  	for(let i = 0; i < color_regions.length; i++){
      if (color_value >= color_regions[i][0] && color_value <= color_regions[i][1]){
        return average[i];
      }
    }
  }

  let array_colors = Array.from(unique_colors);

  red_regions = [[],[],[],[],[],[],[],[]];
  green_regions = [[],[],[],[],[],[],[],[]];
  blue_regions = [[],[],[],[],[],[],[],[]];

  for(let i = 0; i < array_colors.length; i++){
    let r = red(array_colors[i]);
    let g = green(array_colors[i]);
    let b = blue(array_colors[i]);
    red_regions[get_color_region(r)].push(r);
    green_regions[get_color_region(g)].push(g);
    blue_regions[get_color_region(b)].push(b);

  }

  red_rep_colors = [0,0,0,0,0,0,0,0];
  green_rep_colors = [0,0,0,0,0,0,0,0];
  blue_rep_colors = [0,0,0,0,0,0,0,0];

  for(let i =0; i < 8; i++){
    if (red_regions[i].length > 0){
      red_rep_colors[i] = Math.round((average(red_regions[i])));
    }
    if (green_regions[i].length > 0){
      green_rep_colors[i] = Math.round((average(green_regions[i])));
    }
    if (blue_regions[i].length > 0){
      blue_rep_colors[i] = Math.round((average(blue_regions[i])));
    }
  }

  // At this point you have divided colors into 8 regions by RGB, calculated the average color for each region by taking the average,
  // now just replace the palette with those average colors put back together

   unique_colors.forEach( (c) => {
   		let r = red(c);
	    let g = green(c);
	    let b = blue(c);
	   	let rr = reduced_color(r, red_rep_colors);
	   	let rg = reduced_color(g, green_rep_colors) << 8;
	   	let rb = reduced_color(b, blue_rep_colors) << 16;
	   	let new_color = unsign(a | rb | rg | rr);
        color_map.set(c, new_color);
    });


   // This returned map will be use to recolor the original image
   return color_map
}
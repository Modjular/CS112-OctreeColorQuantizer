/**
 * This is an example algorithm implemented
 * in javascript.
 * Simply put, it will take an array representing the image in ABGR
 * And return a dictionary mapping each unique color to a new one
 * 
 * NOTE: It will need to be included BEFORE sketch.js in the HTML
 */


const median = (img) => {
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

   let color_map = new Map();
   let unique_colors = new Set();
   
   // Grab the unique colors for later use
   for(let i = 0; i < img.length; i++) {
       unique_colors.add(img[i]);
   }
    
   let array_colors = Array.from(unique_colors);

   const med_recursive = (colors, depth) => {
      
      if (colors.length == 0){
          return
      }
      
      if (depth == 0){
         let a_arr = [...colors].map((c) => alpha(c));
         let b_arr = [...colors].map((c) => blue(c));
         let g_arr = [...colors].map((c) => green(c));
         let r_arr = [...colors].map((c) => red(c));
         let a_avg = a_arr.reduce((a,b) => a+b)/colors.length;
         let b_avg = b_arr.reduce((a,b) => a+b)/colors.length;
         let g_avg = g_arr.reduce((a,b) => a+b)/colors.length;
         let r_avg = r_arr.reduce((a,b) => a+b)/colors.length;
         //}
         let avg = (a_avg<<24)|(b_avg<<16)|(g_avg<<8)|(r_avg);
         //avg = colors.reduce((a,b) => a + b)/colors.length;
         colors.forEach( (c) => {
            color_map.set(c, avg);
         });
         return
      }
       
      let b_max = colors.reduce((a,b) => Math.max(blue(a),blue(b))) - colors.reduce((a,b) => Math.min(blue(a),blue(b)));
      let g_max = colors.reduce((a,b) => Math.max(green(a),green(b))) - colors.reduce((a,b) => Math.min(green(a),green(b)));
      let r_max = colors.reduce((a,b) => Math.max(red(a),red(b))) - colors.reduce((a,b) => Math.min(red(a),red(b)));
       
      let max_range = Math.max(b_max,g_max,r_max);
       
      if (max_range == b_max){
          colors.sort((a,b) => blue(a) - blue(b));
      }
      else if (max_range == g_max){
          colors.sort((a,b) => green(a) - green(b));
      }
      else{
          colors.sort((a,b) => red(a) - red(b));
      }
       
      let half = Math.ceil(colors.length/2);
      med_recursive(colors.splice(0,half),depth-1);
      med_recursive(colors.splice(-half),depth-1);
   }
   
   med_recursive(array_colors, 9);
   
   /**
    * Here's where you'll implement the algorithm
    * 
    * For example, lets say we just map each unique color to 
    * a random color.
    */
   

   // This returned map will be use to recolor the original image
   return color_map
}
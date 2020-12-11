/**
 * This is an example algorithm implemented
 * in javascript.
 * Simply put, it will take an array representing the image in ABGR
 * And return a dictionary mapping each unique color to a new one
 * 
 * NOTE: It will need to be included BEFORE sketch.js in the HTML
 */


const octree = (img) => {
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
     * R        B        G        R
     * 
     * However, I've provided helper functions that do the bit-shifting
     * you need to properly access the colors you'll need
     */


   // Double check its of the right form
   if(!img instanceof Uint32Array){
       console.error(img, "is not a Uint32Array");
       return null;
   }

   const alpha = (c) => (c >> 16) & 0xFF;
   const blue  = (c) => (c >> 16) & 0xFF;
   const green = (c) => (c >> 8)  & 0xFF;
   const red   = (c) => c & 0xFF;

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
   unique_colors.forEach( (c) => {
       color_map.set(c, (Math.random()*4294967296)>>>0);
   });

   // This returned map will be use to recolor the original image
   return color_map
}
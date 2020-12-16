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


    // Following the algorithm description from section 2.1:
    // http://www.leptonica.org/papers/colorquant.pdf
    // Create a colormap that holds 256 colors
    // any 32-bit color can now be mapped with 8 bits
    //  3 bits from red
    //  3 bits from green
    //  2 bits from blue
    // This corresponds to the respective "cube index" of
    // their respective oct-cubes
    cmap = new Uint32Array(256);
    let rval, gval, bval, aval;
    for (let index = 0; index < 256; index++) {
        rval = (index        & 0xe0) | 0x10;
        gval = ((index << 3) & 0xe0) | 0x10;
        bval = ((index << 6) & 0xc0) | 0x20;// Blue is only first 2 msbits 
        aval = 0xFF;                        // Just set to full opacity
        cmap[index] = (aval<<24)|(bval<<16)|(gval<<8)|(rval);
    }

    // Finally, we take the unique colors in this image and
    // map to their respective oct-cube color
    unique_colors.forEach( (c) => {
        rval = red(c);
        gval = green(c);
        bval = blue(c);
        index = (rval & 0b11100000) | (gval & 0b11100000) >> 3 | (bval & 0b11000000) >> 6;
        color_map.set(c, cmap[index]);
    });

    // This returned map will be use to recolor the original image
    return color_map
}




// ======
// Octree
// ======

// octree node declaration
class Node{
    constructor(){
        this.is_leaf = false;
        this.depth = 0;
        this.colors = 0; // might be possible for this to only be one;
        this.child = [];
    }
}

// Actual function for building an octree
const buildNode = (colors, depth) => {
    if(colors.length == 0){
        return null;
    }
    if(colors.length < 12){ 
        let n = new Node();
        n.is_leaf = true;
        n.color = colors[0]; // This should actually be averaged out
        n.depth = depth;
        return n;
    }
    
    // At this point, if we have too many colors,
    // we have to subdivide them into 8 bins
    // with getColorIndex()

    let bins = Array(8).fill(Array(0)); // create an empty array of 8 arrays
    colors.forEach((c) => {
        let index = getColorIndex(c);
        bins[index].push(c);
    });

    let n = new Node();
    n.depth = depth;
    for(let i = 0; i < 8; i++){
        n.child[i] = buildNode(bin[i], depth+1);
    }
    return n;
}

const pruneOctree = (k, root) => {
    /**
     * k == max number of colors to reduce to
     */

    // On this second pass, we will go down into the lower depths
    // How will we determine when to merge, and how many to merge?
    // idk
    // Implementing the One-Pass version found in section 2.1 here:
    // http://www.leptonica.org/papers/colorquant.pdf

    // Maybe I can implement a more advanced version later
    // 
}


// ======
// Helper
// ======

const getColorIndex = (color, level) => {
    let index = 0;
    let mask = 0b10000000 >> level;
    if (red(color) & mask)   index |= 0b100;
    if (green(color) & mask) index |= 0b010;
    if (blue(color) & mask)  index |= 0b001;
    return index;
}
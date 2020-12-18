/**
 * This is a more advanced Octree implementation
 * Although, according to the paper on leptonica.org
 * its actually conceptually simpler than other versions
 * 
 * NOTE: It will need to be included BEFORE sketch.js in the HTML
 */


const octreeAdaptive = (img) => {
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


    const alpha = (c) => (c >> 24) & 0xFF;
    const blue  = (c) => (c >> 16) & 0xFF;
    const green = (c) => (c >> 8)  & 0xFF;
    const red   = (c) => c & 0xFF;

    // Double check its of the right form
    if(!img instanceof Uint32Array){
        console.error(img, "is not a Uint32Array");
        return null;
    }

    let color_map = new Map();
    let unique_colors = new Set();
    
    // Grab the unique colors for later use
    for(let i = 0; i < img.length; i++) {
        unique_colors.add(img[i]);
    }


    // Step 1.
    // Convert unique_colors to a Uint32Arrray
    // Calculate the rough capacity for each leaf
    // Declare root node, begin recursively building

    let colors = Uint32Array.from(unique_colors);
    let rough_cap = Math.floor(unique_colors.size / 256 * 7);
    console.log("rough_cap", rough_cap);
    let octree = buildOctNode(colors, 0, rough_cap);
    console.log("DEBUG_LEAF_COUNT ", DEBUG_LEAF_COUNT);

    // Step 2.
    // If the palette > k, prune leaves via mergine
    // pruneOctree(256, octree);

    // Step 3.
    // Search the tree for all the new leaves
    let leafs = getOctreeLeafs(octree);
    console.log("# of leafs: ", leafs.length);

    // Step 4.
    // Iterate over leaves, averaging the colors to obtain the palette color
    // If we imagine the colors in 3D space, we're grabbing the centroid of
    // al the color points
    // Finally, fill the colormap with the new palette
    leafs.forEach((node) => {

        // let avg_color = Math.round(node.colors.reduce((sum, c) => sum + c) / node.colors.length);
        let avg_color = node.colors[0];
        // TODO: Is this color avg causing the weird color banding? 
        // what if i just replace with first color?

        node.colors.forEach((c) => {
            color_map.set(c, avg_color);
        })
    });
    return color_map
}




// ======
// Octree
// ======

// octree node declaration
class OctNode{
    constructor(){
        this.is_leaf = false;
        this.depth = 0;
        this.colors = []; // might be possible for this to only be one;
        this.child = [];
    }
}

var DEBUG_LEAF_COUNT = 0;
// Actual function for building an octree
// colors:  Uint32Array
// depth:   int
// bin_cap: int     unique_colors.length/k is a good estimate
// leafs:   ref     append leaf nodes when we find them
const buildOctNode = (colors, depth, bin_cap) => {

    if(colors.length == 0){
        return null;
    }

    if(colors.length <= bin_cap || depth >= 6){  // Max depth
        DEBUG_LEAF_COUNT++;
        let n = new OctNode();
        n.is_leaf = true;
        n.colors = colors;
        n.depth = depth;
        return n;
    }
    
    // At this point, if we have too many colors,
    // we have to subdivide them into 8 bins
    // with getColorIndex()
    // With arbitrary points we would have to
    // do fancy bbox collision test
    // Luckily, 8-bit color indexes naturally

    let bins = Array(8) // create an array of 8 empty Arrays
    for(let i = 0; i < 8; i++){
        bins[i] = [];   // .fill() creates one single reference
    }

    colors.forEach((c) => {
        let index = getColorIndex(c, depth);
        bins[index].push(c);
    });

    let n = new OctNode();
    n.depth = depth;
    for(let i = 0; i < 8; i++){
        if(depth == 0){
            // console.log("bin", i, bins[i].length);
        }
        n.child[i] = buildOctNode(bins[i], depth+1, bin_cap);
    }
    return n;
}


const pruneOctree = (k, root) => {
    /**
     * k == max number of colors to reduce to?
     */

    // On this second pass, we will go down into the lower depths
    // How will we determine when to merge, and how many to merge?
    // idk
    // Implementing the One-Pass version found in section 2.1 here:
    // http://www.leptonica.org/papers/colorquant.pdf

    // Maybe I can implement a more advanced version later
    
    return;
}


// Recursively looks for leaves. 
// Returns a list of them.
const getOctreeLeafs = (node) => {

    if(node.is_leaf){
        DEBUG_LEAF_COUNT++;
        return [node];  // so that it can be used with concat
    }else{
        let leafs = Array()
        for(let i = 0; i < 8; i++){
            if(node.child[i] != null){
                leafs = leafs.concat(getOctreeLeafs(node.child[i]));
            }
        }
        //console.log("leafs.length", leafs.length);
        return leafs;
    }
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
// Test pallete by Dawnbringer: http://pixeljoint.com/forum/forum_posts.asp?TID=16247


var IMAGE_UPLOADED = false;

// Helper functions
// because of Endianess
// it goes ABGR (reversed RGBA)
const alpha = (c) => (c >> 16) & 0xFF;
const blue = (c) => (c >> 16) & 0xFF;
const green = (c) => (c >> 8) & 0xFF;
const red = (c) => c & 0xFF;

// dict of functions
const methods = {
    "uniform": exampleFunc,
    "median": exampleFunc,
    "octree": exampleFunc
}


const sketchTemplate = (s) => {

    let background_color = 32;
    let color_set = new Set();
    let img;                // original image
    let qimgs = {};         // quantized images (preprocessed)
    let qmethod = "none";   // current quantization method


    s.setup = () => {
        s.createCanvas(s.windowWidth, s.windowHeight); //, s.WEBGL);
        s.createEasyCam();
        //document.oncontextmenu = () => false;
        s.background(100);
        s.strokeWeight(2);
        s.stroke(255,0,0);
        s.fill(255,0,0);
        s.frameRate(24);
        //s.noFill();
                
        //s.drawColorSpace();
    }

    s.draw = () => {

        if(IMAGE_UPLOADED){
            //s.drawColorSpace();
            s.background(0);

            // If "none" just redraw the image
            if(qmethod == "none"){
                s.image(img, 0, 0);
            }else{
            // else, do the cool split effect
                s.image(qimgs[qmethod], 0, 0);
            }


            s.line(s.mouseX, 0, s.mouseX, s.height);
            s.ellipse(s.mouseX, s.mouseY, 8, 8);
        }

    }

    // Draws a 3d representation of the color_set
    s.drawColorSpace = () => {
        s.background(background_color);
        s.translate(-128,-128,-128);
        
        // Draw the RGB axis's
        s.push()
            // r == x, g == y, b == z
            s.stroke(255,0,0);
            s.line(0,0,0, 255,0,0);
        
            s.stroke(0,255,0);
            s.line(0,0,0, 0,255,0);

            s.stroke(0,0,255);
            s.line(0,0,0, 0,0,255);	
        s.pop()
        
        // Draw the img's colors
        // Later, draw just the palette
        s.push()
            //scale(0.5);
            s.strokeWeight(10);
    // 		for(let i = 0; i<img.width * img.height * 4; i += 4) {
                
    // 			let r = img.pixels[i];
    // 			let g = img.pixels[i+1];
    // 			let b = img.pixels[i+2];
                
    // 			stroke(r,g,b);
    // 			point(r,g,b);
    // 		}
            color_set.forEach( (c) => {
                let r = red(c);
                let g = green(c);
                let b = blue(c);

                // stroke(r,g,b);
                // point(r,g,b);
                s.push();
                    s.noStroke()
                    s.fill(r,g,b);
                    s.translate(r,g,b);
                    s.scale(4);
                    s.box(1,1);
                s.pop();
            });;
        s.pop();
    }

    // Takes a p5.Image object, returns the unique colors in a Set
    s.convertImageToSet = (img) => {
        // Load image and its pixel array
        let result = new Set();
        img.loadPixels();
        let colors = new Uint32Array(img.pixels.buffer);
        console.log("colors instanceof Uint32Array =", colors instanceof Uint32Array);
        
        //console.log(colors.length);
        for(let i = 0; i < colors.length; i++) {
            //console.log(colors[i]);
            result.add(colors[i]);
            if(result.size >= 128){
                s.print("Set cutoff at size 128")
                break;
            }
        }
        console.log("color_set has ", result.size, " colors");

        IMAGE_UPLOADED = true;
        return result;
    }


    // // Not used
    // s.handleFile = (file) => {
    //     s.print("Got file: ", file.type);
    //     if (file.type  === 'image/png') {
    //         img = s.createImg(file.data, '');
    //         color_set = s.convertImageToSet(img);
    //     }
    // }


    // Not only take in a URL to load, but resize the canvas to its size
    // The gateway to the p5 object
    s.loadEncodedImage = (url) => {
        //s.print("Got url: ", url);
        s.loadImage(url, loaded_img => {

            // 1. Load the new image, convert to a color set
            img = loaded_img;
            color_set = s.convertImageToSet(loaded_img);

            // 2. load all other versions into qimgs
            // For readability, i'll just spell out the ops here
            qimgs["uniform"] = s.imageFromMethod(methods["uniform"], img);
            qimgs["median"]  = s.imageFromMethod(methods["median"], img);
            qimgs["octree"]  = s.imageFromMethod(methods["octree"], img);
            // TODO make these async and use Promise.all() to 
            // disable UI while they load

            // 3. resize the canvas, finish up
            s.resizeCanvas(loaded_img.width, loaded_img.height);
            s.image(loaded_img,0,0);
        });
    }

    // handles changing qmethods and ALSO
    // swapping palettes out
    // MAYBE palettes should be generated in the beginning
    // once we have our image...
    s.changeMethod = (method) => {
        console.log("Changed method to", method);
        qmethod = method;
        console.log("WIDTH", qimgs["uniform"].width, qimgs["uniform"].height);

    }

    // Method is a function, image, the original image
    // Returns a new image mapped to the color_map
    s.imageFromMethod = (method, image) => {
        
        image.loadPixels();
        let arr = new Uint32Array(image.pixels.buffer);
        let color_map = method(arr);
        console.log(color_map);
        console.log("Created palette with", color_map.size, "colors");
        let new_img = s.createImage(image.width, image.height);

        console.log("RAND COLOR", image.get(0,0))

        for (let i = 0; i < image.width; i++) {
            for (let j = 0; j < image.height; j++) {
                let rgba = image.get(i, j);     // p5.Image.get() -> [r,g,b,a]
                let oldc = ((rgba[3] << 24) | (rgba[2] << 16) | (rgba[1] << 8) | rgba[0]) >>> 0;
                let newc = color_map.get(oldc);   // ABGR -> Map.get()
                new_img.set(i, j, s.color(red(newc), green(newc), blue(newc)));
            }
        }

        new_img.updatePixels();
        return new_img;
    }
}


var myp5;
var onchangeHandler;

window.onload = () => {
    
    // =========
    // DOM STUFF
    // =========

    // Image input stuff
    onchangeHandler = (input) => {

        // If first time, init myp5
        if(!myp5){
            myp5 = new p5(sketchTemplate, window.document.getElementById("theSketch"));
        }

        if(input.files){
            let list = input.files;
            console.log(list[0]);
            // myp5.handleFile(list[0])


            // all this for displaying the uploaded file
            var reader = new FileReader();
            
            reader.onload = function(e) {
                document.getElementById('uploaded').src = e.target.result;
                IMAGE_UPLOADED = true;
                
                // now update the sketch
                myp5.loadEncodedImage(e.target.result);
            }
            
            reader.readAsDataURL(input.files[0]);
        }else{
            console.log("Input is null?", input);
        }
    }

    methodOnChangeHandler = (e) => {
        if(myp5){
            myp5.changeMethod(e.value);
        }
    }
}

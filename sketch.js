// Test pallete by Dawnbringer: http://pixeljoint.com/forum/forum_posts.asp?TID=16247


var IMAGE_UPLOADED = false;

// Helper functions
// because of Endianess
// it goes ABGR (reversed RGBA)
const blue = (c) => (c >> 16) & 0xFF;
const green = (c) => (c >> 8) & 0xFF;
const red = (c) => c & 0xFF;


const sketchTemplate = (s) => {

    let background_color = 32;
    let color_set = new Set();
    let img;

    s.setup = () => {
        s.createCanvas(s.windowWidth/2, s.windowHeight, s.WEBGL);
        s.createEasyCam();
        //document.oncontextmenu = () => false;
        s.background(100);
        s.strokeWeight(2);
        s.frameRate(24);
        s.noFill();
                
        s.drawColorSpace();
    }

    s.draw = () => {
        
        if(IMAGE_UPLOADED){
            s.drawColorSpace();
        }

    }

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

    // Takes a p5.Image object
    s.convertImageToSet = (img) => {
        // Load image and its pixel array
        let result = new Set();
        img.loadPixels();
        let colors = new Uint32Array(img.pixels.buffer);
        
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

    s.handleFile = (file) => {
        s.print("Got file: ", file.type);
        if (file.type  === 'image/png') {
            img = s.createImg(file.data, '');
            color_set = s.convertImageToSet(img);
        }
    }

    s.loadEncodedImage = (url) => {
        //s.print("Got url: ", url);
        img = s.loadImage(url, loaded_img => {
            color_set = s.convertImageToSet(loaded_img);
        });
    }
}


var myp5;
var onchangeHandler;

window.onload = () => {
    
    myp5 = new p5(sketchTemplate, window.document.getElementById("theSketch"));

    // =========
    // DOM STUFF
    // =========

    // Image input stuff
    onchangeHandler = (input) => {
        if(input.files){
            let list = input.files;
            console.log(list[0]);
            // myp5.handleFile(list[0])


            // all this for displaying the uploaded file
            var reader = new FileReader();
            
            reader.onload = function(e) {
                document.getElementById('uploaded').src = e.target.result;
                console.log("IMAGE UPLOADED = true")
                IMAGE_UPLOADED = true;
                
                // now update the sketch
                myp5.loadEncodedImage(e.target.result);
            }
            
            reader.readAsDataURL(input.files[0]);
        }else{
            console.log("Input is null?", input);
        }
    }
}

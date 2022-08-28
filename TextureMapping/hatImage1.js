

var canvas;
var gl;
var program;
var pointsArray = [];
var texCoordsArray = [];
var texSize = 256;
var imageFunction = new Uint8Array(texSize*texSize);
 

// generate a texture using the "hat" function
// creating values between 0 and 255 -- gray scale  
// In the fragment shader, rgb colors are generated

function makeHatTexture() {
	var minc, maxc;
	for(var i=0; i<texSize; i++) {
		var x = Math.PI*(8*i/texSize-4.0);
		for(var j=0; j<texSize; j++) {
			
			var y = Math.PI*(8*j/texSize-4.0);
			var r = Math.sqrt(x*x+y*y);
			// at singularity, when r=0, then set to white
			if(r ) c = 255*(1+Math.sin( r )/r)/2;
			else c = 255;
			imageFunction[i*texSize+j] = c;
			if(i==0 && j==0) {
				minc = c;
				maxc = c;
			}
			else {
				if(c < minc) minc = c;
				if(c > maxc) maxc = c;
			}
		}
	}
	console.log("minc =",minc,"  maxc = ",maxc);
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
	// create a square
    pointsArray.push(vec2(-1, -1));
    pointsArray.push(vec2(-1, 1));
    pointsArray.push(vec2(1, 1));
    pointsArray.push(vec2(1, -1));
    
	// assign texture coords
    texCoordsArray.push(vec2(0, 0));
    texCoordsArray.push(vec2(0, 1));
    texCoordsArray.push(vec2(1, 1));
    texCoordsArray.push(vec2(1, 0));

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );


    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vPosition);
    
	makeHatTexture();
	
    var texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	// Using Luminance flag to indicate that texture is monochromatic
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 
        texSize, texSize, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, imageFunction);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
}

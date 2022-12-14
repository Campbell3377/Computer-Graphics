//
// simpleSquare.js
//
// Demonstration of a webgl program built with html and javascript.
//
//


var canvas;
var gl;

// This function opens the canvas for drawing
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }


    //
    // Configure WebGL: create the canvas and identify the background color
	// webgl functions start with "gl." indicating that they belong to the canvas
    //
    gl.viewport( 0, 0, canvas.width, canvas.height);
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	//  Load shaders and initialize attribute buffers
	//
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


	//  Create the square (The order of the vertices is a little unusual. Explained in render() )
	//
    var vertices = [
        vec2(0, 1.0),
        vec2(-1, 0),
        vec2(1, 0),
        vec2(0, -1)
    ];

	// Here is an example of how to debug with print statements
	// Hit F12 in the browser to open the debug window
	console.log("vertices = ",vertices);
	console.log("vertex[0] = ",vertices[0]);
	console.log("vertex[0][0] = ",vertices[0][0]);
	console.log("vertex[0][1] = ",vertices[0][1]);


    // Load the data into the GPU
	// Takes 2d vertices and flattens them into a 1d array
	// gl.STATIC_DRAW is an example of a webgl constant
	//
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
	// Note that in the vertex shader, the vertex is called vPosiiton.
	// The var here is the same name to keep the association simple, but it is not necessary
	// 2d points being loaded
	//
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // draw

    render();
};


function render() {

	// clear the background
	// another example of a webgl constant

    gl.clear( gl.COLOR_BUFFER_BIT );

	// draw using vertices already loaded in the GPU
	// here we simple draw two triangles 0,1,2 and 1,2,3

	//Here is a simple draw triangle
	gl.drawArrays( gl.TRIANGLES, 0, 3 );
	gl.drawArrays( gl.TRIANGLES, 1, 3 );


	// this is an option drawing also
	// a little tricky: 0,1,2 then 1,2,3
	//l.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

	// this method does not work with the vertex organization
	//gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

	// Not needed in this program -- this is needed for animation
    //window.requestAnimFrame(render);
}

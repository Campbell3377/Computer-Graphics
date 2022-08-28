//
//CSE 470 HW 1 Explode!
//
/*
Written by: HW470:Sean Campbell
Date: Jan 2019

Description:
This program creates a core part along with 4 other parts that explode out and fade into the Background.
*/

var canvas;
var gl;

//store the vertices
//Each triplet represents one triangle
var vertices = [];

//store a color for each vertex
var colors = [];

//HW470: control the explosion
//(Your variables here)
var xExpand = 0.5;
var yExpand = 0.5;
var xLoc;
var yLoc;
var colorLoc;
var theta = 0.0;
var thetaLoc;
var direction = true;
//var rShift = 0.0;
//var gShift = 0.0;
//var bShift = 0.0;
var colorShift = 0.0;
//var fade = 0.0;

//HW470: control the redraw rate
var delay = 20;

// =============== function init ======================

// When the page is loaded into the browser, start webgl stuff
window.onload = function init()
{
	// notice that gl-canvas is specified in the html code
    canvas = document.getElementById( "gl-canvas" );

	// gl is a canvas object
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	// Track progress of the program with print statement
    console.log("Opened canvas");

    //HW470:
    // Define  data for object
	// See HW specs for number of vertices and parts required
	// Recommendation: each set of three points corresponds to a triangle.
	// DCH: I have used sval for scaling the object size if I am not
	// happy with my initial design. (Just an idea for you; no need to use.)
	//(During the explosion all geometry must remain in the window.)
    //


	var sval = 0.25;
    vertices = [
        vec2( -sval*0.5 , sval ),// core
        vec2( sval*0.5 , -sval ),
        vec2( -sval , sval*0.5 ),
        vec2( -sval*0.5, sval ), //
        vec2( sval*0.5 , -sval ),
        vec2( sval, -sval*0.5 ),
        vec2( -sval, -sval*0.5 ), //
        vec2( sval , sval*0.5 ),
        vec2( sval*0.5 , sval ),
        vec2( -sval, -sval*0.5 ), //
        vec2( sval , sval*0.5 ),
        vec2( -sval*0.5 , -sval ),
        vec2( -sval , sval*0.5 ), // tips
        vec2( -sval*0.5 , sval ),
        vec2( -sval , sval ),
        vec2( sval*0.5, -sval ), //
        vec2( sval , -sval*0.5 ),
        vec2( sval , -sval),
        vec2( -sval*0.5, -sval ), //
        vec2( -sval , -sval*0.5 ),
        vec2( -sval, -sval ),
        vec2( sval, sval*0.5 ), //
        vec2( sval*0.5 , sval ),
        vec2( sval , sval ),
        vec2( 0.0, sval*0.5 ),  //Outerparts in pairs of triplets
        vec2( -sval*0.5, sval),
        vec2( sval*0.5, sval),
        vec2( -sval*0.5, sval), //
        vec2( sval*0.5, sval),
        vec2( 0.0, sval*1.5),
        vec2( 0.0, -sval*0.5 ),  //---
        vec2( -sval*0.5, -sval),
        vec2( sval*0.5, -sval),
        vec2( -sval*0.5, -sval), //
        vec2( sval*0.5, -sval),
        vec2( 0.0, -sval*1.5),
        vec2( -sval*0.5, 0.0 ),  //---
        vec2( -sval, -sval*0.5 ),
        vec2( -sval, sval*0.5 ),
        vec2( -sval, -sval*0.5), //
        vec2( -sval, sval*0.5),
        vec2( -sval*1.5 , 0.0),
        vec2( sval*0.5, 0.0 ),  //---
        vec2( sval, -sval*0.5 ),
        vec2( sval, sval*0.5 ),
        vec2( sval, -sval*0.5), //
        vec2( sval, sval*0.5),
        vec2( sval*1.5 , 0.0),
    ];


	//HW470: Create colors for the core and outer parts
	// See HW specs for the number of colors needed
	for(var i=0; i < 24; i++) {
		colors.push(vec3(0.9-i/100.0, 0.0, 0.5-i/100.0));
	};
  for(var i=0; i < 24; i++) {
    colors.push(vec3(0.9-i/100.0, 0.0, 0.5-i/100.0));
  };




	// HW470: Print the input vertices and colors to the console
	console.log("Input vertices and colors:");




    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
	// Background color to white
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Define shaders to use
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    console.log("init delay=",delay);
    // Load the data into the GPU
	//
	// color buffer: create, bind, and load
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

	// Associate shader variable for  r,g,b color
	var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    // vertex buffer: create, bind, load
    var vbuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vbuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate shader variables for x,y vertices
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

	//HW470: associate shader explode variable ("Loc" variables defined here)
    xLoc = gl.getUniformLocation( program, "xExpand");
    yLoc = gl.getUniformLocation( program, "yExpand");
    colorLoc = gl.getUniformLocation( program, "colorShift");
    thetaLoc = gl.getUniformLocation( program, "theta" );
    //fadeLoc = gl.getUniformLocation( program, "fade")

    console.log("Data loaded to GPU -- Now call render");

    render();
};


// =============== function render ======================

function render()
{
    // clear the screen
    gl.clear( gl.COLOR_BUFFER_BIT );

	//HW470: send uniform(s) to vertex shader
    gl.uniform1f(xLoc, 1.0);
    gl.uniform1f(yLoc, 1.0);
    gl.uniform1f(colorLoc, 0.0);
    theta += (direction ? 0.05 : -0.05);
    gl.uniform1f(thetaLoc, theta);
    //gl.uniform1f(fadeLoc, 0.0);
    xExpand += (direction ? 0.1 : -0.1);
    yExpand += (direction ? 0.1 : -0.1);
    //rShift += 0.05;
    //gShift += 0.05;
    //bShift += 0.05;
    //fade += 0.05;
    colorShift += (direction ? 0.025 : -0.025);
    if (colorShift > 1.5) {
      direction = false;
    }
    else if (colorShift < 0.0) {
      direction = true;
    }

	//HW470: draw the object
	// You will need to change this to create the exploding outer parts effect
	// Hint: you will need more than one draw function call
    gl.drawArrays( gl.TRIANGLES, 0, 24 );

    gl.uniform1f(colorLoc, colorShift);
    //gl.uniform1f(fadeLoc, fade);
    gl.uniform1f(yLoc, yExpand);
    gl.drawArrays( gl.TRIANGLES, 24, 12);
    gl.uniform1f(yLoc, 1.0);
    gl.uniform1f(xLoc, xExpand);
    gl.drawArrays( gl.TRIANGLES, 36, 12);


	//re-render after delay
	setTimeout(function (){requestAnimFrame(render);}, delay);
  //requestAnimFrame(render);
}

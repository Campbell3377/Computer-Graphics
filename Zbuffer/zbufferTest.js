
var canvas;
var gl;

var points = [];
var colors = [];

// Play with zbuffer
// 0 = off and triangles drawn in order sent to GPU
// 1 = on
// see points definition: can move one triangle in z easily

var zbuffFlag = 1;

var RED = 0;
var GREEN = 1;
var BLUE = 2;
var YELLOW = 3;



window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // 9 vertices for 3 triangles
    // colored red, green, blue, resp.
    // can move blue triangle with zval setting
    // each set of 3 vertices should have same z for demo

   var zval = 0.9;
    
    points = [
     // red
        vec3(  0.5000,  0.5000, -0.6),
        vec3(  -0.5000,  0.5,  -0.6),
        vec3( 0.5, -0.5, -0.6),

     // green
        vec3(  0.5000,  0.8000, -0.5),
        vec3(  -0.5000,  0.8,  -0.5),
        vec3( 0.5, -0.5, -0.5),

     // blue
        vec3(  0.6000,  0.6000, zval),
        vec3(  -0.7000,  0.8,  zval),
        vec3( 0.5, -0.5, zval),

     // yellow -- runs z from -1 to 1

        vec3(  0.5000,  -0.5000, -0.9),
        vec3(  0.3000,  0.6,  0.0),
        vec3( -0.7, 0.9, 1.0)

    ];

    if(zbuffFlag === 1) {console.log("Z buffer is on");}
    else {console.log("Z buffer is off");}

    console.log("Three triangles parallel to xy-plane");
    console.log("Red   z = ",points[0][2]);
    console.log("Green z = ",points[3][2]);
    console.log("Blue  z = ",points[6][2]);
    console.log("Yellow z vals = ",points[9][2],points[10][2],points[11][2]);
    console.log("Draw order: red, green, blue, yellow");

    var baseColors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        vec3(1.0, 1.0, 0.0)
    ];

    // z=-0.8 triangle red
    colors.push( baseColors[RED] );
    colors.push( baseColors[RED] );
     colors.push( baseColors[RED] );

   // z = 0.5 triangel green
   colors.push( baseColors[GREEN] );
   colors.push( baseColors[GREEN] );
   colors.push( baseColors[GREEN] );

// z=zval triangel blue
   colors.push( baseColors[BLUE] );
   colors.push( baseColors[BLUE] );
   colors.push( baseColors[BLUE] );

// z=zval triangel yellow
   colors.push( baseColors[YELLOW] );
   colors.push( baseColors[YELLOW] );
   colors.push( baseColors[YELLOW] );

     

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Create a buffer object, initialize it, and associate it with the
    //  associated attribute variable in our vertex shader
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

if(zbuffFlag === 1) {gl.enable(gl.DEPTH_TEST);}



document.getElementById("Controls" ).onclick = function(event) {
        switch( event.srcElement.index ) {
          case 0:
            zbuffFlag = 1;
            gl.enable(gl.DEPTH_TEST);
            console.log("control: turn on z buffer ");
            break;
         case 1:
            zbuffFlag = 0;
            gl.disable(gl.DEPTH_TEST);
            console.log("control: turn off z buffer ");
            break;
       }
    };
//enable or disable hidden-surface removal
    
   
    render();
};


function render()
{

 


    if(zbuffFlag === 1){gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);}
    else {
    gl.clear( gl.COLOR_BUFFER_BIT );
}


    gl.drawArrays( gl.TRIANGLES, 0, points.length );

window.requestAnimFrame(render);

}

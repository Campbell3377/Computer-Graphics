
var canvas;
var gl;

var maxNumVertices  = 200;
var index = 0;

var cindex = 0;

var colors = [

    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0)   // cyan
];    
var t;
var numPolygons = 0;
var numIndices = [];
numIndices[0] = 0;
var start = [0];

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    var m = document.getElementById("mymenu");
    
    m.addEventListener("click", function() {
       cindex = m.selectedIndex;
        });
        
    var a = document.getElementById("Button1")
    a.addEventListener("click", function(){
    numPolygons++;
    numIndices[numPolygons] = 0;
    start[numPolygons] = index;
    render();
    });

    canvas.addEventListener("mousedown", function(){
		
		  var screenx = event.clientX - canvas.offsetLeft;
		  var screeny = event.clientY - canvas.offsetTop;
		  
		  var posX = 2*screenx/canvas.width-1;
		  var posY = 2*(canvas.height-screeny)/canvas.height-1;
		  
          t = vec2(posX,posY);
		  
		  console.log("click returns x=",event.clientX,"  y=",event.clientY);
	      console.log("  offsetLeft=",canvas.offsetLeft);
	      console.log("  offsetTop=",canvas.offsetTop);
	      console.log("  window click x=",screenx,"  y=",screeny);
	      console.log("  clip coord x=",posX,"  y=",posY);
		  
        
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(t));

        t = vec4(colors[cindex]);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(t));

        numIndices[numPolygons]++;
        index++;
    } );


    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW );
    var vPos = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPos, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPos );
    
    var cBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
}

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );

    for(var i=0; i<numPolygons; i++) {
        gl.drawArrays( gl.TRIANGLE_FAN, start[i], numIndices[i] );
    }
}

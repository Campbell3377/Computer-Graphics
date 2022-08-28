

var canvas;
var gl;

var numVertices  = 36;

var pointsArray = [];
var colorsArray = [];

var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 ),
    ];

var vertexColors = [
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
        vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
        vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
        vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
        vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
        vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    ];

var near = -2;
// if near set to positive, then shrink/grow orth will clip geometry
//var near = 1; 
var far = 5;
var radius = 2.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -4.0;
var right = 4.0;
var ytop = 4.0;
var bottom = -4.0;


var mvMatrix, pMatrix;
var mvMatrix2;
var modelView, projection;
var eye;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var testm;
var axis = vec3(1,0,0); 
var spintheta = 0.0;


// quad uses first index to set color for face

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[b]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[a]);    
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[d]); 
     colorsArray.push(vertexColors[a]);   
	 
	 
}

// Each face determines two triangles

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    colorCube();
	
	// push the origin and make it black
	var origin = vec4(0.0, 0.0, 0.0, 1.0);
	pointsArray.push(origin); 
	colorsArray.push(vertexColors[0]);
	console.log("Black point is origin");
	console.log("Canvas is [-1,1] x [-1, 1]");
	

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
 
    modelView = gl.getUniformLocation( program, "modelView" );
	mvMatrix = mat4();
	
	// Event Listeners
	
	document.getElementById("ButtonIdentity").onclick = function(){
		mvMatrix = mat4();
		console.log("ModelView matrix is just the identity", mvMatrix);
		};
		// Scale -- Translate demo
	document.getElementById("ButtonST").onclick = function(){
		mvMatrix = mult(scalem(0.5, 0.5, 0.5), translate(0.5, 0.5, 0.5));
		console.log("ModelView matrix S*T", mvMatrix); 
		};
	document.getElementById("ButtonTS").onclick = function(){
		mvMatrix = mult(translate(0.5, 0.5, 0.5), scalem(0.5, 0.5, 0.5));
		console.log("ModelView matrix S*T", mvMatrix);
		};
		
		// Translate -- Rotate demo
	document.getElementById("ButtonRT").onclick = function(){
		mvMatrix = mult(rotate(45.0, 0.0, 0.0, 1.0),translate(0.5, 0.5, 0.5));
		console.log("ModelView matrix R*T", mvMatrix);
		};
	document.getElementById("ButtonTR").onclick = function(){
		mvMatrix = mult(translate(0.5, 0.5, 0.5), rotate(45.0, 0.0, 0.0, 1.0));
		console.log("ModelView matrix T*R", mvMatrix);
		};
		
	// uniform Scale -- Rotate demo
	document.getElementById("ButtonRUS").onclick = function(){
		mvMatrix = mult(rotate(45.0, 0.0, 0.0, 1.0),scalem(0.5, 0.5, 0.5));
		console.log("ModelView matrix R*uniform S", mvMatrix);
		};
	document.getElementById("ButtonUSR").onclick = function(){
		mvMatrix = mult(scalem(0.5, 0.5, 0.5), rotate(45.0, 0.0, 0.0, 1.0));
		console.log("ModelView matrix uniform S*R", mvMatrix);
		};
		
	// NONuniform Scale -- Rotate demo
	document.getElementById("ButtonRS").onclick = function(){
		mvMatrix = mult(rotate(45.0, 0.0, 0.0, 1.0),scalem(0.5, 1.0, 1.0));
		console.log("ModelView matrix R*uniform S", mvMatrix);
		};
	document.getElementById("ButtonSR").onclick = function(){
		mvMatrix = mult(scalem(0.5, 1.0, 1.0), rotate(45.0, 0.0, 0.0, 1.0));
		console.log("ModelView matrix uniform S*R", mvMatrix);
		};
    
       
    render();
}


var render = function() {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
        
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );        
        gl.drawArrays( gl.TRIANGLES, 0, numVertices );
		
		// draw the origin
		mvMatrix2 = mat4();
		gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix2) );
		gl.drawArrays( gl.POINTS, numVertices, 1 );
		
		 
		
        requestAnimFrame(render);
    }

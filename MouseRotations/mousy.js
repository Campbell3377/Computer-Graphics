

var canvas;
var gl;

var NumVertices  = 36;

var pointsArray = [];
var colorsArray = [];
 
 

var vertices = [
    vec4(-0.5, -0.5,  0.5, 1.0),
    vec4(-0.5,  0.5,  0.5, 1.0),
    vec4(0.5,  0.5,  0.5, 1.0),
    vec4(0.5, -0.5,  0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5,  0.5, -0.5, 1.0),
    vec4(0.5,  0.5, -0.5, 1.0),
    vec4( 0.5, -0.5, -.5, 1.0) 
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

var viewer = 
{
	eye: vec3(0.0, 0.0, 3.0),
	at:  vec3(0.0, 0.0, 0.0),  
	up:  vec3(0.0, 1.0, 0.0),
	
	// for moving around object; set vals so at origin
	radius: null,
    theta: 0,
    phi: 0
};

// Create better params that suit your geometry
var perspProj = 
 {
	fov: 45,
	aspect: 1,
	near: 0.1,
	far:  10
 }

// mouse interaction
 
var mouse =
{
    prevX: 0,
    prevY: 0,

    leftDown: false,
    rightDown: false,
};

var mvMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
 



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
	var messageLookEye = document.getElementById( "lookEye" );
	var messageLookAt  = document.getElementById( "lookAt" );
	var messageLookUp  = document.getElementById( "lookUp" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    aspect =  canvas.width/canvas.height;
    
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    colorCube();
	
	// init radius of sphere to move around object
	var diff = subtract(viewer.eye,viewer.at);
	viewer.radius = length(diff);
	
	console.log("init radius = ",viewer.radius);
	console.log("viewer eye =",viewer.eye);
	console.log("viewer at =",viewer.at);
	console.log("viewer up =",viewer.up);
	console.log("perspective fov = ",perspProj.fov);
	console.log("perspective fov = ",perspProj.aspect);
	console.log("perspective fov = ",perspProj.near);
	console.log("perspective fov = ",perspProj.far);
	
	
	messageLookEye.innerHTML = "eye = " + formatOut(viewer.eye[0],2) + ",  " + formatOut(viewer.eye[1],2)  + ",  " + formatOut(viewer.eye[2],2);
			messageLookAt.innerHTML = "at = " + viewer.at;
			messageLookUp.innerHTML = "up = " +viewer.up;
	


    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
    
		// init modelview and projection 
	mvMatrix = lookAt(viewer.eye, viewer.at , viewer.up);
	projectionMatrix = perspective(perspProj.fov, perspProj.aspect, perspProj.near, perspProj.far);
	
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );


	// ========================== Camera control via mouse ============================================
	// There are 4 event listeners: onmouse down, up, leave, move
	//
	// on onmousedown event
	// check if left/right button not already down
	// if just pressed, flag event with mouse.leftdown/rightdown and stores current mouse location
    document.getElementById("gl-canvas").onmousedown = function (event)
    {
        if(event.button == 0 && !mouse.leftDown)
        {
            mouse.leftDown = true;
            mouse.prevX = event.clientX;
            mouse.prevY = event.clientY;
        }
        else if (event.button == 2 && !mouse.rightDown)
        {
            mouse.rightDown = true;
            mouse.prevX = event.clientX;
            mouse.prevY = event.clientY;
        }
    };

	// onmouseup event
	// set flag for left or right mouse button to indicate that mouse is now up
    document.getElementById("gl-canvas").onmouseup = function (event)
    {
        // Mouse is now up
        if (event.button == 0)
        {
            mouse.leftDown = false;
        }
        else if(event.button == 2)
        {
            mouse.rightDown = false;
        }

    };

	// onmouseleave event
	// if mouse leaves canvas, then set flags to indicate that mouse button no longer down.
	// This might not actually be the case, but it keeps input from the mouse when outside of app
	// from being recorded/used.
	// (When re-entering canvas, must re-click mouse button.)
    document.getElementById("gl-canvas").onmouseleave = function ()
    {
        // Mouse is now up
        mouse.leftDown = false;
        mouse.rightDown = false;
    };

	// onmousemove event
	// Move the camera based on mouse movement.
	// Record the change in the mouse location
	// If left mouse down, move the eye around the object based on this change
	// If right mouse down, move the eye closer/farther to zoom
	// If changes to eye made, then update modelview matrix

    document.getElementById("gl-canvas").onmousemove = function (event)
    {
		// only record changes if mouse button down
		if (mouse.leftDown || mouse.rightDown) {
			
			// Get changes in x and y at this point in time
			var currentX = event.clientX;
			var currentY = event.clientY;
			
			// calculate change since last record
			var deltaX = event.clientX - mouse.prevX;
			var deltaY = event.clientY - mouse.prevY;
			
			console.log("enter onmousemove with left/right button down");
			console.log("viewer.eye = ",viewer.eye,"  viewer.at=",viewer.at,"  viewer.up=",viewer.up);
			console.log("event clientX = ",currentX,"  clientY = ",currentY);
			console.log("mouse.prevX = ",mouse.prevX,"  prevY = ",mouse.prevY);
			console.log("change in mouse location deltaX = ",deltaX,"  deltaY = ",deltaY);

			// Compute camera rotation on left click and drag
			if (mouse.leftDown)
			{
				console.log("onmousemove and leftDown is true");
				console.log("theta=",viewer.theta,"  phi=",viewer.phi);
				
				// Perform rotation of the camera
				//
				if (viewer.up[1] > 0)
				{
					viewer.theta -= 0.01 * deltaX;
					viewer.phi -= 0.01 * deltaY;
				}
				else
				{
					viewer.theta += 0.01 * deltaX;
					viewer.phi -= 0.01 * deltaY;
				}
				console.log("incremented theta=",viewer.theta,"  phi=",viewer.phi);
				
				// Wrap the angles
				var twoPi = 6.28318530718;
				if (viewer.theta > twoPi)
				{
					viewer.theta -= twoPi;
				}
				else if (viewer.theta < 0)
				{
					viewer.theta += twoPi;
				}

				if (viewer.phi > twoPi)
				{
					viewer.phi -= twoPi;
				}
				else if (viewer.phi < 0)
				{
					viewer.phi += twoPi;
				}
				console.log("wrapped  theta=",viewer.theta,"  phi=",viewer.phi);

			} // end mouse.leftdown
			else if(mouse.rightDown)
			{
				console.log("onmousemove and rightDown is true");
				
				// Perform zooming; don't get too close           
				viewer.radius -= 0.01 * deltaX;
				viewer.radius = Math.max(0.1, viewer.radius);
			}
			
			//console.log("onmousemove make changes to viewer");
			
			// Recompute eye and up for camera
			var threePiOver2 = 4.71238898;
			var piOver2 = 1.57079632679;		
			var pi = 3.14159265359;
			
			//console.log("viewer.radius = ",viewer.radius);
			
			// pre-compute this value
			var r = viewer.radius * Math.sin(viewer.phi + piOver2);
			
			// eye on sphere with north pole at (0,1,0)
			// assume user init theta = phi = 0, so initialize to pi/2 for "better" view
			
			viewer.eye = vec3(r * Math.cos(viewer.theta + piOver2), viewer.radius * Math.cos(viewer.phi + piOver2), r * Math.sin(viewer.theta + piOver2));
			
			//add vector (at - origin) to move 
			for(k=0; k<3; k++)
				viewer.eye[k] = viewer.eye[k] + viewer.at[k];
			
			//console.log("theta=",viewer.theta,"  phi=",viewer.phi);
			//console.log("eye = ",viewer.eye[0],viewer.eye[1],viewer.eye[2]);
			//console.log("at = ",viewer.at[0],viewer.at[1],viewer.at[2]);
			//console.log(" ");
			
			// modify the up vector
			// flip the up vector to maintain line of sight cross product up to be to the right
			// true angle is phi + pi/2, so condition is if angle < 0 or > pi
			
			if (viewer.phi < piOver2 || viewer.phi > threePiOver2) {
				viewer.up = vec3(0.0, 1.0, 0.0);
			}
			else {
				viewer.up = vec3(0.0, -1.0, 0.0);
			}
			//console.log("up = ",viewer.up[0],viewer.up[1],viewer.up[2]);
			//console.log("update viewer.eye = ",viewer.eye,"  viewer.at=",viewer.at,"  viewer.up=",viewer.up);
			
			// Recompute the view
			mvMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);
			
			console.log("mvMatrix = ",mvMatrix);
			 

			mouse.prevX = currentX;
			mouse.prevY = currentY;
			
			messageLookEye.innerHTML = "eye = " + formatOut(viewer.eye[0],2) + ",  " + formatOut(viewer.eye[1],2)  + ",  " + formatOut(viewer.eye[2],2);
			messageLookAt.innerHTML = "at = " + viewer.at;
			messageLookUp.innerHTML = "up = " +viewer.up;
			
			console.log("onmousemove: made change");
			console.log("viewer.eye = ",viewer.eye,"  viewer.at=",viewer.at,"  viewer.up=",viewer.up);
		
		} // end if button down

    };
	

    render();
}


var render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
            
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
	gl.drawArrays(gl.POINTS, 0,1);
	gl.drawArrays(gl.POINTS, 11,1);
	
    requestAnimFrame(render);
}

// input is the number to format
// decimals is the number of decimals to print
function formatOut (input, decimals) {
  return Math.floor(input * Math.pow(10, decimals)) / Math.pow(10, decimals) }


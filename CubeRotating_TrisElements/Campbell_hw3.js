
var canvas;
var gl;
var program;

var numVertices  = 36;

var axis = 0;
//var xAxis = 0;
//var yAxis =1;
//var zAxis = 2;
//var theta = [ 0, 0, 0 ];
//var thetaLoc;

var pointsArray = [];
var normalsArray = [];
var vertices = [];


var temp = [0.0, 0.0, 0.0];
var numT = 50.0;
var tIncr = 2.0 / numT;
var numTheta = 50.0;
var index = 0.0;

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
	fov: 60,
	aspect: 1.0,
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

var lightPosition = vec4(3.0, 0.0, 0.0, 1.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 1.0;

var fovScale = 60.0;
var shinyScale = 1.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var mvMatrix, projectionMatrix;
var modelViewMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var sorSwap = 0.0;

var colorCount = 0.0;
var lightLocCount = 0.0;


function returnCoord(nT, nTheta, flag) {    //Parameterized function to return coordinates given (t, theta)

      var incr = radians (360.0 / numTheta);  //set theta increment
      var y = -1.0 + nT*tIncr;  //set y
        if (flag == 0) {        //if flag is 0 we're calculating points
          if (sorSwap == 0.0) {       //if sorSwap is 0 we'll fetch the coordinates for the Cylinder
            var x = Math.cos(nTheta*incr) * 1.0;
            var z = -(Math.sin(nTheta*incr)) * 1.0;
          }
          else if (sorSwap == 1.0) {  //if sorSwap is 1 we will print a new SOR
            var x = Math.cos(nTheta*incr) * (y*y+0.1);  //I liked this hourglass/wormhole shape
            var z = -(Math.sin(nTheta*incr)) * (y*y+0.1);
          }
          if (x > -0.000001 && x < 0.000001 ) {
            x = 0;
          }
          if (z > -0.000001 && z < 0.000001 ) {
            z = 0;
          }
          temp = [x, y, z];
          return temp;
        }
        else if (flag == 1) {   //if flag is 1 we are calculating normals
          if (sorSwap == 0.0) { //if sorSwap is 0 we'll fetch the normals for the Cylinder
            temp = mix([0, 1, 0], [-(Math.sin(nTheta*incr)), 0, -(Math.cos(nTheta*incr))], 0.5);
          }
          else if (sorSwap == 1.0) {  //If sorSwap is 1 fetch normal for new SOR
            temp = mix([2*y*Math.cos(nTheta*incr), 1, -2*y*Math.sin(nTheta*incr)], [-(Math.sin(nTheta*incr))*(y*y+0.1), 0, -(Math.cos(nTheta*incr))*(y*y+0.1)], 0.5);
          }
          temp = normalize(temp, false);
          return temp;
        }
}

function initSoR () {                         //inserts points in a strip fashion, i.e. 012 213 representing a square
        for(var i=0; i<numT; i++) {
            for(var j=0; j<numTheta;j++) {
                pointsArray.push( returnCoord(i, j, 0) );
                pointsArray.push( returnCoord(i+1, j, 0) );
                pointsArray.push( returnCoord(i, j+1, 0) );
                // console.log(pointsArray[i+j]);

                normalsArray.push( returnCoord(i, j, 1) );
                normalsArray.push( returnCoord(i+1, j, 1) );
                normalsArray.push( returnCoord(i, j+1, 1) );
                index += 3;

                pointsArray.push( vec3( returnCoord(i, j+1, 0) ) );
                pointsArray.push( vec3( returnCoord(i+1, j, 0) ) );
                pointsArray.push( vec3( returnCoord(i+1, j+1, 0) ) );
                normalsArray.push( vec3( returnCoord(i, j+1, 1) ) );
                normalsArray.push( vec3( returnCoord(i+1, j, 1) ) );
                normalsArray.push( vec3( returnCoord(i+1, j+1, 1) ) );
                index += 3;

    		}
    	}

}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    var messageLookEye = document.getElementById( "lookEye" );
  	var messageLookAt  = document.getElementById( "lookAt" );
  	var messageLookUp  = document.getElementById( "lookUp" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);;

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    initSoR();

    var l3d = vec3(lightPosition[0], lightPosition[1], lightPosition[2]);
    pointsArray.push(l3d)
  	// not used, but size should match points
  	normalsArray.push(l3d);

    //colorCube();

  var diff = subtract(viewer.eye,viewer.at);
  viewer.radius = length(diff);

  console.log("minMax is roughly -1 to 1 for x and z and -.5 to .5 for y");
  console.log("viewer eye =",viewer.eye);
  console.log("viewer at =",viewer.at);
  console.log("viewer up =",viewer.up);
  console.log("perspective fov = ",perspProj.fov);
  console.log("perspective aspect = ",perspProj.aspect);
  console.log("perspective near = ",perspProj.near);
  console.log("perspective far = ",perspProj.far);
  console.log("Initial Light Position", lightPosition);

  messageLookEye.innerHTML = "eye = " + formatOut(viewer.eye[0],2) + ",  " + formatOut(viewer.eye[1],2)  + ",  " + formatOut(viewer.eye[2],2);
      messageLookAt.innerHTML = "at = " + viewer.at;
      messageLookUp.innerHTML = "up = " +viewer.up;



    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


    // init modelview and projection
	mvMatrix = lookAt(viewer.eye, viewer.at , viewer.up);
	projectionMatrix = perspective(perspProj.fov, perspProj.aspect, perspProj.near, perspProj.far);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    gl.uniform4fv( gl.getUniformLocation(program,
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program,
       "shininess"),materialShininess );


    //event listeners for buttons

      document.getElementById("ButtonChangeSOR").onclick = function(){
          if (sorSwap == 0.0) {
            sorSwap = 1.0;
            console.log("Switch to Hourglass");
          }
          else if (sorSwap == 1.0) {
            sorSwap = 0.0;
            console.log("Switch to Cylinder");
          }
          console.log(sorSwap);
          index = 0;
          pointsArray = [];
          normalsArray = [];
          init();
      };

    document.getElementById("ButtonE").onclick = function() { //change material to emerald
      var materialAmbient = vec4( 0.0215, 0.1745, 0.0215, 1.0 );
      var materialDiffuse = vec4( 0.07568, 0.61424, 0.07568, 1.0 );
      var materialSpecular = vec4( 0.633, 0.727811, 0.633, 1.0 );
      var materialShininess = 60.0;
      console.log("Changed material to emerald");

      ambientProduct = mult(lightAmbient, materialAmbient);
      diffuseProduct = mult(lightDiffuse, materialDiffuse);
      specularProduct = mult(lightSpecular, materialSpecular);
      gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
         flatten(ambientProduct));
      gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
         flatten(diffuseProduct) );
      gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
         flatten(specularProduct) );
    };
    document.getElementById("ButtonR").onclick = function() {
      var materialAmbient = vec4( 0.1745, 0.01175, 0.01175, 1.0 );
      var materialDiffuse = vec4( 0.61424, 0.04136, 0.04136, 1.0 );
      var materialSpecular = vec4( 0.727811, 0.626959, 0.626959, 1.0 );
      var materialShininess = 60.0;
      console.log("Changed material to ruby");

      ambientProduct = mult(lightAmbient, materialAmbient);
      diffuseProduct = mult(lightDiffuse, materialDiffuse);
      specularProduct = mult(lightSpecular, materialSpecular);
      gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
         flatten(ambientProduct));
      gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
         flatten(diffuseProduct) );
      gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
         flatten(specularProduct) );
    };

    document.getElementById("ButtonChangeL").onclick = function() {
      switch (colorCount) {
        case 0:
          var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
          var lightDiffuse = vec4( 1.0, 0.0, 0.0, 1.0 );
          var lightSpecular = vec4( 1.0, 0.0, 0.0, 1.0 );
          console.log("Light color changed to Red");
          colorCount++;
        break;
        case 1:
          var lightAmbient = vec4(0.0, 0.2, 0.0, 1.0 );
          var lightDiffuse = vec4( 0.0, 1.0, 0.0, 1.0 );
          var lightSpecular = vec4( 0.0, 1.0, 0.0, 1.0 );
          console.log("Light color changed to Green");
          colorCount++;
        break;
        case 2:
          var lightAmbient = vec4(0.0, 0.0, 0.2, 1.0 );
          var lightDiffuse = vec4( 0.0, 0.0, 1.0, 1.0 );
          var lightSpecular = vec4( 0.0, 0.0, 1.0, 1.0 );
          console.log("Light color changed to Blue");
          colorCount++;
        break;
        case 3:
          var lightAmbient = vec4(0.2, 0.0, 0.2, 1.0 );
          var lightDiffuse = vec4( 1.0, 0.0, 1.0, 1.0 );
          var lightSpecular = vec4( 1.0, 0.0, 1.0, 1.0 );
          console.log("Light color changed to Magenta");
          colorCount++;
        break;
        case 4:
          var lightAmbient = vec4(0.2, 0.2, 0.0, 1.0 );
          var lightDiffuse = vec4( 1.0, 1.0, 0.0, 1.0 );
          var lightSpecular = vec4( 1.0, 1.0, 0.0, 1.0 );
          console.log("Light color changed to Yellow");
          colorCount++;
        break;
        case 5:
          var lightAmbient = vec4(0.0, 0.2, 0.2, 1.0 );
          var lightDiffuse = vec4( 0.0, 1.0, 1.0, 1.0 );
          var lightSpecular = vec4( 0.0, 1.0, 1.0, 1.0 );
          console.log("Light color changed to Cyan");
          colorCount++;
          break;
        case 6:
          var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
          var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
          var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
          console.log("Light color changed to White");
          colorCount = 0;
        break;
        default:
          var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
          var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
          var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
          console.log("Light color changed to White");
          colorCount = 0;
        break;
      }


      ambientProduct = mult(lightAmbient, materialAmbient);
      diffuseProduct = mult(lightDiffuse, materialDiffuse);
      specularProduct = mult(lightSpecular, materialSpecular);
      gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
         flatten(ambientProduct));
      gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
         flatten(diffuseProduct) );
      gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
         flatten(specularProduct) );
    };

    document.getElementById("fovSlider").onchange = function() {
          fovScale = event.srcElement.value;
          perspProj.fov = fovScale;

  		projectionMatrix = perspective(perspProj.fov, perspProj.aspect, perspProj.near, perspProj.far);
         //flatten(ambientProduct));
      };
      document.getElementById("shininessSlider").onchange = function() {
            materialShininess = event.srcElement.value;
            console.log("new shininess = ", materialShininess);

            gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
           //flatten(ambientProduct));
        };
      document.getElementById("ButtonChangeLoc").onclick = function() {
        console.log(lightLocCount);
        switch (lightLocCount) {
          case 0:
            lightPosition = vec4(0.0, 0.0, 3.0, 1.0 );
            //pointsArray[index] = vec3(0.0, 0.0, 1.0);
            console.log("Light location changed changed to ", lightPosition);
            lightLocCount++;
          break;
          case 1:
            lightPosition = vec4(3.0, 0.0, 3.0, 1.0 );
            console.log("Light location changed changed to ", lightPosition);
            lightLocCount++;
          break;
          case 2:
            lightPosition = vec4(3.0, 0.0, 0.0, 1.0 );
            console.log("Light location changed changed to ", lightPosition);
            lightLocCount++;
          break;
          case 3:
            lightPosition = vec4(3.0, 0.0, -3.0, 1.0 );
            console.log("Light location changed changed to ", lightPosition);
            lightLocCount++;
          break;
          case 4:
            lightPosition = vec4(3.0, 3.0, 0.0, 1.0 );
            console.log("Light location changed changed to ", lightPosition);
            lightLocCount++;
          break;
          case 5:
            lightPosition = vec4(-3.0, 0.0, -3.0, 1.0 );
            console.log("Light location changed changed to ", lightPosition);
            lightLocCount++;
          break;
          case 6:
            lightPosition = vec4(3.0, 0.0, 0.0, 1.0 );
            console.log("Light location changed changed to ", lightPosition);
            lightLocCount = 0;
          break;
          default:
            lightPosition = vec4(3.0, 0.0, 0.0, 1.0 );
            console.log("Light location changed changed to ", lightPosition);
            lightLocCount = 0;
          break;
        }
        gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
      };
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

  			/*console.log("enter onmousemove with left/right button down");
  			console.log("viewer.eye = ",viewer.eye,"  viewer.at=",viewer.at,"  viewer.up=",viewer.up);
  			console.log("event clientX = ",currentX,"  clientY = ",currentY);
  			console.log("mouse.prevX = ",mouse.prevX,"  prevY = ",mouse.prevY);
  			console.log("change in mouse location deltaX = ",deltaX,"  deltaY = ",deltaY);*/

  			// Compute camera rotation on left click and drag
  			if (mouse.leftDown)
  			{
  				//console.log("onmousemove and leftDown is true");
  				//console.log("theta=",viewer.theta,"  phi=",viewer.phi);

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
  				//console.log("incremented theta=",viewer.theta,"  phi=",viewer.phi);

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
  				//console.log("wrapped  theta=",viewer.theta,"  phi=",viewer.phi);

  			} // end mouse.leftdown
  			else if(mouse.rightDown)
  			{
  				//console.log("onmousemove and rightDown is true");

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

  			//console.log("mvMatrix = ",mvMatrix);


  			mouse.prevX = currentX;
  			mouse.prevY = currentY;

  			messageLookEye.innerHTML = "eye = " + formatOut(viewer.eye[0],2) + ",  " + formatOut(viewer.eye[1],2)  + ",  " + formatOut(viewer.eye[2],2);
  			messageLookAt.innerHTML = "at = " + viewer.at;
  			messageLookUp.innerHTML = "up = " +viewer.up;

  			//console.log("onmousemove: made change");
  			//console.log("viewer.eye = ",viewer.eye,"  viewer.at=",viewer.at,"  viewer.up=",viewer.up);

  		} // end if button down

      };

    render();
}

var render = function()
{
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //theta[axis] += 0.1;
  //gl.uniform3fv(thetaLoc, theta);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mvMatrix) );
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

  gl.uniform1i(gl.getUniformLocation(program,"colorFlag"), 1);

  for( var i=0; i<pointsArray.length; i+=3) { //As said before the list is ordered to print square sections
      gl.drawArrays( gl.TRIANGLES, i, 3 );    //of each pair of triangles indexed by 3
  }

  modelViewMatrix = mat4();
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
  gl.uniform1i( gl.getUniformLocation(program, "colorFlag"),0 );
	gl.drawArrays( gl.POINTS, index, 1);


    window.requestAnimFrame( render );
}

function formatOut (input, decimals) {
  return Math.floor(input * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

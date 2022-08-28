

var canvas;
var gl;

var maxNumTriangles = 200;

var maxNumVertices  = 3 * maxNumTriangles;

var numVertices = 36;

var pointsArray = [];
var index = 0;
var stack = [];

var axis = 0;
var xAxis = 0;
var yAxis =1;
var zAxis = 2;


// var colors = [
//         vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
//         vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
//         vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
//         vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
//         vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
//         vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
//         vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
//         vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
//     ];
var mvMatrix, pMatrix;
var mvMatrix2;
var modelView, projection;
var eye;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);




function MatrixStack() {
  this.stack = [];
  this.restore();
}

MatrixStack.prototype.restore = function() {
  this.stack.pop();
  if (this.stack.length < 1) {
    this.stack[0] = m4.identity();
  }
};

MatrixStack.prototype.save = function() {
  this.stack[0] = m4.identity();
};

MatrixStack.prototype.getCurrentMatrix = function() {
  return this.stack[this.stack.length - 1].slice();
};

MatrixStack.prototype.setCurrentMatrix = function(m) {
  return this.stack[this.stack.length - 1] = m;
};

MatrixStack.prototype.translate = function(x, y, z) {
  var m = this.getCurrentMatrix();
  this.setCurrentMatrix(m4.translate(m, x, y, z));
};

MatrixStack.prototype.rotateX = function(angleInRadians) {
  var m = this.getCurrentMatrix();
  this.setCurrentMatrix(m4.xRotate(m, angleInRadians));
};

MatrixStack.prototype.rotateY = function(angleInRadians) {
  var m = this.getCurrentMatrix();
  this.setCurrentMatrix(m4.yRotate(m, angleInRadians));
};

MatrixStack.prototype.rotateZ = function(angleInRadians) {
  var m = this.getCurrentMatrix();
  this.setCurrentMatrix(m4.zRotate(m, angleInRadians));
};

MatrixStack.prototype.scale = function(x, y, z) {
  var m = this.getCurrentMatrix();
  this.setCurrentMatrix(m4.scale(m, x, y, z));
};




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

    // colorCube();

	// push the origin and make it black
	// var origin = vec4(0.0, 0.0, 0.0, 1.0);
	// pointsArray.push(origin);
	// colorsArray.push(vertexColors[0]);
	// console.log("Black point is origin");
	// console.log("Canvas is [-1,1] x [-1, 1]");


    // var cBuffer = gl.createBuffer();
    // gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    // gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );
    //
    // var vColor = gl.getAttribLocation( program, "vColor" );
    // gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    // gl.enableVertexAttribArray( vColor);
    //
    // var vBuffer = gl.createBuffer();
    // gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    // gl.bufferData( gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW );
    //
    // var vPosition = gl.getAttribLocation( program, "vPosition" );
    // gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    // gl.enableVertexAttribArray( vPosition );

    modelView = gl.getUniformLocation( program, "modelView" );
	mvMatrix = mat4();

	// Event Listeners

  canvas.addEventListener("mousedown", function(){

      console.log("mousedown x,y = ",event.clientX,"  ", event.clientY);

      gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );

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


      gl.drawElements(gl.TRIANGLES, numVertices, gl.UNSIGNED_SHORT, 0);
  } );

  document.getElementById("rotateX").onclick = function(){
      axis = xAxis;
  };
  document.getElementById("rotateY").onclick = function(){
      axis = yAxis;
  };
  document.getElementById("rotateZ").onclick = function(){
      axis = zAxis;
  };
  document.getElementById("rotateRandom").onclick = function(){

  };

  document.getElementById("slider").onchange = function() {
      speed = 100 - event.srcElement.value;
      console.log("speed = ", speed);
  };



    // render();
}

//
// var render = function() {
//         gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//
//
//         // gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
//         // gl.drawArrays( gl.TRIANGLES, 0, numVertices );
//
//         gl.drawArrays(gl.POINTS, 0, index);
//
// 		// draw the origin
// 		// mvMatrix2 = mat4();
// 		// gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix2) );
// 		// gl.drawArrays( gl.POINTS, numVertices, 1 );
//
//
//
//         requestAnimFrame(render);
//     }


var canvas;
var gl;

var numVertices  = 36;

var points = [];
var colors = [];

var axis = 0;
var angle = 0.0;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var theta = [ 0, 0, 0 ];
var modelView, projection;
var mvMatrix;
var mvMatrix2;
var mv;
var scale;
var direction = true;

var mvStack = [];
var mvStack2 = [];
var numTris = 0;

var indices = [
    1, 0, 3,
    3, 2, 1,
    2, 3, 7,
    7, 6, 2,
    3, 0, 4,
    4, 7, 3,
    6, 5, 1,
    1, 2, 6,
    4, 5, 6,
    6, 7, 4,
    5, 4, 0,
    0, 1, 5
];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    colorCube();

    gl.enable(gl.DEPTH_TEST);;

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // array element buffer

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // color array atrribute buffer

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    // vertex array attribute buffer

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation(program, "theta");

    modelView = gl.getUniformLocation( program, "modelView" );
    mvMatrix = mat4();
    mv = mat4();
    mvStack.push(mvMatrix);


      document.getElementById("rotateX").onclick = function(){
          axis = xAxis;
      };
      document.getElementById("rotateY").onclick = function(){
          axis = yAxis;
      };
      document.getElementById("rotateZ").onclick = function(){
          axis = zAxis;
      };

      // document.getElementById("myRange").addEventListener("change", function (){
      //     scale = (event.srcElement.value)/100;
      //     //mvMatrix = scale
      //     console.log("scale = ", scale);
      // } );

      // document.getElementById("slider").onchange = function() {
      //     scale = event.srcElement.value/100;
  		// console.log("scale = ",scale);
      // };



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
         console.log("convert to clip coords",t);

         var z = (Math.random() * (1.0 - (-1.0)) + (-1.0));
         mvMatrix = mat4();
         mvMatrix2 = translate(-t[0], -t[1], -z);
         mvMatrix = mult(mvMatrix, translate(t[0], t[1], z));
         // mvStack.push(mvMatrix);
         // mvStack2.push(mvMatrix2);

         numTris++;
         // console.log("ModelView matrix: ", mvMatrix);
    } );



    render();
};


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d)
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var vertexColors = [
      [ 0.44, 0.91, 0.76, 1.0 ],  // teal
      [ 1.0, 0.0, 0.0, 1.0 ],  // red
      [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
      [ 0.0, 1.0, 0.0, 1.0 ],  // green
      [ 0.0, 0.0, 1.0, 1.0 ],  // blue
      [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
      [ 0.912, 0.611, 0.006, 1.0 ],  // orange
      [ 0.0, 1.0, 1.0, 1.0 ]   // cyan
    ];

    // We need to partition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    console.log("indices = ",indices);

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);

    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 0.1;
    angle = 1.0;

    // mvStack.forEach((element, index) => {
    //   mv = mat4();
    //   mv = mult(mv, mvStack.pop());
    //   mv = mult(mv, rotate(angle, theta));
    //   mv = mult(mv, mvStack2.pop());
    //   mv = mult(mv, scalem(scale, scale, scale));
    //
    //   gl.uniformMatrix4fv(modelView, false, flatten(mv));
    //   gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    // });
    for (var i = 0; i < numTris; i++) {
      mv = mult(mv, mvMatrix);
      mv = mult(mv, rotate(angle, theta));
      mv = mult(mv, mvMatrix2);
      // mv = mult(mv, scalem(scale, scale, scale));
      // mv = mv * mvMatrix * rotate(angle, theta) * mvMatrix2;
      gl.uniformMatrix4fv(modelView, false, flatten(mv));
      gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }




      // gl.drawElements( gl.TRIANGLES, numVertices, gl.UNSIGNED_SHORT, 0 );
      // gl.drawArrays( gl.LINE_LOOP, 0, 4 );
    	// gl.drawArrays( gl.LINE_LOOP, 4, 4 );



	// only problem is the color of the vertices makes these loops the same color as cube
	// would need copy of vertices with distinctive color (black)
	// (to see as is, comment out triangles draw above)


    requestAnimFrame( render );
}

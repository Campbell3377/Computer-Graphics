

var canvas;
var gl;
var program;

var numTimesToSubdivide = 4;

var index = 0;

var pointsArray = [];
var normalsArray = [];




//init eye on z-axis
var radius = 5.0;
var theta  = 0.0;
var phi    = Math.PI / 2.0;
var dr = 10.0 * Math.PI/180.0;


var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;

// would be a good idea to make near dependent on radius too
var near = 0.01;
var farFactor = 3.0;
var far = radius * farFactor;

// initialize for sphere created by repeated subdivision of tetrahedron
var va = vec3(0.0, 0.0, -1.0);
var vb = vec3(0.0, 0.942809, 0.333333);
var vc = vec3(-0.816497, -0.471405, 0.333333);
var vd = vec3(0.816497, -0.471405, 0.333333);

// light position in eye coordinates
// light at eye
var lightPosition = vec4(0.0, 0.0, 0.0, 1.0 );
// light to the right of sphere at start
// if move eye, light stays
//var lightPosition = vec4(5.0, 0.0, -radius, 1.0 );
//var lightPosition = vec4(1.0, 1.0, 1.0, 1.0 );

//var lightAmbient = vec4(0.0, 0.0, 0.0, 1.0 );
//var lightAmbient = vec4(0.8, 0.8, 0.8, 1.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
//var lightAmbient = vec4(0.0, 0.2, 0.0, 1.0 );

//var lightDiffuse = vec4( 0.0, 0.0, 0.0, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
//var lightDiffuse = vec4( 0.0, 1.0, 0.0, 1.0 );

//var lightSpecular = vec4(  0.0, 0.0, 0.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
//var lightSpecular = vec4(  0.0, 1.0, 0.0, 1.0 );

// starter color
// var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
// var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
// var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
// var materialShininess = 1.0;

// silver (and set shini to 1000)
// var materialAmbient = vec4( 0.19225,0.19225,0.19225, 1.0 );
// var materialDiffuse = vec4( 0.5754, 0.5754, 0.5754, 1.0 );
// var materialSpecular = vec4( 0.0508273, 0.0508273, 0.0508273, 1.0 );
// var materialShininess = 1000.0;

// red material; try changing light color
var materialAmbient = vec4( 1.0, 0.0, 0.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.0, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 0.0, 0.0, 1.0 );
var materialShininess = 1.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

function triangle(a, b, c) {

     normalsArray.push(a);
     normalsArray.push(b);
     normalsArray.push(c);
	 // play: create an incorrect normal vector to see what happens
     //normalsArray.push(a + Math.random());
     //normalsArray.push(b + Math.random());
     //normalsArray.push(b + Math.random());

     pointsArray.push(a);
     pointsArray.push(b);
     pointsArray.push(c);

     index += 3;
}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

		// normalize 3d vector
        ab = normalize(ab, false);
        ac = normalize(ac, false);
        bc = normalize(bc, false);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
	// comment out next line to create an open object
    divideTriangle(a, c, d, n);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );


    gl.enable(gl.DEPTH_TEST);

	// play with turning culling on/off (sphere is open)
	//gl.enable(gl.CULL_FACE);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

	console.log("Ambient products = ",ambientProduct);
	console.log("Diffuse products = ",diffuseProduct);
	console.log("Specular products = ",specularProduct);

	// create sphere
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
	console.log("computed sphere  index = ",index);

	// load the light
	pointsArray.push(lightPosition[0]);
	pointsArray.push(lightPosition[1]);
	pointsArray.push(lightPosition[2]);
	// not used, but size should match points
	normalsArray.push(1.0);
	normalsArray.push(0.0);
	normalsArray.push(0.0);



    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
	console.log("vNormal = ",vNormal);
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    document.getElementById("Button0").onclick = function(){
		radius *= 2.0;
		console.log("radius = ",radius);
		var testeye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
		console.log("new eye = ",testeye);
		far = radius * farFactor;
		};
    document.getElementById("Button1").onclick = function(){
		radius *= 0.5;
		console.log("radius = ",radius);
		var testeye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
		console.log("new eye = ",testeye);
		far = radius * farFactor;
		};
    document.getElementById("Button2").onclick = function(){theta += dr;};
    document.getElementById("Button3").onclick = function(){theta -= dr;};
    document.getElementById("Button4").onclick = function(){phi += dr;};
    document.getElementById("Button5").onclick = function(){phi -= dr;};

    document.getElementById("Button6").onclick = function(){
        numTimesToSubdivide++;
        index = 0;
        pointsArray = [];
        normalsArray = [];
        init();
    };
    document.getElementById("Button7").onclick = function(){
        if(numTimesToSubdivide) numTimesToSubdivide--;
        index = 0;
        pointsArray = [];
        normalsArray = [];
        init();
    };


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



	console.log("light position = ",lightPosition);

    render();
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));



    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

	gl.uniform1i(gl.getUniformLocation(program,"colorFlag"), 1);


    for( var i=0; i<index; i+=3)
        gl.drawArrays( gl.TRIANGLES, i, 3 );

	// draw the light -- not hooked up to shader -- see "shadedSphereLight" program
	gl.uniform1i( gl.getUniformLocation(program, "colorFlag"),0 );
	gl.drawArrays( gl.POINTS, index, 1);

    window.requestAnimFrame(render);
}

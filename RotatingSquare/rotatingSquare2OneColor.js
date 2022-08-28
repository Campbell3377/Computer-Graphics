
var gl;

var theta = 0.0;
var thetaLoc;

var color = vec3(1, 0, 0);
var colorLoc;

var baseColors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        vec3(1.0, 1.0, 0.0)
    ];
var numcolors = 4;
var colorindex = 0;


var delay = 100;
var direction = true;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vertices = [
        vec2(  0,  1 ),
        vec2(  1,  0 ),
        vec2( -1,  0 ),
        vec2(  0, -1 )
    ];

    // Load the data into the GPU    
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    thetaLoc = gl.getUniformLocation( program, "theta" );

    ColorLoc = gl.getUniformLocation( program, "vColor" );

    
    // Initialize event handlers
    document.getElementById("Direction").onclick = function () {
        direction = !direction;
    };
	document.getElementById("ChangeColor").onclick = function () {
        colorindex += 1;
        if(colorindex > numcolors-1) {colorindex = 0};
	   color = baseColors[colorindex];
        console.log("color = ",color);
    };

    
    document.getElementById("Controls" ).onclick = function(event) {
        switch( event.srcElement.index ) {
          case 0:
            direction = !direction;
            break;
         case 1:
            delay /= 2.0;
            break;
         case 2:
            delay *= 2.0;
            break;
       }
    };

    window.onkeydown = function(event) {
        var key = String.fromCharCode(event.keyCode);
        switch(key) {
          case '1':
            direction = !direction;
            break;

          case '2':
            delay /= 2.0;
            break;

          case '3':
            delay *= 2.0;
            break;
        }
    };
    render();
};

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );

    theta += (direction ? 0.1 : -0.1);
    gl.uniform1f(thetaLoc, theta);

    gl.uniform3fv(ColorLoc, color);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}

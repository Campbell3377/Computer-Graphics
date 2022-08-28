

var canvas;
var gl;


var maxNumTriangles = 200;  
var maxNumVertices  = 3 * maxNumTriangles;
var index = 0;

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
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

		// each coordinate is 32 bits = 32/8 = 4 bytes thus 4x2 = 8
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(t));
        
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        t = vec4(colors[(index)%7]);
		
		// 4 bytes for each color x 4 colors = 16 offset
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(t));
        index++;
    } );


    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    render();

}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.POINTS, 0, index );

    window.requestAnimFrame(render);

}

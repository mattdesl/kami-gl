//We use browserify to alias the kami-gl namespace,
//this way the code looks exactly the same in regular Node projects

var WebGLContext = require('kami-gl').WebGLContext;
var ShaderProgram = require('kami-gl').ShaderProgram;
var Texture = require('kami-gl').Texture;
var Mesh = require('kami-gl').Mesh;

$(function() {
	var mainContainer = $("body").css({
		background: "#343434"
	});

	var demoContainers = [];
	var currentDemo = null;
	var currentIndex = 0;

	var width = 256;
	var height = 256;

	var canvas = $("<canvas>").css({
		position: "fixed",
		top: 0,
		left: 0,
		overflow: "hidden"
	});

	canvas.appendTo(mainContainer);

	//create our webGL context..
	//this will manage viewport and context loss/restore
	var context = new WebGLContext(width, height, canvas[0]);

	//create a basic shader..
	//this will be added to the context and re-compiled on context restore
	var shader = new ShaderProgram(context, $("#vert_shader").html(), $("#frag_shader").html());

	//Sometimes the shader compilation will give us useful debugging information...
	if (shader.log)
		console.warn(shader.log);

	//setup uniform locations
	shader.bind();
	shader.setUniformi("tex0", 0);
	shader.setUniformf("alpha", 0.25);

	//create texture from Image (async load)
	var tex = new Texture(context, "img/bunny.png", onAssetLoaded);

	//make up some vertex data, interleaved with {x, y, u, v}
	var vertices = new Float32Array([
		-1, -1, //xy
		0, 0,   //uv

		1, -1,
		1, 0,

		1, 1,
		1, 1,

		-1, 1, 
		0, 1 
	]);
		
	//our inidices, two triangles to form a quad
	var indices = new Uint16Array([
		0, 1, 2,
		0, 2, 3,
	]);

	// here we create a VBO and IBO with:
	// 		static=true, numVerts=4, numIndices=6
	var vbo = new Mesh(context, true, 4, 6, [
		//a list of vertex attribuets to match the shader
		new Mesh.Attrib("Position", 2, 0),
		new Mesh.Attrib("TexCoord", 2, 1)
	]);

	//here we override the vertices
	vbo.indices = indices;
	vbo.vertices = vertices;

	//set the mesh to "dirty" so that it gets uploaded 
	//this write-only property sets verticesDirty and indicesDirty to true
	vbo.dirty = true;
	
	//Called when textures have been loaded to re-start the render loop
	function onAssetLoaded() {
		console.log("Texture loaded: " + tex);
		
		//Shader values are lost on context loss.
		//Maybe this will be managed too in the future...
		shader.bind();
		shader.setUniformf("alpha", 0.5);
		

		requestAnimationFrame(render);
	}


	function render() {
		//cancel the render frame if context is lost/invalid
		//on context restore the image will be re-loaded and the 
		//render frame started again 
		//(this will be made cleaner with a high-level AssetManager)
		if (!context.valid) 
			return;

		requestAnimationFrame(render);

		var gl = context.gl;
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		
		tex.bind();
		shader.bind();
		vbo.bind(shader);
		vbo.draw(gl.TRIANGLES, 6, 0);
		vbo.unbind(shader);
	}
	
	var loseCtx = context.gl.getExtension("WEBGL_lose_context");

	if (loseCtx) { //may be null depending on browser, or if we have GL debuggers enabled
		$("<div>Click the canvas to simulate context loss / restore</div>").css({
			color: "white",
			fontSize: "10px",
			position: "absolute",
			textTransform: "uppercase",
			top: height + 40,
			left: 40
		}).appendTo($("body"));

		canvas.mousedown(function() {
			canvas.hide();
			loseCtx.loseContext();	

			setTimeout(function() {
				canvas.show();
				loseCtx.restoreContext();
			}.bind(this), 1000);	
		}.bind(this))
	}
});
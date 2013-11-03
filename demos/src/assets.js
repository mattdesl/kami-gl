//We use browserify to alias the kami-gl namespace,
//this way the code looks exactly the same in regular Node projects

var WebGLContext = require('kami-gl').WebGLContext;
var Texture = require('kami-gl').Texture;
var AssetManager = require('kami-gl').AssetManager;

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

	var tex0 = new Texture(context);
	var tex1 = new Texture(context);

	var assets = new AssetManager(context);

	assets.loadProgress.add(function(percent) {
		console.log("New load percent: "+ ~~(percent*100) + "%");
	});
	assets.loadFinished.add(function() {
		console.log("Done loading.");
	});
	assets.loadStarted.add(function() {
		console.log("Started loading.")
	});

	assets.addTyped("img/scene.png", AssetManager.ImageLoader, tex0);
	assets.addTyped("img/grass.png", AssetManager.ImageLoader, tex0);

	requestAnimationFrame(render);

	function render() {
		requestAnimationFrame(render);

		
		if (assets.update()) {
			canvas.css("background", "green");
		}
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
			console.log("CONTEXT LOST");

			setTimeout(function() {
				canvas.show();
				console.log("RESTORING CONTEXT");
				loseCtx.restoreContext();
			}.bind(this), 1000);	
		}.bind(this))
	}
});
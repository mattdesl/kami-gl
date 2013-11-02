module.exports = function(grunt) {
	
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		dirs: {
			dist: 'build',
			src: 'lib',
			demos: 'demos',
			demo_src: 'demos/src',
			demo_build: 'demos/build'
		},

		browserify: {
			//Exports require('kamigl') for simple browser testing
			demos: {
				src: ['<%= dirs.src %>/index.js'],
				dest: '<%= dirs.demo_build %>/bundle.js',
				
				options: {
					debug: true,
					alias: '<%= dirs.src %>/index.js:kami-gl'
				}
			}
		},

		watch: {
			demos: { 
				//Watch for changes...
				files: ['<%= dirs.src %>/**/*.js', 
						'<%= dirs.demo_src %>/**/*.js',
						'<%= dirs.demos %>/**/*.html', 
						'Gruntfile.js'],
				tasks: ['browserify:demos'],
				options: { 
					livereload: true
				},
			},
		}
	});

	grunt.registerTask('default', ['build-all']);

};
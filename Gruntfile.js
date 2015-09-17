module.exports = function(grunt) {

	// load all grunt tasks
	// require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		copy: {
			main: {
				expand: true,
				cwd: 'src/',
				src: ["**", "!css/**/*.less"],
				dest: 'dist/'
			}
		},

		less: {
			options: {
				paths: ['src/css']
			},
			src: {
				expand: true,
				cwd: "src/css",
				src: "*.less",
				ext: ".css",
				dest: "src/css"
			}
		},

		watch: {
			options: {
				nospawn: true,
				livereload: true
			},
			less: {
				files: ['src/css/**/*.less'],
				tasks: ['less']
			},
			copy: {
				files: ['src/**'],
				tasks: ['copy:main']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', ['watch']);
}
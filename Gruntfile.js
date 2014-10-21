module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', '*.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
};
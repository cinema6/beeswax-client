'use strict';

var TESTS = ['test/spec/**/*.ut.js'];
var LIBS = [
    'lib/**/*.js',
    'index.js'
];
var CODE = LIBS.concat(TESTS);

module.exports = function gruntfile(grunt) {
    var pkg = require('./package.json');

    var npmTasks = Object.keys(pkg.devDependencies).filter(function(name) {
        return (name !== 'grunt-cli') && (/^grunt-/).test(name);
    });

    npmTasks.forEach(function(name) {
        grunt.task.loadNpmTasks(name);
    });
    grunt.task.loadTasks('./tasks');

    grunt.initConfig({
        jasmine: {
            test: {
                src: TESTS
            }
        },
        watch: {
            test: {
                files: CODE,
                tasks: ['jshint', 'jasmine:test']
            }
        },
        jshint: {
            options: {
                jshintrc: true
            },
            code: {
                src: CODE
            }
        }
    });

    grunt.registerTask('test', [
        'jshint:code',
        'jasmine:test'
    ]);
};

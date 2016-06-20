'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  sourceFiles = [
    './src/extend.js',
    './src/QJ.js',
    './src/payment.js',
    './src/card.js',
    './src/directive.js'],
  cssFiles = './src/scss/card.css',
  sassFiles = './src/scss/card.scss',
  fs = require('fs'),
  path = require('path');

module.exports = function (grunt) {
  // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    env: {
      test: {
        NODE_ENV: 'test'
      },
      dev: {
        NODE_ENV: 'development'
      },
      stage: {
        NODE_ENV: 'staging'
      },
      prod: {
        NODE_ENV: 'production'
      }
    },
    watch: {

      clientJS: {
        files: sourceFiles,
        tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      clientCSS: {
        files: cssFiles,
        tasks: ['csslint'],
        options: {
          livereload: true
        }
      },
      clientSCSS: {
        files: sassFiles,
        tasks: ['sass', 'csslint'],
        options: {
          livereload: true
        }
      }
    },
    jshint: {
      all: {
        src: sourceFiles,
        options: {
          jshintrc: true,
          node: true,
          mocha: true,
          jasmine: true
        }
      }
    },
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      all: {
        src: cssFiles
      }
    },
    ngAnnotate: {
      production: {
        files: {
          'lib/index.js': sourceFiles
        }
      }
    },
    uglify: {
      production: {
        options: {
          mangle: false
        },
        files: {
          'lib/index.min.js': 'lib/index.js'
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          'lib/index.min.css': cssFiles
        }
      }
    },
    sass: {
      dist: {
        files: [{
          expand: true,
          src: sassFiles,
          ext: '.css'
        }]
      }
    }
  });

  // Load NPM tasks
  require('load-grunt-tasks')(grunt);


  // Lint CSS and JavaScript files.
  grunt.registerTask('lint', ['sass', 'jshint', 'csslint']);

  // Lint project files and minify them into two production files.
  grunt.registerTask('build', ['env:dev', 'lint', 'ngAnnotate', 'uglify', 'cssmin']);

  // Run the project in development mode
  grunt.registerTask('default', ['build']);


};
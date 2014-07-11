module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      coverage: {
        src: ['coverage/']
      }
    },
    copy: {
      coverage: {
        src: ['test/**'],
        dest: 'coverage/'
      }
    },
    blanket: {
      coverage: {
        src: ['lib/'],
        dest: 'coverage/lib/'
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
          'vendor/*.js', 'src/**/*.js'
        ],
        dest: 'lib/<%= pkg.name %>.js'
      }
    },
    comments: {
      your_target: {
        options: {
          singleline: true,
          multiline: true
        },
        src: [ 'lib/<%= pkg.name %>.js']
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
//        src: ['test/**/*.js']
        src: ['coverage/test/**/*.js']
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          quiet: true,
          captureFile: 'coverage.html'
        },
        src: ['coverage/test/**/*.js']
      },
      'travis-cov': {
        options: {
          reporter: 'travis-cov'
        },
        src: ['coverage/test/**/*.js']
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'lib/<%= pkg.name %>.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'lib/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-stripcomments');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-blanket');

//  grunt.registerTask('test', ['jshint', 'mocha']);
  grunt.registerTask('mocha', ['concat', 'comments', 'clean', 'blanket', 'copy', 'mochaTest']);

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify']);

};
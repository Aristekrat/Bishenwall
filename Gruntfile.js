module.exports = function(grunt) {

grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
        options: {
            separator: ';'
        },
        dist: {
            src: ['src/**/*.js'], // This config concatenates all files that are in src and end in .js
            dest: 'dist/<%= pkg.name %>.js' // This will set the concatenated name to Bishenwall.js
        }
    },
    uglify: {
        options: {
            banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
        },
        build: {
            src: 'app.js',
            dest: 'dist/<%= pkg.name %>.min.js'
        }
    },
    jshint: {
        files: ['./*.js', './routes/*.js', './public/front-end-scripts/*.js', './config/*.js'],
        options: {
            globals: {
                console: true,
                module: true,
                document: true
            }
        }
    },
    csslint: {
        strict: {
            options: {
                import: 2
            },
            src: ['./public/css/*.css']
        }
    },
    compass: {
        dist: {
            options: {
                config: './public/css/config.rb'
            }
        }
    },
    watch: {
        jsLint: {
            files: ['./*.js', './routes/*.js', './public/front-end-scripts/*.js', './config/*.js'],
            tasks: ['jshint']
        }, 
   /*    cssLint: {
        files: ['./public/css/*.css'],
        tasks: ['csslint']
      } // NOTE watch isn't really working. It's annoyingly slow. 
    }
   watch: { // This command will automatically run the tasks below whenever there's a change. 
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit']
    } */
    }
});
// Build Plugins
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-concat');
// Test Plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-jasmine'); 
// Dev Glue
    grunt.loadNpmTasks('grunt-contrib-compass'); 
    grunt.loadNpmTasks('grunt-contrib-watch');
/*** Tasks ***/ 
    grunt.registerTask('default', ['watch']); 
        
    grunt.registerTask('jsLint', ['jshint']);
        
    grunt.registerTask('cssLint', ['csslint']);
        
    grunt.registerTask('Lint', ['jshint', 'csslint']);
        
    grunt.registerTask('test', ['jasmine']); // You can run this set of tasks by typing "grunt test" on the command line"
        
    grunt.registerTask('minify', ['uglify']); // You can run this set of tasks by typing "grunt test" on the command line"

};
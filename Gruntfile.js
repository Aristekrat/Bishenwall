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
    compress: {
        main: {
            options: {
              mode: 'gzip'
            },
            expand: true,
            cwd: './',
            src: ['**/*'],
            dest: 'dist/'
        }   // Custom extension: ext: '.gz.js'
    },
    uglify: {
        options: {
            banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
        },
        build: {
            src: ['./*.js', './routes/*.js', './public/front-end-scripts/*.js', './config/*.js'],
            dest: 'dist/<%= pkg.name %>.min.js'
        }
    },
    cssmin: {
        minify: {
            expand: true,
            src: ['./public/css/screen.css'],
            dest: 'dist/screen.min.css'
        }
    },
    imagemin: {
        dynamic: {                       
            files: [{
                expand: true,                  // Enable dynamic expansion
                cwd: './public/images',        // Src matches are relative to this path
                src: ['**/*.{png,jpg,gif}'],   // Actual patterns to match
                dest: 'dist/'                  // Destination path prefix
            }]
        }
    },
    htmlmin: {
        options: {                                
            removeComments: true,
            collapseWhitespace: true
        },
        files: {                                   
            'dist/index.html': 'views/index.html'
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
// Dev Glue
    grunt.loadNpmTasks('grunt-contrib-compass'); 
    grunt.loadNpmTasks('grunt-contrib-watch');
/*** Tasks ***/ 
    grunt.registerTask('default', ['watch']); 
           
    grunt.registerTask('minify', ['compress', 'uglify', 'cssmin', 'imagemin']); // You can run this set of tasks by typing "grunt test" on the command line"

};
module.exports = function(grunt) {
/*** WARNING: Running Grunt will minify files in their current location. ***/
grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
        options: {
            banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
            mangle: false
        },
        my_target: {
            files: {
                './public/front-end-scripts/angular-resources.js' : ['./public/front-end-scripts/*.js'],
                './app.js' : ['./app.js']
            }
        }
    },
    cssmin: {
        minify: {
            expand: true,
            src: ['./public/css/screen.css'],
            dest: '/'
        }
    },
    imagemin: {
        dynamic: {                       
            files: [{
                expand: true,                  // Enable dynamic expansion
                cwd: './public/images',        // Src matches are relative to this path
                src: ['**/*.{png,jpg,gif}'],   // Actual patterns to match
                dest: '/public/images'                  // Destination path prefix
            }]
        }
    },
    htmlmin: {
        dist: { 
            options: {                                
                removeComments: true,
                collapseWhitespace: true
            },
            files: {                                   
                'public/index.html': 'public/index.html',
                'public/_comment-form.html': 'public/_comment-form.html',
                'public/_show-comments.html': 'public/_show-comments.html'
            }
        }
    }
    /*compress: {
        main: {
            options: {
              mode: 'gzip'
            },
            expand: true,
            cwd: './',
            src: ['**//**'],
            dest: 'dist/'
        }   // Custom extension: ext: '.gz.js'
    }  // This task may be overkill. Express should be compressing everything. If I decide to use this in the future, need to change src so it doesn't grab everything.*/
});
// Build Plugins
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    //grunt.loadNpmTasks('grunt-contrib-concat');
// Dev Glue
    //grunt.loadNpmTasks('grunt-contrib-compass'); 
    //grunt.loadNpmTasks('grunt-contrib-watch');
/*** Tasks ***/ 
    //grunt.registerTask('default', ['watch']); 
    //grunt.registerTask('default', ['uglify', 'cssmin', 'imagemin', 'htmlmin']);
    grunt.registerTask('heroku:production', ['uglify', 'cssmin', 'imagemin', 'htmlmin']);
};
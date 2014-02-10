module.exports = function(grunt) {
/*** WARNING: Running Grunt will minify files in their current location. *
* To-Do: change this. 
*/
grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
        dist: {
            src: ['public/js/app.js', 'public/js/services.js', 'public/js/controllers.js', 'public/js/directives.js', 'public/js/jquery.js'],
            dest: 'public/dist/bw-scripts.js'
        }
    },
    uglify: {
        options: {
            banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
            mangle: false
        },
        my_target: {
            files: {
                'public/dist/bw-scripts-min.js' : ['public/dist/bw-scripts.js']//,
                //'./server.js' : ['./server.js']
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
                dest: '/public/images'         // Destination path prefix
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
    },
    watch: {
        scripts: {
            files: ['./public/js/*.js'],
            tasks: ['concat', 'uglify'],
            options: {
              spawn: false,
            },
        },
    },
});
//  Build Plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
//  Tasks
    grunt.registerTask('default', ['watch']); 
    grunt.registerTask('minify', ['uglify', 'cssmin', 'imagemin', 'htmlmin']);
    //grunt.registerTask('concat', ['concat']);
    grunt.registerTask('minjs', ['uglify']);
};
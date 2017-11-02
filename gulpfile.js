const gulp         = require( 'gulp' );
const sass         = require( 'gulp-sass' );
const cleanCSS     = require( 'gulp-clean-css' );
const sourcemaps   = require( 'gulp-sourcemaps' );
const child        = require( 'child_process' );
const gutil        = require( 'gulp-util' );
const browserSync  = require( 'browser-sync' ).create();
const autoprefixer = require( 'gulp-autoprefixer' );

const siteRoot = '_site';
const files    = {
    scss: 'assets/scss/*.scss'
};

gulp.task( 'css', () => {
    gulp.src( files.scss )
    .pipe( sass().on( 'error', sass.logError ) )
    .pipe( autoprefixer( {
        browsers: [ 'last 2 versions' ],
        cascade: false
    } ) )
    .pipe( cleanCSS() )
    .pipe( gulp.dest( '_includes/css' ) );
} );

gulp.task( 'jekyll', () => {
    const jekyll = child.spawn( 'jekyll', [ 'build',
        '--watch',
        '--incremental',
        '--drafts'
    ] );
    
    jekyll.stdout.on( 'data', Logger );
    jekyll.stderr.on( 'data', Logger );
} );

gulp.task( 'serve', () => {
    browserSync.init( {
        files: [ siteRoot + '/**' ],
        port: 4000,
        server: {
            baseDir: siteRoot
        }
    } );
    
    gulp.watch( files.scss, [ 'css' ] );
} );

gulp.task( 'default', [ 'css', 'jekyll', 'serve' ] );

const Logger = ( buffer ) => {
    buffer.toString()
    .split( /\n/ )
    .forEach( ( message ) => gutil.log( 'Jekyll: ' + message ) );
};
const gulp            = require( 'gulp' );
const sass            = require( 'gulp-sass' );
const cleanCSS        = require( 'gulp-clean-css' );
const sourcemaps      = require( 'gulp-sourcemaps' );
const child           = require( 'child_process' );
const gutil           = require( 'gulp-util' );
const browserSync     = require( 'browser-sync' ).create();
const autoprefixer    = require( 'gulp-autoprefixer' );
const imagemin        = require( 'gulp-imagemin' );
const imageminMozjpeg = require( 'imagemin-mozjpeg' );
const favicons        = require( 'gulp-favicons' ),
      inject          = require( 'gulp-inject' ),
      gulpUtil        = require( 'gulp-util' ),
      del             = require( 'del' ),
      decode          = require( 'decode-html' );

const siteRoot = '_site';
const files    = {
    scss: 'assets/scss/*.scss',
    favicon: {
        src: 'assets/images/favicon/favicon.png',
        dest: 'assets/images/favicon',
        html_src: 'favicon-temp.html',
        file_dest: '_includes/favicon.html',
        folder_dest: '_includes/',
    },
    images: [ 'assets/images/*.jpg', '!assets/images/*-larger.jpg', '!assets/images/*-large.jpg', '!assets/images/*-small.jpg', '!assets/images/*-smaller.jpg' ],
    imagesall: [ 'assets/images/*.jpg' ]
};

const projectConfig = {
    appName: 'Thomas van der Westen',
    appDescription: '',
    url: 'http://thomasvanderwesten.nl',
    version: 1.0,
    developerName: 'Thomas van der Westen',
    developerURL: 'http://thomasvanderwesten.nl',
    background: '#fff',
    path: '/'
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

gulp.task( 'imagemin', [ 'imagemin-allfiles' ], function () {
    return gulp.src( files.images )
    .pipe( imagemin( [
        imageminMozjpeg( {
            quality: 65
            
        } )
    ] ) )
    .pipe( gulp.dest( 'assets/images' ) );
} );

gulp.task( 'imagemin-allfiles', function () {
    return gulp.src( files.imagesall )
    .pipe( imagemin( [
        imageminMozjpeg( {
            quality: 85
            
        } )
    ] ) )
    .pipe( gulp.dest( 'assets/images' ) );
} );

/**
 * Generates favicon files used by various browsers and OS's.
 * Requires the `clean` task to run first.
 * For creating a Material Design icon, I recommend using
 */
gulp.task( 'favicon-generate', function () {
    return gulp.src( files.favicon.src )
    .pipe( favicons( {
        appName: projectConfig.appName,
        appDescription: projectConfig.appDescription,
        url: projectConfig.url,
        version: projectConfig.version,
        developerName: projectConfig.developerName,
        developerURL: projectConfig.developerURL,
        background: projectConfig.background,
        path: files.favicon.dest,
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        logging: false,
        online: false,
        html: files.favicon.html_src,
        pipeHTML: true,
        replace: true
    } ) )
    .on( 'error', gulpUtil.log )
    .pipe( gulp.dest( files.favicon.dest ) );
} );

gulp.task( 'inject-favicon', [ 'favicon-generate' ], function () {
    gulp.src( files.favicon.file_dest )
    .pipe( inject( gulp.src( [ './images/favicon/' + files.favicon.html_src ] ), {
        starttag: '<!-- inject:head:{{ext}} -->',
        transform: function ( filePath, file ) {
            var content = file.contents.toString( 'utf8' ); // return file contents as string
            return decode( content );
        }
    } ) )
    .pipe( gulp.dest( files.favicon.folder_dest ) );
} );

gulp.task( 'clean-favicon', [ 'inject-favicon' ], function () {
    return del.sync( [ './assets/images/favicon/favicon-temp.html' ] );
} );

const Logger = ( buffer ) => {
    buffer.toString()
    .split( /\n/ )
    .forEach( ( message ) => gutil.log( 'Jekyll: ' + message ) );
};
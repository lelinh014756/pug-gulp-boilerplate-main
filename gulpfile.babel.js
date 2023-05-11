import { src, dest, watch, series, parallel } from 'gulp';
import pug from 'gulp-pug';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import browserSync from 'browser-sync';
import rename from 'gulp-rename';
import del from 'del';
import prettyHtml from 'gulp-pretty-html';
import useref from 'gulp-useref';
import gulpif from 'gulp-if';
import uglify from 'gulp-uglify';
import data from 'gulp-data';
import merge from 'gulp-merge-json';
import path from 'path';

let sass = require('gulp-sass')(require('sass'));

let fs = require('fs');

const server = browserSync.create();

const paths = {
    scss: 'assets/scss/**/*.scss',
    pug: {
        data: 'assets/pug/data/components/**/*.json',
        html: 'assets/pug/pages/*.pug',
        watchFiles: 'assets/pug/**/*.pug'
    },
    images: 'assets/images/**/*.+(png|jpg|gif|svg|jpeg|ico)',
    videos: 'assets/videos/**/*.+(mp4)',
    plugins: 'assets/plugins/**',
    js: 'assets/js/*.js',
    fonts: 'assets/fonts/**',
    html: 'dist/*.html'
};

const developFiles = paths.pug.html;

const version = require('gulp-version-number');
const versionConfig = {
    'value': '%MDS%',
    'append': {
        'key': 'v',
        'to': ['css', 'js'],
    },
};

export function scssDevelop() {
    return (
        src(paths.scss)
            .pipe(sass({ outputStyle: 'expanded' }))
            .pipe(postcss([autoprefixer()]))
            .pipe(dest('dist/'))
            .pipe(server.stream())
    );
}

export function scssProduction() {
    return src(paths.scss)
        .pipe(sass())
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(dest('dist/'))
        .pipe(server.stream());
}

export function mergeData() {
    return src(paths.pug.data)
        .pipe(
            merge({
                fileName: 'data.json',
                edit: (json, file) => {
                    let filename = path.basename(file.path),
                        primaryKey = filename.replace(
                            path.extname(filename),
                            ''
                        );
                    var data = {};
                    data[primaryKey] = json;

                    return data;
                }
            })
        )
        .pipe(dest('assets/pug/data'));
}

export function buildLayouts() {
    return src(developFiles)
        .pipe(
            data(function() {
                return JSON.parse(
                    fs.readFileSync('assets/pug/data/data.json')
                );
            })
        )
        .pipe(
            pug({
                pretty: true
            })
        )
        .pipe(rename({ dirname: '' }))
        .pipe(dest('dist'))
        .pipe(browserSync.stream({}));
}

export function buildHtml() {
    return src(paths.pug.html)
        .pipe(
            data(function() {
                return JSON.parse(
                    fs.readFileSync('assets/pug/data/data.json')
                );
            })
        )
        .pipe(
            pug({
                pretty: true
            })
        )
        .pipe(rename({ dirname: '' }))
        .pipe(dest('dist'))
        .pipe(browserSync.stream({}));
}

export function copyJs() {
    return src(paths.js).pipe(dest('dist/js'));
}

export function copyImages() {
    return src(paths.images).pipe(dest('dist/images'));
}

export function copyVideos() {
    return src(paths.videos).pipe(dest('dist/videos'));
}

export function copyPlugin() {
    return src(paths.plugins).pipe(dest('dist/plugins'));
}

export function copyFonts() {
    return src(paths.fonts).pipe(dest('dist/fonts'));
}

export function cleanOutput() {
    return del('dist');
}

export function cleanData() {
    return del('./assets/pug/data/data.json');
}

export function concat() {
    return src(paths.html)
        .pipe(useref())
        .pipe(gulpif('dist/js/plugins.js', uglify()))
        .pipe(dest('dist'));
}

export function beautify() {
    return src(paths.html)
        .pipe(
            prettyHtml({
                indent_size: 4,
                indent_char: ' ',
                unformatted: false,
                brace_style: 'collapse'
            })
        )
        .pipe(version(versionConfig))
        .pipe(dest('dist'));
}

export function serve(done) {
    server.init({
        server: {
            baseDir: 'dist'
        },
        port: 3000
    });
    done();
}

export function serverReload(done) {
    server.reload();
    done();
}

function watchFile() {
    watch(paths.scss, scssDevelop);
    watch(paths.images, copyImages);
    watch(paths.videos, copyVideos);
    watch(
        paths.pug.watchFiles,
        series(cleanData, mergeData, buildLayouts, serverReload)
    );
    watch(
        paths.pug.data,
        series(cleanData, mergeData, buildLayouts, serverReload)
    );
    watch(paths.js, series(copyJs, serverReload));
}

const develop = series(
    cleanOutput,
    cleanData,
    mergeData,
    parallel(
        buildLayouts,
        scssDevelop,
        copyPlugin,
        copyFonts,
        copyJs,
        copyImages,
        copyVideos
    ),
    beautify,
    serve,
    watchFile
);

const build = series(
    cleanOutput,
    cleanData,
    mergeData,
    parallel(
        buildHtml,
        scssProduction,
        copyPlugin,
        copyFonts,
        copyJs,
        copyImages,
        copyVideos
    ),
    concat,
    beautify,
);

const pretty = series(beautify);
const html = series(buildHtml, beautify);

exports.watch = watchFile();
exports.html = html;
exports.pretty = pretty;
exports.build = build;
exports.default = develop;

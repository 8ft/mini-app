const gulp = require('gulp');
const changed = require('gulp-changed');
const sass = require('gulp-sass');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const tap = require('gulp-tap');
const path = require('path');

const config = require('./build/config');
const hasRmCssFiles = new Set();

gulp.task('clear',()=>{
    return gulp.src('./dist/*')
    .pipe(clean({ force: true }));
});

gulp.task('copy', () => gulp.src(['./src/**/*', '!./src/**/*.scss'])
    .pipe(changed('./dist'))
    .pipe(gulp.dest('./dist')));

gulp.task('sass', ['copy'], () => gulp.src('./src/**/*.scss')
    .pipe(changed('./dist'))
    .pipe(tap((file) => {
        const filePath = path.dirname(file.path);
        const content = file.contents.toString();
        content.replace(/@import\s+['|"](.+)['|"];/g, ($1, $2) => {
            const hasFilter = config.cssFilterFiles.filter(item => $2.indexOf(item) > -1);
            // hasFilter > 0表示filter的文件在配置文件中，打包完成后需要删除
            if (hasFilter.length > 0) {
                const rmPath = path.join(filePath, $2);
                // 将src改为dist，.scss改为.wxss，例如：'/xxx/src/scss/const.scss' => '/xxx/dist/scss/const.wxss'
                const filea = rmPath.replace(/src/, 'dist').replace(/\.scss/, '.wxss');
                // 加入待删除列表
                hasRmCssFiles.add(filea);
            }
        });
    }))
    .pipe(replace(/(@import.+;)/g, ($1, $2) => {
        const hasFilter = config.cssFilterFiles.filter(item => $1.indexOf(item) > -1);
        if (hasFilter.length > 0) {
            return $2;
        }
        return `/** ${$2} **/`;
    }))
    .pipe(sass().on('error', sass.logError))
    .pipe(replace(/(\/\*\*\s{0,})(@.+)(\s{0,}\*\*\/)/g, ($1, $2, $3) => $3.replace(/\.scss/g, '.wxss')))
    .pipe(rename({
        extname: '.wxss',
    })) 
    .pipe(gulp.dest('./dist')));

gulp.task('clean:wxss', ['sass'], () => {
    const arr = [];
    hasRmCssFiles.forEach((item) => {
        arr.push(item);
    });
    return gulp.src(arr, { read: false })
        .pipe(clean({ force: true }));
});

gulp.task('watch',()=>{
    gulp.watch('./src/**/*', ['clean:wxss']);
})

gulp.task('default',['clean:wxss'] )

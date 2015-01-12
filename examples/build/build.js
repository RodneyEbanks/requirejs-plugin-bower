#! /usr/bin/env node

var exec = require('child_process').exec;

console.log('Executing: r.js -o require-build.js');

exec('r.js -o require-build.js', function (error, stdout, stderr) {
    if (error) {
        console.log(error);
    }
    if (stdout) {
        console.log(stdout);
    }
    if (stderr) {
        console.log(stderr);
    }
});

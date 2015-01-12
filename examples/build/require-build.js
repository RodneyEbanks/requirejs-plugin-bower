({
    appDir: "../src",
    baseUrl: "./js",
    dir: "../dist",
    keepBuildDir: false,
    fileExclusionRegExp: /^\.|^(node_modules|gruntfile|gulpfile|grunt|doc|example|build|gulp|api|LICENSE|package\.json|bower\.json)|component\.json|\.(md|gzip|map|zip|eot|svg|woff)|\.min\.(js)/i,
    findNestedDependencies: false,
    removeCombined: true,
    optimize: "uglify",
    uglify: {
        toplevel: true,
        ascii_only: true,
        beautify: false,
        max_line_length: 1000,
        no_mangle: true
    },
    inlineText: true,
    preserveLicenseComments: true,
    wrap: false,
    mainConfigFile: '../src/js/main.js',
    modules: [{
        name: 'auto'
    }]
})

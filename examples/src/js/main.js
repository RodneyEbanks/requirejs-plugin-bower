requirejs.config({
   baseUrl: 'js',
    bower: {
        auto: true
    },
    paths: {
        'text': '../bower_components/requirejs-text/text',
        'json': '../bower_components/requirejs-plugins/src/json',
        'bower': '../bower_components/requirejs-plugin-bower/src/bower'
    },
    deps: ['auto']
});

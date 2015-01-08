requirejs.config({
    bower: {},
    paths: {
        'bower': '../bower_components/requirejs-plugin-bower/dist/bower-bundle'
    }
});

define(['bower!../bower.json'], function(bowerConfig) {

    //  requirejs.config(bowerConfig); // optional if bower: {auto: true}
    requirejs(['bootstrap']);

});

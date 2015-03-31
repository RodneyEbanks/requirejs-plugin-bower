# What if RequireJS could read bower.json files for module paths and dependencies?

This Bower plugin for [RequireJS](http://requirejs.org) reads your root bower.json parsing your projects dependencies and their dependencies (TIAB).  It then constructs a requirejs.config object ({"paths": {}, shim: {}}) with an auto load option.

This plugin works both InBrowser (dependencies reread each page load) & InBuild (config object saved to disk, so you can dump your bower.json files). 

May also work on other AMD loaders (never tested it).

## Install

You can use [bower](http://bower.io/) to install it easily:

```
bower install --save requirejs-plugin-bower
```

## Plugins

 - **bower** : For creating requirejs.config({paths:{},shim:{}}) settings automatically.


## Documentation

check the `examples` folder. All the info you probably need will be inside
comments or on the example code itself.


## Basic usage

Put the plugins inside the `baseUrl` folder (usually same folder as the main.js
file) or create an alias to the plugin location:

main.js
```main.js
requirejs.config({
    baseUrl:'/js',
    paths : {
        //create alias to plugins (not needed if plugins are on the baseUrl)
        bower: '../bower_components/requirejs-plugin-bower/src/bower',
        json: '../bower_components/requirejs-plugins/src/json',
        text: '../bower_components/requirejs-text/text'
    },
    bower: {
        baseUrl: '../bower_components',
        extensions: 'js|css',
        ignore: 'requirejs|requirejs-domready|requirejs-text',
        auto: true
        deps: ['dependencies', 'devDependencies'],
        loader: {
             css: 'css'
        }
    }
});

// use plugin 
define(['bower!../bower.json'], function(bowerConfig) {

    //  requirejs.config(bowerConfig); // optional if bower: {auto: true}
    requirejs(['bootstrap']);

});
```
bootstrap.js
```bootstrap.js
// use other modules using name without location path
define(['image'], function(image) {

    requirejs(['image!img/bower2requirejs.png'], function(requirejs2bower) {

        var wrapper = document.getElementById('wrapper');

        if (requirejs2bower) {
            wrapper.innerHTML = '<h2>Success</h2><br>';
            wrapper.appendChild(requirejs2bower);
        }

    });

});
```

## Removing plugin code after build

[r.js](https://github.com/jrburke/r.js/blob/master/build/example.build.js)
nowadays have the `stubModules` setting which can be used to remove the whole
plugin code:

```js
({
    // will remove whole source code of "json" and "text" plugins during build
    // JSON/text files that are bundled during build will still work fine but
    // you won't be able to load JSON/text files dynamically after build
    stubModules : ['json', 'text', 'requirejs-plugin-bower']
})
```

For more plugins check [RequireJS Wiki](https://github.com/jrburke/requirejs/wiki/Plugins).

## Writing your own plugins

Check [RequireJS documentation](http://requirejs.org/docs/plugins.html) for
a basic reference and use other plugins as reference. RequireJS official
plugins are a good source for learning.

Also be sure to check [RequireJS Wiki](https://github.com/jrburke/requirejs/wiki/Plugins).

## License

requirejs-plugin-bower is released under two licenses: new BSD, and MIT. You may pick the
license that best suits your development needs.

Copyright (c) 2014 Rodney Robert Ebanks foss@rodneyebanks.com

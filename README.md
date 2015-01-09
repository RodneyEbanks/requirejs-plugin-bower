# RequireJS Plugin for reading paths configuration from bower.json.

A plugin for [RequireJS](http://requirejs.org) for configuring module Paths automatically from bower.json (InBrowser & InBuild). May
also work on other AMD loaders (never tested it).

## Install

You can use [bower](http://bower.io/) to install it easily:

```
bower install --save requirejs-plugin-bower
```

## Plugins

 - **bower** : For creating requirejs.config({path:{},shim:{}}) settings automatically.


## Documentation

check the `examples` folder. All the info you probably need will be inside
comments or on the example code itself.


## Basic usage

Put the plugins inside the `baseUrl` folder (usually same folder as the main.js
file) or create an alias to the plugin location:

main.js
```main.js
requirejs.config({
    bower: {
            baseUrl: '../bower_components',
            extensions: 'js|css',
            ignore: 'requirejs|requirejs-domready|requirejs-text',
            auto: true
        },
    paths : {
        //create alias to plugins (not needed if plugins are on the baseUrl)
        bower: '../bower_components/requirejs-plugin-bower'
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
    stubModules : ['json', 'text']
})
```

For more plugins check [RequireJS Wiki](https://github.com/jrburke/requirejs/wiki/Plugins).

## Writing your own plugins

Check [RequireJS documentation](http://requirejs.org/docs/plugins.html) for
a basic reference and use other plugins as reference. RequireJS official
plugins are a good source for learning.

Also be sure to check [RequireJS Wiki](https://github.com/jrburke/requirejs/wiki/Plugins).

## License

Released under the MIT license & New BSD.

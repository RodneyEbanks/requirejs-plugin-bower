# RequireJS Plugin for Parsing Dependencies in bower.json (InBrowser & InBuild)

A plugin for [RequireJS](http://requirejs.org). May
also work on other AMD loaders (never tested it).

For more plugins check [RequireJS Wiki](https://github.com/jrburke/requirejs/wiki/Plugins).

## Install

You can use [bower](http://bower.io/) to install it easily:

```
bower install --save requirejs-plugin-bower
```



## Plugins

 - **bower** : Useful for creating requirejs.config({path:{},shim:{}}) settings automatically.


## Documentation

check the `examples` folder. All the info you probably need will be inside
comments or on the example code itself.


## Basic usage

Put the plugins inside the `baseUrl` folder (usually same folder as the main.js
file) or create an alias to the plugin location:

```js
require.config({
    bower: {
       auto: true // default setting
    },
    paths : {
        //create alias to plugins (not needed if plugins are on the baseUrl)
        bower: '../bower_components/requirejs-plugin-bower'
    }
});

// use plugin 
define([
        'bower!/bower.json'
    ], function(config){
       // optional unless auto loading is disabled auto: false
       requirejs.config(config);
    }
);
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

## Writing your own plugins

Check [RequireJS documentation](http://requirejs.org/docs/plugins.html) for
a basic reference and use other plugins as reference. RequireJS official
plugins are a good source for learning.

Also be sure to check [RequireJS Wiki](https://github.com/jrburke/requirejs/wiki/Plugins).

## License

Released under the MIT license & New BSD.
/*    
 * @license requirejs - plugin - bower 0.0.1
 * Copyright(c) 2014, Rodney Robert Ebanks foss@rodneyebanks.com All Rights Reserved.
 * Available via the MIT or new BSD license.
 */

// FIXME: Some bundled components have the same filename for different file types (.js/.css) which result in overwrites e.g. ionic > ionic.js & ionic.css.
// NOTE: Manual fix to compatibility issue is adding paths/shim which will overwrite auto-config.
// TODO: Test build functionality with r.js

(function() {
    'use strict';
    define(['module', 'json'], function(module, json) {
        var defaults = {
            file: '/bower.json',
            baseUrl: '../bower_components',
            extensions: 'js|css',
            ignore: 'requirejs|requirejs-domready|requirejs-text',
            auto: true
        }, request = {
                parent: null,
                config: {}
            }, bower = {
                settings: {},
                overrides: {},
                config: {
                    paths: {},
                    shim: {}
                },
                processed: {}
            }, buildMap = {}, REGEX_PATH_RELATIVE = /^([^a-z|0-9]*)/,
            REGEX_PATH_SPLIT = /^(.*?)([^/\\]*?)(?:\.([^ :\\/.]*))?$/, REGEX_PATH_BOWER = /^(.*?bower.json)+(.*)$/;

        function objectKeyForEach(value, fn) {
            Object.keys(value).forEach(fn);
        }

        function objectExtend(destination, source) {
            if (typeof source === 'object') {
                objectKeyForEach(source, function(value) {
                    destination[value] = source[value];
                });
            }
            return destination;
        }

        function objectKeysToArray(obj) {
            var arr = [];
            objectKeyForEach(obj, function(key) {
                arr.push(key);
            });
            return arr;
        }

        // http://jsperf.com/check-json-validity-try-catch-vs-regex
        function isValidJson(str) {
            if (str === '') {
                return false;
            }
            str = str.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
            return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
        }

        // http://h3manth.com/content/async-foreach-javascript Author: https://github.com/hemanth
        function forEachArrayAsync(array, fn, progress, finished) {
            var i = 0,
                maxBurnTime = 100, // ms to run before yielding to user agent
                finishedFn = finished || progress,
                progressFn = (finishedFn === progress ? null : progress);

            function iter() {
                var startTime = Date.now();

                while (i < array.length) {
                    fn.call(array, array[i], i++);

                    if (Date.now() - startTime > maxBurnTime) {
                        if (progressFn) {
                            progressFn(i, array.length);
                        }
                        return window.setTimeout(iter, 0);
                    }
                }

                if (progressFn) {
                    progressFn(i, array.length);
                }
                if (finishedFn) {
                    finishedFn(null, array);
                }
            }
            window.setTimeout(iter, 0);
        }

        function formatBowerFilePath(name) {
            name = bower.settings.baseUrl + '/' + name + '/bower.json';
            return name;
        }

        function parseBowerFile(name, jsonFile, callback, root) {
            var base, dependencies, modulePath = new RegExp(REGEX_PATH_SPLIT),
                relativePath = new RegExp(REGEX_PATH_RELATIVE),
                validExt = new RegExp('^(' + bower.settings.extensions + ')$'),
                ignoreFile = new RegExp('^(' + bower.settings.ignore + ')$');

            function addToConfig(item, name) {
                var config = {
                    paths: {},
                    shim: {}
                }, path;

                if (validExt.test(item[3])) {
                    name = name || item[2];
                    path = base[1] + item[1].replace(relativePath, '') + item[2];

                    bower.config.paths[name] = config.paths[name] = path;
                    bower.config.shim[name] = config.shim[name] = {
                        exports: name
                    };

                    if (dependencies.length > 0) {
                        bower.config.shim[name].deps = config.shim[name].deps = dependencies;
                    }

                    if (!request.config.isBuild && (bower.settings.auto !== false)) {
                        requirejs.config(config);
                    }

                }
            }

            base = modulePath.exec(name);
            dependencies = objectKeysToArray(jsonFile.dependencies || {});

            forEachArrayAsync(dependencies, function(value) {
                if (!ignoreFile.test(value)) {
                    processBowerFile(formatBowerFilePath(value), request.parent, function() {}, request.config);
                }
                return value;
            }, function() {
                // Notify callback not used;
            }, function() {
                if (!bower.processed[name]) {
                    if (Array.isArray(jsonFile.main)) {
                        jsonFile.main.forEach(function(value) {
                            addToConfig(modulePath.exec(value));
                        });
                    } else {
                        addToConfig(modulePath.exec(jsonFile.main), jsonFile.name);
                    }

                    bower.processed[name] = true;
                }
                if (root) {
                    callback(bower.config);
                }
            });
        }

        function processBowerFile(name, req, callback, config, root) {

            if (!bower.processed[name]) {
                json.load(name, req, function(jsonFile) {
                    parseBowerFile(name, jsonFile, callback, root);
                }, config);
            }
            return name;
        }

        return {
            load: function pluginLoad(name, req, onLoad, config) {
                request.parent = req;
                request.config = config;
                bower.settings = defaults;
                bower.settings = objectExtend(bower.settings, request.config.bower || {});
                bower.settings = objectExtend(bower.settings, bower.overrides);
                bower.settings.file = name;

                if (config.isBuild) {
                    onload();
                }

                processBowerFile(bower.settings.file, req, function(config) {
                    buildMap[name] = config;
                    onLoad(config);
                }, config, true);
            },
            normalize: function pluginNormalize(name, normalize) {
                var inputPath = new RegExp(REGEX_PATH_BOWER);
                name = inputPath.exec(name || bower.settings.file || defaults.file);
                if (isValidJson(name[2])) {
                    bower.overrides = JSON.parse(name[2]);
                }

                name = normalize(name[1]);
                return name;
            },
            write: function pluginWrite(pluginName, moduleName, write) {
                var content;
                if (moduleName in buildMap) {
                    if (request.settings.bower.auto) {
                        content = 'requirejs.config(' + buildMap[moduleName] + '); return ' + buildMap[moduleName] + ';';
                    } else {
                        content = buildMap[moduleName];
                    }

                    write('define("' + pluginName + '!' + moduleName + '", function(){' + content + ';});\n');
                }
            }
        };
    });
}());

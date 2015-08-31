/*    
 * @license requirejs - plugin - bower 0.1.0
 * Copyright(c) 2014, Rodney Robert Ebanks foss@rodneyebanks.com All Rights Reserved.
 * Available via the MIT or new BSD license.
 */

(function (requirejs) {
    'use strict';
    define(['module', 'json'], function (module, json) {
        var defaults = {
            root: '/bower.json',
            manifest: 'bower.json',
            baseUrl: '../bower_components',
            extensions: 'js|css',
            ignore: 'requirejs|requirejs-domready|requirejs-text',
            auto: true,
            deps: ['dependencies'],
            loader: {
                css: 'css'
            }
        };
        var request = {
            parent: null,
            config: {}
        };
        var store = {
            count: 0,
            processed: {},
            json: {},
            modules: {},
            config: {
                paths: {},
                shim: {}
            }
        };
        var REGEX_PATH_RELATIVE = /^([^a-z|0-9]*)/,
            REGEX_PATH_SPLIT = /^(.*?)([^/\\]*?)(?:\.([^ :\\/.]*))?$/;

        function objectExtend(destination, source) {
            if (typeof source === 'object') {
                Object.keys(source).forEach(function (value) {
                    destination[value] = source[value];
                });
            }
            return destination;
        }

        function formatManifestPath(name) {
            name = defaults.baseUrl + '/' + name + '/' + defaults.manifest;
            return name;
        }

        function processManifest(name, req, onProcess, config, root) {
            var jsonFileName;
            req = req || request.parent;
            config = config || request.config;
            onProcess = onProcess || function () {};

            store.count = store.count + 1;

            function finished(config) {
                store.count = store.count - 1;

                if (store.count < 1) {
                    request.onLoad(config);
                }
            }

            if (root) {
                request.onLoad = onProcess;
            }

            // Fixme: Build require not working with paths relative to baseUrl from browser config e.g. '../bower.json'.
            if (request.config.isBuild) {
                jsonFileName = name.replace(REGEX_PATH_RELATIVE, request.config.appDir);
            } else {
                jsonFileName = name;
            }

            if (store.processed[name] !== true) {
                store.processed[name] = true;

                json.load(jsonFileName, req, function (jsonFile) {
                    if (jsonFile) {
                        if (typeof jsonFile !== 'object') {
                            jsonFile = JSON.parse(jsonFile);
                        }
                        parseManifest(name, jsonFile, finished, root);
                    } else {
                        onProcess(store.config);
                    }
                }, config);
            } else {
                finished(store.config);
            }
        }

        function parseManifest(file, manifestJson, onParse, root) {
            var baseUrl, baseName, shimModules = [],
                shimDeps = [],
                localDeps = [],
                parseManifestPath = new RegExp(REGEX_PATH_SPLIT),
                parseRelativePath = new RegExp(REGEX_PATH_RELATIVE),
                validExt = new RegExp('^(' + defaults.extensions + ')$'),
                ignoreFile = new RegExp('^(' + defaults.ignore + ')$');

            // Check to make sure we actually have a manifestJson, otherwise, just call the onParse with a return.
            if (!manifestJson) {
                onParse(store.config);
                return;
            }

            // Format manifest to required standard.
            manifestJson.main = [].concat(manifestJson.main || file);
            defaults.deps.forEach(function (depsPath) {
                manifestJson[depsPath] = Object.keys(manifestJson[depsPath] || {});
            });

            // Top level for all mains in module
            baseUrl = parseManifestPath.exec(file)[1];
            baseName = manifestJson.name;

            // Process each module in main
            manifestJson.main.forEach(function (moduleName) {
                var name, file, path, ext, filePath = parseManifestPath.exec(moduleName);

                name = manifestJson.name;
                path = filePath[1].replace(parseRelativePath, '');
                file = filePath[2];
                ext = filePath[3];

                if (validExt.test(ext) && !ignoreFile.test(baseName)) {
                    // Fix issue where name contains .js or other file extension
                    name = name.replace('.', '-');

                    if (ext !== 'js') {
                        // Stop overwites when module contains main with same name and different extensions ionic.js > ionic, ionic.css > ionic-css
                        name = name + '-' + ext;

                        if (defaults.loader[ext]) {
                            localDeps.push(defaults.loader[ext] + '!' + name);
                        }
                    } else if (file !== name && manifestJson.main.length > 1) {
                        // Multiple main modules possible.
                        name = file;
                        shimModules.push(name);
                    } else {
                        name = name;
                        shimModules.push(name);
                    }

                    store.config.paths[name] = baseUrl + path + file;
                    store.config.shim[name] = {};
                    store.config.shim[name].exports = name;

                }
            });

            manifestJson.dependencies.forEach(function (value) {
                shimDeps.push(value.replace('.', '-'));
            });

            // Add module shims with dependencies.
            shimModules.forEach(function (moduleName) {
                if (manifestJson.dependencies.length > 0 || localDeps.length > 0) {
                    store.config.shim[moduleName].deps = [].concat(localDeps, shimDeps);
                }
            });


            // Process modules dependencies (any included in defaults/settings dependencies:[])
            defaults.deps.forEach(function (bowerDependencies) {
                if (manifestJson[bowerDependencies] && manifestJson[bowerDependencies].length > 0) {
                    manifestJson[bowerDependencies].forEach(function (dependency) {
                        if (!ignoreFile.test(dependency)) {
                            processManifest(formatManifestPath(dependency));
                        }
                    });
                }
            });

            // Return
            onParse(store.config);
        }

        function pluginLoad(name, req, onLoad, config) {
            request.parent = req;
            request.config = config;

            defaults = objectExtend(defaults, request.config.bower || {});

            processManifest(defaults.root, req, function (config) {
                if (defaults.auto && !request.config.isBuild) {
                    requirejs.config(config);
                }
                onLoad(config);
            }, config, true);

            if (config && config.isBuild) {
                onLoad(store.config);
            }
        }

        function pluginNormalize(name) {
            defaults.root = name || defaults.root;

            return defaults.root;
        }

        function pluginWrite(pluginName, moduleName, write) {
            var content = JSON.stringify(store.config);

            if (defaults.auto) {
                content = 'define("' + pluginName + '!' + moduleName + '", function(){var bowerConfig=' + content + ';\nrequirejs.config(bowerConfig);\nreturn bowerConfig;\n});\n';
            } else {
                content = 'define("' + pluginName + '!' + moduleName + '", function(){\nreturn ' + content + ';\n});\n';
            }

            write(content);
        }

        return {
            load: pluginLoad,
            normalize: pluginNormalize,
            write: pluginWrite
        };
    });
}(requirejs));

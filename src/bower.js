/*    
 * @license requirejs - plugin - bower 0.0.1
 * Copyright(c) 2014, Rodney Robert Ebanks foss@rodneyebanks.com All Rights Reserved.
 * Available via the MIT or new BSD license.
 */

// FIXME: Some bundled components have the same filename for different file types (.js/.css) which result in overwrites e.g. ionic > ionic.js & ionic.css.
// NOTE: Manual fix to compatibility issue is adding paths/shim which will overwrite auto-config.

(function() {
    'use strict';
    define(['module', 'json'], function(module, json) {
        var defaults = {
            file: '/bower.json',
            baseUrl: '../bower_components',
            extensions: 'js|css',
            ignore: 'requirejs|requirejs-domready|requirejs-text',
            auto: true,
            rjsConfig: {
                paths: {},
                shim: {}
            }
        }, request = {
                parent: null,
                config: {}
            }, bower = {
                settings: {},
                json: {},
                config: {
                    paths: {},
                    shim: {}
                },
                processed: {}
            }, bowerCounter = 0,
            done, REGEX_PATH_RELATIVE = /^([^a-z|0-9]*)/,
            REGEX_PATH_SPLIT = /^(.*?)([^/\\]*?)(?:\.([^ :\\/.]*))?$/,
            REGEX_PATH_BOWER = /^(.*?bower.json)+(.*)$/;

        function objectExtend(destination, source) {
            if (typeof source === 'object') {
                Object.keys(source).forEach(function(value) {
                    destination[value] = source[value];
                });
            }
            return destination;
        }

        function formatBowerFilePath(name) {
            name = bower.settings.baseUrl + '/' + name + '/bower.json';
            return name;
        }

        function processBowerFile(name, req, onProcess, config, root) {
            var jsonFileName;
            req = req || request.parent;
            config = config || request.config;
            onProcess = onProcess || function() {};

            bowerCounter = bowerCounter + 1;

            if (root) {
                done = onProcess;
            }

            function finished(bowerConfig) {
                bowerCounter = bowerCounter - 1;
                if (bowerCounter === 0) {
                    if (done) {
                        done(bowerConfig);
                    }
                }
            }

            // Fixme: Build require not working with paths relative to baseUrl in browser '../bower.json'.
            if (request.config.isBuild) {
                jsonFileName = name.replace(REGEX_PATH_RELATIVE, request.config.appDir);
            } else {
                jsonFileName = name;
            }

            json.load(jsonFileName, req, function(jsonFile) {
                parseBowerFile(name, jsonFile, finished, root);
            }, config);
        }

        function parseBowerFile(bowerFilePath, bowerJson, onParse, root) {
            var baseUrl, baseName, parseFilePath = new RegExp(REGEX_PATH_SPLIT),
                parseRelativePath = new RegExp(REGEX_PATH_RELATIVE),
                validExt = new RegExp('^(' + bower.settings.extensions + ')$'),
                ignoreFile = new RegExp('^(' + bower.settings.ignore + ')$');

            // Fixme: requirejs-plugins json Returns a javascript object inBrowser and json string inBuild
            if (typeof bowerJson !== 'object') {
                bowerJson = JSON.parse(bowerJson);
            }

            // Format bower.json
            bowerJson.main = [].concat(bowerJson.main || bowerFilePath);
            bowerJson.dependencies = Object.keys(bowerJson.dependencies || {});

            // Top level for all mains in module
            baseUrl = parseFilePath.exec(bowerFilePath)[1];
            baseName = bowerJson.name;

            // Process each module in main
            bowerJson.main.forEach(function(moduleName) {
                var name, file, path, ext, filePath = parseFilePath.exec(moduleName);

                name = bowerJson.name;
                path = filePath[1].replace(parseRelativePath, '');
                file = filePath[2];
                ext = filePath[3];

                if (validExt.test(ext) && (!ignoreFile.test(baseName) || !bower.processed[baseName])) {
                    if (file === name && ext !== 'js') {
                        // Stop overwites when module contains main with same name and different extensions ionic.js > ionic, ionic.css > ionic-css
                        name = name + '-' + ext;
                    } else if (file !== name && bowerJson.main.length > 1) {
                        // Multiple main modules possible e.g,
                        name = file;
                    } else {
                        name = name;
                    }

                    bower.config.paths[name] = baseUrl + path + file;
                    bower.config.shim[name] = {};
                    bower.config.shim[name].exports = name;

                    if (bowerJson.dependencies.length > 0) {
                        bower.config.shim[name].deps = bowerJson.dependencies;
                    }
                }
            });

            bower.processed[baseName] = true;

            // Process modules dependencies
            bowerJson.dependencies.forEach(function(value) {
                if (!ignoreFile.test(value)) {
                    processBowerFile(formatBowerFilePath(value));
                }
            });

            // Return
            onParse(bower.config);
        }

        function pluginLoad(name, req, onLoad, config) {
            request.parent = req;
            request.config = config;
            bower.settings = defaults;
            bower.settings = objectExtend(bower.settings, request.config.bower || {});
            bower.settings.file = name;

            processBowerFile(bower.settings.file, req, function(value) {
                if (bower.settings.auto && !request.config.isBuild) {
                    requirejs.config(bower.config);
                }
                onLoad(bower.config);
            }, config, true);

            if (config && config.isBuild) {
                onLoad(bower.config);
            }
        }

        function pluginNormalize(name, normalize) {
            var bowerPath = new RegExp(REGEX_PATH_BOWER),
                bowerFile = bowerPath.exec(name || bower.settings.file || defaults.file);

            name = normalize(bowerFile[1]);

            return name;
        }

        function pluginWrite(pluginName, moduleName, write) {
            var content = JSON.stringify(bower.config);

            if (bower.settings.auto) {
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
}());

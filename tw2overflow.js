/**
 * https://github.com/tsironis/lockr
 */
;(function(root, factory) {
    define('Lockr', factory(root, {}))
}(this, function(root, Lockr) {
    'use strict'

    Lockr.prefix = ''

    Lockr._getPrefixedKey = function(key, options) {
        options = options || {}

        if (options.noPrefix) {
            return key
        } else {
            return this.prefix + key
        }

    }

    Lockr.set = function(key, value, options) {
        var query_key = this._getPrefixedKey(key, options)

        try {
            localStorage.setItem(query_key, JSON.stringify({
                data: value
            }))
        } catch (e) {}
    }

    Lockr.get = function(key, missing, options) {
        var query_key = this._getPrefixedKey(key, options),
            value

        try {
            value = JSON.parse(localStorage.getItem(query_key))
        } catch (e) {
            if (localStorage[query_key]) {
                value = {
                    data: localStorage.getItem(query_key)
                }
            } else {
                value = null
            }
        }
        
        if (value === null) {
            return missing
        } else if (typeof value === 'object' && typeof value.data !== 'undefined') {
            return value.data
        } else {
            return missing
        }
    }

    return Lockr
}))

;(function() {
    var Translator, i18n, translator,
        __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        };

    Translator = (function() {
        function Translator() {
            this.translate = __bind(this.translate, this);
            this.data = {
                values: {},
                contexts: []
            };
            this.globalContext = {};
        }

        Translator.prototype.translate = function(text, defaultNumOrFormatting, numOrFormattingOrContext, formattingOrContext, context) {
            var defaultText, formatting, isObject, num;

            if (context == null) {
                context = this.globalContext;
            }
            isObject = function(obj) {
                var type;

                type = typeof obj;
                return type === "function" || type === "object" && !!obj;
            };
            if (isObject(defaultNumOrFormatting)) {
                defaultText = null;
                num = null;
                formatting = defaultNumOrFormatting;
                context = numOrFormattingOrContext || this.globalContext;
            } else {
                if (typeof defaultNumOrFormatting === "number") {
                    defaultText = null;
                    num = defaultNumOrFormatting;
                    formatting = numOrFormattingOrContext;
                    context = formattingOrContext || this.globalContext;
                } else {
                    defaultText = defaultNumOrFormatting;
                    if (typeof numOrFormattingOrContext === "number") {
                        num = numOrFormattingOrContext;
                        formatting = formattingOrContext;
                        context = context;
                    } else {
                        num = null;
                        formatting = numOrFormattingOrContext;
                        context = formattingOrContext || this.globalContext;
                    }
                }
            }
            if (isObject(text)) {
                if (isObject(text['i18n'])) {
                    text = text['i18n'];
                }
                return this.translateHash(text, context);
            } else {
                return this.translateText(text, num, formatting, context, defaultText);
            }
        };

        Translator.prototype.add = function(d) {
            var c, k, v, _i, _len, _ref, _ref1, _results;

            if ((d.values != null)) {
                _ref = d.values;
                for (k in _ref) {
                    v = _ref[k];
                    this.data.values[k] = v;
                }
            }
            if ((d.contexts != null)) {
                _ref1 = d.contexts;
                _results = [];
                for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                    c = _ref1[_i];
                    _results.push(this.data.contexts.push(c));
                }
                return _results;
            }
        };

        Translator.prototype.setContext = function(key, value) {
            return this.globalContext[key] = value;
        };

        Translator.prototype.clearContext = function(key) {
            return this.lobalContext[key] = null;
        };

        Translator.prototype.reset = function() {
            this.data = {
                values: {},
                contexts: []
            };
            return this.globalContext = {};
        };

        Translator.prototype.resetData = function() {
            return this.data = {
                values: {},
                contexts: []
            };
        };

        Translator.prototype.resetContext = function() {
            return this.globalContext = {};
        };

        Translator.prototype.translateHash = function(hash, context) {
            var k, v;

            for (k in hash) {
                v = hash[k];
                if (typeof v === "string") {
                    hash[k] = this.translateText(v, null, null, context);
                }
            }
            return hash;
        };

        Translator.prototype.translateText = function(text, num, formatting, context, defaultText) {
            var contextData, result;

            if (context == null) {
                context = this.globalContext;
            }
            if (this.data == null) {
                return this.useOriginalText(defaultText || text, num, formatting);
            }
            contextData = this.getContextData(this.data, context);
            if (contextData != null) {
                result = this.findTranslation(text, num, formatting, contextData.values, defaultText);
            }
            if (result == null) {
                result = this.findTranslation(text, num, formatting, this.data.values, defaultText);
            }
            if (result == null) {
                return this.useOriginalText(defaultText || text, num, formatting);
            }
            return result;
        };

        Translator.prototype.findTranslation = function(text, num, formatting, data) {
            var result, triple, value, _i, _len;

            value = data[text];
            if (value == null) {
                return null;
            }
            if (num == null) {
                if (typeof value === "string") {
                    return this.applyFormatting(value, num, formatting);
                }
            } else {
                if (value instanceof Array || value.length) {
                    for (_i = 0, _len = value.length; _i < _len; _i++) {
                        triple = value[_i];
                        if ((num >= triple[0] || triple[0] === null) && (num <= triple[1] || triple[1] === null)) {
                            result = this.applyFormatting(triple[2].replace("-%n", String(-num)), num, formatting);
                            return this.applyFormatting(result.replace("%n", String(num)), num, formatting);
                        }
                    }
                }
            }
            return null;
        };

        Translator.prototype.getContextData = function(data, context) {
            var c, equal, key, value, _i, _len, _ref, _ref1;

            if (data.contexts == null) {
                return null;
            }
            _ref = data.contexts;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                c = _ref[_i];
                equal = true;
                _ref1 = c.matches;
                for (key in _ref1) {
                    value = _ref1[key];
                    equal = equal && value === context[key];
                }
                if (equal) {
                    return c;
                }
            }
            return null;
        };

        Translator.prototype.useOriginalText = function(text, num, formatting) {
            if (num == null) {
                return this.applyFormatting(text, num, formatting);
            }
            return this.applyFormatting(text.replace("%n", String(num)), num, formatting);
        };

        Translator.prototype.applyFormatting = function(text, num, formatting) {
            var ind, regex;

            for (ind in formatting) {
                regex = new RegExp("%{" + ind + "}", "g");
                text = text.replace(regex, formatting[ind]);
            }
            return text;
        };

        return Translator;

    })();

    translator = new Translator();

    i18n = translator.translate;

    i18n.translator = translator;

    i18n.create = function(data) {
        var trans;

        trans = new Translator();
        if (data != null) {
            trans.add(data);
        }
        trans.translate.create = i18n.create;
        return trans.translate;
    };

    define('i18n', function() {
        return i18n
    })
}).call(this);

(function(f) {
    define('ejs', f())
})(function() {
    var define, module, exports;
    return (function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f
                }
                var l = n[o] = {
                    exports: {}
                };
                t[o][0].call(l.exports, function(e) {
                    var n = t[o][1][e];
                    return s(n ? n : e)
                }, l, l.exports, e, t, n, r)
            }
            return n[o].exports
        }
        var i = typeof require == "function" && require;
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s
    })({
        1: [function(require, module, exports) {
            /*
             * EJS Embedded JavaScript templates
             * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
             *
             * Licensed under the Apache License, Version 2.0 (the "License");
             * you may not use this file except in compliance with the License.
             * You may obtain a copy of the License at
             *
             *         http://www.apache.org/licenses/LICENSE-2.0
             *
             * Unless required by applicable law or agreed to in writing, software
             * distributed under the License is distributed on an "AS IS" BASIS,
             * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
             * See the License for the specific language governing permissions and
             * limitations under the License.
             *
             */

            'use strict';

            /**
             * @file Embedded JavaScript templating engine. {@link http://ejs.co}
             * @author Matthew Eernisse <mde@fleegix.org>
             * @author Tiancheng "Timothy" Gu <timothygu99@gmail.com>
             * @project EJS
             * @license {@link http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0}
             */

            /**
             * EJS internal functions.
             *
             * Technically this "module" lies in the same file as {@link module:ejs}, for
             * the sake of organization all the private functions re grouped into this
             * module.
             *
             * @module ejs-internal
             * @private
             */

            /**
             * Embedded JavaScript templating engine.
             *
             * @module ejs
             * @public
             */

            var fs = require('fs');
            var path = require('path');
            var utils = require('./utils');

            var scopeOptionWarned = false;
            var _VERSION_STRING = require('../package.json').version;
            var _DEFAULT_DELIMITER = '%';
            var _DEFAULT_LOCALS_NAME = 'locals';
            var _NAME = 'ejs';
            var _REGEX_STRING = '(<%%|%%>|<%=|<%-|<%_|<%#|<%|%>|-%>|_%>)';
            var _OPTS = ['delimiter', 'scope', 'context', 'debug', 'compileDebug',
                'client', '_with', 'rmWhitespace', 'strict', 'filename'
            ];
            // We don't allow 'cache' option to be passed in the data obj
            // for the normal `render` call, but this is where Express puts it
            // so we make an exception for `renderFile`
            var _OPTS_EXPRESS = _OPTS.concat('cache');
            var _BOM = /^\uFEFF/;

            /**
             * EJS template function cache. This can be a LRU object from lru-cache NPM
             * module. By default, it is {@link module:utils.cache}, a simple in-process
             * cache that grows continuously.
             *
             * @type {Cache}
             */

            exports.cache = utils.cache;

            /**
             * Custom file loader. Useful for template preprocessing or restricting access
             * to a certain part of the filesystem.
             *
             * @type {fileLoader}
             */

            exports.fileLoader = fs.readFileSync;

            /**
             * Name of the object containing the locals.
             *
             * This variable is overridden by {@link Options}`.localsName` if it is not
             * `undefined`.
             *
             * @type {String}
             * @public
             */

            exports.localsName = _DEFAULT_LOCALS_NAME;

            /**
             * Get the path to the included file from the parent file path and the
             * specified path.
             *
             * @param {String}  name     specified path
             * @param {String}  filename parent file path
             * @param {Boolean} isDir    parent file path whether is directory
             * @return {String}
             */
            exports.resolveInclude = function(name, filename, isDir) {
                var dirname = path.dirname;
                var extname = path.extname;
                var resolve = path.resolve;
                var includePath = resolve(isDir ? filename : dirname(filename), name);
                var ext = extname(name);
                if (!ext) {
                    includePath += '.ejs';
                }
                return includePath;
            };

            /**
             * Get the path to the included file by Options
             *
             * @param  {String}  path    specified path
             * @param  {Options} options compilation options
             * @return {String}
             */
            function getIncludePath(path, options) {
                var includePath;
                if (path.charAt(0) == '/') {
                    includePath = exports.resolveInclude(path.replace(/^\/*/, ''), options.root || '/', true);
                } else {
                    if (!options.filename) {
                        throw new Error('`include` use relative path requires the \'filename\' option.');
                    }
                    includePath = exports.resolveInclude(path, options.filename);
                }
                return includePath;
            }

            /**
             * Get the template from a string or a file, either compiled on-the-fly or
             * read from cache (if enabled), and cache the template if needed.
             *
             * If `template` is not set, the file specified in `options.filename` will be
             * read.
             *
             * If `options.cache` is true, this function reads the file from
             * `options.filename` so it must be set prior to calling this function.
             *
             * @memberof module:ejs-internal
             * @param {Options} options   compilation options
             * @param {String} [template] template source
             * @return {(TemplateFunction|ClientFunction)}
             * Depending on the value of `options.client`, either type might be returned.
             * @static
             */

            function handleCache(options, template) {
                var func;
                var filename = options.filename;
                var hasTemplate = arguments.length > 1;

                if (options.cache) {
                    if (!filename) {
                        throw new Error('cache option requires a filename');
                    }
                    func = exports.cache.get(filename);
                    if (func) {
                        return func;
                    }
                    if (!hasTemplate) {
                        template = fileLoader(filename).toString().replace(_BOM, '');
                    }
                } else if (!hasTemplate) {
                    // istanbul ignore if: should not happen at all
                    if (!filename) {
                        throw new Error('Internal EJS error: no file name or template ' +
                            'provided');
                    }
                    template = fileLoader(filename).toString().replace(_BOM, '');
                }
                func = exports.compile(template, options);
                if (options.cache) {
                    exports.cache.set(filename, func);
                }
                return func;
            }

            /**
             * Try calling handleCache with the given options and data and call the
             * callback with the result. If an error occurs, call the callback with
             * the error. Used by renderFile().
             *
             * @memberof module:ejs-internal
             * @param {Options} options    compilation options
             * @param {Object} data        template data
             * @param {RenderFileCallback} cb callback
             * @static
             */

            function tryHandleCache(options, data, cb) {
                var result;
                try {
                    result = handleCache(options)(data);
                } catch (err) {
                    return cb(err);
                }
                return cb(null, result);
            }

            /**
             * fileLoader is independent
             *
             * @param {String} filePath ejs file path.
             * @return {String} The contents of the specified file.
             * @static
             */

            function fileLoader(filePath) {
                return exports.fileLoader(filePath);
            }

            /**
             * Get the template function.
             *
             * If `options.cache` is `true`, then the template is cached.
             *
             * @memberof module:ejs-internal
             * @param {String}  path    path for the specified file
             * @param {Options} options compilation options
             * @return {(TemplateFunction|ClientFunction)}
             * Depending on the value of `options.client`, either type might be returned
             * @static
             */

            function includeFile(path, options) {
                var opts = utils.shallowCopy({}, options);
                opts.filename = getIncludePath(path, opts);
                return handleCache(opts);
            }

            /**
             * Get the JavaScript source of an included file.
             *
             * @memberof module:ejs-internal
             * @param {String}  path    path for the specified file
             * @param {Options} options compilation options
             * @return {Object}
             * @static
             */

            function includeSource(path, options) {
                var opts = utils.shallowCopy({}, options);
                var includePath;
                var template;
                includePath = getIncludePath(path, opts);
                template = fileLoader(includePath).toString().replace(_BOM, '');
                opts.filename = includePath;
                var templ = new Template(template, opts);
                templ.generateSource();
                return {
                    source: templ.source,
                    filename: includePath,
                    template: template
                };
            }

            /**
             * Re-throw the given `err` in context to the `str` of ejs, `filename`, and
             * `lineno`.
             *
             * @implements RethrowCallback
             * @memberof module:ejs-internal
             * @param {Error}  err      Error object
             * @param {String} str      EJS source
             * @param {String} filename file name of the EJS file
             * @param {String} lineno   line number of the error
             * @static
             */

            function rethrow(err, str, flnm, lineno, esc) {
                var lines = str.split('\n');
                var start = Math.max(lineno - 3, 0);
                var end = Math.min(lines.length, lineno + 3);
                var filename = esc(flnm); // eslint-disable-line
                // Error context
                var context = lines.slice(start, end).map(function(line, i) {
                    var curr = i + start + 1;
                    return (curr == lineno ? ' >> ' : '    ') +
                        curr +
                        '| ' +
                        line;
                }).join('\n');

                // Alter exception message
                err.path = filename;
                err.message = (filename || 'ejs') + ':' +
                    lineno + '\n' +
                    context + '\n\n' +
                    err.message;

                throw err;
            }

            function stripSemi(str) {
                return str.replace(/;(\s*$)/, '$1');
            }

            /**
             * Compile the given `str` of ejs into a template function.
             *
             * @param {String}  template EJS template
             *
             * @param {Options} opts     compilation options
             *
             * @return {(TemplateFunction|ClientFunction)}
             * Depending on the value of `opts.client`, either type might be returned.
             * @public
             */

            exports.compile = function compile(template, opts) {
                var templ;

                // v1 compat
                // 'scope' is 'context'
                // FIXME: Remove this in a future version
                if (opts && opts.scope) {
                    if (!scopeOptionWarned) {
                        console.warn('`scope` option is deprecated and will be removed in EJS 3');
                        scopeOptionWarned = true;
                    }
                    if (!opts.context) {
                        opts.context = opts.scope;
                    }
                    delete opts.scope;
                }
                templ = new Template(template, opts);
                return templ.compile();
            };

            /**
             * Render the given `template` of ejs.
             *
             * If you would like to include options but not data, you need to explicitly
             * call this function with `data` being an empty object or `null`.
             *
             * @param {String}   template EJS template
             * @param {Object}  [data={}] template data
             * @param {Options} [opts={}] compilation and rendering options
             * @return {String}
             * @public
             */

            exports.render = function(template, d, o) {
                var data = d || {};
                var opts = o || {};

                // No options object -- if there are optiony names
                // in the data, copy them to options
                if (arguments.length == 2) {
                    utils.shallowCopyFromList(opts, data, _OPTS);
                }

                return handleCache(opts, template)(data);
            };

            /**
             * Render an EJS file at the given `path` and callback `cb(err, str)`.
             *
             * If you would like to include options but not data, you need to explicitly
             * call this function with `data` being an empty object or `null`.
             *
             * @param {String}             path     path to the EJS file
             * @param {Object}            [data={}] template data
             * @param {Options}           [opts={}] compilation and rendering options
             * @param {RenderFileCallback} cb callback
             * @public
             */

            exports.renderFile = function() {
                var filename = arguments[0];
                var cb = arguments[arguments.length - 1];
                var opts = {
                    filename: filename
                };
                var data;

                if (arguments.length > 2) {
                    data = arguments[1];

                    // No options object -- if there are optiony names
                    // in the data, copy them to options
                    if (arguments.length === 3) {
                        // Express 4
                        if (data.settings && data.settings['view options']) {
                            utils.shallowCopyFromList(opts, data.settings['view options'], _OPTS_EXPRESS);
                        }
                        // Express 3 and lower
                        else {
                            utils.shallowCopyFromList(opts, data, _OPTS_EXPRESS);
                        }
                    } else {
                        // Use shallowCopy so we don't pollute passed in opts obj with new vals
                        utils.shallowCopy(opts, arguments[2]);
                    }

                    opts.filename = filename;
                } else {
                    data = {};
                }

                return tryHandleCache(opts, data, cb);
            };

            /**
             * Clear intermediate JavaScript cache. Calls {@link Cache#reset}.
             * @public
             */

            exports.clearCache = function() {
                exports.cache.reset();
            };

            function Template(text, opts) {
                opts = opts || {};
                var options = {};
                this.templateText = text;
                this.mode = null;
                this.truncate = false;
                this.currentLine = 1;
                this.source = '';
                this.dependencies = [];
                options.client = opts.client || false;
                options.escapeFunction = opts.escape || utils.escapeXML;
                options.compileDebug = opts.compileDebug !== false;
                options.debug = !!opts.debug;
                options.filename = opts.filename;
                options.delimiter = opts.delimiter || exports.delimiter || _DEFAULT_DELIMITER;
                options.strict = opts.strict || false;
                options.context = opts.context;
                options.cache = opts.cache || false;
                options.rmWhitespace = opts.rmWhitespace;
                options.root = opts.root;
                options.localsName = opts.localsName || exports.localsName || _DEFAULT_LOCALS_NAME;

                if (options.strict) {
                    options._with = false;
                } else {
                    options._with = typeof opts._with != 'undefined' ? opts._with : true;
                }

                this.opts = options;

                this.regex = this.createRegex();
            }

            Template.modes = {
                EVAL: 'eval',
                ESCAPED: 'escaped',
                RAW: 'raw',
                COMMENT: 'comment',
                LITERAL: 'literal'
            };

            Template.prototype = {
                createRegex: function() {
                    var str = _REGEX_STRING;
                    var delim = utils.escapeRegExpChars(this.opts.delimiter);
                    str = str.replace(/%/g, delim);
                    return new RegExp(str);
                },

                compile: function() {
                    var src;
                    var fn;
                    var opts = this.opts;
                    var prepended = '';
                    var appended = '';
                    var escapeFn = opts.escapeFunction;

                    if (!this.source) {
                        this.generateSource();
                        prepended += '  var __output = [], __append = __output.push.bind(__output);' + '\n';
                        if (opts._with !== false) {
                            prepended += '  with (' + opts.localsName + ' || {}) {' + '\n';
                            appended += '  }' + '\n';
                        }
                        appended += '  return __output.join("");' + '\n';
                        this.source = prepended + this.source + appended;
                    }

                    if (opts.compileDebug) {
                        src = 'var __line = 1' + '\n' +
                            '  , __lines = ' + JSON.stringify(this.templateText) + '\n' +
                            '  , __filename = ' + (opts.filename ?
                                JSON.stringify(opts.filename) : 'undefined') + ';' + '\n' +
                            'try {' + '\n' +
                            this.source +
                            '} catch (e) {' + '\n' +
                            '  rethrow(e, __lines, __filename, __line, escapeFn);' + '\n' +
                            '}' + '\n';
                    } else {
                        src = this.source;
                    }

                    if (opts.debug) {
                        console.log(src);
                    }

                    if (opts.client) {
                        src = 'escapeFn = escapeFn || ' + escapeFn.toString() + ';' + '\n' + src;
                        if (opts.compileDebug) {
                            src = 'rethrow = rethrow || ' + rethrow.toString() + ';' + '\n' + src;
                        }
                    }

                    if (opts.strict) {
                        src = '"use strict";\n' + src;
                    }

                    try {
                        fn = new Function(opts.localsName + ', escapeFn, include, rethrow', src);
                    } catch (e) {
                        // istanbul ignore else
                        if (e instanceof SyntaxError) {
                            if (opts.filename) {
                                e.message += ' in ' + opts.filename;
                            }
                            e.message += ' while compiling ejs\n\n';
                            e.message += 'If the above error is not helpful, you may want to try EJS-Lint:\n';
                            e.message += 'https://github.com/RyanZim/EJS-Lint';
                        }
                        throw e;
                    }

                    if (opts.client) {
                        fn.dependencies = this.dependencies;
                        return fn;
                    }

                    // Return a callable function which will execute the function
                    // created by the source-code, with the passed data as locals
                    // Adds a local `include` function which allows full recursive include
                    var returnedFn = function(data) {
                        var include = function(path, includeData) {
                            var d = utils.shallowCopy({}, data);
                            if (includeData) {
                                d = utils.shallowCopy(d, includeData);
                            }
                            return includeFile(path, opts)(d);
                        };
                        return fn.apply(opts.context, [data || {}, escapeFn, include, rethrow]);
                    };
                    returnedFn.dependencies = this.dependencies;
                    return returnedFn;
                },

                generateSource: function() {
                    var opts = this.opts;

                    if (opts.rmWhitespace) {
                        // Have to use two separate replace here as `^` and `$` operators don't
                        // work well with `\r`.
                        this.templateText =
                            this.templateText.replace(/\r/g, '').replace(/^\s+|\s+$/gm, '');
                    }

                    // Slurp spaces and tabs before <%_ and after _%>
                    this.templateText =
                        this.templateText.replace(/[ \t]*<%_/gm, '<%_').replace(/_%>[ \t]*/gm, '_%>');

                    var self = this;
                    var matches = this.parseTemplateText();
                    var d = this.opts.delimiter;

                    if (matches && matches.length) {
                        matches.forEach(function(line, index) {
                            var opening;
                            var closing;
                            var include;
                            var includeOpts;
                            var includeObj;
                            var includeSrc;
                            // If this is an opening tag, check for closing tags
                            // FIXME: May end up with some false positives here
                            // Better to store modes as k/v with '<' + delimiter as key
                            // Then this can simply check against the map
                            if (line.indexOf('<' + d) === 0 // If it is a tag
                                &&
                                line.indexOf('<' + d + d) !== 0) { // and is not escaped
                                closing = matches[index + 2];
                                if (!(closing == d + '>' || closing == '-' + d + '>' || closing == '_' + d + '>')) {
                                    throw new Error('Could not find matching close tag for "' + line + '".');
                                }
                            }
                            // HACK: backward-compat `include` preprocessor directives
                            if ((include = line.match(/^\s*include\s+(\S+)/))) {
                                opening = matches[index - 1];
                                // Must be in EVAL or RAW mode
                                if (opening && (opening == '<' + d || opening == '<' + d + '-' || opening == '<' + d + '_')) {
                                    includeOpts = utils.shallowCopy({}, self.opts);
                                    includeObj = includeSource(include[1], includeOpts);
                                    if (self.opts.compileDebug) {
                                        includeSrc =
                                            '    ; (function(){' + '\n' +
                                            '      var __line = 1' + '\n' +
                                            '      , __lines = ' + JSON.stringify(includeObj.template) + '\n' +
                                            '      , __filename = ' + JSON.stringify(includeObj.filename) + ';' + '\n' +
                                            '      try {' + '\n' +
                                            includeObj.source +
                                            '      } catch (e) {' + '\n' +
                                            '        rethrow(e, __lines, __filename, __line);' + '\n' +
                                            '      }' + '\n' +
                                            '    ; }).call(this)' + '\n';
                                    } else {
                                        includeSrc = '    ; (function(){' + '\n' + includeObj.source +
                                            '    ; }).call(this)' + '\n';
                                    }
                                    self.source += includeSrc;
                                    self.dependencies.push(exports.resolveInclude(include[1],
                                        includeOpts.filename));
                                    return;
                                }
                            }
                            self.scanLine(line);
                        });
                    }

                },

                parseTemplateText: function() {
                    var str = this.templateText;
                    var pat = this.regex;
                    var result = pat.exec(str);
                    var arr = [];
                    var firstPos;

                    while (result) {
                        firstPos = result.index;

                        if (firstPos !== 0) {
                            arr.push(str.substring(0, firstPos));
                            str = str.slice(firstPos);
                        }

                        arr.push(result[0]);
                        str = str.slice(result[0].length);
                        result = pat.exec(str);
                    }

                    if (str) {
                        arr.push(str);
                    }

                    return arr;
                },

                scanLine: function(line) {
                    var self = this;
                    var d = this.opts.delimiter;
                    var newLineCount = 0;

                    function _addOutput() {
                        if (self.truncate) {
                            // Only replace single leading linebreak in the line after
                            // -%> tag -- this is the single, trailing linebreak
                            // after the tag that the truncation mode replaces
                            // Handle Win / Unix / old Mac linebreaks -- do the \r\n
                            // combo first in the regex-or
                            line = line.replace(/^(?:\r\n|\r|\n)/, '');
                            self.truncate = false;
                        } else if (self.opts.rmWhitespace) {
                            // rmWhitespace has already removed trailing spaces, just need
                            // to remove linebreaks
                            line = line.replace(/^\n/, '');
                        }
                        if (!line) {
                            return;
                        }

                        // Preserve literal slashes
                        line = line.replace(/\\/g, '\\\\');

                        // Convert linebreaks
                        line = line.replace(/\n/g, '\\n');
                        line = line.replace(/\r/g, '\\r');

                        // Escape double-quotes
                        // - this will be the delimiter during execution
                        line = line.replace(/"/g, '\\"');
                        self.source += '    ; __append("' + line + '")' + '\n';
                    }

                    newLineCount = (line.split('\n').length - 1);

                    switch (line) {
                        case '<' + d:
                        case '<' + d + '_':
                            this.mode = Template.modes.EVAL;
                            break;
                        case '<' + d + '=':
                            this.mode = Template.modes.ESCAPED;
                            break;
                        case '<' + d + '-':
                            this.mode = Template.modes.RAW;
                            break;
                        case '<' + d + '#':
                            this.mode = Template.modes.COMMENT;
                            break;
                        case '<' + d + d:
                            this.mode = Template.modes.LITERAL;
                            this.source += '    ; __append("' + line.replace('<' + d + d, '<' + d) + '")' + '\n';
                            break;
                        case d + d + '>':
                            this.mode = Template.modes.LITERAL;
                            this.source += '    ; __append("' + line.replace(d + d + '>', d + '>') + '")' + '\n';
                            break;
                        case d + '>':
                        case '-' + d + '>':
                        case '_' + d + '>':
                            if (this.mode == Template.modes.LITERAL) {
                                _addOutput();
                            }

                            this.mode = null;
                            this.truncate = line.indexOf('-') === 0 || line.indexOf('_') === 0;
                            break;
                        default:
                            // In script mode, depends on type of tag
                            if (this.mode) {
                                // If '//' is found without a line break, add a line break.
                                switch (this.mode) {
                                    case Template.modes.EVAL:
                                    case Template.modes.ESCAPED:
                                    case Template.modes.RAW:
                                        if (line.lastIndexOf('//') > line.lastIndexOf('\n')) {
                                            line += '\n';
                                        }
                                }
                                switch (this.mode) {
                                    // Just executing code
                                    case Template.modes.EVAL:
                                        this.source += '    ; ' + line + '\n';
                                        break;
                                        // Exec, esc, and output
                                    case Template.modes.ESCAPED:
                                        this.source += '    ; __append(escapeFn(' + stripSemi(line) + '))' + '\n';
                                        break;
                                        // Exec and output
                                    case Template.modes.RAW:
                                        this.source += '    ; __append(' + stripSemi(line) + ')' + '\n';
                                        break;
                                    case Template.modes.COMMENT:
                                        // Do nothing
                                        break;
                                        // Literal <%% mode, append as raw output
                                    case Template.modes.LITERAL:
                                        _addOutput();
                                        break;
                                }
                            }
                            // In string mode, just add the output
                            else {
                                _addOutput();
                            }
                    }

                    if (self.opts.compileDebug && newLineCount) {
                        this.currentLine += newLineCount;
                        this.source += '    ; __line = ' + this.currentLine + '\n';
                    }
                }
            };

            /**
             * Escape characters reserved in XML.
             *
             * This is simply an export of {@link module:utils.escapeXML}.
             *
             * If `markup` is `undefined` or `null`, the empty string is returned.
             *
             * @param {String} markup Input string
             * @return {String} Escaped string
             * @public
             * @func
             * */
            exports.escapeXML = utils.escapeXML;

            /**
             * Express.js support.
             *
             * This is an alias for {@link module:ejs.renderFile}, in order to support
             * Express.js out-of-the-box.
             *
             * @func
             */

            exports.__express = exports.renderFile;

            // Add require support
            /* istanbul ignore else */
            if (require.extensions) {
                require.extensions['.ejs'] = function(module, flnm) {
                    var filename = flnm || /* istanbul ignore next */ module.filename;
                    var options = {
                        filename: filename,
                        client: true
                    };
                    var template = fileLoader(filename).toString();
                    var fn = exports.compile(template, options);
                    module._compile('module.exports = ' + fn.toString() + ';', filename);
                };
            }

            /**
             * Version of EJS.
             *
             * @readonly
             * @type {String}
             * @public
             */

            exports.VERSION = _VERSION_STRING;

            /**
             * Name for detection of EJS.
             *
             * @readonly
             * @type {String}
             * @public
             */

            exports.name = _NAME;

            /* istanbul ignore if */
            if (typeof window != 'undefined') {
                window.ejs = exports;
            }

        }, {
            "../package.json": 6,
            "./utils": 2,
            "fs": 3,
            "path": 4
        }],
        2: [function(require, module, exports) {
            /*
             * EJS Embedded JavaScript templates
             * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
             *
             * Licensed under the Apache License, Version 2.0 (the "License");
             * you may not use this file except in compliance with the License.
             * You may obtain a copy of the License at
             *
             *         http://www.apache.org/licenses/LICENSE-2.0
             *
             * Unless required by applicable law or agreed to in writing, software
             * distributed under the License is distributed on an "AS IS" BASIS,
             * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
             * See the License for the specific language governing permissions and
             * limitations under the License.
             *
             */

            /**
             * Private utility functions
             * @module utils
             * @private
             */

            'use strict';

            var regExpChars = /[|\\{}()[\]^$+*?.]/g;

            /**
             * Escape characters reserved in regular expressions.
             *
             * If `string` is `undefined` or `null`, the empty string is returned.
             *
             * @param {String} string Input string
             * @return {String} Escaped string
             * @static
             * @private
             */
            exports.escapeRegExpChars = function(string) {
                // istanbul ignore if
                if (!string) {
                    return '';
                }
                return String(string).replace(regExpChars, '\\$&');
            };

            var _ENCODE_HTML_RULES = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&#34;',
                "'": '&#39;'
            };
            var _MATCH_HTML = /[&<>\'"]/g;

            function encode_char(c) {
                return _ENCODE_HTML_RULES[c] || c;
            }

            /**
             * Stringified version of constants used by {@link module:utils.escapeXML}.
             *
             * It is used in the process of generating {@link ClientFunction}s.
             *
             * @readonly
             * @type {String}
             */

            var escapeFuncStr =
                'var _ENCODE_HTML_RULES = {\n' +
                '      "&": "&amp;"\n' +
                '    , "<": "&lt;"\n' +
                '    , ">": "&gt;"\n' +
                '    , \'"\': "&#34;"\n' +
                '    , "\'": "&#39;"\n' +
                '    }\n' +
                '  , _MATCH_HTML = /[&<>\'"]/g;\n' +
                'function encode_char(c) {\n' +
                '  return _ENCODE_HTML_RULES[c] || c;\n' +
                '};\n';

            /**
             * Escape characters reserved in XML.
             *
             * If `markup` is `undefined` or `null`, the empty string is returned.
             *
             * @implements {EscapeCallback}
             * @param {String} markup Input string
             * @return {String} Escaped string
             * @static
             * @private
             */

            exports.escapeXML = function(markup) {
                return markup == undefined ?
                    '' :
                    String(markup)
                    .replace(_MATCH_HTML, encode_char);
            };
            exports.escapeXML.toString = function() {
                return Function.prototype.toString.call(this) + ';\n' + escapeFuncStr;
            };

            /**
             * Naive copy of properties from one object to another.
             * Does not recurse into non-scalar properties
             * Does not check to see if the property has a value before copying
             *
             * @param  {Object} to   Destination object
             * @param  {Object} from Source object
             * @return {Object}      Destination object
             * @static
             * @private
             */
            exports.shallowCopy = function(to, from) {
                from = from || {};
                for (var p in from) {
                    to[p] = from[p];
                }
                return to;
            };

            /**
             * Naive copy of a list of key names, from one object to another.
             * Only copies property if it is actually defined
             * Does not recurse into non-scalar properties
             *
             * @param  {Object} to   Destination object
             * @param  {Object} from Source object
             * @param  {Array} list List of properties to copy
             * @return {Object}      Destination object
             * @static
             * @private
             */
            exports.shallowCopyFromList = function(to, from, list) {
                for (var i = 0; i < list.length; i++) {
                    var p = list[i];
                    if (typeof from[p] != 'undefined') {
                        to[p] = from[p];
                    }
                }
                return to;
            };

            /**
             * Simple in-process cache implementation. Does not implement limits of any
             * sort.
             *
             * @implements Cache
             * @static
             * @private
             */
            exports.cache = {
                _data: {},
                set: function(key, val) {
                    this._data[key] = val;
                },
                get: function(key) {
                    return this._data[key];
                },
                reset: function() {
                    this._data = {};
                }
            };

        }, {}],
        3: [function(require, module, exports) {

        }, {}],
        4: [function(require, module, exports) {
            (function(process) {
                // Copyright Joyent, Inc. and other Node contributors.
                //
                // Permission is hereby granted, free of charge, to any person obtaining a
                // copy of this software and associated documentation files (the
                // "Software"), to deal in the Software without restriction, including
                // without limitation the rights to use, copy, modify, merge, publish,
                // distribute, sublicense, and/or sell copies of the Software, and to permit
                // persons to whom the Software is furnished to do so, subject to the
                // following conditions:
                //
                // The above copyright notice and this permission notice shall be included
                // in all copies or substantial portions of the Software.
                //
                // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                // USE OR OTHER DEALINGS IN THE SOFTWARE.

                // resolves . and .. elements in a path array with directory names there
                // must be no slashes, empty elements, or device names (c:\) in the array
                // (so also no leading and trailing slashes - it does not distinguish
                // relative and absolute paths)
                function normalizeArray(parts, allowAboveRoot) {
                    // if the path tries to go above the root, `up` ends up > 0
                    var up = 0;
                    for (var i = parts.length - 1; i >= 0; i--) {
                        var last = parts[i];
                        if (last === '.') {
                            parts.splice(i, 1);
                        } else if (last === '..') {
                            parts.splice(i, 1);
                            up++;
                        } else if (up) {
                            parts.splice(i, 1);
                            up--;
                        }
                    }

                    // if the path is allowed to go above the root, restore leading ..s
                    if (allowAboveRoot) {
                        for (; up--; up) {
                            parts.unshift('..');
                        }
                    }

                    return parts;
                }

                // Split a filename into [root, dir, basename, ext], unix version
                // 'root' is just a slash, or nothing.
                var splitPathRe =
                    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
                var splitPath = function(filename) {
                    return splitPathRe.exec(filename).slice(1);
                };

                // path.resolve([from ...], to)
                // posix version
                exports.resolve = function() {
                    var resolvedPath = '',
                        resolvedAbsolute = false;

                    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
                        var path = (i >= 0) ? arguments[i] : process.cwd();

                        // Skip empty and invalid entries
                        if (typeof path !== 'string') {
                            throw new TypeError('Arguments to path.resolve must be strings');
                        } else if (!path) {
                            continue;
                        }

                        resolvedPath = path + '/' + resolvedPath;
                        resolvedAbsolute = path.charAt(0) === '/';
                    }

                    // At this point the path should be resolved to a full absolute path, but
                    // handle relative paths to be safe (might happen when process.cwd() fails)

                    // Normalize the path
                    resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
                        return !!p;
                    }), !resolvedAbsolute).join('/');

                    return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
                };

                // path.normalize(path)
                // posix version
                exports.normalize = function(path) {
                    var isAbsolute = exports.isAbsolute(path),
                        trailingSlash = substr(path, -1) === '/';

                    // Normalize the path
                    path = normalizeArray(filter(path.split('/'), function(p) {
                        return !!p;
                    }), !isAbsolute).join('/');

                    if (!path && !isAbsolute) {
                        path = '.';
                    }
                    if (path && trailingSlash) {
                        path += '/';
                    }

                    return (isAbsolute ? '/' : '') + path;
                };

                // posix version
                exports.isAbsolute = function(path) {
                    return path.charAt(0) === '/';
                };

                // posix version
                exports.join = function() {
                    var paths = Array.prototype.slice.call(arguments, 0);
                    return exports.normalize(filter(paths, function(p, index) {
                        if (typeof p !== 'string') {
                            throw new TypeError('Arguments to path.join must be strings');
                        }
                        return p;
                    }).join('/'));
                };


                // path.relative(from, to)
                // posix version
                exports.relative = function(from, to) {
                    from = exports.resolve(from).substr(1);
                    to = exports.resolve(to).substr(1);

                    function trim(arr) {
                        var start = 0;
                        for (; start < arr.length; start++) {
                            if (arr[start] !== '') break;
                        }

                        var end = arr.length - 1;
                        for (; end >= 0; end--) {
                            if (arr[end] !== '') break;
                        }

                        if (start > end) return [];
                        return arr.slice(start, end - start + 1);
                    }

                    var fromParts = trim(from.split('/'));
                    var toParts = trim(to.split('/'));

                    var length = Math.min(fromParts.length, toParts.length);
                    var samePartsLength = length;
                    for (var i = 0; i < length; i++) {
                        if (fromParts[i] !== toParts[i]) {
                            samePartsLength = i;
                            break;
                        }
                    }

                    var outputParts = [];
                    for (var i = samePartsLength; i < fromParts.length; i++) {
                        outputParts.push('..');
                    }

                    outputParts = outputParts.concat(toParts.slice(samePartsLength));

                    return outputParts.join('/');
                };

                exports.sep = '/';
                exports.delimiter = ':';

                exports.dirname = function(path) {
                    var result = splitPath(path),
                        root = result[0],
                        dir = result[1];

                    if (!root && !dir) {
                        // No dirname whatsoever
                        return '.';
                    }

                    if (dir) {
                        // It has a dirname, strip trailing slash
                        dir = dir.substr(0, dir.length - 1);
                    }

                    return root + dir;
                };


                exports.basename = function(path, ext) {
                    var f = splitPath(path)[2];
                    // TODO: make this comparison case-insensitive on windows?
                    if (ext && f.substr(-1 * ext.length) === ext) {
                        f = f.substr(0, f.length - ext.length);
                    }
                    return f;
                };


                exports.extname = function(path) {
                    return splitPath(path)[3];
                };

                function filter(xs, f) {
                    if (xs.filter) return xs.filter(f);
                    var res = [];
                    for (var i = 0; i < xs.length; i++) {
                        if (f(xs[i], i, xs)) res.push(xs[i]);
                    }
                    return res;
                }

                // String.prototype.substr - negative index don't work in IE8
                var substr = 'ab'.substr(-1) === 'b' ?
                    function(str, start, len) {
                        return str.substr(start, len)
                    } :
                    function(str, start, len) {
                        if (start < 0) start = str.length + start;
                        return str.substr(start, len);
                    };

            }).call(this, require('_process'))
        }, {
            "_process": 5
        }],
        5: [function(require, module, exports) {
            // shim for using process in browser
            var process = module.exports = {};

            // cached from whatever global is present so that test runners that stub it
            // don't break things.  But we need to wrap it in a try catch in case it is
            // wrapped in strict mode code which doesn't define any globals.  It's inside a
            // function because try/catches deoptimize in certain engines.

            var cachedSetTimeout;
            var cachedClearTimeout;

            function defaultSetTimout() {
                throw new Error('setTimeout has not been defined');
            }

            function defaultClearTimeout() {
                throw new Error('clearTimeout has not been defined');
            }
            (function() {
                try {
                    if (typeof setTimeout === 'function') {
                        cachedSetTimeout = setTimeout;
                    } else {
                        cachedSetTimeout = defaultSetTimout;
                    }
                } catch (e) {
                    cachedSetTimeout = defaultSetTimout;
                }
                try {
                    if (typeof clearTimeout === 'function') {
                        cachedClearTimeout = clearTimeout;
                    } else {
                        cachedClearTimeout = defaultClearTimeout;
                    }
                } catch (e) {
                    cachedClearTimeout = defaultClearTimeout;
                }
            }())

            function runTimeout(fun) {
                if (cachedSetTimeout === setTimeout) {
                    //normal enviroments in sane situations
                    return setTimeout(fun, 0);
                }
                // if setTimeout wasn't available but was latter defined
                if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                    cachedSetTimeout = setTimeout;
                    return setTimeout(fun, 0);
                }
                try {
                    // when when somebody has screwed with setTimeout but no I.E. maddness
                    return cachedSetTimeout(fun, 0);
                } catch (e) {
                    try {
                        // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                        return cachedSetTimeout.call(null, fun, 0);
                    } catch (e) {
                        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                        return cachedSetTimeout.call(this, fun, 0);
                    }
                }


            }

            function runClearTimeout(marker) {
                if (cachedClearTimeout === clearTimeout) {
                    //normal enviroments in sane situations
                    return clearTimeout(marker);
                }
                // if clearTimeout wasn't available but was latter defined
                if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                    cachedClearTimeout = clearTimeout;
                    return clearTimeout(marker);
                }
                try {
                    // when when somebody has screwed with setTimeout but no I.E. maddness
                    return cachedClearTimeout(marker);
                } catch (e) {
                    try {
                        // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                        return cachedClearTimeout.call(null, marker);
                    } catch (e) {
                        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                        // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                        return cachedClearTimeout.call(this, marker);
                    }
                }



            }
            var queue = [];
            var draining = false;
            var currentQueue;
            var queueIndex = -1;

            function cleanUpNextTick() {
                if (!draining || !currentQueue) {
                    return;
                }
                draining = false;
                if (currentQueue.length) {
                    queue = currentQueue.concat(queue);
                } else {
                    queueIndex = -1;
                }
                if (queue.length) {
                    drainQueue();
                }
            }

            function drainQueue() {
                if (draining) {
                    return;
                }
                var timeout = runTimeout(cleanUpNextTick);
                draining = true;

                var len = queue.length;
                while (len) {
                    currentQueue = queue;
                    queue = [];
                    while (++queueIndex < len) {
                        if (currentQueue) {
                            currentQueue[queueIndex].run();
                        }
                    }
                    queueIndex = -1;
                    len = queue.length;
                }
                currentQueue = null;
                draining = false;
                runClearTimeout(timeout);
            }

            process.nextTick = function(fun) {
                var args = new Array(arguments.length - 1);
                if (arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                        args[i - 1] = arguments[i];
                    }
                }
                queue.push(new Item(fun, args));
                if (queue.length === 1 && !draining) {
                    runTimeout(drainQueue);
                }
            };

            // v8 likes predictible objects
            function Item(fun, array) {
                this.fun = fun;
                this.array = array;
            }
            Item.prototype.run = function() {
                this.fun.apply(null, this.array);
            };
            process.title = 'browser';
            process.browser = true;
            process.env = {};
            process.argv = [];
            process.version = ''; // empty string to avoid regexp issues
            process.versions = {};

            function noop() {}

            process.on = noop;
            process.addListener = noop;
            process.once = noop;
            process.off = noop;
            process.removeListener = noop;
            process.removeAllListeners = noop;
            process.emit = noop;

            process.binding = function(name) {
                throw new Error('process.binding is not supported');
            };

            process.cwd = function() {
                return '/'
            };
            process.chdir = function(dir) {
                throw new Error('process.chdir is not supported');
            };
            process.umask = function() {
                return 0;
            };

        }, {}],
        6: [function(require, module, exports) {
            module.exports = {
                "name": "ejs",
                "description": "Embedded JavaScript templates",
                "keywords": [
                    "template",
                    "engine",
                    "ejs"
                ],
                "version": "2.5.6",
                "author": "Matthew Eernisse <mde@fleegix.org> (http://fleegix.org)",
                "contributors": [
                    "Timothy Gu <timothygu99@gmail.com> (https://timothygu.github.io)"
                ],
                "license": "Apache-2.0",
                "main": "./lib/ejs.js",
                "repository": {
                    "type": "git",
                    "url": "git://github.com/mde/ejs.git"
                },
                "bugs": "https://github.com/mde/ejs/issues",
                "homepage": "https://github.com/mde/ejs",
                "dependencies": {},
                "devDependencies": {
                    "browserify": "^13.0.1",
                    "eslint": "^3.0.0",
                    "git-directory-deploy": "^1.5.1",
                    "istanbul": "~0.4.3",
                    "jake": "^8.0.0",
                    "jsdoc": "^3.4.0",
                    "lru-cache": "^4.0.1",
                    "mocha": "^3.0.2",
                    "uglify-js": "^2.6.2"
                },
                "engines": {
                    "node": ">=0.10.0"
                },
                "scripts": {
                    "test": "mocha",
                    "lint": "eslint \"**/*.js\" Jakefile",
                    "coverage": "istanbul cover node_modules/mocha/bin/_mocha",
                    "doc": "jake doc",
                    "devdoc": "jake doc[dev]"
                }
            }

        }, {}]
    }, {}, [1])(1)
});

/*!
 * TWOverflow v1.0.7
 *
 * Copyright Relaxeaza <mafrazzrafael@gmail.com>
 * MIT License
 *
 * 2018-9-29 00:36:29
 */

;(function (window, undefined) {

var rootScope = injector.get('$rootScope')
var transferredSharedDataService = injector.get('transferredSharedDataService')
var modelDataService = injector.get('modelDataService')
var socketService = injector.get('socketService')
var routeProvider = injector.get('routeProvider')
var eventTypeProvider = injector.get('eventTypeProvider')
var windowDisplayService = injector.get('windowDisplayService')
var windowManagerService = injector.get('windowManagerService')
var angularHotkeys = injector.get('hotkeys')
var armyService = injector.get('armyService')
var villageService = injector.get('villageService')
var mapService = injector.get('mapService')
var $filter = injector.get('$filter')

define('two/eventQueue', function () {
    /**
     * Callbacks usados pelos eventos que são disparados no decorrer do script.
     *
     * @type {Object}
     */
    var eventListeners = {}

    /**
     * Métodos públicos do eventQueue.
     *
     * @type {Object}
     */
    var eventQueue = {}

    /**
     * Registra um evento.
     *
     * @param {String} event - Nome do evento.
     * @param {Function} handler - Função chamada quando o evento for disparado.
     */
    eventQueue.bind = function (event, handler) {
        if (!eventListeners.hasOwnProperty(event)) {
            eventListeners[event] = []
        }

        eventListeners[event].push(handler)
    }

    /**
     * Chama os eventos.
     *
     * @param {String} event - Nome do evento.
     * @param {Array} args - Argumentos que serão passados no callback.
     */
    eventQueue.trigger = function (event, args) {
        if (eventListeners.hasOwnProperty(event)) {
            eventListeners[event].forEach(function (handler) {
                handler.apply(this, args)
            })
        }
    }

    return eventQueue
})

define('two/utils', [
    'helper/time'
], function ($timeHelper) {
    var notifTimeout = null
    var utils = {}

    /**
     * Gera um número aleatório aproximado da base.
     *
     * @param {Number} base - Número base para o calculo.
     */
    utils.randomSeconds = function (base) {
        base = parseInt(base, 10)

        var max = base + (base / 2)
        var min = base - (base / 2)

        return Math.round(Math.random() * (max - min) + min)
    }

    /**
     * Converte uma string com um tempo em segundos.
     *
     * @param {String} time - Tempo que será convertido (hh:mm:ss)
     */
    utils.time2seconds = function (time) {
        time = time.split(':')
        time[0] = parseInt(time[0], 10) * 60 * 60
        time[1] = parseInt(time[1], 10) * 60
        time[2] = parseInt(time[2], 10)

        return time.reduce(function (a, b) {
            return a + b
        })
    }

    /**
     * Emite notificação nativa do jogo.
     *
     * @param {String} type - success || error
     * @param {String} message - Texto a ser exibido
     */
    utils.emitNotif = function (type, message) {
        var eventType = type === 'success'
            ? eventTypeProvider.MESSAGE_SUCCESS
            : eventTypeProvider.MESSAGE_ERROR

        rootScope.$broadcast(eventType, {
            message: message
        })
    }


    /**
     * Gera uma string com nome e coordenadas da aldeia
     *
     * @param {Object} village - Dados da aldeia
     * @return {String}
     */
    utils.genVillageLabel = function (village) {
        return village.name + ' (' + village.x + '|' + village.y + ')'
    }

    /**
     * Verifica se uma coordenada é válida.
     * 00|00
     * 000|00
     * 000|000
     * 00|000
     *
     * @param {String} xy - Coordenadas
     * @return {Boolean}
     */
    utils.isValidCoords = function (xy) {
        return /\s*\d{2,3}\|\d{2,3}\s*/.test(xy)
    }

    /**
     * Validação de horario e data de envio. Exmplo: 23:59:00:999 30/12/2016
     *
     * @param  {String}  dateTime
     * @return {Boolean}
     */
    utils.isValidDateTime = function (dateTime) {
        return /^\s*([01][0-9]|2[0-3]):[0-5]\d:[0-5]\d(:\d{1,3})? (0[1-9]|[12][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}\s*$/.test(dateTime)
    }

    /**
     * Inverte a posição do dia com o mês.
     */
    utils.fixDate = function (dateTime) {
        var dateAndTime = dateTime.split(' ')
        var time = dateAndTime[0]
        var date = dateAndTime[1].split('/')

        return time + ' ' + date[1] + '/' + date[0] + '/' + date[2]
    }

    /**
     * Gera um id unico
     *
     * @return {String}
     */
    utils.guid = function () {
        return Math.floor((Math.random()) * 0x1000000).toString(16)
    }

    /**
     * Verifica se um elemento é pertencente a outro elemento.
     *
     * @param  {Element} elem - Elemento referencia
     * @param  {String} selector - Selector CSS do elemento no qual será
     *   será verificado se tem relação com o elemento indicado.
     * @return {Boolean}
     */
    utils.matchesElem = function (elem, selector) {
        if ($(elem).parents(selector).length) {
            return true
        }

        return false
    }

    /**
     * Obtem o timestamp de uma data em string.
     * Formato da data: mês/dia/ano
     * Exmplo de entrada: 23:59:59:999 12/30/2017
     *
     * @param  {String} dateString - Data em formato de string.
     * @return {Number} Timestamp (milisegundos)
     */
    utils.getTimeFromString = function (dateString, offset) {
        var dateSplit = dateString.trim().split(' ')
        var time = dateSplit[0].split(':')
        var date = dateSplit[1].split('/')

        var hour = time[0]
        var min = time[1]
        var sec = time[2]
        var ms = time[3] || null

        var month = parseInt(date[0], 10) - 1
        var day = date[1]
        var year = date[2]

        var date = new Date(year, month, day, hour, min, sec, ms)

        return date.getTime() + (offset || 0)
    }

    /**
     * Formata milisegundos em hora/data
     *
     * @return {String} Data e hora formatada
     */
    utils.formatDate = function (ms, format) {
        return $filter('readableDateFilter')(
            ms,
            null,
            rootScope.GAME_TIMEZONE,
            rootScope.GAME_TIME_OFFSET,
            format || 'HH:mm:ss dd/MM/yyyy'
        )
    }

    /**
     * Obtem a diferença entre o timezone local e do servidor.
     *
     * @type {Number}
     */
    utils.getTimeOffset = function () {
        var localDate = $timeHelper.gameDate()
        var localOffset = localDate.getTimezoneOffset() * 1000 * 60
        var serverOffset = rootScope.GAME_TIME_OFFSET

        return localOffset + serverOffset
    }

    utils.xhrGet = function (url, _callback, _dataType) {
        if (!url) {
            return false
        }

        _dataType = _dataType || 'text'
        _callback = _callback || function () {}

        var xhr

        xhr = new XMLHttpRequest()
        xhr.open('GET', url, true)
        xhr.responseType = _dataType
        xhr.addEventListener('load', function () {
            _callback(xhr.response)
        }, false)

        xhr.send()
    }

    return utils
})

define('two/locale', [
    'conf/locale',
    'i18n'
], function (gameLocale, i18n) {
    /**
     * Linguagens geradas para cada modulo
     *
     * @type {Object}
     */
    var langs = {}

    /**
     * Linguagem padrão para cada modulo
     *
     * @type {Object}
     */
    var defaults = {}

    /**
     * Linguagem atualmente selecionada em cada modulo.
     *
     * @type {Object}
     */
    var selecteds = {}

    /**
     * Linguagem atualmente usada pela interface do jogo.
     *
     * @type {String}
     */
    var gameLang = gameLocale.LANGUAGE.split('_')[0]

    /**
     * Função chamada quando a linguagem parão espeficicada e
     * a linguagem nativa do jogo não estão presetes na lista
     * de de locales.
     *
     * @param {Object} langData - Dados com os locales.
     * @return {String} O ID da primeira liguagem que encontrar.
     */
    var getSomeLang = function (langData) {
        for (var langId in langData) {
            return langId
        }
    }

    /**
     * Obtem a tradução de uma linguagem
     *
     * @param {String} moduleId - Identificação do modulo.
     * @param {String} key - Key da tradução.
     * @param {Object} replaces - Valores a serem substituidos na tradução.
     *
     * @return {String} Tradução da key.
     */
    function Locale (moduleId, key, replaces) {
        if (!langs.hasOwnProperty(moduleId)) {
            return console.error('Language for module ' + moduleId + ' not created')
        }

        var args = Array.from(arguments).slice(1)
        var selected = selecteds[moduleId]

        return langs[moduleId][selected].apply(this, args)
    }

    /**
     * Gera linguagens para um modulo.
     *
     * Locale.create("module", {
     *     "en": {
     *         "langName": "English",
     *         "key": "value",
     *         ...
     *     },
     *     "pt": {
     *         "langName": "Português",
     *         "key": "value"
     *     }
     * }, "en")
     *
     * @param  {String} moduleId - Identificação do modulo.
     * @param  {Object} langData - Dados de cada linguagem.
     * @param  {String} defaultLang - Linguagem padrão
     */
    Locale.create = function (moduleId, langData, defaultLang) {
        if (langs.hasOwnProperty(moduleId)) {
            return false
        }

        langs[moduleId] = {}

        var dataHasGameLang = langData.hasOwnProperty(gameLang)
        var dataHasDefaultLang = langData.hasOwnProperty(defaultLang)

        defaults[moduleId] = dataHasDefaultLang ? defaultLang : getSomeLang(langData)
        selecteds[moduleId] = dataHasGameLang ? gameLang : defaults[moduleId]

        for (var langId in langData) {
            langs[moduleId][langId] = i18n.create({
                values: langData[langId]
            })
        }
    }

    /**
     * Altera a linguagem selecionada do modulo.
     *
     * @param  {String} moduleId - Identificação do modulo.
     * @param  {String} langId - Linguagem a ser selecionada.
     */
    Locale.change = function (moduleId, langId) {
        if (langs[moduleId].hasOwnProperty(langId)) {
            selecteds[moduleId] = langId
        } else {
            console.error('Language ' + langId + ' of module ' + moduleId
                + ' not created. Selection default (' + defaults[moduleId] + ')')

            selecteds[moduleId] = defaults[moduleId]
        }
    }

    /**
     * Obtem a linguagem atualmente selecionada do modulo.
     *
     * @param  {String} moduleId - Identificação do modulo.
     */
    Locale.current = function (moduleId) {
        return selecteds[moduleId]
    }

    /**
     * Loop em cada linguagem adicionado ao modulo.
     *
     * @param  {String} moduleId - Identificação do modulo.
     * @param  {Function} callback
     */
    Locale.eachLang = function (moduleId, callback) {
        var moduleLangs = langs[moduleId]

        for (var langId in moduleLangs) {
            callback(langId, moduleLangs[langId]('langName'))
        }
    }

    return Locale
})

define('two/ready', [
    'conf/gameStates'
], function (
    GAME_STATES
) {
    var ready = function (callback, which) {
        which = which || ['map']

        var readyStep = function (item) {
            which = which.filter(function (_item) {
                return _item !== item
            })

            if (!which.length) {
                callback()
            }
        }

        var handlers = {
            'map': function () {
                var mapScope = transferredSharedDataService.getSharedData('MapController')

                if (mapScope.isInitialized) {
                    return readyStep('map')
                }

                rootScope.$on(eventTypeProvider.MAP_INITIALIZED, function () {
                    readyStep('map')
                })
            },
            'tribe_relations': function () {
                var $player = modelDataService.getSelectedCharacter()

                if ($player) {
                    var $tribeRelations = $player.getTribeRelations()

                    if (!$player.getTribeId() || $tribeRelations) {
                        return readyStep('tribe_relations')
                    }
                }

                var unbind = rootScope.$on(eventTypeProvider.TRIBE_RELATION_LIST, function () {
                    unbind()
                    readyStep('tribe_relations')
                })
            },
            'initial_village': function () {
                var $gameState = modelDataService.getGameState()

                if ($gameState.getGameState(GAME_STATES.INITIAL_VILLAGE_READY)) {
                    return readyStep('initial_village')
                }

                rootScope.$on(eventTypeProvider.GAME_STATE_INITIAL_VILLAGE_READY, function () {
                    readyStep('initial_village')
                })
            },
            'all_villages_ready': function () {
                var $gameState = modelDataService.getGameState()

                if ($gameState.getGameState(GAME_STATES.ALL_VILLAGES_READY)) {
                    return readyStep('all_villages_ready')
                }

                rootScope.$on(eventTypeProvider.GAME_STATE_ALL_VILLAGES_READY, function () {
                    readyStep('all_villages_ready')
                })
            }
        }

        var mapScope = transferredSharedDataService.getSharedData('MapController')

        if (!mapScope) {
            return setTimeout(function () {
                ready(callback, which)
            }, 100)
        }

        which.forEach(function (readyItem) {
            handlers[readyItem]()
        })
    }

    return ready
})

require([
    'two/ready',
    'Lockr',
    'ejs'
], function (
    ready,
    Lockr,
    ejs
) {
    ready(function () {
        var $player = modelDataService.getSelectedCharacter()

        // EJS settings

        ejs.delimiter = '#'

        // Lockr settings

        Lockr.prefix = $player.getId() + '_twOverflow_' + $player.getWorldId() + '-'

        // Interface settings

        angularHotkeys.add('esc', function () {
            rootScope.$broadcast(eventTypeProvider.WINDOW_CLOSED, null, true)
        }, ['INPUT', 'SELECT', 'TEXTAREA'])
    })
})

require([
    'two/locale'
], function (
    Locale
) {
    Locale.create('common', {"en":{"start":"Start","started":"Started","pause":"Pause","paused":"Paused","stop":"Stop","stopped":"Stopped","status":"Status","none":"None","info":"Information","settings":"Settings","others":"Others","village":"Village","villages":"Villages","building":"Building","buildings":"Buildings","level":"Level","registers":"Registers","filters":"Filters","add":"Add","waiting":"Waiting","attack":"Attack","support":"Support","relocate":"Transfer","activate":"Enable","deactivate":"Disable","units":"Units","officers":"Officers","origin":"Origin","target":"Target","save":"Save","logs":"Logs","headquarter":"Headquarters","barracks":"Barracks","tavern":"Tavern","hospital":"Hospital","preceptory":"Hall of Orders","chapel":"Chapel","church":"Church","academy":"Academy","rally_point":"Rally Point","statue":"Statue","market":"Market","timber_camp":"Timber Camp","clay_pit":"Clay Pit","iron_mine":"Iron Mine","farm":"Farm","warehouse":"Warehouse","wall":"Wall","spear":"Spearman","sword":"Swordsman","axe":"Axe Fighter","archer":"Archer","light_cavalry":"Light Cavalry","mounted_archer":"Mounted Archer","heavy_cavalry":"Heavy Cavalry","ram":"Ram","catapult":"Catapult","doppelsoldner":"Berserker","trebuchet":"Trebuchet","snob":"Nobleman","knight":"Paladin","no-results":"No results...","selected":"Selected","now":"Now","costs":"Costs","duration":"Duration","points":"Points","player":"Player","players":"Players","next_features":"Next features","misc":"Miscellaneous","colors":"Colors"},"pl":{"start":"Start","started":"Uruchomiony","pause":"Pauza","paused":"Wstrzymany","stop":"Zatrzymany","stopped":"Zatrzymany","status":"Status","none":"Żaden","info":"Informacje","settings":"Ustawienia","others":"Inne","village":"Wioska","villages":"Wioski","building":"Budynek","buildings":"Budynki","level":"Poziom","registers":"Rejestry","filters":"Filtry","add":"Dodaj","waiting":"Oczekujące","attack":"Atak","support":"Wsparcie","relocate":"Przeniesienie","activate":"Włącz","deactivate":"Wyłącz","units":"Jednostki","officers":"Oficerowie","origin":"Źródło","target":"Cel","save":"Zapisz","logs":"Logi","headquarter":"Ratusz","barracks":"Koszary","tavern":"Tawerna","hospital":"Szpital","preceptory":"Komturia","chapel":"Kaplica","church":"Kościół","academy":"Akademia","rally_point":"Plac","statue":"Piedestał","market":"Rynek","timber_camp":"Tartak","clay_pit":"Kopalnia gliny","iron_mine":"Huta żelaza","farm":"Farma","warehouse":"Magazyn","wall":"Mur","spear":"Pikinier","sword":"Miecznik","axe":"Topornik","archer":"Łucznik","light_cavalry":"Lekki kawalerzysta","mounted_archer":"Łucznik konny","heavy_cavalry":"Ciężki kawalerzysta","ram":"Taran","catapult":"Katapulta","doppelsoldner":"Berserker","trebuchet":"Trebusz","snob":"Szlachcic","knight":"Rycerz","no-results":"Brak wyników...","selected":"Wybrana","now":"Teraz","costs":"Koszty","duration":"Czas trwania","points":"Punkty","player":"Gracz","players":"Gracze","next_features":"Następne funkcje","misc":"Różne","colors":"Kolory"},"pt":{"start":"Iniciar","started":"Iniciado","pause":"Pausar","paused":"Pausado","stop":"Parar","stopped":"Parado","status":"Status","none":"Nenhum","info":"Informações","settings":"Configurações","others":"Outros","village":"Aldeia","villages":"Aldeias","building":"Edifício","buildings":"Edifícios","level":"Nível","registers":"Registros","filters":"Filtros","add":"Adicionar","waiting":"Em espera","attack":"Ataque","support":"Apoio","relocate":"Transferência","activate":"Ativar","deactivate":"Desativar","units":"Unidades","officers":"Oficiais","origin":"Origem","target":"Alvo","save":"Salvar","logs":"Logs","headquarter":"Edifício Principal","barracks":"Quartel","tavern":"Taverna","hospital":"Hospital","preceptory":"Salão das Ordens","chapel":"Capela","church":"Igreja","academy":"Academia","rally_point":"Ponto de Encontro","statue":"Estátua","market":"Mercado","timber_camp":"Bosque","clay_pit":"Poço de Argila","iron_mine":"Mina de Ferro","farm":"Fazenda","warehouse":"Armazém","wall":"Muralha","spear":"Lanceiro","sword":"Espadachim","axe":"Viking","archer":"Arqueiro","light_cavalry":"Cavalaria Leve","mounted_archer":"Arqueiro Montado","heavy_cavalry":"Cavalaria Pesada","ram":"Aríete","catapult":"Catapulta","doppelsoldner":"Berserker","trebuchet":"Trabuco","snob":"Nobre","knight":"Paladino","no-results":"Sem resultados...","selected":"Selecionado","now":"Agora","costs":"Custos","duration":"Duração","points":"Pontos","player":"Jogador","players":"Jogadores","next_features":"Próximas funcionalidades","misc":"Diversos","colors":"Cores"}}, 'en')
})

define('two/attackView', [
    'two/queue',
    'two/eventQueue',
    'two/ready',
    'two/locale',
    'models/CommandModel',
    'conf/unitTypes',
    'Lockr',
    'helper/math',
    'helper/mapconvert',
    'struct/MapData'
], function (
    Queue,
    eventQueue,
    ready,
    Locale,
    CommandModel,
    UNIT_TYPES,
    Lockr,
    $math,
    $convert,
    $mapData
) {
    var COLUMN_TYPES = {
        'ORIGIN_VILLAGE'    : 'origin_village_name',
        'COMMAND_TYPE'      : 'command_type',
        'TARGET_VILLAGE'    : 'target_village_name',
        'TIME_COMPLETED'    : 'time_completed',
        'COMMAND_PROGRESS'  : 'command_progress',
        'ORIGIN_CHARACTER'  : 'origin_character_name'
    }
    var COMMAND_TYPES = {
        'ATTACK': 'attack',
        'SUPPORT': 'support',
        'RELOCATE': 'relocate'
    }
    var COMMAND_ORDER = [
        'ATTACK',
        'SUPPORT',
        'RELOCATE'
    ]
    var FILTER_TYPES = {
        'COMMAND_TYPES'     : 'commandTypes',
        'VILLAGE'           : 'village',
        'INCOMING_UNITS'    : 'incomingUnits'
    }
    var UNIT_SPEED_ORDER = [
        UNIT_TYPES.LIGHT_CAVALRY,
        UNIT_TYPES.HEAVY_CAVALRY,
        UNIT_TYPES.AXE,
        UNIT_TYPES.SWORD,
        UNIT_TYPES.RAM,
        UNIT_TYPES.SNOB,
        UNIT_TYPES.TREBUCHET
    ]
    var INCOMING_UNITS_FILTER = {}

    for (var i = 0; i < UNIT_SPEED_ORDER.length; i++) {
        INCOMING_UNITS_FILTER[UNIT_SPEED_ORDER[i]] = true
    }

    var resetFilters = function () {
        filters = {}
        filters[FILTER_TYPES.COMMAND_TYPES] = angular.copy(COMMAND_TYPES)
        filters[FILTER_TYPES.VILLAGE] = false
        filters[FILTER_TYPES.INCOMING_UNITS] = angular.copy(INCOMING_UNITS_FILTER)
    }

    var initialized = false
    var listeners = {}
    var overviewService = injector.get('overviewService')
    var globalInfoModel
    var commands = []
    var filters = {}
    var params = {}
    var sorting = {
        reverse: false,
        column: COLUMN_TYPES.COMMAND_PROGRESS
    }

    var formatFilters = function formatFilters () {
        var toArray = [FILTER_TYPES.COMMAND_TYPES]
        var currentVillageId = modelDataService.getSelectedVillage().getId()
        var arrays = {}
        var i
        var j

        // format filters for backend
        for (i = 0; i < toArray.length; i++) {
            for (j in filters[toArray[i]]) {
                if (!arrays[toArray[i]]) {
                    arrays[toArray[i]] = []
                }

                if (filters[toArray[i]][j]) {
                    switch (toArray[i]) {
                    case FILTER_TYPES.COMMAND_TYPES:
                        if (j === 'ATTACK') {
                            arrays[toArray[i]].push(COMMAND_TYPES.ATTACK)
                        } else if (j === 'SUPPORT') {
                            arrays[toArray[i]].push(COMMAND_TYPES.SUPPORT)
                        } else if (j === 'RELOCATE') {
                            arrays[toArray[i]].push(COMMAND_TYPES.RELOCATE)
                        }
                        break
                    }
                }
            }
        }

        params = arrays
        params.village = filters[FILTER_TYPES.VILLAGE] ? [currentVillageId] : []
    }

    /**
     * Toggles the given filter.
     *
     * @param {string} type The category of the filter (see FILTER_TYPES)
     * @param {string} opt_filter The filter to be toggled.
     */
    var toggleFilter = function (type, opt_filter) {
        if (!opt_filter) {
            filters[type] = !filters[type]
        } else {
            filters[type][opt_filter] = !filters[type][opt_filter]
        }

        // format filters for the backend
        formatFilters()

        eventQueue.trigger('attackView/filtersChanged')
    }

    var toggleSorting = function (newColumn) {
        if (!COLUMN_TYPES[newColumn]) {
            return false
        }

        if (COLUMN_TYPES[newColumn] === sorting.column) {
            sorting.reverse = !sorting.reverse
        } else {
            sorting.column = COLUMN_TYPES[newColumn]
            sorting.reverse = false
        }

        eventQueue.trigger('attackView/sortingChanged')
    }

    /**
     * Command was sent.
     */
    var onCommandIncomming = function () {
        // we can never know if the command is currently visible (because of filters, sorting and stuff) -> reload
        loadCommands()
    }

    /**
     * Command was cancelled.
     *
     * @param {Object} event unused
     * @param {Object} data The backend-data
     */
    var onCommandCancelled = function (event, data) {
        eventQueue.trigger('attackView/commandCancelled', [data.id || data.command_id])
    }

    /**
     * Command ignored.
     *
     * @param {Object} event unused
     * @param {Object} data The backend-data
     */
    var onCommandIgnored = function (event, data) {
        for (var i = 0; i < commands.length; i++) {
            if (commands[i].command_id === data.command_id) {
                commands.splice(i, 1)
            }
        }

        eventQueue.trigger('attackView/commandIgnored', [data.command_id])
    }

    /**
     * Village name changed.
     *
     * @param {Object} event unused
     * @param {Object} data The backend-data
     */
    var onVillageNameChanged = function (event, data) {
        for (var i = 0; i < commands.length; i++) {
            if (commands[i].target_village_id === data.village_id) {
                commands[i].target_village_name = data.name
                commands[i].targetVillage.name = data.name
            }
        }

        eventQueue.trigger('attackView/villageRenamed', [data])
    }

    var onVillageSwitched = function (e, newVillageId) {
        if (params[FILTER_TYPES.VILLAGE].length) {
            params[FILTER_TYPES.VILLAGE] = [newVillageId]

            loadCommands()
        }
    }

    var onFiltersChanged = function () {
        Lockr.set('attackView-filters', filters)

        loadCommands()
    }

    var onSortingChanged = function () {
        loadCommands()
    }

    /**
     * @param {Object} data The data-object from the backend
     */
    var onOverviewIncomming = function onOverviewIncomming (data) {
        commands = data.commands

        for (var i = 0; i < commands.length; i++) {
            overviewService.formatCommand(commands[i])
            commands[i].slowestUnit = getSlowestUnit(commands[i])
        }

        commands = commands.filter(function (command) {
            return filters[FILTER_TYPES.INCOMING_UNITS][command.slowestUnit]
        })

        eventQueue.trigger('attackView/commandsLoaded', [commands])
    }

    var loadCommands = function () { 
        var incomingCommands = globalInfoModel.getCommandListModel().getIncomingCommands().length
        var count = incomingCommands > 25 ? incomingCommands : 25

        socketService.emit(routeProvider.OVERVIEW_GET_INCOMING, {
            'count'         : count,
            'offset'        : 0,
            'sorting'       : sorting.column,
            'reverse'       : sorting.reverse ? 1 : 0,
            'groups'        : [],
            'command_types' : params[FILTER_TYPES.COMMAND_TYPES],
            'villages'      : params[FILTER_TYPES.VILLAGE]
        }, onOverviewIncomming)
    }

    /**
     * @param {CommandModel} command
     * @return {String} Slowest unit
     */
    var getSlowestUnit = function (command) {
        var commandDuration = command.model.duration
        var units = {}
        var origin = { x: command.origin_x, y: command.origin_y }
        var target = { x: command.target_x, y: command.target_y }
        var travelTimes = []

        UNIT_SPEED_ORDER.forEach(function (unit) {
            units[unit] = 1
            
            travelTimes.push({
                unit: unit,
                duration: Queue.getTravelTime(origin, target, units, command.command_type, {})
            })
        })

        travelTimes = travelTimes.map(function (travelTime) {
            travelTime.duration = Math.abs(travelTime.duration - commandDuration)
            return travelTime
        }).sort(function (a, b) {
            return a.duration - b.duration
        })

        return travelTimes[0].unit
    }

    var getCommands = function () {
        return commands
    }

    var getFilters = function () {
        return filters
    }

    var getSortings = function () {
        return sorting
    }

    var registerListeners = function () {
        listeners[eventTypeProvider.COMMAND_INCOMING] = rootScope.$on(eventTypeProvider.COMMAND_INCOMING, onCommandIncomming)
        listeners[eventTypeProvider.COMMAND_CANCELLED] = rootScope.$on(eventTypeProvider.COMMAND_CANCELLED, onCommandCancelled)
        listeners[eventTypeProvider.MAP_SELECTED_VILLAGE] = rootScope.$on(eventTypeProvider.MAP_SELECTED_VILLAGE, onVillageSwitched)
        listeners[eventTypeProvider.VILLAGE_NAME_CHANGED] = rootScope.$on(eventTypeProvider.VILLAGE_NAME_CHANGED, onVillageNameChanged)
        listeners[eventTypeProvider.COMMAND_IGNORED] = rootScope.$on(eventTypeProvider.COMMAND_IGNORED, onCommandIgnored)
    }

    var unregisterListeners = function () {
        for (var event in listeners) {
            listeners[event]()
        }
    }

    /**
     * Sort a set of villages by distance from a specified village.
     *
     * @param {Array[{x: Number, y: Number}]} villages List of village that will be sorted.
     * @param {VillageModel} origin
     * @return {Array} Sorted villages
     */
    var sortByDistance = function (villages, origin) {
        return villages.sort(function (villageA, villageB) {
            var distA = $math.actualDistance(origin, villageA)
            var distB = $math.actualDistance(origin, villageB)

            return distA - distB
        })
    }

    /**
     * Order:
     * - Barbarian villages.
     * - Own villages.
     * - Tribe villages.
     *
     * @param {VillageModel} origin
     * @param {Function} callback
     */
    var closestNonHostileVillage = function (origin, callback) {
        var size = 25

        if ($mapData.hasTownDataInChunk(origin.x, origin.y)) {
            var sectors = $mapData.loadTownData(origin.x, origin.y, size, size, size)
            var targets = []
            var possibleTargets = []
            var closestTargets
            var barbs = []
            var own = []
            var tribe = []
            var x
            var y
            var tribeId = modelDataService.getSelectedCharacter().getTribeId()
            var playerId = modelDataService.getSelectedCharacter().getId()

            sectors.forEach(function (sector) {
                for (x in sector.data) {
                    for (y in sector.data[x]) {
                        targets.push(sector.data[x][y])
                    }
                }
            })


            barbs = targets.filter(function (target) {
                return target.character_id === null && target.id > 0
            })

            own = targets.filter(function (target) {
                return target.character_id === playerId && origin.id !== target.id
            })

            if (tribeId) {
                tribe = targets.filter(function (target) {
                    return tribeId && target.tribe_id === tribeId
                })
            }

            if (barbs.length) {
                closestTargets = sortByDistance(barbs, origin)
            } else if (own.length) {
                closestTargets = sortByDistance(own, origin)
            } else if (tribe.length) {
                closestTargets = sortByDistance(tribe, origin)
            } else {
                return callback(false)
            }

            return callback(closestTargets[0])
        }
        
        var loads = $convert.scaledGridCoordinates(origin.x, origin.y, size, size, size)
        var index = 0

        $mapData.loadTownDataAsync(origin.x, origin.y, size, size, function () {
            if (++index === loads.length) {
                closestNonHostileVillage(origin, callback)
            }
        })
    }

    /**
     * Set an automatic command with all units from the village
     * and start the CommandQueue module if it's disabled.
     *
     * @param {Object} command Data of the command like origin, target.
     * @param {String} date Date that the command has to leave.
     */
    var setQueueCommand = function (command, date) {
        closestNonHostileVillage(command.targetVillage, function (closestVillage) {
            var origin = command.targetVillage
            var target = closestVillage
            var type = target.character_id === null ? 'attack' : 'support'
            
            Queue.addCommand({
                origin: origin,
                target: target,
                date: date,
                dateType: 'out',
                units: {
                    spear: '*',
                    sword: '*',
                    axe: '*',
                    archer: '*',
                    light_cavalry: '*',
                    mounted_archer: '*',
                    heavy_cavalry: '*',
                    ram: '*',
                    catapult: '*',
                    snob: '*',
                    knight: '*',
                    doppelsoldner: '*',
                    trebuchet: '*'
                },
                officers: {},
                type: type,
                catapultTarget: 'wall'
            })

            if (!Queue.isRunning()) {
                Queue.start()
            }
        })
    }

    var init = function () {
        Locale.create('attackView', {"en":{"title":"AttackView","filters.tooltip.current-only":"Current village only","filters.types":"Types","filters.tooltip.show-attacks":"Show attacks","filters.tooltip.show-supports":"Show supports","filters.tooltip.show-relocations":"Show relocations","filters.incoming-units":"Incoming Units","tooltip.command-type":"Command Type","tooltip.slowest-unit":"Slowest Unit","command-type":"CT","slowest-unit":"SU","actions":"Actions","no-incoming":"No commands incoming.","commands.tooltip.copy-arrival":"Copy arrival date.","commands.tooltip.copy-back":"Copy backtime date.","commands.tooltip.set-remove":"Set a CommandQueue to remove all troops before the attack hit."},"pt":{"title":"AttackView","filters.tooltip.current-only":"Apenas aldeia selecionada","filters.types":"Tipos","filters.tooltip.show-attacks":"Mostrar ataques","filters.tooltip.show-supports":"Mostrar apoios","filters.tooltip.show-relocations":"Mostrar transferências","filters.incoming-units":"Unidades Chegando","tooltip.command-type":"Tipo de Comando","tooltip.slowest-unit":"Unidade mais Lenta","command-type":"TC","slowest-unit":"UL","actions":"Ações","no-incoming":"Nenhum comando chegando.","commands.tooltip.copy-arrival":"Copiar data de chegada.","commands.tooltip.copy-back":"Copiar backtime.","commands.tooltip.set-remove":"Criar um comando no CommandQueue para remover todas tropas da aldeia antes do comando bater na aldeia."}}, 'en')
        
        var defaultFilters = {}
        defaultFilters[FILTER_TYPES.COMMAND_TYPES] = angular.copy(COMMAND_TYPES)
        defaultFilters[FILTER_TYPES.INCOMING_UNITS] = angular.copy(INCOMING_UNITS_FILTER)
        defaultFilters[FILTER_TYPES.VILLAGE] = false

        initialized = true
        globalInfoModel = modelDataService.getSelectedCharacter().getGlobalInfo()
        filters = Lockr.get('attackView-filters', {}, true)
        angular.merge(filters, defaultFilters)

        ready(function () {
            formatFilters()
        }, ['initial_village'])

        eventQueue.bind('attackView/filtersChanged', onFiltersChanged)
        eventQueue.bind('attackView/sortingChanged', onSortingChanged)
    }

    return {
        init: init,
        version: '1.0.0',
        loadCommands: loadCommands,
        getCommands: getCommands,
        getFilters: getFilters,
        getSortings: getSortings,
        toggleFilter: toggleFilter,
        toggleSorting: toggleSorting,
        FILTER_TYPES: FILTER_TYPES,
        COMMAND_TYPES: COMMAND_TYPES,
        UNIT_SPEED_ORDER: UNIT_SPEED_ORDER,
        COLUMN_TYPES: COLUMN_TYPES,
        registerListeners: registerListeners,
        unregisterListeners: unregisterListeners,
        setQueueCommand: setQueueCommand
    }
})

require([
    'two/ready',
    'two/attackView',
    'two/attackView/ui'
], function (
    ready,
    attackView
) {
    if (attackView.initialized) {
        return false
    }

    ready(function () {
        attackView.init()
        attackView.interface()
    })
})

define('two/attackView/ui', [
    'two/attackView',
    'two/queue',
    'two/locale',
    'two/ui',
    'two/FrontButton',
    'two/utils',
    'two/eventQueue',
    'helper/time',
    'conf/unitTypes',
    'ejs'
], function (
    attackView,
    Queue,
    Locale,
    Interface,
    FrontButton,
    utils,
    eventQueue,
    $timeHelper,
    UNIT_TYPES,
    ejs
) {
    var ui
    var opener
    var $window
    var $commands
    var $empty
    var $filters
    var $filtersBase
    var $sortings
    
    var init = function () {
        ui = new Interface('AttackView', {
            template: '<div class="win-content message-list-wrapper searchable-list ng-scope"><header class="win-head"><h2><#= locale("attackView", "title") #> <span class="small">v<#= version #></span></h2><ul class="list-btn"><li><a href="#" class="twOverflow-close size-34x34 btn-red icon-26x26-close"></a></li></ul></header><div class="win-main"><div class="box-paper"><div class="filters"><table class="tbl-border-light"><tbody><tr><th><#= locale("common", "village") #></th></tr><tr><td><div class="box-border-dark icon village" tooltip="<#= locale("attackView", "filters.tooltip.current-only") #>"><span class="icon-34x34-village-info icon-bg-black"></span></div></td></tr></tbody></table><table class="tbl-border-light"><tbody><tr><th><#= locale("attackView", "filters.types") #></th></tr><tr><td><div data-filter="ATTACK" class="box-border-dark icon commandTypes attack" tooltip="<#= locale("attackView", "filters.tooltip.show-attacks") #>"><span class="icon-34x34-attack icon-bg-black"></span></div><div data-filter="SUPPORT" class="box-border-dark icon commandTypes support" tooltip="<#= locale("attackView", "filters.tooltip.show-supports") #>"><span class="icon-34x34-support icon-bg-black"></span></div><div data-filter="RELOCATE" class="box-border-dark icon commandTypes relocate" tooltip="<#= locale("attackView", "filters.tooltip.show-relocations") #>"><span class="icon-34x34-relocate icon-bg-black"></span></div></td></tr></tbody></table><table class="tbl-border-light"><tbody><tr><th><#= locale("attackView", "filters.incoming-units") #></th></tr><tr><td> <# UNIT_SPEED_ORDER.forEach(function(unit) { #> <div data-filter="<#= unit #>" class="box-border-dark icon incomingUnits <#= unit #>" tooltip="<#= locale("common", unit) #>"><span class="icon-34x34-unit-<#= unit #> icon-bg-black"></span></div> <# }) #> </td></tr></tbody></table></div><table class="tbl-border-light commands-table"><colgroup><col width="7%"><col width="14%"><col width=""><col width=""><col width="4%"><col width="12%"><col width="11%"></colgroup><thead class="sorting"><tr><th data-sort="COMMAND_TYPE" tooltip="<#= locale("attackView", "tooltip.command-type") #>"><#= locale("attackView", "command-type") #></th><th data-sort="ORIGIN_CHARACTER"><#= locale("common", "player") #></th><th data-sort="ORIGIN_VILLAGE"><#= locale("common", "origin") #></th><th data-sort="TARGET_VILLAGE"><#= locale("common", "target") #></th><th tooltip="<#= locale("attackView", "tooltip.slowest-unit") #>"><#= locale("attackView", "slowest-unit") #></th><th data-sort="TIME_COMPLETED">Arrive</th><th><#= locale("attackView", "actions") #></th></tr></thead><tbody class="commands"></tbody><tbody class="empty"><tr><td colspan="7"><#= locale("attackView", "no-incoming") #></td></tr></tbody></table></div></div></div>',
            activeTab: 'attacks',
            replaces: {
                version: attackView.version,
                author: {"name":"Relaxeaza","email":"mafrazzrafael@gmail.com","url":"https://gitlab.com/relaxeaza","gitlab_user_id":518047},
                locale: Locale,
                UNIT_SPEED_ORDER: attackView.UNIT_SPEED_ORDER
            },
            css: '#AttackView table.commands-table{table-layout:fixed;font-size:13px}#AttackView table.commands-table th{text-align:center;padding:0px}#AttackView table.commands-table td{padding:1px 0;min-height:initial;border:none;text-align:center}#AttackView table.commands-table tr.attack.snob td{background:#bb8658}#AttackView table.commands-table tr.support td,#AttackView table.commands-table tr.relocate td{background:#9c9368}#AttackView table.commands-table .empty td{height:32px}#AttackView .village .coords{font-size:11px;color:#71471a}#AttackView .village .coords:hover{color:#ffde00;text-shadow:0 1px 0 #000}#AttackView .village .name:hover{color:#fff;text-shadow:0 1px 0 #000}#AttackView .village.selected .name{font-weight:bold}#AttackView .character .name:hover{color:#fff;text-shadow:1px 1px 0 #000}#AttackView .progress-wrapper{height:20px;margin-bottom:0}#AttackView .progress-wrapper .progress-text{position:absolute;width:100%;height:100%;text-align:center;z-index:10;padding:0 5px;line-height:20px;color:#f0ffc9;overflow:hidden}#AttackView .filters{height:95px;margin-bottom:10px}#AttackView .filters table{width:auto;float:left;margin:5px}#AttackView .filters .icon{width:38px;float:left;margin:0 6px}#AttackView .filters .icon.active:before{box-shadow:0 0 0 1px #000,-1px -1px 0 2px #ac9c44,0 0 0 3px #ac9c44,0 0 0 4px #000;border-radius:1px;content:"";position:absolute;width:38px;height:38px;left:-1px;top:-1px}#AttackView .filters td{padding:6px}#AttackView .icon-20x20-backtime{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAAEMklEQVQ4y42US2xUdRTGf3funZn/PHqnnVdpKZZ2RCWBVESgoZogSAKKEEAlGhVNLMGg0QiJKxYudIdoTEyDj8SFGo2seDUGhEQqRHk/UimDpdAptHMr8+jM3Dv35QJbi9KEszzJ+eU753z5JKYuOQGBUpAa2SLiuPgBPBKGrZAPlSlmoQLYk4ekqUCmEHHL0pslRb7fsNwWF8L/DIz5Fanftey0oogBr65rk8HS3WC6jyY8ckfZdNtfWdX++tzGIDMabAJmArte4my/l/c//vaLoFc6jmP3iCqD41B5Mi0BId1Hk+V6ljfEQlvWL2xZoY/lKOTLGCY01tZhVLMkRJEtqzoeyUvSnN70SNZRXC1iUylDVZmszhQiDmbH9Lrgpta4mKPlCjy95D6Wrn8GAKFEEfEmdG2Qowd+4I0XFrUC7+w7eL5sCu8hdL3imaQuYFl6c9l021vjYk7Y72Xjq4/z1IaNCCVKMRckq+moiQDJ2bN48uV3GbnSx9b1ra1l0223LL05AYF/Vw4S80jyonnN6paq5YTe3LyU2rpaYrFpJGfPItlcTzI1H8R8cC38NTFiaojhSzeJJ8KNJ/4YOmP43GsTCmWLiGG5LTUBb2LuzGm3e3Ij3321m5Hey6A0AVAcPjmhQcSbuDyU5sF6e5phuS2yRWQC6Lj4x62h1vjJ3BwjlUoiYn52ffolmUtnuXj4ADu2b7/DFoN9RVQ1gAthx8U/+Sk4LiGAQtFAHzXIajpr16yiu/tX98euzyWAzrc6Abj8+1G0TIZ8uYx/xJpgjANlWfEKqjaZbIlixQQgdDHDyuULWLFisZTVdBJxQTIVA2uQ+qZ6KoU0nhqV09f+QoIxj4ThAWRVJWLZToNXUaarYR8Hdm+iZBic7N5LbmgI0xclERcAFLIVAHRtkFOHjwBwNHNryK9I/bZCXlFVIk6ZuSbukidmR1Z+/cliAHzRBjKjBTq37bz9gEAAgA+2vQjAjb4j9F6pUCga/Hzm5v6A5KRDFkXF1UnWRcRj256d/vam9zrJXT0GwGc7V+ONRwAwtTwAa9bs4ND+PTy8MMW5az7+vJ7lXKZ4IeiVjsuIgaylVxTHxf/S84+u3bh5Mbmrx/D6Y1hjGtaYBjduH9g0RonNSmH4o/T1j9JzeoBixSRbsi9ktNIuRXJ6vFVbA2ypVoiZNuay+qj62r6u1R0ee4i65Iw7rDEOnLegC4CSqwxf18b23C0cFMenF5wKJzLZfLDtuW/4pWt1Ry6XY8/ug8jRB6gN3GI0k6VtXcq9csvqtm2rTyjS+YDkpGXEgLdq/z++EhA2hYjbmMtMx7P8+4/Wbdj64U89/cP5Xlli2HGcUsAnjziulMGxbrheRu4lYH21QjSarvXQoraZbQC/nUoflzwMyx6hVz26MRVkysROQNhQ8XmqQr1XwH/rb2Du69Eebp25AAAAAElFTkSuQmCC")}#AttackView .icon-20x20-arrivetime{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAAEW0lEQVQ4y4WUWWxUZRiGn7PMnNPOVtvODHQBSlulAUFBoQiEaBHBhCsSFaIhIe6JSyAkRkO8NpErY2KoYuINISkkRFAjEUyAUCQsBSu1BVpKZ2DmTNuZzsyZMz3L70Vbgkjqe/Ul//89//K9eSX+KyUKFcVKQopDxBNoALJE2VXJBUzyBpQA9xG9SA+DbF2vdRxrvqQqLWVHNAkITm8saKo0KBz3hqrqt32WlXkUWHoQZvlpQFbWmLZo//zj7W8ua7JRUoKSz+DOXYVrSZMfjnV/W+mTuvHcs/okIw9DFYAoBCw/DY6QX9yycemer9/p6KiQE7ilIj4vwNXBFIO3M1iFLKta4suNvLUwZzpZTxWZiEvJhMkHgYpf1+cKSazfsnHpnve2rVqYTg2xdvMrPL76JWKNNSxesYB1LyyDiQQ9fWkCmhxzkRuLZTcpVC1lOU4eEDNPDUzitJVc6eUDn6zuSAwl2PDGLqrnx9ECPob6kkxaPiLBEK1LniIaFVz/c4SAJsf6U2ZaEfZwxMOYuaVCJTWypKz68LXV7y6sigWf7thMdfMKkMOgryA2r5pYYwWBaA3FzBhFM8uiRXFOnumn/jGt0SjYl8t+MWzbFABkxSFSdkTTE3F3zkDyBnptw/2J5VMXpwq1gfT1AQ4eOIyi1AHw5II5hCp80bIjmhSHyEyP7Ak0AcFwuIKR/vy/PLVv7156T/1M4u8e9n/1HXqNRnNzjMS9AuGQBlMfF5zxKoA6U2hph5xp0nv+ErX1KVqfXctbH+yk65tOAOa1tolNm56TjIyFNVpmIl8GwBMEHnSzKkuUJUHh8vAYcihMIFQi3hAHZ4T65hq27dyKkbGI1uqS7a/mXO8F+gZGuDZ0j4nClFsU1adj2wrgyq5KTlOlwTOJ8STApVO/Y2VGAJgwSgBEa3VsfzXZZJKLvxyjWC7z8+G3CQf9+FS13nG9ueEwEUBRqmywEfrAvWLF4rqq5fmiwCvcIjuqYCTu8v5nnXQd7+bgoZ/48dduXF8F4ZpaNj0/j60bgly+YLTeNMyUYosxPUhONaBUpeq3K7G7T/Ym2pfWh5ZU1MzBX/0XV/64iVYe4+jR3QD4aqeGaWdylPNjABw9upv9X3R+9GVXwsjmrZQCiJDjOI4scjnTyZZc0ZhKJmM9PcNYlsu4CLJjez3jt65ij45jpZPYhVG8SRNFrcQc7eeZ9evIl9xI96Xh4yqAAaXoJCOW3zuRGjfNwbRob6wNbkkYxTizaDx9B0+pY93rnWdTYxPf+xQ9p0yvCRPciEtJqFpKEfZwyXaupArOYLbM+JK2lS3HDhyRbgwanO6eoPvEaWLxOixLY+WOrrP5onUI4Z2TdMeQZgtYySaGrM6VJVFfmnRjsiwHXEG8KR5p2/fpxjWv7jpyyCd7JxR8v03nY0Fidt2H+z1dcz1LFx7xlctb2gHO9wz1+CS1L2tZSabD4f+Asx7g+a0JbYJJg6lgAPgHUh4QWRIJr4EAAAAASUVORK5CYII=")}',
            onClose: function () {
                attackView.unregisterListeners()
            }
        })

        opener = new FrontButton('AttackView', {
            onClick: function () {
                attackView.registerListeners()
                attackView.loadCommands()
                checkCommands()
                ui.openWindow()
            },
            classHover: false,
            classBlur: false
        })

        $window = $(ui.$window)
        $commands = $window.find('.commands')
        $empty = $window.find('.empty')
        $filtersBase = $window.find('.filters')
        $filters = {
            village: $filtersBase.find('.village'),
            commandTypes: {
                ATTACK: $filtersBase.find('.attack'),
                SUPPORT: $filtersBase.find('.support'),
                RELOCATE: $filtersBase.find('.relocate')
            },
            incomingUnits: {
                light_cavalry: $filtersBase.find('.light_cavalry'),
                heavy_cavalry: $filtersBase.find('.heavy_cavalry'),
                axe: $filtersBase.find('.axe'),
                sword: $filtersBase.find('.sword'),
                ram: $filtersBase.find('.ram'),
                snob: $filtersBase.find('.snob'),
                trebuchet: $filtersBase.find('.trebuchet'),
            }
        }
        $sortings = $window.find('.sorting th[data-sort]')

        $filters.village.on('click', function () {
            attackView.toggleFilter(attackView.FILTER_TYPES.VILLAGE)
        })

        $filtersBase.find('.commandTypes').on('click', function () {
            attackView.toggleFilter(attackView.FILTER_TYPES.COMMAND_TYPES, this.dataset.filter)
        })

        $filtersBase.find('.incomingUnits').on('click', function () {
            attackView.toggleFilter(attackView.FILTER_TYPES.INCOMING_UNITS, this.dataset.filter)
        })

        $sortings.on('click', function () {
            attackView.toggleSorting(this.dataset.sort)
        })

        setInterval(function () {
            if (ui.isVisible('attacks')) {
                checkCommands()
            }
        }, 1000)

        eventQueue.bind('attackView/commandsLoaded', populateCommandsView)
        eventQueue.bind('attackView/commandCancelled', onCommandCancelled)
        eventQueue.bind('attackView/commandIgnored', onCommandIgnored)
        eventQueue.bind('attackView/villageRenamed', onVillageRenamed)
        eventQueue.bind('attackView/filtersChanged', updateFilterElements)
        eventQueue.bind('attackView/sortingChanged', updateSortingElements)
        rootScope.$on(eventTypeProvider.MAP_SELECTED_VILLAGE, onVillageSwitched)

        updateFilterElements()

        return ui
    }

    /**
     * If the a command finishes in a certain way , there is no event, so we have to trigger the reload ourselfs.
     * (e.g.: the troops die at the village of the enemy)
     */
    var checkCommands = function () {
        var commands = attackView.getCommands()
        var nowInSeconds = Date.now() * 1E-3
        var progress
        
        for (var i = 0; i < commands.length; i++) {
            progress = commands[i].model.percent()

            if (progress === 100) {
                commands[i].$command.remove()
                continue
            }

            commands[i].$arrivalProgress.style.width = progress + '%'
            commands[i].$arrivalIn.innerHTML = $timeHelper.readableSeconds($timeHelper.server2ClientTimeInSeconds(commands[i].time_completed - nowInSeconds))
        }
    }

    var populateCommandsView = function (commands) {
        $commands.children().remove()
        var now = Date.now()

        if (commands.length) {
            $empty.hide()
        } else {
            return $empty.css('display', '')
        }

        commands.forEach(function (command) {
            var $command = document.createElement('tr')

            var arriveTime = command.time_completed * 1000
            var arriveTimeFormated = utils.formatDate(arriveTime, 'HH:mm:ss dd/MM/yyyy')
            var arrivalIn = $timeHelper.server2ClientTimeInSeconds(arriveTime - now)
            var arrivalInFormated = $timeHelper.readableMilliseconds(arrivalIn, false, true)
            var duration = command.time_completed - command.time_start
            var backTime = (command.time_completed + duration) * 1000
            var backTimeFormated = utils.formatDate(backTime, 'HH:mm:ss dd/MM/yyyy')
            var commandClass = 'command-' + command.command_id + ' ' + command.command_type

            if (command.slowestUnit === UNIT_TYPES.SNOB) {
                commandClass += ' snob'
            }
            
            $command.className = commandClass
            $command.innerHTML = ejs.render('<td class="commandType"><span class="icon-20x20-<#= commandType #>"></span></td><td class="originCharacter character player-<#= originCharacter.id #>"><span class="name"><#= originCharacter.name #> </span></td><td class="originVillage village village-<#= originVillage.id #>"><span class="name"><#= originVillage.name #></span><span class="coords"> <#= originVillage.x #>|<#= originVillage.y #></span></td><td class="targetVillage village village-<#= targetVillage.id #>"><span class="name"><#= targetVillage.name #></span><span class="coords"> <#= targetVillage.x #>|<#= targetVillage.y #></span></td><td><span class="icon-20x20-unit-<#= slowestUnit #>"></span></td><td><div class="progress-wrapper" tooltip="<#= arrivalDate #>"><div class="progress-bar arrivalProgress" style="width:<#= progress #>%"></div><div class="progress-text"><span class="arrivalIn"><#= arrivalIn #></span></div></div></td><td class="actions"><a class="copyArriveTime btn btn-orange size-20x20 icon-20x20-arrivetime" tooltip="<#= locale("attackView", "commands.tooltip.copy-arrival") #>"></a> <a class="copyBackTime btn btn-red size-20x20 icon-20x20-backtime" tooltip="<#= locale("attackView", "commands.tooltip.copy-back") #>"></a> <a class="removeTroops btn btn-orange size-20x20 icon-20x20-units-outgoing" tooltip="<#= locale("attackView", "commands.tooltip.set-remove") #>"></a></td>', {
                locale: Locale,
                originCharacter: command.originCharacter,
                originVillage: command.originVillage,
                targetVillage: command.targetVillage,
                arrivalDate: arriveTimeFormated,
                arrivalIn: arrivalInFormated,
                slowestUnit: command.slowestUnit,
                progress: command.model.percent(),
                commandType: command.command_type
            })

            var $characterName = $command.querySelector('.originCharacter .name')
            var $originName = $command.querySelector('.originVillage .name')
            var $originCoords = $command.querySelector('.originVillage .coords')
            var $targetName = $command.querySelector('.targetVillage .name')
            var $targetCoords = $command.querySelector('.targetVillage .coords')
            var $arrivalProgress = $command.querySelector('.arrivalProgress')
            var $arrivalIn = $command.querySelector('.arrivalIn')
            var $removeTroops = $command.querySelector('.removeTroops')
            var $copyArriveTime = $command.querySelector('.copyArriveTime')
            var $copyBackTime = $command.querySelector('.copyBackTime')

            $characterName.addEventListener('click', function () {
                windowDisplayService.openCharacterProfile(command.originCharacter.id)
            })

            $originName.addEventListener('click', function () {
                windowDisplayService.openVillageInfo(command.originVillage.id)
            })

            $originCoords.addEventListener('click', function () {
                mapService.jumpToVillage(command.originVillage.x, command.originVillage.y)
            })

            $targetName.addEventListener('click', function () {
                windowDisplayService.openVillageInfo(command.targetVillage.id)
            })

            $targetCoords.addEventListener('click', function () {
                mapService.jumpToVillage(command.targetVillage.x, command.targetVillage.y)
            })

            $removeTroops.addEventListener('click', function () {
                var outDate = utils.formatDate((command.time_completed - 10) * 1000, 'HH:mm:ss:sss dd/MM/yyyy')
                attackView.setQueueCommand(command, outDate)
            })

            $copyArriveTime.addEventListener('click', function () {
                document.execCommand('copy')
            })

            $copyArriveTime.addEventListener('copy', function (event) {
                event.preventDefault()
                event.clipboardData.setData('text/plain', arriveTimeFormated)
                utils.emitNotif('success', 'Arrive time copied!')
            })

            $copyBackTime.addEventListener('click', function () {
                document.execCommand('copy')
            })

            $copyBackTime.addEventListener('copy', function (event) {
                event.preventDefault()
                event.clipboardData.setData('text/plain', backTimeFormated)
                utils.emitNotif('success', 'Back time copied!')
            })

            $commands.append($command)

            command.$command = $command
            command.$arrivalProgress = $arrivalProgress
            command.$arrivalIn = $arrivalIn
        })

        ui.setTooltips()
        ui.recalcScrollbar()
        highlightSelectedVillage()
    }

    var onCommandCancelled = function (commandId) {
        $commands.find('.command-' + commandId).remove()
        ui.recalcScrollbar()
    }

    var onCommandIgnored = function (commandId) {
        $commands.find('.command-' + commandId).remove()
        ui.recalcScrollbar()
    }

    var onVillageRenamed = function (village) {
        var _class = '.village-' + village.village_id + ' .name'

        $commands.find(_class).html(village.name)
    }

    var onVillageSwitched = function (e, vid) {
        var filters = attackView.getFilters()

        if (!filters[attackView.FILTER_TYPES.VILLAGE]) {
            highlightSelectedVillage(vid)
        }
    }

    var removeHighlightVillage = function () {
        $commands.find('.village.selected').removeClass('selected')
    }

    var highlightSelectedVillage = function (vid) {
        removeHighlightVillage()

        vid = vid || modelDataService.getSelectedVillage().getId()
        $commands.find('.village-' + vid).addClass('selected')
    }

    var updateFilterElements = function () {
        var filters = attackView.getFilters()
        var type
        var sub
        var fn

        for (type in filters) {
            if (angular.isObject(filters[type])) {
                for (sub in filters[type]) {
                    fn = filters[type][sub] ? 'addClass': 'removeClass'
                    $filters[type][sub][fn]('active')
                }
            } else {
                fn = filters[type] ? 'addClass': 'removeClass'
                $filters[type][fn]('active')
            }
        }
    }

    var updateSortingElements = function () {
        var sorting = attackView.getSortings()
        var $arrow = document.createElement('span')
        $arrow.className = 'float-right arrow '
        $arrow.className += sorting.reverse ? 'icon-26x26-normal-arrow-up' : 'icon-26x26-normal-arrow-down'
        
        $sortings.find('.arrow').remove()
        
        $sortings.some(function ($elem, i) {
            var sort = $elem.dataset.sort

            if (sorting.column === attackView.COLUMN_TYPES[sort]) {
                $elem.appendChild($arrow)
                return true
            }
        })
    }

    attackView.interface = function () {
        attackView.interface = init()
    }
})

define('two/autoCollector', [
    'two/eventQueue',
    'helper/time',
    'Lockr'
], function (
    eventQueue,
    $timeHelper,
    Lockr
) {
    /**
     * Indica se o modulo já foi iniciado.
     *
     * @type {Boolean}
     */
    var initialized = false

    /**
     * Indica se o modulo está em funcionamento.
     *
     * @type {Boolean}
     */
    var running = false

    /**
     * Permite que o evento RESOURCE_DEPOSIT_JOB_COLLECTIBLE seja executado
     * apenas uma vez.
     *
     * @type {Boolean}
     */
    var recall = true

    /**
     * Next automatic reroll setTimeout ID.
     * 
     * @type {Number}
     */
    var nextUpdateId = 0

    /**
     * Inicia um trabalho.
     *
     * @param {Object} job - Dados do trabalho
     */
    var startJob = function (job) {
        socketService.emit(routeProvider.RESOURCE_DEPOSIT_START_JOB, {
            job_id: job.id
        })
    }

    /**
     * Coleta um trabalho.
     *
     * @param {Object} job - Dados do trabalho
     */
    var finalizeJob = function (job) {
        socketService.emit(routeProvider.RESOURCE_DEPOSIT_COLLECT, {
            job_id: job.id,
            village_id: modelDataService.getSelectedVillage().getId()
        })
    }

    /**
     * Força a atualização das informações do depósito.
     */
    var updateDepositInfo = function () {
        socketService.emit(routeProvider.RESOURCE_DEPOSIT_GET_INFO, {})
    }

    /**
     * Faz a analise dos trabalhos sempre que um evento relacionado ao depósito
     * é disparado.
     */
    var analyse = function () {
        if (!running) {
            return false
        }

        var data = modelDataService.getSelectedCharacter().getResourceDeposit()

        if (!data) {
            return false
        }

        var current = data.getCurrentJob()

        if (current) {
            return false
        }

        var collectible = data.getCollectibleJobs()

        if (collectible) {
            return finalizeJob(collectible.shift())
        }

        var ready = data.getReadyJobs()

        if (ready) {
            return startJob(getFastestJob(ready))
        }
    }

    /**
     * Obtem o trabalho de menor duração.
     *
     * @param {Array} jobs - Lista de trabalhos prontos para serem iniciados.
     */
    var getFastestJob = function (jobs) {
        var sorted = jobs.sort(function (a, b) {
            return a.duration - b.duration
        })

        return sorted[0]
    }

    /**
     * Atualiza o timeout para que seja forçado a atualização das informações
     * do depósito quando for resetado.
     * Motivo: só é chamado automaticamente quando um milestone é resetado,
     * e não o diário.
     * 
     * @param {Object} data - Os dados recebidos de RESOURCE_DEPOSIT_INFO
     */
    var rerollUpdater = function (data) {
        var timeLeft = data.time_next_reset * 1000 - Date.now() + 1000

        clearTimeout(nextUpdateId)
        nextUpdateId = setTimeout(updateDepositInfo, timeLeft)
    }

    /**
     * Métodos públicos do AutoCollector.
     *
     * @type {Object}
     */
    var autoCollector = {}

    /**
     * Inicializa o AutoDepois, configura os eventos.
     */
    autoCollector.init = function () {
        initialized = true

        rootScope.$on(eventTypeProvider.RESOURCE_DEPOSIT_JOB_COLLECTIBLE, function () {
            if (!recall || !running) {
                return false
            }

            recall = false

            setTimeout(function () {
                recall = true
                analyse()
            }, 1500)
        })

        rootScope.$on(eventTypeProvider.RESOURCE_DEPOSIT_JOBS_REROLLED, analyse)
        rootScope.$on(eventTypeProvider.RESOURCE_DEPOSIT_JOB_COLLECTED, analyse)
        rootScope.$on(eventTypeProvider.RESOURCE_DEPOSIT_INFO, function (event, data) {
            analyse()
            rerollUpdater(data)
        })
    }

    /**
     * Inicia a analise dos trabalhos.
     */
    autoCollector.start = function () {
        eventQueue.trigger('Collector/started')
        running = true
        analyse()
    }

    /**
     * Para a analise dos trabalhos.
     */
    autoCollector.stop = function () {
        eventQueue.trigger('Collector/stopped')
        running = false
    }

    /**
     * Retorna se o modulo está em funcionamento.
     */
    autoCollector.isRunning = function () {
        return running
    }

    /**
     * Retorna se o modulo está inicializado.
     */
    autoCollector.isInitialized = function () {
        return initialized
    }

    return autoCollector
})

define('two/autoCollector/secondVillage', [
    'two/autoCollector',
    'two/eventQueue',
    'helper/time',
    'models/SecondVillageModel'
], function (
    autoCollector,
    eventQueue,
    $timeHelper,
    SecondVillageModel
) {
    var initialized = false
    var running = false
    var secondVillageService = injector.get('secondVillageService')

    var getRunningJob = function (jobs) {
        var now = Date.now()

        for (var id in jobs) {
            if (jobs[id].time_started && jobs[id].time_completed) {
                if (now < $timeHelper.server2ClientTime(jobs[id].time_completed)) {
                    return jobs[id]
                }
            }
        }

        return false
    }

    var getCollectibleJob = function (jobs) {
        var now = Date.now()

        for (var id in jobs) {
            if (jobs[id].time_started && jobs[id].time_completed) {
                if ((now >= $timeHelper.server2ClientTime(jobs[id].time_completed)) && !jobs[id].collected) {
                    return id
                }
            }
        }

        return false
    }

    var finalizeJob = function (jobId) {
        socketService.emit(routeProvider.SECOND_VILLAGE_COLLECT_JOB_REWARD, {
            village_id: modelDataService.getSelectedVillage().getId(),
            job_id: jobId
        })
    }

    var startJob = function (jobId, callback) {
        socketService.emit(routeProvider.SECOND_VILLAGE_START_JOB, {
            village_id: modelDataService.getSelectedVillage().getId(),
            job_id: jobId
        }, callback)
    }

    var getFirstJob = function (jobs) {
        for (var id in jobs) {
            return id
        }

        return false
    }

    var updateSecondVillageInfo = function (callback) {
        socketService.emit(routeProvider.SECOND_VILLAGE_GET_INFO, {}, function (data) {
            var model = new SecondVillageModel(data)
            modelDataService.getSelectedCharacter().setSecondVillage(model)
            callback()
        })
    }

    var updateAndAnalyse = function () {
        updateSecondVillageInfo(analyse)
    }

    var analyse = function () {
        var secondVillage = modelDataService.getSelectedCharacter().getSecondVillage()

        if (!running || !secondVillage || !secondVillage.isAvailable()) {
            return false
        }

        var current = getRunningJob(secondVillage.data.jobs)

        if (current) {
            var completed = $timeHelper.server2ClientTime(current.time_completed)
            var nextRun = completed - Date.now() + 1000
            setTimeout(updateAndAnalyse, nextRun)
            return false
        }

        var collectible = getCollectibleJob(secondVillage.data.jobs)
        
        if (collectible) {
            return finalizeJob(collectible)
        }

        var currentDayJobs = secondVillageService.getCurrentDayJobs(secondVillage.data.jobs, secondVillage.data.day)
        var collectedJobs = secondVillageService.getCollectedJobs(secondVillage.data.jobs)
        var resources = modelDataService.getSelectedVillage().getResources().getResources()
        var availableJobs = secondVillageService.getAvailableJobs(currentDayJobs, collectedJobs, resources, [])

        if (availableJobs) {
            var firstJob = getFirstJob(availableJobs)

            startJob(firstJob, function () {
                var job = availableJobs[firstJob]
                setTimeout(updateAndAnalyse, (job.duration * 1000) + 1000)
            })
        }
    }

    var secondVillageCollector = {}

    secondVillageCollector.init = function () {
        if (!secondVillageService.isFeatureActive()) {
            return false
        }

        initialized = true

        rootScope.$on(eventTypeProvider.SECOND_VILLAGE_VILLAGE_CREATED, updateAndAnalyse)
        rootScope.$on(eventTypeProvider.SECOND_VILLAGE_JOB_COLLECTED, updateAndAnalyse)
        rootScope.$on(eventTypeProvider.SECOND_VILLAGE_VILLAGE_CREATED, updateAndAnalyse)
    }

    secondVillageCollector.start = function () {
        if (!initialized) {
            return false
        }

        eventQueue.trigger('Collector/secondVillage/started')
        running = true
        updateAndAnalyse()
    }

    secondVillageCollector.stop = function () {
        if (!initialized) {
            return false
        }

        eventQueue.trigger('Collector/secondVillage/stopped')
        running = false
    }

    secondVillageCollector.isRunning = function () {
        return running
    }

    secondVillageCollector.isInitialized = function () {
        return initialized
    }

    autoCollector.secondVillage = secondVillageCollector
})

require([
    'two/ready',
    'two/autoCollector',
    'Lockr',
    'two/eventQueue',
    'two/autoCollector/secondVillage',
    'two/autoCollector/ui',
], function (
    ready,
    autoCollector,
    Lockr,
    eventQueue
) {
    if (autoCollector.isInitialized()) {
        return false
    }

    ready(function () {
        autoCollector.init()
        autoCollector.secondVillage.init()
        autoCollector.interface()
        
        ready(function () {
            if (Lockr.get('collector-active', false, true)) {
                autoCollector.start()
                autoCollector.secondVillage.start()
            }

            eventQueue.bind('Collector/started', function () {
                Lockr.set('collector-active', true)
            })

            eventQueue.bind('Collector/stopped', function () {
                Lockr.set('collector-active', false)
            })
        }, ['initial_village'])
    })
})

define('two/autoCollector/ui', [
    'two/autoCollector',
    'two/FrontButton',
    'two/locale',
    'two/utils',
    'two/eventQueue'
], function (
    autoCollector,
    FrontButton,
    Locale,
    utils,
    eventQueue
) {
    var opener

    function CollectorInterface () {
        Locale.create('collector', {"en":{"title":"AutoCollector","description":"Automatic Resource Deposit/Second Village collector.","activated":"Automatic Collector activated","deactivated":"Automatic Collector deactivated"},"pt":{"title":"AutoCollector","description":"Coletor automático para Depósito de Recursos/Segunda Aldeia.","activated":"Coletor Automático ativado","deactivated":"Coletor Automático desativado"}}, 'en')
        
        opener = new FrontButton('Collector', {
            classHover: false,
            classBlur: false,
            tooltip: Locale('collector', 'description')
        })

        opener.click(function () {
            if (autoCollector.isRunning()) {
                autoCollector.stop()
                autoCollector.secondVillage.stop()
                utils.emitNotif('success', Locale('collector', 'deactivated'))
            } else {
                autoCollector.start()
                autoCollector.secondVillage.start()
                utils.emitNotif('success', Locale('collector', 'activated'))
            }
        })

        eventQueue.bind('Collector/started', function () {
            opener.$elem.removeClass('btn-green').addClass('btn-red')
        })

        eventQueue.bind('Collector/stopped', function () {
            opener.$elem.removeClass('btn-red').addClass('btn-green')
        })

        if (autoCollector.isRunning()) {
            eventQueue.trigger('Collector/started')
        }

        return opener
    }

    autoCollector.interface = function () {
        autoCollector.interface = CollectorInterface()
    }
})

define('two/builder', [
    'two/locale',
    'two/utils',
    'two/eventQueue',
    'two/ready',
    'Lockr',
    'conf/upgradeabilityStates',
    'conf/buildingTypes',
    'conf/locationTypes'
], function (
    Locale,
    utils,
    eventQueue,
    ready,
    Lockr,
    UPGRADEABILITY_STATES,
    BUILDING_TYPES,
    LOCATION_TYPES
) {
    var buildingService = injector.get('buildingService')
    var initialized = false
    var running = false
    var buildingSequeOrder
    var localSettings
    var intervalCheckId
    var ANALYSES_PER_MINUTE = 1
    var VILLAGE_BUILDINGS = {}
    var groupList
    var player
    var buildLog
    var settings = {}
    var defaultBuildingOrders = {}

    defaultBuildingOrders['Essential'] = [
        BUILDING_TYPES.HEADQUARTER, // 1
        BUILDING_TYPES.FARM, // 1
        BUILDING_TYPES.WAREHOUSE, // 1
        BUILDING_TYPES.RALLY_POINT, // 1
        BUILDING_TYPES.BARRACKS, // 1

        // Quest: The Resources
        BUILDING_TYPES.TIMBER_CAMP, // 1
        BUILDING_TYPES.TIMBER_CAMP, // 2
        BUILDING_TYPES.CLAY_PIT, // 1
        BUILDING_TYPES.IRON_MINE, // 1

        BUILDING_TYPES.HEADQUARTER, // 2
        BUILDING_TYPES.RALLY_POINT, // 2

        // Quest: First Steps
        BUILDING_TYPES.FARM, // 2
        BUILDING_TYPES.WAREHOUSE, // 2
        
        // Quest: Laying Down Foundation
        BUILDING_TYPES.CLAY_PIT, // 2
        BUILDING_TYPES.IRON_MINE, // 2

        // Quest: More Resources
        BUILDING_TYPES.TIMBER_CAMP, // 3
        BUILDING_TYPES.CLAY_PIT, // 3
        BUILDING_TYPES.IRON_MINE, // 3
        
        // Quest: Resource Building
        BUILDING_TYPES.WAREHOUSE, // 3
        BUILDING_TYPES.TIMBER_CAMP, // 4
        BUILDING_TYPES.CLAY_PIT, // 4
        BUILDING_TYPES.IRON_MINE, // 4

        // Quest: Get an Overview
        BUILDING_TYPES.WAREHOUSE, // 4
        BUILDING_TYPES.TIMBER_CAMP, // 5
        BUILDING_TYPES.CLAY_PIT, // 5
        BUILDING_TYPES.IRON_MINE, // 5

        // Quest: Capital
        BUILDING_TYPES.FARM, // 3
        BUILDING_TYPES.WAREHOUSE, // 5
        BUILDING_TYPES.HEADQUARTER, // 3

        // Quest: The Hero
        BUILDING_TYPES.STATUE, // 1

        // Quest: Resource Expansions
        BUILDING_TYPES.TIMBER_CAMP, // 6
        BUILDING_TYPES.CLAY_PIT, // 6
        BUILDING_TYPES.IRON_MINE, // 6
        
        // Quest: Military
        BUILDING_TYPES.BARRACKS, // 2

        // Quest: The Hospital
        BUILDING_TYPES.HEADQUARTER, // 4
        BUILDING_TYPES.TIMBER_CAMP, // 7
        BUILDING_TYPES.CLAY_PIT, // 7
        BUILDING_TYPES.IRON_MINE, // 7
        BUILDING_TYPES.FARM, // 4
        BUILDING_TYPES.HOSPITAL, // 1

        // Quest: Resources
        BUILDING_TYPES.TIMBER_CAMP, // 8
        BUILDING_TYPES.CLAY_PIT, // 8
        BUILDING_TYPES.IRON_MINE, // 8

        // Quest: The Wall
        BUILDING_TYPES.WAREHOUSE, // 6
        BUILDING_TYPES.HEADQUARTER, // 5
        BUILDING_TYPES.WALL, // 1
        
        // Quest: Village Improvements
        BUILDING_TYPES.TIMBER_CAMP, // 9
        BUILDING_TYPES.CLAY_PIT, // 9
        BUILDING_TYPES.IRON_MINE, // 9
        BUILDING_TYPES.TIMBER_CAMP, // 10
        BUILDING_TYPES.CLAY_PIT, // 10
        BUILDING_TYPES.IRON_MINE, // 10
        BUILDING_TYPES.FARM, // 5

        // Quest: Hard work
        BUILDING_TYPES.TIMBER_CAMP, // 11
        BUILDING_TYPES.CLAY_PIT, // 11
        BUILDING_TYPES.IRON_MINE, // 11
        BUILDING_TYPES.TIMBER_CAMP, // 12
        BUILDING_TYPES.CLAY_PIT, // 12
        BUILDING_TYPES.IRON_MINE, // 12

        // Quest: The way of defence
        BUILDING_TYPES.BARRACKS, // 3

        BUILDING_TYPES.FARM, // 6
        BUILDING_TYPES.WAREHOUSE, // 7
        BUILDING_TYPES.FARM, // 7
        BUILDING_TYPES.WAREHOUSE, // 8
        BUILDING_TYPES.FARM, // 8
        BUILDING_TYPES.WAREHOUSE, // 9
        BUILDING_TYPES.WAREHOUSE, // 10

        // Quest: Market Barker
        BUILDING_TYPES.HEADQUARTER, // 6
        BUILDING_TYPES.MARKET, // 1

        // Quest: Preparations
        BUILDING_TYPES.BARRACKS, // 4
        BUILDING_TYPES.WALL, // 2
        BUILDING_TYPES.WALL, // 3

        BUILDING_TYPES.FARM, // 9
        BUILDING_TYPES.FARM, // 10

        BUILDING_TYPES.BARRACKS, // 5
        BUILDING_TYPES.WAREHOUSE, // 11
        BUILDING_TYPES.FARM, // 11

        BUILDING_TYPES.BARRACKS, // 6
        BUILDING_TYPES.WAREHOUSE, // 12
        BUILDING_TYPES.FARM, // 12

        BUILDING_TYPES.BARRACKS, // 7
        BUILDING_TYPES.WAREHOUSE, // 13
        BUILDING_TYPES.FARM, // 13

        BUILDING_TYPES.WALL, // 4
        BUILDING_TYPES.WALL, // 5
        BUILDING_TYPES.WALL, // 6

        BUILDING_TYPES.MARKET, // 2
        BUILDING_TYPES.MARKET, // 3
        BUILDING_TYPES.MARKET, // 4
        
        BUILDING_TYPES.BARRACKS, // 8
        BUILDING_TYPES.BARRACKS, // 9

        BUILDING_TYPES.HEADQUARTER, // 7
        BUILDING_TYPES.HEADQUARTER, // 8
        
        BUILDING_TYPES.TAVERN, // 1
        BUILDING_TYPES.TAVERN, // 2
        BUILDING_TYPES.TAVERN, // 3

        BUILDING_TYPES.RALLY_POINT, // 3

        BUILDING_TYPES.BARRACKS, // 10
        BUILDING_TYPES.BARRACKS, // 11

        BUILDING_TYPES.WAREHOUSE, // 14
        BUILDING_TYPES.FARM, // 14

        BUILDING_TYPES.WAREHOUSE, // 15
        BUILDING_TYPES.FARM, // 15

        BUILDING_TYPES.BARRACKS, // 12
        BUILDING_TYPES.BARRACKS, // 13

        BUILDING_TYPES.STATUE, // 2
        BUILDING_TYPES.STATUE, // 3

        BUILDING_TYPES.WALL, // 7
        BUILDING_TYPES.WALL, // 8

        BUILDING_TYPES.HEADQUARTER, // 9
        BUILDING_TYPES.HEADQUARTER, // 10

        BUILDING_TYPES.WAREHOUSE, // 16
        BUILDING_TYPES.FARM, // 16
        BUILDING_TYPES.FARM, // 17

        BUILDING_TYPES.IRON_MINE, // 13
        BUILDING_TYPES.IRON_MINE, // 14
        BUILDING_TYPES.IRON_MINE, // 15

        BUILDING_TYPES.WAREHOUSE, // 17

        BUILDING_TYPES.BARRACKS, // 14
        BUILDING_TYPES.BARRACKS, // 15

        BUILDING_TYPES.WAREHOUSE, // 18
        BUILDING_TYPES.FARM, // 18

        BUILDING_TYPES.WALL, // 9
        BUILDING_TYPES.WALL, // 10

        BUILDING_TYPES.TAVERN, // 4
        BUILDING_TYPES.TAVERN, // 5
        BUILDING_TYPES.TAVERN, // 6

        BUILDING_TYPES.MARKET, // 5
        BUILDING_TYPES.MARKET, // 6
        BUILDING_TYPES.MARKET, // 7

        BUILDING_TYPES.WAREHOUSE, // 19
        BUILDING_TYPES.FARM, // 19
        BUILDING_TYPES.WAREHOUSE, // 20
        BUILDING_TYPES.FARM, // 20
        BUILDING_TYPES.WAREHOUSE, // 21
        BUILDING_TYPES.FARM, // 21

        BUILDING_TYPES.IRON_MINE, // 16
        BUILDING_TYPES.IRON_MINE, // 17
        BUILDING_TYPES.IRON_MINE, // 18

        BUILDING_TYPES.RALLY_POINT, // 4

        BUILDING_TYPES.BARRACKS, // 16
        BUILDING_TYPES.BARRACKS, // 17

        BUILDING_TYPES.FARM, // 22
        BUILDING_TYPES.FARM, // 23
        BUILDING_TYPES.FARM, // 24
        BUILDING_TYPES.FARM, // 25

        BUILDING_TYPES.WAREHOUSE, // 22
        BUILDING_TYPES.WAREHOUSE, // 23

        BUILDING_TYPES.HEADQUARTER, // 11
        BUILDING_TYPES.HEADQUARTER, // 12

        BUILDING_TYPES.STATUE, // 4
        BUILDING_TYPES.STATUE, // 5

        BUILDING_TYPES.FARM, // 26
        BUILDING_TYPES.BARRACKS, // 18

        BUILDING_TYPES.HEADQUARTER, // 14
        BUILDING_TYPES.HEADQUARTER, // 15

        BUILDING_TYPES.FARM, // 27
        BUILDING_TYPES.BARRACKS, // 19

        BUILDING_TYPES.HEADQUARTER, // 15
        BUILDING_TYPES.HEADQUARTER, // 16

        BUILDING_TYPES.BARRACKS, // 20

        BUILDING_TYPES.HEADQUARTER, // 17
        BUILDING_TYPES.HEADQUARTER, // 18
        BUILDING_TYPES.HEADQUARTER, // 19
        BUILDING_TYPES.HEADQUARTER, // 20

        BUILDING_TYPES.ACADEMY, // 1

        BUILDING_TYPES.FARM, // 28
        BUILDING_TYPES.WAREHOUSE, // 23
        BUILDING_TYPES.WAREHOUSE, // 24
        BUILDING_TYPES.WAREHOUSE, // 25

        BUILDING_TYPES.MARKET, // 8
        BUILDING_TYPES.MARKET, // 9
        BUILDING_TYPES.MARKET, // 10

        BUILDING_TYPES.TIMBER_CAMP, // 13
        BUILDING_TYPES.CLAY_PIT, // 13
        BUILDING_TYPES.IRON_MINE, // 19

        BUILDING_TYPES.TIMBER_CAMP, // 14
        BUILDING_TYPES.CLAY_PIT, // 14
        BUILDING_TYPES.TIMBER_CAMP, // 15
        BUILDING_TYPES.CLAY_PIT, // 15

        BUILDING_TYPES.TIMBER_CAMP, // 16
        BUILDING_TYPES.TIMBER_CAMP, // 17

        BUILDING_TYPES.WALL, // 11
        BUILDING_TYPES.WALL, // 12

        BUILDING_TYPES.MARKET, // 11
        BUILDING_TYPES.MARKET, // 12
        BUILDING_TYPES.MARKET, // 13

        BUILDING_TYPES.TIMBER_CAMP, // 18
        BUILDING_TYPES.CLAY_PIT, // 16
        BUILDING_TYPES.TIMBER_CAMP, // 19
        BUILDING_TYPES.CLAY_PIT, // 17

        BUILDING_TYPES.TAVERN, // 7
        BUILDING_TYPES.TAVERN, // 8
        BUILDING_TYPES.TAVERN, // 9

        BUILDING_TYPES.WALL, // 13
        BUILDING_TYPES.WALL, // 14

        BUILDING_TYPES.TIMBER_CAMP, // 20
        BUILDING_TYPES.CLAY_PIT, // 18
        BUILDING_TYPES.IRON_MINE, // 20

        BUILDING_TYPES.TIMBER_CAMP, // 21
        BUILDING_TYPES.CLAY_PIT, // 19
        BUILDING_TYPES.IRON_MINE, // 21

        BUILDING_TYPES.BARRACKS, // 21
        BUILDING_TYPES.BARRACKS, // 22
        BUILDING_TYPES.BARRACKS, // 23

        BUILDING_TYPES.FARM, // 29
        BUILDING_TYPES.WAREHOUSE, // 26
        BUILDING_TYPES.WAREHOUSE, // 27

        BUILDING_TYPES.TAVERN, // 10
        BUILDING_TYPES.TAVERN, // 11
        BUILDING_TYPES.TAVERN, // 12

        BUILDING_TYPES.TIMBER_CAMP, // 22
        BUILDING_TYPES.CLAY_PIT, // 20
        BUILDING_TYPES.IRON_MINE, // 22

        BUILDING_TYPES.TIMBER_CAMP, // 23
        BUILDING_TYPES.CLAY_PIT, // 21
        BUILDING_TYPES.IRON_MINE, // 23

        BUILDING_TYPES.TIMBER_CAMP, // 24
        BUILDING_TYPES.CLAY_PIT, // 22
        BUILDING_TYPES.IRON_MINE, // 24

        BUILDING_TYPES.BARRACKS, // 24
        BUILDING_TYPES.BARRACKS, // 25

        BUILDING_TYPES.FARM, // 30
        BUILDING_TYPES.WAREHOUSE, // 28
        BUILDING_TYPES.WAREHOUSE, // 29

        BUILDING_TYPES.WALL, // 15
        BUILDING_TYPES.WALL, // 16
        BUILDING_TYPES.WALL, // 17
        BUILDING_TYPES.WALL, // 18

        BUILDING_TYPES.TAVERN, // 13
        BUILDING_TYPES.TAVERN, // 14

        BUILDING_TYPES.RALLY_POINT, // 5

        BUILDING_TYPES.TIMBER_CAMP, // 25
        BUILDING_TYPES.CLAY_PIT, // 23
        BUILDING_TYPES.IRON_MINE, // 25

        BUILDING_TYPES.TIMBER_CAMP, // 26
        BUILDING_TYPES.CLAY_PIT, // 24
        BUILDING_TYPES.IRON_MINE, // 26

        BUILDING_TYPES.TIMBER_CAMP, // 27
        BUILDING_TYPES.CLAY_PIT, // 25
        BUILDING_TYPES.IRON_MINE, // 27

        BUILDING_TYPES.TIMBER_CAMP, // 28
        BUILDING_TYPES.CLAY_PIT, // 26
        BUILDING_TYPES.IRON_MINE, // 28

        BUILDING_TYPES.TIMBER_CAMP, // 29
        BUILDING_TYPES.CLAY_PIT, // 27
        BUILDING_TYPES.CLAY_PIT, // 28
        BUILDING_TYPES.IRON_MINE, // 29

        BUILDING_TYPES.TIMBER_CAMP, // 30
        BUILDING_TYPES.CLAY_PIT, // 29
        BUILDING_TYPES.CLAY_PIT, // 30
        BUILDING_TYPES.IRON_MINE, // 30

        BUILDING_TYPES.WALL, // 19
        BUILDING_TYPES.WALL, // 20
    ]

    defaultBuildingOrders['Full Village'] = [
        BUILDING_TYPES.HOSPITAL, // 2
        BUILDING_TYPES.HOSPITAL, // 3
        BUILDING_TYPES.HOSPITAL, // 4
        BUILDING_TYPES.HOSPITAL, // 5

        BUILDING_TYPES.MARKET, // 14
        BUILDING_TYPES.MARKET, // 15
        BUILDING_TYPES.MARKET, // 16
        BUILDING_TYPES.MARKET, // 17

        BUILDING_TYPES.HEADQUARTER, // 21
        BUILDING_TYPES.HEADQUARTER, // 22
        BUILDING_TYPES.HEADQUARTER, // 23
        BUILDING_TYPES.HEADQUARTER, // 24
        BUILDING_TYPES.HEADQUARTER, // 25

        BUILDING_TYPES.PRECEPTORY, // 1

        BUILDING_TYPES.HOSPITAL, // 6
        BUILDING_TYPES.HOSPITAL, // 7
        BUILDING_TYPES.HOSPITAL, // 8
        BUILDING_TYPES.HOSPITAL, // 9
        BUILDING_TYPES.HOSPITAL, // 10

        BUILDING_TYPES.MARKET, // 18
        BUILDING_TYPES.MARKET, // 19
        BUILDING_TYPES.MARKET, // 20
        BUILDING_TYPES.MARKET, // 21

        BUILDING_TYPES.PRECEPTORY, // 2
        BUILDING_TYPES.PRECEPTORY, // 3

        BUILDING_TYPES.MARKET, // 22
        BUILDING_TYPES.MARKET, // 23
        BUILDING_TYPES.MARKET, // 24
        BUILDING_TYPES.MARKET, // 25

        BUILDING_TYPES.HEADQUARTER, // 26
        BUILDING_TYPES.HEADQUARTER, // 27
        BUILDING_TYPES.HEADQUARTER, // 28
        BUILDING_TYPES.HEADQUARTER, // 29
        BUILDING_TYPES.HEADQUARTER, // 30

        BUILDING_TYPES.PRECEPTORY, // 4
        BUILDING_TYPES.PRECEPTORY, // 5
        BUILDING_TYPES.PRECEPTORY, // 6
        BUILDING_TYPES.PRECEPTORY, // 7
        BUILDING_TYPES.PRECEPTORY, // 8
        BUILDING_TYPES.PRECEPTORY, // 9
        BUILDING_TYPES.PRECEPTORY, // 10
    ]

    Array.prototype.unshift.apply(
        defaultBuildingOrders['Full Village'],
        defaultBuildingOrders['Essential']
    )

    defaultBuildingOrders['Essential Without Wall'] =
        defaultBuildingOrders['Essential'].filter(function (building) {
            return building !== BUILDING_TYPES.WALL
        })

    defaultBuildingOrders['Full Wall'] = [
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.WALL // 20
    ]

    var settingsMap = {
        groupVillages: {
            default: '',
            inputType: 'select'
        },
        buildingPreset: {
            default: 'Essential',
            inputType: 'select'
        },
        buildingOrder: {
            default: defaultBuildingOrders,
            inputType: 'buildingOrder'
        }
    }

    for (var buildingName in BUILDING_TYPES) {
        VILLAGE_BUILDINGS[BUILDING_TYPES[buildingName]] = 0
    }

    var init = function init () {
        Locale.create('builder', {"en":{"title":"BuilderQueue","info.header":"Title","info.content":"Content","general.disabled":"— Disabled —","general.started":"BuilderQueue started","general.stopped":"BuilderQueue stopped","settings":"Settings","settings.groupVillages":"Build only on villages with the group","settings.buildingPreset":"Building order preset","settings.buildingsOrder":"Build Order","settings.buildingsOrderFinal":"Buildings Level","settings.saved":"Settings saved!","logs.noBuilds":"No builds started","logs.clear":"Clear logs"},"pt":{"title":"BuilderQueue","info.header":"Título","info.content":"Conteúdo","general.disabled":"— Desativado —","general.started":"BuilderQueue iniciado","general.stopped":"BuilderQueue parado","settings":"Configurações","settings.groupVillages":"Construir apenas em aldeias do grupo","settings.buildingPreset":"Predefinições de ordens","settings.buildingsOrder":"Ordem de Construção","settings.buildingsOrderFinal":"Nível dos Edifícios","settings.saved":"Configurações salvas!","logs.noBuilds":"Nenhuma construção iniciada","logs.clear":"Limpar registros"}}, 'en')

        initialized = true
        localSettings = Lockr.get('builder-settings', {}, true)
        buildLog = Lockr.get('builder-log', [], true)
        player = modelDataService.getSelectedCharacter()
        groupList = modelDataService.getGroupList()

        for (var key in settingsMap) {
            var defaultValue = settingsMap[key].default

            settings[key] = localSettings.hasOwnProperty(key)
                ? localSettings[key]
                : defaultValue
        }

        buildingOrderLimit = getSequenceLimit(settings.buildingPreset)

        rootScope.$on(eventTypeProvider.BUILDING_LEVEL_CHANGED, function (event, data) {
            if (!running) {
                return false
            }

            setTimeout(function () {
                var village = player.getVillage(data.village_id)
                analyseVillageBuildings(village)
            }, 1000)
        })
    }

    /**
     * Loop all player villages, check if ready and init the building analyse
     * for each village.
     */
    var analyseVillages = function analyseVillages () {
        var villageIds = settings.groupVillages
            ? groupList.getGroupVillageIds(settings.groupVillages)
            : getVillageIds()

        villageIds.forEach(function (id) {
            var village = player.getVillage(id)
            var readyState = village.checkReadyState()
            var queue = village.buildingQueue

            if (queue.getAmountJobs() === queue.getUnlockedSlots()) {
                return false
            }

            if (!readyState.buildingQueue || !readyState.buildings) {
                return false
            }

            if (!village.isInitialized()) {
                villageService.initializeVillage(village)
            }

            analyseVillageBuildings(village)
        })
    }

    /**
     * Generate an Array with all player's village IDs.
     *
     * @return {Array}
     */
    var getVillageIds = function () {
        var ids = []
        var villages = player.getVillages()

        for (var id in villages) {
            ids.push(id)
        }

        return ids
    }

    /**
     * Loop all village buildings, start build job if available.
     *
     * @param {VillageModel} village
     */
    var analyseVillageBuildings = function analyseVillageBuildings (village) {
        var buildingLevels = angular.copy(village.buildingData.getBuildingLevels())
        var currentQueue = village.buildingQueue.getQueue()
        var buildingOrder = angular.copy(VILLAGE_BUILDINGS)

        currentQueue.forEach(function (job) {
            buildingLevels[job.building]++
        })

        if (checkVillageBuildingLimit(buildingLevels)) {
            return false
        }

        settings.buildingOrder[settings.buildingPreset].some(function (buildingName) {
            if (++buildingOrder[buildingName] > buildingLevels[buildingName]) {
                buildingService.compute(village)

                upgradeBuilding(village, buildingName, function (jobAdded, data) {
                    if (jobAdded) {
                        var now = Date.now()
                        var logData = [
                            {
                                x: village.getX(),
                                y: village.getY(),
                                name: village.getName(),
                                id: village.getId()
                            },
                            data.job.building,
                            data.job.level,
                            now
                        ]

                        eventQueue.trigger('Builder/jobStarted', logData)
                        buildLog.unshift(logData)
                        Lockr.set('builder-log', buildLog)
                    }
                })

                return true
            }
        })
    }

    /**
     * Init a build job
     *
     * @param {VillageModel} village
     * @param {String} buildingName - Building to be build.
     * @param {Function} callback
     */
    var upgradeBuilding = function upgradeBuilding (village, buildingName, callback) {
        var buildingData = village.getBuildingData().getDataForBuilding(buildingName)

        if (buildingData.upgradeability === UPGRADEABILITY_STATES.POSSIBLE) {
            socketService.emit(routeProvider.VILLAGE_UPGRADE_BUILDING, {
                building: buildingName,
                village_id: village.getId(),
                location: LOCATION_TYPES.MASS_SCREEN,
                premium: false
            }, function (data, event) {
                callback(true, data)
            })
        } else {
            callback(false)
        }
    }

    /**
     * Check if all buildings from the order already reached
     * the specified level.
     *
     * @param {Object} buildingLevels - Current buildings level from the village.
     * @return {Boolean} True if the levels already reached the limit.
     */
    var checkVillageBuildingLimit = function checkVillageBuildingLimit (buildingLevels) {
        for (var buildingName in buildingLevels) {
            if (buildingLevels[buildingName] < buildingOrderLimit[buildingName]) {
                return false
            }
        }

        return true
    }

    /**
     * Check if the building order is valid by analysing if the
     * buildings exceed the maximum level.
     *
     * @param {Array} order
     * @return {Boolean}
     */
    var validSequence = function validSequence (order) {
        var buildingOrder = angular.copy(VILLAGE_BUILDINGS)
        var buildingData = modelDataService.getGameData().getBuildings()
        var invalid = false

        order.some(function (buildingName) {
            if (++buildingOrder[buildingName] > buildingData[buildingName].max_level) {
                invalid = true
                return true
            }
        })

        return invalid
    }

    /**
     * Get the level max for each building.
     *
     * @param {String} buildingPreset
     * @return {Object} Maximum level for each building.
     */
    var getSequenceLimit = function getSequenceLimit (buildingPreset) {
        var buildingOrder = settings.buildingOrder[buildingPreset]
        var orderLimit = angular.copy(VILLAGE_BUILDINGS)

        buildingOrder.forEach(function (buildingName) {
            orderLimit[buildingName]++
        })

        return orderLimit
    }

    /**
     * @param {Object} changes - New settings.
     * @return {Boolean} True if the internal settings changed.
     */
    var updateSettings = function updateSettings (changes) {
        var newValue
        var key

        for (key in changes) {
            if (!settingsMap[key]) {
                eventQueue.trigger('Builder/settings/unknownSetting', [key])

                return false
            }

            newValue = changes[key]

            if (angular.equals(settings[key], newValue)) {
                continue
            }

            settings[key] = newValue
        }

        buildingOrderLimit = getSequenceLimit(changes.buildingPreset)
        Lockr.set('builder-settings', settings)

        return true
    }

    var getSettings = function getSettings () {
        return settings
    }

    var start = function start () {
        running = true
        intervalCheckId = setInterval(analyseVillages, 60000 / ANALYSES_PER_MINUTE)
        ready(analyseVillages, ['all_villages_ready'])
        eventQueue.trigger('Builder/start')
    }

    var stop = function stop () {
        running = false
        clearInterval(intervalCheckId)
        eventQueue.trigger('Builder/stop')
    }

    var isInitialized = function isInitialized () {
        return initialized
    }

    var isRunning = function isRunning () {
        return running
    }

    var getBuildLog = function () {
        return buildLog
    }

    var clearLogs = function () {
        buildLog = []
        Lockr.set('builder-log', buildLog)
        eventQueue.trigger('Builder/clearLogs')
    }

    return {
        init: init,
        start: start,
        stop: stop,
        updateSettings: updateSettings,
        isRunning: isRunning,
        isInitialized: isInitialized,
        settingsMap: settingsMap,
        getSettings: getSettings,
        getBuildLog: getBuildLog,
        clearLogs: clearLogs,
        version: '1.0.0'
    }
})

require([
    'two/ready',
    'two/builder',
    'two/builder/ui'
], function (
    ready,
    Builder
) {
    if (Builder.isInitialized()) {
        return false
    }

    ready(function () {
        Builder.init()
        Builder.interface()
    })
})

define('two/builder/ui', [
    'two/builder',
    'two/locale',
    'two/ui',
    'two/FrontButton',
    'two/eventQueue',
    'two/utils',
    'ejs',
    'conf/buildingTypes',
    'helper/time',
    'two/ready'
], function (
    Builder,
    Locale,
    Interface,
    FrontButton,
    eventQueue,
    utils,
    ejs,
    BUILDING_TYPES,
    $timeHelper,
    ready
) {
    var ui
    var opener
    var groups
    var $window
    var $buildingOrder
    var $groupVillages
    var $buildingPresets
    var $settings
    var $save
    var $switch
    var $buildLog
    var $noBuilds
    var $clearLogs
    var disabled
    var ordenedBuildings = [
        BUILDING_TYPES.HEADQUARTER,
        BUILDING_TYPES.TIMBER_CAMP,
        BUILDING_TYPES.CLAY_PIT,
        BUILDING_TYPES.IRON_MINE,
        BUILDING_TYPES.FARM,
        BUILDING_TYPES.WAREHOUSE,
        BUILDING_TYPES.CHURCH,
        BUILDING_TYPES.CHAPEL,
        BUILDING_TYPES.RALLY_POINT,
        BUILDING_TYPES.BARRACKS,
        BUILDING_TYPES.STATUE,
        BUILDING_TYPES.HOSPITAL,
        BUILDING_TYPES.WALL,
        BUILDING_TYPES.MARKET,
        BUILDING_TYPES.TAVERN,
        BUILDING_TYPES.ACADEMY,
        BUILDING_TYPES.PRECEPTORY
    ]

    var init = function () {
        groups = modelDataService.getGroupList().getGroups()
        disabled = Locale('builder', 'general.disabled')

        ui = new Interface('BuilderQueue', {
            activeTab: 'settings',
            template: '<div class="win-content message-list-wrapper searchable-list ng-scope"><header class="win-head"><h2><#= locale("builder", "title") #> <span class="small">v<#= version #></span></h2><ul class="list-btn"><li><a href="#" class="twOverflow-close size-34x34 btn-red icon-26x26-close"></a></li></ul></header><div class="tabs tabs-bg"><div class="tabs-two-col"><div class="tab" tab="settings"><div class="tab-inner"><div><a href="#" class="btn-icon btn-orange"><#= locale("common", "settings") #></a></div></div></div><div class="tab" tab="log"><div class="tab-inner"><div><a href="#" class="btn-icon btn-orange"><#= locale("common", "logs") #></a></div></div></div></div></div><div class="win-main"><div class="box-paper footer has-footer-upper twOverflow-content-settings"><p class="center">BuilderQueue is in experimental mode at the moment. You can\'t create custom buildings order. Any bug or suggestion please send an email to <i>mafrazzrafael@gmail.com</i></p><form class="settings"><h5 class="twx-section collapse"><#= locale("builder", "settings") #></h5><table class="tbl-border-light tbl-striped"><colgroup><col width="50%"><col></colgroup><tbody><tr><td><span class="ff-cell-fix"><#= locale("builder", "settings.groupVillages") #></span></td><td><select data-setting="groupVillages" class="groupVillages"></select></td></tr><tr><td><span class="ff-cell-fix"><#= locale("builder", "settings.buildingPreset") #></span></td><td><select data-setting="buildingPreset" class="buildingPreset"></select></td></tr></tbody></table><h5 class="twx-section collapse"><#= locale("builder", "settings.buildingsOrderFinal") #></h5><table class="tbl-border-light header-center"><colgroup><col width="10%"><col width="50%"><col></colgroup><thead><tr><th colspan="2"><#= locale("common", "building") #></th><th><#= locale("common", "level") #></th></tr></thead><tbody class="buildingOrderFinal"></tbody></table><h5 class="twx-section collapse"><#= locale("builder", "settings.buildingsOrder") #></h5><table class="tbl-border-light header-center"><colgroup><col width="10%"><col width="24%"><col width="9%"><col width="15%"><col></colgroup><thead><tr><th colspan="2"><#= locale("common", "building") #></th><th><#= locale("common", "level") #></th><th><#= locale("common", "duration") #></th><th><#= locale("common", "costs") #></th></tr></thead><tbody class="buildingOrder"></tbody></table></form></div><div class="box-paper footer has-footer-upper twOverflow-content-log"><table class="tbl-border-light tbl-striped header-center"><colgroup><col width="40%"><col width="30%"><col width="5%"><col width="25%"><col></colgroup><thead><tr><th><#= locale("common", "village") #></th><th><#= locale("common", "building") #></th><th><#= locale("common", "level") #></th><th><#= locale("common", "started") #></th></tr></thead><tbody class="buildLog"><tr class="noBuilds"><td colspan="4"><#= locale("builder", "logs.noBuilds") #></td></tr></tbody></table></div></div><footer class="win-foot"><ul class="list-btn list-center buttons"><li class="twOverflow-button-settings"><a class="btn-orange btn-border save"><#= locale("common", "save") #></a></li><li class="twOverflow-button-log"><a class="btn-orange btn-border clearLogs"><#= locale("builder", "logs.clear") #></a></li><li><a class="btn-green btn-border switch"><#= locale("common", "start") #></a></li></ul></footer></div>',
            replaces: {
                locale: Locale,
                version: '1.0.0'
            },
            css: '#BuilderQueue .buildingOrder td,#BuilderQueue .buildingOrderFinal td{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAYAAAAcaxDBAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAl7SURBVHjatF3bcRtJDIRYigLhnGNRAnYcSsCORekgDd3HmazdWfQDQx6rVJKopbiDwaPRwIBv39/f8efXj4z5oyIiyfPo7+tr2XXuezmvmd6XfHx8ftUqu9vxiY/PryJvdPwe5I1T/D0OC4tm0ev7HgVx/Apz8QWEu/6vy3rv8kBy+fPrRx7/9vH5VW93De2kvbtzYAGrMNPU3G4TkfYhRUjz+Ysmr3K5/47k9fb75z+thh4uVsJcTUkttgzBMjMtIKAUG5LGxrbCZMq2yuyG/MHhwhRuQAk9m9+z0bjO5FO4iBBuZb0+m98ts3cfb2tQArvhap9rqlMXwqwhhIXE4H5P93kX5ioPprHv7oXgJpgZdotT2p7CxyGNLaCRDpqAroLJArjH/6L8x+dXHYV5uFgtLIBZ1YYbCKDRCGlkI2B232m4h8662mh/l9Uqs1un0oaWFoAgAQRbQ7Mu4O+CQCwltGq+l2FVFxR0/L762JsRkKY33gWgFILoNKPbjBIuxkElnYl3LuKkeR3m7H6+rWq7CLeAOQcwvyI3y8w5wSYkCXBhWAl73y4OUPDeaeTFh65SXl7kLt7JTlgmpCBREu0qAJNK+N4kSUehQI3c411ut+Mf0A4QcwyirUGuL+JCigi/M+0E0V8BeIRXE0X0uwWzaP/O1HcQFdfFFADjRYSosGMO09NdAgUKtZPNGuXffv/8B+arG0C8jEU5P09BfYSXSanUdMRdtGwTcsTDaL5qUhlQC+X2Cqa5llPGfUhczFJPCJsaQB/CjxXxdQ7wT1O7WNBJkkQkyYpSwDVq0uv3VUMfJg986NS8HBOeUHe7VKFL5RULZB+fX1ZMOQr37fv7+5INEIJEEcJpCnsiTCUgRcXtEC5t3HC4jtsdLnUpFjGXAiDcWTxyGbXhtx334frl7PjQo4l3rNP6/Sacbw0dPFtc5+MYS4TglZsETAialgY8Khsy8dVNQj602ZEJF8rM2SUyXgHTJhCtUIRnbP0lKJlVz3oC700wZgyE6N5Dme6Irm9VtI7u/PPrR55qSgZj72YXDsNfgovcRQKqZqWCo8WorS7yLuSLQE2TmmqvW6hTG+BG/0nJhZr/avYq0r8fVRiA2hr6qtxg6FU0TuN/VBPskliBw+AHo+1agSJpN+lnGWRtbmi6WuBOwS2Hmtheq6i7jvZ8N5mmXUIjBoJmOT2j26YcQ5oW0WomEvL9uvehMAOYVGz6Obferjo8WJROI8NqrcyFTUch3xiZGrz02pElaWqmYqQcd4NMPA1rSUGYnEh3ZcVtCaSj9A3qLAPXZmrAwjuMVQnSOYDmuVovg04HldbnIWz6q8bhMtomuJ6Sx4r4rf/hXmxmqSVHBA+YIv9V+b3K013TdEnoMghsVe96vAaVihmMuolaMyNGknCJzLzToN9S0IIVXj2JUYqsqJjIpFU33g2p8UFDp06/q82rlLPTvgJCD4I6UNBjGw/hXEe8d4nQqdEBUfwgcDhtNSqKqoqASgIm0XyanRWL6F07zkqS3FZ40Ki5AtIMDSCf5kAm9L9Ve7qqi4WxuckC0FqfP3bcXFrCQSuOXb8eECJhMFiv4k5dBovynU4J5G14CmRSF7L8lAmPXnFPE/pPUnfosIfDh06Oz0xw4rTJwWG7HCZ+q7rq9NvTTMnwY06Hcg59JYvwChKxQJYCLbRFRIQ1uwB+asUxsoFd4neivU5D1zNuZztDYia+BvJ3wYWqHF5pJcKLDo2mtB5tAGoJckshVsMYIkluaEcMhjqJvyqhParMrNxFCU0uAzapDmaoYAy7n1pxXlSc67RIIYBnCexnSJFS2ZQbkB5BiVD7zpEUtutpanYOUlCXZOkSkxL3c0q3UXrJAtMN9Y8vQp40KuSGKaLNy9B98IjEcTGwZL+6Ux/oOWXyYZi4W0ufNm+5Wdnu/51kUyGwepxST+RsD2Vkh1yYdrq9AtK4TQux8X718flFkU9H66lGh3hywY52s/dwnmPtiIoMiVfh1ruG3pDEFyfswKMaQhQ3rQzDMliwcRswLgcj2OmPzs+egtLK6y1ZkuqljNCFOpXCIkGtXwglKO0sApPooS/SMn+FTaosCqIpgiNuswJqlUmRCLidKUm4AHSiDmp9J1TUunRjjjbw4aogUKUETk2TPc8B096dRlYaiPzwqVFsLQsRIv7MNoELVTbT4UQkeDU9QWl1CDPO8LtWSihLxN8OZlVDWpVRlZFXgbiwhJkiO6fZ+bqKeZ+nU1gcNac5h2gfGiqimNtK6LBFJYLYpB9+B7YFybwubmTVzuOwBkR3XnJ5NasIaAej0ZDLKIH9MvYnQigiOgSLDw8lqH6n01nPhlV5toThzGuaENIT9zLtBJTA3irSPZnLT4hal+zdOa/0bG5Phd/5Tto5Quh9x19N60YJoq0TyYNAtimnoCBUa9JHk+9q886hhWdIEec69/BBvFjzXnas+/i7w9grTdwlInaZJqdS8Arqj7JNKCV9aCiQepCgssPOuHPv3OEALmMV8eToS0K+nx7vBrBnMKNIlhIig1JR350EpkyfrcMWsorup0FYIqVS0xdQcSs3TTFFMCxBzITx+qewbReMHsDe6MxltSXkBhBFloCa6wSdgjpkGusmBRW68zlW4XXA/nEKBI0hM3J2NoqSmXoA03dOkaCJt4i2Y+f0FaM1Mns6+26A4YrQZ6xCybCg4gUSMEVhBskU7ov2giIhP2pKx3ZG0NM0zVp2T3Q88yhSTXDmPdP7GowBPQelJvGfHHINYrbO+CHmU1nWpNwQ00y6RocDXQV/GYQ12Y1NAmL36PW0FYhNkmCVU2mRCNRfGh1MAmAnVXQFqg4vTBprkfuZnrkfPdoxQwNqTVFfrxiNMdWmqc9+irZbla+dfTek73Z39ZVBaceKQvGzJq15DkpdDg+ggnOY1aXgdoSvJt6qEURtZZNlgd0IUPXzTiuOOzboVf1KLs2222TmfgqEJEkuOBT5hanPGTJHyPeG8NnTsUQqKLbv3ckC9dzDMUOHHYjwZx9N6LGJZrMPAdiBWY4bG318BQT2DcBPkqOz1FMxRmh6uPJzkyqBO3ITkTKwDEKP1XSp5/JPXN/kks+Tj5vYLlMYvlIB/tO4S3TEe9XcE2NP8GiIgOQSE8/2hO4Q0k7O77ojGWNOHwxgfFgVm1SbBkk8WXCErop2AUVNI3d6Ri+HFhiVd6opGQNZJ0FhR+scBLELpSYYmX5ijcuJ/jsA5u4AhqNud/gAAAAASUVORK5CYII=") #d1ad86}#BuilderQueue .buildingOrder tr.reached td,#BuilderQueue .buildingOrderFinal tr.reached td{background-color:#b9af7e}#BuilderQueue .buildingOrder tr.progress td,#BuilderQueue .buildingOrderFinal tr.progress td{background-color:#af9d57}#BuilderQueue input[type="text"],#BuilderQueue input[type="number"],#BuilderQueue select{color:#000;min-width:70%}#BuilderQueue .settings .helper{font-weight:bold;vertical-align:-1px;font-family:helvetica;color:rgba(0,0,0,0.3)}#BuilderQueue .settings .helper:hover{color:#000}#BuilderQueue .settings .custom-select{width:200px}#BuilderQueue .settings td{text-align:center}#BuilderQueue .buildLog td{text-align:center}#BuilderQueue .buildLog .village:hover{color:#fff;text-shadow:0 1px 0 #000}#BuilderQueue table.header-center th{text-align:center}#BuilderQueue .noBuilds td{height:26px;text-align:center}#BuilderQueue .force-26to20{transform:scale(.8);width:20px;height:20px}'
        })

        opener = new FrontButton('Builder', {
            classHover: false,
            classBlur: false,
            onClick: function () {
                ui.openWindow()
                updateReachedLevelItems()
            }
        })

        $window = $(ui.$window)
        $buildingOrder = $window.find('.buildingOrder')
        $buildingOrderFinal = $window.find('.buildingOrderFinal')
        $groupVillages = $window.find('.groupVillages')
        $buildingPresets = $window.find('.buildingPreset')
        $settings = $window.find('.settings')
        $save = $window.find('.save')
        $switch = $window.find('.switch')
        $buildLog = $window.find('.buildLog')
        $noBuilds = $window.find('.noBuilds')
        $clearLogs = $window.find('.clearLogs')

        populateSettings()
        updateGroupVillages()
        updateBuildingPresets()
        populateLog()
        bindEvents()

        return ui
    }

    var bindEvents = function () {
        $buildingPresets.on('selectSelected', function () {
            populateBuildingOrder(this.dataset.value)
            populateBuildingOrderFinal(this.dataset.value)
            updateReachedLevelItems()
        })

        $save.on('click', function (event) {
            saveSettings()
        })

        $switch.on('click', function (event) {
            if (Builder.isRunning()) {
                Builder.stop()
            } else {
                Builder.start()
            }
        })

        $clearLogs.on('click', function (event) {
            Builder.clearLogs()
        })

        eventQueue.bind('Builder/start', function () {
            $switch.html(Locale('common', 'stop'))
            $switch.removeClass('btn-green').addClass('btn-red')
            opener.$elem.removeClass('btn-green').addClass('btn-red')
            utils.emitNotif('success', Locale('builder', 'general.started'))
        })

        eventQueue.bind('Builder/stop', function () {
            $switch.html(Locale('common', 'start'))
            $switch.removeClass('btn-red').addClass('btn-green')
            opener.$elem.removeClass('btn-red').addClass('btn-green')
            utils.emitNotif('success', Locale('builder', 'general.stopped'))
        })

        eventQueue.bind('Builder/jobStarted', insertLog)
        eventQueue.bind('Builder/clearLogs', clearLogs)

        rootScope.$on(eventTypeProvider.GROUPS_UPDATED, function () {
            updateGroupVillages()
        })

        rootScope.$on(eventTypeProvider.VILLAGE_SELECTED_CHANGED, function () {
            if (ui.isVisible()) {
                updateReachedLevelItems()
            }
        })

        rootScope.$on(eventTypeProvider.BUILDING_UPGRADING, updateLevels)
        rootScope.$on(eventTypeProvider.BUILDING_LEVEL_CHANGED, updateLevels)
        rootScope.$on(eventTypeProvider.BUILDING_TEARING_DOWN, updateLevels)
        rootScope.$on(eventTypeProvider.VILLAGE_BUILDING_QUEUE_CHANGED, updateLevels)
    }

    /**
     * Update/populate the list of building presets on settings tab.
     */
    var updateBuildingPresets = function updateBuildingPresets () {
        var $selectedOption = $buildingPresets.find('.custom-select-handler').html('')
        var $data = $buildingPresets.find('.custom-select-data').html('')
        var settings = Builder.getSettings()

        for (var presetName in settings.buildingOrder) {
            var selected = settings.buildingPreset == presetName

            if (selected) {
                $selectedOption.html(presetName)
                $buildingPresets[0].dataset.name = presetName
                $buildingPresets[0].dataset.value = presetName
            }

            appendSelectData($data, {
                name: presetName,
                value: presetName
            })

            $buildingPresets.append($data)
        }
    }

    /**
     * Update/populate the list of groups on settings tab.
     */
    var updateGroupVillages = function updateGroupVillages () {
        var $selectedOption = $groupVillages.find('.custom-select-handler').html('')
        var $data = $groupVillages.find('.custom-select-data').html('')
        var settings = Builder.getSettings()

        appendDisabledOption($data, '')

        for (var id in groups) {
            var name = groups[id].name
            var selected = settings.groupVillages == id

            if (settings.groupVillages === '') {
                $selectedOption.html(disabled)
                $groupVillages[0].dataset.name = disabled
                $groupVillages[0].dataset.value = ''
            } else if (settings.groupVillages == id) {
                $selectedOption.html(name)
                $groupVillages[0].dataset.name = name
                $groupVillages[0].dataset.value = id
            }

            appendSelectData($data, {
                name: name,
                value: id,
                icon: groups[id].icon
            })

            $groupVillages.append($data)
        }

        if (!settings.groupVillages) {
            $selectedOption.html(disabled)
        }
    }

    /**
     * Gera uma opção "desativada" padrão em um custom-select
     *
     * @param  {jqLite} $data - Elemento que armazenada o <span> com dataset.
     * @param {String=} _disabledValue - Valor da opção "desativada".
     */
    var appendDisabledOption = function appendDisabledOption ($data, _disabledValue) {
        var dataElem = document.createElement('span')
        dataElem.dataset.name = disabled
        dataElem.dataset.value = _disabledValue || ''

        $data.append(dataElem)
    }

    /**
     * Popula o dataset um elemento <span>
     *
     * @param  {jqLite} $data - Elemento que armazenada o <span> com dataset.
     * @param  {[type]} data - Dados a serem adicionados no dataset.
     */
    var appendSelectData = function appendSelectData ($data, data) {
        var dataElem = document.createElement('span')

        for (var key in data) {
            dataElem.dataset[key] = data[key]
        }

        $data.append(dataElem)
    }

    /**
     * Loop em todas configurações do BuilderQueue
     *
     * @param {Function} callback
     */
    var eachSetting = function eachSetting (callback) {
        $window.find('[data-setting]').forEach(function ($input) {
            var settingId = $input.dataset.setting

            callback($input, settingId)
        })
    }

    var saveSettings = function saveSettings () {
        var newSettings = {}

        eachSetting(function ($input, settingId) {
            var inputType = Builder.settingsMap[settingId].inputType

            switch (inputType) {
            case 'text':
                newSettings[settingId] = $input.type === 'number'
                    ? parseInt($input.value, 10)
                    : $input.value

                break
            case 'select':
                newSettings[settingId] = $input.dataset.value

                break
            case 'checkbox':
                newSettings[settingId] = $input.checked

                break
            }
        })

        if (Builder.updateSettings(newSettings)) {
            utils.emitNotif('success', Locale('builder', 'settings.saved'))

            return true
        }

        return false
    }

    /**
     * Insere as configurações na interface.
     */
    var populateSettings = function populateSettings () {
        var settings = Builder.getSettings()

        eachSetting(function ($input, settingId) {
            var inputType = Builder.settingsMap[settingId].inputType

            switch (inputType) {
            case 'text':
                $input.value = settings[settingId]

                break
            case 'select':
                $input.dataset.value = settings[settingId]

                break
            case 'checkbox':
                if (settings[settingId]) {
                    $input.checked = true
                    $input.parentElement.classList.add('icon-26x26-checkbox-checked')
                }

                break
            }
        })

        ready(function () {
            populateBuildingOrder()
            populateBuildingOrderFinal()
            updateReachedLevelItems()
        }, ['initial_village'])
    }

    /**
     * @param {String=} preset Use a specific building order preset
     *   instead of the selected one.
     */
    var populateBuildingOrder = function populateBuildingOrder (_preset) {
        var buildingOrder = {}
        var settings = Builder.getSettings()
        var presetBuildings = settings.buildingOrder[_preset || settings.buildingPreset]
        var buildingData = modelDataService.getGameData().getBuildings()

        for (var buildingName in BUILDING_TYPES) {
            buildingOrder[BUILDING_TYPES[buildingName]] = 0
        }

        $buildingOrder.html('')

        presetBuildings.forEach(function (building) {
            var level = ++buildingOrder[building]
            var $item = document.createElement('tr')
            var price = buildingData[building].individual_level_costs[level]
            
            $item.innerHTML = ejs.render('<td><span class="building-icon icon-20x20-building-<#= building #>"></span></td><td><#= locale("common", building) #></td><td><#= level #></td><td><#= duration #></td><td><span class="icon-26x26-resource-wood force-26to20"></span> <#= wood #> <span class="icon-26x26-resource-clay force-26to20"></span> <#= clay #> <span class="icon-26x26-resource-iron force-26to20"></span> <#= iron #> </td>', {
                locale: Locale,
                building: building,
                level: level,
                duration: $timeHelper.readableSeconds(price.build_time),
                wood: price.wood,
                clay: price.clay,
                iron: price.iron
            })

            $item.dataset.building = building
            $item.dataset.level = level

            $buildingOrder.append($item)
        })

        ui.recalcScrollbar()
    }

    /**
     * @param {String=} preset Use a specific building order preset
     *   instead of the selected one.
     */
    var populateBuildingOrderFinal = function populateBuildingOrderFinal (_preset) {
        var buildingOrderFinal = {}
        var settings = Builder.getSettings()
        var presetBuildings = settings.buildingOrder[_preset || settings.buildingPreset]        

        $buildingOrderFinal.html('')

        presetBuildings.forEach(function (building) {
            buildingOrderFinal[building] = buildingOrderFinal[building] || 0
            ++buildingOrderFinal[building]
        })

        ordenedBuildings.forEach(function (building) {
            if (building in buildingOrderFinal) {
                var $item = document.createElement('tr')
                var level = buildingOrderFinal[building]
            
                $item.innerHTML = ejs.render('<td><span class="building-icon icon-20x20-building-<#= building #>"></span></td><td><#= locale("common", building) #></td><td><#= level #></td>', {
                    locale: Locale,
                    building: building,
                    level: level
                })

                $item.dataset.building = building
                $item.dataset.level = level

                $buildingOrderFinal.append($item)
            }
        })

        ui.recalcScrollbar()
    }

    /**
     * Check if the level building was already reached in the current selected village.
     *
     * @param {String} building Building name to check
     * @param {Number} level Level of the building
     * @return {Boolean}
     */
    var buildingLevelReached = function (building, level) {
        var buildingData = modelDataService.getSelectedVillage().getBuildingData()
        return buildingData.getBuildingLevel(building) >= level
    }

    /**
     * Check if the building is currently in build progress on the current selected village.
     *
     * @param {String} building Building name to check
     * @param {Number} level Level of the building
     * @return {Boolean}
     */
    var buildingLevelProgress = function (building, level) {
        var queue = modelDataService.getSelectedVillage().getBuildingQueue().getQueue()
        var progress = false

        queue.some(function (job) {
            if (job.building === building && job.level === level) {
                return progress = true
            }
        })

        return progress
    }

    /**
     * Update the building reached level element states.
     */
    var updateReachedLevelItems = function () {
        $buildingOrder.find('tr').forEach(function ($item) {
            var building = $item.dataset.building
            var level = parseInt($item.dataset.level, 10)
            var _class = ''
            
            if (buildingLevelReached(building, level)) {
                _class = 'reached'
            } else if (buildingLevelProgress(building, level)) {
                _class = 'progress'
            }

            $item.className = _class
        })

        $buildingOrderFinal.find('tr').forEach(function ($item) {
            var reached = buildingLevelReached($item.dataset.building, $item.dataset.level)
            $item.className = reached ? 'reached' : ''
        })
    }

    /**
     * Update the reached building levels if the selected village
     * changed some level.
     *
     * @param {Object} event rootScope.$on event info
     * @param {Object} data Event data about the chages.
     */
    var updateLevels = function (event, data) {
        var id = data.village_id || data.id

        if (ui.isVisible() && modelDataService.getSelectedVillage().getId() === id) {
            updateReachedLevelItems()
        }
    }

    /**
     * 
     *
     * @param {Object<x,y,name,id>} origin Village where the build was started.
     * @param {String} building
     * @param {Number} level
     * @param {Number} startDate
     */
    var insertLog = function (origin, building, level, startDate) {
        $noBuilds.hide()

        var $log = document.createElement('tr')

        $log.innerHTML = ejs.render('<td class="village"><#= village #></td><td><span class="building-icon icon-20x20-building-<#= building #>"></span> <#= locale("common", building) #></td><td><#= level #></td><td><#= started #></td>', {
            locale: Locale,
            village: utils.genVillageLabel(origin),
            building: building,
            level: level,
            started: utils.formatDate(startDate)
        })

        $log.querySelector('.village').addEventListener('click', function () {
            windowDisplayService.openVillageInfo(origin.id)
        })

        $buildLog.prepend($log)
        ui.recalcScrollbar()
    }

    var clearLogs = function () {
        $buildLog.find('tr:not(.noBuilds)').remove()
        $noBuilds.css('display', '')
    }

    var populateLog = function () {
        Builder.getBuildLog().forEach(function (log) {
            insertLog.apply(this, log)
        })
    }

    Builder.interface = function () {
        Builder.interface = init()
    }
})

define('two/queue', [
    'two/locale',
    'two/utils',
    'two/eventQueue',
    'helper/time',
    'helper/math',
    'struct/MapData',
    'conf/conf',
    'Lockr'
], function (
    Locale,
    utils,
    eventQueue,
    $timeHelper,
    $math,
    $mapData,
    $conf,
    Lockr
) {
    /**
     * Taxa de verificação se há comandos a serem enviados por segundo.
     *
     * @type {Number}
     */
    var CHECKS_PER_SECOND = 10

    /**
     * @type {Object}
     */
    var EVENT_CODES = {
        NOT_OWN_VILLAGE: 'notOwnVillage',
        NOT_ENOUGH_UNITS: 'notEnoughUnits',
        TIME_LIMIT: 'timeLimit',
        COMMAND_REMOVED: 'commandRemoved',
        COMMAND_SENT: 'commandSent'
    }

    /**
     * @type {Object}
     */
    var ERROR_CODES = {
        INVALID_ORIGIN: 'invalidOrigin',
        INVALID_TARGET: 'invalidTarget'
    }

    /**
     * Lista de comandos em espera (ordenado por tempo restante).
     *
     * @type {Array}
     */
    var waitingCommands = []

    /**
     * Lista de comandos em espera.
     *
     * @type {Object}
     */
    var waitingCommandsObject = {}

    /**
     * Lista de comandos que já foram enviados.
     *
     * @type {Array}
     */
    var sentCommands = []

    /**
     * Lista de comandos que se expiraram.
     *
     * @type {Array}
     */
    var expiredCommands = []

    /**
     * Indica se o CommandQueue está ativado.
     *
     * @type {Boolean}
     */
    var running = false

    /**
     * Dados do jogador.
     *
     * @type {Object}
     */
    var $player

    /**
     * Tipos de comandos usados pelo jogo (tipo que usam tropas apenas).
     *
     * @type {Array}
     */
    var commandTypes = ['attack', 'support', 'relocate']

    /**
     * Lista de filtros para comandos.
     *
     * @type {Object}
     */
    var commandFilters = {
        selectedVillage: function (command) {
            return command.origin.id === modelDataService.getSelectedVillage().getId()
        },
        barbarianTarget: function (command) {
            return !command.target.character_id
        },
        allowedTypes: function (command, options) {
            return options.allowedTypes[command.type]
        },
        attack: function (command) {
            return command.type !== 'attack'
        },
        support: function (command) {
            return command.type !== 'support'
        },
        relocate: function (command) {
            return command.type !== 'relocate'
        },
        textMatch: function (command, options) {
            var show = true
            var keywords = options.textMatch.toLowerCase().split(/\W/)

            var searchString = [
                command.origin.name,
                command.originCoords,
                command.originCoords,
                command.origin.character_name || '',
                command.target.name,
                command.targetCoords,
                command.target.character_name || '',
                command.target.tribe_name || '',
                command.target.tribe_tag || ''
            ]

            searchString = searchString.join('').toLowerCase()

            keywords.some(function (keyword) {
                if (keyword.length && !searchString.includes(keyword)) {
                    show = false
                    return true
                }
            })

            return show
        }
    }

    /**
     * Diferença entre o timezone local e do servidor.
     *
     * @type {Number}
     */
    var timeOffset

    /**
     * Verifica se tem um intervalo entre a horario do envio e o horario do jogo.
     *
     * @param  {Number} - sendTime
     * @return {Boolean}
     */
    var isTimeToSend = function (sendTime) {
        return sendTime < ($timeHelper.gameTime() + timeOffset)
    }

    /**
     * Remove os zeros das unidades passadas pelo jogador.
     * A razão de remover é por que o próprio não os envia
     * quando os comandos são enviados manualmente, então
     * caso seja enviado as unidades com valores zero poderia
     * ser uma forma de detectar os comandos automáticos.
     *
     * @param  {Object} units - Unidades a serem analisadas
     * @return {Object} Objeto sem nenhum valor zero
     */
    var cleanZeroUnits = function (units) {
        var cleanUnits = {}

        for (var unit in units) {
            var amount = units[unit]

            if (amount === '*' || amount !== 0) {
                cleanUnits[unit] = amount
            }
        }

        return cleanUnits
    }

    /**
     * Ordenada a lista de comandos em espera por tempo de saída.
     */
    var sortWaitingQueue = function () {
        waitingCommands = waitingCommands.sort(function (a, b) {
            return a.sendTime - b.sendTime
        })
    }

    /**
     * Adiciona um comando a lista ordenada de comandos em espera.
     *
     * @param  {Object} command - Comando a ser adicionado
     */
    var pushWaitingCommand = function (command) {
        waitingCommands.push(command)
    }

    /**
     * Adiciona um comando a lista de comandos em espera.
     *
     * @param  {Object} command - Comando a ser adicionado
     */
    var pushCommandObject = function (command) {
        waitingCommandsObject[command.id] = command
    }

    /**
     * Adiciona um comando a lista de comandos enviados.
     *
     * @param  {Object} command - Comando a ser adicionado
     */
    var pushSentCommand = function (command) {
        sentCommands.push(command)
    }

    /**
     * Adiciona um comando a lista de comandos expirados.
     *
     * @param  {Object} command - Comando a ser adicionado
     */
    var pushExpiredCommand = function (command) {
        expiredCommands.push(command)
    }

    /**
     * Salva a lista de comandos em espera no localStorage.
     */
    var storeWaitingQueue = function () {
        Lockr.set('queue-commands', waitingCommands)
    }

    /**
     * Salva a lista de comandos enviados no localStorage.
     */
    var storeSentQueue = function () {
        Lockr.set('queue-sent', sentCommands)
    }

    /**
     * Salva a lista de comandos expirados no localStorage.
     */
    var storeExpiredQueue = function () {
        Lockr.set('queue-expired', expiredCommands)
    }

    /**
     * Carrega a lista de comandos em espera salvos no localStorage
     * e os adiciona ao CommandQueue;
     * Commandos que já deveriam ter saído são movidos para a lista de
     * expirados.
     */
    var loadStoredCommands = function () {
        var storedQueue = Lockr.get('queue-commands', [], true)

        if (storedQueue.length) {
            for (var i = 0; i < storedQueue.length; i++) {
                var command = storedQueue[i]

                if ($timeHelper.gameTime() > command.sendTime) {
                    Queue.expireCommand(command, EVENT_CODES.TIME_LIMIT)
                } else {
                    pushWaitingCommand(command)
                    pushCommandObject(command)
                }
            }
        }
    }

    /**
     * Transforma valores curingas das unidades.
     * - Asteriscos são convetidos para o núrero total de unidades
     *    que se encontram na aldeia.
     * - Números negativos são convertidos núrero total de unidades
     *    menos a quantidade específicada.
     *
     * @param  {Object} command - Dados do comando
     * @return {Object|Number} Parsed units or error code.
     */
    var parseDynamicUnits = function (command) {
        var playerVillages = modelDataService.getVillages()
        var village = playerVillages[command.origin.id]

        if (!village) {
            return EVENT_CODES.NOT_OWN_VILLAGE
        }

        var villageUnits = village.unitInfo.units
        var parsedUnits = {}

        for (var unit in command.units) {
            var amount = command.units[unit]

            if (amount === '*') {
                amount = villageUnits[unit].available

                if (amount === 0) {
                    continue
                }
            } else if (amount < 0) {
                amount = villageUnits[unit].available - Math.abs(amount)

                if (amount < 0) {
                    return EVENT_CODES.NOT_ENOUGH_UNITS
                }
            } else if (amount > 0) {
                if (amount > villageUnits[unit].available) {
                    return EVENT_CODES.NOT_ENOUGH_UNITS
                }
            }

            parsedUnits[unit] = amount
        }

        if (angular.equals({}, parsedUnits)) {
            return EVENT_CODES.NOT_ENOUGH_UNITS
        }

        return parsedUnits
    }

    /**
     * Inicia a verificação de comandos a serem enviados.
     */
    var listenCommands = function () {
        setInterval(function () {
            if (!waitingCommands.length) {
                return
            }

            waitingCommands.some(function (command) {
                if (isTimeToSend(command.sendTime)) {
                    if (running) {
                        Queue.sendCommand(command)
                    } else {
                        Queue.expireCommand(command, EVENT_CODES.TIME_LIMIT)
                    }
                } else {
                    return true
                }
            })
        }, 1000 / CHECKS_PER_SECOND)
    }

    /**
     * Métodos e propriedades publicas do CommandQueue.
     *
     * @type {Object}
     */
    var Queue = {}

    /**
     * Indica se o CommandQueue já foi inicializado.
     *
     * @type {Boolean}
     */
    Queue.initialized = false

    /**
     * Versão atual do CommandQueue
     *
     * @type {String}
     */
    Queue.version = '1.2.0'

    /**
     * Inicializa o CommandQueue.
     * Adiciona/expira comandos salvos em execuções anteriores.
     */
    Queue.init = function () {
        Locale.create('queue', {"en":{"title":"CommandQueue","attack":"Attack","support":"Support","relocate":"Transfer","sent":"sent","activated":"enabled","deactivated":"disabled","expired":"expired","removed":"removed","added":"added","general.clear":"Clear logs","general.nextCommand":"Next command","add.basics":"Basic information","add.origin":"Origin","add.addSelected":"Active village","add.target":"Target","add.addMapSelected":"Selected village on a map","add.arrive":"Command arrive at date","add.out":"Command leave at date","add.currentDate":"Current date","add.currentDatePlus":"Increase date in 100 milliseconds.","add.currentDateMinus":"Reduce date in 100 milliseconds.","add.travelTimes":"Unit travel time","add.date":"Date/time","add.no-village":"select a village...","add.village-search":"Village search...","add.clear":"Clear fields","add.insert-preset":"Insert preset","queue.waiting":"Waiting commands","queue.noneAdded":"No command added.","queue.sent":"Commands sent","queue.noneSent":"No command sent.","queue.expired":"Expired commands","queue.noneExpired":"No command expired.","queue.remove":"Remove command form list","queue.filters":"Filter commands","filters.selectedVillage":"Show only commands from the selected village","filters.barbarianTarget":"Show only commands with barbarian villages as target","filters.attack":"Show attacks","filters.support":"Show supports","filters.relocate":"Show transfers","filters.textMatch":"Filter by text...","command.out":"Out","command.timeLeft":"Time remaining","command.arrive":"Arrival","error.noUnitsEnough":"No units enough to send the command!","error.notOwnVillage":"The origin village is not owned by you!","error.origin":"Invalid origin village!","error.target":"Invalid target village!","error.noUnits":"No units specified!","error.invalidDate":"Invalid date","error.alreadySent":"This %{type} should have left %{date}","error.noMapSelectedVillage":"No selected village on map.","error.removeError":"Error removing command."},"pl":{"title":"Generał","attack":"Atak","support":"Wsparcie","relocate":"Przeniesienie","sent":"wysłany/e","activated":"włączony","deactivated":"wyłączony","expired":"przedawniony/e","removed":"usunięty/e","added":"dodany/e","general.clear":"Wyczyść logi","general.nextCommand":"Następny rozkaz","add.basics":"Podstawowe informacje","add.origin":"Źródło","add.addSelected":"Aktywna wioska","add.target":"Cel","add.addMapSelected":"Wybrana wioska na mapie","add.arrive":"Czas dotarcia na cel","add.out":"Czas wyjścia z  twojej wioski","add.currentDate":"Obecny czas","add.currentDatePlus":"Zwiększ czas o 100 milisekund.","add.currentDateMinus":"Zmniejsz czas o 100 milisekund.","add.travelTimes":"Czas podróży jendostek","add.date":"Czas/Data","add.no-village":"Wybierz wioskę...","add.village-search":"Znajdź wioskę...","add.clear":"wyczyść","queue.waiting":"Rozkazy","queue.noneAdded":"Brak dodanych rozkazów.","queue.sent":"Rozkazy wysłane","queue.noneSent":"Brak wysłanych rozkazów.","queue.expired":"Przedawnione rozkazy","queue.noneExpired":"Brak przedawnionych rozkazów.","queue.remove":"Usuń rozkaz z listy","queue.filters":"Filtruj rozkazy","filters.selectedVillage":"Pokaż tylko rozkazy z aktywnej wioski","filters.barbarianTarget":"Pokaż tylko rozkazy na wioski barbarzyńskie","filters.attack":"Pokaż ataki","filters.support":"Pokaż wsparcia","filters.relocate":"Pokaż przeniesienia","filters.textMatch":"Filtruj za pomocą tekstu...","command.out":"Czas wyjścia","command.timeLeft":"Pozostały czas","command.arrive":"Czas dotarcia","error.noUnitsEnough":"Brak wystarczającej liczby jednostek do wysłania rozkazu!","error.notOwnVillage":"Wioska źródłowa nie należy do ciebie!","error.origin":"Nieprawidłowa wioska źródłowa!","error.target":"Nieprawidłowa wioska cel!","error.noUnits":"Nie wybrano jednostek!","error.invalidDate":"Nieprawidłowy Czas","error.alreadySent":"Ten rozkaz %{type} powinien zostać wysłany %{date}","error.noMapSelectedVillage":"Nie zaznaczono wioski na mapie.","error.removeError":"Błąd usuwania rozkazu."},"pt":{"title":"CommandQueue","attack":"Ataque","support":"Apoio","relocate":"Transferência","sent":"enviado","activated":"ativado","deactivated":"desativado","expired":"expirado","removed":"removido","added":"adicionado","general.clear":"Limpar registros","general.nextCommand":"Próximo comando","add.basics":"Informações básicas","add.origin":"Coordenadas da origem","add.addSelected":"Aldeia ativa","add.target":"Coordenadas do alvo","add.addMapSelected":"Aldeia selecionada no mapa","add.arrive":"Data de chegada","add.out":"Data de saída","add.currentDate":"Data/hora","add.currentDatePlus":"Aumentar data em 100 milisegunds.","add.currentDateMinus":"Reduzir data em 100 milisegunds.","add.travelTimes":"Tempos de viagem","add.date":"Data","add.no-village":"selecione uma aldeia...","add.village-search":"Procurar aldeia...","add.clear":"Limpar campos","add.insert-preset":"Inserir predefinição","queue.waiting":"Comandos em espera","queue.noneAdded":"Nenhum comando adicionado.","queue.sent":"Comandos enviados","queue.noneSent":"Nenhum comando enviado.","queue.expired":"Comandos expirados","queue.noneExpired":"Nenhum comando expirado.","queue.remove":"Remover comando da lista","queue.filters":"Filtro de comandos","filters.selectedVillage":"Mostrar apenas comandos com origem da aldeia selecionada","filters.barbarianTarget":"Mostrar apenas comandos com aldeias bárbaras como alvo","filters.attack":"Mostrar ataques","filters.support":"Mostrar apoios","filters.relocate":"Mostrar transferências","filters.textMatch":"Filtrar por texto...","command.out":"Saída na data","command.timeLeft":"Tempo restante","command.arrive":"Chegada na data","error.noUnitsEnough":"Sem unidades o sulficientes para enviar o comando!","error.origin":"Aldeia de origem inválida!","error.target":"Aldeia alvo inválida!","error.noUnits":"Nenhuma unidade especificada!","error.invalidDate":"Data inválida","error.alreadySent":"Esse %{type} deveria ter saído %{date}","error.noMapSelectedVillage":"Nenhuma aldeia selecionada no mapa.","error.removeError":"Erro ao remover comando."}}, 'en')

        timeOffset = utils.getTimeOffset()
        $player = modelDataService.getSelectedCharacter()

        Queue.initialized = true

        sentCommands = Lockr.get('queue-sent', [], true)
        expiredCommands = Lockr.get('queue-expired', [], true)

        loadStoredCommands()
        listenCommands()

        window.addEventListener('beforeunload', function (event) {
            if (running && waitingCommands.length) {
                event.returnValue = true
            }
        })
    }

    /**
     * Envia um comando.
     *
     * @param {Object} command - Dados do comando que será enviado.
     */
    Queue.sendCommand = function (command) {
        var units = parseDynamicUnits(command)

        // units === EVENT_CODES.*
        if (typeof units === 'string') {
            return Queue.expireCommand(command, units)
        }

        command.units = units

        socketService.emit(routeProvider.SEND_CUSTOM_ARMY, {
            start_village: command.origin.id,
            target_village: command.target.id,
            type: command.type,
            units: command.units,
            icon: 0,
            officers: command.officers,
            catapult_target: command.catapultTarget
        })

        pushSentCommand(command)
        storeSentQueue()

        Queue.removeCommand(command, EVENT_CODES.COMMAND_SENT)
        eventQueue.trigger('Queue/command/send', [command])
    }

    /**
     * Expira um comando.
     *
     * @param {Object} command - Dados do comando que será expirado.
     * @param {Number} eventCode - Code indicating the reason of the expiration.
     */
    Queue.expireCommand = function (command, eventCode) {
        pushExpiredCommand(command)
        storeExpiredQueue()

        Queue.removeCommand(command, eventCode)
    }

    /**
     * Adiciona um comando a lista de espera.
     *
     * @param {Object} command - Dados do comando que será adicionado.
     * @param {String} command.origin - Coordenadas da aldeia de origem.
     * @param {String} command.target - Coordenadas da aldeia alvo.
     * @param {String} command.date - Data e hora que o comando deve chegar.
     * @param {String} command.dateType - Indica se o comando vai sair ou
     *   chegar na data especificada.
     * @param {Object} command.units - Unidades que serão enviados pelo comando.
     * @param {Object} command.officers - Oficiais que serão enviados pelo comando.
     * @param {String} command.type - Tipo de comando.
     * @param {String=} command.catapultTarget - Alvo da catapulta, caso o comando seja um ataque.
     */
    Queue.addCommand = function (command) {
        if (!command.origin) {
            return eventQueue.trigger('Queue/command/add/invalidOrigin', [command])
        }

        if (!command.target) {
            return eventQueue.trigger('Queue/command/add/invalidTarget', [command])
        }

        if (!utils.isValidDateTime(command.date)) {
            return eventQueue.trigger('Queue/command/add/invalidDate', [command])
        }

        if (!command.units || angular.equals(command.units, {})) {
            return eventQueue.trigger('Queue/command/add/noUnits', [command])
        }

        command.originCoords = command.origin.x + '|' + command.origin.y
        command.targetCoords = command.target.y + '|' + command.target.y

        var getOriginVillage = new Promise(function (resolve, reject) {
            Queue.getVillageByCoords(command.origin.x, command.origin.y, function (data) {
                data ? resolve(data) : reject(ERROR_CODES.INVALID_ORIGIN)
            })
        })

        var getTargetVillage = new Promise(function (resolve, reject) {
            Queue.getVillageByCoords(command.target.x, command.target.y, function (data) {
                data ? resolve(data) : reject(ERROR_CODES.INVALID_TARGET)
            })
        })

        var loadVillagesData = Promise.all([
            getOriginVillage,
            getTargetVillage
        ])

        loadVillagesData.then(function (villages) {
            command.origin = villages[0]
            command.target = villages[1]
            command.units = cleanZeroUnits(command.units)
            command.date = utils.fixDate(command.date)
            command.travelTime = Queue.getTravelTime(
                command.origin,
                command.target,
                command.units,
                command.type,
                command.officers
            )

            var inputTime = utils.getTimeFromString(command.date)

            if (command.dateType === 'arrive') {
                command.sendTime = inputTime - command.travelTime
                command.arriveTime = inputTime
            } else {
                command.sendTime = inputTime
                command.arriveTime = inputTime + command.travelTime
            }

            if (isTimeToSend(command.sendTime)) {
                return eventQueue.trigger('Queue/command/add/alreadySent', [command])
            }

            if (command.type === 'attack' && 'supporter' in command.officers) {
                delete command.officers.supporter
            }

            for (var officer in command.officers) {
                command.officers[officer] = 1
            }

            if (command.type === 'attack' && command.units.catapult) {
                command.catapultTarget = command.catapultTarget || 'headquarter'
            } else {
                command.catapultTarget = null
            }

            command.id = utils.guid()

            pushWaitingCommand(command)
            pushCommandObject(command)
            sortWaitingQueue()
            storeWaitingQueue()

            eventQueue.trigger('Queue/command/add', [command])
        })

        loadVillagesData.catch(function (errorCode) {
            switch (errorCode) {
            case ERROR_CODES.INVALID_ORIGIN:
                eventQueue.trigger('Queue/command/add/invalidOrigin', [command])
                break
            case ERROR_CODES.INVALID_TARGET:
                eventQueue.trigger('Queue/command/add/invalidTarget', [command])
                break
            }
        })
    }

    /**
     * Remove um comando da lista de espera.
     *
     * @param  {Object} command - Dados do comando a ser removido.
     * @param {Number} eventCode - Code indicating the reason of the remotion.
     *
     * @return {Boolean} If the command was successfully removed.
     */
    Queue.removeCommand = function (command, eventCode) {
        var removed = false
        delete waitingCommandsObject[command.id]

        for (var i = 0; i < waitingCommands.length; i++) {
            if (waitingCommands[i].id == command.id) {
                waitingCommands.splice(i, 1)
                storeWaitingQueue()
                removed = true

                break
            }
        }

        if (removed) {
            switch (eventCode) {
            case EVENT_CODES.TIME_LIMIT:
                eventQueue.trigger('Queue/command/send/timeLimit', [command])
                break
            case EVENT_CODES.NOT_OWN_VILLAGE:
                eventQueue.trigger('Queue/command/send/notOwnVillage', [command])
                break
            case EVENT_CODES.NOT_ENOUGH_UNITS:
                eventQueue.trigger('Queue/command/send/noUnitsEnough', [command])
                break
            case EVENT_CODES.COMMAND_REMOVED:
                eventQueue.trigger('Queue/command/remove', [command])
                break
            }

            return true
        } else {
            eventQueue.trigger('Queue/command/remove/error', [command])
            return false
        }
    }

    /**
     * Remove todos os comandos já enviados e expirados da lista
     * e do localStorage.
     */
    Queue.clearRegisters = function () {
        Lockr.set('queue-expired', [])
        Lockr.set('queue-sent', [])
        expiredCommands = []
        sentCommands = []
    }

    /**
     * Ativa o CommandQueue. Qualquer comando que chegar no horário
     * de envio, será enviado.
     */
    Queue.start = function (disableNotif) {
        running = true
        eventQueue.trigger('Queue/start', [disableNotif])
    }

    /**
     * Desativa o CommandQueue
     */
    Queue.stop = function () {
        running = false
        eventQueue.trigger('Queue/stop')
    }

    /**
     * Verifica se o CommandQueue está ativado.
     *
     * @return {Boolean}
     */
    Queue.isRunning = function () {
        return running
    }

    /**
     * Obtem lista de comandos ordenados na lista de espera.
     *
     * @return {Array}
     */
    Queue.getWaitingCommands = function () {
        return waitingCommands
    }

    /**
     * Obtem lista de comandos em espera.
     *
     * @return {Object}
     */
    Queue.getWaitingCommandsObject = function () {
        return waitingCommandsObject
    }

    /**
     * Obtem lista de comandos enviados;
     *
     * @return {Array}
     */
    Queue.getSentCommands = function () {
        return sentCommands
    }

    /**
     * Obtem lista de comandos expirados;
     *
     * @return {Array}
     */
    Queue.getExpiredCommands = function () {
        return expiredCommands
    }

    /**
     * Calcula o tempo de viagem de uma aldeia a outra
     *
     * @param {Object} origin - Objeto da aldeia origem.
     * @param {Object} target - Objeto da aldeia alvo.
     * @param {Object} units - Exercito usado no ataque como referência
     * para calcular o tempo.
     * @param {String} type - Tipo de comando (attack,support,relocate)
     * @param {Object} officers - Oficiais usados no comando (usados para efeitos)
     *
     * @return {Number} Tempo de viagem
     */
    Queue.getTravelTime = function (origin, target, units, type, officers) {
        var useEffects = false
        var targetIsBarbarian = target.character_id === null
        var targetIsSameTribe = target.character_id && target.tribe_id &&
            target.tribe_id === $player.getTribeId()

        if (type === 'attack') {
            if ('supporter' in officers) {
                delete officers.supporter
            }

            if (targetIsBarbarian) {
                useEffects = true
            }
        } else if (type === 'support') {
            if (targetIsSameTribe) {
                useEffects = true
            }

            if ('supporter' in officers) {
                useEffects = true
            }
        }

        var army = {
            units: units,
            officers: angular.copy(officers)
        }

        var travelTime = armyService.calculateTravelTime(army, {
            barbarian: targetIsBarbarian,
            ownTribe: targetIsSameTribe,
            officers: officers,
            effects: useEffects
        }, type)

        var distance = $math.actualDistance(origin, target)

        var totalTravelTime = armyService.getTravelTimeForDistance(
            army,
            travelTime,
            distance,
            type
        )

        return totalTravelTime * 1000
    }

    /**
     * Carrega os dados de uma aldeia pelas coordenadas.
     *
     * @param  {String} coords - Coordendas da aldeia.
     * @param  {Function} callback
     */
    Queue.getVillageByCoords = function (x, y, callback) {
        $mapData.loadTownDataAsync(x, y, 1, 1, callback)
    }

    /**
     * Filtra os comandos de acordo com o filtro especificado.
     *
     * @param  {String} filterId - Identificação do filtro.
     * @param {Array=} _options - Valores a serem passados para os filtros.
     * @param {Array=} _commandsDeepFilter - Usa os comandos passados
     * pelo parâmetro ao invés da lista de comandos completa.
     * @return {Array} Comandos filtrados.
     */
    Queue.filterCommands = function (filterId, _options, _commandsDeepFilter) {
        var filterHandler = commandFilters[filterId]
        var commands = _commandsDeepFilter || waitingCommands

        return commands.filter(function (command) {
            return filterHandler(command, _options)
        })
    }

    return Queue
})

define('two/queue/analytics', [
    'two/queue',
    'two/eventQueue'
], function (Queue, eventQueue) {
    Queue.analytics = function () {
        ga('create', 'UA-92130203-5', 'auto', 'CommandQueue')

        var player = modelDataService.getPlayer()
        var character = player.getSelectedCharacter()
        var data = []

        data.push(character.getName())
        data.push(character.getId())
        data.push(character.getWorldId())

        eventQueue.bind('Queue/send', function (command) {
            ga('CommandQueue.send', 'event', 'commands', command.type, data.join('~'))
        })

        eventQueue.bind('Queue/expired', function () {
            ga('CommandQueue.send', 'event', 'commands', 'expired', data.join('~'))
        })
    }
})

require([
    'two/ready',
    'two/queue',
    'two/queue/ui',
    'two/queue/analytics'
], function (
    ready,
    Queue
) {
    if (Queue.initialized) {
        return false
    }

    ready(function () {
        Queue.init()
        Queue.interface()
        Queue.analytics()

        if (Queue.getWaitingCommands().length > 0) {
            Queue.start(true)
        }
    })
})

define('two/queue/ui', [
    'two/queue',
    'two/locale',
    'two/ui',
    'two/ui/buttonLink',
    'two/ui/autoComplete',
    'two/FrontButton',
    'two/utils',
    'two/eventQueue',
    'helper/time',
    'ejs'
], function (
    Queue,
    Locale,
    Interface,
    buttonLink,
    autoComplete,
    FrontButton,
    utils,
    eventQueue,
    $timeHelper,
    ejs
) {
    var ui
    var opener
    var $window
    var $switch
    var $addForm
    var $origin
    var $target
    var $date
    var $officers
    var $sections
    var $dateType
    var $filters
    var $catapultTarget
    var $catapultInput
    var $originVillage
    var $targetVillage
    var $clearUnits
    var $insertPreset

    /**
     * @type {Object}
     */
    var EVENT_CODES = {
        NOT_OWN_VILLAGE: 'notOwnVillage',
        NOT_ENOUGH_UNITS: 'notEnoughUnits',
        TIME_LIMIT: 'timeLimit',
        COMMAND_REMOVED: 'commandRemoved',
        COMMAND_SENT: 'commandSent'
    }

    /**
     * Elementos da previsão dos tempos de viagem de todas unidades.
     *
     * @type {Object}
     */
    var $unitTravelTimes = {
        attack: {},
        support: {}
    }

    /**
     * Object da aldeia origem (Obtido ao adicionar as coordendas
     * em "Adicionar comando").
     *
     * @type {Object|Null}
     */
    var originVillage = null

    /**
     * Object da aldeia alvo (Obtido ao adicionar as coordendas
     * em "Adicionar comando").
     *
     * @type {Object|Null}
     */
    var targetVillage = null

    /**
     * Armazena o elemento com a contagem regressiva de todos os comandos em espera.
     *
     * @type {Object}
     */
    var countDownElements = {}

    /**
     * Dados do jogador
     *
     * @type {Object}
     */
    var $player

    /**
     * Dados do jogo.
     *
     * @type {Object}
     */
    var $gameData = modelDataService.getGameData()

    /**
     * Armazena se as entradas das coordenadas e data de chegada são validas.
     *
     * @type {Object}
     */
    var validInput = {
        origin: false,
        target: false,
        date: false
    }

    /**
     * ID do setTimeout para que ações não sejam executadas imediatamente
     * assim que digitas no <input>
     *
     * @type {Number}
     */
    var timeoutInputDelayId

    /**
     * Lista de filtros ativos dos comandos da visualização "Em espera"
     *
     * @type {Object}
     */
    var activeFilters = {
        selectedVillage: false,
        barbarianTarget: false,
        allowedTypes: true,
        attack: true,
        support: true,
        relocate: true,
        textMatch: true
    }

    /**
     * Ordem em que os filtros são aplicados.
     *
     * @type {Array}
     */
    var filterOrder = [
        'selectedVillage',
        'barbarianTarget',
        'allowedTypes',
        'textMatch'
    ]

    /**
     * Dados dos filtros
     *
     * @type {Object}
     */
    var filtersData = {
        allowedTypes: {
            attack: true,
            support: true,
            relocate: true
        },
        textMatch: ''
    }

    /**
     * Nome de todos oficiais.
     *
     * @type {Array}
     */
    var officerNames = $gameData.getOrderedOfficerNames()

    /**
     * Nome de todas unidades.
     *
     * @type {Array}
     */
    var unitNames = $gameData.getOrderedUnitNames()

    /**
     * Nome de todos edificios.
     *
     * @type {Array}
     */
    var buildingNames

    /**
     * Nome de uma unidade de cada velocidade disponivel no jogo.
     * Usados para gerar os tempos de viagem.
     *
     * @type {Array}
     */
    var unitsBySpeed = [
        'knight',
        'heavy_cavalry',
        'axe',
        'sword',
        'ram',
        'snob',
        'trebuchet'
    ]

    /**
     * Tipo de comando que será adicionado a lista de espera,
     * setado quando um dos botões de adição é pressionado.
     *
     * @type {String}
     */
    var commandType

    /**
     * Tipo de data usada para configurar o comando (arrive|out)
     *
     * @type {String}
     */
    var dateType = 'arrive'

    /**
     * Aldeia atualmente selecionada no mapa.
     *
     * @type {Array|Boolean} Coordenadas da aldeia [x, y]
     */
    var mapSelectedVillage = false

    /**
     * Diferença entre o timezone local e do servidor.
     *
     * @type {Number}
     */
    var timeOffset

    /**
     * Oculpa os tempos de viagem
     */
    var hideTravelTimes = function () {
        $travelTimes.css('display', 'none')
    }

    /**
     * Oculpa os tempos de viagem
     */
    var showTravelTimes = function () {
        $travelTimes.css('display', '')
    }

    /**
     * Analisa as condições para ver se é possível calcular os tempos de viagem.
     * @return {Boolean}
     */
    var availableTravelTimes = function () {
        return ui.isVisible('add') && validInput.origin && validInput.target && validInput.date
    }

    /**
     * Popula as abas "Em espera" e "Registros" com os comandos armazenados.
     */
    var appendStoredCommands = function (sectionOnly) {
        appendWaitingCommands()
        appendSentCommands()
        appendExpiredCommands()
        applyCommandFilters()
    }

    /**
     * Popula a lista de comandos enviados.
     */
    var appendSentCommands = function () {
        Queue.getSentCommands().forEach(function (cmd) {
            appendCommand(cmd, 'sent')
        })
    }

    /**
     * Popula a lista de comandos expirados.
     */
    var appendExpiredCommands = function () {
        Queue.getExpiredCommands().forEach(function (cmd) {
            appendCommand(cmd, 'expired')
        })
    }

    /**
     * Popula a lista de comandos em espera.
     */
    var appendWaitingCommands = function () {
        Queue.getWaitingCommands().forEach(function (cmd) {
            appendCommand(cmd, 'queue')
        })
    }

    /**
     * Limpa a lista de comandos em espera.
     */
    var clearWaitingCommands = function () {
        $sections.queue.find('.command').remove()
        countDownElements = {}
    }

    /**
     * Repopula a lista de comandos em espera.
     */
    var resetWaitingCommands = function () {
        clearWaitingCommands()
        appendWaitingCommands()
    }

    /**
     * Verifica se o valor passado é uma unidade.
     * @param  {String} - value
     * @return {Boolean}
     */
    var isUnit = function (value) {
        return unitNames.includes(value)
    }

    /**
     * Verifica se o valor passado é um oficial.
     * @param  {String} - value
     * @return {Boolean}
     */
    var isOfficer = function (value) {
        return officerNames.includes(value)
    }

    /**
     * Obtem a data atual do jogo fomatada para hh:mm:ss:SSS dd/MM/yyyy
     *
     * @param {Number=} _ms - Optional time to be formated instead of the game date.
     * @return {String}
     */
    var formatDate = function (_ms) {
        var date = new Date(_ms || ($timeHelper.gameTime() + utils.getTimeOffset()))

        var rawMS = date.getMilliseconds()
        var ms = $timeHelper.zerofill(rawMS - (rawMS % 100), 3)
        var sec = $timeHelper.zerofill(date.getSeconds(), 2)
        var min = $timeHelper.zerofill(date.getMinutes(), 2)
        var hour = $timeHelper.zerofill(date.getHours(), 2)
        var day = $timeHelper.zerofill(date.getDate(), 2)
        var month = $timeHelper.zerofill(date.getMonth() + 1, 2)
        var year = date.getFullYear()

        return hour + ':' + min + ':' + sec + ':' + ms + ' ' + day + '/' + month + '/' + year
    }

    /**
     * Calcula o tempo de viagem para cada unidade com tempo de viagem disti
     * Tanto para ataque quanto para defesa.
     */
    var populateTravelTimes = function () {
        if (!validInput.origin || !validInput.target) {
            return $travelTimes.hide()
        }

        var origin = $origin.val()
        var target = $target.val()
        var officers = getOfficers()
        var travelTime = {}

        if (validInput.date) {
            var date = utils.fixDate($date.val())
            var arriveTime = utils.getTimeFromString(date)
        }

        ;['attack', 'support'].forEach(function (type) {
            unitsBySpeed.forEach(function (unit) {
                var units = {}
                units[unit] = 1

                var travelTime = Queue.getTravelTime(originVillage, targetVillage, units, type, officers)
                var readable = $filter('readableMillisecondsFilter')(travelTime)

                if (dateType === 'arrive') {
                    if (validInput.date) {
                        var sendTime = arriveTime - travelTime

                        if (!isValidSendTime(sendTime)) {
                            readable = genRedSpan(readable)
                        }
                    } else {
                        readable = genRedSpan(readable)
                    }
                }

                $unitTravelTimes[type][unit].innerHTML = readable
            })
        })

        showTravelTimes()
    }

    /**
     * Gera um <span> com classe para texto vermelho.
     */
    var genRedSpan = function (text) {
        return '<span class="text-red">' + text + '</span>'
    }

    /**
     * Altera a cor do texto do input
     *
     * @param  {jqLite} $elem
     */
    var colorRed = function ($elem) {
        $elem.css('color', '#a1251f')
    }

    /**
     * Restaura a cor do texto do input
     *
     * @param  {jqLite} $elem
     */
    var colorNeutral = function ($elem) {
        $elem.css('color', '')
    }

    /**
     * Loop em todas entradas de valores para adicionar um comadno.
     *
     * @param  {Function} callback
     */
    var eachInput = function (callback) {
        $window.find('[data-setting]').forEach(function ($input) {
            var settingId = $input.dataset.setting

            callback($input, settingId)
        })
    }

    /**
     * Adiciona um comando de acordo com os dados informados.
     *
     * @param {String} type Tipo de comando (attack, support ou relocate)
     */
    var addCommand = function (type) {
        var command = {
            units: {},
            officers: {},
            type: type,
            origin: originVillage,
            target: targetVillage
        }

        eachInput(function ($input, id) {
            var value = $input.value

            if (id === 'dateType') {
                command.dateType = $input.dataset.value
            } else if (id === 'catapultTarget') {
                command.catapultTarget = $input.dataset.value || null
            } else if (!value) {
                return false
            } else if (isUnit(id)) {
                command.units[id] = isNaN(value) ? value : parseInt(value, 10)
            } else if (isOfficer(id)) {
                if ($input.checked) {
                    command.officers[id] = 1
                }
            } else if (value) {
                command[id] = value
            }
        })
        
        Queue.addCommand(command)
    }

    /**
     * Remove um comando da seção especificada.
     *
     * @param  {Object} command - Comando que será removido.
     * @param  {String} section - Sessão em que o comando se encontra.
     */
    var removeCommand = function (command, section) {
        var $command = $sections[section].find('.command').filter(function ($command) {
            return $command.dataset.id === command.id
        })

        $($command).remove()

        removeCommandCountdown(command.id)
        toggleEmptyMessage(section)

        if (ui.isVisible('queue')) {
            ui.recalcScrollbar()
        }
    }

    /**
     * Adiciona um comando na seção.
     *
     * @param {Object} command - Dados do comando que será adicionado na interface.
     * @param {String} section - Seção em que o comandos erá adicionado.
     */
    var appendCommand = function (command, section) {
        var $command = document.createElement('div')
        $command.dataset.id = command.id
        $command.className = 'command'

        var origin = buttonLink('village', utils.genVillageLabel(command.origin), command.origin.id)
        var target = buttonLink('village', utils.genVillageLabel(command.target), command.target.id)

        // minus timeOffset = ugly fix?
        var arriveTime = utils.formatDate(command.arriveTime - timeOffset)
        var sendTime = utils.formatDate(command.sendTime - timeOffset)
        var hasOfficers = !!Object.keys(command.officers).length

        $command.innerHTML = ejs.render('<table class="tbl-border-light"><colgroup><col width="100px"></colgroup><tbody><tr><th colspan="2"><span class="icon-bg-<#= iconColor #> icon-26x26-<#= type #>" tooltip="<#= locale("common", type) #>"></span> <# if (section === "queue") { #> <span class="size-26x26 icon-bg-black icon-26x26-time-duration" tooltip="<#= locale("queue", "command.timeLeft") #>"></span> <span class="time-left">00:00:00</span> <# } #> <span class="size-26x26 icon-bg-black icon-20x20-units-outgoing" tooltip="<#= locale("queue", "command.out") #>"></span> <span class="sent-time"><#= sendTime #></span><span class="size-26x26 icon-bg-black icon-20x20-time-arrival" tooltip="<#= locale("queue", "command.arrive") #>"></span> <span class="arrive-time"><#= arriveTime #></span> <# if (section === "queue") { #> <a href="#" class="remove-command size-20x20 btn-red icon-20x20-close" tooltip="<#= locale("queue", "queue.remove") #>"></a> <# } #> </th></tr><tr><td><#= locale("common", "villages") #></td><td><a class="origin"></a> <span class="size-20x20 icon-26x26-<#= type #>"></span> <a class="target"></a></td></tr><tr><td><#= locale("common", "units") #></td><td class="units"> <# for (var unit in units) { #> <div class="unit"> <# if (unit === "catapult" && type === "attack") { #> <span class="icon-34x34-unit-<#= unit #> icon"></span><span class="amount"><#= units[unit] #> <span>(<#= locale("common", catapultTarget) #>)</span></span> <# } else { #> <span class="icon-34x34-unit-<#= unit #> icon"></span><span class="amount"><#= units[unit] #></span> <# } #> </div> <# } #> <# if (hasOfficers) { #> <# for (var officer in officers) { #> <div class="officer"><span class="icon-34x34-premium_officer_<#= officer #>"></span></div> <# } #> <# } #> </td></tr></tbody></table>', {
            sendTime: sendTime,
            type: command.type,
            arriveTime: arriveTime,
            units: command.units,
            hasOfficers: hasOfficers,
            officers: command.officers,
            section: section,
            locale: Locale,
            catapultTarget: command.catapultTarget,
            iconColor: command.type === 'attack' ? 'red' : 'blue'
        })

        $command.querySelector('.origin').replaceWith(origin.elem)
        $command.querySelector('.target').replaceWith(target.elem)

        if (section === 'queue') {
            var $remove = $command.querySelector('.remove-command')
            var $timeLeft = $command.querySelector('.time-left')

            $remove.addEventListener('click', function (event) {
                Queue.removeCommand(command, EVENT_CODES.COMMAND_REMOVED)
            })

            addCommandCountdown($timeLeft, command.id)
        }

        $sections[section].append($command)
        ui.setTooltips()

        toggleEmptyMessage(section)
    }

    /**
     * Inicia a contagem regressiva de todos comandos em espera.
     */
    var listenCommandCountdown = function () {
        var waitingCommands = Queue.getWaitingCommandsObject()
        setInterval(function () {
            var now = $timeHelper.gameTime() + timeOffset

            // Só processa os comandos se a aba dos comandos em esperera
            // estiver aberta.
            if (!ui.isVisible('queue')) {
                return false
            }

            for (var commandId in countDownElements) {
                var command = waitingCommands[commandId]
                var timeLeft = command.sendTime - now

                if (timeLeft > 0) {
                    countDownElements[commandId].innerHTML =
                        $filter('readableMillisecondsFilter')(timeLeft, false, true)
                }
            }
        }, 1000)
    }

    /**
     * Armazena o elemento da contagem regressiva de um comando.
     *
     * @param {Element} $container - Elemento da contagem regressiva.
     * @param {String} commandId - Identificação unica do comando.
     */
    var addCommandCountdown = function ($container, commandId) {
        countDownElements[commandId] = $container
    }

    /**
     * Remove um elemento de contagem regressiva armazenado.
     *
     * @param  {String} commandId - Identificação unica do comando.
     */
    var removeCommandCountdown = function (commandId) {
        delete countDownElements[commandId]
    }

    /**
     * Loop em todos os comandos em espera da visualização.
     *
     * @param  {Function} callback
     */
    var eachWaitingCommand = function (callback) {
        var waitingCommands = Queue.getWaitingCommandsObject()

        $sections.queue.find('.command').forEach(function ($command) {
            var command = waitingCommands[$command.dataset.id]

            if (command) {
                callback($command, command)
            }
        })
    }

    /**
     * Aplica um filtro nos comandos em espera.
     *
     * @param  {Array=} _options - Valores a serem passados para os filtros.
     */
    var applyCommandFilters = function (_options) {
        var filteredCommands = Queue.getWaitingCommands()

        filterOrder.forEach(function (filterId) {
            if (activeFilters[filterId]) {
                filteredCommands = Queue.filterCommands(filterId, filtersData, filteredCommands)
            }
        })

        var filteredCommandIds = filteredCommands.map(function (command) {
            return command.id
        })

        eachWaitingCommand(function ($command, command) {
            $command.style.display = filteredCommandIds.includes(command.id) ? '' : 'none'
        })

        ui.recalcScrollbar()
    }

    /**
     * Mostra ou oculpa a mensagem "vazio" de acordo com
     * a quantidade de comandos presetes na seção.
     *
     * @param  {String} section
     */
    var toggleEmptyMessage = function (section) {
        var $where = $sections[section]
        var $msg = $where.find('p.nothing')

        var condition = section === 'queue'
            ? Queue.getWaitingCommands()
            : $where.find('div')

        $msg.css('display', condition.length === 0 ? '' : 'none')
    }

    /**
     * Configura todos eventos dos elementos da interface.
     */
    var bindEvents = function () {
        eventQueue.bind('Queue/command/add/invalidOrigin', function (command) {
            utils.emitNotif('error', Locale('queue', 'error.origin'))
        })

        eventQueue.bind('Queue/command/add/invalidTarget', function (command) {
            utils.emitNotif('error', Locale('queue', 'error.target'))
        })
        
        eventQueue.bind('Queue/command/add/invalidDate', function (command) {
            utils.emitNotif('error', Locale('queue', 'error.invalidDate'))
        })

        eventQueue.bind('Queue/command/add/noUnits', function (command) {
            utils.emitNotif('error', Locale('queue', 'error.noUnits'))
        })

        eventQueue.bind('Queue/command/add/alreadySent', function (command) {
            utils.emitNotif('error', Locale('queue', 'error.alreadySent', {
                date: utils.formatDate(command.sendTime),
                type: Locale('common', command.type)
            }))
        })

        eventQueue.bind('Queue/command/remove', function (command) {
            removeCommand(command, 'queue')
            rootScope.$broadcast(eventTypeProvider.TOOLTIP_HIDE, 'twoverflow-tooltip')
            utils.emitNotif('success', genNotifText(command.type, 'removed'))
        })

        eventQueue.bind('Queue/command/remove/error', function (command) {
            utils.emitNotif('error', Locale('queue', 'error.removeError'))
        })

        eventQueue.bind('Queue/command/send/timeLimit', function (command) {
            removeCommand(command, 'queue')
            appendCommand(command, 'expired')
            utils.emitNotif('error', genNotifText(command.type, 'expired'))
        })

        eventQueue.bind('Queue/command/send/notOwnVillage', function (command) {
            removeCommand(command, 'queue')
            appendCommand(command, 'expired')
            utils.emitNotif('error', Locale('queue', 'error.notOwnVillage'))
        })

        eventQueue.bind('Queue/command/send/noUnitsEnough', function (command) {
            removeCommand(command, 'queue')
            appendCommand(command, 'expired')
            utils.emitNotif('error', Locale('queue', 'error.noUnitsEnough'))
        })

        eventQueue.bind('Queue/command/add', function (command) {
            resetWaitingCommands()
            applyCommandFilters()
            utils.emitNotif('success', genNotifText(command.type, 'added'))
        })

        eventQueue.bind('Queue/command/send', function (command) {
            removeCommand(command, 'queue')
            appendCommand(command, 'sent')
            utils.emitNotif('success', genNotifText(command.type, 'sent'))
        })

        eventQueue.bind('Queue/start', function (disableNotif) {
            opener.$elem.removeClass('btn-green').addClass('btn-red')
            $switch.removeClass('btn-green').addClass('btn-red')
            $switch.html(Locale('common', 'deactivate'))

            if (!disableNotif) {
                utils.emitNotif('success', genNotifText('title', 'activated'))
            }
        })

        eventQueue.bind('Queue/stop', function () {
            opener.$elem.removeClass('btn-red').addClass('btn-green')
            $switch.removeClass('btn-red').addClass('btn-green')
            $switch.html(Locale('common', 'activate'))

            utils.emitNotif('success', genNotifText('title', 'deactivated'))
        })

        $dateType.on('selectSelected', function () {
            dateType = $dateType[0].dataset.value

            populateTravelTimes()
        })

        $switch.on('click', function (event) {
            if (Queue.isRunning()) {
                Queue.stop()
            } else {
                Queue.start()
            }
        })

        $window.find('.buttons .add').on('click', function () {
            addCommand(this.name)
        })

        $window.find('a.clear').on('click', function () {
            clearRegisters()
        })

        $window.find('a.addSelected').on('click', function () {
            originVillage = modelDataService.getSelectedVillage().data
            $originVillage.html(utils.genVillageLabel(originVillage))
            validInput.origin = true

            if (originVillage && targetVillage) {
                showTravelTimes()
            }

            Queue.getVillageByCoords(originVillage.x, originVillage.y, function (data) {
                originVillage = data
                populateTravelTimes()
            })
        })

        $window.find('a.addMapSelected').on('click', function () {
            if (!mapSelectedVillage) {
                return utils.emitNotif('error', Locale('queue', 'error.noMapSelectedVillage'))
            }

            targetVillage = mapSelectedVillage
            $targetVillage.html(utils.genVillageLabel(targetVillage))
            validInput.target = true

            if (originVillage && targetVillage) {
                showTravelTimes()
            }

            Queue.getVillageByCoords(targetVillage.x, targetVillage.y, function (data) {
                targetVillage = data
                populateTravelTimes()
            })
        })

        $window.find('a.addCurrentDate').on('click', function () {
            $date.val(formatDate())
            $date.trigger('input')
        })

        $window.find('a.currentDatePlus').on('click', function () {
            $date.val(addDateDiff($date.val(), 100))
        })

        $window.find('a.currentDateMinus').on('click', function () {
            $date.val(addDateDiff($date.val(), -100))
        })

        var villageInputHandler = function (type) {
            return function () {
                var $el = type === 'origin' ? $origin : $target
                var val = $el.val()

                if (val.length < 2) {
                    return autoComplete.hide()
                }

                autoComplete.search(val, function (data) {
                    if (data.length) {
                        autoComplete.show(data, $el[0], 'commandQueue-' + type)
                    }
                }, ['village'])
            }
        }

        $origin.on('input', villageInputHandler('origin'))
        $target.on('input', villageInputHandler('target'))

        rootScope.$on(eventTypeProvider.SELECT_SELECTED, function (event, id, village) {
            if (id === 'commandQueue-origin') {
                validInput.origin = true
                originVillage = village

                colorNeutral($origin)
                populateTravelTimes()

                $originVillage.html(village.name)
            } else if (id === 'commandQueue-target') {
                validInput.target = true
                targetVillage = village

                colorNeutral($target)
                populateTravelTimes()

                $targetVillage.html(village.name)
            }

            if (!originVillage || !targetVillage) {
                hideTravelTimes()
            }
        })

        $date.on('input', function () {
            validInput.date = utils.isValidDateTime($date.val())

            if (validInput.date) {
                colorNeutral($date)
            } else {
                colorRed($date)
            }

            populateTravelTimes()
        })

        $officers.on('change', function () {
            populateTravelTimes()
        })

        $catapultInput.on('input', function (event) {
            if (event.target.value) {
                $catapultTarget.css('display', '')
            } else {
                $catapultTarget.css('display', 'none')
            }
        })

        $clearUnits.on('click', cleanUnitInputs)

        rootScope.$on(eventTypeProvider.SHOW_CONTEXT_MENU, function (event, menu) {
            mapSelectedVillage = menu.data
        })

        rootScope.$on(eventTypeProvider.DESTROY_CONTEXT_MENU, function () {
            mapSelectedVillage = false
        })

        rootScope.$on(eventTypeProvider.VILLAGE_SELECTED_CHANGED, function () {
            applyCommandFilters()
        })

        rootScope.$on(eventTypeProvider.ARMY_PRESET_UPDATE, updatePresetList)
        rootScope.$on(eventTypeProvider.ARMY_PRESET_DELETED, updatePresetList)

        $insertPreset.on('selectSelected', function () {
            var presetId = $insertPreset[0].dataset.value
            insertPreset(presetId)
        })
    }

    /**
     * Configura eventos dos filtros dos comandos em espera.
     */
    var bindCommandFilters = function () {
        $filters.find('.selectedVillage').on('click', function () {
            if (activeFilters.selectedVillage) {
                this.classList.remove('active')
            } else {
                this.classList.add('active')
            }

            activeFilters.selectedVillage = !activeFilters.selectedVillage

            applyCommandFilters()
        })

        $filters.find('.barbarianTarget').on('click', function () {
            if (activeFilters.barbarianTarget) {
                this.classList.remove('active')
            } else {
                this.classList.add('active')
            }

            activeFilters.barbarianTarget = !activeFilters.barbarianTarget

            applyCommandFilters()
        })

        $filters.find('.allowedTypes').on('click', function () {
            var commandType = this.dataset.filter
            var activated = activeFilters[commandType]

            if (activated) {
                this.classList.remove('active')
            } else {
                this.classList.add('active')
            }

            activeFilters[commandType] = !activated
            filtersData.allowedTypes[commandType] = !activated

            applyCommandFilters()
        })

        $filters.find('.textMatch').on('input', function (event) {
            clearTimeout(timeoutInputDelayId)

            filtersData[this.dataset.filter] = this.value

            timeoutInputDelayId = setTimeout(function () {
                applyCommandFilters()
            }, 250)
        })
    }

    /**
     * Remove todos os registros da interface e do localStorage.
     */
    var clearRegisters = function () {
        Queue.getSentCommands().forEach(function (cmd) {
            removeCommand(cmd, 'sent')
        })

        Queue.getExpiredCommands().forEach(function (cmd) {
            removeCommand(cmd, 'expired')
        })

        Queue.clearRegisters()
    }

    /**
     * Gera um texto de notificação com as traduções.
     *
     * @param  {String} key
     * @param  {String} key2
     * @param  {String=} prefix
     * @return {String}
     */
    var genNotifText = function (key, key2, prefix) {
        if (prefix) {
            key = prefix + '.' + key
        }

        return Locale('queue', key) + ' ' + Locale('queue', key2)
    }

    /**
     * Verifica se o tempo de envio é menor que o tempo atual do jogo.
     *
     * @param  {Number}  time
     * @return {Boolean}
     */
    var isValidSendTime = function (time) {
        if (($timeHelper.gameTime() + timeOffset) > time) {
            return false
        }

        return true
    }

    /**
     * Obtem todos oficiais ativados no formulário para adicioanr comandos.
     *
     * @return {Object} Oficiais ativos
     */
    var getOfficers = function () {
        var officers = {}

        officerNames.forEach(function (officer) {
            var $input = $addForm.find('.officers .' + officer)

            if ($input.val()) {
                officers[officer] = true
            }
        })

        return officers
    }

    /**
     * Obtem a lista de unidades porém com a catapulta como o último item.
     *
     * @return {Array}
     */
    var unitNamesCatapultLast = function () {
        var units = unitNames.filter(function (unit) {
            return unit !== 'catapult'
        })

        units.push('catapult')

        return units
    }

    var addDateDiff = function (date, diff) {
        if (!utils.isValidDateTime(date)) {
            return ''
        }

        date = utils.fixDate(date)
        date = utils.getTimeFromString(date)
        date += diff

        return formatDate(date)
    }

    /**
     * Atualiza a lista de presets na aba de configurações.
     */
    var updatePresetList = function () {
        var disabled = Locale('queue', 'add.insert-preset')
        var presets = modelDataService.getPresetList().presets
        var $data = $insertPreset.find('.custom-select-data').html('')
        var $selected = $insertPreset.find('.custom-select-handler').html(disabled)

        var $disabled = document.createElement('span')
        $disabled.dataset.name = disabled
        $disabled.dataset.value = ''
        $data.append($disabled)

        // pre-selected option
        $insertPreset[0].dataset.name = disabled

        for (var id in presets) {
            var $item = document.createElement('span')
            $item.dataset.name = presets[id].name
            $item.dataset.value = id
            $item.dataset.icon = 'size-26x26 icon-26x26-preset'
            $data.append($item)
        }
    }

    var insertPreset = function (presetId) {
        var preset = modelDataService.getPresetList().presets[presetId]

        if (!preset) {
            return false
        }

        cleanUnitInputs()

        $window.find('.add-units input.unit').forEach(function (el) {
            el.value = preset.units[el.dataset.setting] || ''
        })

        $officers.forEach(function (el) {
            var officer = el.dataset.setting

            if (preset.officers[officer]) {
                el.checked = true
                $(el).parent().addClass('icon-26x26-checkbox-checked')
            }
        })
    }

    var cleanUnitInputs = function () {
        $window.find('.add-units input.unit').forEach(function (el) {
            el.value = ''
        })

        $officers.forEach(function (el) {
            el.checked =false
        })

        $officers.parent().forEach(function (el) {
            $(el).removeClass('icon-26x26-checkbox-checked')
        })
    }

    function QueueInterface () {
        timeOffset = utils.getTimeOffset() 
        buildingNames = Object.keys($gameData.getBuildings())
        $player = modelDataService.getSelectedCharacter()

        // Valores a serem substituidos no template da janela
        var replaces = {
            version: Queue.version,
            locale: Locale,
            units: unitNamesCatapultLast(),
            officers: officerNames,
            buildings: buildingNames
        }

        ui = new Interface('CommandQueue', {
            activeTab: 'add',
            template: '<div class="win-content message-list-wrapper searchable-list ng-scope"><header class="win-head"><h2><#= locale("queue", "title") #> <span class="small">v<#= version #></span></h2><ul class="list-btn"><li><a href="#" class="twOverflow-close size-34x34 btn-red icon-26x26-close"></a></li></ul></header><div class="tabs tabs-bg"><div class="tabs-three-col"><div class="tab" tab="add"><div class="tab-inner"><div><a href="#" class="btn-icon btn-orange"><#= locale("common", "add") #></a></div></div></div><div class="tab" tab="queue"><div class="tab-inner"><div><a href="#" class="btn-icon btn-orange"><#= locale("common", "waiting") #></a></div></div></div><div class="tab" tab="log"><div class="tab-inner"><div><a href="#" class="btn-icon btn-orange"><#= locale("common", "logs") #></a></div></div></div></div></div><div class="win-main"><div class="box-paper footer has-footer-upper rich-text twOverflow-content-add"><form class="addForm"><div><table class="tbl-border-light tbl-striped"><colgroup><col width="30%"><col width="5%"><col><col width="18%"></colgroup><tbody><tr><td><input data-setting="origin" type="text" class="textfield-border origin" pattern="\\d{2,3}\\|\\d{2,3}" placeholder="<#= locale("queue", "add.village-search") #>" required></td><td class="text-center"><span class="icon-26x26-rte-village"></span></td><td class="originVillage"><#= locale("queue", "add.no-village") #></td><td class="actions"><a class="btn btn-orange addSelected" tooltip="<#= locale("queue", "add.addSelected") #>"><#= locale("common", "selected") #></a></td></tr><tr><td><input data-setting="target" type="text" class="textfield-border target" pattern="\\d{2,3}\\|\\d{2,3}" placeholder="<#= locale("queue", "add.village-search") #>" required></td><td class="text-center"><span class="icon-26x26-rte-village"></span></td><td class="targetVillage"><#= locale("queue", "add.no-village") #></td><td class="actions"><a class="btn btn-orange addMapSelected" tooltip="<#= locale("queue", "add.addMapSelected") #>"><#= locale("common", "selected") #></a></td></tr><tr><td><input data-setting="date" type="text" class="textfield-border date" pattern="\\s*\\d{1,2}:\\d{1,2}:\\d{1,2}(:\\d{1,3})? \\d{1,2}\\/\\d{1,2}\\/\\d{4}\\s*" placeholder="<#= locale("queue", "add.date") #>" tooltip="00:00:00:000 00/00/0000" required></td><td class="text-center"><span class="icon-26x26-time"></span></td><td><span class="ff-cell-fix"><select data-setting="dateType" class="dateType"><option value="arrive" selected="selected"><#= locale("queue", "add.arrive") #></option><option value="out"><#= locale("queue", "add.out") #></option></select></span></td><td class="actions"><a class="btn btn-orange currentDateMinus" tooltip="<#= locale("queue", "add.currentDateMinus") #>">-</a><a class="btn btn-orange addCurrentDate" tooltip="<#= locale("queue", "add.currentDate") #>"><#= locale("common", "now") #></a><a class="btn btn-orange currentDatePlus" tooltip="<#= locale("queue", "add.currentDatePlus") #>">+</a></td></tr></tbody></table><table class="tbl-border-light tbl-units tbl-speed screen-village-info travelTimes" style="display:none"><thead><tr><th colspan="7"><#= locale("queue", "add.travelTimes") #></th></tr></thead><tbody><tr><td class="odd"><div class="unit-wrap"><span class="icon icon-34x34-unit-knight"></span> <span class="icon icon-34x34-unit-light_cavalry"></span> <span class="icon icon-34x34-unit-mounted_archer"></span></div><div class="travelTime box-time-sub-icon"><div class="time-icon icon-20x20-attack"></div><span class="attack" data-unit="knight"></span></div><div class="travelTime box-time-sub-icon"><div class="time-icon icon-20x20-support"></div><span class="support" data-unit="knight"></span></div></td><td><div class="unit-wrap"><span class="icon icon-single icon-34x34-unit-heavy_cavalry"></span></div><div class="travelTime"><span class="attack" data-unit="heavy_cavalry"></span></div><div class="travelTime"><span class="support" data-unit="heavy_cavalry"></span></div></td><td class="odd"><div class="unit-wrap"><span class="icon icon-34x34-unit-archer"></span> <span class="icon icon-34x34-unit-spear"></span> <span class="icon icon-34x34-unit-axe"></span> <span class="icon icon-34x34-unit-doppelsoldner"></span></div><div class="travelTime"><span class="attack" data-unit="axe"></span></div><div class="travelTime"><span class="support" data-unit="axe"></span></div></td><td><div class="unit-wrap"><span class="icon icon-single icon-34x34-unit-sword"></span></div><div class="travelTime"><span class="attack" data-unit="sword"></span></div><div class="travelTime"><span class="support" data-unit="sword"></span></div></td><td class="odd"><div class="unit-wrap"><span class="icon icon-34x34-unit-catapult"></span> <span class="icon icon-34x34-unit-ram"></span></div><div class="travelTime"><span class="attack" data-unit="ram"></span></div><div class="travelTime"><span class="support" data-unit="ram"></span></div></td><td><div class="unit-wrap"><span class="icon icon-single icon-34x34-unit-snob"></span></div><div class="travelTime"><span class="attack" data-unit="snob"></span></div><div class="travelTime"><span class="support" data-unit="snob"></span></div></td><td class="odd"><div class="unit-wrap"><span class="icon icon-single icon-34x34-unit-trebuchet"></span></div><div class="travelTime"><span class="attack" data-unit="trebuchet"></span></div><div class="travelTime"><span class="support" data-unit="trebuchet"></span></div></td></tr></tbody></table></div><h5 class="twx-section collapse"><#= locale("common", "units") #></h5><table class="tbl-border-light tbl-striped"><colgroup><col width="25%"><col width="25%"><col width="25%"><col width="25%"></colgroup><tbody class="add-units"><tr><td colspan="4" class="actions"><select class="insert-preset"></select> <a class="clear-units btn btn-orange"><#= locale("queue", "add.clear") #></a></td></tr><tr> <# units.forEach(function(unit, i) { #> <# if (i !== 0 && i % 4 === 0) { #> </tr><tr> <# } #> <td class="cell-space-left"><span class="unit-icon icon-bg-black icon-34x34-unit-<#= unit #>"></span> <input class="unit <#= unit #>" type="text" data-setting="<#= unit #>" placeholder="0"></td> <# }) #> <td class="text-center catapult-target" style="display:none" colspan="3"><select data-setting="catapultTarget"> <# buildings.forEach(function(building, i) { #> <# if (building === "headquarter") { #> <option value="headquarter" selected="selected"><#= locale("common", "headquarter") #></option> <# } else { #> <option value="<#= building #>"><#= locale("common", building) #></option> <# } #> <# }) #> </select></td></tr></tbody></table><h5 class="twx-section collapse"><#= locale("common", "officers") #></h5><table class="tbl-border-light tbl-striped officers"><tbody><tr> <# officers.forEach(function(officer) { #> <td><span class="icon-34x34-premium_officer_<#= officer #>"></span> <label class="btn-orange icon-26x26-checkbox"><input type="checkbox" data-setting="<#= officer #>" class="<#= officer #>"></label></td> <# }) #> </tr></tbody></table></form></div><div class="box-paper footer has-footer-upper rich-text twOverflow-content-queue"><div class="filters"><table class="tbl-border-light"><tbody><tr><td><div data-filter="selectedVillage" class="box-border-dark icon selectedVillage" tooltip="<#= locale("queue", "filters.selectedVillage") #>"><span class="icon-34x34-village-info icon-bg-black"></span></div><div data-filter="barbarianTarget" class="box-border-dark icon barbarianTarget" tooltip="<#= locale("queue", "filters.barbarianTarget") #>"><span class="icon-34x34-barbarian-village icon-bg-black"></span></div><div data-filter="attack" class="box-border-dark icon allowedTypes active" tooltip="<#= locale("queue", "filters.attack") #>"><span class="icon-34x34-attack icon-bg-black"></span></div><div data-filter="support" class="box-border-dark icon allowedTypes active" tooltip="<#= locale("queue", "filters.support") #>"><span class="icon-34x34-support icon-bg-black"></span></div><div data-filter="relocate" class="box-border-dark icon allowedTypes active" tooltip="<#= locale("queue", "filters.relocate") #>"><span class="icon-34x34-relocate icon-bg-black"></span></div><div class="text"><input data-filter="textMatch" type="text" class="box-border-dark textMatch" placeholder="<#= locale("queue", "filters.textMatch") #>"></div></td></tr></tbody></table></div><h5 class="twx-section collapse"><#= locale("queue", "queue.waiting") #></h5><div class="queue"><p class="center nothing"><#= locale("queue", "queue.noneAdded") #></p></div></div><div class="box-paper footer has-footer-upper rich-text twOverflow-content-log"><h5 class="twx-section collapse"><#= locale("queue", "queue.sent") #></h5><div class="sent"><p class="center nothing"><#= locale("queue", "queue.noneSent") #></p></div><h5 class="twx-section collapse"><#= locale("queue", "queue.expired") #></h5><div class="expired"><p class="center nothing"><#= locale("queue", "queue.noneExpired") #></p></div></div></div><footer class="win-foot"><ul class="list-btn list-center buttons"><li class="twOverflow-button-log"><a class="btn-orange btn-border clear"><#= locale("queue", "general.clear") #></a></li><li class="twOverflow-button-add"><a class="btn-orange btn-border add" name="attack"><span class="icon-26x26-attack-small"></span> <#= locale("common", "attack") #></a></li><li class="twOverflow-button-add"><a class="btn-orange btn-border add" name="support"><span class="icon-26x26-support"></span> <#= locale("common", "support") #></a></li><li class="twOverflow-button-add"><a class="btn-orange btn-border add" name="relocate"><span class="icon-26x26-relocate"></span> <#= locale("common", "relocate") #></a></li><li class="twOverflow-button"><a class="btn-green btn-border switch"><#= locale("common", "activate") #></a></li></ul></footer></div>',
            replaces: replaces,
            css: '#CommandQueue input[type="text"]{width:200px}#CommandQueue input.unit{width:80px;height:34px}#CommandQueue form .padded{padding:2px 8px}#CommandQueue .custom-select{width:240px}#CommandQueue .originVillage,#CommandQueue .targetVillage{padding:0 7px}#CommandQueue .actions{text-align:center}#CommandQueue .actions a{height:26px;line-height:26px;padding:0 10px}#CommandQueue .clear-units{font-size:12px;font-weight:normal;text-decoration:none;font-style:italic}#CommandQueue .clear-units:hover{text-shadow:0 1px 1px #000;color:#c4926f}#CommandQueue .add-units td{text-align:center}#CommandQueue .add-units .unit-icon{top:-1px}#CommandQueue .add-units input{height:34px;line-height:26px;color:#000;font-size:14px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAABGdBTUEAALGPC/xhBQAAALRQTFRFr6+vmJiYoKCgrKysq6urpaWltLS0s7OzsLCwpKSkm5ubqKiojY2NlZWVk5OTqampbGxsWFhYUVFRhISEgYGBmpqaUFBQnp6eYmJidnZ2nZ2dY2NjW1tbZ2dnoaGhe3t7l5eXg4ODVVVVWVlZj4+PXFxcVlZWkpKSZmZmdXV1ZWVlc3NzjIyMXl5eVFRUeHh4hoaGYWFhXV1dbW1tampqb29veXl5fHx8gICAiYmJcnJyTk5Ooj6l1wAAADx0Uk5TGhkZGhoaGxoaGRkaGRkZGhkbHBgYGR0ZGhkZGhsZGRgZGRwbGRscGRoZGhkZGhwZGRobGRkZGRkZGRkeyXExWQAABOJJREFUSMeNVgdy4zgQxIW9TQ7KOVEUo5gz0f//1/WA0sple6+OLokQiUk9PQ2rvlzvT0vA6xDXU3R5hQmqddDVaIELsMl3KLUGoFHugUphjt25PWkE6KMAqPkO/Qh7HRadPmTNxKJpWuhSjLZAoSZmXYoPXh0w2R2z10rjBxpMNRfomhbNFUfUFbfUCh6TWmO4ZqNn6Jxekx6lte3h9IgYv9ZwzIZXfhQ/bejmsYkgOeVInoDGT6KGP9MMbsj7mtEKphKgVFKkJGUM+r/00zybNkPMFWYske+jY9hUblbrK4YosyPtrxl+5kNRWSb2B3+pceKT05SQRPZY8pVSGoWutgen2junRVKPZJ0v5Nu9HAk/CFPr+T1XTkXYFWSJXfTyLPcpcPXtBZIPONq/cFQ0Y0Lr1GF6f5doHdm2RLTbQMpMmCIf/HGm53OLFPiiEOsBKtgHccgKTVwn8l7kbt3iPvqniMX4jgWj4aqlX43xLwXVet5XTG1cYp/29m58q6ULSa7V0M3UQFyjd+AD+1W9WLBpDd9uej7emFbea/+Yw8faySElQQrBDksTpTOVIG/SE2HpPvZsplJWsblRLEGXATEW9YLUY1rPSdivBDmuK3exNiAysfPALfYZFWJrsA4Zt+fftEeRY0UsMDqfyNCKJpdrtI1r2k0vp9LMSwdO0u5SpjBeEYz5ebhWNbwT2g7OJXy1vjW+pEwyd1FTkAtbzzcbmX1yZlkR2pPiXZ/mDbPNWvHRsaKfLH8+FqiZbnodbOK9RGWlNMli8k+wsgbSNwS35QB6qxn53xhu2DFqUilisB9q2Zqw4nNI9tOB2z8GbkvEdNjPaD2j+9pwEC+YlWJvI7xN7xMC09eqhq/qwRvz3JWcFWmkjrWBWSiOysEmc4LmMb0iSsxR8+Z8pk3+oE39cdAmh1xSDXuAryRLZgpp9V62+8IOeBSICjs8LlbtKGN4E7XGoGASIJ+vronVa5mjagPHIFJA2b+BKkZC5I/78wOqmzYp1N8vzTkWIWz6YfsS3eh3w8pBkfKz6TSLxK9Qai5DUGTMZ8NNmrW8ldNudIJq+eJycwjv+xbeOJwPv1jjsSV/rCBaS/IBrafaUQ+5ksHwwl9y9X7kmvvIKWoBDFvbWySGyMU3XflxZRkNeRU63otWb0+P8H8BrRokbJivpWkk6m6LccSlrC2K0i6+4otx4dN3mbAVKt0wbaqBab4/MW8rgrS8JP06HU6UYSTYsQ5pYETpo87ZonORvbPlvYbXwmsMgoQGKr8PUQ5dDEO0EcXp2oOfSk+YpR/Eg4R46O0/Sf7jVnbqbXBrRkCPsZFOQTN8h+aqlcRw9FjJ/j8V7SXZ3hVNXYsOYcxzpfPNgFrvB9S6Dej2PqDqq0su+5ng0WMi527p/pA+OiW0fsYzDa6sPS9C1qxTtxVRMuySrwPD6qGPRKc4uIx4oceJ9FPjxWaqPPebzyXxU7W1jNqqOw+9z6X/k+Na3SBa0v+VjgoaULR30G1nxvZN1vsha2UaSrKy/PyCaHK5zAYnJzm9RSpSPDWbDVu0dkUujMmB/ly4w8EnDdXXoyX/VfhB3yKzMJ2BSaZO+A9GiNQMbll+6z1WGLWpEGMeEg85MESSep0IPFaHYZZ1QOW/xcjfxGhNjP0tRtbhFHOmhhjAv/p77JrCX3+ZAAAAAElFTkSuQmCC) top left #b89064;box-shadow:inset 0 0 0 1px #000,inset 0 0 0 2px #a2682c,inset 0 0 0 3px #000,inset -3px -3px 2px 0 #fff,inset 0 0 9px 5px rgba(99,54,0,0.5);text-align:center;width:80px}#CommandQueue .command{margin-bottom:10px}#CommandQueue .command .time-left{width:93px;display:inline-block;padding:0 0 0 3px}#CommandQueue .command .sent-time,#CommandQueue .command .arrive-time{width:160px;display:inline-block;padding:0 0 0 5px}#CommandQueue .command td{padding:3px 6px}#CommandQueue .officers td{width:111px;text-align:center}#CommandQueue .officers label{margin-left:5px}#CommandQueue .officers span{margin-left:2px}#CommandQueue .units div.unit{float:left}#CommandQueue .units div.unit span.icon{transform:scale(.7);width:25px;height:25px}#CommandQueue .units div.unit span.amount{vertical-align:-2px;margin:0 5px 0 2px}#CommandQueue .units div.officer{float:left;margin:0 2px}#CommandQueue .units div.officer span{transform:scale(.7);width:25px;height:25px}#CommandQueue .remove-command{float:right;margin-top:3px}#CommandQueue .tbl-units td{text-align:center}#CommandQueue .travelTimes{margin-top:10px;font-size:13px}#CommandQueue .travelTimes th{text-align:center}#CommandQueue .travelTimes .travelTime{display:block;color:#1c4b1c}#CommandQueue .travelTimes .travelTime.box-time-sub-icon{position:relative}#CommandQueue .travelTimes .travelTime.box-time-sub-icon .time-icon{position:absolute;top:-4px;left:7px;transform:scale(.7)}#CommandQueue .dateType{width:200px}#CommandQueue .dateType .custom-select-handler{text-align:left}#CommandQueue .filters .icon{width:38px;float:left;margin:0 6px}#CommandQueue .filters .icon.active:before{box-shadow:0 0 0 1px #000,-1px -1px 0 2px #ac9c44,0 0 0 3px #ac9c44,0 0 0 4px #000;border-radius:1px;content:"";position:absolute;width:38px;height:38px;left:-1px;top:-1px}#CommandQueue .filters .text{margin-left:262px}#CommandQueue .filters .text input{height:36px;margin-top:1px;width:100%;text-align:left;padding:0 5px}#CommandQueue .filters .text input::placeholder{color:white}#CommandQueue .filters .text input:focus::placeholder{color:transparent}#CommandQueue .filters td{padding:6px}#CommandQueue .icon-34x34-barbarian-village:before{filter:grayscale(100%);background-image:url(https://i.imgur.com/ozI4k0h.png);background-position:-220px -906px}#CommandQueue .icon-20x20-time-arrival:before{transform:scale(.8);background-image:url(https://i.imgur.com/ozI4k0h.png);background-position:-529px -454px}#CommandQueue .icon-20x20-attack:before{transform:scale(.8);background-image:url(https://i.imgur.com/ozI4k0h.png);background-position:-546px -1086px;width:26px;height:26px}#CommandQueue .icon-20x20-support:before{transform:scale(.8);background-image:url(https://i.imgur.com/ozI4k0h.png);background-position:-462px -360px;width:26px;height:26px}#CommandQueue .icon-20x20-relocate:before{transform:scale(.8);background-image:url(https://i.imgur.com/ozI4k0h.png);background-position:-1090px -130px;width:26px;height:26px}#CommandQueue .icon-26x26-attack:before{background-image:url(https://i.imgur.com/ozI4k0h.png);background-position:-546px -1086px}'
        })

        opener = new FrontButton('Commander', {
            classHover: false,
            classBlur: false,
            onClick: function () {
                ui.openWindow()
            }
        })

        $window = $(ui.$window)
        $switch = $window.find('a.switch')
        $addForm = $window.find('form.addForm')
        $origin = $window.find('input.origin')
        $target = $window.find('input.target')
        $date = $window.find('input.date')
        $officers = $window.find('.officers input')
        $travelTimes = $window.find('table.travelTimes')
        $dateType = $window.find('.dateType')
        $filters = $window.find('.filters')
        $catapultTarget = $window.find('td.catapult-target')
        $catapultInput = $window.find('input.unit.catapult')
        $originVillage = $window.find('.originVillage')
        $targetVillage = $window.find('.targetVillage')
        $clearUnits = $window.find('.clear-units')
        $insertPreset = $window.find('.insert-preset')
        $sections = {
            queue: $window.find('div.queue'),
            sent: $window.find('div.sent'),
            expired: $window.find('div.expired')
        }

        $travelTimes.find('.attack').forEach(function ($elem) {
            $unitTravelTimes.attack[$elem.dataset.unit] = $elem
        })

        $travelTimes.find('.support').forEach(function ($elem) {
            $unitTravelTimes.support[$elem.dataset.unit] = $elem
        })

        setInterval(function () {
            if (availableTravelTimes()) {
                populateTravelTimes()
            }
        }, 1000)

        bindEvents()
        bindCommandFilters()
        appendStoredCommands()
        listenCommandCountdown()

        socketService.emit(routeProvider.GET_PRESETS, {}, updatePresetList)

        return ui
    }

    Queue.interface = function () {
        Queue.interface = QueueInterface()
    }
})

define('two/farm', [
    'two/locale',
    'two/farm/Village',
    'two/utils',
    'two/eventQueue',
    'helper/math',
    'conf/conf',
    'struct/MapData',
    'helper/mapconvert',
    'helper/time',
    'conf/locale',
    'conf/gameStates',
    'Lockr'
], function (
    Locale,
    Village,
    utils,
    eventQueue,
    $math,
    $conf,
    $mapData,
    $convert,
    $timeHelper,
    gameLocale,
    GAME_STATES,
    Lockr
) {
    /**
     * Previne do Farm ser executado mais de uma vez.
     *
     * @type {Boolean}
     */
    var initialized = false

    /**
     * Tempo de validade dos dados temporarios do FarmOverflow.
     * Dados como: índice dos alvos, lista de prioridades etc..
     *
     * Padrão de 30 minutos de tolerância.
     *
     * @type {Number}
     */
    var DATA_EXPIRE_TIME = 1000 * 60 * 30

    /**
     * Intervalo entre cada verificação de farm travado.
     * @see initPersistentRunning
     *
     * @type {Number}
     */
    var PERSISTENT_INTERVAL = 1000 * 60

    /**
     * Tempo de tolerância entre um ataque e outro para que possa
     * reiniciar os comandos automaticamente.
     *
     * @type {Number}
     */
    var PERSISTENT_TOLERANCE = 1000 * 60 * 5

    /**
     * Intervalo de tempo usado na reciclagem de todas aldeias alvos.
     *
     * @type {Number}
     */
    var TARGETS_RELOAD_TIME = 1000 * 60 * 5

    /**
     * Limpa qualquer text entre (, [, {, " & ' do nome dos presets
     * para serem idetificados com o mesmo nome.
     *
     * @type {RegEx}
     */
    var rpreset = /(\(|\{|\[|\"|\')[^\)\}\]\"\']+(\)|\}|\]|\"|\')/

    /**
     * Aldeias que prontas para serem usadas nos ataques.
     *
     * @type {Array}
     */
    var playerVillages = null

    /**
     * Lista de aldeias restantes até chegar o farm chegar à última
     * aldeia da lista. Assim que chegar a lista será resetada com
     * todas aldeias dispoíveis do jogador (sem as waitingVillages).
     *
     * @type {Array}
     */
    var leftVillages = []

    /**
     * Aldeia atualmente selecionada.
     *
     * @type {Object} VillageModel
     */
    var selectedVillage = null

    /**
     * Identifica se o jogador possui apenas uma aldeia disponível para atacar.
     *
     * @type {Boolean}
     */
    var singleVillage = null

    /**
     * Lista de todos aldeias alvos possíveis para cada aldeia do jogador.
     *
     * @type {Object}
     */
    var villagesTargets = {}

    /**
     * Aldeias alvo atualmente selecionada.
     *
     * @type {Object}
     */
    var selectedTarget = null

    /**
     * Propriedade usada para permitir ou não o disparo de eventos.
     *
     * @type {Boolean}
     */
    var eventsEnabled = true

    /**
     * Propriedade usada para permitir ou não a exibição de notificações.
     *
     * @type {Boolean}
     */
    var notifsEnabled = true

    /**
     * Preset usado como referência para enviar os comandos
     *
     * @type {Array}
     */
    var selectedPresets = []

    /**
     * Objeto do group de referência para ignorar aldeias/alvos.
     *
     * @type {Object}
     */
    var groupIgnore = null

    /**
     * Objeto do group de referência para incluir alvos.
     *
     * @type {Object}
     */
    var groupInclude = null

    /**
     * Objeto do group de referência para filtrar aldeias usadas
     * pelo Farm.
     *
     * @type {Object}
     */
    var groupOnly = null

    /**
     * Lista de aldeias ignoradas
     *
     * @type {Array}
     */
    var ignoredVillages = []

    /**
     * Lista de aldeias que serão permitidas atacar, independente de outros
     * fatores a não ser a distância.
     *
     * @type {Array}
     */
    var includedVillages = []

    /**
     * Armazena todas aldeias que não estão em confições de enviar comandos.
     *
     * @type {Object}
     */
    var waitingVillages = {}

    /**
     * Indica se não há nenhuma aldeia disponível (todas aguardando tropas).
     *
     * @type {Boolean}
     */
    var globalWaiting = false

    /**
     * Armazena o último evento que fez o farm entrar em modo de espera.
     * Usado para atualizar a mensagem de status quando o farm é reiniciado
     * manualmente.
     *
     * @type {String}
     */
    var lastError = ''

    /**
     * Lista de alvos com prioridade no envio dos ataques.
     * Alvos são adicionados nessa lista quando farms voltam lotados.
     *
     * @type {Object.<array>}
     */
    var priorityTargets = {}

    /**
     * Status do Farm.
     *
     * @type {String}
     */
    var currentStatus = 'paused'

    /**
     * Armazena todos os últimos eventos ocorridos no Farm.
     *
     * @type {Array}
     */
    var lastEvents

    /**
     * Timestamp da última atividade do Farm como atques e
     * trocas de aldeias.
     *
     * @type {Number}
     */
    var lastActivity

    /**
     * Timestamp da última atividade do Farm como atques e
     * trocas de aldeias.
     *
     * @type {Number}
     */
    var lastAttack

    /**
     * Armazena os índices dos alvos de cada aldeia disponível.
     *
     * @type {Object}
     */
    var targetIndexes

    /**
     * Objeto com dados do jogador.
     *
     * @type {Object}
     */
    var $player

    /**
     * @type {Object}
     */
    var $gameState

    /**
     * Lista de filtros chamados no momendo do carregamento de alvos do mapa.
     *
     * @type {Array}
     */
    var mapFilters = [
        // IDs negativos são localizações reservadas para os jogadores como
        // segunda aldeia em construção, convidar um amigo e deposito de recursos.
        function nonVillages(target) {
            if (target.id < 0) {
                return true
            }
        },

        // Aldeia do próprio jogador
        function ownPlayer(target) {
            if (target.character_id === $player.getId()) {
                return true
            }
        },

        // Impossivel atacar alvos protegidos
        function protectedVillage(target) {
            if (target.attack_protection) {
                return true
            }
        },

        // Aldeias de jogadores são permitidas caso estejam
        // no grupo de incluidas.
        function includedVillage(target) {
            if (target.character_id) {
                var included = includedVillages.includes(target.id)

                if (!included) {
                    return true
                }
            }
        },

        // Filtra aldeias pela pontuação
        function villagePoints(target) {
            if (target.points < Farm.settings.minPoints) {
                return true
            }

            if (target.points > Farm.settings.maxPoints) {
                return true
            }
        },

        // Filtra aldeias pela distância
        function villageDistance(target) {
            var coords = selectedVillage.position
            var distance = $math.actualDistance(coords, target)

            if (distance < Farm.settings.minDistance) {
                return true
            }

            if (distance > Farm.settings.maxDistance) {
                return true
            }
        }
    ]

    /**
     * Remove todas propriedades que tiverem valor zero.
     *
     * @param {Object} units - Unidades do preset a serem filtradas.
     */
    var cleanPresetUnits = function (units) {
        var pure = {}

        for (var unit in units) {
            if (units[unit] > 0) {
                pure[unit] = units[unit]
            }
        }

        return pure
    }

    /**
     * Salva no localStorage a lista dos últimos eventos ocorridos no Farm.
     */
    var updateLastEvents = function () {
        Lockr.set('farm-lastEvents', lastEvents)
    }

    /**
     * Atualiza o grupo de referência para ignorar aldeias e incluir alvos
     */
    var updateExceptionGroups = function () {
        var groups = modelDataService.getGroupList().getGroups()

        groupIgnore = Farm.settings.groupIgnore in groups
            ? groups[Farm.settings.groupIgnore]
            : false

        groupInclude = Farm.settings.groupInclude in groups
            ? groups[Farm.settings.groupInclude]
            : false

        groupOnly = Farm.settings.groupOnly in groups
            ? groups[Farm.settings.groupOnly]
            : false
    }

    /**
     * Atualiza a lista de aldeias ignoradas e incluidas
     */
    var updateExceptionVillages = function () {
        var groupList = modelDataService.getGroupList()

        ignoredVillages = []
        includedVillages = []

        if (groupIgnore) {
            ignoredVillages =
                groupList.getGroupVillageIds(groupIgnore.id)
        }

        if (groupInclude) {
            includedVillages =
                groupList.getGroupVillageIds(groupInclude.id)
        }
    }

    /**
     * Atualiza a lista de aldeias do jogador e filtra com base nos grupos (caso
     * estaja configurado...).
     */
    var updatePlayerVillages = function () {
        var villages = $player.getVillageList()
            .map(function (village) {
                return new Village(village)
            })
            .filter(function (village) {
                return !ignoredVillages.includes(village.id)
            })

        if (groupOnly) {
            var groupList = modelDataService.getGroupList()
            var groupVillages = groupList.getGroupVillageIds(groupOnly.id)

            villages = villages.filter(function (village) {
                return groupVillages.includes(village.id)
            })
        }

        playerVillages = villages
        singleVillage = playerVillages.length === 1
        selectedVillage = playerVillages[0]

        // Reinicia comandos imediatamente se liberar alguma aldeia
        // que nao esteja na lista de espera.
        if (Farm.commander.running && globalWaiting) {
            for (var i = 0; i < villages.length; i++) {
                var village = villages[i]

                if (!waitingVillages[village.id]) {
                    globalWaiting = false
                    Farm.commander.analyse()

                    break
                }
            }
        }

        Farm.triggerEvent('Farm/villagesUpdate')
    }

    /**
     * Obtem preset apropriado para o script
     *
     * @param {Function} callback
     */
    var updatePresets = function (callback) {
        var update = function (rawPresets) {
            selectedPresets = []

            if (!Farm.settings.presetName) {
                if (callback) {
                    callback()
                }

                return
            }

            for (var id in rawPresets) {
                if (!rawPresets.hasOwnProperty(id)) {
                    continue
                }

                var name = rawPresets[id].name
                var cleanName = name.replace(rpreset, '').trim()

                if (cleanName === Farm.settings.presetName) {
                    rawPresets[id].cleanName = cleanName
                    rawPresets[id].units = cleanPresetUnits(rawPresets[id].units)

                    selectedPresets.push(rawPresets[id])
                }
            }

            if (callback) {
                callback()
            }
        }

        if (modelDataService.getPresetList().isLoaded()) {
            update(modelDataService.getPresetList().getPresets())
        } else {
            socketService.emit(routeProvider.GET_PRESETS, {}, function (data) {
                Farm.triggerEvent('Farm/presets/loaded')
                update(data.presets)
            })
        }
    }

    /**
     * Funções relacionadas com relatórios.
     */
    var reportListener = function () {
        var reportQueue = []

        /**
         * Adiciona o grupo de "ignorados" no alvo caso o relatório do
         * ataque tenha causado alguma baixa nas tropas.
         *
         * @param  {Object} report - Dados do relatório recebido.
         */
        var ignoredTargetHandler = function (report) {
            var target = targetExists(report.target_village_id)

            if (!target) {
                return false
            }

            ignoreVillage(target)

            return true
        }

        /**
         * Analisa a quantidade farmada dos relatórios e adiciona
         * a aldeia alvo na lista de prioridades.
         *
         * @param {Object} reportInfo - Informações básicas do relatório
         */
        var priorityHandler = function (reportInfo) {
            getReport(reportInfo.id, function (data) {
                var attack = data.ReportAttack
                var vid = attack.attVillageId
                var tid = attack.defVillageId

                if (!priorityTargets.hasOwnProperty(vid)) {
                    priorityTargets[vid] = []
                }

                // Caso o alvo já esteja na lista de prioridades
                // cancela...
                if (priorityTargets[vid].includes(tid)) {
                    return false
                }

                priorityTargets[vid].push(tid)

                Farm.triggerEvent('Farm/priorityTargetAdded', [{
                    id: tid,
                    name: attack.defVillageName,
                    x: attack.defVillageX,
                    y: attack.defVillageY
                }])
            })
        }

        /**
         * Analisa todos relatórios adicionados na lista de espera.
         */
        var delayedPriorityHandler = function () {
            reportQueue.forEach(function (report) {
                priorityHandler(report)
            })

            reportQueue = []
        }

        /**
         * Analisa todos relatórios de ataques causados pelo Farm.
         *
         * @param  {Object} data - Dados do relatório recebido.
         */
        var reportHandler = function (event, data) {
            if (!Farm.commander.running || data.type !== 'attack') {
                return false
            }

            // data.result === 1 === 'nocasualties'
            if (Farm.settings.ignoreOnLoss && data.result !== 1) {
                ignoredTargetHandler(data)
            }

            if (Farm.settings.priorityTargets && data.haul === 'full') {
                if (windowManagerService.isTemplateOpen('report')) {
                    reportQueue.push(data)
                } else {
                    priorityHandler(data)
                }
            }
        }

        /**
         * Executa handlers com delay.
         *
         * Alguns relatórios são adicionados na lista de espera
         * por que quando carregados, o relatório que o jogador
         * está visualizando no momento será substituido pelo
         * carregado.
         *
         * @param {Object} event - Dados do evento rootScope.$broadcast
         * @param {String} templateName - Nome do template da janela que
         *   foi fechado.
         */
        var delayedReportHandler = function (event, templateName) {
            if (templateName === 'report') {
                delayedPriorityHandler()
            }
        }

        rootScope.$on(eventTypeProvider.REPORT_NEW, reportHandler)
        rootScope.$on(eventTypeProvider.WINDOW_CLOSED, delayedReportHandler)
    }

    /**
     * Funções relacionadas com mensagens.
     */
    var messageListener = function () {
        /**
         * Detecta mensagens do jogador enviadas para sí mesmo, afim de iniciar
         * e pausar o farm remotamente.
         *
         * @param  {[type]} data - Dados da mensagem recebida.
         */
        var remoteHandler = function (_, data) {
            var id = Farm.settings.remoteId

            if (data.participants.length !== 1 || data.title !== id) {
                return false
            }

            var userMessage = data.message.content.trim().toLowerCase()

            switch (userMessage) {
            case 'on':
            case 'start':
            case 'init':
            case 'begin':
                Farm.restart()

                sendMessageReply(data.message_id, genStatusReply())
                Farm.triggerEvent('Farm/remoteCommand', ['on'])

                break
            case 'off':
            case 'stop':
            case 'pause':
            case 'end':
                Farm.tempDisableNotifs(function () {
                    Farm.pause()
                })

                sendMessageReply(data.message_id, genStatusReply())
                Farm.triggerEvent('Farm/remoteCommand', ['off'])

                break
            case 'status':
            case 'current':
                sendMessageReply(data.message_id, genStatusReply())
                Farm.triggerEvent('Farm/remoteCommand', ['status'])

                break
            }

            return false
        }

        rootScope.$on(eventTypeProvider.MESSAGE_SENT, remoteHandler)
    }

    /**
     * Detecta alterações e atualiza lista de predefinições
     * configuradas no script.
     */
    var presetListener = function () {
        var updatePresetsHandler = function () {
            updatePresets()
            Farm.triggerEvent('Farm/presets/change')

            if (Farm.commander.running) {
                var hasPresets = !!selectedPresets.length

                if (hasPresets) {
                    if (Farm.getGlobalWaiting()) {
                        resetWaitingVillages()
                        Farm.restart()
                    }
                } else {
                    Farm.triggerEvent('Farm/noPreset')
                    Farm.pause()
                }
            }
        }

        rootScope.$on(eventTypeProvider.ARMY_PRESET_UPDATE, updatePresetsHandler)
        rootScope.$on(eventTypeProvider.ARMY_PRESET_DELETED, updatePresetsHandler)
    }

    /**
     * Mantém a lista de aldeias atualizadas de acordo com os grupos.
     */
    var groupListener = function () {
        /**
         * Atualiza lista de grupos configurados no script.
         * Atualiza a lista de aldeias incluidas/ignoradas com base
         * nos grupos.
         */
        var groupChangeHandler = function () {
            updateExceptionGroups()
            updateExceptionVillages()

            Farm.triggerEvent('Farm/groupsChanged')
        }

        /**
         * Detecta grupos que foram adicionados nas aldeias.
         * Atualiza a lista de alvos e aldeias do jogador.
         *
         * @param  {Object} data - Dados do grupo retirado/adicionado.
         */
        var groupLinkHandler = function (_, data) {
            updatePlayerVillages()

            if (!groupInclude) {
                return false
            }

            if (groupInclude.id === data.group_id) {
                villagesTargets = {}
            }
        }

        rootScope.$on(eventTypeProvider.GROUPS_UPDATED, groupChangeHandler)
        rootScope.$on(eventTypeProvider.GROUPS_CREATED, groupChangeHandler)
        rootScope.$on(eventTypeProvider.GROUPS_DESTROYED, groupChangeHandler)
        rootScope.$on(eventTypeProvider.GROUPS_VILLAGE_LINKED, groupLinkHandler)
        rootScope.$on(eventTypeProvider.GROUPS_VILLAGE_UNLINKED, groupLinkHandler)
    }

    /**
     * Mantém a lista de aldeias da lista de espera atualizadas.
     */
    var villageListener = function () {
        /**
         * Remove uma aldeia da lista de espera e reinicia o ciclo
         * de ataques caso necessário.
         *
         * @param  {Object} vid - ID da aldeia.
         */
        var freeVillage = function (vid) {
            delete waitingVillages[vid]

            if (globalWaiting) {
                globalWaiting = false

                if (Farm.settings.stepCycle) {
                    return false
                }

                if (Farm.commander.running) {
                    selectVillage(vid)
                    Farm.commander.analyse()
                }
            }
        }

        /**
         * Detecta mudanças na quantidade de tropas nas aldeias e remove
         * a aldeia da lista de espera caso esteja.
         *
         * @param  {Object} data - Dados da aldeia afetada.
         */
        var armyChangeHandler = function (_, data) {
            var vid = data.village_id
            var reason = waitingVillages[vid] || false

            if (reason === 'units' || reason === 'commands') {
                freeVillage(vid)

                return false
            }
        }

        /**
         * Detecta mudanças na quantidade de recursos nas aldeias.
         * Remove ou adiciona a aldeia da lista de espera dependendo
         * se o armazém está lotado ou não.
         *
         * @param  {Object} data - Dados da aldeia afetada.
         */
        var resourceChangeHandler = function (_, data) {
            var vid = data.villageId
            var reason = waitingVillages[vid] || false

            if (reason === 'fullStorage') {
                freeVillage(vid)
            } else {
                var village = getVillageById(vid)

                if (Farm.isFullStorage(village)) {
                    Farm.setWaitingVillage(vid, 'fullStorage')
                }
            }
        }

        rootScope.$on(eventTypeProvider.VILLAGE_ARMY_CHANGED, armyChangeHandler)
        rootScope.$on(eventTypeProvider.VILLAGE_RESOURCES_CHANGED, resourceChangeHandler)
    }

    /**
     * Listeners em geral.
     */
    var generalListeners = function () {
        /**
         * Detecta quando a conexão é reestabelecida, podendo
         * reiniciar o script.
         */
        var reconnectHandler = function () {
            if (Farm.commander.running) {
                setTimeout(function () {
                    Farm.restart()
                }, 5000)
            }
        }

        // Carrega pedaços da mapa quando chamado.
        // É disparado quando o método $mapData.loadTownDataAsync
        // é executado.
        $mapData.setRequestFn(function (args) {
            socketService.emit(routeProvider.MAP_GETVILLAGES, args)
        })

        rootScope.$on(eventTypeProvider.RECONNECT, reconnectHandler)
    }

    /**
     * Cria os eventos utilizados pelo FarmOverflow.
     */
    var bindEvents = function () {
        // Lista de eventos para atualizar o último status do Farm.
        eventQueue.bind('Farm/sendCommand', function () {
            updateLastAttack()
            currentStatus = 'attacking'
        })

        eventQueue.bind('Farm/noPreset', function () {
            currentStatus = 'paused'
        })

        eventQueue.bind('Farm/noUnits', function () {
            currentStatus = 'noUnits'
        })

        eventQueue.bind('Farm/noUnitsNoCommands', function () {
            currentStatus = 'noUnitsNoCommands'
        })

        eventQueue.bind('Farm/start', function () {
            currentStatus = 'attacking'
        })

        eventQueue.bind('Farm/pause', function () {
            currentStatus = 'paused'
        })

        eventQueue.bind('Farm/loadingTargets/start', function () {
            currentStatus = 'loadingTargets'
        })

        eventQueue.bind('Farm/loadingTargets/end', function () {
            currentStatus = 'analyseTargets'
        })

        eventQueue.bind('Farm/commandLimit/single', function () {
            currentStatus = 'commandLimit'
        })

        eventQueue.bind('Farm/commandLimit/multi', function () {
            currentStatus = 'noVillages'
        })

        eventQueue.bind('Farm/stepCycle/end', function () {
            currentStatus = 'stepCycle/end'

            if (notifsEnabled && Farm.settings.stepCycleNotifs) {
                utils.emitNotif('error', Locale('farm', 'events.stepCycle/end'))
            }
        })

        eventQueue.bind('Farm/stepCycle/end/noVillages', function () {
            currentStatus = 'stepCycle/end/noVillages'

            if (notifsEnabled) {
                utils.emitNotif('error', Locale('farm', 'events.stepCycle/end/noVillages'))
            }
        })

        eventQueue.bind('Farm/stepCycle/next', function () {
            currentStatus = 'stepCycle/next'

            if (notifsEnabled && Farm.settings.stepCycleNotifs) {
                var next = $timeHelper.gameTime() + Farm.cycle.getInterval()

                utils.emitNotif('success', Locale('farm', 'events.stepCycle/next', {
                    time: utils.formatDate(next)
                }))
            }
        })

        eventQueue.bind('Farm/fullStorage', function () {
            currentStatus = 'fullStorage'
        })
    }

    /**
     * Atualiza o timestamp do último ataque enviado com o Farm.
     */
    var updateLastAttack = function () {
        lastAttack = $timeHelper.gameTime()
        Lockr.set('farm-lastAttack', lastAttack)
    }

    /**
     * Obtem os dados da aldeia pelo ID.
     *
     * @param {Number} vid - ID da aldeia à ser selecionada.
     * @return {Village} ou {Boolean}
     */
    var getVillageById = function (vid) {
        var i = playerVillages.indexOf(vid)

        return i !== -1 ? playerVillages[i] : false
    }

    /**
     * Seleciona uma aldeia específica do jogador.
     *
     * @param {Number} vid - ID da aldeia à ser selecionada.
     * @return {Boolean}
     */
    var selectVillage = function (vid) {
        var village = getVillageById(vid)

        if (village) {
            selectedVillage = village

            return true
        }

        return false
    }

    /**
     * Ativa um lista de presets na aldeia selecionada.
     *
     * @param {Array} presetIds - Lista com os IDs dos presets
     * @param {Function} callback
     */
    var assignPresets = function (presetIds, callback) {
        socketService.emit(routeProvider.ASSIGN_PRESETS, {
            village_id: selectedVillage.id,
            preset_ids: presetIds
        }, callback)
    }

    /**
     * Adiciona a aldeia especificada no grupo de aldeias ignoradas
     *
     * @param {Object} target - Dados da aldeia a ser ignorada.
     */
    var ignoreVillage = function (target) {
        if (!groupIgnore) {
            return false
        }

        socketService.emit(routeProvider.GROUPS_LINK_VILLAGE, {
            group_id: groupIgnore.id,
            village_id: target.id
        }, function () {
            Farm.triggerEvent('Farm/ignoredVillage', [target])
        })
    }

    /**
     * Verifica se o alvo está relacionado a alguma aldeia do jogador.
     *
     * @param {Number} targetId - ID da aldeia
     */
    var targetExists = function (targetId) {
        for (var vid in villagesTargets) {
            var villageTargets = villagesTargets[vid]

            for (var i = 0; i < villageTargets.length; i++) {
                var target = villageTargets[i]

                if (target.id === targetId) {
                    return target
                }
            }
        }

        return false
    }

    /**
     * Reseta a lista de aldeias em espera.
     */
    var resetWaitingVillages = function () {
        waitingVillages = {}
    }

    /**
     * Verifica se o último ataque efetuado pelo FarmOverflow
     * já passou do tempo determinado, para que assim tente
     * reiniciar os ataques novamente.
     *
     * Isso é necessário pois o jogo não responde os .emits
     * de sockets para enviar os ataques, fazendo com que o
     * farm fique travado em estado "Iniciado".
     * Problema de conexão, talvez?
     */
    var initPersistentRunning = function () {
        setInterval(function () {
            if (Farm.commander.running) {
                var toleranceTime = PERSISTENT_TOLERANCE

                // Caso o ciclo único de ataques estejam ativo
                // aumenta a tolerância para o tempo de intervalo
                // entre os ciclos + 1 minuto para que não tenha
                // o problema de reiniciar os ataques enquanto
                // o intervalo ainda não acabou.
                if (Farm.settings.stepCycle && Farm.cycle.intervalEnabled()) {
                    toleranceTime += Farm.cycle.getInterval() + (1000 * 60)
                }

                var gameTime = $timeHelper.gameTime()
                var passedTime = gameTime - lastAttack

                if (passedTime > toleranceTime) {
                    Farm.tempDisableNotifs(function () {
                        Farm.pause()
                        Farm.start(true /*autoInit*/)
                    })
                }
            }
        }, PERSISTENT_INTERVAL)
    }

    /**
     * Reseta a lista de alvos carregados toda vez em um intervalo de tempo,
     * evitando que aldeias abandonadas que forem nobladas por outros jogadores
     * sejam atacadas.
     *
     * https://github.com/TWOverflow/TWOverflow/issues/58
     */
    var initTargetsProof = function () {
        setInterval(function () {
            villagesTargets = {}
        }, TARGETS_RELOAD_TIME)
    }

    /**
     * Carrega os dados de um relatório.
     *
     * @param {Number} reportId - ID do relatório
     * @param {Function} callback
     */
    var getReport = function (reportId, callback) {
        socketService.emit(routeProvider.REPORT_GET, {
            id: reportId
        }, callback)
    }

    /**
     * Envia um mensagem resposta para a mensagem indicada
     *
     * @param  {Number} message_id - Identificação da mensagem.
     * @param  {String} message - Corpo da mensagem.
     */
    var sendMessageReply = function (message_id, message) {
        socketService.emit(routeProvider.MESSAGE_REPLY, {
            message_id: message_id,
            message: message
        })
    }

    /**
     * Gera uma mensagem em código bb com o status atual do FarmOverflow
     *
     * @return {String}
     */
    var genStatusReply = function () {
        var localeStatus = Locale('common', 'status')
        var localeVillage = Locale('farm', 'events.selectedVillage')
        var localeLast = Locale('farm', 'events.lastAttack')

        var statusReplaces = {}

        if (currentStatus === 'stepCycle/next') {
            var next = $timeHelper.gameTime() + Farm.cycle.getInterval()

            statusReplaces.time = utils.formatDate(next)
        }

        var farmStatus = Locale('farm', 'events.' + currentStatus, statusReplaces)
        var villageLabel = utils.genVillageLabel(selectedVillage)
        var last = utils.formatDate(lastAttack)
        var vid = selectedVillage.id

        var message = []

        message.push('[b]', localeStatus, ':[/b] ', farmStatus, '[br]')
        message.push('[b]', localeVillage, ':[/b] ')
        message.push('[village=', vid, ']', villageLabel, '[/village][br]')
        message.push('[b]', localeLast, ':[/b] ', last)

        return message.join('')
    }

    /**
     * Analisa se o FarmOverflow ficou ocioso por um certo periodo
     * de tempo, permitindo que alguns dados sejam resetados.
     *
     * @return {Boolean} Se os dados expiraram ou não.
     */
    var isExpiredData = function () {
        var now = $timeHelper.gameTime()

        if (Farm.settings.stepCycle && Farm.cycle.intervalEnabled()) {
            if (now > (lastActivity + Farm.cycle.getInterval() + (60 * 1000))) {
                return true
            }
        } else if (now > lastActivity + DATA_EXPIRE_TIME) {
            return true
        }

        return false
    }

    /**
     * Carrega setores de aldeias diretamente do mapa do jogo.
     *
     * @param {Number} x - X-coord.
     * @param {Number} y - Y-coord.
     * @param {Number} w - Width.
     * @param {Number} h - Height.
     * @param {Function} callback - Chamado quando todos setores carregarem.
     */
    var loadMapSectors = function (x, y, w, h, chunk, callback) {
        if ($mapData.hasTownDataInChunk(x, y)) {
            var sectors = $mapData.loadTownData(x, y, w, h, chunk)

            return callback(sectors)
        }

        Farm.triggerEvent('Farm/loadingTargets/start')

        var loads = $convert.scaledGridCoordinates(x, y, w, h, chunk)
        var length = loads.length
        var index = 0

        $mapData.loadTownDataAsync(x, y, w, h, function () {
            if (++index === length) {
                Farm.triggerEvent('Farm/loadingTargets/end')
                var sectors = $mapData.loadTownData(x, y, w, h, chunk)

                callback(sectors)
            }
        })
    }

    /**
     * Transforma dados bruto dos setores do mapa em um Array
     * com todas aldeias.
     *
     * @param {Number} sectors - Setores carregados do mapa.
     * @return {Array} Array com todas aldeias dos setores.
     */
    var listTargets = function (sectors) {
        var i = sectors.length
        var villages = []

        while (i--) {
            var sector = sectors[i]
            var sectorDataX = sector.data

            for (var sx in sectorDataX) {
                var sectorDataY = sectorDataX[sx]

                for (var sy in sectorDataY) {
                    var village = sectorDataY[sy]
                    villages.push(village)
                }
            }
        }

        return villages
    }

    /**
     * Filtra as aldeas de acordo com funções listadas em mapFilters.
     *
     * @param {Array} targets - Lista de aldeias a serem filtradas.
     * @return {Array} Array com aldeias filtradas.
     */
    var filterTargets = function (targets) {
        return targets.filter(function (target) {
            return mapFilters.every(function (fn) {
                return !fn(target)
            })
        })
    }

    /**
     * Transforma as aldeias em objetos apenas com os dados necessarios
     * para o funcionamento do FarmOverflow.
     *
     * @param {Array} targets - Lista de aldeias a serem processadas.
     * @return {Array} Array com aldeias processadas.
     */
    var processTargets = function (targets) {
        var processedTargets = []
        var origin = selectedVillage.position
        var target

        for (var i = 0; i < targets.length; i++) {
            target = targets[i]
            
            processedTargets.push({
                x: target.x,
                y: target.y,
                distance: $math.actualDistance(origin, target),
                id: target.id,
                name: target.name,
                pid: target.character_id
            })
        }

        return processedTargets
    }

    /**
     * Carrega as configurações do usuário e mescla com
     * as configurações padrões.
     */
    var loadSettings = function () {
        var localSettings = Lockr.get('farm-settings', {}, true)

        for (var key in Farm.settingsMap) {
            Farm.settings[key] = localSettings.hasOwnProperty(key)
                ? localSettings[key]
                : Farm.settingsMap[key].default
        }
    }

    var Farm = {}

    /**
     * Versão do script.
     *
     * @type {String}
     */
    Farm.version = '4.0.1'

    /**
     * Configurações do jogador + configurações padrões
     *
     * @type {Object}
     */
    Farm.settings = {}

    /**
     * Informações de cada opção.
     *
     * @type {Object}
     */
    Farm.settingsMap = {
        maxDistance: {
            default: 10,
            updates: ['targets'],
            inputType: 'text',
            min: 0,
            max: 50
        },
        minDistance: {
            default: 0,
            updates: ['targets'],
            inputType: 'text',
            min: 0,
            max: 50
        },
        maxTravelTime: {
            default: '01:00:00',
            updates: [],
            inputType: 'text',
            pattern: /\d{1,2}\:\d{2}\:\d{2}/
        },
        randomBase: {
            default: 3,
            updates: [],
            inputType: 'text',
            min: 0,
            max: 9999
        },
        presetName: {
            default: '',
            updates: ['preset'],
            inputType: 'select'
        },
        groupIgnore: {
            default: '0',
            updates: ['groups'],
            inputType: 'select'
        },
        groupInclude: {
            default: '0',
            updates: ['groups', 'targets'],
            inputType: 'select'
        },
        groupOnly: {
            default: '0',
            updates: ['groups', 'villages', 'targets'],
            inputType: 'select'
        },
        minPoints: {
            default: 0,
            updates: ['targets'],
            inputType: 'text',
            min: 0,
            max: 13000
        },
        maxPoints: {
            default: 12500,
            updates: ['targets'],
            inputType: 'text',
            min: 0,
            max: 13000
        },
        eventsLimit: {
            default: 20,
            updates: ['events'],
            inputType: 'text',
            min: 0,
            max: 150
        },
        ignoreOnLoss: {
            default: true,
            updates: [],
            inputType: 'checkbox'
        },
        priorityTargets: {
            default: true,
            updates: [],
            inputType: 'checkbox'
        },
        eventAttack: {
            default: true,
            updates: ['events'],
            inputType: 'checkbox'
        },
        eventVillageChange: {
            default: true,
            updates: ['events'],
            inputType: 'checkbox'
        },
        eventPriorityAdd: {
            default: true,
            updates: ['events'],
            inputType: 'checkbox'
        },
        eventIgnoredVillage: {
            default: true,
            updates: ['events'],
            inputType: 'checkbox'
        },
        remoteId: {
            default: 'remote',
            updates: [],
            inputType: 'text'
        },
        hotkeySwitch: {
            default: 'shift+z',
            updates: [],
            inputType: 'text'
        },
        hotkeyWindow: {
            default: 'z',
            updates: [],
            inputType: 'text'
        },
        stepCycle: {
            default: false,
            updates: ['villages'],
            inputType: 'checkbox'
        },
        stepCycleNotifs: {
            default: false,
            updates: [],
            inputType: 'checkbox'
        },
        stepCycleInterval: {
            default: '00:00:00',
            updates: [],
            inputType: 'text',
            pattern: /\d{1,2}\:\d{2}\:\d{2}/
        },
        commandsPerVillage: {
            default: 48,
            updates: ['waitingVillages'],
            inputType: 'text',
            min: 1,
            max: 50
        },
        ignoreFullStorage: {
            default: true,
            updates: ['fullStorage'],
            inputType: 'checkbox'
        }
    }

    Farm.init = function () {
        Locale.create('farm', {"en":{"langName":"English","title":"FarmOverflow","events.attacking":"Attacking.","events.commandLimit":"Limit of 50 attacks reached, waiting return.","events.lastAttack":"Last attack","events.nextVillage":"Changing to village %{village}","events.noPreset":"No presets avaliable.","events.noSelectedVillage":"No villages avaliable.","events.noUnits":"No units avaliable in village, waiting attacks return.","events.noUnitsNoCommands":"No villages has units or commands returning.","events.noVillages":"No villages avaliable, waiting attacks return.","events.nothingYet":"Nothing available yet...","events.presetFirst":"Set a preset first!","events.selectedVillage":"Village selected","events.sendCommand":"%{origin} attack %{target}","events.loadingTargets":"Loading targets...","events.checkingTargets":"Checking targets...","events.restartingCommands":"Restarting commands...","events.ignoredVillage":"Target %{target} ignored! (caused loss)","events.priorityTargetAdded":"%{target} added to priorities.","events.analyseTargets":"Analysing targets.","events.stepCycle/restart":"Restarting the cycle of commands..","events.stepCycle/end":"The list of villages ended, waiting for the next run.","events.stepCycle/end/noVillages":"No villages available to start the cycle.","events.stepCycle/next":"The list of villages is over, next cycle: %{time}.","events.stepCycle/next/noVillages":"No village available to start the cycle, next cycle: %{time}.","events.fullStorage":"The storage of the village is full.","general.disabled":"— Disabled —","general.paused":"FarmOverflow paused.","general.started":"FarmOverflow started.","settings.docs":"To understand the settings, read the documentation","settings.settings":"Settings","settings.presets":"Presets","settings.groupIgnore":"Ignore Group","settings.groupInclude":"Include Group","settings.groupOnly":"Only Group","settings.randomBase":"Random Interval","settings.commandsPerVillage":"Commands Limit","settings.priorityTargets":"Prioritize Targets","settings.ignoreOnLoss":"Ignore on Loss","settings.ignoreFullStorage":"Skip Full Storage","settings.stepCycle/header":"Step Cycle Settings","settings.stepCycle":"Enable Step Cycle","settings.stepCycle/interval":"Interval","settings.stepCycle/notifs":"Notifications","settings.targetFilters":"Target Filters","settings.minDistance":"Minimum distance","settings.maxDistance":"Maximum distance","settings.minPoints":"Minimum points","settings.maxPoints":"Maximum points","settings.maxTravelTime":"Maximum travel time","settings.eventsLimit":"Limit of logs","settings.eventAttack":"Log attacks","settings.eventVillageChange":"Log village changes","settings.eventPriorityAdd":"Log priority targets","settings.eventIgnoredVillage":"Log ignored villages","settings.remote":"Remote Control Message Subject","settings.hotkeySwitch":"Start/pause hotkey","settings.hotkeyWindow":"Open window hotkey","settings.saved":"Settings saved!","settingError.minDistance":"The target distance must be between %{min} and %{max}.","settingError.maxDistance":"The target distance must be between %{min} and %{max}.","settingError.maxTravelTime":"Maximum travel time format must be hh:mm:ss.","settingError.randomBase":"The random interval base must be between %{min} and %{max}.","settingError.minPoints":"The target pontuation must be a value between %{min} and %{max}.","settingError.maxPoints":"The target pontuation must be a value between %{min} and %{max}.","settingError.eventsLimit":"The amount of events must be a value between %{min} and %{max}.","settingError.stepCycle/interval":"Format of interval between cycles must be hh:mm:ss.","settingError.commandsPerVillage":"The limit of commands per village must be a value between %{min} and %{max}."},"pl":{"langName":"Polski","title":"Farmer","events.attacking":"Atakuje.","events.commandLimit":"Limit 50 ataków osiągnięty, oczekiwanie na powrót wojsk.","events.lastAttack":"Ostatni atak","events.nextVillage":"Przejście do wioski %{village}","events.noPreset":"Brak dostępnych szablonów.","events.noSelectedVillage":"Brak dostępnych wiosek.","events.noUnits":"Brak dostępnych jednostek w wiosce, oczekiwanie na powrót wojsk.","events.noUnitsNoCommands":"Brak jednostek w wioskach lub powracających wojsk.","events.noVillages":"Brak dostępnych wiosek, oczekiwanie na powrót wojsk.","events.nothingYet":"Odpoczywam...","events.presetFirst":"Wybierz najpierw szablon!","events.selectedVillage":"Wybrana wioska","events.sendCommand":"%{origin} atakuje %{target}","events.loadingTargets":"Ładowanie celów...","events.checkingTargets":"Sprawdzanie celów...","events.restartingCommands":"Restartowanie poleceń...","events.ignoredVillage":"Cel %{target} pominięty! (caused loss)","events.priorityTargetAdded":"%{target} dodany do priorytetowych.","events.analyseTargets":"Analizowanie celów.","events.stepCycle/restart":"Restartowanie cyklu poleceń...","events.stepCycle/end":"Lista wiosek zakończona, oczekiwanie na następny cykl.","events.stepCycle/end/noVillages":"Brak wiosek do rozpoczęcia cyklu.","events.stepCycle/next":"Lista wiosek się skończyła, następny cykl: %{time}.","events.stepCycle/next/noVillages":"Brak wioski do rozpoczęcia cyklu, następny cykl: %{time}.","events.fullStorage":"Magazyn w wiosce jest pełny","general.disabled":"— Wyłączony —","general.paused":"Farmer zatrzymany","general.started":"Farmer uruchomiony","settings.docs":"Miłego farmienia!","settings.settings":"Ustawienia","settings.presets":"Szablony","settings.groupIgnore":"Pomijaj wioski z grupy","settings.groupInclude":"Dodaj wioski z grupy","settings.groupOnly":"Tylko wioski z grupy","settings.randomBase":"Domyślny odstęp (sek)","settings.commandsPerVillage":"Limit poleceń","settings.priorityTargets":"Priorytyzuj cele","settings.ignoreOnLoss":"Pomijaj cele jeśli straty","settings.ignoreFullStorage":"Pomijaj wioski jeśli magazyn pełny","settings.stepCycle/header":"Cykl Farmienia","settings.stepCycle":"Włącz Cykl farmienia","settings.stepCycle/interval":"Odstęp między cyklami","settings.stepCycle/notifs":"Powiadomienia","settings.targetFilters":"Filtry celów","settings.minDistance":"Minimalna odległość","settings.maxDistance":"Maksymalna odległość","settings.minPoints":"Minimalna liczba punktów","settings.maxPoints":"Maksymalna liczba punktów","settings.maxTravelTime":"Maksymalny czas podróży","settings.eventsLimit":"Limit logów","settings.eventAttack":"Logi ataków","settings.eventVillageChange":"Logi zmiany wiosek","settings.eventPriorityAdd":"Logi celów priorytetowych","settings.eventIgnoredVillage":"Logi pominiętych wiosek","settings.remote":"Sterowanie Zdalne za pomocą wiadomości PW","settings.hotkeySwitch":"Skrót Start/Pauza","settings.hotkeyWindow":"Skrót okna Farmera","settings.saved":"Ustawienia zapisane!","settingError.minDistance":"Odległość celu musi być większa niż %{min}.","settingError.maxDistance":"Odległość celu nie może przekraczać %{max}.","settingError.maxTravelTime":"Maksymalny czas podróży hh:mm:ss.","settingError.randomBase":"Domyślny odstęp musi być pomiędzy %{min} and %{max}.","settingError.minPoints":"Minimalna liczba punktów celu to %{min}.","settingError.maxPoints":"Maksymalna liczba punktów celu to %{max}.","settingError.eventsLimit":"Liczba zdarzeń musi być wartością między %{min} i %{max}.","settingError.stepCycle/interval":"Format odstępu między cyklami powinien mieć postać hh:mm:ss.","settingError.commandsPerVillage":"Limit poleceń na wioskę musi być wartością między %{min} and %{max}."},"pt":{"langName":"Português","title":"FarmOverflow","events.attacking":"Atacando.","events.commandLimit":"Limite de 50 ataques atingido, aguardando retorno.","events.lastAttack":"Último ataque","events.nextVillage":"Alternando para a aldeia %{village}","events.noPreset":"Nenhuma predefinição disponível.","events.noSelectedVillage":"Nenhuma aldeia disponível.","events.noUnits":"Sem unidades na aldeia, aguardando ataques retornarem.","events.noUnitsNoCommands":"Nenhuma aldeia tem tropas nem ataques retornando.","events.noVillages":"Nenhuma aldeia disponível, aguardando ataques retornarem.","events.nothingYet":"Nada por aqui ainda...","events.presetFirst":"Configure uma predefinição primeiro!","events.selectedVillage":"Aldeia selecionada","events.sendCommand":"%{origin} ataca %{target}","events.loadingTargets":"Carregando alvos...","events.checkingTargets":"Checando alvos...","events.restartingCommands":"Reiniciando comandos...","events.ignoredVillage":"Alvo %{target} ignorado! (causou baixas)","events.priorityTargetAdded":"%{target} adicionado as prioridades.","events.analyseTargets":"Analisando alvos.","events.stepCycle/restart":"Reiniciando o ciclo de comandos..","events.stepCycle/end":"A lista de aldeias acabou, esperando próxima execução.","events.stepCycle/end/noVillages":"Nenhuma aldeia disponível para iniciar o ciclo.","events.stepCycle/next":"A lista de aldeias acabou, próximo ciclo: %{time}.","events.stepCycle/next/noVillages":"Nenhuma aldeia disponível para iniciar o ciclo, próximo ciclo: %{time}.","events.fullStorage":"O armazém da aldeia está cheio.","general.disabled":"— Desativado —","general.paused":"FarmOverflow pausado.","general.started":"FarmOverflow iniciado.","settings.docs":"Para entender as configurações, leia a documentação","settings.settings":"Configurações","settings.presets":"Predefinições","settings.groupIgnore":"Grupo Ignorar","settings.groupInclude":"Grupo Incluir","settings.groupOnly":"Grupo Apenas","settings.randomBase":"Intervalo Aleatório","settings.commandsPerVillage":"Limite de Comandos","settings.priorityTargets":"Priorizar Alvos","settings.ignoreOnLoss":"Ignorar Alvos Hostis","settings.ignoreFullStorage":"Ignorar Armazéns Lotados","settings.stepCycle/header":"Configurações de Ciclos","settings.stepCycle":"Ativar Ciclo","settings.stepCycle/interval":"Intervalo","settings.stepCycle/notifs":"Notificações","settings.targetFilters":"Filtro de Alvos","settings.minDistance":"Distância mínima","settings.maxDistance":"Distância máxima","settings.minPoints":"Pontuação mínima","settings.maxPoints":"Pontuação máxima","settings.maxTravelTime":"Tempo máximo de viagem","settings.eventsLimit":"Limite de registros","settings.eventAttack":"Registrar ataques","settings.eventVillageChange":"Registrar troca de aldeias","settings.eventPriorityAdd":"Registrar alvos prioritarios","settings.eventIgnoredVillage":"Registrar alvos ignorados","settings.remote":"Controle Remoto - Mensagem","settings.hotkeySwitch":"Atalho para inicar/pausar","settings.hotkeyWindow":"Atalho para abrir janela","settings.saved":"Configurações salvas!","settingError.minDistance":"A distância deve ser um valor entre %{min} e %{max}.","settingError.maxDistance":"A distância deve ser um valor entre %{min} e %{max}.","settingError.maxTravelTime":"O formato do tempo máximo de viagem deve ser hh:mm:ss.","settingError.randomBase":"O intervalo entre cada ataque deve ser um valor entre %{min} e %{max}.","settingError.minPoints":"A pontuação do alvo deve ser entre %{min} e %{max}.","settingError.maxPoints":"A pontuação do alvo deve ser entre %{min} e %{max}.","settingError.eventsLimit":"O número de eventos deve ser entre %{min} e %{max}.","settingError.stepCycle/interval":"O formato do intervalo entre ataques deve ser hh:mm:ss.","settingError.commandsPerVillage":"A limite de comandos por aldeia deve ser um valor entre %{min} e %{max}."}}, 'en')

        initialized = true
        Farm.commander = Farm.createCommander()
        $player = modelDataService.getSelectedCharacter()
        $gameState = modelDataService.getGameState()

        lastEvents = Lockr.get('farm-lastEvents', [], true)
        lastActivity = Lockr.get('farm-lastActivity', $timeHelper.gameTime(), true)
        lastAttack = Lockr.get('farm-lastAttack', -1, true)
        targetIndexes = Lockr.get('farm-indexes', {}, true)

        loadSettings()
        updateExceptionGroups()
        updateExceptionVillages()
        updatePlayerVillages()
        updatePresets()
        reportListener()
        messageListener()
        groupListener()
        presetListener()
        villageListener()
        generalListeners()
        bindEvents()
        initPersistentRunning()
        initTargetsProof()
    }

    /**
     * Inicia os comandos.
     *
     * @return {Boolean}
     */
    Farm.start = function (autoInit) {
        if (!selectedPresets.length) {
            if (!autoInit && notifsEnabled) {
                utils.emitNotif('error',
                    Locale('farm', 'events.presetFirst')
                )
            }

            return false
        }

        if (!selectedVillage) {
            if (!autoInit && notifsEnabled) {
                utils.emitNotif('error',
                    Locale('farm', 'events.noSelectedVillage')
                )
            }

            return false
        }

        if (!$gameState.getGameState(GAME_STATES.ALL_VILLAGES_READY)) {
            var unbind = rootScope.$on(eventTypeProvider.GAME_STATE_ALL_VILLAGES_READY, function () {
                unbind()
                Farm.start()
            })

            return false
        }

        if (isExpiredData()) {
            priorityTargets = {}
            targetIndexes = {}
        }

        if (Farm.settings.stepCycle) {
            Farm.cycle.startStep(autoInit)
        } else {
            Farm.cycle.startContinuous()
        }

        Farm.updateActivity()

        return true
    }

    /**
     * Pausa os comandos.
     *
     * @return {Boolean}
     */
    Farm.pause = function () {
        Farm.breakCommander()
        Farm.triggerEvent('Farm/pause')
        clearTimeout(Farm.cycle.getTimeoutId())

        if (notifsEnabled) {
            utils.emitNotif('success', Locale('common', 'paused'))
        }

        return true
    }

    /**
     * Stop commander without stopping the whole farm
     */
    Farm.breakCommander = function () {
        clearTimeout(Farm.commander.timeoutId)
        Farm.commander.running = false
    }

    /**
     * Para e re-inicia sem emitir notificação.
     */
    Farm.restart = function () {
        Farm.tempDisableNotifs(function () {
            Farm.pause()
            Farm.start()
        })
    }

    /**
     * Alterna entre iniciar e pausar o script.
     */
    Farm.switch = function () {
        if (Farm.commander.running) {
            Farm.pause()
        } else {
            Farm.start()
        }
    }

    /**
     * Atualiza o timestamp da última atividade do Farm.
     */
    Farm.updateActivity = function () {
        lastActivity = $timeHelper.gameTime()
        Lockr.set('farm-lastActivity', lastActivity)
    }

    /**
     * Atualiza as novas configurações passados pelo usuário e as fazem
     * ter efeito caso o farm esteja em funcionamento.
     *
     * @param {Object} changes - Novas configurações.
     */
    Farm.updateSettings = function (changes) {
        var modify = {}
        var settingMap
        var newValue
        var vid

        for (var key in changes) {
            settingMap = Farm.settingsMap[key]
            newValue = changes[key]

            if (!settingMap || newValue === Farm.settings[key]) {
                continue
            }

            if (settingMap.hasOwnProperty('pattern')) {
                if (!settingMap.pattern.test(newValue)) {
                    Farm.triggerEvent('Farm/settingError', [key])

                    return false
                }
            } else if (settingMap.hasOwnProperty('min')) {
                if (newValue < settingMap.min || newValue > settingMap.max) {
                    Farm.triggerEvent('Farm/settingError', [key, {
                        min: settingMap.min,
                        max: settingMap.max
                    }])

                    return false
                }
            }

            settingMap.updates.forEach(function (modifier) {
                modify[modifier] = true
            })

            Farm.settings[key] = newValue
        }

        Lockr.set('farm-settings', Farm.settings)

        if (modify.groups) {
            updateExceptionGroups()
            updateExceptionVillages()
        }

        if (modify.villages) {
            updatePlayerVillages()
        }

        if (modify.preset) {
            updatePresets()
            resetWaitingVillages()
        }

        if (modify.targets) {
            villagesTargets = {}
        }

        if (modify.events) {
            Farm.triggerEvent('Farm/resetEvents')
        }

        if (modify.fullStorage) {
            for (vid in waitingVillages) {
                if (waitingVillages[vid] === 'fullStorage') {
                    delete waitingVillages[vid]
                }
            }
        }

        if (modify.waitingVillages) {
            for (vid in waitingVillages) {
                if (waitingVillages[vid] === 'commands') {
                    delete waitingVillages[vid]
                }
            }
        }

        if (Farm.commander.running) {
            Farm.tempDisableEvents(function () {
                Farm.restart()
            })
        }

        Farm.triggerEvent('Farm/settingsChange', [modify])

        return true
    }

    /**
     * Seleciona o próximo alvo da aldeia.
     *
     * @param [_selectOnly] Apenas seleciona o alvo sem pular para o próximo.
     */
    Farm.nextTarget = function (_selectOnly) {
        var sid = selectedVillage.id

        // Caso a lista de alvos seja resetada no meio da execução.
        if (!villagesTargets[sid]) {
            Farm.commander.analyse()

            return false
        }

        var villageTargets = villagesTargets[sid]

        if (Farm.settings.priorityTargets && priorityTargets[sid]) {
            var priorityId

            while (priorityId = priorityTargets[sid].shift()) {
                if (ignoredVillages.includes(priorityId)) {
                    continue
                }

                for (var i = 0; i < villageTargets.length; i++) {
                    if (villageTargets[i].id === priorityId) {
                        selectedTarget = villageTargets[i]

                        return true
                    }
                }
            }
        }

        var index = targetIndexes[sid]
        var changed = false

        if (!_selectOnly) {
            index = ++targetIndexes[sid]
        }

        for (; index < villageTargets.length; index++) {
            var target = villageTargets[index]

            if (ignoredVillages.includes(target.id)) {
                Farm.triggerEvent('Farm/ignoredTarget', [target])

                continue
            }

            selectedTarget = target
            changed = true

            break
        }

        if (changed) {
            targetIndexes[sid] = index
        } else {
            selectedTarget = villageTargets[0]
            targetIndexes[sid] = 0
        }

        Lockr.set('farm-indexes', targetIndexes)

        return true
    }

    /**
     * Verifica se a aldeia selecionada possui alvos e se tiver, atualiza
     * o objecto do alvo e o índice.
     */
    Farm.hasTarget = function () {
        var sid = selectedVillage.id
        var index = targetIndexes[sid]
        var targets = villagesTargets[sid]

        if (!targets.length) {
            return false
        }

        // Verifica se os indices não foram resetados por ociosidade do
        // FarmOverflow.
        // Ou se o índice selecionado possui alvo.
        // Pode acontecer quando o numero de alvos é reduzido em um
        // momento em que o Farm não esteja ativado.
        if (index === undefined || index > targets.length) {
            targetIndexes[sid] = index = 0
        }

        return !!targets[index]
    }

    /**
     * Obtem a lista de alvos para a aldeia selecionada.
     */
    Farm.getTargets = function (callback) {
        var origin = selectedVillage.position
        var sid = selectedVillage.id

        if (sid in villagesTargets) {
            return callback()
        }

        // Carregando 25 campos a mais para preencher alguns setores
        // que não são carregados quando a aldeia se encontra na borda.
        var chunk = $conf.MAP_CHUNK_SIZE
        var x = origin.x - chunk
        var y = origin.y - chunk
        var w = chunk * 2
        var h = chunk * 2

        loadMapSectors(x, y, w, h, chunk, function (sectors) {
            var listedTargets = listTargets(sectors)
            var filteredTargets = filterTargets(listedTargets)
            var processedTargets = processTargets(filteredTargets)

            if (processedTargets.length === 0) {
                var hasVillages = Farm.nextVillage()

                if (hasVillages) {
                    Farm.getTargets(callback)
                } else {
                    Farm.triggerEvent('Farm/noTargets')
                }

                return false
            }

            villagesTargets[sid] = processedTargets.sort(function (a, b) {
                return a.distance - b.distance
            })

            if (targetIndexes.hasOwnProperty(sid)) {
                if (targetIndexes[sid] > villagesTargets[sid].length) {
                    targetIndexes[sid] = 0

                    Lockr.set('farm-indexes', targetIndexes)
                }
            } else {
                targetIndexes[sid] = 0

                Lockr.set('farm-indexes', targetIndexes)
            }

            callback()
        })
    }

    /**
     * Seleciona a próxima aldeia do jogador.
     *
     * @return {Boolean} Indica se houve troca de aldeia.
     */
    Farm.nextVillage = function () {
        if (singleVillage) {
            return false
        }

        if (Farm.settings.stepCycle) {
            return Farm.cycle.nextVillage()
        }

        var next = leftVillages.shift()

        if (next) {
            var availVillage = Farm.getFreeVillages().some(function (freeVillage) {
                return freeVillage.id === next.id
            })

            if (availVillage) {
                selectedVillage = next
                Farm.triggerEvent('Farm/nextVillage', [selectedVillage])
                Farm.updateActivity()

                return true
            } else {
                return Farm.nextVillage()
            }
        } else {
            leftVillages = Farm.getFreeVillages()

            if (leftVillages.length) {
                return Farm.nextVillage()
            }

            if (singleVillage) {
                Farm.triggerEvent('Farm/noUnits')
            } else {
                Farm.triggerEvent('Farm/noVillages')
            }

            return false
        }
    }

    /**
     * Verifica se aldeia tem os presets necessários ativados na aldeia
     * e ativa os que faltarem.
     *
     * @param {Array} presetIds - Lista com os IDs dos presets
     * @param {Function} callback
     */
    Farm.checkPresets = function (callback) {
        if (!selectedPresets.length) {
            Farm.pause()
            Farm.triggerEvent('Farm/noPreset')

            return false
        }

        var vid = selectedVillage.id
        var villagePresets = modelDataService.getPresetList().getPresetsByVillageId(vid)
        var needAssign = false
        var which = []

        selectedPresets.forEach(function (preset) {
            if (!villagePresets.hasOwnProperty(preset.id)) {
                needAssign = true
                which.push(preset.id)
            }
        })

        if (needAssign) {
            for (var id in villagePresets) {
                which.push(id)
            }

            assignPresets(which, callback)
        } else {
            callback()
        }
    }

    /**
     * Verifica se a aldeia atualmente selecionada tem os alvos carregados.
     *
     * @return {Boolean}
     */
    Farm.targetsLoaded = function () {
        return villagesTargets.hasOwnProperty(selectedVillage.id)
    }

    /**
     * Verifica se há alguma aldeia selecionada pelo FarmOverflow.
     *
     * @return {Boolean}
     */
    Farm.hasVillage = function () {
        return !!selectedVillage
    }

    /**
     * Verifica se a aldeia atualmente selecionada está em modo de espera.
     *
     * @return {Boolean}
     */
    Farm.isWaiting = function () {
        return waitingVillages.hasOwnProperty(selectedVillage.id)
    }

    /**
     * Verifica se a aldeia atualmente selecionada está ignorada.
     *
     * @return {Boolean}
     */
    Farm.isIgnored = function () {
        return ignoredVillages.includes(selectedVillage.id)
    }

    /**
     * Verifica se todas aldeias estão em modo de espera.
     *
     * @return {Boolean}
     */
    Farm.isAllWaiting = function () {
        for (var i = 0; i < playerVillages.length; i++) {
            var vid = playerVillages[i].id

            if (!waitingVillages.hasOwnProperty(vid)) {
                return false
            }
        }

        return true
    }

    /**
     * Atualiza o último status do FarmOverflow.
     *
     * @param {String} newLastEvents - Novo status
     */
    Farm.setLastEvents = function (newLastEvents) {
        lastEvents = newLastEvents

        updateLastEvents()
    }

    /**
     * Obtem o último status do FarmOverflow.
     *
     * @return {String}
     */
    Farm.getLastEvents = function () {
        return lastEvents
    }

    /**
     * Obtem a aldeia atualmente selecionada.
     *
     * @return {Object}
     */
    Farm.getSelectedVillage = function () {
        return selectedVillage
    }

    /**
     * Retorna se há apenas uma aldeia sendo utilizada pelo FarmOverflow.
     *
     * @return {Boolean}
     */
    Farm.isSingleVillage = function () {
        return singleVillage
    }

    /**
     * Obtem o alvo atualmente selecionado pelo FarmOverflow.
     *
     * @return {Object}
     */
    Farm.getSelectedTarget = function () {
        return selectedTarget
    }

    /**
     * Retorna se as notificações do FarmOverflow estão ativadas.
     *
     * @return {Boolean}
     */
    Farm.getNotifsEnabled = function () {
        return notifsEnabled
    }

    /**
     * Retorna se os eventos do FarmOverflow estão ativados.
     *
     * @return {Boolean}
     */
    Farm.getEventsEnabled = function () {
        return eventsEnabled
    }

    /**
     * Obtem o preset atualmente selecionado pelo FarmOverflow.
     *
     * @return {Array} Lista de presets que possuem a mesma identificação.
     */
    Farm.getSelectedPresets = function () {
        return selectedPresets
    }

    /**
     * Coloca uma aldeia em modo de espera.
     *
     * @param {Number} id - ID da aldeia.
     * @param {String=} reason - Identificação do motivo pelo qual a aldeia
     * foi adicionada a lista de espera.
     */
    Farm.setWaitingVillage = function (id, reason) {
        waitingVillages[id] = reason || true
    }

    /**
     * Obtem a lista de aldeias em modo de espera
     *
     * @return {Array}
     */
    Farm.getWaitingVillages = function () {
        return waitingVillages
    }

    /**
     * Coloca o FarmOverflow em modo de espera global, ou seja, todas aldeias
     * estão em modo de espera.
     */
    Farm.setGlobalWaiting = function () {
        globalWaiting = true
    }

    /**
     * Retorna se o FarmOverflow está em modo de espera global
     * (todas aldeias em modo de espera).
     *
     * @return {Boolean}
     */
    Farm.getGlobalWaiting = function () {
        return globalWaiting
    }

    /**
     * Obtem o último erro ocorrido no FarmOveflow.
     *
     * @return {String}
     */
    Farm.getLastError = function () {
        return lastError
    }

    /**
     * Altera a string do último erro ocorrigo no FarmOverflow.
     *
     * @param {String} error
     */
    Farm.setLastError = function (error) {
        lastError = error
    }

    /**
     * Retorna se o FarmOverflow já foi inicializado.
     *
     * @return {Boolean}
     */
    Farm.isInitialized = function () {
        return initialized
    }

    /**
     * Obtem o timestamp do último ataque realizado pelo FarmOverflow.
     *
     * @return {Number} Timestamp do último ataque.
     */
    Farm.getLastAttack = function () {
        return lastAttack
    }

    /**
     * Cria um novo controlador de comandos para o FarmOverflow.
     *
     * @return {Commander}
     */
    Farm.createCommander = function () {
        var Commander = require('two/farm/Commander')

        return new Commander()
    }

    /**
     * Altera a aldeia atualmente selecionada pelo FarmOverflow
     *
     * @param {Object} village - Aldeia a ser selecionada.
     */
    Farm.setSelectedVillage = function (village) {
        selectedVillage = village
    }

    /**
     * @param {Array} villages - Lista de aldeias restantes no ciclo.
     */
    Farm.setLeftVillages = function (villages) {
        leftVillages = villages
    }

    /**
     * Detecta se a aldeia está com o armazém lotado.
     *
     * @param {Village=} Objeto da aldeia a ser analisada, se não é usado
     * a aldeia atualmente selecionada.
     * @return {Boolean}
     */
    Farm.isFullStorage = function (village) {
        village = village || selectedVillage

        if (village.original.isReady()) {
            var resources = village.original.getResources()
            var computed = resources.getComputed()
            var maxStorage = resources.getMaxStorage()

            return ['wood', 'clay', 'iron'].every(function (res) {
                return computed[res].currentStock === maxStorage
            })
        }

        return false
    }

    /**
     * Obtem a lista de aldeias disponíveis para atacar
     *
     * @return {Array} Lista de aldeias disponíveis.
     */
    Farm.getFreeVillages = function () {
        return playerVillages.filter(function (village) {
            if (waitingVillages[village.id]) {
                return false
            } else if (Farm.settings.ignoreFullStorage) {
                if (Farm.isFullStorage(village)) {
                    waitingVillages[village.id] = 'fullStorage'
                    return false
                }
            }

            return true
        })
    }

    /**
     * Desativa o disparo de eventos temporariamente.
     */
    Farm.tempDisableNotifs = function (callback) {
        notifsEnabled = false
        callback()
        notifsEnabled = true
    }

    /**
     * Desativa o disparo de eventos temporariamente.
     */
    Farm.tempDisableEvents = function (callback) {
        eventsEnabled = false
        callback()
        eventsEnabled = true
    }

    /**
     * Só executa um evento quando for permitido.
     */
    Farm.triggerEvent = function (event, args) {
        if (eventsEnabled) {
            eventQueue.trigger(event, args)
        }
    }

    return Farm
})

define('two/farm/analytics', [
    'two/farm',
    'two/eventQueue',
    'Lockr'
], function (Farm, eventQueue, Lockr) {
    Farm.analytics = function () {
        ga('create', 'UA-92130203-4', 'auto', 'FarmOverflow')

        var player = modelDataService.getPlayer()
        var character = player.getSelectedCharacter()
        var data = []

        data.push(character.getName())
        data.push(character.getId())
        data.push(character.getWorldId())

        eventQueue.bind('Farm/sendCommand', function () {
            ga('FarmOverflow.send', 'event', 'commands', 'attack', data.join('~'))
        })
    }
})

define('two/farm/Commander', [
    'two/farm',
    'two/utils',
    'helper/math'
], function (
    Farm,
    utils,
    $math
) {
    var lastCommand = false

    /**
     * Controla os ciclos de comandos, enviando ataques, alternando
     * aldeias e alvos.
     */
    function Commander () {
        /**
         * Armazena o antecipadamente o próximo evento (noUnits/commandLimit)
         * evitando o script de fazer ações com os dados locais (tropas/comandos)
         * que ainda não foram atualizados pelo código nativo do jogo.
         *
         * @type {String|Boolean}
         */
        this.preventNextCommand = false

        /**
         * ID do timeout usado no intervalo entre cada ataque.
         * Utilizado para quando o FarmOverflow for parado
         * manualmente, os comandos com delay sejam parados
         * também.
         *
         * @type {Number}
         */
        this.timeoutId = null

        /**
         * Indica se o FarmOverflow está em funcionamento.
         *
         * @type {Boolean}
         */
        this.running = false

        return this
    }

    Commander.prototype.analyse = function () {
        var self = this

        if (!self.running) {
            return
        }

        if (!Farm.getSelectedPresets().length) {
            Farm.pause()
            Farm.triggerEvent('Farm/noPreset')

            return
        }

        if (!Farm.hasVillage()) {
            return Farm.triggerEvent('Farm/noVillageSelected')
        }

        var selectedVillage = Farm.getSelectedVillage()

        if (!selectedVillage.loaded()) {
            selectedVillage.load(function () {
                self.analyse()
            })

            return
        }

        if (Farm.isWaiting() || Farm.isIgnored()) {
            if (Farm.nextVillage()) {
                self.analyse()
            } else {
                Farm.triggerEvent(Farm.getLastError())
            }

            return
        }

        if (Farm.settings.ignoreFullStorage && Farm.isFullStorage()) {
            if (Farm.nextVillage()) {
                self.analyse()
            } else {
                self.handleError('fullStorage')
            }

            return
        }

        // Se aldeia ainda não tiver obtido a lista de alvos, obtem
        // os alvos e executa o comando novamente para dar continuidade.
        if (!Farm.targetsLoaded()) {
            return Farm.getTargets(function () {
                self.analyse()
            })
        }

        // Analisa se a aldeia selecionada possui algum alvo disponível
        // e o selecionada. Caso não tenha uma nova aldeia será selecionada.
        if (Farm.hasTarget()) {
            Farm.nextTarget(true)
        } else {
            if (Farm.nextVillage()) {
                self.analyse()
            } else {
                Farm.triggerEvent('Farm/noTargets')
            }

            return
        }

        Farm.checkPresets(function () {
            if (selectedVillage.countCommands() >= Farm.settings.commandsPerVillage) {
                return self.handleError('commandLimit')
            }

            var preset = self.getPreset()

            if (preset.error) {
                return self.handleError(preset.error)
            }

            self.getPresetNext(preset)
            self.send(preset)
        })
    }

    /**
     * Lida com as exceções no ciclo de comandos como "noUnits",
     * "commandLimit" e "timeLimit"
     *
     * @param {String} error - Erro a ser processado.
     */
    Commander.prototype.handleError = function (error) {
        Farm.setLastError(error || this.preventNextCommand)
        this.preventNextCommand = false

        var selectedVillage = Farm.getSelectedVillage()
        var sid = selectedVillage.id

        switch (Farm.getLastError()) {
        case 'timeLimit':
            Farm.nextTarget()
            this.analyse()

            break
        case 'noUnits':
            Farm.triggerEvent('Farm/noUnits', [selectedVillage])
            Farm.setWaitingVillage(sid, 'units')

            if (Farm.isSingleVillage()) {
                if (selectedVillage.countCommands() === 0) {
                    Farm.triggerEvent('Farm/noUnitsNoCommands')
                } else {
                    Farm.setGlobalWaiting()

                    if (Farm.settings.stepCycle) {
                        Farm.cycle.endStep()
                    }
                }

                return
            }

            if (Farm.nextVillage()) {
                this.analyse()
            } else {
                Farm.setGlobalWaiting()
            }

            break
        case 'commandLimit':
            Farm.setWaitingVillage(sid, 'commands')

            var singleVillage = Farm.isSingleVillage()
            var allWaiting = Farm.isAllWaiting()

            if (singleVillage || allWaiting) {
                var eventType = singleVillage
                    ? 'Farm/commandLimit/single'
                    : 'Farm/commandLimit/multi'

                Farm.triggerEvent(eventType, [selectedVillage])
                Farm.setGlobalWaiting()

                if (Farm.settings.stepCycle) {
                    return Farm.cycle.endStep()
                }
            }

            Farm.nextVillage()
            this.analyse()

            break
        case 'fullStorage':
            Farm.setWaitingVillage(sid, 'fullStorage')

            if (Farm.isSingleVillage()) {
                Farm.setGlobalWaiting()

                if (Farm.settings.stepCycle) {
                    return Farm.cycle.endStep()
                }

                Farm.triggerEvent('Farm/fullStorage')
            }

            break
        }
    }

    /**
     * Obtem o preset que houver tropas sulficientes e que o tempo do
     * comando não seja maior do que o configurado.
     *
     * @param {Object} [_units] Analisa as unidades passadas ao invés das
     * unidades atuais da aldeia.
     *
     * @return {Object} preset ou erro.
     */
    Commander.prototype.getPreset = function (_units) {
        var timeLimit = false
        var units = _units || Farm.getSelectedVillage().units
        var selectedPresets = Farm.getSelectedPresets()

        for (var i = 0; i < selectedPresets.length; i++) {
            var preset = selectedPresets[i]
            var avail = true

            for (var unit in preset.units) {
                if (units[unit].in_town < preset.units[unit]) {
                    avail = false
                }
            }

            if (avail) {
                if (this.checkPresetTime(preset)) {
                    return preset
                } else {
                    timeLimit = true

                    continue
                }
            }
        }

        return {
            error: timeLimit ? 'timeLimit' : 'noUnits'
        }
    }

    /**
     * Verifica a condição das tropas na aldeia do proximo comando.
     *
     * @param {Object} presetUsed - Preset usado no comando usado para simular
     * a redução de tropas para o proximo comando.
     */
    Commander.prototype.getPresetNext = function (presetUsed) {
        var unitsCopy = angular.copy(Farm.getSelectedVillage().units)
        var unitsUsed = presetUsed.units

        for (var unit in unitsUsed) {
            unitsCopy[unit].in_town -= unitsUsed[unit]
        }

        var result = this.getPreset(unitsCopy)

        if (result.error) {
            this.preventNextCommand = result.error
        }
    }

    /**
     * Verifica se o tempo de viagem do preset, da aldeia de origem até
     * a aldeia alvo não ultrapassa o tempo máximo.
     *
     * @param {Object} preset - Preset usado no calculo.
     */
    Commander.prototype.checkPresetTime = function (preset) {
        var selectedTarget = Farm.getSelectedTarget()
        var travelTime = armyService.calculateTravelTime(preset, {
            barbarian: !selectedTarget.pid,
            officers: false
        })

        var villagePosition = Farm.getSelectedVillage().position
        var targetPosition = {
            x: selectedTarget.x,
            y: selectedTarget.y
        }

        var distance = $math.actualDistance(villagePosition, targetPosition)

        var totalTravelTime = armyService.getTravelTimeForDistance(
            preset,
            travelTime,
            distance,
            'attack'
        )

        var limitTime = utils.time2seconds(Farm.settings.maxTravelTime)

        return limitTime > totalTravelTime
    }

    /**
     * Emite o envio do comando para o servidor.

     * @param {Object} preset - Preset a ser enviado
     * @param {Function} callback - Chamado após a confirmação de
     * alteração das tropas na aldeia.
     */
    Commander.prototype.send = function (preset, callback) {
        var now = Date.now()

        if (lastCommand && now - lastCommand < 100) {
            return false
        } else {
            lastCommand = now
        }

        if (!this.running) {
            return false
        }

        var self = this
        var unbindError
        var unbindSend
        var selectedVillage = Farm.getSelectedVillage()

        self.simulate()

        // Por algum motivo a lista de comandos de algumas aldeias
        // não ficam sincronizadas com os comandos registrados no servidor
        // então atualizamos por nossa própria conta o objeto com os
        // comandos e reiniciamos os ataques.
        unbindError = self.onCommandError(function () {
            unbindSend()

            selectedVillage.updateCommands(function () {
                self.analyse()
            })
        })

        unbindSend = self.onCommandSend(function () {
            unbindError()
            Farm.nextTarget()

            var interval

            // Intervalo mínimo de 1 segundo para que o jogo registre as
            // alterações das unidades no objeto local da aldeia.
            interval = utils.randomSeconds(Farm.settings.randomBase)
            interval = 100 + (interval * 1000)

            self.timeoutId = setTimeout(function () {
                if (self.preventNextCommand) {
                    return self.handleError()
                }

                self.analyse()
            }, interval)

            Farm.updateActivity()
        })

        socketService.emit(routeProvider.SEND_PRESET, {
            start_village: selectedVillage.id,
            target_village: Farm.getSelectedTarget().id,
            army_preset_id: preset.id,
            type: 'attack'
        })

        return true
    }

    /**
     * Chamado após a confirmação de alteração das tropas na aldeia.
     */
    Commander.prototype.onCommandSend = function (callback) {
        var selectedVillage = Farm.getSelectedVillage()
        var before = angular.copy(selectedVillage.units)

        var unbind = rootScope.$on(eventTypeProvider.VILLAGE_UNIT_INFO, function (event, data) {
            if (selectedVillage.id !== data.village_id) {
                return false
            }

            var now = selectedVillage.units
            var equals = angular.equals(before, now)

            if (equals) {
                return false
            }

            Farm.triggerEvent('Farm/sendCommand', [
                selectedVillage,
                Farm.getSelectedTarget()
            ])

            unbind()
            callback()
        })

        return unbind
    }

    /**
     * Chamado após a ocorrer um erro ao tentar enviar um comando.
     */
    Commander.prototype.onCommandError = function (callback) {
        var unbind = rootScope.$on(eventTypeProvider.MESSAGE_ERROR, function (event, data) {
            if (!data.cause || !data.code) {
                return false
            }

            if (data.cause !== 'Command/sendPreset') {
                return false
            }

            if (data.code !== 'Command/attackLimitExceeded') {
                return false
            }

            Farm.triggerEvent('Farm/sendCommandError', [data.code])

            unbind()
            callback()
        })

        return unbind
    }

    /**
     * Simula algumas requisições feita pelo jogo quando é enviado
     * comandos manualmente.
     *
     * @param {Object} callback
     */
    Commander.prototype.simulate = function (callback) {
        var attackingFactor = function () {
            socketService.emit(routeProvider.GET_ATTACKING_FACTOR, {
                target_id: Farm.getSelectedTarget().id
            })
        }

        attackingFactor()

        if (callback) {
            callback()
        }
    }

    return Commander
})

define('two/farm/cycle', [
    'two/farm',
    'two/locale',
    'two/utils',
    'two/eventQueue'
], function (
    Farm,
    Locale,
    utils,
    eventQueue
) {
    /**
     * Lista de aldeias restantes no ciclo único
     *
     * @type {Array}
     */
    var villageList = []

    /**
     * ID do timeout dos intervalos do cíclo unico.
     * Usado para evitar a continuidade dos ataques depois que o
     * FarmOverflow for parado manualmente
     *
     * @type {Number}
     */
    var timeoutId = null

    /**
     * Objeto que será exportado.
     *
     * @type {Object}
     */
    var cycle = {}

    /**
     * Verifica se o intervalo está ativado baseado no especificado
     * pelo jogador.
     *
     * @return {Boolean}
     */
    cycle.intervalEnabled = function () {
        return !!cycle.getInterval()
    }

    /**
     * Inicia o ciclo de ataques utilizando todas aldeias aldeias disponíveis.
     */
    cycle.startContinuous = function () {
        Farm.commander = Farm.createCommander()
        Farm.commander.running = true

        Farm.triggerEvent('Farm/start')

        if (Farm.getNotifsEnabled()) {
            utils.emitNotif('success', Locale('farm', 'general.started'))
        }

        if (!Farm.getFreeVillages().length) {
            if (Farm.isSingleVillage()) {
                if (Farm.isFullStorage()) {
                    Farm.triggerEvent('Farm/fullStorage')
                } else {
                    Farm.triggerEvent('Farm/noUnits')
                }
            } else {
                Farm.triggerEvent('Farm/noVillages')
            }

            return
        }

        Farm.setLeftVillages(Farm.getFreeVillages())

        Farm.commander.analyse()
    }

    /**
     * Inicia um ciclo de ataques utilizando todas aldeias aldeias
     * disponíveis apenas uma vez.
     *
     * @param  {Boolean} autoInit - Indica que o ciclo foi iniciado
     *   automaticamente depois do intervalo especificado nas
     *   configurações.
     */
    cycle.startStep = function (autoInit) {
        Farm.commander = Farm.createCommander()
        Farm.commander.running = true

        Farm.tempDisableNotifs(function () {
            Farm.triggerEvent('Farm/start')
        })

        var freeVillages = Farm.getFreeVillages()

        if (freeVillages.length === 0) {
            if (cycle.intervalEnabled()) {
                Farm.triggerEvent('Farm/stepCycle/next/noVillages')
                cycle.setNextCycle()
            } else 
{                // emit apenas uma notificação de erro
                Farm.triggerEvent('Farm/stepCycle/next/noVillages')

                Farm.tempDisableNotifs(function () {
                    Farm.pause()
                })
            }

            return
        }

        if (autoInit) {
            eventQueue.bind('Farm/stepCycle/restart')
        } else if (Farm.getNotifsEnabled()) {
            utils.emitNotif('success', Locale('farm', 'general.started'))
        }

        villageList = freeVillages

        Farm.commander.analyse()
    }

    /**
     * Lida com o final de um ciclo.
     */
    cycle.endStep = function () {
        if (cycle.intervalEnabled()) {
            Farm.triggerEvent('Farm/stepCycle/next')
            Farm.breakCommander()
            cycle.setNextCycle()
        } else {
            Farm.triggerEvent('Farm/stepCycle/end')

            Farm.tempDisableNotifs(function () {
                Farm.pause()
            })
        }

        return false
    }

    /**
     * Reinicia o ciclo depois do intervalo especificado
     * nas configurações.
     */
    cycle.setNextCycle = function () {
        var interval = cycle.getInterval()

        timeoutId = setTimeout(function () {
            cycle.startStep(true /*autoInit*/)
        }, interval)
    }

    /**
     * Seleciona a próxima aldeia do ciclo único.
     *
     * @return {Boolean} Indica se houve troca de aldeia.
     */
    cycle.nextVillage = function () {
        var next = villageList.shift()

        if (next) {
            var availVillage = Farm.getFreeVillages().some(function (free) {
                return free.id === next.id
            })

            if (!availVillage) {
                return cycle.nextVillage()
            }
        } else {
            return cycle.endStep()
        }

        Farm.setSelectedVillage(next)
        Farm.triggerEvent('Farm/nextVillage', [next])

        return true
    }

    /**
     * Converte o tempo do intervalo entre os ciclos de ataques
     * de string para number.
     *
     * @return {Number|Boolean} Retora o tempo em milisegundos caso
     *   seja válido, false caso seja uma string inválida.
     */
    cycle.getInterval = function () {
        var interval = Farm.settings.stepCycleInterval
        var parseError = false

        if (!interval) {
            return false
        }

        interval = interval.split(/\:/g).map(function (time) {
            if (isNaN(parseError)) {
                parseError = true
            }

            return parseInt(time, 10)
        })

        if (parseError) {
            return false
        }

        interval = (interval[0] * 1000 * 60 * 60) // horas
            + (interval[1] * 1000 * 60) // minutos
            + (interval[2] * 1000) // segundos

        return interval
    }

    /**
     * Retorna o ID do timeout usado nos ciclos com intervalos.
     *
     * @return {Number|Null}
     */
    cycle.getTimeoutId = function () {
        return timeoutId
    }

    Farm.cycle = cycle
})

define('two/farm/Village', [
    'models/CommandListModel',
    'models/CommandModel',
    'conf/village'
], function (
    CommandListModel,
    CommandModel,
    VILLAGE_CONFIG
) {
    // 'READY_STATES' : {
    //     'COMPLETED'         : 'completed',
    //     'EFFECTS'           : 'effects',
    //     'BUILDINGS'         : 'buildings',
    //     'UNITS'             : 'units',
    //     'UNIT_QUEUE'        : 'unit_queue',
    //     'RESOURCES'         : 'resources',
    //     'TRADES'            : 'trades',
    //     'TIMELINE'          : 'timeline',
    //     'BUILDING_QUEUE'    : 'buildingQueue',
    //     'COMMANDS'          : 'commands',
    //     'OWN_COMMANDS'      : 'ownCommands',
    //     'FOREIGN_COMMANDS'  : 'foreignCommands',
    //     'SCOUTING'          : 'scouting',
    //     'SCOUTING_COMMANDS' : 'scoutingCommands'
    // }

    /**
     * @class
     *
     * @param {VillageModel} original - Objeto original da aldeia.
     */
    function Village (original) {
        this.original = original
        this.id = original.data.villageId
        this.x = original.data.x
        this.y = original.data.y
        this.name = original.data.name
        this.units = original.unitInfo.units
        this.position = original.getPosition()
    }

    Village.prototype.countCommands = function () {
        var commands = this.original.getCommandListModel()

        // commands.getOutgoingCommands(true) obtem a lista de comandos
        // com exceção dos comandos de espionagem.
        return commands.getOutgoingCommands(true).length
    }

    Village.prototype.updateCommands = function (callback) {
        var self = this

        socketService.emit(routeProvider.GET_OWN_COMMANDS, {
            village_id: self.id
        }, function (data) {
            var commandList = new CommandListModel([], self.id)

            for (var i = 0; i < data.commands.length; i++) {
                var command = new CommandModel(data.commands[i])

                commandList.add(command)
            }

            self.original.setCommandListModel(commandList)

            callback()
        })
    }

    Village.prototype.commandsLoaded = function () {
        return this.original.isReady(VILLAGE_CONFIG.OWN_COMMANDS)
    }

    Village.prototype.unitsLoaded = function () {
        return this.original.isReady(VILLAGE_CONFIG.UNITS)
    }

    Village.prototype.loaded = function () {
        if (!this.original.isReady()) {
            return false
        }

        if (!this.original.isInitialized()) {
            return false
        }

        return this.commandsLoaded() && this.unitsLoaded()
    }

    Village.prototype.load = function (callback) {
        var self = this

        return villageService.ensureVillageDataLoaded(this.id, function () {
            if (!self.original.isInitialized()) {
                villageService.initializeVillage(self.original)
            }

            callback()
        })
    }

    return Village
})

require([
    'two/ready',
    'two/farm',
    'two/farm/ui',
    'two/farm/analytics',
    'two/farm/cycle'
], function (
    ready,
    Farm
) {
    if (Farm.isInitialized()) {
        return false
    }

    ready(function () {
        Farm.init()
        Farm.interface()
        Farm.analytics()
    })
})

define('two/farm/ui', [
    'two/farm',
    'two/locale',
    'two/ui',
    'two/ui/buttonLink',
    'two/FrontButton',
    'two/utils',
    'two/eventQueue',
    'helper/time',
    'ejs'
], function (
    Farm,
    Locale,
    Interface,
    buttonLink,
    FrontButton,
    utils,
    eventQueue,
    $timeHelper,
    ejs
) {
    var ui
    var opener
    var $window
    var $events
    var $last
    var $status
    var $start
    var $settings
    var $preset

    /**
     * Contagem de eventos inseridos na visualização.
     *
     * @type {Number}
     */
    var eventsCount = 1

    /**
     * Usado para obter a identificação dos presets e a descrição.
     *
     * @type {RegExp}
     */
    var rpreset = /(\(|\{|\[|\"|\')[^\)\}\]\"\']+(\)|\}|\]|\"|\')/

    /**
     * Tradução de "desativado" para a linguagem selecionada.
     *
     * @type {String}
     */
    var disabled

    /**
     * Lista de grupos disponíveis na conta do jogador
     *
     * @type {Object}
     */
    var groups

    /**
     * Elementos dos grupos usados pelo FarmOverflow.
     *
     * @type {Object}
     */
    var $groups

    /**
     * Loop em todas configurações do FarmOverflow
     *
     * @param {Function} callback
     */
    var eachSetting = function (callback) {
        $window.find('[data-setting]').forEach(function ($input) {
            var settingId = $input.dataset.setting

            callback($input, settingId)
        })
    }

    var saveSettings = function () {
        var newSettings = {}

        eachSetting(function ($input, settingId) {
            var inputType = Farm.settingsMap[settingId].inputType

            switch (inputType) {
            case 'text':
                newSettings[settingId] = $input.type === 'number'
                    ? parseInt($input.value, 10)
                    : $input.value

                break
            case 'select':
                newSettings[settingId] = $input.dataset.value

                break
            case 'checkbox':
                newSettings[settingId] = $input.checked

                break
            }
        })

        if (Farm.updateSettings(newSettings)) {
            utils.emitNotif('success', Locale('farm', 'settings.saved'))

            return true
        }

        return false
    }

    /**
     * Insere as configurações na interface.
     */
    var populateSettings = function () {
        eachSetting(function ($input, settingId) {
            var inputType = Farm.settingsMap[settingId].inputType

            switch (inputType) {
            case 'text':
                $input.value = Farm.settings[settingId]

                break
            case 'select':
                $input.dataset.value = Farm.settings[settingId]

                break
            case 'checkbox':
                if (Farm.settings[settingId]) {
                    $input.checked = true
                    $input.parentElement.classList.add('icon-26x26-checkbox-checked')
                }

                break
            }
        })
    }

    /**
     * Popula a lista de eventos que foram gerados em outras execuções
     * do FarmOverflow.
     */
    var populateEvents = function () {
        var lastEvents = Farm.getLastEvents()

        // Caso tenha algum evento, remove a linha inicial "Nada aqui ainda"
        if (lastEvents.length > 0) {
            $events.find('.nothing').remove()
        }

        lastEvents.some(function (event) {
            if (eventsCount >= Farm.settings.eventsLimit) {
                return true
            }

            if (!Farm.settings.eventAttack && event.type === 'sendCommand') {
                return false
            }

            if (!Farm.settings.eventVillageChange && event.type === 'nextVillage') {
                return false
            }

            if (!Farm.settings.eventPriorityAdd && event.type === 'priorityTargetAdded') {
                return false
            }

            if (!Farm.settings.eventIgnoredVillage && event.type === 'ignoredVillage') {
                return false
            }

            addEvent(event, true)
        })
    }

    /**
     * Configura todos eventos dos elementos da interface.
     */
    var bindEvents = function () {
        angularHotkeys.add(Farm.settings.hotkeySwitch, function () {
            Farm.switch()
        })

        angularHotkeys.add(Farm.settings.hotkeyWindow, function () {
            ui.openWindow()
        })

        $start.on('click', function () {
            Farm.switch()
        })

        $window.find('.save').on('click', function (event) {
            saveSettings()
        })
    }

    /**
     * Adiciona um evento na aba "Eventos".
     *
     * @param {Object} options - Opções do evento.
     * @param {Boolean=} _populate - Indica quando o script está apenas populando
     *      a lista de eventos, então não é alterado o "banco de dados".
     */
    var addEvent = function (options, _populate) {
        $events.find('.nothing').remove()

        if (eventsCount >= Farm.settings.eventsLimit) {
            $events.find('tr:last-child').remove()
        }

        var lastEvents = Farm.getLastEvents()

        if (lastEvents.length >= Farm.settings.eventsLimit) {
            lastEvents.pop()
        }

        addRow($events, options, _populate)
        eventsCount++

        if (!_populate) {
            options.timestamp = $timeHelper.gameTime()

            lastEvents.unshift(options)
            Farm.setLastEvents(lastEvents)
        }
    }

    /**
     * Adiciona uma linha (tr) com links internos do jogo.
     *
     * @param {Object} options
     * @param {Boolean} [_populate] - Indica quando o script está apenas populando
     *      a lista de eventos, então os elementos são adicionados no final da lista.
     */
    var addRow = function ($where, options, _populate) {
        var linkButton = {}
        var linkTemplate = {}
        var links = options.links
        var timestamp = options.timestamp || $timeHelper.gameTime()
        var eventElement = document.createElement('tr')

        if (links) {
            for (var key in links) {
                linkButton[key] = buttonLink(links[key].type, links[key].name, links[key].id)
                linkTemplate[key] = '<a id="' + linkButton[key].id + '"></a>'
            }

            options.content = Locale('farm', 'events.' + options.type, linkTemplate)
        }

        var longDate = utils.formatDate(timestamp)
        var shortDate = utils.formatDate(timestamp, 'HH:mm:ss')

        eventElement.innerHTML = ejs.render('<td class="tribe-event-time" tooltip="<#= longDate #>"><#= shortDate #></td><td class="tribe-event-detail"><span class="icon-bg-black icon-26x26-<#= icon #>"></span><div class="text-tribe-news"><span><#- content #></span></div></td>', {
            longDate: longDate,
            shortDate: shortDate,
            icon: options.icon,
            content: options.content
        })

        if (links) {
            for (var key in linkButton) {
                eventElement.querySelector('#' + linkButton[key].id).replaceWith(linkButton[key].elem)
            }
        }

        $where[_populate ? 'append' : 'prepend'](eventElement)

        // Recalcula o scrollbar apenas se a janela e
        // aba correta estiverem abertas.
        if (ui.isVisible('log')) {
            ui.recalcScrollbar()
        }

        ui.setTooltips()
    }

    /**
     * Atualiza o elemento com a aldeias atualmente selecionada
     */
    var updateSelectedVillage = function () {
        var $selected = $window.find('.selected')
        var selectedVillage = Farm.getSelectedVillage()

        if (!selectedVillage) {
            return $selected.html(Locale('common', 'none'))
        }

        var village = buttonLink('village', utils.genVillageLabel(selectedVillage), selectedVillage.id)

        $selected.html('')
        $selected.append(village.elem)
    }

    /**
     * Atualiza o elemento com a data do último ataque enviado
     * Tambem armazena para ser utilizado nas proximas execuções.
     *
     * @param {[type]} [varname] [description]
     */
    var updateLastAttack = function (lastAttack) {
        if (!lastAttack) {
            lastAttack = Farm.getLastAttack()

            if (lastAttack === -1) {
                return false
            }
        }

        $last.html(utils.formatDate(lastAttack))
    }

    /**
     * Atualiza a lista de grupos na aba de configurações.
     */
    var updateGroupList = function () {
        for (var type in $groups) {
            var $selectedOption = $groups[type].find('.custom-select-handler').html('')
            var $data = $groups[type].find('.custom-select-data').html('')

            appendDisabledOption($data, '0')

            for (var id in groups) {
                var name = groups[id].name
                var value = Farm.settings[type]

                if (value === '' || value === '0') {
                    $selectedOption.html(disabled)
                    $groups[type][0].dataset.name = disabled
                    $groups[type][0].dataset.value = ''
                } else if (value == id) {
                    $selectedOption.html(name)
                    $groups[type][0].dataset.name = name
                    $groups[type][0].dataset.value = id
                }

                appendSelectData($data, {
                    name: name,
                    value: id,
                    icon: groups[id].icon
                })

                $groups[type].append($data)
            }

            if (!Farm.settings[type]) {
                $selectedOption.html(disabled)
            }
        }
    }

    /**
     * Atualiza a lista de presets na aba de configurações.
     */
    var updatePresetList = function () {
        var loaded = {}
        var presets = modelDataService.getPresetList().presets

        var selectedPresetExists = false
        var selectedPreset = Farm.settings.presetName
        var $selectedOption = $preset.find('.custom-select-handler').html('')
        var $data = $preset.find('.custom-select-data').html('')

        appendDisabledOption($data)

        for (var id in presets) {
            var presetName = presets[id].name.replace(rpreset, '').trim()

            if (presetName in loaded) {
                continue
            }

            // presets apenas com descrição sem identificação são ignorados
            if (!presetName) {
                continue
            }

            if (selectedPreset === '') {
                $selectedOption.html(disabled)
                $preset[0].dataset.name = disabled
                $preset[0].dataset.value = ''
            } else if (selectedPreset === presetName) {
                $selectedOption.html(presetName)
                $preset[0].dataset.name = presetName
                $preset[0].dataset.value = presetName

                selectedPresetExists = true
            }

            appendSelectData($data, {
                name: presetName,
                value: presetName,
                icon: 'size-26x26 icon-26x26-preset'
            })

            loaded[presetName] = true
        }

        if (!selectedPresetExists) {
            $selectedOption.html(disabled)
            $preset[0].dataset.name = disabled
            $preset[0].dataset.value = ''
        }
    }

    /**
     * Gera uma opção "desativada" padrão em um custom-select
     *
     * @param  {jqLite} $data - Elemento que armazenada o <span> com dataset.
     * @param {String=} _disabledValue - Valor da opção "desativada".
     */
    var appendDisabledOption = function ($data, _disabledValue) {
        var dataElem = document.createElement('span')
        dataElem.dataset.name = disabled
        dataElem.dataset.value = _disabledValue || ''

        $data.append(dataElem)
    }

    /**
     * Popula o dataset um elemento <span>
     *
     * @param  {jqLite} $data - Elemento que armazenada o <span> com dataset.
     * @param  {[type]} data - Dados a serem adicionados no dataset.
     */
    var appendSelectData = function ($data, data) {
        var dataElem = document.createElement('span')

        for (var key in data) {
            dataElem.dataset[key] = data[key]
        }

        $data.append(dataElem)
    }

    function FarmInterface () {
        groups = modelDataService.getGroupList().getGroups()
        disabled = Locale('farm', 'general.disabled')

        ui = new Interface('FarmOverflow', {
            activeTab: 'settings',
            template: '<div class="win-content message-list-wrapper searchable-list ng-scope"><header class="win-head"><h2 class="ng-binding"><#= locale("farm", "title") #> <span class="small">v<#= version #></span></h2><ul class="list-btn"><li><a href="#" class="twOverflow-close size-34x34 btn-red icon-26x26-close"></a></li></ul></header><div class="tabs tabs-bg"><div class="tabs-two-col"><div class="tab" tab="settings"><div class="tab-inner"><div><a href="#" class="btn-icon btn-orange"><#= locale("common", "settings") #></a></div></div></div><div class="tab" tab="log"><div class="tab-inner"><div><a href="#" class="btn-icon btn-orange"><#= locale("common", "logs") #></a></div></div></div></div></div><div class="win-main"><div class="box-paper footer has-footer-upper twOverflow-content-settings"><p class="center"><#= locale("farm", "settings.docs") #> <a href="https://gitlab.com/twoverflow/farmoverflow/wikis/Documentation" target="_blank"><#= locale("common", "here") #></a>.</p><form class="settings"><h5 class="twx-section collapse"><#= locale("farm", "settings.settings") #></h5><table class="tbl-border-light tbl-striped"><colgroup><col width="40%"><col></colgroup><tbody><tr><td><span class="icon-34x34-preset"></span> <span class="ff-cell-fix"><#= locale("farm", "settings.presets") #></span></td><td><select data-setting="presetName" class="preset"></select></td></tr><tr><td><span class="icon-20x20-queue-indicator-short"></span> <span class="ff-cell-fix"><#= locale("farm", "settings.groupIgnore") #></span></td><td><select data-setting="groupIgnore" class="ignore"></select></td></tr><tr><td><span class="icon-20x20-queue-indicator-long"></span> <span class="ff-cell-fix"><#= locale("farm", "settings.groupInclude") #></span></td><td><select data-setting="groupInclude" class="include"></select></td></tr><tr><td><span class="icon-20x20-favourite"></span> <span class="ff-cell-fix"><#= locale("farm", "settings.groupOnly") #></span></td><td><select data-setting="groupOnly" class="only"></select></td></tr><tr><td><span class="ff-cell-fix"><#= locale("farm", "settings.randomBase") #></span></td><td><input data-setting="randomBase" type="number" class="textfield-border" min="0" required></td></tr><tr><td><span class="ff-cell-fix"><#= locale("farm", "settings.commandsPerVillage") #></span></td><td><input data-setting="commandsPerVillage" type="number" class="textfield-border" min="0" max="50" required></td></tr><tr><td><span class="icon-34x34-name_changed"></span> <span class="ff-cell-fix"><#= locale("farm", "settings.priorityTargets") #></span></td><td><label class="size-26x26 btn-orange icon-26x26-checkbox" for="settings-priorityTargets"><input id="settings-priorityTargets" type="checkbox" data-setting="priorityTargets"></label></td></tr><tr><td><span class="ff-cell-fix"><#- locale("farm", "settings.ignoreOnLoss") #></span></td><td><label class="size-26x26 btn-orange icon-26x26-checkbox" for="settings-ignoreOnLoss"><input id="settings-ignoreOnLoss" type="checkbox" data-setting="ignoreOnLoss"></label></td></tr><tr><td><span class="ff-cell-fix"><#- locale("farm", "settings.ignoreFullStorage") #></span></td><td><label class="size-26x26 btn-orange icon-26x26-checkbox" for="settings-ignoreFullStorage"><input id="settings-ignoreFullStorage" type="checkbox" data-setting="ignoreFullStorage"></label></td></tr></tbody></table><h5 class="twx-section collapse"><#= locale("farm", "settings.stepCycle/header") #></h5><table class="tbl-border-light tbl-striped"><colgroup><col width="40%"><col></colgroup><tbody><tr><td><span class="ff-cell-fix"><#= locale("farm", "settings.stepCycle") #></span></td><td><label class="size-26x26 btn-orange icon-26x26-checkbox" for="settings-stepCycle"><input id="settings-stepCycle" type="checkbox" data-setting="stepCycle"></label></td></tr><tr><td><span class="ff-cell-fix"><#= locale("farm", "settings.stepCycle/interval") #></span></td><td><input data-setting="stepCycleInterval" type="text" class="textfield-border" placeholder="00:00:00"></td></tr><tr><td><span class="ff-cell-fix"><#= locale("farm", "settings.stepCycle/notifs") #></span></td><td><label class="size-26x26 btn-orange icon-26x26-checkbox" for="settings-stepCycle/notifs"><input id="settings-stepCycle/notifs" type="checkbox" data-setting="stepCycleNotifs"></label></td></tr></tbody></table><h5 class="twx-section collapse"><#= locale("farm", "settings.targetFilters") #></h5><table class="tbl-border-light tbl-striped"><colgroup><col width="40%"><col></colgroup><tbody><tr><td><span class="icon-26x26-double-arrow"></span> <span class="ff-cell-fix"><#= locale("farm", "settings.minDistance") #></span></td><td><input data-setting="minDistance" type="number" class="textfield-border" min="0" max="60" required></td></tr><tr><td><span class="icon-26x26-double-arrow"></span> <span class="ff-cell-fix"><#= locale("farm", "settings.maxDistance") #></span></td><td><input data-setting="maxDistance" type="number" class="textfield-border" min="1" max="60" required></td></tr><tr><td><span class="icon-34x34-points-per-village"></span> <span class="ff-cell-fix"><#= locale("farm", "settings.minPoints") #></span></td><td><input data-setting="minPoints" type="number" class="textfield-border" required></td></tr><tr><td><span class="icon-34x34-points-per-village"></span> <span class="ff-cell-fix"><#= locale("farm", "settings.maxPoints") #></span></td><td><input data-setting="maxPoints" type="number" class="textfield-border" required></td></tr><tr><td><span class="icon-26x26-time"></span> <span class="ff-cell-fix"><#= locale("farm", "settings.maxTravelTime") #></span></td><td><input data-setting="maxTravelTime" type="text" class="textfield-border" pattern="\\d{1,2}:\\d{1,2}:\\d{1,2}" required></td></tr></tbody></table><h5 class="twx-section collapse"><#= locale("common", "logs") #></h5><table class="tbl-border-light tbl-striped"><colgroup><col width="40%"><col></colgroup><tbody><tr><td><span class="icon-26x26-info"></span> <span class="ff-cell-fix"><#= locale("farm", "settings.eventsLimit") #></span></td><td><input data-setting="eventsLimit" type="number" class="textfield-border" min="1" required></td></tr><tr><td><#= locale("farm", "settings.eventAttack") #></td><td><label class="size-26x26 btn-orange icon-26x26-checkbox" for="settings-eventAttack"><input id="settings-eventAttack" type="checkbox" data-setting="eventAttack"></label></td></tr><tr><td><#= locale("farm", "settings.eventVillageChange") #></td><td><label class="size-26x26 btn-orange icon-26x26-checkbox" for="settings-eventVillageChange"><input id="settings-eventVillageChange" type="checkbox" data-setting="eventVillageChange"></label></td></tr><tr><td><#= locale("farm", "settings.eventPriorityAdd") #></td><td><label class="size-26x26 btn-orange icon-26x26-checkbox" for="settings-eventPriorityAdd"><input id="settings-eventPriorityAdd" type="checkbox" data-setting="eventPriorityAdd"></label></td></tr><tr><td><#= locale("farm", "settings.eventIgnoredVillage") #></td><td><label class="size-26x26 btn-orange icon-26x26-checkbox" for="settings-eventIgnoredVillage"><input id="settings-eventIgnoredVillage" type="checkbox" data-setting="eventIgnoredVillage"></label></td></tr></tbody></table><h5 class="twx-section collapse"><#= locale("common", "others") #></h5><table class="tbl-border-light tbl-striped"><colgroup><col width="40%"><col></colgroup><tbody><tr><td><span class="icon-26x26-message-misc"></span> <span class="ff-cell-fix"><#= locale("farm", "settings.remote") #></span></td><td><input data-setting="remoteId" type="text" class="textfield-border" min="3" max="45"></td></tr><tr><td><#= locale("farm", "settings.hotkeySwitch") #></td><td><input data-setting="hotkeySwitch" type="text" class="textfield-border"></td></tr><tr><td><#= locale("farm", "settings.hotkeyWindow") #></td><td><input data-setting="hotkeyWindow" type="text" class="textfield-border"></td></tr></tbody></table></form></div><div class="box-paper footer has-footer-upper twOverflow-content-log"><div class="screen-tribe-news rich-text"><h5 class="twx-section collapse"><#= locale("common", "status") #></h5><table class="tbl-border-light tbl-news tbl-big-header"><colgroup><col width="135px"><col width="*"></colgroup><tbody><tr class="list-item"><td class="status" colspan="2" class="cell-center"><#= locale("common", "paused") #></td></tr><tr class="reduced"><td><#= locale("farm", "events.selectedVillage") #></td><td class="selected"></td></tr><tr class="reduced"><td><#= locale("farm", "events.lastAttack") #></td><td class="last"><#= locale("common", "none") #></td></tr></tbody></table><h5 class="twx-section collapse"><#= locale("common", "logs") #></h5><table class="tbl-border-light tbl-news tbl-big-header"><colgroup><col width="76px"><col></colgroup><tbody class="events"><tr class="reduced nothing"><td colspan="2"><div><span><#= locale("farm", "events.nothingYet") #></span></div></td></tr></tbody></table></div></div></div><footer class="win-foot"><ul class="list-btn list-center"><li class="twOverflow-button-settings"><a class="btn-orange btn-border save"><#= locale("common", "save") #></a></li><li class="twOverflow-button"><a class="btn-green btn-border start"><#= locale("common", "start") #></a></li></ul></footer></div>',
            replaces: {
                version: Farm.version,
                author: {"name":"Relaxeaza","email":"mafrazzrafael@gmail.com","url":"https://gitlab.com/relaxeaza","gitlab_user_id":518047},
                locale: Locale
            },
            css: '#FarmOverflow input[type="text"],#FarmOverflow input[type="number"],#FarmOverflow select{color:#000;min-width:70%}#FarmOverflow .info a{font-weight:bold;color:#544231}#FarmOverflow .settings .custom-select{width:70%}#FarmOverflow .settings .helper{font-weight:bold;vertical-align:-1px;font-family:helvetica;color:rgba(0,0,0,0.3)}#FarmOverflow .settings .helper:hover{color:#000}#FarmOverflow .settings [class^="icon-"]{display:inline;margin:0 9px 0 0}#FarmOverflow .settings .icon-34x34-preset,#FarmOverflow .settings .icon-26x26-time,#FarmOverflow .settings .icon-26x26-info,#FarmOverflow .settings .icon-26x26-double-arrow{zoom:.6}#FarmOverflow .settings .icon-34x34-preset:before,#FarmOverflow .settings .icon-26x26-time:before,#FarmOverflow .settings .icon-26x26-info:before,#FarmOverflow .settings .icon-26x26-double-arrow:before{-moz-transform:scale(.6)}#FarmOverflow .settings .icon-20x20-queue-indicator-short,#FarmOverflow .settings .icon-20x20-queue-indicator-long,#FarmOverflow .settings .icon-20x20-favourite{vertical-align:0px;margin:0 5px 0 0}#FarmOverflow .settings .icon-34x34-preset,#FarmOverflow .settings .icon-26x26-time{vertical-align:3px}#FarmOverflow .settings .icon-26x26-double-arrow{vertical-align:4px}#FarmOverflow .settings .icon-26x26-info{vertical-align:5px}#FarmOverflow .settings .icon-34x34-points-per-village,#FarmOverflow .settings .icon-34x34-name_changed{vertical-align:6px;zoom:.5}#FarmOverflow .settings .icon-34x34-points-per-village:before,#FarmOverflow .settings .icon-34x34-name_changed:before{-moz-transform:scale(.5)}#FarmOverflow .settings .icon-26x26-message-misc{vertical-align:1px}#FarmOverflow .settings .icon-34x34-general{zoom:.5}#FarmOverflow .settings .icon-34x34-general:before{-moz-transform:scale(.5)}#FarmOverflow .settings .icon-26x26-time-spy{zoom:.7}#FarmOverflow .settings .icon-26x26-time-spy:before{-moz-transform:scale(.7)}#FarmOverflow .settings td{text-align:center}#FarmOverflow .events tr{height:30px}#FarmOverflow .events tr td.tribe-event-time{white-space:nowrap}'
        })

        opener = new FrontButton('Farmer', {
            classHover: false,
            classBlur: false,
            onClick: function () {
                ui.openWindow()
            }
        })

        $window = $(ui.$window)
        $events = $window.find('.events')
        $last = $window.find('.last')
        $status = $window.find('.status')
        $start = $window.find('.start')
        $settings = $window.find('.settings')
        $preset = $window.find('.preset')
        $groups = {
            groupIgnore: $window.find('.ignore'),
            groupInclude: $window.find('.include'),
            groupOnly: $window.find('.only')
        }

        eventQueue.bind('Farm/sendCommand', function (from, to) {
            $status.html(Locale('farm', 'events.attacking'))
            updateLastAttack($timeHelper.gameTime())

            if (!Farm.settings.eventAttack) {
                return false
            }

            addEvent({
                links: {
                    origin: { type: 'village', name: utils.genVillageLabel(from), id: from.id },
                    target: { type: 'village', name: utils.genVillageLabel(to), id: to.id }
                },
                icon: 'attack-small',
                type: 'sendCommand'
            })
        })

        eventQueue.bind('Farm/nextVillage', function (next) {
            updateSelectedVillage()

            if (!Farm.settings.eventVillageChange) {
                return false
            }

            addEvent({
                links: {
                    village: { type: 'village', name: utils.genVillageLabel(next), id: next.id }
                },
                icon: 'village',
                type: 'nextVillage'
            })
        })

        eventQueue.bind('Farm/ignoredVillage', function (target) {
            if (!Farm.settings.eventIgnoredVillage) {
                return false
            }

            addEvent({
                links: {
                    target: { type: 'village', name: utils.genVillageLabel(target), id: target.id }
                },
                icon: 'check-negative',
                type: 'ignoredVillage'
            })
        })

        eventQueue.bind('Farm/priorityTargetAdded', function (target) {
            if (!Farm.settings.eventPriorityAdd) {
                return false
            }

            addEvent({
                links: {
                    target: { type: 'village', name: utils.genVillageLabel(target), id: target.id }
                },
                icon: 'parallel-recruiting',
                type: 'priorityTargetAdded'
            })
        })

        eventQueue.bind('Farm/noPreset', function () {
            addEvent({
                icon: 'info',
                type: 'noPreset'
            })

            $status.html(Locale('common', 'paused'))
        })

        eventQueue.bind('Farm/noUnits', function () {
            if (Farm.isSingleVillage()) {
                $status.html(Locale('farm', 'events.noUnits'))
            }
        })

        eventQueue.bind('Farm/noUnitsNoCommands', function () {
            $status.html(Locale('farm', 'events.noUnitsNoCommands'))
        })

        eventQueue.bind('Farm/start', function () {
            $status.html(Locale('farm', 'events.attacking'))
        })

        eventQueue.bind('Farm/pause', function () {
            $status.html(Locale('common', 'paused'))
        })

        eventQueue.bind('Farm/noVillages', function () {
            $status.html(Locale('farm', 'events.noVillages'))
        })

        eventQueue.bind('Farm/stepCycle/end', function () {
            $status.html(Locale('farm', 'events.stepCycle/nnd'))
        })

        eventQueue.bind('Farm/stepCycle/next', function () {
            var next = $timeHelper.gameTime() + Farm.cycle.getInterval()

            $status.html(Locale('farm', 'events.stepCycle/next', {
                time: utils.formatDate(next)
            }))
        })

        eventQueue.bind('Farm/stepCycle/next/noVillages', function () {
            var next = $timeHelper.gameTime() + Farm.cycle.getInterval()

            $status.html(Locale('farm', 'events.stepCycle/next/noVillages', {
                time: utils.formatDate(next)
            }))
        })

        eventQueue.bind('Farm/villagesUpdate', function () {
            updateSelectedVillage()
        })

        eventQueue.bind('Farm/loadingTargets/start', function () {
            $status.html(Locale('farm', 'events.loadingTargets'))
        })

        eventQueue.bind('Farm/loadingTargets/end', function () {
            $status.html(Locale('farm', 'events.analyseTargets'))
        })

        eventQueue.bind('Farm/attacking', function () {
            $status.html(Locale('farm', 'events.attacking'))
        })

        eventQueue.bind('Farm/commandLimit/single', function () {
            $status.html(Locale('farm', 'events.commandLimit'))
        })

        eventQueue.bind('Farm/commandLimit/multi', function () {
            $status.html(Locale('farm', 'events.noVillages'))
        })

        eventQueue.bind('Farm/resetEvents', function () {
            eventsCount = 0
            populateEvents()
        })

        eventQueue.bind('Farm/groupsChanged', function () {
            updateGroupList()
        })

        eventQueue.bind('Farm/presets/loaded', function () {
            updatePresetList()
        })

        eventQueue.bind('Farm/presets/change', function () {
            updatePresetList()
        })

        eventQueue.bind('Farm/start', function () {
            $start.html(Locale('common', 'pause'))
            $start.removeClass('btn-green').addClass('btn-red')
            opener.$elem.removeClass('btn-green').addClass('btn-red')
        })

        eventQueue.bind('Farm/pause', function () {
            $start.html(Locale('common', 'start'))
            $start.removeClass('btn-red').addClass('btn-green')
            opener.$elem.removeClass('btn-red').addClass('btn-green')
        })

        eventQueue.bind('Farm/settingError', function (key, replaces) {
            var localeKey = 'settingError.' + key

            utils.emitNotif('error', Locale('farm', localeKey, replaces))
        })

        eventQueue.bind('Farm/fullStorage', function () {
            $status.html(Locale('farm', 'events.fullStorage'))
        })

        if (modelDataService.getPresetList().isLoaded()) {
            updatePresetList()
        }

        populateSettings()
        bindEvents()
        updateGroupList()
        updateSelectedVillage()
        updateLastAttack()
        populateEvents()

        return ui
    }

    Farm.interface = function () {
        Farm.interface = FarmInterface()
    }
})

define('two/minimap', [
    'two/locale',
    'two/eventQueue',
    'two/ready',
    'Lockr',
    'struct/MapData',
    'conf/conf',
    'helper/time',
    'helper/mapconvert',
    'cdn'
], function (
    Locale,
    eventQueue,
    ready,
    Lockr,
    $mapData,
    $conf,
    $timeHelper,
    $mapconvert,
    $cdn
) {
    /**
     * All villages/players/tribes highlights.
     *
     * @type {Object}
     */
    var highlights

    /**
     * Size of a village icon in pixels.
     *
     * @type {Number}
     */
    var villageSize = 5

    /**
     * Margin between village icons in pixels.
     *
     * @type {Object}
     */
    var villageMargin = 1

    /**
     * Hex color regex validator.
     *
     * @type {RegExp}
     */
    var rhex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

    /**
     * Store loaded villages and it's respective owners/tribes in
     * a easy access mode.
     *
     * @type {Object}
     */
    var cache = {
        village: {},
        character: {},
        tribe: {}
    }

    /**
     * Cached villages from previous loaded maps.
     * Used to draw the "ghost" villages on the map.
     *
     * @type {Object}
     */
    var cachedVillages = {}

    /**
     * Data of the village that the user is hovering on the minimap.
     *
     * @type {Object}
     */
    var hoverVillage = null

    /**
     * Main canvas element.
     *
     * @type {Element}
     */
    var $viewport
    var $viewportContext

    /**
     * Main canvas cache element.
     * All village are draw here and applied to the main canvas by the render.
     * 
     * @type {Element}
     */
    var $viewportCache
    var $viewportCacheContext

    /**
     * Cross canvas element.
     * Current position on map is draw here.
     *
     * @type {Element}
     */
    var $cross
    var $crossContext

    /**
     * Game main canvas map.
     * Used to calculate the position cross position based on canvas size.
     *
     * @type {Element}
     */
    var $map

    /**
     * Player data.
     *
     * @type {Object}
     */
    var $player

    /**
     * Tribe diplomacy helper.
     *
     * @type {Object}
     */
    var $tribeRelations

    /**
     * Current selected village by the player.
     */
    var selectedVillage

    /**
     * Current position in the minimap in pixels.
     *
     * @type {Object}
     */
    var currentPosition = {}

    /**
     * Main canvas size.
     *
     * @type {Object}
     */
    var frameSize = {}

    /**
     * Used to block the jump-to-position when the minimap
     * is dragged and not just clicked.
     *
     * @type {Boolean}
     */
    var allowJump = true

    /**
     * Map data structure buffer.
     *
     * @type {ArrayBuffer}
     */
    var dataView

    /**
     * Minimap settings.
     * 
     * @type {Object}
     */
    var settings = {}

    /**
     * Calcule the coords from clicked position in the canvas.
     *
     * @param {Object} event - Canvas click event.
     * @return {Object} X and Y coordinates.
     */
    var getCoords = function (event) {
        var villageBlock = Minimap.getVillageBlock()
        var villageOffsetX = Minimap.getVillageAxisOffset()
        var rawX = Math.ceil(currentPosition.x + event.offsetX)
        var rawY = Math.ceil(currentPosition.y + event.offsetY)
        var adjustLine = Math.floor((rawY / villageBlock) % 2)

        if (adjustLine % 2) {
            rawX -= villageOffsetX
        }
        
        rawX -= rawX % villageBlock
        rawY -= rawY % villageBlock

        return {
            x: Math.ceil((rawX - frameSize.x / 2) / villageBlock),
            y: Math.ceil((rawY - frameSize.y / 2) / villageBlock)
        }
    }

    /**
     * Convert pixel wide map position to coords
     *
     * @param {Number} x - X pixel position.
     * @param {Number} y - Y pixel position.
     * @return {Object} Y and Y coordinates.
     */
    var pixel2Tiles = function (x, y) {
        return {
            x: (x / $conf.TILESIZE.x),
            y: (y / $conf.TILESIZE.y / $conf.TILESIZE.off)
        }
    }

    /**
     * Calculate the coords based on zoom.
     *
     * @param {Array[x, y, canvasW, canvasH]} rect - Coords and canvas size.
     * @param {Number} zoom - Current zoom used to display the game original map.
     * @return {Array} Calculated coords.
     */
    var convert = function (rect, zoom) {
        zoom = 1 / (zoom || 1)

        var xy = pixel2Tiles(rect[0] * zoom, rect[1] * zoom)
        var wh = pixel2Tiles(rect[2] * zoom, rect[3] * zoom)
        
        return [
            xy.x - 1,
            xy.y - 1,
            (wh.x + 3) || 1,
            (wh.y + 3) || 1
        ]
    }

    /**
     * Events related to minimap canvas.
     * - Keep the minimap current position based on mouse movement.
     * - Keep the minimap size accordly to the window size.
     * - Handle minimap clicks.
     */
    var canvasListeners = function () {
        var allowMove = false
        var dragStart = {}

        $cross.addEventListener('mousedown', function (event) {
            event.preventDefault()

            allowJump = true
            allowMove = true
            dragStart = {
                x: currentPosition.x + event.pageX,
                y: currentPosition.y + event.pageY
            }

            if (hoverVillage) {
                eventQueue.trigger('minimap/villageClick', [hoverVillage, event])

                // right click
                if (event.which === 3) {
                    easyHighlight(hoverVillage)
                }
            }
        })

        $cross.addEventListener('mouseup', function () {
            allowMove = false
            dragStart = {}

            if (!allowJump) {
                eventQueue.trigger('minimap/stop-move')
            }
        })

        $cross.addEventListener('mousemove', function (event) {
            allowJump = false

            if (allowMove) {
                currentPosition.x = dragStart.x - event.pageX
                currentPosition.y = dragStart.y - event.pageY
                eventQueue.trigger('minimap/start-move')
            }

            var coords = getCoords(event)

            if (coords.x in cache.village) {
                if (coords.y in cache.village[coords.x]) {
                    var village = $mapData.getTownAt(coords.x, coords.y)

                    // ignore barbarian villages
                    if (!settings.showBarbarians && !village.character_id) {
                        return false
                    }

                    return onHoverVillage(coords, event)
                }
            }

            onBlurVillage()
        })

        $cross.addEventListener('mouseleave', function () {
            if (hoverVillage) {
                onBlurVillage()
            }

            eventQueue.trigger('minimap/mouseLeave')
        })

        $cross.addEventListener('click', function (event) {
            if (!allowJump) {
                return false
            }

            var coords = getCoords(event)
            rootScope.$broadcast(eventTypeProvider.MAP_CENTER_ON_POSITION, coords.x, coords.y, true)
            preloadSectors(2, coords.x, coords.y)
        })

        $cross.addEventListener('contextmenu', function (event) {
            event.preventDefault()
            return false
        })
    }

    /**
     * Draw a village set on canvas.
     *
     * @param {Array} villages
     * @param {String=} _color - Force the village to use the
     *   specified color.
     */
    var drawVillages = function (villages, _color) {
        var v
        var x
        var y
        var color
        var pid = $player.getId()
        var tid = $player.getTribeId()
        var villageBlock = Minimap.getVillageBlock()
        var villageSize = Minimap.getVillageSize()
        var villageOffsetX = Minimap.getVillageAxisOffset()

        for (var i = 0; i < villages.length; i++) {
            v = villages[i]

            // meta village
            if (v.id < 0) {
                continue
            }

            if (_color) {
                color = _color
                
                x = v[0] * villageBlock
                y = v[1] * villageBlock

                if (v[1] % 2) {
                    x += villageOffsetX
                }
            } else {
                x = v.x * villageBlock
                y = v.y * villageBlock

                if (v.y % 2) {
                    x += villageOffsetX
                }

                if (v.character_id === null) {
                    if (!settings.showBarbarians) {
                        continue
                    }

                    if (v.id in highlights.village) {
                        color = highlights.village[v.id].color
                    } else {
                        color = settings.colorBarbarian
                    }
                } else {
                    if (v.character_id === pid) {
                        if (v.id === selectedVillage.getId()) {
                            color = settings.colorSelected
                        } else if (v.character_id in highlights.character) {
                            color = highlights.character[v.character_id].color
                        } else {
                            color = settings.colorPlayer
                        }
                    } else {
                        if (v.id in highlights.village) {
                            color = highlights.village[v.id].color
                        } else if (v.character_id in highlights.character) {
                            color = highlights.character[v.character_id].color
                        } else if (v.tribe_id in highlights.tribe) {
                            color = highlights.tribe[v.tribe_id].color
                        } else if (tid && tid === v.tribe_id) {
                            color = settings.colorTribe
                        } else if ($tribeRelations && settings.highlightDiplomacy) {
                            if ($tribeRelations.isAlly(v.tribe_id)) {
                                color = settings.colorAlly
                            } else if ($tribeRelations.isEnemy(v.tribe_id)) {
                                color = settings.colorEnemy
                            } else if ($tribeRelations.isNAP(v.tribe_id)) {
                                color = settings.colorFriendly
                            } else {
                                color = settings.colorUgly
                            }
                        } else {
                            color = settings.colorUgly
                        }
                    }
                }
            }

            $viewportCacheContext.fillStyle = color
            $viewportCacheContext.fillRect(x, y, villageSize, villageSize)
        }
    }

    var loadMapBin = function (callback) {
        var path = $cdn.getPath($conf.getMapPath())
        var xhr

        xhr = new XMLHttpRequest()
        xhr.open('GET', path, true)
        xhr.responseType = 'arraybuffer'
        xhr.addEventListener('load', function (data) {
            callback(xhr.response)
        }, false)

        xhr.send()
    }

    /**
     * Draw the map grid.
     */
    var drawGrid = function () {
        var villageBlock = Minimap.getVillageBlock()
        var villageOffsetX = Math.round(villageBlock / 2)
        var tile
        var x
        var y
        
        loadMapBin(function (bin) {
            dataView = new DataView(bin)

            for (x = 1; x < 999; x++) {
                for (y = 1; y < 999; y++) {
                    tile = $mapconvert.toTile(dataView, x, y)
                    
                    // is border
                    if (tile.key.b) {
                        // is continental border
                        if (tile.key.c) {
                            $viewportCacheContext.fillStyle = settings.colorContinent
                            $viewportCacheContext.fillRect(x * villageBlock + villageOffsetX - 1, y * villageBlock + villageOffsetX - 1, 3, 1)
                            $viewportCacheContext.fillRect(x * villageBlock + villageOffsetX, y * villageBlock + villageOffsetX - 2, 1, 3)
                        } else {
                            $viewportCacheContext.fillStyle = settings.colorProvince
                            $viewportCacheContext.fillRect(x * villageBlock + villageOffsetX, y * villageBlock + villageOffsetX - 1, 1, 1)
                        }
                    }
                }
            }
        })
    }

    /**
     * Draw all villages loaded befored the Minimap execution.
     */
    var drawLoadedVillages = function () {
        drawVillages($mapData.getTowns())
    }

    /**
     * Draw all villages previously loaded in other runs.
     */
    var drawCachedVillages = function () {
        var x
        var y
        var i
        var xx
        var yy
        var village
        var villageBlock = Minimap.getVillageBlock()
        var villageSize = Minimap.getVillageSize()
        var villageOffsetX = Minimap.getVillageAxisOffset()

        for (x in cachedVillages) {
            for (i = 0; i < cachedVillages[x].length; i++) {
                y = cachedVillages[x][i]
                xx = x * villageBlock
                yy = y * villageBlock

                if (y % 2) {
                    xx += villageOffsetX
                }

                $viewportCacheContext.fillStyle = settings.colorGhost
                $viewportCacheContext.fillRect(xx, yy, villageSize, villageSize)
            }
        }
    }

    /**
     * Draw the viewport cache to the main canvas.
     *
     * @param {Object} pos - Minimap current position plus center of canvas.
     */
    var drawViewport = function (pos) {
        clearViewport()
        $viewportContext.drawImage($viewportCache, -pos.x, -pos.y)
    }

    /**
     * Clear the main canvas.
     *
     * @return {[type]} [description]
     */
    var clearViewport = function () {
        $viewportContext.clearRect(0, 0, $viewport.width, $viewport.height)
    }

    /**
     * Draw the temporation items on cross canvas.
     *
     * @param {Object} pos - Minimap current position plus center of canvas.
     */
    var drawCross = function (pos) {
        clearCross()
        
        var villageBlock = Minimap.getVillageBlock()
        var lineSize = Minimap.getLineSize()
        var mapPosition = Minimap.getMapPosition()

        var x = ((mapPosition[0] + mapPosition[2] - 2) * villageBlock) - pos.x
        var y = ((mapPosition[1] + mapPosition[3] - 2) * villageBlock) - pos.y

        $crossContext.fillStyle = 'rgba(255,255,255,0.25)'
        $crossContext.fillRect(x | 0, 0, 1, lineSize)
        $crossContext.fillRect(0, y | 0, lineSize, 1)
    }

    /**
     * Clean the cross canvas.
     *
     * @return {[type]} [description]
     */
    var clearCross = function () {
        $crossContext.clearRect(0, 0, $cross.width, $cross.height)
    }

    /**
     * Update the current selected village on cache canvas.
     */
    var updateSelectedVillage = function () {
        var old = {
            id: selectedVillage.getId(),
            x: selectedVillage.getX(),
            y: selectedVillage.getY()
        }

        selectedVillage = $player.getSelectedVillage()

        drawVillages([{
            character_id: $player.getId(),
            id: old.id,
            x: old.x,
            y: old.y
        }, {
            character_id: $player.getId(),
            id: selectedVillage.getId(),
            x: selectedVillage.getX(),
            y: selectedVillage.getY()
        }])
    }

    /**
     * Main and cross canvas render loop.
     */
    var renderStep = function () {
        if(Minimap.interface.isVisible('minimap')) {
            var pos =  {
                x: currentPosition.x - (frameSize.x / 2),
                y: currentPosition.y - (frameSize.y / 2)
            }

            drawViewport(pos)
            drawCross(pos)
        }

        window.requestAnimationFrame(renderStep)
    }

    /**
     * Load some sectors of villages on map.
     *
     * @param {Number} sectors - Amount of sectors to be loaded,
     *   each sector has a size of 25x25 fields.
     * @param {Number=} x Optional load center X
     * @param {Number=} y Optional load center Y
     */
    var preloadSectors = function (sectors, _x, _y) {
        var size = sectors * 25
        var x = (_x || selectedVillage.getX()) - (size / 2)
        var y = (_y || selectedVillage.getY()) - (size / 2)

        $mapData.loadTownDataAsync(x, y, size, size, function () {})
    }

    /**
     * Parse the loaded villages to a quick access object.
     *
     * @param {Array} villages
     */
    var cacheVillages = function (villages) {
        for (var i = 0; i < villages.length; i++) {
            var v = villages[i]

            // meta village
            if (v.id < 0) {
                continue
            }

            if (!(v.x in cache.village)) {
                cache.village[v.x] = {}
            }

            if (!(v.x in cachedVillages)) {
                cachedVillages[v.x] = []
            }

            cache.village[v.x][v.y] = v.character_id || 0
            cachedVillages[v.x].push(v.y)

            if (v.character_id) {
                if (v.character_id in cache.character) {
                    cache.character[v.character_id].push([v.x, v.y])
                } else {
                    cache.character[v.character_id] = [[v.x, v.y]]
                }

                if (v.tribe_id) {
                    if (v.tribe_id in cache.tribe) {
                        cache.tribe[v.tribe_id].push(v.character_id)
                    } else {
                        cache.tribe[v.tribe_id] = [v.character_id]
                    }
                }
            }
        }

        Lockr.set('minimap-cacheVillages', cachedVillages)
    }

    /**
     * Executed when a village is hovered on minimap.
     *
     * @param {Object} coords - hovered village X and Y.
     */
    var onHoverVillage = function (coords, event) {
        if (hoverVillage) {
            if (hoverVillage.x === coords.x && hoverVillage.y === coords.y) {
                return false
            } else {
                onBlurVillage()
            }
        }

        eventQueue.trigger('minimap/villageHover', [
            $mapData.getTownAt(coords.x, coords.y),
            event
        ])

        hoverVillage = {
            x: coords.x,
            y: coords.y
        }

        var pid = cache.village[coords.x][coords.y]

        if (pid) {
            highlightVillages(cache.character[pid])
        } else {
            highlightVillages([[coords.x, coords.y]])
        }
    }

    /**
     * Executed when the mouse leave a village on minimap.
     */
    var onBlurVillage = function () {
        if (!hoverVillage) {
            return false
        }

        var pid = cache.village[hoverVillage.x][hoverVillage.y]

        if (pid) {
            unhighlightVillages(cache.character[pid])
        } else {
            unhighlightVillages([[hoverVillage.x, hoverVillage.y]])
        }

        hoverVillage = false
        eventQueue.trigger('minimap/villageBlur')
    }

    /**
     * Temporally highlight all villages from the hovered players.
     *
     * @param {Array} villages - Array of villages to be highlighted.
     */
    var highlightVillages = function (villages) {
        drawVillages(villages, settings.colorQuickHighlight)
    }

    /**
     * Unhighlight the temporally highlighted villages.
     *
     * @param {Array} villages - Array of villages to be highlighted.
     */
    var unhighlightVillages = function (villages) {
        var _villages = []

        for (var i = 0; i < villages.length; i++) {
            _villages.push($mapData.getTownAt(villages[i][0], villages[i][1]))
        }

        drawVillages(_villages)
    }

    var easyHighlight = function (coords) {
        var village = $mapData.getTownAt(coords.x, coords.y)
        var action = settings.rightClickAction
        var type
        var id

        if (!village) {
            return false
        }

        switch (settings.rightClickAction) {
        case 'highlight-player':
            if (!village.character_id) {
                return false
            }

            type = 'character'
            id = village.character_id

            break
        case 'highlight-tribe':
            if (!village.tribe_id) {
                return false
            }

            type = 'tribe'
            id = village.tribe_id

            break
        case 'highlight-village':
            type = 'village'
            id = village.id

            break
        }

        Minimap.addHighlight({
            type: type,
            id: id
        }, Minimap.colorPalette.random())
    }

    /**
     * Minimap
     *
     * @type {Object}
     */
    var Minimap = {}

    /**
     * Minimap version
     *
     * @type {String}
     */
    Minimap.version = '1.3.0'

    /**
     * Pre-loaded palette colors.
     * 
     * @type {Array}
     */
    Minimap.colorPalette = [
        '#000000', '#FFFFFF', '#969696', '#F0C800', '#0000DB', '#00A0F4', '#ED1212', '#BF4DA4', '#A96534', '#3E551C', '#436213', '#CCCCCC',
        '#868900', '#5100AF', '#7CC600', '#CC4DFF', '#DEC701', '#0120B0', '#98AB00', '#D512D7', '#01C46F', '#FF63FB', '#009132', '#190086', 
        '#95D86F', '#0045CF', '#C7CD53', '#6C75FF', '#CC8F00', '#008FFA', '#DF0004', '#22CBFF', '#FF3F28', '#00B184', '#99009F', '#96D68E',
        '#DD0080', '#0E5200', '#FF77E8', '#00602D', '#FF477C', '#01ACA2', '#C80030', '#01AFB8', '#BD3100', '#006AC3', '#DC5B00', '#031A70',
        '#EAC162', '#381058', '#FF9949', '#98B1FF', '#9A6B00', '#FAABFE', '#5F5500', '#FF78C3', '#94D3B9', '#BA004C', '#CAC0F0', '#6B2E00',
        '#EEB3EF', '#4A1F00', '#F8B5BC', '#43152D', '#FFAE82', '#6C004C', '#DEC2A0', '#990066', '#E6B9A8', '#8D0025', '#9B7892', '#FF745C'
    ]

    /**
     * @type {Object}
     */
    Minimap.settingsMap = {
        rightClickAction: {
            default: 'highlight-player',
            inputType: 'select',
            update: false
        },
        floatingMinimap: {
            default: false,
            inputType: 'checkbox',
            update: false
        },
        showDemarcations: {
            default: true,
            inputType: 'checkbox',
            update: true
        },
        showBarbarians: {
            default: true,
            inputType: 'checkbox',
            update: true
        },
        showGhostVillages: {
            default: true,
            inputType: 'checkbox',
            update: true
        },
        highlightDiplomacy: {
            default: true,
            inputType: 'checkbox',
            update: true
        },
        colorSelected: {
            default: '#ffffff',
            inputType: 'colorPicker',
            update: true
        },
        colorBarbarian: {
            default: '#969696',
            inputType: 'colorPicker',
            update: true
        },
        colorPlayer: {
            default: '#f0c800',
            inputType: 'colorPicker',
            update: true
        },
        colorTribe: {
            default: '#0000DB',
            inputType: 'colorPicker',
            update: true
        },
        colorAlly: {
            default: '#00a0f4',
            inputType: 'colorPicker',
            update: true
        },
        colorEnemy: {
            default: '#ED1212',
            inputType: 'colorPicker',
            update: true
        },
        colorFriendly: {
            default: '#BF4DA4',
            inputType: 'colorPicker',
            update: true
        },
        colorUgly: {
            default: '#A96534',
            inputType: 'colorPicker',
            update: true
        },
        colorGhost: {
            default: '#3E551C',
            inputType: 'colorPicker',
            update: true
        },
        colorQuickHighlight: {
            default: '#ffffff',
            inputType: 'colorPicker',
            update: true
        },
        colorBackground: {
            default: '#436213',
            inputType: 'colorPicker',
            update: true
        },
        colorProvince: {
            default: '#ffffff',
            inputType: 'colorPicker',
            update: true
        },
        colorContinent: {
            default: '#cccccc',
            inputType: 'colorPicker',
            update: true
        }
    }

    /**
     * Set the size of a village on minimap in pixels.
     * Recomened to be a even number.
     *
     * @type {Number} value
     */
    Minimap.setVillageSize = function (value) {
        villageSize = value
    }

    /**
     * Get the village size on minimap.
     *
     * @return {Number}
     */
    Minimap.getVillageSize = function () {
        return villageSize
    }

    /**
     * Set the margin between the villages on minimap in pixels.
     *
     * @type {Number} value
     */
    Minimap.setVillageMargin = function (value) {
        villageMargin = value
    }

    /**
     * Get the margin between the villages on minimap.
     *
     * @return {Number}
     */
    Minimap.getVillageMargin = function () {
        return villageMargin
    }

    /**
     * Get the size used by each village on minimap in pixels.
     *
     * @return {Number}
     */
    Minimap.getVillageBlock = function () {
        return villageSize + villageMargin
    }

    /**
     * Get the size of the minimap based on villages size.
     *
     * @return {Number}
     */
    Minimap.getLineSize = function () {
        return 1000 * (villageSize + villageMargin)
    }

    /**
     * Get the center position of a village icon.
     *
     * @return {Number}
     */
    Minimap.getVillageAxisOffset = function () {
        return Math.round(villageSize / 2)
    }

    /**
     * @param {Object} data - Highlight data.
     * @param {String} data.type - village, player or tribe
     * @param {String} data.id - village/player/tribe id
     * @param {Number=} data.x - village X coord.
     * @param {Number=} data.y - village Y coord.
     * @param {String} color - Hex color
     *
     * @return {Boolean} true if successfully added
     */
    Minimap.addHighlight = function (data, color) {
        var update = false

        if (!data.type || !data.id) {
            eventQueue.trigger('minimap/highlight/add/error/no-entry')
            return false
        }

        if (!rhex.test(color)) {
            eventQueue.trigger('minimap/highlight/add/error/invalid-color')
            return false
        }

        if (highlights[data.type].hasOwnProperty(data.id)) {
            update = true
        }

        var _data = { color: color}

        if (data.type === 'village') {
            _data.x = data.x
            _data.y = data.y
        }

        highlights[data.type][data.id] = _data
        Lockr.set('minimap-highlights', highlights)

        if (update) {
            eventQueue.trigger('minimap/highlight/update', [data, color])
        } else {
            eventQueue.trigger('minimap/highlight/add', [data, color])
        }

        drawLoadedVillages()

        return true
    }

    /**
     * @param {Object} data - Highlight data.
     * @param {String} data.type - village, player or tribe
     * @param {String} data.id - village/player/tribe id
     *
     * @return {Boolean} true if successfully removed
     */
    Minimap.removeHighlight = function (data) {
        if (highlights[data.type][data.id]) {
            delete highlights[data.type][data.id]
            Lockr.set('minimap-highlights', highlights)
            eventQueue.trigger('minimap/highlight/remove', [data])

            drawLoadedVillages()

            return true
        }

        return false
    }

    /**
     * @param {String} type - village, player or tribe
     * @param {String} item - village id, player name or tribe tag
     * @return {Object}
     */
    Minimap.getHighlight = function (type, item) {
        if (highlights[type].hasOwnProperty(item)) {
            return highlights[type][item]
        } else {
            return false
        }
    }

    /**
     * @return {Object}
     */
    Minimap.getHighlights = function () {
        return highlights
    }

    /**
     * @param {Function} callback
     */
    Minimap.eachHighlight = function (callback) {
        for (var type in highlights) {
            for (var id in highlights[type]) {
                callback(type, id, highlights[type][id])
            }
        }
    }

    /**
     * Set the viewport canvas element (main canvas);
     *
     * @param {Element} element - The canvas.
     */
    Minimap.setViewport = function (element) {
        $viewport = element
        $viewport.style.background = settings.colorBackground
        $viewportContext = $viewport.getContext('2d')
    }

    /**
     * Set the cross canvas element;
     *
     * @param {Element} element - The canvas.
     */
    Minimap.setCross = function (element) {
        $cross = element
        $crossContext = $cross.getContext('2d')
    }

    /**
     * Set the current position of the minimap view.
     *
     * @param {Number} x
     * @param {Number} y
     */
    Minimap.setCurrentPosition = function (x, y) {
        var block = Minimap.getVillageBlock()

        currentPosition.x = x * block + 50
        currentPosition.y = y * block + (1000 - ((document.body.clientHeight - 238) / 2)) + 50
    }

    /**
     * Calculate the coords of the current position of the map.
     *
     * @return {Array}
     */
    Minimap.getMapPosition = function () {
        var view = window.twx.game.map.engine.getView()

        return convert([
            -view.x,
            -view.y,
            $map.width / 2,
            $map.height / 2
        ], view.z)
    }

    /**
     * @param {Object} changes - New settings.
     * @return {Boolean} True if the internal settings changed.
     */
    Minimap.updateSettings = function (changes) {
        var newValue
        var key
        var settingMap
        var updateMinimap = false

        for (key in changes) {
            settingMap = Minimap.settingsMap[key]
            newValue = changes[key]

            if (!settingMap || angular.equals(settings[key], newValue)) {
                continue
            }

            if (settingMap.update) {
                updateMinimap = true
            }

            settings[key] = newValue
        }

        Lockr.set('minimap-settings', settings)

        if (updateMinimap) {
            Minimap.update()
        }

        return true
    }

    /**
     * Minimap settings.
     */
    Minimap.getSettings = function () {
        return settings
    }

    /**
     * Clear the viewport cache and redraw with the current settings.
     */
    Minimap.update = function () {
        var villageBlock = Minimap.getVillageBlock()

        $viewport.style.background = settings.colorBackground
        $viewportCache = document.createElement('canvas')
        $viewportCacheContext = $viewportCache.getContext('2d')
        $viewportCache.setAttribute('width', 1000 * villageBlock)
        $viewportCache.setAttribute('height', 1000 * villageBlock)
        $viewportCache.imageSmoothingEnabled = false
        
        if (settings.showDemarcations) {
            drawGrid()
        }

        if (settings.showGhostVillages) {
            drawCachedVillages()
        }

        drawLoadedVillages()
    }

    /**
     * Init the Minimap.
     */
    Minimap.init = function () {
        Locale.create('minimap', {"en":{"title":"Minimap","minimap":"Minimap","highlights":"Highlights","add":"Add highlight","remove":"Remove highlight","entry/id":"Village/player/tribe","highlight/add/success":"Highlight added","highlight/add/error":"Specify a highlight first","highlight/update/success":"Highlight updated","highlight/remove/success":"Highlight removed","highlight/villages":"Villages","highlight/players":"Players","highlight/tribes":"Tribes","highlight/add/error/exists":"Highlight already exists!","highlight/add/error/no-entry":"Select a village/player/tribe first!","highlight/add/error/invalid-color":"Invalid color!","village":"Village","player":"Player","tribe":"Tribe","color":"Color (Hex)","color-picker":"Select a color","misc-colors":"Miscellaneous colors","diplomacy-colors":"Diplomacy colors","settings.saved":"Settings saved!","settings.right-click-action":"Village's right click action","settings.easy-highlight-village":"Highlight village","settings.easy-highlight-player":"Highlight player","settings.easy-highlight-tribe":"Highlight tribe","settings.show-floating-minimap":"Show floating minimap","settings.show-demarcations":"Show province/continent demarcations","settings.show-barbarians":"Show barbarian villages","settings.show-ghost-villages":"Show non-loaded villages","settings.highlight-diplomacy":"Auto highlight tribe diplomacies","settings.colors.background":"Minimap background","settings.colors.province":"Province demarcation","settings.colors.continent":"Continent demarcation","settings.colors.quick-highlight":"Quick highlight","settings.colors.player":"Own villages","settings.colors.selected":"Selected village","settings.colors.ghost":"Non-loaded villages","settings.colors.ally":"Ally","settings.colors.pna":"PNA","settings.colors.enemy":"Enemy","settings.colors.other":"Other","settings.colors.barbarian":"Barbarian","tooltip.village":"Village","tooltip.village-points":"Village points","tooltip.player":"Player name","tooltip.player-points":"Player points","tooltip.tribe":"Tribe","tooltip.tribe-points":"Tribe points","tooltip.province":"Province name"},"pl":{"title":"Minimapa","minimap":"Kartograf","highlights":"Podświetlenie","add":"Dodaj podświetlenie","remove":"Usuń podświetlenie","entry/id":"Wioska/gracz/plemie","highlight/add/success":"Podświetlenie dodane","highlight/add/error":"Najpierw sprecyzuj podświetlenie","highlight/update/success":"Podświetlenie zaktualizowane","highlight/remove/success":"Podświetlenie usunięte","highlight/villages":"Wioski","highlight/players":"Gracze","highlight/tribes":"Plemiona","highlight/add/error/exists":"Podświetlenie już istnieje!","highlight/add/error/no-entry":"Najpierw wybierz wioskę/gracza/plemię!","highlight/add/error/invalid-color":"Nieprawidłowy kolor!","village":"Wioska","player":"Gracz","tribe":"Plemię","color":"Kolor (Hex)"},"pt":{"title":"Minimap","minimap":"Minimapa","highlights":"Marcações","add":"Adicionar marcação","remove":"Remover marcação","entry/id":"Aldeia/jogador/tribo","highlight/add/success":"Marcação adicionada","highlight/add/error":"Especifique uma marcação primeiro","highlight/update/success":"Marcação atualizada","highlight/remove/success":"Marcação removida","highlight/villages":"Aldeias","highlight/players":"Jogadores","highlight/tribes":"Tribos","highlight/add/error/exists":"Marcação já existe!","highlight/add/error/no-entry":"Selecione uma aldeia/jogador/tribo primeiro!","highlight/add/error/invalid-color":"Cor inválida!","village":"Aldeia","player":"Jogador","tribe":"Tribo","color":"Cor (Hex)","color-picker":"Selecione uma cor","misc-colors":"Cores diversas","diplomacy-colors":"Cores da diplomacia","settings.saved":"Configurações salvas!","settings.right-click-action":"Ação de clique direito na aldeia","settings.easy-highlight-village":"Marcar aldeia","settings.easy-highlight-player":"Marcar jogador","settings.easy-highlight-tribe":"Marcar tribo","settings.show-floating-minimap":"Mostrar minimapa flutuante","settings.show-demarcations":"Mostrar demarcações das provincias/continentes","settings.show-barbarians":"Mostrar aldeias bárbaras","settings.show-ghost-villages":"Mostrar aldeias não carregadas","settings.highlight-diplomacy":"Marcação automática baseado na diplomacia","settings.colors.background":"Fundo do minimapa","settings.colors.province":"Demarcação da provincia","settings.colors.continent":"Demarcação do continente","settings.colors.quick-highlight":"Marcação rápida","settings.colors.player":"Aldeias próprias","settings.colors.selected":"Aldeia selecionada","settings.colors.ghost":"Aldeias não carregadas","settings.colors.ally":"Aliados","settings.colors.pna":"PNA","settings.colors.enemy":"Inimigos","settings.colors.other":"Outros","settings.colors.barbarian":"Aldeias Bárbaras","tooltip.village":"Aldeia","tooltip.village-points":"Pontos da aldeia","tooltip.player":"Nome do jogador","tooltip.player-points":"Pontos do jogador","tooltip.tribe":"Nome da Tribo","tooltip.tribe-points":"Pontos da tribo","tooltip.province":"Nome da província"}}, 'en')

        Minimap.initialized = true

        $viewportCache = document.createElement('canvas')
        $viewportCacheContext = $viewportCache.getContext('2d')
        var localSettings = Lockr.get('minimap-settings', {}, true)

        for (var key in Minimap.settingsMap) {
            var defaultValue = Minimap.settingsMap[key].default

            settings[key] = localSettings.hasOwnProperty(key)
                ? localSettings[key]
                : defaultValue
        }

        highlights = Lockr.get('minimap-highlights', {
            village: {},
            character: {},
            tribe: {}
        }, true)
    }

    /**
     * Run the Minimap after the interface is loaded.
     */
    Minimap.run = function () {
        if (!Minimap.interfaceInitialized) {
            throw new Error('Minimap interface not initialized')
        }

        ready(function () {
            $map = document.getElementById('main-canvas')
            $player = modelDataService.getSelectedCharacter()
            $tribeRelations = $player.getTribeRelations()
            cachedVillages = Lockr.get('minimap-cacheVillages', {}, true)
            
            var villageBlock = Minimap.getVillageBlock()

            currentPosition.x = 500 * villageBlock
            currentPosition.y = 500 * villageBlock

            frameSize.x = 686
            frameSize.y = 2000

            $viewport.setAttribute('width', frameSize.x)
            $viewport.setAttribute('height', frameSize.y)
            $viewportContext.imageSmoothingEnabled = false

            $viewportCache.setAttribute('width', 1000 * villageBlock)
            $viewportCache.setAttribute('height', 1000 * villageBlock)
            $viewportCache.imageSmoothingEnabled = false

            $cross.setAttribute('width', frameSize.x)
            $cross.setAttribute('height', frameSize.y)
            $crossContext.imageSmoothingEnabled = false

            selectedVillage = $player.getSelectedVillage()
            currentPosition.x = selectedVillage.getX() * villageBlock
            currentPosition.y = selectedVillage.getY() * villageBlock

            if (settings.showDemarcations) {
                drawGrid()
            }

            if (settings.showGhostVillages) {
                drawCachedVillages()
            }

            canvasListeners()
            drawLoadedVillages()
            cacheVillages($mapData.getTowns())
            preloadSectors(2)
            renderStep()

            rootScope.$on(eventTypeProvider.MAP_VILLAGE_DATA, function (event, data) {
                drawVillages(data.villages)
                cacheVillages(data.villages)
            })

            rootScope.$on(eventTypeProvider.VILLAGE_SELECTED_CHANGED, function () {
                updateSelectedVillage()
            })

            rootScope.$on(eventTypeProvider.TRIBE_RELATION_CHANGED, function (event, data) {
                drawLoadedVillages()
            })
        }, ['initial_village', 'tribe_relations'])
    }

    return Minimap
})

define('two/minimap/data', [
    'two/minimap'
], function (
    Minimap
) {
    var Data = {}

    Minimap.data = Data
})


require([
    'two/ready',
    'two/minimap',
    'two/minimap/data',
    'two/minimap/ui'
], function (
    ready,
    Minimap
) {
    if (Minimap.initialized) {
        return false
    }

    ready(function () {
        Minimap.init()
        Minimap.interface()
        Minimap.run()
    })
})

define('two/minimap/ui', [
    'two/minimap',
    'two/locale',
    'two/ui',
    'two/ui/autoComplete',
    'two/FrontButton',
    'two/utils',
    'two/eventQueue',
    'ejs',
    'struct/MapData',
    'cdn'
], function (
    Minimap,
    Locale,
    Interface,
    autoComplete,
    FrontButton,
    utils,
    eventQueue,
    ejs,
    $mapData,
    cdn
) {
    var ui
    var opener

    /**
     * Window elements
     */
    var $window
    var $highlights
    var $entryInput
    var $entryIcon
    var $entryName
    var $entryColor
    var $entryAdd
    var $openColorPicker
    var $colorPicker
    var $tooltipBase
    var $tooltip
    var $crossCanvas
    var $minimapCanvas

    /**
     * Hex color regex validator.
     *
     * @type {RegExp}
     */
    var rhex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

    /**
     * Store the village/character/tribe selected by the player
     * to be added to highlight list.
     *
     * @type {Object}
     */
    var selectedHighlight = {}

    /**
     * Load tribe data.
     *
     * @param {Number}  id - Tribe ID.
     * @param {Function} 
     */
    var getTribeData = function (id, callback) {
        socketService.emit(routeProvider.TRIBE_GET_PROFILE, {
            tribe_id: id
        }, callback)
    }

    /**
     * Load player data.
     *
     * @param {Number}  id - Player ID.
     * @param {Function} 
     */
    var getPlayerData = function (id, callback) {
        socketService.emit(routeProvider.CHAR_GET_PROFILE, {
            character_id: id
        }, callback)
    }

    /**
     * Load village data by coords.
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Function} callback
     */
    var getVillageData = function (x, y, callback) {
        $mapData.loadTownDataAsync(x, y, 1, 1, callback)
    }

    /**
     * Display the added highlight on the view.
     *
     * @param {Object} data - Village/character/tribe data.
     * @param {String} data.type - 'village', 'character' or 'tribe'.
     * @param {Number} data.id - village/character/tribe ID.
     * @param {Number=} data.x - village X coord.
     * @param {Number=} data.y - village Y coord.
     * @param {String} color - Color on hex format.
     * @param {Boolean=} _update - Remove an existing entry to recreate.
     */
    var addHighlight = function (data, color, _update) {
        if (_update) {
            $highlights[data.type].find('[id$=' + data.id + ']').remove()
        }

        var $entry = document.createElement('tr')

        $entry.id = data.type + '-' + data.id
        $entry.innerHTML = ejs.render('<td class="entry-icon"><span class="icon-26x26-rte-<#= type #>"></span></td><td class="entry-name"></td><td><input class="entry-color" style="background:<#= color #>"></td><td><a href="#" class="entry-remove size-26x26 btn-red icon-20x20-close" tooltip="<#= locale("minimap", "remove") #>"></a></td>', {
            type: data.type,
            id: data.id,
            color: color,
            locale: Locale
        })

        $highlights[data.type].append($entry)

        var $entryIcon = $entry.querySelector('.entry-icon')
        var $entryName = $entry.querySelector('.entry-name')
        var $entryRemove = $entry.querySelector('.entry-remove')
        var $entryColor = $entry.querySelector('.entry-color')

        $entryIcon.addEventListener('click', function () {
            openProfile(data.type, data.id)
        })

        $entryName.addEventListener('click', function () {
            openProfile(data.type, data.id)
        })

        $entryRemove.addEventListener('click', function () {
            Minimap.removeHighlight(data)
        })

        $entryColor.addEventListener('click', function () {
            colorPicker.set(this, function (color) {
                $entryColor.style.background = color
                Minimap.addHighlight(data, color)
            })
        })

        if (data.type === 'tribe') {
            getTribeData(data.id, function (data) {
                $entryName.innerHTML = data.name
            })
        } else if (data.type === 'character') {
            getPlayerData(data.id, function (data) {
                $entryName.innerHTML = data.character_name
            })
        } else if (data.type === 'village') {
            getVillageData(data.x, data.y, function (data) {
                $entryName.innerHTML = utils.genVillageLabel(data)
            })
        }
        
        ui.setTooltips()
    }

    /**
     * Remove the removed highlight from the view.
     *
     * @param {Object} data - Village/character/tribe data.
     * @param {String} data.type - 'village', 'character' or 'tribe'.
     * @param {Number} data.id - village/character/tribe ID.
     */
    var removeHighlight = function (data) {
        var $entry = ui.$window.querySelector('#' + data.type + '-' + data.id)

        if ($entry) {
            $entry.remove()
        }
    }

    /**
     * Display all pre-added hightlights to the view.
     */
    var populateHighlights = function () {
        Minimap.eachHighlight(function (type, id, data) {
            var _data = {
                type: type,
                id: id
            }

            if (type === 'village') {
                _data.x = data.x
                _data.y = data.y
            }

            addHighlight(_data, data.color)
        })
    }

    /**
     * Shows tooltip when hovering a village on minimap.
     * 
     * @param {Object} village - Village data.
     * @param {Event} event - mousemove event.
     */
    var showTooltip = function (village, event) {
        $tooltip.villageName.html(utils.genVillageLabel(village))
        $tooltip.villagePoints.html(village.points.toLocaleString())
        
        if (village.character_id) {
            $tooltip.playerName.html(village.character_name)
            $tooltip.playerPoints.html(village.character_points.toLocaleString())
        } else {
            $tooltip.playerName.html('-')
            $tooltip.playerPoints.html('-')
        }
        
        if (village.tribe_id) {
            $tooltip.tribeName.html(village.tribe_name + ' (' + village.tribe_tag + ')')
            $tooltip.tribePoints.html(village.tribe_points.toLocaleString())
        } else {
            $tooltip.tribeName.html('-')
            $tooltip.tribePoints.html('-')
        }
        
        $tooltip.provinceName.html(village.province_name)

        $tooltipBase.css('display', '')
        $tooltipBase.css('top', event.pageY - 83 + 'px')
        $tooltipBase.css('left', event.pageX + 80 + 'px')
    }

    /**
     * Hides tooltip.
     */
    var hideTooltip = function () {
        $tooltipBase.css('display', 'none')
    }

    /**
     * Open a village/player/tribe profile window.
     *
     * @param {Number} id
     */
    var openProfile = function (type, id) {
        if (type === 'village') {
            windowDisplayService.openVillageInfo(id)
        } else if (type === 'character') {
            windowDisplayService.openCharacterProfile(id)
        } else if (type === 'tribe') {
            windowDisplayService.openTribeProfile(id)
        }
    }

    /**
     * Bind all elements events and notifications.
     */
    var bindEvents = function () {
        $entryInput.on('input', function () {
            var val = $entryInput.val()

            if (val.length < 2) {
                return autoComplete.hide()
            }

            autoComplete.search(val, function (data) {
                if (data.length) {
                    autoComplete.show(data, $entryInput[0], 'minimap')
                }
            })
        })

        $openColorPicker.on('click', function () {
            colorPicker.set(this, function (color) {
                setEntryColor(color)
            })
        })

        $entryAdd.on('click', function () {
            Minimap.addHighlight(selectedHighlight, $entryColor.val())
        })

        $entryColor.on('keyup', function () {
            setEntryColor(this.value)
        })

        $window.find('.save').on('click', function (event) {
            saveSettings()
        })

        rootScope.$on(eventTypeProvider.SELECT_SELECTED, function (event, id, data) {
            if (id !== 'minimap') {
                return false
            }

            selectedHighlight.id = data.id
            selectedHighlight.type = data.type

            if (data.type === 'village') {
                selectedHighlight.x = data.x
                selectedHighlight.y = data.y
            }

            $entryIcon[0].className = 'icon-26x26-rte-' + data.type
            $entryName.html(data.name)
        })

        eventQueue.bind('minimap/highlight/add', function (data, color) {
            addHighlight(data, color)
            utils.emitNotif('success', Locale('minimap', 'highlight/add/success'))
        })

        eventQueue.bind('minimap/highlight/update', function (data, color) {
            addHighlight(data, color, true)
            utils.emitNotif('success', Locale('minimap', 'highlight/update/success'))
        })

        eventQueue.bind('minimap/highlight/remove', function (data) {
            removeHighlight(data)
            utils.emitNotif('success', Locale('minimap', 'highlight/remove/success'))
        })

        eventQueue.bind('minimap/highlight/add/error/exists', function () {
            utils.emitNotif('error', Locale('minimap', 'highlight/add/error/exists'))
        })

        eventQueue.bind('minimap/highlight/add/error/no-entry', function () {
            utils.emitNotif('error', Locale('minimap', 'highlight/add/error/no-entry'))
        })

        eventQueue.bind('minimap/highlight/add/error/invalid-color', function () {
            utils.emitNotif('error', Locale('minimap', 'highlight/add/error/invalid-color'))
        })

        eventQueue.bind('minimap/villageHover', showTooltip)
        eventQueue.bind('minimap/villageBlur', hideTooltip)

        eventQueue.bind('minimap/mouseLeave', function () {
            hideTooltip()
            $crossCanvas.trigger('mouseup')
        })

        eventQueue.bind('minimap/start-move', function () {
            hideTooltip()
            $crossCanvas.css('cursor', 'url(' + cdn.getPath('/img/cursor/grab_pushed.png') + '), move')
        })

        eventQueue.bind('minimap/stop-move', function () {
            $crossCanvas.css('cursor', '') 
        })
    }

    var hex2rgb = function (hex) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
        var result

        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b
        })

        result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null
    }

    var colorBrightness = function(color){
        var rgb = hex2rgb(color)
        var brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
        return brightness > 127.5 ? '#000' : '#fff'
    }

    var setEntryColor = function (color) {
        if (!rhex.test(color)) {
            return false
        }

        $entryColor.val(color)
        $entryColor.css('background', color)
        $entryColor.css('color', colorBrightness(color))
    }

    var colorPicker = {
        callback: function () {},
        visible: false
    }

    colorPicker.init = function () {
        $colorPicker.find('div').click(function () {
            colorPicker.callback(this.dataset.color)
            colorPicker.hide()
        })
    }

    colorPicker.setCallback = function (callback) {
        colorPicker.callback = callback
    }

    colorPicker.hideHandler = function (event) {
        var elem = event.srcElement || event.target

        if (!utils.matchesElem(elem, '.color-picker')) {
            colorPicker.hide()
        }
    }

    colorPicker.show = function () {
        $colorPicker[0].style.display = ''
        colorPicker.visible = true
    }

    colorPicker.hide = function () {
        $colorPicker.hide()
        colorPicker.visible = false
        $(window).off('click', colorPicker.hideHandler)
    }

    colorPicker.set = function ($ref, callback) {
        if (colorPicker.visible) {
            colorPicker.hide()
        }

        colorPicker.show()
        colorPicker.setCallback(callback)

        var referenceRect = $ref.getBoundingClientRect()
        var colorPickerRect = $colorPicker[0].getBoundingClientRect()

        $colorPicker.css('left', referenceRect.left - (colorPickerRect.width) + 'px')
        $colorPicker.css('top', referenceRect.top - (colorPickerRect.height / 2) + 'px')

        setTimeout(function () {
            $(window).on('click', colorPicker.hideHandler)
        }, 100)
    }

    /**
     * Loop em todas configurações do BuilderQueue
     *
     * @param {Function} callback
     */
    var eachSetting = function (callback) {
        $window.find('[data-setting]').forEach(function ($input) {
            var settingId = $input.dataset.setting

            callback($input, settingId)
        })
    }

    var saveSettings = function saveSettings () {
        var newSettings = {}

        eachSetting(function ($input, settingId) {
            var inputType = Minimap.settingsMap[settingId].inputType

            switch (inputType) {
            case 'select':
                newSettings[settingId] = $input.dataset.value

                break
            case 'checkbox':
                newSettings[settingId] = $input.checked

                break
            case 'colorPicker':
                newSettings[settingId] = $input.style.background

                break
            }
        })

        if (Minimap.updateSettings(newSettings)) {
            utils.emitNotif('success', Locale('minimap', 'settings.saved'))

            return true
        }

        return false
    }

    /**
     * Insere as configurações na interface.
     */
    var populateSettings = function populateSettings () {
        var settings = Minimap.getSettings()

        eachSetting(function ($input, settingId) {
            var inputType = Minimap.settingsMap[settingId].inputType
            var value = settings[settingId]
            var $handler
            var $selected

            switch (inputType) {
            case 'select':
                $input.dataset.value = value
                $handler = $input.querySelector('.custom-select-handler')
                $selected = $input.querySelector('.custom-select-data [data-value=' + value + ']')
                $handler.innerText = $selected.dataset.name

                break
            case 'checkbox':
                if (value) {
                    $input.checked = true
                    $input.parentElement.classList.add('icon-26x26-checkbox-checked')
                }

                break
            case 'colorPicker':
                $input.style.background = value
                $input.addEventListener('click', function () {
                    colorPicker.set(this, function (color) {
                        $input.style.background = color
                    })
                })

                break
            }
        })
    }

    /**
     * Minimap interface init function.
     */
    var MinimapInterface = function () {
        ui = new Interface('Minimap', {
            activeTab: 'minimap',
            template: '<div class="win-content message-list-wrapper searchable-list ng-scope"><header class="win-head"><h2><#= locale("minimap", "title") #> <span class="small">v<#= version #></span></h2><ul class="list-btn"><li><a href="#" class="twOverflow-close size-34x34 btn-red icon-26x26-close"></a></li></ul></header><div class="tabs tabs-bg"><div class="tabs-three-col"><div class="tab" tab="minimap"><div class="tab-inner"><div><a href="#" class="btn-icon btn-orange"><#= locale("minimap", "minimap") #></a></div></div></div><div class="tab" tab="highlights"><div class="tab-inner"><div><a href="#" class="btn-icon btn-orange"><#= locale("minimap", "highlights") #></a></div></div></div><div class="tab" tab="settings"><div class="tab-inner"><div><a href="#" class="btn-icon btn-orange"><#= locale("common", "settings") #></a></div></div></div></div></div><div class="win-main"><div class="box-paper footer has-footer-upper twOverflow-content-minimap"><canvas class="cross"></canvas><canvas class="minimap"></canvas></div><div class="box-paper footer has-footer-upper twOverflow-content-highlights"><h5 class="twx-section"><#= locale("minimap", "add") #></h5><form class="addForm"><table class="tbl-border-light tbl-striped"><colgroup><col width="30%"><col width="6%"><col><col width="25%"></colgroup><tbody><tr><td class="item-input"><input type="text" class="textfield-border" autocomplete="off" placeholder="<#= locale("minimap", "entry/id") #>"></td><td><span class="item-icon"></span></td><td class="item-name"></td><td><input type="text" class="item-color textfield-border" value="#000000" tooltip="<#= locale("minimap", "color") #>"> <span class="open-color-picker btn-orange icon-26x26-rte-color-picker" tooltip="<#= locale("minimap", "color-picker") #>"></span> <span class="item-add btn-orange icon-26x26-plus" tooltip="<#= locale("minimap", "add") #>"></span></td></tr></tbody></table></form><div class="highlights"><h5 class="twx-section"><#= locale("minimap", "highlights") #></h5><table class="tbl-border-light tbl-striped"><colgroup><col width="6%"><col><col width="7%"><col width="7%"></colgroup> <# types.forEach(function (type) { #> <tbody class="<#= type #>"></tbody> <# }) #> </table></div></div><div class="box-paper footer has-footer-upper twOverflow-content-settings"><h5 class="twx-section"><#= locale("common", "misc") #></h5><form class="settings"><table class="tbl-border-light tbl-striped"><colgroup><col width="60%"><col></colgroup><tbody><tr><td><#= locale("minimap", "settings.right-click-action") #></td><td><select data-setting="rightClickAction"><option value="highlight-village"><#= locale("minimap", "settings.easy-highlight-village") #></option><option value="highlight-player"><#= locale("minimap", "settings.easy-highlight-player") #></option><option value="highlight-tribe"><#= locale("minimap", "settings.easy-highlight-tribe") #></option></select></td></tr><tr><td><#= locale("minimap", "settings.show-demarcations") #></td><td><label class="size-26x26 btn-orange icon-26x26-checkbox" for="settings-showDemarcations"><input id="settings-showDemarcations" type="checkbox" data-setting="showDemarcations"></label></td></tr><tr><td><#= locale("minimap", "settings.show-barbarians") #></td><td><label class="size-26x26 btn-orange icon-26x26-checkbox" for="settings-showBarbarians"><input id="settings-showBarbarians" type="checkbox" data-setting="showBarbarians"></label></td></tr><tr><td><#= locale("minimap", "settings.show-ghost-villages") #></td><td><label class="size-26x26 btn-orange icon-26x26-checkbox" for="settings-showGhostVillages"><input id="settings-showGhostVillages" type="checkbox" data-setting="showGhostVillages"></label></td></tr><tr><td><#= locale("minimap", "settings.highlight-diplomacy") #></td><td><label class="size-26x26 btn-orange icon-26x26-checkbox" for="settings-highlightDiplomacy"><input id="settings-highlightDiplomacy" type="checkbox" data-setting="highlightDiplomacy"></label></td></tr></tbody></table><h5 class="twx-section"><#= locale("minimap", "misc-colors") #></h5><table class="tbl-border-light tbl-striped"><colgroup><col width="60%"><col></colgroup><tbody><tr><td><#= locale("minimap", "settings.colors.background") #></td><td><input class="entry-color" data-setting="colorBackground"></td></tr><tr><td><#= locale("minimap", "settings.colors.province") #></td><td><input class="entry-color" data-setting="colorProvince"></td></tr><tr><td><#= locale("minimap", "settings.colors.continent") #></td><td><input class="entry-color" data-setting="colorContinent"></td></tr><tr><td><#= locale("minimap", "settings.colors.quick-highlight") #></td><td><input class="entry-color" data-setting="colorQuickHighlight"></td></tr><tr><td><#= locale("minimap", "settings.colors.player") #></td><td><input class="entry-color" data-setting="colorPlayer"></td></tr><tr><td><#= locale("minimap", "settings.colors.selected") #></td><td><input class="entry-color" data-setting="colorSelected"></td></tr><tr><td><#= locale("minimap", "settings.colors.ghost") #></td><td><input class="entry-color" data-setting="colorGhost"></td></tr></tbody></table><h5 class="twx-section"><#= locale("minimap", "diplomacy-colors") #></h5><table class="tbl-border-light tbl-striped"><colgroup><col width="60%"><col></colgroup><tbody><tr><td><#= locale("minimap", "settings.colors.ally") #></td><td><input class="entry-color" data-setting="colorAlly"></td></tr><tr><td><#= locale("minimap", "settings.colors.pna") #></td><td><input class="entry-color" data-setting="colorFriendly"></td></tr><tr><td><#= locale("minimap", "settings.colors.enemy") #></td><td><input class="entry-color" data-setting="colorEnemy"></td></tr><tr><td><#= locale("minimap", "settings.colors.other") #></td><td><input class="entry-color" data-setting="colorUgly"></td></tr><tr><td><#= locale("minimap", "settings.colors.barbarian") #></td><td><input class="entry-color" data-setting="colorBarbarian"></td></tr></tbody></table></form></div></div><footer class="win-foot"><ul class="list-btn list-center buttons"><li class="twOverflow-button-settings"><a class="btn-orange btn-border save"><#= locale("common", "save") #></a></li></ul></footer></div><div class="minimap-tooltip box-border-darker box-wrapper" style="display: none"><table class="tbl-border-light tbl-striped"><colgroup><col width="50%"><col width="50%"></colgroup><tbody><tr><td class="cell-space-left"><div class="ff-cell-fix"><span class="size-34x34 icon-bg-black icon-26x26-village"></span><div class="text"><span><#= locale("minimap", "tooltip.village") #></span><span class="overflow-ellipsis village-name"></span></div></div></td><td class="cell-space-left"><div class="ff-cell-fix"><span class="size-34x34 icon-bg-black icon-26x26-points"></span><div class="text"><span><#= locale("minimap", "tooltip.village-points") #></span><span class="village-points"></span></div></div></td></tr><tr><td class="cell-space-left"><div class="ff-cell-fix"><span class="size-34x34 icon-bg-black icon-34x34-player"></span><div class="text text-limited"><span><#= locale("minimap", "tooltip.player") #></span><span class="overflow-ellipsis player-name"></span></div></div></td><td class="cell-space-left"><div class="ff-cell-fix"><span class="size-34x34 icon-bg-black icon-26x26-points"></span><div class="text"><span><#= locale("minimap", "tooltip.player-points") #></span><span class="player-points"></span></div></div></td></tr><tr><td class="cell-space-left"><div class="ff-cell-fix"><span class="size-34x34 icon-bg-black icon-34x34-tribe"></span><div class="text text-limited"><span><#= locale("minimap", "tooltip.tribe") #></span><span class="overflow-ellipsis tribe-name"></span></div></div></td><td class="cell-space-left"><div class="ff-cell-fix"><span class="size-34x34 icon-bg-black icon-34x34-tribe-points"></span><div class="text"><span><#= locale("minimap", "tooltip.tribe-points") #></span><span class="tribe-points"></span></div></div></td></tr><tr><td colspan="2" class="cell-space-left"><div class="ff-cell-fix"><span class="size-34x34 icon-bg-black icon-34x34-province"></span><div class="text"><span><#= locale("minimap", "tooltip.province") #></span><span class="overflow-ellipsis province-name"></span></div></div></td></tr></tbody></table></div><div class="color-picker box-border-dark" style="display: none"> <# colorPalette.forEach(function (color) { #> <div style="background: <#= color #>" data-color="<#= color #>"></div> <# }) #> </div>',
            css: '#Minimap .minimap{position:absolute;left:0;top:0;z-index:0}#Minimap .cross{position:absolute;left:0;top:0;z-index:2}#Minimap .addForm .item-input input{width:100%}#Minimap .addForm .item-color{font-weight:100;width:83px}#Minimap .addForm td{text-align:center}#Minimap .highlights table{margin-bottom:10px}#Minimap .highlights td{text-align:center}#Minimap .highlights td.entry-name{text-align:left}#Minimap .highlights td.entry-name:hover{color:#fff;text-shadow:0 1px 0 #000}#Minimap .settings td{text-align:center}#Minimap .entry-color{background:#000000;height:26px;width:26px;display:inline-block;box-shadow:0 0 0 1px #421f09 inset,0 0 0 2px #976543 inset,0 0 0 3px #421f09 inset,0 0 1px 5px rgba(0,0,0,0.4) inset;text-shadow:1px 1px 0 #000;outline:none;border:none}#Minimap .entry-name{text-align:left;padding:0 10px}#Minimap .color-picker{width:317px;position:absolute;padding-left:2px;padding-bottom:2px;z-index:1000}#Minimap .color-picker div{width:25px;height:25px;float:left;box-shadow:0 0 0 1px #000000 inset,0 0 0 2px #976543 inset;margin-right:1px;margin-top:1px}#Minimap .minimap-tooltip{position:absolute;width:440px;z-index:4000;padding:3px;background:url("data:image/png; base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAA8ySURBVHjaTJl9WJblGcZ/vA+KaICIKO9AX81XBRRzoOgINbOlNit1ZZlrmsvclvaxnMu01frcZtbarFmrLZ3a9/pay1LT0rDUlTTSJab5FWIJIiiaCvtjv+c4Xo6DA3je57nv6zqv8zyv67lJKh42einQBhgNdAIeAjKBcqAv//9qBk5534vANOB9YDmQD9QBQ4BLgVbgTmAecD+wBkgGrgNe8rsZeA24CmgPLAFuB14F4sAk4ADwKHCl1zcYVzNQCgwH1gIBkAtkBNFYfLKL3QkMA9oBk4HOwCFgI3CTQW7wen9gk9dT3Dgf2OUzuf6dBXzPDUcZwLnAF8CbBnORQPUDPgK+BT4BFgKVwBFgm/usA6q9dpV7FALLgAnJwAgf+qULNgG/BdKBQcB2YIr3vWNSlwBD3eArKzYU+AZ423u3AV2AgcB5Bt4VmAXssfLdgI+Bwd7zpQm9aRUqreQs4ENB3GjVk4AVQAPQE6gMorF4o6Vs68LfMbhKIAf4MZBmeXsBLxvkZDcsAk4DMROd4zMfAD8HrgX+a8XbieoM4FMDSgVq/Bmxct2AE8CFxlNjbDtkxPvAfqu0BtgJ/CDigmXAUeBrNxti6ZPUzAQp0kckBgNPAFuA3ZY6MJnRUvZWn3tT1N8A7pLvJVI6H1jv53HR3wI8rcZmGttJ95wIbHWf94AbZVEp8IsI8EMF1wp0N5l0SzcC+CeQATwPjJE2HYC7DahBzfzRxMrdfDlQLA3XA/WCM0gq/dVA+gPnuO93BeYVKVnk7/cCF0u3wwI9QeouteIZQTQWH+yGlTpKGwO5DXhKSt0HVMnRTBccZjAVQDYwFfgHMB34vnrqBIwH9lrtiw1gPXCBdOpuJVqBt1y3J3CFoJ4GfgDcLLgvem+q1N/n9elBNBb/l6XsAHQ02NfdDFHs5aLVauWkiQ1X9PsV5WXAQZ9bZxIHDbrG3+8Bfg08q0lcr+mkAiMFpsJ9k4ABApBmTHuAF6ToQHWUDzQF0Vh8qOWtkwqvy+lCESrXHDZbzkar1l7djNJqAzlfqkXfIkipBpwukqu01RMaTBeDLze4H4r0dtly2qp09l7UY7l/97Ja44NoLD7A/jFFGzxmUF2AH4loRMe4VAveLfdrFG4/YCzwnAiOTqDuX0xqts/MAearhxvVW1upg3t9H/ibVdlvQmEfa1Vf24HPrfY1wFtBNBbPFfFaESmTw72tUJMO0qQ9Pi8qOQbbXX3kKvh3tNcNWn6NyLb1vp/KgHFSJrBqw723yRgGq9MjTgC1Tg1F0m2zuioEzgAbku0FLwNR4LhNaZr8X6jXZ0qXz1y81cQ2i+5f3HCnE8AdUuqMqJ7Wdc4ToBk60n7X2ywb7pBqLaK+G7hcF/23n/3b5pqiXur8Hh7RFvvqUBt0s9cMJNNNBloBNIA0O/2TTg577S33Ac8o4g1SdrZr5ug8veV8WkJ/Wuf152ym663MZYq/wsoNMvBiPz9qJXOArGQXbDbYbO11DrBSpJdoweNcfKb6GuSmQ3Sh3wFX2ySHWr1sAfhWCu3ULFZ6vUbgBpto3GCTDDDJJGqtTqX77NKIkowvH3gjWbutduEPDPBuxd9RalU4MI4wsW5u2mpVH1PwL9kn7rHbr9DGc71vBrBYjR4wyFpBqLU5ZyWsHX5WAzyi076h5i5yWnjI6vw62Wa3yQ3f0pnu8nfkZ1wr/rMOg9RZCPzevgHwuD1gohV732o8qOaapBPqbJfU7Ox6m5yYD6mXRwS1QLBa1VKqAN5kbGuArRFt7bAPF0mJxS66zCRmSYXwaxtwNsGlKuT2GuB8dfgTYK5jxwMmGrEqq63YcQWdpgn10QzWAAs0h/edGQ8BefaUj4EbfPaYSR4NJ4CPLPscURhrwzzj7LUDWORi4TiTIw2PaqFbpcdcgRhjUhcZ1C+04llW4nzd63bvu9S1n3AkShf9WrVRoxN2tU+11x0PCk5pRKRHOMJXaounpFBvPb+tC+eJyjbd7FEDv8Kkz0ipKimV51q7pd+XVqlcF0MdbPQ14T/SvY8UKzCGA855mVIYK/Z3k5sHnAiisfid3pyaMNWmSbGjWu0k3yv22Y/SRDbLRPc6hlwkRYoMbIT3hi2g3sROSOe/2skX2GyTvN7fme9Z97xWsCql1Srv3WLVy4G+ETOslstpWmu92Y5RP/NEo1XBt3GiXu+1QP5WmPhZTeSfrtvTNdsZfKbUmKehLNG1Njpl9/a+G2zKreoryaRCIyoWpGZgVRCNxbvYa+qkVJYZT3FAzJaXbaVAuZyvM9kMNXXcBrvX9VoM4oxWnqXO4jpdvTRKsSnvlq5pHoC00QnPAg9b6Z4C0jfhNfq008e+iO8KzS66zDL3taM/rEvdKhVzdZZFLvS4U8Ai7xvopmOtyoc2xYj6OWZVnrPnBGorQ7e61b6GWqhT+OOsXKZA/9gk2rr2JKBtEI3F/+SMVGjD224Jk5x+w9mnVhdbbwCXOd2W+9L1sBQYZoV32MPKpW4J0MNnlyvoRq/vUAffdX+06l6ul6oTXuB0sddKV6nVHsAnQTQWf8BSfp7wZveu2S5y8yMOn7v9mZnwprfTzyfad9JEequNt4fBdbS3pArIEUeo8FU9nN7HSpurrdwqp48mm3MnHbRGh2xSa1cnu1EfP8i2Su2sTDddpav35TpbtTHgVdIyRYda7CvCCqtyjuA8Kn32CNwSA/iZNH1EjRbqoLdp2ROk83HPAu537xd8wTvs1NArPAMYKXob7AlhQkO02E2+g3zjXHaOyTdqlbmOGjn2pnsFoUVQJqqXCvW2XQD2ODq9bPC3aAAxA05xRmxn8i8lnLR29ZVipu7XFfgsiMbitXbfngZeqBjPU8yvJLjMci240M+STXiXIp2kuHOdvjuLYqbc729Cl4vm96RThV3/lBNAsX2twaRKtOt9UvI+28nNTi+NQGkQjcVni3qZG+b6TvGMZ1f9vPkNUV/nRjE5Xa2FrxOhVKlSr2N9ZTU/dVSv0gXXqrdhBtot4SDypM25zp/7nCHzjWWc979rkx8IPJ0sZ6sSmuQz0mKG5X5bQY5SR0+qnw9EuaP06uRhxiGBKbbP5Jl4kc8VmeB8e1CjHb7WcSds2pW+y+x0fBrvPhElMFNDanAezAiisfhOnadMZyiVl4Vmnq3/J5t0vkG1VcCDtOZndcOzNsN0X6TG2yjftpvPMoCbDP5TK3pcCt3o/VMEMFUaR5TBJK08x7OGqEnnBtFYPMXgV+vjVxvIGdE6qIOlmsA2BVlsn7lETezxZ2+Hxjz5/CcHwgZfsbsbRAe/w8Z9o002PGPLcq+vffVenXBwXulYNdJG/B0gGkRj8SLFPcrMuxv8UtHbaIXypFC6fJ9m2UvV2R/8fZOgdFArY31uqhrINLHV0ra7L2rtpOAY3fV53bO300SBBlHtc7cJdovVTYuIXJkfNFriXja8uaLxRztthoEulLej3Hi8m29V/DNd7y2TSxW9V30FqEg4dq02oXz7xgHfVXJc416BOyQtM5zGT/hMOCy3BNFY/LBW2UXqbPbvznbaNs5q+x3xz9ocr5S/z4rUp+os240PepC30p9J9o0WLbXSfcqkS0vC6c0A32ybFXnUyhzXeXtI1cdsAenAx8lu8luRau+bX1LCsFdiAmcd8pp1rgYPLlKkYp7CHCcdbhaEeo1loToIJ/ERHjZOl3KjnBLS1W04n71nHPX2vruMb7O/b1TL+UE0Fj+rK5UlvApP9+YFVuZ5G1x/EQ+PlY4q7iel5lYRznYUmS3KIZoFCeIP1Gadou/i5/29vtiED6jFDiZaKCOOCMKVPtctiMbiS0Whr3QYqJP1losVHk7kiHh4+vmNU+4VLvaUb5m/Sfh/S3cn3Lnae7PNtY+9p6du1FE69bE5n5AhUwx2g4lMcI1zTbSH1GwEXgqisXiTD57y/X2+DbNEtBYqtMku2lOLPWJVSn0PukEQhupY4elji0HtllYPyf1fSo/wAH50wjSQIyO+SJhKSgRurXad4n5feP2JIBqLl9gvTlv6oY4wB3WTNSJ9vXa4xdJfKPJ3mMha7TfVPnOvvaezDnhaxLe49t1yfqwNdYZjzCDpOshEqhOa6wndN66BZEu5M0D3iCWaL4I/NZkCb6iSguG/Brcq9JaEsWOWSCGHw4PDcI5KS5gYGgw62WOtet9twuPXsdpzkjR8x7W3ud8Y18qTkh8K2IPAA8kuPsSqnBbV4dLnuIcH/9Wm86zSLqs3IEEbV6qllVZotsFeYuUfd1a7zQa5wHVT1cAW7XiB/eew70uXmnCpbrhfML60Or/Sha8NorH4Csfuck8LV/iOXWGSddKkKuFf12tsgp85sgRen6995svlfPlf4PpnpOtw9dPBKqz03lfU22S/w/9C32plSzWgB22+aX5eBhREpEw3+0ixFowCqzfoiF34qMjN9d4Unx0gx8NzrSWK9k2rtsfm1kGUvxT5YwnnX9W++/TTVadrAkWCN1Vdnqv7VRpDg+uvDqKxeKVBvWrg15vMARP9QgRWSoN3pFM7qdfo9Q+0yTnab7YIFiWsk+TzF2irP5NGnXXJLVL4cp/PkVYnbdSjbR0TBatKmu4E3o3YX/rZH8L3g2kiV6Xw92jRo0TrKxO/y+8MA50mENeZxNOuM9TvFoNoI2XW6mon/HueDna+ySx1erjYZzpY9WXuM8Q4TgKxIBqLv2q5l+sWnaTXRzrVf8y+q1QakTDBfqwTrVPoJW6SZbUzDeIWER7mGvuk6yETKLBSx0X5GSs10ljqE6rTIMDZTh4Rv0cnW+Jh2lyTIh9tp33Q7KfbmdtLvx1Wok5UpxrEE07MjxnocGnVzjWf8r8BZX4+0PHkdp2u1FiusbkGPn+NWrvO+z7REJZ5QLIYeDyIxuJ362KLRKxMgbboFKXOXYdc4HOHuyyp1FmBPuyzaQ6HDVKqnxa80soPEOEBHh31ct2LvW+mzpguBS908qixGi9L3QIniwu06qPJVuN+SzrVJjXGuex3JhWevIRCfs++ctK+s0/ttNihy0Vwq3qaIFWLTTD86m11J2gg+QmBznW6+NbPLzGRfBN8Sg01W/lrIvaGSZYrovhOOXL8QZGOtAJTbJIPWZWudv2rrE6NY0x4InODWmljMufJ/3s8+OuqNr72/gIpXeuRVokUypfmBwW6SCdMMu6bgWP/GwDmXORXKDEySwAAAABJRU5ErkJggg==") #45505c;transition:opacity .5s;top:20px;left:20px}#Minimap .minimap-tooltip.left{left:-410px}#Minimap .minimap-tooltip.top{top:-220px}#Minimap .minimap-tooltip .text span{width:100%;float:left;line-height:17px;font-size:13px;display:inline-block}#Minimap .minimap-tooltip .text-limited span{width:180px}#Minimap .custom-select .custom-select-handler{width:220px}',
            replaces: {
                locale: Locale,
                version: Minimap.version,
                types: ['village', 'character', 'tribe'],
                colorPalette: Minimap.colorPalette,
                settings: Minimap.getSettings()
            },
            onTabClick: function (tab) {
                tab === 'minimap'
                    ? ui.$scrollbar.disable()
                    : ui.$scrollbar.enable()
            }
        })

        opener = new FrontButton('Minimap', {
            classHover: false,
            classBlur: false,
            onClick: function () {
                var current = Minimap.getMapPosition()
                Minimap.setCurrentPosition(current[0], current[1])

                ui.openWindow()
            }
        })

        ui.$scrollbar.disable()

        $window = $(ui.$window)
        $entryInput = $window.find('.item-input input')
        $entryIcon = $window.find('.item-icon')
        $entryName = $window.find('.item-name')
        $entryColor = $window.find('.item-color')
        $entryAdd = $window.find('.item-add')
        $openColorPicker = $window.find('.open-color-picker')
        $colorPicker = $window.find('.color-picker')
        $tooltipBase = $window.find('.minimap-tooltip')
        $tooltip = {
            villageName: $tooltipBase.find('.village-name'),
            villagePoints: $tooltipBase.find('.village-points'),
            playerName: $tooltipBase.find('.player-name'),
            playerPoints: $tooltipBase.find('.player-points'),
            tribeName: $tooltipBase.find('.tribe-name'),
            tribePoints: $tooltipBase.find('.tribe-points'),
            provinceName: $tooltipBase.find('.province-name'),
        }
        $highlights = {
            village: $window.find('.village'),
            character: $window.find('.character'),
            tribe: $window.find('.tribe')
        }
        $crossCanvas = $window.find('.cross')
        $minimapCanvas = $window.find('.minimap')

        Minimap.setViewport($minimapCanvas[0])
        Minimap.setCross($crossCanvas[0])

        colorPicker.init()
        populateSettings()
        bindEvents()
        populateHighlights()

        Minimap.interfaceInitialized = true

        return ui
    }

    Minimap.interface = function () {
        Minimap.interface = MinimapInterface()
    }
})

define('two/ui', [
    'two/utils',
    'queues/EventQueue',
    'helper/dom',
    'ejs'
], function (
    utils,
    $eventQueue,
    domHelper,
    ejs
) {
    /**
     * Previne os recursos da interface de serem
     * incluidas no documento mais de uma vez.
     *
     * @type {Boolean}
     */
    var initialized = false

    /**
     * Lista com todas janelas criadas pelo Interface()
     *
     * @type {Array}
     */
    var interfaceInstances = []

    /**
     * Fecha todas as janelas criadas pelo Interface()
     */
    var closeAllInstances = function () {
        interfaceInstances.forEach(function (ui) {
            ui.closeWindow()
        })
    }

    /**
     * Gera um elemento <style>
     *
     * @param  {String} id - ID do element
     * @param  {String} css - Estilos formato CSS
     */
    var buildStyle = function (id, css) {
        var $style = document.createElement('style')
        $style.type = 'text/css'
        $style.id = 'twOverflow-style-' + id
        $style.innerHTML = css

        document.querySelector('head').appendChild($style)
    }

    /**
     * Gera um <select> customizado
     *
     * @param  {Element} $originalSelect - Elemento <select> que será substituido
     */
    var createSelect = function ($originalSelect) {
        var visible = false
        var selectId = 'custom-select'
        var $select = document.createElement('span')
        var $selectedOption = document.createElement('span')
        var $selectArrow = document.createElement('span')
        var $dataContainer = document.createElement('span')

        var clickHandler = function (event) {
            var elem = event.srcElement || event.target

            if (!utils.matchesElem(elem, '.custom-select')) {
                hideSelect()
            }
        }

        var hideSelect = function () {
            rootScope.$broadcast(eventTypeProvider.SELECT_HIDE, selectId)

            $(window).off('click', clickHandler)
            $('.win-main').off('mousewheel', hideSelect)

            visible = false

            onHide()
        }

        var onSelect = function (data, event) {
            $selectedOption.innerHTML = data.name
            $select.dataset.name = data.name
            $select.dataset.value = data.value

            $($select).trigger('selectSelected')

            hideSelect()
        }

        var onShow = function () {
            $selectArrow.classList.remove('icon-26x26-arrow-down')
            $selectArrow.classList.add('icon-26x26-arrow-up')
        }

        var onHide = function () {
            $selectArrow.classList.remove('icon-26x26-arrow-up')
            $selectArrow.classList.add('icon-26x26-arrow-down')
        }

        var $options = $originalSelect.querySelectorAll('option')

        $options.forEach(function ($option) {
            var dataElem = document.createElement('span')
            dataElem.dataset.name = $option.innerText
            dataElem.dataset.value = $option.value

            $dataContainer.appendChild(dataElem)

            if ($option.hasAttribute('selected')) {
                $selectedOption.innerHTML = $option.innerText
                $select.dataset.name = $option.innerText
                $select.dataset.value = $option.value
            }
        })

        for (var i in $originalSelect.dataset) {
            $select.dataset[i] = $originalSelect.dataset[i]
        }

        $select.className = 'custom-select ' + $originalSelect.className
        $selectArrow.className = 'custom-select-button icon-26x26-arrow-down'
        $selectedOption.className = 'custom-select-handler'
        $dataContainer.className = 'custom-select-data'

        $select.appendChild($selectedOption)
        $select.appendChild($selectArrow)
        $select.appendChild($dataContainer)

        $select.addEventListener('click', function () {
            if (visible) {
                return hideSelect()
            }

            var dataElements = $dataContainer.querySelectorAll('span')
            var selectData = []
            var selectedData = {}

            dataElements.forEach(function (elem) {
                var data = {
                    name: elem.dataset.name,
                    value: elem.dataset.value
                }

                if (elem.dataset.icon) {
                    data.leftIcon = isNaN(elem.dataset.icon)
                        ? elem.dataset.icon
                        : parseInt(elem.dataset.icon, 10)
                }

                if (elem.dataset.name === $selectedOption.innerHTML) {
                    selectedData = data
                }

                selectData.push(data)
            })

            rootScope.$broadcast(
                eventTypeProvider.SELECT_SHOW,
                selectId,
                selectData,
                selectedData,
                onSelect,
                $select,
                true /*dropdown please*/
            )

            visible = true

            onShow()

            $('.win-main').on('mousewheel', hideSelect)
            $(window).on('click', clickHandler)
        })

        $originalSelect.replaceWith($select)
    }

    /**
     * @class
     */
    function Interface (windowId, settings) {
        var self = this

        interfaceInstances.push(self)

        self.windowId = windowId
        self.activeTab = settings.activeTab
        self.settings = settings

        buildStyle(windowId, settings.css)

        self.buildWindow()
        self.bindTabs()
        self.setCollapse()
        self.setTooltips()
        self.setCheckboxes()
        self.setSelects()

        var $close = self.$window.querySelector('.twOverflow-close')

        $close.addEventListener('click', function () {
            self.closeWindow()
        })

        rootScope.$on(eventTypeProvider.WINDOW_CLOSED, function (event, templateName, force) {
            if (force || templateName === windowId) {
                self.closeWindow()
            }
        })

        return self
    }

    /**
     * Injeta a estrutura.
     */
    Interface.prototype.buildWindow = function () {
        this.$wrapper = $('#wrapper')

        this.$window = document.createElement('section')
        this.$window.id = this.windowId
        this.$window.className = 'twOverflow-window twx-window screen left'
        this.$window.style.visibility = 'hidden'

        this.$window.innerHTML = ejs.render(this.settings.template, this.settings.replaces)
        this.$wrapper.append(this.$window)

        this.$scrollbar = jsScrollbar(this.$window.querySelector('.win-main'))
    }

    /**
     * Abrir janela.
     */
    Interface.prototype.openWindow = function () {
        windowManagerService.closeAll()
        closeAllInstances()

        this.$window.style.visibility = 'visible'
        this.$wrapper.addClass('window-open')
        this.resizeWindowFrame()
    }

    /**
     * Atualiza a area ocupada pela janela para que o resto do jogo
     * se adapite a ela.
     */
    Interface.prototype.resizeWindowFrame = function () {
        $eventQueue.trigger($eventQueue.types.RESIZE, {
            'instant': true,
            'right': true
        })
    }

    /**
     * Fecha janela.
     */
    Interface.prototype.closeWindow = function () {
        if (this.$window.style.visibility === 'visible') {
            if (this.settings.onClose) {
                this.settings.onClose()
            }

            this.$window.style.visibility = 'hidden'
            this.$wrapper.removeClass('window-open')

            this.resizeWindowFrame()
        }
    }

    /**
     * Altera o estado da janela.
     *
     * @param {String} state - Estado da visibilidade (hidden || visible)
     */
    Interface.prototype.toggleWindow = function (state) {
        this.$window.style.visibility = state
        this.$wrapper.toggleClass('window-open')

        this.resizeWindowFrame()
    }

    /**
     * Controla o estado das abas.
     */
    Interface.prototype.tabsState = function (oldTab, newTab) {
        var self = this

        if (oldTab === newTab) {
            return false
        }

        self.$tabs.forEach(function ($tab) {
            var name = $tab.getAttribute('tab')

            if (name !== oldTab && name !== newTab) {
                return false
            }
            
            if (name === oldTab) {
                self.disableTab(name, $tab)
            } else if (name === newTab) {
                self.enableTab(name, $tab)
            }
        })
    }

    /**
     * Listener das abas.
     */
    Interface.prototype.bindTabs = function () {
        var self = this

        self.$tabs = self.$window.querySelectorAll('.tab')

        self.$tabs.forEach(function ($tab) {
            var name = $tab.getAttribute('tab')

            $tab.addEventListener('click', function () {
                self.tabsState(self.activeTab, name)
                self.activeTab = name

                if (self.settings.onTabClick) {
                    self.settings.onTabClick(name)
                }
            })

            if (self.activeTab === name) {
                self.enableTab(name, $tab)
            } else {
                self.disableTab(name, $tab)
            }

            self.recalcScrollbar()
        })
    }

    /**
     * Altera o estado da aba aba para ativado e exibe o conteúdo quando
     * selecionado pelo usuário.
     */
    Interface.prototype.enableTab = function (name, $tab) {
        var $content = this.$window.querySelector('.twOverflow-content-' + name)
        var $buttons = this.$window.querySelectorAll('.twOverflow-button-' + name)
        var $neutralButtons = this.$window.querySelectorAll('.twOverflow-button')
        var $inner = $tab.querySelector('.tab-inner > div')
        var $a = $tab.querySelector('a')
        var $footer = this.$window.querySelector('footer')

        $content.style.display = ''
        $tab.classList.add('tab-active')
        $inner.classList.add('box-border-light')
        $a.classList.remove('btn-icon', 'btn-orange')

        if ($footer) {
            $footer.style.display = ($buttons.length || $neutralButtons.length) ? '' : 'none'

            if ($buttons.length) {
                $buttons.forEach(function ($button) {
                    $button.style.display = ''
                })
            }
        }

        this.$scrollbar.content = $content
        this.recalcScrollbar()
    }

    /**
     * Altera o estado da aba aba para desativado e oculta o conteúdo.
     */
    Interface.prototype.disableTab = function (name, $tab) {
        var $content = this.$window.querySelector('.twOverflow-content-' + name)
        var $buttons = this.$window.querySelectorAll('.twOverflow-button-' + name)
        var $neutralButtons = this.$window.querySelectorAll('.twOverflow-button')
        var $inner = $tab.querySelector('.tab-inner > div')
        var $a = $tab.querySelector('a')
        var $footer = this.$window.querySelector('footer')

        $content.style.display = 'none'
        $tab.classList.remove('tab-active')
        $inner.classList.remove('box-border-light')
        $a.classList.add('btn-icon', 'btn-orange')

        if ($footer) {
            if ($buttons.length) {
                $buttons.forEach(function ($button) {
                    $button.style.display = 'none'
                })
            }
        }
    }

    /**
     * Remove todo html/eventos criados.
     */
    Interface.prototype.destroy = function () {
        document.querySelector('#twOverflow-style-' + this.windowId).remove()
        this.$window.remove()
    }

    /**
     * Adiciona botão para ocutar/mostrar conteúdo da sessão
     */
    Interface.prototype.setCollapse = function () {
        var self = this

        self.$window.querySelectorAll('.twx-section.collapse').forEach(function ($section) {
            var visible = !$section.classList.contains('hidden-content')

            var $collapse = document.createElement('span')
            $collapse.className = 'min-max-btn'

            var $icon = document.createElement('a')
            $icon.className = 'btn-orange icon-26x26-' + (visible ? 'minus' : 'plus')

            if (!visible) {
                $section.nextSibling.style.display = 'none'
            }

            $collapse.appendChild($icon)
            $section.appendChild($collapse)

            $collapse.addEventListener('click', function () {
                var state = $section.nextSibling.style.display

                if (state === 'none') {
                    $section.nextSibling.style.display = ''
                    $icon.className = $icon.className.replace('plus', 'minus')
                    visible = true
                } else {
                    $section.nextSibling.style.display = 'none'
                    $icon.className = $icon.className.replace('minus', 'plus')
                    visible = false
                }

                self.recalcScrollbar()
            })
        })
    }

    Interface.prototype.setTooltips = function () {
        var self = this

        var $nativeTooltip = $('#tooltip')
        var $tooltipContent = $nativeTooltip.find('.tooltip-content-wrapper')

        self.$window.querySelectorAll('[tooltip]').forEach(function ($elem) {
            var text = $elem.getAttribute('tooltip')
            $elem.removeAttribute('tooltip')

            $elem.addEventListener('mouseenter', function (event) {
                rootScope.$broadcast(eventTypeProvider.TOOLTIP_SHOW, 'twoverflow-tooltip', text, true, event)
            })

            $elem.addEventListener('mouseleave', function () {
                rootScope.$broadcast(eventTypeProvider.TOOLTIP_HIDE, 'twoverflow-tooltip')
            })
        })
    }

    Interface.prototype.setCheckboxes = function () {
        this.$window.querySelectorAll('input[type=checkbox]').forEach(function ($elem) {
            $elem.addEventListener('click', function () {
                $($elem).parent().toggleClass('icon-26x26-checkbox-checked')
            })
        })
    }

    Interface.prototype.isVisible = function (tab) {
        var visible = this.$window.style.visibility === 'visible'

        if (visible && tab) {
            visible = this.activeTab === tab
        }

        return visible
    }

    Interface.prototype.recalcScrollbar = function () {
        this.$scrollbar.recalc()
    }

    Interface.prototype.setSelects = function () {
        this.$window.querySelectorAll('select').forEach(function ($elem) {
            createSelect($elem)
        })
    }

    Interface.init = function () {
        initialized = true

        buildStyle('own', '#twOverflow-leftbar{position:relative;top:0px;left:0px;margin-bottom:7px}#twOverflow-leftbar .button{white-space:nowrap;position:relative;top:-17px;left:0px;min-width:70px;height:24px;padding:0 3px}#twOverflow-leftbar .label,#twOverflow-leftbar .quickview{margin:5px 0;font-size:12px}#twOverflow-leftbar .quickview{display:none}#wrapper.window-open #twOverflow-leftbar .button{left:720px}.twOverflow-window{visibility:hidden}.twOverflow-window h3{color:#000}.twOverflow-window p{color:#000;margin:7px 0;padding:0px 40px}.twOverflow-window p span.sample{font-weight:bold;font-style:italic}.twOverflow-window p span.brazil{color:green;font-weight:bold}.twOverflow-window p .opensource{background:url(https://i.imgur.com/KFHdWXN.png);width:15px;height:15px;display:inline-block;vertical-align:-2px}.twOverflow-window input::placeholder{color:#6d563c}.twOverflow-window input[type="text"],.twOverflow-window input[type="number"],.twOverflow-window select{color:black;text-align:center}.twOverflow-window select{width:100%;padding:0px 0 0 5px;font-size:14px;border:1px solid #976543;height:28px;text-decoration:none;text-align-last:center;border-radius:2px;font-weight:600;font-family:"Trebuchet MS";color:white;box-shadow:0 0 0 1px #421f09 inset,0 0 0 2px #976543 inset,0 0 0 3px #421f09 inset,0 -1px 1px 4px rgba(215,181,144,0.7) inset,0 0 1px 5px rgba(0,0,0,0.4) inset;-webkit-appearance:none;-moz-appearance:none;outline:none;background-image:url(https://i.imgur.com/SlaWRrX.png),url(https://i.imgur.com/e2qKrmX.png);background-repeat:no-repeat,repeat;background-position:293px -3px,top left;background-color:#b28e68}.twOverflow-window .custom-select{position:relative;display:inline-block}.twOverflow-window .custom-select .custom-select-button{height:21px;position:absolute;right:1px;top:1px}.twOverflow-window .custom-select .custom-select-handler{text-align:center;line-height:25px;height:25px;display:block;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAABGdBTUEAALGPC/xhBQAAALRQTFRFr6+vmJiYoKCgrKysq6urpaWltLS0s7OzsLCwpKSkm5ubqKiojY2NlZWVk5OTqampbGxsWFhYUVFRhISEgYGBmpqaUFBQnp6eYmJidnZ2nZ2dY2NjW1tbZ2dnoaGhe3t7l5eXg4ODVVVVWVlZj4+PXFxcVlZWkpKSZmZmdXV1ZWVlc3NzjIyMXl5eVFRUeHh4hoaGYWFhXV1dbW1tampqb29veXl5fHx8gICAiYmJcnJyTk5Ooj6l1wAAADx0Uk5TGhkZGhoaGxoaGRkaGRkZGhkbHBgYGR0ZGhkZGhsZGRgZGRwbGRscGRoZGhkZGhwZGRobGRkZGRkZGRkeyXExWQAABOJJREFUSMeNVgdy4zgQxIW9TQ7KOVEUo5gz0f//1/WA0sple6+OLokQiUk9PQ2rvlzvT0vA6xDXU3R5hQmqddDVaIELsMl3KLUGoFHugUphjt25PWkE6KMAqPkO/Qh7HRadPmTNxKJpWuhSjLZAoSZmXYoPXh0w2R2z10rjBxpMNRfomhbNFUfUFbfUCh6TWmO4ZqNn6Jxekx6lte3h9IgYv9ZwzIZXfhQ/bejmsYkgOeVInoDGT6KGP9MMbsj7mtEKphKgVFKkJGUM+r/00zybNkPMFWYske+jY9hUblbrK4YosyPtrxl+5kNRWSb2B3+pceKT05SQRPZY8pVSGoWutgen2junRVKPZJ0v5Nu9HAk/CFPr+T1XTkXYFWSJXfTyLPcpcPXtBZIPONq/cFQ0Y0Lr1GF6f5doHdm2RLTbQMpMmCIf/HGm53OLFPiiEOsBKtgHccgKTVwn8l7kbt3iPvqniMX4jgWj4aqlX43xLwXVet5XTG1cYp/29m58q6ULSa7V0M3UQFyjd+AD+1W9WLBpDd9uej7emFbea/+Yw8faySElQQrBDksTpTOVIG/SE2HpPvZsplJWsblRLEGXATEW9YLUY1rPSdivBDmuK3exNiAysfPALfYZFWJrsA4Zt+fftEeRY0UsMDqfyNCKJpdrtI1r2k0vp9LMSwdO0u5SpjBeEYz5ebhWNbwT2g7OJXy1vjW+pEwyd1FTkAtbzzcbmX1yZlkR2pPiXZ/mDbPNWvHRsaKfLH8+FqiZbnodbOK9RGWlNMli8k+wsgbSNwS35QB6qxn53xhu2DFqUilisB9q2Zqw4nNI9tOB2z8GbkvEdNjPaD2j+9pwEC+YlWJvI7xN7xMC09eqhq/qwRvz3JWcFWmkjrWBWSiOysEmc4LmMb0iSsxR8+Z8pk3+oE39cdAmh1xSDXuAryRLZgpp9V62+8IOeBSICjs8LlbtKGN4E7XGoGASIJ+vronVa5mjagPHIFJA2b+BKkZC5I/78wOqmzYp1N8vzTkWIWz6YfsS3eh3w8pBkfKz6TSLxK9Qai5DUGTMZ8NNmrW8ldNudIJq+eJycwjv+xbeOJwPv1jjsSV/rCBaS/IBrafaUQ+5ksHwwl9y9X7kmvvIKWoBDFvbWySGyMU3XflxZRkNeRU63otWb0+P8H8BrRokbJivpWkk6m6LccSlrC2K0i6+4otx4dN3mbAVKt0wbaqBab4/MW8rgrS8JP06HU6UYSTYsQ5pYETpo87ZonORvbPlvYbXwmsMgoQGKr8PUQ5dDEO0EcXp2oOfSk+YpR/Eg4R46O0/Sf7jVnbqbXBrRkCPsZFOQTN8h+aqlcRw9FjJ/j8V7SXZ3hVNXYsOYcxzpfPNgFrvB9S6Dej2PqDqq0su+5ng0WMi527p/pA+OiW0fsYzDa6sPS9C1qxTtxVRMuySrwPD6qGPRKc4uIx4oceJ9FPjxWaqPPebzyXxU7W1jNqqOw+9z6X/k+Na3SBa0v+VjgoaULR30G1nxvZN1vsha2UaSrKy/PyCaHK5zAYnJzm9RSpSPDWbDVu0dkUujMmB/ly4w8EnDdXXoyX/VfhB3yKzMJ2BSaZO+A9GiNQMbll+6z1WGLWpEGMeEg85MESSep0IPFaHYZZ1QOW/xcjfxGhNjP0tRtbhFHOmhhjAv/p77JrCX3+ZAAAAAElFTkSuQmCC") top left #ceab84;box-shadow:inset 0 0 0 1px #533a1f,inset 0 0 0 2px #dcba94,0 0 2px rgba(0,0,0,0.6);padding:0 10px}.twOverflow-window .custom-select .custom-select-data{display:none}.twOverflow-window .center{text-align:center}.twOverflow-window .reduced{height:30px}@keyframes expand-button{100%{width:250px}}@keyframes contract-button{0%{width:250px}}.expand-button{animation:expand-button .1s forwards}.contract-button{animation:contract-button .1s forwards}.icon-26x26-preset{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAGEUlEQVR42s2WaVBTZxSGS/aVgFAWhyWAIIpQrASkoCKKOGDrrsTWBVFEgQqiILhVNBBUEqMsUpBKRCGoOCAomwjI4EbB4lZ3x3FfRuuMOsy0eXuSOv1jtW4/vDMnd24mOc93zvve831ffPaXKZdlIuIxGcbgMk0+afI+Aq4hOVfAZYgFbBM7AngIOAx3IZfZx5THYn40gJJxxXyWRMhlOAvYjKECDlPe14y3ZuLEsOqCjYu7hRzmcBGXJf6QxCa0SpaYyxSLeCwnPpsx3MPLc0Hg6JDs0PDQtuiEJVinUSM9LxeXDkzvDfa2ziaYy3u3h1YuJJiHnY3ZzInTIooSVqw+Gpea9iQlS4E0TSYSM1MRl5mApIwkXK1wR/l63y6qchT9h/3OIFoZk882cZZ/P2Xzymz17eUZWb3LVCuRsDEZscp4LM1Yg2UZ6UhRKKDZHKs/u9MTbUVDH/g4S5JJO8t3BpHYHNJBpoiW9eTmyvWxyhgsVC6kWIRFBErJUCBeuQTrVZtRWjwb1ytlOFbihfgF/XdTVe7mfM7/m4J+xKC2SUiTcA83aXdniQcKVWFI2TAb8ZmJWKHKQ5oyG+nZGrSePIkznTtw84QKV5tXoSBLfpVA0wymsaD2v80AbFM+25buIx0s+PnzJgW+OJo7AC1b3XEoyxs5ukUo2V+Ow+3t2FBYjM6Ll/D47mk8f3gKL5904dcWDbhsZg61fpCYx2S/yQAMUwHb1snBNuKHSUGtioTxiA4dAG3GQBzf5oZ6lRcut23Cw8tVuPf4Dto7T6KiLAt3LlTg3vk9+PPlRdzr2oJ8zVC9iMeOosq+NDj3v6phkQEGJc0KP1KbMx8VmyKRvmisPj9JhuMFg3Dz1Gbcv6BF7+Mm3O4qRGOtWl++S6G/0bMb12qm4umNA7jTugAP2mYgNVFWSwoEUE7OG0EzhlhWayN9oEsah59XR+jViSEEGoyLdan461mzMa4cWogLDetx4ng9RRPam2biVtM03KoLNkZHReij0X7SNVSV02t2J/EYNFL6WYnZ6gR386eFziIYIkEqRE3WEHT/4oWzrZl4cb8Rz25sx++6IDQ17kf3+XNo6ehA8T4NzjVMMILutU7GDkXIJas+wrkkh40h978gCZ/FEnIYnvZ9BTunB9pB425mBGU7iRA30hJntW44onHHsW0DcUY7EKd3haOOTLGzqpog1WjvPo3KKh1+q03G9dYoXOueiY3r/Ds9XKwn0IQxk/BY/+hFDxIuiyGXR/s/CouQING3jxG0hWKugwBFCfboKfVDV/EgXNG54fDeKOxtbkVJVS226Sqxdd8h7DhQh+2VB7DvYDla2stQ1bALP6UtUNI7aWM0huGD2iZ1sRZpVNk++ohVNpgabo+CIDsjLNlBiNGOfOjSHHG+dIAR1FgTj+rDR4yJ15TWoojuyrIa47PuyFFk5hcicFRInrenaxC1z8ww1gyTgEGw/stWhrapVcP0alWAPv2nQMwaK4VKZg0ltW+2gxhb46T6K+UDcX2PK3QNScjZWYbCvVXIq2rC1sp6aA82IH9P5fN5Pya20nCIpsV7E8SC9i32q7YZN66+Xl7950THBTRuyp30R5FWjjnxFpD7miNVKsJSZwmm+1qiQT0Y1/a4o6QsTr+tbK+xguLmEyitqcFqxbobQ/x8ckiCYZTP2jD9X5sQ9CWHzGEt4rOHy/ydkr+bGNQRvXwUxs8Tw8eV2kdVTbDjQ+5nhasHQ1FRnwxtbT3Km9uQnBiJ2KgRz8Z847pdwDFuhHxTEv8tw5RtQj/iCTgmtgT25zAZMV97mtYP9pPc9evL6413FmMywdbO8kZD7Q4UVOyHfEI4JgfbYnHMV49kLmapJIPp+2x6DKqOT3a3IqCPkMuKFPM5ecGO4vZYN/OnMVRd5LcBmO3fD/OnuiBt1QisXRvaYyXmjCM9OB92AOEZ3y8RgR1MucyRMgvuyine1mcWS0Uvh9hLmv28zYuCx/TLCgt1nUMLdJTwOR9/SCEol/JISegRNKHD6P3wJWf1J10cyF2WEj5V86kuOkMwX52ChGIei21mqOBzu/4GIvrKMv5t+rQAAAAASUVORK5CYII=);margin-top:2px;margin-left:5px}')
    }

    Interface.isInitialized = function () {
        return initialized
    }

    return Interface
})

define('two/ui/autoComplete', [
    'two/utils',
    'two/locale',
    'helper/dom',
    'struct/MapData'
], function (
    utils,
    Locale,
    domHelper,
    $mapData
) {
    /**
     * Auto-complete identification used to filter events from
     * eventTypeProvider.SELECT_SELECTED and receive the data.
     *
     * @type {String}
     */
    var id = 'two-autocomplete'

    /**
     * Identify if the Auto-complete element is visible.
     * Used to hide the element if a click outside the select
     * is detected.
     *
     * @type {Boolean}
     */
    var visible = false

    /**
     * Detect clicks outside the Auto-complete select element and hide it.
     *
     * @param {Object} event - Click event.
     */
    var hideClick = function (event) {
        var elem = event.srcElement || event.target

        if (!utils.matchesElem(elem, '.custom-select')) {
            autoComplete.hide()
        }
    }

    /**
     * Handle the events when a option is selected.
     *
     * @param {Object} data - Data of the selected item.
     */
    var onSelect = function (data) {
        autoComplete.hide()
        rootScope.$broadcast(eventTypeProvider.SELECT_HIDE, id)
        rootScope.$broadcast(eventTypeProvider.SELECT_SELECTED, id, data)
    }

    /**
     * autoComplete public methods.
     *
     * @type {Object}
     */
    var autoComplete = {}

    /**
     * Hide Auto-complete select element.
     */
    autoComplete.hide = function () {
        rootScope.$broadcast(eventTypeProvider.SELECT_HIDE, id)

        $(window).off('click', hideClick)
        $('.win-main').off('mousewheel', autoComplete.hide)

        visible = false
    }

    /**
     * Display the Auto-complete element.
     *
     * @param {Object} data - Object generated by routeProvider.AUTOCOMPLETE
     * @param {Element} $elem - Element where the select will show up next to.
     * @param {String} selectId - AutoComplete unique identification.
     * @param {Any=} args - Custom value.
     *
     * @return {Boolean} !!autocomplete-showed
     */
    autoComplete.show = function show (data, $elem, selectId, args) {
        id = selectId

        if (!data.length) {
            return false
        }

        rootScope.$broadcast(
            eventTypeProvider.SELECT_SHOW,
            id,
            data,
            null,
            onSelect,
            $elem,
            true,
            0,
            Locale('common', 'no-results')
        )

        if (!visible) {
            visible = true

            $('.win-main').on('mousewheel', autoComplete.hide)
            $(window).on('click', hideClick)
        }

        return true
    }

    /**
     * Search village/character/tribe by coords/name/tag.
     *
     * @param {String} Coords/name/tag.
     * @param {Function} callback
     * @param {Array=} types - Types of items to be searched:
     *   village, character or tribe.
     * @param {Number=} amount - Limit the amount of returned items.
     */
    autoComplete.search = function (value, callback, types, amount) {
        var results = []

        if (utils.isValidCoords(value)) {
            var coords = value.split('|').map(function (coord) {
                return parseInt(coord, 10)
            })

            $mapData.loadTownDataAsync(coords[0], coords[1], 1, 1, function (village) {
                if (village) {
                    results.push({
                        id: village.id,
                        type: 'village',
                        name: utils.genVillageLabel(village)
                    })
                }

                callback(results)
            })

            return
        }

        socketService.emit(routeProvider.AUTOCOMPLETE, {
            types: types || ['village', 'character', 'tribe'],
            string: value,
            amount: amount || 5
        }, function (data) {
            for (var type in data.result) {
                data.result[type].forEach(function (item, i) {
                    item.type = type
                    item.leftIcon = 'size-34x34 icon-26x26-rte-' + type

                    if (type === 'village') {
                        item.name = utils.genVillageLabel(item)
                    }

                    results.push(item)
                })
            }

            callback(results)
        })
    }

    return autoComplete
})

define('two/ui/buttonLink', [
    'ejs'
], function (ejs) {
    /**
     * Cria um botão com icone e link.
     *
     * @param {String} type - Tipo do botão (character||village).
     * @param {String} text - Texto dentro do botão.
     * @param {Number} id - item id
     *
     * @return {Object}
     */
    return function (type, text, id) {
        var uid = Math.round(Math.random() * 1e5)
        var template = '<a id="l<#= uid #>" class="img-link icon-20x20-' +
            '<#= type #> btn btn-orange padded"><#= text #></a>'

        var html = ejs.render(template, {
            type: type,
            text: text,
            uid: uid
        })

        var elem = document.createElement('div')
        elem.innerHTML = html
        elem = elem.firstChild

        var handler

        switch (type) {
        case 'village':
            handler = function () {
                windowDisplayService.openVillageInfo(id)
            }

            break
        case 'character':
            handler = function () {
                windowDisplayService.openCharacterProfile(id)
            }

            break
        }

        elem.addEventListener('click', handler)

        return {
            html: html,
            id: 'l' + uid,
            elem: elem
        }
    }
})

define('two/FrontButton', [
    'ejs'
], function (ejs) {
    function FrontButton (label, options) {
        this.options = options = angular.merge({
            label: label,
            className: '',
            classHover: 'expand-button',
            classBlur: 'contract-button',
            tooltip: false,
            onClick: function() {}
        }, options)

        this.buildWrapper()
        this.appendButton()

        var $elem = this.$elem

        var $label = $elem.find('.label')
        var $quick = $elem.find('.quickview')

        if (options.classHover) {
            $elem.on('mouseenter', function () {
                $elem.addClass(options.classHover)
                $elem.removeClass(options.classBlur)

                $label.hide()
                $quick.show()
            })
        }

        if (options.classBlur) {
            $elem.on('mouseleave', function () {
                $elem.addClass(options.classBlur)
                $elem.removeClass(options.classHover)

                $quick.hide()
                $label.show()
            })
        }

        if (options.tooltip) {
            $elem.on('mouseenter', function (event) {
                rootScope.$broadcast(
                    eventTypeProvider.TOOLTIP_SHOW,
                    'twoverflow-tooltip',
                    options.tooltip,
                    true,
                    event
                )
            })

            $elem.on('mouseleave', function () {
                rootScope.$broadcast(eventTypeProvider.TOOLTIP_HIDE, 'twoverflow-tooltip')
            })
        }

        if (options.onClick) {
            this.click(options.onClick)
        }

        return this
    }

    FrontButton.prototype.updateQuickview = function (text) {
        this.$elem.find('.quickview').html(text)
    }

    FrontButton.prototype.hover = function (handler) {
        this.$elem.on('mouseenter', handler)
    }

    FrontButton.prototype.click = function (handler) {
        this.$elem.on('click', handler)
    }

    FrontButton.prototype.buildWrapper = function () {
        var $wrapper = document.getElementById('twOverflow-leftbar')

        if (!$wrapper) {
            $wrapper = document.createElement('div')
            $wrapper.id = 'twOverflow-leftbar'
            $('#toolbar-left').prepend($wrapper)
        }

        this.$wrapper = $wrapper
    }

    FrontButton.prototype.appendButton = function () {
        var html = ejs.render('<div class="btn-border btn-green button <#= className #>"><div class="top-left"></div><div class="top-right"></div><div class="middle-top"></div><div class="middle-bottom"></div><div class="middle-left"></div><div class="middle-right"></div><div class="bottom-left"></div><div class="bottom-right"></div><div class="label"><#= label #></div><div class="quickview"></div></div>', {
            className: this.options.className,
            label: this.options.label
        })

        var $container = document.createElement('div')
        $container.innerHTML = html
        var $elem = $container.children[0]

        this.$wrapper.appendChild($elem)
        this.$elem = $($elem)
    }

    FrontButton.prototype.destroy = function () {
        this.$elem.remove()
    }

    return FrontButton
})

require([
    'two/ready',
    'two/ui'
], function (
    ready,
    Interface
) {
    if (Interface.isInitialized()) {
        return false
    }

    ready(function () {
        Interface.init()
    })
})

})(this)

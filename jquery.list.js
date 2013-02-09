(function (window, document, $, undefined) {

    var global_information = {};
    var default_row = {};
    var defaults = {
        rows: [],
        element: null,
        template: function () {},
        children: [],
        events: {},
        count: 1,
        templates: {}
    };
    var compiled_templates = {};

    /**
     * This function generates a random number, if this number has been generated before
     * it will generate another.
     * @param  {int} length The 'length' is the number of digits in the number, defaults to 10
     * @return {int} Random number
     */
    var getID = (function (length) {
        var IDs = [undefined];

        return function () {
            for (
                var id;
                IDs.indexOf(id) > -1;
                id = Math.floor(
                    Math.random() * Math.pow(10, length || 10)
                )
            );

            return id;
        };
    })();

    /**
     * Get on object to run methods from
     * @param  {object} element Element to run the methods on
     * @return {object} Allows you to run methods
     */
    var getMethods = function (element) {

        var roles = {

            /**
             * Handle clicking the add button, add a list item.
             * @param  {event} e the event variable from the event.
             * @param  {int} index The index 1-based index of the list item that was clicked
             */
            'add': function (e, index) {
                this.add(index - 1);
                this.render();
            },

            /**
             * Handle clicking the delelete button, deletes a list item
             * @param  {event} e the event variable from the event.
             * @param  {int} index The index 1-based index of the list item that was clicked
             */
            'delete': function (e, index) {
                this.delete(index - 1);
                this.render();
            }
        };
        var methods = {

            /**
             * Initiate the plugin.
             * @param  {string|object} selector The element to run the plugin on
             * @param  {object} options  Options for the plugin. Defaults to {}
             */
            'init': function (selector, options) {
                if (!options) options = {};

                if (!this.getInformation()) {
                    if (options.events) {
                        $.each(options.events, function (index, events) {
                            if (typeof events === 'function') {
                                options.events[index] = [events];
                            }
                        });
                    }

                    var $selector = $(selector);

                    $selector.html(this.giveAttrs($selector.html()));

                    var info = $.extend(true, {}, defaults, {
                        element: element
                    }, options || {});

                    this.saveInformation(info);

                    if (info.children) {

                        var children = [];

                        $.each(info.children, function (name, child) {
                            if (typeof child === 'string') {
                                child = {
                                    selector: child
                                };
                            }

                            if (!child.name) child.name = name;

                            if (!child.options) child.options = {};

                            child.element = $(child.selector);

                            children.push(child);
                        });

                        info.children = children;
                    }

                    $.each(info.templates, function (name, template) {
                        compiled_templates[name] = run.compileTemplate(template);
                    });

                    var $copy = $('<div/>').html($selector.html());
                    var $elements;

                    var handler = function($elements) {
                        $elements.each(function () {
                            var $this = $(this);
                            var name = $this.data('template');
                            var template = compiled_templates[name];

                            template($this);
                        });
                    };

                    while (($elements = $copy.find('[data-template]')).length > 0) {
                        handler($elements);
                    }

                    $selector.html($copy.html());
                    info.template = swig.compile($selector.html());
                    this.saveInformation(info);

                    for (var i = 0, l = info.count; i < info.count; i++) {
                        this.add(i);
                    }

                    var key = this.getKey();

                    // element.on('click', '[data-role]', function(e) {
                    //     var $this = $(this),
                    //         role = $this.data('role');

                    //     if (roles[role] && $this.data('parent') === key) {
                    //         e.preventDefault();
                    //         roles[role].call(run, e, $this.data('index'));
                    //     }
                    // });
                }

                this.render();
                this.events('init');
            },

            /**
             * Generate a function to replace template placeholders
             * @param  {string|object} template The subtemplate
             * @return {function}
             */
            'compileTemplate': function (template) {
                template = this.giveAttrs(template);

                /**
                 * Replace the $element with the subtemplate
                 * @param  {object} $element Subtemplate placeholder
                 */
                return function ($element) {
                    template = run.runOnString(template, function ($ele) {
                        var $content = $ele.find('[data-content]');

                        if ($content.length > 0) {
                            var html = $element.html();

                            $content.after(html);
                            $content.remove();
                        }
                    });

                    $element.after(template);
                    $element.remove();
                };
            },

            /**
             * Run a callback on a string as if it were an element
             * @param  {string|object}   string   The string to run the callback on
             * @param  {function} callback  the callback to run
             * @return {string]}            The result of the callback
             */
            'runOnString': function (string, callback) {
                if (typeof string !== 'string') string = string.html();
                var $ele = $('<div/>').html(string);

                callback($ele);

                return $ele.html();
            },

            'giveAttrs': function ($element) {
                var return_text = false;

                var key = this.getKey();

                if (typeof $element === 'string') {
                    $element = $('<div/>').html($element);
                    return_text = true;
                }

                var $specials = $element.find('[value], input, button, textarea, select').each(function (i) {
                    $(this).attr('data-identifier', '{{ item.identifier }}-' + i);
                });

                $specials = $specials.add($element.find('[data-role]')).each(function () {
                    $(this).attr('data-parent', key);
                });

                $specials.add($element.find('[data-sublist]')).each(function () {
                    $(this).attr('data-index', '{{ loop.index }}');
                });

                if (return_text) {
                    $element = $element.html();
                }

                return $element;
            },

            'add': function (index) {
                this.events('before_add');

                var info = this.getInformation();
                var row = jQuery.extend(true, {}, default_row);

                row.identifier = this.getKey() + '-' + getID();
                info.rows.splice(index + 1, 0, row);

                this.saveInformation(info);
                this.events('add', index);
            },

            'delete': function (index) {
                this.events('before_delete', index);

                var info = this.getInformation();
                info.rows.splice(index, 1);

                this.saveInformation(info);
                this.events('delete', index);
            },

            'render': function (vars) {

                this.events('before_render');

                var info = this.getInformation();
                var children = info.children;

                var rows = {};


                var data = {};

                $.each(children, function (index, child) {
                    element.find('[data-sublist="' + child.name + '"]').each(function (index) {
                        rows[child.name + '-' + index] = $(this).list('getInformation').rows;
                    });
                });

                element.find('[data-identifier]').each(function () {
                    data[$(this).data('identifier')] = this;
                });

                var real_rows = this.getInformation().rows;

                element.html(info.template($.extend(true, {}, {
                    list: real_rows,
                    length: real_rows.length,
                    showdelete: real_rows.length > 1
                }, vars || {}, info.render_options || {})));

                this.events('render_before_fix');


                element.find('[data-role]').on('click', function (e) {

                    var $this = $(this);
                    var role = $this.data('role');

                    if ($this.data('has-assigned')) return;

                    $this.data('has-assigned', true);

                    if (roles[role]) {
                        e.preventDefault();
                        roles[role].call(run, e, $this.data('index'));
                    }
                });

                $.each(children, function (index, child) {

                    element.find('[data-sublist="' + child.name + '"]').each(function (index) {

                        var row_name = child.name + '-' + index;

                        if (!rows[row_name]) rows[row_name] = [];

                        var $this = $(this);

                        $this.list(child.element, child.options);

                        var info = $this.list('getInformation');
                        info.render_options = {
                            owner: {
                                index: $this.data('index')
                            }
                        };

                        $this.list('saveInformation', info).list('render');

                        if (rows[row_name].length > 0) {
                            info = $this.list('getInformation');
                            info.rows = rows[row_name];
                            $this.list('saveInformation', info).list('render');
                        }



                    });
                });

                $.each(data, function (identifier, ele) {
                    var $new = element.find('[data-identifier="' + identifier + '"]');

                    var $ele = $(ele);


                    if ($new.length > 0) {


                        $.each(run.attrs($new[0]), function (name, attr) {
                            if (name !== 'type') {
                                $ele.attr(name, attr);
                            }
                        });

                        $ele.insertAfter($new);
                        $new.remove();

                    }

                });

                this.events('render');

            },

            'getInformation': function () {
                return global_information[this.getKey()];
            },

            'getKey': function () {
                if (!element.data('info-key')) {
                    element.data('info-key', getID());
                }

                return element.data('info-key');
            },

            'saveInformation': function (info) {
                this.events('save_info', info);
                global_information[this.getKey()] = info;
            },

            'attrs': function (ele) {
                ele = ele || element;
                var attrs = {};

                $.each(ele.attributes, function () {
                    attrs[this.nodeName] = this.nodeValue;
                });

                return attrs;
            },

            'events': function () {
                if (arguments.length > 0) {
                    var event_name = arguments[0];
                    var info = this.getInformation();
                    var args = Array.prototype.slice.call(arguments, 1);

                    if (info && info.events[event_name]) {
                        $.each(info.events[event_name], function () {
                            this.apply(element, args);
                        });
                    }
                }
            },

            'on': function (event, handler) {
                var info = this.getInformation();

                if (!info.events[event]) info.events[event] = [];

                info.events[event].push(handler);

                this.saveInformation(info);
            },

            'off': function (event, handler) {
                var info = this.getInformation();
                if (info.events[event]) {
                    var index = info.events[event].indexOf(handler);

                    if (index > -1) {
                        info.events[event].splice(index, 1);
                    }
                }

                this.saveInformation(info);
            }
        };

        var run = function () {
            var name = Array.prototype.shift.call(arguments);

            return methods[name].apply(run, arguments);
        };

        $.each(methods, function (name) {

            run[name] = function () {

                Array.prototype.unshift.call(arguments, name);
                var args = arguments;

                return run.apply(run, args);
            };
        });

        return run;
    };

    $.fn.list = function () {


        if (arguments.length < 1) {
            Array.prototype.push.call(arguments, 'init');
        }

        var method = Array.prototype.splice.call(arguments, 0, 1)[0];

        if (!this.data('ran')) {

            this.data('ran', true);

            var selector;

            if (method !== 'init') {
                Array.prototype.unshift.call(arguments, method);
                method = 'init';
            }

            if (arguments.length < 1) {
                selector = '[type="text/swig"]';
            } else {
                selector = arguments[0];
                Array.prototype.splice.call(arguments, 0, 1);
            }

            Array.prototype.unshift.call(arguments, selector);
        }

        var result = getMethods(this)[method].apply(this, arguments);

        if (result) {
            return result;
        } else {
            return this;
        }
    };

})(window, document, jQuery);
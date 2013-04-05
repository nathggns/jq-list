/*! jQuery List - v0.1.2 - 2013-04-05
* https://github.com/nathggns/jq-list
* Copyright (c) 2013 Nathaniel Higgins; Licensed MIT */

(function (window, document, $, swig, undefined) {

  'use strict';

  var global_information = {};
  var default_row = {};
  var defaults = {
    rows: [],
    element: null,
    template: function () {},
    template_html: '',
    children: [],
    events: {},
    count: 1,
    templates: {},
    original: {
      html: '',
      attrs: {},
      data: {}
    }
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
      ) {}

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
        this['delete'](index - 1);
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
        if (!options) {
          options = {};
        }

        if (!element.data('ran')) {

          var original = {
            html: element.html(),
            attrs: $.extend(true, {}, this.attrs(element.get(0))),
            data: $.extend(true, {}, element.data())
          };

          if (options.events) {
            $.each(options.events, function (index, events) {
              if (typeof events === 'function') {
                options.events[index] = [events];
              }
            });
          }

          var info = $.extend(true, {}, defaults, {
            element: element,
            original: original
          }, options || {});

          this.saveInformation(info);

          // These are the sublists
          if (info.children) {

            var children = [];

            $.each(info.children, function (name, child) {
              if (typeof child === 'string') {
                child = {
                  selector: child
                };
              }

              if (!child.name) {
                child.name = name;
              }

              if (!child.options) {
                child.options = {};
              }

              child.element = $(child.selector);

              children.push(child);
            });

            info.children = children;
          }

          $.each(info.templates, function (name, template) {
            compiled_templates[name] = run.compileTemplate(template);
          });

          this.setTemplate($(selector));

          for (var i = 0, l = info.count; i < info.count; i++) {
            this.add(i);
          }
        }

        this.render();
        element.data('ran', true);
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
       * @return {string]}      The result of the callback
       */
      'runOnString': function (string, callback) {
        if (typeof string !== 'string') {
          string = string.html();
        }
        var $ele = $('<div/>').html(string);

        callback($ele);

        return $ele.html();
      },

      /**
       * Give the attributes to the elements we need to hook into
       * @param  {object|string} $element The element to find children in
       * @return {object|string}      The element after the attributes have been added
       */
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
          $(this).attr('data-parent-identifier', '{{ item.identifier }}');
        });

        if (return_text) {
          $element = $element.html();
        }

        return $element;
      },

      /**
       * Add another item to list
       * @param  {int} index The index to add the item after
       */
      'add': function (index) {
        this.events('before_add');

        var info = this.getInformation();
        var row = $.extend(true, {}, default_row);

        row.identifier = this.getKey() + '-' + getID();
        info.rows.splice(index + 1, 0, row);

        this.saveInformation(info);
        this.events('add', index);
      },

      /**
       * Remove an item from the list
       * @param  {int} index The index of the item to remove
       */
      'delete': function (index) {
        this.events('before_delete', index);

        var info = this.getInformation();
        info.rows.splice(index, 1);

        this.saveInformation(info);
        this.events('delete', index);
      },

      /**
       * Render the list
       * @param  {object} vars List of variables to pass to the swig template
       */
      'render': function (vars) {
        this.events('before_render');

        var info = this.getInformation();
        var children = info.children;
        var rows = {};
        var data = {};
        var real_rows = info.rows;
        var identifiers = $.map(real_rows, function(row) {
          return row.identifier;
        });

        $.each(children, function (index, child) {
          var $sublists = element.find('[data-sublist="' + child.name + '"]');

          $sublists.each(function () {

            var $sublist = $(this);
            var new_list = false;

            if (!$sublist.data('ran')) {
              $sublist.list(child.element, child.options);
            }

            var row_id = identifiers.indexOf($sublist.data('parent-identifier'));

            if (row_id === -1) {
              return;
            }

            real_rows[row_id].child = {
              rows: $sublist.list('getInformation').rows,
              string: '[data-sublist="' + child.name + '"][data-parent-identifier="' + $sublist.data('parent-identifier') + '"]',
              info: child
            };
          });
        });

        element.find('[data-identifier]').each(function () {
          data[$(this).data('identifier')] = this;
        });

        element.html(info.template($.extend(true, {}, {
          list: real_rows,
          length: real_rows.length,
          showdelete: real_rows.length > 1
        }, vars || {}, info.render_options || {})));

        this.events('render_before_fix');

        element.find('[data-role]').on('click', function (e) {
          var $this = $(this);
          var role = $this.data('role');

          if ($this.data('has-assigned')) {
            return;
          }

          $this.data('has-assigned', true);

          if (roles[role]) {
            e.preventDefault();
            roles[role].call(run, e, $this.data('index'));
          }
        });

        $.each(children, function (index, child) {
          var $sublists = element.find('[data-sublist="' + child.name + '"]').filter(function() {
            return !$(this).data('ran');
          });

          $sublists.each(function() {
            $(this).list(child.element, child.options);
          });
        });

        $.each(real_rows, function (index, row) {
          if (row.child) {
            var $sublist = element.find(row.child.string);

            if ($sublist.data('ran')) {
              var info = $sublist.list('getInformation');
              info.rows = row.child.rows;
              $sublist.list('saveInformation', info).list('render');
            }
          }
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

        info.rows = real_rows;

        this.saveInformation(info);
        this.events('render');
      },

      /**
       * Get the stored information about the current plugin instance.
       * @return {object} The info
       */
      'getInformation': function () {
        return global_information[this.getKey()];
      },

      /**
       * Get a key to identify the current instance
       * @return {int} The instance
       */
      'getKey': function () {
        if (!element.data('info-key')) {
          element.data('info-key', getID());
        }

        return element.data('info-key');
      },

      /**
       * Save information about the current instance
       * @param  {object} info Information to save
       */
      'saveInformation': function (info) {
        this.events('save_info', info);
        global_information[this.getKey()] = info;
      },

      /**
       * Get key-value object of the attributes of a DOMElement
       * @param  {DOMElement} ele The element to fetch attributes from
       * @return {object}   key-value object of attributes
       */
      'attrs': function (ele) {
        ele = ele || element;
        var attrs = {};

        $.each(ele.attributes, function () {
          attrs[this.nodeName] = this.nodeValue;
        });

        return attrs;
      },

      /**
       * Run event callbacks
       * @param {string} event_name The name of the events to run
       */
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

      /**
       * Assign an event handler
       * @param  {string} event   the event type
       * @param  {function} handler the handler for the event
       */
      'on': function (event, handler) {
        var info = this.getInformation();

        if (!info.events[event]) {
          info.events[event] = [];
        }

        info.events[event].push(handler);

        this.saveInformation(info);
      },

      /**
       * Remove an event handler
       * @param  {string} event   the event type
       * @param  {function} handler the handler for the event
       */
      'off': function (event, handler) {
        var info = this.getInformation();
        if (info.events[event]) {
          var index = info.events[event].indexOf(handler);

          if (index > -1) {
            info.events[event].splice(index, 1);
          }
        }

        this.saveInformation(info);
      },

      /**
       * Grab the method runner
       * @return {object} Method runner.
       */
      'methodRunner': function() {
        return run;
      },

      /**
       * Completely reset this instance of the list plugin
       */
      'reset': function() {
        // Get our info and key, as we can't get it later
        var key = this.getKey();
        var info = this.getInformation();

        // Remove the entry in our registry
        delete global_information[key];

        // Remove all data first
        $.each(element.data(), function(name) {
          element.removeData(name);
        });

        // Re-assign original data
        $.each(info.original.data, function(name, val) {
          element.data(name, val);
        });

        // Remove all attributes first
        $.each(this.attrs(element[0]), function(name) {
          if (name !== 'type') {
            element.removeAttr(name);
          }
        });

        // Re-assign original attributes
        $.each(info.original.attrs, function(name, val) {
          if (name !== 'type') {
            element.attr(name, val);
          }
        });

        // Reset the html
        element.html(info.original.html);
      },

      /**
       * Get the template
       *
       * @param {bool} return_func Return the template function.
       * @return {string|function} template string or function, depending on return_func
       */
      'getTemplate': function(return_func) {
        var info = this.getInformation();

        return typeof return_func === 'undefined' ? info.template_html : info.template;
      },

      /**
       * Set a template, pass either an element or a string...
       *
       * @param {string|object} Template to set
       */
      'setTemplate': function(string) {
        if (typeof string !== 'string') {
          string = string.html();
        }

        string = this.giveAttrs(string);

        var $copy = $('<div/>').html(string);
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

        string = $copy.html();

        var info = this.getInformation();
        info.template_html = string;
        info.template = swig.compile(string);
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

  /**
   * Get the method from the arguments variable
   *
   * Usage: getMethod.apply(this, arguments);
   */
  var getMethod = function() {
    if (arguments.length < 1) {
      Array.prototype.push.call(arguments, 'init');
    }

    var method = Array.prototype.splice.call(arguments, 0, 1)[0];

    return [method, arguments];
  };

  $.list = getMethods(false);

  $.fn.list = function () {

    var arr = getMethod.apply(this, arguments);
    var method = arr[0];
    var args = arr[1];

    if (!this.data('ran')) {

      var selector;

      if (method !== 'init') {
        Array.prototype.unshift.call(args, method);
        method = 'init';
      }

      if (args.length < 1) {
        selector = '[type="text/swig"]';
      } else {
        selector = args[0];
        Array.prototype.splice.call(args, 0, 1);
      }

      Array.prototype.unshift.call(args, selector);
    }

    var result = getMethods(this)[method].apply(this, args);

    if (result) {
      return result;
    } else {
      return this;
    }
  };

})(window, document, jQuery, swig);
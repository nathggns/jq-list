# jQuery List (DEPRECATED)

**This plugin is deprecated and should not be used for new projects under any circumstances. Please look into using projects like React and/or angular**

jQuery List is a jQuery plugin that allows you to create lists using Swig templates. It has great event hooking, and is extremely configurable.

[**View the Changelog**](CHANGELOG.md)

## Features

 - Access to internal methods - Making it infinitely configurable.
 - Child lists - Lists within lists
 - Child templates
 - Covered by tests

## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/nathggns/jq-list/master/dist/jq-list.min.js
[max]: https://raw.github.com/nathggns/jq-list/master/dist/jq-list.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="swig.js"></script>
<script src="dist/jq-list.min.js"></script>
<script>
jQuery(function($) {
  $('#container').list('#template');
});
</script>
<script type="text/swig" id="template">
{% for item in list %}
	<li>
		Item #{{ loop.index }}
		<div data-role="add">+</div>
		<div data-role="delete">-</div>
	</li>
{% endfor %}
</script>
<ul id="container"></ul>
```

## Examples

Check the demos folder for some examples.

**Note:** Not all functionality is covered by the demos. More demos are currently under development. 

## Contribute

To contribute, first fork this repo. Before commiting your changes, make sure you run `grunt`. This will lint, minify and test your changes. Pull requests that do not do this will be rejected.

[More Info](CONTRIBUTING.md)

## Documentation

Official docs have not yet been created, but some insight may be gained from [JSDoc](http://usejsdoc.org/).

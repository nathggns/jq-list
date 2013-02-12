/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function($) {

  function runList() {
    $('.list').list('.poll-template', {
      templates: {
        'buttons-inner': '<span class="btn btn-danger{% if !showdelete %} hidden{% endif %}" data-role="delete">-</span><span class="btn btn-success" data-role="add">+</span>',
        'buttons-outer': '<div class="buttons clear-group"><div data-content></div></div>',
        'buttons': '<div data-template="buttons-outer"><div data-template="buttons-inner"></div></div>',
        'buttons-rtl': '<div data-template="buttons-outer"><span class="buttons-inner"><div data-template="buttons-inner"></div></span></div>'
      },
      children: {
        choices: '.choice-template'
      }
    });
  }

  var tests = {
    'Test preserving sublist contents': function() {
      // Type in first input
      $('input').eq(0).val('Some text');

      equal($('input').eq(0).val(), 'Some text', 'Passed');

      // Type in second input
      $('input').eq(1).val('Some more text');

      // Add other child to the main list
      $('span[data-role=add]').eq(1).click();

      // Test that the text peristed
      equal($('input').eq(1).val(), 'Some more text', 'Text peristed with one child');

      //Add another child to first element
      $('span[data-role=add]').eq(0).click();
      $('input').eq(2).val('This is some more');

      // Remove that 'This is some more' item
      $('span[data-role=delete]').eq(1).click();

      // Test to see if its gone by making sure the list length it 1
      equal($('ul.list > li > ul').length, 2, 'Check list length after delete');

      // Add another child to first element
      $('span[data-role=add]').eq(0).click();
      $('input').eq(2).val('This is some more');

      equal($('input').eq(2).val(), 'This is some more', 'Check value before add');

      // Add another child to first element
      $('ul.list > li > div span[data-role=add]').click();

      equal($('input').eq(2).val(), 'This is some more', 'Check value after add');
    },
    
    
    'test adding': function($element) {
      // Because references don't last :/
      var button = function() { return $element.find('> li:first-of-type > div [data-role=add]'); };
      var input = function() { return $element.find('input:eq(0)'); };
      var last_input = function() { return $element.find('> li:last-child [data-identifier]:eq(0)'); };
      var sub_button = function() { return $element.find('> li:first-child > ul > li:first-of-type > div [data-role=add]'); };

      // Basic adding
      button().click();
      equal($element.children('li').length, 2, 'Basic add passed');

      // Adding at index
      var id = last_input().data('data-identifier');
      button().click();
      equal($element.children('li').length, 3, 'Clicking on add that isn\'t last works');
      equal(last_input().data('data-identifier'), id, 'Can add at index');

      // Adding with data
      var rand = Math.floor(Math.random() * 10000);
      input().val(rand);
      button().click();
      equal($element.children('li').length, 4, 'Clicking on add that isn\'t last works with data');
      equal(last_input().data('data-identifier'), id, 'Can add at index with data');
      equal(input().val(), rand, 'Data persists');

      // Adding in a sublist
      sub_button().click();
      equal($element.find('> li:first-of-type > ul').children().length, 2);
    },

    'test modifying template': function($element) {
      var run = $element.list('methodRunner');
      var get_random = function() { return 'abc-' + Math.floor(Math.random() * 100000); };
      var $new;
      var random;
      var current;

      current = run.getTemplate();
      random = get_random();
      run.setTemplate('<input type=\'text\' id="' + random + '">');
      run.render();

      $new = $element.find('#' + random);

      notEqual(run.getTemplate(), current, 'Template changed');
      equal($new.length, 1, 'Setting to string works');
      ok($new.is('[data-identifier]'), 'identifier attribute added');
      ok($new.is('[data-parent]'), 'parent attribute added');
      ok($new.is('[data-index]'), 'index attribute added');


      current = run.getTemplate();
      random = get_random();
      run.setTemplate($('<div/>').append($('<input/>').attr('type', 'text').attr('id', random)));
      run.render();

      $new = $element.find('#' + random);

      notEqual(run.getTemplate(), current, 'Template changed when using element');
      equal($new.length, 1, 'Setting to element works');
      ok($new.is('[data-identifier]'), 'identifier attribute added when using element');
      ok($new.is('[data-parent]'), 'parent attribute added when using element');
      ok($new.is('[data-index]'), 'index attribute added when using element');
    }
  };

  $(function() {

    var $element = $('.list');

    test('Reset', function() {
    var data = $.extend(true, {}, $element.data());
    var attrs = $.extend(true, {}, $.list('attrs', $element[0]));
    var html = $element.html();

    runList();

    $element.list('reset');

    equal(JSON.stringify($element.data()), JSON.stringify(data), 'Data was fixed');
    equal(JSON.stringify($.list('attrs', $element[0])), JSON.stringify(attrs), 'Attributes were fixed');
    equal($element.html(), html, 'HTML was fixed');
    });

    $.each(tests, function(name, test_func) {

    test(name, function() {
      runList();
      Array.prototype.unshift.call(arguments, $element);
      test_func.apply(this, arguments);
      
      $element.list('reset');
    });
    });
  });
})(jQuery);
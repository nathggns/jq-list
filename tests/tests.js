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
	}
};

$.each(tests, function(name, test_func) {

	test(name, function() {
		runList();
		test_func.apply(this, arguments);
		$element.list('reset');
	});
});
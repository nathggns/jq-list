

test('Test preserving sublist contents', function() {

	// Type in first input
	$('input').eq(0).val('Some text');

	ok($('input').eq(0).val() == 'Some text', 'Passed');

	// Type in second input
	$('input').eq(1).val('Some more text');

	// Add another child to first element
	$('span[data-role=add]').eq(0).click();
	$('input').eq(2).val('This is some more');

	ok($('input').eq(2).val() == 'This is some more', 'Check value before add');

	// Add another child to first element
	$('ul.list > li > div span[data-role=add]').click();

	ok($('input').eq(2).val() == 'This is some more', 'Check value after add');

});
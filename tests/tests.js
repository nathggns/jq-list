

test('Test preserving sublist contents', function() {

	// Type in first input
	$('input').eq(0).val('Some text');

	equal($('input').eq(0).val(), 'Some text', 'Passed');

	// Type in second input
	$('input').eq(1).val('Some more text');

	// Add another child to first element
	$('span[data-role=add]').eq(0).click();
	$('input').eq(2).val('This is some more');

	// Remove that 'This is some more' item
	$('span[data-role=delete]').eq(1).click();

	// Test to see if its gone by making sure the list length it 1
	equal($('ul.list > li > ul').length, 1, 'Check list length after delete');

	// Add another child to first element
	$('span[data-role=add]').eq(0).click();
	$('input').eq(2).val('This is some more');

	equal($('input').eq(2).val(), 'This is some more', 'Check value before add');

	// Add another child to first element
	$('ul.list > li > div span[data-role=add]').click();

	equal($('input').eq(2).val(), 'This is some more', 'Check value after add');

});
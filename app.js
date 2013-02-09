
$(function() {
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
});
$(document).ready(function() {
	let adding = false;
	$('#btnAddOption').click(function() {
		if (!adding) {
			$('#new-option').removeClass('d-none');
			$('#btnAddOption').html('Cancel');
			$('#submit-button').html('Vote for new option');
			adding = true;
		} else {
			$('#new-option').addClass('d-none');
			$('#btnAddOption').html('Add Option');
			$('#submit-button').html('Submit');
			adding = false;
		}	
	});
	$('#submit-button').click(function() {
		if (adding) {
			$('#poll-options').append('<li class="d-none list-group-item input-group py-1 px-2">'+
				'<input type="radio" name="poll" value="'+
				$('#new-option input').val()+
				'" checked></li>')
		}
	});
});
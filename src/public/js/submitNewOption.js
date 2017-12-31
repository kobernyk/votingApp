$(document).ready(function() {
	$('#btnAddOption').click(function() {
		$('#new-option').removeClass('d-none');
		$('#btnAddOption').html('Cancel');
		$('#submit-button').html('Add');

		$('#btnAddOption').click(function() {
			$('#new-option').addClass('d-none');
			$('#btnAddOption').html('Add Option');
			$('#submit-button').html('Submit');
		});
	})
	$('#submit-button').click(function() {
		if ($('#btnAddOption').html() === 'Cancel') {
			$('#poll-options').append('<li class="d-none list-group-item input-group py-1 px-2">'+
				'<input type="radio" name="poll" value="'+
				$('#new-option input').val()+
				'" checked></li>')
		}
	});
});
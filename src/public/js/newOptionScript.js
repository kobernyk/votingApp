var optionsCount = 2;
$(document).ready(() => {
	$('#btnAddOption').click(() => {
		optionsCount += 1;
		$('#options').append('<div class="form-group">'+
			'<label>Option '+optionsCount+'</label><input type="text" '+
			'class="form-control" '+
			'name;="option'+optionsCount+'"></div>')
	});
});
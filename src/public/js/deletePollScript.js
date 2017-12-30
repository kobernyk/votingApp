$(document).ready(() => {
	$('.delete-btn').click(function() {
		let pollId = $(this).attr('data-id');
		$.ajax({
			method: 'GET',
			url: '/polls/delete/' + pollId,
			error: function(x, y, z) {
				console.log(y);
			},
			success: function(result) {
				location.reload();
			}
		});
	});
});
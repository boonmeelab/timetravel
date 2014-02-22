$(function() {
	$('#form-search').on('submit', function(e) {
		e.preventDefault();
		$('.spinner').removeClass('hidden');
		resetTimeline();

		$.ajax({
			url: '/search',
			type: 'GET',
			dataType: 'json',
			data: $('#form-search').serialize(),
			resetForm : true
		})
		.done(function(data){
				var imageArray = data.SearchForImagesResult.Images;
				$.each(imageArray,function(index, image){
					addOnTimeline(createSprite(image.UrlThumb));
				});
			}
		)
		.fail(function(xhr){
				console.log(xhr);
		})
		.always(function() {
			$('.spinner').addClass('hidden');
		});
	});

	// submit once on pageload
	$('#form-search').trigger('submit');
});

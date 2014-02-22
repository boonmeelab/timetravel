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
				var itemList = [];
				var imageArray = data.SearchForImagesResult.Images;

				$.each(imageArray,function(index, image){
					image.date = new Date(+/\/Date\(([0-9]+).*\)\//g.exec(image.DateCreated)[1]);
					itemList.push(image);
				});

				itemList.sort(function(a, b) {
					return +a.date < +b.date ? -1 : 1;
				});

				var current_year = null;
				itemList.forEach(function(image) {
					if (current_year != image.date.getFullYear()) {
						current_year = image.date.getFullYear();
						addOnTimeline(createTextMarker(image.date.getFullYear()), 60, 30);
					}
					addOnTimeline(createSprite(image));
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

	// adding date list staring from 1753
	var current_year = new Date().getFullYear();
	function populateStartDate(){
		var all_selectable_date = '';
		for(var i=1753;i<=current_year;i++){
			if(i===2000) all_selectable_date += '<option value="'+i+'-01-01" selected>'+i+'</option>';
			else all_selectable_date += '<option value="'+i+'-01-01">'+i+'</option>';
		}
		$('#startdate-search').html(all_selectable_date);
	}
	function populateEndDate(selectedVal){
		var selected_startdate = $('#startdate-search option:selected').val();
		var all_selectable_date='';
		console.log("Val", selectedVal);
		for(var i=parseInt(selected_startdate); i<=current_year;i++){
			if(i===parseInt(selectedVal)) all_selectable_date += '<option value="'+i+'-01-01" selected>'+i+'</option>';
			else all_selectable_date += '<option value="'+i+'-01-01">'+i+'</option>';
		}
		$('#enddate-search').html(all_selectable_date);
	}
	populateStartDate();
	populateEndDate(current_year);
	$('#startdate-search').change(function(){
		console.log('startdate change');
		var selected_startdate = $('#startdate-search option:selected').val();
		var selected_enddate = $('#enddate-search option:selected').val();
		if(selected_startdate>selected_enddate){
			$('#enddate-search option[value="'+selected_startdate+'-01-01"]').prop('selected', true);
		}
		populateEndDate(selected_enddate);
	});

});

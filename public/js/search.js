$(function() {
	if(!window.console) {console={}; console.log = function(){}; console.info = function(){};}
	var requestId = null;
	var searchResults;

	// create slider with multihanders for year range search.
	var current_year = new Date().getFullYear();
	$('#year-range-slider').slider({
		range: true,
		// gettyimage has image created since 1753, but it makes our slider range too long, we change to later year.
		min: 1900,
		max: current_year,
		values: [ 1972, 2014],
		slide: function(event, ui){
			// showing total year range
			var text = ui.values[0] + ' - ' + ui.values[1];
			$('#startdate').val(ui.values[0]);
			$('#enddate').val(ui.values[1]);
			$('#year-range-text').text(text);
		}
	});
	$('#year-range-text').text( $('#year-range-slider').slider('values', 0 ) + ' - ' + $('#year-range-slider').slider('values', 1 ));

	$('#form-search').on('submit', function(e) {
		// hide old info. when search for new query
		updateInfoBox({ show: false });
		e.preventDefault();
		$('.spinner').removeClass('hidden');
		resetTimeline();
		searchResults = [];
		$('.result-text').addClass('hidden');

		var masterdata = $('#form-search').serializeObject();
		masterdata.startdate = masterdata.startdate || $('#year-range-slider').slider('values',0)+'-01-01';
		masterdata.enddate = masterdata.enddate || $('#year-range-slider').slider('values',1)+'-01-01';
		var startyear = +masterdata.startdate.split('-')[0];
		var endyear = +masterdata.enddate.split('-')[0];
		var yearlist = [];
		// generate each year
		var range = endyear-startyear;
		var step = parseInt(range/5);
		for (var i=0; i<endyear-startyear; i+=step) {
			yearlist.push(startyear+i);
		}

		// event hit: search submit
		ga('send', 'event', 'search', 'submit', values(masterdata));

		// itemCount can be only --> 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 25, 30, 50, 60, 75
		// limited by gettyimage api
		var itemCount = step*5;
		var limitedCount = [1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 25, 30, 50, 60, 75]
		for( var i =0, limitedLength = limitedCount.length;i<limitedLength;i++){
			if(limitedCount[i]>=itemCount){
				itemCount=limitedCount[i];
				break;
			}
		}
		var reqId = requestId = Math.random();
		var year_mark = null;
		async.mapSeries(yearlist,
			function(year, cb) {
				if (reqId != requestId) {
					// console.log('Cancel expired request')
					return cb();
				}

				var data = clone(masterdata);
				data.startdate = year+'-01-01';
				var nextstep = year+step-1;
				if(nextstep<endyear)
					data.enddate = nextstep+'-12-31';
				else data.enddate = endyear + '-12-31';

				data.itemperpage = itemCount;

				$.ajax({
					url: '/search',
					type: 'GET',
					dataType: 'json',
					data: data,
					resetForm : true
				})
				.done(function(data){
					if (reqId != requestId) return;

						var itemList = [];
						var imageArray = data.SearchForImagesResult&&data.SearchForImagesResult.Images||[];

						$.each(imageArray,function(index, image){
							var date = /\/Date\(([0-9]+).*\)\//g.exec(image.DateCreated);
							if (date && date[1]) image.date = new Date(+date[1]);
							itemList.push(image);
						});

						itemList.sort(function(a, b) {
							return +a.date < +b.date ? -1 : 1;
						});

						// photos
						itemList.forEach(function(image) {
							var year = image.date&&image.date.getFullYear();
							// year mark
							if (typeof year === 'number' && year != year_mark) {
								year_mark = year;
								addOnTimeline(createTextMarker(year), 90, 30);
							}

							var w = +image.MaxImageResolutionWidth || 50;
							var h = +image.MaxImageResolutionHeight || 50;
							var ratio = Math.min(w, h)/Math.max(w, h);
							var size = 60;
							w2 = w > h ? size : size * ratio;
							h2 = w > h ? size * ratio : size;
							addOnTimeline(createSprite(image, {width: w2, height: h2, service: 'getty'}));
						});

						searchResults = searchResults.concat(itemList);

						$('.result-text').removeClass('hidden').find('.count').text(searchResults.length);
				})
				.fail(function(xhr){
					console.error(xhr);
				})
				.always(function() {
					cb();
				});
			},

			function(err, result) {
				if (reqId === requestId) {
					$('.spinner').addClass('hidden');
				}
			}
		)
	});

	// submit once on pageload
	$('#form-search').trigger('submit');

	// focus on search box
	$('input[name="query"]').trigger('focus');

});

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

function values(obj) {
  return typeof obj !== 'object' ? '' : Object.keys(obj).map(function(key){ return obj[key]; }).join(',');
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
};

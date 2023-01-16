// *************************************
//	 RESPONSIVE PLUGIN
// *************************************
//
//	v1.03
// -------------------
//	add event listener "needResize" to div-responsive div
//
//	v1.02
// -------------------
//	resize div inside bootstrap modal, bootstrap tabs, bootstrap collapse, and hil grid-item
//	swiffy-responsive is deprecated

$(document).ready( function(){

	// init
	$('div.div-responsive').each(function(){
		var div = $(this);
		div.css({overflow:'hidden'});
		
		var wrapper = div.children('.div-responsive-target');
		if(wrapper.length === 0){
			wrapper = $(document.createElement('div'));
			wrapper.addClass('div-responsive-target');
			wrapper.append(div.children());
			div.append(wrapper);
		}

		resize( $(this) );
	});
	
	// events
	$(window).resize(function(){
		resizeAll();
	});
	
	$('body').on('show.bs.modal', '.modal', function () {	
		resizeAllOnShow( $(this) );
	});
	
	$('body').on('show.bs.collapse', function (event) {	
		resizeAllOnShow( $(event.target) );
	});
	
	$('body').on('shown.bs.tab', function (event) {
		var pane = $(event.target).attr('href');
		resizeAll( $(pane) );
	});
	
	$('body').on('show.hil-grid-item', '.hil-grid-content', function () {
		resizeAll( $(this) );
	});
	
	$('body').on('needResize', 'div.div-responsive', function () {
		resize( $(this) );
	});


	// nested function
	function resize(div){
		
		if( div.parent().hasClass('multimedia-wrapper') ){	// skip the multimedia-wrapper
			var pw = div.parent().parent().width();
		}
		else{
			var pw = div.parent().width();
		}
	
		var width =	div.attr('data-width')
		,	height = div.attr('data-height')
		,	min_width = div.attr('data-min-width') || 200
		,	target_width = Math.min( Math.max( pw, min_width), width)
		,	ratio = Math.round(target_width / width * 100) / 100
		,	wrapper = div.children('.div-responsive-target');
		;

		if( ratio === div.data('ratio') ){return;}

		div.width( Math.round(ratio*width) );
		div.height( Math.round(ratio*height) );
		div.data('ratio', ratio);
		wrapper.css(
			{	'transform' : 'scale(' + ratio + ')'
			,	'transform-origin' : 'left top'
			,	'-webkit-transform' : 'scale(' + ratio + ')'
			,	'-webkit-transform-origin' : 'left top'
			}
		);
	}

	function resizeAll( pane ){
		if(pane){
			pane.find('div.div-responsive').each(function(){
				resize($(this));
			});
		}
		else{
			$('div.div-responsive').each(function(){
				resize($(this));
			});
		}
	}
	
	function resizeAllOnShow( pane ){
		var times = 0;
		var step = function(){
			times++;
			if( pane.is(':visible') ){
				resizeAll( pane );
			}
			else if(times < 120){	
				requestAnimationFrame( step );
			}
		};
		step();
	}

});

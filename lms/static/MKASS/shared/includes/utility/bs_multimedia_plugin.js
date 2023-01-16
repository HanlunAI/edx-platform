// *************************************
//	 MULTIMEDIA CAPTION
// *************************************
//
//	v1.01
// -------------------
//	wrap the iframe.responsive with div.div-responsive
//
//	v1.00
// -------------------
//	set the caption width as the multimedia object

$(document).ready( function(){

	// wrap the multimedia
	$('.multimedia').each(function(){
		var media = $(this);
		var caption = media.next('.caption');
		var wrapper = media.parent('.multimedia-wrapper');
		if(wrapper.length == 0){
			wrapper = $('<div></div>');
			wrapper.addClass('multimedia-wrapper');
			media.after(wrapper);
			wrapper.append(media);
			wrapper.append(caption);
			
			// chrome somehow stops autoplay after append the video
			media.filter('video[autoplay]').each(function(){
				this.play();
			});
		}
	});
	
	// wrap the iframe
	$('iframe.multimedia.responsive').each(function(){
		var iframe = $(this);
		var div = iframe.parent('.div-responsive');
		if(div.length == 0){
			div = $(document.createElement('div'));
			iframe.removeClass('multimedia responsive').addClass('div-responsive-target');
			div.addClass('multimedia div-responsive');
			if( iframe.hasClass('with-border') ){
				iframe.removeClass('with-border');
				div.addClass('with-border');
			}
			
			div.attr( 'data-width', iframe.width() );
			div.attr( 'data-height', iframe.height() );
			div.attr( 'data-min-width', iframe.attr('data-min-width') );
			
			iframe.after(div);
			div.append(iframe);
			div.trigger('needResize');
		}
	});
	
	// SOME SPECIAL CASE
	$('div.modal-dialog .modal-body .multimedia + .caption').addClass('no-number');
	$('div.carousel.block .multimedia + .caption').addClass('no-number full-width');
	// $('.collapse .caption').addClass('no-number');
	// $('div.tab-content .multimedia + .caption').addClass('no-number');	
	
	// numbered the captions in one page
	$('.multimedia + .caption').each(function(i){
		$(this).html( $(this).html().trim() );
	});
	$('.multimedia + .caption.photo').not('.no-number').each(function(i){
		$(this).prepend('<span class="number">圖&nbsp;' + (i+1) + ' </span><span>:&nbsp;</span>');
	});
	$('.multimedia + .caption.video').not('.no-number').each(function(i){
		$(this).prepend('<span class="number">影片&nbsp;' + (i+1) + ' </span><span>:&nbsp;</span>');
	});
	$('.multimedia + .caption.table').not('.no-number').each(function(i){
		$(this).prepend('<span class="number">表&nbsp;' + (i+1) + ' </span><span>:&nbsp;</span>');
	});
	$('.multimedia + .caption.animate').not('.no-number').each(function(i){
		$(this).prepend('<span class="number">動畫&nbsp;' + (i+1) + ' </span><span>:&nbsp;</span>');
	});
	$('.multimedia + .caption.interact').not('.no-number').each(function(i){
		$(this).prepend('<span class="number">互動&nbsp;' + (i+1) + ' </span><span>:&nbsp;</span>');
	});
	
	$('span[ref]').each(function(){
		var s = $(this);
		var ref = s.attr('ref');
		var caption = $('.multimedia + .caption[label=' + ref + ']:first').not('.no-number');
		s.empty();
		if(caption.length){
			s.html( caption.find('span.number').html() );
		}
	});
	
	
	// resize the caption
	// events
	window.addEventListener("load", function(){
		resizeAll();
	});

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
	
	$('body').on('needResize', '.multimedia + .caption:not(.full-width)', function () {
		resize( $(this) );
	});
	
	// nested function
	function resize(caption){
		var frame = caption.prev()
		,	now_width = Math.round( caption.width() )
		,	width = Math.round( frame.outerWidth() )
		;
		if( now_width !== width ){ caption.width(width); }
	}
	
	function resizeAll( pane ){	
		if( pane ){
			pane.find('.multimedia + .caption').not('.full-width').each(function(){
				resize($(this));	
			});
		}
		else{
			$('.multimedia + .caption').not('.full-width').each(function(){
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
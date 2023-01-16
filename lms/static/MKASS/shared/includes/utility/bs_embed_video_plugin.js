// *************************************
//	EMBED PLUGIN
// *************************************
//
//	When video and iframe are embeded in bootstrap tabs, modal, accordion and hil-griditem,
//	stop the video and clear the iframe when its pane is hidden.


$(document).ready( function(){
	
	// modal
	$('.modal').each(function(){
		iframeBackup( $(this) );
		videoInit( $(this) );
	});
	
	$('body').on('hidden.bs.modal', '.modal', function () {
		close( $(this) );
	});
	
	$('body').on('show.bs.modal', '.modal', function () {
		show( $(this) );
	});
	
	
	// accordion
	$('.collapse').each(function(){
		iframeBackup( $(this) );
		videoInit( $(this) );
	});
	
	$('body').on('hidden.bs.collapse', function (event) {
		close( $(event.target) );
	});
	
	$('body').on('show.bs.collapse', function (event) {
		show( $(event.target) );
	});
	
	// tabs
	$('.tab-pane').each(function(){
		iframeBackup( $(this) );
		videoInit( $(this) );
	});
	
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (event) {
		var panel_close = $(event.relatedTarget.getAttribute("href"));
		var panel_show = $(event.target.getAttribute("href"));
		show(panel_show);
		close(panel_close);
	});
	
	// grid item
	$('.hil-grid-item .hil-grid-content').each(function(){
		iframeBackup( $(this) );
		videoInit( $(this) );
	});
	
	$('body').on('show.hil-grid-item', '.hil-grid-content', function () {
		show( $(this) );
	});
	
	$('body').on('hide.hil-grid-item', '.hil-grid-content', function () {
		close( $(this) );
	});
	
	// carousel, suppose no iframe in carousel
	$('.carousel-inner .item').not('.active').find('video[autoplay]').each(function(){
		this.pause();
	});
	$('body').on('slide.bs.carousel', function(event) {
		$(event.relatedTarget).closest('.carousel-inner').find('video').each(function(){
			this.pause();
		});
	});
	$('body').on('slid.bs.carousel', function(event) {
		$(event.relatedTarget).find('video[autoplay]').each(function(){
			this.play();
		});
	});
	
	// nested functions
	function close(panel){
		panel.find("video").each(function(){
			this.pause();
		});
		
		panel.find("iframe").each(function(){
			var iframe = $(this);
			//iframe.attr('src', 'about:blank');
			iframe.attr('src', iframe.attr("src"));
			iframe[0].contentWindow.location.replace("about:blank");
		});
	}
	
	function show(panel){
		panel.find("iframe").each(function(){
			var iframe = $(this);
			//iframe[0].contentWindow.location.replace( iframe.attr("data-src") );
			iframe[0].contentWindow.location.replace( iframe.attr("src") );
		});
		panel.find('video[autoplay]').each(function(){
			this.play();
		});
	}
	
	function iframeBackup(panel){
		var iframes = panel.find("iframe");
		iframes.not("[data-src]").each(function(){
			var iframe = $(this);
			//iframe.attr("data-src", iframe.attr("src"));
			iframe.attr("src", iframe.attr("src"));
			if(!iframe.is(":visible")){
				//iframe.attr('src', 'about:blank');
				iframe.attr('src', iframe.attr("src"));
			}
		});
	}
	
	function videoInit(panel){
		panel.find('video').not(':visible').each(function(){
			this.pause();
		});
	}

	return false;
});
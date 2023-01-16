(function(){

	$(document).ready( function(){
		
		// split the bootstrap tab tag evenly
		$('ul.nav-tabs.even').each(function( i ){
			var li = $(this).find('li');
			var w = Math.floor( 100 / li.length );
			var wl = 100 - w * (li.length-1);
			li.css({width: w + '%'});
			li.last().css({width: wl + '%'});
		});
		
		// set the default time interval of carousel
		$('.carousel').each(function(){
			$(this).carousel({
				interval: 60000		
			});
		});
		
		// carousel.block
		$('.carousel.block a.carousel-control.left').html('<i class="fa fa-angle-left"></i>');
		$('.carousel.block a.carousel-control.right').html('<i class="fa fa-angle-right"></i>');
		
		// tooltip
		$('[data-toggle="tooltip"]').tooltip();
		
		// set the close button in bootstrap modal
		$('div.modal-body [data-dismiss=modal]').removeClass().addClass('btn btn-default').html('返回');
		$('div.modal-dialog .modal-header button.close').html('<span class="glyphicon glyphicon-remove"></span>');
		
		// adjust the caption size when Mathjax finish rendering
		MathJax?.Hub.Register.StartupHook( "End", function (){
			$('.caption').trigger('needResize');
		}); 
		
		// // set the iframe margin zero
		// $('iframe').load(function(){
			// try{
				// this.contentDocument.body.style.margin = '0px';
			// }
			// catch(err){
				// console.log(err);
			// }
		// });
		
	});

	window.addEventListener("load", function(){	
		// set the height equal in carousel, after all the content are loaded
		setTimeout(function(){
			$('.carousel.block .carousel-inner').each(setCarouselHeight);	
		}, 100);
	});
	
	// redefine the jquery show, resize the multimedia and captions onshow
	var oldShow = $.fn.show;
	$.fn.show = function(){
		var pane = $(this);
		var rev = oldShow.apply(this, arguments);
		pane.find('.div-responsive').trigger('needResize');
		pane.find('.multimedia + .caption').trigger('needResize');
		pane.find('.carousel.block .carousel-inner:not(.fix-height)').each(setCarouselHeight);
		return rev;
	}

	function setCarouselHeight(){
		var box = $(this);
		if(box.is(':visible')){
			var items = box.find('.item');
			var height = items.map(function(){
				return $(this).outerHeight(true);
			}).get();
			box.height( Math.max.apply(null, height) );
			box.addClass('fix-height');
		}
	}

})()
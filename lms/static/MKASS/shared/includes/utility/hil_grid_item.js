var hil_grid_item = {};

hil_grid_item.resize = function(throttle){
	clearTimeout(this.resize_timer);
	this.resize_timer = setTimeout(this.matchHeight, throttle);
};

hil_grid_item.matchHeight = function(){
	$('div.hil-grid-item').each(function(){
		var frame = $(this);
		var grid = frame.find('div.hil-grid-frame');
		var contents = frame.find('div.hil-grid-content');
		var all_height = [];
		var grid_height; 
		
		if(grid.css('display')==="none"){
			grid.show();
			grid_height = grid.outerHeight(true);		
			grid.hide();
		}
		else{
			grid_height = grid.outerHeight(true);
		}
		
		if( grid_height < $(window).height() ){
			all_height.push( grid_height );
		}
		
		contents.each(function(){
			var content = $(this);
			if(content.css('display')==="none"){
				content.show();
				all_height.push(content.outerHeight(true));
				content.hide();
			}
			else{
				all_height.push(content.outerHeight(true));
			}
		});

		var max_height = Math.max.apply(null, all_height);
		frame.css({'height' : max_height+'px'});
	});
};


$(document).ready( function(){
	
	$('div.hil-grid-frame div.hil-item').each(function(){
		var mask = $(document.createElement('div'));
		mask.addClass('hil-grid-mask');
		$(this).append(mask);
		this._mask = mask;
	});
	
	$('div.hil-grid-item .hil-grid-content').each(function(){
		$(this).hide();
	});
	
	hil_grid_item.resize();
	
	// responsive
	$(window).resize(function(){
		hil_grid_item.resize(300);
	});
	
	$('div.hil-grid-frame').on('click', 'div.hil-item', function(event){
		if(event.delegateTarget._if_open){return true;}
		var grid = $(event.delegateTarget);
		var item = $(this);
		var frame = grid.closest('div.hil-grid-item');
		var target = frame.find('.hil-grid-content[role='+ item.attr('role') + ']');
		var mask = this._mask;

		grid[0]._if_open = true;
		grid[0]._mask = mask;
		mask.addClass('show');
		grid.delay(850)
			.queue(function(){
				$(this).hide().dequeue();
			})
			.queue(function(){
				target.show();
				target.trigger('show.hil-grid-item');
				$(this).dequeue();
			})
			.delay(50)
			.queue(function(){
				target.addClass('show');
				target.find('span.close')[0]._enable = true;	
				$(this).dequeue();
			});
	});
	
	$('div.hil-grid-item').on('click', 'span.close', function(event){
		if(!this._enable){return false;}
		this._enable = false;
		
		var frame = $(event.delegateTarget);
		var target = $(this).closest('.hil-grid-content');
		var grid = frame.find('div.hil-grid-frame');
		var mask = grid[0]._mask;
		
		grid[0]._mask = null;

		target.removeClass('show')
			.delay(500)
			.queue(function(){
				grid.show();
				target.trigger('hide.hil-grid-item');
				target.hide().dequeue();
			})
			.delay(50)
			.queue(function(){
				mask.removeClass('show');
				target.dequeue();
			})
			.delay(1000)
			.queue(function(){
				grid[0]._if_open = false;
				target.dequeue();
			});	
	});
	
});
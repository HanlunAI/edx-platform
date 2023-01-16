// v1.03
// -------------
// a puppet div can contain other puppet div inside


// v1.02
// -------------
// add page indicators : add <pager> attribute to div.hil-puppet


// v1.01
// -------------
// add editing mode : add <edit> attribute to div.hil-puppet
// fix css z-index problem


// v1.00 
// -------------
// if a step contains <no-list> attribute, the play-list hides in this step

var hil_puppet = {};

// default settings

hil_puppet.settings = 
{	duration_jump: '600'
,	duration_move: '1400'
,	duration_animate: '1250'
,	step_delay:	700
,	min_width: 340
,	resize_duration: '300'
,	indicator_max_range: 320
,	indicator_spacing: 40
};


// API

// get ONE flow chart by ID or by a jquery object of this flow chart
hil_puppet.get = function(frame){
	if(typeof(frame)==="string"){
		frame = $('#' + frame + '.hil-puppet');
		return (new this._API(frame, this));
	}
	else if(typeof(frame)==="object"){
		return (new this._API(frame, this));
	}
};

hil_puppet._API = function(frame, context){
	this._target_frame = frame;
	this._context = context;
};

hil_puppet._API.prototype.jumpTo = function(target){
	var frame = this._target_frame;
	this._context._jumpTo( frame, target );
	return this;
}

hil_puppet._API.prototype.goTo = function(target){
	var frame = this._target_frame;
	this._context._goTo( frame, target );
	return this;
}



// ---------------------------
//	UTILITY
// ---------------------------

// a cancelable queue function
hil_puppet._queue = function(object, delay, handler){
	
	if(!object._queue){ object._queue = []; }
	object._queue.push( {delay: delay, handler: handler} );
	if(!object._timer){ chain.call(object, function(){}); }
	
	function chain(handler){
		
		handler.call(this);
		
		if(this._queue.length > 0){
			var a = this._queue.shift();
			this._timer = setTimeout(chain.bind(this, a.handler), a.delay);
		}
		else{
			this._timer = false;
		}
	}
	
};

hil_puppet._clearQueue = function(object){
	if(object._timer){ clearTimeout(object._timer) };
	object._timer = false;
	object._queue = [];
};


hil_puppet._easeFunction = function(ease){
	
	var rev;
	switch(ease) {
		
		case 'cubicOut':
			rev = "cubic-bezier(0.22, 0.6, 0.35, 1)";
			break;
		case 'cubicIn':
			rev = "cubic-bezier(0.55, 0.05, 0.675, 0.2)";
			break;
		case 'cubicInOut':
			rev = "cubic-bezier(0.65, 0, 0.35, 1)";
			break;
			
		case 'quartOut':
			rev = "cubic-bezier(0.25, 0.95, 0.44, 1)";
			break;
		case 'quartIn':
			rev = "cubic-bezier(0.78, 0.02, 0.77, 0.22)";
			break;
		case 'quartInOut':
			rev = "cubic-bezier(0.8, 0, 0.2, 1)";
			break;
			
		case 'backOut':
			rev = "cubic-bezier(0.3, 1.8, 0.7, 1.05)";
			break; 
		case 'backIn':
			rev = "cubic-bezier(0.45, -0.8, 0.5, 0.9)";
			break; 
		case 'backInOut':
			rev = "cubic-bezier(0.5, -1.5, 0.5, 2.5)";
			break; 
			
		case 'elasticOut':
			rev = "cubic-bezier(0.3, 3, 0.2, 0.2)";
			break;
		case 'elasticIn':
			rev = "cubic-bezier(0.38, 0.6, 0.4, -1.5)";
			break;
		
		case 'zigzag':
			rev = "cubic-bezier(0.5, 2.5, 0.55, -1.5)";
			break;
			
		default: 
			rev = ease ? ease : 'ease-in-out';
	}
	return rev;
	
}


// ---------------------------
//	CSS
// ---------------------------

hil_puppet._moveCss = (function(x, y, duration, ease, delay){
	
	var transform = 'translate3d(' + x + 'px,' + y + 'px, 0px)';
	var ease = this._easeFunction(ease);
	var delay = typeof(delay) === "undefined" ? 0 : delay;

	var css = 
	{	'transform' : transform
	,	'-webkit-transform' : transform
	// ,	'transition' : 'all ' + duration + 'ms ' + ease + ' ' + delay + 'ms'
	,	'transition' : 'transform ' + duration + 'ms ' + ease + ' ' + delay + 'ms'
	,	'-webkit-transition' : '-webkit-transform ' + duration + 'ms ' + ease + ' ' + delay + 'ms'
	};
	
	return css;

}).bind(hil_puppet);


// ---------------------------
//	STEPS
// ---------------------------

// jump to one step or sub-step
// return the transition time
hil_puppet._jumpToOneStep = function(stage, step){
	
	var duration = this.settings.duration_jump;
	var moveCss = this._moveCss;
	var queue = this._queue;
	var clearQueue = this._clearQueue;
	var puppet_boxes = stage.find('div.puppet-box');
	
	puppet_boxes.each(function(){
		
		var puppet_box = $(this);
		var puppet = this.puppet;
		var puppet_content = this.puppet_content;
		var if_shown = this.if_shown;
		var name = puppet_box.attr('puppet');
		
		var target = step.find('div[puppet=' + name + ']').not('[leave]');
		var if_target_shown = target.length === 1;
		
		if(if_shown){
			clearQueue(puppet[0]);
			puppet.removeClass().addClass('transit-hide');
			this.if_shown = false;
		}
		
		if(if_target_shown){
			var x = target.attr('data-x')
			,	y = target.attr('data-y')
			,	zInx = target.attr('data-zInx')
			,	add_class = target.attr('add-class')
			,	move_css = moveCss(x, y, 0, 'linear', duration)
			;
			
				
			puppet_box.css(move_css);
			puppet_box.css({'z-index': zInx});
			puppet_content.removeClass().addClass(add_class);	
			queue(puppet[0], duration, function(){
				$(this).removeClass().addClass('transit-show');
			});
			this.if_shown = true;
		}
		
	});
	
	return Number(duration);
	
};


// switch to the step indicated by step_name
// if there are sub-steps in this step, go to the last one
hil_puppet._jumpTo = function(frame, step_name){

	var step = frame.find('div.step[role=' + step_name + ']');
	if(step.length !== 1){
		console.log('invalid role name: ' + step_name);
		return false;
	}
	
	var present_step = frame.attr("present-step");
	if(present_step === step_name){return false;}
	
	var stage = frame.find('div.stage');
	var sub_steps = step.find('div.sub-step');
	var L = sub_steps.length;
	if(L > 0){
		var duration = this._jumpToOneStep( stage, $(sub_steps[L-1]) );
	}
	else{
		var duration = this._jumpToOneStep(stage, step);
	}

	var event_out = $.Event("stepOut");
	event_out.stepIn = step_name;
	event_out.stepOut = present_step;
	var event_in = $.Event("stepIn");
	event_in.stepIn = step_name;
	event_in.stepOut = present_step;
	
	frame.attr('present-step', step_name).trigger(event_out);
	this._clearQueue(frame[0]);
	this._queue(frame[0], duration, function(){
		$(this).trigger(event_in);
	});

};



// do the actions indicated in one step or sub-step
// return the transition time of this step
hil_puppet._doOneStep = (function(stage, step){
	
	var duration_move = this.settings.duration_move;
	var duration_animate = this.settings.duration_animate;
	var moveCss = this._moveCss;
	var queue = this._queue;
	var clearQueue = this._clearQueue;
	var animate = this._anmiate;
	var puppet_boxes = stage.find('div.puppet-box');
	var all_duration = [];
	
	puppet_boxes.each(function(){
		
		var puppet_box = $(this);
		var puppet = this.puppet;
		var puppet_content = this.puppet_content;
		var if_shown = this.if_shown;
		var name = puppet_box.attr('puppet');
		var duration = 0;

		var target = step.find('div[puppet=' + name + ']');
		var if_target_shown = target.not('[leave]').length === 1;
		
		// enter
		if( !if_shown && if_target_shown){		
		
			var x = target.attr('data-x')
			,	y = target.attr('data-y')
			,	enter = target.attr('enter') || 'defaultIn'
			,	delay = target.attr('delay')
			,	duration = target.attr('duration') || '0'
			,	move_css = moveCss(x, y, 0, 'linear')
			;
			
			puppet_box.css(move_css);
			puppet_content.removeClass().addClass(target.attr('add-class'));
			clearQueue(puppet[0]);
			animate(puppet, puppet_box, enter, delay);		
			
			duration = Math.max( Number(duration_animate), Number(duration) );
			if(delay){duration += Number(delay)};
		}
		
		// move & high-light
		if( if_shown && if_target_shown ){		
		
			var x = target.attr('data-x')
			,	y = target.attr('data-y')
			,	delay = target.attr('delay')
			,	ease = target.attr('move')
			,	t1 = target.attr('duration') || duration_move
			,	t2 = 0
			,	highlight = target.attr('highlight')
			,	move_css = moveCss(x, y, t1, ease, delay)
			;
			
			puppet_box.css(move_css);
			puppet_content.removeClass().addClass(target.attr('add-class'));
			clearQueue(puppet[0]);
			if(highlight){ 
				animate(puppet, puppet_box, highlight, delay); 
				t2 = duration_animate;
			}
			
			duration = Math.max( Number(t1), Number(t2) );
			if(delay){duration += Number(delay)};
		}
		
		// leave
		if( if_shown && !if_target_shown ){	
			
			var target_leave = step.find('div[puppet=' + name + '][leave]');
			if( target_leave.length === 1 ){
				var delay = target_leave.attr('delay');
				var leave = target_leave.attr('leave') || 'defaultOut';
			}
			else{
				var delay = 0;
				var leave = 'defaultOut';
			}
			
			clearQueue(puppet[0]);
			animate(puppet, puppet_box, leave, delay, true);
			
			duration = Number(duration_animate);
			if(delay){duration += Number(delay)};
		}
		
		this.if_shown = if_target_shown;
		
		// set z-index
		if(target.length === 1){
			puppet_box.css({'z-index': target.attr('data-zInx')});
		}
	
		all_duration.push(duration);
		
	});
	
	return Math.max.apply(null, all_duration);
	
}).bind(hil_puppet);


hil_puppet._anmiate = function(puppet, puppet_box, animation, delay, if_hide){
	
	var delay = delay || '0';
	puppet.css(
		{	'-webkit-animation-delay': delay + 'ms'
		,	'animation-delay': delay + 'ms'
		}
	);

	puppet.removeClass().addClass(animation + ' animated')
			.off('webkitAnimationEnd animationend')
			.one('webkitAnimationEnd animationend', function(event){
				event.stopPropagation();	// prevent parent div answer to children div's animationend event
				puppet.removeClass();
				if(if_hide){
					puppet.addClass('puppet-hidden');
					puppet_box.css({'z-index': -1});
				}
			});

};


// implement the step indicated by step_name with animation
// if there are sub-steps in this step, play them one by one
hil_puppet._goTo = function( frame, step_name){

	var step = frame.find('div.step[role=' + step_name + ']');
	if(step.length !== 1){
		console.log('invalid role name: ' + step_name);
		return false;
	}
	
	var present_step = frame.attr("present-step");
	if(present_step === step_name){return false;}
	
	var delay = this.settings.step_delay;
	var queue = this._queue;
	var doOneStep = this._doOneStep;
	
	var stage = frame.find('div.stage');
	var sub_steps = step.find('div.sub-step');
	var L = sub_steps.length;
	
	var event_out = $.Event("stepOut");
	event_out.stepIn = step_name;
	event_out.stepOut = present_step;
	var event_in = $.Event("stepIn");
	event_in.stepIn = step_name;
	event_in.stepOut = present_step;
	
	this._clearQueue(frame[0]);
	frame.attr('present-step', step_name).trigger(event_out);
	
	if(L > 0){
		var inx = 0;
		var chain = function(){
			if(inx < L-1){
				var duration = doOneStep(stage, $(sub_steps[inx]));
				inx++;
				queue(this, duration, chain);
			}
			else{
				var duration = doOneStep(stage, $(sub_steps[inx]));
				queue(this, duration, function(){
					$(this).trigger(event_in);
				});
			}
		};
		queue(frame[0], delay, chain);
	}
	else{
		queue(frame[0], delay, function(){
			var duration = doOneStep(stage, step);
			queue(this, duration, function(){
				$(this).trigger(event_in);
			});
		});	
	}

};



// ---------------------------
//	Controls
// ---------------------------
hil_puppet._setBtn = function(frame, stepIn, stepOut){

	var L = frame[0].all_steps.length;
	var inx = frame[0].all_steps.indexOf(stepIn);
	var play = frame[0].play_btn;
	var right = frame[0].forward_btn;
	var left = frame[0].backward_btn;
	var reset = frame[0].replay_btn;

	if(inx === 0){
		play.removeClass('puppet-hidden');
		right.addClass('puppet-hidden');
		left.addClass('puppet-hidden');
		reset.addClass('puppet-hidden');
	}
	else if(inx === L-1){
		play.addClass('puppet-hidden');
		right.addClass('puppet-hidden');
		left.removeClass('puppet-hidden');
		reset.removeClass('puppet-hidden');
	}
	else{
		play.addClass('puppet-hidden');
		right.removeClass('puppet-hidden');
		left.removeClass('puppet-hidden');
		reset.addClass('puppet-hidden');
	}

};


hil_puppet._reset = function(frame){
	
	var entry = frame.attr('entry');
	if(entry){
		this._jumpTo(frame, entry);
	}
	else{
		this._jumpTo(frame, frame[0].all_steps[0]);
	}
	
};


hil_puppet._forward = function(frame){
	
	var present = frame.attr('present-step');
	var inx = frame[0].all_steps.indexOf(present);
	var L = frame[0].all_steps.length;
	if(inx === L-1){ return false; }
	
	// jump to step when clicking forward button frequently
	if(frame[0].if_playing){
		this._jumpTo(frame, frame[0].all_steps[inx+1]);
	}
	else{
		this._goTo(frame, frame[0].all_steps[inx+1]);
	}	
	
};


hil_puppet._backward = function(frame){
	
	var present = frame.attr('present-step');
	var inx = frame[0].all_steps.indexOf(present);
	var L = frame[0].all_steps.length;
	if(inx === 0){ return false; }
	
	this._jumpTo(frame, frame[0].all_steps[inx-1]);
	
};


// ---------------------------
//	Play list
// ---------------------------
hil_puppet._setPlayList = function(frame, stepIn){
	
	var inx = frame[0].all_steps.indexOf(stepIn);
	var play_list = frame.find('ul.play-list');
	var step = frame.find('div.step[role=' + stepIn + ']');

	if( step.attr('no-list') !== undefined ){
		play_list.addClass('puppet-hidden');
	}
	else{
		play_list.removeClass('puppet-hidden');
	}
	
	play_list.find('li').removeClass().addClass('list-off');
	
	var list;
	for(var it=inx; it>=0; it--){
		list = frame[0].all_step_lists[it];
		if(list){
			play_list.find('li[list=' + list + ']')
				.removeClass().addClass('list-on');
			break;
		}
	}

}


// ---------------------------
//	Pager
// ---------------------------
hil_puppet._setPager = function(frame, stepIn){
	
	frame.find('div.page-indicator').removeClass('active')
		.filter('[role=' + stepIn + ']').addClass('active');

}


// ---------------------------
//	Subtitle
// ---------------------------
hil_puppet._setSubOut = function(frame, stepIn){
	
	frame.find('.subtitle[shown=yes]').not('[' + stepIn + ']').each(function(){
		var sub = $(this);
		sub.removeClass('subtitle-on').addClass('subtitle-off');
		sub.attr('shown', 'no');;
	});

};

hil_puppet._setSubIn = function(frame, stepIn){
	
	frame.find('.subtitle[shown=no]').filter('[' + stepIn + ']').each(function(){
		var sub = $(this);
		sub.removeClass('subtitle-off puppet-hidden').addClass('subtitle-on');
		sub.attr('shown', 'yes');
	});
	
};


// ---------------------------
//  responsive
// ---------------------------
hil_puppet._resize = function(frame){
	
	var width = frame.attr('data-width')
	,	height = frame.attr('data-height')
	,	target_width = Math.min(Math.max(frame.parent().width(), this.settings.min_width), width)
	,	ratio = Math.round(target_width / width * 100) / 100
	;
	
	if(ratio === frame[0].ratio){return false;}

	frame.width(Math.round(ratio*width));
	frame.height(Math.round(ratio*height));
	frame[0].ratio = ratio;
	
	var stage = frame.find('div.stage');
	stage.css(
		{	'transform' : 'scale(' + ratio + ')'
		,	'transform-origin' : 'left top'
		}
	);

}


// ---------------------------
//  INIT
// ---------------------------
hil_puppet._init = function(){
	
	$('div.hil-puppet').each(function(){
		
		var frame = $(this)
		,	stage = frame.find('div.stage')
		,	width = frame.attr("data-width") + 'px'
		,	height = frame.attr("data-height") + 'px'
		,	entry = frame.attr('entry')
		;
		
		frame.css(
			{	'width' : width
			,	'height' : height
			,	'position' : 'relative'
			}
		);
		
		stage.css(
			{	'width' : width
			,	'height' : height
			,	'position' : 'relative'
			,	'overflow' : 'hidden'
			}
		);
		
		
		// puppet
		var puppets = frame.find('div.puppet');
		puppets.each(function(){
			var content = $(this);
			var parent = content.parent();
			
			var name = content.attr('puppet');
			parent.append("<div class='puppet-box' puppet='" + name + "' style='position:absolute;top:0px;left:0px;'><div></div></div>");
			var box = parent.find('div.puppet-box[puppet=' + name + ']');
			var puppet = box.find('div');
			puppet.append(content);
			content.removeClass().removeAttr('puppet');

			// init
			box.css({'z-index': '-1'});
			puppet.addClass('puppet-hidden');
			
			// data
			box[0].if_shown = false;
			box[0].puppet = puppet;
			box[0].puppet_content = content;
		});
		
		
		// steps		
		frame[0].all_steps = [];
		frame[0].all_step_lists = [];
		var steps = frame.find('div.step');
		var step_L = steps.length;
		var indicator_height = hil_puppet.settings.indicator_max_range;
		var indicator_spacing = Math.round( Math.min(indicator_height/(step_L-1), hil_puppet.settings.indicator_spacing )/2 ) * 2;

		steps.each(function(i){
			var step = $(this);
			var sub_steps = step.find('div.sub-step');
			if(sub_steps.length > 0){
				sub_steps.each(function(){
					$(this).find('div[puppet]').each(function(i){
						$(this).attr('data-zInx', i);
					});
				});
			}
			else{
				step.find('div[puppet]').each(function(i){
					$(this).attr('data-zInx', i);
				});
			}
			frame[0].all_steps[i] = step.attr('role');
			frame[0].all_step_lists[i] = step.attr('list');
		});
		steps.hide();
		
		
		// page indicators
		if(frame.attr('pager') !== undefined){
			var pager = $(document.createElement("div"));
			pager.addClass('pager-box');
			frame.append(pager);
			pager.css({'position' : 'absolute'});
			
			steps.each(function(i){
				var step = $(this);
				var indicator = $(document.createElement("div"));
				indicator.attr('role', step.attr('role'));
				indicator.addClass("page-indicator");
				if( step.attr('list')!== undefined ){indicator.addClass("list");}
				indicator.css(
					{	'position' : 'absolute'
					,	'top' : ( (i-(step_L-1)/2)*indicator_spacing ) + 'px'	
					}
				);
				pager.append(indicator);
			});
		}

		
		// responsive
		hil_puppet._resize(frame);
		
		// initialize buttons
		frame.find('.puppet-btn').addClass('puppet-hidden');
		frame[0].play_btn = frame.find('.play-btn');
		frame[0].forward_btn = frame.find('.forward-btn');
		frame[0].backward_btn = frame.find('.backward-btn');
		frame[0].replay_btn = frame.find('.replay-btn');
		
		// initialize subtitle
		frame.find('.subtitle').attr('shown','no').addClass('puppet-hidden');
	});
	
};



// ---------------------------
//  Edit Window
// ---------------------------
hil_puppet._init_edit = function(){
	
	var getPos = this._getPos;
	var moveCss = this._moveCss;
	
	$('div.hil-puppet').each(function(){
		
		var frame = $(this)
		,	width = frame.attr("data-width") + 'px'
		;
		
		if(frame.attr('edit') === undefined){return false;}
		
		var edit = document.createElement("div");
		frame[0].edit_window = edit;
		edit = $(edit);
		frame.after($(edit));
		
		edit.css(
			{	'width' : width
			,	'border-color' : 'LightSeaGreen'
			,	'border-style' : 'solid'
			,	'border-width' : '3px'
			,	'border-radius' : '4px'
			,	'min-height' : '150px'
			,	'marginTop' : '15px'
			,	'padding' : '0px 20px 20px 20px'
			,	'textAlign' : 'left'
			,	'box-sizing' : 'border-box'
			}
		);
		
		// puppet
		var puppets = frame.find('div.puppet-box');
		puppets.each(function(){
			
			var box = $(this);
	
			// enable focus
			box.attr('tabindex', '1');
			
			box.on("mousedown", start);
			window.addEventListener( "mousemove", drag.bind(box[0]), false);
			box.on("keydown", move);
			window.addEventListener( "mouseup", end.bind(box[0]), false);

		});
		
		
		// Events
		frame.on('stepIn', function(event){
			var frame = $(this);
			hil_puppet._updateEdit(frame);
		});
		
		// nested functions
		function start(event){
			event.stopPropagation();
			this.if_pressed = true;
			this.start_pos = getPos(this);
			this.start_pos_mouse = {x: event.clientX, y: event.clientY};
		}
		
		function drag(event){
			if(!this.if_pressed){return false;}
			event.preventDefault();
			var x = this.start_pos.x + event.clientX - this.start_pos_mouse.x;
			var y = this.start_pos.y + event.clientY - this.start_pos_mouse.y;
			var css = moveCss(x, y, 0);
			$(this).css(css);
			hil_puppet._updateEdit(frame);
		}
		
		function end(event){
			this.if_pressed = false;
		}
		
		function move(event){
			if(this.if_pressed){return false;}
			
			event.preventDefault();
			event.stopPropagation();
			switch(event.keyCode){
				case 37:
					var pos = getPos(this);
					var css = moveCss(pos.x-1, pos.y, 0);
					$(this).css(css);
					hil_puppet._updateEdit(frame);
					break;
				case 38:
					var pos = getPos(this);
					var css = moveCss(pos.x, pos.y-1, 0);
					$(this).css(css);
					hil_puppet._updateEdit(frame);
					break;
				case 39:
					var pos = getPos(this);
					var css = moveCss(pos.x+1, pos.y, 0);
					$(this).css(css);
					hil_puppet._updateEdit(frame);
					break;
				case 40:
					var pos = getPos(this);
					var css = moveCss(pos.x, pos.y+1, 0);
					$(this).css(css);
					hil_puppet._updateEdit(frame);
					break;
			}
		}
	
	});

};

hil_puppet._getPos = function(puppet_div){
	
	var transform = puppet_div.style.transform;
	var transition = transform.match(/translate3d\(\s*-?\d+(?:\.\d+)?px,\s*-?\d+(?:\.\d+)?px,\s*-?\d+(?:\.\d+)?px\)/g);
	if(transition){
		var pos = transition[0].match(/-?\d+(?:\.\d+)?(?=px)/g);
	}
	else{
		var pos = ['0', '0', '0'];
	}
	
	return {x: Number(pos[0]), y: Number(pos[1]), z: Number(pos[2])};

};

hil_puppet._updateEdit = function(frame){
	
	var edit_window = frame[0].edit_window;
	var all_pos = [];
	var all_puppets = [];
	var getPos = this._getPos;
	var present_step = frame.attr("present-step");

	var step = frame.find('div.step[role=' + present_step + ']');
	var sub_step = step.find('div.sub-step');
	var L = sub_step.length;
	var tag = "";
	if(L > 0){
		step = $(sub_step[L-1]);
		tag = ' ( last sub-step )';
	}
	
	step.find('div[puppet]').each(function(i){
		var target = $(this);
		var puppet_name = target.attr("puppet");
		var puppet = frame.find('div.puppet-box[puppet=' + puppet_name + ']');
		if(puppet.length === 1){
			all_pos[i] = getPos(puppet[0]);
			all_puppets[i] = puppet_name;
		}
	});

	var text = '<h2>step: ' + present_step + tag + '</h2>';
	for(var it=0, itd=all_pos.length; it<itd; it++){
		if(all_puppets[it]){
			text = text + '&lt;div puppet="' + all_puppets[it] +'" data-x="' + all_pos[it].x + '" data-y="' + all_pos[it].y + '"&\gt;&lt;/div&\gt;<br>';
		}
	}
	edit_window.innerHTML = text;

};



// ---------------------------
//  Event
// ---------------------------
$(document).ready(function(){

	hil_puppet._init();
	hil_puppet._init_edit();
	
	// responsive
	$(window).resize(function(){
		$('div.hil-puppet').each(function(){
			hil_puppet._resize($(this));
		});
	});
	
	// step event
	$('div.hil-puppet').on('stepOut', function(event){
		var frame = $(this);
		hil_puppet._setBtn(frame, event.stepIn, event.stepOut);
		hil_puppet._setPlayList(frame, event.stepIn);
		hil_puppet._setSubOut(frame, event.stepIn);
		hil_puppet._setPager(frame, event.stepIn);
		this.if_playing = true;
	});
	
	$('div.hil-puppet').on('stepIn', function(event){
		var frame = $(this);
		hil_puppet._setSubIn(frame, event.stepIn);
		this.if_playing = false;
	});
	
	// prevent zoom
	$('div.hil-puppet')
		.find('.puppet-btn, button, ul.play-list li, div.page-indicator')
		.on('touchstart', function(event){
			event.preventDefault();
			$(this).trigger('click');
		});
	
	// buttons
	$('div.hil-puppet').on('click', '.replay-btn', function(event){
		var frame = $(event.delegateTarget);
		hil_puppet._reset(frame);
	});
	
	$('div.hil-puppet').on('click', '.forward-btn, .play-btn', function(event){
		var frame = $(event.delegateTarget);
		hil_puppet._forward(frame);
	});
	
	$('div.hil-puppet').on('click', '.backward-btn', function(event){
		var frame = $(event.delegateTarget);
		hil_puppet._backward(frame);
	});
	
	// playlist
	$('div.hil-puppet').on('click', 'ul.play-list li', function(event){
		var frame = $(event.delegateTarget);
		var li = $(this);
		var list = li.attr('list');
		var step = frame.find('div.step[list=' + list + ']').first();
		hil_puppet._jumpTo(frame, step.attr('role'));
	});
	
	// pager
	$('div.hil-puppet').on('click', 'div.page-indicator', function(event){
		var frame = $(event.delegateTarget);
		hil_puppet._jumpTo(frame, $(this).attr('role'));
	});
	
	// start
	$('div.hil-puppet').each(function(){
		hil_puppet._reset($(this));
	});

} );

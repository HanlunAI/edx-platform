// v1.05
// -------------
// fix bug: change event trigger at the beginning

// v1.04
// -------------
// Now one flow chart can follow to another, switch the slide that has the the same.
// hil_flow_chart.get("test").follow("test2")
// the flow chart with porperty "fix-size" does not resize

// v1.03
// -------------
// improve the implement of 3D translate


// v1.02
// -------------
// add fade-duration attribute to the flow chart


// v1.01
// -------------
// support responsive


// v1.00 
// -------------
// add API get, goTo, goBack, onChange

// API example:	hil_flow_chart.get("test").goTo("Q2")
//				choose a flow chart with id="test" and change to slide "Q2"

// onChange :	hil_flow_chart.get("test").onChange(function(event){console.log(event.enterSlideRole)});
//				retrieve div of related slides by event.enterSlide, event.leaveSlide
//				and get the slides names from event.enterSlideRole, event.leaveSlideRole

// duration of transitions can be set individually by the <transit-duration> of the transit button
// if one slide has attribute <fade="no">, it will not fade out. You can set it as background
// if one slide has attribute <transparent="yes">, it has no background or frame.
// if <fade-duration> is set, the slide will fade in fade-duration instead of transit-duration
// <data-x>, <data-y>, <data-z> set the position of one slide
// <camera-pos> sets the height of camera
// <entry> sets the first slide
// <data-color> sets the background color of slide or flow chart


var hil_flow_chart = {};

// default settings

hil_flow_chart.settings = 
{	duration: '1000'
,	opacity: '0.5'
,	perspective: '400'
,	background_color: '#d7d7e1'
,	border_width: '1px'
,	border_color: 'DarkGray'
,	slide_bg_color: 'white'
,	min_width: 300
,	resize_duration: '0'
};

// API

// get ONE flow chart by ID or by a jquery object of this flow chart
hil_flow_chart.get = function(frame){
	if(typeof(frame)==="string"){
		frame = $('#' + frame + '.hil-flowChart');
		return (new this._API(frame, this));
	}
	else if(typeof(frame)==="object"){
		return (new this._API(frame, this));
	}
};

hil_flow_chart._API = function(frame, context){
	this._target_frame = frame;
	this._context = context;
};

hil_flow_chart._API.prototype.goTo = function(target, duration){
	var frame = this._target_frame;
	this._context._goToSilde( frame, target, duration );
	return this;
}

hil_flow_chart._API.prototype.goBack = function(duration){
	var frame = this._target_frame;
	var target = frame.attr('previous-slide');
	this._context._goToSilde( frame, target, duration );	
	return this;
}

hil_flow_chart._API.prototype.onChange = function(handler){
	this._target_frame.on('changeSlide', handler.bind(this));
	return this;
}

hil_flow_chart._API.prototype.follow = function(frame){
	var target = typeof(frame)==="object" ? frame : $('#' + frame + '.hil-flowChart');
	var squire = this;
	
	$(document).ready( function(){
		target.on('changeSlide', function(event){
			squire.goTo(event.enterSlideRole, event.duration);
		});
	});
}



// transition
hil_flow_chart._slide_show = function(slide, opacity, duration, fade_duration){
	
	var css = {};
	var transition = "";
	
	css['opacity'] = opacity;
	if(fade_duration){
		transition = 'opacity ' + fade_duration + 'ms linear ' + duration + 'ms';
	}
	else{
		transition = 'opacity ' + duration + 'ms ease-in-out';
	}
	
	css['visibility'] = "visible";
	transition = transition + ',' + 'visibility 0ms';
	
	css['transition'] = transition;
	slide.css(css);
	
};

hil_flow_chart._slide_hide = function(slide, opacity, duration, fade_duration){
	
	if(slide.attr("fade")==="no"){return false;}
	
	var css = {};
	var transition = "";
	
	css['opacity'] = opacity;
	
	if(fade_duration){
		transition = 'opacity ' + fade_duration + 'ms linear';
	}
	else{
		transition = 'opacity ' + duration + 'ms ease-in-out';
	}
	
	if(opacity == 0){
		css['visibility'] = "hidden";
		transition = transition + ',' + 'visibility 0ms linear ' + duration + 'ms';
	}

	css['transition'] = transition;
	slide.css(css);
	
};

hil_flow_chart._group_translate = function(group, x, y, z, perspective, scale, duration){
	var transform = 'scale('+ scale +')' + ' perspective(' + perspective + 'px) translate3d(' + x + 'px,' + y + 'px,' + z + 'px)';
	
	group.css(
		{	'transform' : transform
		,	'-webkit-transform' : transform
		,	'transition' : 'transform ' + duration + 'ms ease-in-out'
		,	'-webkit-transition' : '-webkit-transform ' + duration + 'ms ease-in-out'
		}
	);
}


// private methods
hil_flow_chart._goToSilde = function( frame, target_name, duration ){
	var target = frame.find('.step-slide[role=' + target_name + ']');
	if(target.length != 1){return false;}
	
	var present_name = frame.attr("present-slide");
	if(present_name === target_name){return false;}
	var present = frame.find('.step-slide[role=' + present_name + ']');
	
	// custom event
	var event = $.Event("changeSlide");
		
	var x = -Number(target.attr('data-x'))
	,	y = -Number(target.attr('data-y'))
	,	z = -Number(target.attr('data-z'))
	;
	
	var fade_opacity = frame.attr("fade-opacity") || this.settings.opacity
	,	perspective = frame.attr("camera-pos") || this.settings.perspective
	,	duration = typeof(duration) !== "undefined" ? duration : frame.attr("transit-duration") || this.settings.duration
	,	fade_duration = duration == 0 ? 0 : frame.attr('fade-duration')
	,	ratio = frame.attr('data-ratio') || 1
	;
	
	var group = frame.find(".flowChart-group");
	this._group_translate( group, x, y, z, perspective, ratio, duration);
	
	this._slide_show(target, 1, duration, fade_duration);
	target.find('div.flowChart-mask').css("display", "none");
	event.enterSlide = target.get(0);
	event.enterSlideRole = target_name;
	
	this._slide_hide(present, fade_opacity, duration, fade_duration);
	present.find('div.flowChart-mask').css("display", "block");
	event.leaveSlide = present.get(0);
	event.leaveSlideRole = present_name;
	
	event.duration = duration;
	
	frame.attr("present-slide", target_name);
	frame.attr("previous-slide", present_name);
	if(present_name){
		frame.trigger(event);
	}
};


// responsive
hil_flow_chart._resize = function(frame, duration){
	var width = frame.attr('data-width')
	,	height = frame.attr('data-height')
	,	target_width = Math.min(Math.max(frame.parent().width(), this.settings.min_width), width)
	,	ratio = Math.round(target_width / width * 100) / 100
	;
	
	if(ratio == frame.attr('data-ratio')){return false;}

	var	perspective = frame.attr("camera-pos") || this.settings.perspective
	,	TransitCSS = this._TransitCss
	,	duration = typeof(duration) !== "undefined" ? duration : this.settings.resize_duration
	;
	
	frame.width(Math.round(ratio*width));
	frame.height(Math.round(ratio*height));
	frame.attr('data-ratio', ratio);
	
	var present_name = frame.attr("present-slide");
	var present = frame.find('.step-slide[role=' + present_name + ']');
	var x = -Number(present.attr('data-x'))
	,	y = -Number(present.attr('data-y'))
	,	z = -Number(present.attr('data-z'))
	,	perspective = frame.attr("camera-pos") || this.settings.perspective
	;
	var group = frame.find(".flowChart-group");
	this._group_translate( group, x, y, z, perspective, ratio, duration);
}


hil_flow_chart._init = function(){
	
	$('div.hil-flowChart').each(function(){
		var frame = $(this)
		,	width = frame.attr("data-width") + 'px'
		,	height = frame.attr("data-height") + 'px'
		;
		
		var bg_color = frame.attr("data-color") || hil_flow_chart.settings.background_color;
		var border_width = frame.attr("data-border-width") || hil_flow_chart.settings.border_width;
		var border_color = frame.attr("data-border-color") || hil_flow_chart.settings.border_color;
		var fade_opacity = frame.attr("fade-opacity") || this.settings.opacity
		
		frame.css(
			{	'position' : 'relative'
			,	'width' : width
			,	'height' : height
			,	'background-color' : bg_color
			,	'border-color' : border_color
			,	'border-style' : 'solid'
			,	'border-width' : border_width
			,	'border-radius' : '3px'
			,	'overflow' : 'hidden'
			}
		);
		
		// the transform group
		frame.append("<div class='flowChart-group' style='position:absolute;top:50%;left:50%;width:0px;height:0px'></div>");
		
		var group = frame.find("div.flowChart-group");
		group.css(
			{	'transform-style': 'preserve-3d'
			,	'-webkit-transform-style': 'preserve-3d'
			}
		);

		// set z-index
		var slides = frame.find('.step-slide').toArray().sort(function(a, b){
			var z1 = Number( a.getAttribute('data-z') );
			var z2 = Number( b.getAttribute('data-z') );
			return z1-z2;
		});
		
		group.append($(slides));
		
		$(slides).each(function(i){
			var slide = $(this)
			,	padding = 25
			,	width = Number(slide.attr("data-width"))
			,	height = Number(slide.attr("data-height"))
			,	top = Math.round(-height/2) +'px'
			,	left = Math.round(-width/2) +'px'
			,	bg_color = slide.attr("data-color") || hil_flow_chart.settings.slide_bg_color;
			;
			
			var x = Number(slide.attr('data-x'))
			,	y = Number(slide.attr('data-y'))
			,	z = Number(slide.attr('data-z'))
			,	offset_x = slide.attr("data-offset-x") ? Number(slide.attr("data-offset-x")) : 0
			,	offset_y = slide.attr("data-offset-y") ? Number(slide.attr("data-offset-y")) : 0
			;
			
			var transform ='scale(1) translate3d(' + (x + offset_x) + 'px,' + (y + offset_y) + 'px,' + z + 'px)';

			slide.css(
				{	'position' : 'absolute'
				,	'box-sizing' : 'border-box'
				,	'padding' : padding + 'px'
				,	'width' : width + 'px'
				,	'height' : height + 'px'
				,	'top' : top
				,	'left' : left
				,	'z-index' : i
				,	'transform' : transform
				,	'-webkit-transform' : transform
				,	'backface-visibility' : 'hidden'
				,	'-webkit-backface-visibility' : 'hidden'
				}
			);

			if(slide.attr('transparent')!=="yes"){
				slide.css(
					{	'border-color' : 'DarkGray'
					,	'border-style' : 'solid'
					,	'border-width' : '1px'
					,	'border-radius' : '4px'
					,	'background-color' : bg_color
					,	'overflow' : 'hidden'
					,	'box-shadow': '2px 2px 5px #888888'
					}
				);
			}
			
			// mask
			slide.append("<div class='flowChart-mask' style='position:absolute;top:0;left:0;width:100%;height:100%'></div>");
			
			// hide all slide
			hil_flow_chart._slide_hide(slide, fade_opacity, 0)
		});
		
		hil_flow_chart._goToSilde(frame, frame.attr("entry"), 0);
	});
	
	$('div.hil-flowChart').not('[fix-size]').each(function(){
		hil_flow_chart._resize($(this));
	});
	
};


// Event

$(document).ready(function(){
	
	hil_flow_chart._init();
		
	$('div.hil-flowChart').on('click', '.hil-flowChart-btn', function(event){
		var frame = $(event.delegateTarget);
		var btn = $(this);
		var duration = btn.attr('transit-duration');

		var target = typeof( btn.attr('goBack') ) !== "undefined" ? frame.attr("previous-slide") : btn.attr("goto");
		hil_flow_chart._goToSilde(frame, target, duration);
	});

	$(window).resize(function(){
		$('div.hil-flowChart').not('[fix-size]').each(function(){
			hil_flow_chart._resize($(this));
		});
	});

} );


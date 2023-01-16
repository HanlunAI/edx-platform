// v2.12
// -----------------
// hil_activity.drag: the dropped answer can be replacable 
// revise the hil_activity.drag for better notation


// v2.11
// -----------------
// after show answer, disable the pointer-events in hil-activity, enable the pointer-events in the hil-explain


// v2.10
// -----------------
// if the marker of subgroup is absent, the answer will be marked in each marker of activity


// v2.09
// -----------------
// fix some bugs
// change <auto-submit="yes"> to <auto-submit>
// add attribute <nofill-is-wrong> to activity group, mark the blank answers wrong
// add <name> to the activity in subgroup. An answer can be retrieve by its name in the checkBy function


// v2.08
// -----------------
// add <show-on-finish="target_id"> to activity group, the target with target_id will be shown when this group of activities has been done


// v2.07
// -----------------
// if any element inside group has class .hil-show-on-incorrect, it will be shown when some answer are incorrect, and hide on change

// v2.06
// -----------------
// add radio button

// v2.05
// -----------------
// add checkbox

// v2.04
// -----------------
// add text input

// v2.03
// -----------------
// use enableSingleTouch_v1.02
// remove preventDefault in mouseup, otherwise the it will block the click events

// v2.02
// -----------------
// follow the old hil style

// v2.01
// -----------------
// add <start-show> to answer button
// mark the wrong answer when press the answer button

// v2.00
// -----------------
// add <multi> to .hil-drag-box

// v1.01
// -----------------
// if group has attribute <auto-submit="yes">, the answer will be submitted without press the submit button
// if any element inside group has class .hil-show-on-all-correct, it will be shown when all the answer is correct, and hide when there is wrong answer

// v1.00
// -----------------
// add API get, reset, onReset, onAllCorrect, onSomeWrong
// onReset, onAllCorrect, onSomeWrong: retrieve the group div by event.target
// onChange: retrieve the activity div by event.target, retrieve the group div by event.delegateTarget

var hil_activity = hil_activity || {};

// -----------------
//	API
// -----------------
hil_activity.get = function(group){
	if(typeof(group)==="string"){
		group = $('#' + group + '.hil-activity-group');
		return (new this._API(group, this));
	}
	else if(typeof(group)==="object"){
		return (new this._API(group, this));
	}
};

hil_activity._API = function(group, context){
	this._group = group;
	this._context = context;
};

hil_activity._API.prototype.reset = function(){
	this._context._reset( this._group );
	return this;
}

hil_activity._API.prototype.submit = function(){
	this._context._submit( this._group );
	return this;
}

hil_activity._API.prototype.onAllCorrect = function(handler){
	this._group.on("allCorrect", handler.bind(this));
	return this;
}

hil_activity._API.prototype.onSomeWrong = function(handler){
	this._group.on("someWrong", handler.bind(this));
	return this;
}

hil_activity._API.prototype.onReset = function(handler){
	this._group.on("reset", handler.bind(this));
	return this;
}

hil_activity._API.prototype.onChange = function(handler){
	this._group.on('activity_change', '.hil-activity', handler.bind(this));
	return this;
}

hil_activity._reset = function( group ){
		
	this.select.reset( group );
	this.input.reset( group );
	this.dropdown.reset( group );
	this.drag.reset( group );
	this.checkbox.reset( group );
	this.radiobtn.reset( group );
	this.group.clearMark( group );
	group.removeAttr('paused');
	
	if(group[0]._submit_btn_disabled){
		group[0]._submit_btn.attr("disabled", "disabled");
	}
	else{
		group[0]._submit_btn.removeAttr("disabled");
	}
	
	if(group[0]._answer_btn_disabled){
		group[0]._answer_btn.attr("disabled", "disabled");
	}
	else{
		group[0]._answer_btn.removeAttr("disabled");
	}
	
	if(group[0]._retry_btn_disabled){
		group[0]._retry_btn.attr("disabled", "disabled");
	}

	// hide explain & all-correct
	group.find('.hil-explain').fadeOut();
	group.find('.hil-show-on-all-correct').fadeOut();
	group.find('.hil-show-on-incorrect').fadeOut();
		
	// hide answer btn
	if( group[0]._answer_btn.attr("start-show") === undefined){
		this.group.hideAnswerBtn( group );
	}
	
	group.trigger("reset");
}

hil_activity._submit = function( group ){
	
	var if_mark_blank = group[0].hasAttribute('nofill-is-wrong');
	var rev = this.group.markAll( group, if_mark_blank );
	
	if(if_mark_blank){
		group[0]._retry_btn.removeAttr("disabled");
		group[0]._answer_btn.removeAttr("disabled"); 
	}
	else if(rev.if_done){ 
		group[0]._answer_btn.removeAttr("disabled");
	}
	
	if(rev.if_all_done){ this.group.showAnswerBtn( group );	}
	if(rev.if_all_right){ 
		group.trigger("allCorrect");
	}
	else{
		group.trigger("someWrong");
	}
}

hil_activity._showAnswer = function( group ){
	
	hil_activity.group.remind( group );
	
	hil_activity.select.showAnswer( group );
	hil_activity.input.showAnswer( group );
	hil_activity.dropdown.showAnswer( group );
	hil_activity.drag.showAnswer( group );	
	hil_activity.checkbox.showAnswer( group );
	hil_activity.radiobtn.showAnswer( group );
	
	group.trigger("allCorrect");
	
	group.find('.hil-explain').fadeIn();
	group.attr('paused', 'yes');
	group[0]._answer_btn.attr("disabled", "disabled");
	group[0]._submit_btn.attr("disabled", "disabled");
	group[0]._retry_btn.removeAttr("disabled");
	
}


// -----------------
//	ACTIVITY
// -----------------
hil_activity.activity = {};

hil_activity.activity.mark = function( activity, if_mark_blank, if_use_remind ){

	var	value = activity.attr('value')
	,	answer = activity.attr('answer')
	,	mark_id = activity.attr("showMark")
	;

	var mark = mark_id ? $('span.tickCross' + '#' + mark_id) : activity.find("span.tickCross:first");

	if( typeof(value) === "undefined" ){
		if(if_mark_blank){ hil_activity.mark.markWrong(mark, if_use_remind); }
		return 0;	// blank answer
	}
	else if( value === answer){
		hil_activity.mark.markRight(mark);
		return 1;	// right answer
	}
	else{
		hil_activity.mark.markWrong(mark, if_use_remind);
		return -1;	// wrong answer
	}
	
};

hil_activity.activity.clearMark = function( activity ){
	var mark_id = activity.attr("showMark");
	var mark = mark_id ? $('span.tickCross' + '#' + mark_id) : activity.find("span.tickCross:first");
	hil_activity.mark.clear(mark);
};


hil_activity.activity.showResult = function( activity, result ){
	
	var target_name = activity.attr("showResult");
	
	if( result && target_name ){
		var target = $( '#'+target_name );
		target.html( result );
		
		// update MathJax
		if(MathJax){MathJax.Hub.Queue(["Typeset", MathJax.Hub, target.get(0)]);};
		
		return true;
	}	
	return false;
};

hil_activity.activity.clearResult = function( activity ){
	var target_id = activity.attr("showResult");
	if( target_id ){ $( "#" + target_id ).empty(); }
};


// -----------------
//	SUBGROUP
// -----------------
hil_activity.subgroup = {};

// add a function to handle group of parameters
// these function are called by their names
hil_activity.subgroup._subgroup_checkers = {};

hil_activity.subgroup.checkBy = function( myfun ){
	if( typeof(myfun) === "function" && myfun.name.length ){
		this._subgroup_checkers[myfun.name] = myfun;
	}
};

hil_activity.subgroup.init = function(){
	
	var subgroup = $(".hil-activity-group .hil-activity-subgroup");
	
	subgroup.find(".hil-activity")
		.attr("subgroup", "yes");
	
	// clear mark of subgroup when its children change
	subgroup.on('activity_change', '.hil-activity', function(event){
		hil_activity.subgroup.clearMark( $(event.delegateTarget) );
	});
}

hil_activity.subgroup.mark = function( subgroup, if_mark_blank, if_use_remind ){

	var mark = subgroup.find("span.tickCross.subgroup:first");
	if( !mark.length ){	mark = subgroup.find("span.tickCross");	} 
	
	var if_done = true;	
	var activities = subgroup.find(".hil-activity");
	var name_map = {};
	var values = activities.map(function(){
		var activity = $(this);
		var value = activity.attr("value");
		var name = activity.attr("name");
		
		if(!value){if_done = false; }
		if(name){ name_map[name] = value; }

		return value;
	});
	
	if( !if_done ){ 
		if(if_mark_blank){ hil_activity.mark.markWrong(mark, if_use_remind); }
		return 0;
	}
	
	
	var checkFun_name = subgroup.attr("checkBy");
	
	// if no check function has been selected,
	// mark correct when all the activity in subgroup are correct
	if(!checkFun_name){
		var if_all_right = true;
		var answers = activities.map(function(){ return $(this).attr("answer");	})	
		for(var it=0, itd=values.length; it < itd; it++){
			if_all_right = if_all_right && (values[it] === answers[it]);
		}
		
		if(if_all_right){
			hil_activity.mark.markRight(mark);
			return 1;
		}
		else{
			hil_activity.mark.markWrong(mark, if_use_remind);
			return -1;
		}
	}
	
	// when the selected check function does not exist
	var checkFun = this._subgroup_checkers[checkFun_name];
	if(!checkFun){
		console.log("Error: invalid check function in hil-subgroup!")
		return 0;
	}
	
	// use check function
	if( checkFun.apply(name_map, values) ){
		hil_activity.mark.markRight(mark);
		return 1;
	}
	else{
		hil_activity.mark.markWrong(mark, if_use_remind);
		return -1;
	}
}

hil_activity.subgroup.clearMark = function( subgroup ){
	var mark = subgroup.find("span.tickCross.subgroup:first");
	if( !mark.length ){	mark = subgroup.find("span.tickCross");	} 
	hil_activity.mark.clear(mark);
}

// -----------------
//	GROUP
// -----------------
hil_activity.group = {};

hil_activity.group.init = function(){
	var activity = $(".hil-activity-group .hil-activity").not(['subgroup']);
	activity.each(function(){
		$(this).append('<span class="tickCross foot-mark"></span>');
	});
};

hil_activity.group.showAnswerBtn = function( group, duration ){
	var duration = duration === undefined ? 300 : 0;
	var btn_answer = group[0]._answer_btn;
	if(btn_answer.length === 0){return false;}
	btn_answer.removeAttr("disabled");
	btn_answer.delay(1000).show(duration);
	btn_answer.attr("shown", "yes");
};

hil_activity.group.hideAnswerBtn = function( group, duration ){
	var duration = duration === undefined ? 300 : 0;
	var btn_answer = group[0]._answer_btn;
	if(btn_answer.length === 0){return false;}
	btn_answer.hide(duration);
	btn_answer.attr("shown", "no");
};

hil_activity.group.markAll = function( group, if_mark_blank ){
	var if_all_done = true;
	var if_all_right = true;
	var if_done = false;
	
	group.find(".hil-activity:not([subgroup=yes])").each(function(i){
		var res = hil_activity.activity.mark( $(this), if_mark_blank );
		if(res !== 1){if_all_right = false;}
		if(res === 0){if_all_done = false;}
		if(res !== 0){if_done = true;}
	});
	
	group.find(".hil-activity-subgroup").each(function(i){
		var res = hil_activity.subgroup.mark( $(this), if_mark_blank );
		if(res !== 1){if_all_right = false;}
		if(res === 0){if_all_done = false;}
		if(res !== 0){if_done = true;}
	});
	
	return {if_all_done: if_all_done, if_all_right: if_all_right, if_done: if_done};
};

hil_activity.group.clearMark = function( group ){

	group.find(".hil-activity:not([subgroup=yes])").each(function(){
		hil_activity.activity.clearMark( $(this) );
	});
	
	group.find(".hil-activity-subgroup").each(function(){
		res = hil_activity.subgroup.clearMark( $(this) );
	});

};

hil_activity.group.remind = function( group ){

	group.find(".hil-activity:not([subgroup=yes])").each(function(){
		hil_activity.activity.mark( $(this), true, true );
	});
	
	group.find(".hil-activity-subgroup").each(function(){
		res = hil_activity.subgroup.mark( $(this), true, true );
	});

};

hil_activity.group.remindMark = function( group ){

	group.find(".hil-activity:not([subgroup=yes])").each(function(){
		hil_activity.activity.remindMark( $(this) );
	});
	
	group.find(".hil-activity-subgroup").each(function(){
		res = hil_activity.subgroup.remindMark( $(this) );
	});

};


// -----------------
//	MARK
// -----------------
hil_activity.mark = {};

hil_activity.mark.markRight = function(mark){
	mark.css("color", "LimeGreen");
	mark.empty().html("<span class='glyphicon glyphicon-ok'></span>");
};

hil_activity.mark.markWrong = function(mark, if_use_remind){
	if(if_use_remind){
		mark.css("color", "OrangeRed");
		mark.empty().html("<i class='fa fa-exclamation'></i>");
	}
	else{
		mark.css("color", "red");
		mark.empty().html("<span class='glyphicon glyphicon-remove'></span>");
	}
};

hil_activity.mark.clear = function(mark){
	mark.empty();
};


// -----------------
//	DROPDOWN
// -----------------

// based on activity
hil_activity.dropdown = {};

hil_activity.dropdown._open_one = null;

// close the open one
hil_activity.dropdown.closeOpen = function(){
	if( !hil_activity.dropdown._open_one ){return false;}
	var dropdown = hil_activity.dropdown._open_one;
	dropdown.find('ul.hil-dropdown-menu').hide();
	dropdown.find('button.hil-dropdown').attr("dropdown", "no");
	hil_activity.dropdown._open_one = null;
}

// show answer
hil_activity.dropdown.showAnswer = function( group ){
	group.find('.hil-dropdown.hil-activity').each(function(){
		var	activity = $(this)
		,	btn = $(this).find('button.hil-dropdown')
		,	answer = activity.attr("answer")
		,	opt = activity.find('ul.hil-dropdown-menu li[value='+ answer +']')
		;
		
		activity.attr("value", answer );
		btn.html( opt.html() );

		hil_activity.activity.showResult( activity, opt.attr("result") );	
	});
};

// init
hil_activity.dropdown.init = function(){
	
	// close all dropdown
	var dropdowns = $('div.hil-activity-group .hil-dropdown.hil-activity');
	dropdowns.find('ul.hil-dropdown-menu').hide();
	dropdowns.find('button.hil-dropdown').attr("dropdown", "no");
	
	dropdowns.each(function(){
		var dropdown = $(this);
		dropdown.get(0).label = dropdown.find('button.hil-dropdown').html();
	});
	
	// EVENTS
	
	// toggle the dropdown menu
	dropdowns.on('click', 'button.hil-dropdown', function (event) {
		event.stopPropagation();

		var	button = $(this)
		,	activity = $(event.delegateTarget)
		,	ul = button.siblings("ul.hil-dropdown-menu:first")
		;
		
		if( button.attr("dropdown") === "no" ){
			hil_activity.dropdown.closeOpen();
			ul.show();
			button.attr("dropdown", "yes");
			hil_activity.dropdown._open_one = $(event.delegateTarget);
		}
		else{
			ul.hide();
			button.attr("dropdown", "no");	
			hil_activity.dropdown._open_one = null;
		}	

	});
	
	dropdowns.on('touchstart', 'button.hil-dropdown', function (event){
		event.stopPropagation();
		event.preventDefault();
		$(this).trigger('click');
	});
	
	dropdowns.on('mousedown', 'button.hil-dropdown', function (event){
		event.stopPropagation();
	});
	
	// choose an item in the dropdown select
	dropdowns.on('click', 'li', function (event) {
		event.stopPropagation();
		
		var	opt = $(this)
		,	ul = opt.parent()
		,	button = ul.siblings("button.hil-dropdown:first")
		,	activity = $(event.delegateTarget)
		;
		
		ul.hide();
		button.attr("dropdown", "no");
		button.html( opt.html() );
		
		activity.attr("value", opt.attr("value") );
		hil_activity.activity.clearMark( activity );
		hil_activity.activity.showResult( activity, opt.attr("result") );
		
		activity.trigger('activity_change');
	});
	
	dropdowns.on('touchstart', 'li', function (event){
		event.stopPropagation();
		event.preventDefault();
		$(this).trigger('click');
	});
	
	dropdowns.on('mousedown', 'li', function (event){
		event.stopPropagation();
	});
	
	// close list when click empty
	$('html').on('mousedown', function(event) {
		hil_activity.dropdown.closeOpen();
	});
	
	$('html').on('touchstart', function(event){
		hil_activity.dropdown.closeOpen();
	});
};

// reset dropdown
hil_activity.dropdown.reset = function( group ){
	group.find('.hil-dropdown').each(function(){
		var	activity = $(this)
		,	btn = $(this).find('button.hil-dropdown')
		;
		
		activity.removeAttr("value");
		activity.find('ul.hil-dropdown-menu').hide();
		btn.attr("dropdown", "no");
		btn.html(activity[0].label);

		hil_activity.activity.clearResult( activity );
	});
};


// -----------------
//	SELECT
// -----------------
hil_activity.select = {};

// show answer
hil_activity.select.showAnswer = function( group ){
	group.find('.hil-select').each(function(){
		var activity = $(this)
		,	select = activity.find('select:first')
		,	answer = activity.attr("answer")
		,	opt = select.find('option[value='+ answer +']')
		;
		
		activity.attr("value", answer );
		select.val(answer);

		hil_activity.activity.showResult( activity, opt.attr("result") );
	});
};

// init
hil_activity.select.init = function(){
	
	// EVENTS
	
	// choose an item in the html select
	$('div.hil-activity-group .hil-select.hil-activity').on('change', 'select', function(event){
		
		var select = $(this)
		,	activity = $(event.delegateTarget)
		,	value = select.val()
		,	opt = select.find('option[value='+ value +']')
		;
		
		activity.attr('value', value);
		hil_activity.activity.clearMark( activity );
		hil_activity.activity.showResult( activity, opt.attr("result") );
		
		activity.trigger('activity_change');
	});
	
};

//reset
hil_activity.select.reset = function( group ){
	group.find('.hil-select').each(function(){
		var activity = $(this)
		,	select = activity.find('select:first')
		;
		
		activity.removeAttr("value");
		select.val("title");
	});
};


// -----------------
//	INPUT
// -----------------
hil_activity.input = {};

// show answer
hil_activity.input.showAnswer = function( group ){	
	group.find('.hil-input').each(function(){
		var activity = $(this)
		,	input = activity.find('input[type=text]:first')
		,	answer = activity.attr("answer")
		;
		
		activity.attr("value", answer );
		input.val(answer);
	});
};

// init
hil_activity.input.init = function(){
	
	// EVENTS
	$('div.hil-activity-group .hil-input.hil-activity').on('change', 'input[type=text]', function(event){

		var input = $(this)
		,	activity = $(event.delegateTarget)
		,	value = input.val()
		;
		
		activity.attr('value', value);
		hil_activity.activity.clearMark( activity );	
		activity.trigger('activity_change');
	});
	
};

//reset
hil_activity.input.reset = function( group ){
	group.find('.hil-input.hil-activity').each(function(){
		var activity = $(this)
		,	input = activity.find('input[type=text]:first')
		;
		
		activity.removeAttr("value");
		input.val("");
		hil_activity.activity.clearResult( activity );	
	});
};


// -----------------
//	Check Box
// -----------------
hil_activity.checkbox = {};

// show answer
hil_activity.checkbox.showAnswer = function( group ){	
	group.find('.hil-checkbox').each(function(){
		var activity = $(this)
		,	checked = activity.find('.checked')
		,	answer = activity.attr("answer")
		;
		
		if(answer === '0'){
			checked.hide();
		}
		else if(answer === '1'){
			checked.show();
		}	
		activity.attr("value", answer );
	});
};

// init
hil_activity.checkbox.init = function(){
	
	$('.hil-checkbox.hil-activity')
		.attr('value', '0')
		.prepend('<span class="fa-stack box"><i class="fa fa-square-o fa-stack-2x unchecked"></i><i class="fa fa-check-square fa-stack-2x checked"></i></span>');
		
	$('.hil-checkbox.hil-activity .checked').hide();
			
	// EVENTS
	$('div.hil-activity-group .hil-checkbox.hil-activity').on('click', function(event){

		var activity = $(this);
		var value = activity.attr('value');
		var checked = activity.find('.checked');
		
		if(value === '0'){
			activity.attr('value', '1');
			checked.show();
		}
		else{
			activity.attr('value', '0');
			checked.hide();
		}

		hil_activity.activity.clearMark( activity );	
		activity.trigger('activity_change');
	});
	
	$('div.hil-activity-group .hil-checkbox.hil-activity').on('touchstart', function(event){
		event.preventDefault();
		$(this).trigger('click');
	});
	
};

//reset
hil_activity.checkbox.reset = function( group ){
	group.find('.hil-checkbox.hil-activity').each(function(){
		var activity = $(this)
		,	checked = activity.find('.checked');
		;
		
		activity.attr("value", '0');
		checked.hide();
	});
};


// -----------------
//	Check Box
// -----------------
hil_activity.radiobtn = {};

// show answer
hil_activity.radiobtn.showAnswer = function( group ){	
	group.find('.hil-radio-btn.hil-activity').each(function(){
		var activity = $(this)
		,	answer = activity.attr("answer")
		,	item = activity.find('*[value=' + answer + ']')
		;
		
		var mark_id = activity.attr("showMark");
		var mark = mark_id ? $('span.tickCross' + '#' + mark_id) : activity.find("span.tickCross");
		item.append(mark);
		
		activity.attr("value", answer );
		activity.find('span.box.checked').removeClass('checked');
		item.find('span.box').addClass('checked');		
	});
};

// init
hil_activity.radiobtn.init = function(){
	
	$('.hil-radio-btn.hil-activity *[value]').prepend('<span class="box"></span>');
	
	$('.hil-radio-btn.hil-activity').each(function(){
		var activity = $(this);
		var mark_id = activity.attr('showMark');
		if(!mark_id){
			var mark = activity.find('span.tickCross');
			var item = activity.find('*[value]:last-of-type');
			item.append(mark);
		}
	});
	
	// EVENTS
	$('div.hil-activity-group .hil-radio-btn.hil-activity').on('click', '*[value]', function(event){
		var activity = $(event.delegateTarget);
		var item = $(this);
		var value = item.attr('value');

		activity.attr('value', value);
		activity.find('span.box.checked').removeClass('checked');
		item.find('span.box').addClass('checked');
		
		var mark_id = activity.attr("showMark");
		if(mark_id){
			var mark = $('span.tickCross' + '#' + mark_id);
		}
		else{
			var mark = activity.find("span.tickCross");
			item.append(mark);
		}		

		hil_activity.activity.clearMark( activity );	
		activity.trigger('activity_change');
	});
	
	$('div.hil-activity-group .hil-checkbox.hil-activity *[value]').on('touchstart', function(event){
		event.preventDefault();
		$(this).trigger('click');
	});
	
};

//reset
hil_activity.radiobtn.reset = function( group ){
	group.find('.hil-radio-btn.hil-activity').each(function(){
		var activity = $(this);	
		activity.removeAttr('value');
		activity.find('span.box.checked').removeClass('checked');
		
		var mark_id = activity.attr('showMark');
		if(!mark_id){
			var mark = activity.find('span.tickCross');
			var item = activity.find('*[value]').last();
			item.append(mark);
		}
	});
};


// -----------------
//	DRAG
// -----------------
hil_activity.drag = {};

hil_activity.drag.dropTo = function( drag, target ){
		
	if(target.attr("fill") === "yes"){
		var prev = target[0]._drop_in;
		this.dragOut( prev, 0, 0 );
		this.dropBack( prev );
	}
	
	target.append(drag);
	drag[0]._drop_to = target;
	target[0]._drop_in = drag;
	target.attr("value", drag.attr("value") );
	target.attr("fill", "yes");
}

hil_activity.drag.dragOut = function( drag, clientX, clientY ){
	var target = drag[0]._drop_to;
	var home = drag[0]._home;
	if(target){
		// drag out of drop box
		drag[0]._drop_to = null;
		target[0]._drop_in = null;
		hil_activity.activity.clearMark( target );
		target.removeAttr("value");
		target.attr("fill", "no");		
		home.append(drag);
		
		var pos_t = target[0].getBoundingClientRect();
		var pos_n = home[0].getBoundingClientRect();
		var left = pos_t.left;
		var top = pos_t.top;
		left = Math.max(left, clientX - pos_n.width);
		left = Math.min(left, clientX + pos_n.width);
		top = Math.max(top, clientY - pos_n.height);
		top = Math.min(top, clientY + pos_n.height);
		drag[0]._offset = { 
			x: Math.round(left - pos_n.left), 
			y: Math.round(top - pos_n.top) 
		};	
	}
	else{
		// drag out of drap box
		drag[0]._offset = {x: 0, y: 0};
		if( home[0].hasAttribute('multi') ){
			this.refill(home);
		}
	}
}

hil_activity.drag.dropBack = function( drag ){
	var home = drag[0]._home;
	if( home[0].hasAttribute('multi') ){
		drag.remove();
	}
}

hil_activity.drag.refill = function( drag_box ){
	drag_box.append( drag_box[0]._copy );
	var drag = drag_box.find('div.hil-drag:last');
	this.initDrag(drag);
	return drag;
}

hil_activity.drag.initGroup = function( group ){
	group.removeAttr('dragging');
	group[0]._drop_targets = group.find('div.hil-drop-box');
};

hil_activity.drag.initDrag = function( drag ){
	
	var group = drag.closest('div.hil-activity-group');
	drag[0]._group = group;
	
	var box = drag.closest('div.hil-drag-box');
	drag[0]._home = box;
	drag[0]._drop_to = null;
		
	var checkDrop = this.checkDrop;
	var drag_dom = drag.get(0);
	this.enableDrag( drag_dom );		
	
	drag_dom.on("mousedown", function(event){
			
			var drag = $(this);
			var group = this._group;
			if( group.attr('dragging') ){return false;}	// single touch
			
			group.attr('dragging', 'yes');
			this._if_choosed = true;
			this._movement = [0, 0];
			
			this.style["box-shadow"] = "2px 2px 5px #888888";
			this.style["zIndex"] = "999";
			
			var pos = event.point;
			hil_activity.drag.dragOut( drag, pos.clientX, pos.clientY);	
			var x = this._offset.x;
			var y = this._offset.y;
			this.style["transform"] = 'translate3d(' + x + 'px,' + y + 'px, 0px)';
			this.style["-webkit-transform"] = 'translate3d(' + x + 'px,' + y + 'px, 0px)';

			checkDrop(group[0]._drop_targets, event);				
			
		}).on("pressmove", function(event){
			
			if(!this._if_choosed){return false;}
			
			var DX = event.point.movementX;
			var DY = event.point.movementY;
			var x = this._offset.x + DX;
			var y = this._offset.y + DY;
			this.style["transform"] = 'translate3d(' + x + 'px,' + y + 'px, 0px)';
			this.style["-webkit-transform"] = 'translate3d(' + x + 'px,' + y + 'px, 0px)';
			
			var grid_size = 7;
			var temp = [Math.round(DX/grid_size), Math.round(DY/grid_size)];
			if(temp[0] != this._movement[0] || temp[1] != this._movement[1]){
				checkDrop(group[0]._drop_targets, event);
			}
			this._movement = temp;
			
		}).on("pressup", function(event){
			
			if(!this._if_choosed){return false;}
			
			var drag = $(this); 
			var group = this._group;
			
			group.removeAttr('dragging');
			this._if_choosed = false;		
			this.style["box-shadow"] = "";
			this.style["zIndex"] = "";
			this.style["transform"] = 'translate3d(0px, 0px, 0px)';
			this.style["-webkit-transform"] = 'translate3d(0px, 0px, 0px)';
	
			var target = checkDrop(group[0]._drop_targets, event);	
			if(target){
				hil_activity.activity.clearMark( target );
				hil_activity.drag.dropTo( drag, target );
				drag.trigger('activity_change');
			}
			else{
				hil_activity.drag.dropBack( drag );
			}	
			
		});
				
};

hil_activity.drag.checkDrop = function( targets, event ){
	
	var rev, pos, clientX, clientY, target;
	
	// Danger: in Jquery.each(), return false means break!
	for(var it=0, itd=targets.length; it < itd; it++){
		target = targets[it];	
		
		pos = target.getBoundingClientRect();
		clientX = event.point.clientX;
		clientY = event.point.clientY;
		if(	clientX < pos.left ||
			clientX > pos.left + target.offsetWidth ||
			clientY < pos.top ||
			clientY > pos.top + target.offsetHeight 
		){
			// outside this drog-box
			target.setAttribute('hover', 'no');
		}
		else{
			// inside this drog-box
			target.setAttribute('hover', 'yes');
			rev = $(target);
		}
	}

	return rev;
}

hil_activity.drag.init = function(){
	
	$('div.hil-activity-group div.hil-drop-box').each(function(){
		var box = $(this);
		if( box.attr("data-width") ){ box.width( box.attr("data-width") ); }
		if( box.attr("data-height") ){ box.height( box.attr("data-height") ); }	
	});
	
	$('div.hil-activity-group div.hil-drag-box').each(function(){
		var box = $(this);
		if( box.attr("data-width") ){ box.width( box.attr("data-width") ); }
		if( box.attr("data-height") ){ box.height( box.attr("data-height") ); }	
		box[0]._copy = box.html();
	});
	
	// dragging & drop
	$('div.hil-activity-group').each(function(){		
		var group = $(this);
		hil_activity.drag.initGroup( group );	
		group.find('div.hil-drag').each(function(){	
			var drag = $(this);
			hil_activity.drag.initDrag( drag );
		});	
	});
	
}

hil_activity.drag.showAnswer = function( group ){	
	this.reset(group);
	group.find('div.hil-drop-box').each(function(){
		var box = $(this);
		var answer = this.getAttribute("answer");		
		var drag = group.find('div.hil-drag-box div.hil-drag[value='+answer+']');
		hil_activity.drag.dragOut(drag);
		hil_activity.drag.dropTo(drag, box);
	});
}

hil_activity.drag.reset = function( group ){
	group.find('div.hil-drop-box div.hil-drag').each(function(){
		var drag = $(this);
		hil_activity.drag.dragOut(drag);
		hil_activity.drag.dropBack(drag);
	});
}

// enableSingleTouch_v1.02
hil_activity.drag.enableDrag = enableSingleTouch;



// -----------------
//	INIT
// -----------------
$(document).ready( function(){
	
	var groups = $('div.hil-activity-group');
	
	// check answers
	groups.find('.hil-activity').each(function(){
		var answer = $(this).attr('answer');
		if( typeof(answer) === "undefined" ){
			console.log('Warning: an answer of hil-activity is missing');
		}
	});
	
	// INIT
	hil_activity.dropdown.init();
	hil_activity.select.init();
	hil_activity.input.init();
	hil_activity.drag.init();
	hil_activity.checkbox.init();
	hil_activity.radiobtn.init();
	hil_activity.subgroup.init();
	hil_activity.group.init();
	
	// init answer button & explain
	groups.each(function(){
		var group = $(this);
		this._answer_btn = group.find('.hil-answer:first');
		this._retry_btn = group.find('.hil-retry:first');
		this._submit_btn = group.find('.hil-submit:first');
		this._submit_btn_disabled = this._submit_btn.attr("disabled");
		this._retry_btn_disabled = this._retry_btn.attr("disabled");
		this._answer_btn_disabled = this._answer_btn.attr("disabled");

		if( this._answer_btn.attr("start-show") === undefined){
			hil_activity.group.hideAnswerBtn( group, 0 );
		}
		group.find('div.hil-explain').hide();
	});	
	
	

	// GROUP EVENT
	
	// submit button
	groups.on('click', '.hil-submit', function(event){
		hil_activity._submit( $(event.delegateTarget), true );
	});
	
	// reset button
	groups.on('click', '.hil-retry', function(event){
		hil_activity._reset( $(event.delegateTarget) );
	});

	// answer button
	groups.on('click', '.hil-answer', function(event){
		hil_activity._showAnswer( $(event.delegateTarget) );
	});
	

	groups.each(function(){
		var group = $(this);
		
		// show when all correct or something incorrect
		group.find('.hil-show-on-all-correct').hide();
		group.find('.hil-show-on-incorrect').hide();
		$('#'+group.attr('show-on-finish')).hide();
		
		hil_activity.get(group)
			.onAllCorrect(function(event){
				var group = $(event.target);
				group.find('.hil-show-on-all-correct').fadeIn();
				group.find('.hil-show-on-incorrect').fadeOut();
				$('#'+group.attr('show-on-finish')).fadeIn();
			})
			.onSomeWrong(function(event){
				var group = $(event.target);
				group.find('.hil-show-on-all-correct').fadeOut();
				group.find('.hil-show-on-incorrect').fadeIn();
			})
			.onChange(function(event){
				var group = $(event.delegateTarget);
				group[0]._retry_btn.removeAttr("disabled");
				group[0]._submit_btn.removeAttr("disabled");
				
				// auto submit
				if(group[0].hasAttribute("auto-submit")){
					hil_activity._submit( group, false );
				}
				else{
					group.find('.hil-show-on-incorrect').fadeOut();	
				}
			});
	});

});



// ---------------------
// v1.02 single touch
// ---------------------

// API function
function enableSingleTouch(obj){
	
	obj.events = {};
	obj.on = hil_single_touch.on;
	obj.trigger = hil_single_touch.trigger;
	obj.clearEvent = hil_single_touch.clearEvent;

	obj.addEventListener( "touchstart", hil_single_touch.start, false);
	obj.addEventListener( "mousedown", hil_single_touch.start, false);

}


// js
var hil_single_touch = hil_single_touch || {};

hil_single_touch.if_pressed = false;
hil_single_touch.press_obj = null;
hil_single_touch.press_type = null;
hil_single_touch.start_pos = null;
hil_single_touch.touch_id = null;

hil_single_touch.on = function(action, handler){
	
	if( !(action in this.events) ){
		this.events[action] = {handler:[]};
	}
	this.events[action].handler.push(handler);
	
	return this;
};


hil_single_touch.trigger = function(){
	
	var action = arguments[0];
	var events = this.events;
	var arg = Array.prototype.slice.call(arguments, 1);
	
	if( action in events ){	
		for(var it = 0, itd = events[action].handler.length; it < itd; it++){
			events[action].handler[it].apply( this, arg );
		}
	}
	
};


hil_single_touch.clearEvent = function(action){
	
	if(action in this.events){
		this.events[action].handler = [];
	}
	
};


hil_single_touch.start = function(event){
	
	event.preventDefault();
	
	var a = hil_single_touch;
	if(a.if_pressed){return false;}
	
	
	var obj = this;
	var evt = event.type[0] === "t" ? event.changedTouches[0] : event;
	
	a.if_pressed = true;
	a.press_obj = obj;
	a.press_type = event.type;
	a.touch_id = evt.identifier;
	a.start_pos = {x: evt.pageX, y: evt.pageY};
	
	var rect = obj.getBoundingClientRect();
	event.stageX = evt.clientX - rect.left;
	event.stageY = evt.clientY - rect.top;
	hil_single_touch.copyPos(event, evt, a.start_pos);
	
	obj.trigger("mousedown", event);
		
};


hil_single_touch.move = function(event){
	
	var a = hil_single_touch;
	if(!a.if_pressed){return false;}
	if(event.type[0] !== a.press_type[0]){return false;}
	
	var obj = a.press_obj;
	var rect = obj.getBoundingClientRect();
	var copyPos = hil_single_touch.copyPos;
	
	if(event.type[0] === "m"){
		event.stageX = event.clientX - rect.left;
		event.stageY = event.clientY - rect.top;
		copyPos(event, event, a.start_pos);
		obj.trigger("pressmove", event);
	}
	else if( event.type[0] === "t"){
		var touches = event.changedTouches;
		for(var it = 0, itd = touches.length; it < itd; it++){
			if(touches[it].identifier === a.touch_id){				// find the touch that matches the initial touch
				event.stageX = touches[it].clientX - rect.left;
				event.stageY = touches[it].clientY - rect.top;
				copyPos(event, touches[it], a.start_pos);
				obj.trigger("pressmove", event);
				break;
			}
		}
	}
		
};


hil_single_touch.end = function(event){
	
	var a = hil_single_touch;
	if(!a.if_pressed){return false;}
	if(event.type[0] !== a.press_type[0]){return false;}
	
	var obj = a.press_obj;
	var rect = obj.getBoundingClientRect();
	var copyPos = hil_single_touch.copyPos;
	
	if(event.type[0] === "m"){
		event.stageX = event.clientX - rect.left;
		event.stageY = event.clientY - rect.top;
		copyPos(event, event, a.start_pos);
		a.if_pressed = false;
		obj.trigger("pressup", event);
		
	}
	else if( event.type[0] === "t" ){
		var touches = event.changedTouches;
		for(var it = 0, itd = touches.length; it < itd; it++){
			if(touches[it].identifier === a.touch_id){			// find the touch that matches the initial touch
				event.stageX = touches[it].clientX - rect.left;
				event.stageY = touches[it].clientY - rect.top;
				copyPos(event, touches[it], a.start_pos);
				a.if_pressed = false;
				obj.trigger("pressup", event);
				break;
			}
		}
	}
	
};


hil_single_touch.copyPos = function(event, target, start_pos){
	
	event.point = 
		{	clientX: target.clientX
		,	clientY: target.clientY
		,	pageX: target.pageX
		,	pageY: target.pageY
		,	screenX: target.screenX
		,	screenY: target.screenY
		,	movementX: target.pageX - start_pos.x
		,	movementY: target.pageY - start_pos.y
		};

}


// init

var win = window;
var win_top = window.top;

win.addEventListener( "touchmove", hil_single_touch.move, false);
win.addEventListener( "mousemove", hil_single_touch.move, false);

win.addEventListener( "touchend", hil_single_touch.end, false);
win.addEventListener( "touchcancel", hil_single_touch.end, false);
win.addEventListener( "mouseup", hil_single_touch.end, false);

// if the current window is a less-top window, i.e., an iframe
// while ( win != win_top ) {	
// 	win = win.parent;
// 	win.addEventListener( "touchend", hil_single_touch.end, false);
// 	win.addEventListener( "touchcancel", hil_single_touch.end, false);
// 	win.addEventListener( "mouseup", hil_single_touch.end, false);	
// }


$(document).ready(function(){
	
	// init
	$('div.hil-youtube').each(function(){
		var box = $(this);
		var audio_M = box.attr('audio-M') || box.attr('audio-m');
		var audio_C = box.attr('audio-C') || box.attr('audio-c');
		var player = $('<audio controls preload="none"><source type="audio/mpeg"/><p>Your browser does not support HTML5 audio.</p></audio>');
		var trans = $.cookie('googtrans');
		box.append('<div class="btn-play"><i class="icon fa fa-play"></i></div>');

		if(trans !== undefined){
			if ( trans.match(/CN$/) && audio_M ) {
				player.attr('src', audio_M);
				box.append(player);
				box.addClass('has-audio has-audio-M');
			}
			else if( trans.match(/TW$/) && audio_C ){
	
				player.attr('src', audio_C);
				box.append(player);
				box.addClass('has-audio has-audio-C');
			}
			else{
				box.addClass('no-audio');
			}
		}
		else{
			box.addClass('no-audio');
		}
		
	});
	
	$('div.hil-youtube').on('click', 'div.btn-play', function(event){
		var box = $(event.delegateTarget);
		var player = box.find('audio');
		box.addClass('playing');

		var win = open( box.attr('video'), "_blank", "top=100,left=300,width=660,height=440");
		if(player.length){
			player[0].currentTime = 0;
			player[0].play();
		}
		var timer = setInterval(function(){
			if(win.closed){
				box.removeClass('playing');
				if(player.length){ player[0].pause(); }
				clearTimeout(timer);
			}
		}, 500);
	});
	
	
});
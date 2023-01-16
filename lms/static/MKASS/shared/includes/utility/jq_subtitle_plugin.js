// http://html5-demos.appspot.com/static/whats-new-with-html5-media/template/index.html#13

$(document).ready(function(){

	$('video[subtitle]').each(function(){
		
		var track = this.textTracks[0];
		track.mode = "hidden";
		
		var id = $(this).attr('subtitle');
		var sub_box = $('#'+id);
		if(sub_box.length == 0){return;}
		sub_box.addClass('video-subtitle');
		
		var sub = document.createElement('div');
		sub_box = sub_box.get(0);
		sub_box.appendChild(sub);
		sub.style['width'] = '100%';
		sub.style['height'] = '100%';
		sub.style['transition'] = 'opacity 200ms linear';
		sub.style['overflow'] = 'hidden';
		sub.style['opacity'] = 0;

		this.sub = sub;
		this.sub_id = null;
		
		this.addEventListener('timeupdate', function(e){

			var act_cue = track.activeCues[0];
			
			if(act_cue){
				if(act_cue.id !== this.sub_id){
					this.sub.innerHTML = act_cue.text;
					this.sub.style['opacity'] = 1;
					this.sub_id = act_cue.id;
				}
			}
			else{
				this.sub.style['opacity'] = 0;
				this.sub_id = null;
			}
			
		});
	
	});
	
});



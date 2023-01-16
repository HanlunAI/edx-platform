var GA_Tracking = true;		//turn on/off Google Analytics tracking

(function(){
"use strict";

	$.holdReady(true);

	var head = document.getElementsByTagName('head')[0];
	var base = null;
	var scripts = document.getElementsByTagName('script');
	for(var it=0, itd=scripts.length; it < itd; it++){
		var src = scripts[it].src;
		var inx = src.indexOf('hil.js');
		if(inx !== -1){
			base =  src.slice(0, inx);
		}
	};
	var dir = base + '../includes/';
	var css_ref = head.getElementsByTagName('link');
	css_ref = css_ref.length ? css_ref[0] : null;

	var loading_script_num = 0;
	var getScript = function(url){
		var script = document.createElement('script');
		script.onload = scriptLoaded;
		script.onerror = scriptLoadError;
		script.src = url;
		head.appendChild(script);
		loading_script_num++;
	};

	var getCss = function(url){
		var css = document.createElement('link');
		css.rel = 'stylesheet';
		css.href = url;
		if(css_ref){
			head.insertBefore(css, css_ref);
		}
		else{
			head.appendChild(css);
		}
	};

	var scriptLoaded = function(){
		loading_script_num--;
		if(loading_script_num === 0){
			$.holdReady(false);
		}
	};

	var scriptLoadError = function(event){
		console.log( "The script " + event.target.src + " is not accessible." );
		loading_script_num--;
		if(loading_script_num === 0){
			$.holdReady(false);
		}
	}

	// some plugins
	// mathjax extensions are configged in TeX-AMS-MML_HTMLorMML.js
	getScript( dir + 'MathJax/MathJax.js?config=TeX-AMS-MML_HTMLorMML' );
	getScript( dir + 'utility/jquery.cookie.js' );
	getScript( dir + 'utility/bs_multimedia_plugin.js' );
	getScript( dir + 'utility/bs_responsive_plugin.js' );
	getScript( dir + 'utility/bs_embed_video_plugin.js' );
	getScript( dir + 'utility/jq_subtitle_plugin.js' );
	getScript( dir + 'utility/diagnostic_env.js' );
	getScript( dir + 'utility/hil_style.js' );

	// optional add-on, lazy load
	if( $('.hil-activity-group').length ){
		getScript( dir + 'utility/hil_activity.js' );
		getCss( dir + 'utility/hil_activity.css' );
	}

	if( $('.hil-grid-item').length ){
		getScript( dir + 'utility/hil_grid_item.js' );
		getCss( dir + 'utility/hil_grid_item.css' );
	}

	if( $('.hil-flowChart').length ){
		getScript( dir + 'utility/hil_flowchart.js' );
	}

	if( $('.hil-puppet').length ){
		getScript( dir + 'utility/hil_puppet.js' );
		getCss( dir + 'utility/hil_puppet.css' );
		getCss( dir + 'utility/hil_animate.css' );
	}

	if( $('div.hil-youtube').length ){
		getScript( dir + 'utility/jq_youtube_plugin.js' );
		getCss( dir + 'utility/jq_youtube_plugin.css' );
	}

	/* Comment by Ray Tam @ 2017.4.3
	// when the web page is accessed online
	if( window.location.protocol.indexOf('http') !== -1 ){

		// google translate
		getScript( dir + 'utility/google_translate.js' );
		getCss( dir + 'utility/google_translate.css' )

	}
	*/
	// google translate
	getScript( dir + 'utility/hil_multilang.js' );

	//Google Anayltics
	if (GA_Tracking) {
		var po = document.createElement('script');
		po.type = 'text/javascript';
		po.async = true;
		po.src = 'https://www.googletagmanager.com/gtag/js?id=UA-21437538-10';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);

		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}
		gtag('js', new Date());

		gtag('config', 'UA-21437538-10');
	}
})();

 /*$(document).ready(function() {
	var allLessonNodes='';
	$.ajax({
		type: "GET",
		url: "/api/",
		data: {api_name:'lesson_id'},
		dataType: "json",
		success: function(data){
			//Success Start
			allLessonNodes = data;
			$("a[href^='/assessment/mc/quiz']").each(function()
			{
				if (this.href.indexOf("/assessment/mc/quiz") > 0) {
					var lessonList = allLessonNodes;
					var keyStr = "&lesson=";
					var lessonName = this.href.substring(this.href.indexOf(keyStr)+keyStr.length, this.href.length);
					console.log('Found:' + decodeURI(lessonName));
					//console.log(decodeURI(lessonName)+"-"+lessonList[0].lessonname);
					var fromStr = this.href.substring(this.href.indexOf(keyStr), this.href.length);
					var toStr = "";
					for (var i=0; i<lessonList.length; i++) {
						if (lessonList[i].lessonname==decodeURI(lessonName)) {
							toStr = keyStr+lessonList[i].lessonid;
							console.log(decodeURI(lessonName)+"==>"+lessonList[i].lessonid);
							break;
						}else{
							toStr = fromStr;
						}
					}
					this.href = this.href.replace(fromStr, toStr);
				}
			});
			//console.log(data);

			//Add Listener
			var lesson_info = $(".row .title a");
			var lessonids = "";
			lesson_info.each(function(){
				var lesson_url = $(this).attr('href').split("&lesson=");
				var lessonid = lesson_url[1];
				lessonids = lessonids + "," + lessonid;
				console.log('lesson_info : ' + lessonids + '==' + lessonid);
				var lesson_start_table = $(this).parent("div").parent("div").next().children("table");
				var lesson_start_href = lesson_start_table.find("a");
				lesson_start_href.each(function(){
					$(this).click(function(){
						var return_url = $(this).attr("href");
						//console.log(lessonid + "-" + return_url);
						$.ajax({
							type: "GET",
							url: "/api/",
							data: {api_name: 'lesson_start', lesson: lessonid},
							dataType: "json",
							success: function(data) {
								if(data.data == 1 || data.data == "1"){
									console.log("Code: Green 200");
									window.location.href = "./" + return_url;
								}else{
									console.log("Code: Red 400");
									window.location.href = "./" + return_url;
								}
							}
						});
						return false;
					});
				});
			});
			//Listener End

			//Lesson leave
			console.log(lessonids);
			$.ajax({
				type: "GET",
				url: "/api/",
				data: {api_name: 'lesson_leave',lessonids:lessonids},
				dataType: "json",
				success: function(data) {
					//Success Start
					if(data.data == -1 || data.data == "-1"){
						console.log("Code: Red 400");
					}else{
						console.log("Code: Green 200");
					}
				}
			});

		}
		//Success End
	});
	//Document ready ajax end

});*/
//Document ready end






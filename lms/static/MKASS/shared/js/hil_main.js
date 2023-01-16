var GA_Tracking = true;		//turn on/off Google Analytics tracking

(function(){
"use strict";

	$.holdReady(true);

	var head = document.getElementsByTagName('head')[0];
	var base = null;
	var scripts = document.getElementsByTagName('script');
	for(var it=0, itd=scripts.length; it < itd; it++){
		var src = scripts[it].src;
		var inx = src.indexOf('hil_main.js');
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

function googleTranslateElementInit() {
	new google.translate.TranslateElement({
		pageLanguage: 'zh-TW',
		includedLanguages: 'en,zh-CN,zh-TW',
		layout: google.translate.TranslateElement.InlineLayout.SIMPLE
	}, 'google_translate_element');
}


$(document).ready( function(){
	
	var trans = $.cookie('googtrans');
	if(trans === undefined){ 
		setLang( 'TW' );
		trans = $.cookie('googtrans');
	}
	
	// translate
	if(typeof(MathJax)!=="undefined"){
		// don't translate the Mathjax content
		MathJax.Hub.Register.StartupHook( "End", function () { 
			$('.MathJax').addClass('notranslate');
			$.getScript("//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit");
		});
	}
	else{
		$.getScript("//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit");
	}
	
	
	// set the indicator
	if (trans.indexOf('CN') !== -1) {
		$('.lang>a').eq(0).removeClass('on').addClass('off');
		$('.lang>a').eq(1).removeClass('off').addClass('on');	
	} 
	else {
		$('.lang>a').eq(0).removeClass('off').addClass('on');
		$('.lang>a').eq(1).removeClass('on').addClass('off');
	}
	
	$('.lang>a').eq(0).click(function() {		
		setLang('TW');
		location.reload();
	});
	$('.lang>a').eq(1).click(function() {		
		setLang('CN');
		location.reload();
	});
	
	
	function setLang( lang ){
		if( lang == 'TW'){
			transTo = 'zh-TW';
		}
		else if( lang == 'CN' ){
			transTo = 'zh-CN';
		}
		else{ 
			return; 
		}
		
		var cur_domain_arr = document.domain.split(".");
		var cur_domain = "";
		if (typeof cur_domain_arr[(cur_domain_arr.length-2)] != 'undefined'){
			cur_domain = cur_domain_arr[(cur_domain_arr.length-2)] + "." + cur_domain_arr[(cur_domain_arr.length-1)];
		}else {
			cur_domain = cur_domain_arr[(cur_domain_arr.length-1)];
		}
		// console.log("current domain is " + cur_domain);
		
		try{
			$.cookie('googtrans', '/zh-TW/' + transTo, {
				expires: null,
				path: '/'
			});
		}catch (e){
			console.log(e);
		}

		try{
			$.cookie('googtrans', '/zh-TW/' + transTo, {
				expires: null,
				path: '/',
				domain:cur_domain
			});
		}catch (e){
			console.log(e);
		}
		
	}


});
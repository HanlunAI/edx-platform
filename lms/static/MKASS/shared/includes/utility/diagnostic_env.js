	$(document).ready(function() {
		var param = getUrlVars();
		
		if( param.mode == 'quiz' ){
			
			$("header .breadcrumb-holder").addClass("diagnostic");
			$("table.lesson-index").addClass("diagnostic");
			$(".content.lesson-info").addClass("diagnostic");
			
			var a = $("ol.breadcrumb li:nth-child(2) a");
			var href = a.attr("href");
			a.attr( "href", href.replace("e-learning", "diagnostic") );
			a.html("診斷式評估");
			
			var a = $("ol.breadcrumb li:nth-child(3) a");
			var href = a.attr("href");
			a.attr( "href", href.replace("e-learning", "diagnostic") );
		}
	});
	
	function getUrlVars() {
		var vars = {};
		var parts = window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
			vars[key] = value;
		});
		return vars;
	}
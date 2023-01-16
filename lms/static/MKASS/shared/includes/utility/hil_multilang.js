	function switchLangPage(id) {
		//jQuery
		var pathname = $(location).attr('pathname');
		var a = pathname.lastIndexOf("/");
		var pathnamefolder = pathname.substring(0, a);
		var b = pathnamefolder.lastIndexOf("/");
		var modulename = pathname.substring(b+1, a);
		var pathprefix = pathname.substring(0, b+1);
		
		switch(id) {
			case 'tc':
				target_modulefolder = modulename.substring(0, modulename.length-1) + pathname.substring(a, pathname.length);;
				break;
			case 'sc':
				target_modulefolder = modulename + 'A' + pathname.substring(a, pathname.length);
				break;
		}
		//alert(pathprefix + target_modulefolder);
		document.location.href = pathprefix + target_modulefolder;
	}
	
	$("#tc").click(function(event) {
	  var id = event.target.id;
	  var classname = $(this).attr('class');
	  
	  if (classname!='on') switchLangPage(id);
	});
	
	$("#sc").click(function(event) {
	  var id = event.target.id;
	  var classname = $(this).attr('class');
	  
	  if (classname!='on') switchLangPage(id);
	});
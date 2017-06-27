// JavaScript Document
$(document).ready(function(){
 	
	AOS.init({
      offset: 200,
      duration: 600,
      easing: 'ease-in-sine',
      delay: 100,
    });
	
// code for skill bars	
	$(document).ready(function() {
	  $('.progress progress').each(function() {
		$(".progress label[for='" + $(this).attr('id') + "']")
		  .text(this.value + "%")
		  .animate({'margin-left': $(this).width() * $(this).attr("value") / 100 -
			$(".progress label[for='" + $(this).attr('id') + "']").width() / 2 + "px"}, 2000, 'easeOutQuad');
	  });
	});
	
});


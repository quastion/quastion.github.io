$(document).ready(function() {
  let url = '';
  let form = $('.form')[0];
  if(form){
    $(form).submit(function(e) {
      e.preventDefault();
      $.ajax({
        type: "POST",
        url: "mail.php",
        data: $(form).serialize(),
        success: function(data) {
          let popup = $('.popup-bg')[0];
          popup.classList.remove('hide');
          setInterval(function() {
            popup.classList.add('hide');
          }, 3000);
        }
	     });
    });
  }
});

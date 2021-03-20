(function ($) {
  'use strict';

  /*==================================================================
  // $('.input100').each(function () {
  //   $(this).on('blur', function () {
  //     if ($(this).val().trim() != '') {
  //       $(this).addClass('has-val');
  //     } else {
  //       $(this).removeClass('has-val');
  //     }
  //   });
  // });

  /*==================================================================
    [ Validate ]*/

  var name = $('.validate-input input[name="name"]');
  var message = $('.validate-input textarea[name="message"]');

  $('.validate-form').on('submit', function (e) {
    var check = true;
    e.preventDefault();

    if ($(name).val().trim() == '') {
      showValidate(name);
      check = false;
    }

    if ($(message).val().trim() == '') {
      showValidate(message);
      check = false;
    }

    if (check == true) {
      submitDetailsForm();
    }
    return check;
  });

  $('.validate-form .input100').each(function () {
    $(this).focus(function () {
      hideValidate(this);
    });
  });

  function showValidate(input) {
    var thisAlert = $(input).parent();

    $(thisAlert).addClass('alert-validate');
  }

  function hideValidate(input) {
    var thisAlert = $(input).parent();

    $(thisAlert).removeClass('alert-validate');
  }
})(jQuery);

function submitDetailsForm() {
  let name = $('#name').val();
  let voiceId = $('#selectVoice option:selected').val();
  let language = $('#selectLanguage option:selected').val();
  let text = $('#textData').val();

  ttsApiCall(name, voiceId, language, text);
}

function ttsApiCall(name, voiceId, language, text) {
  axios
    .post(
      'http://localhost:5500/speech',
      {
        Text: text,
      },
      {
        params: {
          voiceId: voiceId,
          filename: `${name}.mp3`,
          type: 'file',
          language: language,
        },
      }
    )
    .then((response) => {
      console.log(response);

      $('#audioElement').attr('src', response?.data?.url);
    })
    .catch((error) => console.error(error));
}

function submitDetailsForm() {
  debugger;
  let t1 = $('#name').val();
  debugger;
  ttsApiCall();
  $('#formId').submit();
}

function ttsApiCall() {
  axios
    .post(
      'http://localhost:5500/speech',
      {
        Text: 'Khyati Foundation is located in the discipline and serene premises.',
      },
      {
        params: {
          voiceId: 'Aditi',
          filename: 'khyatiIntro.mp3',
          type: 'file',
          language: 'en-IN',
        },
      }
    )
    .then((response) => {
      console.log(response);
      debugger;

      $('#audioElement').attr('src', response?.data?.url);
    })
    .catch((error) => console.error(error));
}

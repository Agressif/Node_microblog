$(() => {
  init();
  // if ($('.ui.success.message').length > 0) {
  //   $('.ui.success.message').fadeOut(1000)
  // } else if ($('.ui.error.message').length > 0) {
  //   $('.ui.error.message').fadeOut(1000)
  // }
});

function init() {
  $('.ui.form').form({
    on: 'blur',
    fields: {
      username: {
        identifier: 'username',
        rules: [{
          type: 'minLength[3]',
          prompt: 'Please enter at least 3 characters'
        }]
      },
      password: {
        identifier: 'password',
        rules: [{
          type: 'minLength[6]',
          prompt: 'Please enter at least 6 characters'
        }]
      },
      repeaPassword: {
        identifier: 'password-repeat',
        rules: [{
          type: 'match[password]',
          prompt: 'Please repeat your password'
        }]
      },
    }
  })
};

function show() {
  $('.ui.modal').modal('show');
};
$(() => {
  login();
  submitSignupForm1();
  submitSignupForm2();
});

function login() {
  $('#loginForm').submit(() => {
    const data = JSON.stringify({ email: $('#inputEmail').val(), password: $('#inputPassword').val() });
    $.ajax({
      method: 'POST',
      url: '/auth/login',
      headers: { 'Content-Type': 'application/json' },
      data,
      success(result) {
        // store result in local in local storage
        localStorage.setItem('token', result.token);
        localStorage.setItem('name', result.user.name);
        localStorage.setItem('email', result.user.email);

        // Redirect to dashboard
        window.location.href = '/app/dashboard';
      },
      error(xhr, ajaxOptions, thrownError) {
        console.log(xhr.status);
        console.log(thrownError);
        alert(xhr.responseText);
      },
    });

    return false;
  });
}

function logout() {
  localStorage.clear();
  window.location.href = '/';
}

function submitSignupForm1() {
  $('#signupForm1').submit(() => {
    const data = JSON.stringify({
      email: $('#signupEmail').val(),
      msisdn: $('#signupPhone').val(),
      name: $('#signupName').val(),
      password1: $('#signupPass1').val(),
      password2: $('#signupPass2').val(),
    });
    signup(data);
  });
}

function submitSignupForm2() {
  $('#signupForm2').submit(() => {
    const data = JSON.stringify({
      email: $('#signupEmail2').val(),
      msisdn: $('#signupPhone2').val(),
      name: $('#signupName2').val(),
      password1: $('#signup2Pass1').val(),
      password2: $('#signup2Pass2').val(),
    });
    signup(data);
  });
}

function signup(data) {
  $.ajax({
    method: 'POST',
    url: '/auth/signup',
    headers: { 'Content-Type': 'application/json' },
    data,
    success(result) {
      // store result in local in local storage
      localStorage.setItem('token', result.token);
      localStorage.setItem('name', result.user.name);
      localStorage.setItem('email', result.user.email);

      // Redirect to dashboard
      window.location.href = '/app/dashboard';
    },
    error(xhr, ajaxOptions, thrownError) {
      console.log(xhr.status);
      console.log(thrownError);
      alert(`Error happened: ${xhr.responseText}`);
    },
  });

  return false;
}

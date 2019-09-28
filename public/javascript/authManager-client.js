$(function () {
  login();
  signup();
})

function login() {
  $('#loginForm').submit(function () {
    const data = JSON.stringify({ "email": $('#inputEmail').val(), "password": $('#inputPassword').val() })
    $.ajax({
      method: 'POST',
      url: '/auth/login',
      headers: { 'Content-Type':'application/json' },
      data,
      success: function (result) {
        // store result in local in local storage
        localStorage.setItem('token', result.token);
        localStorage.setItem('name', result.user.name);
        localStorage.setItem('email', result.user.email);

        // Redirect to dashboard
        window.location.href = '/app/dashboard';
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.log(xhr.status);
        console.log(thrownError);
        alert(xhr.responseText);
      }
    });

    return false;
  });
}

function logout() {
  localStorage.clear();
  window.location.href = '/';
}

function signup() {
  $('#signupForm').submit(function () {
    const data = JSON.stringify({ 
      "email":     $('#signupEmail').val(),
      "msisdn":    $('#signupPhone').val(),
      "name":      $('#signupName').val(),
      "password1": $('#signupPass1').val(),
      "password2": $('#signupPass2').val()
    });

    $.ajax({
      method: 'POST',
      url: '/auth/signup',
      headers: { 'Content-Type':'application/json' },
      data,
      success: function (result) {
        // store result in local in local storage
        localStorage.setItem('token', result.token);
        localStorage.setItem('name', result.user.name);
        localStorage.setItem('email', result.user.email);

        // Redirect to dashboard
        window.location.href = '/app/dashboard';
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.log(xhr.status);
        console.log(thrownError);
        alert("Error happened: " + xhr.responseText);
      }
    });

    return false;
  });
}
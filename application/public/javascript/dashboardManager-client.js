$(function () {
  displayLoggedInUser()
})

function displayLoggedInUser() {
  const name = localStorage.getItem('name');
  $('#loggedInUserName').text(name);
}
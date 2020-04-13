$(() => {
  displayLoggedInUser();
  getDashboardData();
});

function displayLoggedInUser() {
  const name = localStorage.getItem('name');
  $('#loggedInUserName').text(name);
}

function getDashboardData() {
  const userId = localStorage.getItem('userId');
  const jwt = localStorage.getItem('token');

  request = $.ajax({
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", 'Bearer ' + jwt);
    },
    url: `/charts/stats/${userId}`,
    dataType: 'json',
  });

  request.done(function (data) {
    const { invoicedAmounts, monthStats } = data
    drawChart(invoicedAmounts);
    populateDashboardStats(monthStats);
  });

  request.fail(function (jqXHR, textStatus) {
    console.log('/charts/stats/ error: ', textStatus);
  });
}

function populateDashboardStats(data) {
  $('#invoicedAmount').text(`${data.totalInvoicedAmount} Kshs`);
  $('#occupancy').text(`${data.occupancy} % (${data.occupants}/${data.units})`);
}

function drawChart(data) {
  var ctx = $('#dashboardChart');
  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Amount Invoiced',
        data: data.data,
        fill: false,
        backgroundColor: [
          // 'rgba(255, 99, 132, 0.2)',
          // 'rgba(54, 162, 235, 0.2)',
          // 'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          // 'rgba(153, 102, 255, 0.2)',
          // 'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          // 'rgba(255, 99, 132, 1)',
          // 'rgba(54, 162, 235, 1)',
          // 'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          // 'rgba(153, 102, 255, 1)',
          // 'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
    }
  });
}

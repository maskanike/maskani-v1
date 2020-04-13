const tenantDataToEdit = {};
let unitToAddTenant;
let currentFlatId;
let selectedMonth;
let selectedYear;

$(() => {
  getFlats();
  populateEditTenantModal();
  toggleUnitDropDownIfTenantChanged();
  getUnitIdFromOpenModal();
  setSelectedMonthInDropDown();
  setSelectedYearInDropDown();
  getSelectedMonth();
  getSelectedYear();
});

function getFlats() {
  const jwt = localStorage.getItem('token');
  const request = $.ajax({
    url: '/admin/flat/',
    beforeSend(xhr) {
      xhr.setRequestHeader('Authorization', `Bearer ${jwt}`);
    },
  });

  request.done((data) => {
    // TODO Weird workaround to get valid JSON. Move this to the backend.
    const parsedData = jQuery.parseJSON(JSON.stringify(data));
    if (!parsedData[0]) {
      $('#addFlat').css('visibility', 'visible');
      return;
    }
    buildUnitTable(parsedData[0].id);

    $('#defaultFlat').html = '';
    $('#defaultFlat').append(`<button type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" class="btn btn-light dropdown-toggle">${parsedData[0].name}</button>`);

    currentFlatId = parsedData[0].id;
    getFlatTenants(currentFlatId);

    helpers.buildDropdown(
      parsedData,
      $('#flats'),
    );
  });

  request.fail(() => {
    window.location.href = '/login';
  });
}

function buildUnitTable(flatId) {
  const jwt = localStorage.getItem('token');
  $.ajax({
    url: `/admin/unit/?flatId=${flatId}`,
    beforeSend(xhr) {
      xhr.setRequestHeader('Authorization', `Bearer ${jwt}`);
    },
  }).done((data) => {
    $('#unitTable').empty();
    if (data != '') {
      $.each(data, (k, v) => {
        if (v.Tenant) {
          const lastReceiptDetails = getLastReceiptDate(v.Tenant.Receipts);
          let receiptString;
          let rowFormat = 'table-warning';
          if (lastReceiptDetails) {
            receiptString = `<p> Date: ${lastReceiptDetails.date}</p><p> Total: ${lastReceiptDetails.amount}</p>`;
            if (helpers.checkIfReceiptSentThisMonth(lastReceiptDetails.date)) {
              rowFormat = 'table-success';
            }
          } else {
            receiptString = '-';
          }

          $('#unitTable').append(
            `<tr class="${rowFormat} id="${v.id}"><form class="form1"></form><th scope="row">${v.name}</th><td data-id="tenantName">${v.Tenant.User.name}</td>`
            + `<td><p>${v.Tenant.User.msisdn}</p><p>${v.Tenant.User.email}</p><p> <a data-toggle="modal" data-name="${v.Tenant.User.name}" data-email="${v.Tenant.User.email}" `
            + `data-msisdn="${v.Tenant.User.msisdn}" data-amount="${v.Tenant.receiptAmount}" data-id="${v.id
            }" data-tenant="${v.Tenant.id}" data-user="${v.Tenant.User.id}"`
            + 'data-target="#uAllTenants" href="#nogo">Edit </a></p></td>'
            + `<td> <p>Amount: KES ${v.Tenant.receiptAmount}</p></td>`
            + `<td>${receiptString}</td>`
            + '<td><button class="btn btn-block btn-primary"'
            + ` onclick="sendReceipt(${v.Tenant.id},${v.Tenant.receiptAmount})">Send Receipt</button></td></tr>)`,
          );
        } else {
          $('#unitTable').append(
            `<tr id="${v.id}"><th scope="row">${v.name}</th><td colspan="4">Unoccupied</td><td scope="row"><button class="btn btn-block btn-info", data-toggle="modal", data-target="#uAddTenant" data-unit="${v.id}">Add Tenant</button></td></tr>`,
          );
          $('#inputUnit').append(
            `<option value=${v.id}>${v.name}</option>`,
          );
        }
      });
    }
  });
}

function sendReceipt(tenantId, amount) {
  receiptData = {
    tenantId, amount,
  };
  const jwt = localStorage.getItem('token');

  request = $.ajax({
    beforeSend(xhr) {
      xhr.setRequestHeader('Authorization', `Bearer ${jwt}`);
    },
    url: '/billing/receipts',
    type: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(receiptData),
  });

  request.done((resp) => {
    console.log('/billing/receipts response: ', resp);
    alert('Receipt sent');
    window.location.href = '/app/receipts';

    // TODO remove unit from table list. Or change row color
  });

  request.fail((jqXHR, textStatus) => {
    console.log('/billing/receipt error: ', textStatus);
  });
}

function populateEditTenantModal() {
  $('#uAllTenants').on('shown.bs.modal', (e) => {
    const name = $(e.relatedTarget).data('name');
    const email = $(e.relatedTarget).data('email');
    const phone = $(e.relatedTarget).data('msisdn');
    const amount = $(e.relatedTarget).data('amount');

    $('#inputName').val(name);
    $('#inputEmail').val(email);
    $('#inputPhone').val(phone);
    $('#inputAmount').val(amount);

    // These values cannot be changed by opening the modal so they can be initalized when the modal is open.
    tenantDataToEdit.tenantId = $(e.relatedTarget).data('tenant');
    tenantDataToEdit.userId = $(e.relatedTarget).data('user');
  });
}

function submitEditTenantForm() {
  const { tenantId } = tenantDataToEdit;

  if (helpers.validateIsStringEmpty($('#inputName').val())) {
    alert('ERROR! Name is empty. Please fill.');
    return;
  }

  if (helpers.validateIsStringEmpty($('#inputPhone').val())) {
    alert('ERROR! Phone number is empty. Please fill.');
    return;
  }

  tenantDataToEdit.name = $('#inputName').val();
  tenantDataToEdit.email = $('#inputEmail').val();
  tenantDataToEdit.receiptAmount = $('#inputAmount').val() || 0;
  tenantDataToEdit.status = $('#inputStatus').val();
  tenantDataToEdit.msisdn = $('#inputPhone').val();
  tenantDataToEdit.unitId = $('#inputUnit').val();
  const jwt = localStorage.getItem('token');

  $.ajax({
    beforeSend(xhr) {
      xhr.setRequestHeader('Authorization', `Bearer ${jwt}`);
    },
    url: `/tenant/ui/${tenantId}`,
    type: 'PUT',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(tenantDataToEdit),
    success() {
      window.location.href = '/app/receipts';
    },
    error(error) {
      console.log(error.responseText);
      alert('Edit tenant details failed: Contact support');
    },
  });
}

function getFlatTenants(flatId) {
  const jwt = localStorage.getItem('token');
  $.ajax({
    url: `/tenant/?flatId=${flatId}`,
    beforeSend(xhr) {
      xhr.setRequestHeader('Authorization', `Bearer ${jwt}`);
    },
    success(data) {
      $('#tenantsWithoutUnits').empty();
      if (data != '') {
        $.each(data, (k, v) => {
          if (!v.Unit) {
            $('#tenantsWithoutUnits').append(`<option value=${v.id}>${v.User.name} (${v.User.email})</option>`);
          }
        });
      }
    },
    error(error) {
      console.log(error);
    },
  });
}

function submitAssignTenantToUnitForm() {
  const tenantId = $('#tenantsWithoutUnits').val();
  const jwt = localStorage.getItem('token');

  $.ajax({
    beforeSend(xhr) {
      xhr.setRequestHeader('Authorization', `Bearer ${jwt}`);
    },
    url: '/tenant/ui/unit/assign/',
    type: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify({ tenantId, unitId: unitToAddTenant }),
    success() {
      window.location.href = '/app/receipts';
    },
    error(error) {
      console.log(error.responseText);
      alert('Edit tenant details failed: Contact support');
    },
  });
}

function submitCreateNewTenantForUnitForm() {
  const newTenant = {};

  if (helpers.validateIsStringEmpty($('#newTenantName').val())) {
    alert('ERROR! Name is empty. Please fill.');
    return;
  }

  if (helpers.validateIsStringEmpty($('#newTenantPhone').val())) {
    alert('ERROR! Phone number is empty. Please fill.');
    return;
  }

  newTenant.name = $('#newTenantName').val();
  newTenant.email = $('#newTenantEmail').val();
  newTenant.msisdn = $('#newTenantPhone').val();
  newTenant.receiptAmount = $('#newTenantAmount').val() || 0;
  newTenant.unitId = unitToAddTenant;
  newTenant.flatId = currentFlatId;

  const jwt = localStorage.getItem('token');

  $.ajax({
    url: '/tenant/',
    type: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(newTenant),
    beforeSend(xhr) {
      xhr.setRequestHeader('Authorization', `Bearer ${jwt}`);
    },
    success() {
      window.location.href = '/app/receipts';
    },
    error(error) {
      console.log(error.responseText);
      alert('Adding new tenant failed: Contact support');
    },
  });
}

function getUnitIdFromOpenModal() {
  $('#uAddTenant').on('shown.bs.modal', (e) => {
    unitToAddTenant = $(e.relatedTarget).data('unit');
  });
}

function createUnit() {
  const name = $('#newUnitName').val();

  if (!name) {
    alert('Name empty. Please fill');
  } else {
    const status = 'active';
    const jwt = localStorage.getItem('token');

    request = $.ajax({
      beforeSend(xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${jwt}`);
      },
      url: '/admin/unit',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ name, status, flatId: currentFlatId }),
    });

    request.done((resp) => {
      console.log('/admin/unit response: ', resp);
      alert('Unit created');
      window.location.href = '/app/receipts';
    });

    request.fail((jqXHR, textStatus) => {
      console.log('/admin/unit/ error: ', textStatus);
    });
  }
}

function createFlat() {
  const name = $('#newFlatName').val();

  if (!name) {
    alert('Name empty. Please fill');
  } else {
    const jwt = localStorage.getItem('token');
    const paymentDetails = '0001000';

    request = $.ajax({
      beforeSend(xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${jwt}`);
      },
      url: '/admin/flat',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ name, paymentDetails }),
    });

    request.done((resp) => {
      console.log('/admin/flat response: ', resp);
      alert('Flat created');
      window.location.href = '/app/receipts';
    });

    request.fail((jqXHR, textStatus) => {
      console.log('/admin/unit/ error: ', textStatus);
    });
  }
}

function toggleUnitDropDownIfTenantChanged() {
  $('#inputStatus').change(() => {
    const tenantStatus = $('#inputStatus').val();
    if (tenantStatus === 'left') {
      $('#inputUnit').prop('disabled', 'disabled');
    } else if (tenantStatus === 'changed') {
      $('#inputUnit').prop('disabled', false);
    }
  });
}

function setSelectedMonthInDropDown() {
  const d = new Date();
  selectedMonth = `0${(d.getMonth() + 1)}`.slice(-2);
  $(`#months option[value=${selectedMonth}]`).prop('selected', true);
}

function setSelectedYearInDropDown() {
  const d = new Date();
  selectedYear = d.getFullYear();
  $(`#year option[value=${selectedYear}]`).prop('selected', true);
}

function getLastReceiptDate(receipts) {
  if (receipts && receipts[0]) {
    const lastReceipt = receipts[0];
    const date = moment(lastReceipt.createdAt).format('YYYY-MM-DD');
    const amount = lastReceipt.amount;
    return { date, amount };
  }
  return null;
}

function getSelectedMonth() {
  $('#months').on('change', function () {
    selectedMonth = `0${$(this).val()}`.slice(-2);
    const jwt = localStorage.getItem('token');
    const date = `${selectedYear}-${selectedMonth}`;

    request = $.ajax({
      beforeSend(xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${jwt}`);
      },
      url: `/billing/receipts?flatId=${currentFlatId}&month=${date}`,
      dataType: 'json',
    });

    request.done((resp) => {
      buildPastReceiptView(resp);
    });

    request.fail((jqXHR, textStatus) => {
      console.log('/billing/receipts/ error: ', textStatus);
    });
  });
}

function getSelectedYear() {
  $('#year').on('change', function () {
    selectedYear = $(this).val();
    const jwt = localStorage.getItem('token');
    const date = `${selectedYear}-${selectedMonth}`;

    request = $.ajax({
      beforeSend(xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${jwt}`);
      },
      url: `/billing/receipts?flatId=${currentFlatId}&month=${date}`,
      dataType: 'json',
    });

    request.done((resp) => {
      buildPastReceiptView(resp);
    });

    request.fail((jqXHR, textStatus) => {
      console.log('/billing/receipt/ error: ', textStatus);
    });
  });
}

function buildPastReceiptView(receipts) {
  $('.nav-tabs li.nav-item a[href="#main_sent"]').tab('show');
  $('#pastReceiptsTable').empty();

  if (receipts != '') {
    $.each(receipts, (key, receipt) => {
      if (receipt.createdAt) {
        $('#pastReceiptsTable').append(
          `<tr><td>${receipt.Unit.name}</td>`
          + `<td>${receipt.Tenant.User.name}</td>`
          + `<td><p>${receipt.Tenant.User.email}</p><p>${receipt.Tenant.User.msisdn}</p></td>`
          + `<p><b>TOTAL: KES ${receipt.amount}<b></p>`
          + '</td>'
          + `<td>${receipt.createdAt}</td></tr>`,
        );
      } else {
        $('#pastReceiptsTable').append(
          `<tr><td>${receipt.Unit.name}</td>`
          + '<td colspan="4">No Receipt sent</td></tr>',
        );
      }
    });
  }
}

var helpers = {
  buildDropdown(result, dropdown) {
    dropdown.html('');
    if (result != '') {
      $.each(result, (k, v) => {
        dropdown.append(`<a href="#nogo" class="dropdown-item">${v.name}</a>`);
      });
    }
  },

  checkIfReceiptSentThisMonth(date) {
    if (!date) {
      return false;
    }
    const today = moment();
    const receiptDate = moment(date);
    if ((today.month() === receiptDate.month()) && (today.year() === receiptDate.year())) {
      return true;
    }
    return false;
  },
  validateIsStringEmpty(item) {
    if (item === '') {
      return true;
    }
    return false;
  },
};

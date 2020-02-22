var tenantDataToEdit = {};
var unitToAddTenant;
var currentFlatId;
var selectedMonth;
var selectedYear;

$(function () {
  getFlats();
  populateEditTenantModal();
  toggleUnitDropDownIfTenantChanged();
  getUnitIdFromOpenModal();
  setSelectedMonthInDropDown();
  setSelectedYearInDropDown();
  getSelectedMonth();
  getSelectedYear();

})

function getFlats() {
  const jwt = localStorage.getItem('token');
  $.ajax({
    url: '/admin/flat/',
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", 'Bearer ' + jwt);
    },
  }).done(function (data) {
    // TODO Weird workaround to get valid JSON. Move this to the backend.
    const parsedData = jQuery.parseJSON(JSON.stringify(data));
    if (!parsedData[0]) {
      $('#addFlat').css("visibility", "visible");
      return;
    }
    buildUnitTable(parsedData[0].id);

    $('#defaultFlat').html = '';
    $('#defaultFlat').append('<button type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" class="btn btn-light dropdown-toggle">' + parsedData[0].name + '</button>');

    currentFlatId = parsedData[0].id
    getFlatTenants(currentFlatId);

    helpers.buildDropdown(
      parsedData,
      $('#flats')
    );
  }).error( function() {
    window.location.href = '/login';
  });
}

function buildUnitTable(flatId) {
  const jwt = localStorage.getItem('token');
  $.ajax({
    url: '/admin/unit/?flatId=' + flatId,
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", 'Bearer ' + jwt);
    },
  }).done(function (data) {
    $('#unitTable').empty();
    if (data != '') {
      $.each(data, function (k, v) {
        if (v.Tenant) {
          const lastInvoiceDetails = getLastInvoiceDate(v.Tenant.Invoices);
          let invoiceString;
          let rowFormat = 'table-warning';
          if (lastInvoiceDetails) {
            invoiceString = '<p> Date: ' + lastInvoiceDetails.date + '</p><p> Total: ' + lastInvoiceDetails.amount + '</p>'
            if (helpers.checkIfInvoiceSentThisMonth(lastInvoiceDetails.date)) {
              rowFormat = 'table-success';
            }
          } else {
            invoiceString = '-'
          }

          $('#unitTable').append(
            '<tr class="' + rowFormat + ' id="' + v.id + '"><form class="form1"></form><th scope="row">' + v.name + '</th><td data-id="tenantName">' + v.Tenant.User.name + '</td>' +
            '<td><p>' + v.Tenant.User.msisdn + '</p><p>' + v.Tenant.User.email + '</p><p> <a data-toggle="modal" data-name="' + v.Tenant.User.name + '" data-email="' + v.Tenant.User.email + '" ' +
            'data-msisdn="' + v.Tenant.User.msisdn + '" data-rent="' + v.Tenant.rent + '" data-garbage="' + v.Tenant.garbage + '"' +
            'data-water="' + v.Tenant.water + '" data-penalty="' + v.Tenant.penalty + '" data-id="' + v.id +
            '" data-tenant="' + v.Tenant.id + '" data-user="' + v.Tenant.User.id + '"' +
            'data-target="#uAllTenants" href="#nogo">Edit </a></p></td>' +
            '<td> <p>Rent: KES ' + v.Tenant.rent + '</p><p>Garbage: KES ' + v.Tenant.garbage + '</p><p>Water: KES ' + v.Tenant.water + '</p><p>Penalty: KES ' + v.Tenant.penalty + '</p></td>' +
            '<td>' + invoiceString + '</td>' +
            '<td><button class="btn btn-block btn-primary"' +
            ' onclick="sendInvoice(' + v.Tenant.id + ',' + v.Tenant.rent + ',' + v.Tenant.water + ',' + v.Tenant.garbage + ',' + v.Tenant.penalty + ')">Send Invoice</button></td></tr>)'
          );
        } else {
          $('#unitTable').append(
            '<tr id="' + v.id + '"><th scope="row">' + v.name + '</th><td colspan="4">Unoccupied</td><td scope="row"><button class="btn btn-block btn-info", data-toggle="modal", data-target="#uAddTenant" data-unit="' + v.id + '">Add Tenant</button></td></tr>'
          );
          $('#inputUnit').append(
            '<option value=' + v.id + '>' + v.name + '</option>'
          )
        }
      });
    }
  });
}

function sendInvoice(tenantId, rent, water, garbage, penalty) {
  invoiceData = { "tenantId": tenantId, "rent": rent, "water": water, "garbage": garbage, "penalty": penalty };
  const jwt = localStorage.getItem('token');

  request = $.ajax({
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", 'Bearer ' + jwt);
    },
    url: '/billing/invoice',
    type: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(invoiceData),
  });

  request.done(function (resp) {
    console.log('/billing/invoice response: ', resp);
    alert('Invoice sent');
    window.location.href = '/app/invoice';
    // TODO remove unit from table list. Or change row color
  });

  request.fail(function (jqXHR, textStatus) {
    console.log('/billing/invoice error: ', textStatus);
  });
}

function populateEditTenantModal() {
  $('#uAllTenants').on('shown.bs.modal', function (e) {
    var name = $(e.relatedTarget).data('name');
    var email = $(e.relatedTarget).data('email');
    var phone = $(e.relatedTarget).data('msisdn');
    var rent = $(e.relatedTarget).data('rent');
    var garbage = $(e.relatedTarget).data('garbage');
    var water = $(e.relatedTarget).data('water');
    var penalty = $(e.relatedTarget).data('penalty');

    $("#inputName").val(name);
    $("#inputEmail").val(email);
    $("#inputPhone").val(phone);
    $("#inputRent").val(rent);
    $("#inputGarbage").val(garbage);
    $("#inputWater").val(water);
    $("#inputPenalty").val(penalty);

    // These values cannot be changed by opening the modal so they can be initalized when the modal is open.
    tenantDataToEdit["tenantId"] = $(e.relatedTarget).data('tenant');
    tenantDataToEdit["userId"] = $(e.relatedTarget).data('user');
  });
}

function submitEditTenantForm() {
  const tenantId = tenantDataToEdit['tenantId']

  if (helpers.validateIsStringEmpty($("#inputName").val())) {
    alert("ERROR! Name is empty. Please fill.");
    return;
  }

  if (helpers.validateIsStringEmpty($("#inputPhone").val())) {
    alert("ERROR! Phone number is empty. Please fill.");
    return;
  }

  tenantDataToEdit["name"] = $("#inputName").val();
  tenantDataToEdit["email"] = $("#inputEmail").val();
  tenantDataToEdit["rent"] = $("#inputRent").val() || 0;
  tenantDataToEdit["garbage"] = $("#inputGarbage").val() || 0;
  tenantDataToEdit["water"] = $("#inputWater").val() || 0;
  tenantDataToEdit["penalty"] = $("#inputPenalty").val() || 0;
  tenantDataToEdit["status"] = $("#inputStatus").val();
  tenantDataToEdit["msisdn"] = $("#inputPhone").val();
  tenantDataToEdit["unitId"] = $("#inputUnit").val();
  const jwt = localStorage.getItem('token');

  $.ajax({
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", 'Bearer ' + jwt);
    },
    url: `/tenant/ui/${tenantId}`,
    type: 'PUT',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(tenantDataToEdit),
    success: function () {
      window.location.href = '/app/invoice';
    },
    error: function (error) {
      console.log(error.responseText);
      alert("Edit tenant details failed: Contact support");
    }
  });
}

function getFlatTenants(flatId) {
  const jwt = localStorage.getItem('token');
  $.ajax({
    url: '/tenant/?flatId=' + flatId,
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", 'Bearer ' + jwt);
    },
    success: function (data) {
      $('#tenantsWithoutUnits').empty();
      if (data != '') {
        $.each(data, function (k, v) {
          if (!v.Unit) {
            $('#tenantsWithoutUnits').append('<option value=' + v.id + '>' + v.User.name + ' (' + v.User.email + ')</option>');
          }
        })
      }
    },
    error: function (error) {
      console.log(error);
    }
  });
}

function submitAssignTenantToUnitForm() {
  const tenantId = $("#tenantsWithoutUnits").val();
  const jwt = localStorage.getItem('token');

  $.ajax({
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", 'Bearer ' + jwt);
    },
    url: `/tenant/ui/unit/assign/`,
    type: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify({ tenantId, unitId: unitToAddTenant }),
    success: function () {
      window.location.href = '/app/invoice';
    },
    error: function (error) {
      console.log(error.responseText);
      alert("Edit tenant details failed: Contact support");
    }
  });
}

function submitCreateNewTenantForUnitForm() {
  const newTenant = {};

  if (helpers.validateIsStringEmpty($("#newTenantName").val())) {
    alert("ERROR! Name is empty. Please fill.");
    return;
  }

  if (helpers.validateIsStringEmpty($("#newTenantPhone").val())) {
    alert("ERROR! Phone number is empty. Please fill.");
    return;
  }

  newTenant["name"] = $("#newTenantName").val();
  newTenant["email"] = $("#newTenantEmail").val();
  newTenant["msisdn"] = $("#newTenantPhone").val();
  newTenant["rent"] = $("#newTenantRent").val() || 0;
  newTenant["garbage"] = $("#newTenantGarbage").val() || 0;
  newTenant["water"] = $("#newTenantWater").val() || 0;
  newTenant["penalty"] = $("#newTenantPenalty").val() || 0;
  newTenant["unitId"] = unitToAddTenant;
  newTenant["flatId"] = currentFlatId;

  const jwt = localStorage.getItem('token');

  $.ajax({
    url: `/tenant/`,
    type: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(newTenant),
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", 'Bearer ' + jwt);
    },
    success: function () {
      window.location.href = '/app/invoice';
    },
    error: function (error) {
      console.log(error.responseText);
      alert("Adding new tenant failed: Contact support");
    }
  });
}

function getUnitIdFromOpenModal() {
  $('#uAddTenant').on('shown.bs.modal', function (e) {
    unitToAddTenant = $(e.relatedTarget).data('unit')
  });
}

function createUnit() {
  const name = $("#newUnitName").val();

  if (!name) {
    alert('Name empty. Please fill');
    return
  }
  else {
    const status = "active";
    const jwt = localStorage.getItem('token');

    request = $.ajax({
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", 'Bearer ' + jwt);
      },
      url: '/admin/unit',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ name, status, flatId: currentFlatId }),
    });

    request.done(function (resp) {
      console.log('/admin/unit response: ', resp);
      alert('Unit created');
      window.location.href = '/app/invoice';
    });

    request.fail(function (jqXHR, textStatus) {
      console.log('/admin/unit/ error: ', textStatus);
    });
  }
}

function createFlat() {
  const name = $("#newFlatName").val();

  if (!name) {
    alert('Name empty. Please fill');
    return
  }
  else {
    const jwt = localStorage.getItem('token');
    const paymentDetails = '0001000'

    request = $.ajax({
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", 'Bearer ' + jwt);
      },
      url: '/admin/flat',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ name, paymentDetails }),
    });

    request.done(function (resp) {
      console.log('/admin/flat response: ', resp);
      alert('Flat created');
      window.location.href = '/app/invoice';
    });

    request.fail(function (jqXHR, textStatus) {
      console.log('/admin/unit/ error: ', textStatus);
    });
  }
}

function toggleUnitDropDownIfTenantChanged() {
  $('#inputStatus').change(() => {
    const tenantStatus = $("#inputStatus").val()
    if (tenantStatus === 'left') {
      $("#inputUnit").prop('disabled', 'disabled');
    }
    else if (tenantStatus === 'changed') {
      $("#inputUnit").prop('disabled', false);
    }
  });
}

function setSelectedMonthInDropDown() {
  var d = new Date();
  selectedMonth = `0${(d.getMonth() + 1)}`.slice(-2);
  $("#months option[value=" + selectedMonth + "]").prop('selected', true);
}

function setSelectedYearInDropDown() {
  var d = new Date();
  selectedYear = d.getFullYear();
  $("#year option[value=" + selectedYear + "]").prop('selected', true);
}

function getLastInvoiceDate(invoices) {
  if (invoices && invoices[0]) {
    const lastInvoice = invoices[0];
    const date = moment(lastInvoice.createdAt).format('YYYY-MM-DD');
    const amount = lastInvoice.rent + lastInvoice.water + lastInvoice.garbage + lastInvoice.penalty;
    return { date, amount };
  }
  return null
}

function getSelectedMonth() {
  $("#months").on("change", function () {
    selectedMonth = `0${$(this).val()}`.slice(-2);
    const jwt = localStorage.getItem('token');
    const date = `${selectedYear}-${selectedMonth}`

    request = $.ajax({
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", 'Bearer ' + jwt);
      },
      url: `/billing/invoice?flatId=${currentFlatId}&month=${date}`,
      dataType: 'json',
    });

    request.done(function (resp) {
      buildPastInvoiceView(resp);
    });

    request.fail(function (jqXHR, textStatus) {
      console.log('/billing/invoice/ error: ', textStatus);
    });
  });
}

function getSelectedYear() {
  $("#year").on("change", function () {
    selectedYear = $(this).val();
    const jwt = localStorage.getItem('token');
    const date = `${selectedYear}-${selectedMonth}`

    request = $.ajax({
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", 'Bearer ' + jwt);
      },
      url: `/billing/invoice?flatId=${currentFlatId}&month=${date}`,
      dataType: 'json',
    });

    request.done(function (resp) {
      buildPastInvoiceView(resp);
    });

    request.fail(function (jqXHR, textStatus) {
      console.log('/billing/invoice/ error: ', textStatus);
    });
  });
}

function buildPastInvoiceView(invoices) {
  $('.nav-tabs li.nav-item a[href="#main_sent"]').tab('show');
  $('#pastInvoicesTable').empty();
  
  if (invoices != '') {
    $.each(invoices, function (key, invoice) {
      if (invoice.createdAt) {
        const totalRent = invoice.rent + invoice.garbage + invoice.water + invoice.penalty;
        $('#pastInvoicesTable').append(
          '<tr><td>' + invoice.Unit.name + '</td>' +
          '<td>' + invoice.Tenant.User.name + '</td>' +
          '<td><p>' + invoice.Tenant.User.email + '</p><p>' + invoice.Tenant.User.msisdn + '</p></td>' +
          '<td><p>Rent: KES ' + invoice.rent + '</p>' +
            '<p>Garbage: KES ' + invoice.garbage + '</p>' +
            '<p>Water: KES ' + invoice.water + '</p>' +
            '<p>Penalty: KES ' + invoice.penalty + '</p>' +
            '<p><b>TOTAL: KES ' + totalRent + '<b></p>' +
          '</td>' +
          '<td>' + invoice.createdAt + '</td></tr>'
        );
      }
      else {
        $('#pastInvoicesTable').append(
          '<tr><td>' + invoice.Unit.name + '</td>' +
          '<td colspan="4">No Invoice sent</td></tr>'
        );
      }
    });
  }
}

var helpers = {
  buildDropdown: function (result, dropdown) {
    dropdown.html('');
    if (result != '') {
      $.each(result, function (k, v) {
        dropdown.append('<a href="#nogo" class="dropdown-item">' + v.name + '</a>');
      });
    }
  },

  checkIfInvoiceSentThisMonth: function (date) {
    if (!date) {
      return false;
    }
    const today = moment();
    const invoiceDate = moment(date);
    if ((today.month() === invoiceDate.month()) && (today.year() === invoiceDate.year())) {
      return true;
    }
    return false;
  },
  validateIsStringEmpty: function (item) {
    if (item === '') {
      return true;
    }
    return false
  }
}
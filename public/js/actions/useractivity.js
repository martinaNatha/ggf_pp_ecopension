var tableacti;
var tokenEncrypt = sessionStorage.getItem("tokenusers");
var tokenUser = JSON.parse(tokenEncrypt);
var country = tokenUser.country;

(async function () {
  console.log(country)
  user_action();
  get_login_logs();
})();

async function user_action() {
  const result = await fetch("/get_users_act", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ country }),
  }).then((res) => res.json());
  var result_data = result.data;
  tableacti = $("#tbl_action").DataTable({
    data: result_data,
    columns: [
      { data: "createdDate" },
      { data: "users" },
      { data: "type" },
      { data: "actions" },
      { data: "amount_anumber" },
      { data: "data" },
    ],
    order: [[0, "desc"]],
    columnDefs: [
      {
        target: 5,
        visible: false,
      },
    ],
    layout: {
      topStart: {
        buttons: [
          {
            extend: "excelHtml5",
            text: '<i class="fa-solid fa-file-excel" style="font-size:22px;vertical-align:middle;"></i>',
            // text: '<img src="media/excel_icon.png" alt="Excel" style="width:25px;height:25px;vertical-align:middle;">',
            titleAttr: "Export to Excel",
            className: "custom-excel-button",
            filename: function () {
              var randomNum = Math.floor(Math.random() * 1000000);
              return "ecopensionfile_" + randomNum;
            },
          },
          {
            extend: "print",
            text: '<i class="fa-solid fa-print" style="font-size:22px;vertical-align:middle;"></i>',
            titleAttr: "Print",
            className: "custom-excel-button",
          },
        ],
      },
    },
  });

  // Add click event listener for each row
  $("#tbl_action tbody").on("click", "tr", function () {
    var rowData = tableacti.row(this).data();

    // Populate the modal with row data
    $("#modal-createdDate").text(rowData.createdDate);
    $("#modal-users").text(rowData.users);
    $("#modal-type").text(rowData.type);
    $("#modal-actions").text(rowData.actions);
    $("#modal-amount_anumber").text(rowData.amount_anumber);
    $("#modal-json_data").text(rowData.data); // Beautify JSON data

    // Show modal with fade-in effect
    var modal = $("#infoModal");
    modal.css("display", "flex");
    setTimeout(function () {
      modal.addClass("show");
    }, 10);
  });

  // Close modal when the user clicks on the close button
  $(".close").on("click", function () {
    var modal = $("#infoModal");
    modal.removeClass("show");
    setTimeout(function () {
      modal.css("display", "none");
    }, 500);
  });

  // Close modal when clicking outside of it
  $(window).on("click", function (event) {
    var modal = $("#infoModal");
    if (event.target.id === "infoModal") {
      modal.removeClass("show");
      setTimeout(function () {
        modal.css("display", "none");
      }, 500);
    }
  });
  // $.get("/get_users_act", function (result) {
    
  // }).fail(function (jqXHR, textStatus, errorThrown) {
  //   $("#result").html("Error: " + textStatus);
  //   Swal.fire({
  //     title: "Error",
  //     text: textStatus,
  //     icon: "error",
  //   });
  // });
}

function get_login_logs() {
  $.get("/get_users_login", function (result) {
    var result_data = result.data;
    $("#tbl_user").DataTable({
      data: result_data,
      columns: [
        { data: "users" },
        { data: "createdDate" },
        { data: "createdTime" },
      ],
      order: [[1, "desc"]],
      layout: {
        topStart: {
          buttons: [
            {
              extend: "excelHtml5",
              text: '<i class="fa-solid fa-file-excel" style="font-size:22px;vertical-align:middle;"></i>',
              // text: '<img src="media/excel_icon.png" alt="Excel" style="width:25px;height:25px;vertical-align:middle;">',
              titleAttr: "Export to Excel",
              className: "custom-excel-button",
              filename: function () {
                var randomNum = Math.floor(Math.random() * 1000000);
                return "ecopensionfile_" + randomNum;
              },
            },
            {
              extend: "print",
              text: '<i class="fa-solid fa-print" style="font-size:22px;vertical-align:middle;"></i>',
              titleAttr: "Print",
              className: "custom-excel-button",
            },
          ],
        },
      },
    });
  }).fail(function (jqXHR, textStatus, errorThrown) {
    $("#result").html("Error: " + textStatus);
    Swal.fire({
      title: "Error",
      text: textStatus,
      icon: "error",
    });
  });
}
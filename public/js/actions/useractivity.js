var tableacti;

(async function () {
  user_action();
  get_login_logs();
})();

async function user_action() {
  $.get("/get_users_act", function (result) {
    // $('#result').html('<pre>' + JSON.stringify(data, null, 2) + '</pre>');
    var result_data = result.data;
    tableacti = $('#tbl_action').DataTable({
      data: result_data,
      columns: [
        { data: "createdDate" },
        { data: "users" },
        { data: "type" },
        { data: "actions" },
        { data: "amount_anumber" },
        { data: "json_data" },
      ],
      order: [[0, "desc"]],
      layout: {
        topStart: {
          buttons: [
            "excel",
            "print",
            // {
            //     extend: 'copy',
            //     text: 'Copy to clipboard'
            // },
          ],
        },
      },
      columnDefs: [
        {
          target: 5,
          visible: false,
        },
      ],
      
    });
    // var userDropdown = document.getElementById("select_dropdown");
    // result_data.forEach(function (user) {
    //   var option = document.createElement("option");
    //   option.value = user.id;
    //   option.text = user.firstname;
    //   userDropdown.add(option);
    // });
  }).fail(function (jqXHR, textStatus, errorThrown) {
    $("#result").html("Error: " + textStatus);
    Swal.fire({
      title: "Error",
      text: textStatus,
      icon: "error",
    });
  });
}

function get_login_logs(){
    $.get("/get_users_login", function (result) {
        // $('#result').html('<pre>' + JSON.stringify(data, null, 2) + '</pre>');
        var result_data = result.data;
        $('#tbl_user').DataTable({
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
                "excel",
                "print",
                // {
                //     extend: 'copy',
                //     text: 'Copy to clipboard'
                // },
              ],
            },
          },
        });
        // var userDropdown = document.getElementById("select_dropdown");
        // result_data.forEach(function (user) {
        //   var option = document.createElement("option");
        //   option.value = user.id;
        //   option.text = user.firstname;
        //   userDropdown.add(option);
        // });
      }).fail(function (jqXHR, textStatus, errorThrown) {
        $("#result").html("Error: " + textStatus);
        Swal.fire({
          title: "Error",
          text: textStatus,
          icon: "error",
        });
      });
}

// $('#tbl_user tbody').on('click', 'tr', function () {
//     var data = tableacti.row( this ).data();
//       alert( 'Record ID: ' + data.RecordID );
//   } );
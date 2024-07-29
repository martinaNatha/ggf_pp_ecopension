(async function () {
  get_data();
})();

async function get_data() {
  $.get("/get_users", function (result) {
    // $('#result').html('<pre>' + JSON.stringify(data, null, 2) + '</pre>');
    var result_data = result.data;
    $("#tbl_user").DataTable({
      data: result_data,
      columns: [{ data: "username" }, { data: "firstname" }, { data: "lastname" } , { data: "email" }],
    });
    var userDropdown = document.getElementById("select_dropdown");
    result_data.forEach(function (user) {
        var option = document.createElement("option");
        option.value = user.id;
        option.text = user.firstname;
        userDropdown.add(option);
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

$("#new_sub").on("click", function () {
  var firstname = document.getElementById("firstname").value;
  var lastname = document.getElementById("lastname").value;
  var email = document.getElementById("email").value;

  if (firstname == "" || firstname == null) {
    document.getElementById("fver").style.display = "block";
    document.getElementById("firstname").style.border = "1px solid red";
    document.getElementById("firstname").classList.add("error");
  }

  if (lastname == "" || lastname == null) {
    document.getElementById("lver").style.display = "block";
    document.getElementById("lastname").style.border = "1px solid red";
    document.getElementById("lastname").classList.add("error");
  }

  if (email == "" || email == null) {
    document.getElementById("emver").style.display = "block";
    document.getElementById("email").style.border = "1px solid red";
    document.getElementById("email").classList.add("error");
  } else {
    store_new_user(firstname, lastname, email);
  }
});
$("#firstname").on("change", function () {
  if (this.classList.contains("error")) {
    document.getElementById("fver").style.display = "none";
    document.getElementById("firstname").style.border = "1px solid green";
  }
});
$("#lastname").on("change", function () {
  if (this.classList.contains("error")) {
    document.getElementById("lver").style.display = "none";
    document.getElementById("lastname").style.border = "1px solid green";
  }
});
$("#email").on("change", function () {
  if (this.classList.contains("error")) {
    document.getElementById("emver").style.display = "none";
    document.getElementById("email").style.border = "1px solid green";
  }
});

// store new user
async function store_new_user(firstname, lastname, email) {
  event.preventDefault();

  var data_info = {
    firstname,
    lastname,
    email,
  };
  const result = await fetch("/add_new_user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data_info),
  }).then((res) => res.json());
  if (result.status == "202") {
    Swal.fire({
      title: "Success",
      text: "User has been successfully added",
      icon: "success",
      timer: 4000,
      showCancelButton: false,
      showConfirmButton: false,
    });
    setTimeout(function () {
      location.reload();
    }, 4000);
  } else if (result.status == "409") {
    Swal.fire({
      title: "Error",
      text: result.message,
      icon: "error",
    });
  }else if (result.status == "505") {
    Swal.fire({
      title: "Error",
      text: result.msg,
      icon: "error",
    });
  }
}

$("#delete_user").on("click", async function () {
  var user_id = document.getElementById("select_dropdown").value;
  var user_name = $("#select_dropdown option:selected").text();
  Swal.fire({
    title: `Are you sure you want to delete user "` + user_name + `" ?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete user!",
    cancelButtonText: "No, cancel!",
  }).then((result) => {
    if (result.isConfirmed) {
      // Post data to the server
      fetch("/delete_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user_id }),
      })
        .then((response) => response.json())
        .then((data) => {
          Swal.fire({
            title: "Success",
            text: "User has been successfully deleted",
            icon: "success",
            showConfirmButton: false,
          });
          setTimeout(function () {
            location.reload();
          }, 2000);
        })
        .catch((error) => {
          Swal.fire({
            title: "Error",
            text: "There was an error submitting the user",
            icon: "error",
          });
        });
    }
  });
});

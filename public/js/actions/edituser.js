var user_id;
var firstname, lastname, email;
var tokenEncrypt = sessionStorage.getItem("tokenusers");
var tokenUser = JSON.parse(tokenEncrypt);
var country = tokenUser.country;

(async function () {
  get_data(country);
})();

async function get_data(cou) {
  const result = await fetch("/get_users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cou }),
  }).then((res) => res.json());
  var result_data = result.data;
  $("#tbl_user").DataTable({
    data: result_data,
    columns: [{ data: "username" }, { data: "name" }, { data: "email" }],
  });
  var userDropdown = document.getElementById("select_dropdown");
  result_data.forEach(function (user) {
    var option = document.createElement("option");
    option.value = user.id;
    option.text = user.firstname;
    userDropdown.add(option);
  });
  // $.get("/get_users", function (result) {
  //   var result_data = result.data;
  //   $("#tbl_user").DataTable({
  //     data: result_data,
  //     columns: [{ data: "username" }, { data: "name" }, { data: "email" }],
  //   });
  //   var userDropdown = document.getElementById("select_dropdown");
  //   result_data.forEach(function (user) {
  //     var option = document.createElement("option");
  //     option.value = user.id;
  //     option.text = user.firstname;
  //     userDropdown.add(option);
  //   });
  // }).fail(function (jqXHR, textStatus, errorThrown) {
  // });
}

var userDropdown = document.getElementById("select_dropdown");
userDropdown.addEventListener("change", function () {
  user_id = document.getElementById("select_dropdown").value;
  fetch("/get_single_users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId: user_id }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      var result_ = data.data[0];
      var fadeInElement = document.getElementById("info_row");
      fadeInElement.style.display = "flex";
      fadeInElement.style.opacity = 1;
      var resetb = document.getElementById("reset_button");
      resetb.style.opacity = 1;
      firstname = result_.firstname;
      lastname = result_.lastname;
      email = result_.email;
      document.getElementById("firstn").innerText = firstname;
      document.getElementById("lastn").innerText = lastname;
      document.getElementById("emailn").innerText = email;
    });
});

$("#change_user").on("click", function () {
  var firstname2 = document.getElementById("firstname").value;
  var lastname2 = document.getElementById("lastname").value;
  var email2 = document.getElementById("email").value;
  var datalist = {
    firstname: firstname2,
    lastname: lastname2,
    email: email2,
    user_id: user_id,
  };


  fetch("/change_user_data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datalist),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.status == "202") {
        Swal.fire({
          title: "Success",
          text: "Changes has been done succesfully!",
          icon: "success",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: data.message,
          icon: "error",
        });
      }
    });
});

$("#reset_button").on("click", function(){
  fetch("/reset_user_account", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId: user_id, firstname:firstname }),
  })
    .then((response) => response.json())
    .then((data) => {
      if(data.status == "202"){
        Swal.fire({ 
          title: "Success",
          html: "Account reset succesfully<br> New credentials has been send via email",
          icon: "success",
        });
      }else{
        Swal.fire({
          title: "Error",
          text: data.message,
          icon: "error"
        });
      }
    });
});
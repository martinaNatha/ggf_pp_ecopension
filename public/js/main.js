var single = $(".single_main");
var multi = $(".multi_main");
var dataList;
var jsonData;


var user_name;
function getUserInfo() {
  var tokenEncrypt = sessionStorage.getItem("tokenusers");
  var tokenUser = JSON.parse(tokenEncrypt);
  user_name = tokenUser.firstname + " " + tokenUser.lastname;
  document.getElementById("userName").innerText = user_name;
  document.getElementById("usName").innerText = "@" + tokenUser.username;
}
getUserInfo();

$("#logout").on("click", async function () {
  console.log("logout");
  sessionStorage.clear();
  history.pushState(null, null, "/");
  window.location.href = "/";
});

//reset account page
$(".retab a").click(function (e) {
  e.preventDefault();
  $(".retab a").removeClass("active_tb");
  $(this).addClass("active_tb");
  if ($(this).text() == "WG") {
    single.removeClass("active_display");
    multi.addClass("active_display");
  } else {
    multi.removeClass("active_display");
    single.addClass("active_display");
  }
});

$(".ul-content_admin ul li").click(function (e) {
  e.preventDefault();
  $(".ul-content_admin ul li").removeClass("active");
  // $(this).addClass('active');
  console.log($(this).text())
  if ($(this).text() == "Add New User") {
    window.location.replace("/add_new");
  } else if ($(this).text() == "User Activity") {
    window.location.replace("/useractivity");
  } else if ($(this).text() == "Edit User") {
    window.location.replace("/edituser");
  }else {
    window.location.replace("/admin_home");
  }
});

$(".ul-content ul li").click(function (e) {
  e.preventDefault();
  $(".ul-content ul li").removeClass("active");
  // $(this).addClass('active');
  console.log($(this).text())
  if ($(this).text() == "Reset Accounts") {
    window.location.replace("/resetaccount");
  } else if ($(this).text() == "Delete Accounts") {
    window.location.replace("/deleteaccount");
  } else if ($(this).text() == "Onboarding") {
    window.location.replace("/onboardacc");
  }else if ($(this).text() == "Wn status") {
    window.location.replace("/check_Status");
  } 
  else {
    window.location.replace("/home");
  }
});

let profile = document.querySelector(".profile");
let menu = document.querySelector(".menu");

profile.onclick = function () {
  menu.classList.toggle("active");
};

$("#tbl_home").dataTable({
  lengthChange: false,
});

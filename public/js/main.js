var single = $(".single_main");
var multi = $(".multi_main");
var dataList;
var jsonData;


var user_name;
var email;
function getUserInfo() {
  var tokenEncrypt = sessionStorage.getItem("tokenusers");
  var tokenUser = JSON.parse(tokenEncrypt);
  user_name = tokenUser.firstname + " " + tokenUser.lastname;
  email = tokenUser.email;
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

const activePage = localStorage.getItem('activePage');
console.log(activePage)
if (activePage) {
  $(".ul-content ul li").each(function () {
    if ($(this).text() === activePage) {
      $(this).addClass('active');
    }
  });
}

$(".ul-content_admin ul li").click(function (e) {
  e.preventDefault();
  $(".ul-content ul li").removeClass("active");
  $(this).addClass('active');
  console.log($(this).text());

  // Save the active page to local storage
  localStorage.setItem('activePage', $(this).text());

  if ($(this).text() == "Add New User") {
    window.location.replace("/add_new");
  } else if ($(this).text() == "User Activity") {
    window.location.replace("/useractivity");
  } else if ($(this).text() == "Edit User") {
    window.location.replace("/edituser");
  } else {
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
  } else if ($(this).text() == "Wn status") {
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


async function fetchData() {
  try {
      const response = await fetch('/api/data');
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const tableBody = document.querySelector('#data-table tbody');

      data.forEach(row => {
          const tr = document.createElement('tr');
          Object.values(row).forEach(value => {
              const td = document.createElement('td');
              td.textContent = value;
              tr.appendChild(td);
          });
          tableBody.appendChild(tr);
      });
  } catch (error) {
      console.error('Error fetching data:', error);
  }
}

// fetchData();
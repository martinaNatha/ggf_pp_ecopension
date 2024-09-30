var single = $(".single_main");
var multi = $(".multi_main");
var dataList;
var jsonData;

var user_name;
var email;
var tokenUser;

// document.addEventListener('DOMContentLoaded', function() {
//   // Disable right-click context menu
//   document.addEventListener('contextmenu', function(e) {
//       e.preventDefault();
//   });

//   // Disable F12 key and other shortcuts
//   document.addEventListener('keydown', function(e) {
//       // Disable F12 key
//       if (e.key === 'F12') {
//           e.preventDefault();
//       }

//       // Disable Ctrl+Shift+I (or Cmd+Shift+I on Mac)
//       if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
//           e.preventDefault();
//       }

//       // Disable Ctrl+U (view source)
//       if ((e.ctrlKey || e.metaKey) && e.key === 'U') {
//           e.preventDefault();
//       }
//   });
// });

(async function () {
  getUserInfo();
  // console.log(tokenUser.auth_level);
  if(tokenUser.auth_level == '2'){
    document.querySelector('.homet').style.display = 'flex';
    document.querySelector('.ul-content ul li:nth-child(2)').style.display = 'flex';
    document.querySelector('.ul-content ul li:nth-child(3)').style.display = 'flex';
    document.querySelector('.ul-content ul li:nth-child(4)').style.display = 'flex';
    document.querySelector('.ul-content ul li:nth-child(5)').style.display = 'flex';
    document.querySelector('.onboardt').style.display = 'flex';
    document.querySelector('.ul-content ul li:nth-child(7)').style.display = 'flex';
    document.querySelector('.koopt').style.display = 'flex';
    document.querySelector('.ul-content ul li:nth-child(9)').style.display = 'flex';
  }else if(tokenUser.auth_level == '3'){
    document.querySelector('.homet').style.display = 'flex';
    document.querySelector('.ul-content ul li:nth-child(2)').style.display = 'flex';
    document.querySelector('.ul-content ul li:nth-child(3)').style.display = 'flex';
    document.querySelector('.ul-content ul li:nth-child(4)').style.display = 'flex';
    document.querySelector('.ul-content ul li:nth-child(5)').style.display = 'flex';
    document.querySelector('.onboardt').style.display = 'flex';
    document.querySelector('.ul-content ul li:nth-child(7)').style.display = 'flex';
  }else if(tokenUser.auth_level == '4'){
    document.querySelector('.koopt').style.display = 'flex';
    document.querySelector('.ul-content ul li:nth-child(9)').style.display = 'flex';
  }
})();

function getUserInfo() {
  var tokenEncrypt = sessionStorage.getItem("tokenusers");
  tokenUser = JSON.parse(tokenEncrypt);
  user_name = tokenUser.firstname + " " + tokenUser.lastname;
  email = tokenUser.email;
  document.getElementById("userName").innerText = user_name;
  document.getElementById("usName").innerText = "@" + tokenUser.username;
}

$("#logout").on("click", async function () {
  console.log("logout");
  sessionStorage.clear();
  history.pushState(null, null, "/");
  window.location.href = "/";
});

$("#help").on('click', function(){
  if(tokenUser.auth_level == "2" || tokenUser.auth_level == "3" || tokenUser.auth_level == "4"){
    window.location.href = "/helpuser";
  }else{
    window.location.href = "/helpadmin";
  }
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

const activePage = window.location.pathname;
// const activePage = localStorage.getItem("activePage");
// console.log("Stored active page:", activePage);

if (activePage) {
  $(".ul-content ul li").each(function () {
    // Trim whitespace and compare in a case-insensitive way
    // console.log(activePage.replace(/\//g, ''))
    const side_link = $(this).text().trim().toLowerCase().replace(/\s+/g, '');
    const page = activePage.replace(/\//g, '');

    // console.log(side_link)
    // console.log("----------------")
    // console.log(page)
    if (side_link === page) {
      $(this).addClass("active");
    }
  });
}

$(".ul-content_admin ul li").click(function (e) {
  e.preventDefault();
  $(".ul-content ul li").removeClass("active");
  $(this).addClass("active");
  // Save the active page to local storage
  localStorage.setItem("activePage", $(this).text());

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
  if ($(this).text() == "Reset Accounts") {
    window.location.replace("/resetaccounts");
  } else if ($(this).text() == "Delete Accounts") {
    window.location.replace("/deleteaccounts");
  } else if ($(this).text() == "Onboarding") {
    window.location.replace("/onboarding");
  } else if ($(this).text() == "Wn status") {
    window.location.replace("/check_Status");
  } else if ($(this).text() == "Upload list") {
    window.location.replace("/uploadlist");
  }else if ($(this).text() == "Get Account Info") {
    window.location.replace("/getaccountinfo");
  }else {
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
    const response = await fetch("/api/data");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    const tableBody = document.querySelector("#data-table tbody");

    data.forEach((row) => {
      const tr = document.createElement("tr");
      Object.values(row).forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// fetchData();

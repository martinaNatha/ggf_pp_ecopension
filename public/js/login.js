$("#log_buton").on("click", async function () {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const result = await fetch("/login_cred", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  }).then((res) => res.json());
  console.log(result.data);
  if (result.status == "202" && result.data[0].username.startsWith("eco")) {
    if(result.data[0].auth_level == '4'){
      preload("/uploadlist", result.data);
    }else{
      preload("/home", result.data);
    }
    // preload("/home", result.data)
  } else if (result.status == "202" && (result.data[0].username == "admineco" || result.data[0].username == "adminecoaua" || result.data[0].username == "adminecocur")) {
    preload("/admin_home", result.data)
  } else if (result.status == "202" && result.data[0].username == "test") {
    preload("/home", result.data)
  } else {
    Swal.fire({
      title: "Error",
      text: result.msg,
      icon: "error",
    });
  }
});

function preload(url, result) {
    var preload = document.getElementById("preload");
    var bodycontent = document.getElementById("login_back");
    bodycontent.style.opacity = 0;
    setTimeout(function () {
      bodycontent.style.display = "none";
    }, 1000);
    preload.style.display = "flex";
    preload.style.opacity = 1;
    setTimeout(function () {
      sessionStorage.setItem("tokenusers", JSON.stringify(result[0]));
      window.location = url;
    }, 5000);
}

let passwordInput = document.getElementById("password"),
  toggle = document.getElementById("btnToggle"),
  icon = document.getElementById("eyeIcon");

$(".toggle").click(function () {
  $(this).toggleClass("fa-eye fa-eye-slash");
  var input = passwordInput.type;
  if (input == "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
});

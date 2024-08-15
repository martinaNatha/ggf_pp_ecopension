const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const exphbs = require("express-handlebars");
const http = require("http");
const https = require("https");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");
const querystring = require("querystring");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { connectsql, getPool, sql } = require("./database");
const { DateTime } = require("mssql");
const { exec } = require('child_process');
const axios = require('axios');

require("dotenv").config();

const app = express();
const server = http.createServer(app);
app.set("views", path.join(__dirname, "views"));

const hbs = exphbs.create({
  defaultLayout: "main",
  layoutsDir: path.join(app.get("views"), "layouts"),
  partialsDir: path.join(app.get("views"), "partials"),
  extname: ".hbs",
  helpers: {
    ifeq: function (a, b, options) {
      if (a == b) {
        return options.fn(this);
      }
      return options.inverse(this);
    },
    ifnoteq: function (a, b, options) {
      if (a != b) {
        return options.fn(this);
      }
      return options.inverse(this);
    },
    firstL: function (options) {
      return options.charAt(0);
    },
  },
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");

// Middleware
app.use(morgan("tiny")); //Morgan
app.use(cors()); // cors
app.use(express.json()); // JSON
app.use(express.urlencoded({ extended: false })); //urlencoded
app.use(bodyParser.json());

connectsql().catch((err) => {
  console.error("Failed to connect to database:", err.message);
  process.exit(1);
});

app.post("/login_cred", async (req, res) => {
  const { username, password } = req.body;
  try {
    const pool = getPool();
    const result = await pool
      .request()
      .query(
        `SELECT * FROM web_users WHERE username = '${username}' AND password = '${password}'`
      );

    if (result.recordset.length > 0) {
      const result_ = await pool
        .request()
        .query(
          `insert into login_logs(users) values('${result.recordset[0].firstname}')`
        );
      res.json({ status: "202", data: result.recordset });
    } else {
      res.json({ status: "404", msg: "Username or password is not correct!" });
    }
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/send_delete_info", async (req, res) => {
  const { data, email, user_name, amount, type } = req.body;
  var date_ = get_date();

  var uniek_id = Math.floor(1000 + Math.random() * 9000);

  var action = "Delete";
  const requestAccessToken = () => {
    return new Promise((resolve, reject) => {
      var request = new XMLHttpRequest();
      request.open(
        "POST",
        "https://cloud.uipath.com/identity_/connect/token",
        true
      );
      request.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded"
      );
      request.setRequestHeader("X-UIPATH-TenantName", "Fatum");
      var post_data = querystring.stringify({
        grant_type: "client_credentials",
        client_id: "da1cdf02-14b1-465d-9144-8f70393d9ac3",
        client_secret: "W!dts!Wj)Ud~86Ws",
      });
      request.onload = () => {
        if (request.status === 200) {
          const obj = JSON.parse(request.responseText);
          resolve(obj.access_token);
        } else {
          reject(
            new Error(
              "Failed to get access token, status code: " + request.status
            )
          );
        }
      };
      request.onerror = () => {
        reject(new Error("Network error or request failed to complete"));
      };
      request.ontimeout = () => {
        reject(new Error("Request timed out"));
      };
      request.send(post_data);
    });
  };

  const requestQueueItems = (accessToken) => {
    const promises = data.map((anumber) => {
      return new Promise((resolve, reject) => {
        if (type === "wn") {
          if (anumber.startsWith("A") || anumber.startsWith("a")) {
            var obj2 = {
              itemData: {
                Reference: uniek_id + " // wn // " + anumber,
                Priority: "Normal",
                Name: "pp_internal_portal_requests",
                DeferDate: null,
                DueDate: null,
                SpecificContent: {
                  task: "delete",
                  anummer: anumber,
                  type: type,
                  id: uniek_id
                },
              },
            };
          } else {
            var obj2 = {
              itemData: {
                Reference: "finish // Delete // " + date_,
                Priority: "Normal",
                Name: "pp_internal_portal_requests",
                DeferDate: null,
                DueDate: null,
                SpecificContent: {
                  task: "delete",
                  anummer: anumber,
                  type: "finish",
                  start: date_,
                  user: user_name,
                  istype: type,
                  id: uniek_id,
                  top: amount,
                  emails: email
                },
              },
            };
          }
        } else {
          if (anumber != "finish") {
            var obj2 = {
              itemData: {
                Reference: uniek_id + " // wg // " + anumber,
                Priority: "Normal",
                Name: "pp_internal_portal_requests",
                DeferDate: null,
                DueDate: null,
                SpecificContent: {
                  task: "delete",
                  nameid: anumber,
                  type: type,
                  id: uniek_id
                },
              },
            };
          } else {
            var obj2 = {
              itemData: {
                Reference: "finish // Delete // " + date_,
                Priority: "Normal",
                Name: "pp_internal_portal_requests",
                DeferDate: null,
                DueDate: null,
                SpecificContent: {
                  task: "delete",
                  nameid: anumber,
                  type: "finish",
                  start: date_,
                  user: user_name,
                  istype: type,
                  id: uniek_id,
                  top: amount,
                  emails: email
                },
              },
            };
          }
        }
        var request2 = new XMLHttpRequest();
        request2.open(
          "POST",
          "https://cloud.uipath.com/guardkakhock/fatum/orchestrator_/odata/Queues/UiPathODataSvc.AddQueueItem",
          true
        );
        request2.setRequestHeader("Content-Type", "application/json");
        request2.setRequestHeader("X-UIPATH-OrganizationUnitId", "197485");
        request2.setRequestHeader("Authorization", "Bearer " + accessToken);
        request2.onload = () => {
          if (request2.status >= 200 && request2.status < 300) {
            resolve();
          } else {
            reject(
              new Error(
                `Failed to add queue item, status code: ${request2.status}, response: ${request2.responseText}`
              )
            );
          }
        };
        request2.onerror = () => {
          reject(new Error("Network error or request failed to complete"));
        };
        request2.ontimeout = () => {
          reject(new Error("Request timed out"));
        };
        request2.send(JSON.stringify(obj2));
      });
    });

    return Promise.all(promises);
  };

  requestAccessToken()
    .then((accessToken) => requestQueueItems(accessToken))
    .then(() => {
      res.json({ status: "202" });
      store_data(data, user_name, type, amount, action);
    })
    .catch((error) => {
      console.error("Error:", error.message);
      res.json({ status: "500", error: error.message });
      // res.status(500).json({ error: error.message });
      store_data(error.message, user_name, type, amount, action);
    });
});

app.post("/send_reseted_info", (req, res) => {
  const { data, email, user_name, amount, type } = req.body;
  var date_ = get_date();

  var uniek_id = Math.floor(1000 + Math.random() * 9000);

  var action = "Reset";
  const requestAccessToken = () => {
    return new Promise((resolve, reject) => {
      var request = new XMLHttpRequest();
      request.open(
        "POST",
        "https://cloud.uipath.com/identity_/connect/token",
        true
      );
      request.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded"
      );
      request.setRequestHeader("X-UIPATH-TenantName", "Fatum");
      var post_data = querystring.stringify({
        grant_type: "client_credentials",
        client_id: "da1cdf02-14b1-465d-9144-8f70393d9ac3",
        client_secret: "W!dts!Wj)Ud~86Ws",
      });
      request.onload = () => {
        if (request.status === 200) {
          const obj = JSON.parse(request.responseText);
          resolve(obj.access_token);
        } else {
          reject(
            new Error(
              "Failed to get access token, status code: " + request.status
            )
          );
        }
      };
      request.onerror = () => {
        reject(new Error("Network error or request failed to complete"));
      };
      request.ontimeout = () => {
        reject(new Error("Request timed out"));
      };
      request.send(post_data);
    });
  };

  const requestQueueItems = (accessToken) => {
    const promises = data.map((anumber) => {
      return new Promise((resolve, reject) => {
        if (type === "wn") {
          if (anumber.startsWith("A") || anumber.startsWith("a")) {
            var obj2 = {
              itemData: {
                Reference: uniek_id + " // wn // " + anumber,
                Priority: "Normal",
                Name: "pp_internal_portal_requests",
                DeferDate: null,
                DueDate: null,
                SpecificContent: {
                  task: "reset",
                  anummer: anumber,
                  type: type,
                  id: uniek_id
                },
              },
            };
          } else {
            var obj2 = {
              itemData: {
                Reference: "finish // Reset // " + date_,
                Priority: "Normal",
                Name: "pp_internal_portal_requests",
                DeferDate: null,
                DueDate: null,
                SpecificContent: {
                  task: "reset",
                  anummer: anumber,
                  type: "finish",
                  start: date_,
                  user: user_name,
                  istype: type,
                  id: uniek_id,
                  top: amount,
                  emails: email
                },
              },
            };
          }
        } else {
          if (anumber != "finish") {
            var obj2 = {
              itemData: {
                Reference: uniek_id + " // wg // " + anumber,
                Priority: "Normal",
                Name: "pp_internal_portal_requests",
                DeferDate: null,
                DueDate: null,
                SpecificContent: {
                  task: "reset",
                  nameid: anumber,
                  type: type,
                  id: uniek_id
                },
              },
            };
          } else {
            var obj2 = {
              itemData: {
                Reference: "finish // Reset // " + date_,
                Priority: "Normal",
                Name: "pp_internal_portal_requests",
                DeferDate: null,
                DueDate: null,
                SpecificContent: {
                  task: "reset",
                  nameid: anumber,
                  type: "finish",
                  start: date_,
                  user: user_name,
                  istype: type,
                  id: uniek_id,
                  top: amount,
                  emails: email
                },
              },
            };
          }
        }
        var request2 = new XMLHttpRequest();
        request2.open(
          "POST",
          "https://cloud.uipath.com/guardkakhock/fatum/orchestrator_/odata/Queues/UiPathODataSvc.AddQueueItem",
          true
        );
        request2.setRequestHeader("Content-Type", "application/json");
        request2.setRequestHeader("X-UIPATH-OrganizationUnitId", "197485");
        request2.setRequestHeader("Authorization", "Bearer " + accessToken);
        request2.onload = () => {
          if (request2.status >= 200 && request2.status < 300) {
            resolve();
          } else {
            reject(
              new Error(
                `Failed to add queue item, status code: ${request2.status}, response: ${request2.responseText}`
              )
            );
          }
        };
        request2.onerror = () => {
          reject(new Error("Network error or request failed to complete"));
        };
        request2.ontimeout = () => {
          reject(new Error("Request timed out"));
        };
        request2.send(JSON.stringify(obj2));
      });
    });

    return Promise.all(promises);
  };

  requestAccessToken()
    .then((accessToken) => requestQueueItems(accessToken))
    .then(() => {
      res.json({ status: "202" });
      store_data(data, user_name, type, amount, action);
    })
    .catch((error) => {
      console.error("Error:", error.message);
      res.json({ status: "500", error: error.message });
      // res.status(500).json({ error: error.message });
      store_data(error.message, user_name, type, amount, action);
    });
});

app.post("/add_new_user", async (req, res) => {
  const { firstname, lastname, email } = req.body;
  const fullname = firstname + " " + lastname;
  const username =
    "eco" + firstname.substring(0, 4) + Math.floor(Math.random() * 1000);

  const symbols = "!@#$%^&*<>?";
  const index = Math.floor(Math.random() * symbols.length);
  const index2 = Math.floor(Math.random() * symbols.length);
  const password =
    firstname.charAt(0) +
    firstname.charAt(2) +
    symbols.charAt(index2) +
    (Math.floor(Math.random() * 1000) + 10) +
    symbols.charAt(index);
  const secret = Math.floor(Math.random() * 1000000000);

  // send emaill with credentials

  try {
    const pool = getPool();
    const request = pool.request();

    // Add parameters to the request
    request.input("username", sql.VarChar, username);
    request.input("password", sql.VarChar, password); // Adjust type if needed
    request.input("firstname", sql.VarChar, firstname);
    request.input("lastname", sql.VarChar, lastname);
    request.input("email", sql.VarChar, email);
    request.input("secret", sql.VarChar, secret.toString());

    // Check if user already exists
    const checkUserQuery = `
      SELECT * FROM web_users
      WHERE firstname = @firstname AND lastname = @lastname
    `;
    const checkUserResult = await request.query(checkUserQuery);

    if (checkUserResult.recordset.length > 0) {
      // User already exists
      res.json({ status: "409", message: "User already exists" });
    } else {
      // User does not exist, proceed with the insert
      const insertQuery = `
        INSERT INTO web_users(username, password, firstname, lastname, email)
        VALUES (@username, @password, @firstname, @lastname, @email)
      `;
      const result = await request.query(insertQuery);
      res.json({ status: "202" });
    }
  } catch (err) {
    console.error("Error executing query", err);
    res.json({ status: "500", msg: err });
  }
});

app.get("/get_users", async (req, res) => {
  try {
    const pool = getPool();
    const request = pool.request();

    const result = await request.query(
      `Select * from web_users where username != 'admineco'`
    );
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/delete_user", async (req, res) => {
  const { userId } = req.body;

  console.log(userId);

  try {
    const pool = getPool();
    const request = pool.request();

    const result = await request.query(
      `Delete from web_users where id ='` + userId + `'`
    );
    res.json({ status: "202" });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/get_single_users", async (req, res) => {
  const { userId } = req.body;
  console.log(userId);
  try {
    const pool = getPool();
    const request = pool.request();

    const result = await request.query(
      `Select * from web_users where id = '` + userId + `'`
    );
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/change_user_data", async (req, res) => {
  const { firstname, lastname, email, user_id } = req.body;
  var query;
  var fulname;
  console.log(email);

  if (!(firstname == "") && lastname == "" && email == "") {
    query =
      `Update web_users set firstname = '` +
      firstname +
      `' where id = '` +
      user_id +
      `'`;
  } else if (firstname == "" && !(lastname == "") && email == "") {
    query =
      `Update web_users set lastname = '` +
      lastname +
      `' where id = '` +
      user_id +
      `'`;
  } else if (firstname == "" && lastname == "" && !(email == "")) {
    query =
      `Update web_users set email = '` +
      email +
      `' where id = '` +
      user_id +
      `'`;
  } else if (!(firstname == "") && !(lastname == "") && email == "") {
    query =
      `Update web_users set firstname = '` +
      firstname +
      `', lastname = '` +
      lastname +
      `' where id = '` +
      user_id +
      `'`;
  } else if (!(firstname == "") && lastname == "" && !(email == "")) {
    query =
      `Update web_users set firstname = '` +
      firstname +
      `, email = '` +
      email +
      `' where id = '` +
      user_id +
      `'`;
  } else if (firstname == "" && !(lastname == "") && !(email == "")) {
    query =
      `Update web_users set lastname = '` +
      lastname +
      `', email = '` +
      email +
      `' where id = '` +
      user_id +
      `'`;
  } else {
    query =
      `Update web_users set firstname = '` +
      firstname +
      `',lastname = '` +
      lastname +
      `', email='` +
      email +
      `' where id = '` +
      user_id +
      `'`;
  }

  try {
    const pool = getPool();
    const request = pool.request();

    const result = await request.query(query);
    res.json({ status: "202" });
  } catch (err) {
    console.error("Error executing query", err);
    res.json({ status: "505", message: "Internal server error" });
  }
});

app.get("/get_users_act", async (req, res) => {
  try {
    const pool = getPool();
    const request = pool.request();

    const result = await request.query(`Select * from user_action_logs`);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/get_users_login", async (req, res) => {
  try {
    const pool = getPool();
    const request = pool.request();

    const result = await request.query(`Select * from login_logs`);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

function moveFiles(srcFilePath, destDirPath, fileName) {
  const destFilePath = path.join(destDirPath, fileName);

  // Copy the file to the destination
  fs.copyFile(srcFilePath, destFilePath, (err) => {
    if (err) {
      console.error('Error copying file:', err);
      return;
    }
    console.log(`File copied to ${destFilePath}`);
    // Delete the source file after copying
    fs.unlink(srcFilePath, (err) => {
      if (err) {
        console.error('Error deleting the original file:', err);
      } else {
        console.log(`Original file ${srcFilePath} deleted successfully`);
      }
    });
  });
}

// Function to check if the network path requires credentials
function checkNetworkPath(path, callback) {
  fs.access(path, fs.constants.F_OK, (err) => {
    if (err) {
      if (err.code === 'ENOENT' || err.code === 'EACCES') {
        console.log('Network path requires credentials or does not exist.');
        callback(false);
      } else {
        console.error('Error accessing path:', err);
        callback(false);
      }
    } else {
      console.log('Network path accessible.');
      callback(true);
    }
  });
}

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.fields([{ name: 'file1' }, { name: 'file2' }]), (req, res) => {
  const file1 = req.files['file1'] ? req.files['file1'][0] : null;
  const file2 = req.files['file2'] ? req.files['file2'][0] : null;

  // Check if at least one file is provided
  if (!file1 && !file2) {
    return res.status(400).json({ status: "400", msg: "At least one file must be uploaded." });
  }

  const networkPath = 'Y:\\UIPATH_DEV\\dmz_to_futurama';

  checkNetworkPath(networkPath, (accessible) => {
    if (accessible) {
      // Move file1 if it exists
      if (file1) {
        moveFiles(file1.path, networkPath, file1.originalname);
      }
      
      // Move file2 if it exists
      if (file2) {
        moveFiles(file2.path, networkPath, file2.originalname);
      }

      // Construct a success message depending on the files received
      let successMessage = file1 && file2 ? 
        `${file1.originalname} and ${file2.originalname} were copied successfully.` : 
        `${file1 ? file1.originalname : file2.originalname} was copied successfully.`;

      // Store data (for both files or single file)
      store_data(
        file1 && file2 ? `${file1.originalname} and ${file2.originalname}` : `${file1 ? file1.originalname : file2.originalname}`, 
        req.body.username, 
        "", 
        "", 
        "Onboarding"
      );

      res.status(202).json({ status: "202", msg: successMessage });
    } else {
      res.status(404).json({ status: "404", msg: "Network path inaccessible, file(s) were not copied." });
    }
  });
});


async function store_data(info, name_u, type, Aamount, action) {
  try {
    const pool = getPool();
    const request = pool.request();

    // Add parameters to the request
    request.input("name_u", sql.VarChar, name_u);
    request.input("Aamount", sql.VarChar, Aamount.toString()); // Adjust type if needed
    request.input("type", sql.VarChar, type);
    request.input("action", sql.VarChar, action);
    request.input("info", sql.Text, JSON.stringify(info)); // Use appropriate type for large text

    const result = await request.query(
      `INSERT INTO user_action_logs (users, amount_anumber, type, actions, json_data) 
       VALUES (@name_u, @Aamount, @type, @action, @info)`
    );
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

function get_date() {
  const now = new Date();

  // Format as YYYYMMDD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(now.getDate()).padStart(2, "0");

  const formattedDate = `${year}${month}${day}`;

  // Format as YYYYMMDDHHMMSS
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const formattedDateTime = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;

  return formattedDateTime;
}



app.use(require("./routes"));
app.use(express.static(path.join(__dirname, "public")));

app.set("port", process.env.PORT || 5002);

server.listen(app.get("port"), () => {
  console.log("server on port", app.get("port"));
});
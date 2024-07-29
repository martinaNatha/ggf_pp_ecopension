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
const odbc = require("odbc");
const { DateTime } = require("mssql");
const upload = multer({ dest: "uploads/" });

const specificFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(specificFolder)) {
  fs.mkdirSync(specificFolder);
}

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
  const { data, user_name, amount, type } = req.body;
  var date_ = get_date();

  
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
                Reference: "wn // " + anumber + " // Delete",
                Priority: "Normal",
                Name: "pp_internal_portal_requests",
                DeferDate: null,
                DueDate: null,
                SpecificContent: {
                  task: "delete",
                  anummer: anumber,
                  type: type,
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
                  top:amount
                },
              },
            };
          }
        } else {
          if (anummer != "finish") {
            var obj2 = {
              itemData: {
                Reference: "wg // " + anumber + " // Delete",
                Priority: "Normal",
                Name: "pp_internal_portal_requests",
                DeferDate: null,
                DueDate: null,
                SpecificContent: {
                  task: "delete",
                  nameid: anumber,
                  type: type,
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
                  top:amount
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
  const { data, user_name, amount, type } = req.body;

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
          var obj2 = {
            itemData: {
              Reference: "wn // " + anumber + " // Reset",
              Priority: "Normal",
              Name: "pp_internal_portal_requests",
              DeferDate: null,
              DueDate: null,
              SpecificContent: {
                task: "reset",
                anummer: anumber,
                type: type,
              },
            },
          };
        } else {
          var obj2 = {
            itemData: {
              Reference: "wg // " + anumber + " // Reset",
              Priority: "Normal",
              Name: "pp_internal_portal_requests",
              DeferDate: null,
              DueDate: null,
              SpecificContent: {
                task: "reset",
                anummer: anumber,
                type: type,
              },
            },
          };
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

app.post(
  "/upload",
  upload.fields([{ name: "file1" }, { name: "file2" }]),
  (req, res) => {
    const file1 = req.files["file1"][0];
    const file2 = req.files["file2"][0];

    const requiredName1 = "DATA_EMPL_EMAIL";
    const requiredName2 = "DATA_MBR_UPDATE";

    if (
      file1.originalname.includes(requiredName1) &&
      file2.originalname.includes(requiredName2)
    ) {
      const file1Path = path.join(specificFolder, file1.originalname);
      const file2Path = path.join(specificFolder, file2.originalname);

      fs.renameSync(file1.path, file1Path);
      fs.renameSync(file2.path, file2Path);

      res.json({
        status: "202",
        message: "Files uploaded and moved successfully.",
      });
    } else {
      fs.unlinkSync(file1.path);
      fs.unlinkSync(file2.path);
      res.json({
        status: "400",
        message: "Filenames do not contain the required name.",
      });
    }
  }
);

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

// const connectionString = 'DSN=DSN_PR71;UID=UIPATH;PWD=Welcome123#'; // Replace with your DSN, username, and password

// async function connectAndQuery() {
//   let connection;
//   try {
//     // Connect to the ODBC database
//     connection = await odbc.connect(connectionString);

//     // Execute a query
//     const query = 'SELECT TOP(10) FROM PORTAL.PTL_MEMBERS';
//     const result = await connection.query(query);

//     // Process the results
//     console.log('Query results:', result);

//   } catch (error) {
//     console.error('Error connecting or querying:', error);
//   } finally {
//     // Close the connection
//     if (connection) {
//       try {
//         await connection.close();
//         console.log('Connection closed');
//       } catch (error) {
//         console.error('Error closing connection:', error);
//       }
//     }
//   }
// }

// Call the function to connect and query
// connectAndQuery();

app.use(require("./routes"));
app.use(express.static(path.join(__dirname, "public")));

app.set("port", process.env.PORT || 5002);

server.listen(app.get("port"), () => {
  console.log("server on port", app.get("port"));
});

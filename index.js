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
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const axios = require("axios");
const odbc = require("odbc");
const qs = require("qs");

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
      .query(`SELECT * FROM web_users WHERE username = '${username}'`);

    if (result.recordset.length > 0) {
      const hashedPassword = result.recordset[0].password;

      // Compare the input password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, hashedPassword);

      if (isMatch) {
        await pool
          .request()
          .query(
            `INSERT INTO login_logs(users) VALUES('${result.recordset[0].firstname}')`
          );
        res.json({ status: "202", data: result.recordset });
      } else {
        res.json({
          status: "404",
          msg: "Username or password is not correct!",
        });
      }
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
                  id: uniek_id,
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
                  emails: email,
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
                  id: uniek_id,
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
                  emails: email,
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
                  id: uniek_id,
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
                  emails: email,
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
                  id: uniek_id,
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
                  emails: email,
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
  const { firstname, lastname, email, level, country } = req.body;
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

  try {
    const pool = getPool();
    const request = pool.request();

    // Add parameters to the request
    request.input("username", sql.VarChar, username);
    request.input("firstname", sql.VarChar, firstname);
    request.input("lastname", sql.VarChar, lastname);
    request.input("email", sql.VarChar, email);
    request.input("auth_level", sql.VarChar, level);
    request.input("country", sql.VarChar, country);

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
      // Hash the password before storing it
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Add the hashed password to the request
      request.input("password", sql.VarChar, hashedPassword);

      // Insert the new user with the hashed password
      const insertQuery = `
        INSERT INTO web_users(username, password, firstname, lastname, email, auth_level,country)
        VALUES (@username, @password, @firstname, @lastname, @email, @auth_level,@country)
      `;
      await request.query(insertQuery);

      // Optionally send the unhashed password to the user via email or log it securely
      // For example:
      send_email_new_cred(email, firstname, username, password);

      res.json({ status: "202", message: "User created successfully" });
    }
  } catch (err) {
    console.error("Error executing query", err);
    res.json({ status: "500", msg: err });
  }
});

app.post("/get_users", async (req, res) => {
  const { cou } = req.body;
  if (cou == "") {
    try {
      const pool = getPool();
      const request = pool.request();
      const result = await request.query(
        `Select * from web_users where username != 'admineco'`
      );
      res.json({ status: "202", data: result.recordset });
    } catch (err) {
      console.error("Error executing query", err);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    try {
      const pool = getPool();
      const request = pool.request();

      const result = await request.query(
        `Select * from web_users where username != 'admineco' and username != 'adminecoaua' and username != 'adminecocur' and country = '` +
          cou +
          `';`
      );
      res.json({ status: "202", data: result.recordset });
    } catch (err) {
      console.error("Error executing query", err);
      res.status(500).json({ message: "Internal server error" });
    }
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

app.post("/get_users_act", async (req, res) => {
  const { country } = req.body;
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

app.post("/reset_user_account", async (req, res) => {
  const { userId, firstname } = req.body;
  console.log(firstname);

  const symbols = "!@#$%^&*<>?";
  const index = Math.floor(Math.random() * symbols.length);
  const index2 = Math.floor(Math.random() * symbols.length);
  const password =
    firstname.charAt(0) +
    symbols.charAt(index2) +
    firstname.charAt(2) +
    (Math.floor(Math.random() * 1000) + 10) +
    symbols.charAt(index);

  // Hash the password before storing it
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const query1 =
    `UPDATE web_users SET password = '` +
    hashedPassword +
    `' WHERE id = '${userId}'`;
  const query2 = `Select * from web_users WHERE id = '` + userId + `'`;

  try {
    const pool = getPool();
    const request = pool.request();

    const result1 = await request.query(query1);

    const result = await request.query(query2);
    send_reseted_mail(password, result.recordset[0].email);
    res.json({ status: "202" });
    // console.log(password,result.recordset[0].email)
  } catch (err) {
    console.error("Error executing query", err);
    res.json({ status: "505", message: "Internal server error" });
  }
});

app.post("/get_info_from_compass", async (req, res) => {
  const { count } = req.body;
  // console.log(count);
  if (count == "") {
    try {
      const resultmem = await axios.post(process.env.API_PRD, {
        query: `SELECT * FROM PORTAL.PTL_MEMBERS order by JOIN_SCHEME_DT desc`,
      });

      // const resultcomp = await axios.post(process.env.API_PRD, {
      //   query: "SELECT * FROM PORTAL.PTL_ORGANIZATIONS ORG",
      // });
      const resultcomp = await axios.post(process.env.API_PRD, {
        query: "SELECT casd.cont_no,casd.plan_nm, casd.pr_case_no relnr, fls_fatum.get_scheme_planType(casd.cont_no) PlanType, fls_fatum.get_scheme_status(casd.cont_no) scheme_status, fls_fatum.get_scheme_branche(casd.case_key, sysdate) branche from case_data casd,case_statuses csst where 1=1 AND csst.eff_dt <= sysdate AND (csst.xpir_dt IS NULL OR csst.xpir_dt > sysdate) AND casd.case_key = csst.case_key AND   csst.case_stat_cd in ('07', 'Z1') AND   csst.rec_stat_cd = '0'  --[0] = Live record AND   fls_fatum.get_scheme_planType(  casd.cont_no) not in ('DB', 'IND')",});    
      // console.log(resultcomp.data.data.length);
      const total = resultmem.data.data.length + resultcomp.data.data.length;

      res.json({
        wn: resultmem.data.data.length.toLocaleString(),
        wg: resultcomp.data.data.length.toLocaleString(),
        t: total.toLocaleString(),
        datawn: resultmem.data.data,
        datawg: resultcomp.data.data
      });
    } catch (error) {
      console.error("Error connecting to the database:", error);
    }
  } else {
    try {
      var resultmem;
      var resultcomp;
      if (count == "Aruba") {
        resultmem = await axios.post(process.env.API_PRD, {
          query: `SELECT * FROM PORTAL.PTL_MEMBERS where COUNTRY_DESC = 'Aruba' order by JOIN_SCHEME_DT desc`,
        });

        resultcomp = await axios.post(process.env.API_PRD, {
          query:
            "SELECT * FROM PORTAL.PTL_ORGANIZATIONS ORG INNER JOIN PORTAL.PTL_CASE_DATA CD ON ORG.NAMEID= CD.ORG_NAMEID WHERE CD.SCHEME_BRANCHE = 'Aruba';",
        });
      } else {
        resultmem = await axios.post(process.env.API_PRD, {
          query: `SELECT * FROM PORTAL.PTL_MEMBERS where COUNTRY_DESC != 'Aruba' order by JOIN_SCHEME_DT desc`,
        });

        resultcomp = await axios.post(process.env.API_PRD, {
          query:
            "SELECT * FROM PORTAL.PTL_ORGANIZATIONS ORG INNER JOIN PORTAL.PTL_CASE_DATA CD ON ORG.NAMEID= CD.ORG_NAMEID WHERE CD.SCHEME_BRANCHE != 'Aruba';",
        });
      }

      // const total = resultmem.data.data.length + resultcomp.data.data.length;

      res.json({
        status: "202",
        wn: resultmem.data.data.length.toLocaleString(),
        wg: resultcomp.data.data.length.toLocaleString(),
        datawn: resultmem.data.data,
        datawg: resultcomp.data.data
      });
    } catch (error) {
      console.error("Error connecting to the database:", error);
      res.json({ err: error });
    }
  }
});

app.post("/send_to_api", async (req, res) => {
  const { jresult, username , filename,} = req.body;
  const json_data = JSON.parse(jresult);
  var gnummer = json_data.Employer;
  var amanummer = json_data.data.length;
  var datenow;

  //get total amount of all Koopsom
  var totalamount = json_data.data.reduce((total, user) => {
    return total + user["Single Premium"];
  }, 0);

  //get date
  function getFormattedDate() {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, "0"); // Day with leading zero
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Month with leading zero (0-indexed, so +1)
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, "0"); // Hours with leading zero
    const minutes = String(now.getMinutes()).padStart(2, "0"); // Minutes with leading zero
    const seconds = String(now.getSeconds()).padStart(2, "0"); // Seconds with leading zero
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0"); // Milliseconds with leading zeros

    datenow = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}:${milliseconds}`;
  }
  getFormattedDate();

  //check if gnumber and amount of single premium is already added

  //create the json to send to API
  const outputJson = {
    Mutaties: {
      Portal_Request: [
        {
          CASE_KEY: gnummer,
          UPLOAD_DT: datenow,
          TYP_CD: "00",
          PORTAL_CHANGE_CD: "6",
          SAL_RENEW_CD: "N",
          CHNG_DT: datenow,
          SPRM_TOTAL_AMT: totalamount,
          SINGLE_PREMIUMS: json_data.data.map((wn) => ({
            CASE_MBR_KEY: wn["Participant Number"],
            SINGLE_PREMIUM: wn["Single Premium"],
          })),
        },
      ],
      Aantal_Mutaties: "1",
    },
  };
  // const outputJson = {
  //   Mutaties: {
  //     Portal_Request: [
  //       {
  //         CASE_KEY: gnummer,
  //         UPLOAD_DT: datenow,
  //         PYRL_CONTRIB_AMT: "",
  //         PYRL_CONTRIB_EFF_DT: "",
  //         PAYROLL_BEG_DT: "",
  //         PAYROLL_END_DT: "",
  //         TYP_CD: "00",
  //         PORTAL_CHANGE_CD: "6",
  //         SAL_RENEW_CD: "N",
  //         CHNG_DT: datenow,
  //         SPRM_TOTAL_AMT: totalamount,
  //         Member_Request: [],
  //         SINGLE_PREMIUMS: json_data.data.map((wn) => ({
  //           CASE_MBR_KEY: wn["Participant Number"],
  //           SINGLE_PREMIUM: wn["Single Premium"],
  //         })),
  //         Miscellaneous_Request: {
  //           CASE_MBR_KEY: "",
  //           PEND_MBR_REF_ID: "",
  //           NATLIDNO: "",
  //           PYRL_NO: "",
  //           CHNG_TYP_CD: "",
  //           CHNG_AMT: "",
  //           CHNG_DT: "",
  //           CHNG_DATA: "",
  //           CHNG_PCT: "",
  //           CHNG_EXIT_REAS_CD: "",
  //           CHNG_EXIT_DT: "",
  //           SPOUSAL_CNT: "",
  //           DEPENDENT_CNT: "",
  //           BIRTH_DT_DEPENDENT: "",
  //           BIRTH_COUNTRY_CD: "",
  //           ADDR_LINE1: "",
  //           ADDR_LINE2: "",
  //           ADDR_LINE3: "",
  //           ADDR_CITY: "",
  //           ADDR_POST_CD: "",
  //           ADDR_COUNTRY_TXT: "",
  //           ADDR_COUNTRY_CD: "",
  //           ADDR_EMAIL: "",
  //           PHONE: "",
  //           NATIONALITY_CD: "",
  //           MBGP_KEY: "",
  //           MBGC_KEY: "",
  //           files: {
  //             id: "",
  //             id_partner: "",
  //             health_form: "",
  //             birth_certificate: "",
  //           },
  //         },
  //         Payroll_Request: {
  //           MBR_TYP_CD: "",
  //           MBGC_KEY: "",
  //           PYRL_NO: "",
  //           CASE_MBR_KEY: "",
  //           PEND_MBR_REF_ID: "",
  //           NATLIDNO: "",
  //           BIRTHDT: "",
  //           CHNG_DT: "",
  //           JOIN_SCH_DT: "",
  //           JOIN_COMP_DT: "",
  //           FIRSTNAME: "",
  //           LASTNAM: "",
  //           MIDNAME: "",
  //           NAMEPREFIX: "",
  //           NAMESUFFIX: "",
  //           ANN_SAL_AMT: "",
  //           SAL_EFF_DT: "",
  //           PART_TIME_PCT: "",
  //           SEXCD: "",
  //           SPOUSAL_CNT: "",
  //           DEPENDENT_CNT: "",
  //         },
  //       },
  //     ],
  //     Aantal_Mutaties: "1",
  //   },
  // };

  console.log(outputJson);
  getTokenAndSendRequest(outputJson);
  // store_koopsom_action(gnummer, username, filename, totalamount, amanummer);
  // res.json({status:"202"})
  //send json to API
  async function getTokenAndSendRequest(output) {
    try {
      // First POST request to get the token with basic auth
      const auth = {
        username: "h3tMbOEy-iA305q-H7muYg..",
        password: "PggJQEGXFwMvgDEJtMUQ0w..",
      };

      const tokenResponse = await axios.post(
        "http://200.16.93.41:8080/portal/ptl/oauth/token",
        qs.stringify({
          grant_type: "client_credentials",
        }),
        {
          auth, // Basic authentication
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      // Extract the token from the response
      const token = tokenResponse.data.access_token;
      console.log("Token received:", token);

      const response = await axios.post(
        "http://200.16.93.41:8080/portal/ptl/inpension/transaction", // Replace with actual endpoint
        output,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token in Authorization header
            "Content-Type": "application/json",
          },
        }
      );
      res.json({ status: "202", data: response.data });
      store_data(gnummer, username, "", totalamount, "Koopsom");
      store_koopsom_action(gnummer, username, filename, totalamount, amanummer);
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }
  }
});

app.post("/check_if_exists", async (req,res) =>{
  const {jresult, anummers, total_amount, filename} = req.body;

  try {
    const pool = getPool();
    const request = pool.request();

    // Add parameters to the request
    request.input("gnumber", sql.VarChar, jresult);
    request.input("amount_anumbers", sql.VarChar, anummers.toString()); // Adjust type if needed
    request.input("total_amount", sql.VarChar, total_amount.toString());
    request.input("filename", sql.VarChar, filename);

    const result = await request.query(
      `INSERT INTO user_action_logs (users, amount_anumber, type, actions, data) 
       VALUES (@name_u, @Aamount, @type, @action, @info)`
    );
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
      console.error("Error copying file:", err);
      return;
    }
    console.log(`File copied to ${destFilePath}`);
    // Delete the source file after copying
    fs.unlink(srcFilePath, (err) => {
      if (err) {
        console.error("Error deleting the original file:", err);
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
      if (err.code === "ENOENT" || err.code === "EACCES") {
        console.log("Network path requires credentials or does not exist.");
        callback(false);
      } else {
        console.error("Error accessing path:", err);
        callback(false);
      }
    } else {
      console.log("Network path accessible.");
      callback(true);
    }
  });
}

const upload = multer({ dest: "uploads/" });

app.post(
  "/upload",
  upload.fields([{ name: "file1" }, { name: "file2" }]),
  (req, res) => {
    const file1 = req.files["file1"] ? req.files["file1"][0] : null;
    const file2 = req.files["file2"] ? req.files["file2"][0] : null;

    // Check if at least one file is provided
    if (!file1 && !file2) {
      return res
        .status(400)
        .json({ status: "400", msg: "At least one file must be uploaded." });
    }

    const networkPath = "//Cwcurdcfsp01/GGF-DATA/UIPATH_DEV/dmz_to_futurama";
    // const networkPath = 'Y:\\UIPATH_DEV\\dmz_to_futurama';

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
        let successMessage =
          file1 && file2
            ? `${file1.originalname} and ${file2.originalname} were copied successfully.`
            : `${
                file1 ? file1.originalname : file2.originalname
              } was copied successfully.`;

        // Store data (for both files or single file)
        store_data(
          file1 && file2
            ? `${file1.originalname} and ${file2.originalname}`
            : `${file1 ? file1.originalname : file2.originalname}`,
          req.body.username,
          "",
          "",
          "Onboarding"
        );
        send_onboard_mail(req.body.username);
        res.status(202).json({ status: "202", msg: successMessage });
      } else {
        res.status(404).json({
          status: "404",
          msg: "Network path inaccessible, file(s) were not copied.",
        });
      }
    });
  }
);

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
      `INSERT INTO user_action_logs (users, amount_anumber, type, actions, data) 
       VALUES (@name_u, @Aamount, @type, @action, @info)`
    );
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
async function store_koopsom_action(gnummer, uname, filename, tamount, amount_a) {
  // console.log(gnummer, uname, filename, tamount, amount_a)
  try {
    const pool = getPool();
    const request = pool.request();

    // Add parameters to the request
    request.input("gnumber", sql.VarChar, gnummer);
    request.input("amount_anumbers", sql.VarChar, amount_a.toString()); // Adjust type if needed
    request.input("username", sql.VarChar, uname);
    request.input("total_amount", sql.VarChar, tamount.toString());
    request.input("filename", sql.Text, filename); // Use appropriate type for large text

    const result = await request.query(
      `INSERT INTO koopsome_log (username, gnumber, amount_anumbers, total_amount, filename) 
       VALUES (@username, @gnumber, @amount_anumbers, @total_amount, @filename)`
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

function send_email_new_cred(email, name, username, password) {
  let transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
      user: "apikey",
      pass: process.env.EMAIL_P,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Set up email data
  let mailOptions = {
    from: "Ecopension <ggf_internal@myguardiangroup.com>",
    to: email,
    subject: "Your new Ecopension credentials",
    html: `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
        }

        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
        }

        #MessageViewBody a {
            color: inherit;
            text-decoration: none;
        }

        p {
            line-height: inherit
        }

        .desktop_hide,
        .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
        }

        .image_block img+div {
            display: none;
        }

        @media (max-width:655px) {

            .desktop_hide table.icons-inner,
            .social_block.desktop_hide .social-table {
                display: inline-block !important;
            }

            .icons-inner {
                text-align: center;
            }

            .icons-inner td {
                margin: 0 auto;
            }

            .mobile_hide {
                display: none;
            }

            .row-content {
                width: 100% !important;
            }

            .stack .column {
                width: 100%;
                display: block;
            }

            .mobile_hide {
                min-height: 0;
                max-height: 0;
                max-width: 0;
                overflow: hidden;
                font-size: 0px;
            }

            .desktop_hide,
            .desktop_hide table {
                display: table !important;
                max-height: none !important;
            }
        }
    </style>
</head>

<body class="body" style="margin: 0; background-color: #f1f1f1; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
    <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f1f1f1;">
        <tbody>
            <tr>
                <td>
                    <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f1f1f1; color: #000000; width: 635px; margin: 0 auto;" width="635">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <div class="spacer_block block-1" style="height:20px;line-height:20px;font-size:1px;"> </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt;mso-table-rspace: 0pt;background-color: #ffffff;color: #000000;width: 635px;margin: 0 auto;background: #2C0845;height: 48px;" width="635">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 15px; padding-top: 15px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">

                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 635px; margin: 0 650px;" width="635">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" style="/* width: 100%; */mso-table-lspace: 0pt;mso-table-rspace: 0pt;font-weight: 400;text-align: left;/* padding-bottom: 5px; *//* padding-bottom: 5px; *//* padding-left: 28px; *//* padding-top: 10px; */vertical-align: top;border-top: 0px;border-right: 0px;border-bottom: 0px;border-left: 0px;padding: 45px;">
                                                    
                                                    <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tbody>
                                                            <tr>
                                                                <td class="pad" style="padding-bottom:10px;padding-top:10px;">
                                                                    <div style="color:#000000;font-family:Poppins, Arial, Helvetica, sans-serif;font-size:25px;line-height:120%;text-align:left;mso-line-height-alt:36px;">
                                                                        <p style="margin: 0; word-break: break-word;">
                                                                            <span><strong>Hi, ${name}</strong></span>
                                                                        </p>
                                                                        <p style="font-size: 16px;margin-bottom:0;line-height: 25px;">
                                                                            Here we send you the credentials for your Ecopension account</p>
                                                                        <br>
                                                                        <p style="font-size: 16px;margin-top:0;margin-bottom:0;line-height: 0px;">
                                                                            Username: <strong>${username}</strong>        Password: <strong>${password}</strong>
                                                                        </p>
                                                                        <p style="font-size: 16px;margin-top:20px;margin-bottom:0;line-height: 25px;">
                                                                           Web-portal url: http://cwftmwebdev01.ghl.int:8086/
                                                                        </p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>

                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f1f1f1; color: #000000; width: 635px; margin: 0 auto;" width="635">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 15px; padding-top: 15px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <div class="spacer_block block-1" style="height:20px;line-height:20px;font-size:1px;"> </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-5" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt;mso-table-rspace: 0pt;background-color: #F6A146;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt;mso-table-rspace: 0pt;background-color: #F6A146;color: #000000;width: 635px;margin: 0 auto;" width="635">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 20px; padding-top: 10px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    
                                                     <table class="paragraph_block block-6" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt;mso-table-rspace: 0pt;word-break: break-word;padding-top: 45px;padding-bottom: 55px;">
                                                        <tbody>
                                                            <tr>
                                                                <td class="pad" style="padding-left:10px;padding-right:10px;">
                                                                    <div style="color:#ffffff;font-family:Poppins, Arial, Helvetica, sans-serif;font-size:11px;line-height:120%;text-align:center;mso-line-height-alt:13.2px;">
                                                                        <h1 style="margin-bottom: 10px;word-break: break-word;font-size: 35px;height: 29px;">
                                                                            Ecopension
                                                                        </h1>
                                                                        <p style="margin: 0;word-break: break-word;font-size: 20px;height: 29px;font-weight:400;">
                                                                            Your Pension Web-Portal
                                                                        </p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    
                                                    <table class="divider_block block-4" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tbody>
                                                            <tr>
                                                                <td class="pad">
                                                                    <div class="alignment" align="center">
                                                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 1px solid #93CADE;">
                                                                                        <span></span>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    <table class="paragraph_block block-5" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tbody>
                                                            <tr>
                                                                <td class="pad" style="padding-left:10px;padding-right:10px;">
                                                                    <div style="color:#ffffff;font-family:Poppins, Arial, Helvetica, sans-serif;font-size:14px;line-height:120%;text-align:center;mso-line-height-alt:16.8px;">
                                                                        <p style="margin: 0; word-break: break-word;">
                                                                            &nbsp;</p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    <table class="paragraph_block block-6" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tbody>
                                                            <tr>
                                                                <td class="pad" style="padding-left:10px;padding-right:10px;">
                                                                    <div style="color:#ffffff;font-family:Poppins, Arial, Helvetica, sans-serif;font-size:11px;line-height:120%;text-align:center;mso-line-height-alt:13.2px;">
                                                                        <p style="margin: 0; word-break: break-word;">
                                                                            <span>Thank you for using our Ecopension portal. If you have any question
                                                                                please send us an email at</span>
                                                                        </p>
                                                                        <p style="margin: 0; word-break: break-word;text-decoration:none;color:white;">
                                                                            <span>_ftmcuritdevelopers@myguardiangroup.com
                                                                                and we will help you with anything you
                                                                                need.</span>
                                                                        </p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    <table class="paragraph_block block-7" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tbody>
                                                            <tr>
                                                                <td class="pad" style="padding-left:10px;padding-right:10px;">
                                                                    <div style="color:#ffffff;font-family:Poppins, Arial, Helvetica, sans-serif;font-size:14px;line-height:120%;text-align:center;mso-line-height-alt:16.8px;">
                                                                        <p style="margin: 0; word-break: break-word;">
                                                                            &nbsp;</p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table><!-- End -->


    <textarea id="edCb" style="position: absolute; top: 0px; left: 0px; width: 0px; height: 0px; display: none;"></textarea>








</body>

    </html>`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
}

function send_reseted_mail(new_p, mail) {
  let transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
      user: "apikey",
      pass: process.env.EMAIL_P,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  let mailOptions = {
    from: "Ecopension <ggf_internal@myguardiangroup.com>",
    to: mail,
    subject: "Your new Ecopension credentials",
    html: `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
        }

        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
        }

        #MessageViewBody a {
            color: inherit;
            text-decoration: none;
        }

        p {
            line-height: inherit
        }

        .desktop_hide,
        .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
        }

        .image_block img+div {
            display: none;
        }

        @media (max-width:655px) {

            .desktop_hide table.icons-inner,
            .social_block.desktop_hide .social-table {
                display: inline-block !important;
            }

            .icons-inner {
                text-align: center;
            }

            .icons-inner td {
                margin: 0 auto;
            }

            .mobile_hide {
                display: none;
            }

            .row-content {
                width: 100% !important;
            }

            .stack .column {
                width: 100%;
                display: block;
            }

            .mobile_hide {
                min-height: 0;
                max-height: 0;
                max-width: 0;
                overflow: hidden;
                font-size: 0px;
            }

            .desktop_hide,
            .desktop_hide table {
                display: table !important;
                max-height: none !important;
            }
        }
    </style>
</head>

<body class="body" style="margin: 0; background-color: #f1f1f1; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
    <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f1f1f1;">
        <tbody>
            <tr>
                <td>
                    <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f1f1f1; color: #000000; width: 635px; margin: 0 auto;" width="635">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <div class="spacer_block block-1" style="height:20px;line-height:20px;font-size:1px;"> </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt;mso-table-rspace: 0pt;background-color: #ffffff;color: #000000;width: 635px;margin: 0 auto;background: #2C0845;height: 48px;" width="635">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 15px; padding-top: 15px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">

                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 635px; margin: 0 650px;" width="635">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" style="/* width: 100%; */mso-table-lspace: 0pt;mso-table-rspace: 0pt;font-weight: 400;text-align: left;/* padding-bottom: 5px; *//* padding-bottom: 5px; *//* padding-left: 28px; *//* padding-top: 10px; */vertical-align: top;border-top: 0px;border-right: 0px;border-bottom: 0px;border-left: 0px;padding: 45px;">
                                                    
                                                    <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tbody>
                                                            <tr>
                                                                <td class="pad" style="padding-bottom:10px;padding-top:10px;">
                                                                    <div style="color:#000000;font-family:Poppins, Arial, Helvetica, sans-serif;font-size:25px;line-height:120%;text-align:left;mso-line-height-alt:36px;">
                                                                        <p style="margin: 0; word-break: break-word;">
                                                                            <span><strong>Hi,</strong></span>
                                                                        </p>
                                                                        <p style="font-size: 16px;margin-bottom:0;line-height: 25px;">
                                                                           The Admin has reseted your password, here you will find the new password</p>
                                                                        <br>
                                                                        <p style="font-size: 16px;margin-top:0;margin-bottom:0;line-height: 0px;">
                                                                            Password: <strong>${new_p}</strong>
                                                                        </p>
                                                                        <p style="font-size: 16px;margin-top:20px;margin-bottom:0;line-height: 25px;">
                                                                           Web-portal url: 
                                                                        </p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>

                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f1f1f1; color: #000000; width: 635px; margin: 0 auto;" width="635">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 15px; padding-top: 15px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <div class="spacer_block block-1" style="height:20px;line-height:20px;font-size:1px;"> </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-5" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt;mso-table-rspace: 0pt;background-color: #F6A146;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt;mso-table-rspace: 0pt;background-color: #F6A146;color: #000000;width: 635px;margin: 0 auto;" width="635">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 20px; padding-top: 10px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    
                                                     <table class="paragraph_block block-6" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt;mso-table-rspace: 0pt;word-break: break-word;padding-top: 45px;padding-bottom: 55px;">
                                                        <tbody>
                                                            <tr>
                                                                <td class="pad" style="padding-left:10px;padding-right:10px;">
                                                                    <div style="color:#ffffff;font-family:Poppins, Arial, Helvetica, sans-serif;font-size:11px;line-height:120%;text-align:center;mso-line-height-alt:13.2px;">
                                                                        <h1 style="margin-bottom: 10px;word-break: break-word;font-size: 35px;height: 29px;">
                                                                            Ecopension
                                                                        </h1>
                                                                        <p style="margin: 0;word-break: break-word;font-size: 20px;height: 29px;font-weight:400;">
                                                                            Your Pension Web-Portal
                                                                        </p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    
                                                    <table class="divider_block block-4" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tbody>
                                                            <tr>
                                                                <td class="pad">
                                                                    <div class="alignment" align="center">
                                                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 1px solid #93CADE;">
                                                                                        <span></span>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    <table class="paragraph_block block-5" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tbody>
                                                            <tr>
                                                                <td class="pad" style="padding-left:10px;padding-right:10px;">
                                                                    <div style="color:#ffffff;font-family:Poppins, Arial, Helvetica, sans-serif;font-size:14px;line-height:120%;text-align:center;mso-line-height-alt:16.8px;">
                                                                        <p style="margin: 0; word-break: break-word;">
                                                                            &nbsp;</p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    <table class="paragraph_block block-6" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tbody>
                                                            <tr>
                                                                <td class="pad" style="padding-left:10px;padding-right:10px;">
                                                                    <div style="color:#ffffff;font-family:Poppins, Arial, Helvetica, sans-serif;font-size:11px;line-height:120%;text-align:center;mso-line-height-alt:13.2px;">
                                                                        <p style="margin: 0; word-break: break-word;">
                                                                            <span>Thank you for using our Ecopension portal. If you have any question
                                                                                please send us an email at</span>
                                                                        </p>
                                                                        <p style="margin: 0; word-break: break-word;text-decoration:none;color:white;">
                                                                            <span>_ftmcuritdevelopers@myguardiangroup.com
                                                                                and we will help you with anything you
                                                                                need.</span>
                                                                        </p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    <table class="paragraph_block block-7" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tbody>
                                                            <tr>
                                                                <td class="pad" style="padding-left:10px;padding-right:10px;">
                                                                    <div style="color:#ffffff;font-family:Poppins, Arial, Helvetica, sans-serif;font-size:14px;line-height:120%;text-align:center;mso-line-height-alt:16.8px;">
                                                                        <p style="margin: 0; word-break: break-word;">
                                                                            &nbsp;</p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table><!-- End -->


    <textarea id="edCb" style="position: absolute; top: 0px; left: 0px; width: 0px; height: 0px; display: none;"></textarea>








</body>

</html>`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
}

function send_onboard_mail(user) {
  let transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
      user: "apikey",
      pass: process.env.EMAIL_P,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  let mailOptions = {
    from: "Ecopension <ggf_internal@myguardiangroup.com>",
    to: "nathaniel.martina@myguardiangroup.com, sherwayne.celestina@myguardiangroup.com",
    subject: "Onboarding Ecopension",
    html: `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
        }

        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
        }

        #MessageViewBody a {
            color: inherit;
            text-decoration: none;
        }

        p {
            line-height: inherit
        }

        .desktop_hide,
        .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
        }

        .image_block img+div {
            display: none;
        }

        @media (max-width:655px) {

            .desktop_hide table.icons-inner,
            .social_block.desktop_hide .social-table {
                display: inline-block !important;
            }

            .icons-inner {
                text-align: center;
            }

            .icons-inner td {
                margin: 0 auto;
            }

            .mobile_hide {
                display: none;
            }

            .row-content {
                width: 100% !important;
            }

            .stack .column {
                width: 100%;
                display: block;
            }

            .mobile_hide {
                min-height: 0;
                max-height: 0;
                max-width: 0;
                overflow: hidden;
                font-size: 0px;
            }

            .desktop_hide,
            .desktop_hide table {
                display: table !important;
                max-height: none !important;
            }
        }
    </style>
</head>

<body class="body" style="margin: 0; background-color: #f1f1f1; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
    <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f1f1f1;">
        <tbody>
            <tr>
                <td>
                    <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f1f1f1; color: #000000; width: 635px; margin: 0 auto;" width="635">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <div class="spacer_block block-1" style="height:20px;line-height:20px;font-size:1px;"> </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt;mso-table-rspace: 0pt;background-color: #ffffff;color: #000000;width: 635px;margin: 0 auto;background: #2C0845;height: 48px;" width="635">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 15px; padding-top: 15px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">

                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 635px; margin: 0 650px;" width="635">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" style="/* width: 100%; */mso-table-lspace: 0pt;mso-table-rspace: 0pt;font-weight: 400;text-align: left;/* padding-bottom: 5px; *//* padding-bottom: 5px; *//* padding-left: 28px; *//* padding-top: 10px; */vertical-align: top;border-top: 0px;border-right: 0px;border-bottom: 0px;border-left: 0px;padding: 45px;">
                                                    
                                                    <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tbody>
                                                            <tr>
                                                                <td class="pad" style="padding-bottom:10px;padding-top:10px;">
                                                                    <div style="color:#000000;font-family:Poppins, Arial, Helvetica, sans-serif;font-size:25px;line-height:120%;text-align:left;mso-line-height-alt:36px;">
                                                                        <p style="margin: 0; word-break: break-word;">
                                                                            <span><strong>Hi,</strong></span>
                                                                        </p>
                                                                        <p style="font-size: 16px;margin-bottom:0;line-height: 25px;">${user} has onboarded today, please monitor the onboarding process tomorrow.</p>
                                                                        <br>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>

                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f1f1f1; color: #000000; width: 635px; margin: 0 auto;" width="635">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 15px; padding-top: 15px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <div class="spacer_block block-1" style="height:20px;line-height:20px;font-size:1px;"> </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                </td>
            </tr>
        </tbody>
    </table><!-- End -->


    <textarea id="edCb" style="position: absolute; top: 0px; left: 0px; width: 0px; height: 0px; display: none;"></textarea>










</body>

</html>`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
}

app.use(require("./routes"));
app.use(express.static(path.join(__dirname, "public")));

app.set("port", process.env.PORT || 8086);

server.listen(app.get("port"), () => {
  console.log("server on port", app.get("port"));
});

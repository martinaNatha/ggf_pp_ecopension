const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("auth/login",{layout: false});
  });

  router.get("/home", (req, res) => {
    res.render("home");
  });
router.get("/deleteaccounts", (req, res) => {
    res.render("pages/users/deleteaccounts");
  });
router.get("/resetaccounts", (req, res) => {
    res.render("pages/users/resetaccount");
  });
router.get("/onboarding", (req, res) => {
    res.render("pages/users/onboardacc");
  });
router.get("/getaccountinfo", (req, res) => {
    res.render("pages/users/checkstatus");
  });
router.get("/uploadlist", (req, res) => {
    res.render("pages/users/koopsome");
  });
router.get("/helpuser", (req, res) => {
    res.render("pages/users/help");
  });
router.get("/helpadmin", (req, res) => {
    res.render("pages/users/helpadmin");
  });

router.get("/admin_home", (req, res) => {
    res.render("pages/admin/admin_home");
  });
router.get("/add_new", (req, res) => {
    res.render("pages/admin/admin_user_settings");
  });
router.get("/edituser", (req, res) => {
    res.render("pages/admin/edituser");
  });
router.get("/useractivity", (req, res) => {
    res.render("pages/admin/useractivity");
  });

router.get("/email_temp", (req, res) => {
    res.render("pages/email_temp/email_temp_onboard",{layout:false});
  });

module.exports = router;
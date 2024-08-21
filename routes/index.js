const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("auth/login",{layout: false});
  });

  router.get("/home", (req, res) => {
    res.render("home");
  });
router.get("/deleteaccounts", (req, res) => {
    res.render("pages/deleteaccounts");
  });
router.get("/resetaccounts", (req, res) => {
    res.render("pages/resetaccount");
  });
router.get("/onboarding", (req, res) => {
    res.render("pages/onboardacc");
  });
router.get("/check_Status", (req, res) => {
    res.render("pages/check_Status");
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
    res.render("pages/email_temp_1",{layout:false});
  });

module.exports = router;
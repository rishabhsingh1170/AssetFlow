const express = require("express");
const router = express.Router();

const authController = require("../controller/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { auth } = require("../validations");

router.post("/signup", validate(auth.signup), authController.signup);
router.post("/login", validate(auth.login), authController.login);
router.post(
    "/forgot-password",
    validate(auth.forgotPassword),
    authController.forgotPassword
);
router.get("/me", authenticate, authController.me);
router.post("/logout", authenticate, authController.logout);

module.exports = router;

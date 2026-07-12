const express = require("express");
const router = express.Router();

const userController = require("../controller/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const {
    allowSelfOrRoles,
    requireAdmin,
    requireManagerRole,
} = require("../middlewares/role.middleware");

router.use(authenticate);

router.get("/", requireManagerRole, userController.getAllUsers);

router.get(
    "/:id",
    allowSelfOrRoles("id", "asset_manager", "department_head"),
    userController.getUserById
);

router.post("/", requireAdmin, userController.createUser);

router.put("/:id", allowSelfOrRoles("id", "asset_manager"), userController.updateUser);

router.delete("/:id", requireAdmin, userController.deleteUser);

module.exports = router;

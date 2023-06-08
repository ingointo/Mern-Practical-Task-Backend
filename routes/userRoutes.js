const express = require("express");
const router = new express.Router();
const controllers = require("../Controllers/userContoller");
const upload = require("../multerConfig/storageConfig");

//routes
router.post(
  "/user/register",
  upload.single("user_profile"),
  controllers.userPostRegister
);
router.get("/user/details", controllers.userGet);
router.get("/user/:id", controllers.singleUserGet);
router.put(
  "/user/edit/:id",
  upload.single("user_profile"),
  controllers.userEdit
);
router.delete("/user/delete/:id", controllers.userDelete);
router.put("/user/status/:id", controllers.userStatus);
router.get("/userexport", controllers.userExport);

module.exports = router;

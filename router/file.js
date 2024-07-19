const express = require("express");

const controllerContainer = require("../controller/file");

const router = express.Router();

router.post("/api/file", controllerContainer.uploadFile);

router.get("/file/:fileId", controllerContainer.generateSharableLink);

router.get("/files/download/:fileId", controllerContainer.downlodeFile);

router.post("/api/files/send", controllerContainer.sendEmail);

module.exports = router;

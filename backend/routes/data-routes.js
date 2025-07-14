const express = require("express");
const router = express.Router();

const dataController = require("../controllers/data-controller");

// Data
router.get("/", dataController.getCollectionData);


module.exports = router;

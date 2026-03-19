const express = require("express");   // import express
const router = express.Router();      // create router

const { createOrder } = require("../controllers/paymentController");
// import function from your controller

// when frontend calls POST /create-order → run createOrder function
router.post("/create-order", createOrder);

module.exports = router;  // export router
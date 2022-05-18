const express = require("express");
const router = express.Router();
const todoList = require("./todo.routes");
const user = require('./user.routes');

router.use("/todo", todoList);
router.use("/user",user);

module.exports = router;
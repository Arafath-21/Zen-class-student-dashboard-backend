const loginRouter = require("express").Router();
const { login } = require("../Controllers/login.js");

loginRouter.post("/student/login", login);

module.exports = loginRouter;

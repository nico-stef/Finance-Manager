const express = require("express");
var authRouter = require("./auth");
var userRouter = require("./userData")
var moneyManagement = require("./moneyManagement")

module.exports = function(app) {
  app.use(express.json());//converteste datele primite in format JSON in obiecte js

  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/", moneyManagement);
};
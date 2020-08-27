const express = require("express");
const getUsersController = require("../controllers/user-controller");

const useroutes = express.Router();

useroutes.get('/', getUsersController.getUsers);

useroutes.post('/signup', getUsersController.signUp);

useroutes.post('/login', getUsersController.login);

module.exports = useroutes;
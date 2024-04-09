const mockRouter = require("express").Router();
const { fetchMock, postMock } = require("../Controllers/mock.js");

// fetching all mock

mockRouter.get("/student/mock", fetchMock);

//posting new mock

mockRouter.post("/student/mock", postMock);

module.exports = mockRouter;

const queryRouter = require("express").Router();
const {
  fetchQuery,
  postQuery,
  deleteQuery,
} = require("../Controllers/query.js");

// fetching all query

queryRouter.get("/student/query", fetchQuery);

//posting new query

queryRouter.post("/student/query", postQuery);

//deleting query

queryRouter.delete("/student/query/:id", deleteQuery);

module.exports = queryRouter;

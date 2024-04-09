const leaveRouter = require("express").Router();
const {
  fetchLeave,
  postLeave,
  deleteLeave,
} = require("../Controllers/leave.js");

// fetching all leave

leaveRouter.get("/student/leave", fetchLeave);

//posting new leave

leaveRouter.post("/student/leave", postLeave);

//deleting leave

leaveRouter.delete("/student/leave/:id", deleteLeave);

module.exports = leaveRouter;

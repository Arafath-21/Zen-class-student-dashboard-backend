const jwt = require("jsonwebtoken");
const { SECRET } = require("../utils/config");
const Student = require("../Model/studentModel");
const Leave = require("../Model/leaveModel");

//getting token function
const getTokenFrom = (req) => {
  const authorization = req.get("authorization");

  if (authorization && authorization.startsWith("bearer ")) {
    return authorization.replace("bearer ", "");
  }
};

// fetching all leave

const fetchLeave = async (req, res) => {
  try {
    //getting token of authorised student

    const token = getTokenFrom(req);
    if (!token) {
      return res
        .status(401)
        .json({ message: "session timeout please login again" });
    }
    // verifying the token
    const decodedToken = jwt.verify(token, SECRET);

    if (!decodedToken.id) {
      return res.status(401).json({ message: "token invalid" });
    }

    //sending response data

    const leaves = await Student.findById(decodedToken.id).populate("leave");

    res.status(200).json(leaves.leave);
    //
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error on fetching data please login & try again" });
  }
};

//posting new leave

const postLeave = async (req, res) => {
  try {
    //getting body content
    const { reason, appliedOn } = req.body;

    //getting token
    const token = getTokenFrom(req);

    //verify the token
    const decodedToken = jwt.verify(token, SECRET);

    //if token is not valid, return error
    if (!decodedToken.id) {
      return res
        .status(401)
        .json({ message: "session timeout please login again" });
    }

    //getting logged student to store leave
    const student = await Student.findById(decodedToken.id);

    //prepare data to push into leave collection
    const newLeave = new Leave({
      reason,
      appliedOn,
      student: student._id,
    });

    // saving new leave in collection
    const savedLeave = await newLeave.save();

    //loading leave id to student collection
    student.leave = student.leave.concat(savedLeave._id);

    await student.save();

    //sending response
    res.status(200).json({ message: "leave submitted sucessfully" });

    //
  } catch (error) {
    return res.status(400).json({ message: "Please fill all data" });
  }
};

//deleting leave

const deleteLeave = async (req, res) => {
  try {
    //getting body content
    const id = req.params.id;

    //getting token
    const token = getTokenFrom(req);

    //verify the token
    const decodedToken = jwt.verify(token, SECRET);

    //if token is not valid, return error
    if (!decodedToken.id) {
      return res
        .status(401)
        .json({ message: "session timeout please login again" });
    }

    // if leave not found throw error

    const matchedLeave = await Leave.findById(id);
    if (!matchedLeave) {
      return res.status(401).json({ message: "Leave data not found" });
    }

    // deleting leave from collection

    await Leave.findByIdAndDelete(id);

    //removing from student db

    await Student.findByIdAndUpdate(
      decodedToken.id,
      {
        $pull: { leave: id },
      },
      { new: true }
    );

    //sending response
    res.status(200).json({ message: "leave deleted sucessfully" });

    //
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error on updating, please try again later" });
  }
};

module.exports = {
  fetchLeave,
  postLeave,
  deleteLeave,
};

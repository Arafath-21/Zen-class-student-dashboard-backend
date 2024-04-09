const jwt = require("jsonwebtoken");
const { SECRET } = require("../utils/config");
const Student = require("../Model/studentModel");
const Mock = require("../Model/mockModel");

//getting token function
const getTokenFrom = (req) => {
  const authorization = req.get("authorization");

  if (authorization && authorization.startsWith("bearer ")) {
    return authorization.replace("bearer ", "");
  }
};

// fetching all mock

const fetchMock = async (req, res) => {
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

    const mocks = await Student.findById(decodedToken.id).populate("mock");

    res.status(200).json(mocks.mock);
    //
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error on fetching data please login & try again" });
  }
};

//posting new mock

const postMock = async (req, res) => {
  try {
    //getting body content
    const {
      interviewDate,
      interviewerName,
      interviewRound,
      comment,
      logicalScore,
      overallScore,
    } = req.body;

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

    //getting logged student to store mock
    const student = await Student.findById(decodedToken.id);

    //prepare data to push into mock collection
    const newMock = new Mock({
      interviewDate,
      interviewerName,
      interviewRound,
      comment,
      logicalScore,
      overallScore,
      student: student._id,
    });

    // saving new mock in collection
    const savedMock = await newMock.save();

    //loading mock id to student collection
    student.mock = student.mock.concat(savedMock._id);

    await student.save();

    //sending response
    res.status(200).json({ message: "mock submitted sucessfully" });

    //
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error on updating, please try again later" });
  }
};

module.exports = {
  fetchMock,
  postMock,
};

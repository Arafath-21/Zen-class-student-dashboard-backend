const jwt = require("jsonwebtoken");
const { SECRET } = require("../utils/config");
const Student = require("../Model/studentModel");
const Webcode = require("../Model/webcodeModel");

//getting token function
const getTokenFrom = (req) => {
  const authorization = req.get("authorization");

  if (authorization && authorization.startsWith("bearer ")) {
    return authorization.replace("bearer ", "");
  }
};

// fetching all webcode

const fetchWebcode = async (req, res) => {
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

    const webcodes = await Student.findById(decodedToken.id).populate(
      "webcode"
    );

    res.status(200).json(webcodes.webcode);
    //
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error on fetching data please login & try again" });
  }
};

//posting new webcode data

const postWebcode = async (req, res) => {
  try {
    //getting body content
    const { feUrl, feCode } = req.body;

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

    //checking if already submitted
    const webcodes = await Student.findById(decodedToken.id).populate(
      "webcode"
    );

    if (webcodes.webcode.length) {
      return res.status(401).json({ message: "Already Submitted" });
    }

    //getting logged student to store webcode
    const student = await Student.findById(decodedToken.id);

    //prepare data to push into webcode collection
    const newWebcode = new Webcode({
      feUrl,
      feCode,
      student: student._id,
    });

    // saving new webcode in collection
    const savedWebcode = await newWebcode.save();

    //loading webcode id to student collection
    student.webcode = student.webcode.concat(savedWebcode._id);

    await student.save();

    //sending response
    res.status(200).json({ message: "webcode submitted sucessfully" });

    //
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error on updating, please try again later" });
  }
};

module.exports = {
  fetchWebcode,
  postWebcode,
};

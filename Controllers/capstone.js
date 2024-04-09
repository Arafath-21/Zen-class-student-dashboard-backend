const jwt = require("jsonwebtoken");
const { SECRET } = require("../utils/config");
const Student = require("../Model/studentModel");
const Capstone = require("../Model/capstoneModel");

//getting token function
const getTokenFrom = (req) => {
  const authorization = req.get("authorization");

  if (authorization && authorization.startsWith("bearer ")) {
    return authorization.replace("bearer ", "");
  }
};

// fetching all capstone

const fetchCapstone = async (req, res) => {
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

    const capstones = await Student.findById(decodedToken.id).populate(
      "capstone"
    );

    res.status(200).json(capstones.capstone);
    //
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error on fetching data please login & try again" });
  }
};

//posting new capstone data

const postCapstone = async (req, res) => {
  try {
    //getting body content
    const { feUrl, beUrl, feCode, beCode } = req.body;

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
    const capstones = await Student.findById(decodedToken.id).populate(
      "capstone"
    );

    if (capstones.capstone.length) {
      return res.status(401).json({ message: "Already Submitted" });
    }

    //getting logged student to store capstone
    const student = await Student.findById(decodedToken.id);

    //prepare data to push into capstone collection
    const newCapstone = new Capstone({
      feUrl,
      beUrl,
      feCode,
      beCode,
      student: student._id,
    });

    // saving new capstone in collection
    const savedCapstone = await newCapstone.save();

    //loading capstone id to student collection
    student.capstone = student.capstone.concat(savedCapstone._id);

    await student.save();

    //sending response
    res.status(200).json({ message: "capstone submitted sucessfully" });

    //
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error on updating, please try again later" });
  }
};

module.exports = {
  fetchCapstone,
  postCapstone,
};

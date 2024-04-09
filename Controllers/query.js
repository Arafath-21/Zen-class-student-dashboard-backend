const jwt = require("jsonwebtoken");
const { SECRET } = require("../utils/config");
const Student = require("../Model/studentModel");
const Query = require("../Model/queryModel");

//getting token function
const getTokenFrom = (req) => {
  const authorization = req.get("authorization");

  if (authorization && authorization.startsWith("bearer ")) {
    return authorization.replace("bearer ", "");
  }
};

// fetching all query

const fetchQuery = async (req, res) => {
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

    const querys = await Student.findById(decodedToken.id).populate("query");

    res.status(200).json(querys.query);
    //
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error on fetching data please login & try again" });
  }
};

//posting new query

const postQuery = async (req, res) => {
  try {
    //getting body content
    const { queryTitle, queryDesc } = req.body;

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

    //getting logged student to store query
    const student = await Student.findById(decodedToken.id);

    //prepare data to push into query collection
    const newQuery = new Query({
      queryTitle,
      queryDesc,
      student: student._id,
    });

    // saving new query in collection
    const savedQuery = await newQuery.save();

    //loading query id to student collection
    student.query = student.query.concat(savedQuery._id);

    await student.save();

    //sending response
    res.status(200).json({ message: "query applied sucessfully" });

    //
  } catch (error) {
    return res.status(400).json({ message: "Please fill all data" });
  }
};

//deleting query

const deleteQuery = async (req, res) => {
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

    // if query not found throw error

    const matchedQuery = await Query.findById(id);
    if (!matchedQuery) {
      return res.status(401).json({ message: "query data not found" });
    }

    // deleting query from collection

    await Query.findByIdAndDelete(id);

    //removing from student db

    await Student.findByIdAndUpdate(
      decodedToken.id,
      {
        $pull: { query: id },
      },
      { new: true }
    );

    //sending response
    res.status(200).json({ message: "query deleted sucessfully" });

    //
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error on updating, please try again later" });
  }
};

module.exports = {
  fetchQuery,
  postQuery,
  deleteQuery,
};

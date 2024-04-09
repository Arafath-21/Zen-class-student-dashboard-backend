const jwt = require("jsonwebtoken");
const { SECRET } = require("../utils/config");
const Student = require("../Model/studentModel");
const Task = require("../Model/taskModel");

//getting token function
const getTokenFrom = (req) => {
  const authorization = req.get("authorization");

  if (authorization && authorization.startsWith("bearer ")) {
    return authorization.replace("bearer ", "");
  }
};

// fetching for task student one student

const fetchTask = async (req, res) => {
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

    const tasks = await Student.findById(decodedToken.id).populate("task");

    res.status(200).json(tasks.task);
    //
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error on fetching data please login & try again" });
  }
};

// fetching for all tasks for evaluation

const fetchAllTask = async (req, res) => {
  try {
    const tasks = await Task.find({});

    res.status(200).json(tasks);
    //
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error on fetching data please login & try again" });
  }
};

//posting new task

const postTask = async (req, res) => {
  try {
    //getting body content
    const {
      day,
      frontEndCode,
      frontEndURL,
      backEndCode,
      backEndURL,
      task,
      title,
      check,
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

    //getting logged student to store task
    const student = await Student.findById(decodedToken.id);

    //checking task already submitted or not
    const matchedtask = await Task.findOne({ check });
    if (matchedtask) {
      res.status(400).json({ message: "Task already submitted" });
      return;
    }

    //prepare data to push into task collection
    const newTask = new Task({
      day,
      frontEndCode,
      frontEndURL,
      backEndCode,
      backEndURL,
      task,
      title,
      check,
      student: student._id,
    });

    // saving new task in collection
    const savedTask = await newTask.save();

    //loading task id to student collection
    student.task = student.task.concat(savedTask._id);

    await student.save();

    //sending response
    res.status(200).json({ message: "task submitted sucessfully" });

    //
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error on updating, please try again later" });
  }
};

//posting new task

const updateTaskScore = async (req, res) => {
  try {
    //getting body content
    const { id, score } = req.body;

    //getting matchedtask to update store task
    const matchedtask = await Task.findOne({ _id: id });

    if (!matchedtask) {
      res.status(400).json({ message: "Task not found or already evalauted" });
      return;
    }

    // saving task score in collection
    matchedtask.score = score;

    await Task.findByIdAndUpdate(matchedtask.id, matchedtask);

    //sending response
    res.status(200).json({ message: "task score updated Succesfully" });

    //
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error on updating, please try again later" });
  }
};

module.exports = {
  fetchTask,
  postTask,
  updateTaskScore,
  fetchAllTask,
};

const jwt = require("jsonwebtoken");
const { SECRET } = require("../utils/config");
const Student = require("../Model/studentModel");
const Portfolio = require("../Model/portfolioModel");

//getting token function
const getTokenFrom = (req) => {
  const authorization = req.get("authorization");

  if (authorization && authorization.startsWith("bearer ")) {
    return authorization.replace("bearer ", "");
  }
};

// fetching all portfolio

const fetchPortfolio = async (req, res) => {
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

    const portfolios = await Student.findById(decodedToken.id).populate(
      "portfolio"
    );

    res.status(200).json(portfolios.portfolio);
    //
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error on fetching data please login & try again" });
  }
};

//posting new portfolio data

const postPortfolio = async (req, res) => {
  try {
    //getting body content
    const { portfolioURL, githubURL, resumeURL } = req.body;

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
    const portfolios = await Student.findById(decodedToken.id).populate(
      "portfolio"
    );

    if (portfolios.portfolio.length) {
      return res.status(401).json({ message: "Already Submitted" });
    }

    //getting logged student to store portfolio
    const student = await Student.findById(decodedToken.id);

    //prepare data to push into portfolio collection
    const newPortfolio = new Portfolio({
      portfolioURL,
      githubURL,
      resumeURL,
      student: student._id,
    });

    // saving new portfolio in collection
    const savedPortfolio = await newPortfolio.save();

    //loading portfolio id to student collection
    student.portfolio = student.portfolio.concat(savedPortfolio._id);

    await student.save();

    //sending response
    res.status(200).json({ message: "portfolio submitted sucessfully" });

    //
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error on updating, please try again later" });
  }
};

module.exports = {
  fetchPortfolio,
  postPortfolio,
};

const portfolioRouter = require("express").Router();
const {
  fetchPortfolio,
  postPortfolio,
} = require("../Controllers/portfolio.js");

// fetching all portfolio

portfolioRouter.get("/student/portfolio", fetchPortfolio);

//posting new portfolio data

portfolioRouter.post("/student/portfolio", postPortfolio);

module.exports = portfolioRouter;

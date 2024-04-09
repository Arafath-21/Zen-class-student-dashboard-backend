require("dotenv").config();

const URL = process.env.ATLAS_URI;
const PORT = process.env.PORT;
const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const SECRET = process.env.SECRET;
const BEURL = process.env.BEURL;
const FEURL = process.env.FEURL;

module.exports = {
  URL,
  PORT,
  EMAIL_ADDRESS,
  EMAIL_PASSWORD,
  SECRET,
  FEURL,
  BEURL,
};

const bcrypt = require("bcryptjs");
const hashInfo = async (value) => {
  const salt = await bcrypt.genSalt(10);
  const hash = bcrypt.hash(value, salt);
  return hash;
};

module.exports = { hashInfo };

const { getNodeById } = require("../queries")
const db = require('../queries');

const validateProfile = (profileContent) => {
  return new Promise(async resolve => {
    const existingProfile = await db.getProfileByEmail(profileContent.email);
    if (existingProfile !== undefined) {
      resolve("Profile with Email Already Exists.");
    }
    resolve("");
  });
}

const validateCreateNode = (nodeType, content) => {
  return new Promise(async resolve => {
    if (nodeType === "Profile") {
      const validProfileMsg = await validateProfile(content);
      resolve(validProfileMsg);
    } else {
      resolve("");
    }
  });
}

module.exports = {
  validateCreateNode
}
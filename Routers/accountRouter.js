const db = require('../queries');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

router.post('/register', async function(request, response) {
  const {username, password} = request.body;

  const savedAccount = await db.getAccountByUsername(username);
  if(savedAccount != undefined) {
    response.status(200).json("Account Already Exists.");
    return;
  }

  const hashedPass = await bcrypt.hash(password, 10);
  db.createAccount(username, hashedPass, (error, results) => {
    if (error) {
      throw error
    }
    const user = {
      account_id: results.rows[0].account_id,
      username: results.rows[0].username,
      profile_node_id: results.rows[0].profile_node_id
    }
    const token = jwt.sign(
      user,
      config.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    user.token = token;

    // return new user
    response.status(200).json(user);
  });
});

router.post('/login', async function(request, response) {
  const {username, password} = request.body;

  const savedAccount = await db.getAccountByUsername(username);
  if(savedAccount != undefined) {
    if (await bcrypt.compare(password, savedAccount.password)) {
      const user = {
        account_id: savedAccount.account_id,
        username: savedAccount.username,
        profile_node_id: savedAccount.profile_node_id
      }
      const token = jwt.sign(
        user,
        config.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      // save user token
      user.token = token;

      // return new user
      response.status(200).json(user);
    } else {
      response.status(403).send(`Login Failed`);
    }
    return;
  }
});

module.exports = router;
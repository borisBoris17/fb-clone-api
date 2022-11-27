const db = require('../queries');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const nodeValidator = require('../Validators/nodeValidator');

router.post('/register', async function (request, response) {
  const { username, password, email, name } = request.body;

  const savedAccount = await db.getAccountByUsername(username);
  console.log(savedAccount);
  if (savedAccount != undefined) {
    response.status(200).json("Account with Username Already Exists.");
    return;
  }

  const content = {
    email: email,
    name: name,
  }

  const validProfileMsg = await nodeValidator.validateCreateNode('Profile', content);
  if (validProfileMsg !== "") {
    response.status(200).send(validProfileMsg);
    return;
  }

  db.createNode('Profile', content)
    .then(async result => {
      const hashedPass = await bcrypt.hash(password, 10);
      db.createAccount(username, hashedPass, result.node_id)
        .then(result => {
          const user = {
            account_id: result.account_id,
            username: result.username,
            profile_node_id: result.profile_node_id
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
        })
        .catch(error => {
          // change to respond with error code and message
          throw error;
        });
    })
    .catch(error => {
      // change to respond with error code and message
      throw error;
    });
});

router.post('/login', async function (request, response) {
  const { username, password } = request.body;

  const savedAccount = await db.getAccountByUsername(username);
  if (savedAccount != undefined) {
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
  } else {
    response.status(403).send(`Login Failed`);
  }
});

module.exports = router;
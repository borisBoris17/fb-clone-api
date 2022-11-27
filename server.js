const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodeRouter = require('./Routers/nodeRouter');
const accountRouter = require('./Routers/accountRouter');
const relationRouter = require('./Routers/relationRouter');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 3007;

app.get('/', function (req, res) {
  res.json({ info: 'Facebook clone API' });
});

app.use('/memory-social-api/node', nodeRouter);
app.use('/memory-social-api/relation', relationRouter);
app.use('/memory-social-api/account', accountRouter);

app.use(express.static('public')); 
app.use('/images', express.static('images'));

app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});
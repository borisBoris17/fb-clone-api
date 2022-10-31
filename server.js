const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const nodeRouter = require('./Routers/nodeRouter')
const relationRouter = require('./Routers/relationRouter')

const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 3007;

app.get('/', function (req, res) {
  res.json({ info: 'Facebook clone API' });
});

app.use('/fb-clone/node', nodeRouter);
app.use('/fb-clone/relation', relationRouter);

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});
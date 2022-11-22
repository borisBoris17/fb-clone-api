const db = require('../queries');
const express = require('express');
const router = express.Router();
const nodeValidator = require('../Validators/nodeValidator');

const multer = require('multer');
const { compare } = require('bcrypt');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './images/')
  },
  filename: function (req, file, cb) {
    console.log(req.body);
    console.log(req.body.postId);

    cb(null, req.body.postId + "/" + req.body.postId + "/" + file.originalname)
  }
})

const fileFilter = (req, file, callback) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
    callback(null, true)
  } else {
    callback(null, false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

router.post('/uploadImage', upload.array('images', 12), (req, res, next) => {
  if (req.files) {
    res.status(200).json("Success");
  } else {
    res.status(200).json("File not found...");
  }
})

router.get('/', function (request, response) {
  db.getAllNodes((error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  });
});

router.get('/:id', function (request, response) {
  const nodeId = parseInt(request.params.id);
  db.getNodeById(nodeId, (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  });
});

router.post('/', async function (request, response) {
  const { node_type, content } = request.body;

  const validProfileMsg = await nodeValidator.validateCreateNode(node_type, content);
  if (validProfileMsg !== "") {
    response.status(200).send(validProfileMsg);
    return;
  }

  db.createNode(node_type, content)
    .then(result => {
      response.status(201).send(result);
    })
    .catch(error => {
      if (error) {
        throw error;
      }
    });
});

router.put('/:id', function (request, response) {
  const nodeId = parseInt(request.params.id);
  const { content } = request.body;

  db.updateNode(content, nodeId, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(204).send();
  });
});

router.delete('/:id', function (request, response) {
  const nodeId = parseInt(request.params.id);

  db.deleteNode(nodeId, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send();
  });
});

router.get('/:sourceId/:relationType/:nodeType', function (request, response) {
  const sourceId = parseInt(request.params.sourceId);
  const relationType = request.params.relationType;
  const nodeType = request.params.nodeType;

  db.findNodesBySourceAndTypes(sourceId, relationType, nodeType, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(results.rows);
  });
});

router.get('/feed/:profileId', async function (request, response) {
  const profileId = parseInt(request.params.profileId);

  const profileIds = await db.getNodeIdBySourceAndRelationType('Friend', profileId);
  profileIds.push(profileId);
  db.getPostsByProfileIds(profileIds, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(results.rows);
  });
})

module.exports = router;
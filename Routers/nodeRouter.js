const db = require('../queries');
const express = require('express');
const router = express.Router();
const nodeValidator = require('../Validators/nodeValidator');
const fs = require('fs');
var path = require('path')
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const pathString = `./images/${req.body.profileId}/${req.body.postId}`
    fs.mkdirSync(pathString, { recursive: true })
    cb(null, pathString)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, callback) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/heic') {
    callback(null, true)
  } else {
    callback(null, false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

router.post('/uploadImage', upload.array('images', 12), async (req, res, next) => {
  if (req.files) {
    const nodeId = parseInt(req.body.postId);
    const profileId = parseInt(req.body.profileId);
    const node = await db.getNodeByIdForValidation(nodeId);
    const content = node.content;
    content.images = req.files;
    const updatedNode = await db.updateNode(content, nodeId);
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

router.get('/search/:keyword', async function (request, response) {
  const keyword = request.params.keyword;
  try {
    const foundProfiles = await db.getProfileByKeyword(keyword);
    response.status(200).json(foundProfiles);
  } catch (error) {
    throw error
  }
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

router.put('/:id', async function (request, response) {
  const nodeId = parseInt(request.params.id);
  const { content } = request.body;

  db.updateNode(content, nodeId)
    .then(result => {
      response.status(200).json(result);
    })
    .catch(error => {
      if (error) {
        throw error;
      }
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
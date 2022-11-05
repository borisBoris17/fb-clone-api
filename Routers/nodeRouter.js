const db = require('../queries');
const express = require('express');
const router = express.Router();
const nodeValidator = require('../Validators/nodeValidator');

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

  db.createNode(node_type, content, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).send(results.rows[0]);
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

module.exports = router;
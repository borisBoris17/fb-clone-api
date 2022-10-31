const db = require('../queries');
const express = require('express');
const router = express.Router();
const relationValidator = require('../Validators/relationValidator');

router.get('/', function (request, response) {
  db.getAllRelations((error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  });
})

router.post('/', async function (request, response) {
  const { relation_type, source_id, dest_id, content } = request.body;

  const validRelationMsg = await relationValidator.validateCreateRelation(relation_type, source_id, dest_id, content);
  if (validRelationMsg !== "") {
    response.status(200).send(validRelationMsg);
    return;
  }

  db.createRelation(relation_type, source_id, dest_id, content, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).send(results.rows[0]);
  });
});

router.put('/:id', function (request, response) {
  const relationId = parseInt(request.params.id);
  const { content } = request.body;

  db.updateRelation(content, relationId, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(204).send();
  });
});

router.delete('/:id', function (request, response) {
  const relationId = parseInt(request.params.id);

  db.deleteRelation(relationId, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send();
  });
});

module.exports = router;
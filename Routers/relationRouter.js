const db = require('../queries');
const express = require('express');
const router = express.Router();
const relationValidator = require('../Validators/relationValidator');
const emailUtil = require('../Utilities/emailUtility');
const { response } = require('express');

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

  const createdRelation = await db.createRelation(relation_type, source_id, dest_id, content);
  if (createdRelation !== undefined) {
    response.status(201).send(createdRelation);
    return;
  }
  response.status(201).send('Error Creating Relation');
});

router.put('/:id', async function (request, response) {
  const relationId = parseInt(request.params.id);
  const { content } = request.body;

  const updatedRelation = await db.updateRelation(content, relationId);

  response.status(200).send(updatedRelation);
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

router.get('/:sourceId/:relationType', function (request, response) {
  const sourceId = parseInt(request.params.sourceId);
  const relationType = request.params.relationType;

  db.getCountForRelationFromSource(sourceId, relationType, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(results.rows);
  });
});

router.post('/sendFriendRequest', async function (request, response) {
  const { relation_type, source_id, dest_id, content } = request.body;
  await db.createRelation(relation_type, source_id, dest_id, content);
  const targetProfile = await db.getNodeById(parseInt(dest_id));
  const sourceProfile = await db.getNodeById(parseInt(source_id));
  const emailSentMessage = await emailUtil.sendEmailNotification(targetProfile.content.email, `You have a Friend Request from ${sourceProfile.content.name}. https://memory-social.tucker-dev.com/FriendRequest/${source_id}`);
  response.status(200).send(emailSentMessage);
});

router.post('/confirmFriendRequest', async function (request, response) {
  const { requestSourceId, requestTargetId, content } = request.body;
  const friendRequest = await db.getRelationBySourceDestAndType('Friend_request', requestSourceId, requestTargetId);
  if (friendRequest !== undefined) {
    const updatedFriendRequestContent = {...friendRequest.content, isProcessed: true};
    await db.updateRelation(updatedFriendRequestContent, friendRequest.relation_id);
    const createdRelations = [];
    createdRelations.push(await db.createRelation('Friend', requestSourceId, requestTargetId, content));
    createdRelations.push(await db.createRelation('Friend', requestTargetId, requestSourceId, content));
    response.status(200).send(createdRelations);
    return;
  } 
  response.status(200).send('No Friend Request Found.');
});

router.get('/getFriendRequest/:sourceId/:destId', async function (request, response) {
  const sourceId = parseInt(request.params.sourceId);
  const destId = parseInt(request.params.destId);

  const friendRequest = await db.getRelationBySourceDestAndType('Friend_request', sourceId, destId);
  response.status(200).send(friendRequest);
});

module.exports = router;
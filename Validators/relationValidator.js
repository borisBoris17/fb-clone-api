const e = require('cors');
const db = require('../queries');

const validateCreateRelation = (relationType, sourceId, destId, content) => {
  return new Promise(async resolve => {
    if (sourceId === undefined || destId === undefined) {
      resolve("Source and Destination IDs must be defined.");
    } else {
      const sourceNode = await db.getNodeById(sourceId);
      if (sourceNode === undefined) {
        resolve("Source ID does not exist.")
      }
      const destinationNode = await db.getNodeById(destId);
      if (destinationNode === undefined) {
        resolve("Destination ID does not exist.")
      }
      const existingRelation = await db.getRelationBySourceDestAndType(relationType, sourceId, destId);
      if (existingRelation !== undefined) {
        resolve("Relation already Exists.");
      }
      resolve("");
    }
  });
}

module.exports = {
  validateCreateRelation
}
const crypto = require('crypto');
function canonicalize(obj){
  return JSON.stringify(obj, Object.keys(obj).sort());
}
function generateId({ templateName, schemaString, activeDimensions = [], salt = ''}){
  const payload = canonicalize({ templateName, schemaString, activeDimensions, salt });
  const hash = crypto.createHash('sha256').update(payload).digest('hex').substring(0,16);
  return `schema_${hash}`;
}
module.exports = { generateId, canonicalize };
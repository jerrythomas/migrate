// const sqlSchema = {
//   type: 'object',
//   properties: {
//     key: { type: 'string', minLength: 20 },
//     data: { type: 'string', minLength: 20 },
//     tables: { type: 'string', minLength: 20 },
//     columns: { type: 'string', minLength: 20 },
//     indexes: { type: 'string', minLength: 20 },
//     references: { type: 'string', minLength: 20 },
//   },
//   required: ['key', 'data', 'tables', 'columns', 'indexes', 'references'],
// };

const dbInfoSchema = {
  type: 'object',
  properties: {
    database: { type: 'string', minLength: 5 },
    url: { type: 'string', minLength: 5 }
  },
  required: ['url', 'database']
}

const mappingSchema = {
  type: 'object',
  properties: {
    source: dbInfoSchema,
    target: dbInfoSchema,
    exportQueue: { type: 'string', pattern: '^export-.+' },
    importQueue: { type: 'string', pattern: '^import-.+' }
  },
  required: ['source', 'target', 'exportQueue', 'importQueue']
}

module.exports = mappingSchema

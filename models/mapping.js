const sqlSchema = {
  type: 'object',
  properties: {
    key: {type: 'string', minLength:20},
    data: {type: 'string', minLength:20},
    tables: {type: 'string', minLength:20},
    columns: {type: 'string', minLength:20},
    indexes: {type: 'string', minLength:20},
    dependency: {type: 'string', minLength:20},
    references: {type: 'string', minLength:20}
  },
  required: ['key','data', 'tables', 'columns','indexes','ref_tables','references']
}

const dbInfoProperties = {
  database: { type: 'string' },
  url: { type: 'string' },
  queries: {

  }
};

const mappingSchema = {
  type: 'object',
  properties: {
    source: {
      type: 'object',
      properties: dbInfoProperties,
      required: ['url', 'database', 'queries']
    },
    target: {
      type: 'object',
      properties: dbInfoProperties,
      required: ['url', 'database']
    },
    exportQueue: {type: 'string', pattern: '^export-.+'},
    importQueue: {type: 'string', pattern: '^import-.+'}
  },
  required: ['source', 'target', 'exportQueue', 'importQueue']
}

module.exports = mappingSchema;

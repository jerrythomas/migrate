const { test } = require('tap')
const { build } = require('../helper')
const mysqlHelper = require('../../lib/mysql')

function findObjectsQuery () {
  const query = `
   select object_type
        , object_name
     from (
       select 'TABLE'        as object_type
            , table_name     as object_name
            , table_schema   as object_schema
         from information_schema.tables
        union all
       select routine_type   as object_type
            , routine_name   as object_name
            , routine_schema as object_schema
         from information_schema.routines
     ) as x
   where object_schema = ?
  `
  return query
}

async function getObjectsAfterCleanup (mockApp, version) {
  const schema = `test_v${version}`

  await mysqlHelper.cleanup(mockApp, version)
  const [result] = await mockApp.mysql.source.query(findObjectsQuery(), [schema])

  return result
}

async function getObjectsAfterSetup (mockApp, version) {
  const schema = `test_v${version}`

  await mysqlHelper.setup(mockApp, version)
  const [result] = await mockApp.mysql.source.query(findObjectsQuery(), [schema])
  return result
}

test('should fetch the version', async (t) => {
  const mockApp = build(t, true)
  await mockApp.ready()

  const version = await mysqlHelper.getMajorVersion(mockApp.mysql.source, 'source')
  t.ok(version > 0)
  t.ok(version < 9)
  t.end()
})

test('cleanup should not fail for v8+', async (t) => {
  process.env.SOURCE_DB_URL = 'mysql://root@localhost/test_v8'

  const mockApp = build(t, true)
  await mockApp.ready()

  let result = await getObjectsAfterCleanup(mockApp, 8)
  t.same(result, [])
  result = await getObjectsAfterSetup(mockApp, 8)
  t.same(result, [])

  t.ok(true)
  t.end()
})

test('cleanup should not fail for less 8 version', async (t) => {
  let result

  process.env.SOURCE_DB_URL = 'mysql://root@localhost/test_v5'
  const mockApp = build(t, true)
  await mockApp.ready()

  result = await getObjectsAfterCleanup(mockApp, 5)
  t.same(result, [])

  result = await getObjectsAfterSetup(mockApp, 5)
  t.same(result, [
    {
      object_type: 'TABLE',
      object_name: 'export_session'
    },
    {
      object_type: 'TABLE',
      object_name: 'export_tables'
    },
    {
      object_type: 'PROCEDURE',
      object_name: 'get_tables'
    }
  ])

  result = await getObjectsAfterCleanup(mockApp, 5)
  t.same(result, [])

  t.ok(true)
  t.end()
})

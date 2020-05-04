const { test } = require('tap')
const getMajorVersion = require('../../../queues/export-mysql/version')
const { build } = require('../../helper')

test('should fetch the version', async (t) => {
  const mockApp = build(t, true)
  await mockApp.ready()

  const version = await getMajorVersion(mockApp.mysql.source, 'source')
  t.ok(version > 0)
  t.ok(version < 9)
  t.end()
})

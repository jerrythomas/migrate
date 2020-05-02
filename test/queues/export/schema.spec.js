const { test } = require('tap')
const fs = require('fs')
const { build } = require('../../helper')
const { handler } = require('../../../queues/export-mysql/schema')

test('Export schemas from mysql', async (t) => {
  const scenario = JSON.parse(fs.readFileSync('test/queues/export/schema.json'))

  t.plan(1)
  const mockApp = build(t, true)
  await mockApp.ready()
  const res = await handler(mockApp, scenario.job)
  t.same(res, scenario.expected)
  t.end()
})

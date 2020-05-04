const { test } = require('tap')
const fs = require('fs')
const { pick, merge } = require('lodash')
const { build } = require('../../helper')
const { handler } = require('../../../queues/export-mysql/table')

test('Export tables from mysql', async (t) => {
  const scenarios = JSON.parse(fs.readFileSync('test/queues/export/table.json'))
  t.plan(2 * scenarios.length)
  const mockApp = build(t, true)
  await mockApp.ready()

  const cases = await scenarios.map(async (scenario) => {
    let output = {}
    process.env.NODE_ENV = 'test'

    try {
      output = await handler(mockApp, scenario.input)
      t.notok(scenario.error)
    } catch (err) {
      t.ok(scenario.error)
      output = pick(err, ['data', 'message', 'name', 'errors'])
    }
    t.same(output, scenario.output)
    return merge(pick(scenario, ['input', 'error']), { output })
  })

  await Promise.all(cases)
  t.end()
})

test('No job logs in production/dev', async (t) => {
  const scenarios = JSON.parse(fs.readFileSync('test/queues/export/table.dev.json'))
  t.plan(2 * scenarios.length)
  const mockApp = build(t, true)
  await mockApp.ready()

  const cases = await scenarios.map(async (scenario) => {
    let output = {}
    process.env.NODE_ENV = 'dev'

    try {
      output = await handler(mockApp, scenario.input)
      t.notok(scenario.error)
    } catch (err) {
      t.ok(scenario.error)
      output = pick(err, ['data', 'message', 'name', 'errors'])
    }
    t.same(output, scenario.output)
    return merge(pick(scenario, ['input', 'error']), { output })
  })

  await Promise.all(cases)

  t.end()
})

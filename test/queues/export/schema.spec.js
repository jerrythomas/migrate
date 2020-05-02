const { test } = require('tap')
const fs = require('fs')
const { pick, merge } = require('lodash')
const { build } = require('../../helper')
const { handler } = require('../../../queues/export-mysql/schema')

test('Export schemas from mysql', async (t) => {
  const scenarios = JSON.parse(fs.readFileSync('test/queues/export/schema.json'))

  t.plan(2 * scenarios.length)
  const mockApp = build(t, true)
  await mockApp.ready()

  const cases = await scenarios.map(async (scenario) => {
    let output = {}

    process.env.NODE_ENV = 'test'

    try {
      output = await handler(mockApp, scenario.input)
      t.notok(scenario.error)
      t.same(output, scenario.output)
    } catch (err) {
      t.ok(scenario.error)
      t.same(pick(err, ['data', 'message', 'name', 'errors']), scenario.output)
    }
    return merge(pick(scenario, ['input', 'error']), output)
  })

  await Promise.all(cases)
  t.end()
})

test('No jobs logged in production/dev', async (t) => {
  const scenarios = JSON.parse(fs.readFileSync('test/queues/export/schema.dev.json'))

  t.plan(2 * scenarios.length)
  const mockApp = build(t, true)
  await mockApp.ready()

  const cases = await scenarios.map(async (scenario) => {
    let output = {}
    process.env.NODE_ENV = 'dev'

    try {
      output = await handler(mockApp, scenario.input)
      t.notok(scenario.error)
      t.same(output, scenario.output)
    } catch (err) {
      t.ok(scenario.error)
      t.same(pick(err, ['data', 'message', 'name', 'errors']), scenario.output)
    }
    return merge(pick(scenario, ['input', 'error']), output)
  })

  await Promise.all(cases)
  t.end()
})

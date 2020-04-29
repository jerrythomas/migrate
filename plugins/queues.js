/* eslint import/no-dynamic-require: 0 */
/* eslint global-require: 0 */
const FastifyPlugin = require('fastify-plugin');
const Queue = require('bull');
const fs = require('fs');
const path = require('path');

/**
 * Walk path and return a list of files
 *
 * @param {String} dir - path to be recursively scanned
 */
function walk(dir) {
  let filepaths = [];
  const files = fs.readdirSync(dir);

  files.forEach((filename) => {
    const filepath = path.join(dir, filename);

    if (fs.statSync(filepath).isDirectory()) {
      filepaths = filepaths.concat(walk(filepath));
    } else {
      filepaths.push(filepath);
    }
  });

  return filepaths;
}

/**
 * Find all script files under root folder and return a list
 * containing the name and handler of the queue
 *
 * @param {String} root - Folder containing the queue handlers
 * @param {Logger} log - Instance of fastify
 */
function findQueueHandlers(root, log) {
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    return [];
  }
  // include only javascript/typescript
  const files = walk(root).filter((file) => path.extname(file).match('.(js|ts)$'));
  const handlers = {};

  files.forEach((file) => {
    const taskInfo = require(path.resolve(file));

    if (taskInfo.queue && taskInfo.task && taskInfo.handler) {
      handlers[taskInfo.queue] = handlers[taskInfo.queue] || [];
      handlers[taskInfo.queue].push({
        name: taskInfo.task,
        handler: taskInfo.handler,
        concurrency: taskInfo.concurrency || process.env.QUEUE_CONCURRENCY || 1,
      });
    } else {
      log.error({ file, taskInfo, msg: 'Queue configuration is incomplete.' });
    }
  });

  return handlers;
}

function FastifyBull(fastify, opts, next) {
  let taskQueues = {};
  let queueHandlers;
  let mockHandlers = opts.mock || false
  // Support mocking handlers for tests.
  if (mockHandlers){
    queueHandlers = opts.queues;
  } else {
    queueHandlers = findQueueHandlers(opts.path || 'queues', fastify.log);
  }

  Object.entries(queueHandlers).forEach(([name, tasks]) => {
    const taskQ = new Queue(name, { connection: fastify.redis });
    tasks.forEach((task) => {
      taskQ.process(task.name, task.concurrency || 1, task.handler);
    });
    taskQueues[name] = taskQ;
  });

  fastify.addHook('onClose', (instance, done) => {
    Object.values(instance.queues).forEach((queue) => {
      queue.close();
    });
    done();
  });

  fastify.decorate('queues', taskQueues);

  next();
}

module.exports = FastifyPlugin(FastifyBull, {
  name: 'fastify-bull',
  dependencies: [
    'fastify-redis',
  ],
});

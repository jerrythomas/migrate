const FastifyPlugin = require('fastify-plugin');

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

  const regex = new RegExp(`^${root}/([a-z|A-Z]+(/index)?.(js|ts))$`, 'g');
  const files = walk(root).filter((file) => file.match(regex));

  const queueList = [];

  files.forEach((file) => {
    const queueConfig = require(path.resolve(file));
    if (queueConfig.name && queueConfig.handler) {
      queueList.push(queueConfig);
    } else {
      log.error({ file, msg: 'Queue name is not available.' });
    }
  });

  return queueList;
}

function FastifyBull(fastify, opts, next) {
  // const connection = fastify.redis;
  const queueHandlers = findQueueHandlers(opts.path || 'queues', fastify.log);

  fastify.decorate('queues', queueHandlers);

  next();
}

module.exports = FastifyPlugin(FastifyBull, {
  name: 'fastify-bull',
  dependencies: [
    'fastify-redis',
  ],
});

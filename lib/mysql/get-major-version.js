// todo return semver
async function getMajorVersion (db) {
  // fastify.redis.get(key)
  const [result] = await db.query("show variables like 'version';")
  const majorVersion = parseInt(result[0].Value.split('.')[0], 10)

  return majorVersion
}

module.exports = getMajorVersion

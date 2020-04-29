const { test } = require('tap');
const Fastify = require('fastify');
const Mapping = require('../../plugins/mapping');
// const { mappingSchema } = require('../../models/index');
// const messages = require('../../common/messages');
// require('dotenv').config();

// const scenarios = [
//   // {
//   //   name: 'Mapping data not set',
//   //   data: null,
//   //   error: Error('Source and target have not been configured.')
//   // },
//   // {
//   //   name: 'invalid mapping data',
//   //   data: {},
//   //   error: Error('Source and target have not been configured.')
//   // },
//   // {
//   //   name: 'invalid mapping data',
//   //   data: { source: '', target: ''},
//   //   error: Error('Source and target have not been configured.')
//   // },
//   {
//     name: 'Valid mapping data',
//     data: {
//       source: {
//         database: 'mysql',
//         url: 'mysql://',
//       },
//       target: {
//         database: 'postgres',
//         url: 'postgres://',
//       },
//     },
//     error: Error('Source and target have not been configured.'),
//   },
// ];

test('Mapping requires redis', (t) => {
  t.plan(1);
  const fastify = Fastify();
  t.tearDown(fastify.close.bind(fastify));
  fastify.register(Mapping);
  fastify.ready((err) => {
    t.error(err);
    fastify.close();
  });


  // fastify.ready((err) => {
  //
  //   t.ok(err)
  //   t.match(err.message, messages.MISSING_REDIS_PLUGIN)
  //   // fastify.validate(mappingSchema, fastify.mapping)
  //   // console.log(process.env['MYSQL_URL'])
  //   // console.log(fastify.mapping)
  //   fastify.close()
  // })
});

// test('Mapping requires redis', (t) => {
//   t.plan(2)
//   const fastify = Fastify()
//   fastify.register(Mapping)
//
//   fastify.ready((err) => {
//     t.error(err)
//     try {
//       mapping = fastify.getMapping()
//     } catch (err){
//       t.match(err, Error('fastify-redis has not been set up.'))
//     }
//   })
// })
//
// test('Mapping data not available', (t) => {
//   //t.plan(2)
//   const fastify = Fastify()
//   fastify.register(require('fastify-redis'))
//   fastify.register(Mapping)
//
//   fastify.ready((err) => {
//     t.error(err)
//     const { redis } = fastify
//     let mapping = fastify.getMapping()
//     console.log(`getMapping ${mapping}`)
//     t.match(mapping, scenarios[0].data)
//     // scenarios.forEach((scenario, i) => {
//     //   let mapping
//     //   console.log(scenario.data)
//     //   if (scenario.data == null) {
//     //     redis.del('MAPPING', (err) => {
//     //       mapping = fastify.getMapping()
//     //       console.log(mapping)
//     //     })
//     //   } else {
//     //     redis.set('MAPPING', JSON.stringify(scenario.data), (err) => {
//     //       mapping = fastify.getMapping()
//     //       console.log(`getMapping ${mapping}`)
//     //       t.deepEqual(mapping, scenario.data)
//     //     })
//     //   }
//     //
//     //
//     //   //   let mapping = fastify.getMapping()
//     //   //   console.log(mapping)
//     //   // } catch (err){
//     //   //   fastify.log.info(err)
//     //   //    //t.match(err, Error('fastify-redis has not been set up.'))
//     //   // }
//     //
//     // });
//
//     fastify.close()
//     //t.end()
//
//   })
// })

// test('Invalid mapping data', (t) => {
//   t.plan(2)
//   const fastify = Fastify()
//   fastify.register(require('fastify-redis'))
//   fastify.register(Mapping)
//
//   fastify.ready((err) => {
//     t.error(err)
//     try {
//       fastify.redis.set('mapping', '')
//       mapping = fastify.mapping()
//     } catch (err){
//       console.log(err)
//       t.match(err, ReferenceError('mapping is not defined'))
//       //t.match(err, Error('Source and target have not been configured.'));
//       t.end()
//     }
//   })
// })
//
// test('Valid mapping data', (t) => {
//   //t.plan(2)
//   const fastify = Fastify()
//   fastify.register(require('fastify-redis'))
//   fastify.register(Mapping)
//
//   fastify.ready((err) => {
//     t.error(err)
//     try {
//       fastify.redis.set('mapping', '')
//       mapping = fastify.mapping()
//     } catch (err){
//       console.log(err)
//       t.error(err);
//     }
//     t.match(typeof(mapping.source), 'object')
//     t.match(typeof(mapping.target), 'object')
//     t.match(typeof(mapping.source.database), 'string')
//     t.match(typeof(mapping.target.database), 'string')
//     t.match(typeof(mapping.source.url), 'string')
//     t.match(typeof(mapping.target.url), 'string')
//   })
// })

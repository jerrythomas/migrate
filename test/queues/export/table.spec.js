const { test } = require('tap');
const { mock } = require('../mock');
const { handler } = require('../../queues/export/table');
const fs = require('fs')
const { pick} = require('lodash')

function writeData(file, data){
  fs.writeFileSync(file, JSON.stringify(data), 'utf8')
}

test('Export schemas from mysql', async (t) => {
  //console.log(fastify)
  // const scenario= {
  //   job: {
  //     data: {
  //       schema: 'exp_data',
  //       table: 'no_fk_data'
  //     },
  //     opts: {
  //       priority: 2
  //     }
  //   },
  //   expected: {
  //     status: 'ok',
  //     warnings: [],
  //     jobs:  [
  //       {
  //         name: "table",
  //         data:  {
  //           columns:  [
  //             {
  //               "name": "id",
  //               "data_type": "smallint",
  //               "precision": null,
  //               "scale": 0,
  //               default: null,
  //               "position": 1,
  //               "is_nullable": "NO",
  //               "key_type": "PRI",
  //               "comment": "",
  //               "extra": "auto_increment",
  //               generator: ""
  //             },
  //             {
  //               "name": "code",
  //               "data_type": "char",
  //               "precision": 15,
  //               "scale": null,
  //               default: null,
  //               "position": 2,
  //               "is_nullable": "NO",
  //               "key_type": "UNI",
  //               "comment": "",
  //               "extra": "",
  //               generator: ""
  //             },
  //             {
  //               "name": "descr",
  //               "data_type": "varchar",
  //               "precision": 50,
  //               "scale": null,
  //               default: null,
  //               "position": 3,
  //               "is_nullable": "NO",
  //               "key_type": "",
  //               "comment": "",
  //               "extra": "",
  //               generator: ""
  //             }
  //           ],
  //           key: [
  //             {
  //               position: 1,
  //               name: "id"
  //             }
  //           ],
  //           indexes: [
  //            {
  //              name: "self_fk_data_fk",
  //              uniqueness: "false",
  //              columns: [
  //                {
  //                  name: "self_ref_id",
  //                  position: 1,
  //                },
  //              ],
  //            },
  //            {
  //              name: "self_fk_data_uk",
  //              uniqueness: "true",
  //              columns: [
  //                {
  //                  name: "code",
  //                  position: 1,
  //                },
  //             ],
  //           },
  //         ],
  //         },
  //       }
  //     ]
  //   }
  // }
  const scenarios = [
    {
     "name": "schema",
     "data":  {
       object: "schema",
       "names":  [
         "exp_data",
         "exp_dep",
         "no_such_schema",
       ],
     },
     "opts":  {
       "priority": 1,
     },
   },
    {
     "name": "table",
     "data":  {
       "table": "no_fk_data",
       "schema": "exp_data",
       object: "table",
     },
     "opts":  {
       "priority": 2,
     },
   },
    {
     "name": "table",
     "data":  {
       "table": "self_fk_data",
       "schema": "exp_data",
       object: "table",
     },
     "opts":  {
       "priority": 2,
     },
   },
    {
     "name": "table",
     "data":  {
       "table": "dep_lookup",
       "schema": "exp_dep",
       object: "table",
     },
     "opts":  {
       "priority": 2,
     },
   },
    {
     "name": "table",
     "data":  {
       "table": "has_fk_data",
       "schema": "exp_data",
       object: "table",
     },
     "opts":  {
       "priority": 3,
     },
   },
    {
     "name": "table",
     "data":  {
       "table": "l2_fk_data",
       "schema": "exp_data",
       object: "table",
     },
     "opts":  {
       "priority": 4,
     },
   },
 ]

  t.plan(1*scenarios.length);
  const mockApp = await mock('mysql', 'postgres');

  let cases = await scenarios.map(async (scenario) => {
    let x = {input: pick(scenario,['data'])}
    res = await handler(mockApp, scenario); // , async (err, res) =>{
       // t.error(err);
       // x.output = res;
    t.same(res, scenario.expected);
    //});
    //return x
  })

  let result = await Promise.all(cases)
  console.log(result)
  writeData('test/tables.json', result);
  await mockApp.mysql.source.end();
  t.end();

})

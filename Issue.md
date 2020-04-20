```bash
fastify generate issue
cd issue
yarn install
yarn upgrade --latest
npm test

# add fastify-metrics plugin
yarn add fastify-metrics
awk '/Place here/{print;print "  fastify.register(require(\"fastify-metrics\"), { endpoint: \"/metrics\" });";next}1' app.js > tmp && mv -f tmp app.js
npm test

# add a duplicate test
FILE=test/services/example.test.js
awk 'NR>=6 && NR<=17' $FILE | sed 's/example/example2/g' >> $FILE
npm test
```

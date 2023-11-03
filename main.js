'use strict';
const { context } = require('@arangodb/locals');

context.use('/dataset', require('./routes/dataset'), 'dataset');
context.use('/data', require('./routes/data'), 'data');

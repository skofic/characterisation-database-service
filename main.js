'use strict'

const { context } = require('@arangodb/locals')

context.use('/data', require('./routes/data'), 'data')
context.use('/dataset', require('./routes/dataset'), 'dataset')

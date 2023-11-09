'use strict'

const { context } = require('@arangodb/locals')

context.use('/dataset', require('./routes/dataset'), 'dataset')

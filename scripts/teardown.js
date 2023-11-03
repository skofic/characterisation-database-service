'use strict'

///
// Globals.
///
const {db} = require('@arangodb')
const {context} = require('@arangodb/locals')

///
// Lod.
///
let log = ""

///
// Database information.
///
const database = require('../globals/database')

///
// Drop collections.
///
for (const [_, collection] of Object.entries(database.documentCollections)) {
	if(db._collection(collection)) {
		log += `Dropping collection ${collection}.\n`
		db._drop(collection)
	} else if (context.isProduction) {
		log += `Collection ${collection} does not exist.\n`
	}
}
for (const [_, collection] of Object.entries(database.edgeCollections)) {
	if(db._collection(collection)) {
		log += `Dropping collection ${collection}.\n`
		db._drop(collection)
	} else if (context.isProduction) {
		log += `Collection ${collection} does not exist.\n`
	}
}

module.exports = log

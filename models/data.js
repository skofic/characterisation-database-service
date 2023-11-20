/**
 * data.js
 *
 * Dataset data model.
 */
'use strict'

const _ = require('lodash')
const joi = require('joi')

module.exports = {

  schema: joi.object({
    // Describe the attributes with joi here
    std_dataset_id: joi.string()
        .required()
        .description("Dataset key reference"),
    std_date: joi.string()
        .regex(/^[0-9]+$/)
        .description("Item measurement date"),
    species: joi.string()
        .description("Item scientific name"),
    gcu_id_number: joi.string()
        .regex(/[A-Z]{3}[0*9]{4}/)
        .description("Gene conservation unit reference"),
    chr_tree_code: joi.string()
        .description("Tree identifier")
  }).unknown(true),

  forClient(obj) {
    // Implement outgoing transformations here
    obj = _.omit(obj, ['_id', '_key', '_rev', '_oldRev'])
    return obj
  },

  fromClient(obj) {
    // Implement incoming transformations here
    return obj
  }

}

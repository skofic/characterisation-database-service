/**
 * database.js
 *
 * This file contains database related globals.
 *
 * The database and collection connections is instantiated locally in each module,
 * this file contains the collection names and other application specific globals.
 */

///
// Globals.
///
const globals = {
	"collections": {
		"data": {
			"name": module.context.configuration.data_coll_name,
			"index": []
		},
		"dataset": {
			"name": module.context.configuration.dataset_coll_name,
			"index": []
		}
	},
	"edges": {},
	"views": {
		"data_view": {
			"name": module.context.configuration.data_view_name,
			"type": "arangosearch",
			"properties": {
				"links": {
					"data": {
						"analyzers": [
							"identity"
						],
						"fields": {
							"std_date": {},
							"std_dataset_id": {},
							"gcu_id_number": {
								"analyzers": [
									"text_en",
									"identity"
								]
							},
							"chr_tree_code": {},
							"geometry": {
								"analyzers": [
									"geojson"
								]
							},
							"species": {
								"analyzers": [
									"text_en",
									"identity"
								]
							}
						},
						"includeAllFields": false,
						"storeValues": "id",
						"trackListPositions": false
					}
				}
			}
		},
		"dataset_view": {
			"name": module.context.configuration.dataset_view_name,
			"type": "arangosearch",
			"properties": {
				"links": {
					"dataset": {
						"analyzers": [
							"identity"
						],
						"fields": {
							"_key": {},
							"std_project": {},
							"std_dataset": {},
							"std_dataset_group": {},
							"std_date_end": {},
							"std_date_start": {},
							"std_date_submission": {},
							"count": {},
							"_collection": {},
							"_subject": {},
							"_subjects": {},
							"_classes": {},
							"_domain": {},
							"_tag": {},
							"_title": {
								"fields": {
									"iso_639_3_eng": {
										"analyzers": [
											"text_en",
											"identity"
										]
									}
								}
							},
							"_description": {
								"fields": {
									"iso_639_3_eng": {
										"analyzers": [
											"text_en",
											"identity"
										]
									}
								}
							},
							"_citation": {
								"fields": {
									"iso_639_3_eng": {
										"analyzers": [
											"text_en",
											"identity"
										]
									}
								}
							},
							"species_list": {
								"analyzers": [
									"text_en",
									"identity"
								]
							},
							"std_terms": {},
							"std_terms_key": {},
							"std_terms_quant": {},
							"std_terms_summary": {}
						},
						"includeAllFields": false,
						"storeValues": "id",
						"trackListPositions": false
					}
				}
			}
		}
	}
}

///
// Collections.
///
const documentCollections = {
	"data": module.context.configuration.data_coll_name,
	"dataset": module.context.configuration.dataset_coll_name,
}

const documentViews = {
	"data_view": module.context.configuration.data_view_name,
	"dataset_view": module.context.configuration.dataset_view_name
}

const edgeCollections = {}

///
// Exports.
///
module.exports = {
	documentCollections,
	documentViews,

	edgeCollections,

	globals
}


// Warning: requests below are going to be executed in parallel

// request Query 
(function(callback) {
    'use strict';
        
    const httpTransport = require('http');
    const responseEncoding = 'utf8';
    const httpOptions = {
        hostname: 'localhost',
        port: '8529',
        path: '/_db/EUFGIS/chr/dataset/query?op=AND',
        method: 'POST',
        headers: {"Content-Type":"application/json; charset=utf-8","Cookie":"FOXXSID=null; FOXXSID.sig=659130347e9eb043443995f5b9aef83b6238df078ef297696fdd33b56bd7b0cb"}
    };
    httpOptions.headers['User-Agent'] = 'node ' + process.version;
 
    // Paw Store Cookies option is not supported

    const request = httpTransport.request(httpOptions, (res) => {
        let responseBufs = [];
        let responseStr = '';
        
        res.on('data', (chunk) => {
            if (Buffer.isBuffer(chunk)) {
                responseBufs.push(chunk);
            }
            else {
                responseStr = responseStr + chunk;            
            }
        }).on('end', () => {
            responseStr = responseBufs.length > 0 ? 
                Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;
            
            callback(null, res.statusCode, res.headers, responseStr);
        });
        
    })
    .setTimeout(0)
    .on('error', (error) => {
        callback(error);
    });
    request.write("{\"_key\":[\"8194f5d7-b446-4dbc-b218-98fd2cb61091\",\"8194f5d7-b446-4dbc-b218-98fd2cb61093\",\"8194f5d7-b446-4dbc-b218-98fd2cb61094\"],\"std_project\":[\"FORGENIUS\"],\"std_dataset\":\"%WP1_MODEL\",\"std_date\":{\"std_date_start\":\"1949\",\"std_date_end\":\"2023\"},\"std_date_submission\":{\"min\":\"2023\",\"max\":\"20231231\"},\"_title\":\"risk vulnerability FORGENIUS D4.3\",\"_description\":\"4TREE Axiom assay Dufr\\u00eane monthly\",\"count\":{\"min\":20,\"max\":100000},\"_subject\":[\"chr_subject_stand\"],\"_subjects\":[\"chr_subject_stand\"],\"_classes\":{\"items\":[\"_class_time\",\"_class_quantity\",\"_class_quantity_averaged\"],\"doAll\":false},\"_domain\":{\"items\":[\"chr_gent\",\"chr_envi\",\"chr_model\"],\"doAll\":false},\"species_list\":\"sylvatica Quercus Pinus\",\"std_terms\":{\"items\":[\"chr_ExpHet\",\"chr_AvYearDroughtIdx\",\"chr_LandSurfTemp\"],\"doAll\":false},\"std_terms_quant\":{\"items\":[\"chr_AvGrossPrimProd\",\"chr_AvYearDroughtIdx\",\"chr_ExpHet\"],\"doAll\":false},\"std_terms_key\":{\"items\":[\"gcu_id_number\",\"std_date\"],\"doAll\":true},\"std_terms_summary\":{\"items\":[\"gcu_id_number\",\"std_date\"],\"doAll\":true}}")
    request.end();
    

})((error, statusCode, headers, body) => {
    console.log('ERROR:', error); 
    console.log('STATUS:', statusCode);
    console.log('HEADERS:', JSON.stringify(headers));
    console.log('BODY:', body);
});

// request Summary 
(function(callback) {
    'use strict';
        
    const httpTransport = require('http');
    const responseEncoding = 'utf8';
    const httpOptions = {
        hostname: 'localhost',
        port: '8529',
        path: '/_db/EUFGIS/chr/dataset/qual?key=8194f5d7-b446-4dbc-b218-98fd2cb61091',
        method: 'GET',
        headers: {"Cookie":"FOXXSID=null; FOXXSID.sig=659130347e9eb043443995f5b9aef83b6238df078ef297696fdd33b56bd7b0cb"}
    };
    httpOptions.headers['User-Agent'] = 'node ' + process.version;
 
    // Paw Store Cookies option is not supported

    const request = httpTransport.request(httpOptions, (res) => {
        let responseBufs = [];
        let responseStr = '';
        
        res.on('data', (chunk) => {
            if (Buffer.isBuffer(chunk)) {
                responseBufs.push(chunk);
            }
            else {
                responseStr = responseStr + chunk;            
            }
        }).on('end', () => {
            responseStr = responseBufs.length > 0 ? 
                Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;
            
            callback(null, res.statusCode, res.headers, responseStr);
        });
        
    })
    .setTimeout(0)
    .on('error', (error) => {
        callback(error);
    });
    request.write("")
    request.end();
    

})((error, statusCode, headers, body) => {
    console.log('ERROR:', error); 
    console.log('STATUS:', statusCode);
    console.log('HEADERS:', JSON.stringify(headers));
    console.log('BODY:', body);
});

// request Update 
(function(callback) {
    'use strict';
        
    const httpTransport = require('http');
    const responseEncoding = 'utf8';
    const httpOptions = {
        hostname: 'localhost',
        port: '8529',
        path: '/_db/EUFGIS/chr/dataset/update',
        method: 'PUT',
        headers: {"Content-Type":"application/json; charset=utf-8","Cookie":"FOXXSID=null; FOXXSID.sig=659130347e9eb043443995f5b9aef83b6238df078ef297696fdd33b56bd7b0cb"}
    };
    httpOptions.headers['User-Agent'] = 'node ' + process.version;
 
    // Paw Store Cookies option is not supported

    const request = httpTransport.request(httpOptions, (res) => {
        let responseBufs = [];
        let responseStr = '';
        
        res.on('data', (chunk) => {
            if (Buffer.isBuffer(chunk)) {
                responseBufs.push(chunk);
            }
            else {
                responseStr = responseStr + chunk;            
            }
        }).on('end', () => {
            responseStr = responseBufs.length > 0 ? 
                Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;
            
            callback(null, res.statusCode, res.headers, responseStr);
        });
        
    })
    .setTimeout(0)
    .on('error', (error) => {
        callback(error);
    });
    request.write("[\"8194f5d7-b446-4dbc-b218-98fd2cb61091\"]")
    request.end();
    

})((error, statusCode, headers, body) => {
    console.log('ERROR:', error); 
    console.log('STATUS:', statusCode);
    console.log('HEADERS:', JSON.stringify(headers));
    console.log('BODY:', body);
});

// request Scan 
(function(callback) {
    'use strict';
        
    const httpTransport = require('http');
    const responseEncoding = 'utf8';
    const httpOptions = {
        hostname: 'localhost',
        port: '8529',
        path: '/_db/EUFGIS/chr/data?dataset=8194f5d7-b446-4dbc-b218-98fd2cb61091&start=0&limit=25',
        method: 'GET',
        headers: {"Cookie":"FOXXSID=null; FOXXSID.sig=659130347e9eb043443995f5b9aef83b6238df078ef297696fdd33b56bd7b0cb"}
    };
    httpOptions.headers['User-Agent'] = 'node ' + process.version;
 
    // Paw Store Cookies option is not supported

    const request = httpTransport.request(httpOptions, (res) => {
        let responseBufs = [];
        let responseStr = '';
        
        res.on('data', (chunk) => {
            if (Buffer.isBuffer(chunk)) {
                responseBufs.push(chunk);
            }
            else {
                responseStr = responseStr + chunk;            
            }
        }).on('end', () => {
            responseStr = responseBufs.length > 0 ? 
                Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;
            
            callback(null, res.statusCode, res.headers, responseStr);
        });
        
    })
    .setTimeout(0)
    .on('error', (error) => {
        callback(error);
    });
    request.write("")
    request.end();
    

})((error, statusCode, headers, body) => {
    console.log('ERROR:', error); 
    console.log('STATUS:', statusCode);
    console.log('HEADERS:', JSON.stringify(headers));
    console.log('BODY:', body);
});

// request Summary 
(function(callback) {
    'use strict';
        
    const httpTransport = require('http');
    const responseEncoding = 'utf8';
    const httpOptions = {
        hostname: 'localhost',
        port: '8529',
        path: '/_db/EUFGIS/chr/data/stat?dataset=8194f5d7-b446-4dbc-b218-98fd2cb61097&stat=MAX&summary=gcu_id_number',
        method: 'GET',
        headers: {"Cookie":"FOXXSID=null; FOXXSID.sig=659130347e9eb043443995f5b9aef83b6238df078ef297696fdd33b56bd7b0cb"}
    };
    httpOptions.headers['User-Agent'] = 'node ' + process.version;
 
    // Paw Store Cookies option is not supported

    const request = httpTransport.request(httpOptions, (res) => {
        let responseBufs = [];
        let responseStr = '';
        
        res.on('data', (chunk) => {
            if (Buffer.isBuffer(chunk)) {
                responseBufs.push(chunk);
            }
            else {
                responseStr = responseStr + chunk;            
            }
        }).on('end', () => {
            responseStr = responseBufs.length > 0 ? 
                Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;
            
            callback(null, res.statusCode, res.headers, responseStr);
        });
        
    })
    .setTimeout(0)
    .on('error', (error) => {
        callback(error);
    });
    request.write("")
    request.end();
    

})((error, statusCode, headers, body) => {
    console.log('ERROR:', error); 
    console.log('STATUS:', statusCode);
    console.log('HEADERS:', JSON.stringify(headers));
    console.log('BODY:', body);
});

// request Query 
(function(callback) {
    'use strict';
        
    const httpTransport = require('http');
    const responseEncoding = 'utf8';
    const httpOptions = {
        hostname: 'localhost',
        port: '8529',
        path: '/_db/EUFGIS/chr/data/query?dataset=291ea3ef-8fbc-409b-a1c1-9a898eb1af3a&op=AND&start=0&limit=25',
        method: 'POST',
        headers: {"Content-Type":"text/plain; charset=utf-8","Cookie":"FOXXSID=null; FOXXSID.sig=659130347e9eb043443995f5b9aef83b6238df078ef297696fdd33b56bd7b0cb"}
    };
    httpOptions.headers['User-Agent'] = 'node ' + process.version;
 
    // Paw Store Cookies option is not supported

    const request = httpTransport.request(httpOptions, (res) => {
        let responseBufs = [];
        let responseStr = '';
        
        res.on('data', (chunk) => {
            if (Buffer.isBuffer(chunk)) {
                responseBufs.push(chunk);
            }
            else {
                responseStr = responseStr + chunk;            
            }
        }).on('end', () => {
            responseStr = responseBufs.length > 0 ? 
                Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;
            
            callback(null, res.statusCode, res.headers, responseStr);
        });
        
    })
    .setTimeout(0)
    .on('error', (error) => {
        callback(error);
    });
    request.write("{\n  \"gcu_id_number\": \"ESP00179\",\n  \"std_date\": {\n    \"std_date_start\": \"2022\",\n    \"std_date_end\": \"20221231\"\n  },\n  \"species\": \"sylvatica\",\n  \"chr_tree_code\": [\n    \"ESP00179-007\"\n  ]\n}")
    request.end();
    

})((error, statusCode, headers, body) => {
    console.log('ERROR:', error); 
    console.log('STATUS:', statusCode);
    console.log('HEADERS:', JSON.stringify(headers));
    console.log('BODY:', body);
});

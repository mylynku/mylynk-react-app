const mongoose = require("mongoose");
const fs = require("fs");
const pathModule = require("path");
const schemaMapper = new Map(); 

function loadModels() {
    fs.readdirSync(__dirname).forEach((file) => {
        if (file === "index.js") return;
        const { modelName, getSchema } = require(pathModule.join(__dirname, file));
        schemaMapper.set(modelName, getSchema(mongoose));
    })
}

loadModels();
module.exports = schemaMapper;
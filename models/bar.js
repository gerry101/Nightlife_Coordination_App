var mongoose = require('mongoose');

var barSchema = new mongoose.Schema({
   name: String,
   isGoing: Number
});

module.exports = mongoose.model('Bar', barSchema);
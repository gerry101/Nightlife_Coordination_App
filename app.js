var bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    express = require('express'),
    app = express();

var indexRoutes = require('./routes/index');

//mongoose.connect('mongodb://localhost/nightlife');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

app.use(indexRoutes);

app.set('view engine', 'ejs');


var port = process.env.PORT || 3000;
app.listen(port, function() {
   console.log('Server running...'); 
});
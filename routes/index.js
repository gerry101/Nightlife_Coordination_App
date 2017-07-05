'use strict';
var User       = require('../models/user'),
    middleware = require('../middleware'),
    Bar        = require('../models/bar'),
    yelp       = require('yelp-fusion'),
    express    = require('express'),
    router     = express.Router();

router.get('/', function(req, res) {
   res.render('landing'); 
});

router.get('/bars', middleware.isLoggedIn, function(req, res) {
    if (req.query.loctn) {
        var barNames = [];
        var businessData = [];
        const client = yelp.client(process.env.CLIENT);
 
        client.search({
          term:'Bar',
          location: req.query.loctn
        }).then(response => {
          response.jsonBody.businesses.forEach(function(business) {
             var isGoingBool = false;
             req.user.bars.forEach(function(bar) {
                if(business.name === bar.name) {
                    isGoingBool = true;
                } 
             });
             var isGoingValue = 0;
             Bar.find({}, function(err, bars) {
                 if(err) {
                     req.flash('error', 'An error seems to have occurred');
                     return res.redirect('/');
                 }
                 bars.forEach(function(bar) {
                    barNames.push(bar.name);
                 });
                 if(barNames.includes(business.name)) {
                     Bar.findOne({name: business.name}, function(err, bar) {
                        if(err) {
                            req.flash('error', 'An error seems to have occurred');
                            return res.redirect('/');
                        }
                         isGoingValue = bar.isGoing;
                     });
                 }   
             });
             setTimeout(function(){
             var data = {
                 name: business.name,
                 image: business.image_url,
                 isClosed: business.is_closed,
                 url: business.url,
                 displayAddress: business.location. display_address[0] + 
                                 ', ' +
                                 business.location. display_address[1],
                 isGoing: isGoingValue,
                 isGoingBool: isGoingBool
             }
             businessData.push(data);
             }, 3000);
          });
            setTimeout(function(){
            res.render('show', {businessData: businessData, location: req.query.loctn});
            }, 3500);
        }).catch(e => {
          req.flash('error', 'An error seems to have occurred');
          return res.redirect('/');
        });
   } else {
       res.render('landing');
   }
});

router.get('/bar/:business/add', middleware.isLoggedIn, function(req, res) {
    Bar.find({}, function(err, bars) {
        if(err) {
           req.flash('error', 'An error seems to have occurred');
           return res.redirect('/');
       } 
       var barNames = [];
       bars.forEach(function(bar) {
          barNames.push(bar.name); 
       });
        if(barNames.includes(req.params.business)) {
            Bar.findOne({name: req.params.business}, function(err, oneBar) {
               if(err) {
                   req.flash('error', 'An error seems to have occurred');
                   return res.redirect('/');
               } 
                oneBar.isGoing = (Number(oneBar.isGoing) + 1);
                oneBar.save();
                req.user.bars.push(oneBar);
                req.user.save();
            });
        } else {
            var barInfo = {
                name: req.params.business,
                isGoing: 1
            };
            Bar.create(barInfo, function(err, barCreated) {
               if(err) {
                   req.flash('error', 'An error seems to have occurred');
                   return res.redirect('/');
               } 
                req.user.bars.push(barCreated);
                req.user.save();
            }); 
        }
       res.redirect('back');
    });
});

router.get('/bar/:business/remove', middleware.isLoggedIn, function(req, res) {
    Bar.findOne({name: req.params.business}, function(err, oneBar) {
       var barName = oneBar.name;
       if(err) {
           console.log('error');
           return res.redirect('/');
       } 
        oneBar.isGoing = (Number(oneBar.isGoing) - 1);
        if(oneBar.isGoing < 0) {
            oneBar.isGoing = 0;
        }
        oneBar.save();
        var userId = req.user._id;
        var barName = oneBar.name;
        User.update({_id: userId}, { "$pull": { "bars": { "name": barName} }}, { safe: true, multi:true }, function(err, obj) {
            if(err) {
                console.log('error');
                return res.redirect('/');
            }
        });
        setTimeout(function(){
            res.redirect('back');
        }, 3000);
    });
});


module.exports = router;
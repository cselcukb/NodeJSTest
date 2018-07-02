var express = require('express');
var router = express.Router();
// Init Sequelize
const Sequelize = require('sequelize');
// Init Passport - Passport gibi gerekli kütüphaneleri çağır
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , bCrypt = require('bcryptjs');
// Get DB Connection Variable - DB Bağlantısını al
var sequelize = require('../config/db');
//Get DB Entities - DB leri getir
var User = require('../database/user');
var Event = require('../database/event');
var UserCountry = require('../database/user_country');
var Country = require('../database/country');

passport.use(new LocalStrategy({
        usernameField: 'email',    // define the parameter in req.body that passport can use as username and password
        passwordField: 'password',
        session: true
    },
    function(username, password, done) {
        User.findOne({ where : { email: username } }).then(function (User){
            if (!User) { return done(null, false); }
            if( !isValidPassword(User, password) ) {
                return done(null, false, { message: 'Hatalı Şifre' });
            };
            if(!User.is_active){
                return done(null, false, { message: 'Kullanıcı Aktif Değil' });
            }
            return done(null, User);
        }).catch(function(e){
            console.log(e);
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id).then(function(user) {
        // Get User from Session Id
        if (user) {
            done(null, user.get());
        } else {
            done(user.errors, null);
        }
    });
});

function isValidPassword(user, password){
    return bCrypt.compareSync(password, user.password);
}

/* GET home page. */
router.get('/', function(req, res, next) {
    if( !req.isAuthenticated() ){
        res.redirect('/login');
    }
    UserCountry.findAll({where: { 'user_id': req.user.id } }).then(function (UserCountry) {
        getUserEvents(UserCountry, function (UserEvents) {
            res.render('index', { title: 'Anasayfa', events: UserEvents });
        })
    }).catch(function (e) {

    });
});

/* GET signup page. */
router.get('/signup', function(req, res, next) {
    if( req.isAuthenticated() ){
        res.redirect('/login');
    }else{
        res.render('signup', { title: 'Kayıt Ol' });
    }
});

/* POST signup page. */
router.post('/signup',
    function(req, res) {
        if( req.isAuthenticated() ){
            res.redirect('/');
        }
        bCrypt.hash(req.body.password, 10, (err, hash) => {
            User.create({
                email: req.body.email,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                password: hash,
                is_active: 1
            })
                .then(function(User) {
                    // your user assertions
                    console.log(User);
                    res.redirect('/');
                });
        });
    });

/* GET login page. */
router.get('/login', function(req, res, next) {
    if( req.isAuthenticated() ){
        res.redirect('/');
    }else{
        res.render('login', { title: 'Kullanıcı Girişi' });
    }
});

/* POST login page. */
router.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }), function(req, res, next) {
        res.redirect('/');
});

/* GET Settings page. */
router.get('/settings', function(req, res, next) {
    if( req.isAuthenticated() ){
        Country.findAll( ).then(function (Country){
            UserCountry.findAll({ attributes: ['country_id'] , where : { user_id: req.user.id }, raw: true }).then(function (UserCountry){
                var user_countries = [];
                for( UserCountryItem in UserCountry ){
                    user_countries.push(UserCountry[UserCountryItem].country_id);
                }
                res.render('settings', { title: 'Ayarlar', countries: Country, user_countries: user_countries });
            }).catch(function(e){
                console.log(e);
            });
        }).catch(function(e){
            console.log(e);
        });
    }else{
        res.redirect('/login');
    }
});

/* POST settings page. */
router.post('/settings', function(req, res, next) {
    if( req.isAuthenticated() ){
        if( req.body.user_country ){
            sequelize
                .query(
                    'DELETE FROM user_country WHERE user_id = ?',
                    { raw: true, replacements: [req.user.id] }
                )
                .then(
                    function ( ) {
                        req.body.user_country.forEach(function (element) {
                            UserCountry.create({
                                user_id: req.user.id,
                                country_id: element,
                            })

                        });
                    }).then(function () {
                Country.findAll().then(function (Country) {
                    res.render('settings', { title: 'Ayarlar', countries: Country, user_countries: req.body.user_country });
                });
            });
        }else{
            return res.json(200, {message: 'post verisi gereklidir!'});
        }
    }else{
        res.redirect('/login');
    }
});

function getUserEvents(userCountry, callback){
    var total_events = [];
    var evaluated_countries = 0;
    var total_countries = userCountry.length;
    for( userCountryItem in userCountry ){
        Event.findAll({where: {'country_id': userCountry[userCountryItem].country_id }}).then(function(events){
            evaluated_countries++;
            for( eventItem in events ){
                total_events.push( events[eventItem] );
            }
            if( evaluated_countries == total_countries ){
                callback(total_events);
            }
        }).catch(function (e) {
            console.log(e);
        });
    }
}

module.exports = router;

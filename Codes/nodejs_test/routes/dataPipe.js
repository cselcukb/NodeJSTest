var express = require('express');
var router = express.Router();
const rp = require('request-promise');
const cheerio = require('cheerio');
const Sequelize = require('sequelize');
var settings = require('../config/settings');
var Country = require('../database/country');
var Event = require('../database/event');

/* GET Scrape All New Event. */
router.get('/scraper/getNewEventData', function(req, res, next) {
  //res.send('respond with a resource');
});

/* GET Scrape All Events. */
router.get('/scraper/getAllEventData', function(req, res, next) {
    getCountryEvents(function(events){
        getCountryEventDetails(events, function (eventsWithDetails) {
            var totalInserts = 0;
            for( EventItem in eventsWithDetails ){
                Event.create({
                    country_id: eventsWithDetails[EventItem].country_id,
                    event_site_id:  eventsWithDetails[EventItem].event_site_id,
                    event_name:  eventsWithDetails[EventItem].event_name,
                    event_price:  eventsWithDetails[EventItem].event_price,
                    event_date:  eventsWithDetails[EventItem].event_date,
                    event_location:  eventsWithDetails[EventItem].event_location,
                    event_link: eventsWithDetails[EventItem].event_link,
                }).then(function (){
                    totalInserts++;
                    if( totalInserts == eventsWithDetails.length ){
                        return res.json({'İşlem Tamamlandı': 1});
                    }
                })
            }
        })
    })


});

/* GET Scrape All New Event Details. */
router.get('/scraper/getNewEventDetailData', function(req, res, next) {
    //res.send('respond with a resource');
});

/* GET Scrape All Event Details. */
router.get('/scraper/getAllEventDetailData', function(req, res, next) {
    //res.send('respond with a resource');
});

/* GET Scrape All New Event by Country. */
router.get('/scraper/getNewEventDataByCountry', function(req, res, next) {
    //res.send('respond with a resource');
});

/* GET Scrape All Events by Country. */
router.get('/scraper/getAllEventDataByCountry', function(req, res, next) {
    //res.send('respond with a resource');
});

/* GET Scrape All New Event Details by Country. */
router.get('/scraper/getNewEventDetailDataByCountry', function(req, res, next) {
    //res.send('respond with a resource');
});

/* GET Scrape All Event Details by Country. */
router.get('/scraper/getAllEventDetailDataByCountry', function(req, res, next) {
    //res.send('respond with a resource');
});

function scrape_uri(url, callback){
    var options = {
        uri: url,
        transform: function (body) {
            return cheerio.load(body);
        }
    };
    rp(options)
        .then(($) => {
            callback($);
        })
        .catch((err) => {
            console.log(err);
        });
}

function parse_country_events(cheerio, country_id, callback){
    var function_resp = {};
    var events = [];
    var events_block = cheerio('#events');
    events_block.find('.panel').each(function (i, elem) {
        if(elem){
            elem_content = cheerio(elem).find('.content');
            var event_basics = {};
            var event_link = elem_content.find('a');
            /*
            var event_link_href = event_link.attr('href');
            var event_name = event_link.find('h3').html();
            events.push(event_link_href);
            events.push(event_name);
            */
            event_basics.event_link = event_link.attr('href');
            event_basics.event_name = event_link.find('h3').html();
            events.push(event_basics);
        }
    })
    function_resp.country_id = country_id;
    function_resp.events = events;
    callback(function_resp);
}

function parse_event_details(cheerio, callback){
    var event_details = {};
    var schedule_block = cheerio('#schedule');
    var event_block = cheerio('.event-startpage');
    event_block = event_block.find('.container .row .col-sm-4');
    var event_location = event_block.find('.panel-inverted').first()
    event_location = event_location.find('.location').text();
    event_location = event_location.replace(/ /g,'');
    event_location = event_location.replace(/\n\s*\n/g, '\n');
    var event_price = event_block.find('.panel-inverted').last().text();
    event_price = event_price.replace("Register",'');
    event_price = event_price.replace("Entries",'');
    event_price = event_price.replace(/\n\s*\n/g, '\n');
    event_price = event_price.replace(/  +/g,' ');
    var event_schedule = schedule_block.find('.item.date.event');
    event_schedule = event_schedule.find('.dates');
    event_schedule = event_schedule.html();
    event_schedule = event_schedule.split('-');
    event_schedule = event_schedule[0];
    // Events on Multiple Days Skipped - Bir çok gün süren olaylar atlandı, tek gün baz
    event_schedule = event_schedule.replace(/\n/g,'');
    event_schedule = event_schedule.trim();
    event_schedule = event_schedule.split(' ');
    event_schedule = event_schedule[1] + " " + event_schedule[0] + " 2018";
    event_schedule = event_schedule.replace(/\n\s*\n/g, '\n')
    event_details.location = event_location;
    event_details.price = event_price;
    event_details.date = event_schedule;
    callback(event_details);
}

function getCountryEvents(callback){
    var events = [];
    var total_parsed_events = 0;
    Country.findAll().then(function(Country){
        for( CountryItem in Country ){
            (function(CountryItem){
                scrape_uri(settings.events_by_country_base_uri + '/' + Country[CountryItem].country_iso, function(cheerio){
                    parse_country_events(cheerio, Country[CountryItem].country_id, function(events_parse_resp){
                        total_parsed_events++;
                        if(events_parse_resp.events.length){
                            for( EventItem in events_parse_resp.events ){
                                var event = {};
                                event.country_id = events_parse_resp.country_id;
                                event.event_link = events_parse_resp.events[EventItem].event_link;
                                event.event_name = events_parse_resp.events[EventItem].event_name;
                                events.push(event);
                            }
                        }
                        if( total_parsed_events == Country.length ){
                            callback(events);
                            return null;
                        }
                    })
                })
            })(CountryItem);
        }
    }).catch(function(e){
        console.log(e);
    });
}

function getCountryEventDetails(events, callback){
    var eventsWithDetails = [];
    var total_parsed_events = 0;
    for( EventItem in events ){
        (function (EventItem) {
            scrape_uri(events[EventItem].event_link, function (cheerio) {
                parse_event_details(cheerio, function(event_detail){
                    total_parsed_events++;
                    var event_link_pieces = events[EventItem].event_link.split('/');
                    var event_id = event_link_pieces[ event_link_pieces.length - 1 ];
                    var event = {};
                    event.country_id = events[EventItem].country_id;
                    event.event_site_id = event_id;
                    event.event_name = events[EventItem].event_name;
                    event.event_price = event_detail.price;
                    event.event_date = event_detail.date;
                    event.event_location = event_detail.location;
                    event.event_link = events[EventItem].event_link;
                    eventsWithDetails.push(event);
                    if( total_parsed_events == events.length ){
                        callback(eventsWithDetails);
                        return null;
                    }
                })
            });
        })(EventItem);
    }
}

module.exports = router;

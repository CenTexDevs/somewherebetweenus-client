
var _ = require('request');

var port = process.env.PORT || 3000;
var express = require('express');
var server = express();
var yelp = require('yelp').createClient({
    consumer_key: 'f6TEXZpl19BGpCmvj4sFsA',
    consumer_secret: 'Tc5rr4kO49xrWjif6CGC-zDt5Q8',
    token: 'nW7K79xxVHQKKRVJGB30UyGAbTlwjZD_',
    token_secret: 'c4QpX-2fI4vv9DkkowQvg1UojJg'
});

var workflowStep = 0;
var markerResults = {
    people:[],
    venues:[]
};

server.use(express.static(__dirname + '/client'));

server.get('/markers', function(req, res) {

        workflowStep = 0;
        markerResults = {
            people:[],
            venues:[]
        };

        workflow(req,res);
});

function workflow(req,res)
{
    var step = workflowStep++;
    console.log('in workflow:' + step);
    //get coordinates of address 1, add marker (google)
    //get coordinate of address 2. add marker (google)
    //get mid-point between the coordinates of address1 and address2
    //find 5 venues near the mid-point (yelp)
    //get coordinates of venues, add marker for each (google)

    switch (step) {
        case 0:
            getPersonLocation(req,res);
            break;
        case 1:
            getPersonLocation(req,res);
            break;
        case 2:
            searchVenues(req,res);
            break;
        case 3:
            geolocateVenues(req,res);
            break;
        case 4:
            res.write(JSON.stringify(markerResults));
            res.end();
            break;
    }
    return;

}

function getPersonLocation(req,res) {
    console.log('in getPersonLocation');
    var request = require("request");

    var urlPrefix="http://maps.googleapis.com/maps/api/geocode/json?address=";
    var address = "";

    switch (markerResults.people.length) {
        case 0:
            address = req.query.address1;
            break;
        case 1:
            address = req.query.address2;
            break;
    }
    console.log("address:" + address);
    request(urlPrefix+address, function(error, response, body) {
        var obj = JSON.parse(body);
        markerResults.people.push({coordinates:{latitude:(obj.results[0].geometry.location.lat),longitude:(obj.results[0].geometry.location.lng)}});
        workflow(req,res);
        return;
    });
}

function searchVenues(req,res) {
    console.log('in searchVenues');

    var coordinate1 = markerResults.people[0].coordinates;
    var coordinate2 = markerResults.people[1].coordinates;
    var midLatitude = (coordinate1.latitude + coordinate2.latitude)/2;
    var midLongitude = (coordinate1.longitude + coordinate2.longitude)/2;

    var midCoordinate = {latitude:midLatitude,longitude:midLongitude};

    var yelp = require("yelp").createClient({
        consumer_key: "f6TEXZpl19BGpCmvj4sFsA",
        consumer_secret: "Tc5rr4kO49xrWjif6CGC-zDt5Q8",
        token: "nW7K79xxVHQKKRVJGB30UyGAbTlwjZD_",
        token_secret: "c4QpX-2fI4vv9DkkowQvg1UojJg"
    });

    var location=midCoordinate.latitude+","+midCoordinate.longitude;
    var term=req.query.venueType;

    yelp.search({term: term, ll:location, limit:"5"}, function(error, data) {
        function TransformYelpResults(yelpBusiness) {
            console.log(yelpBusiness);
            return {
                name:yelpBusiness.name,
                imageUrl:yelpBusiness.image_url,
                mobile_url: yelpBusiness.mobile_url,
                address: yelpBusiness.location.address + ", "+yelpBusiness.location.city+", "+yelpBusiness.location.state_code+" "+yelpBusiness.location.postal_code,
                display_phone: yelpBusiness.display_phone,
                url:yelpBusiness.url
            };
        }

        var venues = data.businesses.map(TransformYelpResults);
        for (var i = 0; i < venues.length; i++) {
            console.log('venue:'+i);
            var venue = {
                name:venues[i].name,
                imageUrl:venues[i].imageUrl,
                mobile_url:venues[i].mobile_url,
                address : venues[i].address,
                display_phone: venues[i].display_phone,
                phone: venues[i].phone,
                url:venues[i].url,
                coordinates:null
            };
            console.log(venue.name);
            markerResults.venues.push(venue);
        }
        workflow(req,res);
    });

}

function geolocateVenues(req,res) {
    console.log('in geolocateVenues');
    var request = require("request");

    var urlPrefix="http://maps.googleapis.com/maps/api/geocode/json?address=";

    for (var i = 0; i < markerResults.venues.length; i++) {
        var address=markerResults.venues[i].address;
        var params = {index:i, request:req, response:res};
        request(urlPrefix+address, function(error, response, body) {
            var obj = JSON.parse(body);
            markerResults.venues[this.index].coordinates = {latitude:(obj.results[0].geometry.location.lat),longitude:(obj.results[0].geometry.location.lng)};
            var continueWorkflow = true;
            for (var j = 0; j < markerResults.venues.length; j++){
                if (markerResults.venues[j].coordinates === null || markerResults.venues[j].coordinates === null)
                {
                    console.log('stopping workflow'+this.index);
                    continueWorkflow = continueWorkflow && false;
                }
            }
            console.log(continueWorkflow);
            if (continueWorkflow === true)
                workflow(this.request,this.response);

            //all venues have coordinates
            return;
        }.bind(params));
    }
}

server.listen(port, function () {
    console.log('Listening on port %d', port);
});

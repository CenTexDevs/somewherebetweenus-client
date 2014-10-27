(function () {
    'use strict';

    var map;
    var markersArray = [];
    var infoWindowsArray = [];

    var meetupController = function ($window, $scope, $http) {

        function init() {

            var mapCanvas = document.getElementById('map_canvas');
            var mapOptions = {
                center: new google.maps.LatLng(30.5403, -97.5463),
                zoom: 8, mapTypeId: google.maps.MapTypeId.ROADMAP };
            map = new google.maps.Map(mapCanvas, mapOptions);
        }

        init();

        $scope.venues = [
            {name:'coffee'},
            {name:'restaurants'},
            {name:'theaters'}
        ];
        $scope.myVenue = $scope.venues[0]; // coffee default

        $scope.doMappings = function doMappings() {

            function successCallback(data) {
                var latsSum = 0;
                var longsSum = 0;
                var count = 0;

                for (var i = 0; i < data.venues.length; i++) {
                    console.log(data.venues[i].name);
                    plotVenue(data.venues[i]);
                    latsSum = latsSum +
                        data.venues[i].coordinates.latitude;
                    longsSum = longsSum +
                        data.venues[i].coordinates.longitude;
                    count++;
                }

                var avgLat = latsSum / count;
                var avgLong = longsSum / count;
                var latlng = new google.maps.LatLng(avgLat, avgLong);
                map.setCenter(latlng);
            }

            deleteOverlays();

            $http({
                url: '/markers',
                method: "GET",
                params: {address1: $scope.address1, address2: $scope.address2, venueType: $scope.myVenue}
            }).success(successCallback);
        };

        function plotVenue(venue) {
            addMarker(venue);
        }


        function addMarker(venue) {

            var contentString = '<div style="text-align:left;width:320px">' +
                '<img style="float:left;margin-right:5px" src="' + venue.imageUrl + '"/>' +
                '<a target=_blank href="' + venue.url + '"><h3>' + venue.name + '</h3></a>' +
                venue.address + '<br>' + venue.displayPhone + '<br></div>';

            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            infoWindowsArray.push(infowindow);

            var coords = new
                google.maps.LatLng(venue.coordinates.latitude, venue.coordinates.longitude);
            var marker = new google.maps.Marker({
                position: coords, map: map, title: venue.name
            });
            google.maps.event.addListener(marker, 'click', function () {
                closeInfoWindows();
                infowindow.open(map, marker);
            });
            markersArray.push(marker);
        }

        function closeInfoWindows() {
            var i;
            if (infoWindowsArray) {
                for (i in infoWindowsArray) {
                    infoWindowsArray[i].close();
                }
            }
        }

        // Deletes all markers in the array by removing references to them
        function deleteOverlays() {
            var i;
            if (markersArray) {
                for (i in markersArray) {
                    markersArray[i].setMap(null);
                }
                markersArray.length = 0;
            }
        }
    };

    meetupController.$inject = ['$window', '$scope', '$http'];

    angular.module('somewhereApp').controller('meetupController', meetupController);

})();


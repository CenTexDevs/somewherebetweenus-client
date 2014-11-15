(function () {
    'use strict';

    angular.module('somewhereApp', ['ngRoute'])
        .config(function ($routeProvider,$locationProvider) {
            $routeProvider
                .when('/',
                {
                    controller: 'meetupController',
                    templateUrl: 'app/meetup.html'
                })
                .otherwise({ redirectsTo: '/'});
	    $locationProvider.html5Mode(true);
        });
}());


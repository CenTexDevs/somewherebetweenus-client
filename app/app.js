(function () {
    'use strict';

    angular.module('somewhereApp', ['ngRoute'])
        .config(function ($routeProvider) {
            $routeProvider
                .when('/',
                {
                    controller: 'meetupController',
                    templateUrl: 'meetup.html'
                })
                .otherwise({ redirectsTo: '/'});
        });
}());


'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', ['ngRoute','ngStorage','ngMaterial'])
.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
	 $routeProvider.when('/',{
        templateUrl:'templates/index.html',
        controller: 'HomePage'
    });    
    $routeProvider.when('/test',{
        templateUrl:'templates/test.html',
        controller: 'HomePage'
    });
    $routeProvider.when('/signup',{
        templateUrl:'templates/signup.html',
        controller: 'SignupController'
    });

    $routeProvider.when('/signin',{
        templateUrl:'templates/signin.html',
        controller: 'SigninController'
    });

    $routeProvider.when('/dashboard',{
        templateUrl:'templates/dashboard.html',
        controller: 'DashboardController'
    });         
  
}])
.run(run);

    function run($rootScope, $http, $location, $localStorage) {
        // keep user logged in after page refresh
        if ($localStorage.currentUser) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + $localStorage.currentUser.token;
            $rootScope.globals = {
                  currentUser: {
                    user: $localStorage.currentUser.user,
                  }
            };
        }

        // redirect to login page if not logged in and trying to access a restricted page
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            var publicPages = ['/signin','/','/signup'];
            var restrictedPage = publicPages.indexOf($location.path()) === -1;
            if (restrictedPage && !$localStorage.currentUser) {
                $location.path('/signin');
            }
        });

        $rootScope.$on('$viewContentLoaded', function() {
            var cropper = new ytCropper("#playerWrapper", { idvid:"ZMJ2UJI4onI", width:'640', height:'390', minRange: 1});
        
        $("#generateButton").on("click",function(e)
        {
            e.preventDefault();
            $("#codigoGenerado").val(cropper.getEmbedLink());
        });
        
        $(cropper).on("onFirstHandleChange",function(e, handleValue){
            
            var time = toDefaultTime(handleValue);
            
            var valueString = showWithTwoDigits(time.minutes) + ":" + showWithTwoDigits(time.seconds);
            
            $("#startValue").val(valueString);
            updateCropSize();
        });
        
        $(cropper).on("onSecondHandleChange",function(e, handleValue){
            
            var time = toDefaultTime(handleValue);
            
            var valueString = showWithTwoDigits(time.minutes) + ":" + showWithTwoDigits(time.seconds);
            
            $("#endValue").val(valueString);
            updateCropSize();
        });
        
        $(cropper).on("onProgress",function(e, currentTime){
            
            var time = toDefaultTime(currentTime);
            
            var valueString = showWithTwoDigits(time.minutes) + ":" + showWithTwoDigits(time.seconds);
            
            $("#currentTimePlay").val(valueString);
        });
        
        $(cropper).on("onVideoPause",function(e,currentTime){
            console.log("Se pausa");
        });
        
        $(cropper).on("onVideoPlay",function(e,currentTime){
            console.log("Se reproduce");
        });

        function updateCropSize () {
            $("#cropSize").val( fromSeconds( Math.floor( toSeconds(checkInterval(rewriteInterval( $('#endValue').val() ))) - toSeconds(checkInterval(rewriteInterval( $('#startValue').val() ))) ), 'string') );
        }

        function fromSeconds(interval, tp) {
                var intv = {};

                var $hours = Math.floor(interval/(60*60));
                interval = interval - ($hours*60*60);
                var $minutes = Math.floor((interval)/60);
                interval = interval - ($minutes*60);
                var $seconds = interval;

                if($hours > 0){
                    intv.hours = putTwoDigit($hours);
                }
                intv.minutes = putTwoDigit($minutes);
                intv.seconds = putTwoDigit($seconds);

                switch (tp){
                    case 'string':
                        var str = '';
                        for(var tm in intv){
                            str += ':'+intv[tm].toString();
                        }
                        return str.slice(1);
                    break;
                    default:
                        return intv;
                    break
                }
}

    function toSeconds(interval) {
        var sec = 0;

        sec += parseInt(interval.hours)*60*60;
        sec += parseInt(interval.minutes)*60;
        sec += parseInt(interval.seconds);

        return sec;
    }

    function checkInterval(interval) {

    if(interval){
        var reg = /([0-9][0-9])|([0-9])/g;
        var match = interval.match(reg);

        if(match.length == 2 || match.length == 3){
            var $seconds,  $minutes, $hours;

            if(match.length == 2){
                $seconds = putTwoDigit(match[1]);
                $minutes = putTwoDigit(match[0]);
                $hours = '00';
            }
            if(match.length == 3){
                $seconds = putTwoDigit(match[2]);
                $minutes = putTwoDigit(match[1]);
                $hours = putTwoDigit(match[0]);
            }

            return cleanInterval({
                seconds: $seconds,
                minutes: $minutes,
                hours: $hours
            });
        } else {
            return false;
        }
    } else {
        return false;
    }
}

    function rewriteInterval(val) {
        val = (val)?((val != '')?val:0):0;

        val = val.toString().split(':');
        if(val.length > 1){
            val[val.length-1] = (val[val.length-1] != '')?val[val.length-1]:'00';

            for(var v in val){
                val[v] = putTwoDigit(val[v]);
            }

            return val.join(':');
        } else {
            val = val[0].toString().replace(/:/g, '');
            return '00:'+putTwoDigit(val);
        }
    }

    function putTwoDigit (no) {
        return (Math.abs(parseInt(no)) < 10)?'0'+Math.abs(parseInt(no)):Math.abs(parseInt(no));
    }

    function cleanInterval(param) {
    var $seconds = param.seconds;
    var $minutes = param.minutes;
    var $hours = param.hours;

    var getParts = function (sec, secondsDiff, minutesAverage) {
        if(Math.floor(sec/60) > 0){
            secondsDiff = sec - 60;
            minutesAverage += Math.floor(sec/60);
            sec = sec - 60;
            return getParts(sec, secondsDiff, minutesAverage);
        } else {
            return {
                value: sec,
                diff: secondsDiff,
                average: minutesAverage
            };
        }
    };

    var fixAverage = function (st, nd) {
        return (nd)?parseInt(st) + nd:st
    };

    return {
        seconds: getParts($seconds, 0, 0).value,
        minutes: fixAverage(getParts($minutes, 0, 0).value, getParts($seconds, 0, 0).average),
        hours: fixAverage($hours, getParts($minutes, 0, 0).average)
    }
}






        });
    }


app.directive('ngFiles', function ($parse) {
            function fn_link(scope, element, attrs) {
                var onChange = $parse(attrs.ngFiles);
                element.on('change', function (event) {
                    onChange(scope, { $files: event.target.files });
                });
            };

            return {
                link: fn_link
            }

});


app.service('authenticationService', function ($http,$localStorage,$rootScope) {

    this.register=function(user){

                return $http({
                        method: 'POST',
                        url: 'http://localhost:8000/api/auth/signup',
                        headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
                        data: $.param(user)
                        });
    };

    this.login=function(user){

                return $http({
                        method: 'POST',
                        url: 'http://localhost:8000/api/auth/login',
                        headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
                        data: $.param(user)
                        });
    };

    this.logout=function(){
                // remove user from local storage and clear http auth header
                $rootScope.globals = {

                };
                delete $localStorage.currentUser;
                $http.defaults.headers.common.Authorization = '';
    };

});

app.service('dashboardService', function ($http) {
    this.getUsers=function(){
                        return $http({
                        method: 'GET',
                        url: 'http://localhost:8000/api/users',
                        headers: { 'Content-Type' : 'application/x-www-form-urlencoded' }
                        });
    };

});

app.service('fileUpload', function ($http) {
    this.uploadFileToUrl = function(files){
        var fdata = new FormData();
        fdata.append("video", files[0]);

                return $http({
                        method: 'POST',
                        url: 'http://localhost:8000/api/upload',
                        headers: { 'Content-Type' : undefined },
                        data: fdata
                        });
    }
});

app.controller('HomePage', ['$scope','fileUpload', function($scope,fileUpload) {
    $scope.openfile = function() {
    	//document.getElementById('#choose-file').click();   
        angular.element('#choosefile').triggerHandler('click');
    };

    $scope.getTheFiles = function ($files) {
        $scope.files=$files;
    };

            // NOW UPLOAD THE FILES.
    $scope.uploadFiles = function () {
        console.log($scope.files);
        fileUpload.uploadFileToUrl($scope.files)                
            .success(function(data) {
                console.log(data);
        });
    }

}]);



app.controller('SignupController', ['$scope','$location','authenticationService', function($scope,$location,authenticationService) {
    $scope.user = {
        name: '',
        email: '',
        password: ''
      };

    $scope.handleSubmit = function() {
        if ($scope.user) {
            authenticationService.register($scope.user)
                .success(function(data) {
                   if(data.success){
                        $scope.success =data.message;
                   }else{
                        $scope.error = data.message;
                   }
                });
        }
    };

}]);


app.controller('SigninController', ['$rootScope','$scope','$http','$location','$localStorage','authenticationService', function($rootScope,$scope,$http,$location,$localStorage,authenticationService) {
    $scope.user = {
        email: '',
        password: ''
      };

    initController();
    function initController() {
        // reset login status
        authenticationService.logout();
    };

    $scope.handleSubmit = function() {
        if ($scope.user) {
            authenticationService.login($scope.user)
                .success(function(data) {
                   if(data.success){
                        if (data.token) {
                        // store username and token in local storage to keep user logged in between page refreshes
                        $localStorage.currentUser = { user: data.user, token: data.token };
                        // add jwt token to auth header for all requests made by the $http service
                        $http.defaults.headers.common.Authorization = 'Bearer ' + data.token;
                        $rootScope.globals = {
                              currentUser: {
                                user: data.user
                              }
                        };

                        $location.path('/dashboard');
                    }
                   }else{
                        $scope.error = data.message;
                   }
                });
        }
    };
}]);


app.controller('DashboardController', ['$scope','$http','$location','$localStorage','dashboardService', function($scope,$http,$location,$localStorage,dashboardService) {
  $scope.loadDashbard = function() {
            dashboardService.getUsers()
                .success(function(data) {
                   if(data.success){
                    $scope.users = data;
                   }else{
                        $scope.error = data.message;
                   }
                });

    };
}]);

  

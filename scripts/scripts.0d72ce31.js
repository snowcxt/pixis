"use strict";angular.module("pixisApp",["ui.router","ui.codemirror","ngAnimate"]).config(["$stateProvider","$urlRouterProvider",function(a,b){a.state("home",{url:"/",templateUrl:"views/main.html",controller:"MainCtrl"}).state("demo",{url:"/demo",templateUrl:"views/demo.html",controller:"DemoCtrl"}),b.otherwise("/")}]),angular.module("pixisApp").controller("MainCtrl",["$scope",function(a){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}]),angular.module("pixisApp").controller("DemoCtrl",["$scope",function(a){a.editorOptions={lineWrapping:!0,lineNumbers:!0,mode:"javascript"}}]);
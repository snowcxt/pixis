"use strict";angular.module("pixisApp",["ui.router","ui.codemirror","ngAnimate"]).config(["$stateProvider","$urlRouterProvider",function(a,b){a.state("home",{url:"/",templateUrl:"views/main.html",controller:"MainCtrl"}).state("demo",{url:"/demo",templateUrl:"views/demo.html",controller:"DemoCtrl"}).state("animationdemo",{url:"/animationdemo",templateUrl:"views/animationdemo.html",controller:"AnimationdemoCtrl"}),b.otherwise("/")}]),angular.module("pixisApp").controller("MainCtrl",["$scope",function(a){a.editorOptions={mode:"xml",readOnly:"nocurser"},a.data='<script src="path/to/pixi.js"></script>\r\n<script src="path/to/pixis.js"></script>'}]),angular.module("pixisApp").controller("DemoCtrl",["$scope","$http",function(a,b){function c(){angular.element("#try").attr("src","try.html?"+Date.now()).load(function(){angular.element(this).contents().find("#js-try").html(a.data)})}var d=!1;a.editorOptions={mode:"javascript",styleActiveLine:!0,lineNumbers:!0},a.codemirrorLoaded=function(a){a.on("change",function(){d=!0}),a.on("blur",function(){d&&(d=!1,c())})},b.get("demo/animation.js").then(function(b){a.data=b.data,c()})}]),angular.module("pixisApp").controller("AnimationdemoCtrl",["$scope","$http",function(a,b){b.get("scripts/demo/animation.js").then(function(b){angular.element("body").append(angular.element("<script />",{html:b.data})),a.editorOptions={mode:"javascript",readOnly:!0,value:b.data}})}]);
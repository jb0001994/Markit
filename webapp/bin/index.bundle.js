/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(7);
	__webpack_require__(8);
	__webpack_require__(9);
	__webpack_require__(11);
	__webpack_require__(12);
	__webpack_require__(13);
	module.exports = __webpack_require__(14);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	$(function() {
	    var auth = __webpack_require__(2)["auth"];

	    auth.onAuthStateChanged(function(user) {
	        if (user) {
	            console.log('user is signed in');
	            $("#navbar-placeholder").load("../navbar/navbar-logged-in.html", function () {
	                $(".dropdown-button").dropdown();
	                $("#navbar-logout-button").click(function () {
	                    auth.signOut();
	                });
	            });
	        } else {
	            console.log('user is NOT signed in');
	            $("#navbar-placeholder").load("../navbar/navbar-signup.html", function () {
	                $(".dropdown-button").dropdown();
	            });
	        }
	    });

	});

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var firebase = __webpack_require__(3);
	__webpack_require__(4);
	__webpack_require__(5);
	__webpack_require__(6);



	firebase.initializeApp({
	    // serviceAccount: "./MarkIt-3489756f4a28.json",
	    apiKey: "AIzaSyCaA6GSHA0fw1mjjncBES6MVd7OIVc8JV8",
	    authDomain: "markit-80192.firebaseapp.com",
	    databaseURL: "https://markit-80192.firebaseio.com",
	    storageBucket: "markit-80192.appspot.com",
	    messagingSenderId: "4085636156"
	});

	var database = firebase.database();
	var auth = firebase.auth();
	var itemsRef = database.ref('items/');
	var itemImagesRef = firebase.storage().ref('images/itemImages/');
	var usersRef = database.ref('users/');

	var addListing = function (title, description, tags, price, hubs, uid, images) {
	    var imageNames = ["imageOne", "imageTwo", "imageThree", "imageFour"];
	    var myDate = Date();
	    var itemRef = itemsRef.push();
	    var itemKey = itemRef.key;
	    var lowerCasedTags = $.map(tags, function(n,i) {return n.toLowerCase();});

	    var itemData = {
	        title: title,
	        description: description,
	        tags: lowerCasedTags,
	        price: price,
	        uid: uid,
	        id: itemKey,
	        hubs: hubs,
	        date: myDate
	    };

	    addTags(lowerCasedTags);
	    addHubs(hubs);
	    addNewListingToProfile(uid, itemKey);
	    itemsRef.child(itemKey).set(itemData);
	    database.ref('itemsByUser/' + uid + '/').child(itemKey).set(itemData);

	    hubs.forEach(function(currentHub) {
	        database.ref('itemsByHub/' + currentHub + '/').child(itemKey).set(itemData);
	    });
	    
	    
	    // adding images to storage
	    for (var i = 0; i < images.length; i += 1) {
	        (function(x) {
	            images[x] = images[x].replace(/^.*base64,/g, '');
	            var uploadTask = itemImagesRef.child(itemKey + '/' +  imageNames[x]).putString(images[x], 'base64');

	            uploadTask.on('state_changed', function(snapshot) {
	                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
	                console.log('Upload is ' + progress + '% done');

	                switch (snapshot.state) {
	                    case firebase.storage.TaskState.PAUSED: // or 'paused'
	                        console.log('Upload is paused');
	                        break;
	                    case firebase.storage.TaskState.RUNNING: // or 'running'
	                        console.log('Upload is running');
	                        break;
	                }
	            }, function(error) {
	                console.log("error uploading image");
	            }, function() {
	                var downloadURL = uploadTask.snapshot.downloadURL;
	                console.log(downloadURL);
	            });
	        })(i);
	    }
	};

	var getListings = function (callback) {
	    itemsRef.once("value").then(function (snapshot) {
	        callback(snapshot.val());
	    }, function (error) {
	        console.log(error);
	    });
	};

	var getRecentItemsInHub = function (hub, callback) {
	    database.ref('itemsByHub/' + hub + '/').orderByKey().limitToLast(4).once('value').then(function (snapshot) {
	        callback(snapshot.val());
	    }, function (error) {
	        console.log(error);
	    });
	};


	var getFavorites = function (callback) {
	    auth.onAuthStateChanged(function(user) {
	        if (user) {
	            usersRef.child(auth.currentUser.uid + '/favorites/').once("value").then(function (snapshot) {
	                callback(snapshot.val());
	            }, function (error) {
	                console.log(error);
	            });
	        }
	    });
	};

	var getUserInfo = function(uid, callback) {
	    usersRef.child(uid + '/').once('value').then(function(snapshot) {
	        var userInfo = snapshot.val();
	        callback(userInfo);
	    });
	};

	var updateUserInfo = function(uid, updatedInfo) {
	    for (update in updatedInfo) {
	        usersRef.child(uid + '/' + update).set(updatedInfo[update]);
	    }
	}

	var getImage = function(address, callback) {
	    itemImagesRef.child(address).getDownloadURL().then(function(url) {
	        callback(url);
	    }).catch(function(error) {
	        console.log("error image not found");
	        console.log("error either in item id, filename, or file doesn't exist");
	    });
	};

	var getFavoriteObjects = function (callback) {
	    auth.onAuthStateChanged(function(user) {
	        // get user favorites
	        usersRef.child(auth.currentUser.uid + '/favorites/').once("value").then(function (snapshot) {
	            var favorites = snapshot.val();
	            // pull object of items that user has favorited
	            itemsRef.once('value').then(function (snapshotItems) {
	                var allItems = snapshotItems.val();
	                var userFavoritesMatch = [];
	                for (var item in allItems) {
	                    if (favorites && favorites.hasOwnProperty(item)) {
	                        userFavoritesMatch.push(allItems[item]);
	                    }
	                }
	                callback(userFavoritesMatch);
	            }, function (error) {
	                console.log(error);
	            });
	        }, function (error) {
	            console.log(error);
	        });
	    });
	};


	var removeFavorite = function (item) {
	    usersRef.child(auth.currentUser.uid + '/favorites/' + item).remove();
	    itemsRef.child(item + '/favorites/' + auth.currentUser.uid).remove();

	    itemsRef.child(item).once('value').then(function(snapshot) {
	        let item = snapshot.val()
	        let itemTags = item['tags']
	        for (let i = 0; i < itemTags.length; i += 1) {
	            usersRef.child(auth.currentUser.uid + 
	                '/tagSuggestions/' + itemTags[i]).set(0.5);
	        }

	    });    
	};

	var filterListings = function (keywords, hubs, tags, price_range) {
	    listingsRef.orderByChild();
	};

	var signIn = function (email, password) {
	    auth.signInWithEmailAndPassword(email, password).catch(function(error) {
	        var errorCode = error.code;
	        var errorMessage = error.message;
	    });
	};

	var addNewListingToProfile = function(uid, itemID) {
	    usersRef.child(uid + '/itemsForSale/' + itemID).set(true);
	};

	var addFavoriteToProfile = function(uid, itemID) {
	    usersRef.child(uid + '/favorites/' + itemID).set(true);
	    itemsRef.child(itemID + '/favorites/').child(auth.currentUser.uid).set(true);
	    
	    //update suggested tags
	    itemsRef.child(itemID).once('value').then(function(snapshot) {
	        let item = snapshot.val()
	        let itemTags = item['tags']
	        for (let i = 0; i < itemTags.length; i += 1) {
	            usersRef.child(uid + '/tagSuggestions/' + itemTags[i]).set(1);
	        }

	    });    

	};


	var createAccount = function () {
	    auth.createUserWithEmailAndPassword($("#sign-up-email").val(), 
	        $("#sign-up-password").val()).then(function(user) {
	            var newUser = firebase.auth().currentUser;
	            newUserDBEntry(newUser);
	        }, function(error) {
	            var errorCode = error.code;
	            var errorMessage = error.message;
	            console.log(errorMessage);
	    });    
	};

	var newUserDBEntry = function (user) {
	    var firstName = $("#sign-up-first-name").val();
	    var lastName = $("#sign-up-last-name").val();
	    var username = $("#sign-up-username").val();
	    var userHub = $("#sign-up-hub").val();
	    var defaultPreference = ["cash"];
	    var date =  Date();

	    var userInfo = {
	        uid: user.uid,
	        email: user.email,
	        username: username,
	        userHub: userHub,
	        firstName: firstName,
	        lastName: lastName,
	        paymentPreferences: defaultPreference,
	        dateCreated: date
	    };
	    usersRef.child(user.uid).set(userInfo);
	};

	var addTags = function(itemTags) {
	    database.ref('tags/').once('value', function(snapshot) {
	        var tagsInDB = snapshot.val();
	        itemTags.forEach(function (tag) {
	            if (tagsInDB.hasOwnProperty(tag)) {
	                database.ref('tags/').child(tag).set(tagsInDB[tag] + 1);
	            } else {
	                database.ref('tags/').child(tag).set(1);
	            }
	        });
	    }, function (errorObject) {
	        console.log(errorObject.code);
	    });
	};

	var addHubs = function(itemHubs) {
	    database.ref('tags/').once('value', function(snapshot) {
	        var hubsInDB = snapshot.val();
	        itemHubs.forEach(function (hub) {
	            if (hubsInDB.hasOwnProperty(hub)) {
	                database.ref('hubs/').child(hub).set(hubsInDB[hub] + 1);
	            } else {
	                database.ref('hubs/').child(hub).set(1);
	            }
	        });
	    }, function (errorObject) {
	        console.log(errorObject.code);
	    });
	};



	// AI algorithm functions for suggestions in hub
	// next 3 functions
	var getItemsInHub = function (hub) {
	    return database.ref('itemsByHub/' + hub + '/').once('value').then(function (snapshot) {
	        return snapshot.val();
	    });
	};

	var getUserSuggestions = function (uid) {
	    usersRef
	    return usersRef.child(uid + '/tagSuggestions/').once('value').then(function (snapshot) {
	        return snapshot.val();
	    });
	};

	var populateSuggestionsInHub = function(hub, uid) {
	    Promise.all([
	        getItemsInHub(hub), 
	        getUserSuggestions(uid)]).then(function (results) {
	            let itemsInHub = results[0];
	            let userSuggestions = results[1];

	            // if user has favorites
	            if (userSuggestions) {
	                // for each item in the hub
	                for (let item in itemsInHub) {
	                    let itemTagCount = itemsInHub[item]['tags'].length;
	                    let tagMatches = {};
	                    let tagMatchCount = 0;
	                    let tagWeight = 0;
	                    let itemTags = itemsInHub[item]['tags'];

	                    // for each tag in each item
	                    itemTags.forEach(function (tag) {
	                        // calculate weights
	                        if (tag in userSuggestions) {
	                            tagMatches[tag] = userSuggestions[tag];
	                            tagMatchCount += 1;
	                            tagWeight += userSuggestions[tag];
	                            
	                        }
	                    });

	                    tagWeight /= itemTagCount;

	                    if (tagMatchCount === 0) {
	                        continue;
	                    }

	                    // for each tags in item
	                    itemTags.forEach(function(tag) {
	                        // set weights
	                        if (tag in userSuggestions && userSuggestions[tag] < 1) {
	                            usersRef.child(uid + '/tagSuggestions/' + tag).set((userSuggestions[tag]));
	                        } else if (!(tag in userSuggestions)) {
	                            usersRef.child(uid + '/tagSuggestions/' + tag).set(tagWeight);
	                        }
	                    });
	                }

	                // iterate through items and display items with highest values
	                let userItemSuggestions = {}
	                for (let item in itemsInHub) {
	                    let itemTags = itemsInHub[item]['tags'];
	                    let tagCount = itemsInHub[item]['tags'].length;
	                    let itemWeight = 0;
	                    itemTags.forEach(function (tag) {
	                        if (tag in userSuggestions) {
	                            itemWeight += userSuggestions[tag];
	                        }
	                    });
	                    itemWeight /= tagCount;
	                    userItemSuggestions[itemsInHub[item]['id']] = itemWeight;
	                }
	                console.log(userItemSuggestions)
	            }
	        });
	}


	module.exports = {
	    auth,
	    signIn,
	    getListings,
	    addListing,
	    addHubs,
	    addTags,
	    filterListings,
	    createAccount,
	    itemImagesRef,
	    addFavoriteToProfile,
	    getFavorites,
	    getFavoriteObjects,
	    removeFavorite,
	    getImage,
	    getRecentItemsInHub,
	    getUserInfo,
	    updateUserInfo,
	    populateSuggestionsInHub
	};

/***/ },
/* 3 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/*! @license Firebase v3.6.1
	    Build: 3.6.1-rc.3
	    Terms: https://firebase.google.com/terms/ */
	var firebase = null; (function() { var aa="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){if(c.get||c.set)throw new TypeError("ES3 does not support getters and setters.");a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)},h="undefined"!=typeof window&&window===this?this:"undefined"!=typeof global&&null!=global?global:this,l=function(){l=function(){};h.Symbol||(h.Symbol=ba)},ca=0,ba=function(a){return"jscomp_symbol_"+(a||"")+ca++},n=function(){l();var a=h.Symbol.iterator;a||(a=h.Symbol.iterator=
	h.Symbol("iterator"));"function"!=typeof Array.prototype[a]&&aa(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return m(this)}});n=function(){}},m=function(a){var b=0;return da(function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}})},da=function(a){n();a={next:a};a[h.Symbol.iterator]=function(){return this};return a},q=this,r=function(){},t=function(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);
	if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==b&&"undefined"==typeof a.call)return"object";return b},v=function(a){return"function"==t(a)},ea=function(a,
	b,c){return a.call.apply(a.bind,arguments)},fa=function(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}},w=function(a,b,c){w=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ea:fa;return w.apply(null,arguments)},x=function(a,b){var c=Array.prototype.slice.call(arguments,
	1);return function(){var b=c.slice();b.push.apply(b,arguments);return a.apply(this,b)}},y=function(a,b){function c(){}c.prototype=b.prototype;a.ba=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.aa=function(a,c,f){for(var d=Array(arguments.length-2),e=2;e<arguments.length;e++)d[e-2]=arguments[e];return b.prototype[c].apply(a,d)}};var z;z="undefined"!==typeof window?window:"undefined"!==typeof self?self:global;function __extends(a,b){function c(){this.constructor=a}for(var d in b)b.hasOwnProperty(d)&&(a[d]=b[d]);a.prototype=null===b?Object.create(b):(c.prototype=b.prototype,new c)}
	function __decorate(a,b,c,d){var e=arguments.length,f=3>e?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d,g;g=z.Reflect;if("object"===typeof g&&"function"===typeof g.decorate)f=g.decorate(a,b,c,d);else for(var k=a.length-1;0<=k;k--)if(g=a[k])f=(3>e?g(f):3<e?g(b,c,f):g(b,c))||f;return 3<e&&f&&Object.defineProperty(b,c,f),f}function __metadata(a,b){var c=z.Reflect;if("object"===typeof c&&"function"===typeof c.metadata)return c.metadata(a,b)}
	var __param=function(a,b){return function(c,d){b(c,d,a)}},__awaiter=function(a,b,c,d){return new (c||(c=Promise))(function(e,f){function g(a){try{p(d.next(a))}catch(u){f(u)}}function k(a){try{p(d.throw(a))}catch(u){f(u)}}function p(a){a.done?e(a.value):(new c(function(b){b(a.value)})).then(g,k)}p((d=d.apply(a,b)).next())})};"undefined"!==typeof z.M&&z.M||(z.__extends=__extends,z.__decorate=__decorate,z.__metadata=__metadata,z.__param=__param,z.__awaiter=__awaiter);var A=function(a){if(Error.captureStackTrace)Error.captureStackTrace(this,A);else{var b=Error().stack;b&&(this.stack=b)}a&&(this.message=String(a))};y(A,Error);A.prototype.name="CustomError";var ga=function(a,b){for(var c=a.split("%s"),d="",e=Array.prototype.slice.call(arguments,1);e.length&&1<c.length;)d+=c.shift()+e.shift();return d+c.join("%s")};var B=function(a,b){b.unshift(a);A.call(this,ga.apply(null,b));b.shift()};y(B,A);B.prototype.name="AssertionError";var ha=function(a,b,c,d){var e="Assertion failed";if(c)var e=e+(": "+c),f=d;else a&&(e+=": "+a,f=b);throw new B(""+e,f||[]);},C=function(a,b,c){a||ha("",null,b,Array.prototype.slice.call(arguments,2))},D=function(a,b,c){v(a)||ha("Expected function but got %s: %s.",[t(a),a],b,Array.prototype.slice.call(arguments,2))};var E=function(a,b,c){this.T=c;this.N=a;this.U=b;this.s=0;this.o=null};E.prototype.get=function(){var a;0<this.s?(this.s--,a=this.o,this.o=a.next,a.next=null):a=this.N();return a};E.prototype.put=function(a){this.U(a);this.s<this.T&&(this.s++,a.next=this.o,this.o=a)};var F;a:{var ia=q.navigator;if(ia){var ja=ia.userAgent;if(ja){F=ja;break a}}F=""};var ka=function(a){q.setTimeout(function(){throw a;},0)},G,la=function(){var a=q.MessageChannel;"undefined"===typeof a&&"undefined"!==typeof window&&window.postMessage&&window.addEventListener&&-1==F.indexOf("Presto")&&(a=function(){var a=document.createElement("IFRAME");a.style.display="none";a.src="";document.documentElement.appendChild(a);var b=a.contentWindow,a=b.document;a.open();a.write("");a.close();var c="callImmediate"+Math.random(),d="file:"==b.location.protocol?"*":b.location.protocol+
	"//"+b.location.host,a=w(function(a){if(("*"==d||a.origin==d)&&a.data==c)this.port1.onmessage()},this);b.addEventListener("message",a,!1);this.port1={};this.port2={postMessage:function(){b.postMessage(c,d)}}});if("undefined"!==typeof a&&-1==F.indexOf("Trident")&&-1==F.indexOf("MSIE")){var b=new a,c={},d=c;b.port1.onmessage=function(){if(void 0!==c.next){c=c.next;var a=c.G;c.G=null;a()}};return function(a){d.next={G:a};d=d.next;b.port2.postMessage(0)}}return"undefined"!==typeof document&&"onreadystatechange"in
	document.createElement("SCRIPT")?function(a){var b=document.createElement("SCRIPT");b.onreadystatechange=function(){b.onreadystatechange=null;b.parentNode.removeChild(b);b=null;a();a=null};document.documentElement.appendChild(b)}:function(a){q.setTimeout(a,0)}};var H=function(){this.v=this.f=null},ma=new E(function(){return new I},function(a){a.reset()},100);H.prototype.add=function(a,b){var c=ma.get();c.set(a,b);this.v?this.v.next=c:(C(!this.f),this.f=c);this.v=c};H.prototype.remove=function(){var a=null;this.f&&(a=this.f,this.f=this.f.next,this.f||(this.v=null),a.next=null);return a};var I=function(){this.next=this.scope=this.B=null};I.prototype.set=function(a,b){this.B=a;this.scope=b;this.next=null};
	I.prototype.reset=function(){this.next=this.scope=this.B=null};var M=function(a,b){J||na();L||(J(),L=!0);oa.add(a,b)},J,na=function(){var a=q.Promise;if(-1!=String(a).indexOf("[native code]")){var b=a.resolve(void 0);J=function(){b.then(pa)}}else J=function(){var a=pa;!v(q.setImmediate)||q.Window&&q.Window.prototype&&-1==F.indexOf("Edge")&&q.Window.prototype.setImmediate==q.setImmediate?(G||(G=la()),G(a)):q.setImmediate(a)}},L=!1,oa=new H,pa=function(){for(var a;a=oa.remove();){try{a.B.call(a.scope)}catch(b){ka(b)}ma.put(a)}L=!1};var O=function(a,b){this.b=0;this.L=void 0;this.j=this.g=this.u=null;this.m=this.A=!1;if(a!=r)try{var c=this;a.call(b,function(a){N(c,2,a)},function(a){try{if(a instanceof Error)throw a;throw Error("Promise rejected.");}catch(e){}N(c,3,a)})}catch(d){N(this,3,d)}},qa=function(){this.next=this.context=this.h=this.c=this.child=null;this.w=!1};qa.prototype.reset=function(){this.context=this.h=this.c=this.child=null;this.w=!1};
	var ra=new E(function(){return new qa},function(a){a.reset()},100),sa=function(a,b,c){var d=ra.get();d.c=a;d.h=b;d.context=c;return d},ua=function(a,b,c){ta(a,b,c,null)||M(x(b,a))};O.prototype.then=function(a,b,c){null!=a&&D(a,"opt_onFulfilled should be a function.");null!=b&&D(b,"opt_onRejected should be a function. Did you pass opt_context as the second argument instead of the third?");return va(this,v(a)?a:null,v(b)?b:null,c)};O.prototype.then=O.prototype.then;O.prototype.$goog_Thenable=!0;
	O.prototype.X=function(a,b){return va(this,null,a,b)};var xa=function(a,b){a.g||2!=a.b&&3!=a.b||wa(a);C(null!=b.c);a.j?a.j.next=b:a.g=b;a.j=b},va=function(a,b,c,d){var e=sa(null,null,null);e.child=new O(function(a,g){e.c=b?function(c){try{var e=b.call(d,c);a(e)}catch(K){g(K)}}:a;e.h=c?function(b){try{var e=c.call(d,b);a(e)}catch(K){g(K)}}:g});e.child.u=a;xa(a,e);return e.child};O.prototype.Y=function(a){C(1==this.b);this.b=0;N(this,2,a)};O.prototype.Z=function(a){C(1==this.b);this.b=0;N(this,3,a)};
	var N=function(a,b,c){0==a.b&&(a===c&&(b=3,c=new TypeError("Promise cannot resolve to itself")),a.b=1,ta(c,a.Y,a.Z,a)||(a.L=c,a.b=b,a.u=null,wa(a),3!=b||ya(a,c)))},ta=function(a,b,c,d){if(a instanceof O)return null!=b&&D(b,"opt_onFulfilled should be a function."),null!=c&&D(c,"opt_onRejected should be a function. Did you pass opt_context as the second argument instead of the third?"),xa(a,sa(b||r,c||null,d)),!0;var e;if(a)try{e=!!a.$goog_Thenable}catch(g){e=!1}else e=!1;if(e)return a.then(b,c,d),
	!0;e=typeof a;if("object"==e&&null!=a||"function"==e)try{var f=a.then;if(v(f))return za(a,f,b,c,d),!0}catch(g){return c.call(d,g),!0}return!1},za=function(a,b,c,d,e){var f=!1,g=function(a){f||(f=!0,c.call(e,a))},k=function(a){f||(f=!0,d.call(e,a))};try{b.call(a,g,k)}catch(p){k(p)}},wa=function(a){a.A||(a.A=!0,M(a.P,a))},Aa=function(a){var b=null;a.g&&(b=a.g,a.g=b.next,b.next=null);a.g||(a.j=null);null!=b&&C(null!=b.c);return b};
	O.prototype.P=function(){for(var a;a=Aa(this);){var b=this.b,c=this.L;if(3==b&&a.h&&!a.w){var d;for(d=this;d&&d.m;d=d.u)d.m=!1}if(a.child)a.child.u=null,Ba(a,b,c);else try{a.w?a.c.call(a.context):Ba(a,b,c)}catch(e){Ca.call(null,e)}ra.put(a)}this.A=!1};var Ba=function(a,b,c){2==b?a.c.call(a.context,c):a.h&&a.h.call(a.context,c)},ya=function(a,b){a.m=!0;M(function(){a.m&&Ca.call(null,b)})},Ca=ka;function P(a,b){if(!(b instanceof Object))return b;switch(b.constructor){case Date:return new Date(b.getTime());case Object:void 0===a&&(a={});break;case Array:a=[];break;default:return b}for(var c in b)b.hasOwnProperty(c)&&(a[c]=P(a[c],b[c]));return a};O.all=function(a){return new O(function(b,c){var d=a.length,e=[];if(d)for(var f=function(a,c){d--;e[a]=c;0==d&&b(e)},g=function(a){c(a)},k=0,p;k<a.length;k++)p=a[k],ua(p,x(f,k),g);else b(e)})};O.resolve=function(a){if(a instanceof O)return a;var b=new O(r);N(b,2,a);return b};O.reject=function(a){return new O(function(b,c){c(a)})};O.prototype["catch"]=O.prototype.X;var Q=O;"undefined"!==typeof Promise&&(Q=Promise);var Da=Q;function Ea(a,b){a=new R(a,b);return a.subscribe.bind(a)}var R=function(a,b){var c=this;this.a=[];this.K=0;this.task=Da.resolve();this.l=!1;this.D=b;this.task.then(function(){a(c)}).catch(function(a){c.error(a)})};R.prototype.next=function(a){S(this,function(b){b.next(a)})};R.prototype.error=function(a){S(this,function(b){b.error(a)});this.close(a)};R.prototype.complete=function(){S(this,function(a){a.complete()});this.close()};
	R.prototype.subscribe=function(a,b,c){var d=this,e;if(void 0===a&&void 0===b&&void 0===c)throw Error("Missing Observer.");e=Fa(a)?a:{next:a,error:b,complete:c};void 0===e.next&&(e.next=T);void 0===e.error&&(e.error=T);void 0===e.complete&&(e.complete=T);a=this.$.bind(this,this.a.length);this.l&&this.task.then(function(){try{d.H?e.error(d.H):e.complete()}catch(f){}});this.a.push(e);return a};
	R.prototype.$=function(a){void 0!==this.a&&void 0!==this.a[a]&&(delete this.a[a],--this.K,0===this.K&&void 0!==this.D&&this.D(this))};var S=function(a,b){if(!a.l)for(var c=0;c<a.a.length;c++)Ga(a,c,b)},Ga=function(a,b,c){a.task.then(function(){if(void 0!==a.a&&void 0!==a.a[b])try{c(a.a[b])}catch(d){"undefined"!==typeof console&&console.error&&console.error(d)}})};R.prototype.close=function(a){var b=this;this.l||(this.l=!0,void 0!==a&&(this.H=a),this.task.then(function(){b.a=void 0;b.D=void 0}))};
	function Fa(a){if("object"!==typeof a||null===a)return!1;var b;b=["next","error","complete"];n();var c=b[Symbol.iterator];b=c?c.call(b):m(b);for(c=b.next();!c.done;c=b.next())if(c=c.value,c in a&&"function"===typeof a[c])return!0;return!1}function T(){};var Ha=Error.captureStackTrace,V=function(a,b){this.code=a;this.message=b;if(Ha)Ha(this,U.prototype.create);else{var c=Error.apply(this,arguments);this.name="FirebaseError";Object.defineProperty(this,"stack",{get:function(){return c.stack}})}};V.prototype=Object.create(Error.prototype);V.prototype.constructor=V;V.prototype.name="FirebaseError";var U=function(a,b,c){this.V=a;this.W=b;this.O=c;this.pattern=/\{\$([^}]+)}/g};
	U.prototype.create=function(a,b){void 0===b&&(b={});var c=this.O[a];a=this.V+"/"+a;var c=void 0===c?"Error":c.replace(this.pattern,function(a,c){a=b[c];return void 0!==a?a.toString():"<"+c+"?>"}),c=this.W+": "+c+" ("+a+").",c=new V(a,c),d;for(d in b)b.hasOwnProperty(d)&&"_"!==d.slice(-1)&&(c[d]=b[d]);return c};var W=Q,X=function(a,b,c){var d=this;this.I=c;this.J=!1;this.i={};this.C=b;this.F=P(void 0,a);a="serviceAccount"in this.F;("credential"in this.F||a)&&"undefined"!==typeof console&&console.log("The '"+(a?"serviceAccount":"credential")+"' property specified in the first argument to initializeApp() is deprecated and will be removed in the next major version. You should instead use the 'firebase-admin' package. See https://firebase.google.com/docs/admin/setup for details on how to get started.");Object.keys(c.INTERNAL.factories).forEach(function(a){var b=
	c.INTERNAL.useAsService(d,a);null!==b&&(b=d.S.bind(d,b),d[a]=b)})};X.prototype.delete=function(){var a=this;return(new W(function(b){Y(a);b()})).then(function(){a.I.INTERNAL.removeApp(a.C);return W.all(Object.keys(a.i).map(function(b){return a.i[b].INTERNAL.delete()}))}).then(function(){a.J=!0;a.i={}})};X.prototype.S=function(a){Y(this);void 0===this.i[a]&&(this.i[a]=this.I.INTERNAL.factories[a](this,this.R.bind(this)));return this.i[a]};X.prototype.R=function(a){P(this,a)};
	var Y=function(a){a.J&&Z(Ia("deleted",{name:a.C}))};h.Object.defineProperties(X.prototype,{name:{configurable:!0,enumerable:!0,get:function(){Y(this);return this.C}},options:{configurable:!0,enumerable:!0,get:function(){Y(this);return this.F}}});X.prototype.name&&X.prototype.options||X.prototype.delete||console.log("dc");
	function Ja(){function a(a){a=a||"[DEFAULT]";var b=d[a];void 0===b&&Z("noApp",{name:a});return b}function b(a,b){Object.keys(e).forEach(function(d){d=c(a,d);if(null!==d&&f[d])f[d](b,a)})}function c(a,b){if("serverAuth"===b)return null;var c=b;a=a.options;"auth"===b&&(a.serviceAccount||a.credential)&&(c="serverAuth","serverAuth"in e||Z("serverAuthMissing"));return c}var d={},e={},f={},g={__esModule:!0,initializeApp:function(a,c){void 0===c?c="[DEFAULT]":"string"===typeof c&&""!==c||Z("bad-app-name",
	{name:c+""});void 0!==d[c]&&Z("dupApp",{name:c});a=new X(a,c,g);d[c]=a;b(a,"create");void 0!=a.INTERNAL&&void 0!=a.INTERNAL.getToken||P(a,{INTERNAL:{getToken:function(){return W.resolve(null)},addAuthTokenListener:function(){},removeAuthTokenListener:function(){}}});return a},app:a,apps:null,Promise:W,SDK_VERSION:"0.0.0",INTERNAL:{registerService:function(b,c,d,u){e[b]&&Z("dupService",{name:b});e[b]=c;u&&(f[b]=u);c=function(c){void 0===c&&(c=a());return c[b]()};void 0!==d&&P(c,d);return g[b]=c},createFirebaseNamespace:Ja,
	extendNamespace:function(a){P(g,a)},createSubscribe:Ea,ErrorFactory:U,removeApp:function(a){b(d[a],"delete");delete d[a]},factories:e,useAsService:c,Promise:O,deepExtend:P}};g["default"]=g;Object.defineProperty(g,"apps",{get:function(){return Object.keys(d).map(function(a){return d[a]})}});a.App=X;return g}function Z(a,b){throw Error(Ia(a,b));}
	function Ia(a,b){b=b||{};b={noApp:"No Firebase App '"+b.name+"' has been created - call Firebase App.initializeApp().","bad-app-name":"Illegal App name: '"+b.name+"'.",dupApp:"Firebase App named '"+b.name+"' already exists.",deleted:"Firebase App named '"+b.name+"' already deleted.",dupService:"Firebase Service named '"+b.name+"' already registered.",serverAuthMissing:"Initializing the Firebase SDK with a service account is only allowed in a Node.js environment. On client devices, you should instead initialize the SDK with an api key and auth domain."}[a];
	return void 0===b?"Application Error: ("+a+")":b};"undefined"!==typeof firebase&&(firebase=Ja()); })();
	firebase.SDK_VERSION = "3.6.1";
	module.exports = firebase;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var firebase = __webpack_require__(3);
	/*! @license Firebase v3.6.1
	    Build: 3.6.1-rc.3
	    Terms: https://firebase.google.com/terms/ */
	(function(){var h,aa=aa||{},l=this,ba=function(){},ca=function(){throw Error("unimplemented abstract method");},m=function(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=
	typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==b&&"undefined"==typeof a.call)return"object";return b},da=function(a){return null===a},ea=function(a){return"array"==m(a)},fa=function(a){var b=m(a);return"array"==b||"object"==b&&"number"==typeof a.length},n=function(a){return"string"==typeof a},ga=function(a){return"number"==typeof a},p=function(a){return"function"==m(a)},ha=function(a){var b=typeof a;
	return"object"==b&&null!=a||"function"==b},ia=function(a,b,c){return a.call.apply(a.bind,arguments)},ja=function(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}},q=function(a,b,c){q=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ia:ja;return q.apply(null,
	arguments)},ka=function(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var b=c.slice();b.push.apply(b,arguments);return a.apply(this,b)}},la=Date.now||function(){return+new Date},r=function(a,b){function c(){}c.prototype=b.prototype;a.Rc=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.$e=function(a,c,f){for(var d=Array(arguments.length-2),e=2;e<arguments.length;e++)d[e-2]=arguments[e];return b.prototype[c].apply(a,d)}};var t=function(a){if(Error.captureStackTrace)Error.captureStackTrace(this,t);else{var b=Error().stack;b&&(this.stack=b)}a&&(this.message=String(a))};r(t,Error);t.prototype.name="CustomError";var ma=function(a,b){for(var c=a.split("%s"),d="",e=Array.prototype.slice.call(arguments,1);e.length&&1<c.length;)d+=c.shift()+e.shift();return d+c.join("%s")},na=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")},pa=/&/g,qa=/</g,ra=/>/g,sa=/"/g,ta=/'/g,ua=/\x00/g,va=/[\x00&<>"']/,u=function(a,b){return-1!=a.indexOf(b)},wa=function(a,b){return a<b?-1:a>b?1:0};var xa=function(a,b){b.unshift(a);t.call(this,ma.apply(null,b));b.shift()};r(xa,t);xa.prototype.name="AssertionError";
	var ya=function(a,b,c,d){var e="Assertion failed";if(c)var e=e+(": "+c),f=d;else a&&(e+=": "+a,f=b);throw new xa(""+e,f||[]);},w=function(a,b,c){a||ya("",null,b,Array.prototype.slice.call(arguments,2))},za=function(a,b){throw new xa("Failure"+(a?": "+a:""),Array.prototype.slice.call(arguments,1));},Aa=function(a,b,c){ga(a)||ya("Expected number but got %s: %s.",[m(a),a],b,Array.prototype.slice.call(arguments,2));return a},Ba=function(a,b,c){n(a)||ya("Expected string but got %s: %s.",[m(a),a],b,Array.prototype.slice.call(arguments,
	2))},Ca=function(a,b,c){p(a)||ya("Expected function but got %s: %s.",[m(a),a],b,Array.prototype.slice.call(arguments,2))};var Da=Array.prototype.indexOf?function(a,b,c){w(null!=a.length);return Array.prototype.indexOf.call(a,b,c)}:function(a,b,c){c=null==c?0:0>c?Math.max(0,a.length+c):c;if(n(a))return n(b)&&1==b.length?a.indexOf(b,c):-1;for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},x=Array.prototype.forEach?function(a,b,c){w(null!=a.length);Array.prototype.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=n(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},Ea=function(a,b){for(var c=n(a)?
	a.split(""):a,d=a.length-1;0<=d;--d)d in c&&b.call(void 0,c[d],d,a)},Fa=Array.prototype.map?function(a,b,c){w(null!=a.length);return Array.prototype.map.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=Array(d),f=n(a)?a.split(""):a,g=0;g<d;g++)g in f&&(e[g]=b.call(c,f[g],g,a));return e},Ga=Array.prototype.some?function(a,b,c){w(null!=a.length);return Array.prototype.some.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=n(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&b.call(c,e[f],f,a))return!0;return!1},
	Ia=function(a){var b;a:{b=Ha;for(var c=a.length,d=n(a)?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a)){b=e;break a}b=-1}return 0>b?null:n(a)?a.charAt(b):a[b]},Ja=function(a,b){return 0<=Da(a,b)},La=function(a,b){b=Da(a,b);var c;(c=0<=b)&&Ka(a,b);return c},Ka=function(a,b){w(null!=a.length);return 1==Array.prototype.splice.call(a,b,1).length},Ma=function(a,b){var c=0;Ea(a,function(d,e){b.call(void 0,d,e,a)&&Ka(a,e)&&c++})},Na=function(a){return Array.prototype.concat.apply(Array.prototype,
	arguments)},Oa=function(a){var b=a.length;if(0<b){for(var c=Array(b),d=0;d<b;d++)c[d]=a[d];return c}return[]};var Pa=function(a,b){for(var c in a)b.call(void 0,a[c],c,a)},Qa=function(a){var b=[],c=0,d;for(d in a)b[c++]=a[d];return b},Ra=function(a){var b=[],c=0,d;for(d in a)b[c++]=d;return b},Sa=function(a){for(var b in a)return!1;return!0},Ta=function(a,b){for(var c in a)if(!(c in b)||a[c]!==b[c])return!1;for(c in b)if(!(c in a))return!1;return!0},Ua=function(a){var b={},c;for(c in a)b[c]=a[c];return b},Va="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" "),
	Wa=function(a,b){for(var c,d,e=1;e<arguments.length;e++){d=arguments[e];for(c in d)a[c]=d[c];for(var f=0;f<Va.length;f++)c=Va[f],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c])}};var Xa;a:{var Ya=l.navigator;if(Ya){var Za=Ya.userAgent;if(Za){Xa=Za;break a}}Xa=""}var y=function(a){return u(Xa,a)};var $a=function(a){$a[" "](a);return a};$a[" "]=ba;var bb=function(a,b){var c=ab;return Object.prototype.hasOwnProperty.call(c,a)?c[a]:c[a]=b(a)};var cb=y("Opera"),z=y("Trident")||y("MSIE"),db=y("Edge"),eb=db||z,fb=y("Gecko")&&!(u(Xa.toLowerCase(),"webkit")&&!y("Edge"))&&!(y("Trident")||y("MSIE"))&&!y("Edge"),gb=u(Xa.toLowerCase(),"webkit")&&!y("Edge"),hb=function(){var a=l.document;return a?a.documentMode:void 0},ib;
	a:{var jb="",kb=function(){var a=Xa;if(fb)return/rv\:([^\);]+)(\)|;)/.exec(a);if(db)return/Edge\/([\d\.]+)/.exec(a);if(z)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(gb)return/WebKit\/(\S+)/.exec(a);if(cb)return/(?:Version)[ \/]?(\S+)/.exec(a)}();kb&&(jb=kb?kb[1]:"");if(z){var lb=hb();if(null!=lb&&lb>parseFloat(jb)){ib=String(lb);break a}}ib=jb}
	var mb=ib,ab={},A=function(a){return bb(a,function(){for(var b=0,c=na(String(mb)).split("."),d=na(String(a)).split("."),e=Math.max(c.length,d.length),f=0;0==b&&f<e;f++){var g=c[f]||"",k=d[f]||"";do{g=/(\d*)(\D*)(.*)/.exec(g)||["","","",""];k=/(\d*)(\D*)(.*)/.exec(k)||["","","",""];if(0==g[0].length&&0==k[0].length)break;b=wa(0==g[1].length?0:parseInt(g[1],10),0==k[1].length?0:parseInt(k[1],10))||wa(0==g[2].length,0==k[2].length)||wa(g[2],k[2]);g=g[3];k=k[3]}while(0==b)}return 0<=b})},nb;var ob=l.document;
	nb=ob&&z?hb()||("CSS1Compat"==ob.compatMode?parseInt(mb,10):5):void 0;var pb=null,qb=null,sb=function(a){var b="";rb(a,function(a){b+=String.fromCharCode(a)});return b},rb=function(a,b){function c(b){for(;d<a.length;){var c=a.charAt(d++),e=qb[c];if(null!=e)return e;if(!/^[\s\xa0]*$/.test(c))throw Error("Unknown base64 encoding at char: "+c);}return b}tb();for(var d=0;;){var e=c(-1),f=c(0),g=c(64),k=c(64);if(64===k&&-1===e)break;b(e<<2|f>>4);64!=g&&(b(f<<4&240|g>>2),64!=k&&b(g<<6&192|k))}},tb=function(){if(!pb){pb={};qb={};for(var a=0;65>a;a++)pb[a]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(a),
	qb[pb[a]]=a,62<=a&&(qb["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.".charAt(a)]=a)}};var ub=!z||9<=Number(nb),vb=z&&!A("9");!gb||A("528");fb&&A("1.9b")||z&&A("8")||cb&&A("9.5")||gb&&A("528");fb&&!A("8")||z&&A("9");var wb=function(){this.za=this.za;this.Rb=this.Rb};wb.prototype.za=!1;wb.prototype.isDisposed=function(){return this.za};wb.prototype.Na=function(){if(this.Rb)for(;this.Rb.length;)this.Rb.shift()()};var xb=function(a,b){this.type=a;this.currentTarget=this.target=b;this.defaultPrevented=this.Ua=!1;this.ud=!0};xb.prototype.preventDefault=function(){this.defaultPrevented=!0;this.ud=!1};var yb=function(a,b){xb.call(this,a?a.type:"");this.relatedTarget=this.currentTarget=this.target=null;this.charCode=this.keyCode=this.button=this.screenY=this.screenX=this.clientY=this.clientX=this.offsetY=this.offsetX=0;this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1;this.lb=this.state=null;a&&this.init(a,b)};r(yb,xb);
	yb.prototype.init=function(a,b){var c=this.type=a.type,d=a.changedTouches?a.changedTouches[0]:null;this.target=a.target||a.srcElement;this.currentTarget=b;if(b=a.relatedTarget){if(fb){var e;a:{try{$a(b.nodeName);e=!0;break a}catch(f){}e=!1}e||(b=null)}}else"mouseover"==c?b=a.fromElement:"mouseout"==c&&(b=a.toElement);this.relatedTarget=b;null===d?(this.offsetX=gb||void 0!==a.offsetX?a.offsetX:a.layerX,this.offsetY=gb||void 0!==a.offsetY?a.offsetY:a.layerY,this.clientX=void 0!==a.clientX?a.clientX:
	a.pageX,this.clientY=void 0!==a.clientY?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0):(this.clientX=void 0!==d.clientX?d.clientX:d.pageX,this.clientY=void 0!==d.clientY?d.clientY:d.pageY,this.screenX=d.screenX||0,this.screenY=d.screenY||0);this.button=a.button;this.keyCode=a.keyCode||0;this.charCode=a.charCode||("keypress"==c?a.keyCode:0);this.ctrlKey=a.ctrlKey;this.altKey=a.altKey;this.shiftKey=a.shiftKey;this.metaKey=a.metaKey;this.state=a.state;this.lb=a;a.defaultPrevented&&
	this.preventDefault()};yb.prototype.preventDefault=function(){yb.Rc.preventDefault.call(this);var a=this.lb;if(a.preventDefault)a.preventDefault();else if(a.returnValue=!1,vb)try{if(a.ctrlKey||112<=a.keyCode&&123>=a.keyCode)a.keyCode=-1}catch(b){}};yb.prototype.ee=function(){return this.lb};var zb="closure_listenable_"+(1E6*Math.random()|0),Ab=0;var Bb=function(a,b,c,d,e){this.listener=a;this.Wb=null;this.src=b;this.type=c;this.capture=!!d;this.Ib=e;this.key=++Ab;this.Za=this.Cb=!1},Cb=function(a){a.Za=!0;a.listener=null;a.Wb=null;a.src=null;a.Ib=null};var Db=function(a){this.src=a;this.v={};this.zb=0};Db.prototype.add=function(a,b,c,d,e){var f=a.toString();a=this.v[f];a||(a=this.v[f]=[],this.zb++);var g=Eb(a,b,d,e);-1<g?(b=a[g],c||(b.Cb=!1)):(b=new Bb(b,this.src,f,!!d,e),b.Cb=c,a.push(b));return b};Db.prototype.remove=function(a,b,c,d){a=a.toString();if(!(a in this.v))return!1;var e=this.v[a];b=Eb(e,b,c,d);return-1<b?(Cb(e[b]),Ka(e,b),0==e.length&&(delete this.v[a],this.zb--),!0):!1};
	var Fb=function(a,b){var c=b.type;c in a.v&&La(a.v[c],b)&&(Cb(b),0==a.v[c].length&&(delete a.v[c],a.zb--))};Db.prototype.vc=function(a,b,c,d){a=this.v[a.toString()];var e=-1;a&&(e=Eb(a,b,c,d));return-1<e?a[e]:null};var Eb=function(a,b,c,d){for(var e=0;e<a.length;++e){var f=a[e];if(!f.Za&&f.listener==b&&f.capture==!!c&&f.Ib==d)return e}return-1};var Gb="closure_lm_"+(1E6*Math.random()|0),Hb={},Ib=0,Jb=function(a,b,c,d,e){if(ea(b))for(var f=0;f<b.length;f++)Jb(a,b[f],c,d,e);else c=Kb(c),a&&a[zb]?a.listen(b,c,d,e):Lb(a,b,c,!1,d,e)},Lb=function(a,b,c,d,e,f){if(!b)throw Error("Invalid event type");var g=!!e,k=Mb(a);k||(a[Gb]=k=new Db(a));c=k.add(b,c,d,e,f);if(!c.Wb){d=Nb();c.Wb=d;d.src=a;d.listener=c;if(a.addEventListener)a.addEventListener(b.toString(),d,g);else if(a.attachEvent)a.attachEvent(Ob(b.toString()),d);else throw Error("addEventListener and attachEvent are unavailable.");
	Ib++}},Nb=function(){var a=Pb,b=ub?function(c){return a.call(b.src,b.listener,c)}:function(c){c=a.call(b.src,b.listener,c);if(!c)return c};return b},Qb=function(a,b,c,d,e){if(ea(b))for(var f=0;f<b.length;f++)Qb(a,b[f],c,d,e);else c=Kb(c),a&&a[zb]?Rb(a,b,c,d,e):Lb(a,b,c,!0,d,e)},Sb=function(a,b,c,d,e){if(ea(b))for(var f=0;f<b.length;f++)Sb(a,b[f],c,d,e);else c=Kb(c),a&&a[zb]?a.$.remove(String(b),c,d,e):a&&(a=Mb(a))&&(b=a.vc(b,c,!!d,e))&&Tb(b)},Tb=function(a){if(!ga(a)&&a&&!a.Za){var b=a.src;if(b&&
	b[zb])Fb(b.$,a);else{var c=a.type,d=a.Wb;b.removeEventListener?b.removeEventListener(c,d,a.capture):b.detachEvent&&b.detachEvent(Ob(c),d);Ib--;(c=Mb(b))?(Fb(c,a),0==c.zb&&(c.src=null,b[Gb]=null)):Cb(a)}}},Ob=function(a){return a in Hb?Hb[a]:Hb[a]="on"+a},Vb=function(a,b,c,d){var e=!0;if(a=Mb(a))if(b=a.v[b.toString()])for(b=b.concat(),a=0;a<b.length;a++){var f=b[a];f&&f.capture==c&&!f.Za&&(f=Ub(f,d),e=e&&!1!==f)}return e},Ub=function(a,b){var c=a.listener,d=a.Ib||a.src;a.Cb&&Tb(a);return c.call(d,
	b)},Pb=function(a,b){if(a.Za)return!0;if(!ub){if(!b)a:{b=["window","event"];for(var c=l,d;d=b.shift();)if(null!=c[d])c=c[d];else{b=null;break a}b=c}d=b;b=new yb(d,this);c=!0;if(!(0>d.keyCode||void 0!=d.returnValue)){a:{var e=!1;if(0==d.keyCode)try{d.keyCode=-1;break a}catch(g){e=!0}if(e||void 0==d.returnValue)d.returnValue=!0}d=[];for(e=b.currentTarget;e;e=e.parentNode)d.push(e);a=a.type;for(e=d.length-1;!b.Ua&&0<=e;e--){b.currentTarget=d[e];var f=Vb(d[e],a,!0,b),c=c&&f}for(e=0;!b.Ua&&e<d.length;e++)b.currentTarget=
	d[e],f=Vb(d[e],a,!1,b),c=c&&f}return c}return Ub(a,new yb(b,this))},Mb=function(a){a=a[Gb];return a instanceof Db?a:null},Wb="__closure_events_fn_"+(1E9*Math.random()>>>0),Kb=function(a){w(a,"Listener can not be null.");if(p(a))return a;w(a.handleEvent,"An object listener must have handleEvent method.");a[Wb]||(a[Wb]=function(b){return a.handleEvent(b)});return a[Wb]};var Xb=/^[+a-zA-Z0-9_.!#$%&'*\/=?^`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,63}$/;var Zb=function(){this.fc="";this.Md=Yb};Zb.prototype.Lb=!0;Zb.prototype.Gb=function(){return this.fc};Zb.prototype.toString=function(){return"Const{"+this.fc+"}"};var $b=function(a){if(a instanceof Zb&&a.constructor===Zb&&a.Md===Yb)return a.fc;za("expected object of type Const, got '"+a+"'");return"type_error:Const"},Yb={},ac=function(a){var b=new Zb;b.fc=a;return b};ac("");var B=function(){this.ka="";this.Ld=bc};B.prototype.Lb=!0;B.prototype.Gb=function(){return this.ka};B.prototype.toString=function(){return"SafeUrl{"+this.ka+"}"};
	var cc=function(a){if(a instanceof B&&a.constructor===B&&a.Ld===bc)return a.ka;za("expected object of type SafeUrl, got '"+a+"' of type "+m(a));return"type_error:SafeUrl"},dc=/^(?:(?:https?|mailto|ftp):|[^&:/?#]*(?:[/?#]|$))/i,fc=function(a){if(a instanceof B)return a;a=a.Lb?a.Gb():String(a);dc.test(a)||(a="about:invalid#zClosurez");return ec(a)},bc={},ec=function(a){var b=new B;b.ka=a;return b};ec("about:blank");var gc=function(a){return/^\s*$/.test(a)?!1:/^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g,"@").replace(/(?:"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)[\s\u2028\u2029]*(?=:|,|]|}|$)/g,"]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g,""))},hc=function(a){a=String(a);if(gc(a))try{return eval("("+a+")")}catch(b){}throw Error("Invalid JSON string: "+a);},kc=function(a){var b=[];ic(new jc,a,b);return b.join("")},jc=function(){this.$b=void 0},
	ic=function(a,b,c){if(null==b)c.push("null");else{if("object"==typeof b){if(ea(b)){var d=b;b=d.length;c.push("[");for(var e="",f=0;f<b;f++)c.push(e),e=d[f],ic(a,a.$b?a.$b.call(d,String(f),e):e,c),e=",";c.push("]");return}if(b instanceof String||b instanceof Number||b instanceof Boolean)b=b.valueOf();else{c.push("{");f="";for(d in b)Object.prototype.hasOwnProperty.call(b,d)&&(e=b[d],"function"!=typeof e&&(c.push(f),lc(d,c),c.push(":"),ic(a,a.$b?a.$b.call(b,d,e):e,c),f=","));c.push("}");return}}switch(typeof b){case "string":lc(b,
	c);break;case "number":c.push(isFinite(b)&&!isNaN(b)?String(b):"null");break;case "boolean":c.push(String(b));break;case "function":c.push("null");break;default:throw Error("Unknown type: "+typeof b);}}},mc={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},nc=/\uffff/.test("\uffff")?/[\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\"\x00-\x1f\x7f-\xff]/g,lc=function(a,b){b.push('"',a.replace(nc,function(a){var b=mc[a];b||(b="\\u"+(a.charCodeAt(0)|65536).toString(16).substr(1),
	mc[a]=b);return b}),'"')};var oc=function(){};oc.prototype.Vc=null;oc.prototype.kb=ca;var pc=function(a){return a.Vc||(a.Vc=a.Ob())};oc.prototype.Ob=ca;var qc,rc=function(){};r(rc,oc);rc.prototype.kb=function(){var a=sc(this);return a?new ActiveXObject(a):new XMLHttpRequest};rc.prototype.Ob=function(){var a={};sc(this)&&(a[0]=!0,a[1]=!0);return a};
	var sc=function(a){if(!a.jd&&"undefined"==typeof XMLHttpRequest&&"undefined"!=typeof ActiveXObject){for(var b=["MSXML2.XMLHTTP.6.0","MSXML2.XMLHTTP.3.0","MSXML2.XMLHTTP","Microsoft.XMLHTTP"],c=0;c<b.length;c++){var d=b[c];try{return new ActiveXObject(d),a.jd=d}catch(e){}}throw Error("Could not create ActiveXObject. ActiveX might be disabled, or MSXML might not be installed");}return a.jd};qc=new rc;var tc=function(){};r(tc,oc);tc.prototype.kb=function(){var a=new XMLHttpRequest;if("withCredentials"in a)return a;if("undefined"!=typeof XDomainRequest)return new uc;throw Error("Unsupported browser");};tc.prototype.Ob=function(){return{}};
	var uc=function(){this.na=new XDomainRequest;this.readyState=0;this.onreadystatechange=null;this.responseText="";this.status=-1;this.statusText=this.responseXML=null;this.na.onload=q(this.ie,this);this.na.onerror=q(this.gd,this);this.na.onprogress=q(this.je,this);this.na.ontimeout=q(this.ke,this)};h=uc.prototype;h.open=function(a,b,c){if(null!=c&&!c)throw Error("Only async requests are supported.");this.na.open(a,b)};
	h.send=function(a){if(a)if("string"==typeof a)this.na.send(a);else throw Error("Only string data is supported");else this.na.send()};h.abort=function(){this.na.abort()};h.setRequestHeader=function(){};h.ie=function(){this.status=200;this.responseText=this.na.responseText;vc(this,4)};h.gd=function(){this.status=500;this.responseText="";vc(this,4)};h.ke=function(){this.gd()};h.je=function(){this.status=200;vc(this,1)};var vc=function(a,b){a.readyState=b;if(a.onreadystatechange)a.onreadystatechange()};var xc=function(){this.Ub="";this.Nd=wc};xc.prototype.Lb=!0;xc.prototype.Gb=function(){return this.Ub};xc.prototype.toString=function(){return"TrustedResourceUrl{"+this.Ub+"}"};var wc={};var zc=function(){this.ka="";this.Kd=yc};zc.prototype.Lb=!0;zc.prototype.Gb=function(){return this.ka};zc.prototype.toString=function(){return"SafeHtml{"+this.ka+"}"};var Ac=function(a){if(a instanceof zc&&a.constructor===zc&&a.Kd===yc)return a.ka;za("expected object of type SafeHtml, got '"+a+"' of type "+m(a));return"type_error:SafeHtml"},yc={};zc.prototype.re=function(a){this.ka=a;return this};!fb&&!z||z&&9<=Number(nb)||fb&&A("1.9.1");z&&A("9");var Cc=function(a,b){Pa(b,function(b,d){"style"==d?a.style.cssText=b:"class"==d?a.className=b:"for"==d?a.htmlFor=b:Bc.hasOwnProperty(d)?a.setAttribute(Bc[d],b):0==d.lastIndexOf("aria-",0)||0==d.lastIndexOf("data-",0)?a.setAttribute(d,b):a[d]=b})},Bc={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",frameborder:"frameBorder",height:"height",maxlength:"maxLength",nonce:"nonce",role:"role",rowspan:"rowSpan",type:"type",usemap:"useMap",valign:"vAlign",width:"width"};var Dc=function(a,b,c){this.ue=c;this.Ud=a;this.Ge=b;this.Qb=0;this.Jb=null};Dc.prototype.get=function(){var a;0<this.Qb?(this.Qb--,a=this.Jb,this.Jb=a.next,a.next=null):a=this.Ud();return a};Dc.prototype.put=function(a){this.Ge(a);this.Qb<this.ue&&(this.Qb++,a.next=this.Jb,this.Jb=a)};var Ec=function(a){l.setTimeout(function(){throw a;},0)},Fc,Gc=function(){var a=l.MessageChannel;"undefined"===typeof a&&"undefined"!==typeof window&&window.postMessage&&window.addEventListener&&!y("Presto")&&(a=function(){var a=document.createElement("IFRAME");a.style.display="none";a.src="";document.documentElement.appendChild(a);var b=a.contentWindow,a=b.document;a.open();a.write("");a.close();var c="callImmediate"+Math.random(),d="file:"==b.location.protocol?"*":b.location.protocol+"//"+b.location.host,
	a=q(function(a){if(("*"==d||a.origin==d)&&a.data==c)this.port1.onmessage()},this);b.addEventListener("message",a,!1);this.port1={};this.port2={postMessage:function(){b.postMessage(c,d)}}});if("undefined"!==typeof a&&!y("Trident")&&!y("MSIE")){var b=new a,c={},d=c;b.port1.onmessage=function(){if(void 0!==c.next){c=c.next;var a=c.Zc;c.Zc=null;a()}};return function(a){d.next={Zc:a};d=d.next;b.port2.postMessage(0)}}return"undefined"!==typeof document&&"onreadystatechange"in document.createElement("SCRIPT")?
	function(a){var b=document.createElement("SCRIPT");b.onreadystatechange=function(){b.onreadystatechange=null;b.parentNode.removeChild(b);b=null;a();a=null};document.documentElement.appendChild(b)}:function(a){l.setTimeout(a,0)}};var Hc=function(){this.kc=this.Ia=null},Jc=new Dc(function(){return new Ic},function(a){a.reset()},100);Hc.prototype.add=function(a,b){var c=Jc.get();c.set(a,b);this.kc?this.kc.next=c:(w(!this.Ia),this.Ia=c);this.kc=c};Hc.prototype.remove=function(){var a=null;this.Ia&&(a=this.Ia,this.Ia=this.Ia.next,this.Ia||(this.kc=null),a.next=null);return a};var Ic=function(){this.next=this.scope=this.uc=null};Ic.prototype.set=function(a,b){this.uc=a;this.scope=b;this.next=null};
	Ic.prototype.reset=function(){this.next=this.scope=this.uc=null};var Oc=function(a,b){Kc||Lc();Mc||(Kc(),Mc=!0);Nc.add(a,b)},Kc,Lc=function(){var a=l.Promise;if(-1!=String(a).indexOf("[native code]")){var b=a.resolve(void 0);Kc=function(){b.then(Pc)}}else Kc=function(){var a=Pc;!p(l.setImmediate)||l.Window&&l.Window.prototype&&!y("Edge")&&l.Window.prototype.setImmediate==l.setImmediate?(Fc||(Fc=Gc()),Fc(a)):l.setImmediate(a)}},Mc=!1,Nc=new Hc,Pc=function(){for(var a;a=Nc.remove();){try{a.uc.call(a.scope)}catch(b){Ec(b)}Jc.put(a)}Mc=!1};var Qc=function(a){a.prototype.then=a.prototype.then;a.prototype.$goog_Thenable=!0},Rc=function(a){if(!a)return!1;try{return!!a.$goog_Thenable}catch(b){return!1}};var C=function(a,b){this.G=0;this.la=void 0;this.La=this.ga=this.m=null;this.Hb=this.tc=!1;if(a!=ba)try{var c=this;a.call(b,function(a){Sc(c,2,a)},function(a){if(!(a instanceof Tc))try{if(a instanceof Error)throw a;throw Error("Promise rejected.");}catch(e){}Sc(c,3,a)})}catch(d){Sc(this,3,d)}},Uc=function(){this.next=this.context=this.Ra=this.Da=this.child=null;this.ib=!1};Uc.prototype.reset=function(){this.context=this.Ra=this.Da=this.child=null;this.ib=!1};
	var Vc=new Dc(function(){return new Uc},function(a){a.reset()},100),Wc=function(a,b,c){var d=Vc.get();d.Da=a;d.Ra=b;d.context=c;return d},D=function(a){if(a instanceof C)return a;var b=new C(ba);Sc(b,2,a);return b},E=function(a){return new C(function(b,c){c(a)})},Yc=function(a,b,c){Xc(a,b,c,null)||Oc(ka(b,a))},Zc=function(a){return new C(function(b){var c=a.length,d=[];if(c)for(var e=function(a,e,f){c--;d[a]=e?{de:!0,value:f}:{de:!1,reason:f};0==c&&b(d)},f=0,g;f<a.length;f++)g=a[f],Yc(g,ka(e,f,!0),
	ka(e,f,!1));else b(d)})};C.prototype.then=function(a,b,c){null!=a&&Ca(a,"opt_onFulfilled should be a function.");null!=b&&Ca(b,"opt_onRejected should be a function. Did you pass opt_context as the second argument instead of the third?");return $c(this,p(a)?a:null,p(b)?b:null,c)};Qc(C);var bd=function(a,b){b=Wc(b,b,void 0);b.ib=!0;ad(a,b);return a};C.prototype.h=function(a,b){return $c(this,null,a,b)};C.prototype.cancel=function(a){0==this.G&&Oc(function(){var b=new Tc(a);cd(this,b)},this)};
	var cd=function(a,b){if(0==a.G)if(a.m){var c=a.m;if(c.ga){for(var d=0,e=null,f=null,g=c.ga;g&&(g.ib||(d++,g.child==a&&(e=g),!(e&&1<d)));g=g.next)e||(f=g);e&&(0==c.G&&1==d?cd(c,b):(f?(d=f,w(c.ga),w(null!=d),d.next==c.La&&(c.La=d),d.next=d.next.next):dd(c),ed(c,e,3,b)))}a.m=null}else Sc(a,3,b)},ad=function(a,b){a.ga||2!=a.G&&3!=a.G||fd(a);w(null!=b.Da);a.La?a.La.next=b:a.ga=b;a.La=b},$c=function(a,b,c,d){var e=Wc(null,null,null);e.child=new C(function(a,g){e.Da=b?function(c){try{var e=b.call(d,c);a(e)}catch(oa){g(oa)}}:
	a;e.Ra=c?function(b){try{var e=c.call(d,b);void 0===e&&b instanceof Tc?g(b):a(e)}catch(oa){g(oa)}}:g});e.child.m=a;ad(a,e);return e.child};C.prototype.Qe=function(a){w(1==this.G);this.G=0;Sc(this,2,a)};C.prototype.Re=function(a){w(1==this.G);this.G=0;Sc(this,3,a)};
	var Sc=function(a,b,c){0==a.G&&(a===c&&(b=3,c=new TypeError("Promise cannot resolve to itself")),a.G=1,Xc(c,a.Qe,a.Re,a)||(a.la=c,a.G=b,a.m=null,fd(a),3!=b||c instanceof Tc||gd(a,c)))},Xc=function(a,b,c,d){if(a instanceof C)return null!=b&&Ca(b,"opt_onFulfilled should be a function."),null!=c&&Ca(c,"opt_onRejected should be a function. Did you pass opt_context as the second argument instead of the third?"),ad(a,Wc(b||ba,c||null,d)),!0;if(Rc(a))return a.then(b,c,d),!0;if(ha(a))try{var e=a.then;if(p(e))return hd(a,
	e,b,c,d),!0}catch(f){return c.call(d,f),!0}return!1},hd=function(a,b,c,d,e){var f=!1,g=function(a){f||(f=!0,c.call(e,a))},k=function(a){f||(f=!0,d.call(e,a))};try{b.call(a,g,k)}catch(v){k(v)}},fd=function(a){a.tc||(a.tc=!0,Oc(a.Zd,a))},dd=function(a){var b=null;a.ga&&(b=a.ga,a.ga=b.next,b.next=null);a.ga||(a.La=null);null!=b&&w(null!=b.Da);return b};C.prototype.Zd=function(){for(var a;a=dd(this);)ed(this,a,this.G,this.la);this.tc=!1};
	var ed=function(a,b,c,d){if(3==c&&b.Ra&&!b.ib)for(;a&&a.Hb;a=a.m)a.Hb=!1;if(b.child)b.child.m=null,id(b,c,d);else try{b.ib?b.Da.call(b.context):id(b,c,d)}catch(e){jd.call(null,e)}Vc.put(b)},id=function(a,b,c){2==b?a.Da.call(a.context,c):a.Ra&&a.Ra.call(a.context,c)},gd=function(a,b){a.Hb=!0;Oc(function(){a.Hb&&jd.call(null,b)})},jd=Ec,Tc=function(a){t.call(this,a)};r(Tc,t);Tc.prototype.name="cancel";/*
	 Portions of this code are from MochiKit, received by
	 The Closure Authors under the MIT license. All other code is Copyright
	 2005-2009 The Closure Authors. All Rights Reserved.
	*/
	var F=function(a,b){this.bc=[];this.od=a;this.bd=b||null;this.nb=this.Pa=!1;this.la=void 0;this.Pc=this.Uc=this.oc=!1;this.ic=0;this.m=null;this.pc=0};F.prototype.cancel=function(a){if(this.Pa)this.la instanceof F&&this.la.cancel();else{if(this.m){var b=this.m;delete this.m;a?b.cancel(a):(b.pc--,0>=b.pc&&b.cancel())}this.od?this.od.call(this.bd,this):this.Pc=!0;this.Pa||kd(this,new ld)}};F.prototype.$c=function(a,b){this.oc=!1;md(this,a,b)};
	var md=function(a,b,c){a.Pa=!0;a.la=c;a.nb=!b;nd(a)},pd=function(a){if(a.Pa){if(!a.Pc)throw new od;a.Pc=!1}};F.prototype.callback=function(a){pd(this);qd(a);md(this,!0,a)};
	var kd=function(a,b){pd(a);qd(b);md(a,!1,b)},qd=function(a){w(!(a instanceof F),"An execution sequence may not be initiated with a blocking Deferred.")},ud=function(a){var b=rd("https://apis.google.com/js/client.js?onload="+sd);td(b,null,a,void 0)},td=function(a,b,c,d){w(!a.Uc,"Blocking Deferreds can not be re-used");a.bc.push([b,c,d]);a.Pa&&nd(a)};F.prototype.then=function(a,b,c){var d,e,f=new C(function(a,b){d=a;e=b});td(this,d,function(a){a instanceof ld?f.cancel():e(a)});return f.then(a,b,c)};
	Qc(F);
	var vd=function(a){return Ga(a.bc,function(a){return p(a[1])})},nd=function(a){if(a.ic&&a.Pa&&vd(a)){var b=a.ic,c=wd[b];c&&(l.clearTimeout(c.ob),delete wd[b]);a.ic=0}a.m&&(a.m.pc--,delete a.m);for(var b=a.la,d=c=!1;a.bc.length&&!a.oc;){var e=a.bc.shift(),f=e[0],g=e[1],e=e[2];if(f=a.nb?g:f)try{var k=f.call(e||a.bd,b);void 0!==k&&(a.nb=a.nb&&(k==b||k instanceof Error),a.la=b=k);if(Rc(b)||"function"===typeof l.Promise&&b instanceof l.Promise)d=!0,a.oc=!0}catch(v){b=v,a.nb=!0,vd(a)||(c=!0)}}a.la=b;d&&
	(k=q(a.$c,a,!0),d=q(a.$c,a,!1),b instanceof F?(td(b,k,d),b.Uc=!0):b.then(k,d));c&&(b=new xd(b),wd[b.ob]=b,a.ic=b.ob)},od=function(){t.call(this)};r(od,t);od.prototype.message="Deferred has already fired";od.prototype.name="AlreadyCalledError";var ld=function(){t.call(this)};r(ld,t);ld.prototype.message="Deferred was canceled";ld.prototype.name="CanceledError";var xd=function(a){this.ob=l.setTimeout(q(this.Pe,this),0);this.K=a};
	xd.prototype.Pe=function(){w(wd[this.ob],"Cannot throw an error that is not scheduled.");delete wd[this.ob];throw this.K;};var wd={};var rd=function(a){var b=new xc;b.Ub=a;return yd(b)},yd=function(a){var b={},c=b.document||document,d;a instanceof xc&&a.constructor===xc&&a.Nd===wc?d=a.Ub:(za("expected object of type TrustedResourceUrl, got '"+a+"' of type "+m(a)),d="type_error:TrustedResourceUrl");var e=document.createElement("SCRIPT");a={vd:e,yb:void 0};var f=new F(zd,a),g=null,k=null!=b.timeout?b.timeout:5E3;0<k&&(g=window.setTimeout(function(){Ad(e,!0);kd(f,new Bd(1,"Timeout reached for loading script "+d))},k),a.yb=g);e.onload=
	e.onreadystatechange=function(){e.readyState&&"loaded"!=e.readyState&&"complete"!=e.readyState||(Ad(e,b.af||!1,g),f.callback(null))};e.onerror=function(){Ad(e,!0,g);kd(f,new Bd(0,"Error while loading script "+d))};a=b.attributes||{};Wa(a,{type:"text/javascript",charset:"UTF-8",src:d});Cc(e,a);Cd(c).appendChild(e);return f},Cd=function(a){var b;return(b=(a||document).getElementsByTagName("HEAD"))&&0!=b.length?b[0]:a.documentElement},zd=function(){if(this&&this.vd){var a=this.vd;a&&"SCRIPT"==a.tagName&&
	Ad(a,!0,this.yb)}},Ad=function(a,b,c){null!=c&&l.clearTimeout(c);a.onload=ba;a.onerror=ba;a.onreadystatechange=ba;b&&window.setTimeout(function(){a&&a.parentNode&&a.parentNode.removeChild(a)},0)},Bd=function(a,b){var c="Jsloader error (code #"+a+")";b&&(c+=": "+b);t.call(this,c);this.code=a};r(Bd,t);var G=function(){wb.call(this);this.$=new Db(this);this.Qd=this;this.Ec=null};r(G,wb);G.prototype[zb]=!0;h=G.prototype;h.addEventListener=function(a,b,c,d){Jb(this,a,b,c,d)};h.removeEventListener=function(a,b,c,d){Sb(this,a,b,c,d)};
	h.dispatchEvent=function(a){Dd(this);var b,c=this.Ec;if(c){b=[];for(var d=1;c;c=c.Ec)b.push(c),w(1E3>++d,"infinite loop")}c=this.Qd;d=a.type||a;if(n(a))a=new xb(a,c);else if(a instanceof xb)a.target=a.target||c;else{var e=a;a=new xb(d,c);Wa(a,e)}var e=!0,f;if(b)for(var g=b.length-1;!a.Ua&&0<=g;g--)f=a.currentTarget=b[g],e=Ed(f,d,!0,a)&&e;a.Ua||(f=a.currentTarget=c,e=Ed(f,d,!0,a)&&e,a.Ua||(e=Ed(f,d,!1,a)&&e));if(b)for(g=0;!a.Ua&&g<b.length;g++)f=a.currentTarget=b[g],e=Ed(f,d,!1,a)&&e;return e};
	h.Na=function(){G.Rc.Na.call(this);if(this.$){var a=this.$,b=0,c;for(c in a.v){for(var d=a.v[c],e=0;e<d.length;e++)++b,Cb(d[e]);delete a.v[c];a.zb--}}this.Ec=null};h.listen=function(a,b,c,d){Dd(this);return this.$.add(String(a),b,!1,c,d)};
	var Rb=function(a,b,c,d,e){a.$.add(String(b),c,!0,d,e)},Ed=function(a,b,c,d){b=a.$.v[String(b)];if(!b)return!0;b=b.concat();for(var e=!0,f=0;f<b.length;++f){var g=b[f];if(g&&!g.Za&&g.capture==c){var k=g.listener,v=g.Ib||g.src;g.Cb&&Fb(a.$,g);e=!1!==k.call(v,d)&&e}}return e&&0!=d.ud};G.prototype.vc=function(a,b,c,d){return this.$.vc(String(a),b,c,d)};var Dd=function(a){w(a.$,"Event target is not initialized. Did you call the superclass (goog.events.EventTarget) constructor?")};var Fd="StopIteration"in l?l.StopIteration:{message:"StopIteration",stack:""},Gd=function(){};Gd.prototype.next=function(){throw Fd;};Gd.prototype.Pd=function(){return this};var H=function(a,b){this.aa={};this.s=[];this.hb=this.l=0;var c=arguments.length;if(1<c){if(c%2)throw Error("Uneven number of arguments");for(var d=0;d<c;d+=2)this.set(arguments[d],arguments[d+1])}else a&&this.addAll(a)};H.prototype.V=function(){Hd(this);for(var a=[],b=0;b<this.s.length;b++)a.push(this.aa[this.s[b]]);return a};H.prototype.ia=function(){Hd(this);return this.s.concat()};H.prototype.jb=function(a){return Id(this.aa,a)};
	H.prototype.remove=function(a){return Id(this.aa,a)?(delete this.aa[a],this.l--,this.hb++,this.s.length>2*this.l&&Hd(this),!0):!1};var Hd=function(a){if(a.l!=a.s.length){for(var b=0,c=0;b<a.s.length;){var d=a.s[b];Id(a.aa,d)&&(a.s[c++]=d);b++}a.s.length=c}if(a.l!=a.s.length){for(var e={},c=b=0;b<a.s.length;)d=a.s[b],Id(e,d)||(a.s[c++]=d,e[d]=1),b++;a.s.length=c}};h=H.prototype;h.get=function(a,b){return Id(this.aa,a)?this.aa[a]:b};
	h.set=function(a,b){Id(this.aa,a)||(this.l++,this.s.push(a),this.hb++);this.aa[a]=b};h.addAll=function(a){var b;a instanceof H?(b=a.ia(),a=a.V()):(b=Ra(a),a=Qa(a));for(var c=0;c<b.length;c++)this.set(b[c],a[c])};h.forEach=function(a,b){for(var c=this.ia(),d=0;d<c.length;d++){var e=c[d],f=this.get(e);a.call(b,f,e,this)}};h.clone=function(){return new H(this)};
	h.Pd=function(a){Hd(this);var b=0,c=this.hb,d=this,e=new Gd;e.next=function(){if(c!=d.hb)throw Error("The map has changed since the iterator was created");if(b>=d.s.length)throw Fd;var e=d.s[b++];return a?e:d.aa[e]};return e};var Id=function(a,b){return Object.prototype.hasOwnProperty.call(a,b)};var Jd=function(a){if(a.V&&"function"==typeof a.V)return a.V();if(n(a))return a.split("");if(fa(a)){for(var b=[],c=a.length,d=0;d<c;d++)b.push(a[d]);return b}return Qa(a)},Kd=function(a){if(a.ia&&"function"==typeof a.ia)return a.ia();if(!a.V||"function"!=typeof a.V){if(fa(a)||n(a)){var b=[];a=a.length;for(var c=0;c<a;c++)b.push(c);return b}return Ra(a)}},Ld=function(a,b){if(a.forEach&&"function"==typeof a.forEach)a.forEach(b,void 0);else if(fa(a)||n(a))x(a,b,void 0);else for(var c=Kd(a),d=Jd(a),e=
	d.length,f=0;f<e;f++)b.call(void 0,d[f],c&&c[f],a)};var Md=function(a,b,c,d,e){this.reset(a,b,c,d,e)};Md.prototype.dd=null;var Nd=0;Md.prototype.reset=function(a,b,c,d,e){"number"==typeof e||Nd++;d||la();this.rb=a;this.ze=b;delete this.dd};Md.prototype.yd=function(a){this.rb=a};var Od=function(a){this.Ae=a;this.hd=this.qc=this.rb=this.m=null},Pd=function(a,b){this.name=a;this.value=b};Pd.prototype.toString=function(){return this.name};var Qd=new Pd("SEVERE",1E3),Rd=new Pd("CONFIG",700),Sd=new Pd("FINE",500);Od.prototype.getParent=function(){return this.m};Od.prototype.yd=function(a){this.rb=a};var Td=function(a){if(a.rb)return a.rb;if(a.m)return Td(a.m);za("Root logger has no level set.");return null};
	Od.prototype.log=function(a,b,c){if(a.value>=Td(this).value)for(p(b)&&(b=b()),a=new Md(a,String(b),this.Ae),c&&(a.dd=c),c="log:"+a.ze,l.console&&(l.console.timeStamp?l.console.timeStamp(c):l.console.markTimeline&&l.console.markTimeline(c)),l.msWriteProfilerMark&&l.msWriteProfilerMark(c),c=this;c;){b=c;var d=a;if(b.hd)for(var e=0,f;f=b.hd[e];e++)f(d);c=c.getParent()}};
	var Ud={},Vd=null,Wd=function(a){Vd||(Vd=new Od(""),Ud[""]=Vd,Vd.yd(Rd));var b;if(!(b=Ud[a])){b=new Od(a);var c=a.lastIndexOf("."),d=a.substr(c+1),c=Wd(a.substr(0,c));c.qc||(c.qc={});c.qc[d]=b;b.m=c;Ud[a]=b}return b};var I=function(a,b){a&&a.log(Sd,b,void 0)};var Xd=function(a,b,c){if(p(a))c&&(a=q(a,c));else if(a&&"function"==typeof a.handleEvent)a=q(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(b)?-1:l.setTimeout(a,b||0)},Yd=function(a){var b=null;return(new C(function(c,d){b=Xd(function(){c(void 0)},a);-1==b&&d(Error("Failed to schedule timer."))})).h(function(a){l.clearTimeout(b);throw a;})};var Zd=/^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#([\s\S]*))?$/,$d=function(a,b){if(a){a=a.split("&");for(var c=0;c<a.length;c++){var d=a[c].indexOf("="),e,f=null;0<=d?(e=a[c].substring(0,d),f=a[c].substring(d+1)):e=a[c];b(e,f?decodeURIComponent(f.replace(/\+/g," ")):"")}}};var J=function(a){G.call(this);this.headers=new H;this.mc=a||null;this.oa=!1;this.lc=this.b=null;this.qb=this.md=this.Pb="";this.Ba=this.yc=this.Mb=this.sc=!1;this.eb=0;this.hc=null;this.td="";this.jc=this.Fe=this.Gd=!1};r(J,G);var ae=J.prototype,be=Wd("goog.net.XhrIo");ae.R=be;var ce=/^https?$/i,de=["POST","PUT"];
	J.prototype.send=function(a,b,c,d){if(this.b)throw Error("[goog.net.XhrIo] Object is active with another request="+this.Pb+"; newUri="+a);b=b?b.toUpperCase():"GET";this.Pb=a;this.qb="";this.md=b;this.sc=!1;this.oa=!0;this.b=this.mc?this.mc.kb():qc.kb();this.lc=this.mc?pc(this.mc):pc(qc);this.b.onreadystatechange=q(this.qd,this);this.Fe&&"onprogress"in this.b&&(this.b.onprogress=q(function(a){this.pd(a,!0)},this),this.b.upload&&(this.b.upload.onprogress=q(this.pd,this)));try{I(this.R,ee(this,"Opening Xhr")),
	this.yc=!0,this.b.open(b,String(a),!0),this.yc=!1}catch(f){I(this.R,ee(this,"Error opening Xhr: "+f.message));this.K(5,f);return}a=c||"";var e=this.headers.clone();d&&Ld(d,function(a,b){e.set(b,a)});d=Ia(e.ia());c=l.FormData&&a instanceof l.FormData;!Ja(de,b)||d||c||e.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");e.forEach(function(a,b){this.b.setRequestHeader(b,a)},this);this.td&&(this.b.responseType=this.td);"withCredentials"in this.b&&this.b.withCredentials!==this.Gd&&(this.b.withCredentials=
	this.Gd);try{fe(this),0<this.eb&&(this.jc=ge(this.b),I(this.R,ee(this,"Will abort after "+this.eb+"ms if incomplete, xhr2 "+this.jc)),this.jc?(this.b.timeout=this.eb,this.b.ontimeout=q(this.yb,this)):this.hc=Xd(this.yb,this.eb,this)),I(this.R,ee(this,"Sending request")),this.Mb=!0,this.b.send(a),this.Mb=!1}catch(f){I(this.R,ee(this,"Send error: "+f.message)),this.K(5,f)}};var ge=function(a){return z&&A(9)&&ga(a.timeout)&&void 0!==a.ontimeout},Ha=function(a){return"content-type"==a.toLowerCase()};
	J.prototype.yb=function(){"undefined"!=typeof aa&&this.b&&(this.qb="Timed out after "+this.eb+"ms, aborting",I(this.R,ee(this,this.qb)),this.dispatchEvent("timeout"),this.abort(8))};J.prototype.K=function(a,b){this.oa=!1;this.b&&(this.Ba=!0,this.b.abort(),this.Ba=!1);this.qb=b;he(this);ie(this)};var he=function(a){a.sc||(a.sc=!0,a.dispatchEvent("complete"),a.dispatchEvent("error"))};
	J.prototype.abort=function(){this.b&&this.oa&&(I(this.R,ee(this,"Aborting")),this.oa=!1,this.Ba=!0,this.b.abort(),this.Ba=!1,this.dispatchEvent("complete"),this.dispatchEvent("abort"),ie(this))};J.prototype.Na=function(){this.b&&(this.oa&&(this.oa=!1,this.Ba=!0,this.b.abort(),this.Ba=!1),ie(this,!0));J.Rc.Na.call(this)};J.prototype.qd=function(){this.isDisposed()||(this.yc||this.Mb||this.Ba?je(this):this.De())};J.prototype.De=function(){je(this)};
	var je=function(a){if(a.oa&&"undefined"!=typeof aa)if(a.lc[1]&&4==ke(a)&&2==le(a))I(a.R,ee(a,"Local request error detected and ignored"));else if(a.Mb&&4==ke(a))Xd(a.qd,0,a);else if(a.dispatchEvent("readystatechange"),4==ke(a)){I(a.R,ee(a,"Request complete"));a.oa=!1;try{var b=le(a),c;a:switch(b){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:c=!0;break a;default:c=!1}var d;if(!(d=c)){var e;if(e=0===b){var f=String(a.Pb).match(Zd)[1]||null;if(!f&&l.self&&l.self.location)var g=l.self.location.protocol,
	f=g.substr(0,g.length-1);e=!ce.test(f?f.toLowerCase():"")}d=e}if(d)a.dispatchEvent("complete"),a.dispatchEvent("success");else{var k;try{k=2<ke(a)?a.b.statusText:""}catch(v){I(a.R,"Can not get status: "+v.message),k=""}a.qb=k+" ["+le(a)+"]";he(a)}}finally{ie(a)}}};J.prototype.pd=function(a,b){w("progress"===a.type,"goog.net.EventType.PROGRESS is of the same type as raw XHR progress.");this.dispatchEvent(me(a,"progress"));this.dispatchEvent(me(a,b?"downloadprogress":"uploadprogress"))};
	var me=function(a,b){return{type:b,lengthComputable:a.lengthComputable,loaded:a.loaded,total:a.total}},ie=function(a,b){if(a.b){fe(a);var c=a.b,d=a.lc[0]?ba:null;a.b=null;a.lc=null;b||a.dispatchEvent("ready");try{c.onreadystatechange=d}catch(e){(a=a.R)&&a.log(Qd,"Problem encountered resetting onreadystatechange: "+e.message,void 0)}}},fe=function(a){a.b&&a.jc&&(a.b.ontimeout=null);ga(a.hc)&&(l.clearTimeout(a.hc),a.hc=null)},ke=function(a){return a.b?a.b.readyState:0},le=function(a){try{return 2<ke(a)?
	a.b.status:-1}catch(b){return-1}},ne=function(a){try{return a.b?a.b.responseText:""}catch(b){return I(a.R,"Can not get responseText: "+b.message),""}},ee=function(a,b){return b+" ["+a.md+" "+a.Pb+" "+le(a)+"]"};var oe=function(a,b){this.ha=this.Ga=this.ca="";this.Ta=null;this.Aa=this.qa="";this.N=this.te=!1;var c;a instanceof oe?(this.N=void 0!==b?b:a.N,pe(this,a.ca),c=a.Ga,K(this),this.Ga=c,qe(this,a.ha),re(this,a.Ta),se(this,a.qa),te(this,a.Y.clone()),a=a.Aa,K(this),this.Aa=a):a&&(c=String(a).match(Zd))?(this.N=!!b,pe(this,c[1]||"",!0),a=c[2]||"",K(this),this.Ga=ue(a),qe(this,c[3]||"",!0),re(this,c[4]),se(this,c[5]||"",!0),te(this,c[6]||"",!0),a=c[7]||"",K(this),this.Aa=ue(a)):(this.N=!!b,this.Y=new L(null,
	0,this.N))};oe.prototype.toString=function(){var a=[],b=this.ca;b&&a.push(ve(b,we,!0),":");var c=this.ha;if(c||"file"==b)a.push("//"),(b=this.Ga)&&a.push(ve(b,we,!0),"@"),a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c=this.Ta,null!=c&&a.push(":",String(c));if(c=this.qa)this.ha&&"/"!=c.charAt(0)&&a.push("/"),a.push(ve(c,"/"==c.charAt(0)?xe:ye,!0));(c=this.Y.toString())&&a.push("?",c);(c=this.Aa)&&a.push("#",ve(c,ze));return a.join("")};
	oe.prototype.resolve=function(a){var b=this.clone(),c=!!a.ca;c?pe(b,a.ca):c=!!a.Ga;if(c){var d=a.Ga;K(b);b.Ga=d}else c=!!a.ha;c?qe(b,a.ha):c=null!=a.Ta;d=a.qa;if(c)re(b,a.Ta);else if(c=!!a.qa){if("/"!=d.charAt(0))if(this.ha&&!this.qa)d="/"+d;else{var e=b.qa.lastIndexOf("/");-1!=e&&(d=b.qa.substr(0,e+1)+d)}e=d;if(".."==e||"."==e)d="";else if(u(e,"./")||u(e,"/.")){for(var d=0==e.lastIndexOf("/",0),e=e.split("/"),f=[],g=0;g<e.length;){var k=e[g++];"."==k?d&&g==e.length&&f.push(""):".."==k?((1<f.length||
	1==f.length&&""!=f[0])&&f.pop(),d&&g==e.length&&f.push("")):(f.push(k),d=!0)}d=f.join("/")}else d=e}c?se(b,d):c=""!==a.Y.toString();c?te(b,a.Y.clone()):c=!!a.Aa;c&&(a=a.Aa,K(b),b.Aa=a);return b};oe.prototype.clone=function(){return new oe(this)};
	var pe=function(a,b,c){K(a);a.ca=c?ue(b,!0):b;a.ca&&(a.ca=a.ca.replace(/:$/,""))},qe=function(a,b,c){K(a);a.ha=c?ue(b,!0):b},re=function(a,b){K(a);if(b){b=Number(b);if(isNaN(b)||0>b)throw Error("Bad port number "+b);a.Ta=b}else a.Ta=null},se=function(a,b,c){K(a);a.qa=c?ue(b,!0):b},te=function(a,b,c){K(a);b instanceof L?(a.Y=b,a.Y.Oc(a.N)):(c||(b=ve(b,Ae)),a.Y=new L(b,0,a.N))},M=function(a,b,c){K(a);a.Y.set(b,c)},Be=function(a,b){K(a);a.Y.remove(b)},K=function(a){if(a.te)throw Error("Tried to modify a read-only Uri");
	};oe.prototype.Oc=function(a){this.N=a;this.Y&&this.Y.Oc(a);return this};
	var Ce=function(a){return a instanceof oe?a.clone():new oe(a,void 0)},De=function(a,b){var c=new oe(null,void 0);pe(c,"https");a&&qe(c,a);b&&se(c,b);return c},ue=function(a,b){return a?b?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""},ve=function(a,b,c){return n(a)?(a=encodeURI(a).replace(b,Ee),c&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null},Ee=function(a){a=a.charCodeAt(0);return"%"+(a>>4&15).toString(16)+(a&15).toString(16)},we=/[#\/\?@]/g,ye=/[\#\?:]/g,xe=/[\#\?]/g,Ae=/[\#\?@]/g,
	ze=/#/g,L=function(a,b,c){this.l=this.g=null;this.J=a||null;this.N=!!c},Fe=function(a){a.g||(a.g=new H,a.l=0,a.J&&$d(a.J,function(b,c){a.add(decodeURIComponent(b.replace(/\+/g," ")),c)}))},He=function(a){var b=Kd(a);if("undefined"==typeof b)throw Error("Keys are undefined");var c=new L(null,0,void 0);a=Jd(a);for(var d=0;d<b.length;d++){var e=b[d],f=a[d];ea(f)?Ge(c,e,f):c.add(e,f)}return c};h=L.prototype;
	h.add=function(a,b){Fe(this);this.J=null;a=this.M(a);var c=this.g.get(a);c||this.g.set(a,c=[]);c.push(b);this.l=Aa(this.l)+1;return this};h.remove=function(a){Fe(this);a=this.M(a);return this.g.jb(a)?(this.J=null,this.l=Aa(this.l)-this.g.get(a).length,this.g.remove(a)):!1};h.jb=function(a){Fe(this);a=this.M(a);return this.g.jb(a)};h.ia=function(){Fe(this);for(var a=this.g.V(),b=this.g.ia(),c=[],d=0;d<b.length;d++)for(var e=a[d],f=0;f<e.length;f++)c.push(b[d]);return c};
	h.V=function(a){Fe(this);var b=[];if(n(a))this.jb(a)&&(b=Na(b,this.g.get(this.M(a))));else{a=this.g.V();for(var c=0;c<a.length;c++)b=Na(b,a[c])}return b};h.set=function(a,b){Fe(this);this.J=null;a=this.M(a);this.jb(a)&&(this.l=Aa(this.l)-this.g.get(a).length);this.g.set(a,[b]);this.l=Aa(this.l)+1;return this};h.get=function(a,b){a=a?this.V(a):[];return 0<a.length?String(a[0]):b};var Ge=function(a,b,c){a.remove(b);0<c.length&&(a.J=null,a.g.set(a.M(b),Oa(c)),a.l=Aa(a.l)+c.length)};
	L.prototype.toString=function(){if(this.J)return this.J;if(!this.g)return"";for(var a=[],b=this.g.ia(),c=0;c<b.length;c++)for(var d=b[c],e=encodeURIComponent(String(d)),d=this.V(d),f=0;f<d.length;f++){var g=e;""!==d[f]&&(g+="="+encodeURIComponent(String(d[f])));a.push(g)}return this.J=a.join("&")};L.prototype.clone=function(){var a=new L;a.J=this.J;this.g&&(a.g=this.g.clone(),a.l=this.l);return a};L.prototype.M=function(a){a=String(a);this.N&&(a=a.toLowerCase());return a};
	L.prototype.Oc=function(a){a&&!this.N&&(Fe(this),this.J=null,this.g.forEach(function(a,c){var b=c.toLowerCase();c!=b&&(this.remove(c),Ge(this,b,a))},this));this.N=a};var Ie=function(){var a=N();return z&&!!nb&&11==nb||/Edge\/\d+/.test(a)},Je=function(){return l.window&&l.window.location.href||""},Ke=function(a,b){var c=[],d;for(d in a)d in b?typeof a[d]!=typeof b[d]?c.push(d):ea(a[d])?Ta(a[d],b[d])||c.push(d):"object"==typeof a[d]&&null!=a[d]&&null!=b[d]?0<Ke(a[d],b[d]).length&&c.push(d):a[d]!==b[d]&&c.push(d):c.push(d);for(d in b)d in a||c.push(d);return c},Me=function(){var a;a=N();a="Chrome"!=Le(a)?null:(a=a.match(/\sChrome\/(\d+)/i))&&2==a.length?parseInt(a[1],
	10):null;return a&&30>a?!1:!z||!nb||9<nb},Ne=function(a){a=(a||N()).toLowerCase();return a.match(/android/)||a.match(/webos/)||a.match(/iphone|ipad|ipod/)||a.match(/blackberry/)||a.match(/windows phone/)||a.match(/iemobile/)?!0:!1},Oe=function(a){a=a||l.window;try{a.close()}catch(b){}},Pe=function(a,b,c){var d=Math.floor(1E9*Math.random()).toString();b=b||500;c=c||600;var e=(window.screen.availHeight-c)/2,f=(window.screen.availWidth-b)/2;b={width:b,height:c,top:0<e?e:0,left:0<f?f:0,location:!0,resizable:!0,
	statusbar:!0,toolbar:!1};c=N().toLowerCase();d&&(b.target=d,u(c,"crios/")&&(b.target="_blank"));"Firefox"==Le(N())&&(a=a||"http://localhost",b.scrollbars=!0);var g;c=a||"about:blank";(d=b)||(d={});a=window;b=c instanceof B?c:fc("undefined"!=typeof c.href?c.href:String(c));c=d.target||c.target;e=[];for(g in d)switch(g){case "width":case "height":case "top":case "left":e.push(g+"="+d[g]);break;case "target":case "noreferrer":break;default:e.push(g+"="+(d[g]?1:0))}g=e.join(",");(y("iPhone")&&!y("iPod")&&
	!y("iPad")||y("iPad")||y("iPod"))&&a.navigator&&a.navigator.standalone&&c&&"_self"!=c?(g=a.document.createElement("A"),"undefined"!=typeof HTMLAnchorElement&&"undefined"!=typeof Location&&"undefined"!=typeof Element&&(e=g&&(g instanceof HTMLAnchorElement||!(g instanceof Location||g instanceof Element)),f=ha(g)?g.constructor.displayName||g.constructor.name||Object.prototype.toString.call(g):void 0===g?"undefined":null===g?"null":typeof g,w(e,"Argument is not a HTMLAnchorElement (or a non-Element mock); got: %s",
	f)),b=b instanceof B?b:fc(b),g.href=cc(b),g.setAttribute("target",c),d.noreferrer&&g.setAttribute("rel","noreferrer"),d=document.createEvent("MouseEvent"),d.initMouseEvent("click",!0,!0,a,1),g.dispatchEvent(d),g={}):d.noreferrer?(g=a.open("",c,g),d=cc(b),g&&(eb&&u(d,";")&&(d="'"+d.replace(/'/g,"%27")+"'"),g.opener=null,a=ac("b/12014412, meta tag with sanitized URL"),va.test(d)&&(-1!=d.indexOf("&")&&(d=d.replace(pa,"&amp;")),-1!=d.indexOf("<")&&(d=d.replace(qa,"&lt;")),-1!=d.indexOf(">")&&(d=d.replace(ra,
	"&gt;")),-1!=d.indexOf('"')&&(d=d.replace(sa,"&quot;")),-1!=d.indexOf("'")&&(d=d.replace(ta,"&#39;")),-1!=d.indexOf("\x00")&&(d=d.replace(ua,"&#0;"))),d='<META HTTP-EQUIV="refresh" content="0; url='+d+'">',Ba($b(a),"must provide justification"),w(!/^[\s\xa0]*$/.test($b(a)),"must provide non-empty justification"),g.document.write(Ac((new zc).re(d))),g.document.close())):g=a.open(cc(b),c,g);if(g)try{g.focus()}catch(k){}return g},Qe=function(a){return new C(function(b){var c=function(){Yd(2E3).then(function(){if(!a||
	a.closed)b();else return c()})};return c()})},Re=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Se=function(){var a=null;return(new C(function(b){"complete"==l.document.readyState?b():(a=function(){b()},Qb(window,"load",a))})).h(function(b){Sb(window,"load",a);throw b;})},O=function(a){switch(a||l.navigator&&l.navigator.product||""){case "ReactNative":return"ReactNative";default:return"undefined"!==typeof l.process?"Node":"Browser"}},Te=function(){var a=O();return"ReactNative"===a||"Node"===a},Le=function(a){var b=
	a.toLowerCase();if(u(b,"opera/")||u(b,"opr/")||u(b,"opios/"))return"Opera";if(u(b,"iemobile"))return"IEMobile";if(u(b,"msie")||u(b,"trident/"))return"IE";if(u(b,"edge/"))return"Edge";if(u(b,"firefox/"))return"Firefox";if(u(b,"silk/"))return"Silk";if(u(b,"blackberry"))return"Blackberry";if(u(b,"webos"))return"Webos";if(!u(b,"safari/")||u(b,"chrome/")||u(b,"crios/")||u(b,"android"))if(!u(b,"chrome/")&&!u(b,"crios/")||u(b,"edge/")){if(u(b,"android"))return"Android";if((a=a.match(/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/))&&
	2==a.length)return a[1]}else return"Chrome";else return"Safari";return"Other"},Ue=function(a){var b=O(void 0);return("Browser"===b?Le(N()):b)+"/JsCore/"+a},N=function(){return l.navigator&&l.navigator.userAgent||""},Ve=function(a){a=a.split(".");for(var b=l,c=0;c<a.length&&"object"==typeof b&&null!=b;c++)b=b[a[c]];c!=a.length&&(b=void 0);return b},Xe=function(){var a;if(!(a=!l.location||!l.location.protocol||"http:"!=l.location.protocol&&"https:"!=l.location.protocol||Te())){var b;a:{try{var c=l.localStorage,
	d=We();if(c){c.setItem(d,"1");c.removeItem(d);b=Ie()?!!l.indexedDB:!0;break a}}catch(e){}b=!1}a=!b}return!a},Ye=function(a){a=a||N();return Ne(a)||"Firefox"==Le(a)?!1:!0},Ze=function(a){return"undefined"===typeof a?null:kc(a)},$e=function(a){var b={},c;for(c in a)a.hasOwnProperty(c)&&null!==a[c]&&void 0!==a[c]&&(b[c]=a[c]);return b},af=function(a){if(null!==a){var b;try{b=hc(a)}catch(c){try{b=JSON.parse(a)}catch(d){throw c;}}return b}},We=function(a){return a?a:""+Math.floor(1E9*Math.random()).toString()},
	bf=function(a){a=a||N();return"Safari"==Le(a)||a.toLowerCase().match(/iphone|ipad|ipod/)?!1:!0},cf=function(){var a=l.___jsl;if(a&&a.H)for(var b in a.H)if(a.H[b].r=a.H[b].r||[],a.H[b].L=a.H[b].L||[],a.H[b].r=a.H[b].L.concat(),a.CP)for(var c=0;c<a.CP.length;c++)a.CP[c]=null},df=function(a,b,c,d){if(a>b)throw Error("Short delay should be less than long delay!");this.Me=a;this.ye=b;a=d||O();this.se=Ne(c||N())||"ReactNative"===a};df.prototype.get=function(){return this.se?this.ye:this.Me};var ef;try{var ff={};Object.defineProperty(ff,"abcd",{configurable:!0,enumerable:!0,value:1});Object.defineProperty(ff,"abcd",{configurable:!0,enumerable:!0,value:2});ef=2==ff.abcd}catch(a){ef=!1}
	var P=function(a,b,c){ef?Object.defineProperty(a,b,{configurable:!0,enumerable:!0,value:c}):a[b]=c},gf=function(a,b){if(b)for(var c in b)b.hasOwnProperty(c)&&P(a,c,b[c])},hf=function(a){var b={},c;for(c in a)a.hasOwnProperty(c)&&(b[c]=a[c]);return b},jf=function(a,b){if(!b||!b.length)return!0;if(!a)return!1;for(var c=0;c<b.length;c++){var d=a[b[c]];if(void 0===d||null===d||""===d)return!1}return!0},kf=function(a){var b=a;if("object"==typeof a&&null!=a){var b="length"in a?[]:{},c;for(c in a)P(b,c,
	kf(a[c]))}return b};var lf=["client_id","response_type","scope","redirect_uri","state"],mf={Hd:{ub:500,tb:600,providerId:"facebook.com",ac:lf},Id:{ub:500,tb:620,providerId:"github.com",ac:lf},Jd:{ub:515,tb:680,providerId:"google.com",ac:lf},Od:{ub:485,tb:705,providerId:"twitter.com",ac:"oauth_consumer_key oauth_nonce oauth_signature oauth_signature_method oauth_timestamp oauth_token oauth_version".split(" ")}},nf=function(a){for(var b in mf)if(mf[b].providerId==a)return mf[b];return null},of=function(a){return(a=nf(a))&&
	a.ac||[]};var Q=function(a,b){this.code="auth/"+a;this.message=b||pf[a]||""};r(Q,Error);Q.prototype.I=function(){return{name:this.code,code:this.code,message:this.message}};
	var pf={"argument-error":"","app-not-authorized":"This app, identified by the domain where it's hosted, is not authorized to use Firebase Authentication with the provided API key. Review your key configuration in the Google API console.","cors-unsupported":"This browser is not supported.","credential-already-in-use":"This credential is already associated with a different user account.","custom-token-mismatch":"The custom token corresponds to a different audience.","requires-recent-login":"This operation is sensitive and requires recent authentication. Log in again before retrying this request.",
	"email-already-in-use":"The email address is already in use by another account.","expired-action-code":"The action code has expired. ","cancelled-popup-request":"This operation has been cancelled due to another conflicting popup being opened.","internal-error":"An internal error has occurred.","invalid-user-token":"The user's credential is no longer valid. The user must sign in again.","invalid-auth-event":"An internal error has occurred.","invalid-custom-token":"The custom token format is incorrect. Please check the documentation.",
	"invalid-email":"The email address is badly formatted.","invalid-api-key":"Your API key is invalid, please check you have copied it correctly.","invalid-credential":"The supplied auth credential is malformed or has expired.","invalid-oauth-provider":"EmailAuthProvider is not supported for this operation. This operation only supports OAuth providers.","unauthorized-domain":"This domain is not authorized for OAuth operations for your Firebase project. Edit the list of authorized domains from the Firebase console.",
	"invalid-action-code":"The action code is invalid. This can happen if the code is malformed, expired, or has already been used.","wrong-password":"The password is invalid or the user does not have a password.","missing-iframe-start":"An internal error has occurred.","auth-domain-config-required":"Be sure to include authDomain when calling firebase.initializeApp(), by following the instructions in the Firebase console.","app-deleted":"This instance of FirebaseApp has been deleted.","account-exists-with-different-credential":"An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.",
	"network-request-failed":"A network error (such as timeout, interrupted connection or unreachable host) has occurred.","no-auth-event":"An internal error has occurred.","no-such-provider":"User was not linked to an account with the given provider.","operation-not-allowed":"The given sign-in provider is disabled for this Firebase project. Enable it in the Firebase console, under the sign-in method tab of the Auth section.","operation-not-supported-in-this-environment":'This operation is not supported in the environment this application is running on. "location.protocol" must be http or https and web storage must be enabled.',
	"popup-blocked":"Unable to establish a connection with the popup. It may have been blocked by the browser.","popup-closed-by-user":"The popup has been closed by the user before finalizing the operation.","provider-already-linked":"User can only be linked to one identity for the given provider.",timeout:"The operation has timed out.","user-token-expired":"The user's credential is no longer valid. The user must sign in again.","too-many-requests":"We have blocked all requests from this device due to unusual activity. Try again later.",
	"user-cancelled":"User did not grant your application the permissions it requested.","user-not-found":"There is no user record corresponding to this identifier. The user may have been deleted.","user-disabled":"The user account has been disabled by an administrator.","user-mismatch":"The supplied credentials do not correspond to the previously signed in user.","user-signed-out":"","weak-password":"The password must be 6 characters long or more.","web-storage-unsupported":"This browser is not supported or 3rd party cookies and data may be disabled."};var qf=function(a,b,c,d,e){this.wa=a;this.U=b||null;this.gb=c||null;this.cc=d||null;this.K=e||null;if(this.gb||this.K){if(this.gb&&this.K)throw new Q("invalid-auth-event");if(this.gb&&!this.cc)throw new Q("invalid-auth-event");}else throw new Q("invalid-auth-event");};qf.prototype.getError=function(){return this.K};qf.prototype.I=function(){return{type:this.wa,eventId:this.U,urlResponse:this.gb,sessionId:this.cc,error:this.K&&this.K.I()}};var rf=function(a){var b="unauthorized-domain",c=void 0,d=Ce(a);a=d.ha;d=d.ca;"http"!=d&&"https"!=d?b="operation-not-supported-in-this-environment":c=ma("This domain (%s) is not authorized to run this operation. Add it to the OAuth redirect domains list in the Firebase console -> Auth section -> Sign in method tab.",a);Q.call(this,b,c)};r(rf,Q);var sf=function(a){this.xe=a.sub;la();this.Db=a.email||null};var tf=function(a,b,c,d){var e={};ha(c)?e=c:b&&n(c)&&n(d)?e={oauthToken:c,oauthTokenSecret:d}:!b&&n(c)&&(e={accessToken:c});if(b||!e.idToken&&!e.accessToken)if(b&&e.oauthToken&&e.oauthTokenSecret)P(this,"accessToken",e.oauthToken),P(this,"secret",e.oauthTokenSecret);else{if(b)throw new Q("argument-error","credential failed: expected 2 arguments (the OAuth access token and secret).");throw new Q("argument-error","credential failed: expected 1 argument (the OAuth access token).");}else e.idToken&&P(this,
	"idToken",e.idToken),e.accessToken&&P(this,"accessToken",e.accessToken);P(this,"provider",a)};tf.prototype.Fb=function(a){return uf(a,vf(this))};tf.prototype.nd=function(a,b){var c=vf(this);c.idToken=b;return wf(a,c)};var vf=function(a){var b={};a.idToken&&(b.id_token=a.idToken);a.accessToken&&(b.access_token=a.accessToken);a.secret&&(b.oauth_token_secret=a.secret);b.providerId=a.provider;return{postBody:He(b).toString(),requestUri:Xe()?Je():"http://localhost"}};
	tf.prototype.I=function(){var a={provider:this.provider};this.idToken&&(a.oauthIdToken=this.idToken);this.accessToken&&(a.oauthAccessToken=this.accessToken);this.secret&&(a.oauthTokenSecret=this.secret);return a};
	var xf=function(a,b,c){var d=!!b,e=c||[];b=function(){gf(this,{providerId:a,isOAuthProvider:!0});this.Nc=[];this.ad={};"google.com"==a&&this.addScope("profile")};d||(b.prototype.addScope=function(a){Ja(this.Nc,a)||this.Nc.push(a)});b.prototype.setCustomParameters=function(a){this.ad=Ua(a)};b.prototype.fe=function(){var a=$e(this.ad),b;for(b in a)a[b]=a[b].toString();a=Ua(a);for(b=0;b<e.length;b++){var c=e[b];c in a&&delete a[c]}return a};b.prototype.ge=function(){return Oa(this.Nc)};b.credential=
	function(b,c){return new tf(a,d,b,c)};gf(b,{PROVIDER_ID:a});return b},yf=xf("facebook.com",!1,of("facebook.com"));yf.prototype.addScope=yf.prototype.addScope||void 0;var zf=xf("github.com",!1,of("github.com"));zf.prototype.addScope=zf.prototype.addScope||void 0;var Af=xf("google.com",!1,of("google.com"));Af.prototype.addScope=Af.prototype.addScope||void 0;
	Af.credential=function(a,b){if(!a&&!b)throw new Q("argument-error","credential failed: must provide the ID token and/or the access token.");return new tf("google.com",!1,ha(a)?a:{idToken:a||null,accessToken:b||null})};var Bf=xf("twitter.com",!0,of("twitter.com")),Cf=function(a,b){this.Db=a;this.Fc=b;P(this,"provider","password")};Cf.prototype.Fb=function(a){return R(a,Df,{email:this.Db,password:this.Fc})};Cf.prototype.nd=function(a,b){return R(a,Ef,{idToken:b,email:this.Db,password:this.Fc})};
	Cf.prototype.I=function(){return{email:this.Db,password:this.Fc}};var Ff=function(){gf(this,{providerId:"password",isOAuthProvider:!1})};gf(Ff,{PROVIDER_ID:"password"});var Gf={Ze:Ff,Hd:yf,Jd:Af,Id:zf,Od:Bf},Hf=function(a){var b=a&&a.providerId;if(!b)return null;var c=a&&a.oauthAccessToken,d=a&&a.oauthTokenSecret;a=a&&a.oauthIdToken;for(var e in Gf)if(Gf[e].PROVIDER_ID==b)try{return Gf[e].credential({accessToken:c,idToken:a,oauthToken:c,oauthTokenSecret:d})}catch(f){break}return null};var If=function(a,b,c,d){Q.call(this,a,d);P(this,"email",b);P(this,"credential",c)};r(If,Q);If.prototype.I=function(){var a={code:this.code,message:this.message,email:this.email},b=this.credential&&this.credential.I();b&&(Wa(a,b),a.providerId=b.provider,delete a.provider);return a};var Jf=function(a){if(a.code){var b=a.code||"";0==b.indexOf("auth/")&&(b=b.substring(5));return a.email?new If(b,a.email,Hf(a),a.message):new Q(b,a.message||void 0)}return null};var Kf=function(a){this.Ye=a};r(Kf,oc);Kf.prototype.kb=function(){return new this.Ye};Kf.prototype.Ob=function(){return{}};
	var S=function(a,b,c){var d;d="Node"==O();d=l.XMLHttpRequest||d&&firebase.INTERNAL.node&&firebase.INTERNAL.node.XMLHttpRequest;if(!d)throw new Q("internal-error","The XMLHttpRequest compatibility library was not found.");this.i=a;a=b||{};this.Ie=a.secureTokenEndpoint||"https://securetoken.googleapis.com/v1/token";this.Je=a.secureTokenTimeout||Lf;this.wd=Ua(a.secureTokenHeaders||Mf);this.be=a.firebaseEndpoint||"https://www.googleapis.com/identitytoolkit/v3/relyingparty/";this.ce=a.firebaseTimeout||
	Nf;this.fd=Ua(a.firebaseHeaders||Of);c&&(this.fd["X-Client-Version"]=c,this.wd["X-Client-Version"]=c);this.Td=new tc;this.Xe=new Kf(d)},Pf,Lf=new df(1E4,3E4),Mf={"Content-Type":"application/x-www-form-urlencoded"},Nf=new df(1E4,3E4),Of={"Content-Type":"application/json"},Rf=function(a,b,c,d,e,f,g){Me()?a=q(a.Le,a):(Pf||(Pf=new C(function(a,b){Qf(a,b)})),a=q(a.Ke,a));a(b,c,d,e,f,g)};
	S.prototype.Le=function(a,b,c,d,e,f){var g="Node"==O(),k=Te()?g?new J(this.Xe):new J:new J(this.Td),v;f&&(k.eb=Math.max(0,f),v=setTimeout(function(){k.dispatchEvent("timeout")},f));k.listen("complete",function(){v&&clearTimeout(v);var a=null;try{var c;c=this.b?hc(this.b.responseText):void 0;a=c||null}catch(Ei){try{a=JSON.parse(ne(this))||null}catch(Fi){a=null}}b&&b(a)});Rb(k,"ready",function(){v&&clearTimeout(v);this.za||(this.za=!0,this.Na())});Rb(k,"timeout",function(){v&&clearTimeout(v);this.za||
	(this.za=!0,this.Na());b&&b(null)});k.send(a,c,d,e)};var sd="__fcb"+Math.floor(1E6*Math.random()).toString(),Qf=function(a,b){((window.gapi||{}).client||{}).request?a():(l[sd]=function(){((window.gapi||{}).client||{}).request?a():b(Error("CORS_UNSUPPORTED"))},ud(function(){b(Error("CORS_UNSUPPORTED"))}))};
	S.prototype.Ke=function(a,b,c,d,e){var f=this;Pf.then(function(){window.gapi.client.setApiKey(f.i);var g=window.gapi.auth.getToken();window.gapi.auth.setToken(null);window.gapi.client.request({path:a,method:c,body:d,headers:e,authType:"none",callback:function(a){window.gapi.auth.setToken(g);b&&b(a)}})}).h(function(a){b&&b({error:{message:a&&a.message||"CORS_UNSUPPORTED"}})})};
	var Tf=function(a,b){return new C(function(c,d){"refresh_token"==b.grant_type&&b.refresh_token||"authorization_code"==b.grant_type&&b.code?Rf(a,a.Ie+"?key="+encodeURIComponent(a.i),function(a){a?a.error?d(Sf(a)):a.access_token&&a.refresh_token?c(a):d(new Q("internal-error")):d(new Q("network-request-failed"))},"POST",He(b).toString(),a.wd,a.Je.get()):d(new Q("internal-error"))})},Uf=function(a,b,c,d,e){var f=a.be+b+"?key="+encodeURIComponent(a.i);e&&(f+="&cb="+la().toString());return new C(function(b,
	e){Rf(a,f,function(a){a?a.error?e(Sf(a)):b(a):e(new Q("network-request-failed"))},c,kc($e(d)),a.fd,a.ce.get())})},Vf=function(a){if(!Xb.test(a.email))throw new Q("invalid-email");},Wf=function(a){"email"in a&&Vf(a)},Yf=function(a,b){var c=Xe()?Je():"http://localhost";return R(a,Xf,{identifier:b,continueUri:c}).then(function(a){return a.allProviders||[]})},$f=function(a){return R(a,Zf,{}).then(function(a){return a.authorizedDomains||[]})},ag=function(a){if(!a.idToken)throw new Q("internal-error");
	};S.prototype.signInAnonymously=function(){return R(this,bg,{})};S.prototype.updateEmail=function(a,b){return R(this,cg,{idToken:a,email:b})};S.prototype.updatePassword=function(a,b){return R(this,Ef,{idToken:a,password:b})};var dg={displayName:"DISPLAY_NAME",photoUrl:"PHOTO_URL"};S.prototype.updateProfile=function(a,b){var c={idToken:a},d=[];Pa(dg,function(a,f){var e=b[f];null===e?d.push(a):f in b&&(c[f]=e)});d.length&&(c.deleteAttribute=d);return R(this,cg,c)};
	S.prototype.sendPasswordResetEmail=function(a){return R(this,eg,{requestType:"PASSWORD_RESET",email:a})};S.prototype.sendEmailVerification=function(a){return R(this,fg,{requestType:"VERIFY_EMAIL",idToken:a})};
	var hg=function(a,b,c){return R(a,gg,{idToken:b,deleteProvider:c})},ig=function(a){if(!a.requestUri||!a.sessionId&&!a.postBody)throw new Q("internal-error");},jg=function(a){var b=null;a.needConfirmation?(a.code="account-exists-with-different-credential",b=Jf(a)):"FEDERATED_USER_ID_ALREADY_LINKED"==a.errorMessage?(a.code="credential-already-in-use",b=Jf(a)):"EMAIL_EXISTS"==a.errorMessage&&(a.code="email-already-in-use",b=Jf(a));if(b)throw b;if(!a.idToken)throw new Q("internal-error");},uf=function(a,
	b){b.returnIdpCredential=!0;return R(a,kg,b)},wf=function(a,b){b.returnIdpCredential=!0;return R(a,lg,b)},mg=function(a){if(!a.oobCode)throw new Q("invalid-action-code");};S.prototype.confirmPasswordReset=function(a,b){return R(this,ng,{oobCode:a,newPassword:b})};S.prototype.checkActionCode=function(a){return R(this,og,{oobCode:a})};S.prototype.applyActionCode=function(a){return R(this,pg,{oobCode:a})};
	var pg={endpoint:"setAccountInfo",F:mg,bb:"email"},og={endpoint:"resetPassword",F:mg,ua:function(a){if(!a.email||!a.requestType)throw new Q("internal-error");}},qg={endpoint:"signupNewUser",F:function(a){Vf(a);if(!a.password)throw new Q("weak-password");},ua:ag,va:!0},Xf={endpoint:"createAuthUri"},rg={endpoint:"deleteAccount",$a:["idToken"]},gg={endpoint:"setAccountInfo",$a:["idToken","deleteProvider"],F:function(a){if(!ea(a.deleteProvider))throw new Q("internal-error");}},sg={endpoint:"getAccountInfo"},
	fg={endpoint:"getOobConfirmationCode",$a:["idToken","requestType"],F:function(a){if("VERIFY_EMAIL"!=a.requestType)throw new Q("internal-error");},bb:"email"},eg={endpoint:"getOobConfirmationCode",$a:["requestType"],F:function(a){if("PASSWORD_RESET"!=a.requestType)throw new Q("internal-error");Vf(a)},bb:"email"},Zf={Sd:!0,endpoint:"getProjectConfig",ne:"GET"},ng={endpoint:"resetPassword",F:mg,bb:"email"},cg={endpoint:"setAccountInfo",$a:["idToken"],F:Wf,va:!0},Ef={endpoint:"setAccountInfo",$a:["idToken"],
	F:function(a){Wf(a);if(!a.password)throw new Q("weak-password");},ua:ag,va:!0},bg={endpoint:"signupNewUser",ua:ag,va:!0},kg={endpoint:"verifyAssertion",F:ig,ua:jg,va:!0},lg={endpoint:"verifyAssertion",F:function(a){ig(a);if(!a.idToken)throw new Q("internal-error");},ua:jg,va:!0},tg={endpoint:"verifyCustomToken",F:function(a){if(!a.token)throw new Q("invalid-custom-token");},ua:ag,va:!0},Df={endpoint:"verifyPassword",F:function(a){Vf(a);if(!a.password)throw new Q("wrong-password");},ua:ag,va:!0},R=
	function(a,b,c){if(!jf(c,b.$a))return E(new Q("internal-error"));var d=b.ne||"POST",e;return D(c).then(b.F).then(function(){b.va&&(c.returnSecureToken=!0);return Uf(a,b.endpoint,d,c,b.Sd||!1)}).then(function(a){return e=a}).then(b.ua).then(function(){if(!b.bb)return e;if(!(b.bb in e))throw new Q("internal-error");return e[b.bb]})},Sf=function(a){var b,c;c=(a.error&&a.error.errors&&a.error.errors[0]||{}).reason||"";var d={keyInvalid:"invalid-api-key",ipRefererBlocked:"app-not-authorized"};if(c=d[c]?
	new Q(d[c]):null)return c;c=a.error&&a.error.message||"";d={INVALID_CUSTOM_TOKEN:"invalid-custom-token",CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_EMAIL:"invalid-email",INVALID_PASSWORD:"wrong-password",USER_DISABLED:"user-disabled",MISSING_PASSWORD:"internal-error",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",
	FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",EMAIL_NOT_FOUND:"user-not-found",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",CORS_UNSUPPORTED:"cors-unsupported",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",WEAK_PASSWORD:"weak-password",OPERATION_NOT_ALLOWED:"operation-not-allowed",
	USER_CANCELLED:"user-cancelled"};b=(b=c.match(/^[^\s]+\s*:\s*(.*)$/))&&1<b.length?b[1]:void 0;for(var e in d)if(0===c.indexOf(e))return new Q(d[e],b);!b&&a&&(b=Ze(a));return new Q("internal-error",b)};var ug=function(a){this.S=a};ug.prototype.value=function(){return this.S};ug.prototype.zd=function(a){this.S.style=a;return this};var vg=function(a){this.S=a||{}};vg.prototype.value=function(){return this.S};vg.prototype.zd=function(a){this.S.style=a;return this};var xg=function(a){this.We=a;this.Kb=null;this.Cc=wg(this)};xg.prototype.Dc=function(){return this.Cc};
	var yg=function(a){var b=new vg;b.S.where=document.body;b.S.url=a.We;b.S.messageHandlersFilter=Ve("gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER");b.S.attributes=b.S.attributes||{};(new ug(b.S.attributes)).zd({position:"absolute",top:"-100px",width:"1px",height:"1px"});b.S.dontclear=!0;return b},wg=function(a){return zg().then(function(){return new C(function(b,c){Ve("gapi.iframes.getContext")().open(yg(a).value(),function(d){a.Kb=d;a.Kb.restyle({setHideOnLeave:!1});var e=setTimeout(function(){c(Error("Network Error"))},
	Ag.get()),f=function(){clearTimeout(e);b()};d.ping(f).then(f,function(){c(Error("Network Error"))})})})})};xg.prototype.sendMessage=function(a){var b=this;return this.Cc.then(function(){return new C(function(c){b.Kb.send(a.type,a,c,Ve("gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER"))})})};
	var Bg=function(a,b){a.Cc.then(function(){a.Kb.register("authEvent",b,Ve("gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER"))})},Cg=new df(3E3,15E3),Ag=new df(5E3,15E3),zg=function(){return new C(function(a,b){var c=function(){cf();Ve("gapi.load")("gapi.iframes",{callback:a,ontimeout:function(){cf();b(Error("Network Error"))},timeout:Cg.get()})};if(Ve("gapi.iframes.Iframe"))a();else if(Ve("gapi.load"))c();else{var d="__iframefcb"+Math.floor(1E6*Math.random()).toString();l[d]=function(){Ve("gapi.load")?c():
	b(Error("Network Error"))};D(rd("https://apis.google.com/js/api.js?onload="+d)).h(function(){b(Error("Network Error"))})}})};var Dg=function(a,b,c){this.A=a;this.i=b;this.C=c;this.Ha=null;this.o=De(this.A,"/__/auth/iframe");M(this.o,"apiKey",this.i);M(this.o,"appName",this.C)};Dg.prototype.setVersion=function(a){this.Ha=a;return this};Dg.prototype.toString=function(){this.Ha?M(this.o,"v",this.Ha):Be(this.o,"v");return this.o.toString()};
	var Eg=function(a,b,c,d,e){this.A=a;this.i=b;this.C=c;this.Rd=d;this.Ha=this.U=this.Lc=null;this.Vb=e;this.o=De(this.A,"/__/auth/handler");M(this.o,"apiKey",this.i);M(this.o,"appName",this.C);M(this.o,"authType",this.Rd)};Eg.prototype.setVersion=function(a){this.Ha=a;return this};
	Eg.prototype.toString=function(){if(this.Vb.isOAuthProvider){M(this.o,"providerId",this.Vb.providerId);var a=this.Vb.ge();a&&a.length&&M(this.o,"scopes",a.join(","));a=this.Vb.fe();Sa(a)||M(this.o,"customParameters",Ze(a))}this.Lc?M(this.o,"redirectUrl",this.Lc):Be(this.o,"redirectUrl");this.U?M(this.o,"eventId",this.U):Be(this.o,"eventId");this.Ha?M(this.o,"v",this.Ha):Be(this.o,"v");return this.o.toString()};
	var Gg=function(a,b,c,d){this.A=a;this.i=b;this.C=c;d=this.ya=d||null;this.oe=(new Dg(a,b,c)).setVersion(d).toString();this.xc=new xg(this.oe);this.Ab=[];Fg(this)};Gg.prototype.Dc=function(){return this.xc.Dc()};
	var Hg=function(a,b,c,d,e,f,g,k){a=new Eg(a,b,c,d,e);a.Lc=f;a.U=g;return a.setVersion(k).toString()},Fg=function(a){Bg(a.xc,function(b){var c={};if(b&&b.authEvent){var d=!1;b=b.authEvent||{};if(b.type){if(c=b.error)var e=(c=b.error)&&(c.name||c.code),c=e?new Q(e.substring(5),c.message):null;b=new qf(b.type,b.eventId,b.urlResponse,b.sessionId,c)}else b=null;for(c=0;c<a.Ab.length;c++)d=a.Ab[c](b)||d;c={};c.status=d?"ACK":"ERROR";return D(c)}c.status="ERROR";return D(c)})},Ig=function(a){return a.xc.sendMessage({type:"webStorageSupport"}).then(function(a){if(a&&
	a.length&&"undefined"!==typeof a[0].webStorageSupport)return a[0].webStorageSupport;throw Error();})},Jg=function(a,b){Ma(a.Ab,function(a){return a==b})};var Kg=function(a){this.u=a||firebase.INTERNAL.reactNative&&firebase.INTERNAL.reactNative.AsyncStorage;if(!this.u)throw new Q("internal-error","The React Native compatibility library was not found.");};h=Kg.prototype;h.get=function(a){return D(this.u.getItem(a)).then(function(a){return a&&af(a)})};h.set=function(a,b){return D(this.u.setItem(a,Ze(b)))};h.remove=function(a){return D(this.u.removeItem(a))};h.Ja=function(){};h.Ya=function(){};var Lg=function(){this.u={}};h=Lg.prototype;h.get=function(a){return D(this.u[a])};h.set=function(a,b){this.u[a]=b;return D()};h.remove=function(a){delete this.u[a];return D()};h.Ja=function(){};h.Ya=function(){};var Ng=function(){if(!Mg()){if("Node"==O())throw new Q("internal-error","The LocalStorage compatibility library was not found.");throw new Q("web-storage-unsupported");}this.u=l.localStorage||firebase.INTERNAL.node.localStorage},Mg=function(){var a="Node"==O(),a=l.localStorage||a&&firebase.INTERNAL.node&&firebase.INTERNAL.node.localStorage;if(!a)return!1;try{return a.setItem("__sak","1"),a.removeItem("__sak"),!0}catch(b){return!1}};h=Ng.prototype;
	h.get=function(a){var b=this;return D().then(function(){var c=b.u.getItem(a);return af(c)})};h.set=function(a,b){var c=this;return D().then(function(){var d=Ze(b);null===d?c.remove(a):c.u.setItem(a,d)})};h.remove=function(a){var b=this;return D().then(function(){b.u.removeItem(a)})};h.Ja=function(a){l.window&&Jb(l.window,"storage",a)};h.Ya=function(a){l.window&&Sb(l.window,"storage",a)};var Og=function(){this.u={}};h=Og.prototype;h.get=function(){return D(null)};h.set=function(){return D()};h.remove=function(){return D()};h.Ja=function(){};h.Ya=function(){};var Qg=function(){if(!Pg()){if("Node"==O())throw new Q("internal-error","The SessionStorage compatibility library was not found.");throw new Q("web-storage-unsupported");}this.u=l.sessionStorage||firebase.INTERNAL.node.sessionStorage},Pg=function(){var a="Node"==O(),a=l.sessionStorage||a&&firebase.INTERNAL.node&&firebase.INTERNAL.node.sessionStorage;if(!a)return!1;try{return a.setItem("__sak","1"),a.removeItem("__sak"),!0}catch(b){return!1}};h=Qg.prototype;
	h.get=function(a){var b=this;return D().then(function(){var c=b.u.getItem(a);return af(c)})};h.set=function(a,b){var c=this;return D().then(function(){var d=Ze(b);null===d?c.remove(a):c.u.setItem(a,d)})};h.remove=function(a){var b=this;return D().then(function(){b.u.removeItem(a)})};h.Ja=function(){};h.Ya=function(){};var Rg=function(a,b,c,d,e,f){if(!window.indexedDB)throw new Q("web-storage-unsupported");this.Vd=a;this.Bc=b;this.rc=c;this.Fd=d;this.hb=e;this.P={};this.wb=[];this.sb=0;this.pe=f||l.indexedDB},Sg,Tg=function(a){return new C(function(b,c){var d=a.pe.open(a.Vd,a.hb);d.onerror=function(a){c(Error(a.target.errorCode))};d.onupgradeneeded=function(b){b=b.target.result;try{b.createObjectStore(a.Bc,{keyPath:a.rc})}catch(f){c(f)}};d.onsuccess=function(a){b(a.target.result)}})},Ug=function(a){a.kd||(a.kd=
	Tg(a));return a.kd},Vg=function(a,b){return b.objectStore(a.Bc)},Wg=function(a,b,c){return b.transaction([a.Bc],c?"readwrite":"readonly")},Xg=function(a){return new C(function(b,c){a.onsuccess=function(a){a&&a.target?b(a.target.result):b()};a.onerror=function(a){c(Error(a.target.errorCode))}})};h=Rg.prototype;
	h.set=function(a,b){var c=!1,d,e=this;return bd(Ug(this).then(function(b){d=b;b=Vg(e,Wg(e,d,!0));return Xg(b.get(a))}).then(function(f){var g=Vg(e,Wg(e,d,!0));if(f)return f.value=b,Xg(g.put(f));e.sb++;c=!0;f={};f[e.rc]=a;f[e.Fd]=b;return Xg(g.add(f))}).then(function(){e.P[a]=b}),function(){c&&e.sb--})};h.get=function(a){var b=this;return Ug(this).then(function(c){return Xg(Vg(b,Wg(b,c,!1)).get(a))}).then(function(a){return a&&a.value})};
	h.remove=function(a){var b=!1,c=this;return bd(Ug(this).then(function(d){b=!0;c.sb++;return Xg(Vg(c,Wg(c,d,!0))["delete"](a))}).then(function(){delete c.P[a]}),function(){b&&c.sb--})};
	h.Oe=function(){var a=this;return Ug(this).then(function(b){var c=Vg(a,Wg(a,b,!1));return c.getAll?Xg(c.getAll()):new C(function(a,b){var d=[],e=c.openCursor();e.onsuccess=function(b){(b=b.target.result)?(d.push(b.value),b["continue"]()):a(d)};e.onerror=function(a){b(Error(a.target.errorCode))}})}).then(function(b){var c={},d=[];if(0==a.sb){for(d=0;d<b.length;d++)c[b[d][a.rc]]=b[d][a.Fd];d=Ke(a.P,c);a.P=c}return d})};h.Ja=function(a){0==this.wb.length&&this.Qc();this.wb.push(a)};
	h.Ya=function(a){Ma(this.wb,function(b){return b==a});0==this.wb.length&&this.ec()};h.Qc=function(){var a=this;this.ec();var b=function(){a.Hc=Yd(800).then(q(a.Oe,a)).then(function(b){0<b.length&&x(a.wb,function(a){a(b)})}).then(b).h(function(a){"STOP_EVENT"!=a.message&&b()});return a.Hc};b()};h.ec=function(){this.Hc&&this.Hc.cancel("STOP_EVENT")};var ah=function(){this.cd={Browser:Yg,Node:Zg,ReactNative:$g}[O()]},bh,Yg={X:Ng,Sc:Qg},Zg={X:Ng,Sc:Qg},$g={X:Kg,Sc:Og};var ch=function(a){var b={},c=a.email,d=a.newEmail;a=a.requestType;if(!c||!a)throw Error("Invalid provider user info!");b.fromEmail=d||null;b.email=c;P(this,"operation",a);P(this,"data",kf(b))};var dh="First Second Third Fourth Fifth Sixth Seventh Eighth Ninth".split(" "),T=function(a,b){return{name:a||"",ea:"a valid string",optional:!!b,fa:n}},U=function(a){return{name:a||"",ea:"a valid object",optional:!1,fa:ha}},eh=function(a,b){return{name:a||"",ea:"a function",optional:!!b,fa:p}},fh=function(){return{name:"",ea:"null",optional:!1,fa:da}},gh=function(){return{name:"credential",ea:"a valid credential",optional:!1,fa:function(a){return!(!a||!a.Fb)}}},hh=function(){return{name:"authProvider",
	ea:"a valid Auth provider",optional:!1,fa:function(a){return!!(a&&a.providerId&&a.hasOwnProperty&&a.hasOwnProperty("isOAuthProvider"))}}},ih=function(a,b,c,d){return{name:c||"",ea:a.ea+" or "+b.ea,optional:!!d,fa:function(c){return a.fa(c)||b.fa(c)}}};var kh=function(a,b){for(var c in b){var d=b[c].name;a[d]=jh(d,a[c],b[c].a)}},V=function(a,b,c,d){a[b]=jh(b,c,d)},jh=function(a,b,c){if(!c)return b;var d=lh(a);a=function(){var a=Array.prototype.slice.call(arguments),e;a:{e=Array.prototype.slice.call(a);var k;k=0;for(var v=!1,oa=0;oa<c.length;oa++)if(c[oa].optional)v=!0;else{if(v)throw new Q("internal-error","Argument validator encountered a required argument after an optional argument.");k++}v=c.length;if(e.length<k||v<e.length)e="Expected "+(k==
	v?1==k?"1 argument":k+" arguments":k+"-"+v+" arguments")+" but got "+e.length+".";else{for(k=0;k<e.length;k++)if(v=c[k].optional&&void 0===e[k],!c[k].fa(e[k])&&!v){e=c[k];if(0>k||k>=dh.length)throw new Q("internal-error","Argument validator received an unsupported number of arguments.");e=dh[k]+" argument "+(e.name?'"'+e.name+'" ':"")+"must be "+e.ea+".";break a}e=null}}if(e)throw new Q("argument-error",d+" failed: "+e);return b.apply(this,a)};for(var e in b)a[e]=b[e];for(e in b.prototype)a.prototype[e]=
	b.prototype[e];return a},lh=function(a){a=a.split(".");return a[a.length-1]};var mh=function(a,b,c,d){this.Be=a;this.xd=b;this.He=c;this.cb=d;this.O={};bh||(bh=new ah);a=bh;try{var e;Ie()?(Sg||(Sg=new Rg("firebaseLocalStorageDb","firebaseLocalStorage","fbase_key","value",1)),e=Sg):e=new a.cd.X;this.Sa=e}catch(f){this.Sa=new Lg,this.cb=!0}try{this.gc=new a.cd.Sc}catch(f){this.gc=new Lg}this.Ad=q(this.Bd,this);this.P={}},nh,oh=function(){nh||(nh=new mh("firebase",":",!bf(N())&&l.window&&l.window!=l.window.top?!0:!1,Ye()));return nh};h=mh.prototype;
	h.M=function(a,b){return this.Be+this.xd+a.name+(b?this.xd+b:"")};h.get=function(a,b){return(a.X?this.Sa:this.gc).get(this.M(a,b))};h.remove=function(a,b){b=this.M(a,b);a.X&&!this.cb&&(this.P[b]=null);return(a.X?this.Sa:this.gc).remove(b)};h.set=function(a,b,c){var d=this.M(a,c),e=this,f=a.X?this.Sa:this.gc;return f.set(d,b).then(function(){return f.get(d)}).then(function(b){a.X&&!this.cb&&(e.P[d]=b)})};
	h.addListener=function(a,b,c){a=this.M(a,b);this.cb||(this.P[a]=l.localStorage.getItem(a));Sa(this.O)&&this.Qc();this.O[a]||(this.O[a]=[]);this.O[a].push(c)};h.removeListener=function(a,b,c){a=this.M(a,b);this.O[a]&&(Ma(this.O[a],function(a){return a==c}),0==this.O[a].length&&delete this.O[a]);Sa(this.O)&&this.ec()};h.Qc=function(){this.Sa.Ja(this.Ad);this.cb||ph(this)};
	var ph=function(a){qh(a);a.Ac=setInterval(function(){for(var b in a.O){var c=l.localStorage.getItem(b);c!=a.P[b]&&(a.P[b]=c,c=new yb({type:"storage",key:b,target:window,oldValue:a.P[b],newValue:c}),a.Bd(c))}},1E3)},qh=function(a){a.Ac&&(clearInterval(a.Ac),a.Ac=null)};mh.prototype.ec=function(){this.Sa.Ya(this.Ad);this.cb||qh(this)};
	mh.prototype.Bd=function(a){if(a&&a.ee){var b=a.lb.key;if(this.He){var c=l.localStorage.getItem(b);a=a.lb.newValue;a!=c&&(a?l.localStorage.setItem(b,a):a||l.localStorage.removeItem(b))}this.P[b]=l.localStorage.getItem(b);this.Xc(b)}else x(a,q(this.Xc,this))};mh.prototype.Xc=function(a){this.O[a]&&x(this.O[a],function(a){a()})};var rh=function(a){this.B=a;this.w=oh()},sh={name:"pendingRedirect",X:!1},th=function(a){return a.w.set(sh,"pending",a.B)},uh=function(a){return a.w.remove(sh,a.B)},vh=function(a){return a.w.get(sh,a.B).then(function(a){return"pending"==a})};var yh=function(a,b,c){var d=this,e=(this.ya=firebase.SDK_VERSION||null)?Ue(this.ya):null;this.f=new S(b,null,e);this.pa=null;this.A=a;this.i=b;this.C=c;this.xb=[];this.Nb=!1;this.Tc=q(this.he,this);this.Va=new wh(this);this.rd=new xh(this);this.Gc=new rh(this.i+":"+this.C);this.fb={};this.fb.unknown=this.Va;this.fb.signInViaRedirect=this.Va;this.fb.linkViaRedirect=this.Va;this.fb.signInViaPopup=this.rd;this.fb.linkViaPopup=this.rd;this.Zb=this.ab=null;this.Sb=new C(function(a,b){d.ab=a;d.Zb=b})};
	yh.prototype.reset=function(){var a=this;this.pa=null;this.Sb.cancel();this.Nb=!1;this.Zb=this.ab=null;this.pb&&Jg(this.pb,this.Tc);this.Sb=new C(function(b,c){a.ab=b;a.Zb=c})};
	var zh=function(a){var b=Je();return $f(a).then(function(a){a:{var c=Ce(b),e=c.ca;if("http"==e||"https"==e)for(c=c.ha,e=0;e<a.length;e++){var f;var g=a[e];f=c;Re.test(g)?f=f==g:(g=g.split(".").join("\\."),f=(new RegExp("^(.+\\."+g+"|"+g+")$","i")).test(f));if(f){a=!0;break a}}a=!1}if(!a)throw new rf(Je());})},Ah=function(a){a.Nb||(a.Nb=!0,Se().then(function(){a.pb=new Gg(a.A,a.i,a.C,a.ya);a.pb.Dc().h(function(){a.Zb(new Q("network-request-failed"));a.reset()});a.pb.Ab.push(a.Tc)}));return a.Sb};
	yh.prototype.subscribe=function(a){Ja(this.xb,a)||this.xb.push(a);if(!this.Nb){var b=this,c=function(){var a=N();Ye(a)||bf(a)||Ah(b);Bh(b.Va)};vh(this.Gc).then(function(a){a?uh(b.Gc).then(function(){Ah(b)}):c()}).h(function(){c()})}};yh.prototype.unsubscribe=function(a){Ma(this.xb,function(b){return b==a})};
	yh.prototype.he=function(a){if(!a)throw new Q("invalid-auth-event");this.ab&&(this.ab(),this.ab=null);for(var b=!1,c=0;c<this.xb.length;c++){var d=this.xb[c];if(d.Yc(a.wa,a.U)){(b=this.fb[a.wa])&&b.sd(a,d);b=!0;break}}Bh(this.Va);return b};var Ch=new df(2E3,1E4),Dh=new df(1E4,3E4);yh.prototype.getRedirectResult=function(){return this.Va.getRedirectResult()};
	var Fh=function(a,b,c,d,e,f){if(!b)return E(new Q("popup-blocked"));if(f)return Ah(a),D();a.pa||(a.pa=zh(a.f));return a.pa.then(function(){return Ah(a)}).then(function(){Eh(d);var f=Hg(a.A,a.i,a.C,c,d,null,e,a.ya);(b||l.window).location.href=cc(fc(f))}).h(function(b){"auth/network-request-failed"==b.code&&(a.pa=null);throw b;})},Gh=function(a,b,c,d){a.pa||(a.pa=zh(a.f));return a.pa.then(function(){Eh(c);var e=Hg(a.A,a.i,a.C,b,c,Je(),d,a.ya);th(a.Gc).then(function(){l.window.location.href=cc(fc(e))})})},
	Hh=function(a,b,c,d,e){var f=new Q("popup-closed-by-user"),g=new Q("web-storage-unsupported"),k=!1;return a.Sb.then(function(){Ig(a.pb).then(function(a){a||(d&&Oe(d),b.ta(c,null,g,e),k=!0)})}).h(function(){}).then(function(){if(!k)return Qe(d)}).then(function(){if(!k)return Yd(Ch.get()).then(function(){b.ta(c,null,f,e)})})},Eh=function(a){if(!a.isOAuthProvider)throw new Q("invalid-oauth-provider");},Ih={},Jh=function(a,b,c){var d=b+":"+c;Ih[d]||(Ih[d]=new yh(a,b,c));return Ih[d]},wh=function(a){this.w=
	a;this.vb=this.Yb=this.Wa=this.Z=null;this.Kc=!1};wh.prototype.sd=function(a,b){if(!a)return E(new Q("invalid-auth-event"));this.Kc=!0;var c=a.wa,d=a.U,e=a.getError()&&"auth/web-storage-unsupported"==a.getError().code;"unknown"!=c||e?a=a.K?this.Ic(a,b):b.mb(c,d)?this.Jc(a,b):E(new Q("invalid-auth-event")):(this.Z||Kh(this,!1,null,null),a=D());return a};var Bh=function(a){a.Kc||(a.Kc=!0,Kh(a,!1,null,null))};wh.prototype.Ic=function(a){this.Z||Kh(this,!0,null,a.getError());return D()};
	wh.prototype.Jc=function(a,b){var c=this,d=a.wa;b=b.mb(d,a.U);var e=a.gb;a=a.cc;var f="signInViaRedirect"==d||"linkViaRedirect"==d;if(this.Z)return D();this.vb&&this.vb.cancel();return b(e,a).then(function(a){c.Z||Kh(c,f,a,null)}).h(function(a){c.Z||Kh(c,f,null,a)})};var Kh=function(a,b,c,d){b?d?(a.Z=function(){return E(d)},a.Yb&&a.Yb(d)):(a.Z=function(){return D(c)},a.Wa&&a.Wa(c)):(a.Z=function(){return D({user:null})},a.Wa&&a.Wa({user:null}));a.Wa=null;a.Yb=null};
	wh.prototype.getRedirectResult=function(){var a=this;this.Wc||(this.Wc=new C(function(b,c){a.Z?a.Z().then(b,c):(a.Wa=b,a.Yb=c,Lh(a))}));return this.Wc};var Lh=function(a){var b=new Q("timeout");a.vb&&a.vb.cancel();a.vb=Yd(Dh.get()).then(function(){a.Z||Kh(a,!0,null,b)})},xh=function(a){this.w=a};xh.prototype.sd=function(a,b){if(!a)return E(new Q("invalid-auth-event"));var c=a.wa,d=a.U;return a.K?this.Ic(a,b):b.mb(c,d)?this.Jc(a,b):E(new Q("invalid-auth-event"))};
	xh.prototype.Ic=function(a,b){b.ta(a.wa,null,a.getError(),a.U);return D()};xh.prototype.Jc=function(a,b){var c=a.U,d=a.wa;return b.mb(d,c)(a.gb,a.cc).then(function(a){b.ta(d,a,null,c)}).h(function(a){b.ta(d,null,a,c)})};var Mh=function(a){this.f=a;this.xa=this.T=null;this.Oa=0};Mh.prototype.I=function(){return{apiKey:this.f.i,refreshToken:this.T,accessToken:this.xa,expirationTime:this.Oa}};
	var Oh=function(a,b){var c=b.idToken,d=b.refreshToken;b=Nh(b.expiresIn);a.xa=c;a.Oa=b;a.T=d},Nh=function(a){return la()+1E3*parseInt(a,10)},Ph=function(a,b){return Tf(a.f,b).then(function(b){a.xa=b.access_token;a.Oa=Nh(b.expires_in);a.T=b.refresh_token;return{accessToken:a.xa,expirationTime:a.Oa,refreshToken:a.T}}).h(function(b){"auth/user-token-expired"==b.code&&(a.T=null);throw b;})},Qh=function(a){return!(!a.xa||a.T)};
	Mh.prototype.getToken=function(a){a=!!a;return Qh(this)?E(new Q("user-token-expired")):a||!this.xa||la()>this.Oa-3E4?this.T?Ph(this,{grant_type:"refresh_token",refresh_token:this.T}):D(null):D({accessToken:this.xa,expirationTime:this.Oa,refreshToken:this.T})};var Rh=function(a,b,c,d,e){gf(this,{uid:a,displayName:d||null,photoURL:e||null,email:c||null,providerId:b})},Sh=function(a,b){xb.call(this,a);for(var c in b)this[c]=b[c]};r(Sh,xb);
	var W=function(a,b,c){this.W=[];this.i=a.apiKey;this.C=a.appName;this.A=a.authDomain||null;a=firebase.SDK_VERSION?Ue(firebase.SDK_VERSION):null;this.f=new S(this.i,null,a);this.da=new Mh(this.f);Th(this,b.idToken);Oh(this.da,b);P(this,"refreshToken",this.da.T);Uh(this,c||{});G.call(this);this.Tb=!1;this.A&&Xe()&&(this.j=Jh(this.A,this.i,this.C));this.dc=[];this.nc=D()};r(W,G);
	W.prototype.ra=function(a,b){var c=Array.prototype.slice.call(arguments,1),d=this;return this.nc=this.nc.then(function(){return a.apply(d,c)},function(){return a.apply(d,c)})};
	var Th=function(a,b){a.ld=b;P(a,"_lat",b)},Vh=function(a,b){Ma(a.dc,function(a){return a==b})},Wh=function(a){for(var b=[],c=0;c<a.dc.length;c++)b.push(a.dc[c](a));return Zc(b).then(function(){return a})},Xh=function(a){a.j&&!a.Tb&&(a.Tb=!0,a.j.subscribe(a))},Uh=function(a,b){gf(a,{uid:b.uid,displayName:b.displayName||null,photoURL:b.photoURL||null,email:b.email||null,emailVerified:b.emailVerified||!1,isAnonymous:b.isAnonymous||!1,providerData:[]})};P(W.prototype,"providerId","firebase");
	var Yh=function(){},Zh=function(a){return D().then(function(){if(a.Xd)throw new Q("app-deleted");})},$h=function(a){return Fa(a.providerData,function(a){return a.providerId})},bi=function(a,b){b&&(ai(a,b.providerId),a.providerData.push(b))},ai=function(a,b){Ma(a.providerData,function(a){return a.providerId==b})},ci=function(a,b,c){("uid"!=b||c)&&a.hasOwnProperty(b)&&P(a,b,c)};
	W.prototype.copy=function(a){var b=this;b!=a&&(gf(this,{uid:a.uid,displayName:a.displayName,photoURL:a.photoURL,email:a.email,emailVerified:a.emailVerified,isAnonymous:a.isAnonymous,providerData:[]}),x(a.providerData,function(a){bi(b,a)}),this.da=a.da,P(this,"refreshToken",this.da.T))};W.prototype.reload=function(){var a=this;return Zh(this).then(function(){return di(a).then(function(){return Wh(a)}).then(Yh)})};
	var di=function(a){return a.getToken().then(function(b){var c=a.isAnonymous;return ei(a,b).then(function(){c||ci(a,"isAnonymous",!1);return b}).h(function(b){"auth/user-token-expired"==b.code&&(a.dispatchEvent(new Sh("userDeleted")),fi(a));throw b;})})};
	W.prototype.getToken=function(a){var b=this,c=Qh(this.da);return Zh(this).then(function(){return b.da.getToken(a)}).then(function(a){if(!a)throw new Q("internal-error");a.accessToken!=b.ld&&(Th(b,a.accessToken),b.Ca());ci(b,"refreshToken",a.refreshToken);return a.accessToken}).h(function(a){if("auth/user-token-expired"==a.code&&!c)return Wh(b).then(function(){ci(b,"refreshToken",null);throw a;});throw a;})};
	var gi=function(a,b){b.idToken&&a.ld!=b.idToken&&(Oh(a.da,b),a.Ca(),Th(a,b.idToken),ci(a,"refreshToken",a.da.T))};W.prototype.Ca=function(){this.dispatchEvent(new Sh("tokenChanged"))};var ei=function(a,b){return R(a.f,sg,{idToken:b}).then(q(a.Ee,a))};
	W.prototype.Ee=function(a){a=a.users;if(!a||!a.length)throw new Q("internal-error");a=a[0];Uh(this,{uid:a.localId,displayName:a.displayName,photoURL:a.photoUrl,email:a.email,emailVerified:!!a.emailVerified});for(var b=hi(a),c=0;c<b.length;c++)bi(this,b[c]);ci(this,"isAnonymous",!(this.email&&a.passwordHash)&&!(this.providerData&&this.providerData.length))};
	var hi=function(a){return(a=a.providerUserInfo)&&a.length?Fa(a,function(a){return new Rh(a.rawId,a.providerId,a.email,a.displayName,a.photoUrl)}):[]};W.prototype.reauthenticate=function(a){var b=this;return this.c(a.Fb(this.f).then(function(a){var c;a:{var e=a.idToken.split(".");if(3==e.length){for(var e=e[1],f=(4-e.length%4)%4,g=0;g<f;g++)e+=".";try{var k=hc(sb(e));if(k.sub&&k.iss&&k.aud&&k.exp){c=new sf(k);break a}}catch(v){}}c=null}if(!c||b.uid!=c.xe)throw new Q("user-mismatch");gi(b,a);return b.reload()}))};
	var ii=function(a,b){return di(a).then(function(){if(Ja($h(a),b))return Wh(a).then(function(){throw new Q("provider-already-linked");})})};h=W.prototype;h.ve=function(a){var b=this;return this.c(ii(this,a.provider).then(function(){return b.getToken()}).then(function(c){return a.nd(b.f,c)}).then(q(this.ed,this)))};h.link=function(a){return this.ra(this.ve,a)};h.ed=function(a){gi(this,a);var b=this;return this.reload().then(function(){return b})};
	h.Te=function(a){var b=this;return this.c(this.getToken().then(function(c){return b.f.updateEmail(c,a)}).then(function(a){gi(b,a);return b.reload()}))};h.updateEmail=function(a){return this.ra(this.Te,a)};h.Ue=function(a){var b=this;return this.c(this.getToken().then(function(c){return b.f.updatePassword(c,a)}).then(function(a){gi(b,a);return b.reload()}))};h.updatePassword=function(a){return this.ra(this.Ue,a)};
	h.Ve=function(a){if(void 0===a.displayName&&void 0===a.photoURL)return Zh(this);var b=this;return this.c(this.getToken().then(function(c){return b.f.updateProfile(c,{displayName:a.displayName,photoUrl:a.photoURL})}).then(function(a){gi(b,a);ci(b,"displayName",a.displayName||null);ci(b,"photoURL",a.photoUrl||null);return Wh(b)}).then(Yh))};h.updateProfile=function(a){return this.ra(this.Ve,a)};
	h.Se=function(a){var b=this;return this.c(di(this).then(function(c){return Ja($h(b),a)?hg(b.f,c,[a]).then(function(a){var c={};x(a.providerUserInfo||[],function(a){c[a.providerId]=!0});x($h(b),function(a){c[a]||ai(b,a)});return Wh(b)}):Wh(b).then(function(){throw new Q("no-such-provider");})}))};h.unlink=function(a){return this.ra(this.Se,a)};h.Wd=function(){var a=this;return this.c(this.getToken().then(function(b){return R(a.f,rg,{idToken:b})}).then(function(){a.dispatchEvent(new Sh("userDeleted"))})).then(function(){fi(a)})};
	h["delete"]=function(){return this.ra(this.Wd)};h.Yc=function(a,b){return"linkViaPopup"==a&&(this.ja||null)==b&&this.ba||"linkViaRedirect"==a&&(this.Xb||null)==b?!0:!1};h.ta=function(a,b,c,d){"linkViaPopup"==a&&d==(this.ja||null)&&(c&&this.Ea?this.Ea(c):b&&!c&&this.ba&&this.ba(b),this.D&&(this.D.cancel(),this.D=null),delete this.ba,delete this.Ea)};h.mb=function(a,b){return"linkViaPopup"==a&&b==(this.ja||null)||"linkViaRedirect"==a&&(this.Xb||null)==b?q(this.$d,this):null};
	h.Eb=function(){return We(this.uid+":::")};
	var ki=function(a,b){if(!Xe())return E(new Q("operation-not-supported-in-this-environment"));var c=nf(b.providerId),d=a.Eb(),e=null;!Ye()&&a.A&&b.isOAuthProvider&&(e=Hg(a.A,a.i,a.C,"linkViaPopup",b,null,d,firebase.SDK_VERSION||null));var f=Pe(e,c&&c.ub,c&&c.tb),c=ii(a,b.providerId).then(function(){return Wh(a)}).then(function(){ji(a);return a.getToken()}).then(function(){return Fh(a.j,f,"linkViaPopup",b,d,!!e)}).then(function(){return new C(function(b,c){a.ta("linkViaPopup",null,new Q("cancelled-popup-request"),
	a.ja||null);a.ba=b;a.Ea=c;a.ja=d;a.D=Hh(a.j,a,"linkViaPopup",f,d)})}).then(function(a){f&&Oe(f);return a}).h(function(a){f&&Oe(f);throw a;});return a.c(c)};W.prototype.linkWithPopup=function(a){var b=ki(this,a);return this.ra(function(){return b})};
	W.prototype.we=function(a){if(!Xe())return E(new Q("operation-not-supported-in-this-environment"));var b=this,c=null,d=this.Eb(),e=ii(this,a.providerId).then(function(){ji(b);return b.getToken()}).then(function(){b.Xb=d;return Wh(b)}).then(function(a){b.Fa&&(a=b.Fa,a=a.w.set(li,b.I(),a.B));return a}).then(function(){return Gh(b.j,"linkViaRedirect",a,d)}).h(function(a){c=a;if(b.Fa)return mi(b.Fa);throw c;}).then(function(){if(c)throw c;});return this.c(e)};
	W.prototype.linkWithRedirect=function(a){return this.ra(this.we,a)};var ji=function(a){if(!a.j||!a.Tb){if(a.j&&!a.Tb)throw new Q("internal-error");throw new Q("auth-domain-config-required");}};W.prototype.$d=function(a,b){var c=this;this.D&&(this.D.cancel(),this.D=null);var d=null,e=this.getToken().then(function(d){return wf(c.f,{requestUri:a,sessionId:b,idToken:d})}).then(function(a){d=Hf(a);return c.ed(a)}).then(function(a){return{user:a,credential:d}});return this.c(e)};
	W.prototype.sendEmailVerification=function(){var a=this;return this.c(this.getToken().then(function(b){return a.f.sendEmailVerification(b)}).then(function(b){if(a.email!=b)return a.reload()}).then(function(){}))};var fi=function(a){for(var b=0;b<a.W.length;b++)a.W[b].cancel("app-deleted");a.W=[];a.Xd=!0;P(a,"refreshToken",null);a.j&&a.j.unsubscribe(a)};W.prototype.c=function(a){var b=this;this.W.push(a);bd(a,function(){La(b.W,a)});return a};W.prototype.toJSON=function(){return this.I()};
	W.prototype.I=function(){var a={uid:this.uid,displayName:this.displayName,photoURL:this.photoURL,email:this.email,emailVerified:this.emailVerified,isAnonymous:this.isAnonymous,providerData:[],apiKey:this.i,appName:this.C,authDomain:this.A,stsTokenManager:this.da.I(),redirectEventId:this.Xb||null};x(this.providerData,function(b){a.providerData.push(hf(b))});return a};
	var ni=function(a){if(!a.apiKey)return null;var b={apiKey:a.apiKey,authDomain:a.authDomain,appName:a.appName},c={};if(a.stsTokenManager&&a.stsTokenManager.accessToken&&a.stsTokenManager.expirationTime)c.idToken=a.stsTokenManager.accessToken,c.refreshToken=a.stsTokenManager.refreshToken||null,c.expiresIn=(a.stsTokenManager.expirationTime-la())/1E3;else return null;var d=new W(b,c,a);a.providerData&&x(a.providerData,function(a){if(a){var b={};gf(b,a);bi(d,b)}});a.redirectEventId&&(d.Xb=a.redirectEventId);
	return d},oi=function(a,b,c){var d=new W(a,b);c&&(d.Fa=c);return d.reload().then(function(){return d})};var pi=function(a){this.B=a;this.w=oh()},li={name:"redirectUser",X:!1},mi=function(a){return a.w.remove(li,a.B)},qi=function(a,b){return a.w.get(li,a.B).then(function(a){a&&b&&(a.authDomain=b);return ni(a||{})})};var ri=function(a){this.B=a;this.w=oh()},si={name:"authUser",X:!0},ti=function(a,b){return a.w.set(si,b.I(),a.B)},ui=function(a){return a.w.remove(si,a.B)},vi=function(a,b){return a.w.get(si,a.B).then(function(a){a&&b&&(a.authDomain=b);return ni(a||{})})};var Y=function(a){this.Ma=!1;P(this,"app",a);if(X(this).options&&X(this).options.apiKey)a=firebase.SDK_VERSION?Ue(firebase.SDK_VERSION):null,this.f=new S(X(this).options&&X(this).options.apiKey,null,a);else throw new Q("invalid-api-key");this.W=[];this.Ka=[];this.Ce=firebase.INTERNAL.createSubscribe(q(this.qe,this));wi(this,null);this.ma=new ri(X(this).options.apiKey+":"+X(this).name);this.Xa=new pi(X(this).options.apiKey+":"+X(this).name);this.Bb=this.c(xi(this));this.sa=this.c(yi(this));this.zc=
	!1;this.wc=q(this.Ne,this);this.Dd=q(this.Qa,this);this.Ed=q(this.me,this);this.Cd=q(this.le,this);zi(this);this.INTERNAL={};this.INTERNAL["delete"]=q(this["delete"],this)};Y.prototype.toJSON=function(){return{apiKey:X(this).options.apiKey,authDomain:X(this).options.authDomain,appName:X(this).name,currentUser:Z(this)&&Z(this).I()}};
	var Ai=function(a){return a.Yd||E(new Q("auth-domain-config-required"))},zi=function(a){var b=X(a).options.authDomain,c=X(a).options.apiKey;b&&Xe()&&(a.Yd=a.Bb.then(function(){if(!a.Ma)return a.j=Jh(b,c,X(a).name),a.j.subscribe(a),Z(a)&&Xh(Z(a)),a.Mc&&(Xh(a.Mc),a.Mc=null),a.j}))};h=Y.prototype;h.Yc=function(a,b){switch(a){case "unknown":case "signInViaRedirect":return!0;case "signInViaPopup":return this.ja==b&&!!this.ba;default:return!1}};
	h.ta=function(a,b,c,d){"signInViaPopup"==a&&this.ja==d&&(c&&this.Ea?this.Ea(c):b&&!c&&this.ba&&this.ba(b),this.D&&(this.D.cancel(),this.D=null),delete this.ba,delete this.Ea)};h.mb=function(a,b){return"signInViaRedirect"==a||"signInViaPopup"==a&&this.ja==b&&this.ba?q(this.ae,this):null};
	h.ae=function(a,b){var c=this;a={requestUri:a,sessionId:b};this.D&&(this.D.cancel(),this.D=null);var d=null,e=uf(c.f,a).then(function(a){d=Hf(a);return a});a=c.Bb.then(function(){return e}).then(function(a){return Bi(c,a)}).then(function(){return{user:Z(c),credential:d}});return this.c(a)};h.Eb=function(){return We()};
	h.signInWithPopup=function(a){if(!Xe())return E(new Q("operation-not-supported-in-this-environment"));var b=this,c=nf(a.providerId),d=this.Eb(),e=null;!Ye()&&X(this).options.authDomain&&a.isOAuthProvider&&(e=Hg(X(this).options.authDomain,X(this).options.apiKey,X(this).name,"signInViaPopup",a,null,d,firebase.SDK_VERSION||null));var f=Pe(e,c&&c.ub,c&&c.tb),c=Ai(this).then(function(b){return Fh(b,f,"signInViaPopup",a,d,!!e)}).then(function(){return new C(function(a,c){b.ta("signInViaPopup",null,new Q("cancelled-popup-request"),
	b.ja);b.ba=a;b.Ea=c;b.ja=d;b.D=Hh(b.j,b,"signInViaPopup",f,d)})}).then(function(a){f&&Oe(f);return a}).h(function(a){f&&Oe(f);throw a;});return this.c(c)};h.signInWithRedirect=function(a){if(!Xe())return E(new Q("operation-not-supported-in-this-environment"));var b=this,c=Ai(this).then(function(){return Gh(b.j,"signInViaRedirect",a)});return this.c(c)};
	h.getRedirectResult=function(){if(!Xe())return E(new Q("operation-not-supported-in-this-environment"));var a=this,b=Ai(this).then(function(){return a.j.getRedirectResult()});return this.c(b)};
	var Bi=function(a,b){var c={};c.apiKey=X(a).options.apiKey;c.authDomain=X(a).options.authDomain;c.appName=X(a).name;return a.Bb.then(function(){return oi(c,b,a.Xa)}).then(function(b){if(Z(a)&&b.uid==Z(a).uid)return Z(a).copy(b),a.Qa(b);wi(a,b);Xh(b);return a.Qa(b)}).then(function(){a.Ca()})},wi=function(a,b){Z(a)&&(Vh(Z(a),a.Dd),Sb(Z(a),"tokenChanged",a.Ed),Sb(Z(a),"userDeleted",a.Cd));b&&(b.dc.push(a.Dd),Jb(b,"tokenChanged",a.Ed),Jb(b,"userDeleted",a.Cd));P(a,"currentUser",b)};
	Y.prototype.signOut=function(){var a=this,b=this.sa.then(function(){if(!Z(a))return D();wi(a,null);return ui(a.ma).then(function(){a.Ca()})});return this.c(b)};
	var Ci=function(a){var b=qi(a.Xa,X(a).options.authDomain).then(function(b){if(a.Mc=b)b.Fa=a.Xa;return mi(a.Xa)});return a.c(b)},xi=function(a){var b=X(a).options.authDomain,c=Ci(a).then(function(){return vi(a.ma,b)}).then(function(b){return b?(b.Fa=a.Xa,b.reload().then(function(){return ti(a.ma,b).then(function(){return b})}).h(function(c){return"auth/network-request-failed"==c.code?b:ui(a.ma)})):null}).then(function(b){wi(a,b||null)});return a.c(c)},yi=function(a){return a.Bb.then(function(){return a.getRedirectResult()}).h(function(){}).then(function(){if(!a.Ma)return a.wc()}).h(function(){}).then(function(){if(!a.Ma){a.zc=
	!0;var b=a.ma;b.w.addListener(si,b.B,a.wc)}})};Y.prototype.Ne=function(){var a=this;return vi(this.ma,X(this).options.authDomain).then(function(b){if(!a.Ma){var c;if(c=Z(a)&&b){c=Z(a).uid;var d=b.uid;c=void 0===c||null===c||""===c||void 0===d||null===d||""===d?!1:c==d}if(c)return Z(a).copy(b),Z(a).getToken();if(Z(a)||b)wi(a,b),b&&(Xh(b),b.Fa=a.Xa),a.j&&a.j.subscribe(a),a.Ca()}})};Y.prototype.Qa=function(a){return ti(this.ma,a)};Y.prototype.me=function(){this.Ca();this.Qa(Z(this))};
	Y.prototype.le=function(){this.signOut()};var Di=function(a,b){return a.c(b.then(function(b){return Bi(a,b)}).then(function(){return Z(a)}))};h=Y.prototype;h.qe=function(a){var b=this;this.addAuthTokenListener(function(){a.next(Z(b))})};h.onAuthStateChanged=function(a,b,c){var d=this;this.zc&&firebase.Promise.resolve().then(function(){p(a)?a(Z(d)):p(a.next)&&a.next(Z(d))});return this.Ce(a,b,c)};
	h.getToken=function(a){var b=this,c=this.sa.then(function(){return Z(b)?Z(b).getToken(a).then(function(a){return{accessToken:a}}):null});return this.c(c)};h.signInWithCustomToken=function(a){var b=this;return this.sa.then(function(){return Di(b,R(b.f,tg,{token:a}))}).then(function(a){ci(a,"isAnonymous",!1);return b.Qa(a)}).then(function(){return Z(b)})};h.signInWithEmailAndPassword=function(a,b){var c=this;return this.sa.then(function(){return Di(c,R(c.f,Df,{email:a,password:b}))})};
	h.createUserWithEmailAndPassword=function(a,b){var c=this;return this.sa.then(function(){return Di(c,R(c.f,qg,{email:a,password:b}))})};h.signInWithCredential=function(a){var b=this;return this.sa.then(function(){return Di(b,a.Fb(b.f))})};h.signInAnonymously=function(){var a=Z(this),b=this;return a&&a.isAnonymous?D(a):this.sa.then(function(){return Di(b,b.f.signInAnonymously())}).then(function(a){ci(a,"isAnonymous",!0);return b.Qa(a)}).then(function(){return Z(b)})};
	var X=function(a){return a.app},Z=function(a){return a.currentUser};h=Y.prototype;h.Ca=function(){if(this.zc)for(var a=0;a<this.Ka.length;a++)if(this.Ka[a])this.Ka[a](Z(this)&&Z(this)._lat||null)};h.addAuthTokenListener=function(a){var b=this;this.Ka.push(a);this.c(this.sa.then(function(){b.Ma||Ja(b.Ka,a)&&a(Z(b)&&Z(b)._lat||null)}))};h.removeAuthTokenListener=function(a){Ma(this.Ka,function(b){return b==a})};
	h["delete"]=function(){this.Ma=!0;for(var a=0;a<this.W.length;a++)this.W[a].cancel("app-deleted");this.W=[];this.ma&&(a=this.ma,a.w.removeListener(si,a.B,this.wc));this.j&&this.j.unsubscribe(this);return firebase.Promise.resolve()};h.c=function(a){var b=this;this.W.push(a);bd(a,function(){La(b.W,a)});return a};h.fetchProvidersForEmail=function(a){return this.c(Yf(this.f,a))};h.verifyPasswordResetCode=function(a){return this.checkActionCode(a).then(function(a){return a.data.email})};
	h.confirmPasswordReset=function(a,b){return this.c(this.f.confirmPasswordReset(a,b).then(function(){}))};h.checkActionCode=function(a){return this.c(this.f.checkActionCode(a).then(function(a){return new ch(a)}))};h.applyActionCode=function(a){return this.c(this.f.applyActionCode(a).then(function(){}))};h.sendPasswordResetEmail=function(a){return this.c(this.f.sendPasswordResetEmail(a).then(function(){}))};kh(Y.prototype,{applyActionCode:{name:"applyActionCode",a:[T("code")]},checkActionCode:{name:"checkActionCode",a:[T("code")]},confirmPasswordReset:{name:"confirmPasswordReset",a:[T("code"),T("newPassword")]},createUserWithEmailAndPassword:{name:"createUserWithEmailAndPassword",a:[T("email"),T("password")]},fetchProvidersForEmail:{name:"fetchProvidersForEmail",a:[T("email")]},getRedirectResult:{name:"getRedirectResult",a:[]},onAuthStateChanged:{name:"onAuthStateChanged",a:[ih(U(),eh(),"nextOrObserver"),
	eh("opt_error",!0),eh("opt_completed",!0)]},sendPasswordResetEmail:{name:"sendPasswordResetEmail",a:[T("email")]},signInAnonymously:{name:"signInAnonymously",a:[]},signInWithCredential:{name:"signInWithCredential",a:[gh()]},signInWithCustomToken:{name:"signInWithCustomToken",a:[T("token")]},signInWithEmailAndPassword:{name:"signInWithEmailAndPassword",a:[T("email"),T("password")]},signInWithPopup:{name:"signInWithPopup",a:[hh()]},signInWithRedirect:{name:"signInWithRedirect",a:[hh()]},signOut:{name:"signOut",
	a:[]},toJSON:{name:"toJSON",a:[T(null,!0)]},verifyPasswordResetCode:{name:"verifyPasswordResetCode",a:[T("code")]}});
	kh(W.prototype,{"delete":{name:"delete",a:[]},getToken:{name:"getToken",a:[{name:"opt_forceRefresh",ea:"a boolean",optional:!0,fa:function(a){return"boolean"==typeof a}}]},link:{name:"link",a:[gh()]},linkWithPopup:{name:"linkWithPopup",a:[hh()]},linkWithRedirect:{name:"linkWithRedirect",a:[hh()]},reauthenticate:{name:"reauthenticate",a:[gh()]},reload:{name:"reload",a:[]},sendEmailVerification:{name:"sendEmailVerification",a:[]},toJSON:{name:"toJSON",a:[T(null,!0)]},unlink:{name:"unlink",a:[T("provider")]},
	updateEmail:{name:"updateEmail",a:[T("email")]},updatePassword:{name:"updatePassword",a:[T("password")]},updateProfile:{name:"updateProfile",a:[U("profile")]}});kh(C.prototype,{h:{name:"catch"},then:{name:"then"}});V(Ff,"credential",function(a,b){return new Cf(a,b)},[T("email"),T("password")]);kh(yf.prototype,{addScope:{name:"addScope",a:[T("scope")]},setCustomParameters:{name:"setCustomParameters",a:[U("customOAuthParameters")]}});V(yf,"credential",yf.credential,[ih(T(),U(),"token")]);
	kh(zf.prototype,{addScope:{name:"addScope",a:[T("scope")]},setCustomParameters:{name:"setCustomParameters",a:[U("customOAuthParameters")]}});V(zf,"credential",zf.credential,[ih(T(),U(),"token")]);kh(Af.prototype,{addScope:{name:"addScope",a:[T("scope")]},setCustomParameters:{name:"setCustomParameters",a:[U("customOAuthParameters")]}});V(Af,"credential",Af.credential,[ih(T(),ih(U(),fh()),"idToken"),ih(T(),fh(),"accessToken",!0)]);kh(Bf.prototype,{setCustomParameters:{name:"setCustomParameters",a:[U("customOAuthParameters")]}});
	V(Bf,"credential",Bf.credential,[ih(T(),U(),"token"),T("secret",!0)]);
	(function(){if("undefined"!==typeof firebase&&firebase.INTERNAL&&firebase.INTERNAL.registerService){var a={Auth:Y,Error:Q};V(a,"EmailAuthProvider",Ff,[]);V(a,"FacebookAuthProvider",yf,[]);V(a,"GithubAuthProvider",zf,[]);V(a,"GoogleAuthProvider",Af,[]);V(a,"TwitterAuthProvider",Bf,[]);firebase.INTERNAL.registerService("auth",function(a,c){a=new Y(a);c({INTERNAL:{getToken:q(a.getToken,a),addAuthTokenListener:q(a.addAuthTokenListener,a),removeAuthTokenListener:q(a.removeAuthTokenListener,a)}});return a},
	a,function(a,c){if("create"===a)try{c.auth()}catch(d){}});firebase.INTERNAL.extendNamespace({User:W})}else throw Error("Cannot find the firebase namespace; be sure to include firebase-app.js before this library.");})();})();
	module.exports = firebase.auth;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var firebase = __webpack_require__(3);
	/*! @license Firebase v3.6.1
	    Build: 3.6.1-rc.3
	    Terms: https://firebase.google.com/terms/

	    ---

	    typedarray.js
	    Copyright (c) 2010, Linden Research, Inc.

	    Permission is hereby granted, free of charge, to any person obtaining a copy
	    of this software and associated documentation files (the "Software"), to deal
	    in the Software without restriction, including without limitation the rights
	    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	    copies of the Software, and to permit persons to whom the Software is
	    furnished to do so, subject to the following conditions:

	    The above copyright notice and this permission notice shall be included in
	    all copies or substantial portions of the Software.

	    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	    THE SOFTWARE. */
	(function() {var g,aa=this;function n(a){return void 0!==a}function ba(){}function ca(a){a.Vb=function(){return a.Ye?a.Ye:a.Ye=new a}}
	function da(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
	else if("function"==b&&"undefined"==typeof a.call)return"object";return b}function ea(a){return"array"==da(a)}function fa(a){var b=da(a);return"array"==b||"object"==b&&"number"==typeof a.length}function p(a){return"string"==typeof a}function ga(a){return"number"==typeof a}function ha(a){return"function"==da(a)}function ia(a){var b=typeof a;return"object"==b&&null!=a||"function"==b}function ja(a,b,c){return a.call.apply(a.bind,arguments)}
	function ka(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}function q(a,b,c){q=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ja:ka;return q.apply(null,arguments)}
	function la(a,b){function c(){}c.prototype=b.prototype;a.wg=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.sg=function(a,c,f){for(var h=Array(arguments.length-2),k=2;k<arguments.length;k++)h[k-2]=arguments[k];return b.prototype[c].apply(a,h)}};function ma(){this.Wa=-1};function na(){this.Wa=-1;this.Wa=64;this.M=[];this.Ud=[];this.Af=[];this.xd=[];this.xd[0]=128;for(var a=1;a<this.Wa;++a)this.xd[a]=0;this.Nd=this.$b=0;this.reset()}la(na,ma);na.prototype.reset=function(){this.M[0]=1732584193;this.M[1]=4023233417;this.M[2]=2562383102;this.M[3]=271733878;this.M[4]=3285377520;this.Nd=this.$b=0};
	function oa(a,b,c){c||(c=0);var d=a.Af;if(p(b))for(var e=0;16>e;e++)d[e]=b.charCodeAt(c)<<24|b.charCodeAt(c+1)<<16|b.charCodeAt(c+2)<<8|b.charCodeAt(c+3),c+=4;else for(e=0;16>e;e++)d[e]=b[c]<<24|b[c+1]<<16|b[c+2]<<8|b[c+3],c+=4;for(e=16;80>e;e++){var f=d[e-3]^d[e-8]^d[e-14]^d[e-16];d[e]=(f<<1|f>>>31)&4294967295}b=a.M[0];c=a.M[1];for(var h=a.M[2],k=a.M[3],l=a.M[4],m,e=0;80>e;e++)40>e?20>e?(f=k^c&(h^k),m=1518500249):(f=c^h^k,m=1859775393):60>e?(f=c&h|k&(c|h),m=2400959708):(f=c^h^k,m=3395469782),f=(b<<
	5|b>>>27)+f+l+m+d[e]&4294967295,l=k,k=h,h=(c<<30|c>>>2)&4294967295,c=b,b=f;a.M[0]=a.M[0]+b&4294967295;a.M[1]=a.M[1]+c&4294967295;a.M[2]=a.M[2]+h&4294967295;a.M[3]=a.M[3]+k&4294967295;a.M[4]=a.M[4]+l&4294967295}
	na.prototype.update=function(a,b){if(null!=a){n(b)||(b=a.length);for(var c=b-this.Wa,d=0,e=this.Ud,f=this.$b;d<b;){if(0==f)for(;d<=c;)oa(this,a,d),d+=this.Wa;if(p(a))for(;d<b;){if(e[f]=a.charCodeAt(d),++f,++d,f==this.Wa){oa(this,e);f=0;break}}else for(;d<b;)if(e[f]=a[d],++f,++d,f==this.Wa){oa(this,e);f=0;break}}this.$b=f;this.Nd+=b}};function r(a,b){for(var c in a)b.call(void 0,a[c],c,a)}function pa(a,b){var c={},d;for(d in a)c[d]=b.call(void 0,a[d],d,a);return c}function qa(a,b){for(var c in a)if(!b.call(void 0,a[c],c,a))return!1;return!0}function ra(a){var b=0,c;for(c in a)b++;return b}function sa(a){for(var b in a)return b}function ta(a){var b=[],c=0,d;for(d in a)b[c++]=a[d];return b}function ua(a){var b=[],c=0,d;for(d in a)b[c++]=d;return b}function va(a,b){for(var c in a)if(a[c]==b)return!0;return!1}
	function wa(a,b,c){for(var d in a)if(b.call(c,a[d],d,a))return d}function xa(a,b){var c=wa(a,b,void 0);return c&&a[c]}function ya(a){for(var b in a)return!1;return!0}function za(a){var b={},c;for(c in a)b[c]=a[c];return b};function Aa(a){a=String(a);if(/^\s*$/.test(a)?0:/^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g,"@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g,"")))try{return eval("("+a+")")}catch(b){}throw Error("Invalid JSON string: "+a);}function Ba(){this.Dd=void 0}
	function Ca(a,b,c){switch(typeof b){case "string":Da(b,c);break;case "number":c.push(isFinite(b)&&!isNaN(b)?b:"null");break;case "boolean":c.push(b);break;case "undefined":c.push("null");break;case "object":if(null==b){c.push("null");break}if(ea(b)){var d=b.length;c.push("[");for(var e="",f=0;f<d;f++)c.push(e),e=b[f],Ca(a,a.Dd?a.Dd.call(b,String(f),e):e,c),e=",";c.push("]");break}c.push("{");d="";for(f in b)Object.prototype.hasOwnProperty.call(b,f)&&(e=b[f],"function"!=typeof e&&(c.push(d),Da(f,c),
	c.push(":"),Ca(a,a.Dd?a.Dd.call(b,f,e):e,c),d=","));c.push("}");break;case "function":break;default:throw Error("Unknown type: "+typeof b);}}var Ea={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},Fa=/\uffff/.test("\uffff")?/[\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\"\x00-\x1f\x7f-\xff]/g;
	function Da(a,b){b.push('"',a.replace(Fa,function(a){if(a in Ea)return Ea[a];var b=a.charCodeAt(0),e="\\u";16>b?e+="000":256>b?e+="00":4096>b&&(e+="0");return Ea[a]=e+b.toString(16)}),'"')};var t;a:{var Ga=aa.navigator;if(Ga){var Ha=Ga.userAgent;if(Ha){t=Ha;break a}}t=""};var v=Array.prototype,Ia=v.indexOf?function(a,b,c){return v.indexOf.call(a,b,c)}:function(a,b,c){c=null==c?0:0>c?Math.max(0,a.length+c):c;if(p(a))return p(b)&&1==b.length?a.indexOf(b,c):-1;for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},Ja=v.forEach?function(a,b,c){v.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},Ka=v.filter?function(a,b,c){return v.filter.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=[],f=0,h=p(a)?
	a.split(""):a,k=0;k<d;k++)if(k in h){var l=h[k];b.call(c,l,k,a)&&(e[f++]=l)}return e},La=v.map?function(a,b,c){return v.map.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=Array(d),f=p(a)?a.split(""):a,h=0;h<d;h++)h in f&&(e[h]=b.call(c,f[h],h,a));return e},Ma=v.reduce?function(a,b,c,d){for(var e=[],f=1,h=arguments.length;f<h;f++)e.push(arguments[f]);d&&(e[0]=q(b,d));return v.reduce.apply(a,e)}:function(a,b,c,d){var e=c;Ja(a,function(c,h){e=b.call(d,e,c,h,a)});return e},Na=v.every?function(a,b,
	c){return v.every.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&!b.call(c,e[f],f,a))return!1;return!0};function Oa(a,b){var c=Pa(a,b,void 0);return 0>c?null:p(a)?a.charAt(c):a[c]}function Pa(a,b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&b.call(c,e[f],f,a))return f;return-1}function Qa(a,b){var c=Ia(a,b);0<=c&&v.splice.call(a,c,1)}function Ra(a,b,c){return 2>=arguments.length?v.slice.call(a,b):v.slice.call(a,b,c)}
	function Sa(a,b){a.sort(b||Ta)}function Ta(a,b){return a>b?1:a<b?-1:0};var Ua=-1!=t.indexOf("Opera")||-1!=t.indexOf("OPR"),Va=-1!=t.indexOf("Trident")||-1!=t.indexOf("MSIE"),Wa=-1!=t.indexOf("Gecko")&&-1==t.toLowerCase().indexOf("webkit")&&!(-1!=t.indexOf("Trident")||-1!=t.indexOf("MSIE")),Xa=-1!=t.toLowerCase().indexOf("webkit");
	(function(){var a="",b;if(Ua&&aa.opera)return a=aa.opera.version,ha(a)?a():a;Wa?b=/rv\:([^\);]+)(\)|;)/:Va?b=/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/:Xa&&(b=/WebKit\/(\S+)/);b&&(a=(a=b.exec(t))?a[1]:"");return Va&&(b=(b=aa.document)?b.documentMode:void 0,b>parseFloat(a))?String(b):a})();var Ya=null,Za=null,$a=null;function ab(a,b){if(!fa(a))throw Error("encodeByteArray takes an array as a parameter");bb();for(var c=b?Za:Ya,d=[],e=0;e<a.length;e+=3){var f=a[e],h=e+1<a.length,k=h?a[e+1]:0,l=e+2<a.length,m=l?a[e+2]:0,u=f>>2,f=(f&3)<<4|k>>4,k=(k&15)<<2|m>>6,m=m&63;l||(m=64,h||(k=64));d.push(c[u],c[f],c[k],c[m])}return d.join("")}
	function bb(){if(!Ya){Ya={};Za={};$a={};for(var a=0;65>a;a++)Ya[a]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(a),Za[a]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.".charAt(a),$a[Za[a]]=a,62<=a&&($a["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(a)]=a)}};function cb(a,b){return Object.prototype.hasOwnProperty.call(a,b)}function w(a,b){if(Object.prototype.hasOwnProperty.call(a,b))return a[b]}function db(a,b){for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&b(c,a[c])};function x(a,b,c,d){var e;d<b?e="at least "+b:d>c&&(e=0===c?"none":"no more than "+c);if(e)throw Error(a+" failed: Was called with "+d+(1===d?" argument.":" arguments.")+" Expects "+e+".");}function y(a,b,c){var d="";switch(b){case 1:d=c?"first":"First";break;case 2:d=c?"second":"Second";break;case 3:d=c?"third":"Third";break;case 4:d=c?"fourth":"Fourth";break;default:throw Error("errorPrefix called with argumentNumber > 4.  Need to update it?");}return a=a+" failed: "+(d+" argument ")}
	function A(a,b,c,d){if((!d||n(c))&&!ha(c))throw Error(y(a,b,d)+"must be a valid function.");}function eb(a,b,c){if(n(c)&&(!ia(c)||null===c))throw Error(y(a,b,!0)+"must be a valid context object.");};function fb(a){var b=[];db(a,function(a,d){ea(d)?Ja(d,function(d){b.push(encodeURIComponent(a)+"="+encodeURIComponent(d))}):b.push(encodeURIComponent(a)+"="+encodeURIComponent(d))});return b.length?"&"+b.join("&"):""};var gb=firebase.Promise;function hb(){var a=this;this.reject=this.resolve=null;this.ra=new gb(function(b,c){a.resolve=b;a.reject=c})}function ib(a,b){return function(c,d){c?a.reject(c):a.resolve(d);ha(b)&&(jb(a.ra),1===b.length?b(c):b(c,d))}}function jb(a){a.then(void 0,ba)};function kb(a,b){if(!a)throw lb(b);}function lb(a){return Error("Firebase Database ("+firebase.SDK_VERSION+") INTERNAL ASSERT FAILED: "+a)};function mb(a){for(var b=[],c=0,d=0;d<a.length;d++){var e=a.charCodeAt(d);55296<=e&&56319>=e&&(e-=55296,d++,kb(d<a.length,"Surrogate pair missing trail surrogate."),e=65536+(e<<10)+(a.charCodeAt(d)-56320));128>e?b[c++]=e:(2048>e?b[c++]=e>>6|192:(65536>e?b[c++]=e>>12|224:(b[c++]=e>>18|240,b[c++]=e>>12&63|128),b[c++]=e>>6&63|128),b[c++]=e&63|128)}return b}function nb(a){for(var b=0,c=0;c<a.length;c++){var d=a.charCodeAt(c);128>d?b++:2048>d?b+=2:55296<=d&&56319>=d?(b+=4,c++):b+=3}return b};function ob(a){return"undefined"!==typeof JSON&&n(JSON.parse)?JSON.parse(a):Aa(a)}function B(a){if("undefined"!==typeof JSON&&n(JSON.stringify))a=JSON.stringify(a);else{var b=[];Ca(new Ba,a,b);a=b.join("")}return a};function pb(a,b){this.committed=a;this.snapshot=b};function qb(){return"undefined"!==typeof window&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test("undefined"!==typeof navigator&&"string"===typeof navigator.userAgent?navigator.userAgent:"")};function rb(a){this.qe=a;this.zd=[];this.Qb=0;this.Wd=-1;this.Fb=null}function sb(a,b,c){a.Wd=b;a.Fb=c;a.Wd<a.Qb&&(a.Fb(),a.Fb=null)}function tb(a,b,c){for(a.zd[b]=c;a.zd[a.Qb];){var d=a.zd[a.Qb];delete a.zd[a.Qb];for(var e=0;e<d.length;++e)if(d[e]){var f=a;ub(function(){f.qe(d[e])})}if(a.Qb===a.Wd){a.Fb&&(clearTimeout(a.Fb),a.Fb(),a.Fb=null);break}a.Qb++}};function vb(){this.oc={}}vb.prototype.set=function(a,b){null==b?delete this.oc[a]:this.oc[a]=b};vb.prototype.get=function(a){return cb(this.oc,a)?this.oc[a]:null};vb.prototype.remove=function(a){delete this.oc[a]};vb.prototype.Ze=!0;function wb(a){this.tc=a;this.Ad="firebase:"}g=wb.prototype;g.set=function(a,b){null==b?this.tc.removeItem(this.Ad+a):this.tc.setItem(this.Ad+a,B(b))};g.get=function(a){a=this.tc.getItem(this.Ad+a);return null==a?null:ob(a)};g.remove=function(a){this.tc.removeItem(this.Ad+a)};g.Ze=!1;g.toString=function(){return this.tc.toString()};function xb(a){try{if("undefined"!==typeof window&&"undefined"!==typeof window[a]){var b=window[a];b.setItem("firebase:sentinel","cache");b.removeItem("firebase:sentinel");return new wb(b)}}catch(c){}return new vb}var yb=xb("localStorage"),zb=xb("sessionStorage");function Ab(a,b,c){this.type=Bb;this.source=a;this.path=b;this.Ga=c}Ab.prototype.Lc=function(a){return this.path.e()?new Ab(this.source,C,this.Ga.Q(a)):new Ab(this.source,D(this.path),this.Ga)};Ab.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" overwrite: "+this.Ga.toString()+")"};function Cb(a,b){this.type=Db;this.source=a;this.path=b}Cb.prototype.Lc=function(){return this.path.e()?new Cb(this.source,C):new Cb(this.source,D(this.path))};Cb.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" listen_complete)"};function Eb(a){this.Ee=a}Eb.prototype.getToken=function(a){return this.Ee.INTERNAL.getToken(a).then(null,function(a){return a&&"auth/token-not-initialized"===a.code?(E("Got auth/token-not-initialized error.  Treating as null token."),null):Promise.reject(a)})};function Fb(a,b){a.Ee.INTERNAL.addAuthTokenListener(b)};function Gb(){this.Hd=G}Gb.prototype.j=function(a){return this.Hd.P(a)};Gb.prototype.toString=function(){return this.Hd.toString()};function Hb(a,b,c,d,e){this.host=a.toLowerCase();this.domain=this.host.substr(this.host.indexOf(".")+1);this.Rc=b;this.me=c;this.qg=d;this.gf=e||"";this.$a=yb.get("host:"+a)||this.host}function Ib(a,b){b!==a.$a&&(a.$a=b,"s-"===a.$a.substr(0,2)&&yb.set("host:"+a.host,a.$a))}
	function Jb(a,b,c){H("string"===typeof b,"typeof type must == string");H("object"===typeof c,"typeof params must == object");if("websocket"===b)b=(a.Rc?"wss://":"ws://")+a.$a+"/.ws?";else if("long_polling"===b)b=(a.Rc?"https://":"http://")+a.$a+"/.lp?";else throw Error("Unknown connection type: "+b);a.host!==a.$a&&(c.ns=a.me);var d=[];r(c,function(a,b){d.push(b+"="+a)});return b+d.join("&")}
	Hb.prototype.toString=function(){var a=(this.Rc?"https://":"http://")+this.host;this.gf&&(a+="<"+this.gf+">");return a};function Kb(){this.sc={}}function Lb(a,b,c){n(c)||(c=1);cb(a.sc,b)||(a.sc[b]=0);a.sc[b]+=c}Kb.prototype.get=function(){return za(this.sc)};function Mb(a){this.Ef=a;this.pd=null}Mb.prototype.get=function(){var a=this.Ef.get(),b=za(a);if(this.pd)for(var c in this.pd)b[c]-=this.pd[c];this.pd=a;return b};function Nb(){this.vb=[]}function Ob(a,b){for(var c=null,d=0;d<b.length;d++){var e=b[d],f=e.Yb();null===c||f.Z(c.Yb())||(a.vb.push(c),c=null);null===c&&(c=new Pb(f));c.add(e)}c&&a.vb.push(c)}function Qb(a,b,c){Ob(a,c);Rb(a,function(a){return a.Z(b)})}function Sb(a,b,c){Ob(a,c);Rb(a,function(a){return a.contains(b)||b.contains(a)})}
	function Rb(a,b){for(var c=!0,d=0;d<a.vb.length;d++){var e=a.vb[d];if(e)if(e=e.Yb(),b(e)){for(var e=a.vb[d],f=0;f<e.gd.length;f++){var h=e.gd[f];if(null!==h){e.gd[f]=null;var k=h.Tb();Tb&&E("event: "+h.toString());ub(k)}}a.vb[d]=null}else c=!1}c&&(a.vb=[])}function Pb(a){this.qa=a;this.gd=[]}Pb.prototype.add=function(a){this.gd.push(a)};Pb.prototype.Yb=function(){return this.qa};function Ub(a,b,c,d){this.Zd=b;this.Kd=c;this.Bd=d;this.fd=a}Ub.prototype.Yb=function(){var a=this.Kd.wb();return"value"===this.fd?a.path:a.getParent().path};Ub.prototype.de=function(){return this.fd};Ub.prototype.Tb=function(){return this.Zd.Tb(this)};Ub.prototype.toString=function(){return this.Yb().toString()+":"+this.fd+":"+B(this.Kd.Qe())};function Vb(a,b,c){this.Zd=a;this.error=b;this.path=c}Vb.prototype.Yb=function(){return this.path};Vb.prototype.de=function(){return"cancel"};
	Vb.prototype.Tb=function(){return this.Zd.Tb(this)};Vb.prototype.toString=function(){return this.path.toString()+":cancel"};function Wb(){}Wb.prototype.Te=function(){return null};Wb.prototype.ce=function(){return null};var Xb=new Wb;function Yb(a,b,c){this.xf=a;this.Ka=b;this.wd=c}Yb.prototype.Te=function(a){var b=this.Ka.N;if(Zb(b,a))return b.j().Q(a);b=null!=this.wd?new $b(this.wd,!0,!1):this.Ka.w();return this.xf.pc(a,b)};Yb.prototype.ce=function(a,b,c){var d=null!=this.wd?this.wd:ac(this.Ka);a=this.xf.Vd(d,b,1,c,a);return 0===a.length?null:a[0]};function I(a,b,c,d){this.type=a;this.Ja=b;this.Xa=c;this.ne=d;this.Bd=void 0}function bc(a){return new I(cc,a)}var cc="value";function $b(a,b,c){this.A=a;this.da=b;this.Sb=c}function dc(a){return a.da}function ec(a){return a.Sb}function fc(a,b){return b.e()?a.da&&!a.Sb:Zb(a,J(b))}function Zb(a,b){return a.da&&!a.Sb||a.A.Da(b)}$b.prototype.j=function(){return this.A};function gc(a,b){return hc(a.name,b.name)}function ic(a,b){return hc(a,b)};function K(a,b){this.name=a;this.R=b}function jc(a,b){return new K(a,b)};function kc(a,b){return a&&"object"===typeof a?(H(".sv"in a,"Unexpected leaf node or priority contents"),b[a[".sv"]]):a}function lc(a,b){var c=new mc;nc(a,new L(""),function(a,e){oc(c,a,pc(e,b))});return c}function pc(a,b){var c=a.C().H(),c=kc(c,b),d;if(a.J()){var e=kc(a.Ca(),b);return e!==a.Ca()||c!==a.C().H()?new qc(e,M(c)):a}d=a;c!==a.C().H()&&(d=d.fa(new qc(c)));a.O(N,function(a,c){var e=pc(c,b);e!==c&&(d=d.T(a,e))});return d};var rc=function(){var a=1;return function(){return a++}}(),H=kb,sc=lb;
	function tc(a){try{var b;bb();for(var c=$a,d=[],e=0;e<a.length;){var f=c[a.charAt(e++)],h=e<a.length?c[a.charAt(e)]:0;++e;var k=e<a.length?c[a.charAt(e)]:64;++e;var l=e<a.length?c[a.charAt(e)]:64;++e;if(null==f||null==h||null==k||null==l)throw Error();d.push(f<<2|h>>4);64!=k&&(d.push(h<<4&240|k>>2),64!=l&&d.push(k<<6&192|l))}if(8192>d.length)b=String.fromCharCode.apply(null,d);else{a="";for(c=0;c<d.length;c+=8192)a+=String.fromCharCode.apply(null,Ra(d,c,c+8192));b=a}return b}catch(m){E("base64Decode failed: ",
	m)}return null}function uc(a){var b=mb(a);a=new na;a.update(b);var b=[],c=8*a.Nd;56>a.$b?a.update(a.xd,56-a.$b):a.update(a.xd,a.Wa-(a.$b-56));for(var d=a.Wa-1;56<=d;d--)a.Ud[d]=c&255,c/=256;oa(a,a.Ud);for(d=c=0;5>d;d++)for(var e=24;0<=e;e-=8)b[c]=a.M[d]>>e&255,++c;return ab(b)}function vc(a){for(var b="",c=0;c<arguments.length;c++)b=fa(arguments[c])?b+vc.apply(null,arguments[c]):"object"===typeof arguments[c]?b+B(arguments[c]):b+arguments[c],b+=" ";return b}var Tb=null,wc=!0;
	function xc(a,b){kb(!b||!0===a||!1===a,"Can't turn on custom loggers persistently.");!0===a?("undefined"!==typeof console&&("function"===typeof console.log?Tb=q(console.log,console):"object"===typeof console.log&&(Tb=function(a){console.log(a)})),b&&zb.set("logging_enabled",!0)):ha(a)?Tb=a:(Tb=null,zb.remove("logging_enabled"))}function E(a){!0===wc&&(wc=!1,null===Tb&&!0===zb.get("logging_enabled")&&xc(!0));if(Tb){var b=vc.apply(null,arguments);Tb(b)}}
	function yc(a){return function(){E(a,arguments)}}function zc(a){if("undefined"!==typeof console){var b="FIREBASE INTERNAL ERROR: "+vc.apply(null,arguments);"undefined"!==typeof console.error?console.error(b):console.log(b)}}function Ac(a){var b=vc.apply(null,arguments);throw Error("FIREBASE FATAL ERROR: "+b);}function O(a){if("undefined"!==typeof console){var b="FIREBASE WARNING: "+vc.apply(null,arguments);"undefined"!==typeof console.warn?console.warn(b):console.log(b)}}
	function Bc(a){var b,c,d,e,f,h=a;f=c=a=b="";d=!0;e="https";if(p(h)){var k=h.indexOf("//");0<=k&&(e=h.substring(0,k-1),h=h.substring(k+2));k=h.indexOf("/");-1===k&&(k=h.length);b=h.substring(0,k);f="";h=h.substring(k).split("/");for(k=0;k<h.length;k++)if(0<h[k].length){var l=h[k];try{l=decodeURIComponent(l.replace(/\+/g," "))}catch(m){}f+="/"+l}h=b.split(".");3===h.length?(a=h[1],c=h[0].toLowerCase()):2===h.length&&(a=h[0]);k=b.indexOf(":");0<=k&&(d="https"===e||"wss"===e)}"firebase"===a&&Ac(b+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead");
	c&&"undefined"!=c||Ac("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com");d||"undefined"!==typeof window&&window.location&&window.location.protocol&&-1!==window.location.protocol.indexOf("https:")&&O("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().");return{jc:new Hb(b,d,c,"ws"===e||"wss"===e),path:new L(f)}}function Cc(a){return ga(a)&&(a!=a||a==Number.POSITIVE_INFINITY||a==Number.NEGATIVE_INFINITY)}
	function Dc(a){if("complete"===document.readyState)a();else{var b=!1,c=function(){document.body?b||(b=!0,a()):setTimeout(c,Math.floor(10))};document.addEventListener?(document.addEventListener("DOMContentLoaded",c,!1),window.addEventListener("load",c,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",function(){"complete"===document.readyState&&c()}),window.attachEvent("onload",c))}}
	function hc(a,b){if(a===b)return 0;if("[MIN_NAME]"===a||"[MAX_NAME]"===b)return-1;if("[MIN_NAME]"===b||"[MAX_NAME]"===a)return 1;var c=Ec(a),d=Ec(b);return null!==c?null!==d?0==c-d?a.length-b.length:c-d:-1:null!==d?1:a<b?-1:1}function Fc(a,b){if(b&&a in b)return b[a];throw Error("Missing required key ("+a+") in object: "+B(b));}
	function Gc(a){if("object"!==typeof a||null===a)return B(a);var b=[],c;for(c in a)b.push(c);b.sort();c="{";for(var d=0;d<b.length;d++)0!==d&&(c+=","),c+=B(b[d]),c+=":",c+=Gc(a[b[d]]);return c+"}"}function Hc(a,b){if(a.length<=b)return[a];for(var c=[],d=0;d<a.length;d+=b)d+b>a?c.push(a.substring(d,a.length)):c.push(a.substring(d,d+b));return c}function Ic(a,b){if(ea(a))for(var c=0;c<a.length;++c)b(c,a[c]);else r(a,b)}
	function Jc(a){H(!Cc(a),"Invalid JSON number");var b,c,d,e;0===a?(d=c=0,b=-Infinity===1/a?1:0):(b=0>a,a=Math.abs(a),a>=Math.pow(2,-1022)?(d=Math.min(Math.floor(Math.log(a)/Math.LN2),1023),c=d+1023,d=Math.round(a*Math.pow(2,52-d)-Math.pow(2,52))):(c=0,d=Math.round(a/Math.pow(2,-1074))));e=[];for(a=52;a;--a)e.push(d%2?1:0),d=Math.floor(d/2);for(a=11;a;--a)e.push(c%2?1:0),c=Math.floor(c/2);e.push(b?1:0);e.reverse();b=e.join("");c="";for(a=0;64>a;a+=8)d=parseInt(b.substr(a,8),2).toString(16),1===d.length&&
	(d="0"+d),c+=d;return c.toLowerCase()}var Kc=/^-?\d{1,10}$/;function Ec(a){return Kc.test(a)&&(a=Number(a),-2147483648<=a&&2147483647>=a)?a:null}function ub(a){try{a()}catch(b){setTimeout(function(){O("Exception was thrown by user callback.",b.stack||"");throw b;},Math.floor(0))}}function Lc(a,b,c){Object.defineProperty(a,b,{get:c})}function Mc(a,b){var c=setTimeout(a,b);"object"===typeof c&&c.unref&&c.unref();return c};function Nc(a){var b={},c={},d={},e="";try{var f=a.split("."),b=ob(tc(f[0])||""),c=ob(tc(f[1])||""),e=f[2],d=c.d||{};delete c.d}catch(h){}return{tg:b,Ie:c,data:d,mg:e}}function Oc(a){a=Nc(a);var b=a.Ie;return!!a.mg&&!!b&&"object"===typeof b&&b.hasOwnProperty("iat")}function Pc(a){a=Nc(a).Ie;return"object"===typeof a&&!0===w(a,"admin")};function Qc(a,b,c){this.f=yc("p:rest:");this.L=a;this.Gb=b;this.Td=c;this.$={}}function Rc(a,b){if(n(b))return"tag$"+b;H(Sc(a.m),"should have a tag if it's not a default query.");return a.path.toString()}g=Qc.prototype;
	g.$e=function(a,b,c,d){var e=a.path.toString();this.f("Listen called for "+e+" "+a.ja());var f=Rc(a,c),h={};this.$[f]=h;a=Tc(a.m);var k=this;Uc(this,e+".json",a,function(a,b){var u=b;404===a&&(a=u=null);null===a&&k.Gb(e,u,!1,c);w(k.$,f)===h&&d(a?401==a?"permission_denied":"rest_error:"+a:"ok",null)})};g.uf=function(a,b){var c=Rc(a,b);delete this.$[c]};g.kf=function(){};g.oe=function(){};g.cf=function(){};g.vd=function(){};g.put=function(){};g.af=function(){};g.ve=function(){};
	function Uc(a,b,c,d){c=c||{};c.format="export";a.Td.getToken(!1).then(function(e){(e=e&&e.accessToken)&&(c.auth=e);var f=(a.L.Rc?"https://":"http://")+a.L.host+b+"?"+fb(c);a.f("Sending REST request for "+f);var h=new XMLHttpRequest;h.onreadystatechange=function(){if(d&&4===h.readyState){a.f("REST Response for "+f+" received. status:",h.status,"response:",h.responseText);var b=null;if(200<=h.status&&300>h.status){try{b=ob(h.responseText)}catch(c){O("Failed to parse JSON response for "+f+": "+h.responseText)}d(null,
	b)}else 401!==h.status&&404!==h.status&&O("Got unsuccessful REST response for "+f+" Status: "+h.status),d(h.status);d=null}};h.open("GET",f,!0);h.send()})};function Vc(a,b,c){this.type=Wc;this.source=a;this.path=b;this.children=c}Vc.prototype.Lc=function(a){if(this.path.e())return a=this.children.subtree(new L(a)),a.e()?null:a.value?new Ab(this.source,C,a.value):new Vc(this.source,C,a);H(J(this.path)===a,"Can't get a merge for a child not on the path of the operation");return new Vc(this.source,D(this.path),this.children)};Vc.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"};function Xc(a,b){this.rf={};this.Uc=new Mb(a);this.va=b;var c=1E4+2E4*Math.random();Mc(q(this.lf,this),Math.floor(c))}Xc.prototype.lf=function(){var a=this.Uc.get(),b={},c=!1,d;for(d in a)0<a[d]&&cb(this.rf,d)&&(b[d]=a[d],c=!0);c&&this.va.ve(b);Mc(q(this.lf,this),Math.floor(6E5*Math.random()))};var Yc={},Zc={};function $c(a){a=a.toString();Yc[a]||(Yc[a]=new Kb);return Yc[a]}function ad(a,b){var c=a.toString();Zc[c]||(Zc[c]=b());return Zc[c]};var bd=null;"undefined"!==typeof MozWebSocket?bd=MozWebSocket:"undefined"!==typeof WebSocket&&(bd=WebSocket);function cd(a,b,c,d){this.Xd=a;this.f=yc(this.Xd);this.frames=this.yc=null;this.pb=this.qb=this.Ce=0;this.Va=$c(b);a={v:"5"};"undefined"!==typeof location&&location.href&&-1!==location.href.indexOf("firebaseio.com")&&(a.r="f");c&&(a.s=c);d&&(a.ls=d);this.Je=Jb(b,"websocket",a)}var dd;
	cd.prototype.open=function(a,b){this.ib=b;this.Xf=a;this.f("Websocket connecting to "+this.Je);this.vc=!1;yb.set("previous_websocket_failure",!0);try{this.Ia=new bd(this.Je)}catch(c){this.f("Error instantiating WebSocket.");var d=c.message||c.data;d&&this.f(d);this.bb();return}var e=this;this.Ia.onopen=function(){e.f("Websocket connected.");e.vc=!0};this.Ia.onclose=function(){e.f("Websocket connection was disconnected.");e.Ia=null;e.bb()};this.Ia.onmessage=function(a){if(null!==e.Ia)if(a=a.data,e.pb+=
	a.length,Lb(e.Va,"bytes_received",a.length),ed(e),null!==e.frames)fd(e,a);else{a:{H(null===e.frames,"We already have a frame buffer");if(6>=a.length){var b=Number(a);if(!isNaN(b)){e.Ce=b;e.frames=[];a=null;break a}}e.Ce=1;e.frames=[]}null!==a&&fd(e,a)}};this.Ia.onerror=function(a){e.f("WebSocket error.  Closing connection.");(a=a.message||a.data)&&e.f(a);e.bb()}};cd.prototype.start=function(){};
	cd.isAvailable=function(){var a=!1;if("undefined"!==typeof navigator&&navigator.userAgent){var b=navigator.userAgent.match(/Android ([0-9]{0,}\.[0-9]{0,})/);b&&1<b.length&&4.4>parseFloat(b[1])&&(a=!0)}return!a&&null!==bd&&!dd};cd.responsesRequiredToBeHealthy=2;cd.healthyTimeout=3E4;g=cd.prototype;g.qd=function(){yb.remove("previous_websocket_failure")};function fd(a,b){a.frames.push(b);if(a.frames.length==a.Ce){var c=a.frames.join("");a.frames=null;c=ob(c);a.Xf(c)}}
	g.send=function(a){ed(this);a=B(a);this.qb+=a.length;Lb(this.Va,"bytes_sent",a.length);a=Hc(a,16384);1<a.length&&gd(this,String(a.length));for(var b=0;b<a.length;b++)gd(this,a[b])};g.Sc=function(){this.Ab=!0;this.yc&&(clearInterval(this.yc),this.yc=null);this.Ia&&(this.Ia.close(),this.Ia=null)};g.bb=function(){this.Ab||(this.f("WebSocket is closing itself"),this.Sc(),this.ib&&(this.ib(this.vc),this.ib=null))};g.close=function(){this.Ab||(this.f("WebSocket is being closed"),this.Sc())};
	function ed(a){clearInterval(a.yc);a.yc=setInterval(function(){a.Ia&&gd(a,"0");ed(a)},Math.floor(45E3))}function gd(a,b){try{a.Ia.send(b)}catch(c){a.f("Exception thrown from WebSocket.send():",c.message||c.data,"Closing connection."),setTimeout(q(a.bb,a),0)}};function hd(){this.fb={}}
	function jd(a,b){var c=b.type,d=b.Xa;H("child_added"==c||"child_changed"==c||"child_removed"==c,"Only child changes supported for tracking");H(".priority"!==d,"Only non-priority child changes can be tracked.");var e=w(a.fb,d);if(e){var f=e.type;if("child_added"==c&&"child_removed"==f)a.fb[d]=new I("child_changed",b.Ja,d,e.Ja);else if("child_removed"==c&&"child_added"==f)delete a.fb[d];else if("child_removed"==c&&"child_changed"==f)a.fb[d]=new I("child_removed",e.ne,d);else if("child_changed"==c&&
	"child_added"==f)a.fb[d]=new I("child_added",b.Ja,d);else if("child_changed"==c&&"child_changed"==f)a.fb[d]=new I("child_changed",b.Ja,d,e.ne);else throw sc("Illegal combination of changes: "+b+" occurred after "+e);}else a.fb[d]=b};function kd(a){this.V=a;this.g=a.m.g}function ld(a,b,c,d){var e=[],f=[];Ja(b,function(b){"child_changed"===b.type&&a.g.ld(b.ne,b.Ja)&&f.push(new I("child_moved",b.Ja,b.Xa))});md(a,e,"child_removed",b,d,c);md(a,e,"child_added",b,d,c);md(a,e,"child_moved",f,d,c);md(a,e,"child_changed",b,d,c);md(a,e,cc,b,d,c);return e}function md(a,b,c,d,e,f){d=Ka(d,function(a){return a.type===c});Sa(d,q(a.Ff,a));Ja(d,function(c){var d=nd(a,c,f);Ja(e,function(e){e.nf(c.type)&&b.push(e.createEvent(d,a.V))})})}
	function nd(a,b,c){"value"!==b.type&&"child_removed"!==b.type&&(b.Bd=c.Ve(b.Xa,b.Ja,a.g));return b}kd.prototype.Ff=function(a,b){if(null==a.Xa||null==b.Xa)throw sc("Should only compare child_ events.");return this.g.compare(new K(a.Xa,a.Ja),new K(b.Xa,b.Ja))};function od(a,b){this.Qd=a;this.Df=b}function pd(a){this.U=a}
	pd.prototype.eb=function(a,b,c,d){var e=new hd,f;if(b.type===Bb)b.source.be?c=qd(this,a,b.path,b.Ga,c,d,e):(H(b.source.Se,"Unknown source."),f=b.source.Be||ec(a.w())&&!b.path.e(),c=rd(this,a,b.path,b.Ga,c,d,f,e));else if(b.type===Wc)b.source.be?c=sd(this,a,b.path,b.children,c,d,e):(H(b.source.Se,"Unknown source."),f=b.source.Be||ec(a.w()),c=td(this,a,b.path,b.children,c,d,f,e));else if(b.type===ud)if(b.Gd)if(b=b.path,null!=c.lc(b))c=a;else{f=new Yb(c,a,d);d=a.N.j();if(b.e()||".priority"===J(b))dc(a.w())?
	b=c.Aa(ac(a)):(b=a.w().j(),H(b instanceof P,"serverChildren would be complete if leaf node"),b=c.qc(b)),b=this.U.ya(d,b,e);else{var h=J(b),k=c.pc(h,a.w());null==k&&Zb(a.w(),h)&&(k=d.Q(h));b=null!=k?this.U.F(d,h,k,D(b),f,e):a.N.j().Da(h)?this.U.F(d,h,G,D(b),f,e):d;b.e()&&dc(a.w())&&(d=c.Aa(ac(a)),d.J()&&(b=this.U.ya(b,d,e)))}d=dc(a.w())||null!=c.lc(C);c=vd(a,b,d,this.U.Na())}else c=wd(this,a,b.path,b.Ob,c,d,e);else if(b.type===Db)d=b.path,b=a.w(),f=b.j(),h=b.da||d.e(),c=xd(this,new yd(a.N,new $b(f,
	h,b.Sb)),d,c,Xb,e);else throw sc("Unknown operation type: "+b.type);e=ta(e.fb);d=c;b=d.N;b.da&&(f=b.j().J()||b.j().e(),h=zd(a),(0<e.length||!a.N.da||f&&!b.j().Z(h)||!b.j().C().Z(h.C()))&&e.push(bc(zd(d))));return new od(c,e)};
	function xd(a,b,c,d,e,f){var h=b.N;if(null!=d.lc(c))return b;var k;if(c.e())H(dc(b.w()),"If change path is empty, we must have complete server data"),ec(b.w())?(e=ac(b),d=d.qc(e instanceof P?e:G)):d=d.Aa(ac(b)),f=a.U.ya(b.N.j(),d,f);else{var l=J(c);if(".priority"==l)H(1==Ad(c),"Can't have a priority with additional path components"),f=h.j(),k=b.w().j(),d=d.Zc(c,f,k),f=null!=d?a.U.fa(f,d):h.j();else{var m=D(c);Zb(h,l)?(k=b.w().j(),d=d.Zc(c,h.j(),k),d=null!=d?h.j().Q(l).F(m,d):h.j().Q(l)):d=d.pc(l,
	b.w());f=null!=d?a.U.F(h.j(),l,d,m,e,f):h.j()}}return vd(b,f,h.da||c.e(),a.U.Na())}function rd(a,b,c,d,e,f,h,k){var l=b.w();h=h?a.U:a.U.Ub();if(c.e())d=h.ya(l.j(),d,null);else if(h.Na()&&!l.Sb)d=l.j().F(c,d),d=h.ya(l.j(),d,null);else{var m=J(c);if(!fc(l,c)&&1<Ad(c))return b;var u=D(c);d=l.j().Q(m).F(u,d);d=".priority"==m?h.fa(l.j(),d):h.F(l.j(),m,d,u,Xb,null)}l=l.da||c.e();b=new yd(b.N,new $b(d,l,h.Na()));return xd(a,b,c,e,new Yb(e,b,f),k)}
	function qd(a,b,c,d,e,f,h){var k=b.N;e=new Yb(e,b,f);if(c.e())h=a.U.ya(b.N.j(),d,h),a=vd(b,h,!0,a.U.Na());else if(f=J(c),".priority"===f)h=a.U.fa(b.N.j(),d),a=vd(b,h,k.da,k.Sb);else{c=D(c);var l=k.j().Q(f);if(!c.e()){var m=e.Te(f);d=null!=m?".priority"===Bd(c)&&m.P(c.parent()).e()?m:m.F(c,d):G}l.Z(d)?a=b:(h=a.U.F(k.j(),f,d,c,e,h),a=vd(b,h,k.da,a.U.Na()))}return a}
	function sd(a,b,c,d,e,f,h){var k=b;Cd(d,function(d,m){var u=c.n(d);Zb(b.N,J(u))&&(k=qd(a,k,u,m,e,f,h))});Cd(d,function(d,m){var u=c.n(d);Zb(b.N,J(u))||(k=qd(a,k,u,m,e,f,h))});return k}function Dd(a,b){Cd(b,function(b,d){a=a.F(b,d)});return a}
	function td(a,b,c,d,e,f,h,k){if(b.w().j().e()&&!dc(b.w()))return b;var l=b;c=c.e()?d:Ed(Q,c,d);var m=b.w().j();c.children.ha(function(c,d){if(m.Da(c)){var F=b.w().j().Q(c),F=Dd(F,d);l=rd(a,l,new L(c),F,e,f,h,k)}});c.children.ha(function(c,d){var F=!Zb(b.w(),c)&&null==d.value;m.Da(c)||F||(F=b.w().j().Q(c),F=Dd(F,d),l=rd(a,l,new L(c),F,e,f,h,k))});return l}
	function wd(a,b,c,d,e,f,h){if(null!=e.lc(c))return b;var k=ec(b.w()),l=b.w();if(null!=d.value){if(c.e()&&l.da||fc(l,c))return rd(a,b,c,l.j().P(c),e,f,k,h);if(c.e()){var m=Q;l.j().O(Fd,function(a,b){m=m.set(new L(a),b)});return td(a,b,c,m,e,f,k,h)}return b}m=Q;Cd(d,function(a){var b=c.n(a);fc(l,b)&&(m=m.set(a,l.j().P(b)))});return td(a,b,c,m,e,f,k,h)};function Gd(a){this.g=a}g=Gd.prototype;g.F=function(a,b,c,d,e,f){H(a.xc(this.g),"A node must be indexed if only a child is updated");e=a.Q(b);if(e.P(d).Z(c.P(d))&&e.e()==c.e())return a;null!=f&&(c.e()?a.Da(b)?jd(f,new I("child_removed",e,b)):H(a.J(),"A child remove without an old child only makes sense on a leaf node"):e.e()?jd(f,new I("child_added",c,b)):jd(f,new I("child_changed",c,b,e)));return a.J()&&c.e()?a:a.T(b,c).nb(this.g)};
	g.ya=function(a,b,c){null!=c&&(a.J()||a.O(N,function(a,e){b.Da(a)||jd(c,new I("child_removed",e,a))}),b.J()||b.O(N,function(b,e){if(a.Da(b)){var f=a.Q(b);f.Z(e)||jd(c,new I("child_changed",e,b,f))}else jd(c,new I("child_added",e,b))}));return b.nb(this.g)};g.fa=function(a,b){return a.e()?G:a.fa(b)};g.Na=function(){return!1};g.Ub=function(){return this};function Hd(a){this.ee=new Gd(a.g);this.g=a.g;var b;a.ka?(b=Id(a),b=a.g.Dc(Jd(a),b)):b=a.g.Gc();this.Tc=b;a.na?(b=Kd(a),a=a.g.Dc(Ld(a),b)):a=a.g.Ec();this.uc=a}g=Hd.prototype;g.matches=function(a){return 0>=this.g.compare(this.Tc,a)&&0>=this.g.compare(a,this.uc)};g.F=function(a,b,c,d,e,f){this.matches(new K(b,c))||(c=G);return this.ee.F(a,b,c,d,e,f)};
	g.ya=function(a,b,c){b.J()&&(b=G);var d=b.nb(this.g),d=d.fa(G),e=this;b.O(N,function(a,b){e.matches(new K(a,b))||(d=d.T(a,G))});return this.ee.ya(a,d,c)};g.fa=function(a){return a};g.Na=function(){return!0};g.Ub=function(){return this.ee};function Md(a){this.sa=new Hd(a);this.g=a.g;H(a.xa,"Only valid if limit has been set");this.oa=a.oa;this.Ib=!Nd(a)}g=Md.prototype;g.F=function(a,b,c,d,e,f){this.sa.matches(new K(b,c))||(c=G);return a.Q(b).Z(c)?a:a.Eb()<this.oa?this.sa.Ub().F(a,b,c,d,e,f):Od(this,a,b,c,e,f)};
	g.ya=function(a,b,c){var d;if(b.J()||b.e())d=G.nb(this.g);else if(2*this.oa<b.Eb()&&b.xc(this.g)){d=G.nb(this.g);b=this.Ib?b.Zb(this.sa.uc,this.g):b.Xb(this.sa.Tc,this.g);for(var e=0;0<b.Pa.length&&e<this.oa;){var f=R(b),h;if(h=this.Ib?0>=this.g.compare(this.sa.Tc,f):0>=this.g.compare(f,this.sa.uc))d=d.T(f.name,f.R),e++;else break}}else{d=b.nb(this.g);d=d.fa(G);var k,l,m;if(this.Ib){b=d.We(this.g);k=this.sa.uc;l=this.sa.Tc;var u=Pd(this.g);m=function(a,b){return u(b,a)}}else b=d.Wb(this.g),k=this.sa.Tc,
	l=this.sa.uc,m=Pd(this.g);for(var e=0,z=!1;0<b.Pa.length;)f=R(b),!z&&0>=m(k,f)&&(z=!0),(h=z&&e<this.oa&&0>=m(f,l))?e++:d=d.T(f.name,G)}return this.sa.Ub().ya(a,d,c)};g.fa=function(a){return a};g.Na=function(){return!0};g.Ub=function(){return this.sa.Ub()};
	function Od(a,b,c,d,e,f){var h;if(a.Ib){var k=Pd(a.g);h=function(a,b){return k(b,a)}}else h=Pd(a.g);H(b.Eb()==a.oa,"");var l=new K(c,d),m=a.Ib?Qd(b,a.g):Rd(b,a.g),u=a.sa.matches(l);if(b.Da(c)){for(var z=b.Q(c),m=e.ce(a.g,m,a.Ib);null!=m&&(m.name==c||b.Da(m.name));)m=e.ce(a.g,m,a.Ib);e=null==m?1:h(m,l);if(u&&!d.e()&&0<=e)return null!=f&&jd(f,new I("child_changed",d,c,z)),b.T(c,d);null!=f&&jd(f,new I("child_removed",z,c));b=b.T(c,G);return null!=m&&a.sa.matches(m)?(null!=f&&jd(f,new I("child_added",
	m.R,m.name)),b.T(m.name,m.R)):b}return d.e()?b:u&&0<=h(m,l)?(null!=f&&(jd(f,new I("child_removed",m.R,m.name)),jd(f,new I("child_added",d,c))),b.T(c,d).T(m.name,G)):b};function qc(a,b){this.B=a;H(n(this.B)&&null!==this.B,"LeafNode shouldn't be created with null/undefined value.");this.aa=b||G;Sd(this.aa);this.Db=null}var Td=["object","boolean","number","string"];g=qc.prototype;g.J=function(){return!0};g.C=function(){return this.aa};g.fa=function(a){return new qc(this.B,a)};g.Q=function(a){return".priority"===a?this.aa:G};g.P=function(a){return a.e()?this:".priority"===J(a)?this.aa:G};g.Da=function(){return!1};g.Ve=function(){return null};
	g.T=function(a,b){return".priority"===a?this.fa(b):b.e()&&".priority"!==a?this:G.T(a,b).fa(this.aa)};g.F=function(a,b){var c=J(a);if(null===c)return b;if(b.e()&&".priority"!==c)return this;H(".priority"!==c||1===Ad(a),".priority must be the last token in a path");return this.T(c,G.F(D(a),b))};g.e=function(){return!1};g.Eb=function(){return 0};g.O=function(){return!1};g.H=function(a){return a&&!this.C().e()?{".value":this.Ca(),".priority":this.C().H()}:this.Ca()};
	g.hash=function(){if(null===this.Db){var a="";this.aa.e()||(a+="priority:"+Ud(this.aa.H())+":");var b=typeof this.B,a=a+(b+":"),a="number"===b?a+Jc(this.B):a+this.B;this.Db=uc(a)}return this.Db};g.Ca=function(){return this.B};g.rc=function(a){if(a===G)return 1;if(a instanceof P)return-1;H(a.J(),"Unknown node type");var b=typeof a.B,c=typeof this.B,d=Ia(Td,b),e=Ia(Td,c);H(0<=d,"Unknown leaf type: "+b);H(0<=e,"Unknown leaf type: "+c);return d===e?"object"===c?0:this.B<a.B?-1:this.B===a.B?0:1:e-d};
	g.nb=function(){return this};g.xc=function(){return!0};g.Z=function(a){return a===this?!0:a.J()?this.B===a.B&&this.aa.Z(a.aa):!1};g.toString=function(){return B(this.H(!0))};function Vd(){}var Wd={};function Pd(a){return q(a.compare,a)}Vd.prototype.ld=function(a,b){return 0!==this.compare(new K("[MIN_NAME]",a),new K("[MIN_NAME]",b))};Vd.prototype.Gc=function(){return Xd};function Yd(a){H(!a.e()&&".priority"!==J(a),"Can't create PathIndex with empty path or .priority key");this.bc=a}la(Yd,Vd);g=Yd.prototype;g.wc=function(a){return!a.P(this.bc).e()};g.compare=function(a,b){var c=a.R.P(this.bc),d=b.R.P(this.bc),c=c.rc(d);return 0===c?hc(a.name,b.name):c};
	g.Dc=function(a,b){var c=M(a),c=G.F(this.bc,c);return new K(b,c)};g.Ec=function(){var a=G.F(this.bc,Zd);return new K("[MAX_NAME]",a)};g.toString=function(){return this.bc.slice().join("/")};function $d(){}la($d,Vd);g=$d.prototype;g.compare=function(a,b){var c=a.R.C(),d=b.R.C(),c=c.rc(d);return 0===c?hc(a.name,b.name):c};g.wc=function(a){return!a.C().e()};g.ld=function(a,b){return!a.C().Z(b.C())};g.Gc=function(){return Xd};g.Ec=function(){return new K("[MAX_NAME]",new qc("[PRIORITY-POST]",Zd))};
	g.Dc=function(a,b){var c=M(a);return new K(b,new qc("[PRIORITY-POST]",c))};g.toString=function(){return".priority"};var N=new $d;function ae(){}la(ae,Vd);g=ae.prototype;g.compare=function(a,b){return hc(a.name,b.name)};g.wc=function(){throw sc("KeyIndex.isDefinedOn not expected to be called.");};g.ld=function(){return!1};g.Gc=function(){return Xd};g.Ec=function(){return new K("[MAX_NAME]",G)};g.Dc=function(a){H(p(a),"KeyIndex indexValue must always be a string.");return new K(a,G)};g.toString=function(){return".key"};
	var Fd=new ae;function be(){}la(be,Vd);g=be.prototype;g.compare=function(a,b){var c=a.R.rc(b.R);return 0===c?hc(a.name,b.name):c};g.wc=function(){return!0};g.ld=function(a,b){return!a.Z(b)};g.Gc=function(){return Xd};g.Ec=function(){return ce};g.Dc=function(a,b){var c=M(a);return new K(b,c)};g.toString=function(){return".value"};var de=new be;function ee(){this.Rb=this.na=this.Kb=this.ka=this.xa=!1;this.oa=0;this.mb="";this.dc=null;this.zb="";this.ac=null;this.xb="";this.g=N}var fe=new ee;function Nd(a){return""===a.mb?a.ka:"l"===a.mb}function Jd(a){H(a.ka,"Only valid if start has been set");return a.dc}function Id(a){H(a.ka,"Only valid if start has been set");return a.Kb?a.zb:"[MIN_NAME]"}function Ld(a){H(a.na,"Only valid if end has been set");return a.ac}
	function Kd(a){H(a.na,"Only valid if end has been set");return a.Rb?a.xb:"[MAX_NAME]"}function ge(a){var b=new ee;b.xa=a.xa;b.oa=a.oa;b.ka=a.ka;b.dc=a.dc;b.Kb=a.Kb;b.zb=a.zb;b.na=a.na;b.ac=a.ac;b.Rb=a.Rb;b.xb=a.xb;b.g=a.g;b.mb=a.mb;return b}g=ee.prototype;g.ke=function(a){var b=ge(this);b.xa=!0;b.oa=a;b.mb="l";return b};g.le=function(a){var b=ge(this);b.xa=!0;b.oa=a;b.mb="r";return b};g.Ld=function(a,b){var c=ge(this);c.ka=!0;n(a)||(a=null);c.dc=a;null!=b?(c.Kb=!0,c.zb=b):(c.Kb=!1,c.zb="");return c};
	g.ed=function(a,b){var c=ge(this);c.na=!0;n(a)||(a=null);c.ac=a;n(b)?(c.Rb=!0,c.xb=b):(c.vg=!1,c.xb="");return c};function he(a,b){var c=ge(a);c.g=b;return c}function ie(a){var b={};a.ka&&(b.sp=a.dc,a.Kb&&(b.sn=a.zb));a.na&&(b.ep=a.ac,a.Rb&&(b.en=a.xb));if(a.xa){b.l=a.oa;var c=a.mb;""===c&&(c=Nd(a)?"l":"r");b.vf=c}a.g!==N&&(b.i=a.g.toString());return b}function S(a){return!(a.ka||a.na||a.xa)}function Sc(a){return S(a)&&a.g==N}
	function Tc(a){var b={};if(Sc(a))return b;var c;a.g===N?c="$priority":a.g===de?c="$value":a.g===Fd?c="$key":(H(a.g instanceof Yd,"Unrecognized index type!"),c=a.g.toString());b.orderBy=B(c);a.ka&&(b.startAt=B(a.dc),a.Kb&&(b.startAt+=","+B(a.zb)));a.na&&(b.endAt=B(a.ac),a.Rb&&(b.endAt+=","+B(a.xb)));a.xa&&(Nd(a)?b.limitToFirst=a.oa:b.limitToLast=a.oa);return b}g.toString=function(){return B(ie(this))};function je(a,b){this.md=a;this.cc=b}je.prototype.get=function(a){var b=w(this.md,a);if(!b)throw Error("No index defined for "+a);return b===Wd?null:b};function ke(a,b,c){var d=pa(a.md,function(d,f){var h=w(a.cc,f);H(h,"Missing index implementation for "+f);if(d===Wd){if(h.wc(b.R)){for(var k=[],l=c.Wb(jc),m=R(l);m;)m.name!=b.name&&k.push(m),m=R(l);k.push(b);return le(k,Pd(h))}return Wd}h=c.get(b.name);k=d;h&&(k=k.remove(new K(b.name,h)));return k.Oa(b,b.R)});return new je(d,a.cc)}
	function me(a,b,c){var d=pa(a.md,function(a){if(a===Wd)return a;var d=c.get(b.name);return d?a.remove(new K(b.name,d)):a});return new je(d,a.cc)}var ne=new je({".priority":Wd},{".priority":N});function oe(){this.set={}}g=oe.prototype;g.add=function(a,b){this.set[a]=null!==b?b:!0};g.contains=function(a){return cb(this.set,a)};g.get=function(a){return this.contains(a)?this.set[a]:void 0};g.remove=function(a){delete this.set[a]};g.clear=function(){this.set={}};g.e=function(){return ya(this.set)};g.count=function(){return ra(this.set)};function pe(a,b){r(a.set,function(a,d){b(d,a)})}g.keys=function(){var a=[];r(this.set,function(b,c){a.push(c)});return a};function qe(a,b,c,d){this.Xd=a;this.f=yc(a);this.jc=b;this.pb=this.qb=0;this.Va=$c(b);this.tf=c;this.vc=!1;this.Cb=d;this.Xc=function(a){return Jb(b,"long_polling",a)}}var re,se;
	qe.prototype.open=function(a,b){this.Me=0;this.ia=b;this.bf=new rb(a);this.Ab=!1;var c=this;this.sb=setTimeout(function(){c.f("Timed out trying to connect.");c.bb();c.sb=null},Math.floor(3E4));Dc(function(){if(!c.Ab){c.Ta=new te(function(a,b,d,k,l){ue(c,arguments);if(c.Ta)if(c.sb&&(clearTimeout(c.sb),c.sb=null),c.vc=!0,"start"==a)c.id=b,c.ff=d;else if("close"===a)b?(c.Ta.Id=!1,sb(c.bf,b,function(){c.bb()})):c.bb();else throw Error("Unrecognized command received: "+a);},function(a,b){ue(c,arguments);
	tb(c.bf,a,b)},function(){c.bb()},c.Xc);var a={start:"t"};a.ser=Math.floor(1E8*Math.random());c.Ta.Od&&(a.cb=c.Ta.Od);a.v="5";c.tf&&(a.s=c.tf);c.Cb&&(a.ls=c.Cb);"undefined"!==typeof location&&location.href&&-1!==location.href.indexOf("firebaseio.com")&&(a.r="f");a=c.Xc(a);c.f("Connecting via long-poll to "+a);ve(c.Ta,a,function(){})}})};
	qe.prototype.start=function(){var a=this.Ta,b=this.ff;a.Vf=this.id;a.Wf=b;for(a.Sd=!0;we(a););a=this.id;b=this.ff;this.fc=document.createElement("iframe");var c={dframe:"t"};c.id=a;c.pw=b;this.fc.src=this.Xc(c);this.fc.style.display="none";document.body.appendChild(this.fc)};
	qe.isAvailable=function(){return re||!se&&"undefined"!==typeof document&&null!=document.createElement&&!("object"===typeof window&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))&&!("object"===typeof Windows&&"object"===typeof Windows.rg)&&!0};g=qe.prototype;g.qd=function(){};g.Sc=function(){this.Ab=!0;this.Ta&&(this.Ta.close(),this.Ta=null);this.fc&&(document.body.removeChild(this.fc),this.fc=null);this.sb&&(clearTimeout(this.sb),this.sb=null)};
	g.bb=function(){this.Ab||(this.f("Longpoll is closing itself"),this.Sc(),this.ia&&(this.ia(this.vc),this.ia=null))};g.close=function(){this.Ab||(this.f("Longpoll is being closed."),this.Sc())};g.send=function(a){a=B(a);this.qb+=a.length;Lb(this.Va,"bytes_sent",a.length);a=mb(a);a=ab(a,!0);a=Hc(a,1840);for(var b=0;b<a.length;b++){var c=this.Ta;c.Pc.push({jg:this.Me,pg:a.length,Oe:a[b]});c.Sd&&we(c);this.Me++}};function ue(a,b){var c=B(b).length;a.pb+=c;Lb(a.Va,"bytes_received",c)}
	function te(a,b,c,d){this.Xc=d;this.ib=c;this.se=new oe;this.Pc=[];this.Yd=Math.floor(1E8*Math.random());this.Id=!0;this.Od=rc();window["pLPCommand"+this.Od]=a;window["pRTLPCB"+this.Od]=b;a=document.createElement("iframe");a.style.display="none";if(document.body){document.body.appendChild(a);try{a.contentWindow.document||E("No IE domain setting required")}catch(e){a.src="javascript:void((function(){document.open();document.domain='"+document.domain+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";
	a.contentDocument?a.gb=a.contentDocument:a.contentWindow?a.gb=a.contentWindow.document:a.document&&(a.gb=a.document);this.Ea=a;a="";this.Ea.src&&"javascript:"===this.Ea.src.substr(0,11)&&(a='<script>document.domain="'+document.domain+'";\x3c/script>');a="<html><body>"+a+"</body></html>";try{this.Ea.gb.open(),this.Ea.gb.write(a),this.Ea.gb.close()}catch(f){E("frame writing exception"),f.stack&&E(f.stack),E(f)}}
	te.prototype.close=function(){this.Sd=!1;if(this.Ea){this.Ea.gb.body.innerHTML="";var a=this;setTimeout(function(){null!==a.Ea&&(document.body.removeChild(a.Ea),a.Ea=null)},Math.floor(0))}var b=this.ib;b&&(this.ib=null,b())};
	function we(a){if(a.Sd&&a.Id&&a.se.count()<(0<a.Pc.length?2:1)){a.Yd++;var b={};b.id=a.Vf;b.pw=a.Wf;b.ser=a.Yd;for(var b=a.Xc(b),c="",d=0;0<a.Pc.length;)if(1870>=a.Pc[0].Oe.length+30+c.length){var e=a.Pc.shift(),c=c+"&seg"+d+"="+e.jg+"&ts"+d+"="+e.pg+"&d"+d+"="+e.Oe;d++}else break;xe(a,b+c,a.Yd);return!0}return!1}function xe(a,b,c){function d(){a.se.remove(c);we(a)}a.se.add(c,1);var e=setTimeout(d,Math.floor(25E3));ve(a,b,function(){clearTimeout(e);d()})}
	function ve(a,b,c){setTimeout(function(){try{if(a.Id){var d=a.Ea.gb.createElement("script");d.type="text/javascript";d.async=!0;d.src=b;d.onload=d.onreadystatechange=function(){var a=d.readyState;a&&"loaded"!==a&&"complete"!==a||(d.onload=d.onreadystatechange=null,d.parentNode&&d.parentNode.removeChild(d),c())};d.onerror=function(){E("Long-poll script failed to load: "+b);a.Id=!1;a.close()};a.Ea.gb.body.appendChild(d)}}catch(e){}},Math.floor(1))};function ye(a){ze(this,a)}var Ae=[qe,cd];function ze(a,b){var c=cd&&cd.isAvailable(),d=c&&!(yb.Ze||!0===yb.get("previous_websocket_failure"));b.qg&&(c||O("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),d=!0);if(d)a.Vc=[cd];else{var e=a.Vc=[];Ic(Ae,function(a,b){b&&b.isAvailable()&&e.push(b)})}}function Be(a){if(0<a.Vc.length)return a.Vc[0];throw Error("No transports available");};function Ce(a,b,c,d,e,f,h){this.id=a;this.f=yc("c:"+this.id+":");this.qe=c;this.Kc=d;this.ia=e;this.pe=f;this.L=b;this.yd=[];this.Ke=0;this.sf=new ye(b);this.Ua=0;this.Cb=h;this.f("Connection created");De(this)}
	function De(a){var b=Be(a.sf);a.I=new b("c:"+a.id+":"+a.Ke++,a.L,void 0,a.Cb);a.ue=b.responsesRequiredToBeHealthy||0;var c=Ee(a,a.I),d=Fe(a,a.I);a.Wc=a.I;a.Qc=a.I;a.D=null;a.Bb=!1;setTimeout(function(){a.I&&a.I.open(c,d)},Math.floor(0));b=b.healthyTimeout||0;0<b&&(a.kd=Mc(function(){a.kd=null;a.Bb||(a.I&&102400<a.I.pb?(a.f("Connection exceeded healthy timeout but has received "+a.I.pb+" bytes.  Marking connection healthy."),a.Bb=!0,a.I.qd()):a.I&&10240<a.I.qb?a.f("Connection exceeded healthy timeout but has sent "+
	a.I.qb+" bytes.  Leaving connection alive."):(a.f("Closing unhealthy connection after timeout."),a.close()))},Math.floor(b)))}function Fe(a,b){return function(c){b===a.I?(a.I=null,c||0!==a.Ua?1===a.Ua&&a.f("Realtime connection lost."):(a.f("Realtime connection failed."),"s-"===a.L.$a.substr(0,2)&&(yb.remove("host:"+a.L.host),a.L.$a=a.L.host)),a.close()):b===a.D?(a.f("Secondary connection lost."),c=a.D,a.D=null,a.Wc!==c&&a.Qc!==c||a.close()):a.f("closing an old connection")}}
	function Ee(a,b){return function(c){if(2!=a.Ua)if(b===a.Qc){var d=Fc("t",c);c=Fc("d",c);if("c"==d){if(d=Fc("t",c),"d"in c)if(c=c.d,"h"===d){var d=c.ts,e=c.v,f=c.h;a.qf=c.s;Ib(a.L,f);0==a.Ua&&(a.I.start(),Ge(a,a.I,d),"5"!==e&&O("Protocol version mismatch detected"),c=a.sf,(c=1<c.Vc.length?c.Vc[1]:null)&&He(a,c))}else if("n"===d){a.f("recvd end transmission on primary");a.Qc=a.D;for(c=0;c<a.yd.length;++c)a.ud(a.yd[c]);a.yd=[];Ie(a)}else"s"===d?(a.f("Connection shutdown command received. Shutting down..."),
	a.pe&&(a.pe(c),a.pe=null),a.ia=null,a.close()):"r"===d?(a.f("Reset packet received.  New host: "+c),Ib(a.L,c),1===a.Ua?a.close():(Je(a),De(a))):"e"===d?zc("Server Error: "+c):"o"===d?(a.f("got pong on primary."),Ke(a),Le(a)):zc("Unknown control packet command: "+d)}else"d"==d&&a.ud(c)}else if(b===a.D)if(d=Fc("t",c),c=Fc("d",c),"c"==d)"t"in c&&(c=c.t,"a"===c?Me(a):"r"===c?(a.f("Got a reset on secondary, closing it"),a.D.close(),a.Wc!==a.D&&a.Qc!==a.D||a.close()):"o"===c&&(a.f("got pong on secondary."),
	a.pf--,Me(a)));else if("d"==d)a.yd.push(c);else throw Error("Unknown protocol layer: "+d);else a.f("message on old connection")}}Ce.prototype.ua=function(a){Ne(this,{t:"d",d:a})};function Ie(a){a.Wc===a.D&&a.Qc===a.D&&(a.f("cleaning up and promoting a connection: "+a.D.Xd),a.I=a.D,a.D=null)}
	function Me(a){0>=a.pf?(a.f("Secondary connection is healthy."),a.Bb=!0,a.D.qd(),a.D.start(),a.f("sending client ack on secondary"),a.D.send({t:"c",d:{t:"a",d:{}}}),a.f("Ending transmission on primary"),a.I.send({t:"c",d:{t:"n",d:{}}}),a.Wc=a.D,Ie(a)):(a.f("sending ping on secondary."),a.D.send({t:"c",d:{t:"p",d:{}}}))}Ce.prototype.ud=function(a){Ke(this);this.qe(a)};function Ke(a){a.Bb||(a.ue--,0>=a.ue&&(a.f("Primary connection is healthy."),a.Bb=!0,a.I.qd()))}
	function He(a,b){a.D=new b("c:"+a.id+":"+a.Ke++,a.L,a.qf);a.pf=b.responsesRequiredToBeHealthy||0;a.D.open(Ee(a,a.D),Fe(a,a.D));Mc(function(){a.D&&(a.f("Timed out trying to upgrade."),a.D.close())},Math.floor(6E4))}function Ge(a,b,c){a.f("Realtime connection established.");a.I=b;a.Ua=1;a.Kc&&(a.Kc(c,a.qf),a.Kc=null);0===a.ue?(a.f("Primary connection is healthy."),a.Bb=!0):Mc(function(){Le(a)},Math.floor(5E3))}
	function Le(a){a.Bb||1!==a.Ua||(a.f("sending ping on primary."),Ne(a,{t:"c",d:{t:"p",d:{}}}))}function Ne(a,b){if(1!==a.Ua)throw"Connection is not connected";a.Wc.send(b)}Ce.prototype.close=function(){2!==this.Ua&&(this.f("Closing realtime connection."),this.Ua=2,Je(this),this.ia&&(this.ia(),this.ia=null))};function Je(a){a.f("Shutting down all connections");a.I&&(a.I.close(),a.I=null);a.D&&(a.D.close(),a.D=null);a.kd&&(clearTimeout(a.kd),a.kd=null)};function L(a,b){if(1==arguments.length){this.o=a.split("/");for(var c=0,d=0;d<this.o.length;d++)0<this.o[d].length&&(this.o[c]=this.o[d],c++);this.o.length=c;this.Y=0}else this.o=a,this.Y=b}function T(a,b){var c=J(a);if(null===c)return b;if(c===J(b))return T(D(a),D(b));throw Error("INTERNAL ERROR: innerPath ("+b+") is not within outerPath ("+a+")");}
	function Oe(a,b){for(var c=a.slice(),d=b.slice(),e=0;e<c.length&&e<d.length;e++){var f=hc(c[e],d[e]);if(0!==f)return f}return c.length===d.length?0:c.length<d.length?-1:1}function J(a){return a.Y>=a.o.length?null:a.o[a.Y]}function Ad(a){return a.o.length-a.Y}function D(a){var b=a.Y;b<a.o.length&&b++;return new L(a.o,b)}function Bd(a){return a.Y<a.o.length?a.o[a.o.length-1]:null}g=L.prototype;
	g.toString=function(){for(var a="",b=this.Y;b<this.o.length;b++)""!==this.o[b]&&(a+="/"+this.o[b]);return a||"/"};g.slice=function(a){return this.o.slice(this.Y+(a||0))};g.parent=function(){if(this.Y>=this.o.length)return null;for(var a=[],b=this.Y;b<this.o.length-1;b++)a.push(this.o[b]);return new L(a,0)};
	g.n=function(a){for(var b=[],c=this.Y;c<this.o.length;c++)b.push(this.o[c]);if(a instanceof L)for(c=a.Y;c<a.o.length;c++)b.push(a.o[c]);else for(a=a.split("/"),c=0;c<a.length;c++)0<a[c].length&&b.push(a[c]);return new L(b,0)};g.e=function(){return this.Y>=this.o.length};g.Z=function(a){if(Ad(this)!==Ad(a))return!1;for(var b=this.Y,c=a.Y;b<=this.o.length;b++,c++)if(this.o[b]!==a.o[c])return!1;return!0};
	g.contains=function(a){var b=this.Y,c=a.Y;if(Ad(this)>Ad(a))return!1;for(;b<this.o.length;){if(this.o[b]!==a.o[c])return!1;++b;++c}return!0};var C=new L("");function Pe(a,b){this.Qa=a.slice();this.Ha=Math.max(1,this.Qa.length);this.Pe=b;for(var c=0;c<this.Qa.length;c++)this.Ha+=nb(this.Qa[c]);Qe(this)}Pe.prototype.push=function(a){0<this.Qa.length&&(this.Ha+=1);this.Qa.push(a);this.Ha+=nb(a);Qe(this)};Pe.prototype.pop=function(){var a=this.Qa.pop();this.Ha-=nb(a);0<this.Qa.length&&--this.Ha};
	function Qe(a){if(768<a.Ha)throw Error(a.Pe+"has a key path longer than 768 bytes ("+a.Ha+").");if(32<a.Qa.length)throw Error(a.Pe+"path specified exceeds the maximum depth that can be written (32) or object contains a cycle "+Re(a));}function Re(a){return 0==a.Qa.length?"":"in property '"+a.Qa.join(".")+"'"};function Se(a){a instanceof Te||Ac("Don't call new Database() directly - please use firebase.database().");this.ta=a;this.ba=new U(a,C);this.INTERNAL=new Ue(this)}var Ve={TIMESTAMP:{".sv":"timestamp"}};g=Se.prototype;g.app=null;g.jf=function(a){We(this,"ref");x("database.ref",0,1,arguments.length);return n(a)?this.ba.n(a):this.ba};
	g.gg=function(a){We(this,"database.refFromURL");x("database.refFromURL",1,1,arguments.length);var b=Bc(a);Xe("database.refFromURL",b);var c=b.jc;c.host!==this.ta.L.host&&Ac("database.refFromURL: Host name does not match the current database: (found "+c.host+" but expected "+this.ta.L.host+")");return this.jf(b.path.toString())};function We(a,b){null===a.ta&&Ac("Cannot call "+b+" on a deleted database.")}g.Pf=function(){x("database.goOffline",0,0,arguments.length);We(this,"goOffline");this.ta.ab()};
	g.Qf=function(){x("database.goOnline",0,0,arguments.length);We(this,"goOnline");this.ta.kc()};Object.defineProperty(Se.prototype,"app",{get:function(){return this.ta.app}});function Ue(a){this.Ya=a}Ue.prototype.delete=function(){We(this.Ya,"delete");var a=Ye.Vb(),b=this.Ya.ta;w(a.lb,b.app.name)!==b&&Ac("Database "+b.app.name+" has already been deleted.");b.ab();delete a.lb[b.app.name];this.Ya.ta=null;this.Ya.ba=null;this.Ya=this.Ya.INTERNAL=null;return firebase.Promise.resolve()};
	Se.prototype.ref=Se.prototype.jf;Se.prototype.refFromURL=Se.prototype.gg;Se.prototype.goOnline=Se.prototype.Qf;Se.prototype.goOffline=Se.prototype.Pf;Ue.prototype["delete"]=Ue.prototype.delete;function mc(){this.k=this.B=null}mc.prototype.find=function(a){if(null!=this.B)return this.B.P(a);if(a.e()||null==this.k)return null;var b=J(a);a=D(a);return this.k.contains(b)?this.k.get(b).find(a):null};function oc(a,b,c){if(b.e())a.B=c,a.k=null;else if(null!==a.B)a.B=a.B.F(b,c);else{null==a.k&&(a.k=new oe);var d=J(b);a.k.contains(d)||a.k.add(d,new mc);a=a.k.get(d);b=D(b);oc(a,b,c)}}
	function Ze(a,b){if(b.e())return a.B=null,a.k=null,!0;if(null!==a.B){if(a.B.J())return!1;var c=a.B;a.B=null;c.O(N,function(b,c){oc(a,new L(b),c)});return Ze(a,b)}return null!==a.k?(c=J(b),b=D(b),a.k.contains(c)&&Ze(a.k.get(c),b)&&a.k.remove(c),a.k.e()?(a.k=null,!0):!1):!0}function nc(a,b,c){null!==a.B?c(b,a.B):a.O(function(a,e){var f=new L(b.toString()+"/"+a);nc(e,f,c)})}mc.prototype.O=function(a){null!==this.k&&pe(this.k,function(b,c){a(b,c)})};var $e=/[\[\].#$\/\u0000-\u001F\u007F]/,af=/[\[\].#$\u0000-\u001F\u007F]/;function bf(a){return p(a)&&0!==a.length&&!$e.test(a)}function cf(a){return null===a||p(a)||ga(a)&&!Cc(a)||ia(a)&&cb(a,".sv")}function df(a,b,c,d){d&&!n(b)||ef(y(a,1,d),b,c)}
	function ef(a,b,c){c instanceof L&&(c=new Pe(c,a));if(!n(b))throw Error(a+"contains undefined "+Re(c));if(ha(b))throw Error(a+"contains a function "+Re(c)+" with contents: "+b.toString());if(Cc(b))throw Error(a+"contains "+b.toString()+" "+Re(c));if(p(b)&&b.length>10485760/3&&10485760<nb(b))throw Error(a+"contains a string greater than 10485760 utf8 bytes "+Re(c)+" ('"+b.substring(0,50)+"...')");if(ia(b)){var d=!1,e=!1;db(b,function(b,h){if(".value"===b)d=!0;else if(".priority"!==b&&".sv"!==b&&(e=
	!0,!bf(b)))throw Error(a+" contains an invalid key ("+b+") "+Re(c)+'.  Keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]"');c.push(b);ef(a,h,c);c.pop()});if(d&&e)throw Error(a+' contains ".value" child '+Re(c)+" in addition to actual children.");}}
	function ff(a,b){var c,d;for(c=0;c<b.length;c++){d=b[c];for(var e=d.slice(),f=0;f<e.length;f++)if((".priority"!==e[f]||f!==e.length-1)&&!bf(e[f]))throw Error(a+"contains an invalid key ("+e[f]+") in path "+d.toString()+'. Keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]"');}b.sort(Oe);e=null;for(c=0;c<b.length;c++){d=b[c];if(null!==e&&e.contains(d))throw Error(a+"contains a path "+e.toString()+" that is ancestor of another path "+d.toString());e=d}}
	function gf(a,b,c){var d=y(a,1,!1);if(!ia(b)||ea(b))throw Error(d+" must be an object containing the children to replace.");var e=[];db(b,function(a,b){var k=new L(a);ef(d,b,c.n(k));if(".priority"===Bd(k)&&!cf(b))throw Error(d+"contains an invalid value for '"+k.toString()+"', which must be a valid Firebase priority (a string, finite number, server value, or null).");e.push(k)});ff(d,e)}
	function hf(a,b,c){if(Cc(c))throw Error(y(a,b,!1)+"is "+c.toString()+", but must be a valid Firebase priority (a string, finite number, server value, or null).");if(!cf(c))throw Error(y(a,b,!1)+"must be a valid Firebase priority (a string, finite number, server value, or null).");}
	function jf(a,b,c){if(!c||n(b))switch(b){case "value":case "child_added":case "child_removed":case "child_changed":case "child_moved":break;default:throw Error(y(a,1,c)+'must be a valid event type: "value", "child_added", "child_removed", "child_changed", or "child_moved".');}}function kf(a,b){if(n(b)&&!bf(b))throw Error(y(a,2,!0)+'was an invalid key: "'+b+'".  Firebase keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]").');}
	function lf(a,b){if(!p(b)||0===b.length||af.test(b))throw Error(y(a,1,!1)+'was an invalid path: "'+b+'". Paths must be non-empty strings and can\'t contain ".", "#", "$", "[", or "]"');}function mf(a,b){if(".info"===J(b))throw Error(a+" failed: Can't modify data under /.info/");}
	function Xe(a,b){var c=b.path.toString(),d;!(d=!p(b.jc.host)||0===b.jc.host.length||!bf(b.jc.me))&&(d=0!==c.length)&&(c&&(c=c.replace(/^\/*\.info(\/|$)/,"/")),d=!(p(c)&&0!==c.length&&!af.test(c)));if(d)throw Error(y(a,1,!1)+'must be a valid firebase URL and the path can\'t contain ".", "#", "$", "[", or "]".');};function V(a,b){this.ta=a;this.qa=b}V.prototype.cancel=function(a){x("Firebase.onDisconnect().cancel",0,1,arguments.length);A("Firebase.onDisconnect().cancel",1,a,!0);var b=new hb;this.ta.vd(this.qa,ib(b,a));return b.ra};V.prototype.cancel=V.prototype.cancel;V.prototype.remove=function(a){x("Firebase.onDisconnect().remove",0,1,arguments.length);mf("Firebase.onDisconnect().remove",this.qa);A("Firebase.onDisconnect().remove",1,a,!0);var b=new hb;nf(this.ta,this.qa,null,ib(b,a));return b.ra};
	V.prototype.remove=V.prototype.remove;V.prototype.set=function(a,b){x("Firebase.onDisconnect().set",1,2,arguments.length);mf("Firebase.onDisconnect().set",this.qa);df("Firebase.onDisconnect().set",a,this.qa,!1);A("Firebase.onDisconnect().set",2,b,!0);var c=new hb;nf(this.ta,this.qa,a,ib(c,b));return c.ra};V.prototype.set=V.prototype.set;
	V.prototype.Jb=function(a,b,c){x("Firebase.onDisconnect().setWithPriority",2,3,arguments.length);mf("Firebase.onDisconnect().setWithPriority",this.qa);df("Firebase.onDisconnect().setWithPriority",a,this.qa,!1);hf("Firebase.onDisconnect().setWithPriority",2,b);A("Firebase.onDisconnect().setWithPriority",3,c,!0);var d=new hb;of(this.ta,this.qa,a,b,ib(d,c));return d.ra};V.prototype.setWithPriority=V.prototype.Jb;
	V.prototype.update=function(a,b){x("Firebase.onDisconnect().update",1,2,arguments.length);mf("Firebase.onDisconnect().update",this.qa);if(ea(a)){for(var c={},d=0;d<a.length;++d)c[""+d]=a[d];a=c;O("Passing an Array to Firebase.onDisconnect().update() is deprecated. Use set() if you want to overwrite the existing data, or an Object with integer keys if you really do want to only update some of the children.")}gf("Firebase.onDisconnect().update",a,this.qa);A("Firebase.onDisconnect().update",2,b,!0);
	c=new hb;pf(this.ta,this.qa,a,ib(c,b));return c.ra};V.prototype.update=V.prototype.update;function qf(a){H(ea(a)&&0<a.length,"Requires a non-empty array");this.Bf=a;this.Cc={}}qf.prototype.De=function(a,b){var c;c=this.Cc[a]||[];var d=c.length;if(0<d){for(var e=Array(d),f=0;f<d;f++)e[f]=c[f];c=e}else c=[];for(d=0;d<c.length;d++)c[d].He.apply(c[d].Ma,Array.prototype.slice.call(arguments,1))};qf.prototype.gc=function(a,b,c){rf(this,a);this.Cc[a]=this.Cc[a]||[];this.Cc[a].push({He:b,Ma:c});(a=this.Ue(a))&&b.apply(c,a)};
	qf.prototype.Hc=function(a,b,c){rf(this,a);a=this.Cc[a]||[];for(var d=0;d<a.length;d++)if(a[d].He===b&&(!c||c===a[d].Ma)){a.splice(d,1);break}};function rf(a,b){H(Oa(a.Bf,function(a){return a===b}),"Unknown event: "+b)};function sf(){qf.call(this,["online"]);this.hc=!0;if("undefined"!==typeof window&&"undefined"!==typeof window.addEventListener&&!qb()){var a=this;window.addEventListener("online",function(){a.hc||(a.hc=!0,a.De("online",!0))},!1);window.addEventListener("offline",function(){a.hc&&(a.hc=!1,a.De("online",!1))},!1)}}la(sf,qf);sf.prototype.Ue=function(a){H("online"===a,"Unknown event type: "+a);return[this.hc]};ca(sf);function tf(){qf.call(this,["visible"]);var a,b;"undefined"!==typeof document&&"undefined"!==typeof document.addEventListener&&("undefined"!==typeof document.hidden?(b="visibilitychange",a="hidden"):"undefined"!==typeof document.mozHidden?(b="mozvisibilitychange",a="mozHidden"):"undefined"!==typeof document.msHidden?(b="msvisibilitychange",a="msHidden"):"undefined"!==typeof document.webkitHidden&&(b="webkitvisibilitychange",a="webkitHidden"));this.Mb=!0;if(b){var c=this;document.addEventListener(b,
	function(){var b=!document[a];b!==c.Mb&&(c.Mb=b,c.De("visible",b))},!1)}}la(tf,qf);tf.prototype.Ue=function(a){H("visible"===a,"Unknown event type: "+a);return[this.Mb]};ca(tf);var uf=function(){var a=0,b=[];return function(c){var d=c===a;a=c;for(var e=Array(8),f=7;0<=f;f--)e[f]="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c%64),c=Math.floor(c/64);H(0===c,"Cannot push at time == 0");c=e.join("");if(d){for(f=11;0<=f&&63===b[f];f--)b[f]=0;b[f]++}else for(f=0;12>f;f++)b[f]=Math.floor(64*Math.random());for(f=0;12>f;f++)c+="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);H(20===c.length,"nextPushId: Length should be 20.");
	return c}}();function vf(a,b){this.La=a;this.ba=b?b:wf}g=vf.prototype;g.Oa=function(a,b){return new vf(this.La,this.ba.Oa(a,b,this.La).X(null,null,!1,null,null))};g.remove=function(a){return new vf(this.La,this.ba.remove(a,this.La).X(null,null,!1,null,null))};g.get=function(a){for(var b,c=this.ba;!c.e();){b=this.La(a,c.key);if(0===b)return c.value;0>b?c=c.left:0<b&&(c=c.right)}return null};
	function xf(a,b){for(var c,d=a.ba,e=null;!d.e();){c=a.La(b,d.key);if(0===c){if(d.left.e())return e?e.key:null;for(d=d.left;!d.right.e();)d=d.right;return d.key}0>c?d=d.left:0<c&&(e=d,d=d.right)}throw Error("Attempted to find predecessor key for a nonexistent key.  What gives?");}g.e=function(){return this.ba.e()};g.count=function(){return this.ba.count()};g.Fc=function(){return this.ba.Fc()};g.ec=function(){return this.ba.ec()};g.ha=function(a){return this.ba.ha(a)};
	g.Wb=function(a){return new yf(this.ba,null,this.La,!1,a)};g.Xb=function(a,b){return new yf(this.ba,a,this.La,!1,b)};g.Zb=function(a,b){return new yf(this.ba,a,this.La,!0,b)};g.We=function(a){return new yf(this.ba,null,this.La,!0,a)};function yf(a,b,c,d,e){this.Fd=e||null;this.ie=d;this.Pa=[];for(e=1;!a.e();)if(e=b?c(a.key,b):1,d&&(e*=-1),0>e)a=this.ie?a.left:a.right;else if(0===e){this.Pa.push(a);break}else this.Pa.push(a),a=this.ie?a.right:a.left}
	function R(a){if(0===a.Pa.length)return null;var b=a.Pa.pop(),c;c=a.Fd?a.Fd(b.key,b.value):{key:b.key,value:b.value};if(a.ie)for(b=b.left;!b.e();)a.Pa.push(b),b=b.right;else for(b=b.right;!b.e();)a.Pa.push(b),b=b.left;return c}function zf(a){if(0===a.Pa.length)return null;var b;b=a.Pa;b=b[b.length-1];return a.Fd?a.Fd(b.key,b.value):{key:b.key,value:b.value}}function Af(a,b,c,d,e){this.key=a;this.value=b;this.color=null!=c?c:!0;this.left=null!=d?d:wf;this.right=null!=e?e:wf}g=Af.prototype;
	g.X=function(a,b,c,d,e){return new Af(null!=a?a:this.key,null!=b?b:this.value,null!=c?c:this.color,null!=d?d:this.left,null!=e?e:this.right)};g.count=function(){return this.left.count()+1+this.right.count()};g.e=function(){return!1};g.ha=function(a){return this.left.ha(a)||a(this.key,this.value)||this.right.ha(a)};function Bf(a){return a.left.e()?a:Bf(a.left)}g.Fc=function(){return Bf(this).key};g.ec=function(){return this.right.e()?this.key:this.right.ec()};
	g.Oa=function(a,b,c){var d,e;e=this;d=c(a,e.key);e=0>d?e.X(null,null,null,e.left.Oa(a,b,c),null):0===d?e.X(null,b,null,null,null):e.X(null,null,null,null,e.right.Oa(a,b,c));return Cf(e)};function Df(a){if(a.left.e())return wf;a.left.ea()||a.left.left.ea()||(a=Ef(a));a=a.X(null,null,null,Df(a.left),null);return Cf(a)}
	g.remove=function(a,b){var c,d;c=this;if(0>b(a,c.key))c.left.e()||c.left.ea()||c.left.left.ea()||(c=Ef(c)),c=c.X(null,null,null,c.left.remove(a,b),null);else{c.left.ea()&&(c=Ff(c));c.right.e()||c.right.ea()||c.right.left.ea()||(c=Gf(c),c.left.left.ea()&&(c=Ff(c),c=Gf(c)));if(0===b(a,c.key)){if(c.right.e())return wf;d=Bf(c.right);c=c.X(d.key,d.value,null,null,Df(c.right))}c=c.X(null,null,null,null,c.right.remove(a,b))}return Cf(c)};g.ea=function(){return this.color};
	function Cf(a){a.right.ea()&&!a.left.ea()&&(a=Hf(a));a.left.ea()&&a.left.left.ea()&&(a=Ff(a));a.left.ea()&&a.right.ea()&&(a=Gf(a));return a}function Ef(a){a=Gf(a);a.right.left.ea()&&(a=a.X(null,null,null,null,Ff(a.right)),a=Hf(a),a=Gf(a));return a}function Hf(a){return a.right.X(null,null,a.color,a.X(null,null,!0,null,a.right.left),null)}function Ff(a){return a.left.X(null,null,a.color,null,a.X(null,null,!0,a.left.right,null))}
	function Gf(a){return a.X(null,null,!a.color,a.left.X(null,null,!a.left.color,null,null),a.right.X(null,null,!a.right.color,null,null))}function If(){}g=If.prototype;g.X=function(){return this};g.Oa=function(a,b){return new Af(a,b,null)};g.remove=function(){return this};g.count=function(){return 0};g.e=function(){return!0};g.ha=function(){return!1};g.Fc=function(){return null};g.ec=function(){return null};g.ea=function(){return!1};var wf=new If;function P(a,b,c){this.k=a;(this.aa=b)&&Sd(this.aa);a.e()&&H(!this.aa||this.aa.e(),"An empty node cannot have a priority");this.yb=c;this.Db=null}g=P.prototype;g.J=function(){return!1};g.C=function(){return this.aa||G};g.fa=function(a){return this.k.e()?this:new P(this.k,a,this.yb)};g.Q=function(a){if(".priority"===a)return this.C();a=this.k.get(a);return null===a?G:a};g.P=function(a){var b=J(a);return null===b?this:this.Q(b).P(D(a))};g.Da=function(a){return null!==this.k.get(a)};
	g.T=function(a,b){H(b,"We should always be passing snapshot nodes");if(".priority"===a)return this.fa(b);var c=new K(a,b),d,e;b.e()?(d=this.k.remove(a),c=me(this.yb,c,this.k)):(d=this.k.Oa(a,b),c=ke(this.yb,c,this.k));e=d.e()?G:this.aa;return new P(d,e,c)};g.F=function(a,b){var c=J(a);if(null===c)return b;H(".priority"!==J(a)||1===Ad(a),".priority must be the last token in a path");var d=this.Q(c).F(D(a),b);return this.T(c,d)};g.e=function(){return this.k.e()};g.Eb=function(){return this.k.count()};
	var Jf=/^(0|[1-9]\d*)$/;g=P.prototype;g.H=function(a){if(this.e())return null;var b={},c=0,d=0,e=!0;this.O(N,function(f,h){b[f]=h.H(a);c++;e&&Jf.test(f)?d=Math.max(d,Number(f)):e=!1});if(!a&&e&&d<2*c){var f=[],h;for(h in b)f[h]=b[h];return f}a&&!this.C().e()&&(b[".priority"]=this.C().H());return b};g.hash=function(){if(null===this.Db){var a="";this.C().e()||(a+="priority:"+Ud(this.C().H())+":");this.O(N,function(b,c){var d=c.hash();""!==d&&(a+=":"+b+":"+d)});this.Db=""===a?"":uc(a)}return this.Db};
	g.Ve=function(a,b,c){return(c=Kf(this,c))?(a=xf(c,new K(a,b)))?a.name:null:xf(this.k,a)};function Qd(a,b){var c;c=(c=Kf(a,b))?(c=c.Fc())&&c.name:a.k.Fc();return c?new K(c,a.k.get(c)):null}function Rd(a,b){var c;c=(c=Kf(a,b))?(c=c.ec())&&c.name:a.k.ec();return c?new K(c,a.k.get(c)):null}g.O=function(a,b){var c=Kf(this,a);return c?c.ha(function(a){return b(a.name,a.R)}):this.k.ha(b)};g.Wb=function(a){return this.Xb(a.Gc(),a)};
	g.Xb=function(a,b){var c=Kf(this,b);if(c)return c.Xb(a,function(a){return a});for(var c=this.k.Xb(a.name,jc),d=zf(c);null!=d&&0>b.compare(d,a);)R(c),d=zf(c);return c};g.We=function(a){return this.Zb(a.Ec(),a)};g.Zb=function(a,b){var c=Kf(this,b);if(c)return c.Zb(a,function(a){return a});for(var c=this.k.Zb(a.name,jc),d=zf(c);null!=d&&0<b.compare(d,a);)R(c),d=zf(c);return c};g.rc=function(a){return this.e()?a.e()?0:-1:a.J()||a.e()?1:a===Zd?-1:0};
	g.nb=function(a){if(a===Fd||va(this.yb.cc,a.toString()))return this;var b=this.yb,c=this.k;H(a!==Fd,"KeyIndex always exists and isn't meant to be added to the IndexMap.");for(var d=[],e=!1,c=c.Wb(jc),f=R(c);f;)e=e||a.wc(f.R),d.push(f),f=R(c);d=e?le(d,Pd(a)):Wd;e=a.toString();c=za(b.cc);c[e]=a;a=za(b.md);a[e]=d;return new P(this.k,this.aa,new je(a,c))};g.xc=function(a){return a===Fd||va(this.yb.cc,a.toString())};
	g.Z=function(a){if(a===this)return!0;if(a.J())return!1;if(this.C().Z(a.C())&&this.k.count()===a.k.count()){var b=this.Wb(N);a=a.Wb(N);for(var c=R(b),d=R(a);c&&d;){if(c.name!==d.name||!c.R.Z(d.R))return!1;c=R(b);d=R(a)}return null===c&&null===d}return!1};function Kf(a,b){return b===Fd?null:a.yb.get(b.toString())}g.toString=function(){return B(this.H(!0))};function M(a,b){if(null===a)return G;var c=null;"object"===typeof a&&".priority"in a?c=a[".priority"]:"undefined"!==typeof b&&(c=b);H(null===c||"string"===typeof c||"number"===typeof c||"object"===typeof c&&".sv"in c,"Invalid priority type found: "+typeof c);"object"===typeof a&&".value"in a&&null!==a[".value"]&&(a=a[".value"]);if("object"!==typeof a||".sv"in a)return new qc(a,M(c));if(a instanceof Array){var d=G,e=a;r(e,function(a,b){if(cb(e,b)&&"."!==b.substring(0,1)){var c=M(a);if(c.J()||!c.e())d=
	d.T(b,c)}});return d.fa(M(c))}var f=[],h=!1,k=a;db(k,function(a){if("string"!==typeof a||"."!==a.substring(0,1)){var b=M(k[a]);b.e()||(h=h||!b.C().e(),f.push(new K(a,b)))}});if(0==f.length)return G;var l=le(f,gc,function(a){return a.name},ic);if(h){var m=le(f,Pd(N));return new P(l,M(c),new je({".priority":m},{".priority":N}))}return new P(l,M(c),ne)}var Lf=Math.log(2);
	function Mf(a){this.count=parseInt(Math.log(a+1)/Lf,10);this.Ne=this.count-1;this.Cf=a+1&parseInt(Array(this.count+1).join("1"),2)}function Nf(a){var b=!(a.Cf&1<<a.Ne);a.Ne--;return b}
	function le(a,b,c,d){function e(b,d){var f=d-b;if(0==f)return null;if(1==f){var m=a[b],u=c?c(m):m;return new Af(u,m.R,!1,null,null)}var m=parseInt(f/2,10)+b,f=e(b,m),z=e(m+1,d),m=a[m],u=c?c(m):m;return new Af(u,m.R,!1,f,z)}a.sort(b);var f=function(b){function d(b,h){var k=u-b,z=u;u-=b;var z=e(k+1,z),k=a[k],F=c?c(k):k,z=new Af(F,k.R,h,null,z);f?f.left=z:m=z;f=z}for(var f=null,m=null,u=a.length,z=0;z<b.count;++z){var F=Nf(b),id=Math.pow(2,b.count-(z+1));F?d(id,!1):(d(id,!1),d(id,!0))}return m}(new Mf(a.length));
	return null!==f?new vf(d||b,f):new vf(d||b)}function Ud(a){return"number"===typeof a?"number:"+Jc(a):"string:"+a}function Sd(a){if(a.J()){var b=a.H();H("string"===typeof b||"number"===typeof b||"object"===typeof b&&cb(b,".sv"),"Priority must be a string or number.")}else H(a===Zd||a.e(),"priority of unexpected type.");H(a===Zd||a.C().e(),"Priority nodes can't have a priority of their own.")}var G=new P(new vf(ic),null,ne);function Of(){P.call(this,new vf(ic),G,ne)}la(Of,P);g=Of.prototype;
	g.rc=function(a){return a===this?0:1};g.Z=function(a){return a===this};g.C=function(){return this};g.Q=function(){return G};g.e=function(){return!1};var Zd=new Of,Xd=new K("[MIN_NAME]",G),ce=new K("[MAX_NAME]",Zd);function W(a,b,c){this.A=a;this.V=b;this.g=c}W.prototype.H=function(){x("Firebase.DataSnapshot.val",0,0,arguments.length);return this.A.H()};W.prototype.val=W.prototype.H;W.prototype.Qe=function(){x("Firebase.DataSnapshot.exportVal",0,0,arguments.length);return this.A.H(!0)};W.prototype.exportVal=W.prototype.Qe;W.prototype.Lf=function(){x("Firebase.DataSnapshot.exists",0,0,arguments.length);return!this.A.e()};W.prototype.exists=W.prototype.Lf;
	W.prototype.n=function(a){x("Firebase.DataSnapshot.child",0,1,arguments.length);ga(a)&&(a=String(a));lf("Firebase.DataSnapshot.child",a);var b=new L(a),c=this.V.n(b);return new W(this.A.P(b),c,N)};W.prototype.child=W.prototype.n;W.prototype.Da=function(a){x("Firebase.DataSnapshot.hasChild",1,1,arguments.length);lf("Firebase.DataSnapshot.hasChild",a);var b=new L(a);return!this.A.P(b).e()};W.prototype.hasChild=W.prototype.Da;
	W.prototype.C=function(){x("Firebase.DataSnapshot.getPriority",0,0,arguments.length);return this.A.C().H()};W.prototype.getPriority=W.prototype.C;W.prototype.forEach=function(a){x("Firebase.DataSnapshot.forEach",1,1,arguments.length);A("Firebase.DataSnapshot.forEach",1,a,!1);if(this.A.J())return!1;var b=this;return!!this.A.O(this.g,function(c,d){return a(new W(d,b.V.n(c),N))})};W.prototype.forEach=W.prototype.forEach;
	W.prototype.hd=function(){x("Firebase.DataSnapshot.hasChildren",0,0,arguments.length);return this.A.J()?!1:!this.A.e()};W.prototype.hasChildren=W.prototype.hd;W.prototype.getKey=function(){x("Firebase.DataSnapshot.key",0,0,arguments.length);return this.V.getKey()};Lc(W.prototype,"key",W.prototype.getKey);W.prototype.Eb=function(){x("Firebase.DataSnapshot.numChildren",0,0,arguments.length);return this.A.Eb()};W.prototype.numChildren=W.prototype.Eb;
	W.prototype.wb=function(){x("Firebase.DataSnapshot.ref",0,0,arguments.length);return this.V};Lc(W.prototype,"ref",W.prototype.wb);function yd(a,b){this.N=a;this.Jd=b}function vd(a,b,c,d){return new yd(new $b(b,c,d),a.Jd)}function zd(a){return a.N.da?a.N.j():null}yd.prototype.w=function(){return this.Jd};function ac(a){return a.Jd.da?a.Jd.j():null};function Pf(a,b){this.V=a;var c=a.m,d=new Gd(c.g),c=S(c)?new Gd(c.g):c.xa?new Md(c):new Hd(c);this.hf=new pd(c);var e=b.w(),f=b.N,h=d.ya(G,e.j(),null),k=c.ya(G,f.j(),null);this.Ka=new yd(new $b(k,f.da,c.Na()),new $b(h,e.da,d.Na()));this.Za=[];this.Jf=new kd(a)}function Qf(a){return a.V}g=Pf.prototype;g.w=function(){return this.Ka.w().j()};g.hb=function(a){var b=ac(this.Ka);return b&&(S(this.V.m)||!a.e()&&!b.Q(J(a)).e())?b.P(a):null};g.e=function(){return 0===this.Za.length};g.Nb=function(a){this.Za.push(a)};
	g.kb=function(a,b){var c=[];if(b){H(null==a,"A cancel should cancel all event registrations.");var d=this.V.path;Ja(this.Za,function(a){(a=a.Le(b,d))&&c.push(a)})}if(a){for(var e=[],f=0;f<this.Za.length;++f){var h=this.Za[f];if(!h.matches(a))e.push(h);else if(a.Xe()){e=e.concat(this.Za.slice(f+1));break}}this.Za=e}else this.Za=[];return c};
	g.eb=function(a,b,c){a.type===Wc&&null!==a.source.Hb&&(H(ac(this.Ka),"We should always have a full cache before handling merges"),H(zd(this.Ka),"Missing event cache, even though we have a server cache"));var d=this.Ka;a=this.hf.eb(d,a,b,c);b=this.hf;c=a.Qd;H(c.N.j().xc(b.U.g),"Event snap not indexed");H(c.w().j().xc(b.U.g),"Server snap not indexed");H(dc(a.Qd.w())||!dc(d.w()),"Once a server snap is complete, it should never go back");this.Ka=a.Qd;return Rf(this,a.Df,a.Qd.N.j(),null)};
	function Sf(a,b){var c=a.Ka.N,d=[];c.j().J()||c.j().O(N,function(a,b){d.push(new I("child_added",b,a))});c.da&&d.push(bc(c.j()));return Rf(a,d,c.j(),b)}function Rf(a,b,c,d){return ld(a.Jf,b,c,d?[d]:a.Za)};function Tf(a,b,c){this.Pb=a;this.rb=b;this.tb=c||null}g=Tf.prototype;g.nf=function(a){return"value"===a};g.createEvent=function(a,b){var c=b.m.g;return new Ub("value",this,new W(a.Ja,b.wb(),c))};g.Tb=function(a){var b=this.tb;if("cancel"===a.de()){H(this.rb,"Raising a cancel event on a listener with no cancel callback");var c=this.rb;return function(){c.call(b,a.error)}}var d=this.Pb;return function(){d.call(b,a.Kd)}};g.Le=function(a,b){return this.rb?new Vb(this,a,b):null};
	g.matches=function(a){return a instanceof Tf?a.Pb&&this.Pb?a.Pb===this.Pb&&a.tb===this.tb:!0:!1};g.Xe=function(){return null!==this.Pb};function Uf(a,b,c){this.ga=a;this.rb=b;this.tb=c}g=Uf.prototype;g.nf=function(a){a="children_added"===a?"child_added":a;return("children_removed"===a?"child_removed":a)in this.ga};g.Le=function(a,b){return this.rb?new Vb(this,a,b):null};
	g.createEvent=function(a,b){H(null!=a.Xa,"Child events should have a childName.");var c=b.wb().n(a.Xa);return new Ub(a.type,this,new W(a.Ja,c,b.m.g),a.Bd)};g.Tb=function(a){var b=this.tb;if("cancel"===a.de()){H(this.rb,"Raising a cancel event on a listener with no cancel callback");var c=this.rb;return function(){c.call(b,a.error)}}var d=this.ga[a.fd];return function(){d.call(b,a.Kd,a.Bd)}};
	g.matches=function(a){if(a instanceof Uf){if(!this.ga||!a.ga)return!0;if(this.tb===a.tb){var b=ra(a.ga);if(b===ra(this.ga)){if(1===b){var b=sa(a.ga),c=sa(this.ga);return c===b&&(!a.ga[b]||!this.ga[c]||a.ga[b]===this.ga[c])}return qa(this.ga,function(b,c){return a.ga[c]===b})}}}return!1};g.Xe=function(){return null!==this.ga};function X(a,b,c,d){this.u=a;this.path=b;this.m=c;this.Mc=d}
	function Vf(a){var b=null,c=null;a.ka&&(b=Jd(a));a.na&&(c=Ld(a));if(a.g===Fd){if(a.ka){if("[MIN_NAME]"!=Id(a))throw Error("Query: When ordering by key, you may only pass one argument to startAt(), endAt(), or equalTo().");if("string"!==typeof b)throw Error("Query: When ordering by key, the argument passed to startAt(), endAt(),or equalTo() must be a string.");}if(a.na){if("[MAX_NAME]"!=Kd(a))throw Error("Query: When ordering by key, you may only pass one argument to startAt(), endAt(), or equalTo().");if("string"!==
	typeof c)throw Error("Query: When ordering by key, the argument passed to startAt(), endAt(),or equalTo() must be a string.");}}else if(a.g===N){if(null!=b&&!cf(b)||null!=c&&!cf(c))throw Error("Query: When ordering by priority, the first argument passed to startAt(), endAt(), or equalTo() must be a valid priority value (null, a number, or a string).");}else if(H(a.g instanceof Yd||a.g===de,"unknown index type."),null!=b&&"object"===typeof b||null!=c&&"object"===typeof c)throw Error("Query: First argument passed to startAt(), endAt(), or equalTo() cannot be an object.");
	}function Wf(a){if(a.ka&&a.na&&a.xa&&(!a.xa||""===a.mb))throw Error("Query: Can't combine startAt(), endAt(), and limit(). Use limitToFirst() or limitToLast() instead.");}function Xf(a,b){if(!0===a.Mc)throw Error(b+": You can't combine multiple orderBy calls.");}g=X.prototype;g.wb=function(){x("Query.ref",0,0,arguments.length);return new U(this.u,this.path)};
	g.gc=function(a,b,c,d){x("Query.on",2,4,arguments.length);jf("Query.on",a,!1);A("Query.on",2,b,!1);var e=Yf("Query.on",c,d);if("value"===a)Zf(this.u,this,new Tf(b,e.cancel||null,e.Ma||null));else{var f={};f[a]=b;Zf(this.u,this,new Uf(f,e.cancel,e.Ma))}return b};
	g.Hc=function(a,b,c){x("Query.off",0,3,arguments.length);jf("Query.off",a,!0);A("Query.off",2,b,!0);eb("Query.off",3,c);var d=null,e=null;"value"===a?d=new Tf(b||null,null,c||null):a&&(b&&(e={},e[a]=b),d=new Uf(e,null,c||null));e=this.u;d=".info"===J(this.path)?e.nd.kb(this,d):e.K.kb(this,d);Qb(e.ca,this.path,d)};
	g.$f=function(a,b){function c(k){f&&(f=!1,e.Hc(a,c),b&&b.call(d.Ma,k),h.resolve(k))}x("Query.once",1,4,arguments.length);jf("Query.once",a,!1);A("Query.once",2,b,!0);var d=Yf("Query.once",arguments[2],arguments[3]),e=this,f=!0,h=new hb;jb(h.ra);this.gc(a,c,function(b){e.Hc(a,c);d.cancel&&d.cancel.call(d.Ma,b);h.reject(b)});return h.ra};
	g.ke=function(a){x("Query.limitToFirst",1,1,arguments.length);if(!ga(a)||Math.floor(a)!==a||0>=a)throw Error("Query.limitToFirst: First argument must be a positive integer.");if(this.m.xa)throw Error("Query.limitToFirst: Limit was already set (by another call to limit, limitToFirst, or limitToLast).");return new X(this.u,this.path,this.m.ke(a),this.Mc)};
	g.le=function(a){x("Query.limitToLast",1,1,arguments.length);if(!ga(a)||Math.floor(a)!==a||0>=a)throw Error("Query.limitToLast: First argument must be a positive integer.");if(this.m.xa)throw Error("Query.limitToLast: Limit was already set (by another call to limit, limitToFirst, or limitToLast).");return new X(this.u,this.path,this.m.le(a),this.Mc)};
	g.ag=function(a){x("Query.orderByChild",1,1,arguments.length);if("$key"===a)throw Error('Query.orderByChild: "$key" is invalid.  Use Query.orderByKey() instead.');if("$priority"===a)throw Error('Query.orderByChild: "$priority" is invalid.  Use Query.orderByPriority() instead.');if("$value"===a)throw Error('Query.orderByChild: "$value" is invalid.  Use Query.orderByValue() instead.');lf("Query.orderByChild",a);Xf(this,"Query.orderByChild");var b=new L(a);if(b.e())throw Error("Query.orderByChild: cannot pass in empty path.  Use Query.orderByValue() instead.");
	b=new Yd(b);b=he(this.m,b);Vf(b);return new X(this.u,this.path,b,!0)};g.bg=function(){x("Query.orderByKey",0,0,arguments.length);Xf(this,"Query.orderByKey");var a=he(this.m,Fd);Vf(a);return new X(this.u,this.path,a,!0)};g.cg=function(){x("Query.orderByPriority",0,0,arguments.length);Xf(this,"Query.orderByPriority");var a=he(this.m,N);Vf(a);return new X(this.u,this.path,a,!0)};
	g.dg=function(){x("Query.orderByValue",0,0,arguments.length);Xf(this,"Query.orderByValue");var a=he(this.m,de);Vf(a);return new X(this.u,this.path,a,!0)};g.Ld=function(a,b){x("Query.startAt",0,2,arguments.length);df("Query.startAt",a,this.path,!0);kf("Query.startAt",b);var c=this.m.Ld(a,b);Wf(c);Vf(c);if(this.m.ka)throw Error("Query.startAt: Starting point was already set (by another call to startAt or equalTo).");n(a)||(b=a=null);return new X(this.u,this.path,c,this.Mc)};
	g.ed=function(a,b){x("Query.endAt",0,2,arguments.length);df("Query.endAt",a,this.path,!0);kf("Query.endAt",b);var c=this.m.ed(a,b);Wf(c);Vf(c);if(this.m.na)throw Error("Query.endAt: Ending point was already set (by another call to endAt or equalTo).");return new X(this.u,this.path,c,this.Mc)};
	g.If=function(a,b){x("Query.equalTo",1,2,arguments.length);df("Query.equalTo",a,this.path,!1);kf("Query.equalTo",b);if(this.m.ka)throw Error("Query.equalTo: Starting point was already set (by another call to endAt or equalTo).");if(this.m.na)throw Error("Query.equalTo: Ending point was already set (by another call to endAt or equalTo).");return this.Ld(a,b).ed(a,b)};
	g.toString=function(){x("Query.toString",0,0,arguments.length);for(var a=this.path,b="",c=a.Y;c<a.o.length;c++)""!==a.o[c]&&(b+="/"+encodeURIComponent(String(a.o[c])));return this.u.toString()+(b||"/")};g.ja=function(){var a=Gc(ie(this.m));return"{}"===a?"default":a};
	g.isEqual=function(a){x("Query.isEqual",1,1,arguments.length);if(!(a instanceof X))throw Error("Query.isEqual failed: First argument must be an instance of firebase.database.Query.");var b=this.u===a.u,c=this.path.Z(a.path),d=this.ja()===a.ja();return b&&c&&d};
	function Yf(a,b,c){var d={cancel:null,Ma:null};if(b&&c)d.cancel=b,A(a,3,d.cancel,!0),d.Ma=c,eb(a,4,d.Ma);else if(b)if("object"===typeof b&&null!==b)d.Ma=b;else if("function"===typeof b)d.cancel=b;else throw Error(y(a,3,!0)+" must either be a cancel callback or a context object.");return d}X.prototype.on=X.prototype.gc;X.prototype.off=X.prototype.Hc;X.prototype.once=X.prototype.$f;X.prototype.limitToFirst=X.prototype.ke;X.prototype.limitToLast=X.prototype.le;X.prototype.orderByChild=X.prototype.ag;
	X.prototype.orderByKey=X.prototype.bg;X.prototype.orderByPriority=X.prototype.cg;X.prototype.orderByValue=X.prototype.dg;X.prototype.startAt=X.prototype.Ld;X.prototype.endAt=X.prototype.ed;X.prototype.equalTo=X.prototype.If;X.prototype.toString=X.prototype.toString;X.prototype.isEqual=X.prototype.isEqual;Lc(X.prototype,"ref",X.prototype.wb);function $f(a,b){this.value=a;this.children=b||ag}var ag=new vf(function(a,b){return a===b?0:a<b?-1:1});function bg(a){var b=Q;r(a,function(a,d){b=b.set(new L(d),a)});return b}g=$f.prototype;g.e=function(){return null===this.value&&this.children.e()};function cg(a,b,c){if(null!=a.value&&c(a.value))return{path:C,value:a.value};if(b.e())return null;var d=J(b);a=a.children.get(d);return null!==a?(b=cg(a,D(b),c),null!=b?{path:(new L(d)).n(b.path),value:b.value}:null):null}
	function dg(a,b){return cg(a,b,function(){return!0})}g.subtree=function(a){if(a.e())return this;var b=this.children.get(J(a));return null!==b?b.subtree(D(a)):Q};g.set=function(a,b){if(a.e())return new $f(b,this.children);var c=J(a),d=(this.children.get(c)||Q).set(D(a),b),c=this.children.Oa(c,d);return new $f(this.value,c)};
	g.remove=function(a){if(a.e())return this.children.e()?Q:new $f(null,this.children);var b=J(a),c=this.children.get(b);return c?(a=c.remove(D(a)),b=a.e()?this.children.remove(b):this.children.Oa(b,a),null===this.value&&b.e()?Q:new $f(this.value,b)):this};g.get=function(a){if(a.e())return this.value;var b=this.children.get(J(a));return b?b.get(D(a)):null};
	function Ed(a,b,c){if(b.e())return c;var d=J(b);b=Ed(a.children.get(d)||Q,D(b),c);d=b.e()?a.children.remove(d):a.children.Oa(d,b);return new $f(a.value,d)}function eg(a,b){return fg(a,C,b)}function fg(a,b,c){var d={};a.children.ha(function(a,f){d[a]=fg(f,b.n(a),c)});return c(b,a.value,d)}function gg(a,b,c){return hg(a,b,C,c)}function hg(a,b,c,d){var e=a.value?d(c,a.value):!1;if(e)return e;if(b.e())return null;e=J(b);return(a=a.children.get(e))?hg(a,D(b),c.n(e),d):null}
	function ig(a,b,c){jg(a,b,C,c)}function jg(a,b,c,d){if(b.e())return a;a.value&&d(c,a.value);var e=J(b);return(a=a.children.get(e))?jg(a,D(b),c.n(e),d):Q}function Cd(a,b){kg(a,C,b)}function kg(a,b,c){a.children.ha(function(a,e){kg(e,b.n(a),c)});a.value&&c(b,a.value)}function lg(a,b){a.children.ha(function(a,d){d.value&&b(a,d.value)})}var Q=new $f(null);$f.prototype.toString=function(){var a={};Cd(this,function(b,c){a[b.toString()]=c.toString()});return B(a)};function mg(a,b,c){this.type=ud;this.source=ng;this.path=a;this.Ob=b;this.Gd=c}mg.prototype.Lc=function(a){if(this.path.e()){if(null!=this.Ob.value)return H(this.Ob.children.e(),"affectedTree should not have overlapping affected paths."),this;a=this.Ob.subtree(new L(a));return new mg(C,a,this.Gd)}H(J(this.path)===a,"operationForChild called for unrelated child.");return new mg(D(this.path),this.Ob,this.Gd)};
	mg.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" ack write revert="+this.Gd+" affectedTree="+this.Ob+")"};var Bb=0,Wc=1,ud=2,Db=3;function og(a,b,c,d){this.be=a;this.Se=b;this.Hb=c;this.Be=d;H(!d||b,"Tagged queries must be from server.")}var ng=new og(!0,!1,null,!1),pg=new og(!1,!0,null,!1);og.prototype.toString=function(){return this.be?"user":this.Be?"server(queryID="+this.Hb+")":"server"};function qg(a){this.W=a}var rg=new qg(new $f(null));function sg(a,b,c){if(b.e())return new qg(new $f(c));var d=dg(a.W,b);if(null!=d){var e=d.path,d=d.value;b=T(e,b);d=d.F(b,c);return new qg(a.W.set(e,d))}a=Ed(a.W,b,new $f(c));return new qg(a)}function tg(a,b,c){var d=a;db(c,function(a,c){d=sg(d,b.n(a),c)});return d}qg.prototype.Cd=function(a){if(a.e())return rg;a=Ed(this.W,a,Q);return new qg(a)};function ug(a,b){var c=dg(a.W,b);return null!=c?a.W.get(c.path).P(T(c.path,b)):null}
	function vg(a){var b=[],c=a.W.value;null!=c?c.J()||c.O(N,function(a,c){b.push(new K(a,c))}):a.W.children.ha(function(a,c){null!=c.value&&b.push(new K(a,c.value))});return b}function wg(a,b){if(b.e())return a;var c=ug(a,b);return null!=c?new qg(new $f(c)):new qg(a.W.subtree(b))}qg.prototype.e=function(){return this.W.e()};qg.prototype.apply=function(a){return xg(C,this.W,a)};
	function xg(a,b,c){if(null!=b.value)return c.F(a,b.value);var d=null;b.children.ha(function(b,f){".priority"===b?(H(null!==f.value,"Priority writes must always be leaf nodes"),d=f.value):c=xg(a.n(b),f,c)});c.P(a).e()||null===d||(c=c.F(a.n(".priority"),d));return c};function yg(){this.za={}}g=yg.prototype;g.e=function(){return ya(this.za)};g.eb=function(a,b,c){var d=a.source.Hb;if(null!==d)return d=w(this.za,d),H(null!=d,"SyncTree gave us an op for an invalid query."),d.eb(a,b,c);var e=[];r(this.za,function(d){e=e.concat(d.eb(a,b,c))});return e};g.Nb=function(a,b,c,d,e){var f=a.ja(),h=w(this.za,f);if(!h){var h=c.Aa(e?d:null),k=!1;h?k=!0:(h=d instanceof P?c.qc(d):G,k=!1);h=new Pf(a,new yd(new $b(h,k,!1),new $b(d,e,!1)));this.za[f]=h}h.Nb(b);return Sf(h,b)};
	g.kb=function(a,b,c){var d=a.ja(),e=[],f=[],h=null!=zg(this);if("default"===d){var k=this;r(this.za,function(a,d){f=f.concat(a.kb(b,c));a.e()&&(delete k.za[d],S(a.V.m)||e.push(a.V))})}else{var l=w(this.za,d);l&&(f=f.concat(l.kb(b,c)),l.e()&&(delete this.za[d],S(l.V.m)||e.push(l.V)))}h&&null==zg(this)&&e.push(new U(a.u,a.path));return{hg:e,Kf:f}};function Ag(a){return Ka(ta(a.za),function(a){return!S(a.V.m)})}g.hb=function(a){var b=null;r(this.za,function(c){b=b||c.hb(a)});return b};
	function Bg(a,b){if(S(b.m))return zg(a);var c=b.ja();return w(a.za,c)}function zg(a){return xa(a.za,function(a){return S(a.V.m)})||null};function Cg(){this.S=rg;this.la=[];this.Ac=-1}function Dg(a,b){for(var c=0;c<a.la.length;c++){var d=a.la[c];if(d.Yc===b)return d}return null}g=Cg.prototype;
	g.Cd=function(a){var b=Pa(this.la,function(b){return b.Yc===a});H(0<=b,"removeWrite called with nonexistent writeId.");var c=this.la[b];this.la.splice(b,1);for(var d=c.visible,e=!1,f=this.la.length-1;d&&0<=f;){var h=this.la[f];h.visible&&(f>=b&&Eg(h,c.path)?d=!1:c.path.contains(h.path)&&(e=!0));f--}if(d){if(e)this.S=Fg(this.la,Gg,C),this.Ac=0<this.la.length?this.la[this.la.length-1].Yc:-1;else if(c.Ga)this.S=this.S.Cd(c.path);else{var k=this;r(c.children,function(a,b){k.S=k.S.Cd(c.path.n(b))})}return!0}return!1};
	g.Aa=function(a,b,c,d){if(c||d){var e=wg(this.S,a);return!d&&e.e()?b:d||null!=b||null!=ug(e,C)?(e=Fg(this.la,function(b){return(b.visible||d)&&(!c||!(0<=Ia(c,b.Yc)))&&(b.path.contains(a)||a.contains(b.path))},a),b=b||G,e.apply(b)):null}e=ug(this.S,a);if(null!=e)return e;e=wg(this.S,a);return e.e()?b:null!=b||null!=ug(e,C)?(b=b||G,e.apply(b)):null};
	g.qc=function(a,b){var c=G,d=ug(this.S,a);if(d)d.J()||d.O(N,function(a,b){c=c.T(a,b)});else if(b){var e=wg(this.S,a);b.O(N,function(a,b){var d=wg(e,new L(a)).apply(b);c=c.T(a,d)});Ja(vg(e),function(a){c=c.T(a.name,a.R)})}else e=wg(this.S,a),Ja(vg(e),function(a){c=c.T(a.name,a.R)});return c};g.Zc=function(a,b,c,d){H(c||d,"Either existingEventSnap or existingServerSnap must exist");a=a.n(b);if(null!=ug(this.S,a))return null;a=wg(this.S,a);return a.e()?d.P(b):a.apply(d.P(b))};
	g.pc=function(a,b,c){a=a.n(b);var d=ug(this.S,a);return null!=d?d:Zb(c,b)?wg(this.S,a).apply(c.j().Q(b)):null};g.lc=function(a){return ug(this.S,a)};g.Vd=function(a,b,c,d,e,f){var h;a=wg(this.S,a);h=ug(a,C);if(null==h)if(null!=b)h=a.apply(b);else return[];h=h.nb(f);if(h.e()||h.J())return[];b=[];a=Pd(f);e=e?h.Zb(c,f):h.Xb(c,f);for(f=R(e);f&&b.length<d;)0!==a(f,c)&&b.push(f),f=R(e);return b};
	function Eg(a,b){return a.Ga?a.path.contains(b):!!wa(a.children,function(c,d){return a.path.n(d).contains(b)})}function Gg(a){return a.visible}
	function Fg(a,b,c){for(var d=rg,e=0;e<a.length;++e){var f=a[e];if(b(f)){var h=f.path;if(f.Ga)c.contains(h)?(h=T(c,h),d=sg(d,h,f.Ga)):h.contains(c)&&(h=T(h,c),d=sg(d,C,f.Ga.P(h)));else if(f.children)if(c.contains(h))h=T(c,h),d=tg(d,h,f.children);else{if(h.contains(c))if(h=T(h,c),h.e())d=tg(d,C,f.children);else if(f=w(f.children,J(h)))f=f.P(D(h)),d=sg(d,C,f)}else throw sc("WriteRecord should have .snap or .children");}}return d}function Hg(a,b){this.Lb=a;this.W=b}g=Hg.prototype;
	g.Aa=function(a,b,c){return this.W.Aa(this.Lb,a,b,c)};g.qc=function(a){return this.W.qc(this.Lb,a)};g.Zc=function(a,b,c){return this.W.Zc(this.Lb,a,b,c)};g.lc=function(a){return this.W.lc(this.Lb.n(a))};g.Vd=function(a,b,c,d,e){return this.W.Vd(this.Lb,a,b,c,d,e)};g.pc=function(a,b){return this.W.pc(this.Lb,a,b)};g.n=function(a){return new Hg(this.Lb.n(a),this.W)};function Ig(){this.children={};this.$c=0;this.value=null}function Jg(a,b,c){this.sd=a?a:"";this.Oc=b?b:null;this.A=c?c:new Ig}function Kg(a,b){for(var c=b instanceof L?b:new L(b),d=a,e;null!==(e=J(c));)d=new Jg(e,d,w(d.A.children,e)||new Ig),c=D(c);return d}g=Jg.prototype;g.Ca=function(){return this.A.value};function Lg(a,b){H("undefined"!==typeof b,"Cannot set value to undefined");a.A.value=b;Mg(a)}g.clear=function(){this.A.value=null;this.A.children={};this.A.$c=0;Mg(this)};
	g.hd=function(){return 0<this.A.$c};g.e=function(){return null===this.Ca()&&!this.hd()};g.O=function(a){var b=this;r(this.A.children,function(c,d){a(new Jg(d,b,c))})};function Ng(a,b,c,d){c&&!d&&b(a);a.O(function(a){Ng(a,b,!0,d)});c&&d&&b(a)}function Og(a,b){for(var c=a.parent();null!==c&&!b(c);)c=c.parent()}g.path=function(){return new L(null===this.Oc?this.sd:this.Oc.path()+"/"+this.sd)};g.name=function(){return this.sd};g.parent=function(){return this.Oc};
	function Mg(a){if(null!==a.Oc){var b=a.Oc,c=a.sd,d=a.e(),e=cb(b.A.children,c);d&&e?(delete b.A.children[c],b.A.$c--,Mg(b)):d||e||(b.A.children[c]=a.A,b.A.$c++,Mg(b))}};function Pg(a,b,c,d,e,f){this.id=Qg++;this.f=yc("p:"+this.id+":");this.od={};this.$={};this.pa=[];this.Nc=0;this.Jc=[];this.ma=!1;this.Sa=1E3;this.rd=3E5;this.Gb=b;this.Ic=c;this.re=d;this.L=a;this.ob=this.Fa=this.Cb=this.we=null;this.Td=e;this.ae=!1;this.he=0;if(f)throw Error("Auth override specified in options, but not supported on non Node.js platforms");this.Ge=f||null;this.ub=null;this.Mb=!1;this.Ed={};this.ig=0;this.Re=!0;this.zc=this.je=null;Rg(this,0);tf.Vb().gc("visible",this.Zf,this);-1===
	a.host.indexOf("fblocal")&&sf.Vb().gc("online",this.Yf,this)}var Qg=0,Sg=0;g=Pg.prototype;g.ua=function(a,b,c){var d=++this.ig;a={r:d,a:a,b:b};this.f(B(a));H(this.ma,"sendRequest call when we're not connected not allowed.");this.Fa.ua(a);c&&(this.Ed[d]=c)};
	g.$e=function(a,b,c,d){var e=a.ja(),f=a.path.toString();this.f("Listen called for "+f+" "+e);this.$[f]=this.$[f]||{};H(Sc(a.m)||!S(a.m),"listen() called for non-default but complete query");H(!this.$[f][e],"listen() called twice for same path/queryId.");a={G:d,jd:b,eg:a,tag:c};this.$[f][e]=a;this.ma&&Tg(this,a)};
	function Tg(a,b){var c=b.eg,d=c.path.toString(),e=c.ja();a.f("Listen on "+d+" for "+e);var f={p:d};b.tag&&(f.q=ie(c.m),f.t=b.tag);f.h=b.jd();a.ua("q",f,function(f){var k=f.d,l=f.s;if(k&&"object"===typeof k&&cb(k,"w")){var m=w(k,"w");ea(m)&&0<=Ia(m,"no_index")&&O("Using an unspecified index. Consider adding "+('".indexOn": "'+c.m.g.toString()+'"')+" at "+c.path.toString()+" to your security rules for better performance")}(a.$[d]&&a.$[d][e])===b&&(a.f("listen response",f),"ok"!==l&&Ug(a,d,e),b.G&&b.G(l,
	k))})}g.kf=function(a){this.ob=a;this.f("Auth token refreshed");this.ob?Vg(this):this.ma&&this.ua("unauth",{},function(){});if(a&&40===a.length||Pc(a))this.f("Admin auth credential detected.  Reducing max reconnect time."),this.rd=3E4};function Vg(a){if(a.ma&&a.ob){var b=a.ob,c=Oc(b)?"auth":"gauth",d={cred:b};a.Ge&&(d.authvar=a.Ge);a.ua(c,d,function(c){var d=c.s;c=c.d||"error";a.ob===b&&("ok"===d?a.he=0:Wg(a,d,c))})}}
	g.uf=function(a,b){var c=a.path.toString(),d=a.ja();this.f("Unlisten called for "+c+" "+d);H(Sc(a.m)||!S(a.m),"unlisten() called for non-default but complete query");if(Ug(this,c,d)&&this.ma){var e=ie(a.m);this.f("Unlisten on "+c+" for "+d);c={p:c};b&&(c.q=e,c.t=b);this.ua("n",c)}};g.oe=function(a,b,c){this.ma?Xg(this,"o",a,b,c):this.Jc.push({te:a,action:"o",data:b,G:c})};g.cf=function(a,b,c){this.ma?Xg(this,"om",a,b,c):this.Jc.push({te:a,action:"om",data:b,G:c})};
	g.vd=function(a,b){this.ma?Xg(this,"oc",a,null,b):this.Jc.push({te:a,action:"oc",data:null,G:b})};function Xg(a,b,c,d,e){c={p:c,d:d};a.f("onDisconnect "+b,c);a.ua(b,c,function(a){e&&setTimeout(function(){e(a.s,a.d)},Math.floor(0))})}g.put=function(a,b,c,d){Yg(this,"p",a,b,c,d)};g.af=function(a,b,c,d){Yg(this,"m",a,b,c,d)};function Yg(a,b,c,d,e,f){d={p:c,d:d};n(f)&&(d.h=f);a.pa.push({action:b,mf:d,G:e});a.Nc++;b=a.pa.length-1;a.ma?Zg(a,b):a.f("Buffering put: "+c)}
	function Zg(a,b){var c=a.pa[b].action,d=a.pa[b].mf,e=a.pa[b].G;a.pa[b].fg=a.ma;a.ua(c,d,function(d){a.f(c+" response",d);delete a.pa[b];a.Nc--;0===a.Nc&&(a.pa=[]);e&&e(d.s,d.d)})}g.ve=function(a){this.ma&&(a={c:a},this.f("reportStats",a),this.ua("s",a,function(a){"ok"!==a.s&&this.f("reportStats","Error sending stats: "+a.d)}))};
	g.ud=function(a){if("r"in a){this.f("from server: "+B(a));var b=a.r,c=this.Ed[b];c&&(delete this.Ed[b],c(a.b))}else{if("error"in a)throw"A server-side error has occurred: "+a.error;"a"in a&&(b=a.a,a=a.b,this.f("handleServerMessage",b,a),"d"===b?this.Gb(a.p,a.d,!1,a.t):"m"===b?this.Gb(a.p,a.d,!0,a.t):"c"===b?$g(this,a.p,a.q):"ac"===b?Wg(this,a.s,a.d):"sd"===b?this.we?this.we(a):"msg"in a&&"undefined"!==typeof console&&console.log("FIREBASE: "+a.msg.replace("\n","\nFIREBASE: ")):zc("Unrecognized action received from server: "+
	B(b)+"\nAre you using the latest client?"))}};g.Kc=function(a,b){this.f("connection ready");this.ma=!0;this.zc=(new Date).getTime();this.re({serverTimeOffset:a-(new Date).getTime()});this.Cb=b;if(this.Re){var c={};c["sdk.js."+firebase.SDK_VERSION.replace(/\./g,"-")]=1;qb()?c["framework.cordova"]=1:"object"===typeof navigator&&"ReactNative"===navigator.product&&(c["framework.reactnative"]=1);this.ve(c)}ah(this);this.Re=!1;this.Ic(!0)};
	function Rg(a,b){H(!a.Fa,"Scheduling a connect when we're already connected/ing?");a.ub&&clearTimeout(a.ub);a.ub=setTimeout(function(){a.ub=null;bh(a)},Math.floor(b))}g.Zf=function(a){a&&!this.Mb&&this.Sa===this.rd&&(this.f("Window became visible.  Reducing delay."),this.Sa=1E3,this.Fa||Rg(this,0));this.Mb=a};g.Yf=function(a){a?(this.f("Browser went online."),this.Sa=1E3,this.Fa||Rg(this,0)):(this.f("Browser went offline.  Killing connection."),this.Fa&&this.Fa.close())};
	g.df=function(){this.f("data client disconnected");this.ma=!1;this.Fa=null;for(var a=0;a<this.pa.length;a++){var b=this.pa[a];b&&"h"in b.mf&&b.fg&&(b.G&&b.G("disconnect"),delete this.pa[a],this.Nc--)}0===this.Nc&&(this.pa=[]);this.Ed={};ch(this)&&(this.Mb?this.zc&&(3E4<(new Date).getTime()-this.zc&&(this.Sa=1E3),this.zc=null):(this.f("Window isn't visible.  Delaying reconnect."),this.Sa=this.rd,this.je=(new Date).getTime()),a=Math.max(0,this.Sa-((new Date).getTime()-this.je)),a*=Math.random(),this.f("Trying to reconnect in "+
	a+"ms"),Rg(this,a),this.Sa=Math.min(this.rd,1.3*this.Sa));this.Ic(!1)};
	function bh(a){if(ch(a)){a.f("Making a connection attempt");a.je=(new Date).getTime();a.zc=null;var b=q(a.ud,a),c=q(a.Kc,a),d=q(a.df,a),e=a.id+":"+Sg++,f=a.Cb,h=!1,k=null,l=function(){k?k.close():(h=!0,d())};a.Fa={close:l,ua:function(a){H(k,"sendRequest call when we're not connected not allowed.");k.ua(a)}};var m=a.ae;a.ae=!1;a.Td.getToken(m).then(function(l){h?E("getToken() completed but was canceled"):(E("getToken() completed. Creating connection."),a.ob=l&&l.accessToken,k=new Ce(e,a.L,b,c,d,function(b){O(b+
	" ("+a.L.toString()+")");a.ab("server_kill")},f))}).then(null,function(b){a.f("Failed to get token: "+b);h||l()})}}g.ab=function(a){E("Interrupting connection for reason: "+a);this.od[a]=!0;this.Fa?this.Fa.close():(this.ub&&(clearTimeout(this.ub),this.ub=null),this.ma&&this.df())};g.kc=function(a){E("Resuming connection for reason: "+a);delete this.od[a];ya(this.od)&&(this.Sa=1E3,this.Fa||Rg(this,0))};
	function $g(a,b,c){c=c?La(c,function(a){return Gc(a)}).join("$"):"default";(a=Ug(a,b,c))&&a.G&&a.G("permission_denied")}function Ug(a,b,c){b=(new L(b)).toString();var d;n(a.$[b])?(d=a.$[b][c],delete a.$[b][c],0===ra(a.$[b])&&delete a.$[b]):d=void 0;return d}
	function Wg(a,b,c){E("Auth token revoked: "+b+"/"+c);a.ob=null;a.ae=!0;a.Fa.close();"invalid_token"===b&&(a.he++,3<=a.he&&(a.Sa=3E4,O("Provided authentication credentials are invalid. This usually indicates your FirebaseApp instance was not initialized correctly. Make sure your apiKey and databaseURL match the values provided for your app at https://console.firebase.google.com/, or if you're using a service account, make sure it's authorized to access the specified databaseURL and is from the correct project.")))}
	function ah(a){Vg(a);r(a.$,function(b){r(b,function(b){Tg(a,b)})});for(var b=0;b<a.pa.length;b++)a.pa[b]&&Zg(a,b);for(;a.Jc.length;)b=a.Jc.shift(),Xg(a,b.action,b.te,b.data,b.G)}function ch(a){var b;b=sf.Vb().hc;return ya(a.od)&&b};var Y={Mf:function(){re=dd=!0}};Y.forceLongPolling=Y.Mf;Y.Nf=function(){se=!0};Y.forceWebSockets=Y.Nf;Y.Tf=function(){return cd.isAvailable()};Y.isWebSocketsAvailable=Y.Tf;Y.lg=function(a,b){a.u.Ra.we=b};Y.setSecurityDebugCallback=Y.lg;Y.ye=function(a,b){a.u.ye(b)};Y.stats=Y.ye;Y.ze=function(a,b){a.u.ze(b)};Y.statsIncrementCounter=Y.ze;Y.dd=function(a){return a.u.dd};Y.dataUpdateCount=Y.dd;Y.Sf=function(a,b){a.u.ge=b};Y.interceptServerData=Y.Sf;function dh(a){this.wa=Q;this.jb=new Cg;this.Ae={};this.ic={};this.Bc=a}function eh(a,b,c,d,e){var f=a.jb,h=e;H(d>f.Ac,"Stacking an older write on top of newer ones");n(h)||(h=!0);f.la.push({path:b,Ga:c,Yc:d,visible:h});h&&(f.S=sg(f.S,b,c));f.Ac=d;return e?fh(a,new Ab(ng,b,c)):[]}function gh(a,b,c,d){var e=a.jb;H(d>e.Ac,"Stacking an older merge on top of newer ones");e.la.push({path:b,children:c,Yc:d,visible:!0});e.S=tg(e.S,b,c);e.Ac=d;c=bg(c);return fh(a,new Vc(ng,b,c))}
	function hh(a,b,c){c=c||!1;var d=Dg(a.jb,b);if(a.jb.Cd(b)){var e=Q;null!=d.Ga?e=e.set(C,!0):db(d.children,function(a,b){e=e.set(new L(a),b)});return fh(a,new mg(d.path,e,c))}return[]}function ih(a,b,c){c=bg(c);return fh(a,new Vc(pg,b,c))}function jh(a,b,c,d){d=kh(a,d);if(null!=d){var e=lh(d);d=e.path;e=e.Hb;b=T(d,b);c=new Ab(new og(!1,!0,e,!0),b,c);return mh(a,d,c)}return[]}
	function nh(a,b,c,d){if(d=kh(a,d)){var e=lh(d);d=e.path;e=e.Hb;b=T(d,b);c=bg(c);c=new Vc(new og(!1,!0,e,!0),b,c);return mh(a,d,c)}return[]}
	dh.prototype.Nb=function(a,b){var c=a.path,d=null,e=!1;ig(this.wa,c,function(a,b){var f=T(a,c);d=d||b.hb(f);e=e||null!=zg(b)});var f=this.wa.get(c);f?(e=e||null!=zg(f),d=d||f.hb(C)):(f=new yg,this.wa=this.wa.set(c,f));var h;null!=d?h=!0:(h=!1,d=G,lg(this.wa.subtree(c),function(a,b){var c=b.hb(C);c&&(d=d.T(a,c))}));var k=null!=Bg(f,a);if(!k&&!S(a.m)){var l=oh(a);H(!(l in this.ic),"View does not exist, but we have a tag");var m=ph++;this.ic[l]=m;this.Ae["_"+m]=l}h=f.Nb(a,b,new Hg(c,this.jb),d,h);k||
	e||(f=Bg(f,a),h=h.concat(qh(this,a,f)));return h};
	dh.prototype.kb=function(a,b,c){var d=a.path,e=this.wa.get(d),f=[];if(e&&("default"===a.ja()||null!=Bg(e,a))){f=e.kb(a,b,c);e.e()&&(this.wa=this.wa.remove(d));e=f.hg;f=f.Kf;b=-1!==Pa(e,function(a){return S(a.m)});var h=gg(this.wa,d,function(a,b){return null!=zg(b)});if(b&&!h&&(d=this.wa.subtree(d),!d.e()))for(var d=rh(d),k=0;k<d.length;++k){var l=d[k],m=l.V,l=sh(this,l);this.Bc.xe(th(m),uh(this,m),l.jd,l.G)}if(!h&&0<e.length&&!c)if(b)this.Bc.Md(th(a),null);else{var u=this;Ja(e,function(a){a.ja();
	var b=u.ic[oh(a)];u.Bc.Md(th(a),b)})}vh(this,e)}return f};dh.prototype.Aa=function(a,b){var c=this.jb,d=gg(this.wa,a,function(b,c){var d=T(b,a);if(d=c.hb(d))return d});return c.Aa(a,d,b,!0)};function rh(a){return eg(a,function(a,c,d){if(c&&null!=zg(c))return[zg(c)];var e=[];c&&(e=Ag(c));r(d,function(a){e=e.concat(a)});return e})}function vh(a,b){for(var c=0;c<b.length;++c){var d=b[c];if(!S(d.m)){var d=oh(d),e=a.ic[d];delete a.ic[d];delete a.Ae["_"+e]}}}
	function th(a){return S(a.m)&&!Sc(a.m)?a.wb():a}function qh(a,b,c){var d=b.path,e=uh(a,b);c=sh(a,c);b=a.Bc.xe(th(b),e,c.jd,c.G);d=a.wa.subtree(d);if(e)H(null==zg(d.value),"If we're adding a query, it shouldn't be shadowed");else for(e=eg(d,function(a,b,c){if(!a.e()&&b&&null!=zg(b))return[Qf(zg(b))];var d=[];b&&(d=d.concat(La(Ag(b),function(a){return a.V})));r(c,function(a){d=d.concat(a)});return d}),d=0;d<e.length;++d)c=e[d],a.Bc.Md(th(c),uh(a,c));return b}
	function sh(a,b){var c=b.V,d=uh(a,c);return{jd:function(){return(b.w()||G).hash()},G:function(b){if("ok"===b){if(d){var f=c.path;if(b=kh(a,d)){var h=lh(b);b=h.path;h=h.Hb;f=T(b,f);f=new Cb(new og(!1,!0,h,!0),f);b=mh(a,b,f)}else b=[]}else b=fh(a,new Cb(pg,c.path));return b}f="Unknown Error";"too_big"===b?f="The data requested exceeds the maximum size that can be accessed with a single request.":"permission_denied"==b?f="Client doesn't have permission to access the desired data.":"unavailable"==b&&
	(f="The service is unavailable");f=Error(b+" at "+c.path.toString()+": "+f);f.code=b.toUpperCase();return a.kb(c,null,f)}}}function oh(a){return a.path.toString()+"$"+a.ja()}function lh(a){var b=a.indexOf("$");H(-1!==b&&b<a.length-1,"Bad queryKey.");return{Hb:a.substr(b+1),path:new L(a.substr(0,b))}}function kh(a,b){var c=a.Ae,d="_"+b;return d in c?c[d]:void 0}function uh(a,b){var c=oh(b);return w(a.ic,c)}var ph=1;
	function mh(a,b,c){var d=a.wa.get(b);H(d,"Missing sync point for query tag that we're tracking");return d.eb(c,new Hg(b,a.jb),null)}function fh(a,b){return wh(a,b,a.wa,null,new Hg(C,a.jb))}function wh(a,b,c,d,e){if(b.path.e())return xh(a,b,c,d,e);var f=c.get(C);null==d&&null!=f&&(d=f.hb(C));var h=[],k=J(b.path),l=b.Lc(k);if((c=c.children.get(k))&&l)var m=d?d.Q(k):null,k=e.n(k),h=h.concat(wh(a,l,c,m,k));f&&(h=h.concat(f.eb(b,e,d)));return h}
	function xh(a,b,c,d,e){var f=c.get(C);null==d&&null!=f&&(d=f.hb(C));var h=[];c.children.ha(function(c,f){var m=d?d.Q(c):null,u=e.n(c),z=b.Lc(c);z&&(h=h.concat(xh(a,z,f,m,u)))});f&&(h=h.concat(f.eb(b,e,d)));return h};function Te(a,b,c){this.app=c;var d=new Eb(c);this.L=a;this.Va=$c(a);this.Uc=null;this.ca=new Nb;this.td=1;this.Ra=null;if(b||0<=("object"===typeof window&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i))this.va=new Qc(this.L,q(this.Gb,this),d),setTimeout(q(this.Ic,this,!0),0);else{b=c.options.databaseAuthVariableOverride||null;if(null!==b){if("object"!==da(b))throw Error("Only objects are supported for option databaseAuthVariableOverride");
	try{B(b)}catch(e){throw Error("Invalid authOverride provided: "+e);}}this.va=this.Ra=new Pg(this.L,q(this.Gb,this),q(this.Ic,this),q(this.re,this),d,b)}var f=this;Fb(d,function(a){f.va.kf(a)});this.og=ad(a,q(function(){return new Xc(this.Va,this.va)},this));this.mc=new Jg;this.fe=new Gb;this.nd=new dh({xe:function(a,b,c,d){b=[];c=f.fe.j(a.path);c.e()||(b=fh(f.nd,new Ab(pg,a.path,c)),setTimeout(function(){d("ok")},0));return b},Md:ba});yh(this,"connected",!1);this.ia=new mc;this.Ya=new Se(this);this.dd=
	0;this.ge=null;this.K=new dh({xe:function(a,b,c,d){f.va.$e(a,c,b,function(b,c){var e=d(b,c);Sb(f.ca,a.path,e)});return[]},Md:function(a,b){f.va.uf(a,b)}})}g=Te.prototype;g.toString=function(){return(this.L.Rc?"https://":"http://")+this.L.host};g.name=function(){return this.L.me};function zh(a){a=a.fe.j(new L(".info/serverTimeOffset")).H()||0;return(new Date).getTime()+a}function Ah(a){a=a={timestamp:zh(a)};a.timestamp=a.timestamp||(new Date).getTime();return a}
	g.Gb=function(a,b,c,d){this.dd++;var e=new L(a);b=this.ge?this.ge(a,b):b;a=[];d?c?(b=pa(b,function(a){return M(a)}),a=nh(this.K,e,b,d)):(b=M(b),a=jh(this.K,e,b,d)):c?(d=pa(b,function(a){return M(a)}),a=ih(this.K,e,d)):(d=M(b),a=fh(this.K,new Ab(pg,e,d)));d=e;0<a.length&&(d=Bh(this,e));Sb(this.ca,d,a)};g.Ic=function(a){yh(this,"connected",a);!1===a&&Ch(this)};g.re=function(a){var b=this;Ic(a,function(a,d){yh(b,d,a)})};
	function yh(a,b,c){b=new L("/.info/"+b);c=M(c);var d=a.fe;d.Hd=d.Hd.F(b,c);c=fh(a.nd,new Ab(pg,b,c));Sb(a.ca,b,c)}g.Jb=function(a,b,c,d){this.f("set",{path:a.toString(),value:b,ug:c});var e=Ah(this);b=M(b,c);var e=pc(b,e),f=this.td++,e=eh(this.K,a,e,f,!0);Ob(this.ca,e);var h=this;this.va.put(a.toString(),b.H(!0),function(b,c){var e="ok"===b;e||O("set at "+a+" failed: "+b);e=hh(h.K,f,!e);Sb(h.ca,a,e);Dh(d,b,c)});e=Eh(this,a);Bh(this,e);Sb(this.ca,e,[])};
	g.update=function(a,b,c){this.f("update",{path:a.toString(),value:b});var d=!0,e=Ah(this),f={};r(b,function(a,b){d=!1;var c=M(a);f[b]=pc(c,e)});if(d)E("update() called with empty data.  Don't do anything."),Dh(c,"ok");else{var h=this.td++,k=gh(this.K,a,f,h);Ob(this.ca,k);var l=this;this.va.af(a.toString(),b,function(b,d){var e="ok"===b;e||O("update at "+a+" failed: "+b);var e=hh(l.K,h,!e),f=a;0<e.length&&(f=Bh(l,a));Sb(l.ca,f,e);Dh(c,b,d)});r(b,function(b,c){var d=Eh(l,a.n(c));Bh(l,d)});Sb(this.ca,
	a,[])}};function Ch(a){a.f("onDisconnectEvents");var b=Ah(a),c=[];nc(lc(a.ia,b),C,function(b,e){c=c.concat(fh(a.K,new Ab(pg,b,e)));var f=Eh(a,b);Bh(a,f)});a.ia=new mc;Sb(a.ca,C,c)}g.vd=function(a,b){var c=this;this.va.vd(a.toString(),function(d,e){"ok"===d&&Ze(c.ia,a);Dh(b,d,e)})};function nf(a,b,c,d){var e=M(c);a.va.oe(b.toString(),e.H(!0),function(c,h){"ok"===c&&oc(a.ia,b,e);Dh(d,c,h)})}
	function of(a,b,c,d,e){var f=M(c,d);a.va.oe(b.toString(),f.H(!0),function(c,d){"ok"===c&&oc(a.ia,b,f);Dh(e,c,d)})}function pf(a,b,c,d){var e=!0,f;for(f in c)e=!1;e?(E("onDisconnect().update() called with empty data.  Don't do anything."),Dh(d,"ok")):a.va.cf(b.toString(),c,function(e,f){if("ok"===e)for(var l in c){var m=M(c[l]);oc(a.ia,b.n(l),m)}Dh(d,e,f)})}function Zf(a,b,c){c=".info"===J(b.path)?a.nd.Nb(b,c):a.K.Nb(b,c);Qb(a.ca,b.path,c)}g.ab=function(){this.Ra&&this.Ra.ab("repo_interrupt")};
	g.kc=function(){this.Ra&&this.Ra.kc("repo_interrupt")};g.ye=function(a){if("undefined"!==typeof console){a?(this.Uc||(this.Uc=new Mb(this.Va)),a=this.Uc.get()):a=this.Va.get();var b=Ma(ua(a),function(a,b){return Math.max(b.length,a)},0),c;for(c in a){for(var d=a[c],e=c.length;e<b+2;e++)c+=" ";console.log(c+d)}}};g.ze=function(a){Lb(this.Va,a);this.og.rf[a]=!0};g.f=function(a){var b="";this.Ra&&(b=this.Ra.id+":");E(b,arguments)};
	function Dh(a,b,c){a&&ub(function(){if("ok"==b)a(null);else{var d=(b||"error").toUpperCase(),e=d;c&&(e+=": "+c);e=Error(e);e.code=d;a(e)}})};function Fh(a,b,c,d,e){function f(){}a.f("transaction on "+b);var h=new U(a,b);h.gc("value",f);c={path:b,update:c,G:d,status:null,ef:rc(),Fe:e,of:0,Pd:function(){h.Hc("value",f)},Rd:null,Ba:null,ad:null,bd:null,cd:null};d=a.K.Aa(b,void 0)||G;c.ad=d;d=c.update(d.H());if(n(d)){ef("transaction failed: Data returned ",d,c.path);c.status=1;e=Kg(a.mc,b);var k=e.Ca()||[];k.push(c);Lg(e,k);"object"===typeof d&&null!==d&&cb(d,".priority")?(k=w(d,".priority"),H(cf(k),"Invalid priority returned by transaction. Priority must be a valid string, finite number, server value, or null.")):
	k=(a.K.Aa(b)||G).C().H();e=Ah(a);d=M(d,k);e=pc(d,e);c.bd=d;c.cd=e;c.Ba=a.td++;c=eh(a.K,b,e,c.Ba,c.Fe);Sb(a.ca,b,c);Gh(a)}else c.Pd(),c.bd=null,c.cd=null,c.G&&(a=new W(c.ad,new U(a,c.path),N),c.G(null,!1,a))}function Gh(a,b){var c=b||a.mc;b||Hh(a,c);if(null!==c.Ca()){var d=Ih(a,c);H(0<d.length,"Sending zero length transaction queue");Na(d,function(a){return 1===a.status})&&Jh(a,c.path(),d)}else c.hd()&&c.O(function(b){Gh(a,b)})}
	function Jh(a,b,c){for(var d=La(c,function(a){return a.Ba}),e=a.K.Aa(b,d)||G,d=e,e=e.hash(),f=0;f<c.length;f++){var h=c[f];H(1===h.status,"tryToSendTransactionQueue_: items in queue should all be run.");h.status=2;h.of++;var k=T(b,h.path),d=d.F(k,h.bd)}d=d.H(!0);a.va.put(b.toString(),d,function(d){a.f("transaction put response",{path:b.toString(),status:d});var e=[];if("ok"===d){d=[];for(f=0;f<c.length;f++){c[f].status=3;e=e.concat(hh(a.K,c[f].Ba));if(c[f].G){var h=c[f].cd,k=new U(a,c[f].path);d.push(q(c[f].G,
	null,null,!0,new W(h,k,N)))}c[f].Pd()}Hh(a,Kg(a.mc,b));Gh(a);Sb(a.ca,b,e);for(f=0;f<d.length;f++)ub(d[f])}else{if("datastale"===d)for(f=0;f<c.length;f++)c[f].status=4===c[f].status?5:1;else for(O("transaction at "+b.toString()+" failed: "+d),f=0;f<c.length;f++)c[f].status=5,c[f].Rd=d;Bh(a,b)}},e)}function Bh(a,b){var c=Kh(a,b),d=c.path(),c=Ih(a,c);Lh(a,c,d);return d}
	function Lh(a,b,c){if(0!==b.length){for(var d=[],e=[],f=Ka(b,function(a){return 1===a.status}),f=La(f,function(a){return a.Ba}),h=0;h<b.length;h++){var k=b[h],l=T(c,k.path),m=!1,u;H(null!==l,"rerunTransactionsUnderNode_: relativePath should not be null.");if(5===k.status)m=!0,u=k.Rd,e=e.concat(hh(a.K,k.Ba,!0));else if(1===k.status)if(25<=k.of)m=!0,u="maxretry",e=e.concat(hh(a.K,k.Ba,!0));else{var z=a.K.Aa(k.path,f)||G;k.ad=z;var F=b[h].update(z.H());n(F)?(ef("transaction failed: Data returned ",F,
	k.path),l=M(F),"object"===typeof F&&null!=F&&cb(F,".priority")||(l=l.fa(z.C())),z=k.Ba,F=Ah(a),F=pc(l,F),k.bd=l,k.cd=F,k.Ba=a.td++,Qa(f,z),e=e.concat(eh(a.K,k.path,F,k.Ba,k.Fe)),e=e.concat(hh(a.K,z,!0))):(m=!0,u="nodata",e=e.concat(hh(a.K,k.Ba,!0)))}Sb(a.ca,c,e);e=[];m&&(b[h].status=3,setTimeout(b[h].Pd,Math.floor(0)),b[h].G&&("nodata"===u?(k=new U(a,b[h].path),d.push(q(b[h].G,null,null,!1,new W(b[h].ad,k,N)))):d.push(q(b[h].G,null,Error(u),!1,null))))}Hh(a,a.mc);for(h=0;h<d.length;h++)ub(d[h]);Gh(a)}}
	function Kh(a,b){for(var c,d=a.mc;null!==(c=J(b))&&null===d.Ca();)d=Kg(d,c),b=D(b);return d}function Ih(a,b){var c=[];Mh(a,b,c);c.sort(function(a,b){return a.ef-b.ef});return c}function Mh(a,b,c){var d=b.Ca();if(null!==d)for(var e=0;e<d.length;e++)c.push(d[e]);b.O(function(b){Mh(a,b,c)})}function Hh(a,b){var c=b.Ca();if(c){for(var d=0,e=0;e<c.length;e++)3!==c[e].status&&(c[d]=c[e],d++);c.length=d;Lg(b,0<c.length?c:null)}b.O(function(b){Hh(a,b)})}
	function Eh(a,b){var c=Kh(a,b).path(),d=Kg(a.mc,b);Og(d,function(b){Nh(a,b)});Nh(a,d);Ng(d,function(b){Nh(a,b)});return c}
	function Nh(a,b){var c=b.Ca();if(null!==c){for(var d=[],e=[],f=-1,h=0;h<c.length;h++)4!==c[h].status&&(2===c[h].status?(H(f===h-1,"All SENT items should be at beginning of queue."),f=h,c[h].status=4,c[h].Rd="set"):(H(1===c[h].status,"Unexpected transaction status in abort"),c[h].Pd(),e=e.concat(hh(a.K,c[h].Ba,!0)),c[h].G&&d.push(q(c[h].G,null,Error("set"),!1,null))));-1===f?Lg(b,null):c.length=f+1;Sb(a.ca,b.path(),e);for(h=0;h<d.length;h++)ub(d[h])}};function Ye(){this.lb={};this.wf=!1}Ye.prototype.ab=function(){for(var a in this.lb)this.lb[a].ab()};Ye.prototype.kc=function(){for(var a in this.lb)this.lb[a].kc()};Ye.prototype.$d=function(a){this.wf=a};ca(Ye);Ye.prototype.interrupt=Ye.prototype.ab;Ye.prototype.resume=Ye.prototype.kc;var Z={};Z.nc=Pg;Z.DataConnection=Z.nc;Pg.prototype.ng=function(a,b){this.ua("q",{p:a},b)};Z.nc.prototype.simpleListen=Z.nc.prototype.ng;Pg.prototype.Hf=function(a,b){this.ua("echo",{d:a},b)};Z.nc.prototype.echo=Z.nc.prototype.Hf;Pg.prototype.interrupt=Pg.prototype.ab;Z.zf=Ce;Z.RealTimeConnection=Z.zf;Ce.prototype.sendRequest=Ce.prototype.ua;Ce.prototype.close=Ce.prototype.close;
	Z.Rf=function(a){var b=Pg.prototype.put;Pg.prototype.put=function(c,d,e,f){n(f)&&(f=a());b.call(this,c,d,e,f)};return function(){Pg.prototype.put=b}};Z.hijackHash=Z.Rf;Z.yf=Hb;Z.ConnectionTarget=Z.yf;Z.ja=function(a){return a.ja()};Z.queryIdentifier=Z.ja;Z.Uf=function(a){return a.u.Ra.$};Z.listens=Z.Uf;Z.$d=function(a){Ye.Vb().$d(a)};Z.forceRestClient=Z.$d;Z.Context=Ye;function U(a,b){if(!(a instanceof Te))throw Error("new Firebase() no longer supported - use app.database().");X.call(this,a,b,fe,!1);this.then=void 0;this["catch"]=void 0}la(U,X);g=U.prototype;g.getKey=function(){x("Firebase.key",0,0,arguments.length);return this.path.e()?null:Bd(this.path)};
	g.n=function(a){x("Firebase.child",1,1,arguments.length);if(ga(a))a=String(a);else if(!(a instanceof L))if(null===J(this.path)){var b=a;b&&(b=b.replace(/^\/*\.info(\/|$)/,"/"));lf("Firebase.child",b)}else lf("Firebase.child",a);return new U(this.u,this.path.n(a))};g.getParent=function(){x("Firebase.parent",0,0,arguments.length);var a=this.path.parent();return null===a?null:new U(this.u,a)};
	g.Of=function(){x("Firebase.ref",0,0,arguments.length);for(var a=this;null!==a.getParent();)a=a.getParent();return a};g.Gf=function(){return this.u.Ya};g.set=function(a,b){x("Firebase.set",1,2,arguments.length);mf("Firebase.set",this.path);df("Firebase.set",a,this.path,!1);A("Firebase.set",2,b,!0);var c=new hb;this.u.Jb(this.path,a,null,ib(c,b));return c.ra};
	g.update=function(a,b){x("Firebase.update",1,2,arguments.length);mf("Firebase.update",this.path);if(ea(a)){for(var c={},d=0;d<a.length;++d)c[""+d]=a[d];a=c;O("Passing an Array to Firebase.update() is deprecated. Use set() if you want to overwrite the existing data, or an Object with integer keys if you really do want to only update some of the children.")}gf("Firebase.update",a,this.path);A("Firebase.update",2,b,!0);c=new hb;this.u.update(this.path,a,ib(c,b));return c.ra};
	g.Jb=function(a,b,c){x("Firebase.setWithPriority",2,3,arguments.length);mf("Firebase.setWithPriority",this.path);df("Firebase.setWithPriority",a,this.path,!1);hf("Firebase.setWithPriority",2,b);A("Firebase.setWithPriority",3,c,!0);if(".length"===this.getKey()||".keys"===this.getKey())throw"Firebase.setWithPriority failed: "+this.getKey()+" is a read-only object.";var d=new hb;this.u.Jb(this.path,a,b,ib(d,c));return d.ra};
	g.remove=function(a){x("Firebase.remove",0,1,arguments.length);mf("Firebase.remove",this.path);A("Firebase.remove",1,a,!0);return this.set(null,a)};
	g.transaction=function(a,b,c){x("Firebase.transaction",1,3,arguments.length);mf("Firebase.transaction",this.path);A("Firebase.transaction",1,a,!1);A("Firebase.transaction",2,b,!0);if(n(c)&&"boolean"!=typeof c)throw Error(y("Firebase.transaction",3,!0)+"must be a boolean.");if(".length"===this.getKey()||".keys"===this.getKey())throw"Firebase.transaction failed: "+this.getKey()+" is a read-only object.";"undefined"===typeof c&&(c=!0);var d=new hb;ha(b)&&jb(d.ra);Fh(this.u,this.path,a,function(a,c,h){a?
	d.reject(a):d.resolve(new pb(c,h));ha(b)&&b(a,c,h)},c);return d.ra};g.kg=function(a,b){x("Firebase.setPriority",1,2,arguments.length);mf("Firebase.setPriority",this.path);hf("Firebase.setPriority",1,a);A("Firebase.setPriority",2,b,!0);var c=new hb;this.u.Jb(this.path.n(".priority"),a,null,ib(c,b));return c.ra};
	g.push=function(a,b){x("Firebase.push",0,2,arguments.length);mf("Firebase.push",this.path);df("Firebase.push",a,this.path,!0);A("Firebase.push",2,b,!0);var c=zh(this.u),d=uf(c),c=this.n(d);if(null!=a){var e=this,f=c.set(a,b).then(function(){return e.n(d)});c.then=q(f.then,f);c["catch"]=q(f.then,f,void 0);ha(b)&&jb(f)}return c};g.ib=function(){mf("Firebase.onDisconnect",this.path);return new V(this.u,this.path)};U.prototype.child=U.prototype.n;U.prototype.set=U.prototype.set;U.prototype.update=U.prototype.update;
	U.prototype.setWithPriority=U.prototype.Jb;U.prototype.remove=U.prototype.remove;U.prototype.transaction=U.prototype.transaction;U.prototype.setPriority=U.prototype.kg;U.prototype.push=U.prototype.push;U.prototype.onDisconnect=U.prototype.ib;Lc(U.prototype,"database",U.prototype.Gf);Lc(U.prototype,"key",U.prototype.getKey);Lc(U.prototype,"parent",U.prototype.getParent);Lc(U.prototype,"root",U.prototype.Of);if("undefined"===typeof firebase)throw Error("Cannot install Firebase Database - be sure to load firebase-app.js first.");
	try{firebase.INTERNAL.registerService("database",function(a){var b=Ye.Vb(),c=a.options.databaseURL;n(c)||Ac("Can't determine Firebase Database URL.  Be sure to include databaseURL option when calling firebase.intializeApp().");var d=Bc(c),c=d.jc;Xe("Invalid Firebase Database URL",d);d.path.e()||Ac("Database URL must point to the root of a Firebase Database (not including a child path).");(d=w(b.lb,a.name))&&Ac("FIREBASE INTERNAL ERROR: Database initialized multiple times.");d=new Te(c,b.wf,a);b.lb[a.name]=
	d;return d.Ya},{Reference:U,Query:X,Database:Se,enableLogging:xc,INTERNAL:Y,TEST_ACCESS:Z,ServerValue:Ve})}catch(Oh){Ac("Failed to register the Firebase Database Service ("+Oh+")")};})();

	module.exports = firebase.database;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var firebase = __webpack_require__(3);
	/*! @license Firebase v3.6.1
	    Build: 3.6.1-rc.3
	    Terms: https://firebase.google.com/terms/ */
	(function() {var k,l=this,n=function(a){return void 0!==a},aa=function(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&
	!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==b&&"undefined"==typeof a.call)return"object";return b},p=function(a){return"string"==typeof a},ba=function(a,b){function c(){}c.prototype=b.prototype;a.sa=b.prototype;a.prototype=new c;a.ra=function(a,c,f){for(var d=Array(arguments.length-2),e=2;e<arguments.length;e++)d[e-2]=arguments[e];return b.prototype[c].apply(a,d)}};var ca=function(a,b,c){function d(){z||(z=!0,b.apply(null,arguments))}function e(b){m=setTimeout(function(){m=null;a(f,2===C)},b)}function f(a,b){if(!z)if(a)d.apply(null,arguments);else if(2===C||B)d.apply(null,arguments);else{64>h&&(h*=2);var c;1===C?(C=2,c=0):c=1E3*(h+Math.random());e(c)}}function g(a){Na||(Na=!0,z||(null!==m?(a||(C=2),clearTimeout(m),e(0)):a||(C=1)))}var h=1,m=null,B=!1,C=0,z=!1,Na=!1;e(0);setTimeout(function(){B=!0;g(!0)},c);return g};var q="https://firebasestorage.googleapis.com";var r=function(a,b){this.code="storage/"+a;this.message="Firebase Storage: "+b;this.serverResponse=null;this.name="FirebaseError"};ba(r,Error);
	var da=function(){return new r("unknown","An unknown error occurred, please check the error payload for server response.")},ea=function(){return new r("canceled","User canceled the upload/download.")},fa=function(){return new r("cannot-slice-blob","Cannot slice blob for upload. Please retry the upload.")},ga=function(a,b,c){return new r("invalid-argument","Invalid argument in `"+b+"` at index "+a+": "+c)},ha=function(){return new r("app-deleted","The Firebase app was deleted.")},t=function(a,b){return new r("invalid-format",
	"String does not match format '"+a+"': "+b)},ia=function(a){throw new r("internal-error","Internal error: "+a);};var ja=function(a,b){for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&b(c,a[c])},ka=function(a){var b={};ja(a,function(a,d){b[a]=d});return b};var la=function(a){if("undefined"!==typeof firebase)return new firebase.Promise(a);throw Error("Error in Firebase Storage - be sure to load firebase-app.js first.");};var u=function(a,b,c,d){this.h=a;this.b={};this.method=b;this.headers={};this.body=null;this.j=c;this.l=this.a=null;this.c=[200];this.g=[];this.timeout=d;this.f=!0};var ma={STATE_CHANGED:"state_changed"},v={RUNNING:"running",PAUSED:"paused",SUCCESS:"success",CANCELED:"canceled",ERROR:"error"},na=function(a){switch(a){case "running":case "pausing":case "canceling":return"running";case "paused":return"paused";case "success":return"success";case "canceled":return"canceled";case "error":return"error";default:return"error"}};var w=function(a){return n(a)&&null!==a},oa=function(a){return"string"===typeof a||a instanceof String},pa=function(){return"undefined"!==typeof Blob};var qa=function(a){if(Error.captureStackTrace)Error.captureStackTrace(this,qa);else{var b=Error().stack;b&&(this.stack=b)}a&&(this.message=String(a))};ba(qa,Error);var sa=function(a,b){var c=ra;return Object.prototype.hasOwnProperty.call(c,a)?c[a]:c[a]=b(a)};var ta=function(a,b){for(var c=a.split("%s"),d="",e=Array.prototype.slice.call(arguments,1);e.length&&1<c.length;)d+=c.shift()+e.shift();return d+c.join("%s")},ua=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")},va=function(a,b){return a<b?-1:a>b?1:0};var x=function(a){return function(){var b=[];Array.prototype.push.apply(b,arguments);firebase.Promise.resolve(!0).then(function(){a.apply(null,b)})}};var y=function(a,b){this.bucket=a;this.path=b},wa=function(a){var b=encodeURIComponent;return"/b/"+b(a.bucket)+"/o/"+b(a.path)},xa=function(a){for(var b=null,c=[{K:/^gs:\/\/([A-Za-z0-9.\-]+)(\/(.*))?$/i,G:{bucket:1,path:3},J:function(a){"/"===a.path.charAt(a.path.length-1)&&(a.path=a.path.slice(0,-1))}},{K:/^https?:\/\/firebasestorage\.googleapis\.com\/v[A-Za-z0-9_]+\/b\/([A-Za-z0-9.\-]+)\/o(\/([^?#]*).*)?$/i,G:{bucket:1,path:3},J:function(a){a.path=decodeURIComponent(a.path)}}],d=0;d<c.length;d++){var e=
	c[d],f=e.K.exec(a);if(f){b=f[e.G.bucket];(f=f[e.G.path])||(f="");b=new y(b,f);e.J(b);break}}if(null==b)throw new r("invalid-url","Invalid URL '"+a+"'.");return b};var ya=function(a,b,c){"function"==aa(a)||w(b)||w(c)?(this.c=a,this.a=b||null,this.b=c||null):(this.c=a.next||null,this.a=a.error||null,this.b=a.complete||null)};var A={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"},za=function(a){switch(a){case "raw":case "base64":case "base64url":case "data_url":break;default:throw"Expected one of the event types: [raw, base64, base64url, data_url].";}},Aa=function(a,b){this.b=a;this.a=b||null},Ea=function(a,b){switch(a){case "raw":return new Aa(Ba(b));case "base64":case "base64url":return new Aa(Ca(a,b));case "data_url":return a=new Da(b),a=a.a?Ca("base64",a.c):Ba(a.c),new Aa(a,(new Da(b)).b)}throw da();
	},Ba=function(a){for(var b=[],c=0;c<a.length;c++){var d=a.charCodeAt(c);if(127>=d)b.push(d);else if(2047>=d)b.push(192|d>>6,128|d&63);else if(55296==(d&64512))if(c<a.length-1&&56320==(a.charCodeAt(c+1)&64512)){var e=a.charCodeAt(++c),d=65536|(d&1023)<<10|e&1023;b.push(240|d>>18,128|d>>12&63,128|d>>6&63,128|d&63)}else b.push(239,191,189);else 56320==(d&64512)?b.push(239,191,189):b.push(224|d>>12,128|d>>6&63,128|d&63)}return new Uint8Array(b)},Ca=function(a,b){switch(a){case "base64":var c=-1!==b.indexOf("-"),
	d=-1!==b.indexOf("_");if(c||d)throw t(a,"Invalid character '"+(c?"-":"_")+"' found: is it base64url encoded?");break;case "base64url":c=-1!==b.indexOf("+");d=-1!==b.indexOf("/");if(c||d)throw t(a,"Invalid character '"+(c?"+":"/")+"' found: is it base64 encoded?");b=b.replace(/-/g,"+").replace(/_/g,"/")}var e;try{e=atob(b)}catch(f){throw t(a,"Invalid character found");}a=new Uint8Array(e.length);for(b=0;b<e.length;b++)a[b]=e.charCodeAt(b);return a},Da=function(a){var b=a.match(/^data:([^,]+)?,/);if(null===
	b)throw t("data_url","Must be formatted 'data:[<mediatype>][;base64],<data>");b=b[1]||null;this.a=!1;this.b=null;if(null!=b){var c=b.length-7;this.b=(this.a=0<=c&&b.indexOf(";base64",c)==c)?b.substring(0,b.length-7):b}this.c=a.substring(a.indexOf(",")+1)};var Fa=function(a){var b=encodeURIComponent,c="?";ja(a,function(a,e){a=b(a)+"="+b(e);c=c+a+"&"});return c=c.slice(0,-1)};var Ga=function(){var a=this;this.a=new XMLHttpRequest;this.c=0;this.f=la(function(b){a.a.addEventListener("abort",function(){a.c=2;b(a)});a.a.addEventListener("error",function(){a.c=1;b(a)});a.a.addEventListener("load",function(){b(a)})});this.b=!1},Ha=function(a,b,c,d,e){if(a.b)throw ia("cannot .send() more than once");a.b=!0;a.a.open(c,b,!0);w(e)&&ja(e,function(b,c){a.a.setRequestHeader(b,c.toString())});w(d)?a.a.send(d):a.a.send();return a.f},Ia=function(a){if(!a.b)throw ia("cannot .getErrorCode() before sending");
	return a.c},D=function(a){if(!a.b)throw ia("cannot .getStatus() before sending");try{return a.a.status}catch(b){return-1}},Ja=function(a){if(!a.b)throw ia("cannot .getResponseText() before sending");return a.a.responseText};Ga.prototype.abort=function(){this.a.abort()};var E=function(a,b,c,d,e,f){this.b=a;this.h=b;this.f=c;this.a=d;this.g=e;this.c=f};k=E.prototype;k.V=function(){return this.b};k.qa=function(){return this.h};k.na=function(){return this.f};k.ia=function(){return this.a};k.W=function(){if(w(this.a)){var a=this.a.downloadURLs;return w(a)&&w(a[0])?a[0]:null}return null};k.pa=function(){return this.g};k.la=function(){return this.c};var Ka=function(a,b){b.unshift(a);qa.call(this,ta.apply(null,b));b.shift()};ba(Ka,qa);var F=function(a,b,c){if(!a){var d=Array.prototype.slice.call(arguments,2),e="Assertion failed";if(b)var e=e+(": "+b),f=d;throw new Ka(""+e,f||[]);}};var G;a:{var La=l.navigator;if(La){var Ma=La.userAgent;if(Ma){G=Ma;break a}}G=""};var Oa=function(){};var H=Array.prototype.indexOf?function(a,b,c){F(null!=a.length);return Array.prototype.indexOf.call(a,b,c)}:function(a,b,c){c=null==c?0:0>c?Math.max(0,a.length+c):c;if(p(a))return p(b)&&1==b.length?a.indexOf(b,c):-1;for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},Pa=Array.prototype.forEach?function(a,b,c){F(null!=a.length);Array.prototype.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},Qa=Array.prototype.filter?function(a,
	b,c){F(null!=a.length);return Array.prototype.filter.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=[],f=0,g=p(a)?a.split(""):a,h=0;h<d;h++)if(h in g){var m=g[h];b.call(c,m,h,a)&&(e[f++]=m)}return e},Ra=Array.prototype.map?function(a,b,c){F(null!=a.length);return Array.prototype.map.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=Array(d),f=p(a)?a.split(""):a,g=0;g<d;g++)g in f&&(e[g]=b.call(c,f[g],g,a));return e},Sa=function(a){var b=a.length;if(0<b){for(var c=Array(b),d=0;d<b;d++)c[d]=a[d];
	return c}return[]};var Ta=function(a,b){b=Qa(b.split("/"),function(a){return 0<a.length}).join("/");return 0===a.length?b:a+"/"+b},Ua=function(a){var b=a.lastIndexOf("/",a.length-2);return-1===b?a:a.slice(b+1)};var Wa=function(a,b,c,d,e,f,g,h,m,B,C){this.C=a;this.A=b;this.v=c;this.o=d;this.B=e.slice();this.m=f.slice();this.j=this.l=this.c=this.b=null;this.f=this.g=!1;this.s=g;this.h=h;this.D=C;this.w=m;var z=this;this.u=la(function(a,b){z.l=a;z.j=b;Va(z)})},Xa=function(a,b,c){this.b=a;this.c=b;this.a=!!c},Va=function(a){function b(a,b){b?a(!1,new Xa(!1,null,!0)):(b=new Ga,b.a.withCredentials=d.D,d.b=b,Ha(b,d.C,d.A,d.o,d.v).then(function(b){d.b=null;var c=0===Ia(b),e=D(b);if(!(c=!c)){var f=d,c=500<=e&&600>
	e,g;g=0<=H([408,429],e);f=0<=H(f.m,e);c=c||g||f}c?(b=2===Ia(b),a(!1,new Xa(!1,null,b))):(e=0<=H(d.B,e),a(!0,new Xa(e,b)))}))}function c(a,b){var c=d.l;a=d.j;var e=b.c;if(b.b)try{var f=d.s(e,Ja(e));n(f)?c(f):c()}catch(B){a(B)}else null!==e?(b=da(),f=Ja(e),b.serverResponse=f,d.h?a(d.h(e,b)):a(b)):(b=b.a?d.f?ha():ea():new r("retry-limit-exceeded","Max retry time for operation exceeded, please try again."),a(b))}var d=a;a.g?c(0,new Xa(!1,null,!0)):a.c=ca(b,c,a.w)};Wa.prototype.a=function(){return this.u};
	Wa.prototype.cancel=function(a){this.g=!0;this.f=a||!1;null!==this.c&&(0,this.c)(!1);null!==this.b&&this.b.abort()};var Ya=function(a,b,c){var d=Fa(a.b),d=a.h+d,e=a.headers?ka(a.headers):{};null!==b&&0<b.length&&(e.Authorization="Firebase "+b);e["X-Firebase-Storage-Version"]="webjs/"+("undefined"!==typeof firebase?firebase.SDK_VERSION:"AppManager");return new Wa(d,a.method,e,a.body,a.c,a.g,a.j,a.a,a.timeout,0,c)};var Za=function(a){this.b=firebase.Promise.reject(a)};Za.prototype.a=function(){return this.b};Za.prototype.cancel=function(){};var $a=function(){this.a={};this.b=Number.MIN_SAFE_INTEGER},ab=function(a,b){function c(){delete e.a[d]}var d=a.b;a.b++;a.a[d]=b;var e=a;b.a().then(c,c)},bb=function(a){ja(a.a,function(a,c){c&&c.cancel(!0)});a.a={}};var cb=-1!=G.indexOf("Opera"),db=-1!=G.indexOf("Trident")||-1!=G.indexOf("MSIE"),eb=-1!=G.indexOf("Edge"),fb=-1!=G.indexOf("Gecko")&&!(-1!=G.toLowerCase().indexOf("webkit")&&-1==G.indexOf("Edge"))&&!(-1!=G.indexOf("Trident")||-1!=G.indexOf("MSIE"))&&-1==G.indexOf("Edge"),gb=-1!=G.toLowerCase().indexOf("webkit")&&-1==G.indexOf("Edge"),hb;
	a:{var ib="",jb=function(){var a=G;if(fb)return/rv\:([^\);]+)(\)|;)/.exec(a);if(eb)return/Edge\/([\d\.]+)/.exec(a);if(db)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(gb)return/WebKit\/(\S+)/.exec(a);if(cb)return/(?:Version)[ \/]?(\S+)/.exec(a)}();jb&&(ib=jb?jb[1]:"");if(db){var kb,lb=l.document;kb=lb?lb.documentMode:void 0;if(null!=kb&&kb>parseFloat(ib)){hb=String(kb);break a}}hb=ib}
	var mb=hb,ra={},nb=function(a){return sa(a,function(){for(var b=0,c=ua(String(mb)).split("."),d=ua(String(a)).split("."),e=Math.max(c.length,d.length),f=0;0==b&&f<e;f++){var g=c[f]||"",h=d[f]||"";do{g=/(\d*)(\D*)(.*)/.exec(g)||["","","",""];h=/(\d*)(\D*)(.*)/.exec(h)||["","","",""];if(0==g[0].length&&0==h[0].length)break;b=va(0==g[1].length?0:parseInt(g[1],10),0==h[1].length?0:parseInt(h[1],10))||va(0==g[2].length,0==h[2].length)||va(g[2],h[2]);g=g[3];h=h[3]}while(0==b)}return 0<=b})};var ob=function(a,b,c,d,e){this.a=a;this.g=null;if(null!==this.a&&(a=this.a.options,w(a))){a=a.storageBucket||null;if(null==a)a=null;else{var f=null;try{f=xa(a)}catch(g){}if(null!==f){if(""!==f.path)throw new r("invalid-default-bucket","Invalid default bucket '"+a+"'.");a=f.bucket}}this.g=a}this.o=b;this.m=c;this.j=e;this.l=d;this.c=12E4;this.b=6E4;this.h=new $a;this.f=!1},pb=function(a){return null!==a.a&&w(a.a.INTERNAL)&&w(a.a.INTERNAL.getToken)?a.a.INTERNAL.getToken().then(function(a){return w(a)?
	a.accessToken:null},function(){return null}):firebase.Promise.resolve(null)};ob.prototype.bucket=function(){if(this.f)throw ha();return this.g};var I=function(a,b,c){if(a.f)return new Za(ha());b=a.m(b,c,null===a.a,a.j);ab(a.h,b);return b};var qb=function(a){var b=l.BlobBuilder||l.WebKitBlobBuilder;if(n(b)){for(var b=new b,c=0;c<arguments.length;c++)b.append(arguments[c]);return b.getBlob()}b=Sa(arguments);c=l.BlobBuilder||l.WebKitBlobBuilder;if(n(c)){for(var c=new c,d=0;d<b.length;d++)c.append(b[d],void 0);b=c.getBlob(void 0)}else if(n(l.Blob))b=new Blob(b,{});else throw Error("This browser doesn't seem to support creating Blobs");return b},rb=function(a,b,c){n(c)||(c=a.size);return a.webkitSlice?a.webkitSlice(b,c):a.mozSlice?a.mozSlice(b,
	c):a.slice?fb&&!nb("13.0")||gb&&!nb("537.1")?(0>b&&(b+=a.size),0>b&&(b=0),0>c&&(c+=a.size),c<b&&(c=b),a.slice(b,c-b)):a.slice(b,c):null};var J=function(a,b){pa()&&a instanceof Blob?(this.i=a,b=a.size,a=a.type):(a instanceof ArrayBuffer?(b?this.i=new Uint8Array(a):(this.i=new Uint8Array(a.byteLength),this.i.set(new Uint8Array(a))),b=this.i.length):(b?this.i=a:(this.i=new Uint8Array(a.length),this.i.set(a)),b=a.length),a="");this.a=b;this.b=a};J.prototype.type=function(){return this.b};
	J.prototype.slice=function(a,b){if(pa()&&this.i instanceof Blob)return a=rb(this.i,a,b),null===a?null:new J(a);a=new Uint8Array(this.i.buffer,a,b-a);return new J(a,!0)};
	var sb=function(a){var b=[];Array.prototype.push.apply(b,arguments);if(pa())return b=Ra(b,function(a){return a instanceof J?a.i:a}),new J(qb.apply(null,b));var b=Ra(b,function(a){return oa(a)?Ea("raw",a).b.buffer:a.i.buffer}),c=0;Pa(b,function(a){c+=a.byteLength});var d=new Uint8Array(c),e=0;Pa(b,function(a){a=new Uint8Array(a);for(var b=0;b<a.length;b++)d[e++]=a[b]});return new J(d,!0)};var tb=function(a,b){return b},K=function(a,b,c,d){this.c=a;this.b=b||a;this.writable=!!c;this.a=d||tb},ub=null,vb=function(){if(ub)return ub;var a=[];a.push(new K("bucket"));a.push(new K("generation"));a.push(new K("metageneration"));a.push(new K("name","fullPath",!0));var b=new K("name");b.a=function(a,b){return!oa(b)||2>b.length?b:Ua(b)};a.push(b);b=new K("size");b.a=function(a,b){return w(b)?+b:b};a.push(b);a.push(new K("timeCreated"));a.push(new K("updated"));a.push(new K("md5Hash",null,!0));
	a.push(new K("cacheControl",null,!0));a.push(new K("contentDisposition",null,!0));a.push(new K("contentEncoding",null,!0));a.push(new K("contentLanguage",null,!0));a.push(new K("contentType",null,!0));a.push(new K("metadata","customMetadata",!0));a.push(new K("downloadTokens","downloadURLs",!1,function(a,b){if(!(oa(b)&&0<b.length))return[];var c=encodeURIComponent;return Ra(b.split(","),function(b){var d=a.fullPath,d="https://firebasestorage.googleapis.com/v0"+("/b/"+c(a.bucket)+"/o/"+c(d));b=Fa({alt:"media",
	token:b});return d+b})}));return ub=a},wb=function(a,b){Object.defineProperty(a,"ref",{get:function(){return b.o(b,new y(a.bucket,a.fullPath))}})},xb=function(a,b){for(var c={},d=b.length,e=0;e<d;e++){var f=b[e];f.writable&&(c[f.c]=a[f.b])}return JSON.stringify(c)},yb=function(a){if(!a||"object"!==typeof a)throw"Expected Metadata object.";for(var b in a){var c=a[b];if("customMetadata"===b&&"object"!==typeof c)throw"Expected object for 'customMetadata' mapping.";}};var L=function(a,b,c){for(var d=b.length,e=b.length,f=0;f<b.length;f++)if(b[f].b){d=f;break}if(!(d<=c.length&&c.length<=e))throw d===e?(b=d,d=1===d?"argument":"arguments"):(b="between "+d+" and "+e,d="arguments"),new r("invalid-argument-count","Invalid argument count in `"+a+"`: Expected "+b+" "+d+", received "+c.length+".");for(f=0;f<c.length;f++)try{b[f].a(c[f])}catch(g){if(g instanceof Error)throw ga(f,a,g.message);throw ga(f,a,g);}},M=function(a,b){var c=this;this.a=function(b){c.b&&!n(b)||a(b)};
	this.b=!!b},zb=function(a,b){return function(c){a(c);b(c)}},N=function(a,b){function c(a){if(!("string"===typeof a||a instanceof String))throw"Expected string.";}var d;a?d=zb(c,a):d=c;return new M(d,b)},Ab=function(){return new M(function(a){if(!(a instanceof Uint8Array||a instanceof ArrayBuffer||pa()&&a instanceof Blob))throw"Expected Blob or File.";})},Bb=function(){return new M(function(a){if(!(("number"===typeof a||a instanceof Number)&&0<=a))throw"Expected a number 0 or greater.";})},Cb=function(a,
	b){return new M(function(b){if(!(null===b||w(b)&&b instanceof Object))throw"Expected an Object.";w(a)&&a(b)},b)},O=function(){return new M(function(a){if(null!==a&&"function"!=aa(a))throw"Expected a Function.";},!0)};var P=function(a){if(!a)throw da();},Db=function(a,b){return function(c,d){var e;a:{try{e=JSON.parse(d)}catch(h){e=null;break a}c=typeof e;e="object"==c&&null!=e||"function"==c?e:null}if(null===e)e=null;else{c={type:"file"};d=b.length;for(var f=0;f<d;f++){var g=b[f];c[g.b]=g.a(c,e[g.c])}wb(c,a);e=c}P(null!==e);return e}},Q=function(a){return function(b,c){b=401===D(b)?new r("unauthenticated","User is not authenticated, please authenticate using Firebase Authentication and try again."):402===D(b)?
	new r("quota-exceeded","Quota for bucket '"+a.bucket+"' exceeded, please view quota on https://firebase.google.com/pricing/."):403===D(b)?new r("unauthorized","User does not have permission to access '"+a.path+"'."):c;b.serverResponse=c.serverResponse;return b}},Eb=function(a){var b=Q(a);return function(c,d){var e=b(c,d);404===D(c)&&(e=new r("object-not-found","Object '"+a.path+"' does not exist."));e.serverResponse=d.serverResponse;return e}},Fb=function(a,b,c){var d=wa(b);a=new u(q+"/v0"+d,"GET",
	Db(a,c),a.c);a.a=Eb(b);return a},Gb=function(a,b){var c=wa(b);a=new u(q+"/v0"+c,"DELETE",function(){},a.c);a.c=[200,204];a.a=Eb(b);return a},Hb=function(a,b,c){c=c?ka(c):{};c.fullPath=a.path;c.size=b.a;c.contentType||(a=b&&b.type()||"application/octet-stream",c.contentType=a);return c},Ib=function(a,b,c,d,e){var f="/b/"+encodeURIComponent(b.bucket)+"/o",g={"X-Goog-Upload-Protocol":"multipart"},h;h="";for(var m=0;2>m;m++)h+=Math.random().toString().slice(2);g["Content-Type"]="multipart/related; boundary="+
	h;e=Hb(b,d,e);m=xb(e,c);d=sb("--"+h+"\r\nContent-Type: application/json; charset=utf-8\r\n\r\n"+m+"\r\n--"+h+"\r\nContent-Type: "+e.contentType+"\r\n\r\n",d,"\r\n--"+h+"--");if(null===d)throw fa();a=new u(q+"/v0"+f,"POST",Db(a,c),a.b);a.b={name:e.fullPath};a.headers=g;a.body=d.i;a.a=Q(b);return a},Jb=function(a,b,c,d){this.a=a;this.b=b;this.c=!!c;this.f=d||null},Kb=function(a,b){var c;try{c=a.a.getResponseHeader("X-Goog-Upload-Status")}catch(d){P(!1)}a=0<=H(b||["active"],c);P(a);return c},Lb=function(a,
	b,c,d,e){var f="/b/"+encodeURIComponent(b.bucket)+"/o",g=Hb(b,d,e);e={name:g.fullPath};f=q+"/v0"+f;d={"X-Goog-Upload-Protocol":"resumable","X-Goog-Upload-Command":"start","X-Goog-Upload-Header-Content-Length":d.a,"X-Goog-Upload-Header-Content-Type":g.contentType,"Content-Type":"application/json; charset=utf-8"};c=xb(g,c);a=new u(f,"POST",function(a){Kb(a);var b;try{b=a.a.getResponseHeader("X-Goog-Upload-URL")}catch(B){P(!1)}P(oa(b));return b},a.b);a.b=e;a.headers=d;a.body=c;a.a=Q(b);return a},Mb=
	function(a,b,c,d){a=new u(c,"POST",function(a){var b=Kb(a,["active","final"]),c;try{c=a.a.getResponseHeader("X-Goog-Upload-Size-Received")}catch(h){P(!1)}a=c;isFinite(a)&&(a=String(a));a=p(a)?/^\s*-?0x/i.test(a)?parseInt(a,16):parseInt(a,10):NaN;P(!isNaN(a));return new Jb(a,d.a,"final"===b)},a.b);a.headers={"X-Goog-Upload-Command":"query"};a.a=Q(b);a.f=!1;return a},Nb=function(a,b,c,d,e,f,g){var h=new Jb(0,0);g?(h.a=g.a,h.b=g.b):(h.a=0,h.b=d.a);if(d.a!==h.b)throw new r("server-file-wrong-size","Server recorded incorrect upload file size, please retry the upload.");
	var m=g=h.b-h.a;0<e&&(m=Math.min(m,e));var B=h.a;e={"X-Goog-Upload-Command":m===g?"upload, finalize":"upload","X-Goog-Upload-Offset":h.a};g=d.slice(B,B+m);if(null===g)throw fa();c=new u(c,"POST",function(a,c){var e=Kb(a,["active","final"]),g=h.a+m,C=d.a,z;"final"===e?z=Db(b,f)(a,c):z=null;return new Jb(g,C,"final"===e,z)},b.b);c.headers=e;c.body=g.i;c.l=null;c.a=Q(a);c.f=!1;return c};var T=function(a,b,c,d,e,f){this.L=a;this.c=b;this.l=c;this.f=e;this.h=f||null;this.s=d;this.m=0;this.D=this.u=!1;this.B=[];this.S=262144<this.f.a;this.b="running";this.a=this.v=this.g=null;this.j=1;var g=this;this.F=function(a){g.a=null;g.j=1;"storage/canceled"===a.code?(g.u=!0,R(g)):(g.g=a,S(g,"error"))};this.P=function(a){g.a=null;"storage/canceled"===a.code?R(g):(g.g=a,S(g,"error"))};this.A=this.o=null;this.C=la(function(a,b){g.o=a;g.A=b;Ob(g)});this.C.then(null,function(){})},Ob=function(a){"running"===
	a.b&&null===a.a&&(a.S?null===a.v?Pb(a):a.u?Qb(a):a.D?Rb(a):Sb(a):Tb(a))},U=function(a,b){pb(a.c).then(function(c){switch(a.b){case "running":b(c);break;case "canceling":S(a,"canceled");break;case "pausing":S(a,"paused")}})},Pb=function(a){U(a,function(b){var c=Lb(a.c,a.l,a.s,a.f,a.h);a.a=I(a.c,c,b);a.a.a().then(function(b){a.a=null;a.v=b;a.u=!1;R(a)},this.F)})},Qb=function(a){var b=a.v;U(a,function(c){var d=Mb(a.c,a.l,b,a.f);a.a=I(a.c,d,c);a.a.a().then(function(b){a.a=null;Ub(a,b.a);a.u=!1;b.c&&(a.D=
	!0);R(a)},a.F)})},Sb=function(a){var b=262144*a.j,c=new Jb(a.m,a.f.a),d=a.v;U(a,function(e){var f;try{f=Nb(a.l,a.c,d,a.f,b,a.s,c)}catch(g){a.g=g;S(a,"error");return}a.a=I(a.c,f,e);a.a.a().then(function(b){33554432>262144*a.j&&(a.j*=2);a.a=null;Ub(a,b.a);b.c?(a.h=b.f,S(a,"success")):R(a)},a.F)})},Rb=function(a){U(a,function(b){var c=Fb(a.c,a.l,a.s);a.a=I(a.c,c,b);a.a.a().then(function(b){a.a=null;a.h=b;S(a,"success")},a.P)})},Tb=function(a){U(a,function(b){var c=Ib(a.c,a.l,a.s,a.f,a.h);a.a=I(a.c,c,
	b);a.a.a().then(function(b){a.a=null;a.h=b;Ub(a,a.f.a);S(a,"success")},a.F)})},Ub=function(a,b){var c=a.m;a.m=b;a.m>c&&V(a)},S=function(a,b){if(a.b!==b)switch(b){case "canceling":a.b=b;null!==a.a&&a.a.cancel();break;case "pausing":a.b=b;null!==a.a&&a.a.cancel();break;case "running":var c="paused"===a.b;a.b=b;c&&(V(a),Ob(a));break;case "paused":a.b=b;V(a);break;case "canceled":a.g=ea();a.b=b;V(a);break;case "error":a.b=b;V(a);break;case "success":a.b=b,V(a)}},R=function(a){switch(a.b){case "pausing":S(a,
	"paused");break;case "canceling":S(a,"canceled");break;case "running":Ob(a)}};T.prototype.w=function(){return new E(this.m,this.f.a,na(this.b),this.h,this,this.L)};
	T.prototype.M=function(a,b,c,d){function e(a){try{g(a);return}catch(z){}try{if(h(a),!(n(a.next)||n(a.error)||n(a.complete)))throw"";}catch(z){throw"Expected a function or an Object with one of `next`, `error`, `complete` properties.";}}function f(a){return function(b,c,d){null!==a&&L("on",a,arguments);var e=new ya(b,c,d);Vb(m,e);return function(){var a=m.B,b=H(a,e);0<=b&&(F(null!=a.length),Array.prototype.splice.call(a,b,1))}}}var g=O().a,h=Cb(null,!0).a;L("on",[N(function(){if("state_changed"!==
	a)throw"Expected one of the event types: [state_changed].";}),Cb(e,!0),O(),O()],arguments);var m=this,B=[Cb(function(a){if(null===a)throw"Expected a function or an Object with one of `next`, `error`, `complete` properties.";e(a)}),O(),O()];return n(b)||n(c)||n(d)?f(null)(b,c,d):f(B)};T.prototype.then=function(a,b){return this.C.then(a,b)};
	var Vb=function(a,b){a.B.push(b);Wb(a,b)},V=function(a){Xb(a);var b=Sa(a.B);Pa(b,function(b){Wb(a,b)})},Xb=function(a){if(null!==a.o){var b=!0;switch(na(a.b)){case "success":x(a.o.bind(null,a.w()))();break;case "canceled":case "error":x(a.A.bind(null,a.g))();break;default:b=!1}b&&(a.o=null,a.A=null)}},Wb=function(a,b){switch(na(a.b)){case "running":case "paused":null!==b.c&&x(b.c.bind(b,a.w()))();break;case "success":null!==b.b&&x(b.b.bind(b))();break;case "canceled":case "error":null!==b.a&&x(b.a.bind(b,
	a.g))();break;default:null!==b.a&&x(b.a.bind(b,a.g))()}};T.prototype.O=function(){L("resume",[],arguments);var a="paused"===this.b||"pausing"===this.b;a&&S(this,"running");return a};T.prototype.N=function(){L("pause",[],arguments);var a="running"===this.b;a&&S(this,"pausing");return a};T.prototype.cancel=function(){L("cancel",[],arguments);var a="running"===this.b||"pausing"===this.b;a&&S(this,"canceling");return a};var W=function(a,b){this.b=a;if(b)this.a=b instanceof y?b:xa(b);else if(a=a.bucket(),null!==a)this.a=new y(a,"");else throw new r("no-default-bucket","No default bucket found. Did you set the 'storageBucket' property when initializing the app?");};W.prototype.toString=function(){L("toString",[],arguments);return"gs://"+this.a.bucket+"/"+this.a.path};var Yb=function(a,b){return new W(a,b)};k=W.prototype;
	k.H=function(a){L("child",[N()],arguments);var b=Ta(this.a.path,a);return Yb(this.b,new y(this.a.bucket,b))};k.ka=function(){var a;a=this.a.path;if(0==a.length)a=null;else{var b=a.lastIndexOf("/");a=-1===b?"":a.slice(0,b)}return null===a?null:Yb(this.b,new y(this.a.bucket,a))};k.ma=function(){return Yb(this.b,new y(this.a.bucket,""))};k.U=function(){return this.a.bucket};k.fa=function(){return this.a.path};k.ja=function(){return Ua(this.a.path)};k.oa=function(){return this.b.l};
	k.Z=function(a,b){L("put",[Ab(),new M(yb,!0)],arguments);X(this,"put");return new T(this,this.b,this.a,vb(),new J(a),b)};k.$=function(a,b,c){L("putString",[N(),N(za,!0),new M(yb,!0)],arguments);X(this,"putString");var d=Ea(w(b)?b:"raw",a),e=c?ka(c):{};!w(e.contentType)&&w(d.a)&&(e.contentType=d.a);return new T(this,this.b,this.a,vb(),new J(d.b,!0),e)};k.X=function(){L("delete",[],arguments);X(this,"delete");var a=this;return pb(this.b).then(function(b){var c=Gb(a.b,a.a);return I(a.b,c,b).a()})};
	k.I=function(){L("getMetadata",[],arguments);X(this,"getMetadata");var a=this;return pb(this.b).then(function(b){var c=Fb(a.b,a.a,vb());return I(a.b,c,b).a()})};k.aa=function(a){L("updateMetadata",[new M(yb,void 0)],arguments);X(this,"updateMetadata");var b=this;return pb(this.b).then(function(c){var d=b.b,e=b.a,f=a,g=vb(),h=wa(e),h=q+"/v0"+h,f=xb(f,g),d=new u(h,"PATCH",Db(d,g),d.c);d.headers={"Content-Type":"application/json; charset=utf-8"};d.body=f;d.a=Eb(e);return I(b.b,d,c).a()})};
	k.Y=function(){L("getDownloadURL",[],arguments);X(this,"getDownloadURL");return this.I().then(function(a){a=a.downloadURLs[0];if(w(a))return a;throw new r("no-download-url","The given file does not have any download URLs.");})};var X=function(a,b){if(""===a.a.path)throw new r("invalid-root-operation","The operation '"+b+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').");};var Y=function(a,b){this.a=new ob(a,function(a,b){return new W(a,b)},Ya,this,w(b)?b:new Oa);this.b=a;this.c=new Zb(this)};k=Y.prototype;k.ba=function(a){L("ref",[N(function(a){if(/^[A-Za-z]+:\/\//.test(a))throw"Expected child path but got a URL, use refFromURL instead.";},!0)],arguments);var b=new W(this.a);return n(a)?b.H(a):b};
	k.ca=function(a){L("refFromURL",[N(function(a){if(!/^[A-Za-z]+:\/\//.test(a))throw"Expected full URL but got a child path, use ref instead.";try{xa(a)}catch(c){throw"Expected valid full URL but got an invalid one.";}},!1)],arguments);return new W(this.a,a)};k.ha=function(){return this.a.b};k.ea=function(a){L("setMaxUploadRetryTime",[Bb()],arguments);this.a.b=a};k.ga=function(){return this.a.c};k.da=function(a){L("setMaxOperationRetryTime",[Bb()],arguments);this.a.c=a};k.T=function(){return this.b};
	k.R=function(){return this.c};var Zb=function(a){this.a=a};Zb.prototype.b=function(){var a=this.a.a;a.f=!0;a.a=null;bb(a.h)};var Z=function(a,b,c){Object.defineProperty(a,b,{get:c})};W.prototype.toString=W.prototype.toString;W.prototype.child=W.prototype.H;W.prototype.put=W.prototype.Z;W.prototype.putString=W.prototype.$;W.prototype["delete"]=W.prototype.X;W.prototype.getMetadata=W.prototype.I;W.prototype.updateMetadata=W.prototype.aa;W.prototype.getDownloadURL=W.prototype.Y;Z(W.prototype,"parent",W.prototype.ka);Z(W.prototype,"root",W.prototype.ma);Z(W.prototype,"bucket",W.prototype.U);Z(W.prototype,"fullPath",W.prototype.fa);
	Z(W.prototype,"name",W.prototype.ja);Z(W.prototype,"storage",W.prototype.oa);Y.prototype.ref=Y.prototype.ba;Y.prototype.refFromURL=Y.prototype.ca;Z(Y.prototype,"maxOperationRetryTime",Y.prototype.ga);Y.prototype.setMaxOperationRetryTime=Y.prototype.da;Z(Y.prototype,"maxUploadRetryTime",Y.prototype.ha);Y.prototype.setMaxUploadRetryTime=Y.prototype.ea;Z(Y.prototype,"app",Y.prototype.T);Z(Y.prototype,"INTERNAL",Y.prototype.R);Zb.prototype["delete"]=Zb.prototype.b;Y.prototype.capi_=function(a){q=a};
	T.prototype.on=T.prototype.M;T.prototype.resume=T.prototype.O;T.prototype.pause=T.prototype.N;T.prototype.cancel=T.prototype.cancel;Z(T.prototype,"snapshot",T.prototype.w);Z(E.prototype,"bytesTransferred",E.prototype.V);Z(E.prototype,"totalBytes",E.prototype.qa);Z(E.prototype,"state",E.prototype.na);Z(E.prototype,"metadata",E.prototype.ia);Z(E.prototype,"downloadURL",E.prototype.W);Z(E.prototype,"task",E.prototype.pa);Z(E.prototype,"ref",E.prototype.la);ma.STATE_CHANGED="state_changed";
	v.RUNNING="running";v.PAUSED="paused";v.SUCCESS="success";v.CANCELED="canceled";v.ERROR="error";A.RAW="raw";A.BASE64="base64";A.BASE64URL="base64url";A.DATA_URL="data_url";(function(){function a(a){return new Y(a)}var b={TaskState:v,TaskEvent:ma,StringFormat:A,Storage:Y,Reference:W};if("undefined"!==typeof firebase)firebase.INTERNAL.registerService("storage",a,b);else throw Error("Cannot install Firebase Storage - be sure to load firebase-app.js first.");})();})();
	module.exports = firebase.storage;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	$(function () {
	    var signIn = __webpack_require__(2)["signIn"];

	    $('#navbar-placeholder').on('click', '#login-button', function () {
	        $('#login-popup').fadeIn();
	    });

	    $(document).mouseup(function (e) {
	        var popup = $('#login-popup');
	        if (popup.is(e.target)) {
	            popup.fadeOut();
	        }
	    });

	    $('body').on('keypress', '#login-popup-inner', function(e) {
	        if (e.which === 13) {
	            signIn($('#email').val(), $('#password').val());
	        }
	    });

	    $('body').on('click', '#sign-in-button', function() {
	        signIn($('#email').val(), $('#password').val());
	    });
	});

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	$(function() {
	    var addListing = __webpack_require__(2)['addListing'];
	    var auth = __webpack_require__(2)['auth'];
	    var itemTitle;
	    var itemDescription;
	    var itemTags;
	    var itemPrice;
	    var itemHub;
	    var userID;
	    var itemImages;

	    var checkBasicItems = function() {
	        var checksPassed = true;
	        userID = auth.currentUser.uid;
	        itemTitle = $("#item-post-title").val();
	        itemDescription = $("#item-post-description").val();

	        itemTags = $('#itemTags').textext()[0].tags()._formData;
	        itemPrice = $("#item-post-price").val();
	        itemImages = [];
	        $('#dropzone').find('img').each(function(index) {
	            itemImages.push($(this).attr('src'));
	        });

	        itemHub = $('#hub-selection').textext()[0].tags()._formData;

	        if (!/^[\w\s\.\,\'\"\!\?\$\#\@\!\%\^\&\*\(\)\-\+\=\/\\]{5,30}$/.test(itemTitle)) {
	            Materialize.toast('Title must be between 5 and 30 characters', 3000, 'rounded');
	            checksPassed = false;
	        } else if (!/^[\w\s\.\,\'\"\!\?\$\#\@\!\%\^\&\*\(\)\-\+\=\/\\]+$/.test(itemDescription) || itemDescription.length < 5) {
	            Materialize.toast('Description can only contain letters and numbers', 3000, 'rounded');
	            checksPassed = false;
	        } else if(!itemPrice.match(/^[0-9]+([.][0-9]{0,2})?$/) || itemPrice < 0.01 || itemPrice > 3000) {
	            Materialize.toast('only enter numbers, and an optional decimal', 3000, 'rounded');
	            checksPassed = false;
	        } else if(itemHub.length < 1 || itemHub.length > 3) {
	            checksPassed = false;
	            Materialize.toast('Please enter up to 3 hubs', 3000, 'rounded');
	        } else if (itemTags.length < 2 || itemTags.length > 5) {
	            Materialize.toast('Please enter 2 to 5 tags', 3000, 'rounded');
	            checksPassed = false;
	        } else if (itemImages.length < 1) {
	            Materialize.toast('Please add at least one image', 3000, 'rounded');
	            checksPassed = false;
	        } else {
	            for (var i = 0; i < itemTags.length; i += 1) {
	                if (!/^[a-zA-Z\-]+$/.test(itemTags[i]) || itemTags[i].length > 15) {
	                    Materialize.toast('tags can only contain letters and hyphens, up to 15 characters', 3000, 'rounded');
	                    checksPassed = false;
	                }
	            }   

	            itemHub.forEach(function(currentHub) {
	                if (!/^[a-zA-Z\-\s]+$/.test(currentHub)) {
	                    Materialize.toast('Hubs can only contain letters, hyphens and spaces', 3000, 'rounded');
	                    checksPassed = false;
	                } 
	            });
	        }

	        return checksPassed;
	    };

	    var addImagesToSlider = function() {
	        var imageCount = ['one', 'two', 'three', 'four'];
	        $('#carousel-wrapper').append($('<div></div>').addClass('carousel carousel-slider'));

	        for (var i = 0; i < itemImages.length; i += 1) {    
	            $('.carousel-slider').append(
	                $('<a></a>').addClass('carousel-item').attr('href', '#' + imageCount[i] + '!').append(
	                    $('<img>').attr('src', itemImages[i])
	                )
	            ); 
	        }
	        $('.carousel.carousel-slider').carousel({full_width: true, indicators: true});
	    };

	    $("#post-preview").click(function () {
	        if (checkBasicItems()) {
	            addImagesToSlider();
	            
	            $('#preview-submit-tab').removeClass('disabled');
	            $('ul.tabs').tabs('select_tab', 'preview-submit');
	            $('#basic-info-tab').addClass('disabled');

	            $('#preview-title').append(itemTitle);
	            $('#preview-price').append(itemPrice);
	            $('#preview-description').append(itemDescription);
	            
	            for (tag of itemTags) {
	                $('#preview-tags').append(
	                    $('<a></a>').attr('href', '#').addClass('hub-card').text(tag)
	                );
	                $('#preview-tags').append(" ");
	            }
	        }
	    });

	    $('#back-to-preview').on('click', function (e) {
	        $('#basic-info-tab').removeClass('disabled');
	        $('ul.tabs').tabs('select_tab', 'basic-info');
	        $('#preview-submit-tab').addClass('disabled');
	        
	        $('#preview-title').empty();
	        $('#preview-price').empty().text("$");
	        $('#preview-description').empty();
	        $('#preview-tags').empty().append(
	            $('<span>').attr('id', 'preview-tag-blurb').text('Tags: ')
	        );
	        $('#carousel-wrapper').empty();
	    });

	    //add listing
	    $("main").on('click', '#submit-post', function (e) {
	        if (itemTitle && itemDescription && itemTags && itemPrice) {
	            addListing(itemTitle, itemDescription, itemTags, itemPrice, itemHub, userID, itemImages);
	            $("#new-post-main").text("Item has been Posted :)");
	        } else {
	            alert("please enter a username and comment");
	        }
	    });

	    var itemTagRef = $('#itemTags');
	    if (itemTagRef.length > 0) {
	        itemTagRef.textext({plugins : 'tags autocomplete'})
	            .bind('getSuggestions', function(e, data){
	                var list = [
	                        'Table',
	                        'Desk',
	                        'Computer',
	                        'Electronics',
	                        'iPhone',
	                        'Cell Phone',
	                        'Apple',
	                        'Macbook',
	                        'Chair',
	                        'Leather',
	                        'Clothing',
	                        'Bedroom',
	                        'Bathroom',
	                        'Couch',
	                        'Kitchen',
	                        'Living Room',
	                        'Dinner Table'
	                    ],
	                    textext = $(e.target).textext()[0],
	                    query = (data ? data.query : '') || '';

	                $(this).trigger('setSuggestions',{
	                    result : textext.itemManager().filter(list, query) }
	                );
	        });
	    }

	    var hubRef = $('#hub-selection');
	    if (hubRef.length > 0) {
	        hubRef.textext({plugins : 'tags autocomplete'})
	            .bind('getSuggestions', function(e, data){
	                var list = [
	                        'Loyola Marymount University',
	                        'UCLA',
	                        'l',
	                        'la',
	                        'lalala'
	                    ],
	                    textext = $(e.target).textext()[0],
	                    query = (data ? data.query : '') || '';

	                $(this).trigger('setSuggestions',{
	                    result : textext.itemManager().filter(list, query) }
	                );
	        });
	    }


	    /**
	        drophub to add images by clicking
	        or by dragging and dropping
	    **/
	    var reader;
	    var drop;

	    $('#dropMain, .drop').on({
	        'click': function(e) {
	            $('#fileBox').click();
	            drop = this;
	            reader = new FileReader();
	        },
	        'dragover dragenter': function(e) {
	            e.preventDefault();
	            e.stopPropagation();
	        },
	        'drop': function(e) {
	            var dropArea = this;
	            var dataTransfer =  e.originalEvent.dataTransfer;
	            if (dataTransfer && dataTransfer.files.length) {
	                e.preventDefault();
	                e.stopPropagation();
	                $.each(dataTransfer.files, function(i, file) { 
	                    reader = new FileReader();
	                    reader.onload = $.proxy(function(file, $fileList, event) {
	                        var img = file.type.match('image.*') ? $("<img>").attr('src', event.target.result) : "";
	                        $fileList.empty().append(img);
	                    }, this, file, $(dropArea));
	                    reader.readAsDataURL(file);
	                });
	            }
	        }
	    });

	    $("#fileBox").change(function() {
	        var fileExtension = ['jpeg', 'jpg', 'png'];
	        if ($.inArray($(this).val().split('.').pop().toLowerCase(), fileExtension) == -1) {
	            Materialize.toast('Only formats are allowed : ' + fileExtension.join(', '), 3000, 'rounded');

	        } else if (this.files && this.files[0]) {
	            reader.onload = function (e) {
	                $(drop).empty().append($("<img>").attr("src", reader.result));
	                $(drop).css('background-color', '#fff');
	            };
	            reader.readAsDataURL(this.files[0]);
	        }
	    });

	    $('#show-hub-link').on('click', function () {
	        $('#hub-popup').fadeIn();
	    });

	    $(document).mouseup(function (e) {
	        var popup = $('#hub-popup');
	        if (popup.is(e.target)) {
	            popup.fadeOut();
	        }
	    });

	    $('#submit-hub').on('click', function() {
	        let hubs = $('#hub-selection').textext()[0].tags()._formData;
	        
	        if (hubs.length > 0 ) {
	            $("#current-hubs-signed-in").empty();
	            for (var i = 0; i < hubs.length; i += 1) {
	                $('#current-hubs-signed-in').append(
	                    $('<span>').addClass('hub-card z-depth-1').append(hubs[i])
	                    
	                );
	                $("#current-hubs-signed-in").append(" ");
	            }
	            $('#hub-popup').fadeOut();
	        }
	    });

	    $('#cancel-hub').on('click', function() {
	        $('#hub-popup').fadeOut();
	    });
	});

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	$(function() {
	    var getListings = __webpack_require__(2)['getListings'];
	    var getFavorites = __webpack_require__(2)['getFavorites'];
	    var wNumb = __webpack_require__(10);
	    var auth = __webpack_require__(2)["auth"];
	    var itemImagesRef = __webpack_require__(2)["itemImagesRef"];
	    var addFavoriteToProfile = __webpack_require__(2)['addFavoriteToProfile'];
	    var removeFavorite = __webpack_require__(2)['removeFavorite'];
	    var getFavoriteObjects = __webpack_require__(2)['getFavoriteObjects'];
	    var getImage = __webpack_require__(2)['getImage'];


	    var favoriteTemplate = $('#favorite-template');
	    var showFavoritesInSidebar = function(favorites) {
	        
	        var str = $('#favorite-template').text();
	        var compiled = _.template(str);

	        $('#favorite-holder').empty();
	        $('#favorite-holder').append(compiled({favorites: favorites}));

	        for (var i = 0; i < favorites.length; i += 1) {
	            (function (x) {
	                getImage(favorites[x]['id'] + '/imageOne', function(url) {
	                    tagToAdd = ".favorite-image img:eq(" + x  + " )";
	                    $(tagToAdd).attr({src: url});
	                });
	            })(i);
	        }
	    };    


	    auth.onAuthStateChanged(function(user) {
	        if (user && $(favoriteTemplate).length > 0) {
	            getFavoriteObjects(showFavoritesInSidebar);
	            $("#find-favorite-logged-in").css('display', 'block');
	            $("#find-favorite-logged-out").css('display', 'none');


	            // favorite icon highlight/changes
	            $('body').on('mouseenter', '.find-result-favorite-image', function() {
	                $(this).attr('src', '../media/ic_heart_hover.png');
	                $(this).css('opacity', 1);
	            }).on('mouseout', '.find-result-favorite-image', function() {
	                if (!this.favorited) {
	                    $(this).attr('src', '../media/ic_heart.png');
	                    $(this).css('opacity', '0.3');
	                }
	            }).on('click', '.find-result-favorite-image', function() {
	                this.favorited = this.favorited || false;
	                if (!this.favorited) {
	                    $(this).attr('src', '../media/ic_heart_hover.png');
	                    addFavoriteToProfile(auth.currentUser.uid, $(this).attr('uid'));
	                    getFavoriteObjects(showFavoritesInSidebar);

	                } else {
	                    $(this).attr('src', '../media/ic_heart.png');
	                    removeFavorite($(this).attr('uid'));
	                    getFavoriteObjects(showFavoritesInSidebar);
	                }
	                this.favorited = !this.favorited;
	            });            
	        } else {
	            $("#find-favorite-logged-in").css('display', 'none');
	            $("#find-favorite-logged-out").css('display', 'block');
	        }
	    });    

	    var slider = $("#search-slider");
	    if (slider.length > 0) {
	        
	        noUiSlider.create(slider[0], {
	            start: [1, 500],
	            connect: true,
	            step: 1,
	            tooltips: true,
	            format: wNumb({
	                decimals: 0,
	                thousand: ',',
	                prefix: '$',
	            }),
	            range: {
	                'min': 1,
	                'max': 3000
	            }
	        });
	    }

	    var showFavoritesInSearches = function(currentFavorites) {
	        $('.find-result-favorite-image').each(function() {
	            var  currentImageID = $(this).attr('uid');
	            if(currentFavorites && currentFavorites[currentImageID]) {
	                $(this).attr('src', '../media/ic_heart_hover.png');
	                $(this).css('opacity', 1);
	                this.favorited = true;

	            }

	        });
	    };


	    var newSearch = function(currentItems) {
	        $("#find-content").empty();
	        var imagePaths = [];
	        
	        for (var item in currentItems) {
	            var currentItem = currentItems[item];
	            var itemID = currentItem['id'];
	            imagePaths.push(itemID);
	        
	            $("#find-content").append(
	                $("<div></div>").addClass("col l4 m4 s12").append(
	                    $("<div></div>").addClass("card find-result hoverable").append(
	                        $("<div></div>").addClass("find-result-favorite").append(
	                            $("<img/>").addClass("find-result-favorite-image").attr({
	                                src: "../media/ic_heart.png",
	                                alt: "heart",
	                                uid: itemID
	                            })
	                        )
	                    ).append(
	                        $("<div></div>").addClass("find-result-price").text(
	                            "$" + currentItem["price"])).append(
	                        $("<div></div>").addClass("card-image waves-effect waves-block waves-light").append(
	                            $("<img/>").addClass("activator").attr({
	                                src: ''
	                            })
	                        )
	                    ).append(
	                        $("<div></div>").addClass("card-content").append(
	                            $("<span></span>").addClass("card-title activator grey-text text-darken-4").text(
	                                    currentItem["title"]
	                            ).append(
	                                $("<i></i>").addClass("material-icons right").text("more_vert")
	                            )
	                        ).append(
	                            $("<p></p>").append(
	                                $("<a></a>").attr({
	                                    href: "#"
	                                }).text(
	                                    "view item"
	                                )
	                            )
	                        )
	                    ).append(
	                        $("<div></div>").addClass("card-reveal").append(
	                            $("<span></span>").addClass("card-title grey-text text-darken-4").text(
	                                "Description"
	                            ).append(
	                                $("<i></i>").addClass("material-icons right").text(
	                                    "close"
	                                )
	                            ).append(
	                                $("<p></p>").text(
	                                    currentItem["description"]
	                                )
	                            )
	                        )
	                    )
	                )
	            );
	        }

	        getFavorites(showFavoritesInSearches);

	        for (var i = 0; i < imagePaths.length; i += 1) {
	            (function (x) {
	                getImage(imagePaths[x] + '/imageOne', function(url) {
	                    tagToAdd = "img.activator:eq(" + x  + " )";
	                    $(tagToAdd).attr({src: url});
	                });
	            })(i);
	        }

	    };

	    $('input.autocomplete').autocomplete({
	        data: {
	            "Apple": null,
	            "Microsoft": null,
	            "Google": 'http://placehold.it/250x250'
	        }
	    });

	    $("#find-search-button").click(function () {
	        var query = "key=";
	        var keywords = $("#item-post-title").val();
	        var tags = $("#item-post-tags").val();
	        
	        query += keywords === "" ? "none" : "" + keywords;
	        location.hash = query;
	        getListings(newSearch);
	    });




	});

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (factory) {

	    if ( true ) {

	        // AMD. Register as an anonymous module.
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

	    } else if ( typeof exports === 'object' ) {

	        // Node/CommonJS
	        module.exports = factory();

	    } else {

	        // Browser globals
	        window.wNumb = factory();
	    }

	}(function(){

		'use strict';

	var
	/** @const */ FormatOptions = [
		'decimals',
		'thousand',
		'mark',
		'prefix',
		'postfix',
		'encoder',
		'decoder',
		'negativeBefore',
		'negative',
		'edit',
		'undo'
	];

	// General

		// Reverse a string
		function strReverse ( a ) {
			return a.split('').reverse().join('');
		}

		// Check if a string starts with a specified prefix.
		function strStartsWith ( input, match ) {
			return input.substring(0, match.length) === match;
		}

		// Check is a string ends in a specified postfix.
		function strEndsWith ( input, match ) {
			return input.slice(-1 * match.length) === match;
		}

		// Throw an error if formatting options are incompatible.
		function throwEqualError( F, a, b ) {
			if ( (F[a] || F[b]) && (F[a] === F[b]) ) {
				throw new Error(a);
			}
		}

		// Check if a number is finite and not NaN
		function isValidNumber ( input ) {
			return typeof input === 'number' && isFinite( input );
		}

		// Provide rounding-accurate toFixed method.
		function toFixed ( value, decimals ) {
			var scale = Math.pow(10, decimals);
			return ( Math.round(value * scale) / scale).toFixed( decimals );
		}


	// Formatting

		// Accept a number as input, output formatted string.
		function formatTo ( decimals, thousand, mark, prefix, postfix, encoder, decoder, negativeBefore, negative, edit, undo, input ) {

			var originalInput = input, inputIsNegative, inputPieces, inputBase, inputDecimals = '', output = '';

			// Apply user encoder to the input.
			// Expected outcome: number.
			if ( encoder ) {
				input = encoder(input);
			}

			// Stop if no valid number was provided, the number is infinite or NaN.
			if ( !isValidNumber(input) ) {
				return false;
			}

			// Rounding away decimals might cause a value of -0
			// when using very small ranges. Remove those cases.
			if ( decimals !== false && parseFloat(input.toFixed(decimals)) === 0 ) {
				input = 0;
			}

			// Formatting is done on absolute numbers,
			// decorated by an optional negative symbol.
			if ( input < 0 ) {
				inputIsNegative = true;
				input = Math.abs(input);
			}

			// Reduce the number of decimals to the specified option.
			if ( decimals !== false ) {
				input = toFixed( input, decimals );
			}

			// Transform the number into a string, so it can be split.
			input = input.toString();

			// Break the number on the decimal separator.
			if ( input.indexOf('.') !== -1 ) {
				inputPieces = input.split('.');

				inputBase = inputPieces[0];

				if ( mark ) {
					inputDecimals = mark + inputPieces[1];
				}

			} else {

			// If it isn't split, the entire number will do.
				inputBase = input;
			}

			// Group numbers in sets of three.
			if ( thousand ) {
				inputBase = strReverse(inputBase).match(/.{1,3}/g);
				inputBase = strReverse(inputBase.join( strReverse( thousand ) ));
			}

			// If the number is negative, prefix with negation symbol.
			if ( inputIsNegative && negativeBefore ) {
				output += negativeBefore;
			}

			// Prefix the number
			if ( prefix ) {
				output += prefix;
			}

			// Normal negative option comes after the prefix. Defaults to '-'.
			if ( inputIsNegative && negative ) {
				output += negative;
			}

			// Append the actual number.
			output += inputBase;
			output += inputDecimals;

			// Apply the postfix.
			if ( postfix ) {
				output += postfix;
			}

			// Run the output through a user-specified post-formatter.
			if ( edit ) {
				output = edit ( output, originalInput );
			}

			// All done.
			return output;
		}

		// Accept a sting as input, output decoded number.
		function formatFrom ( decimals, thousand, mark, prefix, postfix, encoder, decoder, negativeBefore, negative, edit, undo, input ) {

			var originalInput = input, inputIsNegative, output = '';

			// User defined pre-decoder. Result must be a non empty string.
			if ( undo ) {
				input = undo(input);
			}

			// Test the input. Can't be empty.
			if ( !input || typeof input !== 'string' ) {
				return false;
			}

			// If the string starts with the negativeBefore value: remove it.
			// Remember is was there, the number is negative.
			if ( negativeBefore && strStartsWith(input, negativeBefore) ) {
				input = input.replace(negativeBefore, '');
				inputIsNegative = true;
			}

			// Repeat the same procedure for the prefix.
			if ( prefix && strStartsWith(input, prefix) ) {
				input = input.replace(prefix, '');
			}

			// And again for negative.
			if ( negative && strStartsWith(input, negative) ) {
				input = input.replace(negative, '');
				inputIsNegative = true;
			}

			// Remove the postfix.
			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice
			if ( postfix && strEndsWith(input, postfix) ) {
				input = input.slice(0, -1 * postfix.length);
			}

			// Remove the thousand grouping.
			if ( thousand ) {
				input = input.split(thousand).join('');
			}

			// Set the decimal separator back to period.
			if ( mark ) {
				input = input.replace(mark, '.');
			}

			// Prepend the negative symbol.
			if ( inputIsNegative ) {
				output += '-';
			}

			// Add the number
			output += input;

			// Trim all non-numeric characters (allow '.' and '-');
			output = output.replace(/[^0-9\.\-.]/g, '');

			// The value contains no parse-able number.
			if ( output === '' ) {
				return false;
			}

			// Covert to number.
			output = Number(output);

			// Run the user-specified post-decoder.
			if ( decoder ) {
				output = decoder(output);
			}

			// Check is the output is valid, otherwise: return false.
			if ( !isValidNumber(output) ) {
				return false;
			}

			return output;
		}


	// Framework

		// Validate formatting options
		function validate ( inputOptions ) {

			var i, optionName, optionValue,
				filteredOptions = {};

			for ( i = 0; i < FormatOptions.length; i+=1 ) {

				optionName = FormatOptions[i];
				optionValue = inputOptions[optionName];

				if ( optionValue === undefined ) {

					// Only default if negativeBefore isn't set.
					if ( optionName === 'negative' && !filteredOptions.negativeBefore ) {
						filteredOptions[optionName] = '-';
					// Don't set a default for mark when 'thousand' is set.
					} else if ( optionName === 'mark' && filteredOptions.thousand !== '.' ) {
						filteredOptions[optionName] = '.';
					} else {
						filteredOptions[optionName] = false;
					}

				// Floating points in JS are stable up to 7 decimals.
				} else if ( optionName === 'decimals' ) {
					if ( optionValue >= 0 && optionValue < 8 ) {
						filteredOptions[optionName] = optionValue;
					} else {
						throw new Error(optionName);
					}

				// These options, when provided, must be functions.
				} else if ( optionName === 'encoder' || optionName === 'decoder' || optionName === 'edit' || optionName === 'undo' ) {
					if ( typeof optionValue === 'function' ) {
						filteredOptions[optionName] = optionValue;
					} else {
						throw new Error(optionName);
					}

				// Other options are strings.
				} else {

					if ( typeof optionValue === 'string' ) {
						filteredOptions[optionName] = optionValue;
					} else {
						throw new Error(optionName);
					}
				}
			}

			// Some values can't be extracted from a
			// string if certain combinations are present.
			throwEqualError(filteredOptions, 'mark', 'thousand');
			throwEqualError(filteredOptions, 'prefix', 'negative');
			throwEqualError(filteredOptions, 'prefix', 'negativeBefore');

			return filteredOptions;
		}

		// Pass all options as function arguments
		function passAll ( options, method, input ) {
			var i, args = [];

			// Add all options in order of FormatOptions
			for ( i = 0; i < FormatOptions.length; i+=1 ) {
				args.push(options[FormatOptions[i]]);
			}

			// Append the input, then call the method, presenting all
			// options as arguments.
			args.push(input);
			return method.apply('', args);
		}

		/** @constructor */
		function wNumb ( options ) {

			if ( !(this instanceof wNumb) ) {
				return new wNumb ( options );
			}

			if ( typeof options !== "object" ) {
				return;
			}

			options = validate(options);

			// Call 'formatTo' with proper arguments.
			this.to = function ( input ) {
				return passAll(options, formatTo, input);
			};

			// Call 'formatFrom' with proper arguments.
			this.from = function ( input ) {
				return passAll(options, formatFrom, input);
			};
		}

		/** @export */
		return wNumb;

	}));


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	$(function() {
	    var createAccount = __webpack_require__(2)["createAccount"];

	    $('#navbar-placeholder').on('click', '#sign-up-button', function () {
	        $('#sign-up-popup1').fadeIn();
	    });

	    $(document).mouseup(function (e) {
	        var popup = $('#sign-up-popup1');
	        if (popup.is(e.target)) {
	            popup.fadeOut();
	        }
	    });

	    $(document).mouseup(function (e) {
	        var popup = $('#sign-up-popup2');
	        if (popup.is(e.target)) {
	            popup.fadeOut();
	        }
	    });

	    var next = function () {
	        $('#sign-up-popup1').fadeOut();
	        $('#sign-up-popup2').fadeIn();
	    };

	    var firstNameValid = false;
	    var lastNameValid = false;
	    var usernameValid = false;
	    var hubValid = false;
	    var emailValid = false;
	    var passwordValid = false;


	    $('body').on('click', '#create-account-next-button', function() {
	        if (checkNames()) {
	            next();
	        } else {
	            if (!firstNameValid) {
	                $('#first-name-unavailable').show();
	            }
	            if (!lastNameValid) {
	                $('#last-name-unavailable').show();
	            }
	            if (!usernameValid) {
	                $('#username-unavailable').show();
	            }
	        }
	    });    

	    $('body').on('click', '#create-account-button', function() {
	        if (checkInput()) {
	            createAccount();
	        } else {
	            if (!hubValid) {
	                $('#hub-unavailable').show();
	            }
	            if (!emailValid) {
	                $('#email-unavailable').show();
	            }
	            if (!passwordValid) {
	                $('#password-unavailable').show();
	            }
	        }
	    });    

	    var checkNames = function () {
	        return firstNameValid && lastNameValid && usernameValid;
	    };

	    var checkInput = function () {
	        return firstNameValid && lastNameValid && usernameValid && hubValid && emailValid && usernameValid;
	    };

	    var nameSizeLimit = 1;
	    
	    $('body').on('keyup', '#sign-up-first-name', function() {
	        if ($('#sign-up-first-name').val().length >= nameSizeLimit) {
	            firstNameValid = true;
	            $('#first-name-unavailable').hide();
	            $('#first-name-available').show();
	        } else {
	            firstNameValid = false;
	            $('#first-name-available').hide();
	        }
	    });

	     $('body').on('keyup', '#sign-up-last-name', function() {
	        if ($('#sign-up-last-name').val().length >= nameSizeLimit) {
	            lastNameValid = true;
	            $('#last-name-unavailable').hide();
	            $('#last-name-available').show();
	        } else {
	            lastNameValid = false;
	            $('#last-name-available').hide();
	        }
	    });

	    $('body').on('keyup', '#sign-up-username', function() {
	        if ($('#sign-up-username').val().length >= nameSizeLimit) {
	            usernameValid = true;
	            $('#username-unavailable').hide();
	            $('#username-available').show();
	        } else {
	            usernameValid = false;
	            $('#username-available').hide();
	        }
	    });

	    $('body').on('keyup', '#sign-up-hub', function() {
	        if ($('#sign-up-hub').val().length >= nameSizeLimit) {
	            hubValid = true;
	            $('#hub-unavailable').hide();
	            $('#hub-available').show();
	        } else {
	            hubValid = false;
	            $('#hub-available').hide();
	        }
	    });

	    var emailCheck = new RegExp(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu$/);
	    var passwordSizeLimit = 8; 

	    $('body').on('keyup', '#sign-up-email', function() {
	        if (emailCheck.test($('#sign-up-email').val())) {
	            // var testEmail = firebase.auth().fetchProvidersForEmail($('#sign-up-email').val()).catch(function(error) {
	            //     var errorCode = error.code;
	            //     var errorMessage = error.message;
	            // });
	            // console.log(testEmail);
	            // if (testEmail != 0) {
	                emailValid = true;
	                $('#email-unavailable').hide();
	                $('#email-available').show();
	            //} else {
	            //     emailValid = false;
	            //     $('#email-available').hide();
	            // }
	        } else {
	            emailValid = false;
	            $('#email-available').hide();
	        }
	    });

	    $('body').on('keyup', '#sign-up-password', function() {
	        if ($('#sign-up-password').val().length >= passwordSizeLimit) {
	            passwordValid = true;
	            $('#password-unavailable').hide();
	            $('#password-available').show();
	        } else {
	            passwordValid = false;
	            $('#password-available').hide();
	        }
	    });

	    module.exports = {
	        nameSizeLimit
	    }    

	});

/***/ },
/* 12 */
/***/ function(module, exports) {

	$(function() {
	    $('.carousel.carousel-slider').carousel({full_width: true});
	});

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	$(function () {
	    var auth = __webpack_require__(2)['auth'];
	    var getUserInfo = __webpack_require__(2)['getUserInfo'];
	    var updateUserInfo = __webpack_require__(2)['updateUserInfo'];
	    var nameSizeLimit = __webpack_require__(11)['nameSizeLimit'];
	    var user;
	    var uid;
	    var firebaseUsername;
	    var likedCardList = $('#profile-liked-card-list');
	    var sellingCardList = $('#profile-selling-card-list');
	    var notificationsList = $('#profile-notification-group');
	    var editButton = $('#edit-button');
	    var saveButton = $('#save-button');
	    var firstName = $('#profile-first-name');
	    var lastName = $('#profile-last-name');
	    var username = $('#profile-user-name');
	    var hub = $('#profile-hub-name');
	    var paymentPreference;
	    var emailNotifications = $('#email-notifications');
	    var password = $('#profile-password');
	    var getImage = __webpack_require__(2)["getImage"];
	    var getFavoriteObjects = __webpack_require__(2)['getFavoriteObjects'];



	    var profileLikedItems = $('#profile-liked-items');

	    if ($(profileLikedItems).length > 0) {
	        var showFavoritedItems = function(items) {
	            var imagePaths = []
	            var str = $('#profile-liked-items').text();
	            var compiled = _.template(str);

	            $('#profile-liked-holder').empty();
	            $('#profile-liked-holder').append(compiled({items: items}));


	            for (var item in items) {
	                imagePaths.push(items[item]['id']);
	            }

	            for (var i = 0; i < imagePaths.length; i += 1) {
	                (function (x) {
	                    console.log(imagePaths[x]);
	                    getImage(imagePaths[x] + '/imageOne', function(url) {
	                        tagToAdd = "img.activator:eq(" + x  + " )";
	                        $(tagToAdd).attr({src: url});
	                    });
	                })(i);
	            }

	        };
	    }

	    var loadLikedCardList = function () {
	        likedCardList.empty();
	        for (var i = 0; i < 1; i++) {
	            likedCardList.append([
	                $('<div></div>').addClass('col l4 m4 s12').append(
	                    $('<div></div>').addClass('card hoverable profile-card').append([
	                        $('<div></div>').addClass('profile-favorite').append(
	                            $('<img>').addClass('profile-favorite-image').attr({
	                                src: '../media/ic_heart.png'
	                            })
	                        ),
	                        $('<div></div>').addClass('profile-price').text('$69'),
	                        $('<div></div>').addClass('card-image waves-effect waves-block waves-light').append([
	                            $('<img>').addClass('activator').attr({
	                                src: 'https://d3nevzfk7ii3be.cloudfront.net/igi/DX2OGI5fYDA3jOZ5.medium'
	                            }),
	                        ]),
	                        $('<div></div>').addClass('card-content').append([
	                            $('<span></span>').addClass('card-title activator grey-text text-darken-4').text('Iphone').append(
	                                $('<i></i>').addClass('material-icons right').text('more_vert')
	                            ),

	                            $('<p></p>').append(
	                                $('<a></a>').text('view item').attr({
	                                    href: '#'
	                                })
	                            )
	                        ]),
	                        $('<div></div>').addClass('card-reveal').append([
	                            $('<span></span>').addClass('card-title grey-text text-darken-4').text("Description").append(
	                                $('<i></i>').addClass('material-icons right').text('close')
	                            ),
	                            $('<p></p>').text('This is a test description')
	                        ])
	                    ])
	                )
	            ]);
	        }
	    };

	    var loadSellingCardList = function () {
	        sellingCardList.empty();
	        for (var i = 0; i < 31; i++) {
	            sellingCardList.append([
	                $('<div></div>').addClass('col l4 m4 s12').append(
	                    $('<div></div>').addClass('card hoverable profile-card').append([
	                        $('<div></div>').addClass('profile-favorite').append(
	                            $('<img>').addClass('profile-favorite-image').attr({
	                                src: '../media/ic_heart.png'
	                            })
	                        ),
	                        $('<div></div>').addClass('profile-price').text('$69'),
	                        $('<div></div>').addClass('card-image waves-effect waves-block waves-light').append([
	                            $('<img>').addClass('activator').attr({
	                                src: 'https://d3nevzfk7ii3be.cloudfront.net/igi/DX2OGI5fYDA3jOZ5.medium'
	                            }),
	                        ]),
	                        $('<div></div>').addClass('card-content').append([
	                            $('<span></span>').addClass('card-title activator grey-text text-darken-4').text('Iphone Selling').append(
	                                $('<i></i>').addClass('material-icons right').text('more_vert')
	                            ),

	                            $('<p></p>').append(
	                                $('<a></a>').text('view item').attr({
	                                    href: '#'
	                                })
	                            )
	                        ]),
	                        $('<div></div>').addClass('card-reveal').append([
	                            $('<span></span>').addClass('card-title grey-text text-darken-4').text("Description").append(
	                                $('<i></i>').addClass('material-icons right').text('close')
	                            ),
	                            $('<p></p>').text('This is a test selling description')
	                        ])
	                    ])
	                )
	            ]);
	        }
	    };

	    var loadNotifications = function () {
	        notificationsList.empty();
	        for (var i = 0; i < 21; i++) {
	            notificationsList.append([
	                $('<li></li>').addClass('collection-item').append(
	                    $('<div></div>').append([
	                        $('<div></div>').addClass("notification").text("Sample Notification")
	                    ])
	                )
	            ]);
	        }
	    };

	    var loadSettings = function () {
	        getUserInfo(uid, loadUserInfo);
	    };

	    var loadUserInfo = function (userInfo) {
	        firstName.val(userInfo.firstName);
	        lastName.val(userInfo.lastName);
	        username.val(userInfo.username);
	        firebaseUsername = userInfo.username;
	        hub.val(userInfo.userHub);
	        $('#my-profile').empty().append([
	            $('<img>').addClass('my-profile-hub').attr({
	                src: 'http://admin.lmu.edu/media/admin/parking/mainbanner-parking.jpg'
	            }),
	            $('<img>').addClass('my-profile-picture circle').attr({
	                src: '../media/temp-profile.png'
	            }),
	            $('<span></span>').addClass('my-profile-username').text(firebaseUsername),
	            $('<div></div>').addClass('my-profile-stars').append([
	                $('<i></i>').addClass('material-icons star-1').text('star_rate'),
	                $('<i></i>').addClass('material-icons star-2').text('star_rate'),
	                $('<i></i>').addClass('material-icons star-3').text('star_rate'),
	                $('<i></i>').addClass('material-icons star-4').text('star_rate'),
	                $('<i></i>').addClass('material-icons star-5').text('star_rate')
	            ])
	        ]);
	        for (preference in userInfo.paymentPreferences) {
	            $("select[id$='profile-payment-preference'] option[value=" + userInfo.paymentPreferences[preference] + "]").attr("selected", true);
	        }

	        $('select').material_select();
	    };

	    var checkInput = function (input) {
	        return input.val().length > nameSizeLimit;
	    }

	    var updateSettings = function () {
	        var paymentPreferences = [];
	        for (preference in paymentPreference.val()) {
	            paymentPreferences.push(paymentPreference.val()[preference]);
	        }

	        if (!paymentPreferences.length) {
	            paymentPreferences.push("none");
	        }

	        var updatedInfo = {
	            username: username.val(),
	            firstName: firstName.val(),
	            lastName: lastName.val(),
	            userHub: hub.val(),
	            paymentPreferences: paymentPreferences
	        };
	        $('.my-profile-username').text(username.val());
	        updateUserInfo(uid, updatedInfo);
	    };


	    auth.onAuthStateChanged(function(user) {
	        if (user) {
	            user = auth.currentUser.email;
	            uid = auth.currentUser.uid;
	            if (window.location.pathname === '/profile/profile.html') {
	                $('select').material_select();
	                paymentPreference = $('#profile-payment-preference');
	                loadSettings();
	                loadLikedCardList();
	                getFavoriteObjects(showFavoritedItems);


	            }
	        } else if (!user && window.location.pathname === '/profile/profile.html'){
	            window.location.href = "../index.html";
	        }
	    });

	    $('#selling-tab').click(function () {
	        loadSellingCardList();
	    });

	    $('#liked-tab').click(function () {
	        loadLikedCardList();
	    });

	    $('#notifications-tab').click(function () {
	        loadNotifications();
	    });

	    editButton.click(function () {
	        saveButton.attr("disabled", false);
	        editButton.attr("disabled", true);
	        firstName.attr("disabled", false);
	        lastName.attr("disabled", false);
	        username.attr("disabled", false);
	        hub.attr("disabled", false);
	        paymentPreference.attr("disabled", false);
	        $('select').material_select();
	        emailNotifications.attr("disabled", false);
	        password.attr("disabled", false);
	    });

	    saveButton.click(function () {
	        if (!checkInput(firstName) || !checkInput(lastName) || !checkInput(username || !checkInput(hub))) {
	            Materialize.toast('First Name, Last Name, Username, and Hub must all be at least 1 character.', 3000, 'rounded');
	            return;
	        }

	        editButton.attr("disabled", false);
	        saveButton.attr("disabled", true);
	        firstName.attr("disabled", true);
	        lastName.attr("disabled", true);
	        username.attr("disabled", true);
	        hub.attr("disabled", true);
	        paymentPreference.attr("disabled", true);
	        $('select').material_select();
	        emailNotifications.attr("disabled", true);
	        password.attr("disabled", true);
	        updateSettings();
	    });

	});

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	$(function () {
	    $('.parallax').parallax();
	    var getRecentItemsInHub = __webpack_require__(2)['getRecentItemsInHub'];
	    var itemImagesRef = __webpack_require__(2)["itemImagesRef"];
	    var auth = __webpack_require__(2)["auth"];
	    var getImage = __webpack_require__(2)["getImage"];
	    var populateSuggestionsInHub = __webpack_require__(2)['populateSuggestionsInHub'];



	    var mostRecentItems = $('#hub-most-recent');
	    var showMostRecentItems = function(items) {
	        var imagePaths = []
	        var str = $('#hub-most-recent').text();
	        var compiled = _.template(str);

	        $('#hub-recent-holder').empty();
	        $('#hub-recent-holder').prepend(compiled({items: items}));


	        for (var item in items) {
	            imagePaths.push(items[item]['id']);
	        }

	        for (var i = 0; i < imagePaths.length; i += 1) {
	            (function (x) {
	                getImage(imagePaths[x] + '/imageOne', function(url) {
	                    tagToAdd = ".hub-recent img:eq(" + x  + " )";
	                    $(tagToAdd).attr({src: url});
	                });
	            })(i);
	        }

	    };

	    auth.onAuthStateChanged(function(user) {
	        if (user && $(mostRecentItems).length > 0) {
	            getRecentItemsInHub('Loyola Marymount University', showMostRecentItems);
	            populateSuggestionsInHub('Loyola Marymount University', auth.currentUser.uid);
	        } else if (!user && $(mostRecentItems).length > 0) {
	            window.location.href = "../index.html";

	        }
	    });    
	    

	});

/***/ }
/******/ ]);
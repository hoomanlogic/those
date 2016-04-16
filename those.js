/**
 * Syntactic Sugar for arrays without messing up the array prototype
 */

var extend = function (array) {
   // extend array with collection-based functions
   array.has = has;
   array.hasAll = hasAll;
   array.hasAny = hasAny;
   array.hasOnly = hasOnly;
   array.last = last;
   array.top = top;
   array.order = order;
   array.like = like;
   array.notLike = notLike;
   array.first = first;
   array.forFirst = forFirst;
   array.flip = flip;
   array.flick = flick;
   array.pluck = pluck;
   array.toggle = toggle;
   array.copy = copy;
   array.min = min;
   array.max = max;

   return array;
};

var has = function (value, prop) {
   var i;
   if (typeof prop !== 'undefined' && prop !== null) {
      for (i = 0; i < this.length; i++) {
         if (this[i][prop] === value) {
            return true;
         }
      }
   }
   else {
      for (i = 0; i < this.length; i++) {
         if (this[i] === value) {
            return true;
         }
      }
   }
   return false;
};

var hasAll = function (matchArray) {
   for (var i = 0; i < matchArray.length; i++) {
      var matched = false;
      for (var j = 0; j < this.length; j++) {
         if (matchArray[i] === this[j]) {
            matched = true;
         }
      }
      if (!matched) {
         return false;
      }
   }
   return true;
};

var hasAny = function (matchArray) {
   for (var i = 0; i < matchArray.length; i++) {
      for (var j = 0; j < this.length; j++) {
         if (matchArray[i] === this[j]) {
            return true;
         }
      }
   }
   return false;
};

var hasOnly = function (matchArray) {
   // Must be the same length
   if (this.length !== matchArray.length) {
      return false;
   }

   for (var i = 0; i < matchArray.length; i++) {
      var matched = false;
      for (var j = 0; j < this.length; j++) {
         if (matchArray[i] === this[j]) {
            matched = true;
         }
      }
      if (!matched) {
         return false;
      }
   }

   // All elements matched
   return true;
};

var isArray = function (arg) {
   return Object.prototype.toString.call(arg) === '[object Array]';
};

// var isObject = function (arg) {
//     return Object.prototype.toString.call(arg) === '[object Object]';
// };

var notLike = function (matchObj) {
   var matches = [];
   for (var i = 0; i < this.length; i++) {
      // We assume it matches until we prove it doesn't
      var isLike = true;
      if (typeof matchObj === 'string') {
         if (this[i] !== matchObj) {
            isLike = false;
         }
      }
      else if (typeof matchObj === 'function') {
         isLike = matchObj(this[i]);
      }
      else {
         for (var matchProp in matchObj) {
            if (matchObj.hasOwnProperty(matchProp)) {
               var t = typeof matchObj[matchProp];
               if (t !== typeof this[i][matchProp]) {
                  isLike = false;
                  break;
               }
               if (isArray(matchObj[matchProp]) && !those(matchObj[matchProp]).hasOnly(this[i][matchProp])) {
                  isLike = false;
                  break;
               }
               else if (String(matchObj[matchProp]) !== String(this[i][matchProp])) {
                  isLike = false;
                  break;
               }
            }
         }
      }
      // If not all the match props matched, then add to result
      if (!isLike) {
         matches.push(this[i]);
      }
   }
   // Return new array of matched items
   return extend(matches);
};

var like = function (matchObj) {
   var matches = [];
   for (var i = 0; i < this.length; i++) {
      // We assume it matches until we prove it doesn't
      var isLike = true;
      if (typeof matchObj === 'string') {
         if (this[i] !== matchObj) {
            isLike = false;
         }
      }
      else if (typeof matchObj === 'function') {
         isLike = matchObj(this[i]);
      }
      else {
         for (var matchProp in matchObj) {
            if (matchObj.hasOwnProperty(matchProp)) {
               var t = typeof matchObj[matchProp];
               if (t !== typeof this[i][matchProp]) {
                  isLike = false;
                  break;
               }
               if (isArray(matchObj[matchProp]) && !those(matchObj[matchProp]).hasOnly(this[i][matchProp])) {
                  isLike = false;
                  break;
               }
               else if (String(matchObj[matchProp]) !== String(this[i][matchProp])) {
                  isLike = false;
                  break;
               }
            }
         }
      }
      // If all match props matched, then add to result
      if (isLike) {
         matches.push(this[i]);
      }
   }
   // Return new array of matched items
   return extend(matches);
};

var top = function (num) {
   return extend(this.slice(0, num));
};

var last = function (num) {
   return extend(this.slice(-(num)));
};

var copy = function () {
   // TODO: is one method faster than the other
   return this.slice();
   // return [].concat(this);
};

var max = function (prop) {
   var result = null;
   for (var i = 0; i < this.length; i++) {
      if (result === null || this[i][prop] > result) {
         result = this[i][prop];
      }
   }
   return result;
};

var min = function (prop) {
   var result = null;
   for (var i = 0; i < this.length; i++) {
      if (result === null || this[i][prop] < result) {
         result = this[i][prop];
      }
   }
   return result;
};

var order = function (prop) {

   this.sort(function (a, b) {
      var am, bm;

      if (typeof prop === 'function') {
         am = prop(a);
         bm = prop(b);
      }
      else if (prop) {
         if (typeof a[prop] === 'string' && typeof b[prop] === 'string') {
            am = a[prop].toLowerCase();
            bm = b[prop].toLowerCase();
         }
         else {
            am = a[prop];
            bm = b[prop];
         }
      }
      else if (typeof a === 'string' && typeof b === 'string') {
         am = a.toLowerCase();
         bm = b.toLowerCase();
      }
      else {
         am = a;
         bm = b;
      }

      return am > bm ? 1 : (am < bm ? -1 : 0);
   });
   return this;
};

var flip = function () {
   this.reverse();
   return this;
};

var forFirst = function (matchObj, foundCallback, notFoundCallback) {
   var item = this.first(matchObj);
   if (item) {
      foundCallback(item);
   }
   else if (notFoundCallback) {
      notFoundCallback(matchObj);
   }
};

var first = function (matchObj) {
   // top 1
   if (matchObj === undefined) {
      if (this.length === 0) {
         return null;
      }
      else {
         return this[0];
      }
   }

   for (var i = 0; i < this.length; i++) {
      // We assume it matches until we prove it doesn't
      var isLike = true;
      if (typeof matchObj === 'string') {
         if (this[i] !== matchObj) {
            isLike = false;
         }
      }
      else if (typeof matchObj === 'function') {
         isLike = matchObj(this[i]);
      }
      else {
         for (var matchProp in matchObj) {
            if (matchObj.hasOwnProperty(matchProp)) {
               var t = typeof matchObj[matchProp];
               if (t !== typeof this[i][matchProp]) {
                  isLike = false;
                  break;
               }
               if (isArray(matchObj[matchProp]) && !those(matchObj[matchProp]).hasOnly(this[i][matchProp])) {
                  isLike = false;
                  break;
               }
               else if (String(matchObj[matchProp]) !== String(this[i][matchProp])) {
                  isLike = false;
                  break;
               }
            }
         }
      }
      // If all match props matched, then add to result
      if (isLike) {
         return this[i];
      }
   }
   return null;
};

var toggle = function (obj) {
   if (this.first(obj)) {
      this.flick(obj);
   }
   else {
      this.push(obj);
   }
};

var flick = function (matchObj, onFlick) {
   var flicked;
   // top 1
   if (matchObj === undefined && this.length !== 0) {
      flicked = this.splice(0, 1);
      if (onFlick) {
         onFlick(flicked);
      }
      return this;
   }

   for (var i = 0; i < this.length; i++) {
      // We assume it matches until we prove it doesn't
      var isLike = true;
      if (typeof matchObj === 'string') {
         if (this[i] !== matchObj) {
            isLike = false;
         }
      }
      else if (typeof matchObj === 'function') {
         isLike = matchObj(this[i]);
      }
      else {
         for (var matchProp in matchObj) { // eslint-disable-line one-var
            if (matchObj.hasOwnProperty(matchProp)) {
               var t = typeof matchObj[matchProp];
               if (t !== typeof this[i][matchProp]) {
                  isLike = false;
                  break;
               }
               if (isArray(matchObj[matchProp]) && !those(matchObj[matchProp]).hasOnly(this[i][matchProp])) {
                  isLike = false;
                  break;
               }
               else if (String(matchObj[matchProp]) !== String(this[i][matchProp])) {
                  isLike = false;
                  break;
               }
            }
         }
      }
      // If all match props matched, then add to result
      if (isLike) {
         flicked = this.splice(i, 1);
         if (onFlick) {
            onFlick(flicked);
         }
         return this;
      }
   }

   // in-place array operation always returns self
   return this;
};

var pluck = function (prop) {
   var plucked = [];
   for (var i = 0; i < this.length; i++) {
      plucked.push(this[i][prop]);
   }
   return extend(plucked);
};

var those = function (array) {
   return extend(array);
};

module.exports = those;

/**
 * @module      those
 * @description Library for semantically querying an array without 
 *              hijacking Array.prototype or modifying the source array.
 * @example     var people = [{ name: 'Alayna', age: 9 }, { name: 'Braylon', age: 6 }, { name: 'David', age: 35}];
 *              those(people).first({ name: 'Braylon'});   // get the first person with the name 'Braylon'
 *              var youngest = those(people).order('age').first(); // get a reference to the youngest person in the array
 *              var oldest; those(people).order('age').flip().flick(undefined, function (flicked) { oldest = flicked }); // pop the oldest person out of the array and assign to variable
 *              those(people).has(youngest) // true
 *              those(people).has(oldest) // false
 * @future      Object Queries: { name__starts_with: 'D', age__between: [18, 99]}
 *              prop path: support 'propName.nestedPropName.yetAnotherPropName'
 */

/**
 * Extend a copy of an array, or array-ize an object by keys, with helpful functions.
 * Array properties of the same name take precedence over extensions.
 */
var extend = function (obj) {
    if (getType(obj) === 'array') {
        return Object.assign(obj.slice(), extensions, obj);
    }
    else {
        var objArray = Object.keys(obj).map(function (key) {
            return obj[key];
        });
        return Object.assign(objArray.slice(), extensions, objArray);
    }
};

var extensions = {

    /*************************************************************
     *  MATCH ARRAY PREDICATE FUNCTIONS
     *************************************************************/
    hasAll: function (matchArray) {
        for (var i = 0; i < matchArray.length; i++) {
            var matched = false;
            for (var j = 0; j < this.length; j++) {
                if (areAlike(this[j], matchArray[i])) {
                    matched = true;
                }
            }
            if (!matched) {
                return false;
            }
        }
        return true;
    },
    
    hasAny: function (matchArray) {
        for (var i = 0; i < matchArray.length; i++) {
            for (var j = 0; j < this.length; j++) {
                if (areAlike(this[j], matchArray[i])) {
                    return true;
                }
            }
        }
        return false;
    },

    hasOnly: function (matchArray) {
        // Must be the same length (quick check)
        if (this.length !== matchArray.length) {
            return false;
        }

        for (var i = 0; i < matchArray.length; i++) {
            var matched = false;
            for (var j = 0; j < this.length; j++) {
                if (areAlike(this[j], matchArray[i])) {
                    matched = true;
                }
            }
            if (!matched) {
                return false;
            }
        }

        // All elements matched
        return true;
    },

    /*************************************************************
     *  MATCH ARGUMENT PREDICATE FUNCTIONS
     *************************************************************/
    has: function (matchArg) {
        var i;
        for (i = 0; i < this.length; i++) {
            if (areAlike(this[i], matchArg)) {
                return true;
            }
        }
        return false;
    },

    /*************************************************************
     *  MATCH ARGUMENT FILTERING
     *************************************************************/
    /**
     * Remove the first item that matches, or the first item if no matchArg parameter is given.
     * @param {function, object, string, undefined} matchArg - The match parameters. If it is a function,
     * it will be passed each item in the array and expects a boolean return value indicating a positive match.
     * If it is an object, every property and value supplied in the object must exist in the array item to return a positive match.
     * If it is a string, a literal string comparison is done of the array item and the match string.
     * If it is undefined, then the first item in the array is removed.
     * @return {array} Returns 'this' for functional chaining.
     */
    flick: function (matchArg, onFlick) {
        var flicked;
        // top 1
        if (matchArg === undefined && this.length !== 0) {
            flicked = this.splice(0, 1);
            if (onFlick) {
                onFlick(flicked);
            }
            return this;
        }

        for (var i = 0; i < this.length; i++) {
            // If all match props matched, then add to result
            if (areAlike(this[i], matchArg)) {
                flicked = this.splice(i, 1);
                if (onFlick) {
                    onFlick(flicked);
                }
                return this;
            }
        }

        // in-place array operation always returns self
        return this;
    },
    
    like: function (matchArg) {
        var matches = [];
        
        for (var i = 0; i < this.length; i++) {
            // If alike, then add to result
            if (areAlike(this[i], matchArg)) {
                matches.push(this[i]);
            }
        }
        
        // Return new array of matched items
        return extend(matches);
    },
    
    notLike: function (matchArg) {
        var matches = [];
        
        for (var i = 0; i < this.length; i++) {
            // If not alike, add to result
            if (!areAlike(this[i], matchArg)) {
                matches.push(this[i]);
            }
        }
        
        // Return new array of matched items
        return extend(matches);
    },
    
    /**
     * Add an item to the array if it does not exist, and remove it from the array if it does exist.
     * @param {function, object, string} item - The item in the array to be toggled.
     * @return {array} Returns 'this' for functional chaining.
     */
    toggle: function (item) {
        for (var i = 0; i < this.length; i++) {
            if (areAlike(this[i], item)) {
                // exists, remove it
                this.splice(i, 1);
                return this;
            }
        }
        // doesn't exist, add it
        this.push(item);
        return this;
    },

    /*************************************************************
     * MISC ARRAY MANIPULATION
     *************************************************************/
    /**
     * Returns the array in reverse order.
     */
    flip: function () {
        this.reverse();
        return this;
    },

    /**
     * Returns the last num of items in the array, 
     * or all if num is greater than array length.
     */
    last: function (num) {
        return extend(this.slice(-(num)));
    },
    
    /**
     * Returns the array sorted inline by given prop.
     */
    order: function (prop) {

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
    },
    
    /**
     * Returns the first num of items in the array, 
     * or all if num is greater than array length.
     */
    top: function (num) {
        return extend(this.slice(0, num));
    },

    /*************************************************************
     * CALCULATE AND EXTRUDE
     *************************************************************/
    /**
     * Return the first item in the array that matches, or null if no match is found.
     * @param {function, object, string} matchArg - The match parameters. If it is a function,
     * it will be passed each item in the array and expects a boolean return value indicating a positive match.
     * If it is an object, every property and value supplied in the object must exist in the array item to return a positive match.
     * If it is a string, a literal string comparison is done of the array item and the match string.
     */
    first: function (matchArg) {
        // top 1
        if (matchArg === undefined) {
            if (this.length === 0) {
                return null;
            }
            else {
                return this[0];
            }
        }

        for (var i = 0; i < this.length; i++) {
            // If all match props matched, then add to result
            if (areAlike(this[i], matchArg)) {
                return this[i];
            }
        }
        return null;
    },
    
    /**
     * Return an array of values for a given property.
     * @param {string} prop - The property to pluck into a new array.
     */
    pluck: function (prop) {
        var plucked = [];
        for (var i = 0; i < this.length; i++) {
            plucked.push(this[i][prop]);
        }
        return extend(plucked);
    },
    
    max: function (prop) {
        var result = null;
        for (var i = 0; i < this.length; i++) {
            if (result === null || this[i][prop] > result) {
                result = this[i][prop];
            }
        }
        return result;
    },

    min: function (prop) {
        var result = null;
        for (var i = 0; i < this.length; i++) {
            if (result === null || this[i][prop] < result) {
                result = this[i][prop];
            }
        }
        return result;
    },
    
    /*************************************************************
     * SEMANTIC FUNCTIONS
     *************************************************************/
    /**
     * Perform callback only the first match that is found.
     * Optionally include a callback if no match is found.
     * @param {function, object, string} matchArg - The match parameters. If it is a function,
     * it will be passed each item in the array and expects a boolean return value indicating a positive match.
     * If it is an object, every property and value supplied in the object must exist in the array item to return a positive match.
     * If it is a string, a literal string comparison is done of the array item and the match string.
     * @param {function} foundCallback - The callback(item) that will be called if a match is found.
     * @param {function?} notFoundCallback - The callback(item) that will be called if NO match is found. (Optional)
     */
    forFirst: function (matchArg, foundCallback, notFoundCallback) {
        var item = this.first(matchArg);
        if (item) {
            foundCallback(item);
        }
        else if (notFoundCallback) {
            notFoundCallback(matchArg);
        }
    },
    
    /**
     * Return a copy of the array (not extended)
     */
    // copy: function () {
    //     // TODO: is one method faster than the other?
    //     return this.slice();
    //     // return [].concat(this);
    // },
};

function areAlike (source, matchArg) {
    var matchArgType, matchProp;
    
    // Get normalized type of object
    matchArgType = getType(matchArg);
    
    if (['string', 'number', 'date'].indexOf(matchArgType) > -1) {
        // Simple equals comparison
        return source === matchArg;
    }
    else if (matchArgType === 'function') {
        // Predicate function comparison
        return matchArg(source);
    }
    else {
        // Object props comparison
        for (matchProp in matchArg) { // eslint-disable-line one-var
            if (matchArg.hasOwnProperty(matchProp)) {
                var matchPropType = getType(matchArg[matchProp]);
                // If it's not the same type, then it's not alike
                if (matchPropType !== getType(source[matchProp])) {
                    return false;
                }
                // A nested array would need to have exactly the same array items
                if (matchPropType === 'array' && !extend(matchArg[matchProp]).hasOnly(source[matchProp])) {
                    return false;
                }
                else if (!areAlike(source[matchProp], matchArg[matchProp])) {
                    return false;
                }
            }
        }
        // Nothing was unalike, so the object matches!
        return true;
    }
}

function areExact (source, matchArg) {
    var matchArgType, matchProp, sourceProp;
    
    // Get normalized type of object
    matchArgType = getType(matchArg);
    
    if (['string', 'number', 'date'].indexOf(matchArgType) > -1) {
        // Simple equals comparison
        return source === matchArg;
    }
    else if (matchArgType === 'function') {
        // Predicate function comparison
        return matchArg(source);
    }
    else {
        // Object props comparison (everything in matchArg[object] should match in source)
        for (matchProp in matchArg) { // eslint-disable-line one-var
            if (matchArg.hasOwnProperty(matchProp)) {
                var matchPropType = getType(matchArg[matchProp]);
                // If it's not the same type, then it's not alike
                if (matchPropType !== getType(source[matchProp])) {
                    return false;
                }
                // A nested array would need to have exactly the same array items
                if (matchPropType === 'array' && !extend(matchArg[matchProp]).hasOnly(source[matchProp])) {
                    return false;
                }
                else if (!areAlike(source[matchProp], matchArg[matchProp])) {
                    return false;
                }
            }
        }
        // Object props comparison (everything in source should match in matchArg[object])
        for (sourceProp in source) { // eslint-disable-line one-var
            if (source.hasOwnProperty(matchProp)) {
                var sourcePropType = getType(source[sourceProp]);
                // If it's not the same type, then it's not alike
                if (sourcePropType !== getType(matchArg[sourceProp])) {
                    return false;
                }
                // A nested array would need to have exactly the same array items
                if (sourcePropType === 'array' && !extend(source[sourceProp]).hasOnly(matchArg[sourceProp])) {
                    return false;
                }
                else if (!areAlike(matchArg[sourceProp], source[sourceProp])) {
                    return false;
                }
            }
        }
        // Nothing was unalike, so the object matches!
        return true;
    }
}

// get sane type names for string, number, date, and array
function getType (arg) {
    return Object.prototype.toString.call(arg).slice(8, -1).toLowerCase();
}

// Export extension function wrapper
module.exports = extend;

# those

[![npm version](http://img.shields.io/npm/v/@hoomanlogic/those.svg?style=flat-square)](http://browsenpm.org/package/@hoomanlogic/those)

Non-destructive syntactic sugar for arrays and object maps

## Installing

```
npm install --save @hoomanlogic/those
```

## Basic Usage

```js
import those from '@hoomanlogic/those';

var people = [{ name: 'Alayna', age: 9 }, { name: 'Braylon', age: 6 }, { name: 'David', age: 35}];

// Get the first person with the name 'Braylon'
those(people).first({ name: 'Braylon'});

// Get the youngest person
var youngest = those(people).order('age').first(); 

// Pop the oldest person out of the array and assign to variable
var oldest;
those(people).order('age').flip().flick(undefined, function (flicked) { oldest = flicked });

// Check if the youngest is in the array
those(people).has(youngest); // true
 
// Check if the oldest is in the array
those(people).has(oldest); // false

// Toggle an item in a list (add if it doesn't exist, remove if it does)
those(people).toggle(oldest);
those(people).has(oldest); // true
those(people).toggle(oldest);
those(people).has(oldest); // false
```

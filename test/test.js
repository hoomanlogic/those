import mocha from 'mocha';
import sinon from 'sinon';
import those from '../dist/those.js';

function expect (actual) {
    return {
        to: {
            exist: actual !== undefined,
            be: {
                true: actual === true,
                false: actual === false,
                equal: function (expected) {
                    return actual === expected;
                },
            },
            equal: function (expected) {
                return actual === expected;
            },
        },
        not: {
            to: {
                exist: actual === undefined,
            },
        },
    };
}

mocha.setup({
    ui: 'bdd',
});

describe('those', function () {
    var widgets = [];
    var widgetClones = [];
    for (var i = 0; i < 100; i++) {
        widgets.push({
            id: i,
            name: 'Widget ' + i,
            subwidget: {
                id: i + i,
            },
        });
        widgetClones.push({
            id: i,
            name: 'Widget ' + i,
            subwidget: {
                id: i + i,
            },
        });
    }

    var widgetList = widgets.slice(0, 10);

    describe('those(arrayOrObject)', function () {
        it('should extend an array without modifying the source', function () {
            expect(those(widgetList).has).to.exist;
            expect(widgetList.has).not.to.exist;
        });

        it('should create an extended array from an object map', function () {
            expect(those(widgetList).has).to.exist;
        });
    });

    describe('has(matchArg)', function () {
        it('should return true when the value is a list item', function () {
            expect(those(widgetList).has(widgets[0])).to.be.true;
        });

        it('should return true when the value is a property on a list item', function () {
            expect(those(widgetList).has({ id: 1, subwidget: { id: 2 } })).to.be.true;
        });

        it('should return false when the value is not a list item', function () {
            expect(those(widgetList).has(widgets[10])).to.be.false;
        });

        it('should return false when the value is not a property on a list item', function () {
            expect(those(widgetList).has(11, 'id')).to.be.false;
        });
    });

    describe('hasAll(matchArray)', function () {
        it('should return true when all the items in the passed in array exist in the source array', function () {
            expect(those(widgetList).hasAll(widgets.slice(0, 5))).to.be.true;
        });

        it('should return false when some, not all, the items in the passed in array exist in the source array', function () {
            expect(those(widgetList).hasAll(widgets.slice(0, 15))).to.be.false;
        });
    });

    describe('hasAny(matchArray)', function () {
        it('should return true when any of the items in the passed in array exist in the source array', function () {
            expect(those(widgetList).hasAny(widgetClones.slice(5, 15))).to.be.true;
        });

        it('should return false when none of the items in the passed in array exist in the source array', function () {
            expect(those(widgetList).hasAny(widgets.slice(10, 15))).to.be.false;
        });
    });

    describe('hasOnly(matchArray)', function () {
        it('should return true when all of the items in the passed in array match all of the items in the source, no more, no less', function () {
            expect(those(widgetList).hasOnly(widgetClones.slice(0, 10))).to.be.true;
        });

        it('should return false when none of the items in the passed in array exist in the source array', function () {
            expect(those(widgetList).hasOnly(widgets.slice(0, 11))).to.be.false;
        });
    });

    describe('forFirst(matchArg, callbackFound[, callbackNotFound])', function () {
        it('should callback when found', function () {
            var found = sinon.spy();
            var notFound = sinon.spy();
            those(widgets).forFirst({ id: 3 }, found, notFound);
            expect(found.called).to.be.true;
            expect(notFound.called).to.be.false;
            those(widgets).forFirst({ id: -1 }, found, notFound);
            expect(found.calledTwice).to.be.false;
            expect(notFound.called).to.be.true;
        });
        it('should callback when not found', function () {
            expect(those(widgets).first({ id: -1 })).to.be.null;
        });
    });

    describe('first(matchArg)', function () {
        it('should return first match', function () {
            expect(those(widgets).first({ id: 3 })).to.not.be.null;
        });
        it('should return null when there is no match', function () {
            expect(those(widgets).first({ id: -1 })).to.be.null;
        });
    });

    describe('flick(matchArg)', function () {
        it('should pluck out all the values of a given property', function () {
            expect(those(widgets).flick({ id: 0 }).length).to.equal(99);
            expect(those(widgets).flick({ id: -1 }).length).to.equal(100);
        });
    });

    describe('flip(matchArg)', function () {
        it('should reverse the array', function () {
            expect(those(widgets).flip()[0].id).to.equal(99);
            expect(those(widgets).flip().flip()[0].id).to.equal(0);
        });
    });

    describe('last(num)', function () {
        it('should return end num from the array', function () {
            expect(those(widgetList).last(5).length).to.be.equal(5);
        });

        it('should return entire array if num is greater than length', function () {
            expect(those(widgetList).last(11).length).to.equal(10);
        });
    });

    describe('like(matchArg)', function () {
        it('should return array of matched items', function () {
            expect(those(widgetList).like({ subwidget: { id: 2 } }).length).to.be.equal(1);
        });
    });

    describe('order(prop)', function () {
        it('should order the array by the values of prop', function () {
            var outOfOrder = [ widgets[44], widgets[1], widgets[99] ];
            expect(those(outOfOrder).order('id')[0].id).to.be.equal(1);
            expect(those(outOfOrder).order('id').flip()[0].id).to.be.equal(99);
        });
    });

    describe('notLike(matchArg)', function () {
        it('should return array of items that were not matched', function () {
            expect(those(widgetList).notLike({ subwidget: { id: 2 } }).length).to.be.equal(9);
        });
    });

    describe('pluck(prop)', function () {
        it('should pluck out all the values of a given property', function () {
            var plucked = those(widgets).pluck('id');
            expect(plucked.length).to.equal(100);
            expect(plucked[1]).to.equal(1);
        });
    });

    describe('toggle(item)', function () {
        it('should add an item to array when it does not exist', function () {
            expect(those(widgetList).toggle(widgets[90]).length).to.equal(11);
        });

        it('should remove an item from the array when it exists', function () {
            expect(those(widgetList).toggle(widgets[90]).toggle(widgets[90]).length).to.be.equal(10);
        });
    });

    describe('top(num)', function () {
        it('should return beginning num from the array', function () {
            expect(those(widgetList).top(5).length).to.be.equal(5);
        });

        it('should return entire array if num is greater than length', function () {
            expect(those(widgetList).top(11).length).to.be.equal(10);
        });
    });
});

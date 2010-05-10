/**
 * jquery.doctest.js beta
 * http://lab.heungsub.net/jquery.doctest.js
 * http://github.com/heungsub/jquery.doctest.js
 * 
 * Copyright 2010, Heungsub Lee <lee@heungsub.net>
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * See also MIT-LICENSE.txt and GPL-LICENSE.txt 
 */
(function( $, undefined ) {

var doctest = function( scriptUrl ) {
        return doctest.testjs( scriptUrl );
    },

    // Is this line a start of docstring
    start = /\/\*\*/,

    // Is this line a end of docstring
    end = /\*\//,

    // Is this line a test code
    prompt = />\s*(.+)\s*$/,

    // Check if this line has flags
    flags = /\/\/doctest:\s*(.+)\s*$/,

    // A tab string
    ____ = "    ",

    th = function( n ) {
        n = parseInt( n );
        if ( n == 1 ) {
            return "1st";
        } else if ( n == 2 ) {
            return "2nd";
        } else if ( n == 3 ) {
            return "3rd";
        } else {
            return n + "th";
        }
    };

// Methods
doctest.fn = {

    // Console object, it should contains log(), error() method
    console: console,

    // Test the script file
    testjs: function( scriptUrl, complete ) {
        /**
        > jQuery.doctest.testjs( "test/nothing.js" );
        [object Object]
        > $( "script[src$=test/nothing.js]" ).length;
        12
        */

        // Load the script
        if ( !$( "script[src=" + scriptUrl + "]" ).length ) {
            var markup = '<script class="doctest" type="text/javascript" '
                       + 'src="' + scriptUrl + '"></script>';
            $( markup ).appendTo( document.body );
        }

        var result = {};

        complete = complete || this.complete;

        // Get code of the script and run tests
        $.getScript( scriptUrl, $.proxy( function( code ) {
            // Set result
            $.extend( result, this.run( this.describe( code ) ) );

            // Call complete event
            return complete( result );
        }, doctest.fn ) );

        // Result is empty yet. It will come later
        return result;
    },

    // Run tests
    run: function( description, assert ) {
        var test, item, line,
            result = [],
            passed, failed;

        assert = assert || this.assert;

        for ( var i in description ) {
            item = description[ i ];
            passed = failed = 0,
            line = 1;

            for ( var j in item ) {
                test = item[ j ];

                // Line number of the item
                if ( line === 1 ) {
                    line = parseInt( test.line );
                }

                try {
                    $.proxy( assert, this )( test );
                    passed ++;

                    // Log seccess message
                    this.console.log([
                        "Trying:",
                        ____ + test.code,
                        "Expecting:",
                        ____ + test.expected,
                        "ok"
                    ].join( "\n" ) );
                } catch (e) {
                    if ( e instanceof this.TestError ) {
                        failed ++;

                        // Log failure message
                        $.proxy( this.console, "error" )( e.toString() );
                    }
                }
            }

            // Save result each item
            result.push({
                item: item,
                line: line,
                tests: item.length,
                passed: passed,
                failed: failed
            });
        }

        return result;
    },

    // Parse the code and return a description
    describe: function( code ) {
        /**
        > code = "/*" + "*\n> 1 + 1;\n2\n*" + "/"; //doctest: +SKIP
        > code.length;
        17
        > description = $.doctest.describe( code );
        [object Object]
        > description.length;
        1
        > description[0][0].code;
        1 + 1;
        > description[0][0].expected;
        2
        */
        var description = [],
            items = [],
            itemLines = [],
            isItem = false,
            hasFlag = false,
            lines = code.split( "\n" ),
            line,
            finalLine,
            item,
            test;

        for ( var i in lines ) {
            line = lines[ i ];

            if ( start.exec( line ) ) {
                isItem = true;
                continue;
            } else if ( isItem && end.exec( line ) ) {
                items.push( itemLines );
                itemLines = [];
                isItem = false;
            }

            if ( isItem ) {
                finalLine = parseInt( i ) + 1;
                itemLines[ finalLine ] = $.trim( line );
            }
        }

        var keep = function( test ) {
            if ( test.expected === undefined ) {
                test.expected = undefined;
            } else {
                test.expected = test.expected.join( "\n" );
            }
            item.push( test );
        }

        for ( var j in items ) {
            item = [];

            for ( var i in items[ j ] ) {
                i = parseInt( i );
                line = items[ j ][ i ];

                if ( prompt.exec( line ) ) {
                    if ( test !== undefined ) {
                        keep( test );
                    }

                    test = {
                        line: i,
                        code: line.match( prompt )[ 1 ]
                    };
                    hasFlag = test.code.match( flags );

                    if ( hasFlag ) {
                        test.flags = hasFlag[ 1 ].split( /\s+/ );
                    } else {
                        test.flags = [];
                    }
                } else if ( test !== undefined ) {
                    if ( test.expected === undefined ) {
                        test.expected = [];
                    }
                    test.expected.push( line );
                }

                if ( test !== undefined && i === finalLine ) {
                    keep( test );
                }
            }

            description.push( item );
        }

        return description;
    },

    complete: function( result ) {
        var message, msg,
            passedMsg = [], failedMsg = [], emptyMsg = [],
            passedItems = [], failedItems = [], emptyItems = [],
            tests = 0, passed = 0, failed = 0,
            item, nl = "\n";

        for ( var i in result ) {
            item = result[ i ];

            tests += item.tests;
            passed += item.passed;
            failed += item.failed;

            msg = th( parseInt( i ) + 1 ) + " item(line " + item.line + ")";

            if ( item.tests === 0 ) {
                emptyItems.push( item );
                msg = ____ + msg;
                emptyMsg.push( msg );
            } else if ( item.passed === item.tests ) {
                passedItems.push( item );
                msg = ____ + item.tests + " tests in " + msg;
                passedMsg.push( msg );
            } else {
                failedItems.push( item );
                msg = ____ + item.failed + " of " +
                    item.tests + " in " + msg;
                failedMsg.push( msg );
            }
        }
        result.length = i;

        if ( emptyItems.length ) {
            message = [];
            message.push( emptyItems.length + " items had no tests:" );
            message.push( emptyMsg.join( nl ) );
            this.console.log( message.join( nl ) );
        }
        if ( passedItems.length ) {
            message = [];
            message.push( passedItems.length + " items passed all tests:" );
            message.push( passedMsg.join( nl ) );
            this.console.error( message.join( nl ) );
        }
        if ( failedItems.length ) {
            message = [];
            message.push( failedItems.length + " items had failures:" );
            message.push( failedMsg.join( nl ) );
            this.console.log( message.join( nl ) );
        }

        message = [
            tests + " tests in " + result.length + " items.",
            passed + " passed and " + failed + " failed."
        ];

        if ( !failedItems.length ) {
            message.push( "Test passed." );
        }

        this.console.log( message.join( nl ) );
    },

    assert: function( test ) {
        var got = this.eval( test );

        if ( $.inArray( "+SKIP", test.flags ) >= 0 ) {
            return true;
        }

        if ( test.expected != got ) {
            throw new this.TestError( test, got );
        }

        return true;
    },

    eval: function( test ) {
        return eval( test.code );//$.globalEval( test.code );
    },

    TestError: function( test, got ) {
        this.test = test;
        this.got = got;
        this.toString = function() {
            return [
                "Line " + this.test.line,
                "Failed example:",
                ____ + this.test.code,
                "Expected:",
                ____ + this.test.expected,
                "Got:",
                ____ + this.got
            ].join( "\n" );
        }
    },

    flags: {
        SKIP: {}
    }
};

$.extend( doctest, doctest.fn );
$.extend({
    doctest: doctest
});

})( jQuery );

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
        return new doctest.fn.init( scriptUrl );
    },

    // Is this line a start of docstring
    start = /\/\*\*/,

    // Is this line a end of docstring
    end = /\*\//,

    // Is this line a test code
    prompt = /^\s*>\s*(.+)\s*$/,

    // Is this line a continued test code
    continued = /^\s*\.\s*(.+)\s*$/,

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

var self = doctest;

// Methods
doctest.fn = doctest.prototype = {
    // Initialize
    init: function( scriptUrl, options ) {
        this.scriptUrl = scriptUrl;
        this.result = self.testjs( scriptUrl, this.events );
        return this;
    },

    verbose: function() {
        this.pass(function( test ) {
            // Log seccess message
            self.console.log([
                "Trying:",
                ____ + test.code,
                "Expecting:",
                ____ + test.expected,
                "ok"
            ].join( "\n" ) );
        });

        this.complete(function( result ) {
            var message, msg,
                passedMsg = [], failedMsg = [], emptyMsg = [],
                passedItems = [], failedItems = [], emptyItems = [],
                tests = 0, passed = 0, failed = 0,
                item, nl = "\n";

            // for item in result
            for ( var i in result ) {
                item = result[ i ];

                tests += item.tests;
                passed += item.passed;
                failed += item.failed;

                msg = th( parseInt( i ) + 1 ) + " item(line " + item.line + ")";

                // Empty item
                if ( item.tests === 0 ) {
                    emptyItems.push( item );
                    msg = ____ + msg;
                    emptyMsg.push( msg );

                // All tests passed item
                } else if ( item.passed === item.tests ) {
                    passedItems.push( item );
                    msg = ____ + item.tests + " tests in " + msg;
                    passedMsg.push( msg );

                // This item had some failures
                } else {
                    failedItems.push( item );
                    msg = ____ + item.failed + " of " +
                        item.tests + " in " + msg;
                    failedMsg.push( msg );
                }
            }

            if ( i === undefined ) {
                return;
            }

            // Output empty items message
            if ( emptyItems.length ) {
                message = [];
                message.push( emptyItems.length + " items had no tests:" );
                message.push( emptyMsg.join( nl ) );
                self.console.log( message.join( nl ) );
            }

            // Output passed items message
            if ( passedItems.length ) {
                message = [];
                message.push( passedItems.length + " items passed all tests:" );
                message.push( passedMsg.join( nl ) );
                self.console.log( message.join( nl ) );
            }

            // Output failed items message with console.error
            if ( failedItems.length ) {
                message = [];
                message.push( failedItems.length + " items had failures:" );
                message.push( failedMsg.join( nl ) );
                self.console.error( message.join( nl ) );
            }

            // Summary
            message = [
                tests + " tests in " + i + " items.",
                passed + " passed and " + failed + " failed."
            ];

            // All tests passed?
            if ( !failedItems.length ) {
                message.push( "Test passed." );
            }

            self.console.log( message.join( nl ) );
        });

        return this;
    },

    events: {
        complete: undefined,
        pass: undefined,
        fail: undefined
    },

    toString: function() {
        /**
        > ({});
        [object Object]
        > $.doctest();
        [$.doctest Object]
        > $.doctest( "test/nothing-fn.toString.js" );
        [$.doctest Object]
        */
        return "[$.doctest Object]";
    }
};

// Event setters
for ( var i in doctest.fn.events ) {
    /**
    > dt = $.doctest() //doctest: +SKIP
    > $.isFunction( dt.events.complete );
    false
    > dt.complete(function() {});
    [$.doctest Object]
    > $.isFunction( dt.events.complete );
    true
    > $.isFunction( dt.events.pass );
    false
    > $.isFunction( dt.events.fail );
    false
    > dt.pass(function() {}).fail(function() {});
    [$.doctest Object]
    > $.isFunction( dt.events.pass );
    true
    > $.isFunction( dt.events.fail );
    true
    */
    doctest.fn[ i ] = eval(
        "(function( fn ) { this.events." + i + " = fn; return this; })"
    );
}

// Give the init function the doctest prototype for later instantiation
doctest.fn.init.prototype = doctest.fn;

doctest.extend = doctest.fn.extend = $.extend;

doctest.extend({
    // Console should contains log(), error() method
    console: {
        log: $.proxy( console, "log" ),
        error: $.proxy( console, $.browser.webkit ? "error" : "log" )
    },

    // Test the script file
    testjs: function( scriptUrl, events ) {
        /**
        > $.doctest.testjs( "test/nothing-testjs.js" );
        [object Object]
        > $( "script[src$=test/nothing-testjs.js]" ).length;
        1
        */

        var result = {},
            start = events && events.start || self.events.start,
            complete = events && events.complete || self.events.complete;

        var run = function( code ) {
            var description = self.describe( code );

            // Set result
            $.extend( result, self.run( description, events ) );

            // Call complete event
            return complete( result );
        };

		// Handle $.doctest(), $.doctest( null ) or $.doctest( undefined )
        if ( !scriptUrl ) {
            return result;
            run( $( "html" ).html() );

		// Handle $.doctest( "example.js" )
        } else {
            // Load the script
            if ( !$( "script[src=" + scriptUrl + "]" ).length ) {
                var markup = '<script class="doctest" type="text/javascript" '
                           + 'src="' + scriptUrl + '"></script>';
                $( markup ).appendTo( document.body );
            }

            // Get code of the script and run tests
            $.getScript( scriptUrl, run );
        }

        // Result is empty yet. It will come later
        return result;
    },

    // Run tests
    run: function( description, events, assert ) {
        /**
        > d = [[{ line: 12, code: "1+1;", expected: "2", flags: []}]] //doctest: +SKIP
        > $.doctest.run( d )[ 0 ].passed;
        1
        */
        var test, item, line,
            result = [],
            passed, failed;

        pass = events && events.pass || self.events.pass;
        fail = events && events.fail || self.events.fail;
        assert = assert || self.assert;

        // for item in description
        for ( var i in description ) {
            item = description[ i ];
            passed = failed = 0,
            line = 1;

            // for test in item
            for ( var j in item ) {
                test = item[ j ];

                // Line number of the item
                if ( line === 1 ) {
                    line = parseInt( test.line );
                }

                try {
                    assert( test );
                    pass( test );
                    passed++;

                } catch ( error ) {
                    fail( error );
                    failed++;
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
        > description[0][0].line;
        2
        > description[0][0].flags.length;
        0
        */
        var description = [], items = [], itemLines = [],
            isItem = false, hasFlag = false,
            lines = code.split( "\n" ),
            line, finalLine, item, test;

        for ( var i in lines ) {
            line = lines[ i ];

            // When the start line of a docstring
            if ( start.exec( line ) ) {
                isItem = true;
                continue;

            // When the end line of a docstring
            } else if ( isItem && end.exec( line ) ) {
                items.push( itemLines );
                itemLines = [];
                isItem = false;
            }

            // When the line in a docstring
            if ( isItem ) {
                finalLine = parseInt( i ) + 1;
                itemLines[ finalLine ] = $.trim( line );
            }
        }

        var keep = function( test ) {
            // Merge code
            test.code = test.code.join( "\n" );

            // Merge expected value
            if ( test.expected === undefined ) {
                test.expected = undefined;
            } else {
                test.expected = test.expected.join( "\n" );
            }

            item.push( test );
        }

        for ( var j in items ) {
            item = [];

            // for line in items[ j ]
            for ( var i in items[ j ] ) {
                i = parseInt( i );
                line = items[ j ][ i ];

                // When the line contains prompt
                if ( prompt.exec( line ) ) {
                    if ( test !== undefined ) {
                        keep( test );
                    }

                    test = {
                        line: i,
                        code: [line.match( prompt )[ 1 ]]
                    };

                    // Find flags
                    hasFlag = test.code[0].match( flags );

                    if ( hasFlag ) {
                        test.flags = hasFlag[ 1 ].split( /\s+/ );
                    } else {
                        test.flags = [];
                    }

                } else if ( test !== undefined ) {
                    // When the line contains continued prompt
                    if ( continued.exec( line ) ) {
                        test.code.push( line.match( continued )[1] );

                    // When the line means expected value
                    } else {
                        if ( test.expected === undefined ) {
                            test.expected = [];
                        }
                        test.expected.push( line );
                    }
                }

                // The test must be keeped
                if ( test !== undefined && i === finalLine ) {
                    keep( test );
                }
            }

            description.push( item );
        }

        return description;
    },

    // Assert test object
    assert: function( test ) {
        /**
        > $.doctest.assert({ code: "1+'0';", expected: "10", flags: [] });
        true
        > $.doctest.assert({ code: "1+0;", expected: "1", flags: [] });
        true
        */
        var got, flag;

        // Evaluation!
        try {
            got = self.eval( test );
        } catch ( error ) {
            got = error;
        }

        // Process flags
        for ( var i in test.flags ) {

            // Get flag name
            flag = test.flags[ i ].replace( /^\+/, "" );

            // Check support the flag
            if ( self.flags[ flag ] !== undefined ) {
                var returned = self.flags[ flag ]( test );

                // Just return if flag returns anything
                if ( returned !== undefined ) {
                    return returned;
                }
            }
        }

        // Stringify and compare
        if ( String( test.expected ) !== String( got ) ) {
            throw new self.TestError( test, got );
        }

        // If no problem
        return true;
    },

    // Evaluate test object
    eval: function( test ) {
        return eval( test.code );//$.globalEval( test.code );
    },

    // Default event handlers
    events: {
        complete: function( result ) {
            // Quiet
        },

        // Call when each test passed
        pass: function( test ) {
            // Quiet
        },

        // Call when each test failed
        fail: function( error ) {
            /*
            >> e = new $.doctest.TestError({
            ...   line: 12,
            ...   code: "13",
            ...   expected: "12"
            ... }, 13 );
            [$.doctest.TestError Object]

            >>> $.doctest.events.fail( e );
            Line 12
            Failed example:
                13
            Expected:
                12
            Got:
                13
            */
            if ( error instanceof self.TestError ) {
                self.console.error([
                    "Line " + error.test.line,
                    "Failed example:",
                    ____ + error.test.code,
                    "Expected:",
                    ____ + error.test.expected,
                    "Got:",
                    ____ + error.got
                ].join( "\n" ) );
            } else {
                self.console.error([
                    "Line " + error.test.line,
                    "Failed example:",
                    ____ + error.test.code,
                    "Expected:",
                    ____ + error.test.expected,
                    "Got:",
                    ____ + String( error )
                ].join( "\n" ) );
            }
        }
    },

    TestError: function( test, got ) {
        this.test = test;
        this.got = got;
        this.toString = function() {
            return "[$.doctest.TestError Object]";
        }
    },

    flags: {
        SKIP: function() {
            return true;
        }
    }
});

$.extend({
    doctest: doctest
});

})( jQuery );

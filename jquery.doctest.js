/**
 * jquery.doctest.js beta
 * http://lab.heungsub.net/jquery.doctest.js
 * http://github.com/lunant/jquery.doctest.js
 * 
 * Copyright 2010, Heungsub Lee <heungsub+doctest@lunant.net>
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * See also MIT-LICENSE.txt and GPL-LICENSE.txt 
 */
(function( $, undefined ) {

var doctest = function( scriptUrl, options ) {
        return new doctest.fn.init( scriptUrl, options );
    },

    // Check if this line has flags
    flags = /\/\/doctest:\s*(.+)\s*$/,

    blank = /^\s*$/,

    scriptUrl = /\.js$/,

    // Add tab string each line
    ____ = "    ",
    shift = function( text, depth ) {
        depth = depth || 1;

        var input = text.split( "\n" ),
            output = [],
            buffer;

        for ( var i in input ) {
            buffer = "";
            for ( var j = 0; j < depth; j++ ) {
                buffer += ____;
            }
            buffer += input[ i ];
            output.push( buffer );
        }

        return output.join( "\n" );
    }

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
    },

    escapeRegExp = function( t ) {
        var specials = [
            "/", ".", "*", "+", "?", "|",
            "(", ")", "[", "]", "{", "}", "\\"
        ];
        var r = new RegExp( "(\\" + specials.join( "|\\" ) + ")", "g" );

        return t.replace( r, "\\$1" );
    };

// Alias for static methods
var self = doctest;

/** Make jQuery.doctest

    >>> $.isFunction( $.doctest );
    true
*/
$.extend({ doctest: self });

// Methods
doctest.fn = doctest.prototype = {
    options: {},

    pass: function( callback ) {
        $.extend( this.options, {
            pass: callback
        });
        return this;
    },

    fail: function( callback ) {
        $.extend( this.options, {
            fail: callback
        });
        return this;
    },

    complete: function( callback ) {
        $.extend( this.options, {
            complete: callback
        });
        return this;
    },

    init: function( script, options ) {
        /** Initialize doctest

        You can initilize doctest from script file url.

            >>> var example = $.doctest( "example.js" );
            >>> example.scriptUrl;
            example.js

        Or function.

            >>> var __vlaah__ = function __vlaah__() {
            ...     // http://vlaah.com/
            ... } //doctest: SKIP
            >>> $.doctest( __vlaah__ ).funcName;
            __vlaah__
        */
        this.options = $.extend( {}, this.options, options );

        // Handle $.doctest( "example.js" )
        if ( scriptUrl.exec( script ) ) {
            this.scriptUrl = script;
            this.result = self.testFile( script, this.options );

        // Handle $.doctest( exampleFunction )
        } else if ( $.isFunction( script ) ) {
            this.funcName = script.name;
            this.result = self.testFunc( script, this.options );

        // Handle $.doctest( "/** >>> 'Hi'; ..." )
        } else if ( script ) {
            this.result = self.testCode( script, this.options );

        // Handle $.doctest() or $.doctest( null )
        } else {
            this.result = {};
        }

        return this;
    },

    verbose: function() {
        this.pass(function( test ) {
            // Log seccess message
            self.console.log([
                "Trying:",
                shift( test.code ),
                "Expecting:",
                shift( test.expected ),
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
                self.console.warn( message.join( nl ) );
            }

            // Summary
            message = [
                tests + " tests in " + i + " items.",
                passed + " passed and " + failed + " failed."
            ];

            // All tests passed?
            if ( !failedItems.length ) {
                message.push( "Test passed." );
            } else {
                message.push( "Test failed." );
            }

            self.console.log( message.join( nl ) );
        });

        return this;
    },

    toString: function() {
        /**
            >>> ({});
            [object Object]
            >>> $.doctest();
            [object $.doctest]
            >>> $.doctest( "test/nothing-fn.toString.js" );
            [object $.doctest]
        */
        return "[object $.doctest]";
    }
};

// Give the init function the doctest prototype for later instantiation
doctest.fn.init.prototype = doctest.fn;

doctest.extend = doctest.fn.extend = $.extend;

doctest.extend({
    // Console should contains log(), error() method
    console: {
        log: $.proxy( console, "log" ),
        error: $.proxy( console, $.browser.webkit ? "error" : "warn" ),
        warn: $.proxy( console, "warn" )
    },

    // Default symbols
    symbols: {
        docStart: "/**",
        docEnd: "*/",
        prompt: ">>> ",
        continued: "... "
    },

    testFile: function( scriptUrl, options ) {
        /** Test the script file

            >>> $.doctest.testFile( "test/nothing-testFile.js" );
            [object Object]
            >>> $( "script[src$=test/nothing-testFile.js]" ).length;
            1
        */

        var result = {};

        var run = function( code ) {
            var opt = self.options( options );

            // Set result
            $.extend( result, self.testCode( code, options ) );

            // Call complete event
            return opt.complete( result );
        };

        // Load the script
        if ( !$( "script[src=" + scriptUrl + "]" ).length ) {
            var markup = '<script class="doctest" type="text/javascript" '
                       + 'src="' + scriptUrl + '"></script>';
            $( markup ).appendTo( document.body );
        }

        // Get code of the script and run tests
        $.getScript( scriptUrl, run );

        // Result is empty yet. It will come later
        return result;
    },

    // Test the code
    testCode: function( code, options ) {
        var opt = self.options( options ),
            description = self.describe( code, options );

        // Set result
        return self.run( description, options );
    },

    testFunc: function( func, options ) {
        /**
            >>> $.doctest.testFunc( $.doctest.run );
            [object Object]
        */
        return self.testCode( String( func ), options );
    },

    // Run tests
    run: function( description, options ) {
        /**
            >>> d = [[{
            ...     line: 12,
            ...     code: "1+1;",
            ...     expected: "2",
            ...     flags: []
            ... }]] //doctest: +SKIP
            >>> $.doctest.run( d )[ 0 ].passed;
            1
        */
        var opt = self.options( options ),

            result = [],
            test, item, line,
            passed, failed,

            // Events
            pass = opt.pass,
            fail = opt.fail;

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
                    self.assert( test );
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

    describe: function( code, options ) {
        /** Parse the code and return a description

            >>> var code = "/*" + "*\n>>> 1 + 1;\n2\n*" + "/";
            >>> code.length;
            19
            >>> var description = $.doctest.describe( code );
            >>> description;
            [object Object]

            >>> description.length;
            1
            >>> description[0][0].code;
            1 + 1;
            >>> description[0][0].expected;
            2
            >>> description[0][0].line;
            2
            >>> description[0][0].flags.length;
            0
        */
        var opt = self.options( options ),
            lines = code.split( "\n" ),

            // Modes
            isItem = false, hasFlag = false,

            description = [], items = [], itemLines = [],
            line, finalLine, item, test, indent,

            docStartSymbol = opt.docStart,
            docEndSymbol = opt.docEnd,
            promptSymbol = opt.prompt,
            continuedSymbol = opt.continued,

            docStart, docEnd, prompt, continued,

            spaces = "^\\s*",
            input = "(.+)$",
            
            e = escapeRegExp;

        docStart = new RegExp( spaces + e( docStartSymbol ) );
        docEnd = new RegExp( spaces + e( docEndSymbol ) );
        prompt = new RegExp( spaces + e( promptSymbol ) + input );
        continued = new RegExp( spaces + e( continuedSymbol ) + input );
        spaces = new RegExp( spaces );

        for ( var i in lines ) {
            line = lines[ i ];

            // When the start line of a docstring
            if ( docStart.exec( line ) ) {
                isItem = true;
                continue;

            // When the end line of a docstring
            } else if ( isItem && docEnd.exec( line ) ) {
                items.push( itemLines );
                itemLines = [];
                isItem = false;
            }

            // When the line in a docstring
            if ( isItem ) {
                finalLine = parseInt( i ) + 1;
                itemLines[ finalLine ] = line;
            }
        }

        var keep = function( test ) {
            // Merge code
            test.code = test.code.join( "\n" );

            // Merge expected value
            if ( test.expected === undefined ) {
                test.expected = String( undefined );
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

                    indent = line.match( spaces )[ 0 ];

                    test = {
                        line: i,
                        code: [line.match( prompt )[ 1 ]]
                    };

                    // Find flags
                    hasFlag = test.code[ 0 ].match( flags );

                    if ( hasFlag ) {
                        test.flags = hasFlag[ 1 ].split( /\s+/ );
                    } else {
                        test.flags = [];
                    }

                } else if ( test !== undefined ) {
                    // Blank line
                    if ( blank.exec( line ) ) {
                        keep( test );
                        test = undefined;

                    } else {
                        // Validate indention
                        if ( line.match( spaces )[ 0 ].search( indent ) < 0 ) {
                            throw new self.errors.IndentationError( line );
                        } else {
                            line = line.slice( indent.length );
                        }

                        // When the line contains continued prompt
                        if ( continued.exec( line ) ) {
                            test.code.push( line.match( continued )[1] );

                            // Find flags
                            var l = test.code.length - 1;
                            hasFlag = test.code[ l ].match( flags );

                            if ( hasFlag ) {
                                var newFlags = hasFlag[ 1 ].split( /\s+/ );
                                test.flags = $.merge( test.flags, newFlags );
                            }

                        // When the line means expected value
                        } else {
                            if ( test.expected === undefined ) {
                                test.expected = [];
                            }
                            test.expected.push( line );
                        }
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
            >>> $.doctest.assert({
            ...     code: "1+'0';",
            ...     expected: "10",
            ...     flags: []
            ... });
            true
            >>> $.doctest.assert({
            ...     code: "1+0;",
            ...     expected: "1",
            ...     flags: []
            ... });
            true
        */
        var got, expected, flag;

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
                var returned = self.flags[ flag ]( test, got );

                // OutputChecker
                if ( returned.test !== undefined ) {
                    test = returned.test;
                }
                if ( returned.got !== undefined ) {
                    got = returned.got;
                }

                // DocTestRunner flag
                if ( typeof returned === "boolean" ) {
                    if ( !returned ) {
                        throw new self.errors.TestError( test, got );
                    }
                    return true;
                }
            }
        }

        // Stringify and compare
        expected = String( test.expected ).replace( /<BLANKLINE>/, "" );
        if ( expected !== String( got ) ) {
            throw new self.errors.TestError( test, got );
        }

        // If no problem
        return true;
    },

    // Evaluate test object
    eval: function( test ) {
        with ( window ) {
            return eval( test.code );//$.globalEval( test.code );
        }
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
                >>> e = new $.doctest.errors.TestError({
                ...   line: 12,
                ...   code: "13",
                ...   expected: "12"
                ... }, 13 );
                [object $.doctest.errors.TestError]

                >>> $.doctest.events.fail( e );

                Issue: catching the console output is impossible
            */
            var message;
            if ( error instanceof self.errors.TestError ) {
                message = [
                    "Line " + error.test.line,
                    "Failed example:",
                    ____ + error.test.code,
                    "Expected:",
                    ____ + error.test.expected,
                    "Got:",
                    ____ + error.got
                ].join( "\n" );
            } else {
                message = [
                    error.type + ": " + error.message
                ].join( "\n" );
            }
            return self.console.error( message );
        }
    },

    flags: {
        // When specified, do not run the example at all. This can be useful
        // in contexts where doctest examples serve as both documentation and
        // test cases, and an example should be included for documentation
        // purposes, but should not be checked. E.g., the example’s output
        // might be random; or the example might depend on resources which
        // would be unavailable to the test driver.
        //
        // The SKIP flag can also be used for temporarily “commenting out”
        // examples.
        SKIP: function() {
            return true;
        },

        // When specified, all sequences of whitespace (blanks and newlines)
        // are treated as equal. Any sequence of whitespace within the expected
        // output will match any sequence of whitespace within the actual
        // output. By default, whitespace must match exactly.
        // NORMALIZE_WHITESPACE is especially useful when a line of expected
        // output is very long, and you want to wrap it across multiple lines
        // in your source.
        NORMALIZE_WHITESPACE: function( test, got ) {
            var whitespace = /[ \t\n]+/g;

            test = $.extend( {}, test, {
                expected: test.expected.replace( whitespace, " " )
            });

            return {
                test: test,
                got: got.replace( whitespace, " " )
            };
        },

        // When specified, an ellipsis marker (...) in the expected output can
        // match any substring in the actual output. This includes substrings
        // that span line boundaries, and empty substrings, so it’s best to
        // keep usage of this simple. Complicated uses can lead to the same
        // kinds of “oops, it matched too much!” surprises that .* is prone
        // to in regular expressions.
        ELLIPSIS: function( test, got ) {
            var e = escapeRegExp,
                ellipsis = new RegExp( e( e( "..." ) ), "g" );
                pattern = e( test.expected ).replace( ellipsis, ".*" );
            return !!(new RegExp( pattern )).exec( got );
        }
    },

    errors: {
        TestError: function( test, got ) {
            this.test = test;
            this.got = got;
            this.toString = function() {
                return "[object $.doctest.errors.TestError]";
            }
        },

        IndentationError: function( line ) {
            this.line = line;
            this.toString = function() {
                return "[object $.doctest.errors.IndentaionError]";
            }
        }
    },

    options: function( options ) {
        return $.extend( {}, self.events, self.symbols, options );
    }
});

})( jQuery );

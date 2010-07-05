/*
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

    scriptUrl = /\.js/,

    // Test types
    fileType = "file",
    funcType = "func",
    codeType = "code",

    // A tab
    ____ = "    ",

    // Add tab string each line
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
    },

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
    },

    bindFunc = function( eventType ) {
        return function( callback ) {
            var opt = {};
            opt[ eventType ] = callback;
            $.extend( this.options, opt );
            return this;
        };
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
    options: {
        verbose: false,
        test: true,
        context: window
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
            >>> $.doctest( __vlaah__ ).name;
            __vlaah__
        */
        this.options = $.extend( {}, self.events, this.options, options );
        this.result = {};

        // Handle $.doctest( "example.js" )
        if ( scriptUrl.exec( script ) ) {
            this.hash = self.hash( script );
            this.name = this.scriptUrl = script;
            this.type = fileType;

        // Handle $.doctest( exampleFunction )
        } else if ( $.isFunction( script ) ) {
            this.hash = self.hash( script );
            this.name = script.name || ("function#" + this.hash);
            this.code = self.unescape( script );
            this.type = funcType;

        // Handle $.doctest( "/** >>> 'Hi'; ..." )
        } else if ( script ) {
            this.hash = self.hash( script );
            this.name = "code#" + this.hash;
            this.code = self.unescape( script );
            this.type = codeType;

        // Handle $.doctest() or $.doctest( null )
        } else {
            return this;
        }

        this.basename = this.name.split( "/" ).reverse()[ 0 ];

        if ( this.options.verbose ) {
            this.verbose();
        }

        this.described = this.completed = this.testing = false;
        this.description = this.describe();

        if ( this.options.test ) {
            this.test();
        }

        return this;
    },

    describe: function() {
        var description = {
                doctest: this
            },
            describe = $.proxy(function() {
                var code = this.code, options = this.options;
                $.extend( description, self.describe( code, options ) );
                options.described( this );
                this.described = true;
            }, this );

        if ( this.code ) {
            describe();

        } else if ( this.type === fileType ) {
            // Load the script
            if ( !$( "script[src=" + scriptUrl + "]" ).length ) {
                var markup = '<script class="doctest" type="text/javascript" '
                           + 'src="' + scriptUrl + '"></script>';
                $( markup ).appendTo( document.body );
            }

            var callback = $.proxy(function( code ) {
                this.code = code;
                describe();
                if ( this.testing ) {
                    this.test( true );
                }
            }, this );

            // Get code of the script and run tests
            $.getScript( this.scriptUrl, callback );
        }

        return description;
    },

    test: function( noQueue ) {
        var first = false, opt = this.options, i;

        noQueue || self.queue.push( this );

        for ( i in self.queue ) {
            first = this === self.queue[ i ];
            break;
        }

        if ( this.described && first ) {
            opt.start( this );
            $.extend( this.result, self.test( this.description, opt ) );
            opt.complete( this );
            this.completed = true;

            // Pop
            delete self.queue[ i ];

            for ( i in self.queue ) {
                self.queue[ i ].test( true );
                break;
            }

            this.testing = false;
        } else {
            // Pauses a testing
            this.testing = true;
        }

        return this.result;
    },

    verbose: function() {
        $.extend( this.options, {
            start: function( doctest ) {
                self.console.log( "Testing " + doctest.name + "..." );
            },

            pass: function( test ) {
                // Log seccess message
                self.console.log([
                    "Trying:",
                    shift( test.code ),
                    "Expecting:",
                    shift( test.expected ),
                    "ok"
                ].join( "\n" ) );
            },

            complete: function( doctest ) {
                var result = doctest.result,
                    message, msg,
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

                    var line = item.line;
                    msg = th( parseInt( i ) + 1 ) + " item(line " + line + ")";

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
                    message = [
                        emptyItems.length + " items had no tests:"
                    ];
                    message.push( emptyMsg.join( nl ) );
                    self.console.log( message.join( nl ) );
                }

                // Output passed items message
                if ( passedItems.length ) {
                    message = [
                        passedItems.length + " items passed all tests:"
                    ];
                    message.push( passedMsg.join( nl ) );
                    self.console.log( message.join( nl ) );
                }

                // Output failed items message with console.error
                if ( failedItems.length ) {
                    message = [
                        failedItems.length + " items had failures:"
                    ];
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
            }
        });

        return this;
    },

    toString: function() {
        /**
            >>> ({});
            [object Object]
            >>> $.doctest();
            [$.doctest]
            >>> $.doctest( "test/nothing-fn.toString.js" );
            [$.doctest: test/nothing-fn.toString.js]
        */
        return "[$.doctest" + (this.name ? ": " + this.name : "") + "]";
    }
};

// Give the init function the doctest prototype for later instantiation
doctest.fn.init.prototype = doctest.fn;

doctest.extend = doctest.fn.extend = $.extend;

doctest.extend({
    queue: [],
    descriptions: {},

    hash: function( data, size ) {
        var hash = 0;
        data = String( data ),
        size = size || Math.pow( 10, 20 );
        for ( var i = 0; i < data.length; i++ ) {
            hash += data.charCodeAt( i ) * (i + 1);
        }
        return Math.abs( hash ) % size;
    },

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

    // Run tests
    /*
    run: function( hash, description, options ) {
        self.descriptions[ hash ] = description;

        for ( var i in self.queue ) {
            if ( self.queue[ i ] == hash ) {
                for ( var j in self.queue ) {
                    var hash = self.queue[ j ];
                    if ( self.descriptions[ hash ] === undefined ) {
                        break;
                    } else {
                        self._run( self.descriptions[ hash ], options );
                        delete self.queue[ j ];
                        delete self.descriptions[ hash ];
                    }
                }
            }
            break;
        }
    },*/

    test: function( description, options ) {
        /**
            >>> d = [[{
            ...     line: 12,
            ...     code: "1+1;",
            ...     expected: "2",
            ...     flags: []
            ... }]] //doctest: +SKIP
            >>> $.doctest.test( d )[ 0 ].passed;
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
            if ( String( parseInt( i ) ) === "NaN" ) {
                continue;
            }
            item = description[ i ];
            passed = failed = 0,
            line = 1;

            // for test in item
            for ( var j in item ) {
                if ( typeof item[ j ] === "string" ) {
                    continue;
                }
                test = item[ j ];

                // Line number of the item
                if ( line === 1 ) {
                    line = parseInt( test.line );
                }

                try {
                    self.assert( test, opt );
                    pass( test, description );
                    passed++;

                } catch ( error ) {
                    fail( error, description );
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

            >>> var code = "/++\n>>> 1 + 1;\n2\n+/";
            >>> code.length;
            19
            >>> var description = $.doctest.describe( code, {
            ...     docStart: "/++",
            ...     docEnd: "+/"
            ... });
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
        code = self.unescape( code );

        var opt = self.options( options ),
            lines = code.split( "\n" ),

            // Modes
            isItem = false, hasFlag = false,

            description = [], items = [], itemLines = [],
            line, finalLine, item, test, comment, indent,

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
                // merge code
                test.code = test.code.join( "\n" );

                // merge expected value
                if ( test.expected === undefined ) {
                    test.expected = String( undefined );
                } else {
                    test.expected = test.expected.join( "\n" );
                }

                item.push( test );
            },
            keepComment = function( comment ) {
                // unshift
                var baseIndent = comment[ 0 ].match( spaces )[ 0 ];
                for ( var i in comment ) {
                    var indent = comment[ i ].match( spaces )[ 0 ];
                    if ( indent.length > baseIndent.length ) {
                        indent = baseIndent;
                    }
                    comment[ i ] = comment[ i ].slice( indent.length );
                }

                /*
                if ( !item.length ) {
                    item.subject = comment[ 0 ];
                }
                */

                // merge lines
                comment = comment.join( "\n" );

                item.push( comment );
            };

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
                    } else if ( comment !== undefined ) {
                        keepComment( comment );
                        comment = undefined;
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
                } else if ( line ) {
                    if ( comment === undefined ) {
                        comment = [ line ];
                    } else {
                        comment.push( line );
                    }
                }
            }

            // The test must be keeped
            if ( test !== undefined ) {
                keep( test );
                test = undefined;
            } else if ( comment !== undefined ) {
                keepComment( comment );
                comment = undefined;
            }

            if ( item.length ) {
                description.push( item );
            }
        }

        return description;
    },

    // Assert test object
    assert: function( test, options ) {
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
        options = self.options( options );

        // Evaluation!
        try {
            got = self.eval( test, options );
        } catch ( error ) {
            got = error;
        }

        // Process flags
        for ( var i in test.flags ) {
            if ( typeof test.flags[ i ] !== "string" ) {
                continue;
            }

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
    eval: function( test, options ) {
        var context = self.options( options ).context || window;
        with ( context ) {
            return window.eval.call( window, test.code );
        ii}
    },

    // Unescapes a docstring
    unescape: function( doc ) {
        return String( doc ).replace( /\*\\\//g, "*/" );
    },

    flags: {
        SKIP: function() {
            return true;
        },

        NORMALIZE_WHITESPACE: function( test, got ) {
            var whitespace = /[ \t\n\s]+/g,
                normalize = function( str ) {
                    return $.trim( str.replace( whitespace, " " ) );
                };

            test = $.extend( {}, test, {
                expected: normalize( test.expected )
            });

            return {
                test: test,
                got: normalize( got )
            };
        },

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

    // Default event handlers
    events: {
        described: function( doctest ) {
            // Quiet
        },

        start: function( doctest ) {
            // Quiet
        },

        complete: function( doctest ) {
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

    options: function( options ) {
        return $.extend( {}, self.events, self.symbols, options );
    },

    sandbox: $( "<body></body>" )
});

})( jQuery );

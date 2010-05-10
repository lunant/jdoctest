(function($) {
/**
 * Copyright (c) 2010 Heungsub Lee <lee@heungsub.net>
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * jquery.doctest.js
 * http://lab.heungsub.net/jquery.doctest.js
 */

$.doctest = function( scriptUrl ) {
    $.doctest.testjs( scriptUrl );
};

$.doctest.fn = {

    start: /\/\*\*/,
    end: /\*\//,
    code: />\s*(.+)\s*$/,
    flags: /\/\/doctest:\s*(.+)\s*$/,

    testjs: function( scriptUrl ) {
        /**
        > jQuery.doctest.testjs( "test/nothing.js" );
        > $( "script[src$=test/nothing.js]" ).length;
        1
        */
        if ( !$( "script[src=" + scriptUrl + "]" ).length ) {
            var markup = '<script class="doctest" type="text/javascript" '
                       + 'src="' + scriptUrl + '"></script>';
            $( markup ).appendTo( document.body );
        }

        $.getScript( scriptUrl, $.proxy( function( code ) {
            var description = this.describe( code );
            var result = this.test( description );
            console.log([
                result.tests + " tests.",
                result.passed + " passed and " + result.failed + " failed.",
                "Test passed."
            ].join( "\n" ) );
        }, $.doctest.fn ) );
    },

    test: function( description, assert ) {
        var test, passed = 0, failed = 0;
        assert = assert || this.assert;

        for ( var i in description ) {
            test = description[ i ];
            try {
                $.proxy( assert, this )( test );
                passed ++;
            } catch (e) {
                failed ++;
                console.error( e.toString() );
            }
        }

        return {tests: description.length, passed: passed, failed: failed};
    },

    describe: function( code ) {
        /**
        > code = "/*" + "*\n>>> 1 + 1;\n2\n*" + "/"; //doctest: +SKIP
        > code.length;
        19
        > description = $.doctest.describe( code );
        [object Object]
        > description.length;
        1
        > description[0].code;
        1 + 1;
        > description[0].expected;
        2
        */
        var description = [],
            docLines = [],
            isDoc = false,
            hasFlag = false,
            lines = code.split( "\n" ),
            line, test;

        for ( var i in lines ) {
            line = lines[ i ];

            if ( this.start.exec( line ) ) {
                isDoc = true;
                continue;
            } else if ( this.end.exec( line ) ) {
                isDoc = false;
            }

            if ( isDoc ) {
                docLines[ parseInt( i ) + 1 ] = $.trim( line );
            }
        }

        var keep = function( test ) {
            if ( test.expected === undefined ) {
                test.expected = undefined;
            } else {
                test.expected = test.expected.join( "\n" );
            }
            description.push( test );
        }

        for ( var i in docLines ) {
            i = parseInt( i );
            line = docLines[ i ];

            if ( this.code.exec( line ) ) {
                if ( test !== undefined ) {
                    keep( test );
                }
                test = {line: i, code: line.match( this.code )[ 1 ]};
                hasFlag = test.code.match( this.flags );
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

            if ( test !== undefined && i === docLines.length - 1) {
                keep( test );
            }
        }

        return description;
    },

    markup: function( description ) {
        var i, j, test, result;

        console.dir(description);

        markup = '<div class="doctest">';
        markup += '<h2>' + description.title + '</h2>';
        markup += '<ul>';

        for ( i in description.docs ) {
            markup += '<li><ul class="assertions">';
            for ( j in description.docs[ i ] ) {
                test = description.docs[ i ][ j ];
                markup += '<li>';
                markup += '<code class="expected">' + test.result + '</code>';
                markup += '<code class="code">' + test.code + '</code>';
                markup += '</li>';
            }
            markup += '</ul></li>';
        }

        markup += '</ul>';
        markup += '</div>';

        return markup;
    },

    assert: function( test ) {
        var got = this.eval( test ),
            ____ = "    ";

        if ( $.inArray( "+SKIP", test.flags ) >= 0 ) {
            console.log([
                "Trying:",
                ____ + test.code,
                "skip"
            ].join( "\n" ) );
            return;
        }

        if ( test.expected != got ) {
            throw new this.TestError( test, got );
        } else {
            console.log([
                "Trying:",
                ____ + test.code,
                "Expecting:",
                ____ + test.expected,
                "ok"
            ].join( "\n" ) );
        }
    },

    eval: function( test ) {
        return eval( test.code );//$.globalEval( test.code );
    },

    TestError: function( test, got ) {
        var ____ = "    ";
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
    }
};

$.extend( $.doctest, $.doctest.fn );

})(jQuery);

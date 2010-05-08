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
 * http://works.heungsub.net/jquery.doctest.js
 */

$.doctest = function( scriptUrl ) {
    var markup = '<script type="text/javascript" class="doctest" src="'
               + scriptUrl + '"></script>'
    var elem = $( markup );
    //elem.appendTo(document.body);

    $.getScript( scriptUrl, $.doctest.parseCode );
};

$.doctest.docStartPattern = /\/\*\!/;
$.doctest.docEndPattern = /\*\//;

$.doctest.parseCode = function( code ) {
    var docs = [], doc,
        store = false;
        lines = code.split( "\n" );

    for ( var n in lines ) {
        if ( !store && $.doctest.docStartPattern.exec( lines[ n ] ) ) {
            doc = [];
            store = true;
        } else if ( store && $.doctest.docEndPattern.exec( lines[ n ] ) ) {
            docs.push( doc );
            store = false;
        }
        if ( store ) {
            doc.push( lines[ n ] );
        }
    }

    console.dir( docs );
};

})(jQuery);

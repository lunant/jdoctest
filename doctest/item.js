var Item = function( source, line, doctest ) {
        return new Item.fn.init( source, line, doctest );
    };

Item.fn = Item.prototype = {
    init: function( source, lineNo, doctest ) {
        this.options = doctest.options;
        this.source = source;
        this.lineNo = +lineNo;
        this.doctest = doctest;
        this.status = {
            done: [],
            success: [],
            failure: [],
            examples: []
        };
        this.description = this.describe();
    },

    describe: function() {
        return this.parse( this.source );
    },

    parse: function( source ) {
        var description = [],
            lines = source.split( nl ),

            line, example, comment, childLines = [], lineNo,

            isExample = false, isComment = false, blankLine, 

            e = DocTest.escapeRegExp,
            r = RegExp,

            prompt = new r( __ + e( this.doctest.symbols.prompt ) + xx ),
            continued = new r( __ + e( this.doctest.symbols.continued ) + xx ),

            keepExample = function( childLines ) {
                var source = trimIndent( childLines.join( nl ) ),
                    example = Example( source, lineNo, this );
                description.push( example );
                this.status.examples.push( example );
                isExample = false;
            },
            keepComment = function( childLines ) {
                var body = trimIndent( childLines.join( nl ) );
                description.push( Comment( body, lineNo, this ) );
                isComment = false;
            };

        for ( var i in lines ) {
            if ( !isArrayElem( lines, i ) ) {
                continue;
            }
            line = lines[ i ];
            blankLine = blank.exec( line );

            if ( prompt.exec( line ) ) {
                if ( isExample ) {
                    keepExample.call( this, childLines );
                    childLines = [];
                } else if ( isComment ) {
                    keepComment.call( this, childLines );
                    childLines = [];
                }
                isExample = true;
                lineNo = +i + this.lineNo;

            } else if ( isExample ) {
                if ( blankLine ) {
                    keepExample.call( this, childLines );
                    childLines = [];
                }
            } else if ( isComment && blankLine ) {
                keepComment.call( this, childLines );
                childLines = [];
            } else if ( !blankLine ) {
                isComment = true;
                lineNo = +i + this.lineNo;
            }

            if ( isExample || isComment ) {
                childLines.push( line );
            }
        }
        if ( isExample ) {
            keepExample.call( this, childLines );
        } else if ( isComment ) {
            keepComment.call( this, childLines );
        }

        return description;
    },

    testAll: function() {
        var k = 0, example = this.description[ k ];

        for ( var i in this.description ) {
            if ( !isArrayElem( this.description, i ) ) {
                continue;
            }
            var example = this.description[ i ];
            if ( example instanceof Example ) {
                if ( example.test() ) {
                    this.status.success.push( example );
                } else {
                    this.status.failure.push( example );
                }
                this.status.done.push( example );
            }
        }

        return this.status;
    }
};

Item.fn.init.prototype = Item.fn;
Item.extend = Item.fn.extend = $.extend;

DocTest.Item = Item;

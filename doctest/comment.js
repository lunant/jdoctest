var Comment = function( body, lineNo, section ) {
    /** .. class:: DocTest.Comment( body[, lineNo, section] )

    It just wraps a comment string.

        >>> var comm = DocTest.Comment( "Hello, world!", 12 );
        >>> comm;
        Hello, world!
        >>> comm.toString();
        Hello, world!
        >>> comm.lineNo;
        12
    */
    return new Comment.fn.init( body, lineNo, section );
};

Comment.fn = Comment.prototype = $.extend( new Paragraph, {
    init: function( body, lineNo, section ) {
        this.body = body;
        this.lineNo = +lineNo || 1;
        this.section = section || Section.fn;
        this.doctest = section ? section.doctest : DocTest.fn;
    },
    toString: function() {
        return this.body;
    }
});

Comment.fn.init.prototype = Comment.fn;
Comment.extend = Comment.fn.extend = $.extend;

DocTest.Comment = Comment;

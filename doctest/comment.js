var Comment = function( body, lineNo, section ) {
        return new Comment.fn.init( body, lineNo, section );
    };

Comment.fn = Comment.prototype = $.extend( new Paragraph, {
    init: function( body, lineNo, section ) {
        this.body = body;
        this.lineNo = lineNo;
        this.section = section;
        this.doctest = section.doctest;
    },
    toString: function() {
        return this.body;
    }
});

Comment.fn.init.prototype = Comment.fn;
Comment.extend = Comment.fn.extend = $.extend;

DocTest.Comment = Comment;

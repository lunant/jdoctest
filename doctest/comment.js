var Comment = function( body, lineNo, item ) {
        return new Comment.fn.init( body, lineNo, item );
    };

Comment.fn = Comment.prototype = $.extend( new Paragraph, {
    init: function( body, lineNo, item ) {
        this.body = body;
        this.lineNo = lineNo;
        this.item = item;
        this.doctest = item.doctest;
    },
    toString: function() {
        return this.body;
    }
});

Comment.fn.init.prototype = Comment.fn;
Comment.extend = Comment.fn.extend = $.extend;

DocTest.Comment = Comment;

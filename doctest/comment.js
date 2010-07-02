var Comment = function( body, lineNo, item ) {
        return new Comment.fn.init( body, lineNo, item );
    };

Comment.fn = Comment.prototype = {
    init: function( body, lineNo, item ) {
        this.body = body;
        this.lineNo = lineNo;
        this.item = item;
    }
};

Comment.fn.init.prototype = Comment.fn;
Comment.extend = Comment.fn.extend = $.extend;


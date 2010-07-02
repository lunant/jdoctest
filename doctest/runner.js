var Runner = function( log, check ) {
        return new Runner.fn.init( log, check );
    };

Runner.fn = Runner.prototype = {
    init: function( log, check ) {
        this.log = log;
        this.check = check;
    },

    run: function( example ) {
        return true;
    },
    reportStart: function( example ) {},
    reportSuccess: function( example ) {},
    reportFailure: function( example ) {},
    reportError: function( example, error ) {}
};

Runner.fn.init.prototype = Runner.fn;
Runner.fn.extend = $.extend;
Runner.extend = function( proto ) {
    var cls = function( log, check ) {
        var obj = new cls.fn.init( log, check );
        $.extend( obj, proto );
        return obj;
    };
    cls.fn = cls.prototype = Runner();
    cls.fn.init.prototype = cls.fn;
    return cls;
};


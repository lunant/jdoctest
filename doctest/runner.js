var Runner = function( log, check ) {
    /** .. class:: DocTest.Runner( log, check )

    It runs some example instance of :class:`DocTest.Example`. And it has
    callback functions for reporting result. If you want make runner for flag
    like :data:`DocTest.flags.SKIP` extend this.
    */
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
Runner.extend = function( properties ) {
    /** .. function:: DocTest.Runner.extend( properties )

    Create a new runner. The ``properties`` is an object with class attributes
    and methods for new runner.
    */
    var cls = function( log, check ) {
        var obj = new cls.fn.init( log, check );
        $.extend( obj, properties );
        return obj;
    };
    cls.fn = cls.prototype = Runner();
    cls.fn.init.prototype = cls.fn;
    return cls;
};

DocTest.Runner = Runner;

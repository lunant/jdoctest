function HTTPError( xhr ) {
    /** .. class:: DocTest.HTTPError( xhr )

    It is an exception for HTTP error. DocTest throws it when Ajax failed.
    */
    this.name = arguments.callee.name;
    this.message = xhr.statusText;
};

function Failure( example ) {
    /** .. class:: DocTest.Failure( example )

    It is an exception for test failure.
    */
    this.name = arguments.callee.name;
    this.message = "expected " + example.want + ", not " + example.got;
};

var error = new Error();
error.toString = function() {
    return this.name + ": " + this.message;
};
HTTPError.prototype = Failure.prototype = error;

DocTest.HTTPError = HTTPError;
DocTest.Failure = Failure;

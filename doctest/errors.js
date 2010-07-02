function HTTPError( xhr ) {
    this.name = arguments.callee.name;
    this.message = xhr.statusText;
};

function DocTestFailure( example ) {
    this.name = arguments.callee.name;
    this.message = "expected " + example.want + ", not " + example.got;
};

var error = new Error();
error.toString = function() {
    return this.name + ": " + this.message;
};
HTTPError.prototype = DocTestFailure.prototype = error;


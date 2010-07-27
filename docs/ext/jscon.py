from pygments.lexers import JavascriptLexer, LEXERS
from pygments.token import *


__all__ = ["JavascriptConsoleLexer", "setup"]


class JavascriptConsoleLexer(JavascriptLexer):
    """For Javascript console output or doctests, such as:

    .. sourcecode:: jscon

        >>> var a = "foo";
        >>> a;
        foo
        >>> 1 / 0;
        Infinity
    """

    name = "Javascript console session"
    CONSOLE_RULES = [(r"(?:(?<=\n)|^)(>>>|\.\.\.)(?= )", Generic.Prompt),
                     # for popular Javascript frameworks
                     (r"\$|jQuery|MooTools|Class|Browser|Array|Function" \
                      r"String|Hash|Event|Element|JSON|Cookie|Fx|Request",
                      Name.Class)]
    EXCEPTIONS = ["Error", "KeyError", "HTTPError", "ReferenceError"]
    tokens = JavascriptLexer.tokens.copy()
    tokens["root"] = CONSOLE_RULES + tokens["root"][:]
    aliases = ["jscon"]
    mimetypes = ["text/x-javascript-doctest"]
    filenames = []
    alias_filenames = []

    def get_tokens_unprocessed(self, text):
        is_example = False
        is_output = False
        for item in JavascriptLexer.get_tokens_unprocessed(self, text):
            if item[1] is Generic.Prompt:
                is_example = True
                is_output = False
            elif is_example and item[2] == u"\n":
                is_example = False
                is_output = True
            elif is_output:
                item = item[0], Generic.Output, item[2]
            elif item[2] in self.EXCEPTIONS:
                item = item[0], Name.Exception, item[2]
            yield item


def setup(app):
    jscon = JavascriptConsoleLexer()
    app.add_lexer("jscon", jscon)


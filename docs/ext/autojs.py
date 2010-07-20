import os
import os.path
import re
from docutils import nodes
from docutils.statemachine import ViewList
from sphinx.util.compat import Directive
from sphinx.util.nodes import nested_parse_with_titles


__all__ = ["AutoJavaScript"]


START = "/**"
END = "*/"
PROMPT = ">>> "
CONTINUED = "... "


class Section(object):

    BLANK = ""
    LEXER = "jscon"
    INDENT = "   "

    def __init__(self, lines):
        self.lines = list(lines)
        self.indent = self.lines[0][:self.lines[0].find(START)]

    def to_rest(self):
        rest = []
        is_example = False
        for line in self.lines:
            line = re.sub("^" + self.indent, "", line)
            lstripped = line.lstrip()
            if lstripped.startswith(PROMPT):
                rest.append(self.BLANK)
                rest.append(".. sourcecode:: {0}".format(self.LEXER))
                rest.append(self.BLANK)
            if lstripped.startswith(PROMPT) or \
               lstripped.startswith(CONTINUED) or \
               is_example and lstripped:
                is_example = True
                line = self.INDENT + lstripped
            elif is_example:
                is_example = False
            rest.append(line)
        # shift contents if title exists and remove docstring literals
        if self.has_title():
            rest = self.shift_contents(rest)
        rest = self.remove_doc_literals(rest)
        return rest

    def shift_contents(self, rest):
        def shift(line):
            if line.strip():
                return self.INDENT + line
            else:
                return self.BLANK
        contents_from = rest.index(self.BLANK)
        return rest[:contents_from] + map(shift, rest[contents_from:])

    def remove_doc_literals(self, rest):
        rest[0] = re.sub(re.escape(START) + "\s*", self.BLANK, rest[0])
        rest[-1] = re.sub("\s*" + re.escape(END), self.BLANK, rest[-1])
        return rest

    def has_title(self):
        return bool(self.lines[0].replace(START, "").strip())

    def __str__(self):
        return '<section has_title="{0}" indent="{1}">\n'.format(str(self.has_title()), self.indent) +"\n".join(self.lines) + "\n</section>"

class JavaScriptDocument(object):

    INDENT = re.compile(r"^\s*")

    def __init__(self, path):
        self.path = path
        self.file = open(path)

    def get_sections(self):
        is_section = False
        section_lines = []
        for line in self.file:
            line = re.sub("\n$", "", line)
            if line.lstrip().startswith(START):
                is_section = True
            if is_section:
                section_lines.append(line)
            if line.rstrip().endswith(END):
                is_section = False
                yield Section(section_lines)
                section_lines = []

    def to_rest(self):
        for sec in self.get_sections():
            for line in sec.to_rest():
                yield line


class AutoJavaScript(Directive):
    """ Generate reStructuredText from JavaScript file.

    .. sourcecode:: rest

       DocTest.js internals
       --------------------

       .. autojs:: doctest.js
       .. autojs:: section.js
       .. autojs:: example.js
       .. autojs:: comment.js

    """

    required_arguments = 1

    def add_line(self, line):
        self.result.append(line, "<autojs>")

    def add_lines(self, lines):
        if isinstance(lines, basestring):
            lines = lines.split("\n")
        for line in lines:
            self.add_line(line)

    def run(self):
        self.result = ViewList()
        path = self.arguments[0]
        filename = os.path.basename(path)
        node = nodes.section()
        node.document = self.state.document
        self.add_lines(JavaScriptDocument(path).to_rest())
        nested_parse_with_titles(self.state, self.result, node)
        return node.children


def setup(app):
    app.add_directive('autojs', AutoJavaScript)


if __name__ == "__main__":
    for line in JavaScriptDocument("ext/test.js").to_rest():
        print line

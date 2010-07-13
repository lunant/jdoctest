import os
from docutils import nodes
from sphinx.util.compat import Directive


class Paragraph(object):

    def __init__(self, body=""):
        self.body = body

    def __iadd__(self, body):
        self.body += "\n" + body
        return self

    def __repr__(self):
        return self.body


class Example(Paragraph): pass
class Comment(Paragraph): pass


class AutoJavaScript(Directive):

    START = "/**"
    END = "*/"
    PROMPT = ">>> "
    CONTINUED = "... "

    required_arguments = 1

    def read(self, path):
        for line in open(os.path.join(os.curdir, path)):
            yield line

    def divide(self, lines):
        is_item = False
        para = None
        for line in lines:
            nude = line.strip()
            if nude.startswith(self.START):
                is_item = True
            if is_item:
                docline = nude.replace(self.START, "").replace(self.END, "")
                if docline.startswith(self.PROMPT) or \
                   docline.startswith(self.CONTINUED):
                    if isinstance(para, Example):
                        para += docline
                    else:
                        if isinstance(para, Comment):
                            yield para
                        para = Example(docline)
                elif isinstance(para, Example):
                    para += docline
                    yield para
                    para = None
                else:
                    if isinstance(para, Comment):
                        para += docline
                    else:
                        para = Comment(docline)
            if nude.endswith(self.END):
                is_item = False
                if isinstance(para, Paragraph):
                    yield para
                    para = None

    def _run(self):
        for para in self.divide(self.read(self.arguments[0])):
            if isinstance(para, Example):
                para = str(para)
                node = nodes.literal_block(para, para)
                node.line = 1
                node["language"] = "jscon"
                yield node
            elif isinstance(para, Comment):
                para = str(para)
                node = nodes.Text(para)
                yield node

    def run(self):
        return list(self._run())


def setup(app):
    app.add_directive('autojs', AutoJavaScript)

import base64
from jinja2 import Template
import sys
import urllib2

def encodebase64(filename):
    fin = open(filename, 'rb')
    contents = fin.read()
    data_url = base64.b64encode(contents)
    fin.close()
    return data_url

def make_data_url_png(filename):
	prefix = 'data:image/png;base64,'
	return prefix + encodebase64(filename)

def make_data_url_favicon(filename):
	prefix = 'data:image/x-icon;base64,'
	return prefix + encodebase64(filename)

def render_template(folder):
    src_file = "template.tmpl"
    dest_file = "index.html"
    template = Template(get_local_file(src_file))
    result = template.render(
        get_local_file=get_local_file,
        get_remote_file=get_remote_file,
        make_data_url_png=make_data_url_png,
        make_data_url_favicon=make_data_url_favicon,
    )
    open(dest_file,'w').write(result)

def get_local_file(filename):
    return open(filename).read()

def get_remote_file(url):
    response = urllib2.urlopen(url)
    html = response.read()
    return html

if __name__ == "__main__":
    path = sys.argv[1]
    render_template(path)

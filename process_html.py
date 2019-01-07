import base64
from jinja2 import Template
import sys
import os
import urllib.request

def encodebase64(filename):
    fin = open(filename, 'rb')
    contents = fin.read()
    data_url = base64.b64encode(contents)
    fin.close()
    return data_url.decode("utf-8")

def make_data_url_png(filename):
	prefix = 'data:image/png;base64,'
	return prefix + encodebase64(filename)

def make_data_url_of_type(filename,type):
	prefix = 'data:{};base64,'.format(type)
	return prefix + encodebase64(filename)

def render_template():
    src_file = "template.tmpl"
    dest_file = "index.html"
    template = Template(get_local_file(src_file))
    result = template.render(
        get_local_file=get_local_file,
        get_remote_file=get_remote_file,
        make_data_url_png=make_data_url_png,
        make_data_url_of_type=make_data_url_of_type,
        encodebase64=encodebase64,
    )
    save_file(result,dest_file)

def get_local_file(filename):
    return open(filename).read()

def save_file(data,filename):
    open(filename,'w').write(data)

def get_remote_file(url):
    basename = url.split("/")[-1]
    if os.path.exists(basename):
        return get_local_file(basename)
    else:
        with urllib.request.urlopen(url) as response:
            html = response.read().decode("utf-8")
        save_file(html,basename)
        return html

if __name__ == "__main__":
    render_template()

#!/usr/bin/env python

from minhttp import admin_main as main

if __name__ == '__main__':
    main.app.run(port=8804,debug=False)

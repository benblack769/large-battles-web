browserify modules/client_main.js > static_files/bundle.js
browserify modules/web_worker_main.js > static_files/web_worker.js
#uglifyjs -m < static_files/bundle.js > static_files/bundle.min.js
(cd static_files; python process_html.py .)

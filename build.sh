# builds files into a single html file ready for deployment
browserify modules/client_main.js > static_files/bundle.js
#cp cpp_module/a.out.wasm static_files/
#browserify modules/web_worker_main.js > static_files/web_worker.js
#uglifyjs -m < static_files/bundle.js > static_files/bundle.min.js
#uglifyjs -m < static_files/web_worker.js > static_files/web_worker.min.js
#uglifycss static_files/style.css > static_files/style.min.css
(cd static_files; python3 ../process_html.py .)
gzip -9 -k -f static_files/index.html
gzip -9 -k -f static_files/tf.min.js
#gzip -9 -k -f static_files/tf.min.js

#cp static_files/index.html docs/

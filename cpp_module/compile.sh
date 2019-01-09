emcc process_prob_map.cpp -std=c++14 -O2 -s EXTRA_EXPORTED_RUNTIME_METHODS="['cwrap']" -s EXPORTED_FUNCTIONS="['_malloc','_free']" -s WASM=1 

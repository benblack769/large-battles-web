#include <emscripten/emscripten.h>

using namespace std;

/*class ProbMap {

}
function example_prob_map(){
    const xsize = 35;
    const ysize = 35;
    let res = new Array(ysize);
    for(var y = 0; y < ysize; y++){
        let row = new Array(xsize)
        for(var x = 0; x < xsize; x++){
            row[x] = x/xsize+y/ysize;
        }
        res[y] = row
    }
    return res
}*/
extern "C"{
    int EMSCRIPTEN_KEEPALIVE add(int x, int y){
        return x + y;
    }
    int * EMSCRIPTEN_KEEPALIVE malc(){
        int * res =  new int[1000];
        res[0] = 97;
        res[1] = 192;
        return res;
    }
    int EMSCRIPTEN_KEEPALIVE sum_array(double * array){
        double sum = 0;
        for(int i = 0; i < 3; i++){
            sum += array[i];
        }
        return sum;
    }
}

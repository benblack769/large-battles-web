#include <emscripten/emscripten.h>

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
}
int main(){
    
}

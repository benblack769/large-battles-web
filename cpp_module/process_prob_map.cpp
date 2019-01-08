#include <random>
#include <cassert>
#include <vector>
#include "array_view.hpp"
#include "coords.hpp"

#ifndef RUN_TEST
#include <emscripten/emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE
#endif

#ifdef RUN_TEST
#include <iostream>
#endif


using namespace std;


int num_binary_dims=0;
std::default_random_engine generator;

class DiscreteFloatDistribution{
    vector<float> prob_cumsum;
public:
    DiscreteFloatDistribution(float * array, int length):
        prob_cumsum(length+1){
        float sum = 0;
        for(int i = 0; i < length; i++){
            prob_cumsum[i] = sum;
            sum += array[i];
        }
        prob_cumsum[length] = sum;
    }
    template<class generator>
    int operator()(generator & gen){
        uniform_real_distribution<float> dist(0,prob_cumsum.back());
        float val = dist(gen);
        int idx = find_idx(val,0,prob_cumsum.size());
        assert(idx < 1225);
        return idx;
    }
protected:
    int find_idx(float val,int low, int high){
        int mid = (low + high) / 2;
        if(prob_cumsum[mid+1] <= val){
            return find_idx(val,mid+1,high);
        }
        else if(prob_cumsum[mid] > val){
            return find_idx(val,low,mid);
        }
        else{
            return mid;
        }
    }
};
ArrayView2d example_prob_map(){
    static float * data = new float[game_size.x*game_size.y];
    ArrayView2d map = to_array2d(data,game_size.x,game_size.y);
    for(int y = 0; y < game_size.y; y++){
        for(int x = 0; x < game_size.x; x++){
            map[y][x] = x/float(game_size.x)+y/float(game_size.y);
        }
    }
    return map;
}

extern "C"{
    void EMSCRIPTEN_KEEPALIVE setGameSize(int x, int y){
        game_size.x = x;
        game_size.y = y;
    }
    void EMSCRIPTEN_KEEPALIVE setNumConvertDims(int ndims){
        num_binary_dims = ndims;
    }
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
    Coord * EMSCRIPTEN_KEEPALIVE sample_prob_map(ArrayView2d map,int num_samples){
        DiscreteFloatDistribution dist(map.data_ptr(),map.flatten().length());
        Coord * res = new Coord[num_samples];
        for(int i = 0; i < num_samples; i++){
            res[i] = game_size.idx_to_coord(dist(generator));
        }
        return res;
    }
    float * EMSCRIPTEN_KEEPALIVE make_train_comparitors(Coord * coords,float * calc_probs_data, int num_samples){
        ArrayView2d prob_map = to_array2d(calc_probs_data,game_size.y,game_size.x);
        float * res = new float[num_samples];
        for(int i = 0; i < num_samples; i++){
            res[i] = at(prob_map,coords[i]);
        }
        return res;
    }
    float * EMSCRIPTEN_KEEPALIVE make_train_examples(Coord * coords, float * bin_map_data, int num_samples,int radius){
        ArrayView3d bin_map = to_array3d(bin_map_data,game_size.y,game_size.x,num_binary_dims);
        ArrayView4d train_ips = new_array4d(num_samples,game_size.y,game_size.x,num_binary_dims);
        vector<float> zero_array(num_binary_dims);
        ArrayView1d zarr_view = to_array1d(zero_array.data(),zero_array.size());
        for(int i = 0; i < num_samples; i++){
            iter_around(Coord{0,0},radius,[&](Coord c){
                Coord mapc = c + coords[i];
                ArrayView1d bin_data = in_bounds(bin_map,mapc) ? at(bin_map,mapc) : zarr_view;
                ArrayView1d train_outs = at(train_ips[i],c);
                for(int j = 0; j < num_binary_dims; j++){
                    train_outs[j] = bin_data[j];
                }
            });
        }
        return train_ips.data_ptr();
    }
}
#ifdef RUN_TEST
void print_coord(Coord c){
    cout << "{ \n\tx: " << c.x << ", \n\ty: " << c.y << "\n}";
}
int main(){
    int num_samples = 10;
    Coord * cs = sample_prob_map(example_prob_map(),num_samples);
    for(int i = 0; i < num_samples; i++){
        print_coord(cs[i]);
    }
    cout << add(1,2) << endl;
}
#endif

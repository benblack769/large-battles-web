#pragma once
#include <cassert>

class ArrayView{
protected:
    float * data;
    size_t d1;
public:
    ArrayView(float * in_data,size_t * in_d_sizes){
        data = in_data;
        d1 = in_d_sizes[0];
    }
    float & operator [](size_t idx){
        return data[idx];
    }
    ArrayView flatten(){
        return *this;
    }
    size_t length(){
        return d1;
    }
    float * data_ptr(){
        return data;
    }
    float * begin(){
        return data;
    }
    float * end(){
        return data + d1;
    }
    bool in_bounds(size_t idx){
        return idx < d1;
    }
};
template<size_t ndims>
class MultiArrayView {
protected:
    float * data;
    size_t d_sizes[ndims];
    size_t incr;//product of lower order dimention sizes
public:
    MultiArrayView(float * in_data,size_t * in_d_sizes){
        data = in_data;
        for(size_t i = 0; i < ndims; i++){
            d_sizes[i] = in_d_sizes[i];
        }
        incr = 1;
        for(size_t i = 1; i < ndims; i++){
            incr *= in_d_sizes[i];
        }
    }
    MultiArrayView<ndims-1> operator [](size_t idx){
        return MultiArrayView<ndims-1>(data+incr*idx,&d_sizes[1]);
    }
    bool in_bounds(size_t idx){
        return idx < d_sizes[0];
    }
    ArrayView flatten(){
        size_t tot_len = incr * d_sizes[0];
        return ArrayView(data,&tot_len);
    }
    float * data_ptr(){
        return data;
    }
};
template<>
class MultiArrayView<1>: public ArrayView{
public:
    MultiArrayView(float * in_data,size_t * in_d_sizes):
        ArrayView(in_data,in_d_sizes){}
    MultiArrayView(ArrayView arr):
        ArrayView(arr){}
};
using ArrayView1d = MultiArrayView<1>;
using ArrayView2d = MultiArrayView<2>;
using ArrayView3d = MultiArrayView<3>;
using ArrayView4d = MultiArrayView<4>;
inline ArrayView1d to_array1d(float * data,size_t d1){
    size_t dims[1] = {d1};
    return ArrayView1d(data,dims);
}
inline ArrayView2d to_array2d(float * data,size_t d1,size_t d2){
    size_t dims[2] = {d1,d2};
    return ArrayView2d(data,dims);
}
inline ArrayView3d to_array3d(float * data,size_t d1,size_t d2,size_t d3){
    size_t dims[3] = {d1,d2,d3};
    return ArrayView3d(data,dims);
}
inline ArrayView4d to_array4d(float * data,size_t d1,size_t d2,size_t d3,size_t d4){
    size_t dims[4] = {d1,d2,d3,d4};
    return ArrayView4d(data,dims);
}
inline ArrayView4d new_array4d(size_t d1,size_t d2,size_t d3,size_t d4){
    int data_size = d1*d2*d3*d4;
    float * data = new float[data_size];
    return to_array4d(data,d1,d2,d3,d4);
}

template<class AVType, class Coord2dType>
auto at(AVType av,Coord2dType c){
    return av[c.y][c.x];
}
template<class AVType, class Coord2dType>
auto in_bounds(AVType av,Coord2dType c){
    return av.in_bounds(c.y) && av[c.y].in_bounds(c.x);
}

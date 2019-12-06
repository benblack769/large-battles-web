#pragma once

#include <vector>
#include <utility>
#include <algorithm>
#include <initializer_list>
#include <stdexcept>
#include "helpers/point.hpp"

template<typename Ty>
class DArraySlice {
public:
	Ty * Ptr;
	size_t Size;
	DArraySlice() = delete;//default constructor does not make sense since the Slice does not hold its own data
	DArraySlice(Ty * InPtr, int InSize) {
		Ptr = InPtr;
		Size = InSize;
	}
	//this is really a move constructor in implementation!!!!!!
	DArraySlice(const DArraySlice & Other) {
		Ptr = Other.Ptr;
		Size = Other.Size;
	}
	DArraySlice & operator = (DArraySlice & Other) {
        if (Size == Other.Size){
			copy_n(this->begin(), Size, Other);
        }
		else {
			throw std::invalid_argument("DArraySlice of different sizes assigned");
		}
	}
	Ty * operator &() {
		return Ptr;
	}
	Ty & at(int x){
		if(!(x >= 0 && x < Size)){
			throw std::runtime_error("darrayslice had index out of bounds");
		}
		return Ptr[x];
	}
	Ty & operator [](int X) {
		return Ptr[X];
	}
	Ty * begin() {
		return Ptr;
	}
	Ty * end() {
		return Ptr + Size;
	}
	size_t size() {
		return Size;
	}
};
template<typename Ty>
class DArray2d {
public:
	class iterator {
	public:
		Ty * pos;
        int width;
		DArraySlice<Ty> operator *() {
            return DArraySlice<Ty>(pos, width);
		}
		bool operator !=(iterator & Other) {
			return this->pos < Other.pos;
		}
		void operator ++() {
            pos += width;
		}
	};
	std::vector<Ty> Data;
    int height;
    int width;
    DArray2d(int Width, int Height) {
        height = Height;
        width = Width;
        Data.resize(height * width);
	}
    DArray2d(Point p):
        DArray2d(p.y,p.x){}

    DArray2d() { height = 0; width = 0; }
	DArray2d(DArray2d & Other) {
		*this = Other;
	}
	DArray2d(DArray2d && Other) {
		*this = Other;
	}
	DArray2d & operator = (DArray2d & Other) {
        height = Other.height;
        width = Other.width;
		Data = Other.Data;
		return *this;
	}
	void operator = (DArray2d && Other) {
        height = Other.height;
        width = Other.width;
		Data = std::move(Other.Data);
	}
	DArraySlice<Ty> at(int x){
        if(!(x >= 0 && x < width)){
			throw std::runtime_error("index out of bounds");
		}
		return (*this)[x];
	}
    DArraySlice<Ty> operator[](int y) {
        return DArraySlice<Ty>(Data.data() + y*width, width);
    }
    Ty & operator[](Point P)  {
        return Data[P.y*width + P.x];
    }
    const Ty & operator[](Point P)const  {
        return Data[P.y*width + P.x];
    }
    bool in_bounds(Point P)const{
        return P.x >= 0 && P.x < width &&
                P.y >= 0 && P.y < height;
    }
    Point shape()const{
        return Point{width,height};
    }
    const Ty & at(Point P)const{
        if(!in_bounds(P)){
			throw std::runtime_error("point index out of bounds");
		}
        return Data[P.y*width + P.x];
	}
	iterator begin() {
        return iterator{ Data.data(), width };
	}
	iterator end() {
        return iterator{ Data.data() + Data.size(), width };
    }
};

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
		if (Size == Other.Size)
			copy_n(this->begin(), Size, Other);
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
		int height;
		DArraySlice<Ty> operator *() {
			return DArraySlice<Ty>(pos, height);
		}
		bool operator !=(iterator & Other) {
			return this->pos < Other.pos;
		}
		void operator ++() {
			pos += height;
		}
	};
	std::vector<Ty> Data;
	int Height;
	int Width;
    DArray2d(int D1, int D2) {
        Height = D1;
        Width = D2;
        Data.resize(Height * Width);
	}
	DArray2d() { Height = 0; Width = 0; }
	DArray2d(DArray2d & Other) {
		*this = Other;
	}
	DArray2d(DArray2d && Other) {
		*this = Other;
	}
	DArray2d & operator = (DArray2d & Other) {
		Height = Other.Height;
		Width = Other.Width;
		Data = Other.Data;
		return *this;
	}
	void operator = (DArray2d && Other) {
		Height = Other.Height;
		Width = Other.Width;
		Data = std::move(Other.Data);
	}
	DArraySlice<Ty> at(int x){
		if(!(x >= 0 && x < Width)){
			throw std::runtime_error("index out of bounds");
		}
		return (*this)[x];
	}
	DArraySlice<Ty> operator[](int Y) {
		return DArraySlice<Ty>(Data.data() + Y*Height, Height);
    }
    Ty & operator[](Point P)  {
        return Data[P.Y*Height + P.X];
    }
    const Ty & operator[](Point P)const  {
        return Data[P.Y*Height + P.X];
    }
    bool in_bounds(Point P)const{
        return P.X >= 0 && P.X < Width &&
                P.Y >= 0 && P.Y < Height;
    }
    Point shape()const{
        return Point(Height,Width);
    }
    const Ty & at(Point P)const{
        if(!in_bounds(P)){
			throw std::runtime_error("point index out of bounds");
		}
        return Data[P.Y*Height + P.X];
	}
	iterator begin() {
		return iterator{ Data.data(), Height };
	}
	iterator end() {
		return iterator{ Data.data() + Data.size(), Height };
	}
	int dim1() {
		return Width;
	}
	int dim2() {
		return Height;
	}
};

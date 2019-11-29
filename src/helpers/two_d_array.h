#pragma once

#include <vector>
#include <utility>
#include <algorithm>
#include <initializer_list>
#include <stdexcept>
#include <point.hpp>

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
		resize_w_loss(D1, D2);
	}
	DArray2d() { Height = 0; Width = 0; }
	DArray2d(std::initializer_list<std::initializer_list<Ty>> list) {
		if (list.size() > 0) {
			int low_size = (*list.begin()).size();
			for (std::initializer_list<Ty> sub_l : list) {
				if (low_size != sub_l.size())
					throw std::invalid_argument("sub arguments of DArray2d initialization are different!");
				for (Ty data : sub_l){
					Data.push_back(data);
				}
			}
			Height = low_size;
			Width = list.size();
		}
	}
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
	DArraySlice<Ty> operator[](int Y) {
		return DArraySlice<Ty>(Data.data() + Y*Height, Height);
	}
	Ty & operator[](Point P) {
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

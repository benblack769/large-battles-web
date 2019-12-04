#pragma once
//range iterator for use in for loop
//an "each" iterator that allows iteration with iterators
//an "each" iterator that allows iteration with two iterators
//an "over" iterator that allow iteration with two containers
/*
Example:
for(int x:range(100){
	//do something 100 times, x going from 0-99
}
for(int x:range(10,50)){
	//do something with x going from 10-49
}
for(int x:range(50,10,-1){
	//do something iterating backwards from 50 to 11
}*/
#include <inttypes.h>

template<typename Type>
struct RangeIncr{
    struct RangeIteratorForward{
        Type x;
        bool operator != (RangeIteratorForward & Other){
            return x < Other.x;
        }
        void operator ++ (){
            x++;
        }
        Type operator *(){
            return x;
        }
    };
    RangeIteratorForward Start;
    RangeIteratorForward End;
    RangeIncr(Type InStart, Type InEnd){
        Start = RangeIteratorForward{ InStart };
        End = RangeIteratorForward{InEnd};
    }
    RangeIteratorForward & begin(){
        return Start;
    }
    RangeIteratorForward & end(){
        return End;
    }
};
inline RangeIncr<size_t> range(size_t start,size_t end){
    return RangeIncr<size_t>(start,end);
}
inline RangeIncr<size_t> range(size_t end){
    return RangeIncr<size_t>(0,end);
}


template<typename EnumType>
struct EnumRange{
    struct EnumIterator{
        int x;
        bool operator != (EnumIterator & Other){
            return x < Other.x;
        }
        void operator ++ (){
            x++;
        }
        EnumType operator *(){
            return static_cast<EnumType>(x);
        }
    };
    EnumIterator End;
    EnumRange(EnumType InEnd){
        End = EnumIterator{static_cast<int>(InEnd)};
    }
    EnumIterator begin(){
        return EnumIterator{0};
    }
    EnumIterator end(){
        return End;
    }
};
template<typename EnumType>
inline EnumRange<EnumType> enum_range(EnumType end){
    return EnumRange<EnumType>(end);
}

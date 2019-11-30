#pragma once
#include <cstdlib>
#include <cstdint>
#include <cmath>
#include <algorithm>
#include <unordered_map>

struct Point{
    int32_t X;
    int32_t Y;
    Point():X(0),Y(0){}
    Point(int32_t inX,int32_t inY):X(inX),Y(inY){}
};
inline Point abs(Point P){
    return Point(abs(P.X), abs(P.Y));
}
inline bool operator==(Point P1, Point P2){
    return P1.X == P2.X && P1.Y == P2.Y;
}
inline bool operator!=(Point P1, Point P2){
    return !(P1 == P2);
}
inline void operator += (Point & P1, Point P2){//refrence first
    P1.X += P2.X;
    P1.Y += P2.Y;
}
inline Point operator + (Point P1, Point P2){//do not make Point a refrence!!!
    //P1 is copied, so the += do not affect the original
    P1 += P2;
    return P1;
}
inline Point operator - (Point P){//do not refrence!
    P.X = -P.X;
    P.Y = -P.Y;
    return P;
}
inline void operator -= (Point & P1, Point P2){//refrence first!
    P1.X -= P2.X;
    P1.Y -= P2.Y;
}
inline Point operator - (Point P1, Point P2){//do not refrence!
    P1 -= P2;
    return P1;
}
template <typename NumType>
inline void operator *= (Point & P1, NumType Num){//refrence first
    P1.X *= Num;
    P1.Y *= Num;
}
template <typename NumType>
inline void operator /= (Point & P1, NumType Num){//refrence first
    P1.X /= Num;
    P1.Y /= Num;
}
template <typename NumType>
inline Point operator * (Point P1, NumType Mult){
    P1 *= Mult;
    return P1;
}
template <typename NumType>
inline Point operator / (Point P1, NumType Mult){
    P1 /= Mult;
    return P1;
}
namespace std{
    template<>
    struct hash<Point>{
        size_t operator()(const Point & P)const{
            return hash<int64_t>()(P.X | (int64_t(P.Y) << 32));
        }
    };
}
template<typename InfoType>
struct PointInfo{
    Point P;
    InfoType * Data;
    PointInfo(){
        P = { 0, 0 };
        Data = NULL;
    }
    PointInfo(Point InP, InfoType * InInfo){
        P = InP;
        Data = InInfo;
    }
    InfoType & Info(){
        return *Data;
    }
    void SetInfo(InfoType InInfo){
        Info() = InInfo;
    }
};
//this type is there to allow better safety and consistency
//for dealing with dealing with squares
struct ConstSquare{
    Point Cen;
    int Range;
    ConstSquare():Cen(0,0),Range(0){}
    ConstSquare(Point InCen, int InRange){
        Cen = InCen;
        Range = InRange;
    }
    //disallow assignment to help ensure constness
    void operator =(ConstSquare Other) = delete;
};
class PointIter{
public:
    PointIter(int xstart, int ystart, int xend, int yend):
        P(xstart,ystart),
        XCap(xend),
        YCap(yend),
        XLow(xstart)
    {}
    PointIter():
        PointIter(0,0,0,0){}

    bool NotEnd(){
        return P.Y < YCap;
    }
    bool operator != (const PointIter & ){
        return NotEnd();
    }
    void operator++ (){
        P.X++;
        if (P.X >= XCap){
            P.Y++;
            P.X = XLow;
        }
    }
    Point operator * (){
        return P;
    }
private:
    Point P;
    int XCap,YCap,XLow;
};
class PIterContainter
{
public:
    PointIter EndIter,StartIter;
    PIterContainter(int xstart, int ystart, int xend, int yend):
        EndIter(xstart, ystart, xend, yend),
        StartIter(EndIter){}
    PointIter & begin(){
        return StartIter;
    }
    PointIter & end(){
        return EndIter;
    }
};

function find_idx(arr,val,low,high){
    var mid = Math.floor((low + high) / 2);
    if(arr[mid+1] <= val){
        return find_idx(arr,val,mid+1,high);
    }
    else if(arr[mid] > val){
        return find_idx(arr,val,low,mid);
    }
    else{
        return mid;
    }
}
class DiscreteDistribution {
    constructor(val_array){
        var length = val_array.length;
        var prob_cumsum = new Array(length+1);
        var sum = 0;
        for(var i = 0; i < length; i++){
            prob_cumsum[i] = sum;
            sum += val_array[i];
        }
        prob_cumsum[length] = sum;
        this.prob_cumsum = prob_cumsum
        this.final = sum
    }
    sample(){
        var search_val = Math.random()*this.final
        var idx = find_idx(this.prob_cumsum,search_val,0,this.prob_cumsum.length)
        return idx
    }
}
function sample_fixed_num(array,num){
    var res = new Array(num)
    for(var i = 0; i < num; i++){
        res[i] = array[randInt(array.length)]
    }
    return res
}
function sample_array(array){
    return array[randInt(array.length)]
}

function randInt(max){
    return Math.floor(Math.random()*max)
}
function swap(arr,i1,i2){
    var v = arr[i1]
    arr[i1] = arr[i2]
    arr[i2] = v
}
function shuffle(arr){
    for(var i = 0; i < arr.length; i++){
        swap(arr,i,randInt(arr.length))
    }
}
module.exports = {
    randInt: randInt,
    shuffle: shuffle,
    sample_array: sample_array,
    sample_fixed_num: sample_fixed_num,
    DiscreteDistribution: DiscreteDistribution
}

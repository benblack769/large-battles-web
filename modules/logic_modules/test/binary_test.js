var test = require('tape')
var CoordMapper = require('../to_binary.js').CoordMapper
var init_game = require('../init_game.js')
var create_utils = require('../create_utils.js')

function get_all_equal_idxs(vec,val){
    var idxs = []
    for(var i = 0; i < vec.length; i++){
        if(vec[i] === val){
            idxs.push(i)
        }
    }
    return idxs
}
class InverseMapper{
    constructor(mapper){
        this.min_idx = Math.min.apply(null,Object.values(mapper))
        this.max_idx = Math.max.apply(null,Object.values(mapper))
        this.slicelen = this.max_idx + 1 - this.min_idx
        this.inv_mapper = {}
        for(var key in mapper){
            this.inv_mapper[mapper[key]] = key
        }
        console.log(JSON.stringify(this.inv_mapper))
    }
    relevant_slice(vec){
        return vec.slice(this.min_idx,this.max_idx+1)
    }
    getValueDict(cvec){
        var svec = this.relevant_slice(cvec)
        var valdict = {}
        for(var i = 0; i < svec.length; i++){
            var val = svec[i]
            var name = this.inv_mapper[i+this.min_idx]
            valdict[name] = val
        }
        console.log("vec")
        console.log(svec)
        console.log(cvec)
        return valdict
    }
    getUniqStr(cvec){
        var svec = this.relevant_slice(cvec)
        var idx = svec.indexOf(1.0)
        return this.inv_mapper[idx+this.min_idx]
    }
    getStrList(cvec){
        var svec = this.relevant_slice(cvec)
        var idxs = get_all_equal_idxs(svec,1.0)
        return idxs.map((idx)=>this.inv_mapper[idx+this.min_idx])
    }
}
class InvCoordMapper {
    constructor(stats,players,myplayer){
        var coordmapper = new CoordMapper(stats,players,myplayer)
        this.unit_invmapper = new InverseMapper(coordmapper.unit_mapper)
        this.attach_invmapper = new InverseMapper(coordmapper.attach_mapper)
        this.player_invmapper = new InverseMapper(coordmapper.player_mapper)
        this.status_invmapper = new InverseMapper(coordmapper.status_mapper)
    }
    invertCoordData(coordvec){
        if(coordvec[0]){
            return undefined
        }
        else if(coordvec[1]){
            return "E"
        }
        else{
            var unit = this.unit_invmapper.getUniqStr(coordvec)
            var player = this.player_invmapper.getUniqStr(coordvec)
            var attach = this.attach_invmapper.getStrList(coordvec)
            var status = this.status_invmapper.getValueDict(coordvec)
            return {
                "category": "unit",
                "player": player,
                "unit_type": unit,
                "status": status,
                "attachments": attach,
            }
        }
    }
}

function make_stats(){
    return {
        "unit_types": {
            "cheap_building": {
            },
            "unit_making_building": {
            },
            "attachment_making_building": {
            },
        },
        "attachment_types": {
            "basic_attachment":{
            },
            "another_attachment":{
            }
        }
    }
}
function players_order(){
    return [
        "p1",
        "p2",
    ]
}

function at(map, coord){
    return map[coord.y][coord.x]
}
function is_obj(o){
    return typeof o === 'object' && o !== null
}
function numify_status(unit_data){
    if(is_obj(unit_data)){
        for(var k in unit_data.status){
            unit_data.status[k] = Number(unit_data.status[k])
        }
    }
    return unit_data
}
function ee(){
    return create_utils.create_empty()
}
function U1(){
    return (create_utils.create_unit("unit_making_building", "p1"))
}
function E1(){
    return (create_utils.create_unit("attachment_making_building", "p1"))
}
function A1(){
    return (create_utils.create_unit("attachable_unit", "p1"))
}
function deep_equals(o1,o2){
    console.log(o1)
    console.log(o2)
    return JSON.stringify(o1) === JSON.stringify(o2)
}
function validate_bidirection(unitdata,player){
    var cmapper = new CoordMapper(make_stats(),players_order(),player)
    var invmapper = new InvCoordMapper(make_stats(),players_order(),player)
    var vec = cmapper.coord_to_vec(unitdata)
    var invres = invmapper.invertCoordData(vec)
    return deep_equals(invres,numify_status(unitdata))
}
test('validate_binary', function (t) {
    t.true(validate_bidirection(U1(),"p1"))
    t.true(validate_bidirection(U1(),"p2"))
    t.true(validate_bidirection(ee(),"p2"))
    t.true(validate_bidirection(undefined,"p2"))
    t.end()
})

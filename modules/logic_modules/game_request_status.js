function ClientInfo(on_add_waiting, on_remove_waiting, on_add_requester, on_disconnect, on_error){
    /*
    Each client is a state machine

    authenticated: all authenticated objects are on waiting list, no other states are
    authenticated -> requesting (via request)
    authenticated -> accepting (via accept_request from other, only if requested from source)
    accepting -> awaiting_game
    requesting -> awaiting_game (when request is accepted)
    disconnected -> when socket disconnects, remove state
    */
    this.client_mapping = {}
    this.is_authenticated = function(client_id){
        return client_id && this.client_mapping[client_id] !== undefined
    }
    this.authenticated = function(client_id, client_info){
        if(this.is_authenticated(client_id)){
            on_error(client_id, "REPEATED_AUTHENTICATION")
            return false
        }
        else{
            this.client_mapping[client_id] = {
                type:"authenticated",
                client_info: client_info,
            }
            on_add_waiting(client_id)
            return true
        }
    }
    this.requesting = function(client_id, requested_client_id){
        if(client_id === requested_client_id){
            on_error(client_id, "REQUESTED_CONNECTION_TO_SELF")
        }
        else if(!this.is_authenticated(client_id)){
            on_error(client_id, "REQUESTING_WITHOUT_AUTHENTICATION")
        }
        else if(!this.is_authenticated(requested_client_id)){
            on_error(client_id, "REQUESTING_USERNAME_NOT_IN_WAITLIST")
        }
        else if(this.client_mapping[client_id].type !== "authenticated"){
            on_error(client_id, "REQUESTING_WHEN_NOT_WAITING")
        }
        else if(this.client_mapping[requested_client_id].type !== "authenticated"){
            on_error(client_id, "REQUESTING_WHEN_OTHER_NOT_WAITING")
        }
        else{
            on_remove_waiting(client_id)
            on_add_requester(this.client_mapping[requested_client_id].client_info, client_id)
            this.client_mapping[client_id] = {
                type:"reqesting",
                request_name: requested_client_id,
                client_info: this.client_mapping[client_id].client_info,
            }
            return true;
        }
        return false
    }
    this.accepting = function(client_id, accepting_client_id){
        if(!this.is_authenticated(client_id)){
            on_error(client_id, "ACCEPTING_WITHOUT_AUTHENTICATION")
        }
        else if(!this.is_authenticated(accepting_client_id)){
            on_error(client_id, "ACCEPTING_USERNAME_NOT_IN_WAITLIST")
        }
        else if(this.client_mapping[client_id].type !== "authenticated"){
            on_errorclient_id, ("ACCEPTING_WHEN_NOT_WAITING")
        }
        else if(this.client_mapping[accepting_client_id].type !== "reqesting"){
            on_error(client_id, "ACCEPTING_WHEN_OTHER_NOT_REQUESTING")
        }
        else if(this.client_mapping[accepting_client_id].request_name !== client_id){
            on_error(client_id, "ACCEPTING_WHEN_OTHER_REQUESTED_SOMEONE_ELSE")
        }
        else{
            on_remove_waiting(client_id)
            this.client_mapping[client_id] = {
                type: "awaiting_game",
                other_player: accepting_client_id,
                client_info: this.client_mapping[client_id].client_info,
            }
            this.client_mapping[accepting_client_id] = {
                type: "awaiting_game",
                other_player: client_id,
                client_info: this.client_mapping[accepting_client_id].client_info,
            }
            return true
        }
        return false
    }
    this.game_should_start = function(client1_id, client2_id){
        return (this.is_authenticated(client1_id) &&
           this.is_authenticated(client2_id) &&
           this.client_mapping[client1_id].type === "awaiting_game" &&
           this.client_mapping[client2_id].type === "awaiting_game" &&
           this.client_mapping[client1_id].other_player === client2_id &&
           this.client_mapping[client2_id].other_player === client1_id)
    }
    this.disconnected = function(client_id){
        if(this.is_authenticated(client_id)){
            on_disconnect(client_id)
            /*var client = this.client_mapping[client_id];
            if(client.type === "authenticated"){
                on_remove_waiting(client_id)
            }
            else if(client.type === "requesting"){
                if(this.is_authenticated(client.request_name)) {
                    on_remove_requester(this.client_mapping[client.request_name].client_info,client_id)
                }
            }*/
            delete this.client_mapping[client_id]
        }
    }
    this.get_client_info = function(client_id){
        console.assert(this.is_authenticated(client_id),"got unautheticated client with get_client_info")
        return this.client_mapping[client_id].client_info
    }
    this.get_waiting_list = function(){
        var res_list = []
        for(var key in this.client_mapping){
            if(this.client_mapping[key].type === "authenticated"){
                res_list.push(key)
            }
        }
        return res_list
    }
}

module.exports = {
    ClientInfo: ClientInfo,
}

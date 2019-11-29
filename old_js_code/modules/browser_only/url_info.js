function http_url(url, port, extension){
    return  url + ":" + port + extension
}
module.exports = {
    connect_server_port: 9003,
    connect_server_url: "localhost",//"192.168.0.23",//"ec2-35-165-130-155.us-west-2.compute.amazonaws.com",
    user_server_full_url: "http://localhost:8803",//"ec2-35-165-130-155.us-west-2.compute.amazonaws.com",
}

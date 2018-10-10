
install turnserver like:

    sudo yum install coturn

run turnserver arguments:

* -p  port number (needs to match with port in ice url)
* -a  authorization (needs to be set for WebRTC)
* -u  user:password (needs to match with user, credential in ice information)
* -r realm (is needed for WebRTC, not clear why though, but it doesn't work without it. Doesn't appear that the exact value of the realm matters, make it nonsense if you want)

    turnserver -p 3478 -a -u benblack:mky34769 -r laks

ice config


    {
        # external ip of turn server, port that turnserver is listening on. Port nees to correspond with arguments
        url: 'turn:35.165.130.155:3478',
        username: 'benblack', # needs to be same as username in arguments
        credential: 'mky34769' #needs to be same as passwors in arguments
    }

function createPeer (user) {
    const rtcConfiguration = {
        iceServers: [{
          urls: 'stun:stun.l.google.com:19302' // Google's public STUN server
        }]
    }
    var pc = new RTCPeerConnection(rtcConfiguration)
    pc.onicecandidate = function (event) {
        if(!event.candidate) {
            return
        }

        socket.emit('candidate', {
            id: user.id,
            candidate: event.candidate
        })
    }

    for (const track of myStream.getTracks()) {
        pc.addTrack(track, myStream);
    }

    pc.ontrack = function (event) {
        if (user.player) {
            return
        }
        user.player = addVideoPlayer(event.streams[0])
    }
    
    return pc
}

function createOffer(pc, id, socket) {
    pc.createOffer().then(function (offer) {
        pc.setLocalDescription(offer).then(function () {
            socket.emit('offer', {
                id: id,
                offer: offer
            })
        })
    })
}

function answerPeer (pc, offer, id, socket) {
    pc.setRemoteDescription(offer).then(function () {
        pc.createAnswer().then(function(answer) {
            pc.setLocalDescription(answer).then(function() {
                socket.emit('answer', {
                    id: id,
                    answer: answer
                })
            })
        })
    })
}
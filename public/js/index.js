var getUserMedia
var myStream
var socket
const users = new Map()

const { RTCPeerConnection, RTCSessionDescription } = window;

document.addEventListener('DOMContentLoaded', function() {
    showLoading()
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(function (stream) {
            myStream = stream
            setLocalPlayerStream()
            showForm()
        }).catch(function (err) {
            console.log(err)
            showFail()
        })
}, false)

document.getElementById('join').addEventListener('click', function (e) {
    e.preventDefault()
    room = document.getElementById('inputRoom').value

    if (room) {
        socket = initServerConnection(room)
    }
})

document.getElementById('leave').addEventListener('click', function (e) {
    e.preventDefault()
    leave()
})

function initServerConnection(room) {
    var socket = io({
        query : {
            room: room
        }
    })

    socket.on('disconnect-user', function (data) {
        var user = users.get(data.id)
        if(user) {
            users.delete(data.id)
            removeElement(data.id)
            destroyPeer(user.pc)
        }
    })
    
    socket.on('call',  function (data) {
        var pc = createPeer(data.id)
        let user = {
            id: data.id,
            pc: pc
        }
        users.set(data.id, user)

        pc.createOffer().then(function (offer) {
            pc.setLocalDescription(offer).then(function () {
                socket.emit('offer', {
                    id: data.id,
                    offer: offer
                })
            })
        })
    })

    socket.on('offer',  function (data) {
        var user = users.get(data.id)
        if (user) {
            user.pc.setRemoteDescription(data.offer).then(function () {
                pc.createAnswer().then(function(answer) {
                    pc.setLocalDescription(answer).then(function() {
                        socket.emit('answer', {
                            id: data.id,
                            answer: answer
                        })
                    })
                })
            })
        } else {
            var pc = createPeer(data.id)

            let user = {
                id: data.id,
                pc: pc
            }
            users.set(data.id, user)

            pc.setRemoteDescription(data.offer).then(function () {
                pc.createAnswer().then(function(answer) {
                    pc.setLocalDescription(answer).then(function() {
                        socket.emit('answer', {
                            id: data.id,
                            answer: answer
                        })
                    })
                })
            })
        }
    })

    socket.on('answer',  function (data) {
        var user = users.get(data.id)
        if(user) {
            user.pc.setRemoteDescription(data.answer)
        }
    })

    socket.on('candidate', function (data) {
        var user = users.get(data.id)
        if (user) {
            user.pc.addIceCandidate(data.candidate)
        } else {
            var pc = createPeer(data.id)
            pc.addIceCandidate(data.candidate)

            let user = {
                id: data.id,
                pc: pc
            }
            users.set(data.id, user)
        }
    })
    
    socket.on('connect', function () {
        showPlayers()
    })

    socket.on('connect_error', function(error) {
        console.log('Connection ERROR!')
        console.log(error)
        leave()
    })
    
    return socket
}

function createPeer (remoteSocketId) {
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
            id: remoteSocketId,
            candidate: event.candidate
        })
    }

    for (const track of myStream.getTracks()) {
        pc.addTrack(track, myStream);
    }

    pc.ontrack = function (event) {
        if (document.getElementById(remoteSocketId)) {
            return
        }
        addVideoPlayer(remoteSocketId, event.streams[0])
    }
    
    return pc
}

function destroyPeer (pc) {
    pc.close()
    pc.onicecandidate = null
    pc.ontrack = null
    pc = null
}

function leave() {
    socket.close()
    for(user in users) {
        removeElement(data.id)
        destroyPeer(user.pc)
    }
    users.clear()
    showForm()
}
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

    document.getElementById('roomForm').addEventListener('submit', function (e) {
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

    var elems = document.querySelectorAll('.materialbox')
    M.Materialbox.init(elems)

}, false)

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
            user.selfDestroy()
        }
    })
    
    socket.on('call',  function (data) {
        let user = new User(data.id)
        user.pc = createPeer(user)
        users.set(data.id, user)

        createOffer(user.pc, data.id, socket)
    })

    socket.on('offer',  function (data) {
        var user = users.get(data.id)
        if (user) {
            answerPeer(user.pc, data.offer, data.id, socket)
        } else {
            let user = new User(data.id)
            user.pc = createPeer(user)
            users.set(data.id, user)
            answerPeer(user.pc, data.offer, data.id, socket)
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
            let user = new User(data.id)
            user.pc = createPeer(user)
            user.pc.addIceCandidate(data.candidate)
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

function leave() {
    socket.close()
    for(var user of users.values()) {
        user.selfDestroy()
    }
    users.clear()
    showForm()
}
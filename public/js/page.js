function showLoading() {
    showPanel('loading')
    hidePannel('fail')
    hidePannel('connect')
    hidePannel('players')
}

function showFail() {
    hidePannel('loading')
    showPanel('fail')
    hidePannel('connect')
    hidePannel('players')
}

function showForm() {
    hidePannel('loading')
    hidePannel('fail')
    showPanel('connect')
    hidePannel('players')
}

function showPlayers() {
    hidePannel('loading')
    hidePannel('fail')
    hidePannel('connect')
    showPanel('players')
}

function addVideoPlayer(id, stream) {
    var player = document.createElement('video')
    player.id = id
    player.srcObject = stream
    player.autoplay = true
    document.getElementById('players').appendChild(player)
}

function removeElement(id) {
    var element = document.getElementById(id)
    element.parentNode.removeChild(element)
}

function hidePannel(name) {
    document.getElementById(name).style.display = "none"
}

function showPanel(name) {
    document.getElementById(name).style.display = "block"
}

function setLocalPlayerStream() {
    document.getElementById('local-player').srcObject = myStream
}
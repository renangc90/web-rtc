function showLoading() {
    showPanel('loading')
    hidePanel('fail')
    hidePanel('connect')
    hidePanel('players')
}

function showFail() {
    hidePanel('loading')
    showPanel('fail')
    hidePanel('connect')
    hidePanel('players')
}

function showForm() {
    hidePanel('loading')
    hidePanel('fail')
    showPanel('connect')
    hidePanel('players')
}

function showPlayers() {
    hidePanel('loading')
    hidePanel('fail')
    hidePanel('connect')
    showPanel('players')
}

function addVideoPlayer(stream) {
    var player = document.createElement('video')
    player.srcObject = stream
    player.autoplay = true
    document.getElementById('players').appendChild(player)

    return player
}

function hidePanel(name) {
    document.getElementById(name).style.display = "none"
}

function showPanel(name) {
    document.getElementById(name).style.display = "block"
}

function setLocalPlayerStream() {
    document.getElementById('local-player').srcObject = myStream
}
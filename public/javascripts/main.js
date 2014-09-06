console.log('<%= id %>');
var webrtc = new SimpleWebRTC({
    localVideoEl: 'localVideo',
    remoteVideosEl: 'remotesVideos',
    autoRequestMedia: true
});

webrtc.on('readyToCall', function () {
    webrtc.joinRoom('<%= id %>');
});

var socket = io('/<%= id %>');
var changing = false;

socket.on('editorCallback', function(data){
    changing = true;
    editor.setValue(data.newValue);
    editor.clearSelection()
    changing = false;
});

var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/javascript");

editor.getSession().on('change', function(e){
    if(!changing){
        var data = {    
            newValue: editor.getValue()
        }
        socket.emit('editorChange', data);
    }
});
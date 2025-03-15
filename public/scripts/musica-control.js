document.getElementById('boton-reproducir').addEventListener('click', function() {
    var audio = document.getElementById('musica-juego');
    audio.play();
});

document.getElementById('boton-pausa').addEventListener('click', function() {
    var audio = document.getElementById('musica-juego');
    audio.pause();
});
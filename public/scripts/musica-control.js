// Configurar el volumen global cuando cargue la página
window.onload = function() {
    var audio = document.getElementById('musica-juego');
    audio.volume = 0.3; // Volumen al 70%
};

document.getElementById('boton-reproducir').addEventListener('click', function() {
    var audio = document.getElementById('musica-juego');
    audio.play();
});

document.getElementById('boton-pausa').addEventListener('click', function() {
    var audio = document.getElementById('musica-juego');
    audio.pause();
});

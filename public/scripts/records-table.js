// Funcion para obtener los records desde nuestro local storage
function cargarRecords(){
    const playersJSON = localStorage.getItem('players');
    
    if (playersJSON){
        const players = JSON.parse(playersJSON);
        const tbody = document.querySelector('.tabla-records tbody');
        tbody.innerHTML = '';

        players.sort((a, b) => b.score - a.score);

        players.forEach(player => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${player.name}</td>
                <td>${player.player}</td>
                <td>${player.score}</td>
                <td>${player.fecha}</td>
            `;
            tbody.appendChild(fila);
        });
    }

    var audio = document.getElementById('musica-juego');
    audio.volume = 0.3; // Volumen al 70%
}

window.onload = cargarRecords;


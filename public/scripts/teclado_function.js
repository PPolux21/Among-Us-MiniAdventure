const inputNombre = document.getElementById('espacio_nombre');
const letras = document.querySelectorAll('.letra');

letras.forEach(letra => {
    letra.addEventListener('click', () => {
        const letraTexto = letra.textContent;

        if (letraTexto === 'BACK') {
            inputNombre.value = inputNombre.value.slice(0, -1);
        } else if (letraTexto === 'ENTER') {
            if (inputNombre.value.length < 4) {
                //swal("Nombre muy corto :(")
                inputNombre.value = "";
                inputNombre.setAttribute('placeholder',"Nombre muy corto");
            } else {
                const selectedPlayer = localStorage.getItem('selectedPlayer');
                const fecha = new Date().toISOString().split('T')[0];

                let playersArray = JSON.parse(localStorage.getItem('players')) || [];

                const existingPlayerIndex = playersArray.findIndex(player => player.name === inputNombre.value);

                let score = 0;
                if (existingPlayerIndex !== -1) {
                    score = playersArray[existingPlayerIndex].score;
                    playersArray.splice(existingPlayerIndex, 1);
                }

                const newPlayerInfo = {
                    name: inputNombre.value,
                    player: selectedPlayer,
                    score: score,
                    fecha: fecha
                };

                playersArray.push(newPlayerInfo);

                localStorage.setItem('players', JSON.stringify(playersArray));

                
                window.location.href = 'jugar.html'; 

            }
        } else {
            if (inputNombre.value.length < 8) {
                inputNombre.value += letraTexto;
            }
        }
    });
});



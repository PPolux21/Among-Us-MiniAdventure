let canvas = document.getElementById("records-canvas");
let dip = canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 400;

let contenedor = document.querySelector(".contenedor");
contenedor.style.display = "flex";
contenedor.style.justifyContent = "center";
contenedor.style.alignItems = "center";
contenedor.style.height = "100vh";

dip.fillStyle = "transparent";
dip.fillRect(0, 0, canvas.width, canvas.height);

let textos = [
    "Puedes moverte con las flechas de tu teclado tanto a la izquierda, derecha o saltar con la\n tecla de arriba, recoge consumibles y items especiales pero cuidado se esfuman pronto",
    "Prueba a saltar y conseguir todos los robots del nivel, pero cuidado porque los impostores\nte pueden golpear y perderas una de tus vidas",
    "Llega a la meta sin que los impostores te quiten tus 3 vidas y enfréntate al gran impostor\npara lograr salir con vida y expulsarlo antes de que el te expulse a ti."
];

let imagenes = [
    "../assets/assets-menu/cruceta.png",
    "../assets/assets-menu/Dying5.png",
    "../assets/assets-menu/superImpostor.png"
];

let colIzqX = 30;
let colDerX = 230;
let startY = 30;
let rowHeight = 120;

dip.fillStyle = "white";
dip.font = "24px Georgia";
dip.textAlign = "left";

textos.forEach((texto, index) => {
    dip.fillStyle = "transparent";
    dip.fillRect(colIzqX, startY + index * rowHeight, 100, 40);
    
    let img = new Image();
    img.src = imagenes[index];
    img.onload = function () {
        dip.drawImage(img, colIzqX, startY + index * rowHeight, 140, 100);
    };

    dip.fillStyle = "white";
    
    
    let lineas = texto.split("\n");
    lineas.forEach((linea, lineIndex) => {
        dip.fillText(linea, colDerX, startY + index * rowHeight + 60 + (lineIndex * 30)); 
    });
});
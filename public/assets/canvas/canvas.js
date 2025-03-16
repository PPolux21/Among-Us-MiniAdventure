let canvas = document.getElementById("records-canvas");
let dip = canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 550;

let contenedor = document.querySelector(".contenedor");
contenedor.style.display = "flex";
contenedor.style.justifyContent = "center"; 
contenedor.style.alignItems = "center";
contenedor.style.height = "100vh";

dip.fillStyle = "transparent";
dip.fillRect(0, 0, canvas.width, canvas.height);

let textos = [
    "Puedes moverte con las flechas de tu teclado tanto a la izquierda, derecha o saltar con la tecla de arriba, debes de recolectar todos los items para escapar de la nave",
    "Prueba a saltar y conseguir todos los robots del nivel, pero cuidado porque los impostores estaran al acecho y te pueden golpear perdiendo tus vidas.",
    "Llega a la meta sin que los impostores te quiten tus 3 vidas y enfrentate al gran impostor para lograr salir con vida y derrotarlo antes de que el te derrote a ti."
];

let imagenes = [
    "../assets/images/keys.png",
    "../assets/images/roboto.png",
    "../assets/images/red_impostor.png"
];

let columnWidth = canvas.width / 3; 
let startY = 170; 
let imageHeight = 170; 
let textSpacing = 30; 

dip.font = "32px fuenteAmongus";
dip.textAlign = "center";
dip.fillStyle = "white";

imagenes.forEach((src, index) => {
    let img = new Image();
    img.src = src;
    img.onload = function () {
        let xPos = columnWidth * index + columnWidth / 2 - 70;
        dip.drawImage(img, xPos-30, startY, 180, imageHeight);
    };

    let textX = columnWidth * index + columnWidth / 2;
    let textY = startY + imageHeight + 50; 

    let palabras = textos[index].split(" ");
    let linea = "";
    let lineas = [];

    palabras.forEach((palabra) => {
        let pruebaLinea = linea + palabra + " ";
        if (dip.measureText(pruebaLinea).width > columnWidth - 40) {
            lineas.push(linea);
            linea = palabra + " ";
        } else {
            linea = pruebaLinea;
        }
    });
    lineas.push(linea);

    lineas.forEach((linea, lineIndex) => {
        dip.fillText(linea, textX, textY + (lineIndex * textSpacing)); 
    });
});

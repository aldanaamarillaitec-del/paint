// =====================================================
// ELEMENTOS
// =====================================================

const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d", {
    willReadFrequently: true
});


const colorInput =
    document.getElementById("color");

const colorPreview =
    document.getElementById("colorPreview");


const sizeInput =
    document.getElementById("size");

const sizeValue =
    document.getElementById("sizeValue");


const tools =
    document.querySelectorAll(".tool");


const undoButton =
    document.getElementById("undo");

const redoButton =
    document.getElementById("redo");


const clearButton =
    document.getElementById("clear");

const saveButton =
    document.getElementById("save");


const status =
    document.getElementById("status");


const fillShape =
    document.getElementById("fillShape");


// =====================================================
// VARIABLES
// =====================================================

let currentTool = "brush";

let currentColor = "#000000";

let brushSize = 5;

let isDrawing = false;

let startX = 0;

let startY = 0;


// Esta variable guarda el estado del canvas
// antes de comenzar una figura.
let previewImage = null;


// Historial
let history = [];

let historyStep = -1;


// =====================================================
// INICIALIZACIÓN
// =====================================================

function initializeCanvas() {

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    saveHistory();
}


initializeCanvas();


// =====================================================
// COLOR INICIAL
// =====================================================

colorPreview.style.background =
    currentColor;


// =====================================================
// CAMBIO DE COLOR
// =====================================================

colorInput.addEventListener(
    "input",
    () => {

        currentColor =
            colorInput.value;

        colorPreview.style.background =
            currentColor;

    }
);


// =====================================================
// COLORES RÁPIDOS
// =====================================================

document
    .querySelectorAll(
        ".preset-colors button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                currentColor =
                    button.dataset.color;

                colorInput.value =
                    currentColor;

                colorPreview.style.background =
                    currentColor;

            }
        );

    });


// =====================================================
// GROSOR
// =====================================================

sizeInput.addEventListener(
    "input",
    () => {

        brushSize =
            Number(sizeInput.value);

        sizeValue.textContent =
            `${brushSize} px`;

    }
);


// =====================================================
// HERRAMIENTAS
// =====================================================

const toolNames = {

    brush: "Pincel",

    eraser: "Goma",

    line: "Línea",

    rectangle: "Rectángulo",

    circle: "Círculo",

    fill: "Relleno",

    text: "Texto"

};


tools.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            tools.forEach(item => {

                item.classList.remove(
                    "active"
                );

            });


            button.classList.add(
                "active"
            );


            currentTool =
                button.dataset.tool;


            status.textContent =
                `Herramienta: ${
                    toolNames[currentTool]
                }`;


            updateCursor();

        }
    );

});


// =====================================================
// CURSOR
// =====================================================

function updateCursor() {

    if (currentTool === "text") {

        canvas.style.cursor =
            "text";

    }

    else if (currentTool === "fill") {

        canvas.style.cursor =
            "cell";

    }

    else {

        canvas.style.cursor =
            "crosshair";

    }
}


// =====================================================
// POSICIÓN DEL MOUSE
// =====================================================

function getMousePosition(event) {

    const rect =
        canvas.getBoundingClientRect();


    return {

        x:
            (event.clientX - rect.left) *
            (canvas.width / rect.width),

        y:
            (event.clientY - rect.top) *
            (canvas.height / rect.height)

    };

}


// =====================================================
// GUARDAR PREVISUALIZACIÓN
// =====================================================

function createPreview() {

    previewImage =
        ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );

}


// =====================================================
// RESTAURAR PREVISUALIZACIÓN
// =====================================================

function restorePreview() {

    if (!previewImage) {
        return;
    }


    ctx.putImageData(
        previewImage,
        0,
        0
    );

}


// =====================================================
// MOUSE DOWN
// =====================================================

canvas.addEventListener(
    "mousedown",
    event => {

        const position =
            getMousePosition(event);


        startX =
            position.x;

        startY =
            position.y;


        // =============================================
        // RELLENO
        // =============================================

        if (
            currentTool === "fill"
        ) {

            floodFill(
                Math.floor(startX),
                Math.floor(startY)
            );


            saveHistory();

            return;
        }


        // =============================================
        // TEXTO
        // =============================================

        if (
            currentTool === "text"
        ) {

            createText(
                startX,
                startY
            );

            return;
        }


        // =============================================
        // DIBUJO
        // =============================================

        isDrawing = true;


        // Guardamos el canvas antes
        // de empezar la figura.

        createPreview();


        // Para pincel y goma
        if (
            currentTool === "brush" ||
            currentTool === "eraser"
        ) {

            ctx.beginPath();

            ctx.moveTo(
                startX,
                startY
            );

        }

    }
);


// =====================================================
// MOUSE MOVE
// =====================================================

canvas.addEventListener(
    "mousemove",
    event => {

        if (!isDrawing) {
            return;
        }


        const position =
            getMousePosition(event);


        const x =
            position.x;

        const y =
            position.y;


        // =============================================
        // PINCEL
        // =============================================

        if (
            currentTool === "brush"
        ) {

            ctx.lineWidth =
                brushSize;

            ctx.lineCap =
                "round";

            ctx.lineJoin =
                "round";

            ctx.strokeStyle =
                currentColor;


            ctx.lineTo(
                x,
                y
            );


            ctx.stroke();


            return;
        }


        // =============================================
        // GOMA
        // =============================================

        if (
            currentTool === "eraser"
        ) {

            ctx.lineWidth =
                brushSize;

            ctx.lineCap =
                "round";

            ctx.lineJoin =
                "round";

            ctx.strokeStyle =
                "#ffffff";


            ctx.lineTo(
                x,
                y
            );


            ctx.stroke();


            return;
        }


        // =============================================
        // FIGURAS
        // =============================================

        if (
            currentTool === "line" ||
            currentTool === "rectangle" ||
            currentTool === "circle"
        ) {

            // Borramos la previsualización anterior.
            restorePreview();


            // Dibujamos la nueva.
            drawShape(
                startX,
                startY,
                x,
                y,
                true
            );

        }

    }
);


// =====================================================
// MOUSE UP
// =====================================================

canvas.addEventListener(
    "mouseup",
    event => {

        if (!isDrawing) {
            return;
        }


        const position =
            getMousePosition(event);


        const x =
            position.x;

        const y =
            position.y;


        // =============================================
        // FIGURAS
        // =============================================

        if (
            currentTool === "line" ||
            currentTool === "rectangle" ||
            currentTool === "circle"
        ) {

            // Volvemos al canvas original.
            restorePreview();


            // Dibujamos la figura definitiva.
            drawShape(
                startX,
                startY,
                x,
                y,
                false
            );

        }


        isDrawing = false;

        previewImage = null;


        ctx.closePath();


        saveHistory();

    }
);


// =====================================================
// MOUSE LEAVE
// =====================================================

canvas.addEventListener(
    "mouseleave",
    () => {

        if (!isDrawing) {
            return;
        }


        // Si era una figura,
        // eliminamos la previsualización.

        if (
            currentTool === "line" ||
            currentTool === "rectangle" ||
            currentTool === "circle"
        ) {

            restorePreview();

            isDrawing = false;

            previewImage = null;

            return;
        }


        isDrawing = false;

        ctx.closePath();

    }
);


// =====================================================
// DIBUJAR FIGURA
// =====================================================

function drawShape(
    x1,
    y1,
    x2,
    y2,
    preview = false
) {

    ctx.save();


    ctx.strokeStyle =
        currentColor;

    ctx.fillStyle =
        currentColor;

    ctx.lineWidth =
        brushSize;

    ctx.lineCap =
        "round";

    ctx.lineJoin =
        "round";


    // =============================================
    // LÍNEA
    // =============================================

    if (
        currentTool === "line"
    ) {

        ctx.beginPath();


        ctx.moveTo(
            x1,
            y1
        );


        ctx.lineTo(
            x2,
            y2
        );


        ctx.stroke();

    }


    // =============================================
    // RECTÁNGULO
    // =============================================

    if (
        currentTool === "rectangle"
    ) {

        const width =
            x2 - x1;

        const height =
            y2 - y1;


        ctx.beginPath();


        if (
            fillShape.checked
        ) {

            ctx.fillRect(
                x1,
                y1,
                width,
                height
            );

        }


        ctx.strokeRect(
            x1,
            y1,
            width,
            height
        );

    }


    // =============================================
    // CÍRCULO
    // =============================================

    if (
        currentTool === "circle"
    ) {

        const radius =
            Math.sqrt(
                Math.pow(
                    x2 - x1,
                    2
                ) +
                Math.pow(
                    y2 - y1,
                    2
                )
            );


        ctx.beginPath();


        ctx.arc(
            x1,
            y1,
            radius,
            0,
            Math.PI * 2
        );


        if (
            fillShape.checked
        ) {

            ctx.fill();

        }


        ctx.stroke();

    }


    ctx.restore();

}


// =====================================================
// TEXTO
// =====================================================

function createText(
    x,
    y
) {

    const text =
        prompt(
            "Escribe el texto:"
        );


    if (!text) {
        return;
    }


    const fontSize =
        Math.max(
            16,
            brushSize * 4
        );


    ctx.font =
        `${fontSize}px Arial`;


    ctx.fillStyle =
        currentColor;


    ctx.fillText(
        text,
        x,
        y
    );


    saveHistory();

}


// =====================================================
// RELLENO
// =====================================================

function floodFill(
    startX,
    startY
) {

    const imageData =
        ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );


    const data =
        imageData.data;


    const startIndex =
        (
            startY *
            canvas.width +
            startX
        ) * 4;


    const targetR =
        data[startIndex];

    const targetG =
        data[startIndex + 1];

    const targetB =
        data[startIndex + 2];

    const targetA =
        data[startIndex + 3];


    const fill =
        hexToRgb(
            currentColor
        );


    // Si el color ya es igual,
    // no hacemos nada.

    if (
        targetR === fill.r &&
        targetG === fill.g &&
        targetB === fill.b
    ) {

        return;
    }


    const stack = [
        [startX, startY]
    ];


    while (
        stack.length > 0
    ) {

        const [
            x,
            y
        ] =
            stack.pop();


        if (
            x < 0 ||
            x >= canvas.width ||
            y < 0 ||
            y >= canvas.height
        ) {

            continue;
        }


        const index =
            (
                y *
                canvas.width +
                x
            ) * 4;


        if (
            data[index] !== targetR ||
            data[index + 1] !== targetG ||
            data[index + 2] !== targetB ||
            data[index + 3] !== targetA
        ) {

            continue;
        }


        data[index] =
            fill.r;

        data[index + 1] =
            fill.g;

        data[index + 2] =
            fill.b;

        data[index + 3] =
            255;


        stack.push([
            x + 1,
            y
        ]);

        stack.push([
            x - 1,
            y
        ]);

        stack.push([
            x,
            y + 1
        ]);

        stack.push([
            x,
            y - 1
        ]);

    }


    ctx.putImageData(
        imageData,
        0,
        0
    );

}


// =====================================================
// HEX -> RGB
// =====================================================

function hexToRgb(hex) {

    return {

        r: parseInt(
            hex.substring(1, 3),
            16
        ),

        g: parseInt(
            hex.substring(3, 5),
            16
        ),

        b: parseInt(
            hex.substring(5, 7),
            16
        )

    };

}


// =====================================================
// HISTORIAL
// =====================================================

function saveHistory() {

    // Si hicimos deshacer y luego
    // dibujamos algo nuevo,
    // eliminamos el futuro.

    if (
        historyStep <
        history.length - 1
    ) {

        history =
            history.slice(
                0,
                historyStep + 1
            );

    }


    history.push(
        canvas.toDataURL()
    );


    historyStep++;


    // Máximo 30 pasos.

    if (
        history.length > 30
    ) {

        history.shift();

        historyStep--;

    }

}


// =====================================================
// RESTAURAR HISTORIAL
// =====================================================

function restoreHistory(
    index
) {

    if (
        index < 0 ||
        index >= history.length
    ) {

        return;
    }


    const image =
        new Image();


    image.onload = () => {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        ctx.drawImage(
            image,
            0,
            0
        );

    };


    image.src =
        history[index];

}


// =====================================================
// DESHACER
// =====================================================

undoButton.addEventListener(
    "click",
    () => {

        if (
            historyStep > 0
        ) {

            historyStep--;

            restoreHistory(
                historyStep
            );

        }

    }
);


// =====================================================
// REHACER
// =====================================================

redoButton.addEventListener(
    "click",
    () => {

        if (
            historyStep <
            history.length - 1
        ) {

            historyStep++;

            restoreHistory(
                historyStep
            );

        }

    }
);


// =====================================================
// LIMPIAR
// =====================================================

clearButton.addEventListener(
    "click",
    () => {

        const confirmation =
            confirm(
                "¿Quieres borrar todo el dibujo?"
            );


        if (!confirmation) {
            return;
        }


        ctx.fillStyle =
            "#ffffff";


        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        saveHistory();

    }
);


// =====================================================
// GUARDAR PNG
// =====================================================

saveButton.addEventListener(
    "click",
    () => {

        const link =
            document.createElement("a");


        link.download =
            "mi-dibujo.png";


        link.href =
            canvas.toDataURL(
                "image/png"
            );


        link.click();

    }
);


// =====================================================
// ATAJOS
// =====================================================

document.addEventListener(
    "keydown",
    event => {

        // Ctrl + Z

        if (
            event.ctrlKey &&
            !event.shiftKey &&
            event.key.toLowerCase() === "z"
        ) {

            event.preventDefault();

            undoButton.click();

        }


        // Ctrl + Y

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "y"
        ) {

            event.preventDefault();

            redoButton.click();

        }


        // Ctrl + Shift + Z

        if (
            event.ctrlKey &&
            event.shiftKey &&
            event.key.toLowerCase() === "z"
        ) {

            event.preventDefault();

            redoButton.click();

        }

    }
);

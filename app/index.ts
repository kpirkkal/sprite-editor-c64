import * as _ from "lodash";
import {getBalloon, getNinja} from "./sample";
import {convertToBytes, toHexString} from "./conversion";

enum Tool {
    BRUSH,
    ERASER,
    TOGGLE,
}

let currentTool : Tool = Tool.BRUSH;

let dataElement = document.getElementById('basic-data');
let byteElement = document.getElementById('byte-data');

let canvas : HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('screen');
let ctx : CanvasRenderingContext2D = canvas.getContext('2d');

canvas.onselectstart = function () {return false};

var mousepressed = false;

canvas.addEventListener('click', () => {
    makeSelection(event);
});

window.addEventListener('mousedown', () => mousepressed = true);
window.addEventListener('mouseup', () => mousepressed = false);

canvas.addEventListener('mousedown', event => {
    if (currentTool == Tool.BRUSH || currentTool == Tool.ERASER) {
        makeSelection(event)
    }
});

canvas.addEventListener('mousemove', event => {
    if (currentTool == Tool.BRUSH || currentTool == Tool.ERASER) {
        if (mousepressed) {
            makeSelection(event);
        }
    }
});


//FIXME: this prevents overflown pixel to be drawn on the other side
const coordFix = (coord: number) => Math.min(Math.max(0, coord - 10), 470);
function makeSelection(event: any) {
    console.log(event.offsetX, event.offsetY);
    const [x, y] = [coordFix(event.offsetX), coordFix(event.offsetY)];
    select(x, y, currentTool);
}

let data = getBalloon();

function get(x: number, y: number) {
    return data[y * 24 + x];
}

function draw(): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx);
    drawGridLabels(ctx);
    fillCells(ctx);

    let result = convertToBytes(data);

    printByte(result, byteElement);
    printData(result, dataElement);
}

function fillCells(ctx : CanvasRenderingContext2D): void {
    let cellSize = 18;

    for (let x = 0; x < 24; x++) {
        for (let y = 0; y < 21; y++) {
            ctx.fillStyle = getColor(get(x, y));
            ctx.fillRect(x * ( 2 + cellSize) + 11, y * ( 2 + cellSize) + 11, cellSize, cellSize);
        }
    }
}

function getColor(value: number): string {
    return value == 0 ? '#0000AA' : '#EEEE77';
}

function drawGrid(ctx : CanvasRenderingContext2D): void {
    ctx.lineWidth = 2;

    for (let x = 0; x < 25; x++) {
        ctx.beginPath();
        ctx.moveTo(x * 20 + 10, 10);
        ctx.lineTo(x * 20 + 10, 450);
        ctx.closePath();
        ctx.stroke();
    }

    for (let y = 0; y < 22; y++) {
        ctx.beginPath();
        ctx.moveTo(10, y * 20 + 10);
        ctx.lineTo(510, y * 20 + 10);
        ctx.closePath();
        ctx.stroke();
    }
}

function drawGridLabels(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#DD8855';
    ctx.font = '12px serif';

    for (let idx = 1; idx <= 21; idx++) {
        ctx.fillText(idx.toString(10), 24 * 20 + 15, idx * 20 + 5);
    }

    for (let idz = 0; idz < 24; idz++) {
        ctx.fillText((idz+1).toString(10), idz * 20 + 15, 22 * 20 + 5);
    }
}

function printData(data: number[], element: HTMLElement): void {
    let text = _.chunk(data, 9).map((r) => {
        return 'DATA ' + _.join(r, ', ')
    });

    element.innerText =  _.join(text, '\n');
}

function printByte(data: number[], element: HTMLElement): void {
    let dataAsHex = data.map((x) => toHexString(x));

    let text = _.chunk(dataAsHex, 15).map((r) => {
        return '!byte ' + _.join(r, ', ')
    });

    element.innerText = _.join(text, '\n');
}

function select(x: number, y: number, selection: Tool): void {
    let coordX = Math.floor(x / 20);
    let coordY = Math.floor(y / 20);

    let index = coordY * 24 + coordX;

    if (selection != Tool.TOGGLE) {
        data[index] = currentTool == Tool.ERASER ? 0 : 1;
    } else {
        data[index] = data[index] == 1 ? 0 : 1;
    }

    draw();
}

draw();

window.clear = function(): void {
    data = new Uint8Array(24 * 21);
    draw();
};

window.balloon = function(): void {
    data = getBalloon();
    draw();
};

window.ninja = function(): void {
    data = getNinja();
    draw();
};

window.selectBrush = function(): void {
    currentTool = Tool.BRUSH;
    setButtonState(currentTool);
};

window.selectEraser = function(): void {
    currentTool = Tool.ERASER;
    setButtonState(currentTool);
};

window.selectToggle = function (): void {
    currentTool = Tool.TOGGLE;
    setButtonState(currentTool);
};

function setButtonState(tool: Tool) {
    let eraser = document.getElementById('button_eraser');
    let brush = document.getElementById('button_brush');
    let pixel = document.getElementById('button_toggle');

    eraser.setAttribute('class', tool == Tool.ERASER ? 'selected' : '');
    brush.setAttribute('class', tool == Tool.BRUSH ? 'selected' : '');
    pixel.setAttribute('class', tool == Tool.TOGGLE ? 'selected' : '');
}
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawGrid();
});

const colors = [
    '#e6d577',
    '#e1d072',
    '#dbca6c',
    '#d6c467',
    '#d1bf61',
    '#ccb95c',
]

let randomize = localStorage.getItem('randomize') === 'true' ? true : false;
let cellSize = localStorage.getItem('cellSize') ? parseInt(localStorage.getItem('cellSize')) : 10;
let clusterMultiplier = localStorage.getItem('clusterMultiplier') ? parseInt(localStorage.getItem('clusterMultiplier')) : 1;

const reset = () => {
    location.reload();
}

const resetButton = document.querySelector('#reset').addEventListener('click', reset);

const setCellSize = () => {
    const cellSizeInput = document.querySelector('#cell-size');
    cellSizeInput.value = cellSize;
    cellSizeInput.addEventListener('input', () => {
        cellSize = parseInt(cellSizeInput.value);
        localStorage.setItem('cellSize', cellSize);
        drawGrid();
    });
};

setCellSize();

const setRandomize = () => {
    const randomizeInput = document.querySelector('#randomize');
    randomizeInput.checked = randomize;
    randomizeInput.addEventListener('change', () => {
        randomize = randomizeInput.checked;
        localStorage.setItem('randomize', randomize);
    });
};

setRandomize();

const setClusterMultiplier = () => {
    const clusterMultiplierInput = document.querySelector('#cluster-multiplier');
    clusterMultiplierInput.value = clusterMultiplier;
    clusterMultiplierInput.addEventListener('input', () => {
        clusterMultiplier = parseInt(clusterMultiplierInput.value);
        localStorage.setItem('clusterMultiplier', clusterMultiplier);
    });
};

setClusterMultiplier();


let grid = [];

const drawGrid = () => {
    for (let x = 0; x < canvas.width / cellSize; x++) {
        grid[x] = [];
        for (let y = 0; y < canvas.height / cellSize; y++) {
            grid[x][y] = ['E', null];
        }
    }

    updateGrid();
};

let pointerPosition = { x: 0, y: 0 };

const drawPointer = () => {
    if (!('ontouchstart' in window || navigator.maxTouchPoints)) {
        window.addEventListener('mousemove', (event) => {
            pointerPosition.x = Math.floor(event.offsetX / (cellSize * clusterMultiplier));
            pointerPosition.y = Math.floor(event.offsetY / (cellSize * clusterMultiplier));
        });
    }
};

const updateGrid = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let x = 0; x < grid.length; x++) {
        for(let y = 0; y < grid[x].length; y++) {
            if(grid[x][y][0] === 'S') ctx.fillStyle = grid[x][y][1];
            else if(grid[x][y][0] === 'E') ctx.fillStyle = 'white';

            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 0.1;
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
    if (!('ontouchstart' in window || navigator.maxTouchPoints)) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.strokeRect(pointerPosition.x * (cellSize * clusterMultiplier), pointerPosition.y * (cellSize * clusterMultiplier), cellSize * clusterMultiplier, cellSize * clusterMultiplier);
    }
};

drawGrid();
drawPointer();





const testPositions = (x, y) => {
    const directions = [
        [0, 1],
        [1, 1],
        [-1, 1]
    ];

    if(randomize) {
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }
    }

    for (const [dx, dy] of directions) {
        if (grid[x + dx] !== undefined && grid[x + dx][y + dy] !== undefined && grid[x + dx][y + dy][0] === 'E') {
            return [dx, dy];
        }
    }
    return [0, 0];
};

const updateSand = (x, y, newPosition) => {
    if(newPosition[0] !== 0 || newPosition[1] !== 0) {
        const color = grid[x][y][1];
        grid[x][y] = ['E', null];
        const newX = x + newPosition[0];
        const newY = y + newPosition[1];
        if (newX >= 0 && newX < grid.length && newY >= 0 && newY < grid[0].length) {
            grid[newX][newY] = ['S', color];
        }
    }
};
let fps = localStorage.getItem('fps') ? parseInt(localStorage.getItem('fps')) : 60;
let lastUpdateTime = 0;

const setFps = () => {
    const fpsInput = document.querySelector('#fps');
    fpsInput.value = Math.max(1, Math.min(60, fps));
    fpsInput.addEventListener('input', () => {
        fps = parseInt(fpsInput.value);
        localStorage.setItem('fps', fps);
    });
};

setFps();

const update = (timestamp) => {
    if (timestamp - lastUpdateTime >= 1000 / fps) {
        lastUpdateTime = timestamp;
        for(let x = 0; x < grid.length; x++) {
            for(let y = 0; y < grid[x].length; y++) {
                if(grid[x][y][0] === 'S') {
                    const newPosition = testPositions(x, y);
                    if(newPosition[0] !== 0 || newPosition[1] !== 0) updateSand(x, y, newPosition);
                };
            }
        }

        updateGrid();
    }
    requestAnimationFrame(update);
};

requestAnimationFrame(update);





const placeSand = (x, y) => {
    const startX = x - Math.floor(clusterMultiplier / 2);
    const startY = y - Math.floor(clusterMultiplier / 2);
    for (let i = 0; i < clusterMultiplier; i++) {
        for (let j = 0; j < clusterMultiplier; j++) {
            const gridX = startX + i;
            const gridY = startY + j;
            if (grid[gridX] && grid[gridX][gridY] && grid[gridX][gridY][0] === 'E') {
                grid[gridX][gridY] = ['S', colors[Math.floor(Math.random() * colors.length)]];
            }
        }
    }
    updateGrid();
};

let isMouseDown = false;

const getEventPosition = (event) => {
    if (event.touches && event.touches.length > 0) {
        return {
            x: Math.floor(event.touches[0].clientX / cellSize),
            y: Math.floor(event.touches[0].clientY / cellSize)
        };
    } else {
        return {
            x: Math.floor(event.offsetX / cellSize),
            y: Math.floor(event.offsetY / cellSize)
        };
    }
};

const handlePointerDown = (event) => {
    isMouseDown = true;
    const { x, y } = getEventPosition(event);
    placeSand(x, y);
};

const handlePointerMove = (event) => {
    if (isMouseDown) {
        const { x, y } = getEventPosition(event);
        placeSand(x, y);
    }
};

const handlePointerUp = () => {
    isMouseDown = false;
};

window.addEventListener('mousedown', handlePointerDown);
window.addEventListener('mousemove', handlePointerMove);
window.addEventListener('mouseup', handlePointerUp);

window.addEventListener('touchstart', handlePointerDown);
window.addEventListener('touchmove', handlePointerMove);
window.addEventListener('touchend', handlePointerUp);
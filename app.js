const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
let grid = [];
const cellSize = 20;

const updateGrid = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let x = 0; x < grid.length; x++) {
        for(let y = 0; y < grid[x].length; y++) {
            if(grid[x][y] === 'S') ctx.fillStyle = 'yellow';
            else if(grid[x][y] === 'E') ctx.fillStyle = 'white';

            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
};

const drawGrid = () => {
    for (let x = 0; x < canvas.width / cellSize; x++) {
        grid[x] = [];
        for (let y = 0; y < canvas.height / cellSize; y++) {
            grid[x][y] = 'E';
        }
    }

    updateGrid();
};

drawGrid();





const testPositions = (x, y) => {
    if (grid[x][y + 1] !== undefined && grid[x][y + 1] === 'E') {
        return [0, 1];
    } else if (grid[x - 1] !== undefined && grid[x - 1][y + 1] === 'E') {
        return [-1, 1];
    } else if (grid[x + 1] !== undefined && grid[x + 1][y + 1] === 'E') {
        return [1, 1];
    }
    return [0, 0];
};

const updateSand = (x, y, newPosition) => {
    if(newPosition[0] !== 0 || newPosition[1] !== 0) {
        grid[x][y] = 'E';
        const newX = x + newPosition[0];
        const newY = y + newPosition[1];
        if (newX >= 0 && newX < grid.length && newY >= 0 && newY < grid[0].length) {
            grid[newX][newY] = 'S';
        }
    }
};
const update = setInterval(() => {
    for(let x = 0; x < grid.length; x++) {
        for(let y = 0; y < grid[x].length; y++) {
            if(grid[x][y] === 'S') {
                const newPosition = testPositions(x, y);
                if(newPosition[0] !== 0 || newPosition[1] !== 0) updateSand(x, y, newPosition);
            };
        }
    }

    updateGrid();
}, 100);





const placeSand = (x, y) => {
    grid[x][y] = 'S';
    updateGrid();
};

let isMouseDown = false;

window.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    const x = Math.floor(event.offsetX / 20);
    const y = Math.floor(event.offsetY / 20);
    placeSand(x, y);
});

window.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
        const x = Math.floor(event.offsetX / 20);
        const y = Math.floor(event.offsetY / 20);
        placeSand(x, y);
    }
});

window.addEventListener('mouseup', () => {
    isMouseDown = false;
});
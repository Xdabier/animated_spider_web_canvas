const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 28;

// initial dot position canvas center
const initDotX = canvas.width / 2;
const initDotY = canvas.height / 2;

// dot radius
const dotRadius = 2.5;

const maxBranches = 20;
const minBranches = 7;

const maxDots = 80;
const minDots = 8;

//random number between min and max
const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

const dotsNumber = randomNumber(minDots, maxDots);

//random rgb color based on x and y
const randomColor = (x, y) => {
    return `rgb(${x % 255}, ${y % 255}, ${x + y % 255})`;
}

const drawDot = (x, y, radius, color) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
};

const drawLine = (x1, y1, x2, y2, sourceColor, endColor) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    // ctx strokeStyle a linear gradient using the line coordinates
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, sourceColor);
    gradient.addColorStop(1, endColor);
    ctx.strokeStyle = gradient;

    ctx.stroke();
    ctx.closePath();
};

// draw a specific number of dots on a given line
const drawDotsOnLine = (x1, y1, x2, y2, sourceColor, numberOfDots = 10) => {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const dotDistance = distance / numberOfDots;
    for (let i = 0; i < numberOfDots + 1; i++) {
        const newX = x1 + dotDistance * i * Math.cos(angle);
        const newY = y1 + dotDistance * i * Math.sin(angle);

        const prevX = x1 + dotDistance * (i - 1) * Math.cos(angle);
        const prevY = y1 + dotDistance * (i - 1) * Math.sin(angle);

        drawLineAnimated(!i ? x1 : prevX, !i ? y1 : prevY, newX, newY, !i ? sourceColor : randomColor(prevX, prevY), randomColor(newX, newY));

        drawDot(newX, newY, dotRadius, randomColor(newX, newY));
    }
}

const drawLinesBetweenLine = (x1, y1, x2, y2, x3, y3, numberOfDots = 10) => {
    const distanceL1 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angleL1 = Math.atan2(y2 - y1, x2 - x1);

    const distanceL2 = Math.sqrt(Math.pow(x3 - x1, 2) + Math.pow(y3 - y1, 2));
    const angleL2 = Math.atan2(y3 - y1, x3 - x1);

    const dotDistanceL1 = distanceL1 / numberOfDots;

    const dotDistanceL2 = distanceL2 / numberOfDots;

    for (let i = 0; i < numberOfDots + 1; i++) {
        const l1X = x1 + dotDistanceL1 * i * Math.cos(angleL1);
        const l1Y = y1 + dotDistanceL1 * i * Math.sin(angleL1);

        const l2X = x1 + dotDistanceL2 * i * Math.cos(angleL2);
        const l2Y = y1 + dotDistanceL2 * i * Math.sin(angleL2);

        drawCurvedLineAnimated(l1X, l1Y, l2X, l2Y, initDotX, initDotY, randomColor(l1X, l1Y), randomColor(l2X, l2Y));
    }
}


// draw cubic Bézier curved line between two points, with the curve directioned to a given point x3, y3
// const drawCurvedLine = (x1, y1, x2, y2, x3, y3, sourceColor, endColor) => {
//     ctx.beginPath();
//     ctx.moveTo(x1, y1);
//     ctx.bezierCurveTo(x1, y1, x3, y3, x2, y2);
//     // ctx strokeStyle a linear gradient using the line coordinates
//     const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
//     gradient.addColorStop(0, sourceColor);
//     gradient.addColorStop(1, endColor);
//     ctx.strokeStyle = gradient;
//
//     ctx.stroke();
//     ctx.closePath();
// };

//draw line with animation 3px/10ms
const drawLineAnimated = (x1, y1, x2, y2, sourceColor, endColor, speed = 10) => {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const lineDistance = distance / speed;
    let i = 0;
    const interval = setInterval(() => {
        const newX = x1 + lineDistance * i * Math.cos(angle);
        const newY = y1 + lineDistance * i * Math.sin(angle);

        const prevX = x1 + lineDistance * (i - 1) * Math.cos(angle);
        const prevY = y1 + lineDistance * (i - 1) * Math.sin(angle);

        drawLine(!i ? x1 : prevX, !i ? y1 : prevY, newX, newY, !i ? sourceColor : randomColor(prevX, prevY), randomColor(newX, newY));

        if (i >= speed) {
            clearInterval(interval);
        }
        i++;
    }, 10);
}


// For the curve animation thanks to https://www.pjgalbraith.com/drawing-animated-curves-javascript/
const drawCurvedLineAnimated = (x0, y0, x2, y2, x1, y1,  sourceColor, endColor, speed = 600) => {
    let start = null;

    const step = (timestamp) => {
        if (start === null)
            start = timestamp;

        const delta = timestamp - start,
            progress = Math.min(delta / speed, 1);

        // Draw curve
        drawBezierSplit(x0, y0, x2, y2, x1, y1,  sourceColor, endColor, 0, progress);

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };

    window.requestAnimationFrame(step);
};

const drawBezierSplit = (x0, y0, x2, y2, x1, y1, sourceColor, endColor, t0, t1) => {
    ctx.beginPath();

    if (0.0 === t0 && t1 === 1.0) {
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(x1, y1, x2, y2);
    } else if (t0 !== t1) {
        let t00 = t0 * t0,
            t01 = 1.0 - t0,
            t02 = t01 * t01,
            t03 = 2.0 * t0 * t01;

        const nx0 = t02 * x0 + t03 * x1 + t00 * x2,
            ny0 = t02 * y0 + t03 * y1 + t00 * y2;

        t00 = t1 * t1;
        t01 = 1.0 - t1;
        t02 = t01 * t01;
        t03 = 2.0 * t1 * t01;

        const nx2 = t02 * x0 + t03 * x1 + t00 * x2,
            ny2 = t02 * y0 + t03 * y1 + t00 * y2;

        const nx1 = lerp(lerp(x0, x1, t0), lerp(x1, x2, t0), t1),
            ny1 = lerp(lerp(y0, y1, t0), lerp(y1, y2, t0), t1);

        ctx.moveTo(nx0, ny0);
        ctx.quadraticCurveTo(nx1, ny1, nx2, ny2);
    }

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, sourceColor);
    gradient.addColorStop(1, endColor);
    ctx.strokeStyle = gradient;
    ctx.stroke();
    ctx.closePath();
}

/**
 * Linearly interpolate between two numbers v0, v1 by t
 */
function lerp(v0, v1, t) {
    return (1.0 - t) * v0 + t * v1;
}

// use drawDot to draw a given number of dots surrounding a given point (x,y)
const getSurroundingPoints = (x, y) => {
    const surroundingPoints = [];
    const mainBranches = randomNumber(minBranches, maxBranches);
    const angle = 2 * Math.PI / mainBranches;
    for (let i = 0; i < mainBranches; i++) {
        const radius = i % 2 === 0 ? canvas.height / 2 : canvas.width / 2;

        const phi = angle * i;
        const newX = x + radius * Math.cos(phi);
        const newY = y + radius * Math.sin(phi);

        surroundingPoints.push({x: newX, y: newY});
    }
    return surroundingPoints;
};

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawDot(initDotX, initDotY, dotRadius, randomColor(initDotX, initDotY));

    const surroundingPoints = getSurroundingPoints(initDotX, initDotY);
    surroundingPoints.forEach((point, index) => {
        drawDot(point.x, point.y, dotRadius, randomColor(point.x, point.y));
        drawDotsOnLine(initDotX, initDotY, point.x, point.y, randomColor(initDotX, initDotY), dotsNumber);

        if (index > 0) {
            drawLinesBetweenLine(initDotX, initDotY, surroundingPoints[index - 1].x, surroundingPoints[index - 1].y, point.x, point.y, dotsNumber);
        } else {
            drawLinesBetweenLine(initDotX, initDotY, surroundingPoints[surroundingPoints.length - 1].x, surroundingPoints[surroundingPoints.length - 1].y, point.x, point.y, dotsNumber);
        }
    });
}

draw();

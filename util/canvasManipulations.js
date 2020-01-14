
const KEYPOINT_DRAW_COLOR = 'aqua';
const LINE_WIDTH = 2;
const PARTS = {
    left: [
        'leftEar',
        'leftShoulder',
        'leftElbow',
        'leftHip',
        'leftKnee',
        'leftAnkle',
    ],
    right: [
        'rightEar',
        'rightShoulder',
        'rightElbow',
        'rightHip',
        'rightKnee',
        'rightAnkle',
    ],
};

const ADJUCENT_PARTS_PAIRS = {
    left: [
        ['leftEar', 'leftShoulder'],
        ['leftShoulder', 'leftElbow'],
        ['leftElbow', 'leftHip'],
        ['leftHip', 'leftKnee'],
        ['leftKnee', 'leftAnkle'],
    ],
    right: [
        ['rightEar', 'rightShoulder'],
        ['rightShoulder', 'rightElbow'],
        ['rightElbow', 'rightHip'],
        ['rightHip', 'rightKnee'],
        ['rightKnee', 'rightAnkle'],
    ],
};

function drawPoint(ctx, y, x, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
    ctx.beginPath();
    ctx.moveTo(ax * scale, ay * scale);
    ctx.lineTo(bx * scale, by * scale);
    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeStyle = color;
    ctx.stroke();
}

export function drawSkeleton(keypoints, headTurn, ctx, scale = 1) {
    const adjucentKeypoints = [];
    // filtering out keypoint which actually matter.
    // Depends on which direction person is more turned
    const fileredKeypoints = keypoints.filter((keypoint) => PARTS[headTurn].includes(keypoint.part));
    for (const [index, pair] of ADJUCENT_PARTS_PAIRS[headTurn].entries()) {
        adjucentKeypoints.push([]);
        for (const part of pair) {
            adjucentKeypoints[index].push(fileredKeypoints.find((keypoint) => keypoint.part === part));
        }
    }
    // drawing lines between keypoints
    for (const keypointPairs of adjucentKeypoints) {
        drawSegment(
        toTuple(keypointPairs[0].position), toTuple(keypointPairs[1].position), KEYPOINT_DRAW_COLOR, scale, ctx
      );
    }
}

function toTuple({y, x}) {
    return [y, x];
}

export function drawKeypoints(keypoints, headTurn, ctx, scale = 1) {
    for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i];

        if (!PARTS[headTurn].includes(keypoint.part)) {
            continue;
        }

        const {y, x} = keypoint.position;
        drawPoint(ctx, y * scale, x * scale, 3, KEYPOINT_DRAW_COLOR);
    }
}

export function renderImageToCanvas(image, size, canvas) {
    canvas.width = size[0];
    canvas.height = size[1];
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0);
}

export function getHeadTurn(keypoints) {
    let headTurn = 'right';
    const leftEye = keypoints.find((keypoint) => keypoint.part === 'leftEye');
    const leftShoulder = keypoints.find((keypoint) => keypoint.part === 'leftShoulder');
    if (leftEye.position.x < leftShoulder.position.x) {
        headTurn = 'left';
    }

    return headTurn;
}

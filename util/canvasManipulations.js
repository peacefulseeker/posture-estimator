import Konva from 'konva';

import loadImage from './loadImage';

const KEYPOINT_DRAW_COLOR = 'aqua';
const DISTANCE_BETWEEN_TARGET_CONNECTOR = 3;
const KEYPOINT_TARGET_RADIUS = 5;
const KEYPOINT_LINE_WIDTH = 3;
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

function getHeadTurn(keypoints) {
    let headTurn = 'right';
    const leftEye = keypoints.find((keypoint) => keypoint.part === 'leftEye');
    const leftShoulder = keypoints.find((keypoint) => keypoint.part === 'leftShoulder');
    if (leftEye.position.x < leftShoulder.position.x) {
        headTurn = 'left';
    }

    return headTurn;
}

function generateTargets(keypoints, headTurn) {
    const result = [];
    let targetCount = 0;
    for (const keypoint of keypoints) {
        if (!PARTS[headTurn].includes(keypoint.part)) {
            continue;
        }

        targetCount++;
        const {y, x} = keypoint.position;

        result.push({
            id: 'target-' + result.length,
            x,
            y,
        });
    }

    return [result, targetCount];
}

function generateConnectors(targetCount) {
    const result = [];
    while (result.length < targetCount - 1) {
        const from = 'target-' + result.length;
        const to = 'target-' + (result.length + 1);

        if (from === to) {
            continue;
        }
        result.push({
            id: 'connector-' + result.length,
            from: from,
            to: to,
        });
    }
    return result;
}

function getConnectorPoints(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(-dy, dx);

    return [
        from.x + -DISTANCE_BETWEEN_TARGET_CONNECTOR * Math.cos(angle + Math.PI),
        from.y + DISTANCE_BETWEEN_TARGET_CONNECTOR * Math.sin(angle + Math.PI),
        to.x + -DISTANCE_BETWEEN_TARGET_CONNECTOR * Math.cos(angle),
        to.y + DISTANCE_BETWEEN_TARGET_CONNECTOR * Math.sin(angle),
    ];
}

function updateObjects(layer, targets, connectors) {
    targets.forEach(target => {
        const node = layer.findOne('#' + target.id);
        node.x(target.x);
        node.y(target.y);
    });
    connectors.forEach(connector => {
        const line = layer.findOne('#' + connector.id);
        const fromNode = layer.findOne('#' + connector.from);
        const toNode = layer.findOne('#' + connector.to);

        const points = getConnectorPoints(fromNode.position(), toNode.position());
        line.points(points);
    });
    layer.batchDraw();
}

function buildStage(image, canvasWidth, canvasHeight, stage, layer, targets, connectors) {
    const x = canvasWidth / 2 - image.width / 2;
    const y = canvasHeight / 2 - image.height / 2;
    const posture = new Konva.Image({
        x,
        y,
        image,
        width: image.width,
        height: image.height,
    });

    layer.add(posture);
    posture.moveToBottom();
    layer.draw();

    for (const connector of connectors) {
        const line = new Konva.Line({
            stroke: KEYPOINT_DRAW_COLOR,
            id: connector.id,
            fill: 'black',
            strokeWidth: KEYPOINT_LINE_WIDTH,
        });
        layer.add(line);
    }

    for (const target of targets) {
        const circle = new Konva.Circle({
            id: target.id,
            fill: KEYPOINT_DRAW_COLOR,
            radius: KEYPOINT_TARGET_RADIUS,
            draggable: true,
            dragBoundFunc: function(pos) {
                const xDragRestricted = pos.x >= stage.width() || pos.x < 0;
                const yDragRestricted = pos.y >= stage.height() || pos.y < 0;

                return {
                    x: xDragRestricted ? this.absolutePosition().x : pos.x,
                    y: yDragRestricted ? this.absolutePosition().y : pos.y,
                };
            },
        });
        layer.add(circle);

        circle.on('dragmove', () => {
            target.x = circle.x();
            target.y = circle.y();
            updateObjects(layer, targets, connectors);
        });

        circle.on('mouseover', function() {
            document.body.style.cursor = 'pointer';
        });
        circle.on('mouseout', function() {
            document.body.style.cursor = 'default';
        });
    }

    updateObjects(layer, targets, connectors);
}

export default async function drawCanvasToStage(canvas, sourceImage, keypoints) {
    const canvasWidth = sourceImage.width || 800;
    const canvasHeight = sourceImage.height || 500;
    const headTurn = getHeadTurn(keypoints);
    const stage = new Konva.Stage({
        container: canvas,
        width: canvasWidth,
        height: canvasHeight,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    const [targets, targetCount] = generateTargets(keypoints, headTurn);
    const connectors = generateConnectors(targetCount);
    const image = await loadImage(sourceImage.src);

    buildStage(image, canvasWidth, canvasHeight, stage, layer, targets, connectors);

    return stage;
}

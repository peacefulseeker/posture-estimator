import React, {useState, useEffect, Fragment, useRef} from 'react';
import styled from 'styled-components';
import Jimp from 'jimp';
import {useDropzone} from 'react-dropzone';
import * as posenet from '@tensorflow-models/posenet';

import {bytesToSize} from '../util';
import {
    drawSkeleton,
    drawKeypoints,
    renderImageToCanvas,
    getHeadTurn,
} from '../util/canvasManipulations';

const MAX_UPLLOAD_SIZE = 10 * 1024 * 1024; // ~ 10mb
const IMAGE_SIZE = 513;
const IMAGE_RESIZE_QUALITY = 90;

const StyledDropZone = styled.div`
    width: ${IMAGE_SIZE}px;
    margin: 20px auto;
    min-height: 150px;
    border: 1px solid #656565;
    outline: none;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;

    &:hover {
        cursor: pointer;
        border-color: coral;
    }

    ${props => props.isDragging && `
        border-color: coral;
    `}
`;

const DranZoneInfo = styled.div`

`;

const PreviewImage = styled.img`
    width: 100%;
    display: block;
`;

const ResizedImage = styled.img`
    width: 100%;
    display: block;
`;

const HintTitle = styled.h2`
    color: coral;
    font-weight: 700;
    font-size: 20px;
`;

const HintText = styled.p`
    color: #333;
    font-size: 14px;
    text-decoration: underline;
`;

const HintReject = styled.p`
    color: red;
`;

const ResultsWrapper = styled.div`
    width: ${IMAGE_SIZE}px;
    margin: 20px auto;
    ${props => props.hasResults && `
        min-height: 800px;
    `}
`;
const Canvas = styled.canvas``;
const Results = styled.div`
    display: flex;
    justify-content: center;
`;

function DropZone() {
    const imageRef = useRef();
    const canvasRef = useRef();
    const [files, setFiles] = useState([]);
    const [rejectHint, setRejectHint] = useState();
    const [base64, setBase64] = useState();
    const [imageIsRendered, setImageIsRendered] = useState(false);
    const [imageIsOptimizing, setimageIsOptimizing] = useState(false);
    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        accept: 'image/jpeg, image/png',
        multiple: false,
        maxSize: MAX_UPLLOAD_SIZE,
        onDrop: acceptedFiles => {
            setRejectHint();
            for (const file of acceptedFiles) {
                const reader = new FileReader();
                reader.onabort = () => console.warn('file reading was aborted');
                reader.onerror = () => console.warn('file reading has failed');
                reader.onload = async() => {
                    setimageIsOptimizing(true);
                    const originalBuffer = reader.result;
                    const image = await Jimp.read(originalBuffer);
                    await image.resize(IMAGE_SIZE, Jimp.AUTO);
                    await image.quality(IMAGE_RESIZE_QUALITY);
                    const base64 = await image.getBase64Async(image.getMIME());
                    setBase64(base64);
                    setimageIsOptimizing(false);
                };
                reader.readAsArrayBuffer(file);
            }

            setFiles(acceptedFiles.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file),
            })));
        },
        onDropRejected: rejectedFiles => {
            setRejectHint(`
                Файл не соотвествует требованиям.
                Размер: '${bytesToSize(rejectedFiles[0].size)}'.
                Тип Файла: '${rejectedFiles[0].type.split('/')[1]}'
            `);
        },
    });

    useEffect(() => () => {
        // Make sure to revoke the data uris to avoid memory leaks
        files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

    const onFileDelete = (e) => {
        e.stopPropagation();
        setFiles([]);
        setRejectHint();
    };

    const onPostureEstimate = async(e) => {
        e.stopPropagation();
        const image = imageRef.current;
        const canvas = canvasRef.current;
        console.log('Estimating single posture ...');

        // load the posenet model from a checkpoint
        const net = await posenet.load();

        const pose = await net.estimateSinglePose(image, {
            flipHorizontal: false,
        });
        renderImageToCanvas(image, [image.width, image.height], canvas);
        const ctx = canvas.getContext('2d');
        const headTurn = getHeadTurn(pose.keypoints);
        drawKeypoints(pose.keypoints, headTurn, ctx);
        drawSkeleton(pose.keypoints, headTurn, ctx);
        setImageIsRendered(true);
    };

    const onDownload = (e) => {
        e.stopPropagation();
        let link = document.createElement('a');
        link.download = files[0].name;
        link.href = canvasRef.current.toDataURL();
        link.click();
    };

    const onCanvasMouseDown = (e) => {
        const rect = e.target.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        console.log('onMouseDown', {
            offsetX,
            offsetY,
        });
    };

    const onCanvasClick = (e) => e.stopPropagation();
    return (
        <>
            <StyledDropZone
                {...getRootProps({refKey: 'ref'})}
                isDragging={isDragActive}
            >
                <input {...getInputProps()} multiple={false}/>
                {!isDragActive && (
                    <DranZoneInfo>
                        <HintTitle>Выберите или перетащите файл сюда</HintTitle>
                        <HintText>Принимается только 1 изображение в обработку</HintText>
                        <HintText>Поддерживаемый формат изображения - *.jpeg или *.png</HintText>
                        <HintText>Максимальнй размер изображения - 10МБ</HintText>
                        {!!files.length && <HintText>Вы можете заменить изображение, перетащив или выбрав другое</HintText>}
                        {<HintReject>{rejectHint}</HintReject>}
                    </DranZoneInfo>
                )}
            </StyledDropZone>
            <ResultsWrapper hasResults={!!files.length}>
                {files.map(file => (
                    <Fragment key={file.name}>
                        {imageIsOptimizing && <HintText>Изображение обрабатывается</HintText>}
                        <Results>
                            {!base64 && <PreviewImage src={file.preview}/>}
                            {base64 && <ResizedImage src={base64} ref={imageRef}/>}
                            <Canvas
                                ref={canvasRef}
                                onClick={onCanvasClick}
                                onMouseDown={onCanvasMouseDown}
                            />
                        </Results>
                        <p>Размер изображения: <strong>{bytesToSize(file.size)}</strong></p>
                        <button onClick={onFileDelete}>Удалить</button>
                        <button onClick={onPostureEstimate}>Визуализировать точки</button>
                        {imageIsRendered && <button onClick={onDownload}>Скачать результат</button>}
                    </Fragment>
                ))}
            </ResultsWrapper>
        </>
    );
}

export default DropZone;

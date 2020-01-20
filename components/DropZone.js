import React, {useState, Fragment, useRef} from 'react';
import styled from 'styled-components';
import Jimp from 'jimp';
import PropTypes from 'prop-types';
import {useDropzone} from 'react-dropzone';
import {Button} from 'grommet';
import {Edit, Erase, Download, Upload} from 'grommet-icons';
import * as posenet from '@tensorflow-models/posenet';

import {bytesToSize} from '../util';
import drawCanvasToStage from '../util/canvasManipulations';

const MAX_UPLLOAD_SIZE = 10 * 1024 * 1024; // ~ 10mb
const IMAGE_RESIZE_WIDTH = 513;
const IMAGE_RESIZE_QUALITY = 90;

const StyledDropZone = styled.div`
    width: ${props => props.width || IMAGE_RESIZE_WIDTH}px;
    margin: 20px auto;
    min-height: 150px;
    border: 1px solid #656565;
    outline: none;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    flex-wrap: wrap;

    &:hover {
        cursor: pointer;
        border-color: coral;
    }

    ${props => props.isDragging && `
        border-color: coral;
    `}
`;
StyledDropZone.propTypes = {
    width: PropTypes.number,
};

const DranZoneInfo = styled.div`
    flex-basis: 100%;
    margin-bottom: 20px;
`;

const ResizedImage = styled.img`
    /* width: 100%; */
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
    margin: 20px auto;
    text-align: center;
    min-height: 800px;
    overflow-x: scroll;
`;

const Results = styled.div`
    display: flex;
    justify-content: center;
`;

const ImageActions = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
`;

const OptimizedImage = styled.div`
    margin-bottom: 20px;
`;

const ResultsImage = styled.div`
    margin-bottom: 20px;
`;

// const Canvas = styled.canvas`
//     display: block;
// `;

const Canvas = styled.div`
    /* display: block; */
`;

const StyledButton = styled(Button)``;
StyledButton.defaultProps = {
    margin: 'xsmall',
};

function DropZone() {
    const imageRef = useRef();
    const convasContainer = useRef();
    const [image, setImage] = useState();
    const [canvasStage, setCanvasStage] = useState();
    const [rejectHint, setRejectHint] = useState();
    const [imageIsRendered, setImageIsRendered] = useState(false);
    const [imageIsOptimizing, setImageIsOptimizing] = useState(false);

    const renderImage = (file) => {
        const reader = new FileReader();
        reader.onabort = () => console.warn('file reading was aborted');
        reader.onerror = () => console.warn('file reading has failed');
        reader.onload = async() => {
            setImageIsOptimizing(true);
            const originalBuffer = reader.result;
            const image = await Jimp.read(originalBuffer);
            const width = image.getWidth();
            const shouldOptimize = width > IMAGE_RESIZE_WIDTH;
            if (shouldOptimize) {
                await image.resize(IMAGE_RESIZE_WIDTH, Jimp.AUTO);
                await image.quality(IMAGE_RESIZE_QUALITY);
            }
            const buffer = await image.getBufferAsync(image.getMIME());
            const base64 = await image.getBase64Async(image.getMIME());
            setImage({
                optimizedSize: buffer.byteLength,
                src: base64,
                name: file.name || 'image',
                type: file.type,
                size: file.size,
            });
            setImageIsOptimizing(false);
        };
        reader.readAsArrayBuffer(file);
    };

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        accept: 'image/jpeg, image/png',
        multiple: false,
        maxSize: MAX_UPLLOAD_SIZE,
        onDrop: acceptedFiles => {
            setRejectHint();
            setImageIsRendered(false);
            for (const file of acceptedFiles) {
                const reader = new FileReader();
                reader.onabort = () => console.warn('file reading was aborted');
                reader.onerror = () => console.warn('file reading has failed');
                reader.onload = async() => renderImage(file);
                reader.readAsArrayBuffer(file);
            }
        },
        onDropRejected: rejectedFiles => {
            setRejectHint(`
                Файл не соотвествует требованиям.
                Размер: '${bytesToSize(rejectedFiles[0].size)}'.
                Тип Файла: '${rejectedFiles[0].type.split('/')[1]}'
            `);
        },
    });

    const onFileDelete = (e) => {
        e.stopPropagation();
        setImage();
        setRejectHint();
        setImageIsRendered(false);
    };

    const onPostureEstimate = async(e) => {
        e.stopPropagation();
        const image = imageRef.current;
        const canvas = convasContainer.current;
        console.log('Estimating single posture ...');

        const net = await posenet.load({
            multiplier: .5,
        });
        const pose = await net.estimateSinglePose(image, {
            flipHorizontal: false,
        });
        const stage = await drawCanvasToStage(canvas, image, pose.keypoints);
        setImageIsRendered(true);
        setCanvasStage(stage);
    };

    const onDownload = (e, href, prefix) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.download = `${prefix}-${image.name}`;
        link.href = href;
        link.click();
    };

    const onRenderedImageDownload = (e) => {
        const href = canvasStage.toCanvas().toDataURL();
        onDownload(e, href, 'result');
    };

    const onOptimizedImageDownload = (e) => {
        const href = imageRef.current.src;
        onDownload(e, href, 'optimized');
    };

    const onCanvasClick = (e) => e.stopPropagation();

    const onLoadSample = async(e) => {
        e.stopPropagation();
        setImageIsRendered(false);
        const {image} = e.currentTarget.dataset;
        var x = new XMLHttpRequest();
        x.open('GET', image);
        x.responseType = 'blob';
        x.onload = function() {
            var blob = x.response;
            const reader = new FileReader();
            reader.onabort = () => console.warn('file reading was aborted');
            reader.onerror = () => console.warn('file reading has failed');
            reader.onload = async() => renderImage(blob);
            reader.readAsDataURL(blob);
        };
        x.send();
    };

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
                        {image && <HintText>Вы можете заменить изображение, перетащив или выбрав другое</HintText>}
                        {<HintReject>{rejectHint}</HintReject>}
                    </DranZoneInfo>
                )}
                <StyledButton icon={<Upload/>} label="Пример 1" data-image={require('../public/example-1.jpg')} onClick={onLoadSample}/>
                <StyledButton icon={<Upload/>} label="Пример 2" data-image={require('../public/example-2.jpg')} onClick={onLoadSample}/>
            </StyledDropZone>
            {image && (
                <ResultsWrapper>
                    <Fragment key={image.name}>
                        {imageIsOptimizing && <HintText>Изображение обрабатывается</HintText>}
                        <Results>
                            <OptimizedImage>
                                {image.src && <ResizedImage src={image.src} ref={imageRef}/>}
                                {!imageIsOptimizing && image.optimizedSize && <StyledButton onClick={onOptimizedImageDownload} icon={<Download/>} label="Скачать"/>}
                                <p>Изначальный размер изображения: <strong>{bytesToSize(image.size)}</strong></p>
                                {image.optimizedSize && <p>Размер изображения после оптимизации: <strong>{bytesToSize(image.optimizedSize)}</strong></p>}
                            </OptimizedImage>
                            <ResultsImage>
                                <Canvas
                                    ref={convasContainer}
                                    onClick={onCanvasClick}
                                />
                                {imageIsRendered && <StyledButton icon={<Download/>} onClick={onRenderedImageDownload} label="Скачать"/>}
                            </ResultsImage>
                        </Results>
                        <ImageActions>
                            <StyledButton icon={<Erase/>} onClick={onFileDelete} label="Удалить"/>
                            <StyledButton icon={<Edit/>} label="Визуализировать точки" disabled={imageIsRendered} onClick={onPostureEstimate}/>
                        </ImageActions>
                    </Fragment>
                </ResultsWrapper>
            )}
        </>
    );
}

export default DropZone;

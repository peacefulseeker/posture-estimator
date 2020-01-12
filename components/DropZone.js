import React, {useState, useEffect, Fragment} from 'react';
import styled from 'styled-components';
import Jimp from 'jimp';
import {useDropzone} from 'react-dropzone';

import bytesToSize from '../util/bytesToSize';

const MAX_UPLLOAD_SIZE = 10 * 1024 * 1024; // ~ 10mb
const IMAGE_SIZE = 801;
const IMAGE_RESIZE_QUALITY = 90;

const StyledDropZone = styled.div`
    width: ${IMAGE_SIZE}px;
    min-height: 800px;
    margin: 20px auto;
    text-align: center;
    border: 1px solid #656565;
    outline: none;

    &:hover {
        cursor: pointer;
        border-color: coral;
    }

    ${props => props.isDragging && `
        border-color: coral;
    `}
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

function DropZone() {
    const [files, setFiles] = useState([]);
    const [rejectHint, setRejectHint] = useState();
    const [base64, setBase64] = useState();
    const [isOptimizing, setIsOptimizing] = useState(false);
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
                    setIsOptimizing(true);
                    const originalBuffer = reader.result;
                    const image = await Jimp.read(originalBuffer);
                    await image.resize(IMAGE_SIZE, Jimp.AUTO);
                    await image.quality(IMAGE_RESIZE_QUALITY);
                    const base64 = await image.getBase64Async(image.getMIME());
                    setBase64(base64);
                    setIsOptimizing(false);
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
        console.log('Estimating single posture');
    };

    return (
        <StyledDropZone
            {...getRootProps({
                refKey: 'ref',

            })}
            isDragging={isDragActive}
        >
            <input {...getInputProps()} multiple={false}/>
            {!isDragActive && (
                <>
                    <HintTitle>Выберите или перетащите файл сюда</HintTitle>
                    <HintText>Принимается только 1 изображение в обработку</HintText>
                    <HintText>Поддерживаемый формат изображения - *.jpeg или *.png</HintText>
                    <HintText>Максимальнй размер изображения - 10МБ</HintText>
                    {!!files.length && <HintText>Вы можете заменить изображение, перетащив или выбрав другое</HintText>}
                    {<HintReject>{rejectHint}</HintReject>}
                </>
            )}
            {files.map(file => (
                <Fragment key={file.name}>
                    {isOptimizing && <HintText>Изображение обрабатывается</HintText>}
                    {!base64 && <PreviewImage src={file.preview}/>}
                    {base64 && <ResizedImage src={base64}/>}
                    <p>Размер изображения: <strong>{bytesToSize(file.size)}</strong></p>
                    <button onClick={onFileDelete}>Удалить</button>
                    <button onClick={onPostureEstimate}>Визуализировать точки </button>
                </Fragment>
            ))}
        </StyledDropZone>
    );
}

export default DropZone;

import React from 'react';
import styled from 'styled-components';

import DropZone from '../components/DropZone';

const PageTitle = styled.h1`
    font-size: 28px;
    color: coral;
    font-weight: 700;
    text-align: center;
`;

const Home = () => (
    <>
        <PageTitle>Оцените вашу осанку, загрузив фотографию</PageTitle>
        <DropZone/>
    </>
);

export default Home;


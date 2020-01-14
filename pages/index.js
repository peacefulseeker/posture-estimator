import React from 'react';
import styled from 'styled-components';

import DropZone from '../components/DropZone';

const PageTitle = styled.h1`
    color: coral;
    font-weight: 700;
    text-align: center;
    margin: 0 auto;
`;

const Home = () => (
    <>
        <PageTitle>Оцените вашу осанку, загрузив фотографию</PageTitle>
        <DropZone/>
    </>
);

export default Home;


import React from 'react';
import styled from 'styled-components';
import {Button, Box} from 'grommet';

import DropZone from '../components/DropZone';

const PageTitle = styled.h1`
    color: coral;
    font-weight: 700;
    text-align: center;
    margin: 0 auto;
`;

const PostureTestingLink = styled(Button)`
    font-size: 15px;
`;

const Home = () => (
    <>
        <PageTitle>Оцените вашу осанку, загрузив фотографию</PageTitle>
        <Box align="center" pad="xsmall">
            <PostureTestingLink
                label="Полное тестирование осанки"
                target="_blank"
                color="accent-4"
                href="https://minddetox.getcourse.ru/pl/fileservice/user/file/download/h/105322b78008301c40a3ea40019e45cd.pdf"
            />
        </Box>
        <DropZone/>
    </>
);

export default Home;


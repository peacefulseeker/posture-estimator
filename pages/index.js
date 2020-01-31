import React from 'react';
import styled from 'styled-components';
import {Button, Box} from 'grommet';

import DropZone from '../components/DropZone';
import {useTranslation} from '../i18n';

const PageTitle = styled.h1`
    color: coral;
    font-weight: 700;
    text-align: center;
    margin: 50px auto 10px;
`;

const PostureTestingLink = styled(Button)`
    font-size: 15px;
`;

export default function Home() {
    const {t} = useTranslation();

    return (
        <>
            <PageTitle>{t('pageTitle')}</PageTitle>
            <Box align="center" pad="xsmall">
                <PostureTestingLink
                    label={t('fullBodyPostureEstimation')}
                    target="_blank"
                    color="accent-4"
                    href="https://minddetox.getcourse.ru/pl/fileservice/user/file/download/h/105322b78008301c40a3ea40019e45cd.pdf"
                />
            </Box>
            <DropZone/>
        </>
    );
}

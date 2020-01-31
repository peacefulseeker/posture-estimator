import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {Button} from 'grommet';
import {Language} from 'grommet-icons';

import {useTranslation} from '../i18n';

const StyledLayout = styled.main`
    padding: 10px;
`;

const LanguageSwitcher = styled(Button)`
    position: fixed;
    left: 20px;
    top: 20px;
    font-size: 14px;
`;

export default function Layout({children}) {
    const {i18n} = useTranslation();
    const languageToSwitch = i18n.language === 'ru' ? 'en' : 'ru';

    return (
        <StyledLayout>
            <LanguageSwitcher
                icon={<Language/>}
                color="accent-3"
                label={languageToSwitch.toUpperCase()}
                onClick={() => i18n.changeLanguage(languageToSwitch)}
            />
            {children}
        </StyledLayout>
    );
}
Layout.propTypes = {
    children: PropTypes.any.isRequired,
};

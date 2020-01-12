import React from 'react';
import App from 'next/app';
import {createGlobalStyle} from 'styled-components';

const GlobalStyles = createGlobalStyle`
   body {
        padding: 0;
        margin: 0;
        line-height: 2;
        font-family: 'Poppins', sans-serif;
        overflow-x: hidden;
        font-size: 16px;
        -webkit-font-smoothing: antialiased;
    }
    html {
        box-sizing: border-box;
        font-size: 10px;
    }

    *,
    *::before,
    *::after {
        box-sizing: border-box;
        font-family: inherit;
    }

    h1, h2, h3, h4, h5, h6, p {
        margin: 0;
    }

    h1, h2, h3, h4, h5, h6 {
        font-weight: 500;
    }

    main {
        display: block;
    }
`;

export default class FrontPageApp extends App {
    static async getInitialProps({Component, ctx}) {
        let pageProps = {};

        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx);
        }

        return {
            pageProps,
        };
    }

    render() {
        const {Component, pageProps} = this.props;

        return (
            <>
                <GlobalStyles/>
                <Component {...pageProps}/>
            </>
        );
    }
}

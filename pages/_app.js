import React from 'react';
import App from 'next/app';
import Head from 'next/head';
import {createGlobalStyle} from 'styled-components';
import {appWithTranslation} from '../i18n';
import Layout from '../components/Layout';

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

@appWithTranslation
class MyApp extends App {
    render() {
        const {Component, pageProps} = this.props;

        return (
            <>
                <Head>
                    <meta name="viewport" content="width=device-width"/>
                </Head>
                <GlobalStyles/>
                <Layout>
                    <Component {...pageProps}/>
                </Layout>
            </>
        );
    }
}
export default MyApp;

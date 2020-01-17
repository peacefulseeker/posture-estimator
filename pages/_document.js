import React from 'react';
import Document, {Head, Main, NextScript} from 'next/document';
import {ServerStyleSheet} from 'styled-components';

export default class DocumentRoot extends Document {
    static async getInitialProps(ctx) {
        const sheet = new ServerStyleSheet();
        const page = ctx.renderPage(App => props => sheet.collectStyles(<App {...props}/>));
        const styleTags = sheet.getStyleElement();

        return {...page, styleTags};
    }

    render() {
        return (
            <html lang={this.props.lang}>
                <Head>
                    {this.props.styleTags}
                    <meta charSet="utf-8"/>
                    <meta httpEquiv="x-dns-prefetch-control" content="on"/>
                    <meta content="origin" name="referrer"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1"/>
                    <link href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,700&display=swap" rel="stylesheet"/>
                </Head>
                <body>
                    <Main/>
                    <NextScript/>
                    <div id="container"/>
                </body>
            </html>
        );
    }
}

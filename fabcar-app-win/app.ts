/**
 * @description Web server for the fabcar application using fabric gateway client api
 * @author Ching-Sheng Hsu
 * @since 2023-05-15
 * @version 1.0.0
 */


import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import logger from 'morgan';
import * as log from '@vladmandic/pilogger';
import { blockRouter } from './routes/blockRouter';

const app = express();
const PORT = 8080;

async function main() {
    app.use(express.static('public'));
    app.use(express.static('public/html'));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));  // To parse URL encoded data
    app.use(express.json({ limit: '50mb' }));  // To parse json data
    app.use(cookieParser());
    app.use(logger('common'));
    app.set('view engine', 'pug');
    app.set('views', './views');
    app.use(
        session({
            secret: 'arbitary-string',
            resave: false,
            saveUninitialized: true,
            cookie: { secure: true }
        })
    );

    app.use(blockRouter);  // IMPORTANT: 此指令一定要放在app.use(express.static(...))之後

    app.listen(PORT, function () {
        log.info('Web server is listening on port', PORT);
    });
}

main();

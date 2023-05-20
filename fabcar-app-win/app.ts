
import { resolve } from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import logger from 'morgan';
import * as log from '@vladmandic/pilogger';
import { FaceRecognizer } from './FaceRecognizer';
import { faceRouter, setRecognizer } from './routes/faceRouter';
import { blockRouter } from './routes/blockRouter';

const app = express();
const PORT = 8080;
const lfdDir: string = './faces/lfd';  // 人臉特徵值檔案所在目錄
const modelDir: string = './public/face-api/model';  // 模型(臉部標記點、偵測、辨識、表情、性別、年齡)所在目錄
const faceDir: string = './faces/images';  // 訓練影像所在目錄
const lfdPath: string = resolve(__dirname, lfdDir);  // 人臉特徵值檔案所在目錄絕對路徑
const modelPath: string = resolve(__dirname, modelDir);  // 模型(臉部標記點、偵測、辨識、表情、性別、年齡)所在目錄絕對路徑
const facePath: string = resolve(__dirname, faceDir);  // 訓練影像所在目錄絕對路徑
const minConfidence: number = 0.2;  // default: 0.5, for face detection 數值愈大愈可能偵測不到人臉進而導致特徵值擷取失敗
const distanceThreshold: number = 0.5;  // maximum distance allowed for face recognition
const numTrainFaces: number = -1;  // 設定每個人(類別)要限定取幾張影像來擷取影像特徵(-1: unbounded)


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

    const recognizer: FaceRecognizer = new FaceRecognizer(lfdPath, modelPath, facePath, minConfidence, distanceThreshold, numTrainFaces);
    await recognizer.loadModels();  // 進行人臉辨識或驗證之前，必須先載入偵測與辨識模型，並讀取lfd_all.json來建立LabeledFaceDescriptors的陣列(recognizer.arrayLFD)，arrayLFD中存放了每個人的所有人臉影像特徵值
    log.info(recognizer.info());
    setRecognizer(recognizer);  // IMPORTANT: 一定要為Router指定FaceRecognizer，此指令一定要放在app.use(faceRouter.router)之前
    app.use(faceRouter);  // IMPORTANT: 此指令一定要放在app.use(express.static(...))之後
    app.use(blockRouter);

    app.listen(PORT, function () {
        log.info('Web server is listening on port', PORT);
    });
}

main();

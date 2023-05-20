/**
 * @description Testing program for Face recognition using FaceAPI and TensorFlow
 * @author Ching-Sheng Hsu
 * @since 2023-04-22
 * @version 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';
import * as log from '@vladmandic/pilogger';
import * as tf from '@tensorflow/tfjs-node';
import { FaceMatch } from '@vladmandic/face-api';
import { FaceRecognizer } from './FaceRecognizer';


async function main() {
    const lfdDir: string = './faces/lfd';  // 人臉特徵值檔案所在目錄
    const modelDir: string = './public/face-api/model';  // 模型(臉部標記點、偵測、辨識、表情、性別、年齡)所在目錄
    const faceDir: string = './faces/images/test1';  // 訓練影像所在目錄
    const lfdPath: string = path.resolve(__dirname, lfdDir);  // 人臉特徵值檔案所在目錄絕對路徑
    const modelPath: string = path.resolve(__dirname, modelDir);  // 模型(臉部標記點、偵測、辨識、表情、性別、年齡)所在目錄絕對路徑
    const facePath: string = path.resolve(__dirname, faceDir);  // 訓練影像所在目錄絕對路徑
    const minConfidence: number = 0.1;  // default: 0.5, for face detection 數值愈大愈可能偵測不到人臉進而導致特徵值擷取失敗
    const distanceThreshold: number = 0.5;  // maximum distance allowed for face recognition
    const numTrainFaces: number = -1;  // 設定每個人(類別)要限定取幾張影像來擷取影像特徵(-1: unbounded)

    log.header();
    const recognizer: FaceRecognizer = new FaceRecognizer(lfdPath, modelPath, facePath, minConfidence, distanceThreshold, numTrainFaces);
    await recognizer.loadModels();  // 進行人臉辨識或驗證之前，必須先載入偵測與辨識模型，並讀取lfd_all.json來建立LabeledFaceDescriptors的陣列(recognizer.arrayLFD)，arrayLFD中存放了每個人的所有人臉影像特徵值
    log.info(recognizer.info());

    // Testing...
    // 自行修改下列faceLabel與testFaceFileName進行測試
    // ----------------------------------------------
    let referenceImage: string = 'lennard_14.png';
    // ----------------------------------------------

    let referenceImagePath: string = path.resolve(facePath, referenceImage);
    log.data('Reference Image:', referenceImagePath);
    let buffer: Buffer = fs.readFileSync(referenceImagePath);
    let tensor: any = tf.node.decodeImage(buffer, 3);

    let prediction = await recognizer.predictByTensor(tensor);  // face recognition
    if (prediction.match != null) {
        log.info('Prediction:', prediction.match.label);
    } else {
        log.error(prediction.err);
    }
    tf.dispose(tensor);

}

main();

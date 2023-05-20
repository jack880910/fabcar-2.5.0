/**
 * @description Router for the face recognition application using FaceRecognizer class
 * @author Ching-Sheng Hsu
 * @since 2023-04-22
 * @version 1.0.0
 */

import * as log from '@vladmandic/pilogger';
import { Router, Request, Response } from 'express';
import { FaceRecognizer } from '../FaceRecognizer';
import * as tf from '@tensorflow/tfjs-node';

const router: Router = Router();
let recognizer: FaceRecognizer;
let isFaceRecognizerReady: boolean = false;

// middleware that is specific to this router
router.use((req: Request, res: Response, next) => {
    next();
});

function setRecognizer(reg: FaceRecognizer): void {
    recognizer = reg;
    isFaceRecognizerReady = true;
}

// 給手機APP使用
// Face Verification by Mat->Bitmap->JPEG->Tensor3D
router.post('/verify-by-tensor', function (req: Request, res: Response) {
    if (!isFaceRecognizerReady) {
        log.error('FaceRecognizer is not ready');
        res.end('FaceRecognizer is not ready');
        return;
    }
    let faceLabel = req.body.faceLabel;
    if (faceLabel == null || faceLabel === undefined) {
        log.error('faceLabel is null or undefined');
        res.end('faceLabel is null or undefined');
        return;
    }
    faceLabel = faceLabel.trim().toLowerCase();
    if (faceLabel == '') {
        log.error('faceLabel is empty');
        res.end('faceLabel is empty');
        return;
    }
    let width = req.body.width;
    let height = req.body.height;
    let format = req.body.format;
    let image = req.body.image;
    let reqObj = { faceLabel: faceLabel, width: width, height: height, format: format };
    log.info(reqObj);

    // 將接收到的人臉影像字串轉成Buffer格式
    let buffer = Buffer.from(image, 'base64');
    // 將buffer轉成Tensor3D格式
    let tensor = tf.node.decodeImage(buffer, 3);
    log.info('Verify for', faceLabel);
    recognizer.verifyByTensor(faceLabel, tensor).then(verification => {
        // verification is an object of {match: FaceMatch | null, err: string | null}
        if (verification.match != null) {  // got the error
            let label: string = verification.match.label.trim().toLowerCase();
            let distance: number = parseFloat(verification.match.distance.toFixed(4));
            log.info('Verification:', { label: label, distance: distance });
            if (label == faceLabel) {
                log.info('人臉驗證通過');
                res.end('success');
            } else {
                log.info('人臉驗證不通過');
                res.end('fail');
            }
        } else {
            log.error(verification.err);
            res.end(verification.err);
        }
    });
});

// 給Web網頁使用
// Face Verification by labeled face descriptor
router.post('/verify-by-lfd', function (req: Request, res: Response) {
    if (!isFaceRecognizerReady) {
        log.error('FaceRecognizer is not ready');
        res.end('FaceRecognizer is not ready');
        return;
    }
    let faceLabel: string = req.body.faceLabel.trim().toLowerCase();
    if (faceLabel == '') {
        log.error('faceLabel is empty');
        res.end('faceLabel is empty');
        return;
    }
    let strDescriptor: string = req.body.descriptor;
    let arrFloat: Array<number> = strDescriptor.split(',').map(function (value) {
        return parseFloat(value);
    });
    let descriptor: Float32Array = Float32Array.from(arrFloat);
    log.info('Verify for', faceLabel);
    recognizer.verifyByDescriptor(faceLabel, descriptor).then(verification => {
        if (verification.match != null) {
            let label: string = verification.match.label.trim().toLowerCase();
            let distance: number = parseFloat(verification.match.distance.toFixed(4));
            log.info('Verification:', { label: label, distance: distance });
            if (label == faceLabel) {
                log.info('人臉驗證通過');
                res.end('success');
            } else {
                log.info('人臉驗證不通過');
                res.end('fail');
            }
        } else {
            log.error(verification.err);
            res.end(verification.err);
        }
    });
});

// 給Web網頁使用
// Face Recognition
router.post('/predict-by-lfd', function (req: Request, res: Response) {
    if (!isFaceRecognizerReady) {
        log.error('FaceRecognizer is not ready');
        res.end('FaceRecognizer is not ready');
        return;
    }
    let strDescriptor: string = req.body.descriptor;
    let arrFloat: Array<number> = strDescriptor.split(',').map(function (value) {
        return parseFloat(value);
    });
    let descriptor: Float32Array = Float32Array.from(arrFloat);
    recognizer.predictByDescriptor(descriptor).then(prediction => {
        if (prediction.match != null) {
            let label: string = prediction.match.label.trim().toLowerCase();
            let distance: number = parseFloat(prediction.match.distance.toFixed(4));
            log.info('Prediction:', { label: label, distance: distance });
            res.end(label);
        } else {
            log.error(prediction.err);
            res.end(prediction.err);
        }
    });
});

// 給Web網頁使用
// Register the labeled face descriptors (LFDs)
router.post('/register-by-lfd', function (req: Request, res: Response) {
    if (!isFaceRecognizerReady) {
        log.error('FaceRecognizer is not ready');
        res.end('FaceRecognizer is not ready');
        return;
    }
    let faceLabel: string = req.body.faceLabel.trim().toLowerCase();
    if (faceLabel == '') {
        log.error('faceLabel is empty');
        res.end('faceLabel is empty');
        return;
    }
    let strDescriptor: string = req.body.descriptor;
    let arrFloat: Array<number> = strDescriptor.split(',').map(function (value) {
        return parseFloat(value);
    });
    let descriptor: Float32Array = Float32Array.from(arrFloat);
    log.info('faceLabel:', faceLabel);
    recognizer.registerSingleDescriptor(faceLabel, descriptor).then(result => {
        if (result.success) {
            log.info('Succeed in registering the LFD for', faceLabel);
            res.end('success');
        } else {
            log.error(result.err);
            res.end(result.err);
        }
    });
});

// 給手機APP使用
// Register the labeled face descriptors (LFDs) by face image
router.post('/register-by-tensor', function (req: Request, res: Response) {
    if (!isFaceRecognizerReady) {
        log.error('FaceRecognizer is not ready');
        res.end('FaceRecognizer is not ready');
        return;
    }
    let faceLabel = req.body.faceLabel;
    if (faceLabel == null || faceLabel === undefined) {
        log.error('faceLabel is null or undefined');
        res.end('faceLabel is null or undefined');
        return;
    }
    faceLabel = faceLabel.trim().toLowerCase();
    if (faceLabel == '') {
        log.error('faceLabel is empty');
        res.end('faceLabel is empty');
        return;
    }
    let width = req.body.width;
    let height = req.body.height;
    let format = req.body.format;
    let image = req.body.image;
    let reqObj = { faceLabel: faceLabel, width: width, height: height, format: format };
    log.info(reqObj);

    // 將接收到的人臉影像字串轉成Buffer格式
    let buffer = Buffer.from(image, 'base64');
    // 將buffer轉成tf.Tensor3D格式
    let tensor = tf.node.decodeImage(buffer, 3);
    recognizer.registerSingleTensor(faceLabel, tensor).then(result => {
        if (result.success) {
            log.info('Succeed in registering the LFD for', faceLabel);
            res.end('success');
            // 將接收到的人臉影像寫入檔案
            recognizer.writeFaceImage(faceLabel, buffer);
        } else {
            log.error(result.err);
            res.end(result.err);
        }
    });
});

export { router as faceRouter, setRecognizer };
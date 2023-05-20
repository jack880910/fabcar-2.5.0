/**
 * @description FaceRecognizer class using '@tensorflow/tfjs-node' and '@vladmandic/face-api' modules
 * @description 1. 人臉影像的命名規則為：faceLabel_number.jpg
 * @description 2. 所有人的人臉特徵都會紀錄於arrayLFD與mapFacelLabelLFD中，並永久保存於lfd_all.json檔案中
 * @description 3. 每當server端的程式被重新啟動，或是手機端有傳送人臉影像到server端，則server端的程式會從lfd_all.json自動讀取所有人臉標籤名稱(也就是所有人的faceLabel)。
 * @description 4. 每個人臉標籤名稱(faceLabel 小寫字)都會在arrayLFD與mapFacelLabelLFD中有相對應的人臉特徵值。
 * @description 5. 如果是透過手機app傳送一份人臉特徵值到server端，則server端的程式會自動將這份人臉特徵值存放於arrayLFD與mapFacelLabelLFD中，然後自動更新lfd_all.json檔案。
 * @description 6. 如果手動將人臉影像複製到face-api/faces中，則server端的程式不會自動為這些影像命名(你自己要做好檔案命名工作)，arrayLFD與mapFacelLabelLFD也不會自動更新；此時若要更新模型檔，必須手動刪除lfd_all.json、重啟server並執行loadModels()。
 * @description 7. 如果有人臉影像，但arrayLFD為空的話，則重啟server端的程式並執行loadModels()或是每當server端執行verify、predict或register-lfd的功能，arrayLFD與mapFacelLabelLFD就會被重新建立。
 * @author Ching-Sheng Hsu
 * @since 2023-04-22
 * @version 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';
import * as log from '@vladmandic/pilogger';
import * as tf from '@tensorflow/tfjs-node';  // in nodejs environments tfjs-node is required to be loaded before face-api
import * as faceapi from '@vladmandic/face-api';
import { SsdMobilenetv1Options, LabeledFaceDescriptors, FaceMatcher, FaceMatch } from '@vladmandic/face-api';
import * as canvas from 'canvas';  // implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement, additionally an implementation
// of ImageData is required, in case you want to use the MTCNN
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData } as any);

class FaceRecognizer {
    private lfdPath: string;  // 人臉特徵值檔案所在目錄絕對路徑
    private lfdFilename: string;  // 人臉特徵值檔案名稱(lfd_all.json)
    private modelPath: string;  // 模型(臉部標記點、偵測、辨識、表情、性別、年齡)所在目錄絕對路徑
    private facePath: string;  // 人臉影像所在目錄絕對路徑
    private minConfidence: number;  // default: 0.5, for face detection 數值愈大愈可能偵測不到人臉進而導致特徵值擷取失敗
    private distanceThreshold: number;  // maximum distance allowed for face recognition
    // numTrainFaces: 設定每個人臉標籤要限定取幾張影像來擷取影像特徵
    // 預設(numTrainFaces <= 0)每個人臉標籤皆取所有影像來擷取影像特徵
    // 若要一個人臉標籤取多張影像來取特徵值，則設定numTrainFaces > 0, 例如：numTrainFaces = 5
    private numTrainFaces: number;  // 設定每個人臉標籤要限定取幾張影像來擷取影像特徵(-1: unbounded)
    private isLFDReady: boolean;  // is the arrayLFD ready
    private isFaceAPIReady: boolean;  // checking for the loading of FaceAPI models
    private optionsSSDMobileNet: SsdMobilenetv1Options;
    private arrayLFD: Array<LabeledFaceDescriptors>;  // an array of LabeledFaceDescriptors
    private mapFaceLabelLFD: Map<string, LabeledFaceDescriptors>;  // a map of (faceLabel, LabeledFaceDescriptors)

    constructor(lfdPath: string, modelPath: string, facePath: string, minConfidence: number = 0.1, distanceThreshold: number = 0.5, numTrainFaces = -1) {
        this.lfdPath = lfdPath;
        this.lfdFilename = 'lfd_all.json'
        this.modelPath = modelPath;
        this.facePath = facePath;
        this.minConfidence = minConfidence;
        this.distanceThreshold = distanceThreshold;
        this.numTrainFaces = numTrainFaces;
        this.isLFDReady = false;
        this.isFaceAPIReady = false;
        this.optionsSSDMobileNet = new SsdMobilenetv1Options();
        this.arrayLFD = new Array<LabeledFaceDescriptors>();
        this.mapFaceLabelLFD = new Map<string, LabeledFaceDescriptors>();
    }

    public info() {
        let infoObj = {
            lfdPath: this.lfdPath,
            lfdFilename: this.lfdFilename,
            modelPath: this.modelPath,
            facePath: this.facePath,
            minConfidence: this.minConfidence,
            distanceThreshold: this.distanceThreshold,
            numTrainFaces: this.numTrainFaces,
            isLFDReady: this.isLFDReady,
            isFaceAPIReady: this.isFaceAPIReady,
            arrayLFDLength: this.arrayLFD.length,
            faceLabels: this.getFaceLabels()
        };
        return infoObj;
    }

    public async loadModels(): Promise<void> {
        if (!this.isFaceAPIReady) {
            log.info('Loading the FaceAPI models...');
            let success: boolean = await this.initFaceAPI();
            if (!success) log.error('Fail to load FaceAPI models');
            else log.info('FaceAPI models loading completed');
        }
        if (this.arrayLFD.length == 0) {
            log.info('Loading the LFDs (Labeled Face Descriptors)...');
            let success: boolean = await this.loadLFD();
            if (!success) log.warn('Fail to load the LFDs');
            else log.info('LFDs loading completed');
        }
    }

    public async initFaceAPI(): Promise<boolean> {
        this.isFaceAPIReady = false;
        if (!fs.existsSync(this.modelPath)) {
            log.error('Model path does not exist:', this.modelPath);
            return false;
        }
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(this.modelPath);  // for Detecting Faces using SSD (Single Shot Multibox Detector) based on MobileNetV1 Face Detector 
        await faceapi.nets.faceLandmark68Net.loadFromDisk(this.modelPath);  // for Detecting 68 Face Landmark Points
        await faceapi.nets.faceExpressionNet.loadFromDisk(this.modelPath);  // for Recognizing Face Expressions
        await faceapi.nets.ageGenderNet.loadFromDisk(this.modelPath);  // for Age Estimation and Gender Recognition
        await faceapi.nets.faceRecognitionNet.loadFromDisk(this.modelPath);  // for Computing Face Descriptors and Face Recognition (prediction accuracy of 99.38%)
        let minConfidence: number = this.minConfidence;
        this.optionsSSDMobileNet = new SsdMobilenetv1Options({ minConfidence, maxResults: 10 });  // maxResults: maximum number of faces to return (default: 100)
        this.isFaceAPIReady = true;
        return true;
    }

    public initRecognizer(): void {
        this.isLFDReady = false;
        this.mapFaceLabelLFD.clear();
        this.arrayLFD = new Array<LabeledFaceDescriptors>();
    }

    public writeLFD(): boolean {
        // ensure lfdPath exist
        if (!fs.existsSync(this.lfdPath)) {
            fs.mkdirSync(this.lfdPath);
            log.warn('Cannot find LFDs path:', this.lfdPath);
            log.info('Automatically create the LFDs path:', this.lfdPath);
        }
        if (this.arrayLFD.length == 0) return false;
        let jsonStr = JSON.stringify(this.arrayLFD);
        let lfdFilePath = path.join(this.lfdPath, this.lfdFilename);
        fs.writeFileSync(lfdFilePath, jsonStr, { encoding: 'utf-8' });
        return true;
    }

    public async loadLFD(): Promise<boolean> {
        this.initRecognizer();
        let lfdFilePath = path.join(this.lfdPath, this.lfdFilename);
        // check lfdFilePath exist
        if (!fs.existsSync(lfdFilePath)) {
            log.error('Cannot find the LFDs file:', lfdFilePath);
            let status: boolean = await this.buildLFDFromFiles();
            return status;
        }
        let jsonStr = fs.readFileSync(lfdFilePath, { encoding: 'utf-8' });
        let lfds: Array<LabeledFaceDescriptors> = JSON.parse(jsonStr);
        // LFD: {label: 'stuart',   descriptors: [[...]...]}
        lfds.forEach(item => {
            let descriptors: Array<Float32Array> = new Array<Float32Array>();
            item.descriptors.forEach(item => {
                descriptors.push(Float32Array.from(item));
            });
            let lfd = new LabeledFaceDescriptors(item.label, descriptors);
            this.arrayLFD.push(lfd);
            this.mapFaceLabelLFD.set(item.label, lfd);
        });
        this.isLFDReady = true;
        return true;
    }

    public isImageFormatAccepted(imageFile: string): boolean {
        if (!imageFile.toLowerCase().endsWith('jpg') &&
            !imageFile.toLowerCase().endsWith('jpeg') &&
            !imageFile.toLowerCase().endsWith('png') &&
            !imageFile.toLowerCase().endsWith('bmp') &&
            !imageFile.toLowerCase().endsWith('gif')
        ) return false;
        return true;
    }

    public async getDescriptorByFile(imageFile: string): Promise<{ descriptor: Float32Array | null, err: string | null }> {
        if (!this.isImageFormatAccepted(imageFile)) {
            return { descriptor: null, err: 'Image format is not JPEG, BMP, PNG, or GIF: ' + imageFile };
        }
        if (!this.isFaceAPIReady) {
            let success: boolean = await this.initFaceAPI();
            if (!success) {
                return { descriptor: null, err: 'Fail to load FaceAPI models' };
            }
        }
        let buffer: Buffer = fs.readFileSync(imageFile);
        let tensor: any = tf.node.decodeImage(buffer, 3);
        let face: any = await faceapi.detectSingleFace(tensor, this.optionsSSDMobileNet)
            .withFaceLandmarks()
            .withFaceDescriptor();
        tf.dispose(tensor);
        if (face == null || face === undefined) {
            return { descriptor: null, err: 'Fail to get descriptor from' + imageFile };
        }
        return { descriptor: face.descriptor, err: null };
    }

    public async getDescriptorByTensor(tensor: any): Promise<{ descriptor: Float32Array | null, err: string | null }> {
        if (!this.isFaceAPIReady) {
            let success: boolean = await this.initFaceAPI();
            if (!success) {
                return { descriptor: null, err: 'Fail to load FaceAPI models' };
            }
        }
        let face: any = await faceapi.detectSingleFace(tensor, this.optionsSSDMobileNet)
            .withFaceLandmarks()
            .withFaceDescriptor();
        if (face == null || face === undefined) {
            return { descriptor: null, err: 'Fail to get descriptor from the given face' };
        }
        return { descriptor: face.descriptor, err: null };
    }

    public async registerSingleDescriptor(faceLabel: string, descriptor: Float32Array): Promise<{ success: boolean, err: string | null }> {
        if (faceLabel == null || faceLabel == '' || faceLabel === undefined) {
            return { success: false, err: 'Face label is empty, null, or undefined' };
        }
        log.data('Registered: ' + faceLabel.toLowerCase());
        if (descriptor == null) {
            return { success: false, err: 'null descriptor' };
        }
        let descriptors: Array<Float32Array> = new Array<Float32Array>();
        descriptors.push(descriptor);
        let lfd: LabeledFaceDescriptors | undefined = this.mapFaceLabelLFD.get(faceLabel.toLowerCase());  // the object of type LabeledFaceDescriptors
        if (lfd === undefined) {  // new faceLabel
            let labeledFaceDescriptors: LabeledFaceDescriptors = new LabeledFaceDescriptors(faceLabel.toLowerCase(), descriptors);
            this.mapFaceLabelLFD.set(faceLabel.toLowerCase(), labeledFaceDescriptors);
            this.arrayLFD.push(labeledFaceDescriptors);
        } else {
            lfd.descriptors.concat(descriptors);
        }
        this.writeLFD();
        this.isLFDReady = true;
        return { success: true, err: null };
    }

    public async registerSingleTensor(faceLabel: string, tensor: any): Promise<{ success: boolean, err: string | null }> {
        if (faceLabel == null || faceLabel == '' || faceLabel === undefined) {
            return { success: false, err: 'Face label is empty, null, or undefined' };
        }
        log.data('Registered: ' + faceLabel.toLowerCase());

        let data = await this.getDescriptorByTensor(tensor);
        if (data.descriptor != null) {
            let descriptors: Array<Float32Array> = new Array<Float32Array>();
            descriptors.push(data.descriptor);
            let lfd: LabeledFaceDescriptors | undefined = this.mapFaceLabelLFD.get(faceLabel.toLowerCase());  // the object of type LabeledFaceDescriptors
            if (lfd === undefined) {  // new faceLabel
                let labeledFaceDescriptors: LabeledFaceDescriptors = new LabeledFaceDescriptors(faceLabel.toLowerCase(), descriptors);
                this.mapFaceLabelLFD.set(faceLabel.toLowerCase(), labeledFaceDescriptors);
                this.arrayLFD.push(labeledFaceDescriptors);
            } else {
                lfd.descriptors.concat(descriptors);
            }
            this.writeLFD();
            this.isLFDReady = true;
            return { success: true, err: null };
        } else {
            return { success: false, err: data.err };  // fail to get the descriptor
        }
    }

    public async registerSingleImage(faceLabel: string, imageFile: string): Promise<boolean> {
        if (faceLabel == null || faceLabel == '' || faceLabel === undefined) {
            log.error('Face label is empty, null, or undefined');
            return false;
        }
        log.data('Registered: ' + faceLabel.toLowerCase(), imageFile);
        if (!this.isImageFormatAccepted(imageFile)) {
            log.error('Image format is not JPEG, BMP, PNG, or GIF:', imageFile);
            return false;
        }
        let result = await this.getDescriptorByFile(imageFile);
        if (result.descriptor != null) {
            let descriptors: Array<Float32Array> = new Array<Float32Array>();
            descriptors.push(result.descriptor);
            let lfd: LabeledFaceDescriptors | undefined = this.mapFaceLabelLFD.get(faceLabel.toLowerCase());  // the object of type LabeledFaceDescriptors
            if (lfd === undefined) {  // new faceLabel
                let labeledFaceDescriptors: LabeledFaceDescriptors = new LabeledFaceDescriptors(faceLabel.toLowerCase(), descriptors);
                this.mapFaceLabelLFD.set(faceLabel.toLowerCase(), labeledFaceDescriptors);
                this.arrayLFD.push(labeledFaceDescriptors);
            } else {
                lfd.descriptors.concat(descriptors);
            }
            this.writeLFD();
            this.isLFDReady = true;
            return true;
        } else {
            log.error(result.err);
            return false;  // fail to get the descriptor
        }
    }

    public async registerImages(faceLabel: string, imageFiles: Array<string>): Promise<boolean> {
        if (faceLabel == null || faceLabel == '' || faceLabel === undefined) {
            log.error('Face label is empty, null, or undefined');
            return false;
        }
        log.data('Registered: ' + faceLabel.toLowerCase(), imageFiles);
        let descriptors: Array<Float32Array> = new Array<Float32Array>();

        for (let i: number = 0; i < imageFiles.length; i++) {
            if (!this.isImageFormatAccepted(imageFiles[i])) {
                log.error('Image format is not JPEG, BMP, PNG, or GIF:', imageFiles[i]);
                continue;
            }
            let result = await this.getDescriptorByFile(imageFiles[i]);
            if (result.descriptor != null) {
                descriptors.push(result.descriptor);
            } else {
                log.error(result.err);
            }

        }
        if (descriptors.length == 0) return false;  // fail to get any descriptor

        let lfd: LabeledFaceDescriptors | undefined = this.mapFaceLabelLFD.get(faceLabel.toLowerCase());  // the object of type LabeledFaceDescriptors
        if (lfd === undefined) {  // new faceLabel
            let labeledFaceDescriptors: LabeledFaceDescriptors = new LabeledFaceDescriptors(faceLabel.toLowerCase(), descriptors);
            this.mapFaceLabelLFD.set(faceLabel.toLowerCase(), labeledFaceDescriptors);
            this.arrayLFD.push(labeledFaceDescriptors);
        } else {
            lfd.descriptors.concat(descriptors);
        }
        this.writeLFD();
        this.isLFDReady = true;
        return true;
    }

    /**
     * @description Retrieve the face labels from this.mapFaceLabelLFD
     * @returns An array of face labels
     */
    public getFaceLabels(): Array<string> {
        return Array.from(this.mapFaceLabelLFD.keys());
    }

    /**
     * @description Retrieve the face labels from face-image files
     * @description The formal file name of a face image is 'faceLabel_number.jpg'.
     * @returns An array of face labels
     */
    public getFaceLabelsFromFiles(): Array<string> {
        // ensure facePath exist
        if (!fs.existsSync(this.facePath)) {
            fs.mkdirSync(this.facePath);
        }
        let cnSet: Set<string> = new Set<string>();
        let files: Array<string> = fs.readdirSync(this.facePath);
        // The formal file name of a face image is 'faceLabel_number.jpg'.
        files.forEach(file => {
            if (fs.lstatSync(path.join(this.facePath, file)).isFile()) {
                let start: number = 0;
                let end: number = file.lastIndexOf('_');
                if (end > 0) {
                    let faceLabel: string = file.substring(start, end);
                    cnSet.add(faceLabel.toLowerCase());
                }
            }
        });
        return Array.from(cnSet);
    }

    /**
     * @description Face verification (人臉驗證)
     * @param {*} faceLabel A face label of type string to be verified
     * @param {*} tensor A face image of type Tensor3D or Tensor4D
     * @returns An object containing 'label' and 'distance' (Ex.: pe { label: 'lennard', distance: 0.4787 })
     */
    public async verifyByTensor(faceLabel: string, tensor: any): Promise<{ match: FaceMatch | null, err: string | null }> {
        if (faceLabel == null || faceLabel == '' || faceLabel === undefined) {
            return { match: null, err: 'Face label is empty, null, or undefined' };
        }
        await this.loadModels();
        // 無影像可建立LabeledFaceDescriptors
        if (!this.isLFDReady) {
            return { match: null, err: 'The array of LFDs is not ready' };
        }
        // 臉部驗證
        let lfd: LabeledFaceDescriptors | undefined = this.mapFaceLabelLFD.get(faceLabel.toLowerCase());
        if (lfd === undefined) {
            return { match: null, err: 'Cannot find the LFDs of ' + faceLabel.toLowerCase() };
        }
        let matcher: FaceMatcher = new FaceMatcher([lfd], this.distanceThreshold);
        let data = await this.getDescriptorByTensor(tensor);
        if (data.descriptor != null) {
            let match: FaceMatch = matcher.findBestMatch(data.descriptor);
            return { match: match, err: null };
        } else {
            return { match: null, err: data.err };
        }

    }

    /**
     * @description Face verification (人臉驗證)
     * @param {*} faceLabel A face label of type string to be verified
     * @param {*} descriptor A face descriptor of type Float32Array or any
     * @returns An object containing 'label' and 'distance' (Ex.: pe { _label: 'lennard', _distance: 0.4787 })
     */
    public async verifyByDescriptor(faceLabel: string, descriptor: any): Promise<{ match: FaceMatch | null, err: string | null }> {
        if (faceLabel == null || faceLabel == '' || faceLabel === undefined) {
            return { match: null, err: 'Face label is empty, null, or undefined' };
        }
        await this.loadModels();
        // 無影像可建立LabeledFaceDescriptors
        if (!this.isLFDReady) {
            return { match: null, err: 'The array of LFDs is not ready' };
        }
        // 臉部驗證
        let lfd: LabeledFaceDescriptors | undefined = this.mapFaceLabelLFD.get(faceLabel.toLowerCase());
        if (lfd === undefined) {
            return { match: null, err: 'Cannot find the LFDs of ' + faceLabel.toLowerCase() };
        }
        let matcher: FaceMatcher = new FaceMatcher([lfd], this.distanceThreshold);
        let match: FaceMatch = matcher.findBestMatch(descriptor);
        return { match: match, err: null };
    }

    /**
     * @description Face recognition (人臉辨識)
     * @param {*} tensor A face image of type Tensor3D, Tensor4D, or any
     * @returns An object containing 'label' and 'distance' (Ex.: pe { label: 'lennard', distance: 0.4787 })
     */
    public async predictByTensor(tensor: any): Promise<{ match: FaceMatch | null, err: string | null }> {
        await this.loadModels();
        // 無影像可建立LabeledFaceDescriptors
        if (!this.isLFDReady) {
            return { match: null, err: 'The array of LFDs is not ready' };
        }
        // 臉部辨識
        let matcher: FaceMatcher = new FaceMatcher(this.arrayLFD, this.distanceThreshold);
        let data: any = await this.getDescriptorByTensor(tensor);
        if (data.err != null) {
            return { match: null, err: data.err };
        }
        let match: FaceMatch = matcher.findBestMatch(data.descriptor);
        return { match: match, err: null };
    }

    /**
     * @description Face recognition (人臉辨識)
     * @param {*} descriptor A face descriptor of type Float32Array or any
     * @returns An object containing 'label' and 'distance' (Ex.: pe { label: 'lennard', distance: 0.4787 })
     */
    public async predictByDescriptor(descriptor: any): Promise<{ match: FaceMatch | null, err: string | null }> {
        await this.loadModels();
        // 無影像可建立LabeledFaceDescriptors
        if (!this.isLFDReady) {
            return { match: null, err: 'The array of LFDs is not ready' };
        }
        // 臉部辨識
        let matcher: FaceMatcher = new FaceMatcher(this.arrayLFD, this.distanceThreshold);
        let match: FaceMatch = matcher.findBestMatch(descriptor);
        return { match: match, err: null };
    }

    /**
     * @description Build Labeled Face Descriptors from image files
     * @returns false on fail or true on success
     */
    public async buildLFDFromFiles(): Promise<boolean> {
        if (!this.isFaceAPIReady) {
            let success: boolean = await this.initFaceAPI();
            if (!success) {
                log.error('Fail to load FaceAPI models');
                return false;
            }
        }

        this.initRecognizer();

        // ensure facePath exist
        if (!fs.existsSync(this.facePath)) {
            fs.mkdirSync(this.facePath);
            log.warn('Cannot find face images path:', this.facePath);
            log.info('Automatically create the face images path:', this.facePath);
        }

        // 1. 取出包含類別名稱(faceLabel)的所有檔案
        // 2. 建立每張影像檔的絕對路徑
        // 3. 根據路徑載入ImageRGB影像
        let allFiles: Array<string> = fs.readdirSync(this.facePath);
        let faceLabels: Array<string> = this.getFaceLabelsFromFiles();  // format: lower case
        if (faceLabels.length == 0) {
            log.warn('Fail to fetch face images from', this.facePath);
            return false;
        }
        log.data('face labels:', faceLabels);

        let faceFilesByLabel: Array<Array<string>> = faceLabels.map(c =>
            allFiles
                .filter(f => f.toLowerCase().includes(c))
                .map(f => path.join(this.facePath, f))
                .filter(f => fs.lstatSync(f).isFile())
        );

        // expected an array containing at least one face image
        // 無影像可建立LabeledFaceDescriptors
        if (faceFilesByLabel.length == 0) {
            log.warn('無影像可建立LabeledFaceDescriptors');
            return false;
        }

        // 將每個類別的影像加入辨識器中並產生模型檔案
        log.info('Start registering the LFDs for each face label...');
        for (let i: number = 0; i < faceFilesByLabel.length; i++) {
            let faceLabel: string = faceLabels[i];
            let faces: Array<string> = faceFilesByLabel[i];
            // 預設((numTrainFaces <= 0))每個類別皆取所有影像來訓練
            // 若要每類別取(numTrainFaces > 0)張影像來訓練，則執行下列指令：
            if (this.numTrainFaces > 0) {
                faces = faces.slice(0, this.numTrainFaces);
            }
            await this.registerImages(faceLabel.toLowerCase(), faces);
        }

        if (this.arrayLFD.length == 0) {
            log.warn('Fail to register any face descriptor from files.');
        } else {
            this.isLFDReady = true;
            log.info('Registering finished');
        }
        log.info('arrayLFD.length:', this.arrayLFD.length);
        log.info('isLFDReady:', this.isLFDReady);
        return true;
    }

    public writeFaceImage(faceLabel: string, buffer: Buffer): void {
        // ensure facePath exist
        if (!fs.existsSync(this.facePath)) {
            fs.mkdirSync(this.facePath);
            log.warn("Cannot find face images path:", this.facePath);
            log.info("Automatically create the face images path:", this.facePath);
        }
        // 找出目前檔案最大編號並自動產生檔案名稱
        fs.readdir(this.facePath, (err, files) => {
            if (!err) {
                let maxNum: number = 0;
                files.forEach(file => {
                    if (file.substring(0, faceLabel.length) == faceLabel) {
                        let start = faceLabel.length + 1;
                        let end = file.lastIndexOf('.');
                        let num: number = parseInt(file.substring(start, end));
                        if (!isNaN(num)) {
                            if (num > maxNum) {
                                maxNum = num;
                            }
                        }
                    }
                });
                // 指定檔案名稱
                let filename: string = faceLabel + '_' + String(maxNum + 1) + '.jpg';
                let faceFilePath: string = path.resolve(this.facePath, filename);
                log.info('face image filename:', faceFilePath);
                // 將人臉影像寫入檔案
                canvas.loadImage(buffer).then((inputImage: any) => {
                    let outputCanvas: any = faceapi.createCanvasFromMedia(inputImage);
                    fs.writeFileSync(faceFilePath, outputCanvas.toBuffer('image/jpeg'));
                });
            }
        });
    }
}

export { FaceRecognizer };
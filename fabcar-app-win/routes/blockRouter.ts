import { Signer } from "@hyperledger/fabric-gateway";
/**
 * @description Router for the fabcar application using fabric gateway client api
 * @author Ching-Sheng Hsu
 * @since 2023-05-15
 * @version 1.0.0
 */

import { Router, Request, Response } from "express";
import * as fabric_client from "../fabric-client";
import { signWithECDSA } from "../public/SignECDSA/sign";
import { verifySignature } from "../public/SignECDSA/verify";
const router: Router = Router();
const fs = require('fs');
const path = require('path');

// middleware that is specific to this router
router.use((req: Request, res: Response, next) => {
    next();
});

router.get("/queryAllCars", function (req: Request, res: Response) {
    fabric_client.queryAllCars().then((result: string) => {
        res.end(result);
    });
});

router.post("/createPubkey", function (req: Request, res: Response) {
    try {
        let key = req.body.key.trim();
        let owner = "publickey_"+key;
        let publickey =req.body.publickey.trim();
        fabric_client.createPubkey(owner, publickey).then((result: string) => {
            res.end(result);
            console.log("key:", key);
            console.log("owner:", owner);
            console.log("publickey:", publickey);
            console.log("result:", result);
        });
    }
    catch (error) {
        res.end("Error occurred");
        console.error("Error occurred:", error);
    }
});

router.post("/queryPubkey", function (req: Request, res: Response) {
    try {
        let owner: string = req.body.key.trim();
        fabric_client.queryPubkey(owner).then((result: string) => {
            res.end(result);
            console.log("owner:", owner);
            console.log("result:", result);
        });
    }
    catch (error) {
        res.end("Error occurred");
        console.error("Error occurred:", error);
    }
});

router.post("/verifySignature", async function (req: Request, res: Response) {
    try {
        let signature: string = req.body.signature.trim();
        let result: string = req.body.result.trim();
        const verifyResult: boolean = await verifySignature(signature, result);
        res.send(verifyResult);
        console.log("verifyResult:", verifyResult);
    } catch (error) {
        res.end("Error occurred");
        console.error("Error occurred:", error);
    }
});

router.post("/queryCar", async function (req: Request, res: Response) {
    try {
        let key: string = req.body.key.trim();
        const result: string = await fabric_client.queryCar(key);
        const signature: string = await signWithECDSA(result);
        const resultObject = JSON.parse(result);
        resultObject.signature_org = signature;
        const finalResult: string = JSON.stringify(resultObject);
        res.end(finalResult);
    } catch (error) {
        res.end("Error occurred");
        console.error("Error occurred:", error);
    }
});

router.post("/getHistoryForCar", function (req: Request, res: Response) {
    let key: string = req.body.key.trim();
    fabric_client.getHistoryForCar(key).then((result: string) => {
        res.end(result);
    });
});

router.post("/createCar", function (req: Request, res: Response) {
    let carNumber: string = req.body.key;
    let name: string = req.body.name;
    let birthday: string = req.body.birthday;
    let vaccine_name: string = req.body.vaccine_name;
    let vaccine_batchNumber: string = req.body.vaccine_batchNumber;
    let vaccination_date: string = req.body.vaccination_date;
    let vaccination_org: string = req.body.vaccination_org;

    fabric_client
        .createCar(
            carNumber,
            name,
            birthday,
            vaccine_name,
            vaccine_batchNumber,
            vaccination_date,
            vaccination_org
        )
        .then((result: string) => {
            res.end(result);
        });
});

// router.post('/updateCar', function (req: Request, res: Response) {
//     let key: string = req.body.key;
//     let color: string = req.body.color;
//     let make: string = req.body.make;
//     let model: string = req.body.model;
//     let owner: string = req.body.owner;
//     fabric_client.createCar(key, make, model, color, owner).then((result: string) => {
//         res.end(result);
//     });
// });

export { router as blockRouter };

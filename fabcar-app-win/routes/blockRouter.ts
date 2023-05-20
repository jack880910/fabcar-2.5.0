/**
 * @description Router for the fabcar application using fabric gateway client api
 * @author Ching-Sheng Hsu
 * @since 2023-05-15
 * @version 1.0.0
 */


import { Router, Request, Response } from 'express';
import * as log from '@vladmandic/pilogger';
import * as fabric_client from '../fabric-client';
const router: Router = Router();

// middleware that is specific to this router
router.use((req: Request, res: Response, next) => {
    next();
});

router.get('/queryAllCars', function (req: Request, res: Response) {
    fabric_client.queryAllCars().then((result: string) => {
        res.end(result);
    });
});

router.post('/queryCar', function (req: Request, res: Response) {
    let key: string = req.body.key.trim();
    fabric_client.queryCar(key).then((result: string) => {
        res.end(result);
    });
});

router.post('/getHistoryForCar', function (req: Request, res: Response) {
    let key: string = req.body.key.trim();
    fabric_client.getHistoryForCar(key).then((result: string) => {
        res.end(result);
    });
});

router.post('/createCar', function (req: Request, res: Response) {
    let key: string = req.body.key;
    let name: string = req.body.name;
    let birthday: string = req.body.birthday;
    let vaccine_name: string = req.body.vaccine_name;
    let vaccine_bathNumber: string = req.body.vaccine_bathNumber;
    let vaccination_date: string = req.body.vaccination_date;
    let vaccination_org: string = req.body.vaccination_org;

    fabric_client.createCar(key, name, birthday, vaccine_name, vaccine_bathNumber, vaccination_date, vaccination_org).then((result: string) => {
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
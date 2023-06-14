import * as fcb from './fabric-client-base';
import { TextDecoder } from 'util';

const utf8Decoder = new TextDecoder();

//--------------------------
//以下程式需依系統需求自行開發
//--------------------------


export async function createCar(key: string, make: string, model: string, color: string, owner: string): Promise<string> {
    // The gRPC client connection should be shared by all Gateway connections to this endpoint.
    const client = await fcb.newGrpcConnection();
    const gateway = await fcb.newGateway(client);

    try {
        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(fcb.channelName);

        // Get the smart contract from the network.
        const contract = network.getContract(fcb.chaincodeName);

        // Create a new car on the ledger.
        console.log('\n--> Submit Transaction: CreateCar, creates new car with key, make, model, color, and owner');

        await contract.submitTransaction('createCar', key, make, model, color, owner);

        console.log('*** Transaction committed successfully');
        return "SUCCESS";
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return "FAIL";
    } finally {
        gateway.close();
        client.close();
    }
}


export async function queryAllCars(): Promise<string> {
    // The gRPC client connection should be shared by all Gateway connections to this endpoint.
    const client = await fcb.newGrpcConnection();
    const gateway = await fcb.newGateway(client);

    try {
        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(fcb.channelName);

        // Get the smart contract from the network.
        const contract = network.getContract(fcb.chaincodeName);

        // Evaluate the specified transaction.
        const resultBytes = await contract.evaluateTransaction('queryAllCars');
        const resultJson = utf8Decoder.decode(resultBytes);

        console.log(`Transaction has been evaluated, result is: ${resultJson}`);
        return resultJson;
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return "FAIL";
    } finally {
        gateway.close();
        client.close();
    }
}


export async function queryCar(carNumber: string): Promise<string> {
    // The gRPC client connection should be shared by all Gateway connections to this endpoint.
    const client = await fcb.newGrpcConnection();
    const gateway = await fcb.newGateway(client);

    try {
        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(fcb.channelName);

        // Get the smart contract from the network.
        const contract = network.getContract(fcb.chaincodeName);

        // Evaluate the specified transaction.
        const resultBytes = await contract.evaluateTransaction('queryCar', carNumber);
        const resultJson = utf8Decoder.decode(resultBytes);

        console.log(`Transaction has been evaluated, result is: ${resultJson}`);
        return resultJson;
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return "FAIL";
    } finally {
        gateway.close();
        client.close();
    }
}


export async function getHistoryForCar(carNumber: string): Promise<string> {
    // The gRPC client connection should be shared by all Gateway connections to this endpoint.
    const client = await fcb.newGrpcConnection();

    const gateway = await fcb.newGateway(client);

    try {
        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(fcb.channelName);

        // Get the smart contract from the network.
        const contract = network.getContract(fcb.chaincodeName);

        // Evaluate the specified transaction.
        const resultBytes = await contract.evaluateTransaction('getHistoryForCar', carNumber);
        const resultJson = utf8Decoder.decode(resultBytes);

        console.log(`Transaction has been evaluated, result is: ${resultJson}`);
        return resultJson;
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return "FAIL";
    } finally {
        gateway.close();
        client.close();
    }
}
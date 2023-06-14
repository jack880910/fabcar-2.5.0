// qrcode-verify.js

// 當QR Code圖片掃描成功後的處理函式
function onQRCodeScanned(qrCodeData) {
    // 解碼QR Code資料
    var decodedData = decodeQRCode(qrCodeData);

    // 擷取所需欄位
    var 身分證號碼 = decodedData.身分證號碼;
    var 姓名 = decodedData.姓名;
    var 性別 = decodedData.性別;
    var 疫苗名稱 = decodedData.疫苗名稱;
    var 疫苗批次號碼 = decodedData.疫苗批次號碼;
    var 施打日期 = decodedData.施打日期;
    var 執行者 = decodedData.執行者;
    var 機構數位簽章 = decodedData.機構數位簽章;
    var 用戶數位簽章 = decodedData.用戶數位簽章;

    // 將資料顯示在網頁上
    var qrcodeInfoElement = document.getElementById("qrcode-info");
    qrcodeInfoElement.innerHTML = `
        <p>身分證號碼: ${身分證號碼}</p>
        <p>姓名: ${姓名}</p>
        <p>性別: ${性別}</p>
        <p>疫苗名稱: ${疫苗名稱}</p>
        <p>疫苗批次號碼: ${疫苗批次號碼}</p>
        <p>施打日期: ${施打日期}</p>
        <p>執行者: ${執行者}</p>
        <p>機構數位簽章: ${機構數位簽章}</p>
        <p>用戶數位簽章: ${用戶數位簽章}</p>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
  const scanDataInput = document.getElementById('scanData');
  const resultDiv = document.getElementById('result');
  const verifyButton = document.getElementById('verifyButton');

  scanDataInput.addEventListener('keyup', event => {
    if (event.keyCode === 13) {
      event.preventDefault();
      const scanData = scanDataInput.value;
      displayScanResult(scanData);
    }
  });

  function displayScanResult(scanData) {
    const dataFields = scanData.split('&');
    const resultText = document.createElement('p');

    // 檢查資料是否完整
    if (dataFields.length === 9) {
      const id = dataFields[0];
      const name = dataFields[1];
      const gender = dataFields[2];
      const vaccineName = dataFields[3];
      const batchNumber = dataFields[4];
      const vaccinationDate = dataFields[5];
      const vaccinationOrganization = dataFields[6];
      const dataProviderSignature = dataFields[7];
      const verifierSignature = dataFields[8];

      //確認資料ok後，呼叫verifySignature，最後連驗證結果一起顯示在網頁上
      var req2 = new XMLHttpRequest();
      var action2 = "/verifySignature";
      var method2 = "POST";
      var url2 = window.location.protocol + "//" + window.location.host + action2;

      var verifyResult = "驗證中...";
      console.log("verifyResult1: " + verifyResult);

      req2.open(method2, url2, true);
      req2.onload = function () {
        var result2 = this.responseText;
        if (result2.toLowerCase() == 'false' || result2.trim() == '') {
          verifyResult = "不通過";
          console.log("verifyResult2: " + verifyResult);
          verifyButton.style.display = "none";
        } if (result2.toLowerCase() == 'true') {
          verifyResult = "通過";
          console.log("verifyResult3: " + verifyResult);
          verifyButton.style.display = "block";
        }
      }
      req2.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
      var data2 = "signature=" + verifierSignature + "&" +
        "keyowner=" + id + "&" +
        "result=" + scanDataInput.value;
      req2.send(data2);

      resultText.innerHTML = `
        身分證字號：${id}<br>
        姓名：${name}<br>
        性別：${gender}<br>
        疫苗名稱：${vaccineName}<br>
        疫苗批次：${batchNumber}<br>
        接種日期：${vaccinationDate}<br>
        施打組織：${vaccinationOrganization}<br>
        數位簽章驗證結果：${verifyResult}<br>
        資料提供者數位簽章：${dataProviderSignature}<br>
        驗證者數位簽章：${verifierSignature}
      `;
    } else {
      resultText.textContent = '掃描到的資料不完整';
      verifyButton.style.display = "none";
    }

    resultDiv.innerHTML = '';
    resultDiv.appendChild(resultText);
    scanDataInput.value = '';
  }
});

function redirectToVerification() {
  window.location.href = "webcam-verify.html";
}
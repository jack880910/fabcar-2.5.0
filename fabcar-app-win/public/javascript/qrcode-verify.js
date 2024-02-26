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
      const verifyData_origin = dataFields.slice(0, 8).join('#');
      const verifyData = verifyData_origin.replace(/\+/g, "!");
      console.log("verifyData1: " + verifyData);
      localStorage.setItem("userId", id);


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
          console.log("verifyData2: " + verifyData);
          verifyButton.style.display = "none";
        } if (result2.toLowerCase() == 'true') {
          verifyResult = "通過";
          console.log("verifyResult3: " + verifyResult);
          verifyButton.style.display = "block";
        }
      }
      req2.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
      var data2 = "keyowner=" + id + "&" +
        "signature=" + verifierSignature + "&" +
        "result=" + verifyData.toString();
      req2.send(data2);
      console.log("verifyData3: " + verifyData);

      setTimeout(() => {
        resultText.innerHTML = `
        護照號碼：${id}<br>
        姓名：${name}<br>
        性別：${gender}<br>
        疫苗名稱：${vaccineName}<br>
        疫苗批次：${batchNumber}<br>
        接種日期：${vaccinationDate}<br>
        施打組織：${vaccinationOrganization}<br>
        醫療機構數位簽章：${dataProviderSignature}<br>
        驗證者數位簽章：${verifierSignature}<br>
        數位簽章驗證結果：${verifyResult}<br>
      `;
      }, 300);

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
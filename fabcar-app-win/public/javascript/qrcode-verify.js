document.addEventListener('DOMContentLoaded', () => {
    const scanDataInput = document.getElementById('scanData');
    const resultDiv = document.getElementById('result');
  
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
  
        resultText.innerHTML = `
          身分證字號：${id}<br>
          姓名：${name}<br>
          性別：${gender}<br>
          疫苗名稱：${vaccineName}<br>
          疫苗批次：${batchNumber}<br>
          接種日期：${vaccinationDate}<br>
          施打組織：${vaccinationOrganization}<br>
          資料提供者數位簽章：${dataProviderSignature}<br>
          驗證者數位簽章：${verifierSignature}
        `;
      } else {
        resultText.textContent = '掃描到的資料不完整';
      }
  
      resultDiv.appendChild(resultText);
      scanDataInput.value = '';
    }
  });
  
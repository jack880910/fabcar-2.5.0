# 基於區塊鏈技術的疫苗施打證明系統
- 使用Hyperledger Fabric搭建的區塊鏈系統，透過Docker在Ubuntu上運行
- 使用Node.js與Express框架搭建的網頁伺服器端來與區塊鏈系統溝通
- 網頁客戶端提供新增與查詢疫苗施打紀錄、註冊臉部辨識模型、使用者身分驗證等功能
- 使用者能透過手機App進行身分驗證與查詢疫苗施打紀錄
- 結合數位簽章、二維條碼、臉部辨識等技術，確保使用者的身分真實性


## 1. 醫療機構端
醫療機構端可以使用網頁登入系統，並有4項功能，包括新增施打紀錄、查詢最近施打紀錄、查詢歷次施打紀錄和臉部影像登錄

### 系統登入畫面  
<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/%E7%99%BB%E5%85%A5%E7%95%AB%E9%9D%A2.png' width = '80%'>

###  醫療機構登入畫面  
<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/%E9%86%AB%E7%99%82%E6%A9%9F%E6%A7%8B%E7%99%BB%E5%85%A5.png' width = '80%'>

### 醫療機構首頁
<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/%E7%B3%BB%E7%B5%B1%E9%A6%96%E9%A0%81.png' width = '80%'>

### 新增施打紀錄
輸入相關資料可以新增施打紀錄

<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/%E6%96%B0%E5%A2%9E%E6%96%BD%E6%89%93%E7%B4%80%E9%8C%84.png' width = '80%'>

### 查詢最近施打紀錄
輸入被查驗者護照號碼可以查詢最近一次的疫苗施打紀錄

<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/%E6%AD%B7%E5%8F%B2%E6%96%BD%E6%89%93%E7%B4%80%E9%8C%84.png' width = '80%'>

### 查詢歷次施打紀錄
輸入被查驗者護照號碼可以查詢過去所有的疫苗施打紀錄

<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/歷史施打紀錄.png' width = '80%'>

### 臉部影像登錄
醫療機構可以透過鏡頭為使用者登錄臉部影像

<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/%E8%A8%BB%E5%86%8A%E8%87%89%E9%83%A8%E8%BE%A8%E8%AD%98.png' width = '80%'>

## 2. 使用者端
使用者可以用App登入系統，App提供臉部影像登錄/驗證及二維條碼驗證的功能

### App登入畫面
<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/App%20%E7%99%BB%E5%85%A5%E7%95%AB%E9%9D%A2.png' width = '30%'>

### App首頁
<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/App%E9%A6%96%E9%A0%81.png' width = '30%'>

### App臉部影像登錄/驗證功能
進入臉部影像登錄/驗證頁面，系統會自動擷取畫面範圍內的臉部影像，使用者可自行選擇要以此張臉部影像進行登錄或是驗證

<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/App%E8%87%89%E9%83%A8%E8%BE%A8%E8%AD%98%E5%8A%9F%E8%83%BD.png' width = '30%'>

### App二維條碼驗證功能
進入二維條碼驗證畫面，會顯示個人的疫苗施打證明資訊以及供驗證用的二維條碼

<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/App%20QRcode%E9%A9%97%E8%AD%89.png' width = '30%'>

## 3. 查驗者端
查驗者可以使用網頁登入系統，結合二維條碼與臉部辨識進行雙重驗證

### 系統登入畫面  
<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/%E7%99%BB%E5%85%A5%E7%95%AB%E9%9D%A2.png' width = '80%'>

### 查驗者登入
<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/%E6%9F%A5%E9%A9%97%E8%80%85%E7%99%BB%E5%85%A5.png' width = '80%'>

### QRcode驗證頁面
登入後來到驗證畫面，等待掃描二維條碼

<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/QRcode%E9%A9%97%E8%AD%89%E9%A0%81%E9%9D%A2.png' width = '80%'>

### 掃描二維條碼
查驗者掃描使用者出示的二維條碼進行驗證

<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/%E6%8E%83%E6%8F%8F%E8%A1%8C%E5%8B%95%E8%A3%9D%E7%BD%AEQRcode.png' width = '30%'>

### 二維條碼驗證結果
二維條碼掃描成功後會顯示被查驗者的疫苗施打證明以及數位簽章驗證結果，並跳出前往人臉驗證的按鈕

<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/%E9%A9%97%E8%AD%89%E7%B5%90%E6%9E%9C.png' width = '80%'>

### 臉部辨識驗證結果
進入臉部辨識系統後，驗證的結果會直接顯示在畫面上

<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/%E8%87%89%E9%83%A8%E8%BE%A8%E8%AD%98%E9%A9%97%E8%AD%89.png' width = '80%'>




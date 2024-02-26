# 基於區塊鏈技術的疫苗施打證明系統
我們使用Linux基金會支持的超級帳本技術（Hyperledger Fabric）來搭建許可制的區塊鏈系統，並透過Docker在Ubuntu上運行
利用Node.js與Express框架建構的伺服器端來與區塊鏈系統溝通，再製作網頁客戶端來查詢疫苗施打紀錄、註冊臉部辨識模型、進行身分驗證等等。
同時，我們還用Android Studio (JAVA)製作了一個App，使用者能夠透過行動裝置進行身分驗證並查看自己的疫苗施打紀錄。
另外，系統還結合了數位簽章、二維條碼、臉部辨識等技術，以確保使用者的身分真實性。

## 醫療機構端


### 系統登入畫面  
<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/%E7%99%BB%E5%85%A5%E7%95%AB%E9%9D%A2.png' width = '80%'>

###  醫療機構登入  
<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/%E9%86%AB%E7%99%82%E6%A9%9F%E6%A7%8B%E7%99%BB%E5%85%A5.png' width = '80%'>

### 醫療機構首頁
<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/%E7%B3%BB%E7%B5%B1%E9%A6%96%E9%A0%81.png' width = '80%'>

### 新增與查詢施打紀錄  
<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/%E6%96%B0%E5%A2%9E%E6%96%BD%E6%89%93%E7%B4%80%E9%8C%84.png' width = '80%'>
<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/%E6%AD%B7%E5%8F%B2%E6%96%BD%E6%89%93%E7%B4%80%E9%8C%84.png' width = '80%'>

## 查驗者端

### 系統登入畫面  
<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/%E7%99%BB%E5%85%A5%E7%95%AB%E9%9D%A2.png' width = '80%'>

### 查驗者登入
<image src = 'https://github.com/jack880910/fabcar-2.5.0/blob/master/fabcar-app-win/img/%E6%9F%A5%E9%A9%97%E8%80%85%E7%99%BB%E5%85%A5.png' width = '80%'>

## 使用者端

### App登入畫面

<image src = '' width = '80%'>
<image src = '' width = '80%'>
<image src = '' width = '80%'>
<image src = '' width = '80%'>
<image src = '' width = '80%'>
<image src = '' width = '80%'>

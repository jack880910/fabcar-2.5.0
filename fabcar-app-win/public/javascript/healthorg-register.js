
function register() {
    document.forms["loginForm"].addEventListener("submit", function (event) {
        event.preventDefault(); // 防止表單自動提交
    });

    var username = document.forms["loginForm"]["username"].value;
    var password = document.forms["loginForm"]["password"].value;

    if (username == "" || password == "") {
        alert("請輸入使用者名稱和密碼");
    } else {
        localStorage.setItem("username", username);
    }

    var req = new XMLHttpRequest();
    var action = "/generateKeypair";
    var method = "POST";
    var url = window.location.protocol + "//" + window.location.host + action;

    req.open(method, url, true);

    req.onload = function () {
        var publickey = this.responseText;

        var req = new XMLHttpRequest();
        var action = "/createPubkey";
        var method = "POST";
        var url = window.location.protocol + "//" + window.location.host + action;

        req.open(method, url, true);

        req.onload = function () {
            var message = this.responseText;
            if (this.responseText.toLowerCase() == 'success') {
                message = "註冊成功！";
                alert(message);
                window.location.href = "healthorg-signin.html"; // 頁面跳轉
            } else {
                message = "註冊失敗！";
                alert(message);
            }
        };

        //Send the proper header information along with the request
        req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');

        var data = "key=" + username + "&" +
            "publickey=" + publickey;

        req.send(data);

    };

    //Send the proper header information along with the request
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');

    var data = "key=" + username;

    req.send(data);

}
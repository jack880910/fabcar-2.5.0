
document.addEventListener("DOMContentLoaded", function () {
    // 頁面跳轉
    document.forms["loginForm"].addEventListener("submit", function (event) {
        event.preventDefault(); // 防止表單自動提交

        var username = document.forms["loginForm"]["username"].value;
        var password = document.forms["loginForm"]["password"].value;

        if (username == "" || password == "") {
            alert("請輸入使用者名稱和密碼");
        } else {
            localStorage.setItem("verifier", username);
            window.location.href = "qrcode-verify.html"; // 頁面跳轉
        }

    });
});

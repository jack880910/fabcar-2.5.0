
function createCar() {
    // Important!!!
    document.querySelector("#fabcar-form").addEventListener("submit", function (e) {
        e.preventDefault();    //stop form from submitting
    }, false);

    // form data
    var key = document.getElementById("fabcar-key").value.trim();
    var name = document.getElementById("fabcar-name").value.trim();
    var birthday = document.getElementById("fabcar-birthday").value.trim();
    var vaccine_name = document.getElementById("fabcar-vaccine-name").value.trim();
    var vaccine_batchNumber = document.getElementById("fabcar-vaccine-batchNumber").value.trim();
    var vaccination_date = document.getElementById("fabcar-vaccination-date").value.trim();
    var vaccination_org = document.getElementById("fabcar-vaccination-org").value.trim();

    if (key == '') {
        alert('請填寫用戶編號！');
        document.getElementById("fabcar-key").focus();
        return;
    } else if (name == '') {
        alert('請填寫姓名！');
        document.getElementById("fabcar-name").focus();
        return;
    } else if (birthday == '') {
        alert('請填寫生日！');
        document.getElementById("fabcar-birthday").focus();
        return;
    } else if (vaccine_name == '') {
        alert('請填寫疫苗名稱！');
        document.getElementById("fabcar-vaccine-name").focus();
        return;
    } else if (vaccine_batchNumber == '') {
        alert('請填寫疫苗批號！');
        document.getElementById("fabcar-vaccine-batchNumber").focus();
        return;
    } else if (vaccination_date == '') {
        alert('請填寫疫苗接種日期！');
        document.getElementById("fabcar-vaccination-date").focus();
        return;
    } else if (vaccination_org == '') {
        alert('請填寫疫苗接種機構！');
        document.getElementById("fabcar-vaccination-org").focus();
        return;
    }


    var req = new XMLHttpRequest();
    var action = "/createCar";
    var method = "POST";
    var url = window.location.protocol + "//" + window.location.host + action;

    req.open(method, url, true);

    req.onload = function () {
        var message = this.responseText;
        if (this.responseText.toLowerCase() == 'success') {
            message = "紀錄新增成功！";
            // reset the form
            document.getElementById("fabcar-form").reset();
            // document.getElementById("fabcar-key").focus();
        } else {
            message = "紀錄新增失敗！";
        }
        alert(message);
    };

    //Send the proper header information along with the request
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');

    var data = "key=" + key + "&" +
        "name=" + name + "&" +
        "birthday=" + birthday + "&" +
        "vaccine_name=" + vaccine_name + "&" +
        "vaccine_batchNumber=" + vaccine_batchNumber + "&" +
        "vaccination_date=" + vaccination_date + "&" +
        "vaccination_org=" + vaccination_org;

    req.send(data);
}
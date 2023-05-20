
function createCar() {
    // Important!!!
    document.querySelector("#fabcar-form").addEventListener("submit", function (e) {
        e.preventDefault();    //stop form from submitting
    }, false);

    // form data
    var key = document.getElementById("fabcar-key").value.trim();
    var color = document.getElementById("fabcar-color").value.trim();
    var make = document.getElementById("fabcar-make").value.trim();
    var model = document.getElementById("fabcar-model").value.trim();
    var owner = document.getElementById("fabcar-owner").value.trim();

    if (key == '') {
        alert('請填寫編號！');
        document.getElementById("fabcar-key").focus();
        return;
    } else if (color == '') {
        alert('請填寫顏色！');
        document.getElementById("fabcar-color").focus();
        return;
    } else if (make == '') {
        alert('請填寫製造商！');
        document.getElementById("fabcar-make").focus();
        return;
    } else if (model == '') {
        alert('請填寫型式！');
        document.getElementById("fabcar-model").focus();
        return;
    } else if (owner == '') {
        alert('請填寫車主！');
        document.getElementById("fabcar-owner").focus();
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
            message = "車輛新增成功！";
            // reset the form
            document.getElementById("fabcar-form").reset();
            // document.getElementById("fabcar-key").focus();
        } else {
            message = "車輛新增失敗！";
        }
        alert(message);
    };

    //Send the proper header information along with the request
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');

    var data = "key=" + key + "&" +
        "color=" + color + "&" +
        "make=" + make + "&" +
        "model=" + model + "&" +
        "owner=" + owner;

    req.send(data);
}

function updateCar() {
    // Important!!!
    document.querySelector("#fabcar-form").addEventListener("submit", function (e) {
        e.preventDefault();    //stop form from submitting
    }, false);

    // form data
    var key = document.getElementById("input-fabcar-key").value.trim();
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
    var action = "/updateCar";
    var method = "POST";
    var url = window.location.protocol + "//" + window.location.host + action;

    req.open(method, url, true);

    req.onload = function () {
        var message = this.responseText;
        if (this.responseText.toLowerCase() == 'success') {
            message = "車輛修改成功！";
            // reset the form
            document.getElementById("fabcar-form").reset();
            // document.getElementById("fabcar-key").focus();
        } else {
            message = "車輛修改失敗！";
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


function queryCar() {
    // Important!!!
    document.querySelector("#fabcar-form").addEventListener("submit", function (e) {
        e.preventDefault();    //stop form from submitting
    }, false);

    // car number
    var key = document.getElementById("input-fabcar-key").value.trim();

    var req = new XMLHttpRequest();
    var action = "/queryCar";
    var method = "POST";
    var url = window.location.protocol + "//" + window.location.host + action;
    
    req.open(method, url, true);

    req.onload = function () {
        var result = this.responseText;
        if (result.toLowerCase() == 'fail' || result.trim() == '') {
            alert('查詢失敗！');
            return
        }

        // 回傳結果範例：
        // {"colour":"blue","docType":"car","make":"Toyota","model":"Prius","owner":"Tomoko"}
        // 處理方式：
        // (1) JSON格式轉換成JavaScript物件obj
        // (2) 操作物件：obj.colour, obj.make, obj.model, obj.owner

        var obj = JSON.parse(result);  // JSON格式轉換成JavaScript物件obj

        document.getElementById("fabcar-color").value = obj.colour;
        document.getElementById("fabcar-make").value = obj.make;
        document.getElementById("fabcar-model").value = obj.model;
        document.getElementById("fabcar-owner").value = obj.owner;
    }

    //Send the proper header information along with the request
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
    var data = "key=" + key;
    req.send(data);
}

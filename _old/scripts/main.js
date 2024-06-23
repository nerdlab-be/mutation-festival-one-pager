var countdownDate = new Date("2024-11-22").toUTCString();
// global vars
var timer = null;
var toZero;
var end;

// Get Ids fields 
var daysField = document.getElementById("days");
var hoursField = document.getElementById("hours");
var minutesField = document.getElementById("minutes");
var secondsField = document.getElementById("seconds");

toZero = daysField.innerHTML = hoursField.innerHTML = minutesField.innerHTML = secondsField.innerHTML = "00";

function onLoad(){
    end = countdownDate;
    countDown();
    timer = setInterval(countDown, 1000);
}
function countDown(){

    var timedate = new Date(Date.parse(end)); 
    var now = new Date(); 
    var date = (timedate.getTime() - now.getTime()) / 1000; 
    var day = Math.floor(date / (60 * 60 * 24));
    var _hour = date - day * 60 * 60 * 24;
    var hour = Math.floor(_hour / (60 * 60));
    var _minute = _hour - hour * 60 * 60;
    var minute = Math.floor(_minute / (60));
    var _second = _minute - minute * 60;
    var second = Math.floor(_second);
    
    function toDou(n) {
        if (n < 10) {
            return '0' + n;
        } else {
            return '' + n;
        }
    }

    if (date > 0) {
        daysField.innerHTML = toDou(day);
        hoursField.innerHTML = toDou(hour);
        minutesField.innerHTML = toDou(minute);
        secondsField.innerHTML = toDou(second);
    } else {
        endtime.value = "";
        clearInterval(timer);
        toZero;
    }
}

onLoad();
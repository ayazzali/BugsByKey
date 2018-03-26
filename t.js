'use strict';
let fetch = require("node-fetch") //todo
// import {vk} from "vk" //todo

// var keypair = require('keypair');
// var pair = keypair();
console.log("init...");
var ACCESS_TOKEN = "77b611c7db3ce9c89112a91894e2a2fa9daf00bc80d3345f757a047e638ec8d18a4d56985f13f5fd3842f"

//updates:
longPoll()

//send event handler:
var stdin = process.openStdin();
stdin.addListener("data", function (d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that  
    // with toString() and then trim() 
    let maratId=75332891;
    //console.trace(d)
    Send(d.toString().trim(),maratId)
});

function Send(text="ghbftn", to=75332891, token) {
    fetch("https://api.vk.com/method/messages.send?user_id="+to+
        "&message="+text+"&access_token=" + ACCESS_TOKEN + "&v=5.73"
        , { method: 'GET', mode: 'cors' })
        .then(function (response) {
            //console.log(response.headers.get('Content-Type')); // application/json; charset=utf-8
            console.log("send: "+response.status); // 200
            //console.log(response);
            return response.json();
        })
        .then(function (cb) {
            console.log("Send response:")
            console.log(cb);
        }).catch(console.log);

}
function longPoll(text, to, token) {//todo ACCESS_TOKEN (..)
    function upd(server, key, ts) {
        return fetch("https://" + server + "?act=a_check&key=" + key + "&ts=" + ts + "&wait=25&mode=2&version=2")
            .then((rawUpdate) => {
                //console.log(rawUpdate)
                return rawUpdate.json()
            }).then((update) => {
                //console.log(update)
                return update
            }).catch(console.log);
    }

    fetch("https://api.vk.com/method/messages.getLongPollServer?access_token="
        + ACCESS_TOKEN + "&v=5.73")
        .then(function (response) {
            console.log(response.headers.get('Content-Type')); // application/json; charset=utf-8
            console.log(response.status); // 200
            return response.json();
        })
        .then(function (lp) {
            var r = lp.response;
            (async () => {
                var ts = r.ts
                while (true) {
                    try {
                        var result = await upd(r.server, r.key, ts)
                        ts = result.ts
                        //console.log(result.updates);
                        if (result.updates)  // проверка, были ли обновления
                            result.updates.forEach(element => {
                                let action_code = element[0]  // запись в переменную кода события
                                if (action_code == 4)  // проверка кода события
                                    console.log(element[5]) 
                            });
                    } catch (e) {console.log(e)}
                }
            })();
        })
        .catch(console.log);


}
//import { log } from "util";

'use strict';
const fetch = require("node-fetch") //todo
var fs = require('fs');
//const jsonPrototype = require("jsonprototype") 

// import {vk} from "vk" //todo

//var keypair = require('keypair');
//var __pair = keypair();
// var rs = require("jsrsasign");
// //var rsu = require("jsrsasign-util"); // for file I/O
// var kp = rs.KEYUTIL.generateKeypair("RSA", 2048);
// var prvPEM = rs.KEYUTIL.getPEM(kp.prvKeyObj, "PKCS8PRV", "password");
// //rsu.saveFile("foo.key", prvPEM);
// console.log(prvPEM)
//
//
var cryptico = require("cryptico");
var PassPhrase = "The Moon is a Harsh Mistress.";//what is it??????????
// The length of the RSA key, in bits. 
var Bits = 1024;
var MattsRSAkey = cryptico.generateRSAKey(PassPhrase, Bits);
var MattsPublicKeyString = cryptico.publicKeyString(MattsRSAkey);
var PlainText = "Matt"

//var EncryptionResult = cryptico.encrypt(PlainText, MattsPublicKeyString);
//console.log(EncryptionResult)
console.log(MattsPublicKeyString)
fs.readFile("key", { encoding: 'utf-8' }, function (err, data) {
    if (!err) {
        console.log('from file: ' + data);
        if (data) {
            MattsRSAkey= cryptico.RSAKey.parse(data)
             
            MattsPublicKeyString = cryptico.publicKeyString(MattsRSAkey);
        }
        //        response.writeHead(200, {'Content-Type': 'text/html'});
        //      response.write(data);
        //    response.end();
    } else {
        //console.warn(err);
        fs.writeFile("key", JSON.stringify(MattsRSAkey), function (err) {
            if (err) {
                return console.error(err);
            }
            console.warn("The NEW! key was saved!");
        });
    }
});

//var DecryptionResult = cryptico.decrypt(CipherText, MattsRSAkey);
//console.log(DecryptionResult.plaintext)
// return;

// var algName = "RSA";
// var keyObj = kp.pubKeyObj//rs.KEYUTIL.getKey(keyStr);
// let encHex = rs.KJUR.crypto.Cipher.encrypt("aaaaaaaaaa");
// console.log(encHex)
// return ;

// var prv =kp.prvKeyObj//= KEYUTIL.getKey("-----BEGIN ENCRYPTED PRIVATE KEY...", "pass");
// // generate Signature object
// var sig = new rs.KJUR.crypto.Signature({"alg": "SHA256withRSA"});
// // set private key for sign
// sig.init(prv);
// // update data
// sig.updateString("aaa  objectaaa  aaa");
// // calculate signature
// console.log(sig)
// var sigHex = sig.sign();
// console.log("--")
// console.log(sigHex)
// return ;

console.log("init...");
var ACCESS_TOKEN = "9a53b2fc0ce3a7f469dca24d6ea4f7fb7f128afce3e15e545313ce66d8c5eb78cb32a479bf40ff5818120"

//updates:
longPoll()

//send event handler:
var stdin = process.openStdin();
stdin.addListener("data", function (d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that  
    // with toString() and then trim() 
    let maratId = 75332891;
    let text = d.toString().trim();
    text = encodeURI(text)
    text = cryptico.encrypt(text, MattsPublicKeyString).cipher
    //text = btoa(text)// base64
    console.log(text)
    Send(text, maratId)
});

function Send(text = "default text", to = 75332891, token) {
    fetch("https://api.vk.com/method/messages.send?user_id=" + to +
        "&message=" + text + "&access_token=" + ACCESS_TOKEN + "&v=5.73"
        , { method: 'GET', mode: 'cors' })
        .then(function (response) {
            //console.log(response.headers.get('Content-Type')); // application/json; charset=utf-8
            console.log("Send status: " + response.status); // 200
            //console.log(response);
            return response.json();
        })
        .then(function (cb) {
            console.log("Send response:")
            console.log(cb);
        }).catch(console.error);

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
            }).catch(console.error);
    }

    fetch("https://api.vk.com/method/messages.getLongPollServer?access_token=" + ACCESS_TOKEN + "&v=5.73")
        .then(function (response) {
            console.log(response.headers.get('Content-Type')); // application/json; charset=utf-8
            console.log(response.status); // 200
            return response.json();
        })
        .then(function (lp) {
            var r = lp.response;
            (async () => {// по другому не умею запускать await fetch() --ниже 
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
                                {
                                    let text = element[5].split(" ").join("+")/// ибо вк видимо энкодит  //atob(element[5])
                                    console.log(text)
                                    var DecryptionResult = cryptico.decrypt(text, MattsRSAkey);
                                    let plainText = decodeURI(DecryptionResult.plaintext)
                                    console.log("decripted: " + plainText)
                                }
                            });
                    } catch (e) { console.error(e) }
                }
            })();
        })
        .catch(console.error);


}
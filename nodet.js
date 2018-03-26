'use strict';
 let fetch=require("node-fetch")


let token = '9d293fd6f52bc21ba05951ef355bee1756412f2304d6d9fdb108e671d34476cb3d3b3a6b93b4c2b9dcef1';
let user_id = 75332891;
let message = 'msg';
let apiMsg = 'https://api.vk.com/method/messages.send';

let header ={
    'Access-Control-Allow-Origin':'*',
    'Content-Type': 'multipart/form-data'
}

let data = {
    'user_id': user_id,
    'message': message,
    'access_token': token
};

let options = {
    mode: 'cors',
    header: header,
    'method': 'post',
    'payload': data
};

fetch(apiMsg, options)
    .then((data) => {
        console.log(data)
        return data.json()
    })
    .then((text) => {
        console.log(text)
    })
    .catch((error) => {
        console.log('There has been a problem with your fetch operation: ' + error.message)
    })
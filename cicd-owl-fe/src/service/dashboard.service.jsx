// import React, { useState, useRef, useEffect } from 'react';
import { API_ENDPOINT } from './constant.service';
// import {Idashboard} from '../interface/Idashboard';

// User Login
async function userLogin(user, pass) {
  let data = await fetch(API_ENDPOINT + '/users/login', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "data": {
        "userName": user,
        "userPass": pass
      }
    })
  })
  return data
}

// Check Token Validation
async function validateToken(token) {
  let data = undefined;
  if (token) {
    data = await fetch(API_ENDPOINT + '/users/login/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "data": token
      })
    })
  }
  // console.log(data)
  return data
}

// Get All CICD Items
async function getAllCicd() {
  let data = undefined;
  await fetch(API_ENDPOINT + '/cicds').then(res => res.json()).then((res) => {
    data = res.data;
  });
  return data
}


export { userLogin, getAllCicd, validateToken };


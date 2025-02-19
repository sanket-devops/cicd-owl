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
async function _getAllCicd() {
  let data = undefined;
  await fetch(API_ENDPOINT + '/cicds').then(res => res.json()).then((res) => {
    data = res.data;
  });
  return data
}

// GET Cicd StagesOutput By Id
async function _cicdStagesOutputById(id) {
  return await fetch(API_ENDPOINT + '/cicds/cicd-stages', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "data": id
    })
  })
}

// Save New CICD
async function _saveCicd(data) {
  // console.log("Save Data: " + JSON.stringify(data));
  fetch(API_ENDPOINT + '/cicds/cicd-save', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "data": data
    })
  })
}

// Update CICD
async function _updateCicd(data) {
  fetch(API_ENDPOINT + '/cicds/update', {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "_id": data._id,
      "itemName": data.itemName,
      "cicdStages": data.cicdStages
    })
  })
}

// Delete CICD
async function _deleteCicd(data) {
  fetch(API_ENDPOINT + '/cicds/cicd-delete', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "data": data._id
    })
  })
}

// Run CICD
async function _runCicd(body) {
  // console.log(body)
  return await fetch(API_ENDPOINT + '/connect/ssh', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "data": body
    })
  })
}

// Run Stage
async function _runStage(body) {
  // console.log(body)
  return await fetch(API_ENDPOINT + '/connect/ssh/test', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "data": body
    })
  })
}

// Get All HOSTS
async function _getAllHost() {
  let data = undefined;
  await fetch(API_ENDPOINT + '/hosts').then(res => res.json()).then((res) => {
    data = res.data;
  });
  return data
}

// Update HOST
async function _updateHost(data) {
  fetch(API_ENDPOINT + '/hosts/update', {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "id": data._id,
      "data": data
    })
  })
}

// Delete HOST
async function _deleteHost(data) {
  fetch(API_ENDPOINT + '/hosts/host-delete', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "data": data._id
    })
  })
}

export { userLogin, _getAllCicd, _cicdStagesOutputById, validateToken, _saveCicd, _updateCicd, _deleteCicd, _runCicd, _runStage, _getAllHost, _updateHost, _deleteHost };


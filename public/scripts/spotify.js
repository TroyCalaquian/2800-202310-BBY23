require("dotenv").config();
const express = require("express");
const app = express();

var client_id = process.env.SPOTIFY_CLIENT_ID
var client_secret = process.env.SPOTIFY_CLIENT_SECRET

const APIController = (function(){
    const get_token = async () => {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "Autorization": "Basic " + btoa(client_id + ':' + client_secret)
            },
            body: 'grant_type=client_credentials'
        })

        const data = await result.json();
        return data.access_token
    }
})
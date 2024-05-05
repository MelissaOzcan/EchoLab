import express from 'express';
import dotenv from 'dotenv';
import pkg from 'agora-access-token';
const { RtcTokenBuilder, RtmRole } = pkg;

dotenv.config();

const PORT = 8080;

const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

const app = express();

const nocache = (req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}

const generateAccessToken = (req, resp) => {
    // set response header
    resp.header('Access-Control-Allow-Origin', '*'); 
    // get channel name
    const channelName = req.query.channelName;
    console.log(channelName);
    //print channel name type
    console.log(typeof channelName);
    if (!channelName) {
        return resp.status(500).json({ 'error': 'channel is required' });
    }
    // get uid
    let uid = req.query.uid;
    if (!uid || uid == '') {
        uid = 0;
    }
    // get role
    let role = RtmRole.Rtm_User;
    if (req.query.role == 'publisher') {
        role = RtmRole.PUBLISHER;
    }
    // get the expire time
    let expireTime = req.query.expireTime;
    if (!expireTime || expireTime == '') {
        expireTime = 3600;
    } else {
        expireTime = parseInt(expireTime, 10);
    }
    // calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;
    // build the token
    const token = RtcTokenBuilder.buildTokenWithUid(`${process.env.APP_ID}`, `${process.env.APP_CERTIFICATE}`, channelName, uid, role, privilegeExpireTime);
    // return the token
    return resp.json({ 'token': token , 'uid': uid, 'channelName': channelName, 'appID': `${process.env.APP_ID}`, 'certificate': `${process.env.APP_CERTIFICATE}`});

};

app.get('/access_token', nocache, generateAccessToken);

app.listen(PORT, () => {
    console.log(`APP_ID: ${APP_ID}`)
    console.log(`APP_CERTIFICATE: ${APP_CERTIFICATE}`)
    console.log(`Server running on port ${PORT}`);
});
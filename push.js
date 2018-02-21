const apn = require('apn')

const options = {
  token: {
    key: process.env.APNS_KEY,
    keyId: "N4YAN3AJ73",
    teamId: "5762VEA4LK"
  },
  production: false
}

const apnProvider = new apn.Provider(options);
const tokens = [
	"a652d17c982ec35b3477dec6d854f58fbc4f3ef2acaec0af01105be8585cbea6"
  //"f99f09bd779d60f6605f70e7aaae002d4c2494d16f60e86f538b5edbaf53635c",
  //"bec66dd869df90e2f8184fb78b6bb07090d86fb153b56def1734b3c07b250b54",
  //"96795bd4b75aeb4ee1186f98fcff7ab51de5ed3f3f0e60475331977245ee592c"
]

const notification = new apn.Notification({
  alert: {
    title: "Árni úr Járni",
    body: "Er komin í bíó"
  },
  sound: "chime.caf",
  badge: 1,
  topic: "com.bjornorri.bio"
})

apnProvider.send(notification, tokens).then(res => {
  console.log("Sent notification")
})

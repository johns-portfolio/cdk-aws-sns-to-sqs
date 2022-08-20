import { usernameList } from './usernames'
import * as AWS from 'aws-sdk'

async function main(event: any) {
  const message = {
    username: randomUsername(),
    login_at: new Date().toJSON()
  }

  const sns = new AWS.SNS()
  try {
    const result = await sns
      .publish({
        Message: JSON.stringify(message),
        TopicArn: process.env.LOGIN_TOPIC_ARN
      })
      .promise()
    console.log('🔥 result', result)
  } catch (error) {
    console.log('🔥 error', error)
  }
}

const randomUsername = () => {
  return usernameList[Math.floor(Math.random() * usernameList.length)]
}

module.exports = { main }

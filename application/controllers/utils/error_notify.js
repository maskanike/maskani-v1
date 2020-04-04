import sendSlackNotification from './slack_notify';

function logError(error) {
  console.error(error);
  if (process.env.NODE_ENV !== 'test') {
    const slackError = `ENV: ${process.env.NODE_ENV} ${error}`;
    sendSlackNotification('#production-errors', slackError);
  }
}

export default logError;

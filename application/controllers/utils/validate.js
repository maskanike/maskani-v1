const rp = require('request-promise');

async function validateKenyanPhoneNumber(msisdn) {
  let formatedMsisdn = msisdn.replace(/ /g, '').replace('+', '');

  if (process.env.NODE_ENV === 'test') {
    return formatedMsisdn;
  }

  if (formatedMsisdn.substring(0, 3) === '254') {
    formatedMsisdn = `0${formatedMsisdn.substring(3)}`;
  }

  const key = process.env.NUMVERIFY_KEY;
  const url = 'http://apilayer.net/api/validate';

  const resp = await rp.get({
    uri: `${url}?access_key=${key}&number=${formatedMsisdn}&country_code=KE&format=1`,
    json: true,
  });

  if (resp.valid) {
    return resp.international_format;
  }
  return resp.valid;
}

export default validateKenyanPhoneNumber;

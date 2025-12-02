const axios = require('axios');
const xml2js = require('xml2js');
const CAS_VALIDATE = process.env.CAS_VALIDATE_URL || 'https://passport.ustc.edu.cn/serviceValidate';
async function validateTicket(ticket, serviceUrl) {
  const resp = await axios.get(CAS_VALIDATE, { params: { ticket, service: serviceUrl }});
  const xml = resp.data;
  const parsed = await xml2js.parseStringPromise(xml, { explicitArray: true });
  return parsed;
}
module.exports = { validateTicket };

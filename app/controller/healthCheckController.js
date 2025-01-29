const healthCheckService = require('../service/healthCheckService');

const healthCheckStatus = async(req,res,err) => {

  // check for payload
  if (req.headers['content-length'] && parseInt(req.headers['content-length'], 10) > 0) {
    res.setHeader('Cache-Control', 'no-cache');
    console.log('No Payload!!!');
    return res.status(400).send(); // Bad Request
  }

  // Check for queries
  if (Object.keys(req.query).length > 0) {
    res.setHeader('Cache-Control', 'no-cache');
    console.log('No Queries!!!')
    return res.status(400).send(); // Bad Request
  }
  
  try{

    // check for data is inserted or not
    const isEntered = await healthCheckService.insertData();

    if(isEntered){
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(200).send();
    }

    res.setHeader('Cache-Control', 'no-cache');
    console.log('controller: entry is not inserted in database');
    return res.status(503).send();

  } catch(err){
    res.setHeader('Cache-Control', 'no-cache');
    console.error('controller: got an error while entering into database', err);
    return res.status(500).send();
  }

}

const handleOtherMethods = async(req,res) => {
  res.setHeader('Cache-Control', 'no-cache');
  console.log('controller: Sorry! you can only use GET method');
  return res.status(405).send();
}

module.exports = { handleOtherMethods, healthCheckStatus};
const AWS = require('aws-sdk');
const codepipeline = new AWS.CodePipeline();
const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  console.log(`\n${JSON.stringify(event, null, 2)}`);
  let jobId = event['CodePipeline.job']['id'];
  let jobData = event['CodePipeline.job']['data'];
  
  let userParameters = JSON.parse(jobData.actionConfiguration.configuration.UserParameters);
  let url = userParameters.url;
  
  try {
    console.log(`URL = ${url}`);
    const response = await fetch(url);
    if (response.ok) {
      console.log(`put successful result: ${jobId}`);
      await putJobSuccessfulResult(jobId);
    } else {
      console.log(`put failure result: ${jobId}`);
      await putJobFailureResult(jobId, "failed test");
    }
  } catch (err) {
    console.log(err);
    console.log(`put failure result: ${jobId}`);
    await putJobFailureResult(jobId, err.message);
  }
  
  console.log("job complete");
  return "complete";
}

async function putJobSuccessfulResult(jobId) {
  let params = {
    jobId: jobId,
  };
  
  return codepipeline.putJobSuccessResult(params).promise();
}

async function putJobFailureResult(jobId, message) {
  let params = {
    jobId: jobId,
    failureDetails: {
      message: message,
      type: "JobFailed"
    }
  };
  
  return codepipeline.putJobFailureResult(params).promise();
}
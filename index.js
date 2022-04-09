const Database = require("@replit/database")
const db = new Database()
const TwitterLite = require('twitter-lite')
// an authenticated client for this app
const app = new TwitterLite({
  version: "2",
  extension: false, 
  bearer_token: process.env.BEARER_TOKEN
})


const dbObject = {
  0:
}




let count = 0
let nextToken = null;
const userId = process.env.USER_ID
let flag = false;


function executeCallback(data, meta) {
  try{
    nextToken = meta.next_token
    createQueries(data)
  } catch(err) {
    console.log("This is an error"+err)
  }
}

async function getFollowersList() {
  try{
    if(null == nextToken && flag) {  
      console.log(count);
      return;
    }
    
    flag = true
    
    let params = {
      max_results: 1000,
    }
    if(undefined != nextToken && null!=nextToken) {
      params.pagination_token = nextToken;
    }
   
    const {data, meta} = await app.get('users/'+userId+'/followers' , params)
    
    executeCallback(data, meta)
    
    console.log("Token:"+nextToken)
    setTimeout(getFollowersList, 4000)
  } catch(err) {
    console.log(err)
  }
}

async function getTweetCountsLastHour(query) {
  try{    
    let now = new Date();
    now.setHours(now.getHours()-1)
    
    let params = {
      start_time: now.toISOString(),
      query: '('+ query.substring(3) +') '
    }
    const {data} = await app.get('tweets/counts/recent' , params) 
    data.forEach(obj => count+=obj.tweet_count)
  } catch(err) {
    console.log("This is an error"+err)
  }
}

function createQueries(data) {
  let query = ''
  data.forEach(user=>{
    if(query.length < 300) {
      query += 'OR from:'+user.username+' '
    } else {
      getTweetCountsLastHour(query)
      query = ''
    }
  })
  
  if(query !== '') {
    getTweetCountsLastHour(query)
  }
}

getFollowersList()

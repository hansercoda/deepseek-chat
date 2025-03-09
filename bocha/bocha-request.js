var axios = require('axios');
var data = JSON.stringify({
   "query": "中国刑法",
   "summary": true,
   "freshness": "noLimit",
   "count": 10
});

var config = {
   method: 'post',
   url: 'https://api.bochaai.com/v1/web-search',
   headers: {
      'Authorization': 'Bearer sk-7f9e0ba767684314978df31a0b6948c9',
      'Content-Type': 'application/json'
   },
   data : data
};

axios(config)
.then(function (response) {
   console.log(JSON.stringify(response.data));
})
.catch(function (error) {
   console.log(error);
});

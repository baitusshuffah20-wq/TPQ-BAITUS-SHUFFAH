const http = require("http");

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/dashboard/admin/behavior/analytics",
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

console.log("Testing API endpoint...");

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);

  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("Response Body:");
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log("Raw response:", data);
    }
  });
});

req.on("error", (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.setTimeout(10000, () => {
  console.log("Request timeout");
  req.destroy();
});

req.end();

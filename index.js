const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const numberWindow = [];

const API_MAP = {
  p: "http://20.244.56.144/evaluation-service/primes",
  f: "http://20.244.56.144/evaluation-service/fibo",
  e: "http://20.244.56.144/evaluation-service/even",
  r: "http://20.244.56.144/evaluation-service/rand",
};

// Use your actual access token here
const ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNzQ3OTgzLCJpYXQiOjE3NDM3NDc2ODMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjhlZTJlMjBiLWZmMTUtNDBjNi1iZWIwLTBkZmViMGEwMTk4MSIsInN1YiI6ImUyMmNzZXUwNDA2QGJlbm5ldHQuZWR1LmluIn0sImVtYWlsIjoiZTIyY3NldTA0MDZAYmVubmV0dC5lZHUuaW4iLCJuYW1lIjoiYWpheSB5YWRhdiIsInJvbGxObyI6ImUyMmNzZXUwNDA2IiwiYWNjZXNzQ29kZSI6InJ0Q0haSiIsImNsaWVudElEIjoiOGVlMmUyMGItZmYxNS00MGM2LWJlYjAtMGRmZWIwYTAxOTgxIiwiY2xpZW50U2VjcmV0IjoieXpTVWtWQXFYVlBXTXdGaiJ9.qLvwspkskv_skph2D5pcrT-iTD4_8Zp5BFeFECukkFg";

app.get("/numbers/:numberid", async (req, res) => {
  const numberId = req.params.numberid;
  const url = API_MAP[numberId];

  if (!url) {
    return res.status(400).json({ error: "Invalid number ID" });
  }

  const windowPrevState = [...numberWindow];

  try {
    const response = await axios.get(url, {
      timeout: 500,
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });

    const newNumbers = response.data.numbers || [];
    const uniqueNew = newNumbers.filter((n) => !numberWindow.includes(n));

    uniqueNew.forEach((num) => {
      if (numberWindow.length < WINDOW_SIZE) {
        numberWindow.push(num);
      } else {
        numberWindow.shift(); // Remove oldest
        numberWindow.push(num);
      }
    });

    const average =
      numberWindow.reduce((acc, n) => acc + n, 0) / numberWindow.length;

    return res.json({
      windowPrevState,
      windowCurrState: [...numberWindow],
      numbers: newNumbers,
      avg: parseFloat(average.toFixed(2)),
    });
  } catch (error) {
    console.error("Timeout or error fetching data:", error.message);
    return res.status(502).json({
      error: "Failed to fetch data from third-party server within 500ms",
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

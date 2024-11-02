const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json()); 
app.use(express.json());


// PostgreSQL connection setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.post('/columns/headers', async (req, res) => {
  const headers = req.body;
  try {
      for (const { header, subheaders } of headers) {
          // Insert the main header with NULL for the subheader column
          const insertHeaderQuery = 'INSERT INTO headers (header, subheader) VALUES ($1, NULL)';
          await pool.query(insertHeaderQuery, [header]);

          // Insert each subheader with the main header text in the header column
          const insertSubheaderQuery = 'INSERT INTO headers (header, subheader) VALUES ($1, $2)';
          const subheaderPromises = subheaders.map(sub =>
              pool.query(insertSubheaderQuery, [header, sub.text])
          );
          await Promise.all(subheaderPromises);
      }
      res.status(201).send('Headers and subheaders saved successfully');
  } catch (error) {
      console.error('Error saving headers and subheaders:', error);
      res.status(500).send('Error saving headers and subheaders');
  }
});

app.get('/home/display', async (req, res) => {
  try {
      // Fetch headers and their subheaders
      const query = `
          SELECT id, header, subheader
          FROM headers
          ORDER BY id
      `;
      const result = await pool.query(query);
      const rows = result.rows;

      // Group headers and subheaders
      const groupedHeaders = {};
      rows.forEach(row => {
          const { header, subheader } = row;
          if (!groupedHeaders[header]) {
              groupedHeaders[header] = [];
          }
          if (subheader) {
              groupedHeaders[header].push(subheader);
          }
      });

      res.json(groupedHeaders); // Send the grouped data to the frontend
  } catch (error) {
      console.error('Error fetching headers and subheaders:', error);
      res.status(500).send('Error fetching headers and subheaders');
  }
});




// Start the server
app.listen(3000, () => console.log('Server running on port 3000'));

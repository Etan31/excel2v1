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

// This will display the table headers
app.get('/home/display', async (req, res) => {
  try {
      // Fetch headers and their subheaders
      const query = `
          SELECT headers_id, header, subheader
          FROM headers
          ORDER BY headers_id
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


// inserting data to table
app.post('/data/insert', async (req, res) => {
    const { headers_id, row_num, details } = req.body;
    try {
        const query = `INSERT INTO info (headers_id, row_num, details) VALUES ($1, $2, $3) RETURNING *`;
        const values = [headers_id, row_num, details];

        const result = await pool.query(query, values);
        console.log(result.rows);

        res.status(201).json({ message: 'Data inserted successfully', data: result.rows[0] });
    } catch (error) {
        console.error('Error inserting information to the table:', error);
        res.status(500).send('Error inserting information to the table');
    }
});





// Start the server
app.listen(3000, () => console.log('Server running on port 3000'));

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

// This will update the table without refresh the page.
app.get('/columns', async (req, res) => {
    try {
        // Query to select all headers and subheaders
        const result = await pool.query('SELECT headers_id, header, subheader FROM headers ORDER BY headers_id');

        // Structure the data
        const headersMap = new Map();
        result.rows.forEach(row => {
            const { headers_id, header, subheader } = row; // Include headers_id

            // Check if the header already exists in the map
            if (!headersMap.has(header)) {
                headersMap.set(header, { headers_id, subheaders: [] }); // Store headers_id with the header
            }

            // Push the subheader into the subheaders array
            if (subheader) {
                headersMap.get(header).subheaders.push({ text: subheader });
            } else {
                headersMap.get(header).subheaders.push({ text: header });
            }
        });

        // Convert the map to an array of objects
        const data = Array.from(headersMap, ([header, { headers_id, subheaders }]) => ({
            header,        // Include header text
            headers_id,    // Include headers_id
            subheaders     // Include subheaders
        }));

        res.json(data);
    } catch (error) {
        console.error('Error fetching headers and subheaders:', error);
        res.status(500).send('Error fetching headers and subheaders');
    }
});



// To Insert/Create column(s) to the current table, or this will create one if no table available.
app.post('/columns/headers', async (req, res) => {
    const headers = req.body;
    try {
        for (const { header, subheaders } of headers) {
            // Check if header is valid
            if (!header || header.trim() === "") {
                console.error('Invalid header:', header);
                continue; // Skip empty headers
            }

            // Insert header with subheaders or as a standalone
            if (subheaders.length === 0) {
                const insertHeaderQuery = 'INSERT INTO headers (header, subheader) VALUES ($1, NULL)';
                await pool.query(insertHeaderQuery, [header]);
            } else {
                // Insert each subheader with the main header text in the header column
                const insertSubheaderQuery = 'INSERT INTO headers (header, subheader) VALUES ($1, $2)';
                const subheaderPromises = subheaders.map(sub => {
                    if (!sub.text || sub.text.trim() === "") {
                        console.error('Invalid subheader:', sub);
                        return Promise.resolve(); // Skip invalid subheaders
                    }
                    return pool.query(insertSubheaderQuery, [header, sub.text]);
                });
                await Promise.all(subheaderPromises);
            }
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
    const { data } = req.body; // Expecting an array of objects

    try {
        const results = [];

        // Loop through each data entry
        for (const entry of data) {
            const { headers_id, details } = entry; // Destructure headers_id and details

            // Step 1: Count existing rows
            const countQuery = `SELECT COUNT(*) AS total_rows_id FROM info WHERE headers_id = $1`;
            const countResult = await pool.query(countQuery, [headers_id]);
            const totalRowsId = countResult.rows[0].total_rows_id;

            // Step 2: Get the maximum row_num
            const maxQuery = `SELECT MAX(row_num) AS max_row_num FROM info WHERE headers_id = $1`;
            const maxResult = await pool.query(maxQuery, [headers_id]);
            const maxRowNum = maxResult.rows[0].max_row_num || 0;

            // Step 3: Prepare to insert new rows
            const insertQueries = details.map((detail, index) => {
                const row_num = totalRowsId > 0 ? maxRowNum + index + 1 : index + 1; 
                const insertQuery = `INSERT INTO info (headers_id, row_num, details) VALUES ($1, $2, $3) RETURNING *`;
                return pool.query(insertQuery, [headers_id, row_num, detail]);
            });

            // Execute all insert queries for the current headers_id
            const result = await Promise.all(insertQueries);
            results.push(...result.map(res => res.rows[0])); // Collect results
        }

        res.status(201).json({ message: 'Data inserted successfully', data: results });
    } catch (error) {
        console.error('Error inserting information to the table:', error);
        res.status(500).send('Error inserting information to the table');
    }
});






// Start the server
app.listen(3000, () => console.log('Server running on port 3000'));

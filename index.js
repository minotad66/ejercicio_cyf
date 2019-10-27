const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json()); // before our routes definition
const createConnection = require("./basededatos");

app.get("/hotels", function(req, res) {
  const connection = createConnection();
  connection.query("SELECT * FROM hotels", (error, result) => {
    res.json(result.rows);
  });
});

app.post("/hotels", (req, res) => {
  const connection = createConnection();
  const { newHotelName, newHotelRooms, newHotelPostcode } = req.body;

  if (!Number.isInteger(newHotelRooms) || newHotelRooms <= 0) {
    return res
      .status(400)
      .send("The number of rooms should be a positive integer.");
  }
  connection
    .query(`SELECT * FROM hotels WHERE name='${newHotelName}'`)
    .then(result => {
      if (result.rows.length > 0) {
        return res
          .status(400)
          .send("An hotel with the same name already exists!");
      } else {
        connection.query(
          `insert into hotels (name, rooms, postcode) values('${newHotelName}', '${newHotelRooms}', '${newHotelPostcode}')`,
          (err, data) => {
            if (err) {
              return res.status(500).send("Error");
            }
            return res.status(201).send(`Hotel ${newHotelName} created!`);
          }
        );
      }
    });
});

app.get("/customers", function(req, res) {
  const connection = createConnection();
  connection.query("SELECT * FROM customers", (error, result) => {
    res.json(result.rows);
  });
});

app.post("/customers", (req, res) => {
  const connection = createConnection();
  const { name, email, address, city, postcode, country } = req.body;

  connection
    .query(`SELECT * FROM customers WHERE name='${name}'`)
    .then(result => {
      if (result.rows.length > 0) {
        return res
          .status(400)
          .send("An costumer with the same name already exists!");
      } else {
        connection.query(
          `insert into customers (name, email, address, city, postcode, country) values('${name}', '${email}', '${address}', '${city}', '${postcode}', '${country}')`,
          (err, data) => {
            if (err) {
              return res.status(500).send("Error");
            }
            return res.status(201).send(`customer ${name} created!`);
          }
        );
      }
    });
});

app.put("/customers/:customerId", (req, res) => {
  const connection = createConnection();
  const { customerId } = req.params;
  const data = req.body;
  let datos = "";

  for (var clave in data) {
    if (data[clave] === "") {
      delete data[clave];
    }
  }

  for (var clave in data) {
    datos += `${clave}='${data[clave]}', `;
  }

  datos = datos.slice(0, -2);

  connection.query(
    `UPDATE customers SET ${datos} WHERE id='${customerId}'`,
    (err, data) => {
      if (err) {
        return res.status(500).send("Error");
      }
      return res.status(201).send(`email customers ${customerId} updated!`);
    }
  );
});

app.delete("/customers/:customerId", (req, res) => {
  const connection = createConnection();
  const { customerId } = req.params;

  connection.query(
    `DELETE FROM customers WHERE id=${customerId}`,
    (err, data) => {
      if (err) {
        return res.status(500).send("Error");
      }
      return res.status(201).send(`customer ${customerId} delete!`);
    }
  );
});

app.delete("/hotels/:hotelId", (req, res) => {
  const connection = createConnection();
  const { hotelId } = req.params;

  connection
    .query(
      `SELECT hotel_id FROM bookings INNER JOIN hotels ON hotels.id=bookings.hotel_id;`
    )
    .then(result => {
      let datos = [];
      let dato;
      for (var clave in result.rows) {
        datos.push(result.rows[clave].hotel_id);
      }
      dato = datos.find(id => id == hotelId); 
      console.log(datos);
      console.log(dato);
      if (dato != undefined) {
        return res
          .status(400)
          .send("Cannot be deleted, the hotel has at least one reservation!");
      } else {
        connection.query(
          `DELETE FROM hotels WHERE id=${hotelId}`,
          (err, data) => {
            if (err) {
              return res.status(500).send("Error");
            }
            return res.status(201).send(`hotel ${hotelId} delete!`);
          }
        );
      }
    });
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000. Ready to accept requests!");
});

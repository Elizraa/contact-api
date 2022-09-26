const express = require("express")
const router = express.Router()
const { body, validationResult } = require('express-validator');
const { nanoid } = require("nanoid");
const { Pool } = require("pg");

const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ClientError = require('../../Commons/exceptions/ClientError');

const pool = new Pool();


router.put("/add", [  
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('phoneNumber').notEmpty().isMobilePhone(),
  body('address').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const { firstName, lastName, phoneNumber, address } = req.body;

  try {

    await verfiyPhoneNumberNotUsed(phoneNumber)
    
    const id = `contact-${nanoid()}`;
    const query = {
      text: "INSERT INTO contact VALUES($1, $2, $3, $4, $5) RETURNING id",
      values: [id, firstName, lastName, phoneNumber, address],
    };
    
    await pool.query(query);
    return res.status(200).json({
      message: "New Contact Added",
      contact_id: id,
    });

  }
  
  catch (err) {
    if(err instanceof ClientError) {
      return res.status(err.statusCode).json({
        error: err,
        message: err.message
      })
    }
    return res.status(500).json({
      message: "Sorry server cant process your request at the moment",
    });
  }
})

router.post("/update", [  
  body('id').notEmpty(),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('phoneNumber').notEmpty().isMobilePhone(),
  body('address').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const { id, firstName, lastName, phoneNumber, address } = req.body;

  try {

    await verifyContactExist(id);

    await verfiyPhoneNumberNotUsed(phoneNumber);

    const query = {
      text:"UPDATE contact SET first_name = $1, last_name = $2, phone_number = $3, address = $4 WHERE id = $5 RETURNING id",
      values: [firstName, lastName, phoneNumber, address, id],
    };
    
    await pool.query(query);
    return res.status(200).json({
      message: "Contact Updated",
      contact_id: id,
    });

  }
  
  catch (err) {
    if(err instanceof ClientError) {
      return res.status(err.statusCode).json({
        error: err,
        message: err.message
      })
    }
    return res.status(500).json({
      message: "Sorry server cant process your request at the moment",
    });
  }
})

router.get("/:id", async (req, res) => {

  const id = req.params.id;

  try {

    await verifyContactExist(id);

    const query = {
      text:"SELECT * FROM contact where id = $1",
      values: [id],
    };
    console.log(id)
    
    result = await pool.query(query);
    return res.status(200).json({
      message: "Contact retrieved successfully",
      data: result.rows[0]
    });

  }
  catch (err) {
    if(err instanceof ClientError) {
      return res.status(err.statusCode).json({
        error: err,
        message: err.message
      })
    }
    return res.status(500).json({
      message: "Sorry server cant process your request at the moment",
    });
  }
})

router.delete("/:id", async (req, res) => {

  const id = req.params.id;

  try {

    await verifyContactExist(id);

    const query = {
      text:"DELETE FROM contact where id = $1",
      values: [id],
    };
    console.log(id)
    
    await pool.query(query);
    return res.status(200).json({
      message: "Contact deleted successfully",
    });

  }
  catch (err) {
    if(err instanceof ClientError) {
      return res.status(err.statusCode).json({
        error: err,
        message: err.message
      })
    }
    return res.status(500).json({
      message: "Sorry server cant process your request at the moment",
    });
  }
})

async function verfiyPhoneNumberNotUsed(phoneNumber) {
  const query = {
    text: "SELECT id from contact where phone_number = $1",
    values: [phoneNumber]
  }

  result = await pool.query(query);

  if (result.rowCount) {
    throw new InvariantError("phone number already registered");
  }
}

async function verifyContactExist(contactId) {
  const query = {
    text: "SELECT id FROM contact WHERE id = $1",
    values: [contactId],
  };

  const results = await pool.query(query);

  if (!results.rowCount) {
    throw new NotFoundError("Id not existed in the system");
  }
}


module.exports = router

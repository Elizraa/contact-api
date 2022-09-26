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
], async (req, res, next) => {
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
    const queryCheck = {
      text: `SELECT id from contact where "phoneNumber" = $1`,
      values: [phoneNumber]
    }

    result = await pool.query(queryCheck);

    if (result.rowCount) {
      throw new InvariantError("phone number already registered");
    }
    
    const id = `contact-${nanoid()}`;
    const query = {
      text: "INSERT INTO contact VALUES($1, $2, $3, $4, $5) RETURNING id",
      values: [id, firstName, lastName, phoneNumber, address],
    };
    console.log(id)
    
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

module.exports = router

exports.up = (pgm) => {
  pgm.createTable("contact", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    first_name: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    last_name: {
      type: "TEXT",
      notNull: true,
    },
    phone_number: { 
      type: "VARCHAR(15)",
      notNull: true,
      unique: true,
    },
    address: {
      type: "TEXT",
      notNull: true,
    },

  });
};

exports.down = (pgm) => {
  pgm.dropTable("contact");
};

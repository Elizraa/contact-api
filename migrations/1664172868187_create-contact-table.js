exports.up = (pgm) => {
  pgm.createTable("contact", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    firstName: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    lastName: {
      type: "TEXT",
      notNull: true,
    },
    phoneNumber: { 
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

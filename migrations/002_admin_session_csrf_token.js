exports.up = (pgm) => {
  pgm.addColumn("admin_sessions", {
    csrf_token: { type: "text" },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("admin_sessions", "csrf_token");
};
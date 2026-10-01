exports.up = (pgm) => {
  pgm.createTable("site_content", {
    id: { type: "smallint", primaryKey: true, default: 1 },
    content: { type: "jsonb", notNull: true },
    imported_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
  pgm.addConstraint("site_content", "site_content_singleton_check", {
    check: "id = 1",
  });

  pgm.createTable("admin_users", {
    id: { type: "bigserial", primaryKey: true },
    email: { type: "text", notNull: true, unique: true },
    password_hash: { type: "text", notNull: true },
    role: { type: "text", notNull: true, default: "moderator" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    disabled_at: { type: "timestamptz" },
  });
  pgm.addConstraint("admin_users", "admin_users_email_lowercase_check", {
    check: "email = lower(email)",
  });
  pgm.addConstraint("admin_users", "admin_users_role_check", {
    check: "role IN ('admin', 'moderator')",
  });

  pgm.createTable("admin_sessions", {
    token_hash: { type: "text", primaryKey: true },
    admin_user_id: {
      type: "bigint",
      notNull: true,
      references: "admin_users(id)",
      onDelete: "CASCADE",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    expires_at: { type: "timestamptz", notNull: true },
  });
  pgm.addConstraint("admin_sessions", "admin_sessions_token_hash_check", {
    check: "length(token_hash) = 64",
  });
  pgm.createIndex("admin_sessions", "expires_at");

  pgm.createTable("content_suggestions", {
    id: { type: "bigserial", primaryKey: true },
    section_key: { type: "text", notNull: true },
    field_key: { type: "text", notNull: true },
    proposed_value: { type: "text", notNull: true },
    contributor_name: { type: "text" },
    status: { type: "text", notNull: true, default: "pending" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    reviewed_at: { type: "timestamptz" },
    reviewed_by: {
      type: "bigint",
      references: "admin_users(id)",
      onDelete: "SET NULL",
    },
    moderator_note: { type: "text" },
  });
  pgm.addConstraint("content_suggestions", "content_suggestions_status_check", {
    check: "status IN ('pending', 'approved', 'rejected')",
  });
  pgm.createIndex("content_suggestions", ["status", "created_at"]);

  pgm.createTable("quote_submissions", {
    id: { type: "bigserial", primaryKey: true },
    quote: { type: "text", notNull: true },
    contributor_name: { type: "text" },
    publication_consent: { type: "boolean", notNull: true },
    consent_version: { type: "text", notNull: true },
    consented_at: { type: "timestamptz", notNull: true },
    status: { type: "text", notNull: true, default: "pending" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    reviewed_at: { type: "timestamptz" },
    reviewed_by: {
      type: "bigint",
      references: "admin_users(id)",
      onDelete: "SET NULL",
    },
    moderator_note: { type: "text" },
  });
  pgm.addConstraint("quote_submissions", "quote_submissions_status_check", {
    check: "status IN ('pending', 'approved', 'rejected')",
  });
  pgm.addConstraint("quote_submissions", "quote_submissions_consent_check", {
    check: "publication_consent = true",
  });
  pgm.createIndex("quote_submissions", ["status", "created_at"]);

  pgm.createTable("gallery_submissions", {
    id: { type: "bigserial", primaryKey: true },
    storage_key: { type: "text", notNull: true, unique: true },
    caption: { type: "text", notNull: true },
    alt_text: { type: "text", notNull: true },
    contributor_name: { type: "text" },
    publication_consent: { type: "boolean", notNull: true },
    consent_version: { type: "text", notNull: true },
    consented_at: { type: "timestamptz", notNull: true },
    status: { type: "text", notNull: true, default: "pending" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    reviewed_at: { type: "timestamptz" },
    reviewed_by: {
      type: "bigint",
      references: "admin_users(id)",
      onDelete: "SET NULL",
    },
    moderator_note: { type: "text" },
  });
  pgm.addConstraint("gallery_submissions", "gallery_submissions_status_check", {
    check: "status IN ('pending', 'approved', 'rejected')",
  });
  pgm.addConstraint(
    "gallery_submissions",
    "gallery_submissions_consent_check",
    {
      check: "publication_consent = true",
    },
  );
  pgm.createIndex("gallery_submissions", ["status", "created_at"]);

  pgm.createTable("content_revisions", {
    id: { type: "bigserial", primaryKey: true },
    section_key: { type: "text", notNull: true },
    field_key: { type: "text", notNull: true },
    value: { type: "text", notNull: true },
    source_suggestion_id: {
      type: "bigint",
      notNull: true,
      unique: true,
      references: "content_suggestions(id)",
      onDelete: "RESTRICT",
    },
    approved_by: {
      type: "bigint",
      notNull: true,
      references: "admin_users(id)",
      onDelete: "RESTRICT",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createTable("published_content_overrides", {
    section_key: { type: "text", primaryKey: true },
    field_key: { type: "text", primaryKey: true },
    revision_id: {
      type: "bigint",
      notNull: true,
      references: "content_revisions(id)",
      onDelete: "RESTRICT",
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createTable("moderation_events", {
    id: { type: "bigserial", primaryKey: true },
    moderator_id: {
      type: "bigint",
      notNull: true,
      references: "admin_users(id)",
      onDelete: "RESTRICT",
    },
    submission_type: { type: "text", notNull: true },
    submission_id: { type: "bigint", notNull: true },
    action: { type: "text", notNull: true },
    note: { type: "text" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
  pgm.addConstraint("moderation_events", "moderation_events_type_check", {
    check: "submission_type IN ('wording', 'quote', 'gallery')",
  });
  pgm.addConstraint("moderation_events", "moderation_events_action_check", {
    check: "action IN ('approved', 'rejected')",
  });
  pgm.createIndex("moderation_events", [
    "submission_type",
    "submission_id",
    "created_at",
  ]);
};

exports.down = (pgm) => {
  pgm.dropTable("moderation_events");
  pgm.dropTable("published_content_overrides");
  pgm.dropTable("content_revisions");
  pgm.dropTable("gallery_submissions");
  pgm.dropTable("quote_submissions");
  pgm.dropTable("content_suggestions");
  pgm.dropTable("admin_sessions");
  pgm.dropTable("admin_users");
  pgm.dropTable("site_content");
};

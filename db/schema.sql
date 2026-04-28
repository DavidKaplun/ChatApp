CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  display_name  TEXT NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE conversations (
  id       SERIAL PRIMARY KEY,
  user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT no_self_conversation CHECK (user1_id <> user2_id),
  CONSTRAINT ordered_pair CHECK (user1_id < user2_id),
  CONSTRAINT unique_pair UNIQUE (user1_id, user2_id)
);

CREATE TABLE messages (
  id              SERIAL PRIMARY KEY,
  conversation_id INTEGER   NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       INTEGER   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content         TEXT      NOT NULL,
  sent_at         TIMESTAMP NOT NULL DEFAULT NOW(),
  read_at         TIMESTAMP
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

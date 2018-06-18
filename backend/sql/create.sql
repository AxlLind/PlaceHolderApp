-- Contains the user name along with their bcrypt hash
-- also contains a user_id for internal use in the DB
CREATE TABLE users (
    user_id        SERIAL    NOT NULL,
    email          TEXT      NOT NULL UNIQUE,
    pw_hash        TEXT      NOT NULL,
    email_verified BOOLEAN   DEFAULT FALSE,
    date_created   TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY(user_id)
);

-- Contains the lists. Each list has an ID, name,
-- and the ID of the user who created it
CREATE TABLE lists (
    list_id       SERIAL    NOT NULL,
    user_id       INT       NOT NULL REFERENCES Users(user_id),
    list_name     TEXT      NOT NULL,
    date_created  TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY(list_id)
);

-- A one to many relation between the list_id and the item.
CREATE TABLE listitems (
    list_id       INT       NOT NULL REFERENCES Lists(list_id),
    item          TEXT      NOT NULL,
    date_created  TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY(list_id, item)
);

-- A many to many relation between users and lists
CREATE TABLE sharedlists (
    list_id       INT       NOT NULL REFERENCES Lists(list_id),
    user_id       INT       NOT NULL REFERENCES Users(user_id),
    date_created  TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY(list_id, user_id)
);

INSERT INTO users(email, email_verified, pw_hash) VALUES ('t@t.c', 'TRUE', '$2b$10$gp5zwF5Jv7egjywANQCps.enInSnrRhMZoWTRtZ/6BWT3e2GtOugO');

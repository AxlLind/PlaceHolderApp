-- Contains the user name along with their hashed password + salt
-- also contains a user_id for internal use in the DB
CREATE TABLE users (
    user_id       SERIAL PRIMARY KEY,
    email         TEXT      NOT NULL UNIQUE,
    pw_hash       TEXT      NOT NULL,
    date_created  TIMESTAMP NOT NULL
);

-- Contains the lists. Each list has an ID and a name
CREATE TABLE lists (
    list_id       SERIAL PRIMARY KEY,
    user_id       INT       NOT NULL REFERENCES Users (user_id),
    list_name     TEXT      NOT NULL,
    date_created  TIMESTAMP NOT NULL
);

-- A one to many relation between the list_id and the item.
CREATE TABLE listitems (
    list_id INT  NOT NULL REFERENCES Lists (list_id),
    item    TEXT NOT NULL
);

-- A many to many relation between users and lists
CREATE TABLE sharedlists (
    list_id INT NOT NULL REFERENCES Lists (list_id),
    user_id INT NOT NULL REFERENCES Users (user_id)
);

INSERT INTO Users (email, pw_hash, date_created) VALUES ('Test User', '1234', now());
INSERT INTO Users (email, pw_hash, date_created) VALUES ('Test User2', '1234', now());
INSERT INTO Users (email, pw_hash, date_created) VALUES ('Test User3', '1234', now());

INSERT INTO Lists (user_id, list_name, date_created) VALUES (1, 'Awesome List', now());

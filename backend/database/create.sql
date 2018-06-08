-- Contains the user name along with their hashed password + salt
-- also contains a user_id for internal use in the DB
CREATE TABLE Users (
    user_id       SERIAL PRIMARY KEY,
    email         TEXT      NOT NULL UNIQUE,
    pw_hash       TEXT      NOT NULL,
    pw_salt       TEXT      NOT NULL,
    date_created  TIMESTAMP NOT NULL
);

-- Contains the lists. Each list has an ID and a name
CREATE TABLE Lists (
    list_id       SERIAL PRIMARY KEY,
    user_id       int       NOT NULL REFERENCES Users (user_id),
    list_name     TEXT      NOT NULL,
    date_created  TIMESTAMP NOT NULL
);

-- A one to many relation between the list_id and the item.
CREATE TABLE ListItems (
    list_id int  NOT NULL REFERENCES Lists (list_id),
    item    TEXT NOT NULL
);

-- A many to many relation between users and lists
CREATE TABLE UserLists (
    list_id int NOT NULL REFERENCES Lists (list_id),
    user_id int NOT NULL REFERENCES Users (user_id)
);

INSERT INTO Users (email, pw_hash, pw_salt, date_created) VALUES ('Test User', '1234', '5321', now());
INSERT INTO Users (email, pw_hash, pw_salt, date_created) VALUES ('Test User2', '1234', '5321', now());
INSERT INTO Users (email, pw_hash, pw_salt, date_created) VALUES ('Test User3', '1234', '5321', now());

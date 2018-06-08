DROP DATABASE IF EXISTS shopping_list;
CREATE DATABASE shopping_list;
USE shopping_list;

-- Contains the user name along with their hashed password + salt
-- also contains a user_id for internal use in the DB
CREATE TABLE Users (
    user_id       SERIAL PRIMARY KEY,
    user_name     VARCHAR(50) NOT NULL,
    password_hash TEXT        NOT NULL,
    password_salt TEXT        NOT NULL
);

-- Contains the lists. Each list has an ID and a name
CREATE TABLE Lists (
    list_id   SERIAL PRIMARY KEY,
    list_name VARCHAR(50) NOT NULL
);

-- A one to many relation between the list_id and the item.
CREATE TABLE ListItems (
    list_id int  NOT NULL REFERENCES(Lists.list_id),
    item    TEXT NOT NULL
);

-- A many to many relation between users and lists
CREATE TABLE UserLists (
    list_id int NOT NULL REFERENCES(Users.list_id)
    user_id int NOT NULL REFERENCES(Users.user_id)
);

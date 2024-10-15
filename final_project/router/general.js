const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

const doesExist = (username) => {
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
      return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
      return true;
  } else {
      return false;
  }
}

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password) {
      return res.status(401).json({message: "Missing a username or password "});
  }

  if (username && password) {
      if (!doesExist(username)) {
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }
  
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
      const bookList = await new Promise((resolve) => {
          resolve(books);
      });
      res.json(bookList);
  } catch (error) {
      res.status(500).json({ message: "Error retrieving book list" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
      const bookDetails = await new Promise((resolve, reject) => {
          if (books[isbn]) {
              resolve(books[isbn]);
          } else {
              reject(new Error("Book not found"));
          }
      });
      res.json(bookDetails);
  } catch (error) {
      res.status(404).json({ message: error.message });
  }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
      const foundBooks = await new Promise((resolve) => {
          const filteredBooks = Object.values(books).filter(book => book.author.replaceAll(" ", "") === author);
          resolve(filteredBooks);
      });
      res.json(foundBooks);
  } catch (error) {
      res.status(500).json({ message: "Error retrieving books by author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
      const foundBooks = await new Promise((resolve) => {
          const book = Object.values(books).find(book => book.title.replaceAll(" ", "") === title);
          resolve(book);
      });
      res.json(foundBooks);
  } catch (error) {
      res.status(500).json({ message: "Error retrieving books by title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  const bookFound = books[isbn];

  if(Object.values(books[isbn].reviews).length < 1) {
    res.send(`There are no reviews for ${bookFound.title}`)
  } else {
    res.send(bookFound.reviews);
  }
});

module.exports.general = public_users;

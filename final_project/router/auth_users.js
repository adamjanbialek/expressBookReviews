const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username, password) => {
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
      return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
      return true;
  } else {
      return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign({
          data: password
      }, 'access', { expiresIn: 60 * 60 });

      req.session.authorization = {
          accessToken, username
      }
      return res.status(200).send("User successfully logged in");
  } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;

  // Check if the user is authenticated and the session has authorization info
  if (req.session.authorization) {
      const username = req.session.authorization.username;

      // Check if the book with the given ISBN exists
      if (books[isbn]) {

          // Add or update the review for the specific user
          books[isbn].reviews[username] = review;

          return res.status(200).json({ message: `Review for ISBN ${isbn} by ${username} added/updated successfully.` });
      } else {
          return res.status(404).json({ message: "Book not found" });
      }
  } else {
      return res.status(401).json({ message: "Unauthorized: Please log in to submit a review" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found." });
  }

  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found for this user." });
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({ message: `Review for ISBN ${isbn} deleted successfully.` });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

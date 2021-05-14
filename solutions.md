# Solutions

## `1` `user.js`

```js
'use strict';

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class user extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
        // define association here
        }
    };
    user.init({
        name: {
            type: DataTypes.STRING,
            validate: {
                len: {
                    args: [1,99],
                    msg: 'Name must be between 1 and 99 characters'
                }
            }
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: { // does a boolean check
                    msg: 'Invalid email'
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            validate: {
                len: {
                    args: [8,99],
                    msg: 'Password must be between 8 and 99 characters'
                }
            }
        }
        }, {
        sequelize,
        modelName: 'user',
    });
  
    // Before a user is created, we are encrypting the password and using hash in its place
    user.addHook('beforeCreate', (pendingUser) => { // pendingUser is user object that gets passed to DB
        // Bcrypt is going to hash the password
        let hash = bcrypt.hashSync(pendingUser.password, 12); // hash 12 times
        pendingUser.password = hash; // this will go to the DB
    });  

    user.prototype.validPassword = function(typedPassword) {
        let isCorrectPassword = bcrypt.compareSync(typedPassword, this.password); // check to see if password is correct.

        return isCorrectPassword;
    }

    // return an object from the database of the user without the encrypted password
    user.prototype.toJSON = function() {
        let userData = this.get(); 
        delete userData.password; // it doesn't delete password from database, only removes it. 
        
        return userData;
    }

    return user; // add functions above 
};
```

## `2` `layout.ejs`

```ejs
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Authentication</title>
    <link rel="stylesheet" href="/css/style.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl" crossorigin="anonymous">
  </head>
  <body>
    <%- include('partials/alerts') %>
    <header>
      <nav>
        <ul>
          <% if (!currentUser) {%>
            <li><a href="/auth/signup">Signup</a></li>
            <li><a href="/auth/login">Login</a></li>
          <% } else { %>
          <li><a href="/auth/logout">Logout</a></li>
          <li><a href="/profile">Profile</a></li>
          <% } %>
        </ul>
      </nav>
    </header>
    <h1>Authentication</h1>
    <%- body %>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js" integrity="sha384-b5kHyXgcpbZJO/tY9Ul7kGkf1S0CWuKcCD38l8YkeH8z8QjE0GmW1gYU5S9FOnJ0" crossorigin="anonymous"></script>
  </body>
</html>
```
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tasks'
});

const sessionStore = new MySQLStore({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'tasks',
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data',
    },
  },
});
// Connect to the MySQL database
connection.connect((error) => {
  if (error) {
    console.error('Failed to connect to the database:', error);
  } else {
    console.log('Connected to the database');
  }
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Origin: http://localhost');
  next();
});

app.use(session({
  secret: 'lozinka15',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
}));

// Passport.js initialization
app.use(passport.initialize());
app.use(passport.session());

// Configure the local strategy for Passport.js
passport.use(
  new LocalStrategy((username, password, done) => {
    connection.query('SELECT * FROM users WHERE username = ?', username, async (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        return done(error);
      }
      if (results.length === 0) {
        return done(null, false, { message: 'Invalid username' });
      }
      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return done(null, false, { message: 'Invalid password' });
      }
      return done(null, user);
    });
  })
);

// Serialize user ID
passport.serializeUser((user, done) => {
  done(null, user.ID);
});

// Deserialize user ID
passport.deserializeUser((ID, done) => {
  connection.query('SELECT * FROM users WHERE ID = ?', ID, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return done(error);
    }

    if (results.length === 0) {
      return done(null, false);
    }

    const user = results[0];
    console.log('Deserialized user:', user);
    return done(null, user);
  });
});

// Route for user registration
app.post('/users/register', async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || username.trim() === '') {
    return res.status(400).json({ error: 'Username is required' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  connection.query(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [username, email],
    (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      if (results.length > 0) {
        const existingUser = results[0];
        if (existingUser.username === username) {
          return res.status(400).json({ error: 'Username already exists' });
        } else if (existingUser.email === email) {
          return res.status(400).json({ error: 'Email already exists' });
        }
      }
      connection.query(
        'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
        [username, hashedPassword, email],
        (error) => {
          if (error) {
            console.error('Error executing query:', error);
            return res.status(500).json({ message: 'Internal server error' });
          }
          res.status(200).json({ message: 'User registered successfully' });
        }
      );
    }
  );
});

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

//Route for user login
app.post('/users/login', (req, res, next) => {
  passport.authenticate('local', (error, user, info) => {
    if (error) {
      console.error('Error authenticating user:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ error: info.message });
    }
    req.login(user, (error) => {
      if (error) {
        console.error('Error logging in user:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      const options = {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: true,
      };
      res.cookie('connect.sid', req.sessionID, options);
      const userId = req.user.ID;
      return res.status(200).json({ message: 'Login successful', userId: userId });
    });
  })(req, res, next);
});

//Route for creating a task
app.post('/createTask', (req, res, next) => {
  const taskData = req.body;
  connection.query('INSERT INTO tasks SET ?', taskData, (error, result) => {
    if (error) {
      console.error('Failed to create task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    } else {
      const taskId = result.insertId;
      res.status(201).json({ message: 'Task created successfully', id: taskId });
    }
  });
});

// Route for user log off
app.get('/users/logoff', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/users/login');
  });
});

// Route to handle the GET request for retrieving tasks for a specific user
app.get('/getUserTasks', (req, res) => {
  const userId = req.query.userId;
  connection.query('SELECT * FROM tasks WHERE user_id = ?', [userId], (error, results) => {
    if (error) {
      console.error('Failed to retrieve tasks:', error);
      res.status(500).json({ error: 'Failed to retrieve tasks' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Route to handle the PUT request for updating a task
app.put('/updateTask/:taskId', (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.query.userId;
  const updatedTaskData = req.body;
  connection.query('UPDATE tasks SET ?  WHERE Task_ID = ? AND user_id = ?', [updatedTaskData, taskId, userId], (error) => {
    if (error) {
      console.error('Failed to update task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    } else {
      res.json({ message: 'Task updated successfully' });
    }
  });
});

// Route to handle the DELETE request for deleting a task
app.delete('/deleteTask/:taskId', (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.query.userId;
  connection.query('DELETE FROM tasks WHERE Task_ID = ? AND user_id = ?', [taskId, userId], (error) => {
    if (error) {
      console.error('Failed to delete task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    } else {
      res.json({ message: 'Task deleted successfully' });
    }
  });
});

//Route for marking a task finished
app.put('/finishTask/:taskId', (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.query.userId;
  const updatedTaskData = req.body;
  
  connection.query('UPDATE tasks SET finished = ? WHERE Task_ID = ? AND user_id = ?', [updatedTaskData.finished, taskId, userId], (error) => {
    if (error) {
      console.error('Failed to update task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    } else {
      res.json({ message: 'Task updated successfully' });
    }
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
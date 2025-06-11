// MongoDB initialization script for Task Manager
print('Starting MongoDB initialization...');

// Switch to taskmanager database
db = db.getSiblingDB('taskmanager');

// Create application user
db.createUser({
  user: 'taskmanager',
  pwd: 'taskmanager123',
  roles: [
    {
      role: 'readWrite',
      db: 'taskmanager'
    }
  ]
});

// Create collections with indexes
db.createCollection('users');
db.createCollection('tasks');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "resetPasswordToken": 1 });

db.tasks.createIndex({ "userId": 1 });
db.tasks.createIndex({ "createdAt": 1 });
db.tasks.createIndex({ "completed": 1 });

// Insert sample data (optional)
print('Creating sample user...');
db.users.insertOne({
  name: "Demo User",
  email: "demo@taskmanager.local",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6rf56Q7qPS", // password: demo123
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Creating sample tasks...');
const demoUser = db.users.findOne({ email: "demo@taskmanager.local" });
if (demoUser) {
  db.tasks.insertMany([
    {
      title: "Welcome to Task Manager!",
      description: "This is your first task. You can edit or delete it.",
      completed: false,
      userId: demoUser._id,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Explore the features",
      description: "Try creating, editing, and completing tasks.",
      completed: false,
      userId: demoUser._id,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Test the authentication",
      description: "Try logging out and back in.",
      completed: true,
      userId: demoUser._id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
}

print('MongoDB initialization completed successfully!');
print('Demo credentials: demo@taskmanager.local / demo123'); 
// MongoDB initialization script for RoryK application
// This script runs when the MongoDB container starts for the first time

// Switch to the roryk database
db = db.getSiblingDB('roryk');

// Create application user with read/write permissions
db.createUser({
  user: 'roryk_app',
  pwd: 'roryk-app-password-2024',
  roles: [
    {
      role: 'readWrite',
      db: 'roryk'
    }
  ]
});

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'passwordHash', 'role', 'status', 'balance'],
      properties: {
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 50,
          description: 'Username must be a string between 3-50 characters'
        },
        email: {
          bsonType: ['string', 'null'],
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Email must be a valid email address or null'
        },
        passwordHash: {
          bsonType: 'string',
          description: 'Password hash is required'
        },
        role: {
          bsonType: 'string',
          enum: ['user', 'admin', 'superadmin'],
          description: 'Role must be user, admin, or superadmin'
        },
        status: {
          bsonType: 'string',
          enum: ['pending', 'approved', 'rejected'],
          description: 'Status must be pending, approved, or rejected'
        },
        balance: {
          bsonType: 'number',
          minimum: 0,
          description: 'Balance must be a non-negative number'
        }
      }
    }
  }
});

db.createCollection('transactions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'type', 'amount', 'previousBalance', 'newBalance', 'description', 'performedBy'],
      properties: {
        userId: {
          bsonType: 'objectId',
          description: 'User ID is required'
        },
        type: {
          bsonType: 'string',
          enum: ['credit', 'debit'],
          description: 'Type must be credit or debit'
        },
        amount: {
          bsonType: 'number',
          minimum: 0,
          description: 'Amount must be a non-negative number'
        },
        previousBalance: {
          bsonType: 'number',
          minimum: 0,
          description: 'Previous balance must be a non-negative number'
        },
        newBalance: {
          bsonType: 'number',
          minimum: 0,
          description: 'New balance must be a non-negative number'
        },
        description: {
          bsonType: 'string',
          maxLength: 500,
          description: 'Description is required and must be under 500 characters'
        },
        performedBy: {
          bsonType: 'string',
          maxLength: 100,
          description: 'Performed by is required'
        },
        serviceType: {
          bsonType: ['string', 'null'],
          enum: ['history', 'valuation', 'vin', null],
          description: 'Service type must be history, valuation, vin, or null'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true, sparse: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ status: 1 });

db.transactions.createIndex({ userId: 1, createdAt: -1 });
db.transactions.createIndex({ stripePaymentIntentId: 1 }, { sparse: true });
db.transactions.createIndex({ serviceType: 1 }, { sparse: true });
db.transactions.createIndex({ type: 1 });

print('✅ RoryK database initialized successfully');
print('📊 Collections created: users, transactions');
print('🔐 Application user created: roryk_app');
print('📈 Indexes created for optimal performance');
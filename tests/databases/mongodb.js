// MongoDB Playground

const database = 'local';
const collection = 'customers';

// Switch to the database
use(database);

// Drop if exists (optional for testing purposes)
db[collection].drop();

// Create the collection
db.createCollection(collection);

// Insert sample customer data
db[collection].insertMany([
    {
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      phone: "555-1020",
      created_at: new Date(),
      is_active: true,
      address: {
        street: "123 Main St",
        city: "Springfield",
        state: "IL",
        zip: "62701"
      }
    },
    {
      name: "Bob Smith",
      email: "bob.smith@example.com",
      phone: "555-2030",
      created_at: new Date(),
      is_active: false,
      address: {
        street: "456 Elm St",
        city: "Madison",
        state: "WI",
        zip: "53703"
      }
    },
    {
      name: "Carol Lee",
      email: "carol.lee@example.com",
      phone: "555-3040",
      created_at: new Date(),
      is_active: true,
      address: {
        street: "789 Oak St",
        city: "Columbus",
        state: "OH",
        zip: "43085"
      }
    },
    {
      name: "David Nguyen",
      email: "david.nguyen@example.com",
      phone: "555-4050",
      created_at: new Date(),
      is_active: true,
      address: {
        street: "321 Birch Ave",
        city: "Austin",
        state: "TX",
        zip: "73301"
      }
    },
    {
      name: "Emily Chen",
      email: "emily.chen@example.com",
      phone: "555-5060",
      created_at: new Date(),
      is_active: false,
      address: {
        street: "654 Pine St",
        city: "Seattle",
        state: "WA",
        zip: "98101"
      }
    },
    {
      name: "Frank Lopez",
      email: "frank.lopez@example.com",
      phone: "555-6070",
      created_at: new Date(),
      is_active: true,
      address: {
        street: "777 Cedar Blvd",
        city: "Denver",
        state: "CO",
        zip: "80202"
      }
    },
    {
      name: "Grace Kim",
      email: "grace.kim@example.com",
      phone: "555-7080",
      created_at: new Date(),
      is_active: true,
      address: {
        street: "888 Maple Ln",
        city: "San Francisco",
        state: "CA",
        zip: "94102"
      }
    },
    {
      name: "Henry Adams",
      email: "henry.adams@example.com",
      phone: "555-8090",
      created_at: new Date(),
      is_active: false,
      address: {
        street: "999 Walnut St",
        city: "Portland",
        state: "OR",
        zip: "97201"
      }
    },
    {
      name: "Isabella Garcia",
      email: "isabella.garcia@example.com",
      phone: "555-9001",
      created_at: new Date(),
      is_active: true,
      address: {
        street: "222 Cherry St",
        city: "Chicago",
        state: "IL",
        zip: "60601"
      }
    },
    {
      name: "Jack Wilson",
      email: "jack.wilson@example.com",
      phone: "555-0102",
      created_at: new Date(),
      is_active: true,
      address: {
        street: "101 Apple Way",
        city: "New York",
        state: "NY",
        zip: "10001"
      }
    }
  ]);
  
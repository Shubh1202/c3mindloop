export const GRAPH_EXAMPLES: { label: string; value: string }[] = [
  {
    label: 'User Profile',
    value: JSON.stringify(
      {
        id: 'u_001',
        name: 'Alice Chen',
        email: 'alice@example.com',
        age: 29,
        active: true,
        address: {
          street: '42 Elm Street',
          city: 'San Francisco',
          state: 'CA',
          zip: '94107',
        },
        roles: ['admin', 'editor'],
        preferences: {
          theme: 'dark',
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
        },
      },
      null,
      2
    ),
  },
  {
    label: 'API Response',
    value: JSON.stringify(
      {
        status: 'success',
        code: 200,
        data: {
          products: [
            {
              id: 'p_1',
              name: 'Widget Pro',
              price: 49.99,
              inStock: true,
              tags: ['hardware', 'featured'],
            },
            {
              id: 'p_2',
              name: 'Gadget Lite',
              price: 19.99,
              inStock: false,
              tags: ['software'],
            },
          ],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 2,
          },
        },
        meta: {
          requestId: 'req_abc123',
          timestamp: '2026-08-19T10:00:00Z',
        },
      },
      null,
      2
    ),
  },
  {
    label: 'Config File',
    value: JSON.stringify(
      {
        app: {
          name: 'MyService',
          version: '2.1.0',
          debug: false,
          port: 3000,
        },
        database: {
          host: 'db.internal',
          port: 5432,
          name: 'prod_db',
          pool: {
            min: 2,
            max: 20,
            idleTimeoutMs: 30000,
          },
        },
        cache: {
          driver: 'redis',
          ttl: 3600,
          prefix: 'myapp:',
        },
        features: {
          darkMode: true,
          betaSignup: false,
          analyticsEnabled: true,
        },
      },
      null,
      2
    ),
  },
];

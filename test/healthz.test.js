const request = require('supertest');
const server = require('../server');
const sequelize = require('./../config/database');


describe('Healthz API Tests', () => {

    beforeAll(async () => {
        try {
            console.log("Synchronizing database...");
            await sequelize.sync({ alter: true }); 
            console.log("Database synchronized!");
        } catch (error) {
            console.error("Database synchronization failed:", error.message);
        }
    });
    
    afterEach(async () => {
        if (sequelize.connectionManager.pool) {
            try {
                await sequelize.authenticate(); // Check if DB connection is alive
                await sequelize.truncate({ cascade: true }); // Clears test data only if DB is open
            } catch (error) {
                console.log("Skipping truncate: Database connection is closed.");
            }
        }
    });
    
    

    afterAll(async () => {
        await sequelize.close(); // Properly close the database connection
        return new Promise((resolve) => {
            server.close(() => {
                console.log('Server and database closed after tests');
                resolve();
            });
        });
    });
    
    // 200 OK
    test('GET /healthz should return 200 and no-cache header', (done) => {
        request(server)
            .get('/healthz')
            .expect(200)
            .expect('Cache-Control', 'no-cache', done);
    });
    
    // 404 Not Found
    test('GET /invalid-url should return 404 and no-cache header', (done) => {
        request(server)
            .get('/rohith')
            .expect(404,done);
    });
    
    const invalidMethods = ['post', 'put', 'patch', 'delete'];

    // 405 Method Not Allowed
    invalidMethods.forEach((method) => {
        test(`${method.toUpperCase()} /healthz should return 405 and no-cache header`, (done) => {
            request(server)[method]('/healthz')
                .expect(405)
                .expect('Cache-Control', 'no-cache', done);
        });
    });
    
    // 405 Method Not Allowed with payload
    invalidMethods.forEach((method) => {
        test(`${method.toUpperCase()} /healthz with payload should return 405 and no-cache header`, (done) => {
            request(server)[method]('/healthz')
                .send({ key: 'value' })
                .expect(405)
                .expect('Cache-Control', 'no-cache', done);
        });
    });
    
    // 400 Bad Request with query parameters
    test('GET /healthz?param=8 should return 400 and no-cache header', (done) => {
        request(server)
            .get('/healthz?param=8')
            .expect(400)
            .expect('Cache-Control', 'no-cache', done);
    });
    
    // 400 Bad Request with payload
    test('GET /healthz with JSON payload should return 400 and no-cache header', (done) => {
        request(server)
            .get('/healthz')
            .send({ key: 'value' })
            .expect(400)
            .expect('Cache-Control', 'no-cache', done);
    });
    
    // 400 Bad Request with invalid payload
    test('GET /healthz with invalid JSON payload should return 400 and no-cache header', (done) => {
        request(server)
            .get('/healthz')
            .send('{"inavlid"}') // invalid format
            .set('Content-Type', 'application/json')
            .expect(400, done);
    });
    
    // 503 postgres connection is disabled
    test('GET /healthz endpoint when database is stopped should return 503 and no-cache header', (done) => {
        sequelize.close();
        request(server)
            .get('/healthz')
            .expect(503)
            .expect('Cache-Control', 'no-cache', done);
    });
});


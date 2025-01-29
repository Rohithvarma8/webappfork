# Webapp

## Overview

The Health Check API is designed to monitor the health of the application instance, ensuring that it can handle requests effectively. It helps prevent routing traffic to unhealthy instances and improves the user experience by detecting and alerting when the service is down or unable to process requests.

## Database Table

A table named `health_check` is created with the following schema:

| Column     | Type      | Attributes                   |
| ---------- | --------- | ---------------------------- |
| check\_id  | INTEGER   | PRIMARY KEY, AUTO INCREMENT  |
| date\_time | TIMESTAMP | UTC, NOT NULL, DEFAULT NOW() |

- **check\_id**: Auto-incremented primary key.
- **date\_time**: Stores the timestamp in UTC when a health check entry is made.

## API Endpoint

### `GET /healthz`

#### Functionality:

1. **Checks database connectivity** by inserting a record into the `health_check` table.
2. **Returns HTTP 200 OK** if the record was successfully inserted.
3. **Returns HTTP 503 Service Unavailable** if the insert operation fails.
4. **Ensures no caching** of the response by setting the `Cache-Control: no-cache` header.
5. **Rejects requests with a payload** and returns `400 Bad Request` if a request body is detected.
6. **Does not return a response body** to maintain efficiency.
7. **Only supports HTTP GET**; all other HTTP methods return `405 Method Not Allowed`.

## Response Codes

| Status Code             | Meaning                                         |
| ----------------------- | ----------------------------------------------- |
| 200 OK                  | Health check passed, database connection active |
| 400 Bad Request         | Request contained a payload and was rejected    |
| 405 Method Not Allowed  | Only GET method is supported                    |
| 503 Service Unavailable | Database connection failed                      |

## Requests using Postman

### **Successful Health Check**

1. Open **Postman**.
2. Create a **New Request**.
3. Set the request method to **GET**.
4. Enter the URL: `http://localhost:5001/healthz`.
5. Click **Send**.

**Expected Response:**

- **Status:** `200 OK`
- **Body:** *(empty)*

### **Request with Payload (Rejected)**

1. In Postman, set the request method to **GET**.
2. Enter the URL: `http://localhost:5001/healthz`.
3. Go to the **Body** tab and select **raw**.
4. Enter:
   ```json
   {"key":"value"}
   ```
5. Click **Send**.

**Expected Response:**

- **Status:** `400 Bad Request`
- **Body:** *(empty)*

### **Request Using Unsupported Method**

1. In Postman, set the request method to **POST**.
2. Enter the URL: `http://localhost:5001/healthz`.
3. Click **Send**.

**Expected Response:**

- **Status:** `405 Method Not Allowed`
- **Body:** *(empty)*

### **Health Check Fails (Database Down)**

1. Stop the database service.
2. In Postman, set the request method to **GET**.
3. Enter the URL: `http://localhost:5001/healthz`.
4. Click **Send**.

**Expected Response:**

- **Status:** `503 Service Unavailable`
- **Body:** *(empty)*

Enter following commands to stop the service:

1. open terminal 
2. enter `sudo su - postgres`
3. it goes to postgres mode then stop service by entering follwing command:
   ```
   /Library/PostgreSQL/17/bin/pg_ctl -D /Library/PostgreSQL/17/data stop
   ```
4. to again restart the service 
   ```
   /Library/PostgreSQL/17/bin/pg_ctl -D /Library/PostgreSQL/17/data start
   ```

## Additional Notes

- Application will not throw `500 Internal Server Errors`.
- Application should not require a restart between API calls.
- Responses always include `Cache-Control: no-cache`.
- The `/healthz` endpoint only supports the **GET** method.
- The service does not accept request payloads or query parameters.


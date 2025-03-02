# Eliza

## Edit the character files

Open `src/character.ts` to modify the default character. Uncomment and edit.

### Custom characters

To load custom characters instead:

- Use `pnpm start --characters="path/to/your/character.json"`
- Multiple character files can be loaded simultaneously

### Add clients

```
# in character.ts
clients: [Clients.TWITTER, Clients.DISCORD],

# in character.json
clients: ["twitter", "discord"]
```

## Duplicate the .env.example template

```bash
cp .env.example .env
```

\* Fill out the .env file with your own values.

### Add login credentials and keys to .env

```
DISCORD_APPLICATION_ID="discord-application-id"
DISCORD_API_TOKEN="discord-api-token"
...
OPENROUTER_API_KEY="sk-xx-xx-xxx"
...
TWITTER_USERNAME="username"
TWITTER_PASSWORD="password"
TWITTER_EMAIL="your@email.com"
```

## Install dependencies and start your agent

```bash
pnpm i && pnpm start
```

Note: this requires node to be at least version 22 when you install packages and run the agent.

you can also interact with the agent through API {baseurl}/

## Run with Docker

### Build and run Docker Compose (For x86_64 architecture)

#### Edit the docker-compose.yaml file with your environment variables

```yaml
services:
  eliza:
    environment:
      - OPENROUTER_API_KEY=blahdeeblahblahblah
```

#### Run the image

```bash
docker compose up
```

### Build the image with Mac M-Series or aarch64

Make sure docker is running.

```bash
# The --load flag ensures the built image is available locally
docker buildx build --platform linux/amd64 -t eliza-starter:v1 --load .
```

#### Edit the docker-compose-image.yaml file with your environment variables

```yaml
services:
  eliza:
    environment:
      - OPENROUTER_API_KEY=blahdeeblahblahblah
```

#### Run the image

```bash
docker compose -f docker-compose-image.yaml up
```

---

# API Endpoint Documentation

This document provides instructions on how to call the API endpoint and the required payload structure.

## Endpoint

**POST** `http://localhost:${serverPort}/${agentId}/message`

This endpoint sends a message to the specified agent and returns a response.

---

## Base URL

The base URL for the API is:

```
http://localhost:${serverPort}
```

Replace `${serverPort}` with the actual port number your server is running on (e.g., `3000`).

---

## Authentication

This endpoint does not require authentication. Simply send the request to the specified URL.

---

## Request Payload

The request payload should be a JSON object with the following structure:

```json
{
  "text": "string", // The message text to send
  "userId": "string", // Unique identifier for the user
  "userName": "string" // Display name of the user
}
```

### Required Fields

- `text`: The message content to be sent.
- `userId`: A unique identifier for the user.
- `userName`: The display name of the user.

---

## Example Request

Here is an example of how to call the endpoint using `curl`:

```bash
curl -X POST "http://localhost:3000/agent123/message" \
-H "Content-Type: application/json" \
-d '{
  "text": "Hello, how are you?",
  "userId": "user123",
  "userName": "John Doe"
}'
```

### Explanation:

- Replace `3000` with your server's port number.
- Replace `agent123` with the actual `agentId` you want to send the message to.
- Update the `text`, `userId`, and `userName` fields with your desired values.

---

## Response

The API will return a JSON response with the following structure:

```json
{
  "status": "success", // Status of the request
  "message": "Message sent successfully", // Message describing the result
  "data": {
    // Optional additional data
    "messageId": "12345", // Unique ID of the sent message
    "timestamp": "2023-10-01T12:00:00Z" // Timestamp of the message
  }
}
```

### Response Fields

- `status`: Indicates whether the request was successful (`success` or `error`).
- `message`: A message describing the result of the request.
- `data`: Optional additional data, such as a `messageId` or `timestamp`.

---

## Error Handling

If the request fails, the API will return an error response with the following structure:

```json
{
  "status": "error",
  "message": "Error message describing the issue",
  "errorCode": "ERROR_CODE" // Optional error code
}
```

### Common Error Codes

- `400`: Bad Request - The request payload is invalid.
- `404`: Not Found - The `agentId` does not exist.
- `500`: Internal Server Error - An error occurred on the server.

---

## Support

For any questions or issues, please contact your system administrator or support team.

---

### Notes:

1. Replace `${serverPort}` and `${agentId}` with actual values when making the request.
2. Customize the response and error handling sections based on your API's actual behavior.
3. If authentication is added later, update the "Authentication" section accordingly.

# Deploy with Railway

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/aW47_j)

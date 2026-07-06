# ChatApp

A real-time messaging app with one-to-one audio and video calling, built with React, Socket.io, and WebRTC.

## Demo

### Authentication
<img width="1919" height="944" alt="login page" src="https://github.com/user-attachments/assets/41cff967-5e88-47d1-b076-d7f470432b8b" />
JWT-based auth — bcrypt-hashed passwords, parameterized queries.

### Messaging
<img width="1918" height="945" alt="messages page" src="https://github.com/user-attachments/assets/98d65972-1004-481d-a465-5b6476f99ac0" />

Real-time text delivery via REST polling.

### Voice & Video Calls (WebRTC)
Peer-to-peer calls established over WebRTC, with a self-hosted coturn TURN server for NAT traversal.
<img width="1533" height="725" alt="during call" src="https://github.com/user-attachments/assets/cab54767-ce23-4430-99bd-cd1a95a9e706" />
<img width="1919" height="949" alt="during call computer 2" src="https://github.com/user-attachments/assets/c21e1c0f-2140-4723-ab26-e0467c1c8bf5" />

*Caller side — WebRTC signaling in progress, waiting for the peer to answer.*
<img width="1917" height="946" alt="calling page" src="https://github.com/user-attachments/assets/c1f4a7e2-29b4-4483-a0d5-75bfa9a8e0a7" />

*Callee side on a separate machine — incoming call with accept/decline.*
<img width="1920" height="917" alt="getting called" src="https://github.com/user-attachments/assets/2fc9dfb1-1d25-4c4b-8ae7-b53639f76659" />


*Live deployment at kaplunchatapp.com — incoming call received on a different machine.*

🔗 **Live:** https://www.kaplunchatapp.com/

## Stack

- **Frontend:** React, Socket.io-client, WebRTC, CSS Modules
- **Backend:** Node.js, Socket.io (signaling server)
- **Database:** PostgreSQL
- **Auth:** JWT, bcrypt
- **Infra:** AWS (EC2, RDS), custom domain + SSL

## Architecture

Text messaging runs over a REST API backed by PostgreSQL, with the client polling for new messages on a short interval. Audio/video calls run peer-to-peer over WebRTC, using a Socket.io connection purely for signaling (SDP offer/answer and ICE candidate exchange) to set the connection up.

## Key decisions

- **JWT + bcrypt for auth** — stateless tokens so the server holds no session state; passwords hashed with bcrypt, never stored in plaintext.
- **WebRTC for calls** — media flows peer-to-peer rather than through the server, so the backend only brokers the initial handshake.
- **Socket.io for signaling, REST for messages** — calls need instant server-push (an incoming call can't wait), so they use a socket; text messages tolerate a few seconds of latency, so they use REST polling instead of holding socket state for every message.

## Known limitations / next steps

- **Messaging is polling, not push** — new messages arrive via a 5-second REST poll rather than being pushed live. Next step: send messages over the existing Socket.io connection to make them truly real-time and drop the polling.
- **Calls can fail on some restrictive networks** — the current setup connects peers directly, which doesn't work behind every network configuration. Next step: add a relay server as a fallback.

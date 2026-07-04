# ChatApp

A real-time messaging app with one-to-one audio and video calling, built with React, Socket.io, and WebRTC.

## Demo

📹 **[Demo video — link to be added]**

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

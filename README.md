# Stream-it
## Introduction
Stream-it is an idea of videoconferencing 
## Project Revision
### V0.0.1
P2P Full Mesh Call
<p align="center">
<img src="./docs/imgs/topology/202011-webrtc-mesh-architecture.png" style="width:50%">
</p>

Techical Stack
- Firebase : Enable Full Mesh Binding betweeen Client
- PeerJS   : WebRTC Client wrapper enable ICE, Offer,...
- Angular  : UI framework wrapping for client interaction

Support Feature on V.0.1
- Room [create, join] automatic remove when 0 candidate 
- P2P Mesh Call
- Media Stream [VideoCam+Audo, ScreenShare] (only one source/candidate)

Current limitation
- Full mesh isn't a promise solution for videoconferencing
- STUN doesn't support Client behind Symmetric NAT
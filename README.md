# waterfall

> Jump to the bottom if you want to learn how to contribute! 
### What is this?
Waterfall is a system or protocol that strings together webrtc connections to achieve scaled live streaming sessions without the use of a centralized SFU server. 

### Why?
I created this concept in pursuit of a fully peer-to-peer application that operates as efficiently and incredibly as centralized systems do. The main application I have in mind, and am initially building this to serve the purpose of, is to allow a p2p live streaming app that can scale to hundreds (thousands, maybe? it's not ready to stress test yet. If you'd like to help, please do! I'm only one person:p) of active participants. Here are the initial goals:
- At least 1 speaker can live stream to hundreds of users with as minimal latency as possible
- As few "servers" or centralized points of failure as possible
- encrypted rooms, password or preferably (maybe optionally per the package config?) pgp protected.  

Stretch goals:
- Allow multiple speakers. I think at least the first two tiers (5 people) should work without much issue
- save the streams to indexedDB using GUN*

### How it works
Alice starts recording and live streaming. She makes a record in a database (GUN) that gives her peer id and perhaps optionally some metadata.<br/>
Mr. Dude "asks" to join the session. If his key is valid, he gets access to the database Alice saved to.<br/>
Mr. Dude takes a snapshot of the entire graph starting at the node that Alice created.<br/>
He ends up with a tree like this<br/>
A -> B1, B2, B3, B4<br/>
if he expands B1, he might see:<br/>
B1 -> C1, C2, C3, C4<br/>
expanding B2, he perhaps sees:<br/>
B2 -> C5, C6<br/>
he now knows that B2 has only 2 active connections, and thus has room for him to connect.<br/>
Mr. Dude calls B2, B2 accepts the call because he has less than 4 active connections, and B2 streams Alice's stream to Mr. Dude. Mr. Dude would now be considered C7. Once all B's have 4 connections, and C1-C6 have 4 connections, Mr. Dude (C7), would begin accepting new connections. <br/>
> Note: It would be simpler for him to just start accepting connections immediately, however new participants would ideally not call him until the other slots were filled up. They would at least prefer to call the open B's because they would have 1 degree less of separation from Alice (A).<br/>
Once Mr. Dude has more connections, they would be receiving the stream such that Alice (A) streams directly to B2, who would forward the stream to Mr. Dude (C7), who would forward the stream to his connections.

this should scale really well, particularly if only 1 or a small number of participants are ever actively streaming.
With each new layer, some amount of latency is introduced. This needs to be tested more to get accurate estimates on the latency.


* If we save the stream, should every client save it and have their own copy? Will that cause there to be potentially dozens of different copies (different quality bandwith, etc.) floating around? Maybe every client should save their own copy, with ability to opt out, and the copies should be compared to select the highest quality recording that is then distributed. 

> Pictures maybe coming soon! 

### Considerations
- The higher level participants would ideally have better connections, as they are responsible for a higher number of connections further down the stream.
- We may be able to allow _anyone_ to stream if we can rearrange the graph in an efficient manner without causing too much interuption. Rearranging would also allow us to move higher bandwidth participants to the top once they join.
- We're going to use PeerJS for now, because it massively simplifies the WebRTC process. In the future, it would be cool to move towards a more native implementation, and even try using GUN to relay the connection info so that the only servers involved are the GUN relay servers. 
- Additionally, could we use a Distributed Hash Table (DHT) to store offer/answer info? I'm not sure how much of that needs to be dynamic, but if we did that we would only need to contact ICE servers and we would have an almost 100% peer to peer system.

### Usage
See the example React app in examples/waterfalldemo


### Contributor's Guide
Play with the code a bit. Please contact me directly (if we aren't already connected, you can find my email in the commit history) for ANY questions you have or for anything that is not clear. 

When you're ready to contribute, make a branch with a descriptive name 
fix literally anything you think could use improvement! Chat with me on discord about what changes you want to make.

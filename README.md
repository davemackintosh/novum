# Novum

"new"

> I didn't get time to finish this but it's not a million miles off. Need to add a translation from ES event to ECS components and then to add a simple P2P WebRTC connection manager to send and receive events over the line.

a proof of concept figma like collaborative drawing app using SvelteKit, Typescript and WebRTC.

All work is done and stored in the frontend and there is no backend at all, all data is stored in localStorage. Events are dispatched over a webRTC channel and shared across devices.

It approaches the problem using the following ideas:

* ECS
    * All "layers" are "entities".
    * All applicable actions are "components"
    * All rendering and user interaction are "systems"

    > This gives us a very isolated way of adding behaviour to things without having to worry about extending entire feature sets.
* Event Streaming
    * All actions are recorded in a ledger and replayed for "eventual consistency" in views and queries.

    > This gives us the time travel feature as well as the flexibility to create entirely new views and queries while retaining the underlying structure.
* CQRS
    * All "write" operations are seperated from all read operations.

# Okay? So what does what?

The CQRS is responsible for the reading and writing separation, in this demo it's not very powerful but in a distributed system it's very very powerful and offers multiple benefits such as time travel, data restoration, data modification without any data model changes, total separation of query model from data structure as well as a very clear and concise set of rules around data transfer.

Event sourcing is what gives us the time travel through application state as well as the ability to; at any time, change our data model without ever changing the data source. It gives us a versionable protocol which means that our software is always backwards and forwards compatible (so long as the command and even handlers remain the same.)

The ECS is responsible for the handling of drawing objects to the canvas based on the events provided and or loaded from the event store. This means that our writing is it's own domain, reading/querying is it's own domain and rendering is it's own domain.

## Getting started.

`yarn && yarn dev` will run a vite server at the default address and you should be good to go.

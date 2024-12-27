## TODO

2. The formatting of messages (TS seems less tolerant than Py) probably needs to be hidden inside the Resources and Tools modules.


```
Server Class
  Managers
    - [X] Resource Manager
    - [X] Tool Manager
    Prompt Managers
    Core Handlers
    - [X] list resource
    - [X] read resource
    - [X] add resource
    - [] sub
    - [] unsub
    - [X] list tools
    - [X] read tool
    - [X] add tool
- [X] call tool
  - [X] list prompts
    - [X] get prompt
```

### Server Concepts
- [X] customize the transport layer
- [] Declare the capabilities of the server in the constructor


### Capabilities
- [X] Tools
- [X] Prompts
- [X] Resources
- [] Conversion flow / message wrappers
- [] Context Object
   - [] Logging via debug(), info(), warning(), and error()
   - [] Resource access through read_resource()
   - [] Request metadata via request_id and client_id
- [] Image conversion

### Test Coverage
- [X] Tests on each major capability
- [] Test with Claude Desktop

### Example Servers
- [] Weather
- [] Time
- [] Markdownify / Fetch

### Docs
- [] Development Mode
- [] Claude Desktop Integration directions
- [] Instant install to Claude by script

### Polish
- [] dependencies
- [] Can we infer the inputs schema definition just from the type signature of the fn that's passed in when defining a tool?
- [] Roots
- [] Samplings (delay)

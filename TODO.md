## TODO

1. Resources is kind of broken because we are mixing Resource Templates with pure resources and the pattern matching via url.
2. The formatting of messages (TS seems less tolerant than Py) probably needs to be hidden inside the Resources and Tools modules.

START AT:
- Running a tool with input from the caller
- Then figure out Resources



```
Server Class
  Managers
    - [X] Resource Manager
    Tool Manager
    Prompt Managers
    Core Handlers
    - [X] list resource
      fulfilled by the resource manager
    - [X] read resource
      fulfilled by the resource manager
    - [] add
    - [] sub
    - [] unsub
    list tools
      fulfilled by the tool manager
    call tools
      fulfilled by the tool manager
    list prompts
      fulfilled by the prompt manager
    get prompt
      fulfilled by the prompt manager
```

### Server Concepts
- [X] customize the transport layer
- [] Declare the capabilities of the server in the constructor


### Capabilities
- [X] Resources
  - [X] List
  - [X] Read
- [] Prompts
- [] Tools
- [] Context Object
   - [] Progress bar reporting through report_progress()
   - [] Logging via debug(), info(), warning(), and error()
   - [] Resource access through read_resource()
   - [] Request metadata via request_id and client_id
- [] Roots
- [] Samplings (delay)
- [] User / Assistant Message wrapper (compositional functions)
- [] Image conversion
- [] Instant install to Claude by script

### Test Coverage
- [] Tests on each major capability

### Example Servers
- [] Weather
- [] Time
- [] Markdownify / Fetch

### Docs
- [] Development Mode
- [] Claude Desktop Integration directions

### Polish
- [] logging levels
- [] dependencies

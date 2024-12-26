## TODO


```
Server Class
  Managers
    - [X] Resource Manager
    Tool Manager
    Prompt Managers
  Core Handlers
    list resource
      fulfilled by the resource manager
    read resource
      fulfilled by the resource manager
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
- [] Resources
  - [] List
  - [] Read
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

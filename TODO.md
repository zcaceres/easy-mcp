## TODO

<<<<<<< Updated upstream


What's the point?
- hide input configuration!
  - if we can do this, we can end up hiding a lot of configuration in general


1. I add the @Tool decorator
  This runs at runtime and executes BEFORE the inner function does
2. I get a fully configured tool added to the ToolManager



1. Finish Magic Config integration

- Subclassing behavior from easy MCP
  - declare every item as instance method with decorator
    - @tool
    - @resource
    - @prompt
    - @root
  - These decorates pull out function params etc and then call the "add" method relevant for their type


2. Conversion and formatting of messages and responses

||||||| Stash base
3. list capabilities based on what has been registered
=======
3. list capabilities based on what has been registered

- Separate registration of config from the config parsing step.
- Make it functional
- No magic input stuff should change the core API of the server and declarations as they are


>>>>>>> Stashed changes
1. The formatting of messages (TS seems less tolerant than Py) probably needs to be hidden inside the Resources and Tools modules.
  - What are the supported data types
<<<<<<< Updated upstream
2. Logging and configuration of Logging (see LoggingMessageNotification)
3. Parse function signature for input arguments

Textcontent
ImageContent
EmbeddedResource
PromptMessage

BlobResourceContents
TextResourceContents
ResourceContents


||||||| Stash base
2. Parse function signature for input arguments
=======
>>>>>>> Stashed changes

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
- [X] Declare the capabilities of the server in the constructor


### Capabilities
- [X] Tools
- [X] Prompts
- [X] Resources
- [X] Roots
- [] Conversion flow / message wrappers
- [] Image conversion
- [] Context Object
   - [] Logging via debug(), info(), warning(), and error()
   - [] Resource access through read_resource()
   - [] Request metadata via request_id and client_id

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

- [] Samplings (delay)
- [] SSE

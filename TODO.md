## TODO

NEXT:
- Logging
  - configurable logger class w/log levels
  - serializes to client
  - on a context object
- Add error to make sure people don't pass objects as args to the functions that are decorated. This is critical for the experimental API
- Prompt in theory accepts inputs by the TS types don't suggest it can and it doesn't seem to share them.
- Conversion and formatting of messages and responses
  - What are the supported data types
    Textcontent
    ImageContent
    EmbeddedResource
    PromptMessage
    BlobResourceContents
    TextResourceContents
    ResourceContents
    - [] Image conversion
- Logging and configuration of Logging (see LoggingMessageNotification)
- sub / unsub
- [] Context Object
   - [] Logging via debug(), info(), warning(), and error()
   - [] Resource access through read_resource()
   - [] Request metadata via request_id and client_id

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

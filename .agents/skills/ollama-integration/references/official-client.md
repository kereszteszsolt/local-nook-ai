# Official Ollama JavaScript client notes

Primary source: `https://github.com/ollama/ollama-js`

Browser integration baseline:

```ts
import { Ollama } from 'ollama/browser';

const client = new Ollama({ host: 'http://localhost:11434' });
const models = await client.list();
const stream = await client.chat({
  model: 'example-model',
  messages: [{ role: 'user', content: 'Hello' }],
  stream: true,
});

for await (const part of stream) {
  console.log(part.message.content);
}
```

For cancellable application streams, create one client instance per active stream and call
`client.abort()` from the cancellation path. This avoids coupling application code to a
non-public iterator type and keeps cancellation ownership explicit.

Project rules:

- Keep the SDK behind `OllamaClientService`.
- Use a dedicated fake client in unit tests.
- Keep only model-relevant fields in `messages`.
- Treat duration and other completion metadata as optional until the final chunk.
- Keep one dedicated SDK client per active cancellable stream.
- Do not duplicate the SDK's transport or stream parser in application code.

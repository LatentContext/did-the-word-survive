# syntax=docker/dockerfile:1
FROM python:3.11-slim

LABEL org.opencontainers.image.title="did-the-word-survive" \
      org.opencontainers.image.description="Text-based WER/CER/MER evaluation demo" \
      org.opencontainers.image.source="https://github.com/LatentContext/did-the-word-survive" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Copy only the source needed — no audio, no models, no private data
COPY pyproject.toml ./
COPY src/ ./src/
COPY configs/ ./configs/
COPY examples/ ./examples/
COPY schemas/ ./schemas/
COPY lexicons/ ./lexicons/
COPY scripts/ ./scripts/

# Install the package (no external network dependencies beyond pip)
RUN pip install --no-cache-dir -e .

# Default: run the demo evaluation in table format
ENTRYPOINT ["context-demo"]
CMD ["--manifest", "examples/toy_manifest.jsonl", \
     "--config", "configs/demo.json", \
     "--format", "table"]

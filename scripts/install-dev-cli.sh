#!/bin/bash
# Install openclaw CLI wrapper for development
# Links the project's CLI to the global node bin directory

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
NODE_BIN="$(npm prefix -g)/bin"

cat > "$NODE_BIN/openclaw" << WRAPPER
#!/bin/bash
cd "$PROJECT_DIR"
exec node scripts/run-node.mjs "\$@"
WRAPPER

chmod +x "$NODE_BIN/openclaw"

# Reshim if using mise
if command -v mise &> /dev/null; then
  mise reshim
fi

echo "Installed openclaw CLI wrapper to $NODE_BIN/openclaw"
echo "Run 'openclaw --version' to verify"

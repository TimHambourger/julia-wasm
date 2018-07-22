if [ "$JULIA_WASM_ENV" == production ]; then
    CARGO_MODIFIER="--release"
    CARGO_OUTPUT_DIR="release"
else
    CARGO_MODIFIER=""
    CARGO_OUTPUT_DIR="debug"
fi

CARGO_COMMAND="cargo build $CARGO_MODIFIER --target=wasm32-unknown-unknown"

echo $CARGO_COMMAND
${CARGO_COMMAND}

WASM_OUTPUT="../web/wasm_output"

# wasm-bindgen needs output directory to exist, but that directory isn't versioned
if [ ! -d "$WASM_OUTPUT" ]; then
    mkdir "$WASM_OUTPUT"
fi

WASM_BINDGEN_COMMAND="wasm-bindgen --browser target/wasm32-unknown-unknown/$CARGO_OUTPUT_DIR/julia_wasm.wasm --out-dir $WASM_OUTPUT"

echo $WASM_BINDGEN_COMMAND
${WASM_BINDGEN_COMMAND}

cd wasm
./build.sh

cd ../web

WEBPACK_COMMAND="webpack"
echo $WEBPACK_COMMAND
${WEBPACK_COMMAND}

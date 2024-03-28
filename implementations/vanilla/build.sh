solc --version
solc-select use 0.8.19
# Set --metadata-hash to remove metadata without 34 bytes IPFS hash there is still
# the solc version in the metadata.
solc -o contracts --optimize --combined-json abi,bin,bin-runtime --metadata-hash none --overwrite --base-path '/' --include-path 'node_modules/' src/*.sol

if [ $? -eq 0 ]
then
  echo "- Create index.js and index.d.ts files"

  echo 'const {SmartContracts} = require("@saturn-chain/smart-contract");' > contracts/index.js
  echo 'const combined = require("./combined.json");' >> contracts/index.js
  echo 'module.exports = SmartContracts.load(combined);' >> contracts/index.js

  echo 'import { SmartContracts } from "@saturn-chain/smart-contract"' > contracts/index.d.ts
  echo 'declare const _default: SmartContracts;' >> contracts/index.d.ts
  echo 'export default _default;' >> contracts/index.d.ts

  echo "- Verify compilation and script by displaying the loaded contracts"
  node -e 'console.log("  > "+require("./contracts/").names().join("\n  > "))'
fi

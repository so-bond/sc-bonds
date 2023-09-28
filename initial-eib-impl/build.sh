solc --version
# Set --metadata-hash to remove metadata without 34 bytes IPFS hash there is still
# the solc version in the metadata.

# get the path of the contracts folder
SHELL_FILE=$(readlink -f $0)
SHELL_FOLDER=$(dirname $SHELL_FILE)
CONTRACTS=$(readlink -f $SHELL_FOLDER/../contracts)
cd $SHELL_FOLDER
solc -o $CONTRACTS --optimize --combined-json abi,bin,bin-runtime --metadata-hash none --overwrite --base-path . --include-path ./node_modules src/*.sol

if [ $? -eq 0 ]
then
  echo "- Create index.js and index.d.ts files"

  echo 'const {SmartContracts} = require("@saturn-chain/smart-contract");' > $CONTRACTS/index.js
  echo 'const combined = require("./combined.json");' >> $CONTRACTS/index.js
  echo 'module.exports = SmartContracts.load(combined);' >> $CONTRACTS/index.js

  echo 'import { SmartContracts } from "@saturn-chain/smart-contract"' > $CONTRACTS/index.d.ts
  echo 'declare const _default: SmartContracts;' >> $CONTRACTS/index.d.ts
  echo 'export default _default;' >> $CONTRACTS/index.d.ts

  echo "- Verify compilation and script by displaying the loaded contracts"
  # export NODE_PATH to tell node where to find the module @saturn-chain/smart-contract, else it will search at the contracts folder
  export NODE_PATH=./node_modules
  node -e 'console.log("  > "+require(".").names().join("\n  > "))'
fi


# get the path of the contracts folder
SHELL_FILE=$(readlink -f $0)
SHELL_FOLDER=$(dirname $SHELL_FILE)

# create the contract forlder if it does not exist
test -d "$SHELL_FOLDER/../contracts" || mkdir -p "$SHELL_FOLDER/../contracts"

CONTRACTS=$(readlink -f $SHELL_FOLDER/../contracts)
cd $SHELL_FOLDER


echo "- Create index.js and index.d.ts files"

echo 'const {SmartContracts} = require("@saturn-chain/smart-contract");' > $CONTRACTS/index.js
echo 'const combined = require("./combined.json");' >> $CONTRACTS/index.js
echo 'module.exports = SmartContracts.load(combined);' >> $CONTRACTS/index.js

echo 'import { SmartContracts } from "@saturn-chain/smart-contract"' > $CONTRACTS/index.d.ts
echo 'declare const _default: SmartContracts;' >> $CONTRACTS/index.d.ts
echo 'export default _default;' >> $CONTRACTS/index.d.ts

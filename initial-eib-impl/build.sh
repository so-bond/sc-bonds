solc --version
# Set --metadata-hash to remove metadata without 34 bytes IPFS hash there is still
# the solc version in the metadata.

# get the path of the contracts folder
SHELL_FILE=$(readlink -f $0)
SHELL_FOLDER=$(dirname $SHELL_FILE)


# create the contract forlder if it does not exist
test -d "$SHELL_FOLDER/../contracts" || mkdir -p "$SHELL_FOLDER/../contracts"

CONTRACTS=$(readlink -f $SHELL_FOLDER/../contracts)
cd $SHELL_FOLDER
solc -o $CONTRACTS --optimize --combined-json abi,bin,bin-runtime --metadata-hash none --overwrite --base-path . --include-path ./node_modules src/*.sol

if [ $? -eq 0 ]
then
  ./gen-deps.sh
  echo "- Verify compilation and script by displaying the loaded contracts"
  # export NODE_PATH to tell node where to find the module @saturn-chain/smart-contract, else it will search at the contracts folder
  export NODE_PATH=./node_modules
  node -e 'console.log("  > "+require(".").names().join("\n  > "))'
fi

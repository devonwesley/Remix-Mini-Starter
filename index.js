/* code for part 2 */
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider)
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
}
// -------------------------- Code for part 2 above -----------------------

let compiler
let optimize = 1
let compiledContract

window.onload = function () {
  document.getElementById('versions').onchange = loadSolcVersion

  if (!BrowserSolc) {
    console.log('You have to load browser-solc.js in the page. We recommend using a <script> tag.')
    throw new Error()
  }

  status('Loading Compiler Versions...')

  BrowserSolc.getVersions(function (soljsonSources, soljsonReleases) {
    populateVersions(soljsonSources)
    setVersion(soljsonReleases['0.4.18'])
    loadSolcVersion()
  })
}

function loadSolcVersion() {
  status(`Loading Solc: ${getVersion()}`)
  BrowserSolc.loadVersion(getVersion(), function (c) {
    status('Solc loaded.')
    compiler = c
  })

  addCompileEvent()
  getAccounts()
}

function getVersion() {
  return document.getElementById('versions').value
}

function setVersion(version) {
  document.getElementById('versions').value = version
}

function populateVersions(versions) {
  sel = document.getElementById('versions')
  sel.innerHTML = ''

  for (let i = 0; i < versions.length; i++) {
    let opt = document.createElement('option')
    opt.appendChild(document.createTextNode(versions[i]))
    opt.value = versions[i]
    sel.appendChild(opt)
  }
}

function status(txt) {
  document.getElementById('status').innerHTML = txt
}

function addCompileEvent() {
  const compileBtn = document.getElementById('contract-compile')
  compileBtn.addEventListener('click', solcCompile)
}

function solcCompile() {
  if (!compiler) return alert('Please select a compiler version.')

  setCompileButtonState(true)
  status("Compiling contract...")
  compiledContract = compiler.compile(getSourceCode(), optimize)

  if (compiledContract) setCompileButtonState(false)

  renderContractList()
  status("Compile Complete.")
}

function getSourceCode() {
  return document.getElementById("source").value
}

function setCompileButtonState(state) {
  document.getElementById("contract-compile").disabled = state
}

function renderContractList() {
  const contractListContainer = document.getElementById('contract-list')
  const { contracts } = compiledContract

  Object.keys(contracts).forEach((contract, index) => {
    const label = `contract-id-${contract}-${Math.random()}`
    const gas = contracts[contract].gasEstimates.creation

    createContractInfo(gas, contract, label, function (el) {
      contractListContainer.appendChild(el)
      const btnContainer = document.getElementById(label)

      btnContainer.appendChild(
        buttonFactory('primary', contract, contracts[contract], 'details')
      )

      btnContainer.appendChild(
        buttonFactory('danger', contract, contracts[contract], 'deploy')
      )
    })
  })
}

function createContractInfo(gas, contractName, label, callback) {
  const el = document.createElement('DIV')

  el.innerHTML = `
    <div class="mui-panel">
      <div id="${label}" class="mui-row">
        <div class="mui-col-md-3">
          Contract Name: <strong>${contractName.substring(1, contractName.length)}</strong>
        </div>
        <div class="mui-col-md-3">
          Gas Estimate: <strong style="color: green;">
            ${sumArrayOfInts(gas)}
          </strong>
        </div>
      </div>
    </div>
  `

  callback(el)
}

function sumArrayOfInts(array) {
  return array.reduce((acc, el) => (acc += el), 0)
}

function buttonFactory(color, contractName, contract, type) {
  const btn = document.createElement('BUTTON')
  const btnContainer = document.createElement('DIV')

  btn.className = `mui-btn mui-btn--small mui-btn--${color} mui-btn--raised"`
  btn.innerText = type
  btn.addEventListener('click', () => type === 'details'
    ? renderContractDetails(contractName, contract)
    : deployContractEvent(contractName, contract) // code for part 2
  )

  btnContainer.className = 'mui-col-md-3'
  btnContainer.appendChild(btn)

  return btnContainer
}

function renderContractDetails(name, contract) {
  const modalEl = document.createElement('div')
  modalEl.style.width = '700px';
  modalEl.style.margin = '100px auto';
  modalEl.style.padding = '50px';
  modalEl.style.backgroundColor = '#fff';

  modalEl.appendChild(renderContractInfo(name, contract))
  mui.overlay('on', modalEl);
}

function renderContractInfo(contractName, contract) {
  const contractContainer = document.createElement('div')
  contractContainer.innerHTML = `
    <h3>
      Contract Name: <strong>${contractName.substring(1, contractName.length)}</strong>
    </h3>

    <h4>Bytecode:</h4>
    <textarea style="width:670px; height:200px;" readonly>${contract.bytecode}</textarea>

    <h4>ABI:</h4>
    <textarea style="width:670px; height:150px;" readonly>${contract.interface}</textarea>

    <h4>Function Hashes</h4>
    <textarea style="width:670px; height:100px;" readonly>${renderFunctionWithHashes(contract.functionHashes)}</textarea>

    <h4>Opcodes:</h4>
    <textarea style="width:670px; height:200px;" readonly>${contract.opcodes}</textarea>
  `

  return contractContainer
}

function renderFunctionWithHashes(functionHashes) {
  let functionHashContainer = ''

  Object.keys(functionHashes)
    .forEach((functionHash, index) => (
      functionHashContainer += `${++index}. ${functionHashes[functionHash]}: ${functionHash} \n`
    ))

  return functionHashContainer
}

function getAccounts() {
  const ethAccount = web3.eth.accounts[0]

  return document
    .getElementById('account-addresses')
    .innerHTML = `<div>
        Account: ${ethAccount} 
        <br />
        Balance: ${balanceInEth(ethAccount)}
      </div>
    `
}

function balanceInEth(address) {
  return web3.fromWei(web3.eth.getBalance(address).toString(), 'ether')
}

// ================================================================================================

function deployContractEvent(contractName, contract) {
  const comfirmMsg = `
    Contract: ${contractName.substring(1)}
    Network: ${currentNetwork()}

    Deploy?
  `
  if (!confirm(comfirmMsg)) return

  const { bytecode } = contract
  const abi = contract.interface
  const newContract = web3.eth.contract(JSON.parse(abi))

  newContract.new(
    { from: web3.eth.accounts[0], data: bytecode, gas: 1000000 },
    newContractCallback(contractName)
  )
}

function currentNetwork() {
  const mainnet = '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3'
  const testnet = '0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d'
  const currentNetwork = web3.eth.getBlock(0).hash

  switch (currentNetwork) {
    case mainnet:
      return 'Main Net'
    case testnet:
      return 'Ropsten Network'
    default:
      return 'TestRPC Testnet'
  }
}

function newContractCallback(contractName) {
  return (err, deployedContract) => {
    getAccounts()
    if (!err) {
      !deployedContract.address
        ? status(`Deploying contract....`)
        : renderContract(deployedContract, contractName)
    }
  }
}

function renderContract(contract, contractName) {
  status(`Contract Deployed.`)
  const { transactionHash, address } = contract

  web3.eth.getTransaction(transactionHash, function(err, transaction) {
    if (!err) { 
      const { blockNumber } = transaction
      const contractDetails = { contractName, address, blockNumber }
      const props = { ...transaction, ...contract}

      createContractPanel(contractDetails, function(panel) {
        createContract(props, contractName, panel)
      })
    }  
  })
}

function createContractPanel(contract, callback) {
  const div = document.createElement('DIV')
  div.className = 'mui-panel'
  div.innerHTML = `
    <h3>
      <strong>Contract: </strong> 
      ${contract.contractName}
    </h3>
    <p>
      <strong>Block Number: </strong>
      ${contract.blockNumber}
    </p>
    <p>
      <strong>Contract Balance: </strong>
      ${balanceInEth(contract.address)}
    </p>
      <strong>Contract Address: </strong>
      ${contract.address}
    </p>
  `

  callback(div)
}

function createContract(contract, contractName, panel) {
  createPropsContainers(panel, function(propsList, hashList, functionList) {
    Object.entries(contract).forEach(contractProps => {
      console.log('ENTRIES :: ==>', contractProps)
      const params = {
        key: contractProps[0],
        value: contractProps[1],
        hashList,
        propsList,
        functionList,
      }
      const container = categorizeContractProps(params)

      if(!filterProps(contractProps[0])) {
        container.append(
          createContractElement(contractProps, contractName, container)
        )
      }
    })
  })
}

function createPropsContainers(panel, callback) {
  const propsList = createPanelContainer('DIV', 'mui-row', 'marginLeft', 0)
  const hashList = createPanelContainer('UL', 'mui-panel', 'listStyleType', 'none')
  const functionList = createPanelContainer('UL', 'mui-row', 'listStyleType', 'none')
  functionList.innerHTML = '<H3><strong>Contract Functions: </strong></H3>'

  document.getElementById('contractFunction').appendChild(panel)

  panel.append(propsList)
  panel.append(hashList)
  panel.append(functionList)

  callback(propsList, hashList, functionList)
}

function createPanelContainer(element, className, styleType, styleValue) {
  const list = document.createElement(element)
  list.className = className
  list.style[styleType] = styleValue

  return list
}

function categorizeContractProps(params) {
  const hashNames = {
    'hash': 'hash',
    'blockHash': 'blockHash',
    'input': 'input',
    'from': 'from',
  }

  if (hashNames[params.key]) {
    return params.hashList
  }

  if (typeof params.value === 'function') {
    return params.functionList
  }

  return params.propsList
}

function filterProps(prop) {
  const evmResponses = {
    '_eth': '_eth',
    'abi': 'abi',
    'allEvents': 'allEvents',
    'to': 'to',
    'value': 'value',
    'blockNumber': 'blockNumber',
    'address': 'address',
    'transactionHash': 'transactionHash',
  }

  return evmResponses[prop]
}

function createContractElement(contractFunc, contractName, container) {
  switch (typeof contractFunc[1]) {
    case 'function':
      return createContractFunction(contractFunc, container)
    default:
      return createContractPropType(contractFunc, 'P')
  }
}

function createContractFunction(contractFunc, container) {
  const btn = document.createElement('BUTTON')
  btn.innerText = contractFunc[0]
  btn.className = 'mui-btn mui-btn--primary mui-col-md-2'
  btn.addEventListener('click', () => {
    const div = document.createElement('DIV')
    div.className = 'mui-col-md-3'
    div.innerHTML = `
      <strong>Return Value:</strong> "${contractFunc[1]()}"
    `

    container.appendChild(div)
  })

  return btn
}

function createContractPropType(contractProp, element) {
  const propName = contractProp[0]
  const hashesNames = {
    'hash': 'hash', 
    'blockHash': 'blockHash',
    'input': 'input',
    'from': 'from',
  }
  
  if (hashesNames[propName]) { 
    return renderPropType(propName, contractProp[1], 'LI', '')
  } else {
    return renderPropType(propName, contractProp[1], 'P', 'mui-col-md-2 mui-panel')
  }
}

function renderPropType(hashName, hashValue, element, className) {
  const newElement = document.createElement(element)
  const value = hashName === 'input' 
    ? `<br /><textarea style="width: 1000px;">${hashValue}</textarea>`
    : hashValue
    
  newElement.className = className
  newElement.innerHTML = `<br /><strong>${hashName}</strong>: ${value}`

  return newElement  
}
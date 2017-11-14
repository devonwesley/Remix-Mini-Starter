let compiler
let optimize = 1
let compiledContract

window.onload = function () {
  document.getElementById('versions').onchange = loadSolcVersion

  if (typeof BrowserSolc == 'undefined') {
    console.log('You have to load browser-solc.js in the page. We recommend using a <script> tag.')
    throw new Error()
  }

  status('Loading Compiler Versions.')

  BrowserSolc.getVersions(function (soljsonSources, soljsonReleases) {
    populateVersions(soljsonSources)
    setVersion(soljsonReleases['0.4.18'])
    loadSolcVersion()
  })

  addCompileEvent()
}

function loadSolcVersion() {
  status(`Loading Solc: ${getVersion()}`)
  BrowserSolc.loadVersion(getVersion(), function (c) {
    status('Solc loaded.')
    compiler = c
  })
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
  status('Compiling contract...')
  compiledContract = compiler.compile(getSourceCode(), optimize)

  if (compiledContract) setCompileButtonState(false)

  renderContractList()  
  status('Compile Complete.')
}

function getSourceCode() {
  return document.getElementById('source').value
}

function setCompileButtonState(state) {
  document.getElementById('contract-compile').disabled = state
}

function renderContractList() {
  const contractListContainer = document.getElementById('contract-list')
  const { contracts } = compiledContract

  Object.keys(contracts).forEach((contract, index) => {
    let contractLabel = `contract-id-${index}`
    contractListContainer.appendChild(
      createContractInfo(contracts[contract], contract, contractLabel)
    )
    
    attachDetailsEventHandler(contract, contracts[contract], contractLabel)
  })
}

function createContractInfo(contract, contractName, label) {
  const el = document.createElement('DIV')

  el.innerHTML = `
    <div class="mui-panel">
      <div class="mui-row">
        <div class="mui-col-md-4">
          Contract Name: <strong>${contractName.substring(1, contractName.length)}</strong>
        </div>
        <div class="mui-col-md-3">
          Gas Estimate: <strong style="color: green;">
            ${sumArrayOfInts(contract.gasEstimates.creation)}
          </strong>
        </div>
        <div class="mui-col-md-5">
          <button
            id="${label}"
            class="mui-btn mui-btn--small mui-btn--primary mui-btn--raised"
            style="float: right;" 
            >
              Details
          </button>
        </div>
      </div>
    </div>
  `

  return el
}

function sumArrayOfInts(array) {
  return array.reduce((acc, el) => (acc += el), 0)
}

function attachDetailsEventHandler(name, contract, label) {
  document
    .getElementById(label)
    .onclick = () => renderContractDetails(name, contract)
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
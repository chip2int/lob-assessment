const fs = require('fs')
const jsonData = 'data/addresses.json'

class Node {
    constructor(value) {
        this.value = value
        this.children = {}
    }
}

class AddressBook {
    constructor() {
        this.addresses = {}
        this.states = {}
    }

    _addAddressNode(node, address) {
        const value = address[0]
        if (!value) {
            node.children[-1] = undefined
            return
        }
        if (!node.children[value]) {
            node.children[value] = new Node(value)
        }
        this._addAddressNode(node.children[value], address.substring(1))
    }

    _addAddresses() {
        for (let i in this.addresses) {
            const address = this.addresses[i]
            if (this.states[address.state]) {
                if (!this.states[address.state][address.zip]) {
                    this.states[address.state][address.zip] = new Node('')
                }
                let line = address.line1
                if (address.line2) {
                    line += ' ' + address.line2
                }
                this._addAddressNode(this.states[address.state][address.zip], line)
            } else {
                this.states[address.state] = {}
                this.states[address.state][address.zip] = new Node('')
                let line = address.line1
                if (address.line2) {
                    line += ' ' + address.line2
                }
                this._addAddressNode(this.states[address.state][address.zip], line)
            }
        }
    }

    // Main function to load addresses into the tree
    loadAddresses() {
        try {
            const data = fs.readFileSync(jsonData, 'utf8')
            this.addresses = JSON.parse(data)
            this._addAddresses()
        } catch (err) {
            console.log(`Error reading file from disk: ${err}`)
        }
    }

    _getAddressesForNode(node) {
        let retValues = []
        if (!node) {
            return ""
        }

        for (let i in node.children) {
            retValues.push(this._getAddressesForNode(node.children[i]))
        }
        retValues = retValues.flat()
        for (let i = 0; i < retValues.length; i++) {
            retValues[i] = node.value + retValues[i]
        }
        return retValues
    }

    _getAddressForState(state, s) {
        const addresses = []
        for (let zip in state) {
            const address = this._getAddressForZip(state[zip], s)
            if (!address || address.length == 0) {
                continue
            }
            addresses.push(address.map(a => `${a}, ${zip}`))
        }

        return addresses.flat()
    }

    _getAddressForZip(node, s) {
        if (!s) {
            return this._getAddressesForNode(node)
        }
        if (!node.children[s[0]]) {
            return ''
        }
        return this._getAddressForZip(node.children[s[0]], s.substring(1))
    }

    // Main function to get the addresses matching an input prefix
    getAddresses(s) {
        const addresses = []

        for (let state in this.states) {
            const address = this._getAddressForState(this.states[state], s)
            if (!address || address.length === 0) {
                continue
            }
            addresses.push(address.map(a => `${s.substring(0, s.length-1)}${a}, ${state}`))
        }

        if (this.states[s.toUpperCase()]) {
            const stateName = s.toUpperCase()
            const state = this.states[stateName]
            const address = this._getAddressForState(state, '')
            if (address) {
                addresses.push(address.map(a => `${a}, ${stateName}`))
            }
        }
        return addresses.flat()
    }
}

module.exports = AddressBook
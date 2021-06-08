const fs = require('fs')
const express = require('express')
const app = express()
const AddressBook = require('./lib/addressTree.js')

app.get('/', function(req, res) {
    res.send('hello world')
})

app.get('/address', function(req, res) {
    if (!req.query) {
        // Send all the addresses
    } else {
        const searchString = req.query.s
        try {
            const addresses = addressBook.getAddresses(searchString)
            res.status(200).send(addresses)
        } catch (e) {
            res.status(500).send('Error retrieving messages')
        }
    }
})

const addressBook = new AddressBook()
addressBook.loadAddresses()
app.listen(3000)
import BigInteger from 'bigi'

import { BigNumber } from 'bignumber.js'
import * as bitcoin from 'bitcoinjs-lib'
import bitcoinMessage from 'bitcoinjs-message'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { btc, request, constants, api } from 'helpers'
import { Keychain } from 'keychain.js'
import actions from 'redux/actions'
import config from 'app-config'


const validateData = (data) => {
  if (!data) return false
  if (!data.currency) return false
  if (!data.toAddress) return false
  if (!data.fromAddress) return false
  if (!data.amount) return false
  

  return true
}

const addInvoice = (data) => {
  const { user: { btcData } } = getState()

  if (!validateData(data)) return false

  const requestData = {
    currency    : data.currency,
    toAddress   : data.toAddress,
    fromAddress : data.fromAddress,
    amount      : data.amount,
    label       : (data.label) ? data.label : '',
    address     : btcData.address,
    pubkey      : btcData.publicKey.toString('hex'),
    mainnet     : (btc.network==bitcoin.networks.mainnet),
    destination : (data.destination) ? data.destination : '',
  }

  return request.post(`${config.api.invoiceApi}/invoice/push/`, {
    body: requestData
  })
}

const cancelInvoice = (invoiceId) => new Promise((resolve) => request.post(`${config.api.invoiceApi}/invoice/cancel/`,
  {
    body: {
      invoiceId,
    },
  })
  .then((res) => {
    resolve(res && res.answer && res.answer === 'ok')
  })
  .catch(() => { resolve(false) }))

const markInvoice = (invoiceId, mark, txid) => new Promise((resolve) => request.post(`${config.api.invoiceApi}/invoice/mark/`,
  {
    body: {
      invoiceId,
      mark,
      txid,
    },
  })
  .then((res) => {
    resolve(res && res.answer && res.answer === 'ok')
  })
  .catch(() => { resolve(false) }))


const getInvoices = (data) => {
  const { user: { btcData } } = getState()
  if (!data || !data.currency || !data.address) return false

  return new Promise((resolve) => {

    return request.post(`${config.api.invoiceApi}/invoice/fetch/`, {
      body: {
        currency: data.currency,
        address: data.address,
        mainnet: (btc.network==bitcoin.networks.mainnet),
      }
    }).then((res) => {
      if (res && res.answer && res.answer === 'ok') {
        const transactions = res.items.map((item) => {
          const direction = item.toAddress === data.address ? 'in' : 'out'

          return ({
            type: data.currency.toLowerCase(),
            txType: 'INVOICE',
            invoiceData: item,
            hash: 'no hash',
            confirmations: 1,
            value: item.amount,
            date: item.utx * 1000,
            direction: direction,
          })
        })

        resolve(transactions)
      } else {
        resolve([])
      }
    })
    .catch(() => {
      resolve([])
    })
  })
}

export default {
  addInvoice,
  getInvoices,
  cancelInvoice,
  markInvoice,
}

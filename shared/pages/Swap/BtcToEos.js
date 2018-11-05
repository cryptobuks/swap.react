import crypto from 'crypto'
import bitcoin from 'bitcoinjs-lib'
import React, { Component, Fragment } from 'react'

import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import TransactionLink from 'components/Href/TransactionLink'
import { TimerButton, Button } from 'components/controls'

import Timer from './Timer/Timer'
import { FormattedMessage } from 'react-intl'


export default class BtcToEos extends Component {
  constructor({ swap }) {
    super()

    this.swap = swap

    this.state = {
      flow: this.swap.flow.state,
      isSubmitted: false,
      enabledButton: false,
    }
  }

  componentWillMount() {
    this.swap.on('state update', this.handleFlowStateUpdate)
  }

  componentWillUnmount() {
    this.swap.off('state update', this.handleFlowStateUpdate)
  }

  handleFlowStateUpdate = (values) => {
    this.setState({
      flow: values,
    })
  }

  submitSecret = () => {
    const fromHexString = hexString =>
      new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))

    const hash = (secret) => bitcoin.crypto.sha256(fromHexString(secret))

    const secret = crypto.randomBytes(32).toString('hex')
    const secretHash = hash(secret).toString('hex')

    this.swap.events.dispatch('submit secret', { secret, secretHash })

    this.setState({
      isSubmitted: true,
    })
  }

  render() {
    const { children } = this.props
    const { flow, isSubmitted, enabledButton } = this.state

    return (
      <div>
        <Fragment>
          <FormattedMessage id="BtcToEos63" defaultMessage="1. Generate secret key">
            {message => <h3>{message}</h3>}
          </FormattedMessage>
          {
            !isSubmitted &&
            <TimerButton brand onClick={this.submitSecret}>
              <FormattedMessage id="BtcToEos67" defaultMessage="Send secret" />
            </TimerButton>
          }
          {
            flow.secret && flow.secretHash &&
            <Fragment>
              <div>
                <FormattedMessage id="BtcToEos74" defaultMessage="Secret:" />
                <strong>{flow.secret.toString('hex')}</strong>
              </div>
              <div>
                <FormattedMessage id="BtcToEos77" defaultMessage="Hash:" />
                <strong>{flow.secretHash.toString('hex')}</strong>
              </div>
            </Fragment>
          }
        </Fragment>

        {
          flow.step >= 2 &&
          <Fragment>
            <FormattedMessage id="BtcToEos87" defaultMessage="2. Fund BTC script">
              {message => <h3>{message}</h3>}
            </FormattedMessage>
            {
              flow.createTx === null && <InlineLoader />
            }
            {
              flow.createTx !== null && <TransactionLink type="BTC" id={flow.createTx} />
            }
          </Fragment>
        }
        {
          flow.step >= 3 &&
          <Fragment>
            <FormattedMessage id="BtcToEos101" defaultMessage="3. Request to open EOS contract">
              {message => <h3>{message}</h3>}
            </FormattedMessage>
            {
              flow.openTx === null && <InlineLoader />
            }
            {
              flow.openTx !== null && <TransactionLink type="EOS" id={flow.openTx} />
            }
          </Fragment>
        }
        {
          flow.step >= 4 &&
          <Fragment>
            <FormattedMessage id="BtcToEos115" defaultMessage="4. Withdraw EOS from contract">
              {message => <h3>{message}</h3>}
            </FormattedMessage>
            {
              flow.eosWithdrawTx === null && <InlineLoader />
            }
            {
              flow.eosWithdrawTx !== null && <TransactionLink type="EOS" id={flow.eosWithdrawTx} />
            }
            <div style={{ display: 'flex', alignItems: 'center' }}>
              { enabledButton && !flow.btcWithdrawTx &&
                <Button brand onClick={this.tryRefund}>
                  <FormattedMessage id="BtcToEos126" defaultMessage="TRY REFUND" />
                </Button>
              }
              <div>
                <Timer lockTime={flow.scriptValues.lockTime * 1000} enabledButton={() => this.setState({ enabledButton: true })} />
              </div>
            </div>
          </Fragment>
        }
        {
          flow.step >= 5 &&
          <Fragment>
            <FormattedMessage id="BtcToEos140" defaultMessage="5. Request to withdraw BTC from script">
              {message => <h3>{message}</h3>}
            </FormattedMessage>
            {
              flow.btcWithdrawTx === null && <InlineLoader />
            }
            {
              flow.btcWithdrawTx !== null && <TransactionLink type="BTC" id={flow.btcWithdrawTx} />
            }
          </Fragment>
        }

        <br />
        { children }
      </div>
    )
  }
}

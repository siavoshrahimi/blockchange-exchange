import {EVM_REVERT, tokens ,ETHER_ADDRESS, ether} from "./helpers";

const Exchange = artifacts.require('./Exchange');
const Token = artifacts.require('./Token');

require('chai')
    .use(require('chai-as-promised'))
    .should()



contract('Exchange', accounts => {

    const [deployer, feeAccount, user1, user2] = accounts;

    const feePercent = 10;
    let token;
    let exchange;
    beforeEach(async () => {
        //deploy token
        token = await Token.new();

        //deploy exchange
        exchange = await Exchange.new(feeAccount, feePercent);

        //transfer some tokens to user1
        token.transfer(user1, tokens(100), {from: deployer});
    })

    describe('deployment', async () => {
        it('tracks the fee account', async () => {
            const result = await exchange.feeAccount();
            result.should.equal(feeAccount)
        });
        it('tracks the fee percent', async () => {
            const result = await exchange.feePercent();
            result.toString().should.equal(feePercent.toString())
        });
    })

    describe('fallback', async () => {
        it('reverts when Ether is sent', async () => {
            await exchange.sendTransaction({value: 1, from: user1}).should.be.rejectedWith(EVM_REVERT);
        });
    })

    describe('depositing Ether', async () => {
        let result;
        let amount;

        beforeEach(async () => {
            amount = ether(1)
            result = await exchange.depositEther({from: user1, value: amount})
        })

        it('tracks the ether deposits', async () => {
            const balance = await exchange.tokens(ETHER_ADDRESS, user1);
            balance.toString().should.equal(amount.toString())
        });

        it('emits a deposit event', async () => {
            const log = result.logs[0];
            log.event.should.equal('Deposit')
            const event = log.args;
            event.token.toString().should.equal(ETHER_ADDRESS, 'token address is correct');
            event.user.toString().should.equal(user1, 'user is correct');
            event.amount.toString().should.equal(amount.toString(), 'amount is correct');
            event.balance.toString().should.equal(amount.toString(), 'balance is correct');

        });

    })

    describe('withdrawEther', async () => {
        let result;
        let amount = ether(1);

        beforeEach(async () => {
            //deposit Ether first
            await exchange.depositEther({from: user1, value: amount})
        })

        describe('success', async () => {
            beforeEach(async () => {
                //withdraw Ether
                result = await exchange.withdrawEther({from: user1, value:amount})
            })

            it('withdraw Ether funds', async () => {
                const balance = await exchange.tokens(ETHER_ADDRESS, user1);
                balance.toString().should.equal('0')
            });

            it('emits a withdraw event', async () => {
                const log = result.logs[0];
                log.event.should.equal('Withdraw')
                const event = log.args;
                event.token.toString().should.equal(ETHER_ADDRESS, 'token address is correct');
                event.user.toString().should.equal(user1, 'user is correct');
                event.amount.toString().should.equal(amount.toString(), 'amount is correct');
                event.balance.toString().should.equal('0', 'balance is correct');
            });
        })

        describe('failure', async () => {
            it('rejects withdraws for insufficient balance', async () => {
                await exchange.withdrawEther({from: user1, value:ether(100)}).should.be.rejected;
            });
        })
    })

    describe('depositing tokens', async () => {

        let result;
        let amount;


        describe('success', async () => {

            beforeEach(async () => {
                amount = tokens(10);
                await token.approve(exchange.address, amount, {from: user1})
                result = await exchange.depositToken(token.address, amount, {from: user1})
            })

            it('tracks the token deposit', async () => {
                let balance = await token.balanceOf(exchange.address)
                balance.toString().should.equal(amount.toString())

                balance = await exchange.tokens(token.address, user1);
                balance.toString().should.equal(amount.toString());
            });

            it('emits a deposit event', async () => {
                const log = result.logs[0];
                log.event.should.equal('Deposit')
                const event = log.args;
                event.token.toString().should.equal(token.address, 'token address is correct');
                event.user.toString().should.equal(user1, 'user is correct');
                event.amount.toString().should.equal(amount.toString(), 'amount is correct');
                event.balance.toString().should.equal(amount.toString(), 'balance is correct');

            });
        })

        describe('failure', async () => {

            amount = tokens(10);

            it('rejects Ether deposit', async () => {
                await exchange.depositToken(ETHER_ADDRESS, amount, {from: user1}).should.be.rejectedWith(EVM_REVERT)
            });

            it('fails when no tokens are approved', async () => {
                //don't approve any tokens before depositing
                await exchange.depositToken(token.address, amount, {from: user1}).should.be.rejected;
            });
        })


    })

    describe('withdraw tokens', async () => {
        let amount = tokens(10);
        let result;

        beforeEach(async () => {
            // approve for depositing
            await token.approve(exchange.address, amount, {from: user1})
        })
        describe('success', async () => {

            beforeEach(async () => {
                //deposit token first
                await exchange.depositToken(token.address, amount, {from: user1})
                result = await exchange.withdrawToken(token.address, amount, {from: user1});
            })


            it('withdraw Token funds', async () => {
                let balance;
                balance = await exchange.tokens(token.address, user1);
                balance.toString().should.equal('0');

                balance = await token.balanceOf(user1);
                balance.toString().should.equal(tokens(100).toString());
            });
            it('emits a withdraw event', async () => {
                const log = result.logs[0];
                log.event.should.equal('Withdraw')
                const event = log.args;
                event.token.toString().should.equal(token.address, 'token address is correct');
                event.user.toString().should.equal(user1, 'user is correct');
                event.amount.toString().should.equal(amount.toString(), 'amount is correct');
                event.balance.toString().should.equal('0', 'balance is correct');
            });

        })
        describe('failure', async () => {
            it('rejects withdraws for insufficient balance', async () => {
                await exchange.withdrawToken(token.address, tokens(1000), {from: user1}).should.be.rejectedWith(EVM_REVERT);
            })
            it('rejects Ether withdraw', async () => {
                await exchange.withdrawToken(ETHER_ADDRESS, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT)
            });
        })
    })

    describe('checking balances', async () => {
        beforeEach(async () => {
            await exchange.depositEther({from: user1, value: ether(1)});
        })

        it('returns user balance', async () => {
            const result = await exchange.balanceOf(ETHER_ADDRESS, user1);
            result.toString().should.equal(ether(1).toString())

        });
    })

    describe('making orders', async () => {
        let result;

        beforeEach(async () => {
            result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {from: user1})
        })

        it('tracks the newly created orders', async () => {
            const orderCount = await exchange.orderCount();
            orderCount.toString().should.equal('1');
            const order = await exchange.orders('1');
            order.id.toString().should.equal('1', 'id is correct');
            order.user.should.equal(user1, 'user is correct');
            order.tokenGet.should.equal(token.address, 'token get is correct');
            order.amountGet.toString().should.equal(tokens(1).toString(), 'amount of token get is correct');
            order.tokenGive.should.equal(ETHER_ADDRESS, 'token give is correct');
            order.amountGet.toString().should.equal(ether(1).toString(), 'amount of token get is correct');
            order.timestamp.toString().length.should.be.at.least(1, 'timestamp is present');
        });
        it('emits a Order event', async () => {
            const log = result.logs[0];
            log.event.should.equal('Order')
            const event = log.args;
            event.id.toString().should.equal('1', 'id is correct');
            event.user.should.equal(user1, 'user is correct');
            event.tokenGet.should.equal(token.address, 'token get is correct');
            event.amountGet.toString().should.equal(tokens(1).toString(), 'amount of token get is correct');
            event.tokenGive.should.equal(ETHER_ADDRESS, 'token give is correct');
            event.amountGet.toString().should.equal(ether(1).toString(), 'amount of token get is correct');
            event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present');
        })

    })

    describe('order action', async () => {

        beforeEach(async () =>{
            //user1 deposit ether
            await exchange.depositEther({from:user1, value:ether(1)});
            //give tokens to user2
            await token.transfer(user2, tokens(100), {from:deployer});
            //user2 deposit tokens
            await token.approve(exchange.address, tokens(2), {from:user2});
            await exchange.depositToken(token.address, tokens(2), {from:user2});
            //user1 makes an order to buy token with Ether
            await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {from: user1})
        })

        describe('filling orders' , async () =>{
            let result;

            describe('success', async ()=>{
                beforeEach(async ()=>{
                    //user2 fill order
                    result = await exchange.fillOrder('1', {from:user2})
                })

                it('executes the trade and charge fees', async () => {
                    let balance;
                    balance = await exchange.tokens(token.address, user1);
                    balance.toString().should.equal(tokens(1).toString(), 'user1 received tokens');

                    balance = await exchange.tokens(ETHER_ADDRESS, user2);
                    balance.toString().should.equal(ether(1).toString(), 'user2 received Ether');

                    balance = await exchange.tokens(ETHER_ADDRESS, user1);
                    balance.toString().should.equal('0', 'user1 Ether deducted');

                    balance = await exchange.tokens(token.address, user2)
                    balance.toString().should.equal(tokens(0.9).toString(), 'user2 tokens deducted with fee applied')

                    const feeAccount = await exchange.feeAccount();
                    balance = await exchange.tokens(token.address, feeAccount);
                    balance.toString().should.equal(tokens(0.1).toString(), 'feeAccount received fee')
                });

                it('updates fill orders', async () => {
                    const orderFilled = await exchange.orderFilled(1);
                    orderFilled.should.equal(true);
                });

                it('emits a trade event', async () => {
                    const log = result.logs[0];
                    log.event.should.equal('Trade');
                    const event = log.args;
                    event.id.toString().should.equal('1', 'id is correct');
                    event.user.should.equal(user1, 'user is correct');
                    event.tokenGet.should.equal(token.address, 'token get is correct');
                    event.amountGet.toString().should.equal(tokens(1).toString(), 'amount of token get is correct');
                    event.tokenGive.should.equal(ETHER_ADDRESS, 'token give is correct');
                    event.amountGet.toString().should.equal(ether(1).toString(), 'amount of token get is correct');
                    event.userFill.should.equal(user2, 'userFill is correct');
                    event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present');
                });
            })

            describe('failure' , async ()=>{
                it('rejects invalid order ids', async () => {
                    const invalidOrderId = 9999;
                    await exchange.fillOrder(invalidOrderId, {from: user2}).should.be.rejectedWith(EVM_REVERT);
                });

                it('rejects already-filled orders', async () => {
                    //fill the order
                    await exchange.fillOrder('1', {from:user2}).should.be.fulfilled;
                    //try to fill it again
                    await exchange.fillOrder('1', {from:user2}).should.be.rejectedWith(EVM_REVERT);
                });

                it('rejects cancelled orders', async () => {
                    //cancel the order
                    await exchange.cancelOrder('1', {from:user1}).should.be.fulfilled;
                    //try to fill the order
                    await exchange.fillOrder('1', {from:user2}).should.be.rejectedWith(EVM_REVERT);
                });
            })
        })

        describe('cancelling orders', async () => {
            let result;

            describe('success', async () => {
                beforeEach(async () => {
                    result = await exchange.cancelOrder(1, {from: user1})
                })

                it('updates cancelled orders', async () => {
                    const orderCancelled = await exchange.cancelledOrders(1);
                    orderCancelled.should.equal(true);
                });

                it('emits a Cancel event', function () {
                    const log = result.logs[0];
                    log.event.should.equal('Cancel');
                    const event = log.args;
                    event.id.toString().should.equal('1', 'id is correct');
                    event.user.should.equal(user1, 'user is correct');
                    event.tokenGet.should.equal(token.address, 'token get is correct');
                    event.amountGet.toString().should.equal(tokens(1).toString(), 'amount of token get is correct');
                    event.tokenGive.should.equal(ETHER_ADDRESS, 'token give is correct');
                    event.amountGet.toString().should.equal(ether(1).toString(), 'amount of token get is correct');
                    event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present');
                });
            })

            describe('failure' ,async () => {

                it('rejects invalid order ids', async () => {
                    const invalidOrder = 9999;
                    await exchange.cancelOrder(invalidOrder, {from: user1}).should.be.rejectedWith(EVM_REVERT)
                });

                it('rejects unauthorized cancellations ', async () => {
                    //Try to cancel the order from another user
                    await exchange.cancelOrder('1', {from: user2}).should.be.rejectedWith(EVM_REVERT)
                });
            })
        })
    })

})
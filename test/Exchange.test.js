import {EVM_REVERT, tokens ,ETHER_ADDRESS, ether} from "./helpers";

const Exchange = artifacts.require('./Exchange');
const Token = artifacts.require('./Token');

require('chai')
    .use(require('chai-as-promised'))
    .should()



contract('Exchange', accounts =>{

    const [deployer, feeAccount, user1]= accounts;

    const feePercent = 10;
    let token;
    let exchange;
    beforeEach(async() =>{
        //deploy token
        token = await Token.new();

        //deploy exchange
        exchange = await Exchange.new(feeAccount, feePercent);

        //transfer some tokens to user1
        token.transfer(user1, tokens(100), {from: deployer});
    })

    describe('deployment' , () =>{
        it('tracks the fee account',  async () => {
            const result =await exchange.feeAccount();
            result.should.equal(feeAccount)
        });
        it('tracks the fee percent',  async () => {
            const result =await exchange.feePercent();
            result.toString().should.equal(feePercent.toString())
        });
    })

    describe('fallback' , () =>{
        it('reverts when Ether is sent', async () => {
            await exchange.sendTransaction({value:1 , from:user1}).should.be.rejectedWith(EVM_REVERT);
        });
    })

    describe('depositing Ether' , () =>{
        let result;
        let amount;

        beforeEach(async () =>{
            amount = ether(1)
            result = await exchange.depositEther({from:user1 , value:amount})
        })

        it('tracks the ether deposits', async () => {
            const balance = await exchange.tokens(ETHER_ADDRESS , user1);
            balance.toString().should.equal(amount.toString())
        });

        it('emits a deposit event', async () => {
            const log = result.logs[0];
            log.event.should.equal('Deposit')
            const event = log.args;
            event.token.toString().should.equal(ETHER_ADDRESS , 'token address is correct');
            event.user.toString().should.equal(user1, 'user is correct');
            event.amount.toString().should.equal(amount.toString(), 'amount is correct');
            event.balance.toString().should.equal(amount.toString(), 'balance is correct');

        });

    })

    describe('withdrawEther' , () =>{
        let result;
        let amount;

        beforeEach(async ()=>{
            //deposit Ether first
            amount = ether(1);
            await exchange.depositEther( {from:user1 , value:amount})
        })

        describe('success', () =>{
            beforeEach(async () => {
                //withdraw Ether
                result = await exchange.withdrawEther(amount, {from:user1})
            })

            it('withdraw Ether funds', async () => {
                const balance = await exchange.tokens(ETHER_ADDRESS, user1);
                balance.toString().should.equal('0')
            });

            it('emits a deposit event', async () => {
                const log = result.logs[0];
                log.event.should.equal('Withdraw')
                const event = log.args;
                event.token.toString().should.equal(ETHER_ADDRESS , 'token address is correct');
                event.user.toString().should.equal(user1, 'user is correct');
                event.amount.toString().should.equal(amount.toString(), 'amount is correct');
                event.balance.toString().should.equal('0', 'balance is correct');
            });
        })

        describe('failure', () =>{
            it('rejects withdraws for insufficient balance', async () => {
                await exchange.withdrawEther(ether(100), {from:user1}).should.be.rejectedWith(EVM_REVERT);
            });
        })
    })

    describe('depositing tokens' , () =>{

        let result;
        let amount;


        describe('success', () =>{

            beforeEach(async () =>{
                amount = tokens(10);
                await token.approve(exchange.address, amount , {from: user1})
                result = await exchange.depositToken(token.address, amount, {from: user1})
            })

            it('tracks the token deposit', async () => {
                let balance = await token.balanceOf(exchange.address)
                balance.toString().should.equal(amount.toString())

                balance = await exchange.tokens(token.address , user1);
                balance.toString().should.equal(amount.toString());
            });

            it('emits a deposit event', async () => {
                const log = result.logs[0];
                log.event.should.equal('Deposit')
                const event = log.args;
                event.token.toString().should.equal(token.address , 'token address is correct');
                event.user.toString().should.equal(user1, 'user is correct');
                event.amount.toString().should.equal(amount.toString(), 'amount is correct');
                event.balance.toString().should.equal(amount.toString(), 'balance is correct');

            });
        })

        describe('failure', () =>{

            amount =tokens(10);

            it('rejects Ether deposit', async () => {
                await exchange.depositToken(ETHER_ADDRESS, amount, {from: user1}).should.be.rejectedWith(EVM_REVERT)
            });

            it('fails when no tokens are approved', async () => {
                //don't approve any tokens before depositing
                await exchange.depositToken(token.address, amount, {from: user1}).should.be.rejected;
            });
        })


    })

})
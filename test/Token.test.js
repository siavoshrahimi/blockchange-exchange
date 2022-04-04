import {EVM_REVERT, tokens} from "./helpers";

const Token = artifacts.require('./Token');

require('chai')
    .use(require('chai-as-promised'))
    .should()



contract('Token', accounts =>{

    const name = 'DApp Token';
    const symbol = 'DAPP';
    const decimals = '18';
    const totalSupply = tokens(1000000).toString();
    const [deployer,receiver, exchange]= accounts;
    let token;
    beforeEach(async() =>{
        token = await Token.new();
    })

    describe('deployment' , () =>{
        it('tracks the name',  async () => {
            const result =await token.name();
            result.should.equal(name)
        });

        it('tracks the symbol', async () => {
            const result =await token.symbol();
            result.should.equal(symbol)
        });

        it('tracks the decimals', async () => {
            const result =await token.decimals();
            result.toString().should.equal(decimals)
        });

        it('tracks the total supply', async () => {
            const result =await token.totalSupply();
            result.toString().should.equal(totalSupply)
        });

        it('assign total supply to the deployer',async () => {
            const result = await token.balanceOf(deployer);
            result.toString().should.equal(totalSupply);
        });
    })
    describe('sending tokens' , async ()=>{
        let amount;
        describe('success' , ()=>{
            let result;
            beforeEach(async () =>{
                amount = tokens(100);
                result = await token.transfer(receiver , amount,{from:deployer});
            })

            it('transfers token balances', async () => {
                const balance = await token.balanceOf(receiver);
                balance.toString().should.equal(tokens(100).toString())
            });

            it('emits a transfer event', async () => {
                const log = result.logs[0];
                log.event.should.equal('Transfer')
                const event = log.args;
                event.from.toString().should.equal(deployer , 'from is correct')
                event.to.toString().should.equal(receiver, 'to is correct');
                event.value.toString().should.equal(amount.toString(), 'value is correct');
            });
        })
        describe('failure' , async ()=>{

            it('rejects insufficient balances', async () => {
                let invalidAmount;
                invalidAmount = tokens(100000000) //100 million - greater than total supply
                await token.transfer(receiver, invalidAmount, {from:deployer}).should.be.rejectedWith(EVM_REVERT)

                //Attempt transfer tokens, when you have none
                invalidAmount = tokens(10) // recipient has no any tokens
                await token.transfer(deployer, invalidAmount, {from:receiver}).should.be.rejectedWith(EVM_REVERT)
            });

            it('rejects invalid recipients', async () => {
                await token.transfer(0x0 , amount , {from:deployer}).should.be.rejected;
            });

        })
    })

    describe('approving tokens' , ()=>{
        let result;
        let amount;

        beforeEach(async () =>{
            amount = tokens(100)
            result = await token.approve(exchange, amount, {from:deployer});
        })

        describe('success' , () =>{
            it('allocates an allowance for delegated token spending', async () => {
                const allowance = await token.allowance(deployer , exchange);
                allowance.toString().should.equal(amount.toString());
            });
            it('emits a approve event', async () => {
                const log = result.logs[0];
                log.event.should.equal('Approve')
                const event = log.args;
                event.owner.toString().should.equal(deployer , 'owner is correct')
                event.spender.toString().should.equal(exchange, 'spender is correct');
                event.value.toString().should.equal(amount.toString(), 'value is correct');
            });
        })
        describe('failure' , () =>{
            it('rejects insufficient balances', async () => {
                let invalidAmount;
                invalidAmount = tokens(100000000) //100 million - greater than total supply
                await token.approve(exchange, invalidAmount, {from:deployer}).should.be.rejectedWith(EVM_REVERT)
            });

            it('rejects invalid spender', async () => {
               await token.approve(0x0 , amount , {from:deployer}).should.be.rejected;
            });
        })
    })

    describe('delegated token transfers' , async ()=>{
        let amount;
        let result;

        beforeEach(async ()=>{
            amount = tokens(100);
            await token.approve(exchange, amount, {from:deployer});
        })

        describe('success' , ()=>{
            beforeEach(async () =>{
                result = await token.transferFrom(deployer , receiver , amount, {from:exchange});
            })

            it('transfers token balances', async () => {
                const balance = await token.balanceOf(receiver);
                balance.toString().should.equal(tokens(100).toString())
            });

            it('resets allowance', async () => {
                const allowance = await token.allowance(deployer, exchange);
                allowance.toString().should.equal('0')
            });

            it('emits a transfer event', async () => {
                const log = result.logs[0];
                log.event.should.equal('Transfer')
                const event = log.args;
                event.from.toString().should.equal(deployer , 'from is correct')
                event.to.toString().should.equal(receiver, 'to is correct');
                event.value.toString().should.equal(amount.toString(), 'value is correct');
            });
        })
        describe('failure' , async ()=>{

            it('rejects insufficient balances', async () => {
                let invalidAmount;
                invalidAmount = tokens(100000000) //100 million - greater than total supply
                await token.transferFrom(deployer,receiver, invalidAmount, {from:exchange}).should.be.rejectedWith(EVM_REVERT)

                //Attempt transfer tokens, when you have none
                invalidAmount = tokens(10) // recipient has no any tokens
                await token.transferFrom(receiver,deployer, invalidAmount, {from:exchange}).should.be.rejectedWith(EVM_REVERT)
            });

            it('rejects invalid recipients', async () => {
                await token.transferFrom(deployer, 0x0 , amount , {from:exchange}).should.be.rejected;
            });

        })
    })



})
use anchor_lang::prelude::*;

declare_id!("BuCjjPVBgDZKybCXtCTu9hMUQMWLNNURZzASDE5Cy7X9");

#[program]
pub mod serialize_txs_anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        // setting some value to the account 😈
        ctx.accounts.some_account.field = 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(init, payer = payer, space = 8 + SomeAccount::LEN)]
    pub some_account: Account<'info, SomeAccount>,

    pub system_program: Program<'info, System>
}

#[account]
pub struct SomeAccount {
    pub field: u8
}

impl SomeAccount {
    const LEN: usize = 1;
}

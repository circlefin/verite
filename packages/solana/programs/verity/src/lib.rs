use anchor_lang::prelude::*;

use solana_program::{
    secp256k1_recover::{Secp256k1Pubkey, secp256k1_recover},
    keccak
};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod verity {
    use super::*;
    pub fn initialize(_ctx: Context<Initialize>) -> ProgramResult {     
        Ok(())
    }

    pub fn verify(_ctx: Context<Verify>, signature: [u8; 64], recovery_id: u8, message: String) -> ProgramResult {
        // Log parameters to assist debugging
        msg!("Signature {:?}", signature);
        msg!("Recovery Id: {}", recovery_id);
        msg!("Message: {}", message);

        // Assume this is the verifier
        let eth_address = [
            132,  13, 245, 117, 107,  89, 226, 100, 189, 117,
            164, 237, 253,  81, 149, 203,  12, 190, 180, 209,
            204,  79, 154,  35, 109, 129, 227, 187, 234, 225,
            127, 113, 115,  58, 238, 247,  53, 140, 186, 122,
            166,  74, 243,  30, 169, 216, 133, 198,  86, 249,
            202, 166,   3, 100, 188, 127, 136,  15, 119, 187,
            214,  19,  33,  12
        ];
        let pubkey = Secp256k1Pubkey(eth_address);
        msg!("Pubkey: {:?}", pubkey.to_bytes());

        let hash = keccak::hash(message.as_ref());
        msg!("Hash: {}", hash);

        let result = secp256k1_recover(hash.as_ref(), recovery_id, signature.as_ref());
        msg!("Recovered: {:?}", result.clone().unwrap().to_bytes());

        require!(result.is_ok(), ErrorCode::NotOk);
        require!(result.unwrap() == pubkey, ErrorCode::Invalid);

        // Err(ErrorCode::Invalid.into())
        Ok(())
    }

}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct Verify {}

#[error]
pub enum ErrorCode {
    NotOk,
    Invalid,
}
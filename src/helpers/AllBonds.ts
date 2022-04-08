import { StableBond, LPBond, NetworkID, CustomBond } from "src/lib/Bond";
import { addresses } from "src/constants";

import { ReactComponent as DaiImg } from "src/assets/tokens/DAI.svg";
import { ReactComponent as PidLusdImg } from "src/assets/tokens/OHM-DAI.svg";
import { ReactComponent as OhmDaiImg } from "src/assets/ohm/logo.svg";
import { ReactComponent as FraxImg } from "src/assets/tokens/FRAX.svg";
import { ReactComponent as OhmFraxImg } from "src/assets/tokens/OHM-FRAX.svg";
import { ReactComponent as OhmLusdImg } from "src/assets/tokens/OHM-LUSD.svg";
import { ReactComponent as wETHImg } from "src/assets/tokens/wETH.svg";
import { ReactComponent as LusdImg } from "src/assets/tokens/LUSD.svg";

import { abi as FraxOhmBondContract } from "src/abi/bonds/OhmFraxContract.json";
import { abi as BondOhmDaiContract } from "src/abi/bonds/OhmDaiContract.json";
import { abi as BondOhmLusdContract } from "src/abi/bonds/OhmLusdContract.json";
import { abi as DaiBondContract } from "src/abi/bonds/DaiContract.json";
import { abi as ReserveOhmLusdContract } from "src/abi/reserves/OhmLusd.json";
import { abi as ReserveOhmDaiContract } from "src/abi/reserves/OhmDai.json";
import { abi as ReserveOhmFraxContract } from "src/abi/reserves/OhmFrax.json";
import { abi as FraxBondContract } from "src/abi/bonds/FraxContract.json";
import { abi as LusdBondContract } from "src/abi/bonds/LusdContract.json";
import { abi as EthBondContract } from "src/abi/bonds/EthContract.json";
import { abi as MasterChefContract } from "src/abi/MasterChef.json";
import { abi as CLPStakingContract } from "src/abi/CLPStaking.json";
// import ERC20 from "src/lib/ERC20";
import { StaticJsonRpcProvider } from "@ethersproject/providers";

// TODO(zx): Further modularize by splitting up reserveAssets into vendor token definitions
//   and include that in the definition of a bond
export const dai = new StableBond({
  name: "DAI",
  id: 100,
  displayName: "DAI",
  bondToken: "DAI",
  bondIconSvg: DaiImg,
  bondContractABI: DaiBondContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: addresses[NetworkID.Mainnet].BUSDBONDDEPOSITORY_ADDRESS,
      reserveAddress: addresses[NetworkID.Mainnet].DAI_ADDRESS,
    },
    [NetworkID.Testnet]: {
      bondAddress: addresses[NetworkID.Testnet].BUSDBONDDEPOSITORY_ADDRESS, // 0xDea5668E815dAF058e3ecB30F645b04ad26374Cf
      reserveAddress: addresses[NetworkID.Testnet].BUSD_ADDRESS, // 0xB2180448f8945C8Cc8AE9809E67D6bd27d8B2f2C
    },
  },
});

export const eth = new CustomBond({
  name: "bnb",
  id: 101,
  displayName: "wBNB",
  bondToken: "wBNB",
  bondIconSvg: wETHImg,
  bondContractABI: EthBondContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0xe15700FbBa4435F061a1CA9d6746BB5773eB4400",
      reserveAddress: "0x250632378e573c6be1ac2f97fcdf00515d0aa91b",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xca7b90f8158A4FAA606952c023596EE6d322bcf0",
      reserveAddress: "0xc778417e063141139fce010982780140aa0cd5ab",
    },
  },
  customTreasuryBalanceFunc: async function (this: CustomBond, networkID, provider) {
    const ethBondContract = this.getContractForBond(networkID, provider);
    let ethPrice = await ethBondContract.assetPrice();
    ethPrice = ethPrice / Math.pow(10, 8);
    const token = this.getContractForReserve(networkID, provider);
    let ethAmount = await token.balanceOf(addresses[networkID].TREASURY_ADDRESS);
    ethAmount = ethAmount / Math.pow(10, 18);
    return ethAmount * ethPrice;
  },
});

export const frax = new StableBond({
  name: "frax",
  id: 102,
  displayName: "FRAX",
  bondToken: "FRAX",
  bondIconSvg: FraxImg,
  bondContractABI: FraxBondContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0x8510c8c2B6891E04864fa196693D44E6B6ec2514",
      reserveAddress: "0x853d955acef822db058eb8505911ed77f175b99e",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xF651283543fB9D61A91f318b78385d187D300738",
      reserveAddress: "0x2F7249cb599139e560f0c81c269Ab9b04799E453",
    },
  },
});

export const lusd = new StableBond({
  name: "lusd",
  id: 103,
  displayName: "LUSD",
  bondToken: "LUSD",
  bondIconSvg: LusdImg,
  bondContractABI: LusdBondContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0x10C0f93f64e3C8D0a1b0f4B87d6155fd9e89D08D",
      reserveAddress: "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0x3aD02C4E4D1234590E87A1f9a73B8E0fd8CF8CCa",
      reserveAddress: "0x45754dF05AA6305114004358eCf8D04FF3B84e26",
    },
  },
});

export const crank_busd = new LPBond({
  name: "crank_busd_lp",
  id: 0,
  displayName: "CRANK/BUSD LP",
  bondToken: "CRANK/BUSD",
  bondIconSvg: OhmDaiImg,
  bondContractABI: MasterChefContract,
  reserveContract: ReserveOhmDaiContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: addresses[NetworkID.Mainnet].LPBONDDEPOSITORY_ADDRESS,
      reserveAddress: addresses[NetworkID.Testnet].LPTOKEN_ADDRESS,
    },
    [NetworkID.Testnet]: {
      bondAddress: addresses[NetworkID.Testnet].LPBONDDEPOSITORY_ADDRESS, // 0xcF449dA417cC36009a1C6FbA78918c31594B9377
      reserveAddress: addresses[NetworkID.Testnet].LPTOKEN_ADDRESS, // 0x8D5a22Fb6A1840da602E56D1a260E56770e0bCE2
    },
  },
  lpUrl:
   `https://pancakeswap.finance/add/${addresses[NetworkID.Mainnet].DAI_ADDRESS}/${addresses[NetworkID.Mainnet].PID_ADDRESS}`,
});

export const bnb_dxtc = new LPBond({
  name: "bnb_dxtc_lp",
  id: 1,
  displayName: "BNB/DXTC LP",
  bondToken: "BNB/DXTC",
  bondIconSvg: OhmLusdImg,
  bondContractABI: MasterChefContract,
  reserveContract: ReserveOhmLusdContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0xFB1776299E7804DD8016303Df9c07a65c80F67b6",
      reserveAddress: "0xfDf12D1F85b5082877A6E070524f50F6c84FAa6b",
    },
    [NetworkID.Testnet]: {
      // NOTE (appleseed-lusd): using ohm-dai rinkeby contracts
      bondAddress: "0xdF1ff01315769326643e1C2BD7E0152Adf5820Eb",
      reserveAddress: "0x69ef300c10d76b469ae9978b8705f657893c7b2d",
    },
  },
  lpUrl:
    "https://pancakeswap.finance/add/0x383518188C0C6d7730D91b2c03a03C837814a899/0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
});

export const btc_dxtc = new LPBond({
  name: "btc_dxtc_lp",
  id: 2,
  displayName: "BTC/DXTC LP",
  bondToken: "BTC/DXTC",
  bondIconSvg: OhmFraxImg,
  bondContractABI: MasterChefContract,
  reserveContract: ReserveOhmFraxContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0xc20CffF07076858a7e642E396180EC390E5A02f7",
      reserveAddress: "0x2dce0dda1c2f98e0f171de8333c3c6fe1bbf4877",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xdF1ff01315769326643e1C2BD7E0152Adf5820Eb",
      reserveAddress: "0x57ab9d1c9606f00946bbfb7e90142af587eb46f9",
    },
  },
  lpUrl:
    "https://app.uniswap.org/#/add/v2/0x853d955acef822db058eb8505911ed77f175b99e/0x383518188c0c6d7730d91b2c03a03c837814a899",
});

export const cake_dxtc = new LPBond({
  name: "cake_dxtc_lp",
  id: 3,
  displayName: "CAKE/DXTC LP",
  bondToken: "CAKE/DXTC",
  bondIconSvg: OhmFraxImg,
  bondContractABI: MasterChefContract,
  reserveContract: ReserveOhmFraxContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0xc20CffF07076858a7e642E396180EC390E5A02f7",
      reserveAddress: "0x2dce0dda1c2f98e0f171de8333c3c6fe1bbf4877",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xdF1ff01315769326643e1C2BD7E0152Adf5820Eb",
      reserveAddress: "0x3cb23c7511fd65c064a2e357c2a67e28b828d71b",
    },
  },
  lpUrl:
    "https://app.uniswap.org/#/add/v2/0x853d955acef822db058eb8505911ed77f175b99e/0x383518188c0c6d7730d91b2c03a03c837814a899",
});

export const dxtc_busd = new LPBond({
  name: "dxtc_busd_lp",
  id: 4,
  displayName: "DXTC/BUSD LP",
  bondToken: "DXTC/BUSD",
  bondIconSvg: OhmFraxImg,
  bondContractABI: MasterChefContract,
  reserveContract: ReserveOhmFraxContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0xc20CffF07076858a7e642E396180EC390E5A02f7",
      reserveAddress: "0x2dce0dda1c2f98e0f171de8333c3c6fe1bbf4877",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xdF1ff01315769326643e1C2BD7E0152Adf5820Eb",
      reserveAddress: "0xff84710185b9d642474a83f3cf83b8d5b6313909",
    },
  },
  lpUrl:
    "https://app.uniswap.org/#/add/v2/0x853d955acef822db058eb8505911ed77f175b99e/0x383518188c0c6d7730d91b2c03a03c837814a899",
});

export const ohm_dai = new LPBond({
  name: "XOD-DAI",
  id: 5,
  displayName: "BTCB/BUSD LP",
  bondToken: "PID-DAI",
  bondIconSvg: PidLusdImg,
  bondContractABI: MasterChefContract,
  reserveContract: ReserveOhmFraxContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0xc20CffF07076858a7e642E396180EC390E5A02f7",
      reserveAddress: "0x2dce0dda1c2f98e0f171de8333c3c6fe1bbf4877",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xdF1ff01315769326643e1C2BD7E0152Adf5820Eb",
      reserveAddress: "0xc7e2F2C5ae610FBeB674e3C1Eef68Fb6987e5d54",
    },
  },
  lpUrl:
    "https://app.uniswap.org/#/add/v2/0x853d955acef822db058eb8505911ed77f175b99e/0x383518188c0c6d7730d91b2c03a03c837814a899",
});

export const dxtc_usdt = new LPBond({
  name: "DXTC-USDT",
  id: 6,
  displayName: "DXTC/USDT LP",
  bondToken: "DXTC-USDT",
  bondIconSvg: PidLusdImg,
  bondContractABI: CLPStakingContract,
  reserveContract: ReserveOhmFraxContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0xc20CffF07076858a7e642E396180EC390E5A02f7",
      reserveAddress: "0x2dce0dda1c2f98e0f171de8333c3c6fe1bbf4877",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xe3a0E66C8C77e785A3C306827C0a3408357A6B86",
      reserveAddress: "0xf097163AED43dd6f3Bef01132F7F0379E2F0747d",
    },
  },
  lpUrl:
    // "https://app.uniswap.org/#/add/v2/0x853d955acef822db058eb8505911ed77f175b99e/0x383518188c0c6d7730d91b2c03a03c837814a899",
    "https://pancake.kiemtienonline360.com/#/add/0x2816E2D05EA12d790A3Df1A791d532783361ABE2/0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684"
});


export const dxtc_dai = new LPBond({
  name: "DXTC-DAI",
  id: 7,
  displayName: "DXTC/DAI LP",
  bondToken: "DXTC-DAI",
  bondIconSvg: PidLusdImg,
  bondContractABI: CLPStakingContract,
  reserveContract: ReserveOhmFraxContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0xc20CffF07076858a7e642E396180EC390E5A02f7",
      reserveAddress: "0x2dce0dda1c2f98e0f171de8333c3c6fe1bbf4877",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xe3a0E66C8C77e785A3C306827C0a3408357A6B86",
      reserveAddress: "0xb25E9c35c684Ba46A96982CAc8745402f914B6Ae",
    },
  },
  lpUrl:
    // "https://app.uniswap.org/#/add/v2/0x853d955acef822db058eb8505911ed77f175b99e/0x383518188c0c6d7730d91b2c03a03c837814a899",
    "https://pancake.kiemtienonline360.com/#/add/0x2816E2D05EA12d790A3Df1A791d532783361ABE2/0x8a9424745056Eb399FD19a0EC26A14316684e274"
});

export const dxtc_eth = new LPBond({
  name: "DXTC-ETH",
  id: 8,
  displayName: "DXTC/ETH LP",
  bondToken: "DXTC-ETH",
  bondIconSvg: PidLusdImg,
  bondContractABI: CLPStakingContract,
  reserveContract: ReserveOhmFraxContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0xc20CffF07076858a7e642E396180EC390E5A02f7",
      reserveAddress: "0x2dce0dda1c2f98e0f171de8333c3c6fe1bbf4877",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xe3a0E66C8C77e785A3C306827C0a3408357A6B86",
      reserveAddress: "0x7fF3F755d9580f348D0Cf4F18A8e426245791764",
    },
  },
  lpUrl:
    "https://pancake.kiemtienonline360.com/#/add/0x2816E2D05EA12d790A3Df1A791d532783361ABE2/0x8BaBbB98678facC7342735486C851ABD7A0d17Ca"
});

// export const dxtc_doge = new LPBond({
//   name: "DXTC-DOGE",
//   id: 9,
//   displayName: "DXTC/DOGE LP",
//   bondToken: "DXTC-DOGE",
//   bondIconSvg: PidLusdImg,
//   bondContractABI: MasterChefContract,
//   reserveContract: ReserveOhmFraxContract,
//   networkAddrs: {
//     [NetworkID.Mainnet]: {
//       bondAddress: "0xc20CffF07076858a7e642E396180EC390E5A02f7",
//       reserveAddress: "0x2dce0dda1c2f98e0f171de8333c3c6fe1bbf4877",
//     },
//     [NetworkID.Testnet]: {
//       bondAddress: "0xdF1ff01315769326643e1C2BD7E0152Adf5820Eb",
//       reserveAddress: "0xc7e2F2C5ae610FBeB674e3C1Eef68Fb6987e5d54",
//     },
//   },
//   lpUrl:
//     // "https://app.uniswap.org/#/add/v2/0x853d955acef822db058eb8505911ed77f175b99e/0x383518188c0c6d7730d91b2c03a03c837814a899",
//     "https://pancake.kiemtienonline360.com/#/add/0x2816E2D05EA12d790A3Df1A791d532783361ABE2/0x8BaBbB98678facC7342735486C851ABD7A0d17Ca"
// });







// HOW TO ADD A NEW BOND:
// Is it a stableCoin bond? use `new StableBond`
// Is it an LP Bond? use `new LPBond`
// Add new bonds to this array!!
// export const allBonds = [dai, frax, eth, ohm_dai, ohm_frax, lusd, pid_lusd];

export const allBonds = [crank_busd, bnb_dxtc, btc_dxtc, cake_dxtc, dxtc_busd];
export const allCBonds = [dxtc_usdt, dxtc_dai, dxtc_eth];
// export const allBonds:LPBond[]=[]
export const treasuryBalanceAll = async ( networkID: NetworkID, provider: StaticJsonRpcProvider) => {
  return (await Promise.all(allBonds.map(async (item) => {
    // console.error(await item.getTreasuryBalance(networkID,provider))
    // console.error(item.name)
    return await item.getTreasuryBalance(networkID,provider)
  }))).reduce((total,num)=>total + num)
}

export const allBondsMap = allBonds.reduce((prevVal, bond) => {
  return { ...prevVal, [bond.name]: bond };
}, {});

// Debug Log
// console.log({allBonds});
export default allBonds;

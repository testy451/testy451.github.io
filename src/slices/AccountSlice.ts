import { ethers } from "ethers";
import { addresses } from "../constants";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as sOHM } from "../abi/sOHM.json";
import { abi as sOHMv2 } from "../abi/sOhmv2.json";
import { abi as cStaking } from "../abi/CLPStaking.json";
import { abi as fuseProxy } from "../abi/FuseProxy.json";
import { abi as FairLaunch } from "../abi/FairLaunch.json";
import { abi as wsOHM } from "../abi/wsOHM.json";
import IDOAbi from '../abi/ido.json'
import { BigNumber} from 'bignumber.js';
import { error } from "./MessagesSlice";
import { clearPendingTxn, fetchPendingTxns } from "./PendingTxnsSlice";
import { setAll } from "../helpers";

import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { Bond, NetworkID } from "src/lib/Bond"; // TODO: this type definition needs to move out of BOND.
import { RootState } from "src/store";
import { IBaseAddressAsyncThunk, IBaseAllowanceAsyncThunk, ICalcUserBondDetailsAsyncThunk, IJsonRPCError } from "./interfaces";
// import { getBNBprice } from "src/helpers/web3";
import axios from 'axios';

export const getBalances = createAsyncThunk(
  "account/getBalances",
  async ({ address, networkID, provider }: IBaseAddressAsyncThunk) => {
    const ohmContract = new ethers.Contract(addresses[networkID].PID_ADDRESS as string, ierc20Abi, provider);
    const ohmBalance = await ohmContract.balanceOf(address);
    const sohmContract = new ethers.Contract(addresses[networkID].SPID_ADDRESS as string, ierc20Abi, provider);
    const sohmBalance = await sohmContract.balanceOf(address);
    let poolBalance = 0;
    const poolTokenContract = new ethers.Contract(addresses[networkID].PT_TOKEN_ADDRESS as string, ierc20Abi, provider);
    poolBalance = await poolTokenContract.balanceOf(address);

    return {
      balances: {
        ohm: ethers.utils.formatUnits(ohmBalance, "gwei"),
        sohm: ethers.utils.formatUnits(sohmBalance, "gwei"),
        pool: ethers.utils.formatUnits(poolBalance, "gwei"),
      },
    };
  },
);

export const getAprs = createAsyncThunk(
  "account/getAprs",
  async () => {
  
    const adr1 = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c_0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"; // BNB / BUSD
    const adr2 = "0x55d398326f99059fF775485246999027B3197955_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; // USDT / BNB
    const adr3 = "0x12BB890508c125661E03b09EC06E404bc9289040_0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"; // RACA / BUSD
    const adr4 = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82_0x55d398326f99059fF775485246999027B3197955"; // Cake / WBNB
    const adr5 = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82_0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"; // Cake / BUSD
    const adr6 = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82_0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"; // Cake / BUSD
    
    const res_summary = await axios.get("https://api.pancakeswap.info/api/v2/summary");
    const res_pair = await axios.get("https://api.pancakeswap.info/api/v2/pairs");
    const res_token1 = await axios.get("https://api.pancakeswap.info/api/v2/tokens/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c");
    const res_token2 = await axios.get("https://api.pancakeswap.info/api/v2/tokens/0x55d398326f99059fF775485246999027B3197955");
    const res_token3 = await axios.get("https://api.pancakeswap.info/api/v2/tokens/0x12BB890508c125661E03b09EC06E404bc9289040");
    const res_token4 = await axios.get("https://api.pancakeswap.info/api/v2/tokens/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82");
    const res_token5 = await axios.get("https://api.pancakeswap.info/api/v2/tokens/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82");
    const res_token6 = await axios.get("https://api.pancakeswap.info/api/v2/tokens/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82");

    const apr1 = res_summary.data.data[adr1].base_volume * res_token1.data.data.price * 0.17 / res_summary.data.data[adr1].liquidity * 365;
    const apr2 = res_summary.data.data[adr2].base_volume * res_token2.data.data.price * 0.17 / res_summary.data.data[adr2].liquidity * 365;
    const apr3 = res_summary.data.data[adr3].base_volume * res_token3.data.data.price * 0.17 / res_summary.data.data[adr3].liquidity * 365;
    const apr4 = res_summary.data.data[adr4].base_volume * res_token4.data.data.price * 0.17 / res_summary.data.data[adr4].liquidity * 365;
    const apr5 = res_summary.data.data[adr5].base_volume * res_token5.data.data.price * 0.17 / res_summary.data.data[adr5].liquidity * 365;
    const apr6 = res_summary.data.data[adr6].base_volume * res_token6.data.data.price * 0.17 / res_summary.data.data[adr6].liquidity * 365;
    console.log("pancakeswap:", apr1, apr2, apr3, apr4, apr5, apr6);
    let aprs = [];
    aprs.push(apr1);
    aprs.push(apr2);
    aprs.push(apr3);
    aprs.push(apr4);
    aprs.push(apr5);
    aprs.push(apr6);

    return {
      aprs: aprs
    };
  },
);

interface IUserAccountDetails {
  balances: {
    dai: string;
    ohm: string;
    sohm: string;
  };
  staking: {
    ohmStake: number;
    ohmUnstake: number;
  };
  bonding: {
    daiAllowance: number;
  };
}

export const loadAccountDetails = createAsyncThunk(
  "account/loadAccountDetails",
  async ({ networkID, provider, address }: IBaseAddressAsyncThunk) => {
    let ohmBalance = 0;
    let sohmBalance = 0;
    let fsohmBalance = 0;
    let wsohmBalance = 0;
    let stakeAllowance = 0;
    let unstakeAllowance = 0;
    let lpStaked = 0;
    let pendingRewards = 0;
    let lpBondAllowance = 0;
    let daiBondAllowance = 0;
    let aOHMAbleToClaim = 0;
    let poolBalance = 0;
    let poolAllowance = 0;
    let cstInCirculation = 0;
    let cstpTotalSupply = 0;
    let daiFaiLaunchAllownace = 0;
    let cstPurchaseBalance = 0;
    let isFairLunchFinshed = false;
    let vestingFinishedTime = 0;
    let pendingPayoutPresale = 0;
    let vestingPeriodPresale = 0;
    let currentExchangeRate = 15;
    let currentBonusRate = 0;
    let bnbPrice = 0;
    
    //let cstPurchas
    console.log("kkkkkkkkkkkkkkk1");
    const daiContract = new ethers.Contract(addresses[networkID].DAI_ADDRESS as string, ierc20Abi, provider);
    const busdBalance = await daiContract.balanceOf(address);

    // daiFaiLaunchAllownace = await daiContract.allowance(address, addresses[networkID].FAIRLAUNCH_ADDRESS);

    if (addresses[networkID].PID_ADDRESS) {
      const ohmContract = new ethers.Contract(addresses[networkID].PID_ADDRESS as string, ierc20Abi, provider);
      ohmBalance = await ohmContract.balanceOf(address);
      stakeAllowance = await ohmContract.allowance(address, addresses[networkID].STAKING_HELPER_ADDRESS);
    }
    
    if (addresses[networkID].FAIRLAUNCH_ADDRESS) {
      cstpTotalSupply = 500000; //await pidContract.balanceOf(addresses[networkID].FAIRLAUNCH_ADDRESS);
      const fairLaunchContract = new ethers.Contract(addresses[networkID].FAIRLAUNCH_ADDRESS as string, FairLaunch, provider);
      cstInCirculation = await fairLaunchContract.totalPurchased();
      isFairLunchFinshed = await fairLaunchContract.finalized();
      pendingPayoutPresale = await fairLaunchContract.pendingPayoutFor(address);
      let userInfo = await fairLaunchContract.userInfo(address);
      cstPurchaseBalance = userInfo.purchased;
      vestingPeriodPresale = (new BigNumber(userInfo.lastTime._hex).toNumber() + new BigNumber(userInfo.vesting._hex).toNumber()) * 1000;

      // currentExchangeRate = await fairLaunchContract.currentExchangeRate();
      // const bnbPrice = await getBNBprice();
      // currentExchangeRate = bnbPrice;
      // currentBonusRate = await fairLaunchContract.currentBonusRate();
    }



    if (addresses[networkID].SPID_ADDRESS) {
      const sohmContract = new ethers.Contract(addresses[networkID].SPID_ADDRESS as string, sOHMv2, provider);
      sohmBalance = await sohmContract.balanceOf(address);
      unstakeAllowance = await sohmContract.allowance(address, addresses[networkID].STAKING_ADDRESS);
      // poolAllowance = await sohmContract.allowance(address, addresses[networkID].PT_PRIZE_POOL_ADDRESS);
    }
   
    // if (addresses[networkID].PT_TOKEN_ADDRESS) {
    //   const poolTokenContract = await new ethers.Contract(addresses[networkID].PT_TOKEN_ADDRESS, ierc20Abi, provider);
    //   poolBalance = await poolTokenContract.balanceOf(address);
    // }



    // for (const fuseAddressKey of ["FUSE_6_SOHM", "FUSE_18_SOHM"]) {
    //   if (addresses[networkID][fuseAddressKey]) {
    //     const fsohmContract = await new ethers.Contract(
    //       addresses[networkID][fuseAddressKey] as string,
    //       fuseProxy,
    //       provider,
    //     );
    //     fsohmContract.signer;
    //     const exchangeRate = ethers.utils.formatEther(await fsohmContract.exchangeRateStored());
    //     const balance = ethers.utils.formatUnits(await fsohmContract.balanceOf(address), "gwei");
    //     fsohmBalance += Number(balance) * Number(exchangeRate);
    //   }
    // }
   
    if (addresses[networkID].WSPID_ADDRESS) {
      const wsohmContract = new ethers.Contract(addresses[networkID].WSPID_ADDRESS as string, wsOHM, provider);
      const balance = await wsohmContract.balanceOf(address);
      wsohmBalance = await wsohmContract.wOHMTosOHM(balance);
    }
    let idoBalance=null
    let busdAmount = null
    let idoAllowance = null
    let IsPay = false
    let IsOpen=false
    if(addresses[networkID].IDO_ADDRESS){
      try{
        const iodContract = new ethers.Contract(addresses[networkID].IDO_ADDRESS as string, IDOAbi, provider);
        idoBalance = (await iodContract.Whitelist(address)).toNumber() / 1e9 
        busdAmount = ethers.utils.formatUnits(await iodContract.getBusdAmount(address))
        const busdContract = new ethers.Contract(addresses[networkID].BUSD_ADDRESS as string, ierc20Abi, provider);
        idoAllowance = await busdContract.allowance(address, iodContract.address);
        IsPay = await iodContract.IsPay(address)
        IsOpen= await iodContract.IsOpen()
        
      }catch(e){
        console.error(e)
        idoAllowance=0
        idoBalance=0 
      }
    }
    console.log("daiFaiLaunchAllownace_loadAccountDetails:", daiFaiLaunchAllownace.toString());
    return {
      ido:{
        isOpen:IsOpen,
        isPay:IsPay,
        idoAllowance,
        idoBalance,
        busdAmount
      },
      balances: {
        dai: ethers.utils.formatEther(busdBalance),
        ohm: ethers.utils.formatUnits(ohmBalance, "gwei"),
        sohm: ethers.utils.formatUnits(sohmBalance, "gwei"),
        cstInCirculation:ethers.utils.formatEther(cstInCirculation),
        cstpTotalSupply:ethers.utils.formatUnits(cstpTotalSupply, "wei"),
        fsohm: fsohmBalance,
        wsohm: ethers.utils.formatUnits(wsohmBalance, "gwei"),
        pool: ethers.utils.formatUnits(poolBalance, "gwei"),
      },
      staking: {
        ohmStake: +stakeAllowance,
        ohmUnstake: +unstakeAllowance,
      },
      bonding: {
        daiAllowance: daiBondAllowance,
      },
      pooling: {
        sohmPool: +poolAllowance,
      },
      presale: {
        daiFaiLaunchAllownace:+daiFaiLaunchAllownace,
        cstPurchaseBalance:ethers.utils.formatUnits(cstPurchaseBalance, "gwei"),
        isFairLunchFinshed:+isFairLunchFinshed,
        pendingPayoutPresale:ethers.utils.formatUnits(pendingPayoutPresale, "gwei"),
        vestingPeriodPresale:+vestingPeriodPresale,
        currentExchangeRate:ethers.utils.formatUnits(currentExchangeRate, "wei"),
        currentBonusRate:ethers.utils.formatUnits(currentBonusRate, "wei"),
      }
    };
  },
);

export const loadAccountAllowance = createAsyncThunk(
  "account/loadAccountAllowance",
  async ({ networkID, provider, tokenKind, address }: IBaseAllowanceAsyncThunk) => {
    let daiFaiLaunchAllownace = 0;
    
    //let cstPurchas
    let daiContract;
    if (tokenKind == 10) {
      daiContract = new ethers.Contract(addresses[networkID].BNB_ADDRESS as string, ierc20Abi, provider);
    } else if (tokenKind == 20) {
      daiContract = new ethers.Contract(addresses[networkID].BTC_ADDRESS as string, ierc20Abi, provider);
    } else {
      daiContract = new ethers.Contract(addresses[networkID].CAKE_ADDRESS as string, ierc20Abi, provider);
    }
    daiFaiLaunchAllownace = await daiContract.allowance(address, addresses[networkID].PRESALE_ADDRESS);

    const daiFaiLaunchAllownaceVal = ethers.utils.formatEther(daiFaiLaunchAllownace);
    console.log("daiFaiLaunchAllownace_loadAccountAllowance:", daiFaiLaunchAllownace.toString(), "---", daiFaiLaunchAllownaceVal.toString());

    return {
      presale: {
        daiFaiLaunchAllownace: +daiFaiLaunchAllownaceVal,
      }
    };
  },
);

export interface IUserBondDetails {
  allowance: number;
  interestDue: number;
  bondMaturationBlock: number;
  pendingPayout: string; //Payout formatted in gwei.
}
export const calculateUserBondDetails = createAsyncThunk(
  "account/calculateUserBondDetails",
  async ({ address, bond, networkID, provider }: ICalcUserBondDetailsAsyncThunk) => {
    if (!address) {
      return {
        bond: "",
        id: 100,
        displayName: "",
        bondIconSvg: "",
        isLP: false,
        allowance: 0,
        balance: "0",
        interestDue: 0,
        bondMaturationBlock: 0,
        pendingPayout: "",
        vestingTerm: 0,
        totalStaked: "",
      };
    }
    // dispatch(fetchBondInProgress());
    console.log("xxxxxxxxxxx-address:", address, "provide:", provider);
    // Calculate bond details.
    const bondContract = bond.getContractForBond(networkID, provider);
    const reserveContract = bond.getContractForReserve(networkID, provider);

    let allowance,
    balance = 0;
    allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID));
    balance = await reserveContract.balanceOf(address);
    // formatEthers takes BigNumber => String
    const balanceVal = ethers.utils.formatEther(balance);
    // balanceVal should NOT be converted to a number. it loses decimal precision
    
    let interestDue, pendingPayout, bondMaturationBlock;

    const bondDetails = 0 ; // = await bondContract.bondInfo(address);
    const rewardAmount = await bondContract.pendingToken(BigInt(bond.id), address);
    interestDue = rewardAmount / Math.pow(10, 18); //bondDetails.payout / Math.pow(10, 9);
    console.log("interestDue: ", interestDue, "rewardAmount:", rewardAmount);
    const user = await bondContract.userInfo(BigInt(bond.id), address);
    const pool = await bondContract.poolInfo(BigInt(bond.id));
    bondMaturationBlock = Number.parseInt(user.lastDepositTime) + Number.parseInt(pool.withdrawLockPeriod); //+bondDetails.vesting + +bondDetails.lastBlock;
    const stakedAmount = user.amount;
    if (stakedAmount == 0) {
      bondMaturationBlock = 0;
    }


    // pendingPayout = await bondContract.userInfo[0][address].amount;
    // const pendingPayout1 = await bondContract.userInfo(0, address);
    // const amount0 = ethers.utils.formatUnits(pendingPayout, 18);
    // console.log("pendingPayout:", amount0);

  
    return {
      bond: bond.name,
      displayName: bond.displayName,
      id: bond.id,
      bondIconSvg: bond.bondIconSvg,
      isLP: bond.isLP,
      allowance: Number(allowance),
      balance: balanceVal,
      interestDue,
      bondMaturationBlock,
      // pendingPayout: ethers.utils.formatUnits(pendingPayout, "gwei"),
      pendingPayout: ethers.utils.formatUnits(stakedAmount, 18),
      vestingTerm: pool.withdrawLockPeriod,
      totalStaked: ethers.utils.formatUnits(pool.balance.toString(), 18),
    };
  },
);

export const calculateUserCBondDetails = createAsyncThunk(
  "account/calculateUserCBondDetails",
  async ({ address, bond, networkID, provider }: ICalcUserBondDetailsAsyncThunk) => {
    if (!address) {
      return {
        bond: "",
        id: 100,
        displayName: "",
        bondIconSvg: "",
        isLP: false,
        allowance: 0,
        balance: "0",
        interestDue: 0,
        bondMaturationBlock: 0,
        pendingPayout: "0",
        vestingTerm: 0,
        totalStaked: "",
        tokenPrice: "0"
      };
    }
    // dispatch(fetchBondInProgress());
    // Calculate bond details.
    const bondContract = bond.getContractForBond(networkID, provider);
    const reserveContract = bond.getContractForReserve(networkID, provider);

    let allowance,
    balance = 0;
    allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID));
    balance = await reserveContract.balanceOf(address);
    // formatEthers takes BigNumber => String
    const balanceVal = ethers.utils.formatEther(balance);
    // balanceVal should NOT be converted to a number. it loses decimal precision
    
    let interestDue = 0, pendingPayout, bondMaturationBlock, tokenPrice, tokenPrice0;

    const bondDetails = 0 ; // = await bondContract.bondInfo(address);
    // const rewardAmount = await bondContract.pendingToken(BigInt(bond.id), address);
    if (bond.id == 6) {
      tokenPrice0 = await bondContract.getPrice("BNB", "BUSD");
    } else if (bond.id == 7) {
      tokenPrice0 = await bondContract.getPrice("BNB", "BUSD");
    } else if (bond.id == 8) {
      tokenPrice0 = await bondContract.getPrice("ETH", "BUSD");
    }

    tokenPrice = ethers.utils.formatEther(tokenPrice0.toString());
    
    // console.log("interestDue: ", interestDue, "rewardAmount:", rewardAmount);
    const user = await bondContract.userInfo(bond.getAddressForReserve(networkID), address);
    const pool = await bondContract.lpPoolInfo(bond.getAddressForReserve(networkID));
    bondMaturationBlock = Number.parseInt(user.lastDepositTime); // + Number.parseInt(pool.withdrawLockPeriod); //+bondDetails.vesting + +bondDetails.lastBlock;
    const stakedAmount = user.amount;
    if (stakedAmount == 0) {
      bondMaturationBlock = 0;
    }

    console.log("xAddress:", bond.getAddressForReserve(networkID), " amount: ", ethers.utils.formatUnits(user.amount.toString(), 18).toString());


    // pendingPayout = await bondContract.userInfo[0][address].amount;
    // const pendingPayout1 = await bondContract.userInfo(0, address);
    // const amount0 = ethers.utils.formatUnits(pendingPayout, 18);
    // console.log("pendingPayout:", amount0);

  
    return {
      bond: bond.name,
      displayName: bond.displayName,
      id: bond.id,
      bondIconSvg: bond.bondIconSvg,
      isLP: bond.isLP,
      allowance: Number(allowance),
      balance: balanceVal,
      interestDue,
      bondMaturationBlock,
      // pendingPayout: ethers.utils.formatUnits(pendingPayout, "gwei"),
      pendingPayout: ethers.utils.formatUnits(user.amount.toString(), 18),
      vestingTerm: pool.lastRewardBlock,
      totalStaked: ethers.utils.formatUnits(pool.balance.toString(), 18),
      tokenPrice,
    };
  },
);

export const calculateSnapShot = createAsyncThunk(
  "account/calculateSnapShot",
  async ({ address, networkID, provider }: IBaseAddressAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    // if (!address) return 0;
    const signer = provider.getSigner();
    const cStakingContract = new ethers.Contract(addresses[networkID].CSTAKING_ADDRESS as string, cStaking, signer);

    let approveTx;
    try {
      approveTx = await cStakingContract.setSnapShot();
      console.log("sssss", approveTx.toString());
      // dispatch(
      //   fetchPendingTxns({
      //     txnHash: approveTx.hash,
      //     text: "Approving ",
      //     type: "approve_",
      //   }),
      // );
      // await approveTx.wait();
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
        // dispatch(loadAccountDetails({ networkID, address, provider }));
        // dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
      }
    }
  },
);

export const getSnapshotAndTime = createAsyncThunk(
  "account/getSnapshotAndTime",
  async ({ address, networkID, provider }: IBaseAddressAsyncThunk, { dispatch }) => {
    if (!provider || !address) {
      return {
        snapTime: {
          snapShot: 0,
          currentTime: 0 
        }
      };
    }

    // if (!address) return 0;
    const signer = provider.getSigner();
    const cStakingContract = new ethers.Contract(addresses[networkID].CSTAKING_ADDRESS as string, cStaking, signer);

    let currentTime, snapShot;
    try {
      currentTime = await cStakingContract.getCurrentTime();
      snapShot = await cStakingContract.snapShot();
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
    } finally {
      // if (approveTx) {
      //   dispatch(clearPendingTxn(approveTx.hash));
      //   // dispatch(loadAccountDetails({ networkID, address, provider }));
      //   // dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
      // }
    }

    console.log("1111111111", currentTime.toString(), "dd", snapShot.toString());

    return {
      snapTime: {
        snapShot: Number(snapShot),
        currentTime: Number(currentTime)
      }
    };
  },
);


interface IAccountSlice {
  bonds: { [key: string]: IUserBondDetails };
  balances: {
    ohm: string;
    sohm: string;
    dai: string;
    oldsohm: string;
  };
  snapTime: {
    snapShot: number;
    currentTime: number;
  }
  loading: boolean;
  aprs: [];
}
const initialState: IAccountSlice = {
  loading: false,
  bonds: {},
  balances: { ohm: "", sohm: "", dai: "", oldsohm: "" },
  aprs: [],
  snapTime: {
    snapShot: 0,
    currentTime: 0
  }
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    fetchAccountSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadAccountDetails.pending, state => {
        state.loading = true;
      })
      .addCase(loadAccountDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadAccountDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(loadAccountAllowance.pending, state => {
        state.loading = true;
      })
      .addCase(loadAccountAllowance.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadAccountAllowance.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(getBalances.pending, state => {
        state.loading = true;
      })
      .addCase(getBalances.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(getBalances.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(getAprs.pending, state => {
        state.loading = true;
      })
      .addCase(getAprs.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(getAprs.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(getSnapshotAndTime.pending, state => {
        state.loading = true;
      })
      .addCase(getSnapshotAndTime.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(getSnapshotAndTime.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(calculateUserBondDetails.pending, state => {
        state.loading = true;
      })
      .addCase(calculateUserBondDetails.fulfilled, (state, action) => {
        if (!action.payload) return;
        const bond = action.payload.bond;
        state.bonds[bond] = action.payload;
        state.loading = false;
      })
      .addCase(calculateUserBondDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(calculateUserCBondDetails.pending, state => {
        state.loading = true;
      })
      .addCase(calculateUserCBondDetails.fulfilled, (state, action) => {
        if (!action.payload) return;
        const bond = action.payload.bond;
        state.bonds[bond] = action.payload;
        state.loading = false;
      })
      .addCase(calculateUserCBondDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      });
  },
});

export default accountSlice.reducer;

export const { fetchAccountSuccess } = accountSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);

import { ethers } from "ethers";
import { addresses } from "../constants";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as PresaleAbi } from "../abi/Presale.json";
import { abi as FairLaunch } from "../abi/FairLaunch.json";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAccountSuccess, getBalances, loadAccountAllowance } from "./AccountSlice";
import { clearPendingTxn, fetchPendingTxns } from "./PendingTxnsSlice";
import { error } from "../slices/MessagesSlice";
import { IPurchaseCSTPAsyncThunk, IPurchaseCSTAsyncThunk, IBaseAddressAsyncThunk, IBaseAddressTokenAsyncThunk , IJsonRPCError } from "./interfaces";
import { loadAccountDetails } from "./AccountSlice";

export const changeApproval = createAsyncThunk(
  "presale/changeApproval",
  async ({ provider, address, tokenKind, networkID }: IBaseAddressTokenAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    let daiContract;
    if (tokenKind == 10) {
      daiContract = new ethers.Contract(addresses[networkID].BNB_ADDRESS as string, ierc20Abi, signer);
    } else if (tokenKind == 20) {
      daiContract = new ethers.Contract(addresses[networkID].BTC_ADDRESS as string, ierc20Abi, signer);   
    } else {
      daiContract = new ethers.Contract(addresses[networkID].CAKE_ADDRESS as string, ierc20Abi, signer);   
    }
    
    let approveTx;

    try {
      approveTx = await daiContract.approve(
        addresses[networkID].PRESALE_ADDRESS,
        ethers.utils.parseUnits("10000000000", "ether").toString(),
      );
      const text = "Approve Presale";
      const pendingTxnType = "approve_presale";
      dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));

      await approveTx.wait();
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
      return;
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
      }
    }

    const daiFaiLaunchAllownace = await daiContract.allowance(address, addresses[networkID].PRESALE_ADDRESS);
    const daiFaiLaunchAllownaceVal = ethers.utils.formatEther(daiFaiLaunchAllownace);
    return dispatch(
      fetchAccountSuccess({
        presale: {
          daiFaiLaunchAllownace: +daiFaiLaunchAllownaceVal,
        },
      }),
    );
  },
);

export const purchaseCSTP = createAsyncThunk(
  "presale/purchaseCSTP",
  async ({ amount, tokenKind, provider, address, networkID }: IPurchaseCSTPAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    if (amount <= 0) {
      dispatch(error("Please input correct amount!"));
      return;
    }

    const signer = provider.getSigner();
    const presaleContract = new ethers.Contract(addresses[networkID].PRESALE_ADDRESS as string, PresaleAbi, signer);
    let approveTx;

    try {
      // approveTx = await presaleContract.purchaseCSTP(
      //   ethers.utils.parseUnits(amount.toString(), "ether")
      // );
      if (tokenKind == 10) {
        approveTx = await presaleContract.execute({value: ethers.utils.parseEther(amount.toString())});
      } else if (tokenKind == 20) {
        approveTx = await presaleContract.burnERC20(addresses[networkID].BTC_ADDRESS, ethers.utils.parseEther(amount.toString()));
      } else {
        approveTx = await presaleContract.burnERC20(addresses[networkID].CAKE_ADDRESS, ethers.utils.parseEther(amount.toString()));
      }
      
      let song1 = new Audio("burn.mp3");
      song1.play();
      // song.pause();

      let text = "Buy Presale";
      let pendingTxnType = "buy_presale";
      dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));

      await approveTx.wait();

      // approveTx = await presaleContract.burnERC20();
      // text = "Approve Presale";
      // pendingTxnType = "Burning...";
      // dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text: pendingTxnType, type: pendingTxnType }));

      // await approveTx.wait();

      // dispatch(loadAccountDetails({ networkID, address, provider }));
      dispatch(loadAccountAllowance({ networkID, address, tokenKind, provider }));
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
      return;
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
      }
    }
  },
);


export const purchaseCST = createAsyncThunk(
  "presale/purchaseCST",
  async ({ amount, provider, address, networkID }: IPurchaseCSTAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const fairLaunchContract = new ethers.Contract(addresses[networkID].FAIRLAUNCH_ADDRESS as string, FairLaunch, signer);
    let approveTx;
    try {
      approveTx = await fairLaunchContract.deposit(address, ethers.utils.parseUnits(amount.toString(), "ether")
      );

      const text = "Approve Presale";
      const pendingTxnType = "buy_presale";
      dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text: pendingTxnType, type: pendingTxnType }));

      await approveTx.wait();
      dispatch(loadAccountDetails({ networkID, address, provider }));
    } catch (e: unknown) {
      const errMsg = (e as IJsonRPCError).message;
      if (errMsg.includes("only whitelisted"))
        dispatch(error("You are not added to whitelist. Please contact Manager."));
      else if (errMsg.includes("exceed limit"))
        dispatch(error("Sorry. You exceed limit"));
      else
        dispatch(error("Purchase failed"));
      console.log(errMsg);
      return;
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
      }
    }

  },
);


export const redeem = createAsyncThunk(
  "presale/redeem",
  async ({ provider, address, networkID }: IPurchaseCSTAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    console.log("redeem");

    const signer = provider.getSigner();
    const fairLaunchContract = new ethers.Contract(addresses[networkID].FAIRLAUNCH_ADDRESS as string, FairLaunch, signer);
    let approveTx;
    try {
      approveTx = await fairLaunchContract.redeem(address, false);

      const text = "Redeem Presale";
      const pendingTxnType = "redeem_presale";
      dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text: pendingTxnType, type: pendingTxnType }));

      await approveTx.wait();
      dispatch(loadAccountDetails({ networkID, address, provider }));
    } catch (e: unknown) {
      const errMsg = (e as IJsonRPCError).message;
      if (errMsg.includes("not finalized yet"))
        dispatch(error("Fair Launch not finalized yet. Please wait."));
      else if (errMsg.includes("exceed limit"))
        dispatch(error("Sorry. You exceed limit"));
      else
        dispatch(error("Claim failed. Network has a troble. Please again"));
      console.log(errMsg);
      return;
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
      }
    }

  },
);

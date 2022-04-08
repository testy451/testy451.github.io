import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Slide,
  Typography,
} from "@material-ui/core";
import { prettifySeconds, secondsUntilBlock, shorten, trim } from "../../helpers";
import { cbondAsset, calcBondDetails, changeApproval } from "../../slices/BondSlice";
import { useWeb3Context } from "src/hooks/web3Context";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import { Skeleton } from "@material-ui/lab";
import useDebounce from "../../hooks/Debounce";
import { error } from "../../slices/MessagesSlice";

function BondPurchase({ bond, slippage, recipientAddress }) {
  const SECONDS_TO_REFRESH = 60;
  const dispatch = useDispatch();
  const { provider, address, chainID } = useWeb3Context();

  const [quantity, setQuantity] = useState("");
  const [secondsToRefresh, setSecondsToRefresh] = useState(SECONDS_TO_REFRESH);

  const currentBlock = useSelector(state => {
    return state.app.currentBlock;
  });

  const isBondLoading = useSelector(state => state.bonding.loading ?? true);

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });

  const vestingPeriod = () => {
    if (0) {
      console.log("vestingPeriod0");
      const vestingBlock = parseInt(currentBlock) + parseInt(bond.vestingTerm);

      const seconds = secondsUntilBlock(currentBlock, vestingBlock);
      return prettifySeconds(seconds, "day");
  
    } else {
      console.log("vestingPeriod1:", bond.vestingTerm);
      // return prettifySeconds(bond.vestingTerm, "day");
      return prettifySeconds(bond.vestingTerm, "hour");
    }
  };

  async function onBond() {
    if (quantity === "") {
      dispatch(error("Please enter a value!"));
    } else if (isNaN(quantity)) {
      dispatch(error("Please enter a valid value!"));
    }else if(recipientAddress !== address) {
      const shouldProceed = window.confirm(
        `You are trying to purchase Bond for the address ${shorten(recipientAddress)}, please ensure the wallet address has connected to PIDAO to view the Bond information after purchase succeeds.`,
      );
      if (shouldProceed) {
        await dispatch(
          cbondAsset({
            value: quantity,
            slippage,
            bond,
            networkID: chainID,
            provider,
            address: recipientAddress || address,
          }),
        );
      } 
    } else if (bond.interestDue > 0 || bond.pendingPayout > 0) {
      const shouldProceed = window.confirm(
        "You have an existing staking. Staking will reset your vesting period but you never forfeit rewards. But you can withdraw after new vesting term from now. Do you still want to proceed?",
      );
      if (shouldProceed) {
        await dispatch(
          cbondAsset({
            value: quantity,
            slippage,
            bond,
            networkID: chainID,
            provider,
            address: recipientAddress || address,
          }),
        );
      }
    } else {
      await dispatch(
        cbondAsset({
          value: quantity,
          slippage,
          bond,
          networkID: chainID,
          provider,
          address: recipientAddress || address,
        }),
      );
      clearInput();
    }
  }

  const clearInput = () => {
    setQuantity(0);
  };

  const hasAllowance = useCallback(() => {
    return bond.allowance > 0;
  }, [bond.allowance]);

  const setMax = () => {
    let maxQ;
    if (bond.maxBondPrice * bond.bondPrice < Number(bond.balance)) {
      // there is precision loss here on Number(bond.balance)
      maxQ = bond.maxBondPrice * bond.bondPrice.toString();
    } else {
      maxQ = bond.balance;
    }
    setQuantity(maxQ);
  };

  const bondDetailsDebounce = useDebounce(quantity, 1000);

  useEffect(() => {
    dispatch(calcBondDetails({ bond, value: quantity, provider, networkID: chainID }));
  }, [bondDetailsDebounce]);

  useEffect(() => {
    let interval = null;
    if (secondsToRefresh > 0) {
      interval = setInterval(() => {
        setSecondsToRefresh(secondsToRefresh => secondsToRefresh - 1);
      }, 1000);
    } else {
      clearInterval(interval);
      dispatch(calcBondDetails({ bond, value: quantity, provider, networkID: chainID }));
      setSecondsToRefresh(SECONDS_TO_REFRESH);
    }
    return () => clearInterval(interval);
  }, [secondsToRefresh, quantity]);

  const onSeekApproval = async () => {
    dispatch(changeApproval({ address, bond, provider, networkID: chainID }));
  };

  const displayUnits = bond.displayUnits;

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" justifyContent="space-around" flexWrap="wrap">
        <FormControl className="ohm-input" variant="outlined" color="primary" fullWidth>
          <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            // startAdornment={<InputAdornment position="start">$</InputAdornment>}
            labelWidth={55}
            endAdornment={
              <InputAdornment position="end">
                <Button variant="text" onClick={setMax}>
                  Max
                </Button>
              </InputAdornment>
            }
          />
        </FormControl>
        {hasAllowance() ? (
          <Button
            variant="contained"
            color="primary"
            id="bond-btn"
            className="transaction-button"
            disabled={isPendingTxn(pendingTransactions, "bond_" + bond.name)}
            onClick={onBond}
          >
            {txnButtonText(pendingTransactions, "bond_" + bond.name, "Stake")}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            id="bond-approve-btn"
            className="transaction-button"
            disabled={isPendingTxn(pendingTransactions, "approve_" + bond.name)}
            onClick={onSeekApproval}
          >
            {txnButtonText(pendingTransactions, "approve_" + bond.name, "Approve")}
          </Button>
        )}

        {!hasAllowance() && (
          <div className="help-text">
            <em>
              <Typography variant="body2">
                Note: The "Approve" transaction is only needed when staking for the first time; subsequent staking only
                requires you to perform the "Stake" transaction.
              </Typography>
            </em>
          </div>
        )}
      </Box>

      <Slide direction="left" in={true} mountOnEnter unmountOnExit {...{ timeout: 533 }}>
        <Box className="bond-data">
          <div className="data-row">
            <Typography>Your Balance</Typography>
            <Typography>
              {isBondLoading ? (
                <Skeleton width="100px" />
              ) : (
                <>
                  {trim(bond.balance, 4)} {displayUnits}
                </>
              )}
            </Typography>
          </div>

          <div className={`data-row`}>
            <Typography>Your Staked Amount</Typography>
            <Typography id="bond-value-id" className="price-data">
              {isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.pendingPayout, 4) || "0"} LP`}
            </Typography>
          </div>

          {/* <div className={`data-row`}>
            <Typography>Max You Can Buy</Typography>
            <Typography id="bond-value-id" className="price-data">
              {isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.maxBondPrice, 4) || "0"} XOD`}
            </Typography>
          </div> */}

          {/* <div className="data-row">
            <Typography>ROI</Typography>
            <Typography>
              {isBondLoading ? <Skeleton width="100px" /> : `${trim((bond.bondDiscount | 0) * 100, 2)}%`}
            </Typography>
          </div> */}

          {/* <div className="data-row">
            <Typography>Debt Ratio</Typography>
            <Typography>
              {isBondLoading ? <Skeleton width="100px" /> : `${trim((bond.debtRatio | 0) / 10000000, 4)}%`}
            </Typography>
          </div> */}

          <div className="data-row">
            <Typography>Vesting Term</Typography>
            <Typography>{isBondLoading ? <Skeleton width="100px" /> : vestingPeriod()}</Typography>
          </div>

          {recipientAddress !== address && (
            <div className="data-row">
              <Typography>Recipient</Typography>
              <Typography>{isBondLoading ? <Skeleton width="100px" /> : shorten(recipientAddress)}</Typography>
            </div>
          )}
        </Box>
      </Slide>
    </Box>
  );
}

export default BondPurchase;

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Paper, Tab, Tabs, Box, Grid, FormControl, OutlinedInput, InputAdornment } from "@material-ui/core";
import InfoTooltipMulti from "../../components/InfoTooltip/InfoTooltipMulti";

import TabPanel from "../../components/TabPanel";
import CardHeader from "../../components/CardHeader/CardHeader";
import "./presale.scss";
import { addresses, POOL_GRAPH_URLS } from "../../constants";
import { useWeb3Context } from "../../hooks";
import { apolloExt } from "../../lib/apolloClient";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import { calculateOdds } from "../../helpers/33Together";
import { getPoolValues, getRNGStatus } from "../../slices/PoolThunk";
import { purchaseCST, purchaseCSTP, changeApproval, redeem } from "../../slices/Presale";
import { trim } from "../../helpers/index";
import { Typography, Button, Zoom } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { error, info } from "../../slices/MessagesSlice";
import { AboutCard } from "./AboutCard";
import { PresaleCard } from "./PresaleCard";
import { FairLaunchCard } from "./FairLaunchCard";
import { loadAccountAllowance, calculateUserBondDetails } from "../../slices/AccountSlice";
import axios from 'axios';
import { Toast } from "../../utils"
import useBonds from "../../hooks/Bonds";

function a11yProps(index) {
  return {
    id: `pool-tab-${index}`,
    "aria-controls": `pool-tabpanel-${index}`,
  };
}



const MAX_DAI_AMOUNT = 1000;

const Presale = () => {
  const [view, setView] = useState(0);

  const changeView = (event, newView) => {
    setView(newView);
  };

  // NOTE (appleseed): these calcs were previously in PoolInfo, however would be need in PoolPrize, too, if...
  // ... we ever were to implement other types of awards
  const { connect, address, provider, chainID, connected, hasCachedProvider } = useWeb3Context();
  const dispatch = useDispatch();
  let history = useHistory();
  const [graphUrl, setGraphUrl] = useState(POOL_GRAPH_URLS[chainID]);
  const [poolData, setPoolData] = useState(null);
  const [poolDataError, setPoolDataError] = useState(null);
  const [graphLoading, setGraphLoading] = useState(true);
  const [walletChecked, setWalletChecked] = useState(false);
  const [winners, setWinners] = useState("--");
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalSponsorship, setTotalSponsorship] = useState(0);
  const [yourOdds, setYourOdds] = useState(0);
  const [yourTotalAwards, setYourTotalAwards] = useState(0);
  const [cstpBalance, setCSTPBalance] = useState(0);
  const [inputBUSDAmount, setBUSDBalance] = useState(0);
  const [tokenKind, settokenKind] = useState('10');

  const [intervalID, setIntervalID] = useState();
  
  // TODO (appleseed-33T): create a table for AwardHistory
  const [yourAwardHistory, setYourAwardHistory] = useState([]);
  const [infoTooltipMessage, setInfoTooltipMessage] = useState([
    "Deposit sPID to win! Once deposited, you will receive a corresponding amount of 3,3 π and be entered to win until your sPID is withdrawn.",
  ]);
  const isAccountLoading = useSelector(state => state.account.loading ?? true);

  const daiBalance = useSelector(state => {
    return state.account.balances && state.account.balances.dai;
  });

  const daiFaiLaunchAllownace = useSelector(state => {
    return state.account.presale && state.account.presale.daiFaiLaunchAllownace;
  });
  console.log('[mcb] => daiFaiLaunchAllownace: ', daiFaiLaunchAllownace)

  const cstInCirculation = useSelector(state => {
    return state.account.balances && state.account.balances.cstInCirculation;
  });

  const cstpTotalSupply = useSelector(state => {
    return state.account.balances && state.account.balances.cstpTotalSupply;
  });

  const poolBalance = useSelector(state => {
    return state.account.balances && state.account.balances.pool;
  });

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });

  const cstPurchaseBalance = useSelector(state => {
    return state.account.presale && state.account.presale.cstPurchaseBalance;
  }) | 0;

  const isFairLunchFinshed = useSelector(state => {
    return state.account.presale && state.account.presale.isFairLunchFinshed;
  });

  const pendingPayoutPresale = useSelector(state => {
    return state.account.presale && state.account.presale.pendingPayoutPresale;
  });

  const vestingPeriodPresale = useSelector(state => {
    return state.account.presale && state.account.presale.vestingPeriodPresale;
  });

  // const currentExchangeRate = useSelector(state => {
  //   return state.account.presale && state.account.presale.currentExchangeRate;
  // });

  const [currentExchangeRate, setPrice] = useState(0);

  const getPrice = async () => {
    let tokenAddress;
    if (tokenKind == 10) {
      tokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
    } else if (tokenKind == 20) {
      tokenAddress = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
    } else {
      tokenAddress = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
    }

    const url = 'https://deep-index.moralis.io/api/v2/erc20/' + tokenAddress + '/price?chain=bsc';
    const res = await axios.get(url,
    {
      headers: {
        "X-API-Key": "YEEwMh0B4VRg6Hu5gFQcKxqinJ7UizRza1JpbkyMgNTfj4jUkSaZVajOxLNabvnt"
      }
    });

    // const adr = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c_0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
    // const res2 = await axios.get("https://api.pancakeswap.info/api/v2/summary");
    // const data1 = res2.data;
    // console.log("pancakeswap:", res2.data.data['0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c_0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'].base_volume);

    
    const bnbPrice = res.data.usdPrice;
    console.log("token price: ", bnbPrice, "tokenKind: ", tokenKind);
    setPrice(bnbPrice);
    return 0;
  }


  const currentBonusRate = useSelector(state => {
    return state.account.presale && state.account.presale.currentBonusRate / 10;
  });

  const { bonds } = useBonds();
  const [ timerID1, setTimerID1 ] = useState(0);

  const reload1 = (param, param2) => {
    bonds.map(bond => {
      dispatch(calculateUserBondDetails({ address: param, bond, provider: param2, networkID: chainID }));
    });
  }

  useEffect (() => {
    let intervalID = setInterval(() => {
      reload1(address, provider);
    }, 5000);
    setTimerID1(intervalID);
    return () => clearInterval(timerID1);
  }, [address, provider]);

  const handleChange = (event) => {
    settokenKind(event.target.value);

    // console.log("usdtprice: ", usdtprice.toString());
    dispatch(loadAccountAllowance({ networkID: chainID, address, tokenKind: event.target.value, provider }));
  };
  console.log(currentExchangeRate, currentBonusRate);

  const setCSTPBalanceCallback = (value) => {
    if ((value * currentExchangeRate) > MAX_DAI_AMOUNT && (value * currentExchangeRate) > (MAX_DAI_AMOUNT - cstPurchaseBalance * currentExchangeRate)) {
      setBUSDBalance(MAX_DAI_AMOUNT - cstPurchaseBalance * currentExchangeRate);
      setCSTPBalance((MAX_DAI_AMOUNT - cstPurchaseBalance * currentExchangeRate) / currentExchangeRate);
    }
    else {
      setCSTPBalance(value);
      // setBUSDBalance(value * currentExchangeRate);
    }
  }

  const setBUSDBalanceCallback = (value) => {
    setBUSDBalance(value * currentExchangeRate);
    setCSTPBalance(value);
    // if (value > MAX_DAI_AMOUNT && value > (MAX_DAI_AMOUNT - cstPurchaseBalance * currentExchangeRate)) {
    //   setBUSDBalance(MAX_DAI_AMOUNT - cstPurchaseBalance * currentExchangeRate);
    //   setCSTPBalance((MAX_DAI_AMOUNT - cstPurchaseBalance * currentExchangeRate) / currentExchangeRate);
    // }
    // else {
    //   setBUSDBalance(value);
    //   // setCSTPBalance(value / currentExchangeRate);
    // }
  }





  const setMax = () => {
    if (daiBalance > MAX_DAI_AMOUNT && daiBalance > (MAX_DAI_AMOUNT - cstPurchaseBalance * currentExchangeRate))
      setBUSDBalanceCallback(MAX_DAI_AMOUNT - cstPurchaseBalance * currentExchangeRate);
    else
      setBUSDBalanceCallback(daiBalance);
  };


  // const hasAllowance = useCallback(
  //   () => {
  //     return daiFaiLaunchAllownace > 0;
  //     return 0;
  //   },
  //   [daiFaiLaunchAllownace],
  // )

  const hasAllowance = useCallback(
    () => {
      if (tokenKind == 10) {
        return true;
      } else {
        return daiFaiLaunchAllownace > 0;
      }
    },
    [daiFaiLaunchAllownace, tokenKind],
  )

  const onPurchaseCST = async action => {
    // eslint-disable-next-line no-restricted-globals
    // if (isNaN(inputBUSDAmount) || inputBUSDAmount === 0 || inputBUSDAmount === "" || !inputBUSDAmount) {
    //   // eslint-disable-next-line no-alert
    //   return dispatch(info("Please enter a value!"));
    // }

    // if (inputBUSDAmount > MAX_DAI_AMOUNT) {
    //   setBUSDBalanceCallback(MAX_DAI_AMOUNT);
    //   return dispatch(info("Sorry, You can only make 1 purchase with maximum 1000 BUSD"));
    // }

    // if (inputBUSDAmount > (MAX_DAI_AMOUNT - cstPurchaseBalance * currentExchangeRate)) {
    //   setBUSDBalanceCallback(MAX_DAI_AMOUNT - cstPurchaseBalance * currentExchangeRate);
    //   return dispatch(info("Sorry, You can only make purchase with maximum 1000 BUSD"));
    // }

    // if (inputBUSDAmount > daiBalance) {
    //   setBUSDBalanceCallback(daiBalance);
    //   return dispatch(info("Sorry, your BUSD balance is not sufficient to make the purchase"));
    // }

    // 1st catch if quantity > balance
    // let gweiValue = ethers.utils.parseUnits(quantity, "gwei");
    // if (gweiValue.gt(ethers.utils.parseUnits(ohmBalance, "gwei"))) {
    //   return dispatch(error("You cannot stake more than your BUSD balance."));
    // }
    await dispatch(purchaseCST({ amount: inputBUSDAmount, provider, address, networkID: chainID }));
    setCSTPBalanceCallback(0);
  };

  const onPurchaseCSTP = async action => {
    if (cstpBalance <= 0) {
      return dispatch(error('Please input correct amount!'));
    }
  
    // 1st catch if quantity > balance
    // let gweiValue = ethers.utils.parseUnits(quantity, "gwei");
    // if (gweiValue.gt(ethers.utils.parseUnits(ohmBalance, "gwei"))) {
    //   return dispatch(error("You cannot stake more than your BUSD balance."));
    // }
    let str = 'You will get approximately ' + inputBUSDAmount.toFixed(2) + ' DXTC tokens minus slippage fee';
    // dispatch(info(str));
    Toast.fire({
      icon: 'success',
      title: str
    });
    await dispatch(purchaseCSTP({ amount: cstpBalance, tokenKind: tokenKind, provider, address, networkID: chainID }));
    // setCSTPBalanceCallback(0);
  };

  const onClaim = async action => {
    // eslint-disable-next-line no-restricted-globals
    await dispatch(redeem({ provider, address, networkID: chainID }));
  };


  const onSeekApproval = async token => {
    await dispatch(changeApproval({ address, tokenKind: tokenKind, provider, networkID: chainID }));
  };

  // query correct pool subgraph depending on current chain
  useEffect(() => {
    setGraphUrl(POOL_GRAPH_URLS[chainID]);
    
  }, [chainID]);

  useEffect(() => {
    clearInterval(intervalID);
    const _intervalID = setInterval(() => getPrice(), 1000);
    setIntervalID(_intervalID);
  }, [tokenKind]);

  useEffect(() => {
    let userOdds = calculateOdds(poolBalance, totalDeposits, winners);
    setYourOdds(userOdds);
  }, [winners, totalDeposits, poolBalance]);

  useEffect(() => {
    if (hasCachedProvider()) {
      // then user DOES have a wallet
      connect().then(() => {
        setWalletChecked(true);
      });
    } else {
      // then user DOES NOT have a wallet
      setWalletChecked(true);
    }
  }, []);

  // this useEffect fires on state change from above. It will ALWAYS fire AFTER
  useEffect(() => {
    // don't load ANY details until wallet is Checked
    if (walletChecked) {
      dispatch(getPoolValues({ networkID: chainID, provider: provider }));
      dispatch(getRNGStatus({ networkID: chainID, provider: provider }));
    }
  }, [walletChecked]);

  let modalButton = [];

  modalButton.push(
    <Button variant="contained" color="primary" className="connect-button" onClick={connect} key={1}>
      Connect Wallet
    </Button>,
  )

  modalButton.push(
    <Button
      className="stake-button"
      variant="contained"
      color="primary"
      disabled={isPendingTxn(pendingTransactions, "buy_presale")}
      onClick={() => {
        onPurchaseCSTP();
        var audio = new Audio('../../assets/burn.mp3');
        audio.play();
      }}
    >
      {txnButtonText(pendingTransactions, "buy_presale", "Burn")}
    </Button>
  )

  modalButton.push(
    <Button
      className="stake-button"
      variant="contained"
      color="primary"
      disabled={isPendingTxn(pendingTransactions, "approve_presale")}
      onClick={() => {
        onSeekApproval();
      }}
    >
      {txnButtonText(pendingTransactions, "approve_presale", "Approve")}
    </Button>
  )


  let claimButton = [];

  claimButton.push(
    <Button variant="contained" color="primary" className="connect-button" onClick={connect} key={1}>
      Connect Wallet
    </Button>,
  )

  claimButton.push(
    <Button
      className="stake-button"
      variant="contained"
      color="primary"
      disabled={isPendingTxn(pendingTransactions, "redeem_presale")}
      onClick={() => {
        onClaim();
      }}
    >
      {txnButtonText(pendingTransactions, "redeem_presale", "Claim")}
    </Button>
  )


  claimButton.push(
    <Button
      className="stake-button"
      variant="contained"
      color="primary"
      disabled={true}
      onClick={() => {
        onClaim();
      }}
    >
      {/*txnButtonText(pendingTransactions, "redeem_presale", "Claim and Stake")*/ "Claim and Stake"}
    </Button>
  )

  return (
    <Zoom in={true}>
      <div id="pool-together-view">
        {
          // !isFairLunchFinshed ?
          <PresaleCard
            address={address}
            cstPurchaseBalance={cstPurchaseBalance}
            currentExchangeRate={currentExchangeRate}
            cstpTotalSupply={cstpTotalSupply}
            cstInCirculation={cstInCirculation}
            cstpBalance={cstpBalance}
            inputBUSDAmount={inputBUSDAmount}
            // currentExchangeRate={currentExchangeRate}
            currentBonusRate={daiFaiLaunchAllownace}
            modalButton={modalButton}
            setMax={setMax}
            hasAllowance={hasAllowance}
            setCSTPBalanceCallback={setCSTPBalanceCallback}
            setBUSDBalanceCallback={setBUSDBalanceCallback}
            tokenKind={tokenKind}
            handleChange={handleChange}
          />
          // :
          // <FairLaunchCard
          //   address={address}
          //   cstPurchaseBalance={cstPurchaseBalance}
          //   pendingPayoutPresale={pendingPayoutPresale}
          //   vestingPeriodPresale={vestingPeriodPresale}
          //   claimButton={claimButton}
          // />
        }
        <AboutCard />
      </div >
    </Zoom>
  );
};

export default Presale;

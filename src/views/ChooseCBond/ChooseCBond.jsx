import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Zoom,
} from "@material-ui/core";
import { BondDataCard, BondTableData } from "./CBondRow";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { formatCurrency } from "../../helpers";
import useCBonds from "../../hooks/CBonds";
import "./choosecbond.scss";
import { Skeleton } from "@material-ui/lab";
import ClaimBonds from "./ClaimCBonds";
import _ from "lodash";
import { allBondsMap } from "src/helpers/AllBonds";
import { useWeb3Context } from "../../hooks";
import { prettifySeconds, secondsUntilBlock, shorten, trim } from "../../helpers";

import { calculateUserCBondDetails, calculateSnapShot, getSnapshotAndTime } from "../../slices/AccountSlice";
// const { connect, address, provider, chainID, connected, hasCachedProvider } = useWeb3Context();
import { getAprs } from "../../slices/AccountSlice";


function ChooseCBond() {
  const { cbonds } = useCBonds();
  const dispatch = useDispatch();
  const isSmallScreen = useMediaQuery("(max-width: 733px)"); // change to breakpoint query
  const isVerySmallScreen = useMediaQuery("(max-width: 420px)");

  const isAppLoading = useSelector(state => state.app.loading);
  const isAccountLoading = useSelector(state => state.account.loading);

  const accountBonds = useSelector(state => {
    const withInterestDue = [];
    for (const bond in state.account.bonds) {
      if (Number.parseInt(state.account.bonds[bond].id) < 6) continue;
      if (Number.parseFloat(state.account.bonds[bond].pendingPayout) > 0) {
        withInterestDue.push(state.account.bonds[bond]);
      }
    }
    return withInterestDue;
  });

  const marketPrice = useSelector(state => {
    return state.app.marketPrice;
  });

  const snapTime = useSelector(state => {
    return state.account.snapTime;
  });
  console.log('snapTime => ', snapTime, snapTime.snapShot, snapTime.currentTime);

  // const snapShot = useSelector(state => {
  //   return state.account.snapShot;
  // });

  const treasuryBalance = useSelector(state => {
    if (state.bonding.loading == false) {
      let tokenBalances = 0;
      for (const bond in allBondsMap) {
        if (state.bonding[bond]) {
          tokenBalances += state.bonding[bond].purchased;
        }
      }
      return tokenBalances;
    }
  });


  const getAPR = async () => {
    dispatch(getAprs());
  }

  useEffect (() => {
    setInterval(() => getAPR(), 10000);
  }, []);

  const { connect, address, provider, chainID, connected, hasCachedProvider } = useWeb3Context();
const [ timerID1, setTimerID1 ] = useState(0);

const reload1 = (param, param2) => {
  cbonds.map(bond => {
    dispatch(calculateUserCBondDetails({ address: param, bond, provider: param2, networkID: chainID }));
  });
}

const loadSnapShot = async () => {
  dispatch(getSnapshotAndTime({ address, provider, networkID: chainID }));
}

const onSnapShot = () => {
  dispatch(calculateSnapShot({ address, provider, networkID: chainID}));
  dispatch(getSnapshotAndTime({ address, provider, networkID: chainID }));
}

useEffect ( () => {
  if(address) {
    loadSnapShot();
  }
}, [address, provider]);


useEffect (() => {
  let intervalID = setInterval(() => {
    reload1(address, provider);
  }, 5000);
  setTimerID1(intervalID);
  return () => clearInterval(timerID1);
}, [address, provider]);

  return (
    <div id="choose-bond-view">
      {/*!isAccountLoading && */!_.isEmpty(accountBonds) && <ClaimBonds activeBonds={accountBonds} />}

      <Zoom in={true}>
        <Paper className="ohm-card">
        <TableRow>
          <TableCell align="left" className="bond-name-cell">
              <Typography variant="h3">Lock Day: 3 days</Typography>
          </TableCell>
          <TableCell align="left" className="bond-name-cell">
            {( snapTime.snapShot <= snapTime.currentTime) ? 
              <Button variant="text" onClick={onSnapShot}>
                SnapShot
              </Button>
              :
              <Typography variant="h3">{ 'RemainTime: ' + prettifySeconds(snapTime.snapShot - snapTime.currentTime) }</Typography>
            }
            
          </TableCell>
        </TableRow>

          {/* <Box className="card-header">
            <Typography variant="h5">Lock Day: 3 days</Typography>
          </Box> */}

       

          {/* <Grid container item xs={12} style={{ margin: "10px 0px 20px" }} className="bond-hero">
            <Grid item xs={6}>
              <Box textAlign={`${isVerySmallScreen ? "left" : "center"}`}>
                <Typography variant="h5" color="textSecondary">
                  Treasury Balance
                </Typography>
                <Typography variant="h4">
                  {isAppLoading ? (
                    <Skeleton width="180px" />
                  ) : (
                    new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                    }).format(treasuryBalance)
                  )}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} className={`ohm-price`}>
              <Box textAlign={`${isVerySmallScreen ? "right" : "center"}`}>
                <Typography variant="h5" color="textSecondary">
                  XOD Price
                </Typography>
                <Typography variant="h4">
                  {isAppLoading ? <Skeleton width="100px" /> : formatCurrency(marketPrice, 2)}
                </Typography>
              </Box>
            </Grid>
          </Grid> */}

          {!isSmallScreen && (
            <Grid container item>
              <TableContainer>
                <Table aria-label="Available bonds">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">LP tokens</TableCell>
                      <TableCell align="left">Price</TableCell>
                      <TableCell align="center">APR+CRANK</TableCell>
                      <TableCell align="center">Total Staked</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cbonds.map(bond => (
                      <BondTableData key={bond.name} bond={bond} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
        </Paper>
      </Zoom>

      {isSmallScreen && (
        <Box className="ohm-card-container">
          <Grid container item spacing={2}>
            {cbonds.map(bond => (
              <Grid item xs={12} key={bond.name}>
                <BondDataCard key={bond.name} bond={bond} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </div>
  );
}

export default ChooseCBond;

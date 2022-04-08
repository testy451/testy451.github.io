import { Paper, Button, Tabs, Box, Grid, FormControl, OutlinedInput, InputAdornment, Typography } from "@material-ui/core";
import InfoTooltipMulti from "../../components/InfoTooltip/InfoTooltipMulti";

import TabPanel from "../../components/TabPanel";
import CardHeader from "../../components/CardHeader/CardHeader";

import * as React from 'react';
// import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
// import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


export function PresaleCard({address, currentExchangeRate, currentBonusRate, cstPurchaseBalance, cstpTotalSupply, cstInCirculation, cstpBalance, inputBUSDAmount, 
    hasAllowance, setCSTPBalanceCallback, setBUSDBalanceCallback, setMax, modalButton, tokenKind, handleChange}) {
    if (currentBonusRate !== null && currentBonusRate != undefined) {
      console.log("total approved amount: ", currentBonusRate.toString());
    }

    if (currentExchangeRate !== null && currentExchangeRate != undefined) {
      console.log("currentExchangeRate: ", currentExchangeRate.toString());
    }
    
    
    
      return (
        <Paper className="ohm-card">
        <Box display="flex">
          <CardHeader title="DXTC3 TOKEN MINT" />
        </Box>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <Typography align="right">Price: <b>${currentExchangeRate.toFixed(2)}</b></Typography>
              </Grid>
              {/* <Grid item xs={12} sm={12} md={12} lg={12}>
                <Typography align="right">Total approved amount: <b>{(currentBonusRate)} </b></Typography>
              </Grid> */}
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <Typography align="right">Total Value: <b>${inputBUSDAmount.toFixed(2)}</b></Typography>
              </Grid>
            </Grid>
            {/* <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <FormControl className="ohm-input" variant="outlined" color="primary" fullWidth>
                  <div>
                    <p>Total Sale Amount</p>
                  </div>
                  <OutlinedInput
                    id="outlined-adornment-amount"
                    placeholder=""
                    readOnly={true}
                    value={cstpTotalSupply ? '$'+ cstpTotalSupply : '-'}
                  // startAdornment={<InputAdornment position="start">$</InputAdornment>}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <FormControl className="ohm-input" variant="outlined" color="primary" fullWidth>
                  <div>
                    <p>In Circulation</p>
                  </div>
                  <OutlinedInput
                    value={cstInCirculation ? '$' + (cstpTotalSupply- cstInCirculation).toFixed(2) : '-'}
                    readOnly={true}
                    // startAdornment={<InputAdornment position="start">$</InputAdornment>}
                    labelWidth={0}
                  />
                </FormControl>
              </Grid>
            </Grid> */}
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={6} sm={6} md={6} lg={6}>
                <FormControl className="ohm-input" variant="outlined" color="primary" fullWidth>
                  <div>
                    <p>Token Amount</p>
                  </div>
                  <OutlinedInput
                    id="outlined-adornment-amount"
                    placeholder="0"
                    // value={cstpBalance ? cstpBalance.toFixed(2) : ''}
                    onChange={e => setBUSDBalanceCallback(e.target.value)}
                    // startAdornment={<InputAdornment position="start">$</InputAdornment>}
                    labelWidth={0}
                    // endAdornment={
                    //   <InputAdornment position="end">
                    //     <Button variant="text" onClick={setMax}>
                    //       Max
                    //     </Button>
                    //   </InputAdornment>
                    // }
                  />
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={6} md={6} lg={6}>
                <FormControl className="ohm-input" variant="outlined" color="primary" fullWidth>
                  <div>
                    <p>Select</p>
                  </div>
                  <Select
                    // labelId="demo-simple-select-label"
                    id="outlined-adornment-amount"
                    value={tokenKind}
                    label="Token Kind"
                    onChange={handleChange}
                    style={{color: 'white'}}
                  >
                    <MenuItem value={10}>BNB</MenuItem>
                    <MenuItem value={20}>BTC</MenuItem>
                    <MenuItem value={30}>CAKE</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="flex-end" style={{ marginTop: '20px' }}>
              <Grid item xs={12} sm={4} md={4} lg={4} />
              <Grid item xs={12} sm={4} md={4} lg={4}>
                <FormControl className="ohm-input" variant="outlined" color="primary" fullWidth>
                  {address ? (hasAllowance() ? modalButton[1] : modalButton[2]) : modalButton[0]}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4} md={4} lg={4} />
              {!hasAllowance() && (
                <div className="help-text">
                  <em>
                    <Typography variant="body2">
                      Note: The "Approve" transaction is only needed when burning for the first time; subsequent burning only
                      requires you to perform the "Burn" transaction.
                    </Typography>
                  </em>
                </div>
              )}
            </Grid>
            
          </Grid>
        </Grid>
      </Paper>
    )
}
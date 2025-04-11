import React, { useState, useEffect } from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Typography, Stack, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@txnlab/use-wallet-react";
import WalletIcon from "static/icon-wallet.svg";
import CloseIcon from "@mui/icons-material/Close";

// Define the WalletId type
type WalletId = 'kibisis' | 'pera' | 'myalgo' | 'defly' | 'exodus' | 'walletconnect';

const WalletModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { activeAccount, wallets, connect } = useWallet(); 
  const [selectedNetwork, setSelectedNetwork] = useState("voi-mainnet");

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleNavigateToWallet = () => {
    navigate("/wallet");
    handleClose();
  };

  const handleConnectWalletAccount = (wallet: any, address: string) => {
    wallet.setActiveAccount(address);
    handleClose();
  };

  const handleNetworkChange = (event: any) => {
    setSelectedNetwork(event.target.value);
    console.log("Selected Network:", event.target.value);
  };

  // Type the walletOptions object
  const walletOptions: Record<WalletId, string> = {
    'kibisis': 'Kibisis',
    'pera': 'Pera Wallet',
    'myalgo': 'MyAlgo',
    'defly': 'Defly Wallet',
    'exodus': 'Exodus',
    'walletconnect': 'WalletConnect',
  };
console.log({wallets})
  const handleConnectWallet = async (walletId: string) => {
    try {
      await connect(walletId);
      handleClose(); // Close modal after successful connection
    } catch (error) {
      console.error("Wallet connection error:", error);
      // Handle the error (e.g., display an error message)
    }
  };

  return (
    <>
      <img
        style={{
          height: "45px",
          cursor: "pointer",
          zIndex: 100,
        }}
        src={WalletIcon}
        onClick={handleOpen}
        alt="Wallet Icon"
      />

      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            backgroundColor: "#4D005A",
            borderRadius: "30px",
            color: "#FFD54F",
            padding: "10px",
            maxWidth: "400px",
            width: "100%"
          }
        }}
      >
        <DialogTitle sx={{ color: "#FFD54F", fontWeight: "bold" }}>
          Wallet Options
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: '#FFD54F',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>

          <FormControl fullWidth sx={{ mb: 2, mt: 3 }}>
            <InputLabel id="network-select-label" sx={{color:'#FFD54F'}}>Network</InputLabel>
            <Select
              labelId="network-select-label"
              id="network-select"
              value={selectedNetwork}
              label="Network"
              onChange={handleNetworkChange}
              sx={{color: '#FFD54F', '.MuiOutlinedInput-notchedOutline': { borderColor: '#FFD54F' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': {borderColor: '#FFD54F'}, '& .MuiSvgIcon-root': {color: '#FFD54F'}}}
            >
              <MenuItem value="voi-mainnet">Voi Mainnet</MenuItem>
              <MenuItem value="voi-testnet">Voi Testnet</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {wallets?.map(({connect,id,metadata}) => (
              <Button
                key={id}
                variant="outlined"
                onClick={connect} // Use the connect function
                sx={{
                  color: "#FFD54F",
                  borderColor: "#FFD54F",
                  "&:hover": {
                    borderColor: "#FFA000",
                    backgroundColor: "rgba(255, 160, 0, 0.1)"
                  }
                }}
              >
                {id}
              </Button>
            ))}
          </Box>

          {/* <Button
            fullWidth
            variant="contained"
            onClick={handleNavigateToWallet}
            sx={{
              backgroundColor: "#93f",
              borderRadius: "15px",
              color: "white",
              marginBottom: "20px",
              "&:hover": {
                backgroundColor: "#7b2cbf",
              }
            }}
          >
            Go to Wallet Page
          </Button> */}

          {wallets && wallets.length > 0 && (
            <Box sx={{ mt: 2 }}>
              {/* <Typography variant="h6" sx={{ color: "#FFD54F", mb: 1 }}>
                Connect Wallet Account
              </Typography> */}
              
              {wallets.map((wallet) => (
                <Box key={wallet.id} sx={{ mb: 2 }}>
                  {/* <Typography sx={{ color: "#FFD54F", fontWeight: "bold" }}>
                    {walletOptions[wallet.id as WalletId] || wallet.id.charAt(0).toUpperCase() + wallet.id.slice(1)}
                  </Typography> */}
                  
                  {wallet.accounts.map((account) => (
                    <Stack 
                      key={account.address}
                      direction="row" 
                      justifyContent="space-between" 
                      alignItems="center" 
                      sx={{ 
                        backgroundColor: "rgba(255, 213, 79, 0.1)", 
                        p: 1, 
                        borderRadius: "10px",
                        mb: 1
                      }}
                    >
                      <Typography sx={{ color: "#FFD54F" }}>
                        {account.address.slice(0, 6)}...{account.address.slice(-4)}
                      </Typography>
                      
                      {activeAccount?.address !== account.address && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>wallet?.connect()}
                          sx={{ 
                            color: "#FFD54F", 
                            borderColor: "#FFD54F",
                            "&:hover": {
                              borderColor: "#FFA000",
                              backgroundColor: "rgba(255, 160, 0, 0.1)"
                            }
                          }}
                        >
                          Connect
                        </Button>
                      )}
                      
                      {activeAccount?.address === account.address && (
                        <Box sx={{ 
                          backgroundColor: "rgba(153, 51, 255, 0.3)", 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: "5px",
                          color: "#93f"
                        }}>
                          Active
                        </Box>
                      )}
                    </Stack>
                  ))}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletModal;
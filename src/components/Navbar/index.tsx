import styled from "@emotion/styled";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LightLogo from "static/logo-light.svg";
import DarkLogo from "static/logo-dark.svg";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import ThemeSelector from "../ThemeSelector";

import Box from "@mui/material/Box";
import Popper from "@mui/material/Popper";
import Fade from "@mui/material/Fade";
import { useWallet, Wallet } from "@txnlab/use-wallet-react";
import { Chip, Divider, Stack } from "@mui/material";

import { useCopyToClipboard } from "usehooks-ts";
import { toast } from "react-toastify";
import ConnectWallet from "../ConnectWallet";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import { arc200 } from "ulujs";
import { TOKEN_VIA } from "../../contants/tokens";
import { getAlgorandClients } from "../../wallets";
import { arc200_balanceOf } from "ulujs/types/arc200";
import VOIIcon from "static/crypto-icons/voi/0.svg";
import VIAIcon from "static/crypto-icons/voi/6779767.svg";
import HomeIcon from "@mui/icons-material/Home";
import AlgodClient from "algosdk/dist/types/client/v2/algod/algod";

const AccountIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="33"
      height="32"
      viewBox="0 0 33 32"
      fill="none"
    >
      <path
        d="M27.5 28C27.5 26.1392 27.5 25.2089 27.2632 24.4518C26.7299 22.7473 25.3544 21.4134 23.5966 20.8963C22.8159 20.6667 21.8564 20.6667 19.9375 20.6667H13.0625C11.1436 20.6667 10.1841 20.6667 9.40343 20.8963C7.64563 21.4134 6.27006 22.7473 5.73683 24.4518C5.5 25.2089 5.5 26.1392 5.5 28M22.6875 10C22.6875 13.3137 19.9173 16 16.5 16C13.0827 16 10.3125 13.3137 10.3125 10C10.3125 6.68629 13.0827 4 16.5 4C19.9173 4 22.6875 6.68629 22.6875 10Z"
        stroke="#9933FF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const AccountContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 13px;
`;

const Button = styled.div`
  cursor: pointer;
`;

const AccountIconContainer = styled(Button)`
  display: flex;
  width: 45px;
  height: 45px;
  /*
  padding: var(--Main-System-8px, 8px);
  */
  justify-content: center;
  align-items: center;
  gap: var(--Main-System-10px, 10px);
  border-radius: 100px;
  border: 1px solid #93f;
`;

const NavRoot = styled.nav`
  color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px 0px;
  border-bottom: 1px solid #eaebf0;
  backdrop-filter: blur(32px);
`;

const NavContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 80px;
  @media screen and (min-width: 960px) {
    padding: 0px 20px;
  }
`;

const NavLogo = styled.img``;

const NavLinks = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: none;
  align-items: center;
  gap: 24px;
  @media screen and (min-width: 960px) {
    display: inline-flex;
  }
`;

const NavLink = styled.a`
  font-family: Nohemi, sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
  letter-spacing: 0.1px;
  text-align: left;
  text-decoration: none;
  color: #161717;
  cursor: pointer;
  &:hover {
    color: #9933ff !important;
  }
  text-align: center;
  padding-left: 6px;
  padding-right: 6px;
`;

const ActiveNavLink = styled(NavLink)`
  color: #9933ff;
  border-bottom: 3px solid #9933ff;
`;

const LgIconLink = styled.a`
  display: none;
  cursor: pointer;
  &:hover {
    color: #9933ff;
  }
  @media screen and (min-width: 600px) {
    display: inline-flex;
  }
`;

const ConnectButton = styled.svg`
  cursor: pointer;
`;

const linkLabels: any = {
  "/collection": "Collections",
  "/listing": "Buy",
};

// Define your own WalletContextType based on the expected structure
interface WalletContextType {
    activeAccount: any; // Replace 'any' with the actual type if known
    providers: any[]; // Replace 'any[]' with the actual type if known
    wallets: Wallet[]; // Include wallets
    isReady: boolean; // Include isReady
    algodClient: AlgodClient; // Include algodClient
    setAlgodClient: Dispatch<SetStateAction<AlgodClient>>; // Include setAlgodClient
    signTransactions: (transactions: any[]) => Promise<void>; // Adjust types as necessary
    sendTransactions: (transactions: Uint8Array[]) => Promise<void>; // Adjust types as necessary
    connectedAccounts: any[]; // Replace 'any[]' with the actual type if known
    getAccountInfo: () => Promise<any>; // Add getAccountInfo function
}

const Navbar = () => {
  const location = useLocation();

  /* Copy to clipboard */

  const [copiedText, copy] = useCopyToClipboard();

  const handleCopy = (text: string) => () => {
    copy(text)
      .then(() => {
        console.log("Copied!", { text });
        toast.success("Copied to clipboard!");
      })
      .catch((error) => {
        toast.error("Failed to copy to clipboard!");
      });
  };

  /* Wallet */

  // Using type assertion to tell TypeScript that useWallet() returns our extended WalletContextType
  const { wallets, activeAccount } = useWallet();
  
  // Implementing getAccountInfo manually
  const getAccountInfo = async () => {
    if (!activeAccount) return null;
    const { algodClient } = getAlgorandClients();
    try {
      return await algodClient.accountInformation(activeAccount.address).do();
    } catch (error) {
      console.error("Error fetching account info:", error);
      return null;
    }
  };

  const [accInfo, setAccInfo] = React.useState<any>(null);
  const [balance, setBalance] = React.useState<any>(null);

  // EFFECT: get voi balance
  useEffect(() => {
    if (activeAccount && wallets && wallets.length >= 3) {
      getAccountInfo().then(setAccInfo);
    }
  }, [activeAccount, wallets]);

  // EFFECT: get voi balance
  useEffect(() => {
    if (activeAccount && wallets && wallets?.length >= 3) {
      const { algodClient, indexerClient } = getAlgorandClients();
      const ci = new arc200(TOKEN_VIA, algodClient, indexerClient);
      ci.arc200_balanceOf(activeAccount.address).then(
        (arc200_balanceOfR: any) => {
          if (arc200_balanceOfR.success) {
            setBalance(Number(arc200_balanceOfR.returnValue));
          }
        }
      );
    }
  }, [activeAccount, wallets]);

  /* Theme */

  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );

  /* Navigation */

  const navigate = useNavigate();
  /*
  const [active, setActive] = React.useState("");
  */

  /* Popper */

  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen((previousOpen) => !previousOpen);
  };

  const canBeOpen = open && Boolean(anchorEl);
  const id = canBeOpen ? "transition-popper" : undefined;

  return (
    <NavRoot
      style={{
        backgroundColor: isDarkTheme ? "#161717" : undefined,
        borderBottom: isDarkTheme ? "none" : undefined,
      }}
    >
      <NavContainer>
        <Link to="/">
          {/*<NavLogo src={isDarkTheme ? DarkLogo : LightLogo} /> */}
          <HomeIcon fontSize="large" />
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <NavLinks>
            {/*[
              
              {
                label: "Buy",
                href: "/listing",
              },
              {
                label: "Collections",
                href: "/collection",
              },
            ].map((item) =>
              linkLabels[location.pathname] === item.label ? (
                <ActiveNavLink
                  onClick={() => {
                    navigate(item.href);
                  }}
                >
                  {item.label}
                </ActiveNavLink>
              ) : (
                <NavLink
                  style={{ color: isDarkTheme ? "#717579" : undefined }}
                  onClick={() => {
                    navigate(item.href);
                  }}
                >
                  {item.label}
                </NavLink>
              )
                )*/}
          </NavLinks>
          <ul
            style={{
              listStyleType: "none",
              margin: 0,
              padding: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: "24px",
            }}
          >
            {/* moon icon */}
            <li style={{ color: isDarkTheme ? "#717579" : undefined }}>
              <ThemeSelector>
                {isDarkTheme ? (
                  <WbSunnyOutlinedIcon />
                ) : (
                  <LgIconLink>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 15.8442C20.6866 16.4382 19.2286 16.7688 17.6935 16.7688C11.9153 16.7688 7.23116 12.0847 7.23116 6.30654C7.23116 4.77135 7.5618 3.3134 8.15577 2C4.52576 3.64163 2 7.2947 2 11.5377C2 17.3159 6.68414 22 12.4623 22C16.7053 22 20.3584 19.4742 22 15.8442Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </LgIconLink>
                )}
              </ThemeSelector>
            </li>
          </ul>
          {activeAccount && accInfo ? (
            <StyledLink to={`/account/${activeAccount?.address}`}>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <div
                  style={{
                    color: isDarkTheme ? "#717579" : undefined,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      display: { xs: "none", sm: "flex" },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <img src={VOIIcon} style={{ height: "12px" }} />
                      <div>
                        {(
                          (accInfo.amount - accInfo["min-balance"]) /
                          1e6
                        ).toLocaleString()}{" "}
                        VOI
                      </div>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <img src={VIAIcon} style={{ height: "12px" }} />
                      <div>{(balance / 1e6).toLocaleString()} VIA</div>
                    </Stack>
                  </Stack>
                </div>
              </Stack>
            </StyledLink>
          ) : null}
          <AccountContainer>
            <ConnectWallet />
          </AccountContainer>
        </div>
      </NavContainer>
    </NavRoot>
  );
};

export default Navbar;
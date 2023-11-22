import { ADAPTER_EVENTS } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { Web3AuthNoModal } from '@web3auth/no-modal';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { WALLET_TYPE, TICKET_NFT_CHAIN_ID_HEX } from 'components/utils';
import { providers } from 'ethers';
import { useRouter } from 'next/router';
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

export const ClientContext = createContext({});

export function ClientContextProvider({ children }) {
  const [mmProvider, setMMProvider] = useState(''); // window.ehterum Provider
  const [web3Provider, setWeb3Provider] = useState(''); // ethers.providers.Web3Provider()
  const [web3ProviderReload, setWeb3ProviderReload] = useState('');
  const [signer, setSigner] = useState(''); // ethers.getSigner()
  const [accounts, setAccounts] = useState([]);
  const [web3auth, setWeb3auth] = useState(null);
  const [snsProvider, setSNSProvider] = useState(null);
  const [bwAddress, setBWAddress] = useState('');
  const [urlBWAddress, setUrlBWAddress] = useState('');
  const [nftFetchCount, setNFTFetchCount] = useState(0);
  const [mailAddressFromSessionId, setMailAddressFromSessionId] = useState('');
  const [web3authRedirect, setWeb3authRedirect] = useState({
    isRedirect: false,
    isAuthorized: false,
  });

  const router = useRouter();

  // WCの接続をリセット（ログアウト or ウォレットとのセッション切れ
  const resetApp = async () => {
    setAccounts([]);
    // router.push('/');
    router.reload();
    router.push('/');
  };

  const checkAccountChanged = async () => {
    sessionStorage.clear();
    setAccounts([]);
    await resetApp();
  };

  const checkConnectionToWallet = async () => {
    const walletType = JSON.parse(sessionStorage.getItem('WALLET_TYPE'));
    switch (walletType) {
      case WALLET_TYPE.METAMASK:
        try {
          const { ethereum } = window;
          ethereum.on('accountsChanged', checkAccountChanged);

          const walletProvider = new providers.Web3Provider(ethereum);
          const walletSigner = walletProvider.getSigner();
          const account = await walletSigner.getAddress();
          setAccounts([account]);
          setMMProvider(ethereum);
          setWeb3Provider(walletProvider);
          setWeb3ProviderReload(walletProvider);
          setSigner(walletSigner);
        } catch (e) {
          console.log(e);
          sessionStorage.setItem(
            'WALLET_TYPE',
            JSON.stringify(WALLET_TYPE.NO_LOGIN),
          );
        }
        break;
      case WALLET_TYPE.WEB3AUTH:
        try {
          const chainConfig = {
            chainNamespace: 'eip155',
            chainId: TICKET_NFT_CHAIN_ID_HEX,
            rpcTarget:
              process.env.IS_ZKEVM === true
                ? process.env.TESTNET_RPC_PROVIDER
                : process.env.MAINNET_RPC_PROVIDER,
          };
          const web3auth = new Web3AuthNoModal({
            clientId: process.env.WEB3AUTH_CLIENT_ID,
            chainConfig,
            web3AuthNetwork: process.env.WEB3AUTH_NETWORK,
            storageKey: 'local',
            sessionTime: 86400 * 7, // 7day
          });

          const privateKeyProvider = new EthereumPrivateKeyProvider({
            config: { chainConfig },
          });
          // Web3authの設定
          // 参考：https://web3auth.io/docs/sdk/web/openlogin#web3authno-modal
          const openloginAdapter = new OpenloginAdapter({
            loginSettings: {
              mfaLevel: 'none', // default, optional, mandatory, none
            },
            adapterSettings: {
              redirectUrl: process.env.WEB3AUTH_REDIRECT_URL,
              uxMode: 'redirect',
              whiteLabel: {
                name: 'NFT TICKET HUB',
                logoLight: 'https://web3auth.io/images/w3a-L-Favicon-1.svg',
                logoDark: 'https://web3auth.io/images/w3a-D-Favicon-1.svg',
                defaultLanguage: 'ja', // en
                dark: false, // whether to enable dark mode. defaultValue: false
              },
            },
            privateKeyProvider,
          });
          web3auth.configureAdapter(openloginAdapter);
          subscribeAuthEvents(web3auth); // web3auth.init()の前に実行する必要がある
          await web3auth.init();

          const walletProvider = new providers.Web3Provider(web3auth.provider);
          const walletSigner = walletProvider.getSigner();
          const account = await walletSigner.getAddress();

          setAccounts([account]);
          setMMProvider(web3auth.provider);
          setWeb3Provider(walletProvider);
          setWeb3ProviderReload(walletProvider);
          setSigner(walletSigner);
          setWeb3auth(web3auth);
        } catch (e) {
          console.log(e);
          sessionStorage.setItem(
            'WALLET_TYPE',
            JSON.stringify(WALLET_TYPE.NO_LOGIN),
          );
        }
        break;
      default:
        if (walletType != WALLET_TYPE.NO_LOGIN) {
          sessionStorage.setItem(
            'WALLET_TYPE',
            JSON.stringify(WALLET_TYPE.NO_LOGIN),
          );
        }
    }
  };

  const subscribeAuthEvents = (_web3auth) => {
    _web3auth.on(ADAPTER_EVENTS.CONNECTED, (data) => {
      setWeb3authRedirect((prevData) => ({
        ...prevData,
        ['isAuthorized']: true,
      }));
    });
  };

  const initWeb3auth = async () => {
    try {
      const chainConfig = {
        chainNamespace: 'eip155',
        chainId: TICKET_NFT_CHAIN_ID_HEX,
        rpcTarget:
          process.env.IS_ZKEVM === true
            ? process.env.TESTNET_RPC_PROVIDER
            : process.env.MAINNET_RPC_PROVIDER,
      };
      const newWeb3auth = new Web3AuthNoModal({
        clientId: process.env.WEB3AUTH_CLIENT_ID,
        chainConfig,
        web3AuthNetwork: process.env.WEB3AUTH_NETWORK,
        storageKey: 'local',
        sessionTime: 86400, // 7day
      });

      const privateKeyProvider = new EthereumPrivateKeyProvider({
        config: { chainConfig },
      });
      // Web3authの設定
      // 参考：https://web3auth.io/docs/sdk/web/openlogin#web3authno-modal
      const openloginAdapter = new OpenloginAdapter({
        loginSettings: {
          mfaLevel: 'none', // default, optional, mandatory, none
        },
        adapterSettings: {
          redirectUrl: process.env.WEB3AUTH_REDIRECT_URL,
          uxMode: 'redirect',
          whiteLabel: {
            name: 'NFT TICKET HUB',
            logoLight: 'https://web3auth.io/images/w3a-L-Favicon-1.svg',
            logoDark: 'https://web3auth.io/images/w3a-D-Favicon-1.svg',
            defaultLanguage: 'ja', // en
            dark: false, // whether to enable dark mode. defaultValue: false
          },
        },
        privateKeyProvider,
      });
      newWeb3auth.configureAdapter(openloginAdapter);
      subscribeAuthEvents(newWeb3auth); // web3auth.init()の前に実行する必要がある
      await newWeb3auth.init();
      setWeb3auth(newWeb3auth);

      // web3authのセッションIDからメールアドレスを取得
      try {
        const info = await newWeb3auth.getUserInfo();
        setMailAddressFromSessionId(info.email);
      } catch (e) {
        console.log(e);
      }

      return newWeb3auth;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  useEffect(() => {
    initWeb3auth();
    const walletType = JSON.parse(sessionStorage.getItem('WALLET_TYPE'));
    checkConnectionToWallet(walletType);
  }, []);

  const value = useMemo(
    () => ({
      accounts,
      setAccounts,
      mmProvider,
      setMMProvider,
      web3Provider,
      web3ProviderReload,
      setWeb3Provider,
      signer,
      setSigner,
      resetApp,
      checkAccountChanged,
      snsProvider,
      setSNSProvider,
      web3auth,
      setWeb3auth,
      bwAddress,
      setBWAddress,
      urlBWAddress,
      setUrlBWAddress,
      nftFetchCount,
      setNFTFetchCount,
      mailAddressFromSessionId,
      initWeb3auth,
      web3authRedirect,
      setWeb3authRedirect,
    }),
    [
      accounts,
      setAccounts,
      mmProvider,
      setMMProvider,
      web3Provider,
      web3ProviderReload,
      setWeb3Provider,
      signer,
      setSigner,
      resetApp,
      checkAccountChanged,
      snsProvider,
      setSNSProvider,
      web3auth,
      setWeb3auth,
      bwAddress,
      setBWAddress,
      urlBWAddress,
      setUrlBWAddress,
      nftFetchCount,
      setNFTFetchCount,
      mailAddressFromSessionId,
      initWeb3auth,
      web3authRedirect,
      setWeb3authRedirect,
    ],
  );

  return (
    <ClientContext.Provider
      value={{
        ...value,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useWalletConnectClient() {
  const context = React.useContext(ClientContext);
  if (context === undefined) {
    throw new Error(
      'useWalletConnectClient must be used within a ClientContextProvider',
    );
  }
  return context;
}

import {
  BiconomySmartAccountV2,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from '@biconomy/account';
import { ChainId } from '@biconomy/core-types';
import {
  ECDSAOwnershipValidationModule,
  DEFAULT_ECDSA_OWNERSHIP_MODULE,
} from '@biconomy/modules';
import {
  PaymasterMode,
} from '@biconomy/paymaster';
import { WALLET_ADAPTERS } from '@web3auth/base';
import { bundler, paymaster } from 'components/biconomy';
import { MailLoginModal, MintModal } from 'components/modal';
import {
  WALLET_TYPE,
  TOTAL_CONTRACT_COUNT,
  FIXED_RPC_PROVIDER,
  TX_STATUS,
  ONCHAIN_EVENT,
  DB_CONSUME_FLAG,
} from 'components/utils';
import ParticipationTicket from 'contracts/ParticipationTicket.json';
import { Wallet, providers, ethers } from 'ethers';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { API_RESPONSE } from 'pages/api/api-constants';
import { useState, useEffect } from 'react';
import { useWalletConnectClient } from '../components/contexts/ClientContext';
import { NFTTicketAddressArray } from '../contracts';

export default function Home() {
  const {
    accounts,
    setAccounts,
    setMMProvider,
    web3ProviderReload,
    setWeb3Provider,
    signer,
    setSigner,
    checkAccountChanged,
    web3auth,
    setWeb3auth,
    nftFetchCount,
    setNFTFetchCount,
    mailAddressFromSessionId,
    initWeb3auth,
    web3authRedirect,
    setWeb3authRedirect,
  } = useWalletConnectClient();

  const [isLoading, setIsLoading] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isLoginClick, setLoginClick] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [txStatus, setTxStatus] = useState(TX_STATUS.NOT_START);
  const [txErrorMessage, setTxErrorMessage] = useState('');
  const [ticketInfo, setTicketInfo] = useState([]);
  const [smartAccount, setSmartAccount] = useState('');
  const [smartAccountAddress, setSmartAccountAddress] = useState('');

  const router = useRouter();

  // 画面リロード時の処理
  useEffect(() => {
    if (web3ProviderReload == '') return;
    const _nftFetchCount = JSON.parse(sessionStorage.getItem('nftFetchCount'));
    const _walletType = JSON.parse(sessionStorage.getItem('WALLET_TYPE'));

    // ブロックチェーンからのNFT情報の取得が完了しているかのチェック
    if (
      (_nftFetchCount != TOTAL_CONTRACT_COUNT &&
        _walletType == WALLET_TYPE.METAMASK) ||
      (_nftFetchCount != TOTAL_CONTRACT_COUNT &&
        _walletType == WALLET_TYPE.WEB3AUTH)
    ) {
      // NFT情報の取得が完了していない場合は、再取得を行う
      setIsLoading(true);
      setNFTFetchCount(0);
      Promise.all(checkNftTicket(accounts[0]))
        .then(function (messege) {
          sessionStorage.removeItem('mailAddress');
          sessionStorage.setItem(
            'nftFetchCount',
            JSON.stringify(TOTAL_CONTRACT_COUNT),
          );
          setIsLoading(false);
        })
        .catch(function (reason) {
          setIsLoading(false);
          alert(
            'ブロックチェーンのデータ取得に失敗しました。ページをリロードして下さい。',
          );
        });
    }
  }, [web3ProviderReload]);

  // web3authからリダイレクトしてきた際に実行される処理
  useEffect(() => {
    const redirectLogin = async () => {
      if (
        web3authRedirect.isRedirect === true &&
        web3authRedirect.isAuthorized === true
      ) {
        setWeb3authRedirect({
          isRedirect: false,
          isAuthorized: false,
        });

        // web3authからリダイレクトしてきた場合は、セッションストレージからメアドを取得する
        const mailAddress = JSON.parse(sessionStorage.getItem('mailAddress'));
        if (mailAddress === null) {
          loginModalHandleClose();
          setIsLoading(false);
          alert('Web3authログインでエラーが発生しました。');
          setConnecting(WALLET_TYPE.NO_LOGIN);
          await web3auth.logout();
        } else {
          await connectWeb3Auth(mailAddress);
        }
      }
    };
    redirectLogin();
  }, [web3authRedirect]);

  // 参加券NFTの情報を、DBから取得する
  useEffect(() => {
    if (accounts.length > 0) {
      getTicketAPI();
    }
  }, [txStatus, accounts]);

  // Biconomy Smart Accountの作成（初期化）を行う
  useEffect(() => {
    const createAccount = async () => {
      if (signer === '' || process.env.IS_ZKEVM === true) return;
      const ecdsaModule = await ECDSAOwnershipValidationModule.create({
        signer: signer,
        moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
      });

      let biconomySmartAccount = await BiconomySmartAccountV2.create({
        chainId: ChainId.ASTAR_MAINNET,
        bundler: bundler,
        paymaster: paymaster,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
        defaultValidationModule: ecdsaModule,
        activeValidationModule: ecdsaModule,
        index: 0,
      });
      const smartAccountAddress =
        await biconomySmartAccount.getAccountAddress();
      console.log('smart account: ', smartAccountAddress);
      setSmartAccountAddress(smartAccountAddress);
      setSmartAccount(biconomySmartAccount);
    };
    createAccount();
  }, [signer]);

  // コミュニティ画面に遷移する
  const goCommunityPage = async () => {
    sessionStorage.setItem('accounts', JSON.stringify(accounts));
    router.push('/menu');
  };

  // 参加券NFTの所有数を、ブロックチェーンから取得する
  const checkNftTicket = async (addr) => {
    try {
      sessionStorage.setItem('accounts', JSON.stringify(accounts));

      for (let i = 0; i < NFTTicketAddressArray.length; i++) {
        setNFTFetchCountCustom();
        const ParticipationTicketContract = new ethers.Contract(
          NFTTicketAddressArray[i],
          ParticipationTicket.abi,
          FIXED_RPC_PROVIDER,
        );

        const balance = await ParticipationTicketContract.balanceOf(addr);
        if (balance.toNumber() < 1) {
          continue;
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  // メタマスク接続
  const connectMetamask = async () => {
    if (isSmartPhone()) {
      /** スマホアプリのMetaMaskブラウザで開かれているかの判定 */
      if (typeof window.ethereum === 'undefined') {
        // MetaMaskブラウザで開かれていない場合
        /**
         * DeepLinkによって、MetaMaskブラウザでMintサイトを開き直す処理を行う
         * DeepLinkのURLの例：https://metamask.app.link/dapp/[MintサイトのURL]
         */
        window.open(
          `https://metamask.app.link/dapp/${location.href}`,
          '_blank',
        );
      } else {
        // MetaMaskブラウザで開かれている場合

        // ウォレット接続を確認する
        window.ethereum
          .request({ method: 'eth_requestAccounts' })
          .then((accounts) => {
            if (accounts.length > 0) {
              // ウォレット接続している場合
              const walletProvider = new ethers.providers.Web3Provider(
                window.ethereum,
              );
              const walletSigner = walletProvider.getSigner();
              sessionStorage.setItem(
                'WALLET_TYPE',
                JSON.stringify(WALLET_TYPE.METAMASK),
              );
              setAccounts(accounts);
              setMMProvider(window.ethereum);
              setWeb3Provider(walletProvider);
              setSigner(walletSigner);
              setIsLoading(true);
              setNFTFetchCount(0);

              Promise.all([checkNftTicket(accounts[0])])
                .then(function (messege) {
                  setIsLoading(false);
                  sessionStorage.setItem(
                    'nftFetchCount',
                    JSON.stringify(TOTAL_CONTRACT_COUNT),
                  );
                })
                .catch(function (reason) {
                  setIsLoading(false);
                  alert(
                    'ブロックチェーンのデータ取得に失敗しました。ページをリロードして下さい。',
                  );
                });
              ethereum.on('accountsChanged', checkAccountChanged);
            } else {
              // ウォレット未接続の場合
              alert('接続を許可してください。');
            }
          })
          .catch((e) => {
            if (e.code === 4001) {
              // 接続を拒否した場合にここに来る
              alert('ウォレット接続を拒否しました。');
            } else {
              console.log(e);
              alert('ウォレットに接続してください。');
            }
          });
      }
    } else {
      // PCの場合
      if (typeof window.ethereum === 'undefined') {
        alert('MetaMaskをインストールしてください。');
        return;
      }

      // ウォレット接続を確認する
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((accounts) => {
          if (accounts.length > 0) {
            // ウォレット接続している場合
            const walletProvider = new ethers.providers.Web3Provider(
              window.ethereum,
            );
            const walletSigner = walletProvider.getSigner();
            sessionStorage.setItem(
              'WALLET_TYPE',
              JSON.stringify(WALLET_TYPE.METAMASK),
            );
            setAccounts(accounts);
            setMMProvider(window.ethereum);
            setWeb3Provider(walletProvider);
            setSigner(walletSigner);
            setIsLoading(true);
            setNFTFetchCount(0);

            Promise.all([checkNftTicket(accounts[0])])
              .then(function (messege) {
                setIsLoading(false);
                sessionStorage.setItem(
                  'nftFetchCount',
                  JSON.stringify(TOTAL_CONTRACT_COUNT),
                );
              })
              .catch(function (reason) {
                setIsLoading(false);
                alert(
                  'ブロックチェーンのデータ取得に失敗しました。ページをリロードして下さい。',
                );
              });
            ethereum.on('accountsChanged', checkAccountChanged);
          } else {
            // ウォレット未接続の場合
            alert('接続を許可してください。');
          }
        })
        .catch((e) => {
          if (e.code === 4001) {
            // 接続を拒否した場合にここに来る
            alert('ウォレット接続を拒否しました。');
          } else {
            console.log(e);
            alert('ウォレットに接続してください。');
          }
        });
    }
  };

  // Web3Authによる接続
  const connectWeb3Auth = async (mailAddr) => {
    try {
      setWeb3auth(web3auth);
      let currentWeb3auth = web3auth;

      /**
       * 入力されたメールアドレスが現在のセッションIDのメールアドレスと違う場合は、
       * セッションを削除し、web3authのインスタンスの初期化を行う（再初期化をしないと、古いセッションが影響してしまう）
       */
      if (mailAddr != mailAddressFromSessionId) {
        // ローカルストレージのセッションIDを削除
        localStorage.clear();

        // web3authインスタンスの再初期化
        currentWeb3auth = await initWeb3auth();

        // 正常に初期化できたかのチェック
        if (currentWeb3auth === false) {
          loginModalHandleClose();
          setIsLoading(false);
          alert('Web3authログインでエラーが発生しました。');
          return;
        }
      }

      // web3authへ接続
      let web3AuthProvider;
      if (currentWeb3auth.status === 'connected') {
        web3AuthProvider = currentWeb3auth.provider;
      } else {
        // awaitを付けてconnectTo()を実行すると、エラーが起きてしまうので、awaitは付けない
        currentWeb3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
          loginProvider: 'email_passwordless',
          extraLoginOptions: {
            login_hint: mailAddr,
          },
        });
        return; // web3authのログインでuxMode='redirect'を選択しているので、ここでReturnして良い
      }
      loginModalHandleClose();

      const walletProvider = new ethers.providers.Web3Provider(
        web3AuthProvider,
      );
      const walletSigner = walletProvider.getSigner();
      const addr = await walletSigner.getAddress();
      sessionStorage.setItem(
        'WALLET_TYPE',
        JSON.stringify(WALLET_TYPE.WEB3AUTH),
      );
      setAccounts([addr]);
      setMMProvider(web3AuthProvider);
      setWeb3Provider(walletProvider);
      setSigner(walletSigner);
      setIsLoading(true);
      setNFTFetchCount(0);

      Promise.all([checkNftTicket(addr)])
        .then(function (messege) {
          sessionStorage.removeItem('mailAddress');
          sessionStorage.setItem(
            'nftFetchCount',
            JSON.stringify(TOTAL_CONTRACT_COUNT),
          );
          setIsLoading(false);
        })
        .catch(function (reason) {
          setIsLoading(false);
          alert(
            'ブロックチェーンのデータ取得に失敗しました。ページをリロードして下さい。',
          );
        });
    } catch (e) {
      console.log(e);
      loginModalHandleClose();
      setIsLoading(false);
      alert('Web3authログインでエラーが発生しました。');
    }
  };

  const isSmartPhone = () => {
    let isSmartPhoneFlag = false;
    if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
      isSmartPhoneFlag = true;
    }
    return isSmartPhoneFlag;
  };

  const editTxHash = (longTxHash) => {
    const shortTxHash = longTxHash.slice(0, 6) + '...' + longTxHash.slice(-4);
    return shortTxHash;
  };

  const handleOpen = () => {
    setTxHash('');
    setTxStatus(TX_STATUS.NOT_START);
    setOpen(true); // モーダルを開く
    if (process.env.IS_ZKEVM === false) {
      biconomyMintTicketAPI();
    } else {
      if (process.env.IS_LOCALHOST === true) {
        localhostMintTicketAPI();
      } else {
        airdropMintTicketAPI();
      }
    }
  };
  const handleClose = () => {
    setOpen(false); // モーダルを閉じる
  };

  // ブロックチェーンからのNFT情報の取得数をカウントする
  const setNFTFetchCountCustom = async () => {
    if (nftFetchCount + 1 > TOTAL_CONTRACT_COUNT) {
      setNFTFetchCount(TOTAL_CONTRACT_COUNT);
    } else {
      setNFTFetchCount((prevCount) => prevCount + 1);
    }
  };

  const loginModalHandleOpen = () => {
    setLoginModalOpen(true); // モーダルを開く
  };
  const loginModalHandleClose = () => {
    setLoginClick(false);
    setLoginModalOpen(false); // モーダルを閉じる
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then((res) => {
        setIsCopied(true);
        setTimeout(function () {
          setIsCopied(false); // 一定時間経過後に、コピーアイコンを元に戻す
        }, 2500);
      })
      .catch((e) => {
        setIsCopied(false);
        alert('Walletアドレスのコピーに失敗しました。');
      });
  };

  const renderProgressPercentage = () => {
    const progressPercentage = Math.trunc(
      (nftFetchCount / TOTAL_CONTRACT_COUNT) * 100,
    );
    return (
      <>
        <p
          className={
            'mt-[32px] text-[18px] font-[700] text-[#4C4948] leading-[calc(100%)]'
          }
        >
          {progressPercentage + '% Loading...'}
        </p>
        <div className='mt-[20px] w-[280px] bg-[#22A9BC]/30 rounded-full h-[3px]'>
          <div
            className='bg-[#22A9BC] h-[3px] rounded-full'
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </>
    );
  };

  /**
   * API郡
   */

  // 参加券情報を取得するAPI
  const getTicketAPI = async () => {
    try {
      // APIの実行
      const res = await fetch(`/api/ticket/getSomeTicket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: accounts[0].toLowerCase(),
        }),
      });

      // API ステータスコードのチェック
      if (res.status != API_RESPONSE.OK.CODE) {
        alert('DBエラーが発生しました。');
        return;
      }
      const resJson = await res.json();
      const dbItem = resJson.output?.Items; // items 複数形
      setTicketInfo(dbItem);
    } catch (e) {
      console.log(e);
      alert('DBエラーが発生しました。');
    }
  };

  // NFTをエアドロップするAPI
  const airdropMintTicketAPI = async () => {
    if (process.env.IS_LOCALHOST === true) return;
    try {
      const res = await fetch(`/api/ticket/mintTicket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: accounts[0].toLowerCase(),
        }),
      });

      // API ステータスコードのチェック
      if (res.status != API_RESPONSE.OK.CODE) {
        setTxStatus(TX_STATUS.ERROR);
        setTxErrorMessage('もう一度お試しください');
        return;
      }

      const resJson = await res.json();
      const txHash = resJson.output;

      if (txHash.length == 66) {
        setTxHash(txHash);
        setTxStatus(TX_STATUS.PROGRESS);
      } else {
        setTxStatus(TX_STATUS.ERROR);
        setTxErrorMessage('もう一度お試しください');
        return;
      }
      const receipt = await FIXED_RPC_PROVIDER.waitForTransaction(txHash);
      if (receipt.confirmations > 0) {
        const topics = receipt.logs[0].topics;
        if (topics[0] == ONCHAIN_EVENT.ERC721_TRANSFER_SIGNATURE) {
          const tokenId = parseInt(topics[3], 16);
          console.log('TokenID: ', tokenId);
          await setTicketAPI(tokenId);
          setTxStatus(TX_STATUS.SUCCESS);
        }
      } else {
        setTxStatus(TX_STATUS.ERROR);
      }
    } catch (e) {
      console.log(e);
      setTxStatus(TX_STATUS.ERROR);
      setTxErrorMessage('もう一度お試しください');
    }
  };

  // Biconomyを利用し、ガスレスでMintを行うAPI
  const biconomyMintTicketAPI = async () => {
    if (process.env.IS_ZKEVM === true) return;
    try {
      const provider = new providers.JsonRpcProvider(
        process.env.MAINNET_RPC_PROVIDER, //zkevm
      );
      const nftInstance = new ethers.Contract(
        process.env.MAINNET_TICKET_NFT_CONTRACT_ADDRESS,
        ParticipationTicket.abi,
        provider,
      );
      const balance = await nftInstance.balanceOf(smartAccountAddress);
      if (balance.toNumber() >= 1) {
        setOpen(false);
        alert('すでに参加券を取得済みです。');
        return;
      }

      const nftInterface = new ethers.utils.Interface([
        'function mintTicket(address receiver)',
      ]);
      const data = nftInterface.encodeFunctionData('mintTicket', [
        smartAccountAddress,
      ]);

      const transaction = {
        to: process.env.MAINNET_TICKET_NFT_CONTRACT_ADDRESS,
        data: data,
      };
      const userOp = await smartAccount.buildUserOp([transaction]);
      const biconomyPaymaster = smartAccount.paymaster;

      let paymasterServiceData = {
        mode: PaymasterMode.SPONSORED,
        smartAccountInfo: {
          name: 'BICONOMY',
          version: '2.0.0',
        },
        calculateGasLimits: true,
      };

      const paymasterAndDataResponse =
        await biconomyPaymaster.getPaymasterAndData(
          userOp,
          paymasterServiceData,
        );

      userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;

      if (
        paymasterAndDataResponse.callGasLimit &&
        paymasterAndDataResponse.verificationGasLimit &&
        paymasterAndDataResponse.preVerificationGas
      ) {
        userOp.callGasLimit = paymasterAndDataResponse.callGasLimit;
        userOp.verificationGasLimit =
          paymasterAndDataResponse.verificationGasLimit;
        userOp.preVerificationGas = paymasterAndDataResponse.preVerificationGas;
      }

      const userOpResponse = await smartAccount.sendUserOp(userOp);
      setTxStatus(TX_STATUS.PROGRESS);

      const transactionDetail = await userOpResponse.wait(1);

      const txHash = transactionDetail.receipt.transactionHash;
      if (txHash.length == 66) {
        setTxHash(txHash);
        setTxStatus(TX_STATUS.PROGRESS);
      } else {
        setTxStatus(TX_STATUS.ERROR);
        setTxErrorMessage('もう一度お試しください');
        return;
      }
      const logs = transactionDetail.receipt.logs;
      const singleLog = logs.find(
        (log) => log.topics[0] === ONCHAIN_EVENT.ERC721_TRANSFER_SIGNATURE,
      );

      if (singleLog) {
        const tokenId = parseInt(singleLog.topics[3], 16);
        console.log('TokenID: ', tokenId);
        await setTicketAPI(tokenId);
        setTxStatus(TX_STATUS.SUCCESS);
      } else {
        setTxStatus(TX_STATUS.ERROR);
        setTxErrorMessage('もう一度お試しください');
      }
    } catch (e) {
      console.log(e);
      setTxStatus(TX_STATUS.ERROR);
      setTxErrorMessage('もう一度お試しください');
    }
  };

  // Localhost起動時に、 NFTをエアドロップするAPI
  const localhostMintTicketAPI = async () => {
    if (process.env.IS_LOCALHOST === false) return;
    try {
      const provider = new providers.JsonRpcProvider(
        process.env.TESTNET_RPC_PROVIDER,
      );
      const signer = new Wallet(
        process.env.OPERATION_PRIVATE_KEY,
        provider,
      );

      const nftInstance = new ethers.Contract(
        process.env.TESTNET_TICKET_NFT_CONTRACT_ADDRESS,
        ParticipationTicket.abi,
        signer,
      );

      const balance = await nftInstance.balanceOf(accounts[0]);
      if (balance.toNumber() >= 1) {
        setOpen(false);
        alert('すでに参加券を取得済みです。');
        return;
      }

      const estimatedGasLimit = await nftInstance.estimateGas.mintTicket(
        accounts[0],
      );
      const populateMetaTx = await nftInstance.populateTransaction.mintTicket(
        accounts[0],
      );
      populateMetaTx.chainId = process.env.TESTNET_CHAIN_ID; //zkevm
      populateMetaTx.gasLimit = estimatedGasLimit;
      populateMetaTx.gasPrice = await provider.getGasPrice();
      populateMetaTx.nonce = await provider.getTransactionCount(
        process.env.OPERATION_ADDRESS,
      );

      const txSigned = await signer.signTransaction(populateMetaTx);
      const submittedTx = await provider.sendTransaction(txSigned);
      if (submittedTx.hash) {
        setTxHash(submittedTx.hash);
        setTxStatus(TX_STATUS.PROGRESS);
      } else {
        setTxStatus(TX_STATUS.ERROR);
        setTxErrorMessage('もう一度お試しください');
        return;
      }

      const receipt = await provider.waitForTransaction(submittedTx.hash);
      if (receipt.confirmations > 0) {
        const topics = receipt.logs[0].topics;
        if (topics[0] == ONCHAIN_EVENT.ERC721_TRANSFER_SIGNATURE) {
          const tokenId = parseInt(topics[3], 16);
          console.log('TokenID: ', tokenId);
          await setTicketAPI(tokenId);
          setTxStatus(TX_STATUS.SUCCESS);
        }
      } else {
        setTxStatus(TX_STATUS.ERROR);
      }
    } catch (e) {
      console.log(e);
      setTxStatus(TX_STATUS.ERROR);
      setTxErrorMessage('もう一度お試しください');
    }
  };

  // 参加券情報をDBに格納するAPI
  const setTicketAPI = async (tokenId) => {
    try {
      const res = await fetch(`/api/ticket/setTicket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: accounts[0].toLowerCase(),
          tokenId: tokenId,
          smartAccountAddress: smartAccountAddress.toLowerCase(),
        }),
      });

      // API ステータスコードのチェック
      if (res.status != API_RESPONSE.OK.CODE) {
        setTxStatus(TX_STATUS.ERROR);
        setTxErrorMessage('もう一度お試しください');
        return;
      }
    } catch (e) {
      console.log(e);
      setTxStatus(TX_STATUS.ERROR);
      setTxErrorMessage('もう一度お試しください');
    }
  };

  return (
    <div>
      <Head>
        <title>PARTICIPATION NFTs</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <MailLoginModal
        open={loginModalOpen}
        handleClose={loginModalHandleClose}
        connectWeb3Auth={connectWeb3Auth}
        isLoginClick={isLoginClick}
        setLoginClick={setLoginClick}
      ></MailLoginModal>
      <div className='min-h-[calc(100vh)]'>
        {!accounts.length > 0 ? (
          <div className={'mx-[20px] my-[24px]'}>
            <div className='flex justify-start items-start'>
              <Image
                src={`/new-design/NFTCollections.svg`}
                style={{ objectFit: 'obtain' }}
                width={200}
                height={100}
              />
            </div>

            <div>
              <Image
                className='mt-[32px] ml-[1px] mb-[20px]'
                src={`/new-design/loginText.svg`}
                style={{ objectFit: 'obtain' }}
                width={84}
                height={20}
              />
            </div>

            <div className='mt-[20px]'>
              <p className='text-[#4C4948] font-[700] text-[20px] leading-[calc(100%)]'>
                ログイン方法を選択してください
              </p>
            </div>

            <div
              className='flex justify-between items-center w-[calc(100%)] h-[84px] px-[20px] py-[10px] mt-[32px]
              bg-white/40 rounded-[10px] border-[1px] border-[#4C4948]'
              onClick={connectMetamask}
            >
              <p className='text-[#4C4948] font-[700] text-[20px] leading-[calc(100%)]'>
                MetaMask接続
              </p>
              <Image
                className=''
                src={`/metamask/metamask-fox.svg`}
                style={{ objectFit: 'obtain' }}
                width={42}
                height={42}
              />
            </div>

            <div
              className='flex justify-between items-center w-[calc(100%)] h-[100px] px-[20px] py-[10px] mt-[20px]
              bg-white/40 rounded-[10px] border-[1px] border-[#4C4948]'
              onClick={loginModalHandleOpen}
            >
              <div>
                <p className='text-[#4C4948] font-[700] text-[20px] leading-[calc(100%)] mt-[6px]'>
                  メールログイン
                </p>
                <p className='text-[#A5A4A3] font-[400] text-[12px] leading-[calc(100%)] mt-[10px]'>
                  ※ブラウザのポップアップブロック設定をOFFにしてください
                </p>
              </div>
              <Image
                className='ml-[20px] mr-[3px]'
                src={`/new-design/mailloginIcon.svg`}
                style={{ objectFit: 'obtain' }}
                width={40}
                height={40}
              />
            </div>
          </div>
        ) : isLoading ? (
          <div
            className={
              'absolute top-[-10px] w-[calc(100%)] h-[calc(100%)] flex flex-col justify-center items-center'
            }
          >
            <p
              className={
                'text-[18px] font-[700] text-[#4C4948] leading-[calc(100%)]'
              }
            >
              データを取得しています...
            </p>
            {renderProgressPercentage()}
          </div>
        ) : (
          <div
            className={
              'flex flex-col md:items-left justify-center mx-[20px] my-[22px]'
            }
          >
            <div className='flex flex-row justify-between'>
              <div className='pt-1'>
                <Image
                  src={`/new-design/NFTCollections.svg`}
                  style={{ objectFit: 'obtain' }}
                  width={180}
                  height={20}
                />
              </div>
              <div className='flex flex-row justify-center'>
                <div className='text-align: center'>
                  <div
                    className={
                      'w-[calc(100%)] h-[56.5px] flex justify-center items-center'
                    }
                  >
                    <div
                      className='w-[calc(100%)] h-[70px] rounded-[20px] bg-[#ffbe76] flex justify-center space-x-[10px] items-center'
                      onClick={goCommunityPage}
                    >
                      <p className='text-[#4C4948] font-[600] px-[10px] text-[16px] text-center'>
                        コミュニティ
                        <br />
                        一覧
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex justify-between items-center h-[42px] my-[32px] px-[20px] py-[10px] bg-black/40 rounded-[10px]'>
              <p className='text-[#FFF] font-normal text-[15px] break-words'>
                アドレス
              </p>
              <p className='text-[#FFF] font-normal text-[15px] break-words'>
                ：
              </p>
              <p className='text-[#FFF] font-normal text-[15px] break-words'>
                {smartAccountAddress
                  ? smartAccountAddress.slice(0, 4) +
                    '...' +
                    smartAccountAddress.slice(-5)
                  : accounts[0].slice(0, 4) + '...' + accounts[0].slice(-5)}
              </p>
              {isCopied ? (
                <Image
                  className='ml-[20px] mb-[3px]'
                  src={`/new-design/copiedIcon.svg`}
                  style={{ objectFit: 'obtain' }}
                  width={30}
                  height={30}
                  onClick={() =>
                    copyToClipboard(
                      smartAccountAddress ? smartAccountAddress : accounts[0],
                    )
                  }
                />
              ) : (
                <Image
                  className='ml-[25px] mb-[1px]'
                  src={`/new-design/copyIcon.svg`}
                  style={{ objectFit: 'obtain' }}
                  width={25}
                  height={25}
                  onClick={() =>
                    copyToClipboard(
                      smartAccountAddress ? smartAccountAddress : accounts[0],
                    )
                  }
                />
              )}
            </div>
            <div className='text-align: center'>
              <div
                className={
                  'w-[calc(100%)] h-[56.5px] flex justify-center items-center'
                }
              >
                <div
                  className='w-[calc(100%)] h-[58.5px] rounded-[10px] bg-[#22A9BC] flex justify-center space-x-[10px] items-center'
                  onClick={handleOpen}
                >
                  <Image
                    src={`/new-design/ticketIcon.svg`}
                    style={{ objectFit: 'obtain' }}
                    width={25}
                    height={25}
                  />
                  <p className='text-white font-[600] text-[20px]'>
                    コミュニティ参加券を受け取る
                  </p>
                </div>
              </div>
            </div>
            <>
              <div className='ml-[1px] mt-[45px] mb-[22px]'>
                <p className='text-[#4C4948] font-[600] text-[23px]'>
                  獲得済み参加券
                </p>
              </div>
              {ticketInfo.length > 0 ? (
                <>
                  <p className='text-[#4C4948] font-[700] text-[20px] break-words'>
                    {ticketInfo[0].status === DB_CONSUME_FLAG.NOT_CONSUMED ? (
                      <p className='text-[#4C4948] font-[700] text-[20px] break-words'>
                        TokyoTorch NFT
                        <label className='text-green-500 font-[500] text-[20px] break-words'>
                          （使用可能）
                        </label>
                      </p>
                    ) : (
                      <p className='text-[#4C4948] font-[700] text-[20px] break-words'>
                        TokyoTorch NFT
                        <label className='text-red-500 font-[500] text-[20px] break-words'>
                          （使用済み）
                        </label>
                      </p>
                    )}
                  </p>
                  <div className='mb-5 shadow-lg'>
                    <img
                      className='border-4 border-black/40 w-[calc(100%)] h-auto '
                      src={'/hackathon1.png'}
                      alt=''
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className='text-[#A5A4A3] font-[700] text-[20px] break-words'>
                    TokyoToach NFT（東京）
                  </p>
                  <div className='mb-[20px] flex justify-center items-center border-[3px] w-[calc(100%)] h-[200px] border-black/20 bg-white border-dashed rounded-[10px]'>
                    <p className='text-[#A5A4A3] font-[700] text-[20px] break-words'>
                      獲得していません
                    </p>
                  </div>
                </>
              )}
              <p className='text-[#A5A4A3] font-[700] text-[20px] break-words'>
                大名古屋ビル NFT（愛知）
              </p>
              <div className='mb-[20px] flex justify-center items-center border-[3px] w-[calc(100%)] h-[200px] border-black/20 bg-white border-dashed rounded-[10px]'>
                <p className='text-[#A5A4A3] font-[700] text-[20px] break-words'>
                  獲得していません
                </p>
              </div>

              <p className='text-[#A5A4A3] font-[700] text-[20px] break-words'>
                OAPプラザ NFT（大阪）
              </p>
              <div className='mb-[20px] flex justify-center items-center border-[3px] w-[calc(100%)] h-[200px] border-black/20 bg-white border-dashed rounded-[10px]'>
                <p className='text-[#A5A4A3] font-[700] text-[20px] break-words'>
                  獲得していません
                </p>
              </div>
            </>
          </div>
        )}
      </div>

      <MintModal
        open={open}
        handleClose={handleClose}
        txHash={txHash}
        txStatus={txStatus}
        editTxHash={editTxHash}
        txErrorMessage={txErrorMessage}
      ></MintModal>

      <div className={`fixed top-0 left-0 w-full h-screen z-[-1]`}>
        <Image src={`/background.png`} layout={`fill`} objectFit={`cover`} />
      </div>
    </div>
  );
}

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LaunchIcon from '@mui/icons-material/LaunchOutlined';
import Modal from '@mui/material/Modal';
import {
  TX_STATUS,
  CONSUME_STATUS,
  MAIL_REGEX,
  BLOCKCHAIN_EXPLORER_URL,
} from 'components/utils';
import { ethers } from 'ethers';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { API_RESPONSE } from 'pages/api/api-constants';
import { useState, useEffect } from 'react';
import { TailSpin, Rings } from 'react-loader-spinner';
import { useWalletConnectClient } from '../components/contexts/ClientContext';
import { NFTTicketAddress } from '../contracts';

export function MintModal({
  open,
  handleClose,
  txHash,
  txStatus,
  editTxHash,
  txErrorMessage,
}) {
  const renderMondal = () => {
    if (txStatus == TX_STATUS.NOT_START) {
      return (
        <div
          className={
            'absolute w-[calc(100%-40px)] top-[calc(50%-150px)] left-[20px]'
          }
        >
          <div className='flex flex-col items-end justify-center w-[calc(100%)]'>
            <Image
              src={`/new-design/closeIcon.svg`}
              style={{ objectFit: 'obtain' }}
              width={45}
              height={45}
              onClick={closeModal}
            />
          </div>
          <div
            className={
              'flex flex-col items-center justify-center w-[calc(100%)] rounded-[10px] bg-[#F2FEFF] px-[24px] pt-[45px]'
            }
          >
            <p className='text-[#4C4948] font-[700] text-[20px] leading-[calc(100%)]'>
              署名が必要です
            </p>
            <p className='mt-[12px] text-[#4C4948] font-[400] text-[12px] leading-[calc(140%)]'>
              ウォレットからのメッセージを確認してください
            </p>
            <div className='mt-[20px] mb-[32px]'>
              <Rings
                height='50'
                width='50'
                color='#22A9BC'
                radius='6'
                wrapperStyle={{}}
                wrapperClass=''
                visible={true}
                ariaLabel='rings-loading'
              />
            </div>
          </div>
        </div>
      );
    } else if (txStatus == TX_STATUS.PROGRESS) {
      return (
        <div
          className={
            'absolute w-[calc(100%-40px)] top-[calc(50%-150px)] left-[20px]'
          }
        >
          <div className='flex flex-col items-end justify-center w-[calc(100%)]'>
            <Image
              src={`/new-design/closeIcon.svg`}
              style={{ objectFit: 'obtain' }}
              width={45}
              height={45}
              onClick={closeModal}
            />
          </div>
          <div
            className={
              'flex flex-col items-center justify-center w-[calc(100%)] rounded-[10px] bg-[#F2FEFF] px-[24px] py-[45px]'
            }
          >
            <p className='text-[#4C4948] font-[700] text-[20px] leading-[calc(100%)]'>
              NFTをMintしています...
            </p>
            <p className='mt-[18px] text-[#22A9BC] font-[700] text-[16px] leading-[calc(160%)] underline underline-offset-2'>
              <a href={`${BLOCKCHAIN_EXPLORER_URL}${txHash}`} target='_blank'>
                {editTxHash(txHash)}{' '}
                <LaunchIcon
                  className={'ml-2'}
                  sx={{ color: '#22A9BC' }}
                  fontSize='small'
                />
              </a>
            </p>
            <div className='flex justify-center items-center mt-[10px]'>
              <TailSpin
                height='25'
                width='25'
                color='#22A9BC'
                ariaLabel='tail-spin-loading'
                radius='1'
                wrapperStyle={{}}
                wrapperClass=''
                visible={true}
              />
            </div>
            <p className='mt-[24px] text-[#4C4948] font-[400] text-[12px] leading-[calc(140%)]'>
              Transaction Progress...
            </p>
          </div>
        </div>
      );
    } else if (txStatus == TX_STATUS.SUCCESS) {
      return (
        <div
          className={
            'absolute w-[calc(100%-40px)] top-[calc(50%-150px)] left-[20px]'
          }
        >
          <div className='flex flex-col items-end justify-center w-[calc(100%)]'>
            <Image
              src={`/new-design/closeIcon.svg`}
              style={{ objectFit: 'obtain' }}
              width={45}
              height={45}
              onClick={closeModal}
            />
          </div>
          <div
            className={
              'flex flex-col items-center justify-center w-[calc(100%)] rounded-[10px] bg-[#F2FEFF] px-[24px] py-[45px]'
            }
          >
            <p className='text-[#4C4948] font-[700] text-[20px] leading-[calc(100%)]'>
              NFTのMintが完了しました
              {<CheckCircleIcon className={'ml-2'} sx={{ color: '#22A9BC' }} />}
            </p>
            <Image
              src={`/new-design/closeIcon.svg`}
              style={{ objectFit: 'obtain' }}
              width={20}
              height={20}
              onClick={closeModal}
            />
            <p className='mt-[18px] text-[#22A9BC] font-[700] text-[16px] leading-[calc(160%)] underline underline-offset-2'>
              <a href={`${BLOCKCHAIN_EXPLORER_URL}${txHash}`} target='_blank'>
                {editTxHash(txHash)}{' '}
                <LaunchIcon
                  className={'ml-2'}
                  sx={{ color: '#22A9BC' }}
                  fontSize='small'
                />
              </a>
            </p>
            <p className='mt-[24px] text-[#22A9BC] font-[400] text-[14px] leading-[calc(140%)]'>
              Transaction Success!
            </p>
          </div>
        </div>
      );
    } else if (txStatus == TX_STATUS.ERROR) {
      return (
        <div
          className={
            'absolute w-[calc(100%-40px)] top-[calc(50%-150px)] left-[20px]'
          }
        >
          <div className='flex flex-col items-end justify-center w-[calc(100%)]'>
            <Image
              src={`/new-design/closeIcon.svg`}
              style={{ objectFit: 'obtain' }}
              width={45}
              height={45}
              onClick={closeModal}
            />
          </div>
          <div
            className={
              'flex flex-col items-center justify-center w-[calc(100%)] rounded-[10px] bg-[#F2FEFF] px-[24px] pt-[41px] pb-[45px]'
            }
          >
            <div className='flex items-center justify-center'>
              <p className='text-[#4C4948] font-[700] text-[20px] leading-[calc(100%)]'>
                エラーが発生しました
              </p>
              <Image
                src={`/new-design/errorIcon.svg`}
                style={{ objectFit: 'obtain' }}
                width={20}
                height={20}
                onClick={closeModal}
                className='mb-[4px] ml-[4px]'
              />
            </div>
            {txHash ? (
              <>
                <p className='mt-[18px] text-[#22A9BC] font-[700] text-[16px] leading-[calc(160%)] underline underline-offset-2'>
                  <a
                    href={`${BLOCKCHAIN_EXPLORER_URL}${txHash}`}
                    target='_blank'
                  >
                    {editTxHash(txHash)}{' '}
                    <LaunchIcon
                      className={'ml-2'}
                      sx={{ color: '#22A9BC' }}
                      fontSize='small'
                    />
                  </a>
                </p>
                <p className='mt-[24px] text-red-500 font-[400] text-[12px] leading-[calc(140%)]'>
                  Transaction Error!
                </p>
              </>
            ) : (
              <>
                <p className='mt-[12px] text-[#4C4948] font-[400] text-[12px] leading-[calc(140%)]'>
                  {txErrorMessage}
                </p>
                <div
                  className='flex items-center justify-center w-[135px] bg-white py-[12px] mt-[26px] rounded-[4px] border-[1px] border-[#4C4948] gap-[8px]'
                  onClick={closeModal}
                >
                  <p className='text-[#4C4948] font-[700] text-[14px] leading-[calc(100%)]'>
                    閉じる
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
  };

  const closeModal = () => {
    handleClose();
  };

  return (
    <Modal
      open={open}
      disableAutoFocus={true} // モーダルの周りにできる枠が出ないようにする設定
    >
      {renderMondal()}
    </Modal>
  );
}

export function MailLoginModal({
  open,
  handleClose,
  connectWeb3Auth,
  isLoginClick,
  setLoginClick,
}) {
  const { urlBWAddress, mailAddressFromSessionId } = useWalletConnectClient();
  const [inputData, setInputData] = useState({
    mailAddress: '',
    browserWalletAddress: '',
  });
  const [browserWalletList, setBrowserWalletList] = useState([]);
  const [isFocusBrowserWalletInputArea, setIsFocusBrowserWalletInputArea] =
    useState(false);
  const [validationMessage, setValidationMessage] = useState({
    mailAddress: '',
    browserWalletAddress: '',
  });

  useEffect(() => {
    if (urlBWAddress) {
      setInputData((prevData) => ({
        ...prevData,
        ['browserWalletAddress']: urlBWAddress,
      }));
      setBrowserWalletList([{ browserWalletAddress: urlBWAddress }]);
      setValidationMessage({ mailAddress: '', browserWalletAddress: '' }); // 入力エラーメッセージを消す
    }
  }, [urlBWAddress]);

  useEffect(() => {
    if (mailAddressFromSessionId) {
      onChangeMailAddress({
        target: {
          name: 'mailAddress',
          value: mailAddressFromSessionId,
        },
      });
    }
  }, [mailAddressFromSessionId]);

  const renderMondal = () => {
    return (
      <div
        className={
          'absolute w-[calc(100%-40px)] top-[calc(50%-185px)] left-[20px]'
        }
      >
        <div
          className={
            ' w-[calc(100%)] rounded-[10px] bg-[#F2FEFF] px-[20px] py-[32px]'
          }
        >
          <div className={'flex flex-col items-center'}>
            <Image
              className=''
              src={`/new-design/mailloginTitle.svg`}
              style={{ objectFit: 'obtain' }}
              width={220}
              height={30}
            />
          </div>

          <div className='mt-[32px]'>
            <p className='text-[#4C4948] font-[700] text-[20px] leading-[calc(100%)]'>
              メールアドレス
            </p>
          </div>

          <div className='mt-[8px] p-[8px] bg-white border-[1px] border-[#22A9BC]'>
            <input
              type='text'
              className='w-[calc(100%)] h-[22px] text-left text-[14px] text-[#4C4948]'
              name='mailAddress'
              placeholder={`aaa.aaa@tis.co.jp`}
              onChange={onChangeMailAddress}
              value={inputData.mailAddress}
            />
          </div>

          {validationMessage.mailAddress ? (
            <div className='mt-[8px]'>
              <p className='text-[#F82626] font-[400] text-[12px] leading-[calc(120%)]'>
                {validationMessage.mailAddress}
              </p>
            </div>
          ) : (
            <></>
          )}

          {!isLoginClick ? (
            <div className={'mt-[32px] w-[calc(100%)] '}>
              <div
                className='w-[calc(100%)] h-[42px] rounded-[4px] bg-[#22A9BC] flex justify-center items-center'
                onClick={async () => {
                  // 入力チェック
                  let passedValidation = true;
                  if (inputData.mailAddress == '') {
                    passedValidation = false;
                    setValidationMessage((prevData) => ({
                      ...prevData,
                      ['mailAddress']: 'メールアドレスを入力してください',
                    }));
                  }
                  if (
                    inputData.mailAddress != '' &&
                    !inputData.mailAddress.match(MAIL_REGEX)
                  ) {
                    passedValidation = false;
                    setValidationMessage((prevData) => ({
                      ...prevData,
                      ['mailAddress']: 'メールアドレスの形式が不正です',
                    }));
                  }
                  if (passedValidation === false) return;

                  setLoginClick(true);

                  sessionStorage.setItem(
                    'mailAddress',
                    JSON.stringify(inputData.mailAddress),
                  );
                  await connectWeb3Auth(inputData.mailAddress);
                }}
              >
                <p className='text-white font-[700] text-[14px]'>ログイン</p>
              </div>
            </div>
          ) : (
            <div className='flex justify-center items-center mt-7 py-1 px-2'>
              <TailSpin
                height='25'
                width='25'
                color='#22A9BC'
                ariaLabel='tail-spin-loading'
                radius='1'
                wrapperStyle={{}}
                wrapperClass=''
                visible={true}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const handler = (event) => {
    setInputData((prevData) => ({
      ...prevData,
      [event.target.name]: event.target.value,
    }));
    setValidationMessage({ mailAddress: '', browserWalletAddress: '' }); // 入力エラーメッセージを消す
  };

  const onFocusBrowserWalletAddress = async (event) => {
    setIsFocusBrowserWalletInputArea(true);
    var index = browserWalletList.findIndex(
      (item) => item.browserWalletAddress === event.target.value,
    );
    if (index === -1) {
      return;
    } else {
      setInputData((prevData) => ({
        ...prevData,
        ['browserWalletAddress']: '',
      }));
      setValidationMessage({ mailAddress: '', browserWalletAddress: '' }); // 入力エラーメッセージを消す
    }
  };

  const onChangeMailAddress = async (event) => {
    setInputData((prevData) => ({
      ...prevData,
      [event.target.name]: event.target.value,
    }));
    setValidationMessage({ mailAddress: '', browserWalletAddress: '' }); // 入力エラーメッセージを消す

    if (event.target.value == '') {
      return;
    }
    if (!event.target.value.match(MAIL_REGEX)) {
      return;
    }
  };

  const closeModal = () => {
    setLoginClick(false);
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={closeModal}
      disableAutoFocus={true} // モーダルの周りにできる枠が出ないようにする設定
    >
      {renderMondal()}
    </Modal>
  );
}

export function ConsumeCouponModal({
  open,
  handleClose,
  walletAddress,
  item,
  setUsedAt,
}) {
  const { accounts, signer } = useWalletConnectClient();
  const [consumeStatus, setConsumeStatus] = useState(CONSUME_STATUS.NOT_START);
  const router = useRouter();

  const consumeCoupon = async () => {
    setConsumeStatus(CONSUME_STATUS.PROGRESS);
    try {
      const signResult = await sign();
      if (typeof signResult?.sig === 'undefined') {
        // ウォレットでの署名を拒否した場合は、ここでReturnされる
        return;
      }
      const { couponOperation, sig } = signResult;
      await setCouponStatusAPI(couponOperation, sig);
      setConsumeStatus(CONSUME_STATUS.SUCCESS);
    } catch (e) {
      console.log(e);
      setConsumeStatus(CONSUME_STATUS.ERROR);
    }
  };

  const sign = async () => {
    const couponOperation = {
      from: {
        wallet: accounts[0],
      },
      nftCoupon: {
        name: 'クーポン',
        building: item.building,
        shopName: item.shopName,
        operation: 'consume',
        date: Date.now(),
      },
    };
    try {
      const sig = await signer.signMessage(JSON.stringify(couponOperation)); // signMessageメソッドは、WalletConnect経由で接続したとき、より多くのウォレットが対応している
      return { couponOperation, sig };
    } catch (e) {
      // 署名を拒否 or 署名で何かしらのエラーが発生した
      alert('署名に失敗しました。もう一度お試し下さい。');
      closeModal();
      return {};
    }
  };

  const setCouponStatusAPI = async (couponOperation, sig) => {
    try {
      // APIの実行
      const res = await fetch(`/api/community/setCouponStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: walletAddress.toLowerCase(),
          communityId: item.communityId,
          couponOperation: couponOperation,
          sig: sig,
        }),
      });

      // API ステータスコードのチェック
      if (res.status != API_RESPONSE.CREATED.CODE) {
        alert('DBエラーが発生したため、クーポン使用に失敗しました。');
        return;
      }
      const resJson = await res.json();
      setUsedAt(resJson.usedAt);
    } catch (e) {
      alert('DBエラーが発生したため、クーポン使用に失敗しました。');
    }
  };

  const renderMondal = () => {
    if (consumeStatus == CONSUME_STATUS.NOT_START) {
      return (
        <div
          className={
            'absolute w-[calc(100%-40px)] top-[calc(50%-130px)] left-[20px]'
          }
        >
          <div className='flex flex-col items-end justify-center w-[calc(100%)]'>
            <Image
              src={`/new-design/closeIcon.svg`}
              style={{ objectFit: 'obtain' }}
              width={45}
              height={45}
              onClick={closeModal}
            />
          </div>
          <div
            className={
              'flex flex-col items-center justify-center w-[calc(100%)] rounded-[10px] bg-[#F2FEFF] px-[24px] py-[45px]'
            }
          >
            <p className='text-[#4C4948] font-[700] text-[20px] leading-[calc(100%)]'>
              NFTクーポンを使用しますか？
            </p>
            <div
              className={
                'flex flex-row items-center justify-between space-x-6 mt-[26px]'
              }
            >
              <div
                className='flex items-center justify-center w-[135px] bg-white py-[12px] rounded-[4px] border-[1px] border-[#4C4948] gap-[8px]'
                onClick={closeModal}
              >
                <p className='text-[#4C4948] font-[700] text-[14px] leading-[calc(100%)]'>
                  キャンセル
                </p>
              </div>
              <div
                className='flex items-center justify-center w-[135px] bg-white py-[12px] rounded-[4px] border-[1px] border-[#E14882] gap-[8px]'
                onClick={consumeCoupon}
              >
                <p className='text-[#E14882] font-[700] text-[14px] leading-[calc(100%)]'>
                  クーポンを使う
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (consumeStatus == CONSUME_STATUS.PROGRESS) {
      return (
        <div
          className={
            'absolute w-[calc(100%-40px)] top-[calc(50%-130px)] left-[20px]'
          }
        >
          <div className='flex flex-col items-end justify-center w-[calc(100%)]'>
            <Image
              src={`/new-design/closeIcon.svg`}
              style={{ objectFit: 'obtain' }}
              width={45}
              height={45}
              onClick={closeModal}
            />
          </div>
          <div
            className={
              'flex flex-col items-center justify-center w-[calc(100%)] rounded-[10px] bg-[#F2FEFF] px-[24px] pt-[45px]'
            }
          >
            <p className='text-[#4C4948] font-[700] text-[20px] leading-[calc(100%)]'>
              署名が必要です
            </p>
            <p className='mt-[12px] text-[#4C4948] font-[400] text-[12px] leading-[calc(140%)]'>
              ウォレットからのメッセージを確認してください
            </p>
            <div className='mt-[20px] mb-[32px]'>
              <Rings
                height='50'
                width='50'
                color='#22A9BC'
                radius='6'
                wrapperStyle={{}}
                wrapperClass=''
                visible={true}
                ariaLabel='rings-loading'
              />
            </div>
          </div>
        </div>
      );
    } else if (consumeStatus == CONSUME_STATUS.SUCCESS) {
      return (
        <div
          className={
            'absolute w-[calc(100%-40px)] top-[calc(50%-130px)] left-[20px]'
          }
        >
          <div className='flex flex-col items-end justify-center w-[calc(100%)]'>
            <Image
              src={`/new-design/closeIcon.svg`}
              style={{ objectFit: 'obtain' }}
              width={45}
              height={45}
              onClick={closeModal}
            />
          </div>
          <div
            className={
              'flex flex-col items-center justify-center w-[calc(100%)] rounded-[10px] bg-[#F2FEFF] px-[24px] py-[45px]'
            }
          >
            <p className='text-[#4C4948] font-[700] text-[20px] leading-[calc(100%)]'>
              NFTクーポンを使用しました！
            </p>

            <div
              className='flex items-center justify-center w-[calc(100%)] bg-white py-[12px] rounded-[4px] border-[1px] border-[#22A9BC] gap-[8px] mt-[26px]'
              onClick={() => router.replace('/menu')}
            >
              <p className='text-[#22A9BC] font-[700] text-[14px] leading-[calc(100%)]'>
                コミュニティ一覧
              </p>
            </div>
          </div>
        </div>
      );
    } else if (consumeStatus == CONSUME_STATUS.ERROR) {
      return (
        <div
          className={
            'absolute w-[calc(100%-40px)] top-[calc(50%-130px)] left-[20px]'
          }
        >
          <div className='flex flex-col items-end justify-center w-[calc(100%)]'>
            <Image
              src={`/new-design/closeIcon.svg`}
              style={{ objectFit: 'obtain' }}
              width={45}
              height={45}
              onClick={closeModal}
            />
          </div>
          <div
            className={
              'flex flex-col items-center justify-center w-[calc(100%)] rounded-[10px] bg-[#F2FEFF] px-[24px] pt-[41px] pb-[45px]'
            }
          >
            <div className='flex items-center justify-center'>
              <p className='text-[#4C4948] font-[700] text-[20px] leading-[calc(100%)]'>
                エラーが発生しました
              </p>
              <Image
                src={`/new-design/errorIcon.svg`}
                style={{ objectFit: 'obtain' }}
                width={20}
                height={20}
                onClick={closeModal}
                className='mb-[4px] ml-[4px]'
              />
            </div>
            <p className='mt-[12px] text-[#4C4948] font-[400] text-[12px] leading-[calc(140%)]'>
              もう一度お試しください
            </p>
            <div
              className='flex items-center justify-center w-[135px] bg-white py-[12px] mt-[26px] rounded-[4px] border-[1px] border-[#4C4948] gap-[8px]'
              onClick={closeModal}
            >
              <p className='text-[#4C4948] font-[700] text-[14px] leading-[calc(100%)]'>
                閉じる
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  const closeModal = () => {
    if (consumeStatus == CONSUME_STATUS.SUCCESS) {
      router.replace('/menu');
    } else {
      setConsumeStatus(CONSUME_STATUS.NOT_START);
      handleClose();
    }
  };

  return (
    <Modal
      open={open}
      disableAutoFocus={true} // モーダルの周りにできる枠が出ないようにする設定
    >
      {renderMondal()}
    </Modal>
  );
}

export function ParticipationModal({
  open,
  handleClose,
  walletAddress,
  item,
  ticketInfo,
}) {
  const { accounts, signer } = useWalletConnectClient();
  const [participationStatus, setParticipationStatus] = useState(
    CONSUME_STATUS.NOT_START,
  );
  const router = useRouter();

  const consumeCoupon = async () => {
    setParticipationStatus(CONSUME_STATUS.PROGRESS);
    try {
      const signResult = await sign();
      if (typeof signResult?.sig === 'undefined') {
        // ウォレットでの署名を拒否した場合は、ここでReturnされる
        return;
      }
      const { ticketOperation, sig } = signResult;
      await setParticipationAPI(ticketOperation, sig);
      setParticipationStatus(CONSUME_STATUS.SUCCESS);
    } catch (e) {
      console.log(e);
      setParticipationStatus(CONSUME_STATUS.ERROR);
    }
  };

  const sign = async () => {
    const ticketOperation = {
      from: {
        wallet: accounts[0],
      },
      nftTicket: {
        name: 'コミュニティ参加券',
        contractAddress: NFTTicketAddress.toLowerCase(),
        tokenId: ticketInfo[0].tokenId,
        operation: 'consume',
        date: Date.now(),
      },
    };
    try {
      const sig = await signer.signMessage(JSON.stringify(ticketOperation)); // signMessageメソッドは、WalletConnect経由で接続したとき、より多くのウォレットが対応している
      return { ticketOperation, sig };
    } catch (e) {
      // 署名を拒否 or 署名で何かしらのエラーが発生した
      console.log(e);
      alert('署名に失敗しました。もう一度お試し下さい。');
      closeModal();
      return {};
    }
  };

  const setParticipationAPI = async (ticketOperation, sig) => {
    try {
      // APIの実行
      const res = await fetch(`/api/community/setParticipation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: walletAddress.toLowerCase(),
          communityId: item.communityId,
          communityName: item.communityName,
          owner: item.owner,
          ticketOperation: ticketOperation,
          sig: sig,
          tokenId: ticketInfo[0].tokenId,
        }),
      });

      // API ステータスコードのチェック
      if (res.status != API_RESPONSE.CREATED.CODE) {
        alert('DBエラーが発生したため、クーポン使用に失敗しました。');
        return;
      }
      const resJson = await res.json();
    } catch (e) {
      alert('DBエラーが発生したため、クーポン使用に失敗しました。');
    }
  };

  const renderModal = () => {
    if (participationStatus == CONSUME_STATUS.NOT_START) {
      return (
        <div
          className={
            'absolute w-[calc(100%-40px)] top-[calc(50%-130px)] left-[20px]'
          }
        >
          <div className='flex flex-col items-end justify-center w-[calc(100%)]'>
            <Image
              src={`/new-design/closeIcon.svg`}
              style={{ objectFit: 'obtain' }}
              width={45}
              height={45}
              onClick={closeModal}
            />
          </div>
          <div
            className={
              'flex flex-col items-center justify-center w-[calc(100%)] rounded-[10px] bg-[#F2FEFF] px-[24px] py-[45px]'
            }
          >
            <p className='text-[#4C4948] font-[700] text-[20px] leading-[calc(100%)]'>
              参加券を消費して、コミュニティに参加しますか？
            </p>
            <div
              className={
                'flex flex-row items-center justify-between space-x-6 mt-[26px]'
              }
            >
              <div
                className='flex items-center justify-center w-[135px] bg-white py-[12px] rounded-[4px] border-[1px] border-[#4C4948] gap-[8px]'
                onClick={closeModal}
              >
                <p className='text-[#4C4948] font-[700] text-[14px] leading-[calc(100%)]'>
                  キャンセル
                </p>
              </div>
              <div
                className='flex items-center justify-center w-[135px] bg-white py-[12px] rounded-[4px] border-[1px] border-[#E14882] gap-[8px]'
                onClick={consumeCoupon}
              >
                <p className='text-[#E14882] font-[700] text-[14px] leading-[calc(100%)]'>
                  参加する
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (participationStatus == CONSUME_STATUS.PROGRESS) {
      return (
        <div
          className={
            'absolute w-[calc(100%-40px)] top-[calc(50%-130px)] left-[20px]'
          }
        >
          <div className='flex flex-col items-end justify-center w-[calc(100%)]'>
            <Image
              src={`/new-design/closeIcon.svg`}
              style={{ objectFit: 'obtain' }}
              width={45}
              height={45}
              onClick={closeModal}
            />
          </div>
          <div
            className={
              'flex flex-col items-center justify-center w-[calc(100%)] rounded-[10px] bg-[#F2FEFF] px-[24px] pt-[45px]'
            }
          >
            <p className='text-[#4C4948] font-[700] text-[20px] leading-[calc(100%)]'>
              署名が必要です
            </p>
            <p className='mt-[12px] text-[#4C4948] font-[400] text-[12px] leading-[calc(140%)]'>
              ウォレットからのメッセージを確認してください
            </p>
            <div className='mt-[20px] mb-[32px]'>
              <Rings
                height='50'
                width='50'
                color='#22A9BC'
                radius='6'
                wrapperStyle={{}}
                wrapperClass=''
                visible={true}
                ariaLabel='rings-loading'
              />
            </div>
          </div>
        </div>
      );
    } else if (participationStatus == CONSUME_STATUS.SUCCESS) {
      return (
        <div
          className={
            'absolute w-[calc(100%-40px)] top-[calc(50%-130px)] left-[20px]'
          }
        >
          <div className='flex flex-col items-end justify-center w-[calc(100%)]'>
            <Image
              src={`/new-design/closeIcon.svg`}
              style={{ objectFit: 'obtain' }}
              width={45}
              height={45}
              onClick={closeModal}
            />
          </div>
          <div
            className={
              'flex flex-col items-center justify-center w-[calc(100%)] rounded-[10px] bg-[#F2FEFF] px-[24px] py-[45px]'
            }
          >
            <p className='text-[#4C4948] font-[700] text-[20px] leading-[calc(100%)]'>
              コミュニティに参加しました！
            </p>

            <div
              className='flex items-center justify-center w-[calc(100%)] bg-white py-[12px] rounded-[4px] border-[1px] border-[#22A9BC] gap-[8px] mt-[26px]'
              onClick={() => router.replace('/menu')}
            >
              <p className='text-[#22A9BC] font-[700] text-[14px] leading-[calc(100%)]'>
                コミュニティ一覧
              </p>
            </div>
          </div>
        </div>
      );
    } else if (participationStatus == CONSUME_STATUS.ERROR) {
      return (
        <div
          className={
            'absolute w-[calc(100%-40px)] top-[calc(50%-130px)] left-[20px]'
          }
        >
          <div className='flex flex-col items-end justify-center w-[calc(100%)]'>
            <Image
              src={`/new-design/closeIcon.svg`}
              style={{ objectFit: 'obtain' }}
              width={45}
              height={45}
              onClick={closeModal}
            />
          </div>
          <div
            className={
              'flex flex-col items-center justify-center w-[calc(100%)] rounded-[10px] bg-[#F2FEFF] px-[24px] pt-[41px] pb-[45px]'
            }
          >
            <div className='flex items-center justify-center'>
              <p className='text-[#4C4948] font-[700] text-[20px] leading-[calc(100%)]'>
                エラーが発生しました
              </p>
              <Image
                src={`/new-design/errorIcon.svg`}
                style={{ objectFit: 'obtain' }}
                width={20}
                height={20}
                onClick={closeModal}
                className='mb-[4px] ml-[4px]'
              />
            </div>
            <p className='mt-[12px] text-[#4C4948] font-[400] text-[12px] leading-[calc(140%)]'>
              もう一度お試しください
            </p>
            <div
              className='flex items-center justify-center w-[135px] bg-white py-[12px] mt-[26px] rounded-[4px] border-[1px] border-[#4C4948] gap-[8px]'
              onClick={closeModal}
            >
              <p className='text-[#4C4948] font-[700] text-[14px] leading-[calc(100%)]'>
                閉じる
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  const closeModal = () => {
    if (participationStatus == 1) {
      router.replace('/menu');
    } else {
      setParticipationStatus(CONSUME_STATUS.NOT_START);
      handleClose();
    }
  };

  return (
    <Modal
      open={open}
      disableAutoFocus={true} // モーダルの周りにできる枠が出ないようにする設定
    >
      {renderModal()}
    </Modal>
  );
}

import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useWalletConnectClient } from '../components/contexts/ClientContext';

export default function Web3authRedirect() {
  const { setWeb3authRedirect } = useWalletConnectClient();

  const router = useRouter();

  useEffect(() => {
    setWeb3authRedirect((prevData) => ({
      ...prevData,
      ['isRedirect']: true,
    }));
    router.replace('/'); // 戻るボタンを押したときにRedirectしたページを表示しないために、replaceを使用
  }, []);

  // ページ表示はしない（すぐにrouter.replaceするため）
  return <></>;
}

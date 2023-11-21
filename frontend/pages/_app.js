import '@/styles/globals.css';
import { ClientContextProvider } from '../components/contexts/ClientContext';

export default function App({ Component, pageProps }) {
  return (
    <ClientContextProvider>
      <Component {...pageProps} />
    </ClientContextProvider>
  );
}

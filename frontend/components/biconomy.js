import { DEFAULT_ENTRYPOINT_ADDRESS } from '@biconomy/account';
import { Bundler } from '@biconomy/bundler';
import { ChainId } from '@biconomy/core-types';
import { BiconomyPaymaster } from '@biconomy/paymaster';

export const bundler = new Bundler({
  bundlerUrl: process.env.BUNDLER_URL,
  chainId: ChainId.ASTAR_MAINNET,
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  // entryPointAddress: "0x8603f53Ab942fCB633B4e52fA2A22376b098ea79",
});

export const paymaster = new BiconomyPaymaster({
  paymasterUrl: process.env.PAYMASTER_URL,
});

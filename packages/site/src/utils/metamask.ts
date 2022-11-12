/**
 * Detect if the wallet injecting the ethereum object is Flask.
 *
 * @returns True if the MetaMask version is Flask, false otherwise.
 */
export const isFlask = async () => {
  const provider = window.ethereum;

  try {
    const clientVersion = await provider?.request({
      method: 'web3_clientVersion',
    });

    const isFlaskDetected = (clientVersion as string[])?.includes('flask');

    return Boolean(provider && isFlaskDetected);
  } catch {
    return false;
  }
};

export const signTypedData = async (params: any): Promise<any> => {
  return (await window.ethereum.request({
    method: 'eth_signTypedData',
    params: params
  }))
};

export const getAccount = async (): Promise<any> => {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[]
  if (accounts !== undefined) return accounts[0]
  return null
};


import { useEffect, useState } from 'react';
import algosdk from 'algosdk';

interface Asset {
  'asset-id': number;
  amount: number;
 
}

export function useWaitForAssetOptIn({
  algodClient,
  address,
  assetId,
  startRound,
  enabled = true,
  timeoutRounds = 20,
}: {
  algodClient: algosdk.Algodv2;
  address: string;
  assetId: number;
  startRound: number;
  enabled?: boolean;
  timeoutRounds?: number;
}) {
  const [optedIn, setOptedIn] = useState(false);
  const [checking, setChecking] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!enabled || !algodClient || !address || !assetId || !startRound) return;

    let cancelled = false;
    let currentRound = startRound;

    const watchOptIn = async () => {
      setChecking(true);
      for (let i = 0; i < timeoutRounds; i++) {
        if (cancelled) return;

        try {
          const status = await algodClient.statusAfterBlock(currentRound + 1).do();
          currentRound = status['last-round'];

          const accountInfo = await algodClient.accountInformation(address).do();
          const hasOptedIn = accountInfo.assets.some((a: Asset) => a['asset-id'] === assetId);

          if (hasOptedIn) {
            setOptedIn(true);
            setChecking(false);
            return;
          }

          await new Promise((res) => setTimeout(res, 2000));
        } catch (err) {
          console.error('Opt-in watcher error:', err);
          break;
        }
      }

      setTimedOut(true);
      setChecking(false);
    };

    watchOptIn();

    return () => {
      cancelled = true;
    };
  }, [algodClient, address, assetId, startRound, enabled, timeoutRounds]);

  return { optedIn, checking, timedOut };
}

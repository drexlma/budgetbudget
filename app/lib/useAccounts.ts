import { useState } from 'react';
import { Account, useClient } from './moneyMoneyClient';
import { IpcError } from '../../shared/ipc';
import useActiveEffect from './useActiveEffect';

export default function useAccounts() {
  const api = useClient();
  const [accounts, setAccounts] = useState<Account[] | null | IpcError>(null);
  useActiveEffect(
    (whenActive) => {
      if (!api) {
        return;
      }

      const guardedSetAccounts = whenActive(setAccounts);
      api.getAccounts().then(guardedSetAccounts, guardedSetAccounts);
    },
    [api, setAccounts],
  );
  return accounts;
}

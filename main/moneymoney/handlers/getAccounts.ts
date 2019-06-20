import { Account, CURRENCIES } from '../../../shared/MoneyMoneyApiTypes';
import { osascript } from '../../lib';
import { parse } from 'plist';
import { Omit } from '../../../shared/types';
import isDbLocked from '../helpers/isDbLocked';
import delay from '../../../shared/delay';

type InteropAccount = Omit<Account, 'balance'> & {
  balance: Account['balance'][];
  accountNumber: string;
};

function normalizeAccounts(accounts: InteropAccount[]): Promise<Account[]> {
  return Promise.all(
    accounts.map(async ({ name, balance, accountNumber: number }) => {
      if (balance.length !== 1) {
        throw new Error(
          `Unexpectedly got multiple balance from account "${name}"`,
        );
      }
      return {
        name,
        balance: balance[0],
        number,
      };
    }),
  );
}

function isAccount(account: any): account is InteropAccount {
  if (
    typeof account.accountNumber !== 'string' ||
    !account.accountNumber.length
  ) {
    /* Silently filter out accounts without number, assuming its a group */
    return false;
  }

  if (
    typeof account.name === 'string' &&
    Array.isArray(account.balance) &&
    (account.balance as any[]).every(
      (balance) =>
        Array.isArray(balance) &&
        balance.length === 2 &&
        typeof balance[0] === 'number' &&
        CURRENCIES.includes(balance[1]),
    )
  ) {
    return true;
  }

  throw new Error(`Account schema mismatch on ${JSON.stringify(account)}`);
}

export default async function getAccounts(
  _?: any,
  retry = 0,
): Promise<Account[]> {
  try {
    const parsedStdout = parse(
      await osascript('tell application "MoneyMoney" to export accounts'),
    );

    if (!Array.isArray(parsedStdout)) {
      throw new Error('Unexpectedly got non-array as accounts');
    }

    return normalizeAccounts(parsedStdout.filter(isAccount));
  } catch (err) {
    if (isDbLocked(err)) {
      if (retry < 3) {
        await delay(retry * 500);
        return getAccounts(_, retry + 1);
      }
      throw { retry: true, message: 'MoneyMoney database is locked' };
    }
    throw err;
  }
}

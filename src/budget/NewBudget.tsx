import React, { useState } from 'react';
import { BudgetState, VERSION } from './Types';
import { useAccounts } from '../moneymoney';
import { Loading } from '../components';

type Props = {
  onCreate: (budget: BudgetState) => void;
};

type AccountSelectProps = {
  value: string[];
  onChange: (value: string[]) => void;
};
function AccountSelect({ value, onChange }: AccountSelectProps) {
  const [accounts, retry] = useAccounts();

  if (!accounts) {
    return <Loading />;
  }

  if (accounts instanceof Error) {
    return (
      <div>
        <p>Error: {accounts.message}</p>
        <button onClick={retry}>retry</button>
      </div>
    );
  }

  return (
    <ul>
      {accounts.map(({ number, name }) => (
        <li key={number}>
          <label>
            <input
              type="checkbox"
              checked={value.includes(number)}
              onChange={() => {
                const i = value.indexOf(number);
                if (i === -1) {
                  onChange(value.concat(number));
                } else {
                  onChange(value.filter((n) => n !== number));
                }
              }}
            />
            {name}
          </label>
        </li>
      ))}
    </ul>
  );
}

export default function NewBudget({ onCreate }: Props) {
  const [name, setName] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  return (
    <>
      <h1>Creating a new Budget</h1>
      <label>
        Name
        <input
          type="text"
          value={name}
          onChange={(ev) => setName(ev.target.value)}
          placeholder="My new Budget"
        />
      </label>
      <AccountSelect value={selectedAccounts} onChange={setSelectedAccounts} />
      <button
        disabled={name === '' || !selectedAccounts.length}
        onClick={() =>
          onCreate({
            name,
            version: VERSION,
            settings: {
              accounts: selectedAccounts,
              incomeCategories: [],
              accuracy: 100,
            },
            budgets: {},
          })
        }
      >
        Create
      </button>
    </>
  );
}

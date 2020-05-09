import React, { Dispatch, useState } from 'react';
import { BudgetState, Action } from '../../budget';
import { Content, Tab, TabBar, Header, Button } from '../../components';
import { useSetShowSettings } from '../../lib';
import General from './General';
import Categories from './Categories';
import { AccountsResource } from '../../moneymoney';

type Props = {
  state: BudgetState;
  accountsRes: AccountsResource;
  dispatch: Dispatch<Action>;
};

export default function Settings(props: Props) {
  const showSettings = useSetShowSettings();
  const [tab, setTab] = useState<'general' | 'categories'>('general');
  const { accounts } = props.state.settings;
  const valid = accounts.length > 0;

  return (
    <Content
      padding
      background
      header={
        <Header>
          <Button
            title="close"
            disabled={!valid}
            onClick={() => showSettings && showSettings(false)}
          >
            X
          </Button>
          Settings
        </Header>
      }
    >
      <TabBar>
        <Tab active={tab === 'general'} onClick={() => setTab('general')}>
          General
        </Tab>
        <Tab active={tab === 'categories'} onClick={() => setTab('categories')}>
          Categories
        </Tab>
      </TabBar>
      {tab === 'general' && <General {...props} />}
      {tab === 'categories' && <Categories {...props} />}
    </Content>
  );
}

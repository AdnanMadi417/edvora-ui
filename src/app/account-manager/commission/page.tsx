'use client';
import { MdTrendingUp, MdPayments, MdShoppingCart, MdAccountBalanceWallet, MdTask, MdFolderOpen } from 'react-icons/md';

import Widget from 'components/ub/data/Widget';

const Dashboard = () => {

  return (
      <div>
        {/* Card widget */}

        <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
          <Widget
              icon={<MdTrendingUp className="h-7 w-7" />}
              title={'Earnings'}
              subtitle={'$340.5'}
          />
          <Widget
              icon={<MdPayments className="h-6 w-6" />}
              title={'Spend this month'}
              subtitle={'$642.39'}
          />
          <Widget
              icon={<MdShoppingCart className="h-7 w-7" />}
              title={'Sales'}
              subtitle={'$574.34'}
          />
          <Widget
              icon={<MdAccountBalanceWallet className="h-6 w-6" />}
              title={'Your Balance'}
              subtitle={'$1,000'}
          />
          <Widget
              icon={<MdTask className="h-7 w-7" />}
              title={'New Tasks'}
              subtitle={'145'}
          />
          <Widget
              icon={<MdFolderOpen className="h-6 w-6" />}
              title={'Total Projects'}
              subtitle={'$2433'}
          />
        </div>

      </div>
  );
};

export default Dashboard;

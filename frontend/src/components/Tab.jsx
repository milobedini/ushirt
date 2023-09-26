import { useSnapshot } from 'valtio/react';
import state from '../store';

const Tab = ({ tab, isActiveTab, isFilterTab, handleClick }) => {
  const snap = useSnapshot(state);

  const activeStyles =
    isFilterTab && isActiveTab
      ? { backgroundColor: snap.color, opacity: 0.5 }
      : { backgroundColor: 'transparent', opacity: 1 };

  return (
    <div
      key={tab.name}
      className={`tab-btn ${
        isFilterTab ? 'rounded-full glassmorphism' : 'rounded-4'
      }`}
      onClick={handleClick}
      style={activeStyles}
    >
      <img
        src={tab.icon}
        alt={tab.name}
        className={`${
          isFilterTab ? 'w-2/3 h-2/3 ' : ' object-contain w-11/12 h-11/12'
        }`}
      />
    </div>
  );
};

export default Tab;

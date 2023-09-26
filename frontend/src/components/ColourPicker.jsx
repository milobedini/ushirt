import { SketchPicker } from 'react-color';
import { useSnapshot } from 'valtio/react';
import state from '../store';

const ColourPicker = () => {
  const snapshot = useSnapshot(state);

  return (
    <div className="absolute left-full ml-3">
      <SketchPicker
        color={snapshot.color}
        disableAlpha
        onChange={(color) => (state.color = color.hex)}
      />
    </div>
  );
};

export default ColourPicker;

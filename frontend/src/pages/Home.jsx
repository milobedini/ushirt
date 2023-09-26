import { AnimatePresence, motion } from 'framer-motion';
import { useSnapshot } from 'valtio';
import CustomButton from '../components/CustomButton';
import {
  headContainerAnimation,
  headContentAnimation,
  headTextAnimation,
  slideAnimation,
} from '../config/motion';
import state from '../store';

const Home = () => {
  // Snapshot of current global state.
  const snap = useSnapshot(state);

  return (
    <AnimatePresence>
      {snap.intro && (
        <motion.section className="home" {...slideAnimation('left')}>
          <motion.header {...slideAnimation('down')}>
            <img src="./logo.png" alt="logo" className="w-32  object-contain" />
          </motion.header>
          <motion.div className="home-content" {...headContainerAnimation}>
            <motion.div {...headTextAnimation}>
              <h1 className="head-text">
                by
                <br /> NOSTALGIA NIGHTS.
              </h1>
            </motion.div>
            <motion.div
              {...headContentAnimation}
              className="flex flex-col gap-5"
            >
              <p className="max-w-md font-normal text-gray-600 text-base">
                Create your unique and exclusive shirt with our 3D customisation
                tool.
              </p>
              <img
                src="./corfu.png"
                alt="corfu"
                className="w-32 object-contain"
              />
              <CustomButton
                type="filled"
                title="Customise It"
                handleClick={() => (state.intro = false)}
                customStyles="w-fit px-4 py-2.5 font-bold text-sm"
              />
            </motion.div>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default Home;

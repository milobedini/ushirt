import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import {
  AIPicker,
  ColourPicker,
  CustomButton,
  FilePicker,
  Tab,
} from '../components';
import { DecalTypes, EditorTabs, FilterTabs } from '../config/constants';
import { reader } from '../config/helpers';
import { fadeAnimation, slideAnimation } from '../config/motion';
import state from '../store';

const Customiser = () => {
  const snap = useSnapshot(state);

  const [file, setFile] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatingImg, setGeneratingImg] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState({
    logoShirt: true,
    stylishShirt: false,
  });

  // Show tab content depending on active tab.
  const generateTabContent = () => {
    switch (activeEditorTab) {
      case 'colourpicker':
        return <ColourPicker />;
      case 'filepicker':
        return <FilePicker file={file} setFile={setFile} readFile={readFile} />;
      case 'aipicker':
        return (
          <AIPicker
            prompt={prompt}
            setPrompt={setPrompt}
            generatingImg={generatingImg}
            handleSubmit={handleSubmit}
          />
        );

      default:
        return null;
    }
  };

  const handleSubmit = async (type) => {
    if (!prompt) return alert('Please enter a prompt.');
    try {
      setGeneratingImg(true);
      // const response = await fetch(
      //   'https://ushirt-server.onrender.com/api/v1/dalle/create-image',
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({ prompt }),
      //   },
      // );

      // const data = await response.json();
      // console.log(data.originalImg);

      // const res = await fetch(
      //   'https://ushirt-server.onrender.com/api/v1/dalle/upload-cloudinary',
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({ url: data.originalImg }),
      //   },
      // );

      // const data2 = await res.json();
      // console.log(data2.imageNoBg);

      // // Send second request to get Cloudinary version

      const image64 = await imageUrlToBase64(
        'https://res.cloudinary.com/dvgbdioec/image/upload/v1696019977/svydk2z3vxjiwucnv96n.png',
        // data2.imageNoBg,
      );

      handleDecals(type, image64);
    } catch (error) {
      alert(error.message);
    } finally {
      setGeneratingImg(false);
      setActiveEditorTab('');
    }
  };

  const imageUrlToBase64 = async (url) => {
    console.log('Cloudinary image url: ', url);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result); // reader.result contains the base64 string
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to convert image URL to base64', error);
      throw error;
    }
  };

  const handleDecals = (type, result) => {
    const decalType = DecalTypes[type];
    console.log('Setting state', decalType.stateProperty, result);
    state[decalType.stateProperty] = result;

    if (!activeFilterTab[decalType.filterTab]) {
      handleActiveFilterTab(decalType.filterTab);
    }
  };

  const handleActiveFilterTab = (tabName) => {
    switch (tabName) {
      case 'logoShirt':
        state.isLogoTexture = !activeFilterTab[tabName];
        break;

      case 'stylishShirt':
        state.isFullTexture = !activeFilterTab[tabName];
        break;

      default:
        state.isLogoTexture = true;
        state.isFullTexture = false;
        break;
    }

    setActiveFilterTab((prevState) => {
      return {
        ...prevState,
        [tabName]: !prevState[tabName],
      };
    });
  };

  const readFile = (type) => {
    reader(file).then((result) => {
      handleDecals(type, result);
      setActiveEditorTab('');
    });
  };

  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          <motion.div
            key="custom"
            className="absolute top-0 left-0 z-10"
            {...slideAnimation('left')}
          >
            <div className="flex items-center min-h-screen">
              <div className="editortabs-container tabs">
                {EditorTabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    tab={tab}
                    handleClick={() => {
                      setActiveEditorTab(tab.name);
                    }}
                  />
                ))}
                {generateTabContent()}
              </div>
            </div>
          </motion.div>
          <motion.div
            className="absolute z-10 top-5 right-5"
            {...fadeAnimation}
          >
            <CustomButton
              type="filled"
              title="Go Back"
              handleClick={() => (state.intro = true)}
              customStyles="w-fit px-4 py-2.5 font-bold text-sm"
            />
          </motion.div>
          <motion.div
            className="filtertabs-container"
            {...slideAnimation('up')}
          >
            {FilterTabs.map((tab) => (
              <Tab
                key={tab.name}
                tab={tab}
                isFilterTab
                isActiveTab={activeFilterTab[tab.name]}
                handleClick={() => handleActiveFilterTab(tab.name)}
              />
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Customiser;

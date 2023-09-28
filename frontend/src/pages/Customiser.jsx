import { Cloudinary } from '@cloudinary/url-gen';
import { backgroundRemoval } from '@cloudinary/url-gen/actions/effect';
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
  const [normalImg, setNormalImg] = useState('');
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

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

  const uploadToCloudinary = async (img) => {
    console.log('Uploading to Cloudinary');
    setImage(file);
    const data = new FormData();
    data.append('file', img);
    data.append('upload_preset', 'ilrqnidr');
    data.append('cloud_name', 'dvgbdioec');
    data.append('folder', 'UShirt');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dvgbdioec/image/upload`,
        {
          method: 'POST',
          body: data,
        },
      );
      const res = await response.json();
      setUrl(res.public_id);

      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const handleSubmit = async (type) => {
    if (!prompt) return alert('Please enter a prompt.');
    try {
      setGeneratingImg(true);
      const response = await fetch(
        'https://ushirt-server.onrender.com/api/v1/dalle',
        // 'http://localhost:8080/api/v1/dalle'
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        },
      );

      const data = await response.json();

      handleDecals(type, `data:image/png;base64,${data.image}`, url);
    } catch (error) {
      alert(error.message);
    } finally {
      setGeneratingImg(false);
      setActiveEditorTab('');
    }
  };

  const handleDecals = (type, result, url) => {
    // RemoveBG logic
    console.log('Removing BG using url', url);

    const cld = new Cloudinary({
      cloud: {
        cloudName: 'dvgbdioec',
      },
    });
    let myImage = cld
      .image(url)
      .effect(backgroundRemoval())
      .format('png')
      .toURL();

    console.log('New URL', myImage);

    setNormalImg(myImage);

    const decalType = DecalTypes[type];
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

  const readFile = async (type) => {
    // Upload image to Cloudinary
    'READ FILE', url;
    await uploadToCloudinary(file);
    reader(file).then((result) => {
      handleDecals(type, result, url);
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
            <img
              src={`https://res.cloudinary.com/dvgbdioec/image/upload/v1695927122/${url}`}
              alt=""
              className="border-2 border-white w-20 h-20"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Customiser;

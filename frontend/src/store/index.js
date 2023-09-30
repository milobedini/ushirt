import { proxy } from 'valtio';

const state = proxy({
  intro: true,
  color: '#EFBD48',
  isLogoTexture: true,
  isFullTexture: false,
  logoDecal:
    'http://res.cloudinary.com/dvgbdioec/image/upload/v1696069909/ytz7zhct8crbccwyplxv.png',
  fullDecal: './nn.png',
});

export default state;
